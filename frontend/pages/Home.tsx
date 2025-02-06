// src/pages/Home.tsx
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";

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
      {/* Encabezado Principal */}
      <header className="py-10 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center">
        <h1 className="text-4xl font-bold mb-2">
          Azure Chat App with TypeScript
        </h1>
        <p className="text-lg">Bienvenido a la página principal</p>
      </header>

      {/* Sección de contenido */}
      <section className="flex-1 bg-gray-50 p-8 flex flex-col items-center">
        {/* Grid de Notas/Consultas */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
            Seis Espacios de Consulta
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <FaPlus
                  size={20}
                  className="text-gray-500 transition-transform duration-300 hover:rotate-45"
                />
                {hoveredCard === index && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-2 w-48 bg-white shadow-lg rounded">
                    <p className="text-sm text-gray-700 text-center">
                      Haz una consulta
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

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
                  className="p-4 bg-white shadow-md rounded-md border border-gray-200"
                >
                  <p className="text-gray-700">{note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat (Opcional en Home) */}
        <div className="w-full max-w-2xl bg-white rounded-md shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">
            Chat Principal
          </h2>
          <Chat onAddNote={handleAddNote} />
        </div>
      </section>
    </div>
  );
};

export default Home;
