import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "./ChatMessage";
import { CareerCard } from "./CareerCard";
import { Send, Sparkles, LogIn, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
}

interface Career {
  rank: 1 | 2 | 3;
  title: string;
  score: number;
  reason: string;
  advantages: string[];
  challenges: string[];
  market: string;
}

const INITIAL_MESSAGE = `Olá! 👋 

Sou seu entrevistador de carreira em tecnologia. Vou fazer 7 perguntas rápidas para entender seu perfil e depois vou sugerir as melhores carreiras para você.

Preparado? Então vamos lá!

Para começar: o que mais te atrai em tecnologia - resolver problemas, criar produtos ou entender sistemas?`;

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: INITIAL_MESSAGE, isBot: true },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [careers, setCareers] = useState<Career[] | null>(null);
  const [phase, setPhase] = useState<"interview" | "careers" | "handoff" | "roadmap">("interview");
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [roadmap, setRoadmap] = useState<string>("");
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            createConversation();
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        createConversation();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createConversation = async () => {
    if (!user || conversationId) return;
    
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title: "Nova Conversa",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return;
    }

    setConversationId(data.id);
  };

  const saveMessage = async (role: string, content: string) => {
    if (!user || !conversationId) return;

    const { error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role,
        content,
      });

    if (error) {
      console.error("Error saving message:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setConversationId(null);
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta.",
    });
  };

  const questions = [
    "Que legal! Isso já diz muito sobre você. Agora me conta: você já tem experiência na área de tecnologia ou está começando do zero?",
    "Entendi perfeitamente! Isso é um ponto importante para personalizar sua jornada. Quantas horas por semana você consegue dedicar aos estudos?",
    "Perfeito! Vejo que você tem clareza sobre sua disponibilidade. No seu dia a dia, você prefere lidar mais com pessoas, dados ou código?",
    "Ótimo! Essa informação é super valiosa. Agora me diz: qual é seu objetivo principal - conseguir o primeiro emprego, fazer transição de carreira ou crescer na função atual?",
    "Show! Isso me ajuda muito a direcionar as sugestões. Quais assuntos ou tecnologias mais despertam seu interesse? Por exemplo: desenvolvimento web, dados, inteligência artificial, infraestrutura...",
    "Bacana! Estamos quase lá. Última pergunta: você tem alguma experiência prévia (mesmo que não seja em tech) que gostaria de aproveitar nessa nova jornada?",
  ];

  const analyzeCareers = (userAnswers: string[]): Career[] => {
    // Análise simplificada baseada nas respostas
    const [interest, experience, hours, preference, goal, topics, previous] = userAnswers;

    const allCareers = [
      {
        rank: 1 as const,
        title: "Desenvolvedor Frontend",
        score: 18,
        reason: "Seu interesse em criar produtos e preferência por trabalhar com código combinam perfeitamente com desenvolvimento frontend. A área tem alta demanda e permite evolução rápida.",
        advantages: [
          "Alta demanda no mercado",
          "Resultados visuais imediatos",
          "Comunidade ativa e muitos recursos de aprendizado",
        ],
        challenges: [
          "Necessidade de atualização constante",
          "Muitas ferramentas e frameworks para aprender",
        ],
        market: "Excelente demanda em todas as regiões. Salários variam de R$3k-R$15k+ dependendo da experiência e localização.",
      },
      {
        rank: 2 as const,
        title: "Analista de Dados",
        score: 16,
        reason: "Sua afinidade com resolução de problemas e sistemas combina com análise de dados. É uma carreira em crescimento com ótimas oportunidades.",
        advantages: [
          "Mercado em expansão",
          "Trabalho estratégico e analítico",
          "Boa remuneração desde o início",
        ],
        challenges: [
          "Curva de aprendizado em estatística",
          "Necessidade de conhecimento em várias ferramentas",
        ],
        market: "Crescimento acelerado. Remuneração inicial de R$4k-R$12k, variando por região e setor.",
      },
      {
        rank: 3 as const,
        title: "Product Manager",
        score: 14,
        reason: "Sua experiência prévia e interesse em produtos podem ser bem aproveitados. É uma carreira que une tecnologia e negócios.",
        advantages: [
          "Visão estratégica do produto",
          "Trabalho colaborativo com várias áreas",
          "Excelente para quem gosta de pessoas",
        ],
        challenges: [
          "Requer experiência prévia geralmente",
          "Necessidade de conhecimento técnico e de negócios",
        ],
        market: "Boa demanda em empresas de tecnologia. Salários de R$6k-R$20k+ para níveis júnior a pleno.",
      },
    ];

    return allCareers;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isBot: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Save user message if logged in
    if (user) {
      await saveMessage("user", input);
    }

    // Simular delay de digitação
    setTimeout(async () => {
      setIsTyping(false);

      if (phase === "interview") {
        const newAnswers = [...answers, input];
        setAnswers(newAnswers);
        const newQuestionCount = questionCount + 1;
        setQuestionCount(newQuestionCount);

        if (newQuestionCount < questions.length) {
          // Próxima pergunta
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: questions[newQuestionCount],
            isBot: true,
          };
          setMessages((prev) => [...prev, botMessage]);
          
          // Save bot message if logged in
          if (user) {
            await saveMessage("bot", questions[newQuestionCount]);
          }
        } else {
          // Análise final
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "Perfeito! Tenho tudo que preciso. Deixa eu analisar o melhor caminho para você...",
            isBot: true,
          };
          setMessages((prev) => [...prev, botMessage]);
          
          // Save bot message if logged in
          if (user) {
            await saveMessage("bot", botMessage.text);
          }

          // Analisar e apresentar carreiras
          setTimeout(() => {
            const analyzedCareers = analyzeCareers(newAnswers);
            setCareers(analyzedCareers);
            setPhase("careers");
          }, 2000);
        }
      } else if (phase === "handoff") {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Ótimo! Seu plano de estudos personalizado está sendo preparado. Em breve você receberá todas as informações para começar sua jornada! 🚀",
          isBot: true,
        };
        setMessages((prev) => [...prev, botMessage]);
        
        // Save bot message if logged in
        if (user) {
          await saveMessage("bot", botMessage.text);
        }
      }
    }, 1500);
  };

  const handleCareerSelection = async (career: Career) => {
    setSelectedCareer(career);
    setCareers(null);
    setIsGeneratingRoadmap(true);
    
    const botMessage: Message = {
      id: Date.now().toString(),
      text: `Olá! Recebi suas informações do entrevistador.

Vejo que você escolheu ${career.title} e tem ${answers[2]} disponíveis para estudar. Perfeito!

Vou montar agora seu plano completo personalizado... ⏳`,
      isBot: true,
    };

    setMessages((prev) => [...prev, botMessage]);
    
    // Save bot message if logged in
    if (user) {
      await saveMessage("bot", botMessage.text);
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-roadmap', {
        body: {
          carreira: career.title,
          horas: answers[2] || "não especificado",
          experiencia: answers[1] || "não especificado",
          objetivo: answers[4] || "não especificado",
          preferencia: answers[3] || "não especificado",
          interesses: answers[5] || "não especificado"
        }
      });

      if (error) throw error;
      
      if (data?.error) {
        throw new Error(data.error);
      }

      setRoadmap(data.roadmap);
      setPhase("roadmap");
      
      const roadmapMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.roadmap + "\n\n✨ Seu plano está pronto!\n\nLembre-se: o mais importante é a constância, não a velocidade. Comece pela Semana 1 e vá no seu ritmo.\n\nTem alguma dúvida sobre o plano? Posso detalhar alguma parte específica?",
        isBot: true,
      };
      
      setMessages((prev) => [...prev, roadmapMessage]);
      
      // Save roadmap message if logged in
      if (user) {
        await saveMessage("bot", roadmapMessage.text);
      }

      toast({
        title: "Roadmap gerado!",
        description: "Seu plano de estudos personalizado está pronto.",
      });
      
    } catch (error) {
      console.error("Error generating roadmap:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Desculpe, houve um erro ao gerar seu roadmap. Por favor, tente novamente em alguns instantes.",
        isBot: true,
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível gerar o roadmap.",
        variant: "destructive",
      });
      
      setPhase("careers");
      setCareers([career]);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 shadow-soft">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Orientador de Carreira Tech</h1>
            <p className="text-sm text-muted-foreground">
              {user ? "Suas conversas estão sendo salvas" : "Descubra sua carreira ideal em tecnologia"}
            </p>
          </div>
          <div>
            {user ? (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            ) : (
              <Button variant="default" size="sm" onClick={() => navigate("/auth")}>
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message.text} isBot={message.isBot} />
          ))}
          {(isTyping || isGeneratingRoadmap) && <ChatMessage message="" isBot={true} isTyping={true} />}
          
          {careers && phase === "careers" && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Suas 3 Melhores Carreiras
                </h2>
                <p className="text-muted-foreground">
                  Escolha a que mais combina com você
                </p>
              </div>
              {careers.map((career) => (
                <CareerCard
                  key={career.rank}
                  {...career}
                  onSelect={() => handleCareerSelection(career)}
                />
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {(phase === "interview" || phase === "roadmap") && (
        <div className="border-t bg-card px-4 py-4 shadow-soft">
          <div className="mx-auto flex max-w-4xl gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Digite sua resposta..."
              disabled={isTyping}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="bg-gradient-primary hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
