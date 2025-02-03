import { useState } from "react";
import axios from "axios";

const ChatAI = () => {
  const [mensaje, setMensaje] = useState("");
  const [respuesta, setRespuesta] = useState("");

  const handleEnviarMensaje = async () => {
    const endpoint =
      "https://chat-developer-architec-acceleration.openai.azure.com/";
    const headers = {
      "Content-Type": "application/json",
    };

    const cuerpo = {
      message: mensaje,
    };

    try {
      const respuesta = await axios.post(endpoint, cuerpo, { headers });
      setRespuesta(respuesta.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
      />
      <button onClick={handleEnviarMensaje}>Enviar mensaje</button>
      <p>Respuesta: {respuesta}</p>
    </div>
  );
};

export default ChatAI;
