import React, { useState, useEffect, useRef } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface ChatProps {
  onAddNote: (note: string) => void;
}

const Chat: React.FC<ChatProps> = ({ onAddNote }) => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue) {
      const cursorPosition = inputRef.current?.selectionStart || 0;
      const newText =
        input.slice(0, cursorPosition) +
        `@${selectedValue} ` +
        input.slice(cursorPosition);
      setInput(newText);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(
          cursorPosition + selectedValue.length + 2,
          cursorPosition + selectedValue.length + 2
        );
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4 rounded-4xl p-5 bg-gray-50 border border-gray-200">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-1 rounded-md max-w-[80%] ${
              msg.role === "user"
                ? "bg-blue-100 text-blue-900 ml-auto hover:bg-blue-200"
                : "bg-gray-100 text-gray-900 mr-auto hover:bg-gray-200"
            } transition-opacity duration-300 ease-in-out`}
          >
            <strong>{msg.role === "user" ? "Tú" : "Asistente"}:</strong>{" "}
            <span className="teletype">{msg.content}</span>
          </div>
        ))}
        {isLoading && (
          <div className="p-2 my-1 rounded-md max-w-[80%] bg-gray-100 text-gray-900 mr-auto flex items-center">
            <svg
              className="animate-spin h-5 w-5 mr-3 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            Asistente está escribiendo...
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          disabled={isLoading || !isConnected}
          ref={inputRef}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Escribe tu pregunta..."
        />
        <div className="flex justify-between">
          <button
            onClick={sendMessage}
            disabled={isLoading || !isConnected}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Enviando...
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Enviar
              </>
            )}
          </button>
          <select
            onChange={handleSelectChange}
            className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || !isConnected}
          >
            <option value="">Selecciona un tipo de consulta</option>
            <option value="Consulta de saldo">Consulta de saldo</option>
            <option value="Consulta de movimientos">
              Consulta de movimientos
            </option>
            <option value="Consulta de préstamos">Consulta de préstamos</option>
            <option value="Consulta de inversiones">
              Consulta de inversiones
            </option>
          </select>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      {!isConnected && (
        <div className="flex items-center text-orange-500 text-sm mt-2">
          <svg
            className="animate-spin h-5 w-5 mr-2 text-orange-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          Conectando a la API... Por favor, espera.
        </div>
      )}
    </div>
  );
};

export default Chat;
