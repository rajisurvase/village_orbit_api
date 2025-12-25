import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PushSubscriptionState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
}

// VAPID public key from environment
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    isLoading: true,
  });

  // Check if push notifications are supported
  const checkSupport = useCallback(() => {
    const isSupported = 'serviceWorker' in navigator && 
                       'PushManager' in window && 
                       'Notification' in window;
    return isSupported;
  }, []);

  // Get existing subscription
  const getExistingSubscription = useCallback(async (): Promise<PushSubscription | null> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return subscription;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }, []);

  // Initialize state
  useEffect(() => {
    const init = async () => {
      const isSupported = checkSupport();
      
      if (!isSupported) {
        setState(prev => ({ ...prev, isSupported: false, isLoading: false }));
        return;
      }

      const permission = Notification.permission;
      const subscription = await getExistingSubscription();

      setState({
        isSupported: true,
        permission,
        isSubscribed: !!subscription,
        isLoading: false,
      });
    };

    init();
  }, [checkSupport, getExistingSubscription]);

  // Save subscription to Supabase
  const saveSubscription = useCallback(async (subscription: PushSubscription) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const subscriptionJson = subscription.toJSON();
      const p256dh = subscriptionJson.keys?.p256dh || '';
      const auth = subscriptionJson.keys?.auth || '';

      // Check if admin
      let isAdmin = false;
      if (user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
        isAdmin = !!roles;
      }

      // Upsert subscription using endpoint as unique key
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(
          {
            endpoint: subscription.endpoint,
            p256dh,
            auth,
            user_id: user?.id || null,
            is_admin: isAdmin,
            updated_at: new Date().toISOString(),
          },
          { 
            onConflict: 'endpoint',
            ignoreDuplicates: false
          }
        );

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving subscription:', error);
      return false;
    }
  }, []);

  // Request permission and subscribe
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      toast.error("Push notifications are not supported in this browser");
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast.error("Notification permission denied");
        setState(prev => ({ ...prev, permission, isLoading: false }));
        return false;
      }

      // Check for existing subscription
      let subscription = await getExistingSubscription();

      if (!subscription) {
        // Create new subscription
        const registration = await navigator.serviceWorker.ready;
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      // Save to database
      const saved = await saveSubscription(subscription);
      
      if (saved) {
        toast.success("Push notifications enabled!");
        setState(prev => ({ 
          ...prev, 
          permission: 'granted', 
          isSubscribed: true, 
          isLoading: false 
        }));
        return true;
      } else {
        throw new Error("Failed to save subscription");
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error("Failed to enable notifications");
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [state.isSupported, getExistingSubscription, saveSubscription]);

  // Unsubscribe
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const subscription = await getExistingSubscription();
      
      if (subscription) {
        // Remove from database
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint);

        // Unsubscribe from push manager
        await subscription.unsubscribe();
      }

      setState(prev => ({ 
        ...prev, 
        isSubscribed: false, 
        isLoading: false 
      }));
      
      toast.success("Push notifications disabled");
      return true;
    } catch (error) {
      console.error('Unsubscribe error:', error);
      toast.error("Failed to disable notifications");
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [getExistingSubscription]);

  // Update subscription when user logs in
  const updateSubscriptionUser = useCallback(async () => {
    const subscription = await getExistingSubscription();
    if (subscription) {
      await saveSubscription(subscription);
    }
  }, [getExistingSubscription, saveSubscription]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    updateSubscriptionUser,
  };
};
