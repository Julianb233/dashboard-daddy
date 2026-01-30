'use client';

import { useEffect, useState } from 'react';
import { useMessagingStore } from '@/store/messaging';
import { MessagingService } from '@/lib/supabase/messaging';
import { Message } from '@/lib/supabase/types';
import { MessageCard } from './MessageCard';
import { X, ArrowLeft } from 'lucide-react';

interface ThreadViewProps {
  threadId: string;
}

export function ThreadView({ threadId }: ThreadViewProps) {
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { setSelectedThread, setReplyTo } = useMessagingStore();

  useEffect(() => {
    loadThreadMessages();
  }, [threadId]);

  const loadThreadMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const messages = await MessagingService.getThreadMessages(threadId);
      setThreadMessages(messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load thread');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMain = () => {
    setSelectedThread(null);
  };

  const handleReplyClick = (message: Message) => {
    setReplyTo(message);
  };

  const handleThreadClick = () => {
    // Already in thread view
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          Loading thread...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-red-400">
          <p className="mb-4">Error: {error}</p>
          <button 
            onClick={loadThreadMessages}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const rootMessage = threadMessages.find(m => m.id === threadId);
  const replies = threadMessages.filter(m => m.id !== threadId);

  return (
    <div className="flex-1 flex flex-col">
      {/* Thread Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToMain}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Thread</h3>
            <p className="text-sm text-gray-400">
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </p>
          </div>
          <button
            onClick={handleBackToMain}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Thread Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Root message */}
        {rootMessage && (
          <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
            <div className="text-xs text-blue-400 mb-2 font-medium">ORIGINAL MESSAGE</div>
            <MessageCard
              message={rootMessage}
              isGrouped={false}
              onReply={() => handleReplyClick(rootMessage)}
              onThread={handleThreadClick}
            />
          </div>
        )}

        {/* Thread replies */}
        {replies.length > 0 ? (
          <div className="space-y-3">
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              Replies ({replies.length})
            </div>
            {replies.map((message, index) => {
              const prevMessage = index > 0 ? replies[index - 1] : null;
              const isGrouped = !!prevMessage && 
                prevMessage.agent_id === message.agent_id &&
                new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 300000;

              return (
                <MessageCard
                  key={message.id}
                  message={message}
                  isGrouped={isGrouped}
                  onReply={() => handleReplyClick(message)}
                  onThread={handleThreadClick}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <p>No replies yet</p>
            <p className="text-sm mt-1">Start the conversation in this thread!</p>
          </div>
        )}
      </div>
    </div>
  );
}