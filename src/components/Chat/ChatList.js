"use client";
import React, { useState, useEffect } from "react";
import { messageService } from "../../../Services/message.service";

const ChatList = ({ onSelectChat, selectedChatId }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      setError("");
      
    
      const response = await messageService.getChats();
    
      
      // تأكد من أن response هو مصفوفة
      if (Array.isArray(response)) {
        setChats(response);
        
        // تحديد أول دردشة تلقائيًا
        if (response.length > 0 && !selectedChatId) {
          onSelectChat(response[0]);
        }
      } else {
        console.error('Response is not an array:', response);
        setError("خطأ في تحميل الدردشات: التنسيق غير صحيح");
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
      setError("فشل تحميل الدردشات. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return date.toLocaleTimeString('ar-SA', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else if (diffDays === 1) {
        return 'أمس';
      } else if (diffDays < 7) {
        return date.toLocaleDateString('ar-SA', { weekday: 'short' });
      } else {
        return date.toLocaleDateString('ar-SA', {
          month: 'short',
          day: 'numeric'
        });
      }
    } catch {
      return '';
    }
  };

  const getChatName = (chat) => {
    // تحقق من المشاركين
    if (chat.participants && Array.isArray(chat.participants)) {
      // تصفية المستخدم الحالي (افتراضيًا ID: 39)
      const otherParticipants = chat.participants.filter(p => {
        // تحويل جميع IDs إلى string للمقارنة
        const currentUserId = "39";
        return String(p) !== currentUserId;
      });
      
      if (otherParticipants.length > 0) {
        const participant = otherParticipants[0];
        
        // إذا كان المشارك رقمًا، رجعه كـ "User {id}"
        if (typeof participant === 'number' || /^\d+$/.test(participant)) {
          return `المستخدم ${participant}`;
        }
        
        // إذا كان نصًا، رجعه كما هو
        return participant;
      }
    }
    
    // إذا لم يتم العثور على اسم، استخدم ID الدردشة
    return `الدردشة ${chat.id}`;
  };

  const getLastMessage = (chat) => {
    if (chat.last_message) {
      return chat.last_message;
    }
    
    // إذا كانت هناك رسائل، خذ آخر رسالة
    if (chat.messages && Array.isArray(chat.messages) && chat.messages.length > 0) {
      const lastMsg = chat.messages[chat.messages.length - 1];
      return lastMsg.message || lastMsg.text || '';
    }
    
    return 'لا توجد رسائل بعد';
  };

  const getUnreadCount = (chat) => {
    if (chat.messages && Array.isArray(chat.messages)) {
      return chat.messages.filter(msg => 
        !msg.is_read && 
        msg.sender_id && 
        String(msg.sender_id) !== "39"
      ).length;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">جاري تحميل المحادثات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={loadChats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!Array.isArray(chats) || chats.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">لا توجد دردشات بعد</p>
          <p className="text-gray-400 text-sm mt-1">ابدأ محادثة جديدة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="divide-y">
        {chats.map((chat) => {
          const unreadCount = getUnreadCount(chat);
          
          return (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedChatId === chat.id 
                  ? 'bg-blue-50 border-r-2 border-blue-500' 
                  : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {/* صورة المستخدم */}
                <div className="flex-shrink-0 relative">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg">
                    {getChatName(chat).charAt(0)}
                  </div>
                  
                  {/* مؤشر القراءة */}
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </div>
                  )}
                </div>
                
                {/* معلومات الدردشة */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {getChatName(chat)}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {formatTime(chat.last_message_at || chat.updated_at)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 truncate">
                    {getLastMessage(chat)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;