'use client';

import { useState } from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { TtydTerminal } from '@/components/terminal/ttyd-terminal';
import { AgentsListClient, AgentStatsClient } from '@/components/agents/agents-list-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PanelLeftClose,
  PanelLeft,
  Terminal,
  Bot,
} from 'lucide-react';

export default function TerminalPage() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [isTerminalFullscreen, setIsTerminalFullscreen] = useState(false);

  // Hide sidebar when terminal is fullscreen
  const effectiveShowSidebar = showSidebar && !isTerminalFullscreen;

  return (
    <div className="h-[calc(100vh-4rem)]">
      <ResizablePanelGroup orientation="horizontal" className="h-full">
        {/* Left panel - Agent dashboard */}
        {effectiveShowSidebar && (
          <>
            <ResizablePanel
              defaultSize={35}
              minSize={25}
              maxSize={60}
              className="bg-background"
            >
              <div className="h-full overflow-auto">
                <div className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-semibold">Agents</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSidebar(false)}
                      className="h-8 w-8 p-0"
                      title="Hide sidebar"
                    >
                      <PanelLeftClose className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Agent Stats */}
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <AgentStatsClient />
                  </div>

                  {/* Agent List */}
                  <AgentsListClient />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />
          </>
        )}

        {/* Right panel - Terminal */}
        <ResizablePanel defaultSize={effectiveShowSidebar ? 65 : 100}>
          <div className="h-full flex flex-col">
            {/* Terminal header when sidebar is hidden */}
            {!effectiveShowSidebar && (
              <div className="flex items-center gap-2 p-2 border-b bg-background">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(true)}
                  className="h-8 w-8 p-0"
                  title="Show sidebar"
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Web Terminal</span>
                </div>
                <Badge variant="secondary" className="ml-auto text-xs">
                  terminal.dashboard-daddy.com
                </Badge>
              </div>
            )}

            {/* Terminal iframe */}
            <div className="flex-1">
              <TtydTerminal
                url="https://terminal.dashboard-daddy.com"
                onFullscreenChange={setIsTerminalFullscreen}
                className="h-full rounded-none border-0"
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
