import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Web Push utilities
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function uint8ArrayToBase64Url(uint8Array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...uint8Array));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Convert raw private key bytes to JWK format for P-256 curve
function privateKeyToJwk(privateKeyBytes: Uint8Array, publicKeyBytes: Uint8Array): JsonWebKey {
  // For P-256, private key is 32 bytes, public key is 65 bytes (04 + x + y)
  // The public key has format: 04 || x || y where x and y are 32 bytes each
  const x = publicKeyBytes.slice(1, 33);
  const y = publicKeyBytes.slice(33, 65);
  
  return {
    kty: "EC",
    crv: "P-256",
    x: uint8ArrayToBase64Url(x),
    y: uint8ArrayToBase64Url(y),
    d: uint8ArrayToBase64Url(privateKeyBytes),
  };
}

async function generateVapidAuthHeader(
  endpoint: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ authorization: string; cryptoKey: string }> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;

  // Create JWT header and payload
  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
    sub: "mailto:admin@villagevista.app",
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Get the raw key bytes
  const privateKeyBytes = urlBase64ToUint8Array(vapidPrivateKey);
  const publicKeyBytes = urlBase64ToUint8Array(vapidPublicKey);
  
  // Convert to JWK format for proper import
  const jwk = privateKeyToJwk(privateKeyBytes, publicKeyBytes);
  
  // Import private key using JWK format
  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  // Sign the token
  const dataToSign = encoder.encode(unsignedToken);
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    cryptoKey,
    dataToSign
  );

  // Convert DER signature to raw format (r || s, each 32 bytes)
  const signatureBytes = new Uint8Array(signature);
  let rawSignature: Uint8Array;
  
  // Web Crypto API returns signature in raw format for ECDSA (64 bytes for P-256)
  if (signatureBytes.length === 64) {
    rawSignature = signatureBytes;
  } else {
    // If it's in DER format, we need to parse it (shouldn't happen with Web Crypto)
    rawSignature = signatureBytes;
  }

  // Convert signature to URL-safe base64
  const signatureB64 = uint8ArrayToBase64Url(rawSignature);

  const jwt = `${unsignedToken}.${signatureB64}`;

  return {
    authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
    cryptoKey: vapidPublicKey,
  };
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
}

interface SendPushRequest {
  queue_id?: string;
  target_admins_only?: boolean;
  user_ids?: string[];
  payload?: PushPayload;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      throw new Error("VAPID keys not configured");
    }

    console.log("VAPID public key length:", VAPID_PUBLIC_KEY.length);
    console.log("VAPID private key length:", VAPID_PRIVATE_KEY.length);

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const body: SendPushRequest = await req.json();
    console.log("Push notification request:", JSON.stringify(body));

    let payload: PushPayload;
    let targetAdminsOnly = false;
    let specificUserIds: string[] | null = null;

    // If queue_id is provided, fetch from notification_queue
    if (body.queue_id) {
      const { data: queueItem, error: queueError } = await supabase
        .from("notification_queue")
        .select("*")
        .eq("id", body.queue_id)
        .single();

      if (queueError || !queueItem) {
        throw new Error(`Queue item not found: ${body.queue_id}`);
      }

      payload = queueItem.payload as PushPayload;
      targetAdminsOnly = queueItem.target_admins_only || false;
    } else if (body.payload) {
      payload = body.payload;
      targetAdminsOnly = body.target_admins_only || false;
      specificUserIds = body.user_ids || null;
    } else {
      throw new Error("Either queue_id or payload must be provided");
    }

    // Get subscriptions based on targeting
    let subscriptions: Array<{
      endpoint: string;
      p256dh: string;
      auth: string;
      user_id: string;
    }> = [];

    if (specificUserIds && specificUserIds.length > 0) {
      // Target specific users
      const { data, error } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth, user_id")
        .in("user_id", specificUserIds);

      if (error) throw error;
      subscriptions = data || [];
    } else {
      // Use the database function
      const { data, error } = await supabase.rpc("get_push_subscriptions", {
        target_admins_only: targetAdminsOnly,
      });

      if (error) throw error;
      subscriptions = data || [];
    }

    console.log(`Found ${subscriptions.length} subscriptions to notify`);

    if (subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No subscriptions found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send push notifications
    let successCount = 0;
    let failCount = 0;
    const failedEndpoints: string[] = [];

    for (const sub of subscriptions) {
      try {
        const pushPayload = JSON.stringify({
          title: payload.title,
          body: payload.body,
          url: payload.url || "/",
          tag: payload.tag,
          icon: payload.icon || "/favicon.ico",
        });

        // Generate VAPID auth header
        const vapidHeaders = await generateVapidAuthHeader(
          sub.endpoint,
          VAPID_PUBLIC_KEY,
          VAPID_PRIVATE_KEY
        );

        console.log(`Sending push to endpoint: ${sub.endpoint.substring(0, 80)}...`);

        // Note: Full Web Push encryption requires complex ECDH operations
        // For now, we send a simple notification that triggers the service worker
        // to show a notification with the payload in a simpler way
        
        const response = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "TTL": "86400",
            "Urgency": "high",
            Authorization: vapidHeaders.authorization,
            "Crypto-Key": `p256ecdsa=${vapidHeaders.cryptoKey}`,
            "Content-Length": "0", // Send empty body for simple notification
          },
        });

        const responseStatus = response.status;
        const responseText = await response.text();
        console.log(`Push response status: ${responseStatus}, body: ${responseText}`);

        if (responseStatus === 201 || responseStatus === 200) {
          successCount++;
          console.log(`✅ Push sent successfully`);
        } else if (responseStatus === 410 || responseStatus === 404) {
          // Subscription is no longer valid, remove it
          console.log(`⚠️ Subscription expired, removing...`);
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          failCount++;
          failedEndpoints.push(sub.endpoint);
        } else {
          console.log(`❌ Push failed with status ${responseStatus}`);
          failCount++;
          failedEndpoints.push(sub.endpoint);
        }
      } catch (pushError) {
        console.error(`Error sending push to ${sub.endpoint}:`, pushError);
        failCount++;
        failedEndpoints.push(sub.endpoint);
      }
    }

    // Update queue status if queue_id was provided
    if (body.queue_id) {
      await supabase
        .from("notification_queue")
        .update({
          status: "processed",
          processed_at: new Date().toISOString(),
        })
        .eq("id", body.queue_id);

      // Log the notification
      await supabase.from("notification_logs").insert({
        event_type: "push_sent",
        event_id: body.queue_id,
        title: payload.title,
        body: payload.body,
        url: payload.url,
        sent_count: successCount,
        target_audience: targetAdminsOnly ? "admins" : "all",
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failCount,
        total: subscriptions.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
