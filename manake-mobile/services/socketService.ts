/**
 * Socket.IO Client Service for React Native
 * Handles real-time communication with the server
 */
import { io, Socket } from "socket.io-client";
import { Platform } from "react-native";
import { getAuthToken } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Server URL based on environment
const SOCKET_URL = __DEV__
  ? Platform.select({
      ios: "http://localhost:3001",
      android: "http://10.0.2.2:3001",
      default: "http://localhost:3001",
    })
  : "https://manake.netlify.app";

// Event types
export interface SocketEvents {
  // Connection events
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;

  // Message events
  "message:new": (message: IncomingMessage) => void;
  "message:read": (data: { messageId: string; readAt: string }) => void;
  "message:typing": (data: { conversationId: string; userId: string }) => void;
  "message:stop_typing": (data: { conversationId: string; userId: string }) => void;

  // Notification events
  "notification:new": (notification: Notification) => void;

  // Connection/Network events
  "connection:request": (data: ConnectionRequest) => void;
  "connection:accepted": (data: ConnectionAccepted) => void;

  // Mentorship events
  "mentorship:request": (data: MentorshipRequest) => void;
  "mentorship:accepted": (data: MentorshipAccepted) => void;
  "mentorship:session_reminder": (data: SessionReminder) => void;

  // Presence events
  "user:online": (data: { userId: string }) => void;
  "user:offline": (data: { userId: string }) => void;
}

export interface IncomingMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  contentType: "text" | "image" | "video" | "audio";
  mediaUrl?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface ConnectionRequest {
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  message?: string;
}

export interface ConnectionAccepted {
  userId: string;
  userName: string;
}

export interface MentorshipRequest {
  fromUserId: string;
  fromUserName: string;
  message?: string;
}

export interface MentorshipAccepted {
  mentorId: string;
  mentorName: string;
}

export interface SessionReminder {
  sessionId: string;
  mentorName: string;
  scheduledAt: string;
  minutesUntil: number;
}

type EventCallback<T> = (data: T) => void;

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<EventCallback<unknown>>> = new Map();
  private isConnecting = false;

  /**
   * Initialize and connect to the Socket.IO server
   */
  async connect(): Promise<void> {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = getAuthToken();

      this.socket = io(SOCKET_URL!, {
        transports: ["websocket", "polling"],
        auth: {
          token,
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      this.setupEventHandlers();
      this.isConnecting = false;
    } catch (error) {
      this.isConnecting = false;
      console.error("[SocketService] Connection error:", error);
      throw error;
    }
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Setup internal event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("[SocketService] Connected");
      this.reconnectAttempts = 0;
      this.emit("connect", undefined);
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log("[SocketService] Disconnected:", reason);
      this.emit("disconnect", reason);
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("[SocketService] Connection error:", error);
      this.reconnectAttempts++;
      this.emit("connect_error", error);

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("[SocketService] Max reconnection attempts reached");
        this.socket?.disconnect();
      }
    });

    // Forward all events to registered listeners
    this.socket.onAny((event: string, ...args: unknown[]) => {
      this.emit(event, args[0]);
    });
  }

  /**
   * Subscribe to an event
   */
  on<K extends keyof SocketEvents>(
    event: K,
    callback: SocketEvents[K],
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback<unknown>);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback as EventCallback<unknown>);
    };
  }

  /**
   * Emit an event to registered listeners
   */
  private emit(event: string, data: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[SocketService] Error in ${event} handler:`, error);
        }
      });
    }
  }

  /**
   * Send a message
   */
  sendMessage(conversationId: string, content: string, contentType: "text" | "image" = "text"): void {
    if (!this.socket?.connected) {
      console.warn("[SocketService] Cannot send message: not connected");
      return;
    }

    this.socket.emit("message:send", {
      conversationId,
      content,
      contentType,
    });
  }

  /**
   * Mark message as read
   */
  markAsRead(messageId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit("message:read", { messageId });
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit("message:typing", { conversationId });
  }

  /**
   * Stop typing indicator
   */
  stopTyping(conversationId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit("message:stop_typing", { conversationId });
  }

  /**
   * Join a conversation room
   */
  joinConversation(conversationId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit("conversation:join", { conversationId });
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit("conversation:leave", { conversationId });
  }

  /**
   * Update presence status
   */
  updatePresence(status: "online" | "away" | "busy"): void {
    if (!this.socket?.connected) return;

    this.socket.emit("presence:update", { status });
  }

  /**
   * Reconnect with new auth token
   */
  async reconnectWithToken(): Promise<void> {
    this.disconnect();
    await this.connect();
  }
}

// Export singleton instance
export const socketService = new SocketService();

// Hook for React components
export function useSocket() {
  return socketService;
}
