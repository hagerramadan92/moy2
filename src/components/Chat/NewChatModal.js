// components/Chat/NewChatModal.js
"use client";
import React, { useState } from "react";
import { X, User, Search, MessageCircle } from "lucide-react";
import { messageService } from "../../../Services/message.service";

const NewChatModal = ({ isOpen, onClose, currentUserId, onChatCreated }) => {
  const [userIdInput, setUserIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialMessage, setInitialMessage] = useState("");

  const startChat = async () => {
    if (!userIdInput.trim()) {
      setError("الرجاء إدخال معرف المستخدم");
      return;
    }

    const userId = parseInt(userIdInput);
    if (isNaN(userId) || userId <= 0) {
      setError("معرف المستخدم غير صالح");
      return;
    }

    try {
      setLoading(true);
      setError("");

     
      
      const result = await messageService.createChat(userId);
      
      if (result.success && result.chat) {
        let chatId = null;
        
        if (result.chat.id) {
          chatId = result.chat.id;
        } else if (result.chat.chat_id) {
          chatId = result.chat.chat_id;
        }
        
        if (chatId) {
          // إرسال رسالة أولية إذا كانت موجودة
          if (initialMessage.trim()) {
            await messageService.sendMessage(chatId, initialMessage);
          }
          
          
          
          if (onChatCreated) {
            onChatCreated(chatId);
          }
          
          onClose();
        } else {
          throw new Error('لم يتم إنشاء معرف الدردشة');
        }
      } else {
        throw new Error(result.error || 'فشل إنشاء الدردشة');
      }
      
    } catch (error) {
      console.error('خطأ في إنشاء الدردشة:', error);
      setError(error.message || "حدث خطأ أثناء إنشاء الدردشة");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      startChat();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#579BE8]/10 to-[#124987]/10 flex items-center justify-center">
              <MessageCircle size={24} className="text-[#579BE8]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">بدء محادثة جديدة</h2>
              <p className="text-sm text-gray-500">أدخل معرف المستخدم للبدء</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              معرف المستخدم
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="number"
                value={userIdInput}
                onChange={(e) => {
                  setUserIdInput(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder="أدخل معرف المستخدم..."
                className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-[#579BE8] focus:ring-2 focus:ring-[#579BE8]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الرسالة الأولى (اختياري)
            </label>
            <textarea
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="مرحباً، أود بدء محادثة..."
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-[#579BE8] focus:ring-2 focus:ring-[#579BE8]/20 resize-none"
              rows={3}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={startChat}
              disabled={loading || !userIdInput.trim()}
              className="flex-1 py-3 bg-gradient-to-r from-[#579BE8] to-[#124987] text-white rounded-xl font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "جاري الإنشاء..." : "بدء المحادثة"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;