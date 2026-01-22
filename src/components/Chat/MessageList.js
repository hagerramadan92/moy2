"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { messageService } from "../../../Services/message.service";
import { pusherClient } from "@/lib/pusherClient";
import MessageSender from "./MessageSender";

const MessageList = ({ chatId, currentUserId = 39 }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const messagesEndRef = useRef(null);
  const pusherChannelRef = useRef(null);

  // تحميل الرسائل عند تغيير chatId
  useEffect(() => {
    if (chatId) {
      loadMessages();
      setupPusherSubscription();
    } else {
      setMessages([]);
      setLoading(false);
    }

    // تنظيف عند unmount
    return () => {
      cleanupPusher();
    };
  }, [chatId]);

  // مراقبة حالة اتصال Pusher
  useEffect(() => {
    if (!pusherClient) return;

    const updateStatus = (states) => {
      setConnectionStatus(states.current);
     
    };

    pusherClient.connection.bind('state_change', updateStatus);
    
    return () => {
      if (pusherClient.connection) {
        pusherClient.connection.unbind('state_change', updateStatus);
      }
    };
  }, []);

  // التمرير للأسفل عند تغيير الرسائل
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // معالجة الرسائل المرسلة
  const handleMessageSent = (message, tempMessageId = null) => {
   
    
    if (!message) {
      // إزالة الرسالة المؤقتة في حالة الخطأ
      if (tempMessageId) {
        setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      }
      return;
    }

    if (tempMessageId) {
      // استبدال الرسالة المؤقتة بالرسالة الحقيقية
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessageId ? formatMessage(message) : msg
        )
      );
    } else {
      // إضافة الرسالة الجديدة
      const formattedMessage = formatMessage(message);
      setMessages(prev => [...prev, formattedMessage]);
    }
  };

  // تنظيف اشتراكات Pusher
  const cleanupPusher = () => {
    if (pusherChannelRef.current) {
      try {
       
        pusherChannelRef.current.unbind_all();
        pusherClient.unsubscribe(pusherChannelRef.current.name);
      } catch (error) {
        console.error('خطأ في التنظيف:', error);
      }
      pusherChannelRef.current = null;
    }
    setIsSubscribed(false);
    setActiveChannel(null);
  };

  // تحميل الرسائل من API
  const loadMessages = async () => {
    try {
      setLoading(true);
      setError("");
      
     
      const response = await messageService.getMessages(chatId);
     
      
      if (Array.isArray(response)) {
        const formattedMessages = response.map(msg => formatMessage(msg));
        setMessages(formattedMessages);
        
        // تحديث حالة القراءة للرسائل الجديدة
        await markUnreadAsRead(formattedMessages);
      } else {
        console.error('❌ الرد ليس مصفوفة:', response);
        setError("خطأ في تحميل الرسائل: التنسيق غير صحيح");
        setMessages([]);
      }
    } catch (error) {
      console.error('❌ فشل تحميل الرسائل:', error);
      setError("فشل تحميل الرسائل. حاول مرة أخرى.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // تنسيق الرسالة
  const formatMessage = useCallback((msg) => {
    const isCurrentUser = msg.sender_id && String(msg.sender_id) === String(currentUserId);
    
    return {
      ...msg,
      id: msg.id || msg.message_id || `msg-${Date.now()}-${Math.random()}`,
      text: msg.message || msg.text || '',
      sender: isCurrentUser ? "user" : "other",
      time: msg.created_at || msg.createdAt || msg.timestamp || new Date().toISOString(),
      is_read: msg.is_read || false,
      read_at: msg.read_at,
      sender_name: msg.sender?.name || `المستخدم ${msg.sender_id}`,
      isCurrentUser: isCurrentUser,
      sender_avatar: msg.sender?.avatar || null
    };
  }, [currentUserId]);

  // إعداد اشتراك Pusher للرسائل المباشرة
  const setupPusherSubscription = () => {
    if (!pusherClient || !chatId) return;

    // تنظيف الاشتراكات السابقة
    cleanupPusher();

    // القنوات التي نعرف أنها تعمل بناءً على السجلات
    const workingChannels = [
      `chat.${chatId}`,           // ✅ تعمل
      `chat-app.${chatId}`,       // ✅ تعمل
      `private-chat.${chatId}`,   // ✅ تعمل
      `private-chat-app.${chatId}` // ✅ تعمل
    ];

    // جرب القنوات بالتتابع
    const trySubscribeToChannel = (channelName) => {
      return new Promise((resolve) => {
       
        
        try {
          const channel = pusherClient.subscribe(channelName);
          
          // نجاح الاشتراك
          const onSuccess = () => {
            
            channel.unbind('pusher:subscription_succeeded', onSuccess);
            channel.unbind('pusher:subscription_error', onError);
            resolve({ success: true, channel });
          };
          
          // خطأ الاشتراك
          const onError = (error) => {
           
            channel.unbind('pusher:subscription_succeeded', onSuccess);
            channel.unbind('pusher:subscription_error', onError);
            try {
              pusherClient.unsubscribe(channelName);
            } catch (e) {}
            resolve({ success: false, error });
          };
          
          channel.bind('pusher:subscription_succeeded', onSuccess);
          channel.bind('pusher:subscription_error', onError);
          
          // مهلة زمنية (3 ثواني)
          setTimeout(() => {
            if (!channel.subscribed) {
              channel.unbind('pusher:subscription_succeeded', onSuccess);
              channel.unbind('pusher:subscription_error', onError);
              try {
                pusherClient.unsubscribe(channelName);
              } catch (e) {}
              resolve({ success: false, error: { type: 'Timeout' } });
            }
          }, 3000);
          
        } catch (error) {
          console.error(`❌ استثناء في الاشتراك في ${channelName}:`, error);
          resolve({ success: false, error });
        }
      });
    };

    // جرب كل قناة بالتتابع
    const tryAllChannels = async () => {
      for (const channelName of workingChannels) {
        const result = await trySubscribeToChannel(channelName);
        
        if (result.success) {
          // نجحنا! ربط الأحداث وإعداد القناة
          setupChannelEvents(result.channel);
          setIsSubscribed(true);
          setActiveChannel(channelName);
          pusherChannelRef.current = result.channel;
          
          return;
        }
      }
      
      // إذا فشلت كل المحاولات
      
      setIsSubscribed(false);
      setActiveChannel(null);
    };

    tryAllChannels();
  };

  // إعداد أحداث القناة الناجحة
  const setupChannelEvents = (channel) => {
    const channelName = channel.name;
    

    // أحداث الرسائل المختلفة التي قد يستخدمها Laravel
    const messageEvents = [
      'new-upcoming-message',
      'message-sent',
      'MessageSent',
      'message-created',
      'new-message',
      'chat-message',
      'message',
      'MessageCreated'
    ];

    messageEvents.forEach(eventName => {
      channel.bind(eventName, (data) => {
       
        handleIncomingMessage(data);
      });
    });

    // أحداث أخرى
    channel.bind('message-read', (data) => {
     
      handleMessageRead(data);
    });

    channel.bind('typing', (data) => {
      
    });

    // حدث لعرض جميع الأحداث (للتشخيص)
    channel.bind('.', (eventName, data) => {
      if (!eventName.startsWith('pusher:')) {
       
      }
    });

    // أحداث Pusher الخاصة
    channel.bind('pusher:subscription_count', (data) => {
      
    });
  };

  // معالجة الرسائل الواردة من Pusher
  const handleIncomingMessage = useCallback((data) => {
    // تحقق مما إذا كانت الرسالة تخص هذه الدردشة
    const messageChatId = data.chat_id || data.chatId || data.chat?.id || data.chat_id;
    if (messageChatId && String(messageChatId) !== String(chatId)) {
      
      return;
    }
    
    
    
    const newMessage = formatMessage({
      ...data,
      id: data.id || data.message_id,
      message: data.message || data.text || data.content,
      sender_id: data.sender_id || data.user_id,
      created_at: data.created_at || data.timestamp || new Date().toISOString(),
      is_read: data.is_read || false
    });

    setMessages(prev => {
      // منع التكرار
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) {
        
        return prev;
      }
      
     ;
      return [...prev, newMessage];
    });

    // إذا كانت الرسالة من شخص آخر، حددها كـ مقروءة
    if (!newMessage.isCurrentUser && newMessage.id) {
      setTimeout(() => {
        markSingleAsRead(newMessage.id);
      }, 1000);
    }
  }, [chatId, formatMessage]);

  // معالجة حدث قراءة الرسالة
  const handleMessageRead = useCallback((data) => {
    if (data.message_id && data.chat_id == chatId) {
      
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id == data.message_id 
            ? { ...msg, is_read: true, read_at: new Date().toISOString() }
            : msg
        )
      );
    }
  }, [chatId]);

  // تحديد الرسائل غير المقروءة كـ مقروءة
  const markUnreadAsRead = async (messages) => {
    try {
      const unreadMessages = messages.filter(
        msg => !msg.is_read && 
               !msg.isCurrentUser &&
               msg.id &&
               !msg.id.toString().startsWith('temp-')
      );
      
      
      
      for (const msg of unreadMessages) {
        try {
          await messageService.markAsRead(msg.id);
          
          
          setMessages(prev => 
            prev.map(m => 
              m.id === msg.id ? { ...m, is_read: true, read_at: new Date().toISOString() } : m
            )
          );
        } catch (error) {
          console.error(`❌ فشل في تحديد الرسالة ${msg.id} كـ مقروءة:`, error);
        }
      }
    } catch (error) {
      console.error('❌ خطأ في markUnreadAsRead:', error);
    }
  };

  // تحديد رسالة واحدة كـ مقروءة
  const markSingleAsRead = async (messageId) => {
    try {
      if (!messageId || messageId.toString().startsWith('temp-')) return;
      
      await messageService.markAsRead(messageId);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, is_read: true, read_at: new Date().toISOString() }
            : msg
        )
      );
      
      
    } catch (error) {
      console.error(`❌ فشل في تحديد الرسالة ${messageId} كـ مقروءة:`, error);
    }
  };

  // التمرير للأسفل
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // إعادة تحميل الرسائل
  const handleRetryLoad = () => {
    setError("");
    loadMessages();
  };

  // إعادة الاتصال بـ Pusher
  const handleReconnectPusher = () => {
    cleanupPusher();
    setupPusherSubscription();
  };

  // تنسيق وقت الرسالة
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
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
    } catch {
      return '';
    }
  };

  // تنسيق التاريخ (للرسائل القديمة)
  const formatMessageDate = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const today = new Date();
      
      if (date.toDateString() === today.toDateString()) {
        return 'اليوم';
      }
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === yesterday.toDateString()) {
        return 'أمس';
      }
      
      return date.toLocaleDateString('ar-SA', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // حالة الرسالة (للرسائل المرسلة)
  const getMessageStatus = (message) => {
    if (!message.isCurrentUser) return null;
    
    if (message.read_at) {
      return { text: '✓✓', title: 'مقروءة', className: 'text-green-400' };
    } else if (message.id && !message.is_temp && message.id.toString().startsWith('msg-')) {
      return { text: '✓', title: 'مرسلة', className: 'text-gray-400' };
    } else if (message.is_temp) {
      return { text: '...', title: 'جاري الإرسال', className: 'text-gray-400 animate-pulse' };
    }
    
    return null;
  };

  // تجميع الرسائل حسب التاريخ
  const groupMessagesByDate = () => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    messages.forEach((message, index) => {
      const messageDate = formatMessageDate(message.time);
      
      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
      
      // آخر مجموعة
      if (index === messages.length - 1) {
        groups.push({ date: currentDate, messages: currentGroup });
      }
    });

    return groups;
  };

  // عرض حالة الاتصال
  const renderConnectionStatus = () => {
    if (!chatId) return null;

    return (
      <div className="px-4 py-2 bg-white border-b">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">دردشة #{chatId}</span>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${
                    isSubscribed ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <span className="text-gray-400">
                    {isSubscribed ? 'متصل' : 'غير متصل'}
                  </span>
                </div>
              </div>
              {activeChannel && (
                <div className="text-xs text-gray-500 mt-1">
                  📡 القناة: <span className="font-medium">{activeChannel}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400">{messages.length} رسالة</span>
            {!isSubscribed && (
              <button
                onClick={handleReconnectPusher}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
              >
                إعادة الاتصال
              </button>
            )}
          </div>
        </div>
        
        {/* معلومات الحالة */}
        <div className="mt-1 text-xs text-gray-500">
          <span>حالة Pusher: </span>
          <span className={`font-medium ${
            connectionStatus === 'connected' ? 'text-green-600' :
            connectionStatus === 'connecting' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {connectionStatus === 'connected' ? '✅ متصل' :
             connectionStatus === 'connecting' ? '🔄 جاري الاتصال' :
             '❌ مقطوع'}
          </span>
        </div>
      </div>
    );
  };

  // إذا لم يكن هناك chatId
  if (!chatId) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-300 mb-4">
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg font-medium">اختر محادثة</p>
          <p className="text-gray-400 text-sm mt-1">لرؤية الرسائل وبدء المحادثة</p>
        </div>
      </div>
    );
  }

  // أثناء التحميل
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">جاري تحميل الرسائل...</p>
          <p className="text-gray-400 text-xs mt-1">دردشة #{chatId}</p>
        </div>
      </div>
    );
  }

  // إذا كان هناك خطأ
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-red-400 mb-3">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium mb-2">حدث خطأ</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleRetryLoad}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={() => setError("")}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    );
  }

  // عرض الرسائل
  const messageGroups = groupMessagesByDate();

  return (
    <div className="h-full flex flex-col">
      {/* حالة الاتصال */}
      {renderConnectionStatus()}

      {/* قائمة الرسائل */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            {/* تاريخ المجموعة */}
            <div className="flex justify-center my-4">
              <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                {group.date}
              </div>
            </div>
            
            {/* رسائل المجموعة */}
            <div className="space-y-3">
              {group.messages.map((message) => {
                const status = getMessageStatus(message);
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${message.isCurrentUser ? "justify-end" : "justify-start"} animate-fadeIn`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 relative ${
                        message.isCurrentUser
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm shadow-md"
                          : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                      } ${message.is_temp ? 'opacity-80' : ''}`}
                    >
                      {/* صورة المرسل للرسائل الواردة */}
                      {!message.isCurrentUser && (
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender_avatar ? (
                            <img 
                              src={message.sender_avatar} 
                              alt={message.sender_name}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-600">
                              {message.sender_name.charAt(0)}
                            </div>
                          )}
                          <div className="text-xs font-medium text-gray-600">
                            {message.sender_name}
                          </div>
                        </div>
                      )}
                      
                      {/* نص الرسالة */}
                      <div className={`text-sm break-words leading-relaxed ${
                        message.isCurrentUser ? 'text-white' : 'text-gray-800'
                      }`}>
                        {message.text}
                      </div>
                      
                      {/* توقيت وحالة الرسالة */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-opacity-20">
                        <span className={`text-xs ${
                          message.isCurrentUser 
                            ? 'text-blue-200' 
                            : 'text-gray-500'
                        }`}>
                          {formatMessageTime(message.time)}
                        </span>
                        
                        {/* حالة الرسالة (للمستخدم فقط) */}
                        {status && (
                          <div className="ml-2 flex items-center">
                            <span 
                              className={`text-xs ${status.className}`}
                              title={status.title}
                            >
                              {status.text}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* مؤشر الرسالة المؤقتة */}
                      {message.is_temp && (
                        <div className="absolute -top-1 -right-1 w-4 h-4">
                          <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
      
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* مكون إرسال الرسائل */}
      <MessageSender 
        chatId={chatId}
        currentUserId={currentUserId}
        onMessageSent={handleMessageSent}
      />

  
    </div>
  );
};

export default MessageList;