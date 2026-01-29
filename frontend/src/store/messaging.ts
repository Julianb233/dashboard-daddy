import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Agent, Message, MessageReaction, TypingIndicator } from '@/lib/supabase/types';
import { MessagingService } from '@/lib/supabase/messaging';

interface MessagingState {
  // Data
  agents: Agent[];
  messages: Message[];
  currentAgent: Agent | null;
  typingIndicators: TypingIndicator[];
  selectedThread: string | null;
  isLoading: boolean;
  error: string | null;

  // UI State
  isComposing: boolean;
  replyTo: Message | null;
  mentionSuggestions: Agent[];
  showEmojiPicker: boolean;
  selectedMessageId: string | null;

  // Actions
  setCurrentAgent: (agent: Agent | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  removeMessage: (messageId: string) => void;
  setReplyTo: (message: Message | null) => void;
  setSelectedThread: (threadId: string | null) => void;
  setTypingIndicators: (indicators: TypingIndicator[]) => void;
  setMentionSuggestions: (agents: Agent[]) => void;
  setShowEmojiPicker: (show: boolean) => void;
  setSelectedMessageId: (id: string | null) => void;
  setIsComposing: (composing: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Async actions
  loadAgents: () => Promise<void>;
  loadMessages: (limit?: number, offset?: number) => Promise<void>;
  sendMessage: (content: string, attachments?: any[]) => Promise<void>;
  sendTypingIndicator: (isTyping: boolean) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;
  updateAgentStatus: (status: Agent['status']) => Promise<void>;
}

export const useMessagingStore = create<MessagingState>()(
  devtools(
    (set, get) => ({
      // Initial state
      agents: [],
      messages: [],
      currentAgent: null,
      typingIndicators: [],
      selectedThread: null,
      isLoading: false,
      error: null,
      isComposing: false,
      replyTo: null,
      mentionSuggestions: [],
      showEmojiPicker: false,
      selectedMessageId: null,

      // Setters
      setCurrentAgent: (agent) => set({ currentAgent: agent }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ 
        messages: [message, ...state.messages] 
      })),
      updateMessage: (messageId, updates) => set((state) => ({
        messages: state.messages.map(msg => 
          msg.id === messageId ? { ...msg, ...updates } : msg
        )
      })),
      removeMessage: (messageId) => set((state) => ({
        messages: state.messages.filter(msg => msg.id !== messageId)
      })),
      setReplyTo: (message) => set({ replyTo: message }),
      setSelectedThread: (threadId) => set({ selectedThread: threadId }),
      setTypingIndicators: (indicators) => set({ typingIndicators: indicators }),
      setMentionSuggestions: (agents) => set({ mentionSuggestions: agents }),
      setShowEmojiPicker: (show) => set({ showEmojiPicker: show }),
      setSelectedMessageId: (id) => set({ selectedMessageId: id }),
      setIsComposing: (composing) => set({ isComposing: composing }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Async actions
      loadAgents: async () => {
        try {
          set({ isLoading: true, error: null });
          const agents = await MessagingService.getAgents();
          set({ agents, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load agents',
            isLoading: false 
          });
        }
      },

      loadMessages: async (limit = 50, offset = 0) => {
        try {
          set({ isLoading: true, error: null });
          const messages = await MessagingService.getMessages(limit, offset);
          set({ messages, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load messages',
            isLoading: false 
          });
        }
      },

      sendMessage: async (content, attachments = []) => {
        const { currentAgent, replyTo, selectedThread } = get();
        if (!currentAgent) throw new Error('No current agent selected');

        try {
          set({ isLoading: true, error: null });
          
          // Extract mentions from content
          const mentionRegex = /@(\w+)/g;
          const mentions: string[] = [];
          let match;
          while ((match = mentionRegex.exec(content)) !== null) {
            mentions.push(match[1]);
          }

          const messageData = {
            content,
            agent_id: currentAgent.id,
            mentions,
            attachments,
            reply_to_id: replyTo?.id,
            thread_id: selectedThread || replyTo?.thread_id || replyTo?.id,
            is_code: content.includes('```'),
            code_language: content.includes('```') ? 
              content.split('```')[1]?.split('\n')[0] || 'text' : undefined
          };

          const newMessage = await MessagingService.createMessage(messageData);
          
          // Message will be added via real-time subscription
          set({ replyTo: null, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to send message',
            isLoading: false 
          });
        }
      },

      sendTypingIndicator: async (isTyping) => {
        const { currentAgent } = get();
        if (!currentAgent) return;

        try {
          await MessagingService.setTyping(currentAgent.id, 'general', isTyping);
        } catch (error) {
          console.error('Failed to send typing indicator:', error);
        }
      },

      addReaction: async (messageId, emoji) => {
        const { currentAgent } = get();
        if (!currentAgent) return;

        try {
          await MessagingService.addReaction(messageId, currentAgent.id, emoji);
          // Reaction will be updated via real-time subscription
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add reaction'
          });
        }
      },

      removeReaction: async (messageId, emoji) => {
        const { currentAgent } = get();
        if (!currentAgent) return;

        try {
          await MessagingService.removeReaction(messageId, currentAgent.id, emoji);
          // Reaction will be updated via real-time subscription
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to remove reaction'
          });
        }
      },

      updateAgentStatus: async (status) => {
        const { currentAgent } = get();
        if (!currentAgent) return;

        try {
          await MessagingService.updateAgentStatus(currentAgent.id, status);
          set({ 
            currentAgent: { ...currentAgent, status },
            agents: get().agents.map(agent => 
              agent.id === currentAgent.id ? { ...agent, status } : agent
            )
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update status'
          });
        }
      }
    }),
    { name: 'messaging-store' }
  )
);