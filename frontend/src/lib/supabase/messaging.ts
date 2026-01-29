import { supabase } from '../supabase';
import { Agent, Message, MessageReaction, CreateMessageData, TypingIndicator } from './types';

export class MessagingService {
  // Agent operations
  static async getAgents(): Promise<Agent[]> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async getAgent(id: string): Promise<Agent | null> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateAgentStatus(agentId: string, status: Agent['status']) {
    const { error } = await supabase
      .from('agents')
      .update({ 
        status, 
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', agentId);
    
    if (error) throw error;
  }

  // Message operations
  static async getMessages(limit = 50, offset = 0): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        agent:agents(*),
        reply_to:messages(id, content, agent:agents(name)),
        reactions:message_reactions(*, agent:agents(name))
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
  }

  static async getThreadMessages(threadId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        agent:agents(*),
        reply_to:messages(id, content, agent:agents(name)),
        reactions:message_reactions(*, agent:agents(name))
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async createMessage(messageData: CreateMessageData): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        ...messageData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        agent:agents(*),
        reply_to:messages(id, content, agent:agents(name))
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateMessage(messageId: string, content: string): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .update({ 
        content, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', messageId)
      .select(`
        *,
        agent:agents(*),
        reply_to:messages(id, content, agent:agents(name))
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);
    
    if (error) throw error;
  }

  // Reactions
  static async addReaction(messageId: string, agentId: string, emoji: string): Promise<MessageReaction> {
    const { data, error } = await supabase
      .from('message_reactions')
      .upsert({
        message_id: messageId,
        agent_id: agentId,
        emoji,
        created_at: new Date().toISOString()
      })
      .select('*, agent:agents(name)')
      .single();
    
    if (error) throw error;
    return data;
  }

  static async removeReaction(messageId: string, agentId: string, emoji: string): Promise<void> {
    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('agent_id', agentId)
      .eq('emoji', emoji);
    
    if (error) throw error;
  }

  // Typing indicators
  static async setTyping(agentId: string, channel = 'general', isTyping = true): Promise<void> {
    if (isTyping) {
      const { error } = await supabase
        .from('typing_indicators')
        .upsert({
          agent_id: agentId,
          channel,
          is_typing: true,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('typing_indicators')
        .delete()
        .eq('agent_id', agentId)
        .eq('channel', channel);
      
      if (error) throw error;
    }
  }

  static async getTypingIndicators(channel = 'general'): Promise<TypingIndicator[]> {
    const { data, error } = await supabase
      .from('typing_indicators')
      .select('*, agent:agents(name)')
      .eq('channel', channel)
      .eq('is_typing', true);
    
    if (error) throw error;
    return data || [];
  }

  // Real-time subscriptions
  static subscribeToMessages(callback: (message: Message) => void) {
    return supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          // Fetch full message with relations
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              agent:agents(*),
              reply_to:messages(id, content, agent:agents(name))
            `)
            .eq('id', payload.new.id)
            .single();
          
          if (data) callback(data);
        }
      )
      .subscribe();
  }

  static subscribeToReactions(callback: (reaction: MessageReaction) => void) {
    return supabase
      .channel('reactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions'
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data } = await supabase
              .from('message_reactions')
              .select('*, agent:agents(name)')
              .eq('id', payload.new.id)
              .single();
            
            if (data) callback(data);
          }
        }
      )
      .subscribe();
  }

  static subscribeToTyping(callback: (indicators: TypingIndicator[]) => void) {
    return supabase
      .channel('typing')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators'
        },
        async () => {
          // Fetch all current typing indicators
          const data = await this.getTypingIndicators();
          callback(data);
        }
      )
      .subscribe();
  }

  static subscribeToAgentStatus(callback: (agents: Agent[]) => void) {
    return supabase
      .channel('agent_status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agents'
        },
        async () => {
          const data = await this.getAgents();
          callback(data);
        }
      )
      .subscribe();
  }
}