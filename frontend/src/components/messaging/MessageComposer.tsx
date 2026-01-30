'use client';

import { useState, useRef, useEffect } from 'react';
import { useMessagingStore } from '@/store/messaging';
import { Send, Paperclip, Code, Smile, X } from 'lucide-react';

export function MessageComposer() {
  const [message, setMessage] = useState('');
  const [isCode, setIsCode] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    sendMessage, 
    sendTypingIndicator,
    replyTo, 
    setReplyTo, 
    agents,
    isLoading,
    currentAgent
  } = useMessagingStore();

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  useEffect(() => {
    // Send typing indicator
    const timeout = setTimeout(() => {
      if (message.trim()) {
        sendTypingIndicator(true);
      } else {
        sendTypingIndicator(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      sendTypingIndicator(false);
    };
  }, [message, sendTypingIndicator]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !currentAgent || isLoading) return;

    const content = isCode ? `\`\`\`\n${message}\n\`\`\`` : message;

    try {
      await sendMessage(content);
      setMessage('');
      setIsCode(false);
      sendTypingIndicator(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }

    // Handle mentions
    if (e.key === '@') {
      setShowMentions(true);
      setMentionQuery('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Check for mention trigger
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setShowMentions(true);
      setMentionQuery(mentionMatch[1]);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  };

  const insertMention = (agentName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = message.substring(0, cursorPosition);
    const textAfterCursor = message.substring(cursorPosition);
    
    // Replace the partial mention with the full mention
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      const beforeMention = textBeforeCursor.substring(0, mentionMatch.index);
      const newMessage = `${beforeMention}@${agentName} ${textAfterCursor}`;
      setMessage(newMessage);
      
      // Set cursor position after the mention
      setTimeout(() => {
        const newPosition = beforeMention.length + agentName.length + 2;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
      }, 0);
    }

    setShowMentions(false);
    setMentionQuery('');
  };

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const canSend = message.trim() && currentAgent && !isLoading;

  return (
    <div className="p-4">
      {/* Reply indicator */}
      {replyTo && (
        <div className="mb-3 bg-gray-700 border-l-4 border-blue-500 p-3 rounded-r flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-400 mb-1">
              Replying to <span className="font-medium">{replyTo.agent?.name}</span>
            </div>
            <div className="text-sm text-gray-300 line-clamp-2">
              {replyTo.content}
            </div>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="ml-2 p-1 text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Mention suggestions */}
      {showMentions && filteredAgents.length > 0 && (
        <div className="mb-3 bg-gray-700 border border-gray-600 rounded-lg p-2 max-h-40 overflow-y-auto">
          {filteredAgents.map(agent => (
            <button
              key={agent.id}
              onClick={() => insertMention(agent.name)}
              className="w-full flex items-center gap-3 p-2 hover:bg-gray-600 rounded text-left"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                {agent.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-sm">{agent.name}</div>
                <div className="text-xs text-gray-400">{agent.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isCode ? "Enter your code..." : "Type a message... (Use @ to mention agents)"}
              className={`w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none min-h-[44px] max-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isCode ? 'font-mono text-sm' : ''
              }`}
              rows={1}
              disabled={!currentAgent}
            />
            
            {/* Toolbar */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsCode(!isCode)}
                className={`p-1.5 rounded transition-colors ${
                  isCode 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title="Toggle code mode"
              >
                <Code size={16} />
              </button>
              
              <button
                type="button"
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Attach file"
              >
                <Paperclip size={16} />
              </button>
              
              <button
                type="button"
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Emoji"
              >
                <Smile size={16} />
              </button>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!canSend}
          className={`p-3 rounded-lg transition-all ${
            canSend
              ? 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
          title="Send message"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>

      {/* Status indicator */}
      {currentAgent && (
        <div className="mt-2 text-xs text-gray-400">
          Chatting as <span className="font-medium text-blue-400">{currentAgent.name}</span>
          {isCode && <span className="ml-2 text-yellow-400">• Code mode</span>}
        </div>
      )}
    </div>
  );
}