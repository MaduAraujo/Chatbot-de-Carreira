import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const [interest, experience, hours, preference, goal, topics, previous] = answers;

    const systemPrompt = `Você é um especialista em orientação de carreira em tecnologia. Sua função é analisar as respostas do usuário e sugerir as 3 melhores carreiras para ele, com base em:

- Interesses e motivações
- Experiência atual
- Disponibilidade de tempo
- Preferências de trabalho (pessoas/dados/código)
- Objetivos de carreira
- Áreas de interesse tecnológico
- Experiência prévia

Você deve retornar EXATAMENTE 3 carreiras, ordenadas da melhor para a menos adequada (rank 1, 2, 3).

Para cada carreira, forneça:
- title: Nome da carreira (ex: "Desenvolvedor Frontend", "Engenheiro de Dados", "Product Manager")
- score: Pontuação de 0 a 20 (rank 1 deve ter maior score)
- reason: Explicação clara de por que essa carreira combina com o perfil (2-3 frases)
- advantages: Array com 3 vantagens específicas dessa carreira
- challenges: Array com 2 desafios dessa carreira
- market: Descrição do mercado e faixa salarial no Brasil (2-3 frases)

IMPORTANTE: As carreiras devem ser reais, específicas e baseadas nas respostas do usuário. Não invente carreiras genéricas.`;

    const userPrompt = `Analise este perfil e sugira as 3 melhores carreiras em tecnologia:

INTERESSE: ${interest}
EXPERIÊNCIA: ${experience}
HORAS DISPONÍVEIS: ${hours}
PREFERÊNCIA: ${preference}
OBJETIVO: ${goal}
TÓPICOS DE INTERESSE: ${topics}
EXPERIÊNCIA PRÉVIA: ${previous}

Retorne as 3 carreiras mais adequadas em formato JSON seguindo esta estrutura EXATA:
{
  "careers": [
    {
      "rank": 1,
      "title": "Nome da Carreira",
      "score": 18,
      "reason": "Explicação...",
      "advantages": ["vantagem 1", "vantagem 2", "vantagem 3"],
      "challenges": ["desafio 1", "desafio 2"],
      "market": "Descrição do mercado..."
    },
    {
      "rank": 2,
      "title": "Nome da Carreira",
      "score": 16,
      "reason": "Explicação...",
      "advantages": ["vantagem 1", "vantagem 2", "vantagem 3"],
      "challenges": ["desafio 1", "desafio 2"],
      "market": "Descrição do mercado..."
    },
    {
      "rank": 3,
      "title": "Nome da Carreira",
      "score": 14,
      "reason": "Explicação...",
      "advantages": ["vantagem 1", "vantagem 2", "vantagem 3"],
      "challenges": ["desafio 1", "desafio 2"],
      "market": "Descrição do mercado..."
    }
  ]
}`;

    console.log("Calling Lovable AI Gateway for career analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Insufficient credits. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI Response received");

    const content = aiResponse.choices[0].message.content;
    
    // Extract JSON from the response (handle markdown code blocks if present)
    let jsonContent = content;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    } else {
      // Try to find JSON object directly
      const directJsonMatch = content.match(/\{[\s\S]*\}/);
      if (directJsonMatch) {
        jsonContent = directJsonMatch[0];
      }
    }

    const parsedCareers = JSON.parse(jsonContent);
    
    return new Response(
      JSON.stringify(parsedCareers),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-careers function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
