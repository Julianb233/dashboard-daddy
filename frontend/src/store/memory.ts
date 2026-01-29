import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { MemoryItem, MemorySearchResult, MemorySearchFilters, Agent } from '@/lib/supabase/types';
import { MemoryService } from '@/lib/supabase/memory';

interface MemoryState {
  // Data
  memoryItems: MemorySearchResult[];
  searchResults: MemorySearchResult[];
  topics: string[];
  memoryAgents: Agent[];
  selectedItem: MemoryItem | null;
  
  // Search state
  searchQuery: string;
  searchFilters: MemorySearchFilters;
  isSearching: boolean;
  searchHistory: string[];
  savedSearches: { name: string; query: string; filters: MemorySearchFilters }[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  selectedItems: string[];
  viewMode: 'list' | 'grid' | 'table';
  sortBy: 'created_at' | 'updated_at' | 'title' | 'relevance';
  sortOrder: 'asc' | 'desc';
  
  // Actions
  setMemoryItems: (items: MemorySearchResult[]) => void;
  setSearchResults: (results: MemorySearchResult[]) => void;
  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: MemorySearchFilters) => void;
  setSelectedItem: (item: MemoryItem | null) => void;
  setSelectedItems: (items: string[]) => void;
  setViewMode: (mode: 'list' | 'grid' | 'table') => void;
  setSortBy: (sortBy: string, order?: 'asc' | 'desc') => void;
  addToSearchHistory: (query: string) => void;
  saveSearch: (name: string, query: string, filters: MemorySearchFilters) => void;
  removeSavedSearch: (name: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Async actions
  loadMemoryItems: (limit?: number, offset?: number) => Promise<void>;
  search: (query?: string, filters?: MemorySearchFilters) => Promise<void>;
  semanticSearch: (query?: string, filters?: MemorySearchFilters) => Promise<void>;
  loadTopics: () => Promise<void>;
  loadMemoryAgents: () => Promise<void>;
  createMemoryItem: (title: string, content: string, metadata?: any) => Promise<void>;
  updateMemoryItem: (id: string, updates: any) => Promise<void>;
  deleteMemoryItem: (id: string) => Promise<void>;
  exportResults: (format: 'json' | 'csv' | 'markdown') => string;
  bulkDelete: (ids: string[]) => Promise<void>;
  clearSearch: () => void;
}

export const useMemoryStore = create<MemoryState>()(
  devtools(
    (set, get) => ({
      // Initial state
      memoryItems: [],
      searchResults: [],
      topics: [],
      memoryAgents: [],
      selectedItem: null,
      searchQuery: '',
      searchFilters: {},
      isSearching: false,
      searchHistory: [],
      savedSearches: [],
      isLoading: false,
      error: null,
      selectedItems: [],
      viewMode: 'list',
      sortBy: 'created_at',
      sortOrder: 'desc',
      
      // Setters
      setMemoryItems: (items) => set({ memoryItems: items }),
      setSearchResults: (results) => set({ searchResults: results }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchFilters: (filters) => set({ searchFilters: filters }),
      setSelectedItem: (item) => set({ selectedItem: item }),
      setSelectedItems: (items) => set({ selectedItems: items }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSortBy: (sortBy, order) => set({ 
        sortBy, 
        sortOrder: order || (get().sortBy === sortBy && get().sortOrder === 'desc' ? 'asc' : 'desc')
      }),
      addToSearchHistory: (query) => set((state) => ({
        searchHistory: [query, ...state.searchHistory.filter(q => q !== query)].slice(0, 10)
      })),
      saveSearch: (name, query, filters) => set((state) => ({
        savedSearches: [
          ...state.savedSearches.filter(s => s.name !== name),
          { name, query, filters }
        ]
      })),
      removeSavedSearch: (name) => set((state) => ({
        savedSearches: state.savedSearches.filter(s => s.name !== name)
      })),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      // Clear search
      clearSearch: () => set({ 
        searchQuery: '', 
        searchFilters: {}, 
        searchResults: [],
        selectedItems: []
      }),
      
      // Async actions
      loadMemoryItems: async (limit = 50, offset = 0) => {
        try {
          set({ isLoading: true, error: null });
          const items = await MemoryService.getMemoryItems(limit, offset);
          set({ memoryItems: items, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load memory items',
            isLoading: false 
          });
        }
      },
      
      search: async (query, filters) => {
        const finalQuery = query ?? get().searchQuery;
        const finalFilters = filters ?? get().searchFilters;
        
        try {
          set({ isSearching: true, error: null });
          
          const results = await MemoryService.searchMemoryItems(finalQuery, finalFilters);
          
          // Sort results
          const { sortBy, sortOrder } = get();
          const sortedResults = [...results].sort((a, b) => {
            let aVal: any, bVal: any;
            
            switch (sortBy) {
              case 'relevance':
                aVal = a.similarity || 0;
                bVal = b.similarity || 0;
                break;
              case 'title':
                aVal = a.title.toLowerCase();
                bVal = b.title.toLowerCase();
                break;
              case 'updated_at':
                aVal = new Date(a.updated_at);
                bVal = new Date(b.updated_at);
                break;
              default:
                aVal = new Date(a.created_at);
                bVal = new Date(b.created_at);
            }
            
            if (sortOrder === 'asc') {
              return aVal > bVal ? 1 : -1;
            } else {
              return aVal < bVal ? 1 : -1;
            }
          });
          
          set({ 
            searchResults: sortedResults, 
            isSearching: false,
            searchQuery: finalQuery,
            searchFilters: finalFilters
          });
          
          if (finalQuery.trim()) {
            get().addToSearchHistory(finalQuery);
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Search failed',
            isSearching: false 
          });
        }
      },
      
      semanticSearch: async (query, filters) => {
        const finalQuery = query ?? get().searchQuery;
        const finalFilters = filters ?? get().searchFilters;
        
        try {
          set({ isSearching: true, error: null });
          const results = await MemoryService.semanticSearch(finalQuery, finalFilters);
          set({ 
            searchResults: results, 
            isSearching: false,
            searchQuery: finalQuery,
            searchFilters: finalFilters
          });
          
          if (finalQuery.trim()) {
            get().addToSearchHistory(finalQuery);
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Semantic search failed',
            isSearching: false 
          });
        }
      },
      
      loadTopics: async () => {
        try {
          const topics = await MemoryService.getTopics();
          set({ topics });
        } catch (error) {
          console.error('Failed to load topics:', error);
        }
      },
      
      loadMemoryAgents: async () => {
        try {
          const agents = await MemoryService.getMemoryAgents();
          set({ memoryAgents: agents });
        } catch (error) {
          console.error('Failed to load memory agents:', error);
        }
      },
      
      createMemoryItem: async (title, content, metadata = {}) => {
        try {
          set({ isLoading: true, error: null });
          
          const newItem = await MemoryService.createMemoryItem({
            title,
            content,
            metadata,
            topics: [] // Could be extracted from content or provided separately
          });
          
          set((state) => ({ 
            memoryItems: [newItem, ...state.memoryItems],
            isLoading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create memory item',
            isLoading: false 
          });
        }
      },
      
      updateMemoryItem: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });
          const updatedItem = await MemoryService.updateMemoryItem(id, updates);
          
          set((state) => ({
            memoryItems: state.memoryItems.map(item => 
              item.id === id ? updatedItem : item
            ),
            searchResults: state.searchResults.map(item => 
              item.id === id ? updatedItem : item
            ),
            selectedItem: state.selectedItem?.id === id ? updatedItem : state.selectedItem,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update memory item',
            isLoading: false 
          });
        }
      },
      
      deleteMemoryItem: async (id) => {
        try {
          set({ isLoading: true, error: null });
          await MemoryService.deleteMemoryItem(id);
          
          set((state) => ({
            memoryItems: state.memoryItems.filter(item => item.id !== id),
            searchResults: state.searchResults.filter(item => item.id !== id),
            selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
            selectedItems: state.selectedItems.filter(itemId => itemId !== id),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete memory item',
            isLoading: false 
          });
        }
      },
      
      bulkDelete: async (ids) => {
        try {
          set({ isLoading: true, error: null });
          
          await Promise.all(ids.map(id => MemoryService.deleteMemoryItem(id)));
          
          set((state) => ({
            memoryItems: state.memoryItems.filter(item => !ids.includes(item.id)),
            searchResults: state.searchResults.filter(item => !ids.includes(item.id)),
            selectedItem: ids.includes(state.selectedItem?.id || '') ? null : state.selectedItem,
            selectedItems: [],
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete items',
            isLoading: false 
          });
        }
      },
      
      exportResults: (format) => {
        const { searchResults } = get();
        
        switch (format) {
          case 'json':
            return JSON.stringify(searchResults, null, 2);
          
          case 'csv':
            const headers = 'Title,Content,Agent,Topics,Created,Updated\n';
            const rows = searchResults.map(item => 
              [
                `"${item.title}"`,
                `"${item.content.replace(/"/g, '""')}"`,
                `"${item.agent?.name || ''}"`,
                `"${item.topics.join(', ')}"`,
                `"${item.created_at}"`,
                `"${item.updated_at}"`
              ].join(',')
            ).join('\n');
            return headers + rows;
          
          case 'markdown':
            return searchResults.map(item => 
              `# ${item.title}\n\n${item.content}\n\n---\n\n`
            ).join('');
          
          default:
            return '';
        }
      }
    }),
    { name: 'memory-store' }
  )
);