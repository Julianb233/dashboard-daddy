import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStatsClient, ActivityFeed, type ActivityItem } from "@/components/dashboard";
import {
  Play,
  Eye,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";

// Activity feed showing recent agent actions (will be wired to real data in future phase)
const recentActivities: ActivityItem[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    agentName: "Claude Code",
    action: "Ready for tasks",
    status: "completed",
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    agentName: "Gemini CLI",
    action: "Configured and available",
    status: "completed",
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    agentName: "OpenAI Codex",
    action: "Configured and available",
    status: "completed",
  },
];

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || "User";
  const firstName = userName.split(" ")[0];

  return (
    <div className="container py-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col gap-6">
        {/* Welcome Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your agents today.
            </p>
          </div>
        </div>

        {/* Quick Stats Cards - Real-time data from APIs */}
        <DashboardStatsClient />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Activity Feed - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <ActivityFeed activities={recentActivities} />
          </div>

          {/* Quick Actions Sidebar */}
          <div>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button asChild className="w-full justify-start gap-2">
                  <Link href="/agents/new">
                    <Play className="size-4" />
                    Start Agent
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Link href="/agents">
                    <Eye className="size-4" />
                    View Agents
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Link href="/projects">
                    <FolderOpen className="size-4" />
                    View Projects
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
