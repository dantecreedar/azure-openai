// server.js
const express = require("express");
const { AzureOpenAI } = require("openai");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(cors());

const apiVersion = "2024-04-01-preview";

const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  apiVersion: apiVersion,
});

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    // Validar que se hayan proporcionado mensajes
    if (!messages || !Array.isArray(messages)) {
      return res
        .status(400)
        .json({ error: "Debes proporcionar un arreglo de mensajes." });
    }

    // Validar que los mensajes tengan el formato correcto
    const isValidMessage = messages.every(
      (msg) =>
        msg.role &&
        msg.content &&
        ["system", "user", "assistant"].includes(msg.role)
    );

    if (!isValidMessage) {
      return res.status(400).json({
        error: "Los mensajes deben tener un rol y contenido válidos.",
      });
    }

    // Enviar la solicitud a Azure OpenAI
    const result = await client.chat.completions.create({
      messages: messages,
      model: process.env.AZURE_DEPLOYMENT_NAME,
    });

    // Devolver la respuesta del asistente
    res.json(result.choices[0].message);
  } catch (error) {
    console.error("Error en el servidor:", error);

    // Manejo de errores específicos
    if (error.response) {
      // Errores de la API de Azure OpenAI
      const status = error.response.status;
      const errorMessage =
        error.response.data.error?.message || "Error desconocido de la API.";

      switch (status) {
        case 400:
          return res
            .status(400)
            .json({ error: "Solicitud incorrecta: " + errorMessage });
        case 401:
          return res
            .status(401)
            .json({ error: "No autorizado: Verifica tu clave de API." });
        case 403:
          return res.status(403).json({
            error:
              "Acceso denegado: No tienes permisos para acceder al recurso.",
          });
        case 404:
          return res.status(404).json({
            error: "Recurso no encontrado: Verifica el endpoint y el modelo.",
          });
        case 429:
          return res.status(429).json({
            error: "Demasiadas solicitudes: Inténtalo de nuevo más tarde.",
          });
        case 500:
          return res.status(500).json({
            error: "Error interno del servidor: Inténtalo de nuevo más tarde.",
          });
        default:
          return res
            .status(500)
            .json({ error: "Error en la API: " + errorMessage });
      }
    } else if (error.request) {
      // Errores de red o tiempo de espera
      return res.status(500).json({
        error:
          "No se pudo conectar con la API. Verifica tu conexión a internet.",
      });
    } else {
      // Otros errores
      return res
        .status(500)
        .json({ error: "Error interno del servidor: " + error.message });
    }
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend ejecutándose en http://localhost:${PORT}`);
});
