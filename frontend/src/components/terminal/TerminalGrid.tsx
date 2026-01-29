'use client'

import { TerminalSession } from '@/types/terminal'
import { TerminalWindow } from './TerminalWindow'

interface TerminalGridProps {
  sessions: TerminalSession[];
  selectedSessionId: string | null;
  layout: 'grid' | 'single' | 'split';
  onJumpToAgent: (agentId: string) => void;
}

export function TerminalGrid({
  sessions,
  selectedSessionId,
  layout,
  onJumpToAgent,
}: TerminalGridProps) {
  const getSessionsToDisplay = () => {
    if (selectedSessionId) {
      const session = sessions.find(s => s.id === selectedSessionId);
      return session ? [session] : [];
    }
    return sessions.filter(s => s.status === 'active');
  };

  const sessionsToDisplay = getSessionsToDisplay();

  const getGridClasses = () => {
    if (layout === 'single' || selectedSessionId) {
      return 'grid grid-cols-1';
    }
    
    const count = sessionsToDisplay.length;
    if (count <= 1) return 'grid grid-cols-1';
    if (count === 2) return 'grid grid-cols-1 lg:grid-cols-2';
    if (count <= 4) return 'grid grid-cols-1 lg:grid-cols-2';
    return 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';
  };

  if (sessionsToDisplay.length === 0) {
    return (
      <div className="bg-white rounded-lg border h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedSessionId ? 'Session Not Found' : 'No Active Terminal Sessions'}
          </h3>
          <p className="text-gray-500">
            {selectedSessionId
              ? 'The selected terminal session is no longer available.'
              : 'Start an agent to see live terminal output here.'
            }
          </p>
          {selectedSessionId && (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Refresh Page
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`gap-6 h-full ${getGridClasses()}`}>
      {sessionsToDisplay.map((session) => (
        <div key={session.id} className="min-h-0">
          <TerminalWindow
            session={session}
            onJumpToAgent={onJumpToAgent}
            isFullScreen={layout === 'single' || selectedSessionId === session.id}
          />
        </div>
      ))}
    </div>
  );
}