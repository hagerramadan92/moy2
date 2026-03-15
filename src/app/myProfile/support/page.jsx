"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FaPaperPlane, FaPaperclip, FaSmile, FaInfoCircle, FaTimes, FaFile, FaDownload, FaSearch, FaCheckDouble, FaCheck } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { BiSupport } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";
import { messageService } from "../../../../Services/message.service";

import EmojiPicker from 'emoji-picker-react';
import Pusher from 'pusher-js';

export default function HelpCenterPage() {
    // States
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [chatId, setChatId] = useState(null);
    const [creatingChat, setCreatingChat] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [pusherChannel, setPusherChannel] = useState(null);
    const [currentUser, setCurrentUser] = useState({
        id: null,
        name: 'المستخدم',
        email: '',
        phone: ''
    });
    
    // Support ID States
    const [supportParticipantId, setSupportParticipantId] = useState(null);
    const [loadingSupportId, setLoadingSupportId] = useState(false);
    const [supportChat, setSupportChat] = useState(null);
    const [supportList, setSupportList] = useState([]);
    
    // Pagination
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Refs
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const searchInputRef = useRef(null);
    const attachmentMenuRef = useRef(null);
    const prevScrollHeightRef = useRef(0);
    const lastLoadedChatIdRef = useRef(null);
    const chatCreationAttemptedRef = useRef(null);
    
    // ألوان ثابتة للرسائل (مثل ChatModal)
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

    // Format message time
    const formatMessageTime = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return '';
            
            return date.toLocaleTimeString('ar-SA', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return '';
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Get file icon
    const getFileIcon = (fileType) => {
        if (!fileType) return <FaFile size={20} />;
        
        const type = fileType.toLowerCase();
        
        if (type.startsWith('image/') || type.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return <FaFile className="text-blue-500" size={20} />;
        }
        if (type.startsWith('video/') || type.match(/\.(mp4|mov|avi|mkv)$/)) {
            return <FaFile className="text-purple-500" size={20} />;
        }
        if (type.startsWith('audio/') || type.match(/\.(mp3|wav|ogg)$/)) {
            return <FaFile className="text-green-500" size={20} />;
        }
        if (type.includes('pdf') || type.match(/\.pdf$/)) {
            return <FaFile className="text-red-500" size={20} />;
        }
        if (type.includes('word') || type.includes('doc') || type.match(/\.(doc|docx)$/)) {
            return <FaFile className="text-blue-500" size={20} />;
        }
        if (type.includes('excel') || type.includes('xls') || type.match(/\.(xls|xlsx)$/)) {
            return <FaFile className="text-green-500" size={20} />;
        }
        if (type.includes('zip') || type.includes('rar') || type.match(/\.(zip|rar|7z)$/)) {
            return <FaFile className="text-yellow-600" size={20} />;
        }
        
        return <FaFile size={20} />;
    };

    // Check authentication status
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
                        id: parsedUser.id || null,
                        name: parsedUser.name || parsedUser.username || 'المستخدم',
                        email: parsedUser.email || '',
                        phone: parsedUser.phone || ''
                    });
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                setIsLoggedIn(false);
            }
        }
    }, []);

    // جلب support ID من الـ API
    const fetchSupportId = useCallback(async () => {
        if (!isLoggedIn) return null;
        
        try {
            setLoadingSupportId(true);
            const result = await messageService.getFirstSupportId();
            
            if (result.success && result.id) {
                setSupportParticipantId(result.id);
                setSupportList(result.all || []);
                
                if (typeof window !== 'undefined') {
                    localStorage.setItem('support_participant_id', result.id.toString());
                    if (result.support?.name) {
                        localStorage.setItem('support_participant_name', result.support.name);
                    }
                }
                
                return result.id;
            } else {
                if (typeof window !== 'undefined') {
                    const storedId = localStorage.getItem('support_participant_id');
                    if (storedId) {
                        setSupportParticipantId(parseInt(storedId));
                        return parseInt(storedId);
                    }
                }
                return null;
            }
        } catch (error) {
            console.error('Error fetching support ID:', error);
            return null;
        } finally {
            setLoadingSupportId(false);
        }
    }, [isLoggedIn]);

    // Check if chat is support chat
    const isSupportChat = useCallback((chat) => {
        if (!chat || !chat.participants) return false;
        
        if (!supportParticipantId) return false;
        
        return chat.participants.some(p => 
            String(p) === String(supportParticipantId) || 
            Number(p) === Number(supportParticipantId)
        );
    }, [supportParticipantId]);

    // Initialize Pusher
    const initializePusher = useCallback((chatId, chatUuid) => {
        if (!chatUuid || !isLoggedIn || !chatId) return null;
        
        try {
            if (pusherChannel) {
                pusherChannel.unbind_all();
                pusherChannel.unsubscribe();
            }
            
            const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
                authEndpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dashboard.waytmiah.com/api/v1'}/broadcasting/auth`,
                auth: {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Accept': 'application/json'
                    }
                },
                enabledTransports: ['ws', 'wss']
            });
            
            const channelName = `chat.${chatUuid}`;
            const channel = pusher.subscribe(channelName);
            
            channel.bind('MessageSent', (data) => {
                console.log('📨 New message from Pusher:', data);
                handleNewPusherMessage(data.message);
            });
            
            setPusherChannel(channel);
            return channel;
        } catch (error) {
            console.error('Pusher initialization failed:', error);
            return null;
        }
    }, [isLoggedIn, pusherChannel]);

    // Handle new Pusher message - تحسين معالجة الرسائل الجديدة
    const handleNewPusherMessage = useCallback((newMessage) => {
        if (!newMessage || !chatId) return;
        
        console.log('📨 معالجة رسالة جديدة من Pusher في Support:', newMessage);
        
        // التأكد من أن الرسالة تخص هذه المحادثة
        if (chatId && chatId === newMessage.chat_id) {
            setMessages(prevMessages => {
                // التحقق من عدم وجود الرسالة مسبقاً
                const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
                if (messageExists) {
                    return prevMessages;
                }
                
                // تنسيق الرسالة الجديدة
                const isFromCurrentUser = newMessage.sender_id === currentUser.id;
                
                const formattedMessage = {
                    id: newMessage.id,
                    type: isFromCurrentUser ? "user" : "support",
                    text: newMessage.message || newMessage.text || "",
                    time: formatMessageTime(newMessage.created_at),
                    timestamp: new Date(newMessage.created_at || newMessage.timestamp || Date.now()).getTime(),
                    is_outgoing: isFromCurrentUser,
                    isCurrentUser: isFromCurrentUser,
                    is_read: newMessage.is_read || false,
                    file: newMessage.attachments?.[0] ? {
                        url: newMessage.attachments[0].url,
                        name: newMessage.attachments[0].file_name || newMessage.attachments[0].name,
                        size: newMessage.attachments[0].size,
                        type: newMessage.attachments[0].mime_type || newMessage.attachments[0].type,
                        isImage: (newMessage.attachments[0].mime_type || '').startsWith('image/')
                    } : null
                };
                
                console.log('✅ إضافة رسالة جديدة إلى القائمة:', formattedMessage);
                
                // إضافة الرسالة الجديدة وترتيبها زمنياً
                const updatedMessages = [...prevMessages, formattedMessage];
                return updatedMessages.sort((a, b) => a.timestamp - b.timestamp);
            });
            
            // التمرير إلى أسفل عند استلام رسالة جديدة
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        } else {
            console.log('⚠️ الرسالة لا تخص المحادثة الحالية:', newMessage.chat_id, 'chatId:', chatId);
        }
    }, [chatId, currentUser.id]);

    // Create or get support chat
 // Create or get support chat
