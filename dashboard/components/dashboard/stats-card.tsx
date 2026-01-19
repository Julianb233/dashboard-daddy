import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  className?: string;
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  className,
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;

    const icons = {
      up: TrendingUp,
      down: TrendingDown,
      neutral: Minus,
    };
    const TrendIcon = icons[trend.direction];

    const colors = {
      up: "text-emerald-500 dark:text-emerald-400",
      down: "text-red-500 dark:text-red-400",
      neutral: "text-muted-foreground",
    };

    return (
      <div
        className={cn(
          "flex items-center gap-1 text-xs font-medium",
          colors[trend.direction]
        )}
      >
        <TrendIcon className="size-3" />
        <span>{trend.value > 0 ? "+" : ""}{trend.value}%</span>
      </div>
    );
  };

  return (
    <Card className={cn("py-4", className)}>
      <CardContent className="flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
          <Icon className="size-6 text-primary" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {getTrendIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
