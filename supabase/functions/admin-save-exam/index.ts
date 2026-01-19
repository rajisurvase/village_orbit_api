import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ExamPayload = {
  title: string;
  subject: string;
  description?: string | null;
  total_questions: number;
  duration_minutes: number;
  scheduled_at: string;
  ends_at: string;
  status: string;
  pass_marks: number;
  from_standard?: string | null;
  to_standard?: string | null;
  shuffle_questions: boolean;
  allow_reattempt_till_end_date: boolean;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Server is not configured correctly");
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace(/bearer\s+/i, "").trim();

    // Verify JWT and read user id using getUser
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });

    const { data: userData, error: userErr } = await authClient.auth.getUser();

    if (userErr || !userData?.user?.id) {
      const reason = userErr?.message ?? "Invalid token";
      console.error("[admin-save-exam] Invalid token:", reason);
      return new Response(JSON.stringify({ error: "Unauthorized", reason }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    // Use service role for privileged DB writes + role checks
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data: roleRow, error: roleErr } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin", "sub_admin"])
      .maybeSingle();

    if (roleErr) throw roleErr;
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const examId = (body?.examId as string | null) ?? null;
    const exam = body?.exam as ExamPayload | undefined;

    if (!exam?.title || !exam?.scheduled_at || !exam?.ends_at) {
      return new Response(JSON.stringify({ error: "Invalid exam payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (examId) {
      const { data, error } = await adminClient
        .from("exams")
        .update({
          ...exam,
          created_by: userId,
        })
        .eq("id", examId)
        .select("id")
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ id: data.id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await adminClient
      .from("exams")
      .insert({
        ...exam,
        created_by: userId,
      })
      .select("id")
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in admin-save-exam:", error);
    return new Response(JSON.stringify({ error: error?.message ?? "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
