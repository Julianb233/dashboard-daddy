'use client';

import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { BubbaHeader } from '@/components/kanban/BubbaHeader';
import { BubbaSidebar } from '@/components/kanban/BubbaSidebar';
import { DeliverablesSection } from '@/components/kanban/DeliverablesSection';

export default function KanbanPage() {
  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <BubbaSidebar />
      <div className="flex-1 flex flex-col">
        <BubbaHeader />
        <main className="flex-1 p-6 overflow-auto">
          <div className="h-full flex flex-col">
            <KanbanBoard />
            <DeliverablesSection />
          </div>
        </main>
      </div>
    </div>
  );
}