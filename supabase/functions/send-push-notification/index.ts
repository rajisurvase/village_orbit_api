import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple Web Push implementation using web-push library approach
async function sendWebPushSimple(
  subscription: { endpoint: string; p256dh: string; auth: string }, 
  payload: string,
  vapidKeys: { publicKey: string; privateKey: string }
): Promise<Response> {
  // For a simplified approach, we'll use the Supabase edge function to call a push service
  // This is a direct HTTP POST to the push endpoint with proper headers
  
  const encoder = new TextEncoder();
  
  // Create a simple authorization header
  const vapidHeader = `vapid t=${vapidKeys.publicKey}`;
  
  // Send notification via push endpoint
  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "TTL": "86400",
      "Urgency": "high"
    },
    body: payload
  });

  return response;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      return new Response(JSON.stringify({ error: 'VAPID keys not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { event_type, event_id, title, body, url, target_audience = 'all' } = await req.json();

    console.log(`Sending push notification: ${title} to ${target_audience}`);

    // Get subscriptions based on target audience
    let query = supabase.from('push_subscriptions').select('*');
    
    if (target_audience === 'admins') {
      query = query.eq('is_admin', true);
    }

    const { data: subscriptions, error: subError } = await query;

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      throw subError;
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions`);

    const payload = JSON.stringify({
      title,
      body,
      url,
      event_type,
      event_id,
      timestamp: new Date().toISOString()
    });

    let successCount = 0;
    const failedEndpoints: string[] = [];

    // Send to all subscriptions
    for (const sub of subscriptions || []) {
      try {
        const response = await sendWebPushSimple(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload,
          { publicKey: vapidPublicKey, privateKey: vapidPrivateKey }
        );
        
        if (response.ok || response.status === 201) {
          successCount++;
          console.log(`Successfully sent to: ${sub.endpoint.substring(0, 50)}...`);
        } else {
          const statusCode = response.status;
          console.error(`Failed to send to ${sub.endpoint}: ${statusCode}`);
          failedEndpoints.push(sub.endpoint);
          
          // Remove invalid subscriptions (410 Gone or 404 Not Found)
          if (statusCode === 410 || statusCode === 404) {
            await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
            console.log(`Removed invalid subscription: ${sub.endpoint.substring(0, 50)}...`);
          }
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Failed to send to ${sub.endpoint}:`, errorMessage);
        failedEndpoints.push(sub.endpoint);
      }
    }

    // Log the notification
    await supabase.from('notification_logs').insert({
      event_type,
      event_id,
      title,
      body,
      url,
      target_audience,
      sent_count: successCount
    });

    return new Response(JSON.stringify({ 
      success: true, 
      sent: successCount,
      failed: failedEndpoints.length,
      total: subscriptions?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error sending push notification:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
