import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

const STATUS_SUBJECTS: Record<string, string> = {
  confirmed: "Your WIBO Order has been confirmed!",
  shipped:   "Your WIBO Order is on its way!",
  delivered: "Your WIBO Order has been delivered!",
};

const STATUS_MESSAGES: Record<string, string> = {
  confirmed: "Your WIBO order has been confirmed! We will call/WhatsApp you with M-Pesa payment details shortly.",
  shipped:   "Great news! Your WIBO order is on its way. You'll receive it today.",
  delivered: "Your WIBO order has been delivered. Thank you for shopping with us! Need to reorder? Visit wibo.co.ke",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { user_id, status, order_ref } = await req.json();

    if (!user_id || !status || !STATUS_MESSAGES[status]) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Initialize Supabase admin client to fetch user email
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email, name")
      .eq("id", user_id)
      .single();

    if (!profile || !profile.email) {
      return new Response(JSON.stringify({ error: "User email not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const message = `${STATUS_MESSAGES[status]}\n\nOrder Reference: #${order_ref}`;

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "WIBO <orders@wibo.co.ke>",
        to: [profile.email],
        subject: STATUS_SUBJECTS[status],
        text: `Hi ${profile.name || 'Customer'},\n\n${message}\n\nThanks,\nThe WIBO Team`
      })
    });

    const resendData = await resendRes.json();

    return new Response(JSON.stringify(resendData), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: resendRes.ok ? 200 : 500,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
