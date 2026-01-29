'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { TerminalSession, TerminalConnectionState } from '@/types/terminal'
import { TerminalGrid } from '@/components/terminal/TerminalGrid'
import { TerminalSidebar } from '@/components/terminal/TerminalSidebar'
import { TerminalSettings } from '@/components/terminal/TerminalSettings'

export default function TerminalPage() {
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<TerminalConnectionState>({
    isConnected: false,
    reconnectAttempts: 0,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'single' | 'split'>('grid');

  // WebSocket connection
  const [ws, setWs] = useState<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    try {
      // Replace with your actual WebSocket endpoint
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? 'wss://your-domain.com/api/terminal/ws' 
        : 'ws://localhost:3000/api/terminal/ws';
      
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log('WebSocket connected');
        setConnectionState(prev => ({
          ...prev,
          isConnected: true,
          reconnectAttempts: 0,
          error: undefined,
        }));
      };

      websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      websocket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          error: `Connection closed: ${event.reason || 'Unknown reason'}`,
        }));
        
        // Attempt to reconnect
        if (event.code !== 1000) { // Not a normal closure
          setTimeout(() => {
            setConnectionState(prev => ({
              ...prev,
              reconnectAttempts: prev.reconnectAttempts + 1,
            }));
            if (connectionState.reconnectAttempts < 5) {
              connectWebSocket();
            }
          }, 2000 * Math.pow(2, connectionState.reconnectAttempts)); // Exponential backoff
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionState(prev => ({
          ...prev,
          error: 'Connection error',
        }));
      };

      setWs(websocket);
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setConnectionState(prev => ({
        ...prev,
        error: 'Failed to connect',
      }));
    }
  }, [connectionState.reconnectAttempts]);

  // Handle WebSocket messages
  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'message':
        // Add new terminal message to the appropriate session
        setSessions(prev => prev.map(session => {
          if (session.id === message.payload.sessionId) {
            return {
              ...session,
              messages: [...session.messages.slice(-session.scrollback), message.payload],
              lastActivity: message.timestamp,
            };
          }
          return session;
        }));
        break;
      
      case 'session_start':
        // New terminal session started
        setSessions(prev => [
          ...prev,
          {
            id: message.payload.sessionId,
            agentId: message.payload.agentId,
            agentName: message.payload.agentName,
            status: 'active',
            startedAt: message.timestamp,
            lastActivity: message.timestamp,
            messages: [],
            scrollback: 1000,
            isConnected: true,
          }
        ]);
        break;
      
      case 'session_end':
        // Terminal session ended
        setSessions(prev => prev.map(session => {
          if (session.id === message.payload.sessionId) {
            return {
              ...session,
              status: 'inactive',
              isConnected: false,
            };
          }
          return session;
        }));
        break;
      
      case 'agent_status':
        // Agent status update
        setSessions(prev => prev.map(session => {
          if (session.agentId === message.payload.agentId) {
            return {
              ...session,
              status: message.payload.status,
            };
          }
          return session;
        }));
        break;
      
      case 'pong':
        setConnectionState(prev => ({
          ...prev,
          lastPing: message.timestamp,
        }));
        break;
    }
  };

  // Fetch initial terminal sessions
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/terminal/sessions');
      if (!res.ok) throw new Error('Failed to fetch sessions');
      const data = await res.json();
      setSessions(data.sessions);
    } catch (err) {
      console.error('Failed to fetch terminal sessions:', err);
    }
  }, []);

  // Initialize connection and fetch sessions
  useEffect(() => {
    fetchSessions();
    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Ping WebSocket to keep connection alive
  useEffect(() => {
    if (ws && connectionState.isConnected) {
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
        }
      }, 30000); // Ping every 30 seconds

      return () => clearInterval(pingInterval);
    }
  }, [ws, connectionState.isConnected]);

  // Navigate to agent
  const handleJumpToAgent = (agentId: string) => {
    // This would navigate to the agent's page or open agent details
    window.open(`/agents?highlight=${agentId}`, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Terminal Preview</h1>
            <p className="text-gray-500 mt-1">
              Real-time terminal output from AI coding agents
              <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                connectionState.isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {connectionState.isConnected ? '● Connected' : '● Disconnected'}
              </span>
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Layout Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['grid', 'single', 'split'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLayout(l)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    layout === l
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Reconnect Button */}
            {!connectionState.isConnected && (
              <button
                onClick={connectWebSocket}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Reconnect
              </button>
            )}
          </div>
        </div>

        {/* Connection Error */}
        {connectionState.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{connectionState.error}</p>
            {connectionState.reconnectAttempts > 0 && (
              <p className="text-red-600 text-sm mt-1">
                Reconnection attempt {connectionState.reconnectAttempts}/5
              </p>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <TerminalSidebar
              sessions={sessions}
              selectedSessionId={selectedSessionId}
              onSelectSession={setSelectedSessionId}
              onJumpToAgent={handleJumpToAgent}
            />
          </div>

          {/* Terminal Grid */}
          <div className="flex-1 min-w-0">
            <TerminalGrid
              sessions={sessions}
              selectedSessionId={selectedSessionId}
              layout={layout}
              onJumpToAgent={handleJumpToAgent}
            />
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <TerminalSettings
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}