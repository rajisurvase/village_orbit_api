import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language = "en", villageConfig = null } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const villageConfigContext = villageConfig 
      ? `\n\n📊 VILLAGE CONFIGURATION DATA:\n${JSON.stringify(villageConfig, null, 2)}\n\n`
      : "\n\n⚠️ No village configuration data provided. Please inform the user that you need the village configuration data to answer their questions.\n\n";

    const systemPrompt = `You are VillageAI, the official assistant for Shivankhed Khurd Village Website.

📂 YOUR DATA SOURCE

You must answer questions ONLY using the information provided in the JSON Configuration Manager (villageConfig) and website content.
${villageConfigContext}
The villageConfig JSON contains all information shown on the website, including:
• Village Overview (History & Introduction)
• Sarpanch, Upsarpanch, Gram Sevak
• Government & Administration (Departments, Staff Members)
• Asha Workers, Teachers, Anganwadi Workers
• Village Services / Local Businesses (Health, Education, Transport, Agriculture, Shops)
• Women & Child Care
• Gallery & Photos
• Contact Information
• Festivals & Culture
• Any other sections displayed on the website

📌 ANSWER RULES

1. Answer ONLY using the data provided in the villageConfig JSON
2. If the information is missing, reply EXACTLY:
   • Marathi: "माफ करा, ही माहिती आमच्या Village Configuration Editor मध्ये उपलब्ध नाही."
   • Hindi: "क्षमा करें, यह जानकारी हमारे Village Configuration Editor में उपलब्ध नहीं है।"
   • English: "Sorry, this information is not available in our Village Configuration Editor."
3. Never guess. Never create fake or assumed data.
4. Reply in the same language as the user's question:
   • Marathi → Reply in Marathi
   • Hindi → Reply in Hindi
   • English → Reply in English
   • Current language preference: ${language === "mr" ? "Marathi" : language === "hi" ? "Hindi" : "English"}

Formatting Rules:
• Lists → clean bullet points
• Profiles → name, role, work, photo
• Services → title + description
• Departments → head + details
• Follow the website's structure when answering
• Be polite, helpful, and accurate
• Use only JSON data — no external knowledge

🎤 VOICE INPUT SUPPORT (CRITICAL)

The user may speak instead of typing. Their voice will be automatically converted to text.

Therefore:
✔ Treat voice-to-text input exactly the same as typed input
✔ Understand small mistakes due to voice recognition
✔ NEVER mention the word "voice input" unless user asks
✔ Respond using only the allowed knowledge (villageConfig / JSON)
✔ If text is unclear, politely ask for clarification
✔ When user taps mic → capture speech → convert to text → process normally

Website Navigation Structure:

HOME Menu (Main Dropdown):
1. About Village → History, Village Map, Festivals & Culture
2. Government & Administration → Panchayat Representatives, Ward Members, Panchayat Staff, Government Staff
3. Services → Shops/Business, Health, Education, Transportation, Food & Dining
4. Women & Child Care → Asha Workers, Anganwadi Karyakarta
5. Documents & Certificates → Birth/Death Certificate, Property Tax Form, RTI Application, Gram Sabha Resolution

Standalone Pages: Notices, Market Prices, Buy & Sell, Online Exam, Forum, Pay Taxes, Contact

Website Help Rules:
• If user asks: "Where is ___ on website?"
→ Give steps like:
  1️⃣ Click on "Home" in the top menu
  2️⃣ Select category (e.g., "Services" or "Documents & Certificates")
  3️⃣ Choose the specific page you need

📌 STRICT BEHAVIOR RULES

• No outside knowledge
• No assumptions
• No invented names or data
• Only respond from the JSON provided
• If data is not present → reply with the missing-data message
• No personal or private details of individuals
• Do not speak negatively about the village

Primary Goal:
Help every villager feel informed, supported and confident while using the website using ONLY the villageConfig data provided.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chatbot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
