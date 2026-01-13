import api from './api';

export interface Message {
  _id: string;
  conversationId: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  type: 'text' | 'image' | 'video' | 'file';
  createdAt: string;
}

export interface Conversation {
  _id: string;
  type: 'direct' | 'group';
  participants: Array<{
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
  name?: string; // For groups
  lastMessage?: Message;
  updatedAt: string;
  admin?: string; // For groups
}

export const conversationService = {
  // Get all conversations for the current user
  getConversations: async () => {
    const response = await api.get<{ conversations: Conversation[] }>('/conversations');
    return response.data;
  },

  // Get conversation history
  getMessages: async (conversationId: string) => {
    const response = await api.get<{ messages: Message[] }>(`/conversations/${conversationId}/messages`);
    return response.data;
  },

  // Start or get existing direct conversation
  startDirectConversation: async (recipientId: string) => {
    const response = await api.post<{ conversation: Conversation }>('/conversations/direct', { recipientId });
    return response.data;
  },

  // Create a group
  createGroup: async (name: string, participantIds: string[]) => {
    const response = await api.post<{ conversation: Conversation }>('/conversations/group', { name, participantIds });
    return response.data;
  },
  
  // Send a message (Standard HTTP fallback if Socket fails, or mostly done via Socket usually. 
  // Let's assume we might want to POST messages too if socket is offline or purely storing)
  // For now, let's assume message sending is primarily Socket based, but often APIs have a POST /messages endpoint too.
  // We'll stick to mostly socket for sending, but fetching via API.
};
