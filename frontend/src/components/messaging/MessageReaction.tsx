'use client';

import { MessageReaction as MessageReactionType } from '@/lib/supabase/types';
import { useMessagingStore } from '@/store/messaging';

interface MessageReactionProps {
  reaction: MessageReactionType;
  messageId: string;
}

export function MessageReaction({ reaction, messageId }: MessageReactionProps) {
  const { currentAgent, addReaction, removeReaction } = useMessagingStore();

  const handleClick = async () => {
    if (!currentAgent) return;

    const isMyReaction = reaction.agent_id === currentAgent.id;
    
    if (isMyReaction) {
      await removeReaction(messageId, reaction.emoji);
    } else {
      await addReaction(messageId, reaction.emoji);
    }
  };

  const isMyReaction = currentAgent && reaction.agent_id === currentAgent.id;

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
        isMyReaction
          ? 'bg-blue-600 text-blue-100 hover:bg-blue-700'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
      title={`${reaction.agent?.name} reacted with ${reaction.emoji}`}
    >
      <span className="text-sm">{reaction.emoji}</span>
      <span className="font-medium">1</span>
    </button>
  );
}