const createOrGetChat = useCallback(async () => {
    if (!isLoggedIn) {
        toast.error("يرجى تسجيل الدخول أولاً");
        return null;
    }

    if (creatingChat) return null;

    // جلب support ID إذا لم يكن موجوداً
    let currentSupportId = supportParticipantId;
    if (!currentSupportId) {
        currentSupportId = await fetchSupportId();
        if (!currentSupportId) {
            toast.error("لا يوجد دعم فني متاح حالياً");
            return null;
        }
    }

    // Check if we already attempted to create support chat
    if (chatCreationAttemptedRef.current === currentSupportId) {
        return null;
    }

    try {
        chatCreationAttemptedRef.current = currentSupportId;
        setCreatingChat(true);

        // ✅ استخدام الدالة الموجودة في service
        const result = await messageService.createChat(
            currentSupportId, 
            "user_user",
            "الدعم الفني"
        );

        if (result.success && result.chat) {
            const newChatId = result.chat.id || result.chat.chat_id;
            
            if (newChatId) {
                setChatId(newChatId);
                setSupportChat(result.chat);
                
                if (typeof window !== 'undefined') {
                    localStorage.setItem('support_chat_id', newChatId.toString());
                }
                
                return newChatId;
            }
        } else {
            console.error('Failed to create support chat:', result.error);
            
            // Try to get existing support chat from localStorage
            if (typeof window !== 'undefined') {
                const storedChatId = localStorage.getItem('support_chat_id');
                if (storedChatId) {
                    setChatId(parseInt(storedChatId));
                    return parseInt(storedChatId);
                }
            }
            return null;
        }
    } catch (error) {
        console.error('Error creating support chat:', error);
        return null;
    } finally {
        setCreatingChat(false);
    }
}, [isLoggedIn, supportParticipantId, fetchSupportId, creatingChat]);

    // Load messages
  // Load messages
