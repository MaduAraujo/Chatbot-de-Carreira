import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CareerCardProps {
  rank: 1 | 2 | 3;
  title: string;
  score: number;
  reason: string;
  advantages: string[];
  challenges: string[];
  market: string;
  onSelect: () => void;
}

const rankEmojis = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

const rankColors = {
  1: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/50",
  2: "from-gray-400/20 to-gray-500/20 border-gray-400/50",
  3: "from-orange-600/20 to-orange-700/20 border-orange-600/50",
};

export const CareerCard = ({
  rank,
  title,
  score,
  reason,
  advantages,
  challenges,
  market,
  onSelect,
}: CareerCardProps) => {
  return (
    <Card
      className={`bg-gradient-to-br ${rankColors[rank]} border-2 p-6 shadow-card animate-scale-fade-in transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{rankEmojis[rank]}</span>
            <div>
              <h3 className="text-xl font-bold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{score}/20 pontos</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              💡 POR QUE COMBINA COM VOCÊ:
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground">{reason}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-secondary">
                ✅ VANTAGENS:
              </h4>
              <ul className="space-y-1">
                {advantages.map((adv, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    • {adv}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-destructive">
                ⚠️ DESAFIOS:
              </h4>
              <ul className="space-y-1">
                {challenges.map((challenge, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    • {challenge}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              📈 MERCADO:
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground">{market}</p>
          </div>
        </div>

        <Button
          onClick={onSelect}
          className="w-full bg-gradient-primary hover:opacity-90"
          size="lg"
        >
          Escolher esta carreira
        </Button>
      </div>
    </Card>
  );
};
