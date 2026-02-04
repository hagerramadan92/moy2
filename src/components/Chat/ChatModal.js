// components/Chat/ChatModal.js
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { messageService } from "../../../Services/message.service";

import { 
  X, Users, MessageCircle, Plus, Search, Clock, User, CheckCircle, 
  Phone, Video, Info, Send, Paperclip, Smile, ImageIcon, FileText, 
  Mic, ChevronLeft, Star, MoreVertical, Check, CheckCheck, Lock, 
  HeadphonesIcon, ArrowLeft, Eye, EyeOff, CircleDot, LogIn
} from "lucide-react";

const ChatModal = ({ 
  isOpen, 
  onClose, 
  currentUserId = 39, 
  defaultParticipantId = null,
  defaultParticipantName = null,
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
  const [creatingChat, setCreatingChat] = useState(false);
  const [participantId, setParticipantId] = useState(defaultParticipantId || "");
  const [participantName, setParticipantName] = useState("");
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: currentUserId,
    name: 'المستخدم',
    email: '',
    phone: ''
  });
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatsContainerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const chatCreationAttemptedRef = useRef(null);
  const processedParticipantIdRef = useRef(null);
  const chatCreationFailedRef = useRef(null);
  const errorShownRef = useRef(null);

  // ألوان ثابتة للرسائل
  const MESSAGE_COLORS = {
    outgoing: {
      bg: '#0084ff',
      text: '#FFFFFF',
      time: 'rgba(255, 255, 255, 0.9)',
      gradient: 'linear-gradient(135deg, #0084ff 0%, #0066cc 100%)',
      shadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
    },
    incoming: {
      bg: '#f0f0f0',
      text: '#050505',
      time: '#65676B',
      gradient: 'linear-gradient(135deg, #f0f0f0 0%, #e4e6eb 100%)',
      border: '1px solid #e4e6eb',
      shadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
    }
  };

  // دالة للتحقق من حالة تسجيل الدخول وتحديثها
  const checkAuthStatus = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');
        
        const isAuth = !!token;
        setIsLoggedIn(isAuth);
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setCurrentUser({
            id: parsedUser.id || currentUserId,
            name: parsedUser.name || parsedUser.username || 'المستخدم',
            email: parsedUser.email || '',
            phone: parsedUser.phone || ''
          });
        } else {
          setCurrentUser({
            id: currentUserId,
            name: 'المستخدم',
            email: '',
            phone: ''
          });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsLoggedIn(false);
        setCurrentUser({
          id: currentUserId,
          name: 'المستخدم',
          email: '',
          phone: ''
        });
      }
    }
  }, [currentUserId]);

  // جلب بيانات المستخدم والتحقق من تسجيل الدخول
  useEffect(() => {
    // التحقق فوراً عند التحميل
    checkAuthStatus();
    
    // الاستماع لتغييرات localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken' || e.key === 'user' || e.key === null) {
        checkAuthStatus();
      }
    };
    
    // الاستماع للأحداث المخصصة لتسجيل الدخول
    const handleUserLoggedIn = () => {
      checkAuthStatus();
    };
    
    const handleUserLoggedOut = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    window.addEventListener('userLoggedOut', handleUserLoggedOut);
    
    // التحقق دورياً كل ثانية (للحالات التي لا يتم فيها إطلاق events)
    const interval = setInterval(() => {
      checkAuthStatus();
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
      window.removeEventListener('userLoggedOut', handleUserLoggedOut);
      clearInterval(interval);
    };
  }, [checkAuthStatus]);
  
  // التحقق من حالة تسجيل الدخول عند فتح الـ modal
  useEffect(() => {
    if (isOpen) {
      checkAuthStatus();
    }
  }, [isOpen, checkAuthStatus]);

  // عرض toast عند فتح المحادثة إذا لم يكن مسجل دخول
  useEffect(() => {
    if (isOpen && !isLoggedIn) {
      showLoginToast();
    }
  }, [isOpen, isLoggedIn]);

  // دالة لعرض toast عند عدم تسجيل الدخول
  const showLoginToast = (customMessage = '') => {
    if (typeof window === 'undefined') return;

    // إنشاء عنصر toast
    const toast = document.createElement('div');
    toast.id = 'chat-login-toast';
    
    const message = customMessage || 'سجل الدخول لعرض المحادثات وإرسال الرسائل';
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      z-index: 100000;
      max-width: 400px;
      animation: slideInToast 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      gap: 12px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    toast.innerHTML = `
      <svg style="width: 24px; height: 24px; flex-shrink: 0;" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <div style="flex: 1;">
        <strong style="display: block; margin-bottom: 4px; font-size: 14px;">${customMessage ? 'تنبيه' : 'يجب تسجيل الدخول'}</strong>
        <span style="font-size: 13px; opacity: 0.9;">${message}</span>
      </div>
      <button id="close-chat-toast" style="background: none; border: none; color: white; cursor: pointer; opacity: 0.7; padding: 4px;">
        ✕
      </button>
    `;
    
    // إضافة CSS إذا لم يكن موجوداً
    if (!document.getElementById('chat-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'chat-toast-styles';
      style.textContent = `
        @keyframes slideInToast {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutToast {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        #chat-login-toast button:hover {
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    }
    
    // إزالة أي toast قديم
    const existingToast = document.getElementById('chat-login-toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    // إضافة الـ toast
    document.body.appendChild(toast);
    
    // زر الإغلاق
    const closeBtn = toast.querySelector('#close-chat-toast');
    closeBtn.addEventListener('click', () => {
      removeToast(toast);
    });
    
    // إزالة تلقائية بعد 6 ثوانٍ
    setTimeout(() => {
      removeToast(toast);
    }, 6000);
  };

  const removeToast = (toast) => {
    if (toast && toast.parentNode) {
      toast.style.animation = 'slideOutToast 0.3s ease-out';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  };

  // جلب المحادثات
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
      const currentUserIdStr = String(currentUser.id);
      const senderIdStr = String(msg.sender_id);
      
      return !msg.is_read && senderIdStr !== currentUserIdStr;
    }).length;
  };

  // تحميل الرسائل عند اختيار محادثة
  const loadMessages = async (chatId) => {
    if (!isLoggedIn) {
      showLoginToast();
      return;
    }
    
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
          isCurrentUser: String(msg.sender_id) === String(currentUser.id),
          formattedTime: formatMessageTime(msg.created_at),
          is_outgoing: String(msg.sender_id) === String(currentUser.id)
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

  // دالة مساعدة لإنشاء محادثة مع مشارك محدد
  const createNewChatWithParticipant = useCallback(async () => {
    if (!defaultParticipantId || creatingChat || !isLoggedIn) return;
    
    // منع التكرار: إذا تمت محاولة إنشاء المحادثة لنفس المعرف بالفعل
    if (chatCreationAttemptedRef.current === defaultParticipantId) {
      return;
    }
    
    // منع المحاولة إذا فشلت المحادثة لهذا المعرف من قبل
    if (chatCreationFailedRef.current === defaultParticipantId) {
      return;
    }
    
    try {
      // وضع علامة أننا حاولنا إنشاء المحادثة لهذا المعرف
      chatCreationAttemptedRef.current = defaultParticipantId;
      processedParticipantIdRef.current = defaultParticipantId;
      
      setCreatingChat(true);
      setShowNewChatForm(true);
      
      const result = await messageService.createChat(
        defaultParticipantId, 
        "user_user", 
        defaultParticipantName || defaultParticipantId
      );
      
      if (result.success) {
        // نجح إنشاء المحادثة - إزالة من قائمة الفاشلة
        chatCreationFailedRef.current = null;
        errorShownRef.current = null;
        
        // إعادة تحميل المحادثات مباشرة
        try {
          setLoading(true);
          const response = await messageService.getChats();
          
          if (response.success && Array.isArray(response.data)) {
            setChats(response.data);
            setFilteredChats(response.data);
          }
        } catch (loadError) {
          console.error('خطأ في تحميل المحادثات:', loadError);
        } finally {
          setLoading(false);
        }
        
        if (result.chat) {
          setSelectedChat(result.chat);
          setShowNewChatForm(false);
        } else {
          const newChatsResponse = await messageService.getChats();
          if (newChatsResponse.success && Array.isArray(newChatsResponse.data)) {
            const foundChat = newChatsResponse.data.find(chat => 
              chat.participants?.includes(defaultParticipantId) ||
              chat.participants?.includes(Number(defaultParticipantId)) ||
              chat.participants?.includes(String(defaultParticipantId))
            );
            
            if (foundChat) {
              setSelectedChat(foundChat);
              setShowNewChatForm(false);
            }
          }
        }
      } else {
        // فشل إنشاء المحادثة - وضع علامة بالفشل
        chatCreationFailedRef.current = defaultParticipantId;
        
        // لا نعرض toast هنا لأن message.service.js يعرضه بالفعل
        // فقط نضع علامة أننا عرضنا الخطأ
        errorShownRef.current = defaultParticipantId;
        
        setShowNewChatForm(false);
      }
    } catch (error) {
      // فشل إنشاء المحادثة - وضع علامة بالفشل
      chatCreationFailedRef.current = defaultParticipantId;
      
      // لا نعرض toast هنا لأن message.service.js يعرضه بالفعل
      // فقط نضع علامة أننا عرضنا الخطأ
      errorShownRef.current = defaultParticipantId;
      
      setShowNewChatForm(false);
    } finally {
      setCreatingChat(false);
    }
  }, [defaultParticipantId, defaultParticipantName, creatingChat, isLoggedIn]);

  // إنشاء محادثة جديدة
  const createNewChat = async () => {
    if (!isLoggedIn) {
      showLoginToast();
      return;
    }
    
    if (!participantId.trim()) {
      showLoginToast("يرجى إدخال معرف المستخدم");
      return;
    }

    try {
      setCreatingChat(true);
      
      const result = await messageService.createChat(
        participantId, 
        "user_user", 
        participantName || participantId
      );
      
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
        setParticipantName("");
      } else {
        console.error('فشل إنشاء المحادثة:', result.error);
      }
    } catch (error) {
      console.error('خطأ في إنشاء المحادثة:', error);
    } finally {
      setCreatingChat(false);
    }
  };

  // إرسال رسالة
  const sendMessage = async () => {
    if (!isLoggedIn) {
      showLoginToast();
      return;
    }
    
    if (!newMessage.trim() || sending || !selectedChat) return;

    try {
      setSending(true);
      
      // إنشاء رسالة مؤقتة
      const tempMessage = {
        id: `temp-${Date.now()}`,
        message: newMessage,
        sender_id: currentUser.id,
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
        console.error('فشل إرسال الرسالة:', result.error);
      }

    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
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
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
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
      return String(p) !== String(currentUser.id);
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

  // جلب المحادثات عند فتح الـ modal
  useEffect(() => {
    if (isOpen && isLoggedIn) {
      loadChats();
    } else if (isOpen && !isLoggedIn) {
      setLoading(false);
      setChats([]);
      setFilteredChats([]);
    }
  }, [isOpen, isLoggedIn]);

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

  // تحديث participantId و participantName عند تغيير defaultParticipantId
  useEffect(() => {
    if (defaultParticipantId) {
      setParticipantId(defaultParticipantId);
      if (defaultParticipantName) {
        setParticipantName(defaultParticipantName);
      }
    }
  }, [defaultParticipantId, defaultParticipantName]);

  // تحديث عند اختيار محادثة
  useEffect(() => {
    if (selectedChat && isLoggedIn) {
      loadMessages(selectedChat.id);
      setChats(prev => prev.map(chat => ({
        ...chat,
        isActive: selectedChat?.id === chat.id
      })));
    }
  }, [selectedChat, isLoggedIn]);

  // فتح محادثة جديدة تلقائياً إذا كان هناك معرف مشارك
  useEffect(() => {
    // إعادة تعيين المرجع عند إغلاق الـ modal
    if (!isOpen) {
      chatCreationAttemptedRef.current = null;
      processedParticipantIdRef.current = null;
      chatCreationFailedRef.current = null;
      errorShownRef.current = null;
      return;
    }
    
    // إذا تغير defaultParticipantId، إعادة تعيين المراجع
    if (processedParticipantIdRef.current !== defaultParticipantId) {
      chatCreationAttemptedRef.current = null;
      chatCreationFailedRef.current = null;
      errorShownRef.current = null;
    }
    
    if (isOpen && isLoggedIn && defaultParticipantId && chats.length > 0 && !loading && !creatingChat) {
      // منع التكرار: إذا تمت معالجة هذا المعرف بالفعل أو فشل من قبل
      if (
        (processedParticipantIdRef.current === defaultParticipantId && chatCreationAttemptedRef.current === defaultParticipantId) ||
        chatCreationFailedRef.current === defaultParticipantId
      ) {
        return;
      }
      
      const existingChat = chats.find(chat => 
        chat.participants?.includes(defaultParticipantId) ||
        chat.participants?.includes(Number(defaultParticipantId)) ||
        chat.participants?.includes(String(defaultParticipantId))
      );
      
      if (existingChat) {
        setSelectedChat(existingChat);
        setShowNewChatForm(false);
        processedParticipantIdRef.current = defaultParticipantId;
        chatCreationAttemptedRef.current = null;
        chatCreationFailedRef.current = null;
        errorShownRef.current = null;
      } else {
        // إنشاء المحادثة تلقائياً فقط إذا لم نحاول من قبل ولم تفشل من قبل
        if (
          chatCreationAttemptedRef.current !== defaultParticipantId &&
          chatCreationFailedRef.current !== defaultParticipantId
        ) {
          createNewChatWithParticipant();
        }
      }
    }
  }, [isOpen, chats, loading, defaultParticipantId, defaultParticipantName, isLoggedIn, creatingChat, createNewChatWithParticipant]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white w-full h-full md:w-[95%] md:h-[90vh] md:max-w-7xl md:mx-auto md:mt-5 md:rounded-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Sidebar - قائمة المحادثات */}
        <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} md:w-[400px] flex-col h-full border-r border-gray-200`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="text-blue-600" size={20} />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">المحادثات</h2>
                <p className="text-sm text-gray-500">{currentUser.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (!isLoggedIn) {
                    showLoginToast();
                    return;
                  }
                  setShowNewChatForm(true);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="محادثة جديدة"
              >
                <Plus size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="بحث في المحادثات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="overflow-hidden border-b border-gray-200"
              >
                <div className="p-4 bg-blue-50">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800">بدء محادثة جديدة</h3>
                      <button
                        onClick={() => {
                          setShowNewChatForm(false);
                          setParticipantId("");
                          setParticipantName("");
                        }}
                        className="text-gray-500 hover:text-gray-700 p-1"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">معرف المستخدم (ID)</label>
                        <input
                          type="text"
                          value={participantId}
                          onChange={(e) => setParticipantId(e.target.value)}
                          placeholder="أدخل معرف المستخدم"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">اسم المستخدم (اختياري)</label>
                        <input
                          type="text"
                          value={participantName}
                          onChange={(e) => setParticipantName(e.target.value)}
                          placeholder="أدخل اسم المستخدم"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={createNewChat}
                          disabled={creatingChat || !participantId.trim()}
                          className={`flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                            creatingChat || !participantId.trim()
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {creatingChat ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>جاري الإنشاء...</span>
                            </>
                          ) : (
                            <>
                              <Plus size={18} />
                              <span>إنشاء محادثة</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">أدخل معرف السائق أو الشخص الذي تريد التواصل معه</p>
                    </div>
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
            {!isLoggedIn ? (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 border border-gray-200">
                  <LogIn size={32} className="text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-700 mb-2">يجب تسجيل الدخول</h3>
                <p className="text-gray-500 text-center mb-6">سجل الدخول لعرض المحادثات والرسائل</p>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <LogIn size={18} />
                  <span>تسجيل الدخول</span>
                </button>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                <p className="text-gray-500 mt-3">جاري تحميل المحادثات...</p>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 border border-gray-200">
                  <MessageCircle size={32} className="text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-700 mb-2">لا توجد محادثات</h3>
                <p className="text-gray-500 text-center mb-6">ابدأ محادثتك الأولى</p>
                <button
                  onClick={() => setShowNewChatForm(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
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
                        <div className="flex items-center justify-between gap-1">
                          <h3 className={`font-bold truncate ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>
                            {chatName}
                          </h3>
                          <span className="text-xs whitespace-nowrap flex-shrink-0">
                            <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>
                              {formatChatTime(chat.lastActive)}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1 gap-1">
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

        {/* Main Chat Area */}
        <div className={`${selectedChat ? 'flex-1 flex flex-col' : 'hidden md:flex md:flex-1 md:flex-col'} h-full`}>
          {selectedChat ? (
            <>
              {/* Chat Header - ثابت */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                  {/* Back button for mobile */}
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="md:hidden w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <ArrowLeft size={18} className="text-gray-700" />
                  </button>
                  
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-sm ${
                      selectedChat.type === "user_driver" ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      {getChatAvatar(selectedChat)}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                  </div>
                  
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <h3 className="font-bold text-gray-800 truncate">
                      {getChatName(selectedChat)}
                      {selectedChat.type === "user_driver" && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full whitespace-nowrap">سائق</span>
                      )}
                    </h3>
                    <div className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="whitespace-nowrap">متصل الآن</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button 
                    onClick={onClose}
                    className="md:hidden w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <X size={18} className="text-gray-700" />
                  </button>
                  <button className="hidden sm:flex w-10 h-10 rounded-full hover:bg-gray-100 items-center justify-center transition-colors">
                    <Phone size={18} className="text-gray-600" />
                  </button>
                  <button className="hidden sm:flex w-10 h-10 rounded-full hover:bg-gray-100 items-center justify-center transition-colors">
                    <Info size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages Area - قابل للتمرير */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto bg-gray-50 p-4"
              >
                {!isLoggedIn ? (
                  <div className="h-full flex flex-col items-center justify-center p-8">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4 border border-gray-200">
                      <LogIn size={32} className="text-gray-400" />
                    </div>
                    <h3 className="font-bold text-gray-700 mb-2">يجب تسجيل الدخول</h3>
                    <p className="text-gray-500 text-center mb-6">سجل الدخول لعرض وإرسال الرسائل</p>
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <LogIn size={18} />
                      <span>تسجيل الدخول</span>
                    </button>
                  </div>
                ) : messagesLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-blue-500">جاري تحميل الرسائل...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4 border border-gray-200">
                      <MessageCircle size={32} className="text-gray-400" />
                    </div>
                    <h3 className="font-bold text-gray-700 mb-2">
                      {`بداية المحادثة مع ${getChatName(selectedChat)}`}
                    </h3>
                    <p className="text-gray-600">
                      ابدأ المحادثة بإرسال رسالة
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupMessagesByDate()).map(([date, dateMessages]) => (
                      <div key={date}>
                        {/* Date Separator */}
                        <div className="flex justify-center my-6">
                          <div className="bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-full font-medium">
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
                                  style={{
                                    backgroundColor: isOutgoing ? MESSAGE_COLORS.outgoing.bg : MESSAGE_COLORS.incoming.bg,
                                    color: isOutgoing ? MESSAGE_COLORS.outgoing.text : MESSAGE_COLORS.incoming.text
                                  }}
                                  className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                                    isOutgoing
                                      ? 'rounded-br-none ml-auto'
                                      : 'rounded-bl-none border border-gray-200'
                                  } ${message.is_temp ? 'opacity-90' : ''}`}
                                >
                                  {/* Message Text */}
                                  <div className="whitespace-pre-wrap break-words">
                                    {message.message}
                                  </div>
                                  
                                  {/* Message Time and Status */}
                                  <div className="flex items-center justify-end gap-2 mt-2">
                                    <span 
                                      style={{
                                        color: isOutgoing ? MESSAGE_COLORS.outgoing.time : MESSAGE_COLORS.incoming.time
                                      }}
                                      className="text-xs"
                                    >
                                      {message.formattedTime || formatMessageTime(message.created_at)}
                                    </span>
                                    
                                    {isOutgoing && (
                                      message.is_read ? (
                                        <CheckCheck size={12} className="text-green-500" />
                                      ) : (
                                        <Check size={12} />
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

              {/* Input Area - ثابت */}
              {isLoggedIn && selectedChat && (
                <div className="border-t border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <textarea
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="اكتب رسالة..."
                        className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows="1"
                        disabled={sending}
                      />
                    </div>

                    <button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className={`p-3 rounded-lg transition-all flex-shrink-0 ${
                        sending || !newMessage.trim()
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
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
              )}
            </>
          ) : (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center bg-gray-50">
              <div className="text-center max-w-md px-6">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center border-8 border-white shadow-lg">
                  <MessageCircle size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">اختر محادثة</h3>
                <p className="text-gray-600 mb-8 px-2">
                  اختر محادثة من القائمة على اليمين لبدء المحادثة
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button 
                    onClick={() => {
                      if (!isLoggedIn) {
                        showLoginToast();
                        return;
                      }
                      setShowNewChatForm(true);
                    }}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center"
                  >
                    <Plus size={24} className="text-blue-600 mb-2" />
                    <h4 className="font-bold text-gray-800">محادثة جديدة</h4>
                    <p className="text-sm text-gray-600">ابدأ محادثة</p>
                  </button>
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        showLoginToast();
                        return;
                      }
                      loadChats();
                    }}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center"
                  >
                    <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <h4 className="font-bold text-gray-800">تحديث القائمة</h4>
                    <p className="text-sm text-gray-600">تحديث المحادثات</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ChatModal;