import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { conversationService, Message, Conversation } from '../../services/conversationService';
import { useAuth } from '../../context/AuthContext';
import { Send, Image as ImageIcon, Paperclip, Phone, Video, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

interface ChatWindowProps {
  activeConversation: Conversation | null;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ activeConversation }) => {
  const { user } = useAuth();
  const { socket, callUser } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation._id);
      socket?.emit('join_conversation', activeConversation._id);
    }
  }, [activeConversation?._id, socket]);

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (message: Message) => {
        if (activeConversation && message.conversationId === activeConversation._id) {
            setMessages((prev) => [...prev, message]);
            scrollToBottom();
        }
      });
    }
    return () => {
      socket?.off('receive_message');
    };
  }, [socket, activeConversation]);

  const loadMessages = async (id: string) => {
    setLoading(true);
    try {
        const data = await conversationService.getMessages(id);
        // data.messages presumably
        setMessages((data as any).messages || data); 
        setTimeout(scrollToBottom, 100);
    } catch (err) {
        console.error("Failed to load messages", err);
    } finally {
        setLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;

    const messagePayload = {
        conversationId: activeConversation._id,
        sender: (user as any).id || user.email, // Best effort ID
        text: newMessage,
        type: 'text'
    };

    // Emit to socket
    socket?.emit('send_message', messagePayload);

    // Optimistically add (or wait for ack? simple-peer/socket.io usually just broadcasts)
    // We'll rely on the 'receive_message' event (even for self) or manually append if the server doesn't echo back to sender.
    // Usually standard pattern: Server broadcasts to room (including sender).
    
    setNewMessage('');
  };

  const handleVideoCall = () => {
    if (!activeConversation || activeConversation.type !== 'direct') return;
    // Find the other participant
    // Assuming currentUser is recognizable in participants
    // For now, simplify: direct chat has 2 participants. Pick the one that is NOT me.
    
    const recipient = activeConversation.participants.find(p => p.email !== user.email);
    if (recipient) {
        callUser(recipient._id);
    }
  };

  if (!activeConversation) {
      return (
          <div className="flex-1 flex items-center justify-center bg-gray-50 h-full">
              <p className="text-gray-500">Select a conversation to start messaging</p>
          </div>
      );
  }

  const otherParticipant = activeConversation.type === 'direct' 
     ? activeConversation.participants.find(p => p.email !== user.email)
     : null;
     
  const chatName = activeConversation.type === 'group' 
     ? activeConversation.name || 'Group Chat'
     : otherParticipant?.name || 'User';

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
               ${activeConversation.type === 'group' ? 'bg-primary-600' : 'bg-green-600'}`}>
                {chatName.charAt(0).toUpperCase()}
            </div>
            <div>
                <h3 className="font-semibold text-gray-800">{chatName}</h3>
                {activeConversation.type === 'group' && (
                    <p className="text-xs text-gray-500">{activeConversation.participants.length} participants</p>
                )}
            </div>
        </div>

        <div className="flex items-center gap-2">
            {activeConversation.type === 'direct' && (
                <>
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Audio Call">
                        <Phone size={20} />
                    </button>
                    <button 
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-600" 
                        title="Video Call"
                        onClick={handleVideoCall}
                    >
                        <Video size={20} />
                    </button>
                </>
            )}
            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                <MoreVertical size={20} />
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
            <div className="text-center text-gray-500 mt-10">Loading messages...</div>
        ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">No messages yet. Say hello!</div>
        ) : (
            messages.map((msg, idx) => {
                const isMe = msg.sender._id === (user as any).id || msg.sender._id === user.email;
                // Check if user object availability in message sender might vary (populated vs ID)
                // For now assume populated as API returns.
                return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            isMe 
                            ? 'bg-primary-600 text-white rounded-br-none' 
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                        }`}>
                            {activeConversation.type === 'group' && !isMe && (
                                <p className="text-xs font-bold mb-1 text-primary-600">{msg.sender.name}</p>
                            )}
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                                {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : ''}
                            </p>
                        </div>
                    </div>
                );
            })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center">
        <button type="button" className="text-gray-400 hover:text-gray-600 p-2">
            <Paperclip size={20} />
        </button>
        <button type="button" className="text-gray-400 hover:text-gray-600 p-2">
            <ImageIcon size={20} />
        </button>
        <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
        />
        <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            <Send size={20} />
        </button>
      </form>
    </div>
  );
};
