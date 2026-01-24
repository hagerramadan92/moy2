// [file name]: ChatModal.js (التصميم الثابت)
// [file content begin]
// components/Chat/ChatModal.js
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { messageService } from "../../../Services/message.service";

import { 
  X, Users, MessageCircle, Plus, Search, Clock, User, CheckCircle, 
  Phone, Video, Info, Send, Paperclip, Smile, ImageIcon, FileText, 
  Mic, ChevronLeft, Star, MoreVertical, Check, CheckCheck, Lock, 
  HeadphonesIcon, ArrowLeft, Eye, EyeOff, CircleDot
} from "lucide-react";

const ChatModal = ({ 
  isOpen, 
  onClose, 
  currentUserId = 39, 
  defaultParticipantId = null,
  isSupport = false,
  initialChatId = null 
}) => {
  // States
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [creatingChat, setCreatingChat] = useState(false);
  const [participantId, setParticipantId] = useState(defaultParticipantId || "");
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [activeTyping, setActiveTyping] = useState({});
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatsContainerRef = useRef(null);

  // جلب بيانات المستخدم الحالي من localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          return {
            id: parsedUser.id || currentUserId,
            name: parsedUser.name || parsedUser.username || 'المستخدم',
            email: parsedUser.email || '',
            phone: parsedUser.phone || ''
          };
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // بيانات افتراضية
    return {
      id: currentUserId,
      name: 'المستخدم',
      email: '',
      phone: ''
    };
  });

  // جلب المحادثات
  useEffect(() => {
    if (isOpen) {
      loadChats();
    }
  }, [isOpen]);

  // تصفية المحادثات عند البحث
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChats(chats);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = chats.filter(chat => {
      const chatName = getChatName(chat).toLowerCase();
      const lastMessage = (chat.last_message || '').toLowerCase();
      const chatIdStr = `الدردشة ${chat.id}`.toLowerCase();
      
      return (
        chatName.includes(query) ||
        lastMessage.includes(query) ||
        chatIdStr.includes(query)
      );
    });
    
    setFilteredChats(filtered);
  }, [searchQuery, chats]);

  // فتح محادثة جديدة تلقائياً إذا كان هناك معرف مشارك
  useEffect(() => {
    if (isOpen && defaultParticipantId && chats.length > 0 && !loading) {
      const existingChat = chats.find(chat => 
        chat.participants?.includes(defaultParticipantId) ||
        chat.participants?.includes(Number(defaultParticipantId))
      );
      
      if (existingChat) {
        setSelectedChat(existingChat);
      } else {
        setShowNewChatForm(true);
        setParticipantId(defaultParticipantId);
      }
    }
  }, [isOpen, chats, loading, defaultParticipantId]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await messageService.getChats();
      
      if (response.success && Array.isArray(response.data)) {
        const chatsWithUnread = response.data.map(chat => {
          const unreadCount = calculateUnreadCount(chat);
          return {
            ...chat,
            unreadCount,
            lastActive: chat.last_message_at || chat.updated_at,
            isActive: selectedChat?.id === chat.id
          };
        });
        
        // ترتيب المحادثات حسب آخر رسالة
        const sortedChats = chatsWithUnread.sort((a, b) => {
          const timeA = new Date(a.lastActive || 0).getTime();
          const timeB = new Date(b.lastActive || 0).getTime();
          return timeB - timeA;
        });
        
        setChats(sortedChats);
        setFilteredChats(sortedChats);
        
        // إذا كان هناك initialChatId، حدده تلقائياً
        if (initialChatId && !selectedChat) {
          const foundChat = sortedChats.find(chat => chat.id == initialChatId);
          if (foundChat) {
            setSelectedChat(foundChat);
          }
        }
      } else {
        setChats([]);
        setFilteredChats([]);
      }
    } catch (error) {
      console.error('خطأ في جلب المحادثات:', error);
      setChats([]);
      setFilteredChats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateUnreadCount = (chat) => {
    if (!chat.messages || !Array.isArray(chat.messages)) return 0;
    
    return chat.messages.filter(msg => {
      if (!msg.sender_id) return false;
      const currentUserIdStr = String(currentUserId);
      const senderIdStr = String(msg.sender_id);
      
      return !msg.is_read && senderIdStr !== currentUserIdStr;
    }).length;
  };

  // تحميل الرسائل عند اختيار محادثة
  const loadMessages = async (chatId) => {
    try {
      setMessagesLoading(true);
      
      const response = await messageService.getMessages(chatId);
      
      if (response.success && Array.isArray(response.data)) {
        // ترتيب الرسائل من الأقدم للأحدث
        const sortedMessages = response.data.sort((a, b) => {
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return timeA - timeB;
        });
        
        const formattedMsgs = sortedMessages.map(msg => ({
          ...msg,
          isCurrentUser: String(msg.sender_id) === String(currentUserId),
          formattedTime: formatMessageTime(msg.created_at),
          is_outgoing: String(msg.sender_id) === String(currentUserId)
        }));
        
        setMessages(formattedMsgs);
        scrollToBottom();
        
        // تحديث حالة القراءة
        markChatAsRead(chatId);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('خطأ في تحميل الرسائل:', error);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  // تحديث عند اختيار محادثة
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
      updateChatsActiveState();
    }
  }, [selectedChat]);

  const updateChatsActiveState = () => {
    setChats(prev => prev.map(chat => ({
      ...chat,
      isActive: selectedChat?.id === chat.id
    })));
  };

  // إنشاء محادثة جديدة
  const createNewChat = async () => {
    if (!participantId.trim()) {
      alert("يرجى إدخال معرف المستخدم");
      return;
    }

    try {
      setCreatingChat(true);
      
      const result = await messageService.createChat(participantId);
      
      if (result.success) {
        // إعادة تحميل المحادثات
        await loadChats();
        
        // البحث عن المحادثة الجديدة وتحديدها
        if (result.chat) {
          setSelectedChat(result.chat);
        } else {
          const newChatsResponse = await messageService.getChats();
          if (newChatsResponse.success && Array.isArray(newChatsResponse.data)) {
            const foundChat = newChatsResponse.data.find(chat => 
              chat.participants?.includes(participantId) ||
              chat.participants?.includes(Number(participantId))
            );
            
            if (foundChat) {
              setSelectedChat(foundChat);
            }
          }
        }
        
        setShowNewChatForm(false);
        setParticipantId("");
      } else {
        alert(`فشل إنشاء المحادثة: ${result.error}`);
      }
    } catch (error) {
      console.error('خطأ في إنشاء المحادثة:', error);
      alert('حدث خطأ أثناء إنشاء المحادثة');
    } finally {
      setCreatingChat(false);
    }
  };

  // إرسال رسالة
  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !selectedChat) return;

    try {
      setSending(true);
      
      // إنشاء رسالة مؤقتة
      const tempMessage = {
        id: `temp-${Date.now()}`,
        message: newMessage,
        sender_id: currentUserId,
        sender_type: "App\\Models\\User",
        isCurrentUser: true,
        is_temp: true,
        is_outgoing: true,
        message_type: "text",
        metadata: ["text"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_read: false,
        read_at: null,
        formattedTime: formatMessageTime(new Date().toISOString())
      };

      // إضافة الرسالة المؤقتة
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");
      scrollToBottom();

      // إرسال حقيقي إلى API
      const result = await messageService.sendMessage(selectedChat.id, newMessage);
      
      if (result.success && result.message) {
        // استبدال الرسالة المؤقتة بالرسالة الحقيقية
        setMessages(prev => {
          const newMessages = prev.map(msg => 
            msg.id === tempMessage.id ? {
              ...result.message,
              isCurrentUser: true,
              is_outgoing: true,
              formattedTime: formatMessageTime(result.message.created_at)
            } : msg
          );
          return newMessages;
        });
        
        // إعادة تحميل قائمة المحادثات لتحديث آخر رسالة
        await loadChats();
      } else {
        // إزالة الرسالة المؤقتة في حالة الفشل
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        alert('فشل إرسال الرسالة');
      }

    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
      alert('حدث خطأ أثناء إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  const markChatAsRead = async (chatId) => {
    try {
      // تحديث الحالة المحلية
      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          return { ...chat, unreadCount: 0 };
        }
        return chat;
      }));
      
      // تحديث الرسائل المحلية
      setMessages(prev => prev.map(msg => ({
        ...msg,
        is_read: msg.isCurrentUser ? msg.is_read : true
      })));
    } catch (error) {
      console.error('خطأ في تحديث حالة القراءة:', error);
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

  // تنسيق الوقت
  const formatChatTime = (timestamp) => {
    if (!timestamp) return 'الآن';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMinutes < 1) return 'الآن';
      if (diffMinutes < 60) return `${diffMinutes} د`;
      if (diffHours < 24) return `${diffHours} س`;
      if (diffDays < 7) return `${diffDays} يوم`;
      
      return date.toLocaleDateString('ar-SA', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'الآن';
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
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
        weekday: 'long',
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
    const sortedMessages = [...messages].sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return timeA - timeB;
    });
    
    sortedMessages.forEach(message => {
      const date = formatMessageDate(message.created_at);
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
    });
    
    return groups;
  };

  // الحصول على اسم الشات
  const getChatName = (chat) => {
    const otherParticipants = chat.participants?.filter(p => {
      return String(p) !== String(currentUserId);
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
      
      return String(participant);
    }
    
    return `الدردشة ${chat.id}`;
  };

  // الحصول على صورة الشات
  const getChatAvatar = (chat) => {
    const chatName = getChatName(chat);
    return chatName.charAt(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-4 h-[90vh] overflow-hidden border border-gray-300"
      >
        <div className="flex h-full">
          {/* الجانب الأيسر - قائمة المحادثات */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#579BE8] to-[#124987] text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">المحادثات</h2>
                    <p className="text-xs opacity-80">{currentUser.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowNewChatForm(true)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                    title="محادثة جديدة"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="mt-4 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
                <input
                  type="text"
                  placeholder="بحث في المحادثات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 border border-white/30"
                />
              </div>
            </div>

            {/* عرض واجهة إنشاء محادثة جديدة */}
            <AnimatePresence>
              {showNewChatForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-gradient-to-b from-blue-50 to-white border-b border-blue-100">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
                      <h3 className="font-bold text-gray-800 mb-3">بدء محادثة جديدة</h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={participantId}
                          onChange={(e) => setParticipantId(e.target.value)}
                          placeholder="أدخل معرف المستخدم (ID)"
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-[#579BE8] focus:ring-2 focus:ring-[#579BE8]/20"
                        />
                        <button
                          onClick={createNewChat}
                          disabled={creatingChat || !participantId.trim()}
                          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                            creatingChat || !participantId.trim()
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-[#579BE8] to-[#124987] text-white hover:shadow-lg'
                          }`}
                        >
                          {creatingChat ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>جاري الإنشاء...</span>
                            </>
                          ) : (
                            <>
                              <Plus size={16} />
                              <span>إنشاء</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">أدخل معرف السائق أو الشخص الذي تريد التواصل معه</p>
                      <button
                        onClick={() => {
                          setShowNewChatForm(false);
                          setParticipantId("");
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 mt-2"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chats List */}
            <div 
              ref={chatsContainerRef}
              className="flex-1 overflow-y-auto bg-white"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#579BE8] border-t-transparent"></div>
                  <p className="text-gray-500 mt-3">جاري تحميل المحادثات...</p>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-4">
                    <MessageCircle size={32} className="text-gray-400" />
                  </div>
                  <h3 className="font-bold text-gray-700 mb-2">لا توجد محادثات</h3>
                  <p className="text-gray-500 text-center mb-6">ابدأ محادثتك الأولى</p>
                  <button
                    onClick={() => setShowNewChatForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[#579BE8] to-[#124987] text-white rounded-xl hover:shadow-lg transition-shadow flex items-center gap-2"
                  >
                    <Plus size={18} />
                    <span>بدء محادثة جديدة</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredChats.map((chat) => {
                    const chatName = getChatName(chat);
                    const chatAvatar = getChatAvatar(chat);
                    const isActive = selectedChat?.id === chat.id;
                    
                    return (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChat(chat)}
                        className={`flex items-center gap-3 p-4 cursor-pointer transition-all duration-200 ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-r-4 border-blue-500' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm ${
                            chat.type === "user_driver" ? 'bg-green-500' : 'bg-blue-500'
                          } ${isActive ? 'ring-2 ring-blue-300' : ''}`}>
                            {chatAvatar}
                          </div>
                          {(chat.unreadCount || 0) > 0 && !isActive && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                            </div>
                          )}
                        </div>

                        {/* Chat Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-bold truncate ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>
                              {chatName}
                            </h3>
                            <span className="text-xs whitespace-nowrap ml-2">
                              <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>
                                {formatChatTime(chat.lastActive)}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className={`text-sm truncate flex-1 ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                              {chat.last_message || 'ابدأ المحادثة الآن'}
                            </p>
                            {(chat.unreadCount || 0) > 0 && !isActive && (
                              <span className="ml-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
                              {chat.participants?.length || 2} مشارك
                            </span>
                            {chat.type && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                isActive 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {chat.type === "user_driver" ? "سائق" : "مستخدم"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* الجانب الأيمن - نافذة الدردشة */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm ${
                          selectedChat.type === "user_driver" ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          {getChatAvatar(selectedChat)}
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {getChatName(selectedChat)}
                          {selectedChat.type === "user_driver" && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">سائق</span>
                          )}
                        </h3>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span>متصل الآن</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <Phone size={18} className="text-gray-600" />
                      </button>
                      <button className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <Video size={18} className="text-gray-600" />
                      </button>
                      <button className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <Info size={18} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-4">
                  {messagesLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-500 text-sm">جاري تحميل الرسائل...</p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-4 border-2 border-blue-200">
                        <MessageCircle size={40} className="text-blue-400" />
                      </div>
                      <h3 className="font-bold text-gray-700 mb-2">
                        {`بداية المحادثة مع ${getChatName(selectedChat)}`}
                      </h3>
                      <p className="text-gray-500">
                        ابدأ المحادثة بإرسال رسالة
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupMessagesByDate()).map(([date, dateMessages]) => (
                        <div key={date}>
                          {/* Date Separator */}
                          <div className="flex justify-center my-6">
                            <div className="bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-full font-medium">
                              {date}
                            </div>
                          </div>
                          
                          {/* Messages */}
                          <div className="space-y-3">
                            {dateMessages.map((message) => {
                              const isCurrentUser = message.isCurrentUser;
                              const isOutgoing = message.is_outgoing || isCurrentUser;
                              
                              return (
                                <div
                                  key={message.id}
                                  className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                                      isOutgoing
                                        ? 'bg-gradient-to-r from-[#579BE8] to-[#124987] text-white rounded-br-none ml-auto'
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                    } ${message.is_temp ? 'opacity-90' : ''}`}
                                  >
                                    {/* Message Text */}
                                    <div className="whitespace-pre-wrap break-words text-sm">
                                      {message.message}
                                    </div>
                                    
                                    {/* Message Time and Status */}
                                    <div className="flex items-center justify-end gap-2 mt-2">
                                      <span className={`text-xs ${isOutgoing ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {message.formattedTime || formatMessageTime(message.created_at)}
                                      </span>
                                      
                                      {isOutgoing && (
                                        message.is_read ? (
                                          <CheckCheck size={12} className="text-green-300" />
                                        ) : (
                                          <Check size={12} className="text-blue-100 opacity-60" />
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="اكتب رسالة..."
                        className="w-full p-3 pr-12 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-[#579BE8] focus:ring-2 focus:ring-[#579BE8]/20 resize-none min-h-[44px] max-h-[120px]"
                        rows="1"
                        disabled={sending}
                      />
                      <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                        {newMessage.length}/1000
                      </div>
                    </div>

                    <button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        sending || !newMessage.trim()
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
              </>
            ) : (
              /* Empty State */
              <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                <div className="text-center max-w-md px-6">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border-8 border-white shadow-lg">
                    <MessageCircle size={56} className="text-[#579BE8]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">اختر محادثة</h3>
                  <p className="text-gray-600 mb-8">
                    اختر محادثة من القائمة على اليسار لبدء المحادثة
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setShowNewChatForm(true)}
                      className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-shadow flex flex-col items-center"
                    >
                      <Plus size={24} className="text-blue-600 mb-2" />
                      <h4 className="font-bold text-gray-800 text-sm">محادثة جديدة</h4>
                      <p className="text-xs text-gray-600">ابدأ محادثة</p>
                    </button>
                    <button
                      onClick={loadChats}
                      className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-shadow flex flex-col items-center"
                    >
                      <svg className="w-6 h-6 text-green-600 mb-2 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <h4 className="font-bold text-gray-800 text-sm">تحديث القائمة</h4>
                      <p className="text-xs text-gray-600">تحديث المحادثات</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatModal;