const loadMessages = useCallback(async (currentChatId, page = 1, refresh = false) => {
    if (!currentChatId || !isLoggedIn) return;

    if (page === 1 && !refresh && lastLoadedChatIdRef.current === currentChatId) {
        return;
    }

    try {
        if (page === 1) {
            setMessagesLoading(true);
            lastLoadedChatIdRef.current = currentChatId;
        }

        // ✅ استخدام الدالة الموجودة في service
        const response = await messageService.getMessages(currentChatId, { 
            page,
            refresh: refresh || page === 1
        });

        if (response.success && Array.isArray(response.data)) {
            const fetchedMessages = response.data;
            
            const formattedMessages = fetchedMessages.map(msg => ({
                id: msg.id,
                type: msg.sender_id === currentUser.id ? "user" : "support",
                text: msg.message || msg.text || "",
                time: formatMessageTime(msg.created_at),
                timestamp: new Date(msg.created_at).getTime(),
                is_outgoing: msg.sender_id === currentUser.id,
                isCurrentUser: msg.sender_id === currentUser.id,
                is_read: msg.is_read || false,
                file: msg.file_url ? {
                    url: msg.file_url,
                    name: msg.file_name || 'ملف',
                    size: msg.file_size,
                    type: msg.file_type || (msg.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image/' : 'file'),
                    isImage: msg.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i),
                    isVoice: msg.message_type === 'voice'
                } : (msg.attachments?.[0] ? {
                    url: msg.attachments[0].url,
                    name: msg.attachments[0].file_name || msg.attachments[0].name,
                    size: msg.attachments[0].size,
                    type: msg.attachments[0].mime_type || msg.attachments[0].type,
                    isImage: (msg.attachments[0].mime_type || '').startsWith('image/'),
                    isVoice: msg.message_type === 'voice'
                } : null)
            }));

            const sortedMessages = formattedMessages.sort((a, b) => a.timestamp - b.timestamp);

            if (page === 1) {
                setMessages(sortedMessages);
                setCurrentPage(1);
                setHasMoreMessages(fetchedMessages.length >= 20);
                
                setTimeout(() => {
                    scrollToBottom();
                }, 300);
            } else {
                setMessages(prev => {
                    const combined = [...sortedMessages, ...prev];
                    return combined.sort((a, b) => a.timestamp - b.timestamp);
                });
                setCurrentPage(prev => prev + 1);
                setHasMoreMessages(fetchedMessages.length >= 20);
            }

            // Get chat details for Pusher initialization
            if (page === 1) {
                const chatDetails = await messageService.getChatDetails(currentChatId);
                if (chatDetails.success && chatDetails.data?.chat_uuid) {
                    initializePusher(currentChatId, chatDetails.data.chat_uuid);
                }
            }
        } else {
            if (page === 1) {
                setMessages([]);
            }
            setHasMoreMessages(false);
        }
    } catch (error) {
        console.error('Error loading messages:', error);
        if (page === 1) {
            toast.error("حدث خطأ في تحميل الرسائل");
            setMessages([]);
        }
    } finally {
        if (page === 1) {
            setMessagesLoading(false);
            setLoading(false);
        }
    }
}, [isLoggedIn, currentUser.id, initializePusher]);

    // Load more messages (pagination)
    const loadMoreMessages = async () => {
        if (!chatId || !hasMoreMessages || messagesLoading) return;

        try {
            prevScrollHeightRef.current = messagesContainerRef.current?.scrollHeight || 0;
            await loadMessages(chatId, currentPage + 1);
            
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    const newScrollHeight = messagesContainerRef.current.scrollHeight;
                    const scrollDiff = newScrollHeight - prevScrollHeightRef.current;
                    messagesContainerRef.current.scrollTop = scrollDiff;
                }
            }, 100);
        } catch (error) {
            console.error("Error loading more messages:", error);
        }
    };

    // Handle scroll to load more messages
    const handleScroll = () => {
        if (!messagesContainerRef.current) return;
        
        const { scrollTop } = messagesContainerRef.current;
        
        if (scrollTop < 100 && hasMoreMessages && !messagesLoading && !loading) {
            loadMoreMessages();
        }
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`الملف ${file.name} كبير جداً. الحد الأقصى 10 ميجابايت`);
                return false;
            }
            return true;
        });

        setSelectedFiles(prev => [...prev, ...validFiles]);
        setShowAttachmentMenu(false);
    };

    // Remove file from selection
    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

   // Upload files and send message
