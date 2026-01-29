'use client';

import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { BubbaHeader } from '@/components/kanban/BubbaHeader';
import { BubbaSidebar } from '@/components/kanban/BubbaSidebar';
import { DeliverablesSection } from '@/components/kanban/DeliverablesSection';
import { NotesForBubba } from '@/components/kanban/NotesForBubba';
import { ActionLog } from '@/components/kanban/ActionLog';

export default function KanbanPage() {
  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <BubbaSidebar />
      <div className="flex-1 flex flex-col">
        <BubbaHeader />
        <main className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-3 gap-6 h-full">
            {/* Left Column: Kanban Board */}
            <div className="col-span-2 flex flex-col">
              <KanbanBoard />
              <div className="mt-6">
                <DeliverablesSection />
              </div>
            </div>

            {/* Right Column: Notes and Action Log */}
            <div className="flex flex-col space-y-6">
              <NotesForBubba />
              <ActionLog />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}