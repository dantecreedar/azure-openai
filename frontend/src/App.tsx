// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "../pages/Home"; // Si deseas tener una Home aparte
import Current from "../pages/Current"; // Otra ruta opcional

import "./App.css";
/* import Chat from "./components/Chat"; */
import ChatAgent1 from "./components/ChatAgent1";
import ChatAgent2 from "./components/ChatAgent2";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas que usan el layout común */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/current" element={<Current />} />
          {/* <Route path="/chat" element={<Chat />} /> */}
          <Route path="/chat/agent1" element={<ChatAgent1 />} />
          <Route path="/chat/agent2" element={<ChatAgent2 />} />
          {/*           <Route path="/chat/agent2" element={<ChatAgent2 />} /> */}
          {/*    <Route path="/chat/agent3" element={<ChatAgent3 />} />
          <Route path="/chat/agent4" element={<ChatAgent4 />} />
          <Route path="/chat/agent5" element={<ChatAgent5 />} />
          <Route path="/chat/agent6" element={<ChatAgent6 />} /> */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
