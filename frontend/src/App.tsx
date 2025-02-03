// src/App.tsx
import React from "react";
import Chat from "./components/Chat";

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Azure Chat App with TypeScript</h1>
      <Chat />
    </div>
  );
};

export default App;