const uploadFilesAndSendMessage = async () => {
    if (!chatId || selectedFiles.length === 0 || !isLoggedIn) return;

    try {
        setUploadingFiles(true);
        
        const formData = new FormData();
        
        if (message.trim()) {
            formData.append('message', message);
        }
        
        // ✅ مهم: نحدد نوع الرسالة كـ file
        formData.append('message_type', 'file');

        // ✅ إضافة الملفات - كل ملف على حدة
        selectedFiles.forEach((file) => {
            formData.append('file', file); // المفتاح 'file' وليس 'files[]'
        });

        // ✅ تحضير المعاينة المؤقتة
        const attachments = selectedFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file),
            isImage: file.type.startsWith('image/'),
            pending: true
        }));

        const tempMessage = {
            id: `temp-${Date.now()}`,
            type: "user",
            text: message.trim() || (attachments.length === 1 && attachments[0].isImage ? '🖼️ صورة' : '📎 ملف'),
            time: formatMessageTime(new Date().toISOString()),
            timestamp: Date.now(),
            is_temp: true,
            is_outgoing: true,
            isCurrentUser: true,
            is_read: false,
            file: attachments[0] // أول ملف فقط للعرض المؤقت
        };

        setMessages(prev => [...prev, tempMessage]);
        setMessage("");
        setSelectedFiles([]);
        scrollToBottom();

        // ✅ استخدام الدالة الموجودة في service
        const result = await messageService.sendMessageWithAttachments(chatId, formData);

        if (result.success) {
            setMessages(prev => prev.map(msg => {
                if (msg.id === tempMessage.id) {
                    // ✅ تنسيق الرسالة حسب البيانات المرجعة من الـ API
                    const apiMessage = result.data?.message || result.message;
                    
                    return {
                        id: apiMessage?.id || msg.id,
                        type: "user",
                        text: apiMessage?.message || msg.text,
                        time: formatMessageTime(apiMessage?.created_at),
                        timestamp: new Date(apiMessage?.created_at || Date.now()).getTime(),
                        is_outgoing: true,
                        isCurrentUser: true,
                        is_temp: false,
                        is_read: apiMessage?.is_read || false,
                        file: apiMessage?.file_url ? {
                            url: apiMessage.file_url,
                            name: apiMessage.file_name || 'ملف',
                            size: apiMessage.file_size,
                            type: apiMessage.file_type || attachments[0]?.type,
                            isImage: apiMessage.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                        } : null
                    };
                }
                return msg;
            }));
        } else {
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
            setSelectedFiles(prev => [...prev, ...selectedFiles]);
            toast.error(result.error || result.message || 'فشل إرسال الرسالة');
        }
    } catch (error) {
        console.error('Error uploading files:', error);
        toast.error('حدث خطأ: ' + error.message);
    } finally {
        setUploadingFiles(false);
    }
};

