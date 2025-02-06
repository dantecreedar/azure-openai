// src/components/Chat.tsx
import React, { useState, useEffect } from "react";

// Definir tipos para los mensajes
type Message = {
  role: "user" | "assistant";
  content: string;
};

interface ChatProps {
  onAddNote: (note: string) => void;
}

const ChatAgent2: React.FC<ChatProps> = ({ onAddNote }) => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Función para verificar la conexión a la API
  const checkConnection = async () => {
    try {
      const response = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "system", content: "Test connection." }],
        }),
      });

      if (response.ok) {
        setIsConnected(true);
        setError(null);
      } else {
        throw new Error("Failed to connect to the API.");
      }
    } catch (error) {
      console.error("Connection test failed:", error);
      setIsConnected(false);
      setError(
        "Failed to connect to the API. Please check your configuration and try again."
      );
    }
  };

  // Verificar la conexión al cargar el componente
  useEffect(() => {
    checkConnection();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            ...messages,
            newMessage,
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message.");
      }

      const botMessage = await response.json();
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setError(
        "Failed to send message. Please check your configuration and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = () => {
    if (input.trim() !== "") {
      onAddNote(input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto mb-4 rounded-4xl p-5 bg-white">
        {messages.slice(-3).map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-1 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-100 text-blue-900 ml-auto"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            <strong>{msg.role === "user" ? "You" : "Assistant"}:</strong>{" "}
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input y Botones */}
      <div className="flex flex-col space-y-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          disabled={isLoading || !isConnected}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Escribe tu pregunta..."
        />
        <div className="flex justify-between">
          <button
            onClick={sendMessage}
            disabled={isLoading || !isConnected}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Enviando..." : "Enviar"}
          </button>
          <button
            onClick={handleAddNote}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Guardar como nota
          </button>
        </div>
      </div>

      {/* Mensajes de Error y Conexión */}
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      {!isConnected && (
        <div className="text-orange-500 text-sm mt-2">
          Conectando a la API... Por favor, espera.
        </div>
      )}
    </div>
  );
};

export default ChatAgent2;
