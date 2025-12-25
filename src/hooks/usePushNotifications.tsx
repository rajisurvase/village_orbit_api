import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// VAPID public key - must match the one used to generate push subscriptions
const VAPID_PUBLIC_KEY = "BNQfWg8sYT7sRmTNYQxB4V5cXWg9WZvP5H5UG0kGkF4N1Y7pQDnqLnR8wT5zY4kM6xP2hQ9sA1bC3dE5fG7hI9jK";

interface PushNotificationState {
  permission: NotificationPermission;
  isSubscribed: boolean;
  isSupported: boolean;
  isLoading: boolean;
}

export const usePushNotifications = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<PushNotificationState>({
    permission: "default",
    isSubscribed: false,
    isSupported: false,
    isLoading: true,
  });

  // Check if push notifications are supported
  const checkSupport = useCallback(() => {
    const isSupported = 
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    
    return isSupported;
  }, []);

  // Convert VAPID key to Uint8Array
  const urlBase64ToUint8Array = useCallback((base64String: string): Uint8Array => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }, []);

  // Check existing subscription
  const checkSubscription = useCallback(async () => {
    try {
      if (!checkSupport()) return false;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      return !!subscription;
    } catch (error) {
      console.error("Error checking subscription:", error);
      return false;
    }
  }, [checkSupport]);

  // Initialize state
  useEffect(() => {
    const init = async () => {
      const isSupported = checkSupport();
      let permission: NotificationPermission = "default";
      let isSubscribed = false;

      if (isSupported) {
        permission = Notification.permission;
        isSubscribed = await checkSubscription();
      }

      setState({
        permission,
        isSubscribed,
        isSupported,
        isLoading: false,
      });
    };

    init();
  }, [checkSupport, checkSubscription]);

  // Register service worker for push
  const registerServiceWorker = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw-push.js", {
        scope: "/",
      });
      console.log("Push SW registered:", registration.scope);
      return registration;
    } catch (error) {
      console.error("SW registration failed:", error);
      throw error;
    }
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!checkSupport()) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setState((prev) => ({ ...prev, permission }));

      if (permission !== "granted") {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings",
          variant: "destructive",
        });
        return false;
      }

      // Register service worker
      let registration = await navigator.serviceWorker.getRegistration("/sw-push.js");
      if (!registration) {
        registration = await registerServiceWorker();
      }

      await navigator.serviceWorker.ready;

      // Subscribe to push
      const vapidKeyArray = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKeyArray.buffer.slice(
          vapidKeyArray.byteOffset,
          vapidKeyArray.byteOffset + vapidKeyArray.byteLength
        ) as ArrayBuffer,
      });

      // Extract subscription data
      const subscriptionData = subscription.toJSON();
      const endpoint = subscriptionData.endpoint!;
      const p256dh = subscriptionData.keys?.p256dh!;
      const auth = subscriptionData.keys?.auth!;

      // Save to database
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          endpoint,
          p256dh,
          auth,
          user_id: user?.id || null,
          is_admin: isAdmin || false,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "endpoint",
        }
      );

      if (error) throw error;

      setState((prev) => ({ ...prev, isSubscribed: true }));
      
      toast({
        title: "Notifications Enabled",
        description: "You'll receive notifications for marketplace updates",
      });

      return true;
    } catch (error: any) {
      console.error("Subscribe error:", error);
      toast({
        title: "Subscription Failed",
        description: error.message || "Could not enable notifications",
        variant: "destructive",
      });
      return false;
    }
  }, [checkSupport, registerServiceWorker, urlBase64ToUint8Array, user, isAdmin, toast]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw-push.js");
      if (!registration) return true;

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return true;

      // Remove from database
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", subscription.endpoint);

      // Unsubscribe from push
      await subscription.unsubscribe();

      setState((prev) => ({ ...prev, isSubscribed: false }));

      toast({
        title: "Notifications Disabled",
        description: "You won't receive push notifications anymore",
      });

      return true;
    } catch (error: any) {
      console.error("Unsubscribe error:", error);
      toast({
        title: "Error",
        description: "Could not disable notifications",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  // Send a notification (for testing or direct use)
  const sendNotification = useCallback(
    async (
      title: string,
      body: string,
      options?: {
        url?: string;
        tag?: string;
        targetAdminsOnly?: boolean;
        userIds?: string[];
      }
    ) => {
      try {
        const { data, error } = await supabase.functions.invoke("send-push-notification", {
          body: {
            payload: {
              title,
              body,
              url: options?.url,
              tag: options?.tag,
            },
            target_admins_only: options?.targetAdminsOnly,
            user_ids: options?.userIds,
          },
        });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Send notification error:", error);
        throw error;
      }
    },
    []
  );

  // Process a queued notification
  const processQueuedNotification = useCallback(async (queueId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-push-notification", {
        body: { queue_id: queueId },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Process queued notification error:", error);
      throw error;
    }
  }, []);

  return {
    ...state,
    subscribe,
    unsubscribe,
    sendNotification,
    processQueuedNotification,
  };
};
