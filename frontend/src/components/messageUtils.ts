// messageUtils.ts

// Genera un ID único para los mensajes
export const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };
  
  // Modifica un mensaje para añadirle un ID si no tiene uno
  export const ensureMessageId = (message: any): any => {
    if (!message.id) {
      return {
        ...message,
        id: generateMessageId()
      };
    }
    return message;
  };
  
  // Añade IDs a todos los mensajes en un array si no tienen uno
  export const addIdsToMessages = (messages: any[]): any[] => {
    return messages.map(msg => ensureMessageId(msg));
  };