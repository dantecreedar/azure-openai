import React, { useState, useEffect } from "react";
import { 
  BsPinAngle, 
  BsArchive, 
  BsTrash, 
  BsPinFill, 
  BsArrowCounterclockwise 
} from "react-icons/bs";

type Message = {
  role: "user" | "assistant";
  content: string;
  id?: string;
  isPinned?: boolean;
  isDeleted?: boolean;
};

type ChatSession = {
  id: number;
  messages: Message[];
  name: string;
  lastUpdated: Date;
  isArchived?: boolean;
  pinnedMessages?: string[]; // Array of message IDs
  deletedMessages?: Message[]; // Store deleted messages
};

interface ChatManagementProps {
  currentChat: ChatSession;
  setCurrentChat: (chat: ChatSession) => void;
  chats: ChatSession[];
  setChats: (chats: ChatSession[]) => void;
  saveCurrentChat: (showNotification?: boolean) => void;
}

const LOCAL_STORAGE_DELETED = "deleted_messages";
const LOCAL_STORAGE_ARCHIVED = "archived_chats";
const LOCAL_STORAGE_PINNED = "pinned_messages";

const ChatManagement: React.FC<ChatManagementProps> = ({
  currentChat,
  setCurrentChat,
  chats,
  setChats,
  saveCurrentChat
}) => {
  const [showDeletedMessages, setShowDeletedMessages] = useState<boolean>(false);
  const [showArchivedChats, setShowArchivedChats] = useState<boolean>(false);
  const [archivedChats, setArchivedChats] = useState<ChatSession[]>([]);
  const [activeTab, setActiveTab] = useState<"pinned" | "archived" | "deleted">("pinned");
  
  // Load archived chats from localStorage on component mount
  useEffect(() => {
    const savedArchivedChats = localStorage.getItem(LOCAL_STORAGE_ARCHIVED);
    if (savedArchivedChats) {
      try {
        const parsedArchivedChats = JSON.parse(savedArchivedChats);
        // Convert string dates back to Date objects
        const formattedArchivedChats = parsedArchivedChats.map((chat: any) => ({
          ...chat,
          lastUpdated: new Date(chat.lastUpdated)
        }));
        setArchivedChats(formattedArchivedChats);
      } catch (e) {
        console.error("Error loading archived chats from localStorage:", e);
      }
    }
  }, []);

  // Save archived chats to localStorage whenever they change
  useEffect(() => {
    if (archivedChats.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_ARCHIVED, JSON.stringify(archivedChats));
    }
  }, [archivedChats]);

  // Archive a chat
  const archiveChat = (chatId: number) => {
    // Find the chat in the current chats
    const chatToArchive = chats.find(chat => chat.id === chatId);
    if (!chatToArchive) return;
    
    // Add isArchived flag
    const archivedChat = { ...chatToArchive, isArchived: true };
    
    // Remove from current chats
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    
    // Add to archived chats
    setArchivedChats(prev => [archivedChat, ...prev]);
    
    // If the current chat is being archived, reset to a new chat
    if (currentChat.id === chatId) {
      const newChat = { id: Date.now(), messages: [], name: "", lastUpdated: new Date() };
      setCurrentChat(newChat);
      
      // Update localStorage
      localStorage.setItem("chat_sessions", JSON.stringify(updatedChats));
    }
  };

  // Unarchive a chat
  const unarchiveChat = (chatId: number) => {
    // Find the chat in archived chats
    const chatToUnarchive = archivedChats.find(chat => chat.id === chatId);
    if (!chatToUnarchive) return;
    
    // Remove isArchived flag
    const { isArchived, ...unarchived } = chatToUnarchive;
    
    // Remove from archived chats
    const updatedArchivedChats = archivedChats.filter(chat => chat.id !== chatId);
    setArchivedChats(updatedArchivedChats);
    
    // Add to current chats
    setChats(prev => [unarchived, ...prev]);
    
    // Update localStorage
    localStorage.setItem(LOCAL_STORAGE_ARCHIVED, JSON.stringify(updatedArchivedChats));
    localStorage.setItem("chat_sessions", JSON.stringify([unarchived, ...chats]));
  };

  // Pin a message
  const pinMessage = (messageId: string) => {
    if (!currentChat) return;
    
    // Find the message in current chat
    const messageIndex = currentChat.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;
    
    // Update the message with isPinned flag
    const updatedMessages = [...currentChat.messages];
    updatedMessages[messageIndex] = { 
      ...updatedMessages[messageIndex], 
      isPinned: true 
    };
    
    // Update pinnedMessages array
    const pinnedMessages = currentChat.pinnedMessages || [];
    const updatedPinnedMessages = [...pinnedMessages, messageId];
    
    // Update current chat
    const updatedChat = {
      ...currentChat,
      messages: updatedMessages,
      pinnedMessages: updatedPinnedMessages
    };
    
    setCurrentChat(updatedChat);
    saveCurrentChat(false);
    
    // Also store in localStorage
    localStorage.setItem(LOCAL_STORAGE_PINNED, JSON.stringify(updatedPinnedMessages));
  };

  // Unpin a message
  const unpinMessage = (messageId: string) => {
    if (!currentChat || !currentChat.pinnedMessages) return;
    
    // Find the message in current chat
    const messageIndex = currentChat.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;
    
    // Update the message, removing isPinned flag
    const updatedMessages = [...currentChat.messages];
    updatedMessages[messageIndex] = { 
      ...updatedMessages[messageIndex], 
      isPinned: false 
    };
    
    // Update pinnedMessages array
    const updatedPinnedMessages = currentChat.pinnedMessages.filter(id => id !== messageId);
    
    // Update current chat
    const updatedChat = {
      ...currentChat,
      messages: updatedMessages,
      pinnedMessages: updatedPinnedMessages
    };
    
    setCurrentChat(updatedChat);
    saveCurrentChat(false);
    
    // Also update in localStorage
    localStorage.setItem(LOCAL_STORAGE_PINNED, JSON.stringify(updatedPinnedMessages));
  };

  // Delete a message (move to trash)
  const deleteMessage = (messageId: string) => {
    if (!currentChat) return;
    
    // Find the message in current chat
    const messageIndex = currentChat.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;
    
    // Get the message to delete
    const messageToDelete = { 
      ...currentChat.messages[messageIndex], 
      isDeleted: true 
    };
    
    // Remove message from current messages
    const updatedMessages = currentChat.messages.filter(msg => msg.id !== messageId);
    
    // Add to deletedMessages array
    const deletedMessages = currentChat.deletedMessages || [];
    const updatedDeletedMessages = [...deletedMessages, messageToDelete];
    
    // Update current chat
    const updatedChat = {
      ...currentChat,
      messages: updatedMessages,
      deletedMessages: updatedDeletedMessages
    };
    
    setCurrentChat(updatedChat);
    saveCurrentChat(false);
    
    // Also store in localStorage
    localStorage.setItem(LOCAL_STORAGE_DELETED, JSON.stringify(updatedDeletedMessages));
  };

  // Restore a deleted message
  const restoreMessage = (messageId: string) => {
    if (!currentChat || !currentChat.deletedMessages) return;
    
    // Find the message in deleted messages
    const messageToRestore = currentChat.deletedMessages.find(msg => msg.id === messageId);
    if (!messageToRestore) return;
    
    // Remove isDeleted flag
    const { isDeleted, ...restored } = messageToRestore;
    
    // Add message back to current messages
    const updatedMessages = [...currentChat.messages, restored];
    
    // Remove from deletedMessages array
    const updatedDeletedMessages = currentChat.deletedMessages.filter(msg => msg.id !== messageId);
    
    // Update current chat
    const updatedChat = {
      ...currentChat,
      messages: updatedMessages,
      deletedMessages: updatedDeletedMessages
    };
    
    setCurrentChat(updatedChat);
    saveCurrentChat(false);
    
    // Also update in localStorage
    localStorage.setItem(LOCAL_STORAGE_DELETED, JSON.stringify(updatedDeletedMessages));
  };

  // Get pinned messages from current chat
  const getPinnedMessages = () => {
    if (!currentChat || !currentChat.pinnedMessages || currentChat.pinnedMessages.length === 0) {
      return [];
    }
    
    return currentChat.messages.filter(msg => 
      msg.isPinned || (currentChat.pinnedMessages && currentChat.pinnedMessages.includes(msg.id || ''))
    );
  };

  // Render the UI for chat management
  return (
    <div className="w-full bg-white rounded-xl shadow-md overflow-hidden">
      {/* Tabs for navigation */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 ${
            activeTab === "pinned" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("pinned")}
        >
          <BsPinAngle size={18} />
          <span>Mensajes Fijados</span>
        </button>
        <button
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 ${
            activeTab === "archived" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("archived")}
        >
          <BsArchive size={18} />
          <span>Chats Archivados</span>
        </button>
        <button
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 ${
            activeTab === "deleted" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("deleted")}
        >
          <BsTrash size={18} />
          <span>Mensajes Borrados</span>
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="p-4">
        {activeTab === "pinned" && (
          <div>
            <h3 className="text-lg font-medium mb-4">Mensajes Fijados</h3>
            {currentChat && currentChat.pinnedMessages && currentChat.pinnedMessages.length > 0 ? (
              <div className="space-y-3">
                {getPinnedMessages().map((msg, index) => (
                  <div key={index} className="bg-gray-100 p-3 rounded-lg relative group">
                    <div className="absolute top-2 right-2">
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => unpinMessage(msg.id || "")}
                      >
                        <BsPinFill size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-800 pr-6">{msg.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {msg.role === "user" ? "Tú" : "Asistente"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">
                No hay mensajes fijados. Puedes fijar mensajes importantes para acceder rápidamente a ellos.
              </p>
            )}
          </div>
        )}

        {activeTab === "archived" && (
          <div>
            <h3 className="text-lg font-medium mb-4">Chats Archivados</h3>
            {archivedChats.length > 0 ? (
              <div className="space-y-3">
                {archivedChats.map((chat) => (
                  <div key={chat.id} className="bg-gray-100 p-3 rounded-lg relative group flex justify-between items-center">
                    <div>
                      <p className="font-medium">{chat.name || "Chat sin título"}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(chat.lastUpdated).toLocaleDateString()} {new Date(chat.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button
                      className="text-blue-500 hover:text-blue-700 p-2"
                      onClick={() => unarchiveChat(chat.id)}
                      title="Desarchivar chat"
                    >
                      <BsArrowCounterclockwise size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">
                No hay chats archivados. Archiva conversaciones para mantener tu lista principal ordenada.
              </p>
            )}
          </div>
        )}

        {activeTab === "deleted" && (
          <div>
            <h3 className="text-lg font-medium mb-4">Mensajes Borrados</h3>
            {currentChat && currentChat.deletedMessages && currentChat.deletedMessages.length > 0 ? (
              <div className="space-y-3">
                {currentChat.deletedMessages.map((msg, index) => (
                  <div key={index} className="bg-gray-100 p-3 rounded-lg relative group">
                    <div className="absolute top-2 right-2">
                      <button
                        className="text-green-500 hover:text-green-700"
                        onClick={() => restoreMessage(msg.id || "")}
                        title="Restaurar mensaje"
                      >
                        <BsArrowCounterclockwise size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-800 pr-6">{msg.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {msg.role === "user" ? "Tú" : "Asistente"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">
                No hay mensajes borrados. Los mensajes que elimines aparecerán aquí.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatManagement;