'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Phone,
  Info,
  Smile,
  Paperclip
} from 'lucide-react';
import { fetchChatMessages, sendChatMessage } from '../../../utils/chatApi';
import { subscribeToChat, unsubscribeFromChat, subscribeToTypingIndicator } from '../../../utils/pusherClient';

/**
 * Chat component for messaging with driver
 */
export default function ChatWithDriver({ isOpen, onClose, driverInfo, orderId, userId, driverId }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatChannelRef = useRef(null);
  const typingChannelRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize chat when component opens
  useEffect(() => {
    if (!isOpen || !orderId || !driverId) return;

    const initializeChat = async () => {
      setIsLoading(true);
      try {
        // Fetch existing messages
        const fetchedMessages = await fetchChatMessages(orderId, driverId);
        
        // Ensure fetchedMessages is an array
        const messagesArray = Array.isArray(fetchedMessages) ? fetchedMessages : (fetchedMessages?.messages || []);
        
        // Normalize messages format
        const normalizedMessages = messagesArray.map((msg) => ({
          id: msg.id,
          sender_id: msg.sender_id,
          sender: msg.sender_id === userId ? 'user' : 'driver',
          text: msg.message || msg.text,
          timestamp: msg.created_at 
            ? new Date(msg.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
            : msg.timestamp || new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          avatar: msg.sender_id === userId ? driverInfo?.userAvatar : driverInfo?.image
        }));
        
        setMessages(normalizedMessages);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    // Subscribe to Pusher for real-time messages
    chatChannelRef.current = subscribeToChat(orderId, (newMessage) => {
      // Normalize incoming message
      const normalizedMsg = {
        id: newMessage.id,
        sender_id: newMessage.sender_id,
        sender: newMessage.sender_id === userId ? 'user' : 'driver',
        text: newMessage.message || newMessage.text,
        timestamp: newMessage.created_at
          ? new Date(newMessage.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
          : newMessage.timestamp || new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        avatar: newMessage.sender_id === userId ? driverInfo?.userAvatar : driverInfo?.image
      };
      
      setMessages((prev) => [...prev, normalizedMsg]);
      scrollToBottom();
    });

    // Subscribe to typing indicators
    typingChannelRef.current = subscribeToTypingIndicator(orderId, (data) => {
      if (data.driver_id === driverId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    return () => {
      unsubscribeFromChat(orderId);
    };
  }, [isOpen, orderId, driverId]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || !orderId || !userId || isSending) return;

    const messageText = inputValue;
    setInputValue('');
    setIsSending(true);

    try {
      const messageData = {
        chat_id: orderId, // Using orderId as chat_id for the endpoint path
        order_id: orderId,
        sender_id: userId,
        receiver_id: driverId,
        message: messageText,
        type: 'text',
      };

      console.log('Attempting to send message:', messageData);

      // Send message to API
      const response = await sendChatMessage(messageData);
      
      console.log('Message sent successfully:', response);

      // Add message to local state immediately
      const newMessage = {
        id: response.id || Date.now(),
        sender: 'user',
        sender_id: userId,
        text: messageText,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        avatar: driverInfo?.userAvatar || '/user-avatar.png'
      };
      
      setMessages((prev) => [...prev, newMessage]);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      // Re-add the message to input if it failed
      setInputValue(messageText);
      
      // Show user-friendly error
      if (error.message.includes('401')) {
        alert('جلستك انتهت. يرجى تسجيل الدخول مجددًا');
      } else if (error.message.includes('500')) {
        alert('حدث خطأ في الخادم. يرجى المحاولة مرة أخرى');
      } else {
        alert(`خطأ في الإرسال: ${error.message}`);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-9990"
        >
          <motion.div
            initial={{ y: 500, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 500, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed bottom-0 left-0 right-0 md:absolute md:bottom-auto md:right-6 md:top-[40%] w-full z-[99999] md:w-96 bg-white rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-[600px] z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987] rounded-t-3xl md:rounded-t-2xl p-4 flex items-center justify-between text-white shadow-lg">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white">
                  <Image
                    src="/image 4.png"
                    alt="Driver"
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">سعود بن ناصر المطيري</h3>
                  <p className="text-xs opacity-80">في الطريق</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <Phone size={18} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-[#579BE8] rounded-full"></div>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>لا توجد رسائل حتى الآن. ابدأ المحادثة!</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {message.sender === 'driver' && (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#579BE8]/20">
                        <Image
                          src={driverInfo?.image || '/image 4.png'}
                          alt="Driver"
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                    )}
                    
                    <div className={`flex flex-col gap-1 max-w-xs ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987] text-white rounded-br-none'
                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                        }`}
                      >
                        {message.text}
                      </motion.div>
                      <span className="text-xs text-gray-400 px-4">{message.timestamp}</span>
                    </div>

                    {message.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-[#579BE8]/20 to-[#124987]/20 border border-[#579BE8]/30 flex items-center justify-center">
                        <span className="text-xs font-bold text-[#579BE8]">أ</span>
                      </div>
                    )}
                  </motion.div>
                ))
              )}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 items-end"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#579BE8]/20">
                    <Image
                      src="/image 4.png"
                      alt="Driver"
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-white border border-gray-200 shadow-sm">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white p-4 rounded-b-3xl md:rounded-b-2xl space-y-3">
              <div className="flex gap-2">
                <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                  <Smile size={20} className="text-gray-400" />
                </button>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm border border-gray-200 focus:border-[#579BE8] focus:outline-none focus:ring-1 focus:ring-[#579BE8] resize-none"
                  rows={1}
                />
                <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                  <Paperclip size={20} className="text-gray-400" />
                </button>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={inputValue.trim() === '' || isLoading || isSending}
                className="w-full h-11 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987] hover:from-[#4a8dd8] hover:via-[#3d7bc7] hover:to-[#0f3d6f] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#579BE8]/30 hover:shadow-xl hover:shadow-[#579BE8]/40 flex items-center justify-center gap-2 transition-all duration-200 rounded-xl text-white font-bold"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>إرسال</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
