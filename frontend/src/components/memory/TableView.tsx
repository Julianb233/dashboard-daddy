'use client';

import { MemorySearchResult } from '@/lib/supabase/types';
import { useMemoryStore } from '@/store/memory';
import { formatDistanceToNow } from 'date-fns';
import { File, User, Tag, Copy, MoreHorizontal, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface TableViewProps {
  items: MemorySearchResult[];
}

type SortField = 'title' | 'agent' | 'created_at' | 'topics';
type SortDirection = 'asc' | 'desc';

export function TableView({ items }: TableViewProps) {
  const { setSelectedItem, selectedItems, setSelectedItems } = useMemoryStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    let aVal: any, bVal: any;
    
    switch (sortField) {
      case 'title':
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
        break;
      case 'agent':
        aVal = a.agent?.name?.toLowerCase() || '';
        bVal = b.agent?.name?.toLowerCase() || '';
        break;
      case 'topics':
        aVal = a.topics.length;
        bVal = b.topics.length;
        break;
      case 'created_at':
      default:
        aVal = new Date(a.created_at);
        bVal = new Date(b.created_at);
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

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

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 w-8">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={items.length > 0 && selectedItems.length === items.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer hover:text-white"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1">
                  Title
                  <SortIcon field="title" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer hover:text-white"
                onClick={() => handleSort('agent')}
              >
                <div className="flex items-center gap-1">
                  Agent
                  <SortIcon field="agent" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer hover:text-white"
                onClick={() => handleSort('topics')}
              >
                <div className="flex items-center gap-1">
                  Topics
                  <SortIcon field="topics" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 cursor-pointer hover:text-white"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-1">
                  Created
                  <SortIcon field="created_at" />
                </div>
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item) => {
              const isSelected = selectedItems.includes(item.id);
              
              return (
                <tr
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-900/20' : ''
                  }`}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => toggleSelection(item.id, e as any)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {item.file_path && <File size={12} className="text-gray-500" />}
                      <div className="min-w-0">
                        <div className="font-medium text-white truncate max-w-xs">
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {item.snippet || item.content.substring(0, 50)}...
                        </div>
                      </div>
                      {item.similarity && (
                        <span className="px-2 py-0.5 bg-green-600 text-green-100 text-xs rounded">
                          {Math.round(item.similarity * 100)}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.agent ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {item.agent.name.charAt(0)}
                        </div>
                        <span>{item.agent.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
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
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-400">
                      {formatTime(item.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleCopyContent(item.content, item.id, e)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                        title={copiedId === item.id ? 'Copied!' : 'Copy content'}
                      >
                        <Copy size={14} className={copiedId === item.id ? 'text-green-400' : ''} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <File size={24} />
          </div>
          <p>No memory items found</p>
        </div>
      )}
    </div>
  );
}