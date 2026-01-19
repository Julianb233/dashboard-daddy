'use client';

import { useAgentStream } from '@/hooks/useAgentStream';
import { useEffect, useRef } from 'react';

export function AgentTerminal({ agentId }: { agentId: string }) {
  const { messages, connected, clear } = useAgentStream(agentId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  return (
    <div className="bg-black rounded-lg border border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-400">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <button onClick={clear} className="text-xs text-gray-500 hover:text-gray-300">
          Clear
        </button>
      </div>
      <div ref={scrollRef} className="h-96 overflow-auto p-4 font-mono text-sm">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${msg.type === 'error' ? 'text-red-400' : 'text-green-400'}`}
          >
            {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}
