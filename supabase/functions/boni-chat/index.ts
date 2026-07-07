import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const MAX_MESSAGE_LENGTH = 1000;
const MAX_MESSAGES = 8;
const MAX_CATALOG_ITEMS = 40;

// Set SITE_URL as a Supabase secret for production, e.g. https://wibo.co.ke
// Multiple origins may be comma-separated for preview domains.
const ALLOWED_ORIGINS = new Set([
  "http://localhost:8080",
  "http://localhost:5173",
  ...(Deno.env.get("SITE_URL") ?? "").split(","),
].map((origin) => origin.trim()).filter(Boolean));

function corsHeaders(origin: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function err(status: number, message: string, origin: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

interface Message { role: "user" | "assistant"; content: string; }
interface Vehicle { make: string; model: string; year: string; }
interface CatalogItem { id: string; name: string; price: number; category: string; fitmentVehicles: string[]; }

function isMessage(value: unknown): value is Message {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (item.role === "user" || item.role === "assistant") && typeof item.content === "string";
}

serve(async (req) => {
  const origin = req.headers.get("Origin") ?? "";

  if (req.method === "OPTIONS") {
    if (origin && !ALLOWED_ORIGINS.has(origin)) return err(403, "Origin not allowed", origin);
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") return err(405, "Method not allowed", origin);
  if (origin && !ALLOWED_ORIGINS.has(origin)) return err(403, "Origin not allowed", origin);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return err(401, "Unauthorized", origin);
  }

  const groqApiKey = Deno.env.get("GROQ_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!groqApiKey || !supabaseUrl || !supabaseAnonKey) {
    return err(500, "Service configuration missing (Keys missing)", origin);
  }

  let body: { messages?: Message[]; vehicle?: Vehicle | null; catalog?: CatalogItem[] };
  try {
    body = await req.json();
  } catch {
    return err(400, "Invalid request body", origin);
  }

  const { messages = [], vehicle, catalog = [] } = body;

  const sanitised = messages
    .filter(isMessage)
    .slice(-MAX_MESSAGES)
    .map((m) => ({ ...m, content: m.content.slice(0, MAX_MESSAGE_LENGTH) }));

  if (sanitised.length === 0) return err(400, "No messages provided", origin);

  const vehicleCtx = vehicle
    ? `The customer's vehicle is a ${vehicle.year} ${vehicle.make} ${vehicle.model}.`
    : "The customer has not specified a vehicle yet.";

  const catalogCtx = catalog
    .slice(0, MAX_CATALOG_ITEMS)
    .map((p) => `- ID: ${p.id} | Name: ${p.name} | KSh ${p.price.toLocaleString()} | Category: ${p.category} | Fits: ${p.fitmentVehicles.join(", ")} | URL: /product/${p.id}`)
    .join("\n");

  // RAG Retrieval Phase
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const lastUserMessage = sanitised[sanitised.length - 1].content;
  let ragContext = "";

  try {
    // 1. Generate embedding using Supabase's built-in free AI inference (gte-small, 384 dims)
    const session = new (Supabase as any).ai.Session("gte-small");
    const embeddingResult = await session.run(lastUserMessage, {
      mean_pool: true,
      normalize: true,
    });
    const embedding = Array.from(embeddingResult as number[]);

    // 2. Perform similarity search via pgvector RPC
    const { data: documents } = await supabase.rpc('match_knowledge_base', {
      query_embedding: embedding,
      match_threshold: 0.5, // Return if 50% similar or above
      match_count: 3
    });

    if (documents && documents.length > 0) {
      ragContext = "\nRelevant Excerpts from WIBO Knowledge Base:\n" + documents.map((doc: any) => `- "${doc.content}"`).join("\n");
    }
  } catch (err) {
    console.error("RAG error, proceeding without context:", err);
  }

  const systemPrompt = `You are Boni, a friendly and knowledgeable auto parts advisor for WIBO — a genuine auto parts supplier in Nairobi, Kenya.

${vehicleCtx}

Current inventory:
${catalogCtx}
${ragContext}

Kenyan Mechanic Slang Dictionary (Understand these terms from customers and use them appropriately):
- Mtungi / Shoki = Shock Absorber
- Sibijointi = CV Joint
- Giaboksi = Gearbox
- Difu = Differential
- Klachi = Clutch
- Breki pedi = Brake pads
- Boneti = Hood/Bonnet
- Buti = Trunk/Boot
- Madigadi = Mudguard/Fender
- Waipa = Windshield Wipers
- Beringi = Wheel Bearing
- Plagi = Spark Plugs
- Bafa = Bumper
- Kulanti / Maji ya redieta = Coolant

Guidelines:
- Recommend parts from the inventory above when relevant. Always show the KSh price.
- IMPORTANT: When recommending a part from the inventory, ALWAYS format it as a clickable markdown link using its URL. Example: [Toyota Brake Pads](/product/123)
- If there are "Relevant Excerpts from WIBO Knowledge Base" provided, use them to answer technical questions or diagnose issues.
- Mention same-day Nairobi delivery where applicable (order before 2PM).
- Be concise — aim for 2-4 sentences or a short list.
- Use natural Kenyan English. Mix in light Swahili/Sheng greetings (e.g. "Sawa!", "Niko hapa!", "Niaje").
- If the part isn't in our inventory, say so honestly and suggest the customer call or WhatsApp us.
- Never invent prices or part numbers not in the catalog.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...sanitised
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Upstream error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response. Please try again.";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Groq API Error:", error.message);
    return err(502, `AI service error: ${error.message}`, origin);
  }
});
