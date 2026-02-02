"use client";

import { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaPaperclip, FaSmile, FaInfoCircle } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { BiSupport } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { messageService } from "../../../../Services/message.service";

const PARTICIPANT_ID = 189; // Participant/User ID for support

export default function HelpCenterPage() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [chatId, setChatId] = useState(null);
    const [creatingChat, setCreatingChat] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

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

    // Create chat first if not exists
    const createOrGetChat = async () => {
        try {
            setCreatingChat(true);
            
            // Create chat using messageService
            const result = await messageService.createChat(PARTICIPANT_ID, "user_user");
            
            if (result.success && result.chat) {
                const newChatId = result.chat.id || result.chat.chat_id;
                if (newChatId) {
                    setChatId(newChatId);
                    // Store chat ID in localStorage for persistence
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('support_chat_id', newChatId.toString());
                    }
                    return newChatId;
                }
            } else {
                throw new Error(result.error || 'فشل إنشاء المحادثة');
            }
        } catch (error) {
            console.error("Error creating chat:", error);
            toast.error("حدث خطأ في إنشاء المحادثة");
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

    // Fetch messages from API using messageService
    const fetchMessages = async (currentChatId = null) => {
        try {
            setLoading(true);
            
            const chatIdToUse = currentChatId || chatId;
            if (!chatIdToUse) {
                // If no chat ID, create chat first
                const newChatId = await createOrGetChat();
                if (!newChatId) {
                    throw new Error('لا يمكن الوصول للمحادثة');
                }
                return fetchMessages(newChatId);
            }
            
            // Use messageService.getMessages like in FloatingChatIcon.js
            const response = await messageService.getMessages(chatIdToUse);
            
            if (response.success && Array.isArray(response.data)) {
                const fetchedMessages = response.data;
                
                if (fetchedMessages.length > 0) {
                    // Map API messages to component format
                    const formattedMessages = fetchedMessages.map((msg) => {
                        // Determine message type based on sender
                        // Get current user ID from localStorage or token
                        const currentUserId = typeof window !== 'undefined' 
                            ? parseInt(localStorage.getItem('userId') || localStorage.getItem('user_id') || '0') 
                            : 0;
                        
                        // Message is from user if sender_id matches current user ID
                        // Otherwise it's from support (participant_id 189)
                        const isUser = msg.sender_type === "App\\Models\\User" || 
                                      msg.sender_type === "user" ||
                                      msg.isCurrentUser === true ||
                                      (msg.sender_id && currentUserId > 0 && msg.sender_id === currentUserId);
                        
                        return {
                            id: msg.id || msg.message_id || Date.now(),
                            type: isUser ? "user" : "support",
                            text: msg.message || msg.text || "",
                            time: formatTime(msg.created_at || msg.createdAt || msg.timestamp),
                            raw: msg // Keep raw data for reference
                        };
                    });
                    
                    setMessages(formattedMessages);
                } else {
                    // If no messages, show welcome message
                    setMessages([
                        {
                            id: 1,
                            type: "support",
                            text: "مرحباً بك في مركز المساعدة! كيف يمكننا خدمتك اليوم؟",
                            time: formatTime(new Date())
                        }
                    ]);
                }
            } else {
                // If response is not successful or no data
                setMessages([
                    {
                        id: 1,
                        type: "support",
                        text: "مرحباً بك في مركز المساعدة! كيف يمكننا خدمتك اليوم؟",
                        time: formatTime(new Date())
                    }
                ]);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("حدث خطأ في تحميل الرسائل");
            // Show welcome message on error
            setMessages([
                {
                    id: 1,
                    type: "support",
                    text: "مرحباً بك في مركز المساعدة! كيف يمكننا خدمتك اليوم؟",
                    time: formatTime(new Date())
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Send message
    const handleSendMessage = async () => {
        if (!message.trim() || sending) return;

        const messageText = message.trim();
        setMessage("");
        setSending(true);

        // Ensure we have a chat ID
        let currentChatId = chatId;
        if (!currentChatId) {
            // Create chat if doesn't exist
            currentChatId = await createOrGetChat();
            if (!currentChatId) {
                toast.error("لا يمكن إرسال الرسالة. يرجى المحاولة مرة أخرى.");
                setSending(false);
                setMessage(messageText); // Restore message
                return;
            }
        }

        // Create optimistic message
        const tempMessage = {
            id: `temp-${Date.now()}`,
            type: "user",
            text: messageText,
            time: formatTime(new Date()),
            isTemp: true
        };

        setMessages(prev => [...prev, tempMessage]);
        scrollToBottom();

        try {
            // Use messageService.sendMessage - body should be: { message, message_type, file }
            const response = await messageService.sendMessage(currentChatId, {
                message: messageText,
                message_type: "text"
            });

            if (response.success) {
                // Get the sent message from response
                // Response structure: { status: "success", message: { id, message, sender_id, ... } }
                const sentMessage = response.data?.message || response.message || response.data;
                
                // Replace temp message with real one
                if (sentMessage && (sentMessage.id || sentMessage.message_id)) {
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === tempMessage.id
                                ? {
                                    id: sentMessage.id || sentMessage.message_id,
                                    type: "user",
                                    text: sentMessage.message || sentMessage.text || messageText,
                                    time: formatTime(sentMessage.created_at || sentMessage.createdAt),
                                    raw: sentMessage
                                }
                                : msg
                        )
                    );
                } else {
                    // If response doesn't have id, just remove temp flag
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === tempMessage.id
                                ? { ...msg, isTemp: false }
                                : msg
                        )
                    );
                }

                // Fetch latest messages to get support response if any
                setTimeout(() => {
                    fetchMessages(currentChatId);
                }, 1000);
            } else {
                throw new Error(response.error || 'فشل إرسال الرسالة');
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error(error.message || "فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.");
            
            // Remove temp message on error
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        } finally {
            setSending(false);
        }
    };

    // Scroll to bottom of messages
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
            // Check if chat ID exists in localStorage
            if (typeof window !== 'undefined') {
                const storedChatId = localStorage.getItem('support_chat_id');
                if (storedChatId) {
                    setChatId(parseInt(storedChatId));
                    await fetchMessages(parseInt(storedChatId));
                } else {
                    // Create new chat
                    const newChatId = await createOrGetChat();
                    if (newChatId) {
                        await fetchMessages(newChatId);
                    }
                }
            }
        };

        initializeChat();
        
        // Poll for new messages every 5 seconds (only if chatId exists)
        const interval = setInterval(() => {
            if (chatId) {
                fetchMessages(chatId);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [chatId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
                        <h3 className="font-bold text-foreground text-sm sm:text-base md:text-lg truncate">فريق الدعم الفني</h3>
                        <p className="text-[10px] sm:text-xs text-green-500 font-medium truncate">متصل الآن - جاهزون لمساعدتك</p>
                </div>
                        </div>
                <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
                    <button className="p-1.5 sm:p-2 md:p-2.5 hover:bg-white dark:hover:bg-card rounded-lg sm:rounded-xl border border-transparent hover:border-border transition-all text-muted-foreground hover:text-primary">
                        <IoIosSearch size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </button>
                    <button className="p-1.5 sm:p-2 md:p-2.5 hover:bg-white dark:hover:bg-card rounded-lg sm:rounded-xl border border-transparent hover:border-border transition-all text-muted-foreground hover:text-primary">
                        <FaInfoCircle size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </button>
                    </div>
                </div>

            {/* Messages Area */}
            <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 scrollbar-thin scrollbar-thumb-secondary"
            >
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
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: msg.isTemp ? 0.7 : 1, y: 0, scale: 1 }}
                                    className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`max-w-[85%] sm:max-w-[80%] md:max-w-[75%] space-y-0.5 sm:space-y-1 ${msg.type === "user" ? "items-end" : "items-start"}`}>
                                        <div
                                            className={`px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3.5 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-medium shadow-sm leading-relaxed ${msg.type === "user"
                                                ? "bg-[#579BE8] text-white rounded-tl-none"
                                                : "bg-secondary/40 text-foreground rounded-tr-none"
                                                } ${msg.isTemp ? "opacity-70" : ""}`}
                                        >
                                            {msg.text}
                                            {msg.isTemp && (
                                                <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs opacity-60">⏳</span>
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

                        {/* Date Divider */}
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 py-2 sm:py-3 md:py-4">
                            <div className="h-[1px] flex-1 bg-border/40" />
                            <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em] sm:tracking-[0.2em] bg-secondary/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">اليوم</span>
                            <div className="h-[1px] flex-1 bg-border/40" />
                        </div>
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Bar */}
            <div className="p-2 sm:p-3 md:p-4 lg:p-5 border-t border-border/60 bg-secondary/5">
                <div className="flex items-end gap-1.5 sm:gap-2 md:gap-3 bg-white dark:bg-card p-1.5 sm:p-2 rounded-2xl sm:rounded-[24px] md:rounded-[28px] border border-border/60 shadow-inner group focus-within:border-[#579BE8]/50 transition-colors">
                    <div className="flex items-center gap-0.5 sm:gap-1 pb-0.5 sm:pb-1 pr-1 sm:pr-2 flex-shrink-0">
                        <button className="p-1.5 sm:p-2 md:p-2.5 text-muted-foreground hover:text-[#579BE8] hover:bg-[#579BE8]/5 rounded-full transition-all">
                            <FaSmile size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        </button>
                        <button className="p-1.5 sm:p-2 md:p-2.5 text-muted-foreground hover:text-[#579BE8] hover:bg-[#579BE8]/5 rounded-full transition-all">
                            <FaPaperclip size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
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
                        placeholder="اكتب رسالتك هنا..."
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
                        className={`p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center flex-shrink-0 ${message.trim() && !sending
                            ? "bg-[#579BE8] text-white hover:bg-[#4a8bd1] shadow-[#579BE8]/20"
                            : "bg-secondary/40 text-muted-foreground cursor-not-allowed"
                            }`}
                        disabled={!message.trim() || sending}
                    >
                        {sending ? (
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 border-b-2 border-white"></div>
                        ) : (
                            <FaPaperPlane size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] sm:translate-x-[-1px]" />
                        )}
                        </button>
                </div>
                <p className="text-center text-[9px] sm:text-[10px] text-muted-foreground/60 mt-2 sm:mt-3 font-medium px-2">
                    سيقوم فريقنا بالرد عليك في أقرب وقت ممكن. نحن هنا لمساعدتك دائماً.
                </p>
            </div>
        </div>
    );
}
