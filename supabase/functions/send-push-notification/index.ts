import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

// Convert VAPID keys to the format needed for web-push
function base64UrlToBase64(base64Url: string): string {
  return base64Url.replace(/-/g, '+').replace(/_/g, '/');
}

// Send push notification using Web Push Protocol
async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Import web-push compatible library
    const webpush = await import("https://esm.sh/web-push@3.6.7");
    
    webpush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    );

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    );

    return { success: true };
  } catch (err) {
    const error = err as { statusCode?: number; message?: string };
    console.error('Push notification error:', error);
    
    // Check if subscription is expired
    if (error.statusCode === 410 || error.statusCode === 404) {
      return { success: false, error: 'subscription_expired' };
    }
    
    return { success: false, error: error.message || 'Unknown error' };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { 
      queue_id, 
      target_admins_only = false, 
      payload,
      // Direct notification support
      direct = false 
    } = body;

    let notificationPayload: NotificationPayload;
    let targetAdmins: boolean;

    if (direct && payload) {
      // Direct notification call from frontend
      notificationPayload = payload;
      targetAdmins = target_admins_only;
    } else if (queue_id) {
      // Queue-based notification (from database trigger)
      const { data: queueItem, error: queueError } = await supabase
        .from('notification_queue')
        .select('*')
        .eq('id', queue_id)
        .eq('status', 'pending')
        .single();

      if (queueError || !queueItem) {
        console.log('Queue item not found or already processed');
        return new Response(JSON.stringify({ success: false, error: 'Queue item not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }

      // Mark as processing
      await supabase
        .from('notification_queue')
        .update({ status: 'processing' })
        .eq('id', queue_id);

      notificationPayload = queueItem.payload as NotificationPayload;
      targetAdmins = queueItem.target_admins_only;
    } else {
      return new Response(JSON.stringify({ error: 'Missing queue_id or direct payload' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Get subscriptions based on target
    let subscriptions: PushSubscription[] = [];
    
    if (targetAdmins) {
      // Get only admin subscriptions
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('is_admin', true);
      
      if (error) throw error;
      subscriptions = data || [];
    } else {
      // Get all subscriptions
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth');
      
      if (error) throw error;
      subscriptions = data || [];
    }

    console.log(`Sending notifications to ${subscriptions.length} subscribers (admins only: ${targetAdmins})`);

    // Send notifications in parallel
    const vapidSubject = 'mailto:admin@shivankhedkhurd.gov.in';
    const expiredEndpoints: string[] = [];
    
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const result = await sendPushNotification(
          sub,
          notificationPayload,
          vapidPublicKey,
          vapidPrivateKey,
          vapidSubject
        );
        
        if (!result.success && result.error === 'subscription_expired') {
          expiredEndpoints.push(sub.endpoint);
        }
        
        return result;
      })
    );

    // Remove expired subscriptions
    if (expiredEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints);
      
      console.log(`Removed ${expiredEndpoints.length} expired subscriptions`);
    }

    // Count successes
    const successCount = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;

    // Update queue status if applicable
    if (queue_id) {
      await supabase
        .from('notification_queue')
        .update({ 
          status: successCount > 0 ? 'sent' : 'failed',
          processed_at: new Date().toISOString()
        })
        .eq('id', queue_id);
    }

    // Log notification
    await supabase
      .from('notification_logs')
      .insert({
        event_type: targetAdmins ? 'admin_notification' : 'broadcast_notification',
        title: notificationPayload.title,
        body: notificationPayload.body,
        url: notificationPayload.url,
        sent_count: successCount,
        target_audience: targetAdmins ? 'admins' : 'all',
      });

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        total: subscriptions.length,
        expired_removed: expiredEndpoints.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    const error = err as Error;
    console.error('Error in send-push-notification:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
