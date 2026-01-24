// components/Chat/ChatWithDriver.js
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  X, 
  Send, 
  Clock, 
  User, 
  CheckCircle, 
  MessageCircle,
  Phone,
  Star,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  Video,
  MapPin
} from "lucide-react";
import { motion } from "framer-motion";
import { messageService } from "@/services/message.service";

const ChatWithDriver = ({ driverId, userId, chatId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [driverInfo, setDriverInfo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // تحميل بيانات السائق
  useEffect(() => {
    loadDriverInfo();
    if (chatId) {
      loadMessages();
      startRealTimeUpdates();
    }
    
    return () => {
      // تنظيف عند unmount
    };
  }, [chatId, driverId]);

  const loadDriverInfo = async () => {
    // بيانات افتراضية للسائق
    setDriverInfo({
      id: driverId,
      name: "سعود بن ناصر المطيري",
      avatar: "/image 4.png",
      rating: 4.5,
      isOnline: true,
      orderId: "112312121",
      status: "في الطريق",
      estimatedTime: "55 دقيقة",
      phoneNumber: "+966 50 123 4567",
      vehicle: {
        type: "شاحنة مياه",
        plate: "أ ب ج 1234"
      }
    });
  };

  const loadMessages = async () => {
    try {
      if (chatId && chatId.toString().startsWith('temp-')) {
        // إذا كانت دردشة مؤقتة، استخدم رسائل افتراضية
        setMessages([
          {
            id: 1,
            message: "مرحباً، أنا سائق طلبك رقم #112312121",
            sender_id: driverId,
            isCurrentUser: false,
            time: new Date(Date.now() - 3600000).toISOString(),
            created_at: new Date(Date.now() - 3600000).toISOString(),
            is_read: true,
            sender_name: "سعود المطيري"
          },
          {
            id: 2,
            message: "سأصل خلال 55 دقيقة تقريباً",
            sender_id: driverId,
            isCurrentUser: false,
            time: new Date(Date.now() - 1800000).toISOString(),
            created_at: new Date(Date.now() - 1800000).toISOString(),
            is_read: true,
            sender_name: "سعود المطيري"
          },
          {
            id: 3,
            message: "هل يوجد موقع محدد للتسليم داخل المستشفى؟",
            sender_id: driverId,
            isCurrentUser: false,
            time: new Date(Date.now() - 900000).toISOString(),
            created_at: new Date(Date.now() - 900000).toISOString(),
            is_read: true,
            sender_name: "سعود المطيري"
          }
        ]);
      } else if (chatId) {
        const msgs = await messageService.getMessages(chatId);
        setMessages(Array.isArray(msgs) ? msgs : []);
      }
    } catch (error) {
      console.error('خطأ في تحميل الرسائل:', error);
      // استخدام رسائل افتراضية في حالة الخطأ
      setMessages([
        {
          id: 1,
          message: "مرحباً بك في محادثة الطلب",
          sender_id: driverId,
          isCurrentUser: false,
          time: new Date().toISOString(),
          created_at: new Date().toISOString(),
          is_read: true,
          sender_name: "سعود المطيري"
        }
      ]);
    }
  };

  const startRealTimeUpdates = () => {
    // محاكاة تحديثات في الوقت الحقيقي
    const typingInterval = setInterval(() => {
      setIsTyping(Math.random() > 0.7); // 30% فرصة أن يكون السائق يكتب
    }, 5000);

    return () => clearInterval(typingInterval);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      
      // إنشاء رسالة مؤقتة
      const tempMessage = {
        id: `temp-${Date.now()}`,
        message: newMessage,
        sender_id: userId,
        isCurrentUser: true,
        is_temp: true,
        time: new Date().toISOString(),
        created_at: new Date().toISOString(),
        is_read: false,
        read_at: null,
        sender_name: 'أنت'
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");
      scrollToBottom();

      // محاكاة رد السائق بعد 2-5 ثواني
      setTimeout(() => {
        simulateDriverReply(newMessage);
      }, 2000 + Math.random() * 3000);

      // إذا كان لدينا chatId حقيقي، أرسل الرسالة
      if (chatId && !chatId.toString().startsWith('temp-')) {
        const result = await messageService.sendMessage(chatId, newMessage);
        if (result.success) {
          // استبدال الرسالة المؤقتة بالحقيقية
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempMessage.id ? result.message : msg
            )
          );
        }
      }

    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
      // عرض خطأ ولكن ابقى على الرسالة المؤقتة
      setMessages(prev => 
        prev.map(msg => 
          msg.id === `temp-${Date.now()}` 
            ? { ...msg, error: true, message: `${msg.message} (فشل الإرسال)` }
            : msg
        )
      );
    } finally {
      setSending(false);
    }
  };

  const simulateDriverReply = (userMessage) => {
    const replies = [
      "تم الاستلام، شكراً لك",
      "سأصل خلال 10 دقائق",
      "هل تفضل تسليم في المدخل الرئيسي؟",
      "الموقع واضح، شكراً للتوضيح",
      "حالياً في الطريق إليك",
      "يمكنك متابعة موقعي على الخريطة",
      "التأخير حوالي 5 دقائق فقط",
      "هل تحتاج إلى مساعدة في التفريغ؟",
      "المياه جاهزة للتسليم",
      "شكراً لصبرك"
    ];
    
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    
    const driverMessage = {
      id: `driver-${Date.now()}`,
      message: randomReply,
      sender_id: driverId,
      isCurrentUser: false,
      time: new Date().toISOString(),
      created_at: new Date().toISOString(),
      is_read: false,
      sender_name: driverInfo?.name || "السائق"
    };

    setMessages(prev => [...prev, driverMessage]);
    setUnreadCount(prev => prev + 1);
    scrollToBottom();
    setIsTyping(false);
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

  const markAllAsRead = () => {
    setUnreadCount(0);
    setMessages(prev => 
      prev.map(msg => ({ ...msg, is_read: true }))
    );
  };

  const handleCallDriver = () => {
    
    // يمكن فتح تطبيق الهاتف هنا
    window.open(`tel:${driverInfo?.phoneNumber}`, '_blank');
  };

  const handleSendLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const locationMessage = {
          id: `location-${Date.now()}`,
          message: `موقعي: https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`,
          sender_id: userId,
          isCurrentUser: true,
          is_location: true,
          time: new Date().toISOString(),
          created_at: new Date().toISOString(),
          is_read: false,
          sender_name: 'أنت'
        };
        setMessages(prev => [...prev, locationMessage]);
        setNewMessage("");
        scrollToBottom();
      });
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) return 'الآن';
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const quickReplies = [
    "شكراً",
    "أنا في الانتظار",
    "في أي مدخل؟",
    "نعم، المدخل الرئيسي",
    "لا أحتاج مساعدة",
    "حسناً، شكراً",
    "أين أنت الآن؟",
    "الموقع صحيح"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="bg-white  rounded-2xl shadow-2xl border border-gray-200 w-full h-full flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#579BE8] to-[#124987] text-white p-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/30">
                <img
                  src={driverInfo?.avatar || "/default-avatar.png"}
                  alt="Driver"
                  className="w-full h-full object-cover"
                />
              </div>
              {driverInfo?.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{driverInfo?.name || "سائق"}</h3>
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="text-sm opacity-90">{driverInfo?.rating}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span className="text-xs opacity-90">{driverInfo?.estimatedTime}</span>
                </div>
                <span className="text-xs opacity-80">•</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs opacity-90">{driverInfo?.status}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCallDriver}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              title="اتصال"
            >
              <Phone size={18} />
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        {/* Order Info */}
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Package size={12} />
              <span>طلب #{driverInfo?.orderId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={12} />
              <span>{driverInfo?.vehicle?.type}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-gray-100"
        onClick={markAllAsRead}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-4 border-2 border-blue-200">
              <MessageCircle size={40} className="text-blue-400" />
            </div>
            <h3 className="font-bold text-gray-700 mb-2 text-lg">بداية المحادثة</h3>
            <p className="text-gray-500 text-sm mb-6">ابدأ محادثتك الأولى مع سائق الطلب</p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
              {quickReplies.slice(0, 4).map((reply, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setNewMessage(reply);
                    setTimeout(() => sendMessage(), 100);
                  }}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Welcome Message */}
            <div className="text-center mb-6">
              <div className="inline-block bg-white border border-gray-200 rounded-2xl px-4 py-2 shadow-sm">
                <p className="text-xs text-gray-500">بدأت المحادثة حول الطلب #{driverInfo?.orderId}</p>
              </div>
            </div>

            {/* Messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`max-w-[75%] rounded-2xl px-4 py-3 relative ${
                    message.isCurrentUser
                      ? 'bg-gradient-to-r from-[#579BE8] to-[#124987] text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  } ${message.is_temp ? 'opacity-80' : ''} ${message.error ? 'border-red-200 bg-red-50' : ''}`}
                >
                  {/* Sender Name for received messages */}
                  {!message.isCurrentUser && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-700">{message.sender_name}</span>
                      {!message.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  )}
                  
                  {/* Message Content */}
                  <div className="flex items-start gap-2">
                    {message.is_location && (
                      <MapPin size={16} className="mt-1 flex-shrink-0" />
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                  </div>
                  
                  {/* Message Footer */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-opacity-20">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${message.isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatMessageTime(message.time)}
                      </span>
                      {message.is_temp && (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {message.error && (
                        <AlertCircle size={12} className="text-red-400" />
                      )}
                    </div>
                    
                    {message.isCurrentUser && (
                      <div className="flex items-center gap-1">
                        {message.is_read ? (
                          <CheckCircle size={12} className="text-green-300" />
                        ) : (
                          <CheckCircle size={12} className="text-blue-100 opacity-50" />
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <span className="text-xs text-gray-500 mr-2">يكتب...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Unread Messages Indicator */}
            {unreadCount > 0 && (
              <div className="text-center">
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  <span>{unreadCount} رسالة جديدة</span>
                  <span className="text-xs">اضغط لعرضها</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Quick Replies */}
      {messages.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 bg-white overflow-x-auto">
          <div className="flex gap-2">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => {
                  setNewMessage(reply);
                  setTimeout(() => sendMessage(), 100);
                }}
                className="flex-shrink-0 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm transition-colors whitespace-nowrap"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-2">
          {/* Attachment Button */}
          <div className="relative">
            <button
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Paperclip size={20} className="text-gray-600" />
            </button>
            
            {showAttachmentMenu && (
              <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 w-48">
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 rounded-lg hover:bg-gray-50 flex flex-col items-center gap-1">
                    <ImageIcon size={18} className="text-blue-500" />
                    <span className="text-xs">صورة</span>
                  </button>
                  <button className="p-3 rounded-lg hover:bg-gray-50 flex flex-col items-center gap-1">
                    <FileText size={18} className="text-green-500" />
                    <span className="text-xs">ملف</span>
                  </button>
                  <button className="p-3 rounded-lg hover:bg-gray-50 flex flex-col items-center gap-1">
                    <Video size={18} className="text-purple-500" />
                    <span className="text-xs">فيديو</span>
                  </button>
                  <button 
                    onClick={handleSendLocation}
                    className="p-3 rounded-lg hover:bg-gray-50 flex flex-col items-center gap-1"
                  >
                    <MapPin size={18} className="text-red-500" />
                    <span className="text-xs">موقع</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب رسالتك هنا..."
              className="w-full p-3 pr-12 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-[#579BE8] focus:ring-2 focus:ring-[#579BE8]/20"
              disabled={sending}
            />
            <button className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Smile size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              !newMessage.trim() || sending
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

        {/* Input Helpers */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <button className="hover:text-gray-700 flex items-center gap-1">
              <Mic size={14} />
              <span>صوت</span>
            </button>
            <span>•</span>
            <span>اضغط Enter للإرسال</span>
          </div>
          <span>{newMessage.length}/500</span>
        </div>
      </div>

      {/* Order Status Footer */}
      <div className="border-t border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#579BE8] to-[#124987] rounded-lg flex items-center justify-center">
              <Truck size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700">الطلب قيد التوصيل</p>
              <p className="text-xs text-gray-500">التوصيل خلال {driverInfo?.estimatedTime}</p>
            </div>
          </div>
          <button
            onClick={handleCallDriver}
            className="text-xs px-3 py-1.5 bg-gradient-to-r from-[#579BE8] to-[#124987] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            اتصال طارئ
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatWithDriver;