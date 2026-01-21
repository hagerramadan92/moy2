"use client";
import React, { useState } from "react";
import { messageService } from "../../../Services/message.service";


const MessageInput = ({ chatId, onMessageSent }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!message.trim() || sending || !chatId) return;

    try {
      setSending(true);
      setError("");

      // إنشاء رسالة مؤقتة (Optimistic Update)
      const tempMessage = {
        id: `temp-${Date.now()}`,
        message: message.trim(),
        text: message.trim(),
        sender_id: 39, // افتراضيًا
        isCurrentUser: true,
        is_temp: true,
        time: new Date().toISOString(),
        created_at: new Date().toISOString(),
        sender: {
          id: 39,
          name: "أنت"
        }
      };

      // إضافة الرسالة المؤقتة
      if (onMessageSent) {
        onMessageSent(tempMessage);
      }

      // إرسال الرسالة إلى الخادم
      const response = await messageService.sendMessage(chatId, {
        text: message.trim()
      });

      console.log('API send response:', response);

      // استبدال الرسالة المؤقتة بالرسالة الحقيقية
      if (onMessageSent && response) {
        // بناء الرسالة الحقيقية من الرد
        const realMessage = {
          id: response.id || response.message_id || `real-${Date.now()}`,
          message: response.message || message.trim(),
          text: response.message || message.trim(),
          sender_id: 39,
          isCurrentUser: true,
          is_temp: false,
          time: response.created_at || new Date().toISOString(),
          created_at: response.created_at || new Date().toISOString(),
          is_read: false,
          read_at: null,
          sender: {
            id: 39,
            name: "أنت"
          }
        };
        
        onMessageSent(realMessage, true); // إشارة بأن هذه الرسالة الحقيقية
      }

      setMessage("");
    } catch (error) {
      console.error('Failed to send message:', error);
      setError("فشل إرسال الرسالة. حاول مرة أخرى.");
      
      // إزالة الرسالة المؤقتة في حالة الخطأ
      if (onMessageSent) {
        onMessageSent({ id: `temp-${Date.now()}`, is_temp: true }, false, true);
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-4">
      {error && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm text-center">{error}</p>
          <button
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700 text-xs mt-1"
          >
            إغلاق
          </button>
        </div>
      )}
      
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="اكتب رسالتك هنا..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={sending}
          dir="auto"
        />
        
        <button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center min-w-[100px] ${
            !message.trim() || sending
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {sending ? (
            <>
              <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              جاري الإرسال
            </>
          ) : "إرسال"}
        </button>
      </div>
      
      <div className="text-xs text-gray-500 mt-2 px-1 text-center">
        اضغط Enter للإرسال
      </div>
    </div>
  );
};

export default MessageInput;