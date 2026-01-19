import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  Pause,
  XCircle,
  LucideIcon,
} from "lucide-react";

export type ActivityStatus =
  | "completed"
  | "running"
  | "pending"
  | "failed"
  | "paused";

export interface ActivityItem {
  id: string;
  timestamp: string;
  agentName: string;
  action: string;
  status: ActivityStatus;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

const statusConfig: Record<
  ActivityStatus,
  { icon: LucideIcon; color: string; bgColor: string }
> = {
  completed: {
    icon: CheckCircle2,
    color: "text-emerald-500 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10 dark:bg-emerald-400/10",
  },
  running: {
    icon: Play,
    color: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-500/10 dark:bg-blue-400/10",
  },
  pending: {
    icon: Clock,
    color: "text-amber-500 dark:text-amber-400",
    bgColor: "bg-amber-500/10 dark:bg-amber-400/10",
  },
  failed: {
    icon: XCircle,
    color: "text-red-500 dark:text-red-400",
    bgColor: "bg-red-500/10 dark:bg-red-400/10",
  },
  paused: {
    icon: Pause,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
};

function ActivityStatusIcon({ status }: { status: ActivityStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full",
        config.bgColor
      )}
    >
      <Icon className={cn("size-4", config.color)} />
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="mb-2 size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No recent activity to display.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
              >
                <ActivityStatusIcon status={activity.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {activity.agentName}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.action}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground sm:hidden">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
