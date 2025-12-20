import { supabase } from "@/integrations/supabase/client";

type NotificationEventType = 
  | 'new_post'
  | 'new_exam'
  | 'new_service'
  | 'new_marketplace_item'
  | 'new_announcement'
  | 'new_notice'
  | 'new_contact_form'
  | 'new_feedback'
  | 'new_user_registration'
  | 'new_item_pending';

export const triggerNotification = async (
  eventType: NotificationEventType,
  record: Record<string, unknown>
) => {
  try {
    const { data, error } = await supabase.functions.invoke('trigger-notification', {
      body: { event_type: eventType, record }
    });

    if (error) {
      console.error('Error triggering notification:', error);
      return { success: false, error };
    }

    console.log('Notification triggered:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Error triggering notification:', err);
    return { success: false, error: err };
  }
};
