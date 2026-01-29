'use client'

import { TerminalSession } from '@/types/terminal'

interface TerminalSidebarProps {
  sessions: TerminalSession[];
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string | null) => void;
  onJumpToAgent: (agentId: string) => void;
}

export function TerminalSidebar({
  sessions,
  selectedSessionId,
  onSelectSession,
  onJumpToAgent,
}: TerminalSidebarProps) {
  const activeSessions = sessions.filter(s => s.status === 'active');
  const inactiveSessions = sessions.filter(s => s.status !== 'active');

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;
    return `${Math.floor(diffMins / 60)}h`;
  };

  const getStatusColor = (session: TerminalSession) => {
    if (!session.isConnected) return 'text-gray-400';
    switch (session.status) {
      case 'active':
        return 'text-green-500';
      case 'inactive':
        return 'text-yellow-500';
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const SessionItem = ({ session }: { session: TerminalSession }) => {
    const isSelected = selectedSessionId === session.id;
    
    return (
      <div className={`p-3 border rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}>
        <div className="flex justify-between items-start mb-2">
          <button
            onClick={() => onSelectSession(session.id)}
            className="text-left flex-1 min-w-0"
          >
            <div className="font-medium text-gray-900 truncate">
              {session.agentName}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {session.agentId}
            </div>
          </button>
          
          <div className="flex items-center gap-2 ml-2">
            <div className={`w-2 h-2 rounded-full ${
              session.isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span className="text-xs text-gray-500">
              {formatLastActivity(session.lastActivity)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className={`font-medium ${getStatusColor(session)}`}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </span>
          
          <div className="flex gap-2">
            <span className="text-gray-500">
              {session.messages.length} msgs
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onJumpToAgent(session.agentId);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View Agent
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Terminal Sessions</h3>
        <div className="text-xs text-gray-500">
          {activeSessions.length} active
        </div>
      </div>

      {/* View All Button */}
      <button
        onClick={() => onSelectSession(null)}
        className={`w-full p-2 mb-4 rounded-lg text-sm font-medium transition-colors ${
          selectedSessionId === null
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        View All Sessions
      </button>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <>
            <div className="text-sm font-medium text-gray-700 mb-2">
              Active Sessions
            </div>
            {activeSessions.map((session) => (
              <SessionItem key={session.id} session={session} />
            ))}
          </>
        )}

        {/* Inactive Sessions */}
        {inactiveSessions.length > 0 && (
          <>
            <div className="text-sm font-medium text-gray-700 mb-2 mt-6">
              Inactive Sessions
            </div>
            {inactiveSessions.map((session) => (
              <SessionItem key={session.id} session={session} />
            ))}
          </>
        )}

        {/* No sessions */}
        {sessions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <p className="text-sm">No terminal sessions</p>
            <p className="text-xs mt-1">Start an agent to see terminals</p>
          </div>
        )}
      </div>

      {/* Connection Status */}
      <div className="border-t pt-4 mt-4">
        <div className="text-xs text-gray-500 text-center">
          Terminal connections via WebSocket
        </div>
      </div>
    </div>
  );
}