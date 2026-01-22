// components/Chat/ChatModal.js
"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Users, 
  MessageCircle, 
  Plus, 
  Search, 
  Clock, 
  User, 
  CheckCircle, 
  Phone, 
  Video, 
  Info,
  Send,
  Paperclip,
  Smile,
  ImageIcon,
  FileText,
  Mic,
  ChevronLeft,
  Star,
  MoreVertical,
  Check,
  CheckCheck,
  Lock,
  HeadphonesIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { messageService } from "../../../Services/message.service";

const ChatModal = ({ isOpen, onClose, currentUserId = 39, onStartSupport, defaultParticipantId = null }) => {
  // States
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [creatingChat, setCreatingChat] = useState(false);
  const [participantId, setParticipantId] = useState(defaultParticipantId || "");
  const [showParticipantInput, setShowParticipantInput] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // دعم فني افتراضي (مثل شخص عادي)
  const supportUser = {
    id: "support",
    name: "الدعم الفني - مويا",
    avatar: "/support-avatar.png",
    isOnline: true,
    isSupport: true,
    description: "فريق الدعم الفني متاح 24/7",
    lastSeen: "دقيقة واحدة",
    rating: 4.9,
    status: "متصل الآن"
  };

  // جلب المحادثات
  useEffect(() => {
    if (isOpen) {
      loadChats();
      // إضافة الدعم الفني كأول محادثة
      addSupportChat();
    }
  }, [isOpen]);

  // فتح محادثة جديدة تلقائياً إذا لم توجد محادثات وكان هناك معرف مشارك
  useEffect(() => {
    if (isOpen && defaultParticipantId && chats.length === 0 && !loading) {
      const timer = setTimeout(() => {
        openNewChat(defaultParticipantId);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, chats, loading, defaultParticipantId]);

  const addSupportChat = () => {
    const supportChat = {
      id: "support-chat",
      other_user: supportUser,
      last_message: {
        message: "مرحباً! كيف يمكنني مساعدتك؟",
        time: new Date().toISOString()
      },
      unread_count: 0,
      is_online: true,
      last_message_time: "الآن",
      created_at: new Date().toISOString()
    };

    setChats(prev => [supportChat, ...prev]);
  };

  const loadChats = async () => {
    try {
      setLoading(true);
      const allChats = await messageService.getChats();
      
      // تحويل الوقت ليكون صحيحاً
      const formattedChats = Array.isArray(allChats) ? allChats.map(chat => ({
        ...chat,
        last_message_time: formatChatTime(chat.last_message?.time || chat.created_at),
        last_message: {
          ...chat.last_message,
          time: chat.last_message?.time || chat.created_at
        }
      })) : [];
      
      setChats(formattedChats);
      
      // إذا لم توجد محادثات، عرض واجهة إنشاء محادثة
      if (formattedChats.length === 0 && defaultParticipantId) {
        setShowParticipantInput(true);
      }
    } catch (error) {
      console.error('خطأ في جلب المحادثات:', error);
      setChats([]);
      setShowParticipantInput(true);
    } finally {
      setLoading(false);
    }
  };

  // تحميل الرسائل عند اختيار محادثة
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
      markAsRead(selectedChat.id);
      // محاكاة الكتابة بعد 2 ثانية
      setTimeout(() => {
        setTyping(Math.random() > 0.5);
      }, 2000);
    }
  }, [selectedChat]);

  const loadMessages = async (chatId) => {
    try {
      if (chatId === "support-chat") {
        // رسائل افتراضية للدعم (مرتبة من الأقدم للأحدث)
        const supportMessages = [
          {
            id: 1,
            message: "مرحباً! كيف يمكنني مساعدتك؟",
            sender_id: "support",
            isCurrentUser: false,
            time: new Date(Date.now() - 300000).toISOString(),
            created_at: new Date(Date.now() - 300000).toISOString(),
            is_read: true,
            sender_name: "الدعم الفني"
          },
          {
            id: 2,
            message: "هل تحتاج مساعدة في طلبك؟",
            sender_id: "support",
            isCurrentUser: false,
            time: new Date(Date.now() - 180000).toISOString(),
            created_at: new Date(Date.now() - 180000).toISOString(),
            is_read: true,
            sender_name: "الدعم الفني"
          }
        ];
        // ترتيب من الأقدم للأحدث
        setMessages(supportMessages);
      } else {
        const msgs = await messageService.getMessages(chatId);
        if (Array.isArray(msgs)) {
          // ترتيب الرسائل من الأقدم للأحدث
          const sortedMessages = msgs.sort((a, b) => {
            const timeA = new Date(a.time || a.created_at || 0).getTime();
            const timeB = new Date(b.time || b.created_at || 0).getTime();
            return timeA - timeB; // ترتيب تصاعدي (من الأقدم للأحدث)
          });
          
          const formattedMsgs = sortedMessages.map(msg => ({
            ...msg,
            time: msg.time || msg.created_at,
            is_read: msg.is_read || false,
            isCurrentUser: msg.sender_id == currentUserId
          }));
          setMessages(formattedMsgs);
        } else {
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('خطأ في تحميل الرسائل:', error);
      setMessages([]);
    }
  };

  // إنشاء محادثة جديدة
  const createNewChat = async (participantId) => {
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
        const newChats = await messageService.getChats();
        if (Array.isArray(newChats)) {
          const formattedNewChats = newChats.map(chat => ({
            ...chat,
            last_message_time: formatChatTime(chat.last_message?.time || chat.created_at),
            last_message: {
              ...chat.last_message,
              time: chat.last_message?.time || chat.created_at
            }
          }));
          
          // محاولة العثور على المحادثة الجديدة
          const foundChat = formattedNewChats.find(chat => 
            chat.other_user?.id == participantId || 
            chat.id === result.chat?.id
          );
          
          if (foundChat) {
            setSelectedChat(foundChat);
          } else if (formattedNewChats.length > 0) {
            // إذا لم نتمكن من العثور على المحادثة المحددة، نختار الأولى
            setSelectedChat(formattedNewChats[0]);
          }
          
          setChats(formattedNewChats);
          setShowParticipantInput(false);
        }
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

  // فتح محادثة جديدة مباشرة
  const openNewChat = async (participantId) => {
    if (!participantId) return;
    
    setParticipantId(participantId);
    await createNewChat(participantId);
  };

  // إرسال رسالة
  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !selectedChat) return;

    try {
      setSending(true);
      
      // رسالة مؤقتة باللون الأزرق (للمستخدم الحالي)
      const tempMessage = {
        id: `temp-${Date.now()}`,
        message: newMessage,
        sender_id: currentUserId,
        isCurrentUser: true,
        is_temp: true,
        time: new Date().toISOString(),
        created_at: new Date().toISOString(),
        is_read: false,
        sender_name: 'أنت'
      };

      // إضافة الرسالة المؤقتة مع الحفاظ على الترتيب (الأقدم للأحدث)
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");
      scrollToBottom();

      // إرسال حقيقي إذا لم يكن دعم
      if (selectedChat.id !== "support-chat") {
        const result = await messageService.sendMessage(selectedChat.id, newMessage);
        if (result.success) {
          // استبدال الرسالة المؤقتة بالرسالة الحقيقية مع الحفاظ على الترتيب
          setMessages(prev => {
            const newMessages = prev.map(msg => 
              msg.id === tempMessage.id ? result.message : msg
            );
            // إعادة الترتيب من الأقدم للأحدث
            return newMessages.sort((a, b) => {
              const timeA = new Date(a.time || a.created_at || 0).getTime();
              const timeB = new Date(b.time || b.created_at || 0).getTime();
              return timeA - timeB;
            });
          });
        }
      } else {
        // محاكاة رد الدعم الفني
        simulateSupportReply();
      }

    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
    } finally {
      setSending(false);
    }
  };

  const simulateSupportReply = () => {
    const replies = [
      "شكراً لتواصلك معنا!",
      "يمكنك إخباري بمشكلتك وسأحاول مساعدتك",
      "هل يمكنك توضيح المشكلة أكثر؟",
      "أنا هنا لمساعدتك على مدار الساعة",
      "سأقوم بتوجيه مشكلتك للقسم المختص",
      "هل تريد تحديث حالة طلبك؟",
      "يمكنني مساعدتك في تتبع شحنتك",
      "هل تحتاج إلى تغيير عنوان التسليم؟"
    ];
    
    setTimeout(() => {
      setTyping(false);
      const reply = replies[Math.floor(Math.random() * replies.length)];
      const supportMessage = {
        id: `support-${Date.now()}`,
        message: reply,
        sender_id: "support",
        isCurrentUser: false,
        time: new Date().toISOString(),
        created_at: new Date().toISOString(),
        is_read: false,
        sender_name: "الدعم الفني"
      };
      // إضافة رسالة الدعم مع الحفاظ على الترتيب
      setMessages(prev => {
        const newMessages = [...prev, supportMessage];
        // ترتيب من الأقدم للأحدث
        return newMessages.sort((a, b) => {
          const timeA = new Date(a.time || a.created_at || 0).getTime();
          const timeB = new Date(b.time || b.created_at || 0).getTime();
          return timeA - timeB;
        });
      });
      scrollToBottom();
      
      // زيادة عدد الرسائل غير المقروءة
      setUnreadCounts(prev => ({
        ...prev,
        "support-chat": (prev["support-chat"] || 0) + 1
      }));
    }, 1500 + Math.random() * 2000);
  };

  const markAsRead = (chatId) => {
    setUnreadCounts(prev => ({
      ...prev,
      [chatId]: 0
    }));
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
      return date.toLocaleDateString('ar-SA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const getMessageDate = (timestamp) => {
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

  // تجميع الرسائل حسب التاريخ مع الحفاظ على الترتيب
  const groupMessagesByDate = () => {
    const groups = {};
    // التأكد من أن الرسائل مرتبة من الأقدم للأحدث
    const sortedMessages = [...messages].sort((a, b) => {
      const timeA = new Date(a.time || a.created_at || 0).getTime();
      const timeB = new Date(b.time || b.created_at || 0).getTime();
      return timeA - timeB;
    });
    
    sortedMessages.forEach(message => {
      const date = getMessageDate(message.time);
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
    });
    return groups;
  };

  // دالة لعرض الرسالة بشكل ثابت مع التاريخ
  const MessageWithDate = ({ message, isCurrentUser }) => {
    const messageDate = formatMessageDate(message.time);
    
    return (
      <div className="mb-3">
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${isCurrentUser
            ? 'bg-gradient-to-r from-[#579BE8] to-[#124987] text-white rounded-br-none ml-auto'
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
          } ${message.is_temp ? 'opacity-90' : ''}`}
        >
          {/* نص الرسالة الكامل بدون تقطيع */}
          <div className="whitespace-pre-wrap break-words text-sm">
            {message.message}
          </div>
          
          {/* وقت الرسالة */}
          <div className="flex items-center justify-end gap-2 mt-2">
            <span className={`text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
              {formatMessageTime(message.time)}
            </span>
            {isCurrentUser && (
              message.is_read ? (
                <CheckCheck size={12} className="text-blue-100" />
              ) : (
                <Check size={12} className="text-blue-100 opacity-60" />
              )
            )}
          </div>
        </div>
        
        {/* التاريخ تحت الرسالة - يظهر دائماً */}
        <div className={`mt-1 px-2 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {messageDate}
          </span>
        </div>
      </div>
    );
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

      {/* Modal Content - تصميم شبيه بالواتساب */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl mx-4 h-[85vh] overflow-hidden"
      >
        <div className="flex h-full">
          {/* الجانب الأيسر - قائمة المحادثات */}
          <div className={`w-full md:w-1/3 lg:w-2/5 border-r border-gray-200 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#579BE8] to-[#124987] text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <MessageCircle size={20} />
                  </div>
                  <h2 className="text-lg font-bold">المحادثات</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowParticipantInput(true)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                  >
                    <Plus size={16} />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                    <Users size={16} />
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
                  className="w-full pr-10 pl-4 py-2.5 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
            </div>

            {/* عرض واجهة إنشاء محادثة إذا لم توجد محادثات */}
            {showParticipantInput && (
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
                      onClick={() => createNewChat(participantId)}
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
                    onClick={() => setShowParticipantInput(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 mt-2"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {/* Chats List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#579BE8] border-t-transparent"></div>
                  <p className="text-gray-500 mt-3">جاري تحميل المحادثات...</p>
                </div>
              ) : chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-4">
                    <MessageCircle size={32} className="text-gray-400" />
                  </div>
                  <h3 className="font-bold text-gray-700 mb-2">لا توجد محادثات</h3>
                  <p className="text-gray-500 text-center mb-6">ابدأ محادثتك الأولى</p>
                  <button
                    onClick={() => setShowParticipantInput(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[#579BE8] to-[#124987] text-white rounded-xl hover:shadow-lg transition-shadow flex items-center gap-2"
                  >
                    <Plus size={18} />
                    <span>بدء محادثة جديدة</span>
                  </button>
                  <button
                    onClick={() => setSelectedChat(chats.find(c => c.id === "support-chat"))}
                    className="px-6 py-3 mt-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-shadow flex items-center gap-2"
                  >
                    <HeadphonesIcon size={18} />
                    <span>التواصل مع الدعم الفني</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedChat?.id === chat.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      {/* Avatar with Status */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50">
                          {chat.other_user?.avatar ? (
                            <img src={chat.other_user.avatar} alt={chat.other_user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {chat.other_user?.isSupport ? (
                                <HeadphonesIcon size={20} className="text-blue-600" />
                              ) : (
                                <User size={20} className="text-blue-600" />
                              )}
                            </div>
                          )}
                        </div>
                        {chat.is_online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                        {chat.other_user?.isSupport && (
                          <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle size={10} className="text-white" />
                          </div>
                        )}
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-800 truncate">
                            {chat.other_user?.name || `محادثة ${chat.id}`}
                          </h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatChatTime(chat.last_message?.time)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-600 truncate flex-1">
                            {chat.last_message?.message || 'لا توجد رسائل'}
                          </p>
                          {(unreadCounts[chat.id] > 0) && (
                            <span className="ml-2 bg-[#579BE8] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                              {unreadCounts[chat.id]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* الجانب الأيمن - نافذة الدردشة */}
          <div className={`flex-1 flex flex-col ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-[#579BE8]/10 to-[#124987]/10 border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedChat(null)}
                        className="md:hidden w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                      >
                        <ChevronLeft size={20} className="text-gray-600" />
                      </button>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50">
                            {selectedChat.other_user?.avatar ? (
                              <img src={selectedChat.other_user.avatar} alt={selectedChat.other_user.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {selectedChat.other_user?.isSupport ? (
                                  <HeadphonesIcon size={18} className="text-blue-600" />
                                ) : (
                                  <User size={18} className="text-blue-600" />
                                )}
                              </div>
                            )}
                          </div>
                          {selectedChat.is_online && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {selectedChat.other_user?.name}
                            {selectedChat.other_user?.isSupport && (
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">الدعم</span>
                            )}
                          </h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            {selectedChat.is_online ? (
                              <>
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                <span>متصل الآن</span>
                              </>
                            ) : (
                              <span>آخر ظهور {selectedChat.other_user?.lastSeen}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center">
                        <Phone size={18} className="text-gray-600" />
                      </button>
                      <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center">
                        <Video size={18} className="text-gray-600" />
                      </button>
                      <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center">
                        <Info size={18} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100 p-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-4">
                        {selectedChat.other_user?.isSupport ? (
                          <HeadphonesIcon size={40} className="text-blue-400" />
                        ) : (
                          <MessageCircle size={40} className="text-blue-400" />
                        )}
                      </div>
                      <h3 className="font-bold text-gray-700 mb-2">
                        {selectedChat.other_user?.isSupport 
                          ? "مرحباً بك في دردشة الدعم الفني" 
                          : `بداية المحادثة مع ${selectedChat.other_user?.name}`
                        }
                      </h3>
                      <p className="text-gray-500">
                        {selectedChat.other_user?.isSupport
                          ? "فريق الدعم جاهز للإجابة على استفساراتك"
                          : "ابدأ المحادثة بإرسال رسالة"
                        }
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
                          
                          {/* عرض جميع رسائل هذا اليوم مرتبة من الأقدم للأحدث */}
                          <div className="space-y-4">
                            {dateMessages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                              >
                                <MessageWithDate 
                                  message={message} 
                                  isCurrentUser={message.isCurrentUser} 
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Typing Indicator */}
                      {typing && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    {/* Message Input */}
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

                    {/* Send Button */}
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
              /* Empty State - عند عدم وجود محادثة محددة */
              <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                <div className="text-center max-w-md px-6">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border-8 border-white shadow-lg">
                    <MessageCircle size={56} className="text-[#579BE8]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">مرحباً في المحادثات</h3>
                  <p className="text-gray-600 mb-8">
                    اختر محادثة من القائمة لبدء التواصل مع فريق الدعم أو المستخدمين الآخرين
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setShowParticipantInput(true)}
                      className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-shadow"
                    >
                      <Plus size={24} className="text-blue-600 mb-2" />
                      <h4 className="font-bold text-gray-800 text-sm">محادثة جديدة</h4>
                      <p className="text-xs text-gray-600">ابدأ محادثة</p>
                    </button>
                    <button
                      onClick={() => {
                        const supportChat = chats.find(c => c.id === "support-chat");
                        if (supportChat) setSelectedChat(supportChat);
                      }}
                      className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-shadow"
                    >
                      <HeadphonesIcon size={24} className="text-green-600 mb-2" />
                      <h4 className="font-bold text-gray-800 text-sm">الدعم الفني</h4>
                      <p className="text-xs text-gray-600">متاح 24/7</p>
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