import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard, ActivityFeed, type ActivityItem } from "@/components/dashboard";
import {
  Bot,
  CheckCircle2,
  FolderKanban,
  Play,
  Eye,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";

// Mock data for the activity feed
const mockActivities: ActivityItem[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    agentName: "Code Review Agent",
    action: "Completed PR review for feature/auth-improvements",
    status: "completed",
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    agentName: "Test Runner Agent",
    action: "Running test suite for main branch",
    status: "running",
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    agentName: "Documentation Agent",
    action: "Generated API documentation for v2.1.0",
    status: "completed",
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    agentName: "Deploy Agent",
    action: "Deployment to staging environment",
    status: "failed",
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    agentName: "Security Scanner",
    action: "Waiting for dependency scan results",
    status: "pending",
  },
];

// Mock stats data
const mockStats = {
  activeAgents: 3,
  tasksCompleted: 12,
  projects: 5,
};

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

        {/* Quick Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            icon={Bot}
            label="Active Agents"
            value={mockStats.activeAgents}
            trend={{ value: 15, direction: "up" }}
          />
          <StatsCard
            icon={CheckCircle2}
            label="Tasks Completed"
            value={mockStats.tasksCompleted}
            trend={{ value: 8, direction: "up" }}
          />
          <StatsCard
            icon={FolderKanban}
            label="Projects"
            value={mockStats.projects}
            trend={{ value: 0, direction: "neutral" }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Activity Feed - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <ActivityFeed activities={mockActivities} />
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
