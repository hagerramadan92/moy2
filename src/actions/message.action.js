// "use server"
// import { pusherServer } from "@/lib/pusher";

// export const SendMessage = async (message, chatId = null) => {
//   if (!message) {
//     console.error("Message is undefined");
//     return;
//   }
  
//   try {
//     // Trigger Pusher event for real-time update
//     pusherServer.trigger("chat-app", "new-upcoming-message", {
//       ...message,
//       chatId: chatId || message.chatId
//     });
    
//     return { success: true, chatId: chatId || message.chatId };
//   } catch(error) {
//     console.error("Error sending message:", error);
//     return { success: false, error: error.message };
//   }
// }

"use server"
import { pusherServer } from "@/lib/pusher";

export const SendMessage = async (message) => {
  if (!message) {
    console.error("Message is undefined");
    return;
  }
  
  try {
    await pusherServer.trigger("chat-app", "new-upcoming-message", message);
    return { success: true };
  } catch(error) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message };
  }
}