import React, { useState, useEffect } from "react";

// Definir tipos para los mensajes
type Message = {
  role: "user" | "assistant";
  content: string;
};

const Chat: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores
  const [isConnected, setIsConnected] = useState<boolean>(false); // Estado para verificar la conexión

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
        setIsConnected(true); // La conexión fue exitosa
        setError(null); // Limpiar errores anteriores
      } else {
        throw new Error("Failed to connect to the API.");
      }
    } catch (error) {
      console.error("Connection test failed:", error);
      setIsConnected(false); // La conexión falló
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
    setError(null); // Limpiar errores anteriores

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

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index} className={msg.role}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        disabled={isLoading || !isConnected} // Deshabilitar si no hay conexión
      />
      <button onClick={sendMessage} disabled={isLoading || !isConnected}>
        {isLoading ? "Sending..." : "Send"}
      </button>
      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
      {!isConnected && (
        <div style={{ color: "orange", marginTop: "10px" }}>
          Connecting to the API... Please wait.
        </div>
      )}
    </div>
  );
};

export default Chat;
