import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "./ChatMessage";
import { CareerCard } from "./CareerCard";
import { Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [phase, setPhase] = useState<"interview" | "careers" | "handoff">("interview");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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

    // Simular delay de digitação
    setTimeout(() => {
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
        } else {
          // Análise final
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "Perfeito! Tenho tudo que preciso. Deixa eu analisar o melhor caminho para você...",
            isBot: true,
          };
          setMessages((prev) => [...prev, botMessage]);

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
      }
    }, 1500);
  };

  const handleCareerSelection = (career: Career) => {
    const botMessage: Message = {
      id: Date.now().toString(),
      text: `Excelente escolha! ${career.title} é uma ótima carreira para você. 

Vou te passar para meu colega especialista em ${career.title}. Ele vai montar todo o plano de estudos personalizado para você!

Em breve você terá:
✅ Roteiro completo de estudos
✅ Recursos e materiais recomendados
✅ Timeline realista de aprendizado
✅ Dicas de projetos práticos

Preparado para começar sua jornada? 🚀`,
      isBot: true,
    };

    setMessages((prev) => [...prev, botMessage]);
    setPhase("handoff");
    setCareers(null);

    toast({
      title: "Carreira selecionada!",
      description: `Você escolheu ${career.title}. Prepare-se para sua jornada!`,
    });
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 shadow-soft">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Orientador de Carreira Tech</h1>
            <p className="text-sm text-muted-foreground">
              Descubra sua carreira ideal em tecnologia
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message.text} isBot={message.isBot} />
          ))}
          {isTyping && <ChatMessage message="" isBot={true} isTyping={true} />}
          
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
      {phase !== "careers" && (
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
