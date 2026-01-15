import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é um especialista em SQL e análise de dados. Seu trabalho é gerar consultas SQL otimizadas e bem estruturadas baseadas nas descrições em linguagem natural dos usuários.

Regras:
1. Gere APENAS código SQL válido, sem explicações adicionais
2. Use aliases descritivos para colunas e tabelas
3. Adicione comentários SQL explicativos quando apropriado
4. Otimize as consultas para performance
5. Use funções de agregação e window functions quando apropriado
6. Formate o código de forma legível com indentação adequada
7. Se o usuário pedir algo impossível ou ambíguo, gere um SQL de exemplo que demonstre o padrão solicitado
8. Use sintaxe PostgreSQL quando aplicável
9. Inclua cláusulas WHERE, GROUP BY, ORDER BY quando fizer sentido
10. Use CTEs (Common Table Expressions) para consultas complexas

Responda APENAS com o código SQL, começando com um comentário que descreve o objetivo da consulta.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { prompt, context } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    }

    const userMessage = context 
      ? `Contexto do banco de dados:\n${context}\n\nSolicitação:\n${prompt}`
      : prompt;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Taxa de requisições excedida. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Entre em contato com o administrador." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar SQL" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const generatedSQL = data.choices?.[0]?.message?.content || "";

    // Clean the response - remove markdown code blocks if present
    const cleanedSQL = generatedSQL
      .replace(/```sql\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim();

    const executionTime = Date.now() - startTime;

    // Save to history if user is authenticated
    if (userId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

        await adminSupabase.from("sql_query_history").insert({
          user_id: userId,
          prompt: prompt,
          generated_sql: cleanedSQL,
          context: context || null,
          model_used: "google/gemini-3-flash-preview",
          execution_time_ms: executionTime,
        });
        console.log("SQL query saved to history");
      } catch (historyError) {
        console.error("Error saving to history:", historyError);
        // Don't fail the request if history save fails
      }
    }

    return new Response(
      JSON.stringify({ sql: cleanedSQL, execution_time_ms: executionTime }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-sql function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
