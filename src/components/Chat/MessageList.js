
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { messageService } from "../../../Services/message.service";
import { Check, CheckCheck, Clock, User } from "lucide-react";

const MessageList = ({ chatId, currentUserId = 39, onNewMessage }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // تحميل الرسائل
  // Note: we intentionally do NOT include `pagination` in deps here.
  // Including it caused the callback to be recreated when pagination updated,
  // which retriggered the effect that calls `loadMessages` and created
  // a maximum update depth loop. The function reads the latest `pagination`
  // value at call time, so this is safe.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadMessages = useCallback(async (reset = true) => {
    if (!chatId) return;

    try {
      if (reset) {
        setLoading(true);
      }

      const page = reset ? 1 : (pagination?.current_page || 0) + 1;

      const response = await messageService.getMessages(chatId, { page });

      if (response.success) {
        const newMessages = response.data;

        if (reset) {
          setMessages(newMessages);
        } else {
          setMessages(prev => [...newMessages, ...prev]);
        }

        setPagination(response.pagination);
        setHasMore(response.pagination?.current_page < response.pagination?.last_page);
      } else {
        setError(response.error || "خطأ في تحميل الرسائل");
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError("فشل تحميل الرسائل. حاول مرة أخرى.");
    } finally {
      if (reset) {
        setLoading(false);
      }
    }
  }, [chatId]);

  // تحميل الرسائل عند تغيير chatId
  useEffect(() => {
    if (chatId) {
      loadMessages(true);
      scrollToBottom();
    }
  }, [chatId, loadMessages]);

  // استقبال الرسائل الجديدة
  useEffect(() => {
    if (onNewMessage && chatId) {
      const handleNewMessage = (newMessage) => {
        if (newMessage.chat_id === chatId) {
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
        }
      };
      
      // يمكنك إضافة مستمع للأحداث هنا (مثل Pusher أو WebSocket)
      
      return () => {
        // تنظيف المستمع
      };
    }
  }, [chatId, onNewMessage]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current || loading || !hasMore) return;
    
    const { scrollTop } = scrollContainerRef.current;
    if (scrollTop === 0) {
      loadMoreMessages();
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore || loading) return;
    
    await loadMessages(false);
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffMinutes < 1) return 'الآن';
      if (diffMinutes < 60) return `${diffMinutes} دقيقة`;
      
      return date.toLocaleTimeString('ar-SA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  const formatMessageDate = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date >= today) return 'اليوم';
      if (date >= yesterday) return 'أمس';
      
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // تجميع الرسائل حسب التاريخ
  const groupMessagesByDate = () => {
    const groups = {};
    
    messages.forEach((message) => {
      const date = formatMessageDate(message.created_at);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  if (loading && messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-700 text-sm">جاري تحميل الرسائل...</p>
        </div>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={() => loadMessages(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate();

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto p-4"
    >
      {hasMore && messages.length > 10 && (
        <div className="text-center mb-4">
          <button
            onClick={loadMoreMessages}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-800 px-4 py-2 bg-blue-50 rounded-lg"
          >
            {loading ? 'جاري التحميل...' : 'تحميل المزيد'}
          </button>
        </div>
      )}
      
      {Object.entries(messageGroups).map(([date, dateMessages]) => (
        <div key={date} className="mb-6">
          {/* تاريخ الرسائل */}
          <div className="flex justify-center my-4">
            <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">
              {date}
            </div>
          </div>
          
          {/* رسائل اليوم */}
          <div className="space-y-3">
            {dateMessages.map((message) => {
              const isCurrentUser = message.sender_id === currentUserId;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      isCurrentUser
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {/* اسم المرسل للرسائل الواردة */}
                    {!isCurrentUser && (
                      <div className="flex items-center gap-2 mb-1">
                        <User size={12} className="text-gray-700" />
                        <span className="text-xs font-medium text-gray-700">
                          {message.sender_type === "App\\Models\\User" 
                            ? `المستخدم ${message.sender_id}` 
                            : 'مرسل'}
                        </span>
                      </div>
                    )}
                    
                    {/* نص الرسالة */}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.message}
                    </p>
                    
                    {/* وقت الرسالة وحالة القراءة */}
                    <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-opacity-20">
                      <span className={`text-xs ${
                        isCurrentUser ? 'text-blue-200' : 'text-gray-700'
                      }`}>
                        {formatMessageTime(message.created_at)}
                      </span>
                      
                      {isCurrentUser && (
                        message.is_read ? (
                          <CheckCheck size={12} className="text-green-300" />
                        ) : (
                          <Check size={12} className="text-blue-200 opacity-70" />
                        )
                      )}
                    </div>
                    
                    {/* ملف مرفق إذا كان موجوداً */}
                    {message.file_url && (
                      <div className="mt-2">
                        <a
                          href={message.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-600 flex items-center gap-1"
                        >
                          📎 {message.file_name || 'ملف مرفق'}
                          {message.file_size && (
                            <span className="text-gray-400">
                              ({Math.round(message.file_size / 1024)} KB)
                            </span>
                          )}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {messages.length === 0 && !loading && (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-700 mb-2">بداية المحادثة</h3>
          <p className="text-gray-700">ابدأ المحادثة بإرسال رسالة</p>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
