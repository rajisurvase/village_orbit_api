import { supabase } from "@/integrations/supabase/client";

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  tag?: string;
}

interface SendNotificationOptions {
  payload: NotificationPayload;
  targetAdminsOnly?: boolean;
}

/**
 * Send push notification via edge function
 * Used for explicit notification triggers (backup to database triggers)
 */
export async function sendPushNotification(options: SendNotificationOptions): Promise<{
  success: boolean;
  sent?: number;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        direct: true,
        target_admins_only: options.targetAdminsOnly || false,
        payload: options.payload,
      },
    });

    if (error) throw error;

    return {
      success: true,
      sent: data?.sent || 0,
    };
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process pending notifications from the queue
 * Called periodically or after database events
 */
export async function processPendingNotifications(): Promise<void> {
  try {
    // Get pending notifications
    const { data: pending, error } = await supabase
      .from('notification_queue')
      .select('id')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) throw error;

    // Process each notification
    for (const item of pending || []) {
      await supabase.functions.invoke('send-push-notification', {
        body: { queue_id: item.id },
      });
    }
  } catch (error) {
    console.error('Failed to process pending notifications:', error);
  }
}

/**
 * Notify admins about a new marketplace item
 */
export async function notifyAdminsNewItem(item: {
  id: string;
  item_name: string;
  category: string;
}): Promise<void> {
  await sendPushNotification({
    targetAdminsOnly: true,
    payload: {
      title: 'New Item Listed',
      body: `A new item "${item.item_name}" has been listed for review`,
      url: '/admin/marketplace',
      tag: `item-${item.id}`,
    },
  });
}

/**
 * Notify all users about an approved marketplace item
 */
export async function notifyItemApproved(item: {
  id: string;
  item_name: string;
  price: number;
}): Promise<void> {
  await sendPushNotification({
    targetAdminsOnly: false,
    payload: {
      title: 'New Item Available!',
      body: `${item.item_name} is now available in marketplace - ₹${item.price}`,
      url: '/buy-sell',
      tag: `item-available-${item.id}`,
    },
  });
}
