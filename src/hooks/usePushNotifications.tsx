import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  // Check current permission and subscription status
  useEffect(() => {
    const checkStatus = async () => {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        return;
      }

      setPermission(Notification.permission);

      try {
        const reg = await navigator.serviceWorker.ready;
        setRegistration(reg);

        const subscription = await reg.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error("Error checking push status:", error);
      }
    };

    checkStatus();
  }, []);

  // Convert VAPID key to Uint8Array
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!registration || !VAPID_PUBLIC_KEY) {
      toast({
        title: "सूचना",
        description: "Push notifications are not configured",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);

    try {
      // Request permission if not granted
      if (Notification.permission === "default") {
        const result = await Notification.requestPermission();
        setPermission(result);
        
        if (result !== "granted") {
          toast({
            title: "अनुमती नाकारली",
            description: "कृपया ब्राउझर सेटिंग्जमध्ये सूचना सक्षम करा",
            variant: "destructive"
          });
          setIsLoading(false);
          return false;
        }
      }

      // Convert VAPID key
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer
      });

      const subscriptionJSON = subscription.toJSON();

      // Save subscription to database
      const { error } = await supabase.from("push_subscriptions").upsert({
        user_id: user?.id || null,
        endpoint: subscriptionJSON.endpoint!,
        p256dh: subscriptionJSON.keys!.p256dh,
        auth: subscriptionJSON.keys!.auth,
        is_admin: isAdmin
      }, {
        onConflict: "endpoint"
      });

      if (error) {
        console.error("Error saving subscription:", error);
        throw error;
      }

      setIsSubscribed(true);
      toast({
        title: "सूचना सक्षम",
        description: "तुम्हाला आता Push सूचना मिळतील"
      });

      return true;
    } catch (error) {
      console.error("Error subscribing to push:", error);
      toast({
        title: "त्रुटी",
        description: "Push सूचना सक्षम करण्यात अयशस्वी",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [registration, user, isAdmin, toast]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!registration) return false;

    setIsLoading(true);

    try {
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Remove from database
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", subscription.endpoint);

        // Unsubscribe from push manager
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      toast({
        title: "सूचना बंद",
        description: "Push सूचना बंद केल्या"
      });

      return true;
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast({
        title: "त्रुटी",
        description: "Push सूचना बंद करण्यात अयशस्वी",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [registration, toast]);

  // Toggle subscription
  const toggleSubscription = useCallback(async () => {
    if (isSubscribed) {
      return await unsubscribe();
    } else {
      return await subscribe();
    }
  }, [isSubscribed, subscribe, unsubscribe]);

  return {
    permission,
    isSubscribed,
    isLoading,
    isSupported: "Notification" in window && "serviceWorker" in navigator,
    subscribe,
    unsubscribe,
    toggleSubscription
  };
};