// Send voice message
const sendVoiceMessage = async (audioBlob, duration) => {
    if (!chatId || !isLoggedIn) return;
    
    try {
        setUploadingFiles(true);
        
        const tempMessage = {
            id: `temp-${Date.now()}`,
            type: "user",
            text: '🎤 رسالة صوتية',
            time: formatMessageTime(new Date().toISOString()),
            timestamp: Date.now(),
            is_temp: true,
            is_outgoing: true,
            isCurrentUser: true,
            is_read: false,
            file: {
                url: URL.createObjectURL(audioBlob),
                name: 'voice-message.webm',
                size: audioBlob.size,
                type: 'audio/webm',
                isImage: false,
                isVoice: true,
                duration: duration,
                pending: true
            }
        };
        
        setMessages(prev => [...prev, tempMessage]);
        setShowVoiceRecorder(false);
        scrollToBottom();
        
        // ✅ استخدام الدالة الموجودة في service
        const result = await messageService.sendVoiceMessage(chatId, audioBlob);
        
        if (result.success) {
            setMessages(prev => prev.map(msg => {
                if (msg.id === tempMessage.id) {
                    const apiMessage = result.data?.message || result.message;
                    
                    return {
                        id: apiMessage?.id || msg.id,
                        type: "user",
                        text: '🎤 رسالة صوتية',
                        time: formatMessageTime(apiMessage?.created_at),
                        timestamp: new Date(apiMessage?.created_at || Date.now()).getTime(),
                        is_outgoing: true,
                        isCurrentUser: true,
                        is_temp: false,
                        file: apiMessage?.file_url ? {
                            url: apiMessage.file_url,
                            name: apiMessage.file_name || 'تسجيل صوتي',
                            size: apiMessage.file_size,
                            type: 'audio/webm',
                            isVoice: true,
                            duration: duration,
                            pending: false
                        } : null
                    };
                }
                return msg;
            }));
        } else {
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
            toast.error(result.error || 'فشل إرسال التسجيل الصوتي');
        }
    } catch (error) {
        console.error('Error sending voice:', error);
        toast.error('حدث خطأ في إرسال التسجيل الصوتي');
    } finally {
        setUploadingFiles(false);
    }
};

    // Send text message
    // Send text message
