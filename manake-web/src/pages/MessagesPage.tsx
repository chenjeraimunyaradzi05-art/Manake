import { useCallback, useEffect, useState } from "react";
import { Plus, MessageSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { conversationService, Conversation } from "../services/conversationService";
import { ChatWindow } from "../components/chat/ChatWindow";
import { VideoCallModal } from "../components/chat/VideoCallModal";
import { GroupCreateForm } from "../components/chat/GroupCreateForm";

export const MessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    if (!user.isLoggedIn) return;
    try {
      const result = await conversationService.getConversations();
      // Adjust based on actual API response structure (e.g. result.conversations or result directly)
      setConversations((result as any).conversations || result || []);
    } catch (e) {
      console.error("Failed to load conversations", e);
    } finally {
      setLoading(false);
    }
  }, [user.isLoggedIn]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const handleGroupCreated = () => {
    setShowGroupModal(false);
    loadConversations();
  };

  if (!user.isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Log In</h2>
          <p className="text-gray-600">You need to be logged in to access messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 flex overflow-hidden">
      <VideoCallModal onClose={() => {}} />

      {/* Sidebar */}
      <div className={`w-full md:w-80 bg-white border-r border-gray-200 flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
             <h2 className="text-xl font-bold text-gray-800">Messages</h2>
             <button 
               onClick={() => setShowGroupModal(true)}
               className="p-2 hover:bg-gray-100 rounded-full text-primary-600 transition-colors"
               title="New Group"
             >
                <Plus size={20} />
             </button>
        </div>

        <div className="flex-1 overflow-y-auto">
            {loading ? (
                <div className="p-4 text-center text-gray-400">Loading chats...</div>
            ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                    <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No conversations yet.</p>
                </div>
            ) : (
                conversations.map(conv => {
                    // Safety check for participants
                    const safeParticipants = conv.participants || [];
                    const otherPart = conv.type === 'direct' 
                       ? safeParticipants.find(p => p.email !== user.email)
                       : null;
                    const name = conv.type === 'group' ? conv.name : otherPart?.name || 'User';
                    
                    return (
                        <div 
                           key={conv._id}
                           onClick={() => setActiveConversation(conv)}
                           className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                               activeConversation?._id === conv._id ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                           }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                                    ${conv.type === 'group' ? 'bg-primary-500' : 'bg-green-500'}`}>
                                    {name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-800 truncate">{name}</h4>
                                    <p className="text-xs text-gray-500 truncate">
                                        {conv.lastMessage?.content || 'No messages'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex-col relative w-full ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
         {activeConversation && (
            <button 
              onClick={() => setActiveConversation(null)}
              className="md:hidden absolute top-4 left-4 z-10 p-2 bg-gray-200 rounded-full opacity-50 hover:opacity-100"
            >
              ← Back
            </button>
         )}
         <ChatWindow activeConversation={activeConversation} />
         
         {/* Group Modal Overlay */}
         {showGroupModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <GroupCreateForm 
                    onSuccess={handleGroupCreated}
                    onCancel={() => setShowGroupModal(false)}
                />
            </div>
         )}
      </div>
    </div>
  );
};
