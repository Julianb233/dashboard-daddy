import { supabase } from '../supabase';
import { MemoryItem, CreateMemoryItemData, MemorySearchFilters, MemorySearchResult } from './types';

export class MemoryService {
  // Memory item operations
  static async getMemoryItems(limit = 50, offset = 0): Promise<MemoryItem[]> {
    const { data, error } = await supabase
      .from('memory_items')
      .select('*, agent:agents(*)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
  }

  static async getMemoryItem(id: string): Promise<MemoryItem | null> {
    const { data, error } = await supabase
      .from('memory_items')
      .select('*, agent:agents(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createMemoryItem(itemData: CreateMemoryItemData): Promise<MemoryItem> {
    const { data, error } = await supabase
      .from('memory_items')
      .insert({
        ...itemData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*, agent:agents(*)')
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateMemoryItem(id: string, updates: Partial<CreateMemoryItemData>): Promise<MemoryItem> {
    const { data, error } = await supabase
      .from('memory_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*, agent:agents(*)')
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteMemoryItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('memory_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Search operations
  static async searchMemoryItems(
    query: string,
    filters: MemorySearchFilters = {},
    limit = 20
  ): Promise<MemorySearchResult[]> {
    let queryBuilder = supabase
      .from('memory_items')
      .select('*, agent:agents(*)');

    // Apply filters
    if (filters.agent_id) {
      queryBuilder = queryBuilder.eq('agent_id', filters.agent_id);
    }

    if (filters.topics && filters.topics.length > 0) {
      queryBuilder = queryBuilder.overlaps('topics', filters.topics);
    }

    if (filters.date_from) {
      queryBuilder = queryBuilder.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      queryBuilder = queryBuilder.lte('created_at', filters.date_to);
    }

    if (filters.file_type) {
      queryBuilder = queryBuilder.like('file_path', `%.${filters.file_type}`);
    }

    // Full text search
    if (query.trim()) {
      queryBuilder = queryBuilder.textSearch('content', query, {
        type: 'websearch',
        config: 'english'
      });
    }

    queryBuilder = queryBuilder
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data, error } = await queryBuilder;
    
    if (error) throw error;

    // Add snippets for search results
    return (data || []).map(item => ({
      ...item,
      snippet: this.generateSnippet(item.content, query),
      highlighted_content: this.highlightText(item.content, query)
    }));
  }

  // Advanced search with semantic capabilities (placeholder for future enhancement)
  static async semanticSearch(
    query: string,
    filters: MemorySearchFilters = {},
    limit = 20
  ): Promise<MemorySearchResult[]> {
    // For now, use the regular search - in the future, this could integrate with
    // embeddings and vector similarity search
    return this.searchMemoryItems(query, filters, limit);
  }

  // Get unique topics for filtering
  static async getTopics(): Promise<string[]> {
    const { data, error } = await supabase
      .from('memory_items')
      .select('topics');
    
    if (error) throw error;
    
    const topicSet = new Set<string>();
    data?.forEach(item => {
      if (item.topics && Array.isArray(item.topics)) {
        item.topics.forEach((topic: string) => topicSet.add(topic));
      }
    });
    
    return Array.from(topicSet).sort();
  }

  // Get unique agents that have memory items
  static async getMemoryAgents() {
    const { data, error } = await supabase
      .from('memory_items')
      .select('agent:agents(id, name)')
      .not('agent_id', 'is', null);
    
    if (error) throw error;
    
    const agentMap = new Map();
    data?.forEach(item => {
      if (item.agent) {
        agentMap.set(item.agent.id, item.agent);
      }
    });
    
    return Array.from(agentMap.values());
  }

  // Utility functions
  private static generateSnippet(content: string, query: string, maxLength = 200): string {
    if (!query.trim()) {
      return content.length > maxLength 
        ? content.substring(0, maxLength) + '...'
        : content;
    }

    const words = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    
    // Find the first occurrence of any query word
    let bestIndex = -1;
    let bestWord = '';
    
    for (const word of words) {
      const index = contentLower.indexOf(word);
      if (index !== -1 && (bestIndex === -1 || index < bestIndex)) {
        bestIndex = index;
        bestWord = word;
      }
    }
    
    if (bestIndex === -1) {
      return content.length > maxLength 
        ? content.substring(0, maxLength) + '...'
        : content;
    }
    
    // Create snippet around the found word
    const start = Math.max(0, bestIndex - 50);
    const end = Math.min(content.length, bestIndex + bestWord.length + 150);
    
    let snippet = content.substring(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    
    return snippet;
  }

  private static highlightText(content: string, query: string): string {
    if (!query.trim()) return content;
    
    const words = query.split(/\s+/).filter(word => word.length > 0);
    let highlightedContent = content;
    
    for (const word of words) {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedContent = highlightedContent.replace(
        regex, 
        '<mark class="bg-yellow-300 dark:bg-yellow-700">$1</mark>'
      );
    }
    
    return highlightedContent;
  }

  // Real-time subscriptions
  static subscribeToMemoryItems(callback: (item: MemoryItem) => void) {
    return supabase
      .channel('memory_items')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'memory_items'
        },
        async (payload) => {
          const { data } = await supabase
            .from('memory_items')
            .select('*, agent:agents(*)')
            .eq('id', payload.new.id)
            .single();
          
          if (data) callback(data);
        }
      )
      .subscribe();
  }

  // Bulk operations
  static async importMemoryItems(items: CreateMemoryItemData[]): Promise<MemoryItem[]> {
    const { data, error } = await supabase
      .from('memory_items')
      .insert(
        items.map(item => ({
          ...item,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      )
      .select('*, agent:agents(*)');
    
    if (error) throw error;
    return data || [];
  }

  static async exportMemoryItems(filters: MemorySearchFilters = {}): Promise<MemoryItem[]> {
    let queryBuilder = supabase
      .from('memory_items')
      .select('*, agent:agents(*)');

    // Apply filters
    if (filters.agent_id) {
      queryBuilder = queryBuilder.eq('agent_id', filters.agent_id);
    }
    if (filters.topics && filters.topics.length > 0) {
      queryBuilder = queryBuilder.overlaps('topics', filters.topics);
    }
    if (filters.date_from) {
      queryBuilder = queryBuilder.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      queryBuilder = queryBuilder.lte('created_at', filters.date_to);
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
}