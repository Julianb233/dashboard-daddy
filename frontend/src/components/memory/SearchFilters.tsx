'use client';

import { useState } from 'react';
import { useMemoryStore } from '@/store/memory';
import { MemorySearchFilters } from '@/lib/supabase/types';
import { Calendar, User, Tag, File, X } from 'lucide-react';

export function SearchFilters() {
  const {
    searchFilters,
    topics,
    memoryAgents,
    setSearchFilters
  } = useMemoryStore();

  const [tempFilters, setTempFilters] = useState<MemorySearchFilters>(searchFilters);

  const handleFilterChange = (key: keyof MemorySearchFilters, value: any) => {
    const newFilters = { ...tempFilters, [key]: value };
    setTempFilters(newFilters);
    setSearchFilters(newFilters);
  };

  const handleTopicToggle = (topic: string) => {
    const currentTopics = tempFilters.topics || [];
    const newTopics = currentTopics.includes(topic)
      ? currentTopics.filter(t => t !== topic)
      : [...currentTopics, topic];
    
    handleFilterChange('topics', newTopics.length > 0 ? newTopics : undefined);
  };

  const clearFilter = (key: keyof MemorySearchFilters) => {
    const newFilters = { ...tempFilters };
    delete newFilters[key];
    setTempFilters(newFilters);
    setSearchFilters(newFilters);
  };

  const clearAllFilters = () => {
    setTempFilters({});
    setSearchFilters({});
  };

  const hasActiveFilters = Object.keys(tempFilters).length > 0;

  const fileTypes = ['md', 'txt', 'json', 'pdf', 'doc', 'docx'];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
            <Calendar size={14} />
            Date Range
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={tempFilters.date_from || ''}
              onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
              className="w-full px-3 py-2 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="From date"
            />
            <input
              type="date"
              value={tempFilters.date_to || ''}
              onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
              className="w-full px-3 py-2 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="To date"
            />
          </div>
          {(tempFilters.date_from || tempFilters.date_to) && (
            <button
              onClick={() => {
                clearFilter('date_from');
                clearFilter('date_to');
              }}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Clear dates
            </button>
          )}
        </div>

        {/* Agent Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
            <User size={14} />
            Agent
          </label>
          <select
            value={tempFilters.agent_id || ''}
            onChange={(e) => handleFilterChange('agent_id', e.target.value || undefined)}
            className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All agents</option>
            {memoryAgents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
          {tempFilters.agent_id && (
            <button
              onClick={() => clearFilter('agent_id')}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Clear agent
            </button>
          )}
        </div>

        {/* File Type */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
            <File size={14} />
            File Type
          </label>
          <select
            value={tempFilters.file_type || ''}
            onChange={(e) => handleFilterChange('file_type', e.target.value || undefined)}
            className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All types</option>
            {fileTypes.map((type) => (
              <option key={type} value={type}>
                .{type}
              </option>
            ))}
          </select>
          {tempFilters.file_type && (
            <button
              onClick={() => clearFilter('file_type')}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Clear type
            </button>
          )}
        </div>

        {/* Topics */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
            <Tag size={14} />
            Topics ({(tempFilters.topics || []).length})
          </label>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {topics.slice(0, 20).map((topic) => {
              const isSelected = (tempFilters.topics || []).includes(topic);
              return (
                <button
                  key={topic}
                  onClick={() => handleTopicToggle(topic)}
                  className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {topic}
                </button>
              );
            })}
          </div>
          {topics.length > 20 && (
            <p className="text-xs text-gray-500">
              +{topics.length - 20} more topics...
            </p>
          )}
          {(tempFilters.topics || []).length > 0 && (
            <button
              onClick={() => clearFilter('topics')}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Clear topics
            </button>
          )}
        </div>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-gray-700">
          <div className="flex flex-wrap gap-2">
            {tempFilters.date_from && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                From: {tempFilters.date_from}
                <button onClick={() => clearFilter('date_from')} className="hover:bg-blue-700 rounded">
                  <X size={12} />
                </button>
              </span>
            )}
            
            {tempFilters.date_to && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                To: {tempFilters.date_to}
                <button onClick={() => clearFilter('date_to')} className="hover:bg-blue-700 rounded">
                  <X size={12} />
                </button>
              </span>
            )}
            
            {tempFilters.agent_id && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded">
                Agent: {memoryAgents.find(a => a.id === tempFilters.agent_id)?.name}
                <button onClick={() => clearFilter('agent_id')} className="hover:bg-green-700 rounded">
                  <X size={12} />
                </button>
              </span>
            )}
            
            {tempFilters.file_type && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-xs rounded">
                Type: .{tempFilters.file_type}
                <button onClick={() => clearFilter('file_type')} className="hover:bg-purple-700 rounded">
                  <X size={12} />
                </button>
              </span>
            )}
            
            {(tempFilters.topics || []).map((topic) => (
              <span key={topic} className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-600 text-white text-xs rounded">
                {topic}
                <button 
                  onClick={() => handleTopicToggle(topic)} 
                  className="hover:bg-yellow-700 rounded"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}