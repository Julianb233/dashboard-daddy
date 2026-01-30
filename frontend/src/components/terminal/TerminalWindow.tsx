'use client'

import { useState, useEffect, useRef } from 'react'
import { TerminalSession, TerminalMessage } from '@/types/terminal'

interface TerminalWindowProps {
  session: TerminalSession;
  onJumpToAgent: (agentId: string) => void;
  isFullScreen: boolean;
}

export function TerminalWindow({ session, onJumpToAgent, isFullScreen }: TerminalWindowProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const terminalRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session.messages, autoScroll]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
      setAutoScroll(isAtBottom);
    }
  };

  // Copy terminal output to clipboard
  const copyOutput = async () => {
    const output = session.messages
      .map(msg => `[${msg.type}] ${msg.content}`)
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(output);
      // Show a temporary success indicator
      const button = document.querySelector(`[data-copy-button="${session.id}"]`);
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy output:', err);
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'stdout':
        return 'text-green-300';
      case 'stderr':
        return 'text-red-300';
      case 'stdin':
        return 'text-blue-300';
      case 'system':
        return 'text-yellow-300';
      default:
        return 'text-gray-300';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatMessage = (message: TerminalMessage) => {
    // Basic ANSI escape code removal (simplified)
    return message.content.replace(/\x1b\[[0-9;]*m/g, '');
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 h-full flex flex-col">
      {/* Terminal Header */}
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <div className="flex items-center gap-3">
          {/* Window Controls */}
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          
          {/* Session Info */}
          <div className="text-sm">
            <span className="text-gray-300 font-medium">{session.agentName}</span>
            <span className="text-gray-500 ml-2">({session.agentId})</span>
            <div className={`inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs ${
              session.isConnected ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-1 ${
                session.isConnected ? 'bg-green-400' : 'bg-red-400'
              }`} />
              {session.isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Font Size */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFontSize(Math.max(8, fontSize - 1))}
              className="p-1 text-gray-400 hover:text-gray-300 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-xs text-gray-400 w-6 text-center">{fontSize}</span>
            <button
              onClick={() => setFontSize(Math.min(24, fontSize + 1))}
              className="p-1 text-gray-400 hover:text-gray-300 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          {/* Timestamps Toggle */}
          <button
            onClick={() => setShowTimestamps(!showTimestamps)}
            className={`p-1 rounded text-xs ${
              showTimestamps ? 'text-blue-400 bg-blue-900/30' : 'text-gray-400 hover:text-gray-300'
            }`}
            title="Toggle timestamps"
          >
            📅
          </button>

          {/* Auto-scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1 rounded text-xs ${
              autoScroll ? 'text-green-400 bg-green-900/30' : 'text-gray-400 hover:text-gray-300'
            }`}
            title="Toggle auto-scroll"
          >
            ↓
          </button>

          {/* Copy Output */}
          <button
            onClick={copyOutput}
            data-copy-button={session.id}
            className="px-2 py-1 text-xs text-gray-400 hover:text-gray-300 border border-gray-600 rounded"
            title="Copy output"
          >
            Copy
          </button>

          {/* Jump to Agent */}
          <button
            onClick={() => onJumpToAgent(session.agentId)}
            className="px-2 py-1 text-xs text-blue-400 hover:text-blue-300 border border-blue-600 rounded"
            title="View agent details"
          >
            Agent →
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={`h-full overflow-y-auto p-4 font-mono leading-relaxed ${
            isFullScreen ? 'text-sm' : 'text-xs'
          }`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {session.messages.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <p>Waiting for terminal output...</p>
              <p className="text-xs mt-2">Messages will appear here in real-time</p>
            </div>
          ) : (
            session.messages.map((message, index) => (
              <div
                key={index}
                className="mb-1 break-words"
              >
                {showTimestamps && (
                  <span className="text-gray-500 text-xs mr-2">
                    [{formatTimestamp(message.timestamp)}]
                  </span>
                )}
                <span className={`text-xs mr-2 ${getMessageColor(message.type)}`}>
                  [{message.type.toUpperCase()}]
                </span>
                <span className="text-gray-200 whitespace-pre-wrap">
                  {formatMessage(message)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t border-gray-700 bg-gray-800 text-xs text-gray-400 flex justify-between">
        <span>
          {session.messages.length} messages • Last activity: {new Date(session.lastActivity).toLocaleTimeString()}
        </span>
        <span>
          Session: {session.id.slice(-8)}
        </span>
      </div>
    </div>
  );
}