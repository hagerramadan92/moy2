// components/Chat/ChatWindow.js
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Send, Clock, User, CheckCircle, Paperclip, Smile, ImageIcon, Mic } from "lucide-react";
import { motion } from "framer-motion";
import { messageService } from "../../../Services/message.service";

const ChatWindow = ({ chatId, userId, otherUser, onBack, onSendMessage }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      loadMessages();
    }
  }, [chatId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      if (chatId) {
        const msgs = await messageService.getMessages(chatId);
        setMessages(Array.isArray(msgs) ? msgs : []);
      }
    } catch (error) {
      console.error('خطأ في تحميل الرسائل:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      
      // رسالة مؤقتة
      const tempMessage = {
        id: `temp-${Date.now()}`,
        message: newMessage,
        sender_id: userId,
        isCurrentUser: true,
        is_temp: true,
        time: new Date().toISOString(),
        created_at: new Date().toISOString(),
        is_read: false,
        sender_name: 'أنت'
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");

      // إرسال الرسالة
      if (chatId) {
        const result = await onSendMessage(chatId, newMessage);
        if (result) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempMessage.id ? result : msg
            )
          );
        }
      }

    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) return 'الآن';
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#579BE8] border-t-transparent mx-auto"></div>
          <p className="text-gray-500 mt-4">جاري تحميل المحادثة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-4">
              <User size={40} className="text-blue-400" />
            </div>
            <h3 className="font-bold text-gray-700 mb-2">بداية المحادثة</h3>
            <p className="text-gray-500">ابدأ المحادثة مع {otherUser?.name || 'المستخدم'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.isCurrentUser
                      ? 'bg-gradient-to-r from-[#579BE8] to-[#124987] text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  } ${message.is_temp ? 'opacity-80' : ''}`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <span className={`text-xs ${message.isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                      {formatMessageTime(message.time)}
                    </span>
                    {message.isCurrentUser && (
                      message.is_read ? (
                        <CheckCircle size={12} className="text-green-300" />
                      ) : (
                        <CheckCircle size={12} className="text-blue-100 opacity-50" />
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-2">
          {/* Attachment Button */}
          <button className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <Paperclip size={20} className="text-gray-600" />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب رسالتك هنا..."
              className="w-full p-3 pr-12 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-[#579BE8] focus:ring-2 focus:ring-[#579BE8]/20"
              disabled={sending}
            />
            <button className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Smile size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              !newMessage.trim() || sending
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#579BE8] to-[#124987] text-white hover:shadow-lg'
            }`}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;