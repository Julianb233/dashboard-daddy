'use client';

import { useState, useRef, useEffect } from 'react';
import { useMemoryStore } from '@/store/memory';
import { Search, X, Clock, Bookmark, Zap } from 'lucide-react';

export function SearchBar() {
  const {
    searchQuery,
    searchHistory,
    savedSearches,
    setSearchQuery,
    semanticSearch,
    search,
    clearSearch
  } = useMemoryStore();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchMode, setSearchMode] = useState<'standard' | 'semantic'>('standard');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    
    if (searchMode === 'semantic') {
      semanticSearch(query);
    } else {
      search(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    clearSearch();
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion);
  };

  const handleFocus = () => {
    if (searchHistory.length > 0 || savedSearches.length > 0) {
      setShowSuggestions(true);
    }
  };

  const filteredHistory = searchHistory.filter(item => 
    item.toLowerCase().includes(searchQuery.toLowerCase()) && item !== searchQuery
  );

  const filteredSavedSearches = savedSearches.filter(saved =>
    saved.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    saved.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative" ref={inputRef}>
      <div className="flex gap-2">
        {/* Search Mode Toggle */}
        <div className="flex bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setSearchMode('standard')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              searchMode === 'standard'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Standard text search"
          >
            <Search size={12} className="inline mr-1" />
            Text
          </button>
          <button
            onClick={() => setSearchMode('semantic')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              searchMode === 'semantic'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            title="AI-powered semantic search"
          >
            <Zap size={12} className="inline mr-1" />
            AI
          </button>
        </div>

        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <Search 
              size={20} 
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                searchMode === 'semantic' ? 'text-purple-400' : 'text-gray-400'
              }`} 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              placeholder={
                searchMode === 'semantic'
                  ? "Ask questions about your memories..."
                  : "Search memory items..."
              }
              className={`w-full pl-11 pr-10 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                searchMode === 'semantic' 
                  ? 'focus:ring-purple-500' 
                  : 'focus:ring-blue-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (filteredHistory.length > 0 || filteredSavedSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-20 max-h-64 overflow-y-auto">
          {/* Recent Searches */}
          {filteredHistory.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-gray-400 font-medium uppercase tracking-wider">
                <Clock size={12} />
                Recent Searches
              </div>
              {filteredHistory.slice(0, 5).map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(item)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded flex items-center gap-2 transition-colors"
                >
                  <Search size={14} className="text-gray-500" />
                  <span className="truncate">{item}</span>
                </button>
              ))}
            </div>
          )}

          {/* Saved Searches */}
          {filteredSavedSearches.length > 0 && (
            <div className="p-2 border-t border-gray-700">
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-gray-400 font-medium uppercase tracking-wider">
                <Bookmark size={12} />
                Saved Searches
              </div>
              {filteredSavedSearches.slice(0, 5).map((saved, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(saved.query)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Bookmark size={14} className="text-blue-400" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{saved.name}</div>
                      <div className="text-xs text-gray-400 truncate">{saved.query}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search hints */}
      <div className="mt-2 text-xs text-gray-500">
        {searchMode === 'semantic' ? (
          <span>💡 Try: "What did I learn about React hooks?" or "Show me finance-related notes"</span>
        ) : (
          <span>💡 Use quotes for exact phrases, OR for alternatives</span>
        )}
      </div>
    </div>
  );
}