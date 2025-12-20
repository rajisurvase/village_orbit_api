import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Notification configurations for different event types
const notificationConfigs: Record<string, {
  getTitle: (record: Record<string, unknown>) => string;
  getBody: (record: Record<string, unknown>) => string;
  getUrl: (record: Record<string, unknown>) => string;
  targetAudience: 'all' | 'admins';
}> = {
  // User notifications
  'new_post': {
    getTitle: (record) => `नवीन पोस्ट: ${record.title as string}`,
    getBody: (record) => ((record.content as string)?.substring(0, 100) || 'नवीन पोस्ट प्रकाशित झाली आहे'),
    getUrl: () => `/forum`,
    targetAudience: 'all'
  },
  'new_exam': {
    getTitle: (record) => `नवीन परीक्षा: ${record.title as string}`,
    getBody: (record) => `${record.subject as string} - ${record.duration_minutes as number} मिनिटे`,
    getUrl: () => `/exam`,
    targetAudience: 'all'
  },
  'new_service': {
    getTitle: (record) => `नवीन सेवा: ${record.name as string}`,
    getBody: (record) => `${record.category as string} - ${(record.speciality as string) || (record.owner as string) || ''}`,
    getUrl: () => `/services`,
    targetAudience: 'all'
  },
  'new_marketplace_item': {
    getTitle: (record) => `नवीन विक्रीसाठी: ${record.item_name as string}`,
    getBody: (record) => `₹${record.price as number} - ${record.category as string}`,
    getUrl: () => `/buy-sell`,
    targetAudience: 'all'
  },
  'new_announcement': {
    getTitle: (record) => `सूचना: ${record.title as string}`,
    getBody: (record) => ((record.content as string)?.substring(0, 100) || ''),
    getUrl: () => `/announcements`,
    targetAudience: 'all'
  },
  'new_notice': {
    getTitle: (record) => `नोटीस: ${record.title as string}`,
    getBody: (record) => ((record.description as string)?.substring(0, 100) || ''),
    getUrl: () => `/notices`,
    targetAudience: 'all'
  },
  
  // Admin notifications
  'new_contact_form': {
    getTitle: () => `नवीन संपर्क फॉर्म`,
    getBody: (record) => `${record.name as string} - ${(record.subject as string) || 'संपर्क'}`,
    getUrl: () => `/admin/contact-messages`,
    targetAudience: 'admins'
  },
  'new_feedback': {
    getTitle: () => `नवीन अभिप्राय`,
    getBody: (record) => `${record.name as string} - ${record.type as string}`,
    getUrl: () => `/admin`,
    targetAudience: 'admins'
  },
  'new_user_registration': {
    getTitle: () => `नवीन वापरकर्ता नोंदणी`,
    getBody: (record) => `${(record.full_name as string) || (record.email as string)} - मान्यता आवश्यक`,
    getUrl: () => `/admin/users`,
    targetAudience: 'admins'
  },
  'new_item_pending': {
    getTitle: () => `नवीन मार्केटप्लेस आयटम - मान्यता आवश्यक`,
    getBody: (record) => `${record.item_name as string} - ₹${record.price as number}`,
    getUrl: () => `/admin/marketplace`,
    targetAudience: 'admins'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { event_type, record } = await req.json();

    console.log(`Processing notification trigger: ${event_type}`);

    const config = notificationConfigs[event_type];
    if (!config) {
      console.log(`Unknown event type: ${event_type}`);
      return new Response(JSON.stringify({ error: 'Unknown event type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call the send-push-notification function
    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        event_type,
        event_id: record.id,
        title: config.getTitle(record),
        body: config.getBody(record),
        url: config.getUrl(record),
        target_audience: config.targetAudience
      }
    });

    if (error) {
      console.error('Error invoking send-push-notification:', error);
      throw error;
    }

    console.log(`Notification sent successfully:`, data);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in trigger-notification:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
