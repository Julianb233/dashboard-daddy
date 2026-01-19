'use client';

import { useState, useEffect, useCallback } from 'react';

interface StreamMessage {
  type: 'output' | 'error' | 'status';
  agentId: string;
  content: string;
  timestamp: Date;
}

export function useAgentStream(agentId: string) {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(`/api/agents/${agentId}/stream`);

    eventSource.onopen = () => setConnected(true);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev.slice(-100), { ...data, timestamp: new Date() }]);
    };

    eventSource.onerror = () => {
      setConnected(false);
      eventSource.close();
    };

    return () => eventSource.close();
  }, [agentId]);

  const clear = useCallback(() => setMessages([]), []);

  return { messages, connected, clear };
}
