'use client';

import { useEffect, useRef } from 'react';
import { useMessagingStore } from '@/store/messaging';
import { MessageCard } from './MessageCard';
import { MessageReaction } from './MessageReaction';

export function MessageList() {
  const { messages, isLoading, setSelectedThread, setReplyTo } = useMessagingStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleReplyClick = (message: any) => {
    setReplyTo(message);
  };

  const handleThreadClick = (message: any) => {
    setSelectedThread(message.thread_id || message.id);
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-medium mb-2">No messages yet</h3>
          <p className="text-sm">Start a conversation with your agents!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
    >
      {messages.map((message, index) => {
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const isGrouped = !!prevMessage && 
          prevMessage.agent_id === message.agent_id &&
          new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 300000; // 5 minutes

        return (
          <div key={message.id} className="group">
            <MessageCard
              message={message}
              isGrouped={isGrouped}
              onReply={() => handleReplyClick(message)}
              onThread={() => handleThreadClick(message)}
            />
            
            {/* Message reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="mt-1 ml-12 flex flex-wrap gap-1">
                {message.reactions.map((reaction) => (
                  <MessageReaction
                    key={reaction.id}
                    reaction={reaction}
                    messageId={message.id}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
      
      {isLoading && messages.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
            Loading more messages...
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}