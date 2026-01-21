"use client";
import React, { useState, useEffect } from "react";
import { pusherClient } from "@/lib/pusherClient";

const LaravelChatList = ({ onSelectChat, selectedChatId, userId = 39 }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pusherChannel, setPusherChannel] = useState(null);

  useEffect(() => {
    loadChats();
    setupPusher();
    
    return () => {
      if (pusherChannel) {
        pusherChannel.unbind_all();
        pusherClient.unsubscribe(`private-chat.${userId}`);
      }
    };
  }, [userId]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://moya.talaaljazeera.com/api/v1'}/chats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      
      if (data.status === "success" && data.chats?.data) {
        setChats(data.chats.data);
        
        if (data.chats.data.length > 0 && !selectedChatId) {
          onSelectChat(data.chats.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
      setError('فشل تحميل المحادثات');
    } finally {
      setLoading(false);
    }
  };

  const setupPusher = () => {
    try {
      // الاشتراك في القناة الخاصة بالمستخدم
      const channelName = `private-chat.${userId}`;
      
      const channel = pusherClient.subscribeToLaravelChannel(channelName, {
        onSubscribed: (data) => {
          console.log('✅ Subscribed to user channel:', data);
        },
        onEvent: (eventName, data) => {
          console.log(`📨 Laravel chat event: ${eventName}`, data);
          
          // تحديث قائمة المحادثات عند استقبال حدث جديد
          if (eventName === '.message.sent' || eventName === 'MessageSent') {
            handleNewMessage(data);
          }
        },
        events: {
          // يمكنك ربط أحداث محددة هنا
          'chat.created': (data) => {
            console.log('New chat created:', data);
            loadChats(); // إعادة تحميل القائمة
          },
          'message.sent': (data) => {
            console.log('Message sent event:', data);
            handleNewMessage(data);
          }
        }
      });
      
      setPusherChannel(channel);
      
    } catch (error) {
      console.error('Failed to setup Pusher:', error);
    }
  };

  const handleNewMessage = (data) => {
    // تحديث قائمة المحادثات مع آخر رسالة
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === data.chat_id) {
          return {
            ...chat,
            last_message: data.message,
            last_message_at: data.created_at,
            updated_at: new Date().toISOString()
          };
        }
        return chat;
      }).sort((a, b) => {
        // ترتيب حسب آخر رسالة
        return new Date(b.last_message_at || b.updated_at) - new Date(a.last_message_at || a.updated_at);
      });
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
      <div className="h-full flex items-center justify-center">
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

  return (
    <div className="h-full overflow-y-auto">
      <div className="divide-y">
        {chats.map((chat) => (
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
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg">
                  {chat.chat_uuid?.charAt(0) || 'د'}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-900 truncate">
                    {`محادثة ${chat.id}`}
                  </h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {formatTime(chat.last_message_at)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 truncate">
                  {chat.last_message || 'لا توجد رسائل بعد'}
                </p>
                
                <div className="text-xs text-gray-400 mt-1">
                  {chat.participants?.length || 0} مشارك
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LaravelChatList;