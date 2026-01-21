"use client";
import React, { useState, useEffect, useCallback } from "react";
import ChatList from "@/components/Chat/ChatList";
import MessageList from "@/components/Chat/MessageList";
import MessageInput from "@/components/Chat/MessageInput";
import { useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusherClient";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // التحقق من تسجيل الدخول
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [router]);

  // إعداد Pusher للرسائل المباشرة
  useEffect(() => {
    if (!selectedChat) return;

    const channel = pusherClient.subscribe("chat-app");
    
    channel.bind("new-upcoming-message", (data) => {
      console.log('New Pusher message:', data);
      
      if (data.chat_id === selectedChat.id) {
        // إضافة الرسالة الجديدة
        const newMessage = {
          ...data,
          id: data.id || data.message_id,
          message: data.message || data.text || '',
          text: data.message || data.text || '',
          sender_id: data.sender_id,
          isCurrentUser: data.sender_id === 39,
          time: data.created_at || new Date().toISOString(),
          created_at: data.created_at || new Date().toISOString(),
          is_read: false,
          read_at: null,
          sender: data.sender || {
            id: data.sender_id,
            name: data.sender_id === 39 ? "أنت" : `المستخدم ${data.sender_id}`
          }
        };
        
        setMessages(prev => {
          // منع التكرار
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) return prev;
          
          return [...prev, newMessage];
        });
      }
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe("chat-app");
    };
  }, [selectedChat]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setMessages([]); // تفريغ الرسائل السابقة عند تغيير الدردشة
  };

  const handleMessageSent = useCallback((message, isReal = false, isError = false) => {
    if (isError) {
      // إزالة الرسالة المؤقتة في حالة الخطأ
      setMessages(prev => prev.filter(msg => msg.id !== message.id));
      return;
    }

    if (isReal) {
      // استبدال الرسالة المؤقتة بالرسالة الحقيقية
      setMessages(prev => 
        prev.map(msg => 
          msg.is_temp && msg.text === message.text ? { ...message, is_temp: false } : msg
        )
      );
    } else {
      // إضافة الرسالة المؤقتة
      setMessages(prev => {
        // منع التكرار
        const exists = prev.some(msg => msg.id === message.id);
        if (exists) return prev;
        
        return [...prev, message];
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* قائمة الدردشات */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-900">المحادثات</h1>
          <p className="text-sm text-gray-500 mt-1">مرحباً بك في المحادثات</p>
        </div>
        
        <div className="flex-1">
          <ChatList 
            onSelectChat={handleSelectChat} 
            selectedChatId={selectedChat?.id} 
          />
        </div>
      </div>

      {/* منطقة المحادثة */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* رأس المحادثة */}
            <div className="bg-white border-b p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg ml-3">
                  {(() => {
                    const otherParticipant = selectedChat.participants?.find(p => 
                      String(p) !== "39"
                    );
                    return otherParticipant ? String(otherParticipant).charAt(0) : 'د';
                  })()}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {(() => {
                      const otherParticipant = selectedChat.participants?.find(p => 
                        String(p) !== "39"
                      );
                      return otherParticipant ? `المستخدم ${otherParticipant}` : `الدردشة ${selectedChat.id}`;
                    })()}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {selectedChat.last_message_at ? 
                      `آخر نشاط: ${new Date(selectedChat.last_message_at).toLocaleTimeString('ar-SA')}` : 
                      'لا توجد رسائل بعد'}
                  </p>
                </div>
              </div>
            </div>

            {/* الرسائل */}
            <div className="flex-1">
              <MessageList 
                chatId={selectedChat.id} 
                currentUserId={39}
              />
            </div>

            {/* إدخال الرسالة */}
            <MessageInput 
              chatId={selectedChat.id}
              onMessageSent={handleMessageSent}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-gray-400 mb-6">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                مرحباً في المحادثات
              </h3>
              <p className="text-gray-600 mb-6">
                اختر محادثة من القائمة لبدء المحادثة
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}