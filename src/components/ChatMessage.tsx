import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  isTyping?: boolean;
}

export const ChatMessage = ({ message, isBot, isTyping }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full",
        isBot ? "justify-start animate-slide-in-left" : "justify-end animate-slide-in-right"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-6 py-4 shadow-soft transition-all duration-300 hover:shadow-md hover:scale-[1.02]",
          isBot
            ? "bg-card text-card-foreground"
            : "bg-gradient-primary text-primary-foreground"
        )}
      >
        {isTyping ? (
          <div className="flex gap-1.5">
            <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-current"></div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message}</p>
        )}
      </div>
    </div>
  );
};
