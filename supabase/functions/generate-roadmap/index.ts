import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { carreira, horas, experiencia, objetivo, preferencia, interesses } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um planejador especializado em criar roadmaps personalizados de carreira em tecnologia.

SUA MISSÃO: Gerar um plano completo de estudos personalizado.

IMPORTANTE: 
- Seja específico e prático
- Adapte o conteúdo ao nível de experiência
- Considere a disponibilidade de tempo
- Use exemplos concretos
- Mantenha o tom motivador e realista`;

    const userPrompt = `Gere um roadmap completo para:

CARREIRA ESCOLHIDA: ${carreira}
HORAS/SEMANA: ${horas}
EXPERIÊNCIA: ${experiencia}
OBJETIVO: ${objetivo}
PREFERÊNCIA: ${preferencia}
INTERESSES: ${interesses}

Use EXATAMENTE este formato:

🧩 VISÃO DO DIA A DIA

Como é o trabalho de um(a) ${carreira}:

- (atividade típica 1)
- (atividade típica 2)
- (atividade típica 3)
- (atividade típica 4)
- (atividade típica 5)

🧠 MAPA DE SKILLS

CORE SKILLS (essenciais):
- (skill 1)
- (skill 2)
- (skill 3)

NICE-TO-HAVE (complementares):
- (skill 1)
- (skill 2)

FERRAMENTAS E TECNOLOGIAS:
- (tecnologia 1)
- (tecnologia 2)
- (tecnologia 3)

📅 ROADMAP DE 90 DIAS

ADAPTADO PARA: ${horas} horas/semana

MÊS 1 - FUNDAMENTOS

SEMANA 1-2:
- (meta específica 1)
- (meta específica 2)

SEMANA 3-4:
- (meta específica 1)
- (meta específica 2)

MÊS 2 - PRÁTICA

SEMANA 5-6:
- (meta específica 1)
- (meta específica 2)

SEMANA 7-8:
- (meta específica 1)
- (meta específica 2)

MÊS 3 - PORTFÓLIO E PREPARAÇÃO

SEMANA 9-10:
- (meta específica 1)
- (meta específica 2)

SEMANA 11-12:
- (meta específica 1)
- (meta específica 2)

🚀 PROJETO DE PORTFÓLIO

PROJETO: (nome do projeto)

O QUE FAZER:
(descrição clara do escopo)

ENTREGÁVEIS:
- (entregável 1)
- (entregável 2)
- (entregável 3)

CRITÉRIOS DE ACEITAÇÃO:
- (critério 1)
- (critério 2)
- (critério 3)

DICA: (dica prática para executar o projeto)

💬 ROTEIRO DE ENTREVISTAS

PERGUNTA 1: (pergunta comum júnior)
COMO RESPONDER:
(exemplo estruturado de resposta)

PERGUNTA 2: (pergunta comum júnior)
COMO RESPONDER:
(exemplo estruturado de resposta)

PERGUNTA 3: (pergunta comum júnior)
COMO RESPONDER:
(exemplo estruturado de resposta)

PERGUNTA 4: (pergunta comum júnior)
COMO RESPONDER:
(exemplo estruturado de resposta)

PERGUNTA 5: (pergunta comum júnior)
COMO RESPONDER:
(exemplo estruturado de resposta)

🎓 TRILHA DIO RECOMENDADA

TRILHA: (nome específico da trilha/bootcamp DIO)

POR QUE ESSA TRILHA:
(explicação de como conecta com a carreira)

PRÓXIMOS PASSOS:
1. Acesse dio.me
2. Busque por "(nome da trilha)"
3. Inscreva-se gratuitamente
4. Siga o cronograma junto com este roadmap

PERSONALIZE baseado em:
- ${experiencia === "zero" ? "Explicações mais didáticas, fundamentos reforçados" : ""}
- ${horas < 5 ? "Estender prazos, focar no essencial" : horas > 15 ? "Adicionar conteúdo extra, projetos avançados" : "Roadmap padrão"}
- ${objetivo === "primeiro emprego" ? "Enfatizar portfolio e entrevistas" : objetivo === "transição" ? "Destacar transferência de skills" : "Focar em skills avançadas"}`;

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
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns instantes." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao conectar com o serviço de IA");
    }

    const data = await response.json();
    const roadmap = data.choices[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ roadmap }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
