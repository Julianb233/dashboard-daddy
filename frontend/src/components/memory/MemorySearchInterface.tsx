'use client';

import { useEffect, useState } from 'react';
import { useMemoryStore } from '@/store/memory';
import { SearchBar } from './SearchBar';
import { SearchFilters } from './SearchFilters';
import { SearchResults } from './SearchResults';
import { MemoryItemModal } from './MemoryItemModal';
import { ExportModal } from './ExportModal';
import { Search, Filter, Grid, List, Table, Plus, Download, Settings } from 'lucide-react';

export function MemorySearchInterface() {
  const {
    searchResults,
    memoryItems,
    searchQuery,
    searchFilters,
    isSearching,
    isLoading,
    error,
    viewMode,
    selectedItem,
    selectedItems,
    loadMemoryItems,
    loadTopics,
    loadMemoryAgents,
    search,
    setViewMode,
    setSelectedItem,
    clearSearch
  } = useMemoryStore();

  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    // Load initial data
    loadMemoryItems();
    loadTopics();
    loadMemoryAgents();
  }, [loadMemoryItems, loadTopics, loadMemoryAgents]);

  // Auto-search when query or filters change
  useEffect(() => {
    if (searchQuery || Object.keys(searchFilters).length > 0) {
      search();
    } else {
      clearSearch();
    }
  }, [searchQuery, searchFilters, search, clearSearch]);

  const displayItems = searchQuery || Object.keys(searchFilters).length > 0 
    ? searchResults 
    : memoryItems;

  const isSearchMode = searchQuery || Object.keys(searchFilters).length > 0;

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium mb-2">Error</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-800">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Search size={24} className="text-blue-400" />
              <h1 className="text-xl font-bold">Memory Search</h1>
              <span className="text-gray-400 text-sm">
                {isSearchMode ? 
                  `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}` :
                  `${memoryItems.length} items`
                }
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View mode toggles */}
              <div className="flex bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="List view"
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Grid view"
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Table view"
                >
                  <Table size={16} />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters || Object.keys(searchFilters).length > 0
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title="Toggle filters"
              >
                <Filter size={16} />
              </button>

              <button
                onClick={() => setShowExportModal(true)}
                disabled={displayItems.length === 0}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export results"
              >
                <Download size={16} />
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                title="Add memory item"
              >
                <Plus size={16} />
              </button>

              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                <Settings size={16} />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <SearchBar />
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="border-t border-gray-700 bg-gray-750">
            <SearchFilters />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading && displayItems.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              Loading memory items...
            </div>
          </div>
        ) : displayItems.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {isSearchMode ? 'No results found' : 'No memory items'}
              </h3>
              <p className="text-sm mb-4">
                {isSearchMode 
                  ? 'Try adjusting your search terms or filters'
                  : 'Start by creating your first memory item'
                }
              </p>
              {!isSearchMode && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Create Memory Item
                </button>
              )}
            </div>
          </div>
        ) : (
          <SearchResults items={displayItems} />
        )}
      </div>

      {/* Loading overlay for searches */}
      {isSearching && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
          <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white">Searching...</span>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedItem && (
        <MemoryItemModal 
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {showCreateModal && (
        <MemoryItemModal 
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showExportModal && (
        <ExportModal 
          items={selectedItems.length > 0 
            ? displayItems.filter(item => selectedItems.includes(item.id))
            : displayItems
          }
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}