// src/components/Layout.tsx
import React, { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaCogs,
  FaFolderOpen,
  FaLayerGroup,
  FaTimes,
  FaUserAlt,
  FaRobot,
  FaComment,
  FaBrain,
  FaGlobe,
  FaCode,
} from "react-icons/fa";

const Layout: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const navigate = useNavigate();

  // Arreglo de agentes: cada botón tiene una ruta, un icono y una etiqueta.
  const agents = [
    {
      id: 1,
      route: "/chat/agent1",
      icon: <FaUserAlt size={24} />,
      label: "Ventas",
    },
    {
      id: 2,
      route: "/chat/agent2",
      icon: <FaRobot size={24} />,
      label: "Soporte",
    },
    {
      id: 3,
      route: "/chat/agent3",
      icon: <FaComment size={24} />,
      label: "Consultas",
    },
    {
      id: 4,
      route: "/chat/agent4",
      icon: <FaBrain size={24} />,
      label: "Estrategia",
    },
    {
      id: 5,
      route: "/chat/agent5",
      icon: <FaGlobe size={24} />,
      label: "Internacional",
    },
    {
      id: 6,
      route: "/chat/agent6",
      icon: <FaCode size={24} />,
      label: "Desarrollo",
    },
  ];

  const handleAgentClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div
        className={`${
          isExpanded ? "w-64 items-end" : "w-16 items-center"
        } bg-gray-800 text-white transition-all duration-300 ease-in-out flex flex-col p-4`}
      >
        {/* Botón para expandir/contraer el sidebar */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mb-4 p-2 rounded hover:bg-gray-700"
        >
          {isExpanded ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        <ul className="mt-4 w-full">
          <li className="mb-2 p-2 flex items-center justify-end hover:bg-gray-700 rounded cursor-pointer">
            {isExpanded ? (
              <FaFolderOpen size={24} />
            ) : (
              <FaLayerGroup size={24} />
            )}
            {isExpanded && (
              <Link to="/" className="ml-4">
                Organizar
              </Link>
            )}
          </li>
          <li className="mb-2 p-2 flex items-center justify-end hover:bg-gray-700 rounded cursor-pointer">
            <FaCogs size={24} />
            {isExpanded && (
              <Link to="/current" className="ml-4">
                Automatizar
              </Link>
            )}
          </li>
        </ul>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col">
        {/* Encabezado */}
        <header className="p-8 bg-gray-100">
          <h1 className="text-3xl font-bold">Azure Chat App with TypeScript</h1>
        </header>

        {/* Grid de Agentes */}
        <section className="p-8 flex justify-center">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {agents.map((agent, index) => (
              <div
                key={agent.id}
                className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex flex-col items-center justify-center bg-transparent border border-gray-300 rounded-lg hover:bg-white transition-all duration-300 shadow-md cursor-pointer"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleAgentClick(agent.route)}
              >
                {agent.icon}
                {hoveredCard === index && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-2 w-48 bg-white shadow-lg rounded">
                    <p className="text-sm text-gray-700">{agent.label}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Área donde se renderizan los componentes de chat de cada agente */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
