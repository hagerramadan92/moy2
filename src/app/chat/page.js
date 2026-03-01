
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ChatList from "@/components/Chat/ChatList";
import MessageList from "@/components/Chat/MessageList";
import MessageInput from "@/components/Chat/MessageInput";
import { messageService } from "../../../Services/message.service";
import { Search, Plus, User, MessageCircle, Users } from "lucide-react";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newParticipantId, setNewParticipantId] = useState("");
  const [creatingChat, setCreatingChat] = useState(false);
  const router = useRouter();

  // التحقق من التوكن
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [router]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleMessageSent = useCallback((newMessage, tempMessageId) => {
    // سيتم التعامل مع الرسائل الجديدة في MessageList
    console.log('📨 رسالة جديدة:', newMessage);
  }, []);

  const createNewChat = async () => {
    if (!newParticipantId.trim()) {
      alert("يرجى إدخال معرف المستخدم");
      return;
    }

    try {
      setCreatingChat(true);
      
      const response = await messageService.createChat(newParticipantId, "user_user");
      
      if (response.success) {
        alert("تم إنشاء المحادثة بنجاح");
        setShowNewChatModal(false);
        setNewParticipantId("");
        
        // إعادة تحميل قائمة المحادثات
        window.location.reload();
      } else {
        alert(`فشل إنشاء المحادثة: ${response.error}`);
      }
    } catch (error) {
      console.error('خطأ في إنشاء المحادثة:', error);
      alert('حدث خطأ أثناء إنشاء المحادثة');
    } finally {
      setCreatingChat(false);
    }
  };

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
      {/* الجانب الأيسر - قائمة المحادثات */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">المحادثات</h1>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
              title="محادثة جديدة"
            >
              <Plus size={20} className="text-[#579BE8] " />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="بحث في المحادثات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-hidden">
          <ChatList 
            onSelectChat={handleSelectChat} 
            selectedChatId={selectedChat?.id} 
          />
        </div>
      </div>

      {/* الجانب الأيمن - نافذة الدردشة */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-[#579BE8]  font-semibold text-lg">
                    {(() => {
                      const otherParticipants = selectedChat.participants?.filter(p => 
                        p !== 39 && p !== "39"
                      ) || [];
                      
                      if (otherParticipants.length > 0) {
                        const participant = otherParticipants[0];
                        if (typeof participant === 'string') {
                          return participant.charAt(0);
                        }
                        return String(participant).charAt(0);
                      }
                      return 'د';
                    })()}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">
                      {(() => {
                        const otherParticipants = selectedChat.participants?.filter(p => 
                          p !== 39 && p !== "39"
                        ) || [];
                        
                        if (otherParticipants.length > 0) {
                          const participant = otherParticipants[0];
                          if (typeof participant === 'number' || /^\d+$/.test(participant)) {
                            if (selectedChat.type === "user_driver") {
                              return `سائق ${participant}`;
                            } else {
                              return `المستخدم ${participant}`;
                            }
                          }
                          return participant;
                        }
                        return `الدردشة ${selectedChat.id}`;
                      })()}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span>
                        {selectedChat.type === "user_driver" ? "سائق" : "مستخدم"}
                      </span>
                      {selectedChat.last_message_at && (
                        <>
                          <span>•</span>
                          <span>
                            آخر نشاط: {new Date(selectedChat.last_message_at).toLocaleTimeString('ar-SA', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                  <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* الرسائل */}
            <div className="flex-1 overflow-hidden">
              <MessageList 
                chatId={selectedChat.id} 
                currentUserId={39}
                onNewMessage={handleMessageSent}
              />
            </div>

            {/* Input */}
            <MessageInput 
              chatId={selectedChat.id}
              currentUserId={39}
              onMessageSent={handleMessageSent}
            />
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border-8 border-white shadow-lg">
                <MessageCircle size={56} className="text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">مرحباً في المحادثات</h3>
              <p className="text-gray-600 mb-8">
                اختر محادثة من القائمة أو ابدأ محادثة جديدة للتواصل مع الآخرين
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowNewChatModal(true)}
                  className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-shadow flex flex-col items-center"
                >
                  <Plus size={24} className="text-[#579BE8]  mb-2" />
                  <h4 className="font-bold text-gray-800 text-sm">محادثة جديدة</h4>
                  <p className="text-xs text-gray-600">ابدأ محادثة</p>
                </button>
                <button
                  onClick={() => {
                    // فتح دليل المستخدمين
                  }}
                  className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center"
                >
                  <Users size={24} className="text-gray-600 mb-2" />
                  <h4 className="font-bold text-gray-800 text-sm">دليل المستخدمين</h4>
                  <p className="text-xs text-gray-600">تصفح المستخدمين</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal إنشاء محادثة جديدة */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="font-bold text-gray-900 text-lg mb-4">بدء محادثة جديدة</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  معرف المستخدم
                </label>
                <input
                  type="text"
                  value={newParticipantId}
                  onChange={(e) => setNewParticipantId(e.target.value)}
                  placeholder="أدخل معرف المستخدم (ID)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                <p className="text-xs text-gray-700 mt-2">
                  أدخل معرف المستخدم أو السائق الذي تريد التواصل معه
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={createNewChat}
                  disabled={creatingChat || !newParticipantId.trim()}
                  className={`flex-1 px-4 py-2.5 text-white rounded-xl transition-colors ${
                    creatingChat || !newParticipantId.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {creatingChat ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري الإنشاء...</span>
                    </div>
                  ) : (
                    'إنشاء محادثة'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
