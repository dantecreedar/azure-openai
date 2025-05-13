// src/components/Layout.tsx

import React from "react";
import { Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F3F4]">
      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-2xl">
        {/* Área donde se renderizan los componentes de chat de cada agente */}
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
