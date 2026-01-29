export interface Agent {
  id: string;
  name: string;
  description?: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  avatar_url?: string;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  content: string;
  agent_id: string;
  reply_to_id?: string;
  thread_id?: string;
  mentions: string[];
  attachments: MessageAttachment[];
  is_code: boolean;
  code_language?: string;
  created_at: string;
  updated_at: string;
  agent?: Agent;
  reply_to?: Message;
  reactions?: MessageReaction[];
}

export interface MessageAttachment {
  id: string;
  filename: string;
  url: string;
  type: 'image' | 'file' | 'code';
  size: number;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  agent_id: string;
  emoji: string;
  created_at: string;
  agent?: Agent;
}

export interface MemoryItem {
  id: string;
  title: string;
  content: string;
  file_path?: string;
  agent_id?: string;
  topics: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  agent?: Agent;
}

export interface TypingIndicator {
  id: string;
  agent_id: string;
  channel: string;
  is_typing: boolean;
  created_at: string;
  agent?: Agent;
}

export interface CreateMessageData {
  content: string;
  agent_id: string;
  reply_to_id?: string;
  thread_id?: string;
  mentions?: string[];
  attachments?: MessageAttachment[];
  is_code?: boolean;
  code_language?: string;
}

export interface CreateMemoryItemData {
  title: string;
  content: string;
  file_path?: string;
  agent_id?: string;
  topics?: string[];
  metadata?: Record<string, any>;
}

export interface MemorySearchFilters {
  agent_id?: string;
  topics?: string[];
  date_from?: string;
  date_to?: string;
  file_type?: string;
}

export interface MemorySearchResult extends MemoryItem {
  similarity?: number;
  snippet?: string;
  highlighted_content?: string;
}