const handleSendMessage = async () => {
    if (!isLoggedIn) {
        toast.error("يرجى تسجيل الدخول أولاً");
        return;
    }
    
    if ((!message.trim() && selectedFiles.length === 0) || sending || uploadingFiles || !chatId) return;

    if (selectedFiles.length > 0) {
        await uploadFilesAndSendMessage();
        return;
    }

    try {
        setSending(true);
        
        const tempMessage = {
            id: `temp-${Date.now()}`,
            type: "user",
            text: message,
            time: formatMessageTime(new Date().toISOString()),
            timestamp: Date.now(),
            is_temp: true,
            is_outgoing: true,
            isCurrentUser: true,
            is_read: false
        };

        setMessages(prev => [...prev, tempMessage]);
        setMessage("");
        scrollToBottom();

        // ✅ استخدام الدالة الموجودة في service
        const result = await messageService.sendMessage(chatId, message);

        if (result.success && result.message) {
            setMessages(prev => prev.map(msg => 
                msg.id === tempMessage.id ? {
                    id: result.message.id,
                    type: "user",
                    text: result.message.message,
                    time: formatMessageTime(result.message.created_at),
                    timestamp: new Date(result.message.created_at).getTime(),
                    is_outgoing: true,
                    isCurrentUser: true,
                    is_temp: false,
                    is_read: result.message.is_read || false
                } : msg
            ));
        } else {
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
            toast.error(result.error || 'فشل إرسال الرسالة');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        toast.error('حدث خطأ في إرسال الرسالة');
    } finally {
        setSending(false);
    }
};

    // Search in messages
    const searchMessages = (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        const results = messages.filter(msg => 
            msg.text?.toLowerCase().includes(query.toLowerCase())
        );
        
        setSearchResults(results.sort((a, b) => b.timestamp - a.timestamp));
        setShowSearchResults(true);
    };

    // Handle emoji click
    const onEmojiClick = (emojiData) => {
        setMessage(prev => prev + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    // Jump to specific message
    const jumpToMessage = (messageId) => {
        const messageElement = document.getElementById(`message-${messageId}`);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            messageElement.classList.add('bg-blue-50', 'transition-colors', 'duration-1000');
            setTimeout(() => {
                messageElement.classList.remove('bg-blue-50');
            }, 2000);
        }
        setShowSearchResults(false);
        setSearchQuery("");
        setShowSearch(false);
    };

    // Scroll to bottom
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

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
            if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target)) {
                setShowAttachmentMenu(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Check authentication on mount
    useEffect(() => {
        checkAuthStatus();
        
        const handleStorageChange = (e) => {
            if (e.key === 'accessToken' || e.key === 'user' || e.key === null) {
                checkAuthStatus();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [checkAuthStatus]);

    // Initialize chat
    useEffect(() => {
        const initializeChat = async () => {
            if (!isLoggedIn) {
                setLoading(false);
                return;
            }

            const firstSupportId = await fetchSupportId();
            
            if (!firstSupportId) {
                setLoading(false);
                return;
            }

            // Check for existing chat
            if (typeof window !== 'undefined') {
                const storedChatId = localStorage.getItem('support_chat_id');
                if (storedChatId) {
                    setChatId(parseInt(storedChatId));
                    await loadMessages(parseInt(storedChatId), 1);
                } else {
                    const newChatId = await createOrGetChat();
                    if (newChatId) {
                        await loadMessages(newChatId, 1);
                    } else {
                        setLoading(false);
                    }
                }
            }
        };

        initializeChat();
        
        return () => {
            if (pusherChannel) {
                pusherChannel.unbind_all();
                pusherChannel.unsubscribe();
            }
        };
    }, [isLoggedIn]); // تشغيل مرة واحدة فقط عند تغيير حالة تسجيل الدخول

    return (
        <div className="flex flex-col h-[500px] sm:h-[600px] md:h-[700px] lg:h-[750px] bg-white dark:bg-card border border-border/60 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-sm fade-in-up p-1 sm:p-2 md:p-0">
            {/* Chat Header */}
            <div className="p-2 sm:p-3 md:p-4 border-b border-border/60 bg-secondary/5 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-[#579BE8]/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-[#579BE8]">
                            <BiSupport size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="absolute -bottom-0.5 sm:-bottom-1 -right-0.5 sm:-right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 bg-green-500 border-2 border-white dark:border-card rounded-full shadow-sm" title="متصل الآن" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-foreground text-sm sm:text-base md:text-lg truncate">
                            {loadingSupportId ? 'جاري التحميل...' : 'الدعم الفني'}
                        </h3>
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

            {/* Search Bar */}
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
                                                    {result.time} - {result.type === 'user' ? 'أنت' : 'الدعم الفني'}
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
                {messagesLoading && currentPage === 1 && (
                    <div className="flex justify-center py-2">
                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-[#579BE8]"></div>
                    </div>
                )}

                {!isLoggedIn ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <BiSupport size={32} className="text-gray-400" />
                        </div>
                        <h3 className="font-bold text-gray-700 mb-2">يجب تسجيل الدخول</h3>
                        <p className="text-gray-600 text-center mb-4">سجل الدخول للتواصل مع الدعم الفني</p>
                        <button
                            onClick={() => window.location.href = '/login'}
                            className="px-6 py-2 bg-[#579BE8] text-white rounded-lg hover:bg-[#4a8bd1] transition-colors"
                        >
                            تسجيل الدخول
                        </button>
                    </div>
                ) : loading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-2 sm:space-y-3">
                            <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 border-b-2 border-[#579BE8] mx-auto"></div>
                            <p className="text-xs sm:text-sm text-muted-foreground">جاري تحميل المحادثة...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <AnimatePresence initial={false}>
                            {messages.map((msg, index) => (
                                <motion.div
                                    id={`message-${msg.id}`}
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.type === "user" ? "justify-start" : "justify-end"}`}
                                >
                                    <div className={`max-w-[85%] sm:max-w-[80%] md:max-w-[75%] space-y-0.5 sm:space-y-1 ${msg.type === "user" ? "items-end" : "items-start"}`}>
                                        <div
                                            style={{
                                                backgroundColor: msg.type === "user" ? MESSAGE_COLORS.outgoing.bg : MESSAGE_COLORS.incoming.bg,
                                                color: msg.type === "user" ? MESSAGE_COLORS.outgoing.text : MESSAGE_COLORS.incoming.text
                                            }}
                                            className={`px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-medium shadow-sm leading-relaxed ${
                                                msg.type === "user"
                                                    ? "rounded-tl-none"
                                                    : "rounded-tr-none"
                                            } ${msg.is_temp ? "opacity-70" : ""}`}
                                        >
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
                                                            {msg.file.pending && (
                                                                <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                                                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                                                            {getFileIcon(msg.file.type)}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium truncate">{msg.file.name}</p>
                                                                {msg.file.size && (
                                                                    <p className="text-[10px] opacity-70">{formatFileSize(msg.file.size)}</p>
                                                                )}
                                                            </div>
                                                            {msg.file.url && !msg.file.pending && (
                                                                <a 
                                                                    href={msg.file.url} 
                                                                    download={msg.file.name}
                                                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <FaDownload className="w-3 h-3" />
                                                                </a>
                                                            )}
                                                            {msg.file.pending && (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-2 px-1">
                                            {msg.type === "support" && (
                                                <span className="text-[9px] sm:text-[10px] font-bold text-[#579BE8] uppercase tracking-wider">
                                                    الدعم الفني
                                                </span>
                                            )}
                                            <span className="text-[9px] sm:text-[10px] text-muted-foreground/60">{msg.time}</span>
                                            {msg.is_temp && (
                                                <span className="text-[9px] sm:text-[10px] text-muted-foreground/60">⏳</span>
                                            )}
                                            {msg.type === "user" && (
                                                msg.is_read ? (
                                                    <FaCheckDouble className="w-3 h-3 text-green-500" />
                                                ) : (
                                                    <FaCheck className="w-3 h-3 text-muted-foreground/60" />
                                                )
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Attachment Preview */}
            <AnimatePresence>
                {selectedFiles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="px-2 sm:px-3 md:px-4 pt-2 sm:pt-3"
                    >
                        <div className="bg-secondary/10 rounded-xl p-2 sm:p-3 border border-border/60">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-foreground">
                                    المرفقات ({selectedFiles.length})
                                </span>
                                <button
                                    onClick={() => {
                                        selectedFiles.forEach(file => {
                                            if (file.preview) URL.revokeObjectURL(file.preview);
                                        });
                                        setSelectedFiles([]);
                                    }}
                                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                                >
                                    <FaTimes size={14} />
                                    <span>مسح الكل</span>
                                </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                {selectedFiles.map((file, index) => {
                                    const previewUrl = URL.createObjectURL(file);
                                    
                                    return (
                                        <div
                                            key={index}
                                            className="relative group bg-white rounded-lg border border-border/60 p-2 pr-8"
                                        >
                                            <button
                                                onClick={() => {
                                                    URL.revokeObjectURL(previewUrl);
                                                    removeFile(index);
                                                }}
                                                className="absolute left-1 top-1 text-gray-400 hover:text-red-500 z-10"
                                            >
                                                <FaTimes size={14} />
                                            </button>
                                            
                                            <div className="flex items-center gap-2">
                                                {file.type.startsWith('image/') ? (
                                                    <div className="w-12 h-12 rounded overflow-hidden">
                                                        <img
                                                            src={previewUrl}
                                                            alt={file.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                                                        {getFileIcon(file.type)}
                                                    </div>
                                                )}
                                                
                                                <div className="flex-1 min-w-0 max-w-[150px]">
                                                    <p className="text-xs font-medium text-foreground truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground/60">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Bar */}
            {isLoggedIn && (
                <div className="p-2 sm:p-3 md:p-4 lg:p-5 border-t border-border/60 bg-secondary/5">
                    <div className="relative">
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

                        {/* Attachment Menu */}
                        <AnimatePresence>
                            {showAttachmentMenu && (
                                <motion.div
                                    ref={attachmentMenuRef}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="absolute bottom-full mb-2 left-0 z-50 bg-white rounded-lg shadow-xl border border-border/60 overflow-hidden"
                                >
                                    <div className="p-2 min-w-[200px]">
                                        <button
                                            onClick={() => {
                                                fileInputRef.current?.click();
                                                setShowAttachmentMenu(false);
                                            }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <FaFile className="text-[#579BE8]" size={16} />
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-gray-800">مستند</p>
                                                <p className="text-xs text-gray-500">PDF, Word, Excel</p>
                                            </div>
                                        </button>
                                        
                                        <button
                                            onClick={() => {
                                                imageInputRef.current?.click();
                                                setShowAttachmentMenu(false);
                                            }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                                <FaFile className="text-green-600" size={16} />
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-gray-800">صورة</p>
                                                <p className="text-xs text-gray-500">JPG, PNG, GIF</p>
                                            </div>
                                        </button>
                                        
                                        <button
                                            onClick={() => {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = 'video/*,audio/*';
                                                input.multiple = true;
                                                input.onchange = (e) => handleFileSelect(e);
                                                input.click();
                                                setShowAttachmentMenu(false);
                                            }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                                <FaFile className="text-purple-600" size={16} />
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-gray-800">وسائط متعددة</p>
                                                <p className="text-xs text-gray-500">فيديو, صوت</p>
                                            </div>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Hidden file inputs */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <input
                            ref={imageInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <div className="flex items-end gap-1.5 sm:gap-2 md:gap-3 bg-white dark:bg-card p-1.5 sm:p-2 rounded-2xl sm:rounded-[24px] md:rounded-[28px] border border-border/60 shadow-inner group focus-within:border-[#579BE8]/50 transition-colors">
                            <div className="flex items-center gap-0.5 sm:gap-1 pb-0.5 sm:pb-1 pr-1 sm:pr-2 flex-shrink-0">
                                <button 
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="p-1.5 sm:p-2 md:p-2.5 text-muted-foreground hover:text-[#579BE8] hover:bg-[#579BE8]/5 rounded-full transition-all"
                                >
                                    <FaSmile size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                </button>
                                <button 
                                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                                    className="p-1.5 sm:p-2 md:p-2.5 text-muted-foreground hover:text-[#579BE8] hover:bg-[#579BE8]/5 rounded-full transition-all relative"
                                    disabled={sending || uploadingFiles}
                                >
                                    <FaPaperclip size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                    {selectedFiles.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#579BE8] text-white text-xs rounded-full flex items-center justify-center">
                                            {selectedFiles.length}
                                        </span>
                                    )}
                                </button>
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
                                placeholder={sending || uploadingFiles ? "جاري الإرسال..." : "اكتب رسالتك هنا..."}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-xs sm:text-sm font-medium py-2 sm:py-2.5 md:py-3 outline-none resize-none max-h-24 sm:max-h-28 md:max-h-32 text-foreground scrollbar-none"
                                style={{ height: 'auto' }}
                                disabled={sending || uploadingFiles}
                                onInput={(e) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                            />

                            <button
                                onClick={handleSendMessage}
                                className={`p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center flex-shrink-0 ${
                                    (message.trim() || selectedFiles.length > 0) && !sending && !uploadingFiles
                                        ? "bg-[#579BE8] text-white hover:bg-[#4a8bd1] shadow-[#579BE8]/20"
                                        : "bg-secondary/40 text-muted-foreground cursor-not-allowed"
                                }`}
                                disabled={(!message.trim() && selectedFiles.length === 0) || sending || uploadingFiles}
                            >
                                {sending || uploadingFiles ? (
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
            )}
        </div>
    );
}