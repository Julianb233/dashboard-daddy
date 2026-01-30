'use client';

import { MemorySearchResult } from '@/lib/supabase/types';
import { useMemoryStore } from '@/store/memory';
import { formatDistanceToNow } from 'date-fns';
import { File, User, Tag, Copy, ExternalLink, MoreHorizontal, Calendar } from 'lucide-react';
import { useState } from 'react';

interface ListViewProps {
  items: MemorySearchResult[];
}

export function ListView({ items }: ListViewProps) {
  const { setSelectedItem, selectedItems, setSelectedItems } = useMemoryStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleItemClick = (item: MemorySearchResult) => {
    setSelectedItem(item);
  };

  const handleCopyContent = async (content: string, id: string) => {
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
      return 'Unknown time';
    }
  };

  const highlightText = (text: string, highlighted?: string) => {
    if (!highlighted) return text;
    return <div dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="space-y-3">
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
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => toggleSelection(item.id, e as any)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    
                    {item.similarity && (
                      <span className="px-2 py-1 bg-green-600 text-green-100 text-xs rounded">
                        {Math.round(item.similarity * 100)}% match
                      </span>
                    )}
                  </div>

                  {/* Content Preview */}
                  <div className="mb-3">
                    {item.highlighted_content ? (
                      <div className="text-gray-300 text-sm line-clamp-3">
                        {highlightText(item.content, item.highlighted_content)}
                      </div>
                    ) : item.snippet ? (
                      <p className="text-gray-300 text-sm line-clamp-3">
                        {item.snippet}
                      </p>
                    ) : (
                      <p className="text-gray-300 text-sm line-clamp-3">
                        {item.content}
                      </p>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                    {item.agent && (
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        <span>{item.agent.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatTime(item.created_at)}</span>
                    </div>

                    {item.file_path && (
                      <div className="flex items-center gap-1">
                        <File size={12} />
                        <span>{item.file_path}</span>
                      </div>
                    )}

                    {item.topics.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag size={12} />
                        <div className="flex flex-wrap gap-1">
                          {item.topics.slice(0, 3).map((topic) => (
                            <span
                              key={topic}
                              className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                            >
                              {topic}
                            </span>
                          ))}
                          {item.topics.length > 3 && (
                            <span className="text-gray-500">
                              +{item.topics.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyContent(item.content, item.id);
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    title={copiedId === item.id ? 'Copied!' : 'Copy content'}
                  >
                    <Copy size={14} className={copiedId === item.id ? 'text-green-400' : ''} />
                  </button>

                  {item.file_path && (
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                      title="Open file"
                    >
                      <ExternalLink size={14} />
                    </button>
                  )}

                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection info */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
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