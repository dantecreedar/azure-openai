// src/pages/Home.tsx
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import Chat from "../src/components/Chat";

const Home: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [notes, setNotes] = useState<string[]>([]);

  const handleAddNote = (note: string) => {
    if (note.trim() !== "") {
      setNotes((prev) => [...prev, note]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Sección de contenido */}
      <section className="flex-1 bg-[#F1F3F4]p-8 flex flex-col items-center">
        {/* Grid de Notas/Consultas */}
        {/* Código para el grid de consultas aquí */}

        {/* Notas Fijadas */}
        {notes.length > 0 && (
          <div className="w-full max-w-3xl mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
              Notas Guardadas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note, index) => (
                <div
                  key={index}
                  className="p-4 bg-white shadow-md rounded-md border border-white"
                >
                  <p className="text-gray-700">{note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat (Ocupará toda la altura disponible) */}
        <div className="w-full h-full max-w-2xl bg-transparent rounded-md p-6">
          <Chat onAddNote={handleAddNote} />
        </div>
      </section>
    </div>
  );
};

export default Home;
