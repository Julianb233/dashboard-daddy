'use client';

import { useState } from 'react';
import { Message } from '@/lib/supabase/types';
import { useMessagingStore } from '@/store/messaging';
import { formatDistanceToNow } from 'date-fns';
import { Reply, MoreHorizontal, Heart, ThumbsUp, Smile, Copy, MessageSquare } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface MessageCardProps {
  message: Message;
  isGrouped: boolean;
  onReply: () => void;
  onThread: () => void;
}

export function MessageCard({ message, isGrouped, onReply, onThread }: MessageCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { addReaction, removeReaction, currentAgent } = useMessagingStore();

  const handleEmojiClick = async (emoji: string) => {
    if (!currentAgent) return;
    
    const existingReaction = message.reactions?.find(
      r => r.emoji === emoji && r.agent_id === currentAgent.id
    );
    
    if (existingReaction) {
      await removeReaction(message.id, emoji);
    } else {
      await addReaction(message.id, emoji);
    }
    
    setShowEmojiPicker(false);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
  };

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  // Parse mentions in content
  const renderContentWithMentions = (content: string) => {
    return content.split(/(@\w+)/g).map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={index}
            className="bg-blue-600 text-blue-100 px-1 rounded text-sm font-medium"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`relative ${isGrouped ? 'mt-1' : 'mt-4'} hover:bg-gray-800/50 rounded-lg px-3 py-2 transition-colors group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className={`${isGrouped ? 'w-10' : 'w-10'} flex-shrink-0`}>
          {!isGrouped && (
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold ${
              message.agent?.status === 'online' ? 'ring-2 ring-green-400' : ''
            }`}>
              {message.agent?.name?.charAt(0) || 'A'}
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header (name + timestamp) */}
          {!isGrouped && (
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-semibold text-white">
                {message.agent?.name || 'Unknown Agent'}
              </span>
              <span className="text-xs text-gray-400">
                {formatTime(message.created_at)}
              </span>
              {message.agent?.status && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  message.agent.status === 'online' ? 'bg-green-600 text-green-100' :
                  message.agent.status === 'away' ? 'bg-yellow-600 text-yellow-100' :
                  message.agent.status === 'busy' ? 'bg-red-600 text-red-100' :
                  'bg-gray-600 text-gray-100'
                }`}>
                  {message.agent.status}
                </span>
              )}
            </div>
          )}

          {/* Reply indicator */}
          {message.reply_to && (
            <div className="bg-gray-700 border-l-4 border-blue-500 p-2 mb-2 rounded-r">
              <div className="text-xs text-gray-400">
                Replying to <span className="font-medium">{message.reply_to.agent?.name}</span>
              </div>
              <div className="text-sm text-gray-300 mt-1 line-clamp-2">
                {message.reply_to.content}
              </div>
            </div>
          )}

          {/* Message content */}
          <div className="text-gray-100">
            {message.is_code ? (
              <CodeBlock 
                code={message.content} 
                language={message.code_language || 'text'} 
              />
            ) : (
              <div className="whitespace-pre-wrap break-words">
                {renderContentWithMentions(message.content)}
              </div>
            )}
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="bg-gray-700 rounded p-3 flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    📎
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{attachment.filename}</div>
                    <div className="text-xs text-gray-400">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Thread indicator */}
          {message.thread_id && (
            <button
              onClick={onThread}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <MessageSquare size={12} />
              View thread
            </button>
          )}
        </div>

        {/* Action buttons */}
        {showActions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEmojiClick.bind(null, '👍')}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Thumbs up"
            >
              <ThumbsUp size={14} />
            </button>
            
            <button
              onClick={handleEmojiClick.bind(null, '❤️')}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Heart"
            >
              <Heart size={14} />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Add reaction"
              >
                <Smile size={14} />
              </button>
              
              {showEmojiPicker && (
                <div className="absolute right-0 top-full mt-1 bg-gray-700 border border-gray-600 rounded-lg p-2 z-10">
                  <div className="flex gap-1">
                    {['😀', '😂', '🎉', '👍', '❤️', '🚀', '💯', '🔥'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiClick(emoji)}
                        className="p-1 hover:bg-gray-600 rounded text-sm"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onReply}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Reply"
            >
              <Reply size={14} />
            </button>

            <button
              onClick={handleCopyMessage}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Copy message"
            >
              <Copy size={14} />
            </button>

            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
              <MoreHorizontal size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}