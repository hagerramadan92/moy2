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
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatsContainerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const chatCreationAttemptedRef = useRef(false); // لتتبع محاولات إنشاء المحادثة
  const processedParticipantIdRef = useRef(null); // لتتبع معرف المشارك الذي تم معالجته
  const chatCreationFailedRef = useRef(null); // لتتبع معرفات المحادثات الفاشلة
  const errorShownRef = useRef(null); // لتتبع ما إذا تم عرض رسالة الخطأ

  // ألوان ثابتة للرسائل
  const MESSAGE_COLORS = {
    outgoing: {
      bg: '#579BE8', // أزرق موقعك الأساسي
      text: '#FFFFFF',
      time: 'rgba(255, 255, 255, 0.85)',
      gradient: 'linear-gradient(135deg, #579BE8 0%, #457FD6 100%)',
      shadow: '0 2px 8px rgba(87, 155, 232, 0.25)'
    },
    incoming: {
      bg: '#FFFFFF',
      text: '#1F2937',
      time: '#6B7280',
      gradient: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
      border: '1px solid #E5E7EB',
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
      // showLoginToast();
    }
  }, [isOpen, isLoggedIn]);

  // جلب المحادثات
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

  // دالة لعرض toast عند النقر على أيقونة المحادثات
  const handleChatIconClick = () => {
    if (!isLoggedIn) {
      showLoginToast();
    } else {
      messageService.showChatIconToast();
    }
  };

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
      const currentUserIdStr = String(currentUser.id); // استخدام currentUser.id
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
          isCurrentUser: String(msg.sender_id) === String(currentUser.id), // استخدام currentUser.id
          formattedTime: formatMessageTime(msg.created_at),
          is_outgoing: String(msg.sender_id) === String(currentUser.id) // استخدام currentUser.id
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
    if (selectedChat && isLoggedIn) {
      loadMessages(selectedChat.id);
      updateChatsActiveState();
    }
  }, [selectedChat, isLoggedIn]);

  const updateChatsActiveState = () => {
    setChats(prev => prev.map(chat => ({
      ...chat,
      isActive: selectedChat?.id === chat.id
    })));
  };

  // دالة مساعدة لإنشاء محادثة مع مشارك محدد (تُستخدم تلقائياً من defaultParticipantId)
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
        // لا نعيد تعيين chatCreationAttemptedRef لمنع إعادة المحاولة
      }
    } catch (error) {
      // فشل إنشاء المحادثة - وضع علامة بالفشل
      chatCreationFailedRef.current = defaultParticipantId;
      
      // لا نعرض toast هنا لأن message.service.js يعرضه بالفعل
      // فقط نضع علامة أننا عرضنا الخطأ
      errorShownRef.current = defaultParticipantId;
      
      setShowNewChatForm(false);
      // لا نعيد تعيين chatCreationAttemptedRef لمنع إعادة المحاولة
    } finally {
      setCreatingChat(false);
    }
  }, [defaultParticipantId, defaultParticipantName, creatingChat, isLoggedIn]);

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
        chatCreationAttemptedRef.current = null; // إعادة تعيين لأننا وجدنا المحادثة
        chatCreationFailedRef.current = null; // إعادة تعيين لأننا وجدنا المحادثة
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
      
      // استخدام الدالة المعدلة التي تأخذ اسم المشارك
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
        // لا نعرض toast هنا لأن message.service.js يعرضه بالفعل
        console.error('فشل إنشاء المحادثة:', result.error);
      }
    } catch (error) {
      console.error('خطأ في إنشاء المحادثة:', error);
      // لا نعرض toast هنا لأن message.service.js يعرضه بالفعل
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
        sender_id: currentUser.id, // استخدام currentUser.id
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
      return String(p) !== String(currentUser.id); // استخدام currentUser.id
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-3 md:p-4">
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
        className="relative bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl w-full h-[90vh] sm:h-[92vh] md:h-[90vh] max-w-full sm:max-w-2xl md:max-w-7xl mx-auto overflow-hidden border border-gray-300 flex flex-col md:flex-row"
      >
        {/* Mobile Header */}
        <div className="md:hidden bg-gradient-to-r from-[#579BE8] to-[#124987] text-white p-2 sm:p-3 md:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30 sm:border-2 flex items-center justify-center text-xs sm:text-sm font-semibold">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold">المحادثات</h2>
              <p className="text-[10px] sm:text-xs opacity-80 truncate max-w-[120px] sm:max-w-none">{currentUser.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0"
          >
            <X size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* الجانب الأيمن - قائمة المحادثات */}
        <div className={`${selectedChat ? 'hidden md:flex md:w-1/3' : 'flex-1 md:w-1/3'} border-l border-gray-200 flex flex-col`}>
          {/* Header - Desktop */}
          <div className="hidden md:block bg-gradient-to-r from-[#579BE8] to-[#124987] text-white p-4">
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
                  onClick={() => {
                    if (!isLoggedIn) {
                      showLoginToast();
                      return;
                    }
                    setShowNewChatForm(true);
                  }}
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

          {/* Mobile Search */}
          <div className="md:hidden p-2 sm:p-3 bg-gradient-to-r from-[#579BE8] to-[#124987] text-white">
            <div className="relative">
              <Search className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-white/60" size={14} />
              <input
                type="text"
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-8 sm:pr-10 pl-3 sm:pl-4 py-1.5 sm:py-2 text-sm sm:text-base bg-white/20 backdrop-blur-sm text-white placeholder-white/60 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 border border-white/30"
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
                <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-b from-blue-50 to-white border-b border-blue-100">
                  <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-sm border border-blue-200">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base">بدء محادثة جديدة</h3>
                      <button
                        onClick={() => {
                          setShowNewChatForm(false);
                          setParticipantId("");
                          setParticipantName("");
                        }}
                        className="text-gray-500 hover:text-gray-700 p-1"
                      >
                        <X size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div>
                        <label className="block text-xs sm:text-sm text-gray-600 mb-1">معرف المستخدم (ID)</label>
                        <input
                          type="text"
                          value={participantId}
                          onChange={(e) => setParticipantId(e.target.value)}
                          placeholder="أدخل معرف المستخدم"
                          className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#579BE8] focus:ring-2 focus:ring-[#579BE8]/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm text-gray-600 mb-1">اسم المستخدم (اختياري)</label>
                        <input
                          type="text"
                          value={participantName}
                          onChange={(e) => setParticipantName(e.target.value)}
                          placeholder="أدخل اسم المستخدم"
                          className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#579BE8] focus:ring-2 focus:ring-[#579BE8]/20"
                        />
                      </div>
                      <div className="flex gap-2 pt-1 sm:pt-2">
                        <button
                          onClick={createNewChat}
                          disabled={creatingChat || !participantId.trim()}
                          className={`flex-1 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition-all text-xs sm:text-sm ${
                            creatingChat || !participantId.trim()
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-[#579BE8] to-[#124987] text-white hover:shadow-lg'
                          }`}
                        >
                          {creatingChat ? (
                            <>
                              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>جاري الإنشاء...</span>
                            </>
                          ) : (
                            <>
                              <Plus size={12} className="sm:w-4 sm:h-4" />
                              <span>إنشاء محادثة</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 mt-1 sm:mt-2">أدخل معرف السائق أو الشخص الذي تريد التواصل معه</p>
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
              <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 md:p-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-3 sm:mb-4 border border-gray-200 sm:border-2">
                  <LogIn size={20} className="sm:w-6 sm:h-6 md:w-8 md:h-8 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">يجب تسجيل الدخول</h3>
                <p className="text-gray-500 text-center mb-4 sm:mb-6 text-xs sm:text-sm md:text-base px-2">سجل الدخول لعرض المحادثات والرسائل</p>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-[#579BE8] to-[#124987] text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-shadow flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                >
                  <LogIn size={14} className="sm:w-4 sm:h-4" />
                  <span>تسجيل الدخول</span>
                </button>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-[#579BE8] border-t-transparent"></div>
                <p className="text-gray-500 mt-2 sm:mt-3 text-xs sm:text-sm">جاري تحميل المحادثات...</p>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 md:p-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-3 sm:mb-4 border border-gray-200 sm:border-2">
                  <MessageCircle size={20} className="sm:w-6 sm:h-6 md:w-8 md:h-8 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">لا توجد محادثات</h3>
                <p className="text-gray-500 text-center mb-4 sm:mb-6 text-xs sm:text-sm md:text-base px-2">ابدأ محادثتك الأولى</p>
                <button
                  onClick={() => setShowNewChatForm(true)}
                  className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-[#579BE8] to-[#124987] text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-shadow flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                >
                  <Plus size={14} className="sm:w-4 sm:h-4" />
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
                      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 cursor-pointer transition-all duration-200 ${
                        isActive 
                          ? 'bg-blue-50 border-r-2 sm:border-r-4 border-blue-400' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base md:text-lg shadow-sm ${
                          chat.type === "user_driver" ? 'bg-green-500' : 'bg-blue-500'
                        } ${isActive ? 'ring-1 sm:ring-2 ring-blue-300' : ''}`}>
                          {chatAvatar}
                        </div>
                        {(chat.unreadCount || 0) > 0 && !isActive && (
                          <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center border border-white sm:border-2 shadow-sm">
                            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                          </div>
                        )}
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className={`font-bold truncate text-xs sm:text-sm md:text-base ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>
                            {chatName}
                          </h3>
                          <span className="text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0">
                            <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>
                              {formatChatTime(chat.lastActive)}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5 sm:mt-1 gap-1">
                          <p className={`text-[11px] sm:text-xs md:text-sm truncate flex-1 ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                            {chat.last_message || 'ابدأ المحادثة الآن'}
                          </p>
                          {(chat.unreadCount || 0) > 0 && !isActive && (
                            <span className="ml-1 sm:ml-2 bg-red-500 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                          <span className={`text-[10px] sm:text-xs ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
                            {chat.participants?.length || 2} مشارك
                          </span>
                          {chat.type && (
                            <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
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

        {/* الجانب الأيسر - نافذة الدردشة */}
        <div className={`${selectedChat ? 'flex-1 flex flex-col' : 'hidden md:flex md:flex-1 md:flex-col'} relative`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-2 sm:p-3 md:p-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 overflow-hidden">
                  {/* Back button for mobile */}
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="md:hidden w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-blue-200 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <ArrowLeft size={14} className="sm:w-4 sm:h-4 text-blue-700" />
                  </button>
                  
                  <div className="relative flex-shrink-0">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base md:text-lg shadow-sm ${
                      selectedChat.type === "user_driver" ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      {getChatAvatar(selectedChat)}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full border border-white sm:border-2"></div>
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <h3 className="font-bold text-blue-800 text-sm sm:text-base md:text-lg truncate block">
                      {getChatName(selectedChat)}
                      {selectedChat.type === "user_driver" && (
                        <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">سائق</span>
                      )}
                    </h3>
                    <div className="text-[10px] sm:text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="whitespace-nowrap">متصل الآن</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <button 
                    onClick={onClose}
                    className="md:hidden w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-blue-200 flex items-center justify-center transition-colors"
                  >
                    <X size={14} className="sm:w-4 sm:h-4 text-blue-700" />
                  </button>
                  <button className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-blue-200 items-center justify-center transition-colors">
                    <Phone size={14} className="sm:w-4 sm:h-4 text-blue-600" />
                  </button>
                  <button className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-blue-200 items-center justify-center transition-colors">
                    <Info size={14} className="sm:w-4 sm:h-4 text-blue-600" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-50 to-white p-2 sm:p-3 md:p-4"
              >
                {!isLoggedIn ? (
                  <div className="h-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-3 sm:mb-4 border border-blue-200 sm:border-2">
                      <LogIn size={24} className="sm:w-8 sm:h-8 md:w-10 md:h-10 text-blue-400" />
                    </div>
                    <h3 className="font-bold text-blue-700 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">يجب تسجيل الدخول</h3>
                    <p className="text-blue-600 text-center mb-4 sm:mb-6 text-xs sm:text-sm md:text-base px-2">سجل الدخول لعرض وإرسال الرسائل</p>
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-[#579BE8] to-[#124987] text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-shadow flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                    >
                      <LogIn size={14} className="sm:w-4 sm:h-4" />
                      <span>تسجيل الدخول</span>
                    </button>
                  </div>
                ) : messagesLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-blue-500 text-xs sm:text-sm">جاري تحميل الرسائل...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-3 sm:mb-4 border border-blue-200 sm:border-2">
                      <MessageCircle size={24} className="sm:w-8 sm:h-8 md:w-10 md:h-10 text-blue-400" />
                    </div>
                    <h3 className="font-bold text-blue-700 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">
                      {`بداية المحادثة مع ${getChatName(selectedChat)}`}
                    </h3>
                    <p className="text-blue-600 text-xs sm:text-sm md:text-base">
                      ابدأ المحادثة بإرسال رسالة
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4 md:space-y-6">
                    {Object.entries(groupMessagesByDate()).map(([date, dateMessages]) => (
                      <div key={date}>
                        {/* Date Separator */}
                        <div className="flex justify-center my-3 sm:my-4 md:my-6">
                          <div className="bg-blue-200 text-blue-700 text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full font-medium">
                            {date}
                          </div>
                        </div>
                        
                        {/* Messages */}
                        <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
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
                                  className={`max-w-[90%] sm:max-w-[85%] md:max-w-[70%] rounded-xl sm:rounded-2xl px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 shadow-sm ${
                                    isOutgoing
                                      ? 'rounded-br-none sm:rounded-br-none ml-auto'
                                      : 'rounded-bl-none sm:rounded-bl-none border border-blue-200'
                                  } ${message.is_temp ? 'opacity-90' : ''}`}
                                >
                                  {/* Message Text */}
                                  <div className="whitespace-pre-wrap break-words text-xs sm:text-sm">
                                    {message.message}
                                  </div>
                                  
                                  {/* Message Time and Status */}
                                  <div className="flex items-center justify-end gap-1.5 sm:gap-2 mt-1 sm:mt-2">
                                    <span 
                                      style={{
                                        color: isOutgoing ? MESSAGE_COLORS.outgoing.time : MESSAGE_COLORS.incoming.time
                                      }}
                                      className="text-[10px] sm:text-xs"
                                    >
                                      {message.formattedTime || formatMessageTime(message.created_at)}
                                    </span>
                                    
                                    {isOutgoing && (
                                      message.is_read ? (
                                        <CheckCheck size={10} className="sm:w-3 sm:h-3 text-green-500" />
                                      ) : (
                                        <Check size={10} className="sm:w-3 sm:h-3" style={{ color: MESSAGE_COLORS.outgoing.time }} />
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
              {isLoggedIn && selectedChat && (
                <div className="border-t border-blue-200 bg-blue-50 p-2 sm:p-3 md:p-4 flex-shrink-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="اكتب رسالة..."
                        className="w-full p-2 sm:p-2.5 md:p-3 pr-8 sm:pr-10 md:pr-12 text-sm sm:text-base bg-white border border-blue-300 rounded-lg sm:rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none min-h-[36px] sm:min-h-[40px] md:min-h-[44px] max-h-[100px] sm:max-h-[120px]"
                        rows="1"
                        disabled={sending}
                      />
                      <div className="absolute bottom-1.5 sm:bottom-2 right-2 sm:right-3 text-[10px] sm:text-xs text-blue-500">
                        {newMessage.length}/1000
                      </div>
                    </div>

                    <button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className={`w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                        sending || !newMessage.trim()
                          ? 'bg-blue-200 text-blue-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#579BE8] to-[#124987] text-white hover:shadow-lg'
                      }`}
                    >
                      {sending ? (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send size={16} className="sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
              <div className="text-center max-w-md px-3 sm:px-4 md:px-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto mb-4 sm:mb-5 md:mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center border-4 sm:border-6 md:border-8 border-white shadow-lg">
                  <MessageCircle size={32} className="sm:w-12 sm:h-12 md:w-14 md:h-14 text-blue-500" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-800 mb-2 sm:mb-3">اختر محادثة</h3>
                <p className="text-blue-600 mb-6 sm:mb-8 text-xs sm:text-sm md:text-base px-2">
                  اختر محادثة من القائمة على اليمين لبدء المحادثة
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  <button 
                    onClick={() => {
                      if (!isLoggedIn) {
                        showLoginToast();
                        return;
                      }
                      setShowNewChatForm(true);
                    }}
                    className="p-3 sm:p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg sm:rounded-xl border border-blue-200 hover:shadow-md transition-shadow flex flex-col items-center"
                  >
                    <Plus size={18} className="sm:w-6 sm:h-6 text-blue-600 mb-1.5 sm:mb-2" />
                    <h4 className="font-bold text-blue-800 text-xs sm:text-sm">محادثة جديدة</h4>
                    <p className="text-[10px] sm:text-xs text-blue-600">ابدأ محادثة</p>
                  </button>
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        // showLoginToast();
                        return;
                      }
                      loadChats();
                      handleChatIconClick();
                    }}
                    className="p-3 sm:p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg sm:rounded-xl border border-blue-200 hover:shadow-md transition-shadow flex flex-col items-center"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mb-1.5 sm:mb-2 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <h4 className="font-bold text-blue-800 text-xs sm:text-sm">تحديث القائمة</h4>
                    <p className="text-[10px] sm:text-xs text-blue-600">تحديث المحادثات</p>
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