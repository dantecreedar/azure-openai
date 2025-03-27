import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaPlus } from "react-icons/fa";
import { CgMenuGridO } from "react-icons/cg";
import { BiArrowBack, BiSearch } from "react-icons/bi";
import {
  BsKanban,
  BsChatDots,
  BsGear,
  BsArchive,
  BsPinAngle,
  BsTrash,
  BsPalette,
  BsTranslate,
  BsBell,
  BsShieldCheck,
  BsCloudUpload,
  BsX,
} from "react-icons/bs";
import React, { useState, useEffect, useRef } from "react";
// Añadir esta importación
import Joyride, { CallBackProps, STATUS } from "react-joyride";
// Resto de las importaciones...

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatSession = {
  id: number;
  messages: Message[];
  name: string;
  lastUpdated: Date;
};

const STORAGE_KEY = "chat_sessions";
const CURRENT_CHAT_KEY = "current_chat";

const Chat: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatSession>({
    id: Date.now(),
    messages: [],
    name: "",
    lastUpdated: new Date(),
  });
  const [runTour, setRunTour] = useState<boolean>(false);
  const [tourSteps, setTourSteps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isChatStarted, setIsChatStarted] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<"chats" | "config">(
    "chats"
  );
  const [showSavedNotification, setShowSavedNotification] =
    useState<boolean>(false);
  const [showAllChats, setShowAllChats] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chats from localStorage on component mount
  useEffect(() => {
    const savedChats = localStorage.getItem(STORAGE_KEY);
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        // Convert string dates back to Date objects
        const formattedChats = parsedChats.map((chat: any) => ({
          ...chat,
          lastUpdated: new Date(chat.lastUpdated),
        }));
        setChats(formattedChats);
      } catch (e) {
        console.error("Error loading chats from localStorage:", e);
      }
    }

    // Load current chat if it exists
    const savedCurrentChat = localStorage.getItem(CURRENT_CHAT_KEY);
    if (savedCurrentChat) {
      try {
        const parsedCurrentChat = JSON.parse(savedCurrentChat);
        setCurrentChat({
          ...parsedCurrentChat,
          lastUpdated: new Date(parsedCurrentChat.lastUpdated),
        });
        if (
          parsedCurrentChat.messages &&
          parsedCurrentChat.messages.length > 0
        ) {
          setIsChatStarted(true);
        }
      } catch (e) {
        console.error("Error loading current chat from localStorage:", e);
      }
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    }
  }, [chats]);

  // Save current chat to localStorage whenever it changes
  useEffect(() => {
    if (currentChat && currentChat.messages.length > 0) {
      localStorage.setItem(CURRENT_CHAT_KEY, JSON.stringify(currentChat));
    }
  }, [currentChat]);

  // Enhanced auto-save mechanism - periodically save current chat
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (currentChat.messages.length > 0) {
        // Only save if there are messages to save
        saveCurrentChat(false); // Don't show notification for auto-save
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [currentChat, chats]);

  // Añade esto después de los useEffects existentes
  useEffect(() => {
    // Define los pasos del tutorial
    setTourSteps([
      {
        target: ".menu-button",
        content:
          "Haz clic aquí para abrir el menú principal y acceder a todas las funciones.",
        disableBeacon: true,
      },
      {
        target: ".new-chat-button",
        content: "Crea una nueva conversación en cualquier momento.",
      },
      {
        target: ".input-field",
        content: "Escribe tus mensajes aquí y presiona Enter para enviar.",
      },
      {
        target: ".save-button",
        content:
          'Puedes guardar la conversación en cualquier momento con este botón o escribiendo "".',
      },
      {
        target: ".send-button",
        content: "Envía tu mensaje con este botón o presionando Enter.",
      },
    ]);
  }, []);

  // Añade esta función dentro del componente
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
    }
  };

  // Function to save current chat
  const saveCurrentChat = (showNotification = true) => {
    if (currentChat.messages.length === 0) return;

    // Make sure the chat has a name
    let chatToSave = { ...currentChat };
    if (!chatToSave.name.trim()) {
      // Use first message content as name if none exists
      const firstUserMessage = chatToSave.messages.find(
        (msg) => msg.role === "user"
      );
      if (firstUserMessage) {
        const content = firstUserMessage.content;
        chatToSave.name =
          content.length > 30 ? content.substring(0, 30) + "..." : content;
      } else {
        chatToSave.name = "Untitled Chat";
      }
    }

    // Update the lastUpdated timestamp
    chatToSave.lastUpdated = new Date();

    // Check if the chat already exists in the chats array
    const chatIndex = chats.findIndex((chat) => chat.id === currentChat.id);

    let updatedChats;
    if (chatIndex >= 0) {
      // Update existing chat
      updatedChats = [...chats];
      updatedChats[chatIndex] = chatToSave;
    } else {
      // Add new chat
      updatedChats = [chatToSave, ...chats];
    }

    // Update state
    setChats(updatedChats);
    setCurrentChat(chatToSave);

    // Also save to localStorage directly for extra protection
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChats));
    localStorage.setItem(CURRENT_CHAT_KEY, JSON.stringify(chatToSave));

    // Show saved notification if requested
    if (showNotification) {
      setShowSavedNotification(true);
      setTimeout(() => setShowSavedNotification(false), 2000);
    }
  };

  // Delete a chat
  const deleteChat = (id: number) => {
    const updatedChats = chats.filter((chat) => chat.id !== id);
    setChats(updatedChats);

    // If the current chat is being deleted, reset to a new chat
    if (currentChat.id === id) {
      const newChat = {
        id: Date.now(),
        messages: [],
        name: "",
        lastUpdated: new Date(),
      };
      setCurrentChat(newChat);
      setIsChatStarted(false);

      // Clear current chat from localStorage
      localStorage.removeItem(CURRENT_CHAT_KEY);
    }

    // Update localStorage directly to ensure persistence
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChats));

    setShowDeleteConfirm(null);
  };

  // Auto-save when user types '""'
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Check if the input ends with ""
    if (value.endsWith('""')) {
      saveCurrentChat();
      setInput(value.slice(0, -2)); // Remove the "" from the input
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = { role: "user", content: input };
    const updatedChat = {
      ...currentChat,
      messages: [...currentChat.messages, newMessage],
      lastUpdated: new Date(),
    };

    // If this is the first message, use it as the chat name
    if (!isChatStarted) {
      updatedChat.name =
        newMessage.content.length > 30
          ? newMessage.content.substring(0, 30) + "..."
          : newMessage.content;
      setIsChatStarted(true);
    }

    setCurrentChat(updatedChat);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedChat.messages }),
      });
      if (!response.ok) throw new Error("Failed to send message.");
      const botMessage = await response.json();
      const finalUpdatedChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, botMessage],
        lastUpdated: new Date(),
      };
      setCurrentChat(finalUpdatedChat);

      // Auto-save chat after receiving response
      const chatIndex = chats.findIndex((chat) => chat.id === currentChat.id);
      if (chatIndex >= 0) {
        const newChats = [...chats];
        newChats[chatIndex] = finalUpdatedChat;
        setChats(newChats);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newChats));
      } else if (isChatStarted) {
        const newChats = [finalUpdatedChat, ...chats];
        setChats(newChats);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newChats));
      }

      // Save current chat to localStorage
      localStorage.setItem(CURRENT_CHAT_KEY, JSON.stringify(finalUpdatedChat));
    } catch {
      setError("Failed to send message. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Start a new chat
  const startNewChat = () => {
    // Save current chat if it has messages
    if (currentChat.messages.length > 0) {
      saveCurrentChat(false); // Don't show notification for auto-save
    }

    // Create new chat
    const newChat = {
      id: Date.now(),
      messages: [],
      name: "",
      lastUpdated: new Date(),
    };
    setCurrentChat(newChat);
    setIsChatStarted(false);

    // Update localStorage
    localStorage.setItem(CURRENT_CHAT_KEY, JSON.stringify(newChat));

    // Close sidebar if open
    setIsSidebarOpen(false);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat.messages]);

  // Toggle view of all chats
  const toggleAllChats = () => {
    // Save current chat before switching view
    if (currentChat.messages.length > 0) {
      saveCurrentChat(false); // Don't show notification
    }
    setShowAllChats(!showAllChats);
  };

  return (
    <>
     <Joyride
      steps={tourSteps}
      run={runTour}
      continuous={true}
      showSkipButton={true}
      showProgress={true}
      styles={{
        options: {
          primaryColor: '#3B82F6',
          zIndex: 10000,
        },
      }}
      callback={handleJoyrideCallback}
    />
    <div className="flex bg-[#F1F3F4] overflow-hidden h-screen">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-white shadow-xl transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 flex`}
      >
        {/* Left narrow sidebar with icons */}
        <div className="w-16 bg-white border-r border-gray-100 flex flex-col items-center py-4">
          <div className="mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12Z"></path>
                <path
                  d="M5 12H3M21 12H19M12 5V3M12 21V19"
                  strokeLinecap="round"
                ></path>
              </svg>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-6 flex-1">
            <button
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                activeSection === "chats"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setActiveSection("chats")}
            >
              <BsChatDots size={20} />
            </button>

            <button
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                activeSection === "config"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setActiveSection("config")}
            >
              <BsGear size={20} />
            </button>
          </div>

          <div className="mt-auto mb-4">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Right expanded sidebar with menu items */}
        <div className="w-64 bg-white py-4 px-4 flex flex-col h-full">
          <div className="mb-4 flex items-center gap-2">
            <button
              className="text-gray-600 hover:text-blue-500 transition-all"
              onClick={() => setIsSidebarOpen(false)}
            >
              <BiArrowBack size={18} />
            </button>
            <span className="text-sm text-gray-600">
              {activeSection === "chats" ? "Chat Management" : "Configuration"}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-2 text-center">
              CHAT ASSISTANT
            </h2>
          </div>

          {activeSection === "chats" ? (
            <div className="space-y-1 flex-1 overflow-y-auto">
              <button
                onClick={startNewChat}
                className="w-full py-3 px-4 flex items-center gap-3 bg-blue-600 text-white rounded-xl new-chat-button"
              >
                <FaPlus size={16} />
                New Chat
              </button>

              <button
                className="w-full py-3 px-4 flex items-center justify-between text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                onClick={toggleAllChats}
              >
                <div className="flex items-center gap-3">
                  <BsKanban size={18} />
                  Recent Chats
                </div>
                <span className="text-blue-600 text-sm">({chats.length})</span>
              </button>

              <button className="w-full py-3 px-4 flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                <BsPinAngle size={18} />
                Pinned Chats
              </button>

              <button className="w-full py-3 px-4 flex items-center justify-between text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <BsArchive size={18} />
                  Archived
                </div>
                <span className="text-blue-600 text-sm">(4)</span>
              </button>

              <button
                className="w-full py-3 px-4 flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                onClick={() => {
                  setIsSidebarOpen(false);
                  setRunTour(true);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Tutorial
              </button>

              <button className="w-full py-3 px-4 flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                <BsTrash size={18} />
                Trash
              </button>

              {chats.length > 0 && (
                <>
                  <div className="py-4 border-b border-gray-200"></div>
                  <div className="py-2">
                    <h3 className="text-xs uppercase text-gray-500 font-semibold px-4 py-2">
                      Recent Conversations
                    </h3>
                    <div className="max-h-60 overflow-y-auto">
                      {chats.map((chat) => (
                        <div key={chat.id} className="relative group">
                          <button
                            className="w-full py-2 px-4 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                            onClick={() => {
                              // Save current chat before switching
                              if (currentChat.messages.length > 0) {
                                saveCurrentChat(false); // Don't show notification
                              }
                              setCurrentChat(chat);
                              setIsChatStarted(true);
                              setIsSidebarOpen(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium truncate">
                                {chat.name || "Untitled Chat"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  chat.lastUpdated
                                ).toLocaleDateString()}{" "}
                                {new Date(chat.lastUpdated).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                              </span>
                            </div>
                          </button>
                          <button
                            className="absolute right-2 top-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(chat.id);
                            }}
                          >
                            <BsTrash size={16} />
                          </button>

                          {showDeleteConfirm === chat.id && (
                            <div className="absolute right-0 top-0 bg-white p-2 rounded-lg shadow-lg z-10 text-sm">
                              <p>¿Eliminar este chat?</p>
                              <div className="flex mt-2 gap-2 justify-end">
                                <button
                                  className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteConfirm(null);
                                  }}
                                >
                                  No
                                </button>
                                <button
                                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteChat(chat.id);
                                  }}
                                >
                                  Sí
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1 flex-1">
              <button className="w-full py-3 px-4 flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                <BsPalette size={18} />
                Appearance
              </button>

              <button className="w-full py-3 px-4 flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                <BsTranslate size={18} />
                Language
              </button>

              <button className="w-full py-3 px-4 flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                <BsBell size={18} />
                Notifications
              </button>

              <button className="w-full py-3 px-4 flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                <BsShieldCheck size={18} />
                Privacy & Security
              </button>

              <button className="w-full py-3 px-4 flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                <BsCloudUpload size={18} />
                Data & Sync
              </button>

              <div className="py-4 border-b border-gray-200"></div>

              <button className="w-full py-3 px-4 flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </button>
            </div>
          )}

          <div className="mt-4 relative">
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
              <div className="pl-3 pr-2 text-gray-500">
                <BiSearch size={18} />
              </div>
              <input
                type="text"
                placeholder="Search"
                className="py-2 px-2 w-full focus:outline-none text-sm"
              />
              <button className="px-3 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-full">
        {/* Menu button */}
        <button
          className="fixed top-5 left-5 text-gray-800 hover:bg-gray-300 p-3 rounded-full transition-all z-10 menu-button"
          onClick={() => setIsSidebarOpen(true)}
        >
          <CgMenuGridO size={30} />
        </button>

        {/* Saved notification */}
        {showSavedNotification && (
          <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out">
            ¡Chat guardado correctamente!
          </div>
        )}

        {/* Show all chats in a grid view */}
        {showAllChats ? (
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                Chats Recientes
              </h2>
              <button
                onClick={toggleAllChats}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                Volver al chat
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chats.length > 0 ? (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer relative group"
                  >
                    <div
                      onClick={() => {
                        // Save current chat before switching
                        if (
                          currentChat.messages.length > 0 &&
                          currentChat.id !== chat.id
                        ) {
                          saveCurrentChat(false);
                        }
                        setCurrentChat(chat);
                        setIsChatStarted(true);
                        setShowAllChats(false);
                      }}
                      className="h-full"
                    >
                      <h3 className="font-medium mb-2 truncate">
                        {chat.name || "Untitled Chat"}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {chat.messages[chat.messages.length - 1]?.content ||
                          "No messages"}
                      </p>
                      <div className="text-xs text-gray-400">
                        {new Date(chat.lastUpdated).toLocaleDateString()}{" "}
                        {new Date(chat.lastUpdated).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <button
                      className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(chat.id);
                      }}
                    >
                      <BsTrash size={16} />
                    </button>

                    {showDeleteConfirm === chat.id && (
                      <div className="absolute right-2 top-2 bg-white p-2 rounded-lg shadow-lg z-10 text-sm">
                        <p>¿Eliminar este chat?</p>
                        <div className="flex mt-2 gap-2 justify-end">
                          <button
                            className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(null);
                            }}
                          >
                            No
                          </button>
                          <button
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(chat.id);
                            }}
                          >
                            Sí
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-gray-500">
                  No hay chats guardados. Comienza una conversación y escribe ""
                  para guardar automáticamente.
                </div>
              )}
            </div>
          </div>
        ) : !isChatStarted ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <h1 className="text-4xl text-gray-800 font-bold font-poppins mb-4">
              ¿En qué te puedo ayudar hoy?
            </h1>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              disabled={isLoading}
              className="p-3 rounded-full bg-white border-2 w-100 border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 input-field "
              placeholder="Escribe tu mensaje..."
            />
            <p className="mt-4 text-sm text-gray-500">
              Escribe "" (dos comillas) en cualquier momento para guardar
              automáticamente la conversación.
            </p>
          </div>
        ) : (
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="h-full flex flex-col">
              {currentChat.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 my-1 rounded-4xl max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white ml-auto"
                      : "bg-gray-200 text-gray-800 mr-auto"
                  }`}
                >
                  <span>{msg.content}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {isChatStarted && !showAllChats && (
          <div className="w-full fixed bottom-10 bg-white p-3 rounded-full shadow-lg max-w-[530px] mx-auto flex items-center space-x-4">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              disabled={isLoading}
              className="flex-1 p-3 rounded-full bg-gray-100 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 input-field"
              placeholder="Escribe tu mensaje... (usa \  para guardar)"
            />
            <button
              onClick={() => {
                saveCurrentChat();
              }}
              className="bg-gray-500 text-white w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-600 transition-all save-button"
              title="Guardar chat"
            >
              <BsCloudUpload size={20} />
            </button>
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className="bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-full hover:bg-blue-600 transition-all send-button"
            >
              <FaPaperPlane size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Chat;
