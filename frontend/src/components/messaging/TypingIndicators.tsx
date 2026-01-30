'use client';

import { useMessagingStore } from '@/store/messaging';

export function TypingIndicators() {
  const { typingIndicators } = useMessagingStore();

  if (typingIndicators.length === 0) return null;

  return (
    <div className="px-4 py-2 text-sm text-gray-400">
      <div className="flex items-center gap-3">
        <div className="flex gap-3">
          {typingIndicators.map((indicator) => (
            <div key={indicator.id} className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                {indicator.agent?.name?.charAt(0) || 'A'}
              </div>
              <span className="text-xs">{indicator.agent?.name || 'Unknown'}</span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-1">
          <span>is typing</span>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
}