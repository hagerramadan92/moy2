
"use client";
import React, { useState, useEffect } from "react";
import { messageService } from "../../../Services/message.service";

const ChatList = ({ onSelectChat, selectedChatId, currentUserId = 39 }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await messageService.getChats();
      
      if (response.success) {
        setChats(response.data);
        setPagination(response.pagination);
        
        // تحديد أول دردشة تلقائيًا
        if (response.data.length > 0 && !selectedChatId) {
          onSelectChat(response.data[0]);
        }
      } else {
        setError(response.error || "خطأ في تحميل الدردشات");
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
    // البحث عن المشارك الآخر (غير المستخدم الحالي)
    const otherParticipants = chat.participants?.filter(p => {
      // المستخدم الحالي هو ID 39
      return p !== currentUserId && p !== currentUserId.toString();
    }) || [];
    
    if (otherParticipants.length > 0) {
      const participant = otherParticipants[0];
      
      if (typeof participant === 'number' || /^\d+$/.test(participant)) {
        if (chat.type === "user_driver") {
          return `سائق ${participant}`;
        } else {
          return `المستخدم ${participant}`;
        }
      }
      
      return participant;
    }
    
    // إذا لم يتم العثور على اسم، استخدم ID الدردشة أو UUID
    return `الدردشة ${chat.id}`;
  };

  const getChatDescription = (chat) => {
    if (chat.type === "user_driver") {
      return "دردشة مع السائق";
    } else if (chat.type === "user_user") {
      return "دردشة مع مستخدم";
    }
    return "محادثة";
  };

  const getLastMessage = (chat) => {
    if (chat.last_message) {
      return chat.last_message;
    }
    
    // إذا كانت هناك رسائل في البيانات المضمنة
    if (chat.messages && Array.isArray(chat.messages) && chat.messages.length > 0) {
      const lastMsg = chat.messages[chat.messages.length - 1];
      return lastMsg.message || lastMsg.text || '';
    }
    
    return 'ابدأ المحادثة الآن';
  };

  const getUnreadCount = (chat) => {
    // حساب الرسائل غير المقروءة
    if (chat.messages && Array.isArray(chat.messages)) {
      return chat.messages.filter(msg => 
        !msg.is_read && 
        msg.sender_id && 
        msg.sender_id !== currentUserId &&
        msg.sender_id !== currentUserId.toString()
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-500">لا توجد دردشات بعد</p>
          <p className="text-gray-400 text-sm mt-1">ابدأ محادثة جديدة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="divide-y divide-gray-200">
        {chats.map((chat) => {
          const unreadCount = getUnreadCount(chat);
          const chatName = getChatName(chat);
          const chatDescription = getChatDescription(chat);
          
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
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${
                    chat.type === "user_driver" ? 'bg-green-500' : 'bg-blue-500'
                  }`}>
                    {chatName.charAt(0)}
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
                    <div>
                      <h3 className="font-medium text-gray-900 truncate">
                        {chatName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {chatDescription}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {formatTime(chat.last_message_at || chat.updated_at)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 truncate">
                    {getLastMessage(chat)}
                  </p>
                  
                  {/* معلومات إضافية */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">
                      {chat.participants?.length || 2} مشارك
                    </span>
                    {chat.type && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {chat.type === "user_driver" ? "سائق" : "مستخدم"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              الصفحة {pagination.current_page} من {pagination.last_page}
            </span>
            <div className="flex gap-2">
              {pagination.current_page > 1 && (
                <button className="px-3 py-1 text-blue-600 hover:text-blue-800">
                  السابق
                </button>
              )}
              {pagination.current_page < pagination.last_page && (
                <button className="px-3 py-1 text-blue-600 hover:text-blue-800">
                  التالي
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
