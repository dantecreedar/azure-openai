// src/pages/ChatAgent1.tsx
import React, { useState } from "react";
import Chat from "../components/Chat";

const ChatAgent1: React.FC = () => {
  const [notes, setNotes] = useState<string[]>([]);

  const handleAddNote = (note: string) => {
    setNotes((prevNotes) => [...prevNotes, note]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh">
      {/* Contenedor del chat */}
      <div className="w-full bg-white rounded-lg p-6 flex flex-col h-[50vh]">
        <h2 className="text-xl font-bold mb-4 text-center">
          Chat Agente 1 (Ventas)
        </h2>
        <Chat onAddNote={handleAddNote} />
      </div>

      {/* Mostramos las notas guardadas, si lo deseas */}
      {notes.length > 0 && (
        <div className="w-full max-w-xl mt-6 bg-white shadow-md rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Notas guardadas:</h3>
          <ul className="list-disc list-inside">
            {notes.map((note, index) => (
              <li key={index} className="text-gray-700">
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChatAgent1;
