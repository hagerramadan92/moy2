"use client";

import { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaPaperclip, FaSmile, FaInfoCircle, FaTimes, FaFile, FaDownload, FaSearch } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { BiSupport } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { messageService } from "../../../../Services/message.service";
import EmojiPicker from 'emoji-picker-react';

const PARTICIPANT_ID = 189; // Participant/User ID for support

export default function HelpCenterPage() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [sending, setSending] = useState(false);
    const [chatId, setChatId] = useState(null);
    const [creatingChat, setCreatingChat] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const searchInputRef = useRef(null);
    const prevScrollHeightRef = useRef(0);
    const isFirstLoadRef = useRef(true);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Format time from ISO string or timestamp
    const formatTime = (dateString) => {
        if (!dateString) return new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
        
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return dateString;
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Create chat first if not exists
    const createOrGetChat = async () => {
        try {
            setCreatingChat(true);
            
            // التحقق من تسجيل الدخول أولاً
            const isAuthenticated = messageService.checkAuthStatus();
            if (!isAuthenticated) {
                toast.error("يرجى تسجيل الدخول أولاً");
                return null;
            }
            
            const result = await messageService.createChat(PARTICIPANT_ID, "user_user");
            
            if (result.success && result.chat) {
                const newChatId = result.chat.id || result.chat.chat_id;
                if (newChatId) {
                    setChatId(newChatId);
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('support_chat_id', newChatId.toString());
                    }
                    return newChatId;
                }
            } else {
                throw new Error(result.error || result.userMessage || 'فشل إنشاء المحادثة');
            }
        } catch (error) {
            console.error("Error creating chat:", error);
            toast.error(error.message || "حدث خطأ في إنشاء المحادثة");
            
            // Try to get chat ID from localStorage if creation fails
            if (typeof window !== 'undefined') {
                const storedChatId = localStorage.getItem('support_chat_id');
                if (storedChatId) {
                    setChatId(parseInt(storedChatId));
                    return parseInt(storedChatId);
                }
            }
            return null;
        } finally {
            setCreatingChat(false);
        }
    };

    // Format message from API
    const formatMessage = (msg) => {
        const currentUserId = typeof window !== 'undefined' 
            ? parseInt(localStorage.getItem('userId') || localStorage.getItem('user_id') || '0') 
            : 0;
        
        const isUser = msg.sender_type === "App\\Models\\User" || 
                      msg.sender_type === "user" ||
                      msg.isCurrentUser === true ||
                      (msg.sender_id && currentUserId > 0 && msg.sender_id === currentUserId);
        
        // Check if message contains file
        const hasFile = msg.file_url || msg.file_path || msg.file || msg.attachment;
        const fileData = hasFile ? {
            url: msg.file_url || msg.file_path || msg.file,
            name: msg.file_name || msg.original_name || 'ملف مرفق',
            size: msg.file_size,
            type: msg.file_type || msg.mime_type,
            isImage: (msg.file_type || msg.mime_type || '').startsWith('image/')
        } : null;
        
        return {
            id: msg.id || msg.message_id || Date.now(),
            type: isUser ? "user" : "support",
            text: msg.message || msg.text || "",
            time: formatTime(msg.created_at || msg.createdAt || msg.timestamp),
            timestamp: new Date(msg.created_at || msg.createdAt || msg.timestamp).getTime(), // للتريب
            file: fileData,
            raw: msg
        };
    };

    // ترتيب الرسائل تصاعدياً (الأقدم أولاً)
    const sortMessagesAscending = (messagesArray) => {
        return [...messagesArray].sort((a, b) => {
            // إذا كان فيه timestamp نستخدمه، وإلا نستخدم id
            const timeA = a.timestamp || a.id;
            const timeB = b.timestamp || b.id;
            return timeA - timeB; // تصاعدي: الأقدم أولاً
        });
    };

    // ترتيب الرسائل تنازلياً (الأحدث أولاً) - للبحث وغيره
    const sortMessagesDescending = (messagesArray) => {
        return [...messagesArray].sort((a, b) => {
            const timeA = a.timestamp || a.id;
            const timeB = b.timestamp || b.id;
            return timeB - timeA; // تنازلي: الأحدث أولاً
        });
    };

    // Load more messages (pagination)
    const loadMoreMessages = async () => {
        if (!chatId || !hasMoreMessages || loadingMore) return;

        try {
            setLoadingMore(true);
            prevScrollHeightRef.current = messagesContainerRef.current?.scrollHeight || 0;

            const response = await messageService.getMessages(chatId, { 
                page: currentPage + 1,
                refresh: false 
            });
            
            if (response.success && Array.isArray(response.data)) {
                const fetchedMessages = response.data;
                
                if (fetchedMessages.length > 0) {
                    const formattedMessages = fetchedMessages.map(formatMessage);
                    
                    // ترتيب الرسائل الجديدة تصاعدياً ثم دمجها مع الرسائل الحالية
                    const sortedNewMessages = sortMessagesAscending(formattedMessages);
                    
                    // دمج الرسائل (القديمة + الجديدة) مع الحفاظ على الترتيب التصاعدي
                    setMessages(prev => {
                        const combined = [...prev, ...sortedNewMessages];
                        return sortMessagesAscending(combined);
                    });
                    
                    setCurrentPage(prev => prev + 1);
                    setHasMoreMessages(fetchedMessages.length >= 20);
                    
                    // Maintain scroll position
                    setTimeout(() => {
                        if (messagesContainerRef.current) {
                            const newScrollHeight = messagesContainerRef.current.scrollHeight;
                            const scrollDiff = newScrollHeight - prevScrollHeightRef.current;
                            messagesContainerRef.current.scrollTop = scrollDiff;
                        }
                    }, 100);
                } else {
                    setHasMoreMessages(false);
                }
            } else {
                setHasMoreMessages(false);
            }
        } catch (error) {
            console.error("Error loading more messages:", error);
            toast.error("حدث خطأ في تحميل المزيد من الرسائل");
        } finally {
            setLoadingMore(false);
        }
    };

    // Handle scroll to load more messages
    const handleScroll = () => {
        if (!messagesContainerRef.current) return;
        
        const { scrollTop } = messagesContainerRef.current;
        
        // Load more when scrolled near the top
        if (scrollTop < 100 && hasMoreMessages && !loadingMore && !loading) {
            loadMoreMessages();
        }
    };

    // Fetch messages from API
    const fetchMessages = async (currentChatId = null, page = 1) => {
        try {
            if (page === 1) setLoading(true);
            
            const chatIdToUse = currentChatId || chatId;
            if (!chatIdToUse) {
                const newChatId = await createOrGetChat();
                if (!newChatId) {
                    throw new Error('لا يمكن الوصول للمحادثة');
                }
                return fetchMessages(newChatId);
            }
            
            const response = await messageService.getMessages(chatIdToUse, { 
                page,
                refresh: page === 1
            });
            
            if (response.success && Array.isArray(response.data)) {
                const fetchedMessages = response.data;
                
                if (fetchedMessages.length > 0) {
                    const formattedMessages = fetchedMessages.map(formatMessage);
                    
                    // ترتيب الرسائل تصاعدياً (الأقدم أولاً)
                    const sortedMessages = sortMessagesAscending(formattedMessages);
                    
                    if (page === 1) {
                        setMessages(sortedMessages);
                        setCurrentPage(1);
                        setHasMoreMessages(fetchedMessages.length >= 20);
                        
                        // التمرير للأسفل بعد التحميل الأول
                        if (isFirstLoadRef.current) {
                            setTimeout(() => scrollToBottom(), 300);
                            isFirstLoadRef.current = false;
                        }
                    } else {
                        // للصفحات الإضافية، ندمج مع الحفاظ على الترتيب
                        setMessages(prev => {
                            const combined = [...sortedMessages, ...prev];
                            return sortMessagesAscending(combined);
                        });
                    }
                } else {
                    if (page === 1) {
                        // رسالة ترحيب إذا كانت المحادثة فارغة
                        const welcomeMessage = {
                            id: 1,
                            type: "support",
                            text: "مرحباً بك في مركز المساعدة! كيف يمكننا خدمتك اليوم؟",
                            time: formatTime(new Date()),
                            timestamp: Date.now()
                        };
                        setMessages([welcomeMessage]);
                    }
                    setHasMoreMessages(false);
                }
            } else {
                if (page === 1) {
                    const welcomeMessage = {
                        id: 1,
                        type: "support",
                        text: "مرحباً بك في مركز المساعدة! كيف يمكننا خدمتك اليوم؟",
                        time: formatTime(new Date()),
                        timestamp: Date.now()
                    };
                    setMessages([welcomeMessage]);
                }
                setHasMoreMessages(false);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            if (page === 1) {
                toast.error("حدث خطأ في تحميل الرسائل");
                const welcomeMessage = {
                    id: 1,
                    type: "support",
                    text: "مرحباً بك في مركز المساعدة! كيف يمكننا خدمتك اليوم؟",
                    time: formatTime(new Date()),
                    timestamp: Date.now()
                };
                setMessages([welcomeMessage]);
            }
        } finally {
            if (page === 1) setLoading(false);
        }
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("حجم الملف يجب أن لا يتجاوز 10 ميجابايت");
            return;
        }

        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    // Clear selected file
    const clearSelectedFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Send message with file
    const handleSendFile = async () => {
        if (!selectedFile || sending) return;

        setSending(true);
        setUploadProgress(0);

        let currentChatId = chatId;
        if (!currentChatId) {
            currentChatId = await createOrGetChat();
            if (!currentChatId) {
                toast.error("لا يمكن إرسال الملف. يرجى المحاولة مرة أخرى.");
                setSending(false);
                return;
            }
        }

        // Simulate upload progress
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 200);

        // Create FormData
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('message', selectedFile.type.startsWith('image/') ? '📷 صورة' : '📎 ملف');
        formData.append('message_type', 'file');

        // Create optimistic message
        const tempMessage = {
            id: `temp-${Date.now()}`,
            type: "user",
            text: selectedFile.type.startsWith('image/') ? "📷 صورة" : "📎 ملف",
            time: formatTime(new Date()),
            timestamp: Date.now(),
            isTemp: true,
            file: {
                name: selectedFile.name,
                size: selectedFile.size,
                type: selectedFile.type,
                isImage: selectedFile.type.startsWith('image/'),
                preview: filePreview
            }
        };

        // إضافة الرسالة المؤقتة مع الحفاظ على الترتيب
        setMessages(prev => {
            const newMessages = [...prev, tempMessage];
            return sortMessagesAscending(newMessages);
        });
        
        scrollToBottom();

        try {
            const response = await messageService.sendMessageWithAttachments(currentChatId, formData);

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (response.success) {
                const sentMessage = response.data?.message || response.message;
                
                if (sentMessage && (sentMessage.id || sentMessage.message_id)) {
                    const formattedMessage = formatMessage(sentMessage);
                    
                    setMessages(prev => {
                        // إزالة الرسالة المؤقتة وإضافة الرسالة الحقيقية
                        const filtered = prev.filter(msg => msg.id !== tempMessage.id);
                        const newMessages = [...filtered, formattedMessage];
                        return sortMessagesAscending(newMessages);
                    });
                }

                clearSelectedFile();
                toast.success("تم إرسال الملف بنجاح");

                // Fetch latest messages after a delay
                setTimeout(() => {
                    fetchMessages(currentChatId);
                }, 1500);
            } else {
                throw new Error(response.error || response.message || 'فشل إرسال الملف');
            }
        } catch (error) {
            clearInterval(progressInterval);
            console.error("Error sending file:", error);
            toast.error(error.message || "فشل إرسال الملف. يرجى المحاولة مرة أخرى.");
            
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        } finally {
            setSending(false);
            setUploadProgress(0);
        }
    };

    // Send text message
    const handleSendMessage = async () => {
        if (!message.trim() || sending) return;

        const messageText = message.trim();
        setMessage("");
        setSending(true);

        let currentChatId = chatId;
        if (!currentChatId) {
            currentChatId = await createOrGetChat();
            if (!currentChatId) {
                toast.error("لا يمكن إرسال الرسالة. يرجى المحاولة مرة أخرى.");
                setSending(false);
                setMessage(messageText);
                return;
            }
        }

        // Create optimistic message
        const tempMessage = {
            id: `temp-${Date.now()}`,
            type: "user",
            text: messageText,
            time: formatTime(new Date()),
            timestamp: Date.now(),
            isTemp: true
        };

        // إضافة الرسالة المؤقتة مع الحفاظ على الترتيب
        setMessages(prev => {
            const newMessages = [...prev, tempMessage];
            return sortMessagesAscending(newMessages);
        });
        
        scrollToBottom();

        try {
            const response = await messageService.sendMessage(currentChatId, {
                message: messageText,
                message_type: "text"
            });

            if (response.success) {
                const sentMessage = response.data?.message || response.message || response.data;
                
                if (sentMessage && (sentMessage.id || sentMessage.message_id)) {
                    const formattedMessage = formatMessage(sentMessage);
                    
                    setMessages(prev => {
                        // إزالة الرسالة المؤقتة وإضافة الرسالة الحقيقية
                        const filtered = prev.filter(msg => msg.id !== tempMessage.id);
                        const newMessages = [...filtered, formattedMessage];
                        return sortMessagesAscending(newMessages);
                    });
                } else {
                    // إذا لم نستلم الرسالة الحقيقية، نزيل علامة temp فقط
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === tempMessage.id
                                ? { ...msg, isTemp: false }
                                : msg
                        )
                    );
                }

                // Fetch latest messages after a delay
                setTimeout(() => {
                    fetchMessages(currentChatId);
                }, 1000);
            } else {
                throw new Error(response.error || response.message || 'فشل إرسال الرسالة');
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error(error.message || "فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.");
            
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        } finally {
            setSending(false);
        }
    };

    // Search in messages (يبحث في الرسائل المرتبة تصاعدياً)
    const searchMessages = (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        // للبحث نعرض النتائج مرتبة تنازلياً (الأحدث أولاً)
        const results = messages.filter(msg => 
            msg.text.toLowerCase().includes(query.toLowerCase())
        );
        
        setSearchResults(sortMessagesDescending(results));
        setShowSearchResults(true);
    };

    // Handle emoji click
    const onEmojiClick = (emojiObject) => {
        setMessage(prev => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    // Jump to specific message
    const jumpToMessage = (messageId) => {
        const messageElement = document.getElementById(`message-${messageId}`);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            messageElement.classList.add('bg-[#579BE8]/10', 'transition-colors', 'duration-1000');
            setTimeout(() => {
                messageElement.classList.remove('bg-[#579BE8]/10');
            }, 2000);
        }
        setShowSearchResults(false);
        setSearchQuery("");
        setShowSearch(false);
    };

    // Scroll to bottom (آخر رسالة)
    const scrollToBottom = () => {
        setTimeout(() => {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
    };

    // Initialize chat and fetch messages
    useEffect(() => {
        const initializeChat = async () => {
            // Check authentication first
            const isAuthenticated = messageService.checkAuthStatus();
            if (!isAuthenticated) {
                setLoading(false);
                toast.error("يرجى تسجيل الدخول للتواصل مع الدعم الفني");
                return;
            }

            if (typeof window !== 'undefined') {
                const storedChatId = localStorage.getItem('support_chat_id');
                if (storedChatId) {
                    setChatId(parseInt(storedChatId));
                    await fetchMessages(parseInt(storedChatId));
                } else {
                    const newChatId = await createOrGetChat();
                    if (newChatId) {
                        await fetchMessages(newChatId);
                    } else {
                        setLoading(false);
                    }
                }
            }
        };

        initializeChat();
        
        // Polling only when user is at bottom
        const interval = setInterval(() => {
            if (chatId && messagesContainerRef.current && messageService.checkAuthStatus()) {
                const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
                const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
                
                if (isAtBottom) {
                    fetchMessages(chatId);
                }
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [chatId]);

    return (
        <div className="flex flex-col h-[500px] sm:h-[600px] md:h-[700px] lg:h-[750px] bg-white dark:bg-card border border-border/60 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-sm fade-in-up p-1 sm:p-2 md:p-0">
            {/* Chat Header - نفس الكود السابق */}
            <div className="p-2 sm:p-3 md:p-4 border-b border-border/60 bg-secondary/5 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-[#579BE8]/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-[#579BE8]">
                            <BiSupport size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="absolute -bottom-0.5 sm:-bottom-1 -right-0.5 sm:-right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 bg-green-500 border-2 border-white dark:border-card rounded-full shadow-sm" title="متصل الآن" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-foreground text-sm sm:text-base md:text-lg truncate">فريق الدعم الفني</h3>
                        <p className="text-[10px] sm:text-xs text-green-500 font-medium truncate">متصل الآن - جاهزون لمساعدتك</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
                    <button 
                        onClick={() => {
                            setShowSearch(!showSearch);
                            if (!showSearch) {
                                setTimeout(() => searchInputRef.current?.focus(), 100);
                            } else {
                                setSearchQuery("");
                                setShowSearchResults(false);
                            }
                        }}
                        className="p-1.5 sm:p-2 md:p-2.5 hover:bg-white dark:hover:bg-card rounded-lg sm:rounded-xl border border-transparent hover:border-border transition-all text-muted-foreground hover:text-primary"
                    >
                        <IoIosSearch size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </button>
                    <button className="p-1.5 sm:p-2 md:p-2.5 hover:bg-white dark:hover:bg-card rounded-lg sm:rounded-xl border border-transparent hover:border-border transition-all text-muted-foreground hover:text-primary">
                        <FaInfoCircle size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </button>
                </div>
            </div>

            {/* Search Bar - نفس الكود السابق */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-b border-border/60 bg-secondary/5 overflow-hidden"
                    >
                        <div className="p-2 sm:p-3">
                            <div className="relative">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        searchMessages(e.target.value);
                                    }}
                                    placeholder="ابحث في المحادثة..."
                                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-9 sm:pr-10 bg-white dark:bg-card border border-border/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#579BE8]/50 transition-colors"
                                />
                                <FaSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                {searchQuery && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery("");
                                            setShowSearchResults(false);
                                        }}
                                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground"
                                    >
                                        <FaTimes size={12} className="sm:w-3 sm:h-3" />
                                    </button>
                                )}
                            </div>

                            {/* Search Results */}
                            <AnimatePresence>
                                {showSearchResults && searchResults.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-2 max-h-40 overflow-y-auto bg-white dark:bg-card rounded-xl border border-border/60 shadow-lg"
                                    >
                                        {searchResults.map((result) => (
                                            <button
                                                key={result.id}
                                                onClick={() => jumpToMessage(result.id)}
                                                className="w-full text-right px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-[#579BE8]/10 transition-colors border-b border-border/60 last:border-0"
                                            >
                                                <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-1">
                                                    {result.text}
                                                </p>
                                                <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-0.5">
                                                    {result.time} - {result.type === 'user' ? 'أنت' : 'الدعم'}
                                                </p>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                                {showSearchResults && searchQuery && searchResults.length === 0 && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center text-xs text-muted-foreground/60 mt-2"
                                    >
                                        لا توجد نتائج للبحث
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages Area */}
            <div 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 scrollbar-thin scrollbar-thumb-secondary"
            >
                {/* Loading more indicator */}
                {loadingMore && (
                    <div className="flex justify-center py-2">
                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-[#579BE8]"></div>
                    </div>
                )}

                {loading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-2 sm:space-y-3">
                            <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 border-b-2 border-[#579BE8] mx-auto"></div>
                            <p className="text-xs sm:text-sm text-muted-foreground">جاري تحميل الرسائل...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <AnimatePresence initial={false}>
                            {messages.map((msg, index) => (
                                <motion.div
                                    id={`message-${msg.id}`}
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: msg.isTemp ? 0.7 : 1, y: 0, scale: 1 }}
                                    className={`flex ${msg.type === "user" ? "justify-start" : "justify-end"}`}
                                >
                                    <div className={`max-w-[85%] sm:max-w-[80%] md:max-w-[75%] space-y-0.5 sm:space-y-1 ${msg.type === "user" ? "items-end" : "items-start"}`}>
                                        <div
                                            className={`px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3.5 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-medium shadow-sm leading-relaxed ${
                                                msg.type === "user"
                                                    ? "bg-[#579BE8] text-white rounded-tl-none"
                                                    : "bg-secondary/40 text-foreground rounded-tr-none"
                                            } ${msg.isTemp ? "opacity-70" : ""}`}
                                        >
                                            {/* File attachment */}
                                            {msg.file && (
                                                <div className="mb-2">
                                                    {msg.file.isImage ? (
                                                        <div className="relative group">
                                                            <img 
                                                                src={msg.file.url || msg.file.preview} 
                                                                alt={msg.file.name}
                                                                className="max-w-full max-h-48 sm:max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                                onClick={() => window.open(msg.file.url || msg.file.preview, '_blank')}
                                                            />
                                                            <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full">
                                                                {msg.file.name}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                                                            <FaFile className="w-4 h-4 sm:w-5 sm:h-5" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium truncate">{msg.file.name}</p>
                                                                {msg.file.size && (
                                                                    <p className="text-[10px] opacity-70">{formatFileSize(msg.file.size)}</p>
                                                                )}
                                                            </div>
                                                            {msg.file.url && (
                                                                <a 
                                                                    href={msg.file.url} 
                                                                    download={msg.file.name}
                                                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <FaDownload className="w-3 h-3" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {/* Message text */}
                                            {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                                            
                                            {msg.isTemp && (
                                                <span className="mr-1 sm:mr-2 text-[10px] sm:text-xs opacity-60">⏳</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-2 px-1">
                                            {msg.type === "support" && (
                                                <span className="text-[9px] sm:text-[10px] font-bold text-[#579BE8] uppercase tracking-wider">الدعم</span>
                                            )}
                                            <span className="text-[9px] sm:text-[10px] text-muted-foreground/60">{msg.time}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* المؤشر للتمرير للأسفل */}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* File Preview - نفس الكود السابق */}
            <AnimatePresence>
                {selectedFile && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="px-2 sm:px-3 md:px-4 pt-2 sm:pt-3"
                    >
                        <div className="relative bg-secondary/10 rounded-xl p-2 sm:p-3 border border-border/60">
                            <button
                                onClick={clearSelectedFile}
                                className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md z-10"
                            >
                                <FaTimes size={10} className="sm:w-3 sm:h-3" />
                            </button>
                            
                            {filePreview ? (
                                <div className="relative">
                                    <img 
                                        src={filePreview} 
                                        alt="Preview" 
                                        className="max-h-32 sm:max-h-40 rounded-lg mx-auto"
                                    />
                                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 text-center truncate">
                                        {selectedFile.name}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <FaFile className="w-5 h-5 sm:w-6 sm:h-6 text-[#579BE8]" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium truncate">{selectedFile.name}</p>
                                        <p className="text-[10px] sm:text-xs text-muted-foreground/60">{formatFileSize(selectedFile.size)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Upload Progress */}
                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <div className="mt-2">
                                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-[#579BE8] transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-center text-muted-foreground/60 mt-1">
                                        جاري الرفع... {uploadProgress}%
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleSendFile}
                                disabled={sending || uploadProgress > 0}
                                className="mt-2 w-full bg-[#579BE8] text-white py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-[#4a8bd1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                إرسال الملف
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Bar - نفس الكود السابق */}
            <div className="p-2 sm:p-3 md:p-4 lg:p-5 border-t border-border/60 bg-secondary/5">
                <div className="relative">
                    {/* Emoji Picker */}
                    <AnimatePresence>
                        {showEmojiPicker && (
                            <motion.div
                                ref={emojiPickerRef}
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute bottom-full mb-2 left-0 sm:left-auto sm:right-0 z-50"
                            >
                                <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-border/60 overflow-hidden">
                                    <EmojiPicker
                                        onEmojiClick={onEmojiClick}
                                        autoFocusSearch={false}
                                        theme="light"
                                        height={350}
                                        width={300}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-end gap-1.5 sm:gap-2 md:gap-3 bg-white dark:bg-card p-1.5 sm:p-2 rounded-2xl sm:rounded-[24px] md:rounded-[28px] border border-border/60 shadow-inner group focus-within:border-[#579BE8]/50 transition-colors">
                        <div className="flex items-center gap-0.5 sm:gap-1 pb-0.5 sm:pb-1 pr-1 sm:pr-2 flex-shrink-0">
                            <button 
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="p-1.5 sm:p-2 md:p-2.5 text-muted-foreground hover:text-[#579BE8] hover:bg-[#579BE8]/5 rounded-full transition-all"
                            >
                                <FaSmile size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                            </button>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-1.5 sm:p-2 md:p-2.5 text-muted-foreground hover:text-[#579BE8] hover:bg-[#579BE8]/5 rounded-full transition-all"
                                disabled={sending}
                            >
                                <FaPaperclip size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileSelect}
                                className="hidden"
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                            />
                        </div>

                        <textarea
                            rows={1}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder={sending ? "جاري الإرسال..." : "اكتب رسالتك هنا..."}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-xs sm:text-sm font-medium py-2 sm:py-2.5 md:py-3 outline-none resize-none max-h-24 sm:max-h-28 md:max-h-32 text-foreground scrollbar-none"
                            style={{ height: 'auto' }}
                            disabled={sending}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                        />

                        <button
                            onClick={handleSendMessage}
                            className={`p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center flex-shrink-0 ${
                                (message.trim() || selectedFile) && !sending
                                    ? "bg-[#579BE8] text-white hover:bg-[#4a8bd1] shadow-[#579BE8]/20"
                                    : "bg-secondary/40 text-muted-foreground cursor-not-allowed"
                            }`}
                            disabled={(!message.trim() && !selectedFile) || sending}
                        >
                            {sending ? (
                                <div className="animate-spin rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 border-b-2 border-white"></div>
                            ) : (
                                <FaPaperPlane size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] sm:translate-x-[-1px]" />
                            )}
                        </button>
                    </div>
                </div>
                <p className="text-center text-[9px] sm:text-[10px] text-muted-foreground/60 mt-2 sm:mt-3 font-medium px-2">
                    سيقوم فريقنا بالرد عليك في أقرب وقت ممكن. نحن هنا لمساعدتك دائماً.
                </p>
            </div>
        </div>
    );
}