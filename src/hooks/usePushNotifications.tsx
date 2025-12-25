import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// VAPID public key - must match the one used to generate push subscriptions
const VAPID_PUBLIC_KEY = "BKeeemIYegVXOgB5euV_68Kl1ln39kwgqNnJOiX_51_DFriIS3dz6SSVYKBNlNYC2TugaS8hBJp-pyPCbMBY2KE";

// IMPORTANT: We keep push notifications on a separate SW scope so we don't overwrite
// the main PWA service worker (which is responsible for offline + updates).
const PUSH_SW_URL = "/sw-push.js";
const PUSH_SW_SCOPE = "/push/";

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
    const hasNotification = "Notification" in window;
    const hasServiceWorker = "serviceWorker" in navigator;
    const hasPushManager = "PushManager" in window;
    
    console.log("[PUSH DEBUG] Support check:", {
      hasNotification,
      hasServiceWorker,
      hasPushManager,
      isSupported: hasNotification && hasServiceWorker && hasPushManager,
    });

    return hasNotification && hasServiceWorker && hasPushManager;
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
    console.log("[PUSH DEBUG] Checking existing subscription...");
    try {
      if (!checkSupport()) {
        console.log("[PUSH DEBUG] Not supported, skipping subscription check");
        return false;
      }

      const registration = await navigator.serviceWorker.getRegistration(PUSH_SW_SCOPE);
      console.log("[PUSH DEBUG] Service worker registration for scope:", PUSH_SW_SCOPE, registration ? "FOUND" : "NOT FOUND");
      
      if (!registration) return false;

      const subscription = await registration.pushManager.getSubscription();
      console.log("[PUSH DEBUG] Existing subscription:", subscription ? "EXISTS" : "NONE");
      
      return !!subscription;
    } catch (error) {
      console.error("[PUSH DEBUG] Error checking subscription:", error);
      return false;
    }
  }, [checkSupport]);

  // Initialize state
  useEffect(() => {
    const init = async () => {
      console.log("[PUSH DEBUG] Initializing push notifications...");
      const isSupported = checkSupport();
      let permission: NotificationPermission = "default";
      let isSubscribed = false;

      if (isSupported) {
        permission = Notification.permission;
        console.log("[PUSH DEBUG] Current permission:", permission);
        isSubscribed = await checkSubscription();
      }

      console.log("[PUSH DEBUG] Initial state:", { isSupported, permission, isSubscribed });
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
    console.log("[PUSH DEBUG] Registering service worker:", PUSH_SW_URL, "with scope:", PUSH_SW_SCOPE);
    try {
      const registration = await navigator.serviceWorker.register(PUSH_SW_URL, {
        scope: PUSH_SW_SCOPE,
      });
      console.log("[PUSH DEBUG] ✅ Push SW registered successfully:", registration.scope);
      
      // Wait for the service worker to be ready
      if (registration.installing) {
        console.log("[PUSH DEBUG] Service worker is installing...");
        await new Promise<void>((resolve) => {
          registration.installing!.addEventListener("statechange", (e) => {
            const sw = e.target as ServiceWorker;
            console.log("[PUSH DEBUG] SW state changed to:", sw.state);
            if (sw.state === "activated") {
              resolve();
            }
          });
        });
      }
      
      return registration;
    } catch (error) {
      console.error("[PUSH DEBUG] ❌ SW registration failed:", error);
      throw error;
    }
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    console.log("[PUSH DEBUG] ========== SUBSCRIBE FLOW STARTED ==========");
    
    if (!checkSupport()) {
      console.log("[PUSH DEBUG] ❌ Push not supported");
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Step 1: Request permission
      console.log("[PUSH DEBUG] Step 1: Requesting notification permission...");
      console.log("[PUSH DEBUG] Current permission before request:", Notification.permission);
      
      const permission = await Notification.requestPermission();
      console.log("[PUSH DEBUG] Permission result:", permission);
      setState((prev) => ({ ...prev, permission }));

      if (permission !== "granted") {
        console.log("[PUSH DEBUG] ❌ Permission denied or dismissed");
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings",
          variant: "destructive",
        });
        return false;
      }
      console.log("[PUSH DEBUG] ✅ Permission granted!");

      // Step 2: Register service worker
      console.log("[PUSH DEBUG] Step 2: Getting/registering service worker...");
      let registration = await navigator.serviceWorker.getRegistration(PUSH_SW_SCOPE);
      console.log("[PUSH DEBUG] Existing registration:", registration ? registration.scope : "NONE");
      
      if (!registration) {
        console.log("[PUSH DEBUG] No existing registration, registering new SW...");
        registration = await registerServiceWorker();
      }
      console.log("[PUSH DEBUG] ✅ Service worker ready:", registration.scope);

      // Step 3: Subscribe to push
      console.log("[PUSH DEBUG] Step 3: Subscribing to push manager...");
      console.log("[PUSH DEBUG] Using VAPID key:", VAPID_PUBLIC_KEY.substring(0, 20) + "...");
      
      const vapidKeyArray = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      console.log("[PUSH DEBUG] VAPID key converted, length:", vapidKeyArray.length);
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKeyArray.buffer.slice(
          vapidKeyArray.byteOffset,
          vapidKeyArray.byteOffset + vapidKeyArray.byteLength
        ) as ArrayBuffer,
      });
      console.log("[PUSH DEBUG] ✅ Push subscription created!");

      // Step 4: Extract and save subscription data
      console.log("[PUSH DEBUG] Step 4: Saving subscription to database...");
      const subscriptionData = subscription.toJSON();
      const endpoint = subscriptionData.endpoint!;
      const p256dh = subscriptionData.keys?.p256dh!;
      const auth = subscriptionData.keys?.auth!;
      
      console.log("[PUSH DEBUG] Subscription endpoint:", endpoint.substring(0, 50) + "...");
      console.log("[PUSH DEBUG] Has p256dh:", !!p256dh);
      console.log("[PUSH DEBUG] Has auth:", !!auth);

      const { error, data } = await supabase.from("push_subscriptions").upsert(
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
      ).select();

      if (error) {
        console.error("[PUSH DEBUG] ❌ Database save failed:", error);
        throw error;
      }
      console.log("[PUSH DEBUG] ✅ Subscription saved to database:", data);

      setState((prev) => ({ ...prev, isSubscribed: true }));

      toast({
        title: "Notifications Enabled",
        description: "You'll receive notifications for marketplace updates",
      });

      console.log("[PUSH DEBUG] ========== SUBSCRIBE FLOW COMPLETED SUCCESSFULLY ==========");
      return true;
    } catch (error: any) {
      console.error("[PUSH DEBUG] ❌ Subscribe error:", error);
      console.error("[PUSH DEBUG] Error name:", error.name);
      console.error("[PUSH DEBUG] Error message:", error.message);
      console.error("[PUSH DEBUG] Error stack:", error.stack);
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
      const registration = await navigator.serviceWorker.getRegistration(PUSH_SW_SCOPE);
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
