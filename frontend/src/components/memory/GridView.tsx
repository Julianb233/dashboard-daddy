'use client';

import { MemorySearchResult } from '@/lib/supabase/types';
import { useMemoryStore } from '@/store/memory';
import { formatDistanceToNow } from 'date-fns';
import { File, User, Tag, Copy, Calendar } from 'lucide-react';
import { useState } from 'react';

interface GridViewProps {
  items: MemorySearchResult[];
}

export function GridView({ items }: GridViewProps) {
  const { setSelectedItem, selectedItems, setSelectedItems } = useMemoryStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleItemClick = (item: MemorySearchResult) => {
    setSelectedItem(item);
  };

  const handleCopyContent = async (content: string, id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSelection = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSelected = selectedItems.includes(id)
      ? selectedItems.filter(item => item !== id)
      : [...selectedItems, id];
    setSelectedItems(newSelected);
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => {
          const isSelected = selectedItems.includes(item.id);
          
          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`group bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer transition-all hover:border-blue-500 hover:shadow-lg ${
                isSelected ? 'border-blue-500 bg-blue-900/20' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => toggleSelection(item.id, e as any)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
                
                {item.similarity && (
                  <span className="px-2 py-1 bg-green-600 text-green-100 text-xs rounded">
                    {Math.round(item.similarity * 100)}%
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>

              {/* Content Preview */}
              <div className="mb-3">
                <p className="text-gray-300 text-sm line-clamp-3">
                  {item.snippet || item.content}
                </p>
              </div>

              {/* Topics */}
              {item.topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.topics.slice(0, 2).map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                    >
                      {topic}
                    </span>
                  ))}
                  {item.topics.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{item.topics.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  {item.agent && (
                    <div className="flex items-center gap-1">
                      <User size={10} />
                      <span className="truncate">{item.agent.name}</span>
                    </div>
                  )}
                  
                  {item.file_path && (
                    <div className="flex items-center gap-1">
                      <File size={10} />
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => handleCopyContent(item.content, item.id, e)}
                  className="p-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                  title={copiedId === item.id ? 'Copied!' : 'Copy'}
                >
                  <Copy size={12} className={copiedId === item.id ? 'text-green-400' : ''} />
                </button>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                <Calendar size={10} />
                <span>{formatTime(item.created_at)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection info */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {selectedItems.length} selected
          <button
            onClick={() => setSelectedItems([])}
            className="ml-3 text-blue-200 hover:text-white"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}