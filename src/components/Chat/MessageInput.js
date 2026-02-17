
"use client";
import React, { useState, useRef, useEffect } from "react";
import { messageService } from "../../../Services/message.service";
import { Send, Paperclip, Smile, Image, Mic, MapPin } from "lucide-react";

const MessageInput = ({ chatId, currentUserId = 39, onMessageSent }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const textareaRef = useRef(null);
  const emojiRef = useRef(null);

  // إعادة ضبط ارتفاع textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // إغلاق قوائم emoji والمرفقات عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
      setShowAttachments(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || !chatId || sending) return;

    try {
      setSending(true);
      setError("");
      setSuccess(false);

      // إنشاء رسالة مؤقتة
      const tempMessage = {
        id: `temp-${Date.now()}`,
        message: message,
        sender_id: currentUserId,
        sender_type: "App\\Models\\User",
        isCurrentUser: true,
        is_temp: true,
        message_type: "text",
        metadata: ["text"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_read: false,
        read_at: null
      };

      // إخطار المكون الأب بالرسالة المؤقتة
      if (onMessageSent) {
        onMessageSent(tempMessage);
      }

      // إرسال الرسالة إلى API
      const response = await messageService.sendMessage(chatId, {
        message: message.trim(),
        message_type: "text",
        metadata: ["text"]
      });

      if (response.success) {
        // استبدال الرسالة المؤقتة بالرسالة الحقيقية
        if (onMessageSent) {
          onMessageSent(response.message, tempMessage.id);
        }
        
        setSuccess(true);
        setMessage("");
        
        // إعادة التركيز على حقل الإدخال
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
        
        // إخفاء رسالة النجاح بعد 3 ثوان
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(response.error || 'فشل إرسال الرسالة');
      }

    } catch (error) {
      console.error('❌ خطأ في إرسال الرسالة:', error);
      setError(error.message || "فشل إرسال الرسالة. حاول مرة أخرى.");
      
      // إزالة الرسالة المؤقتة في حالة الخطأ
      if (onMessageSent) {
        onMessageSent(null, `temp-${Date.now()}`);
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
  };

  // إضافة emoji
  const emojis = ['😊', '😂', '😍', '👍', '👏', '🎉', '❤️', '🔥', '🙏', '😎', '🤔', '😢'];

  const addEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmoji(false);
  };

  // إرسال الموقع
  const sendLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const locationMessage = `📍 موقعي: https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
        setMessage(prev => prev + locationMessage);
      });
    }
  };

  // رسائل سريعة
  const quickMessages = [
    { text: "مرحباً!", emoji: "👋" },
    { text: "شكراً لك", emoji: "🙏" },
    { text: "حسناً", emoji: "👍" },
    { text: "نعم", emoji: "✅" },
    { text: "لا", emoji: "❌" },
    { text: "متى ستصل؟", emoji: "🕒" },
    { text: "أين أنت؟", emoji: "📍" },
    { text: "حسناً، شكراً", emoji: "🎉" }
  ];

  return (
    <div className="border-t bg-white p-4">
      {/* رسائل سريعة */}
      {message.length === 0 && (
        <div className="mb-3">
          <div className="flex overflow-x-auto pb-2 gap-2">
            {quickMessages.map((quickMsg, index) => (
              <button
                key={index}
                onClick={() => {
                  setMessage(quickMsg.text);
                  setTimeout(() => textareaRef.current?.focus(), 100);
                }}
                className="flex-shrink-0 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <span>{quickMsg.emoji}</span>
                <span>{quickMsg.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* رسائل النجاح والخطأ */}
      <div className="mb-3 space-y-2">
        {success && (
          <div className="p-2 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-green-700 text-sm">تم إرسال الرسالة بنجاح</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-red-600">⚠️</span>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* حقل الإدخال */}
      <div className="flex gap-2 items-end">
        {/* أزرار الإرفاق */}
        <div className="relative">
          <button
            onClick={() => setShowAttachments(!showAttachments)}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <Paperclip size={20} className="text-gray-600" />
          </button>
          
          {showAttachments && (
            <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-lg border border-gray-200 p-2 w-48">
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 rounded-lg hover:bg-gray-50 flex flex-col items-center gap-1">
                  <Image size={18} className="text-blue-500" />
                  <span className="text-xs">صورة</span>
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-50 flex flex-col items-center gap-1">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs">ملف</span>
                </button>
                <button 
                  onClick={sendLocation}
                  className="p-2 rounded-lg hover:bg-gray-50 flex flex-col items-center gap-1"
                >
                  <MapPin size={18} className="text-red-600" />
                  <span className="text-xs">موقع</span>
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-50 flex flex-col items-center gap-1">
                  <Mic size={18} className="text-purple-500" />
                  <span className="text-xs">صوت</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* حقل النص */}
        <div className="flex-1 relative" ref={emojiRef}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك هنا..."
            className="w-full p-3 pr-24 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none min-h-[60px] max-h-[120px] leading-relaxed"
            rows="1"
            disabled={sending}
          />
          
          {/* زر emoji */}
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="absolute bottom-3 right-14 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <Smile size={18} className="text-gray-600" />
          </button>
          
          {/* قائمة emoji */}
          {showEmoji && (
            <div className="absolute bottom-full mb-2 right-0 bg-white rounded-xl shadow-lg border border-gray-200 p-2 w-48 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-4 gap-2">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => addEmoji(emoji)}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* زر الإرسال */}
          <div className="absolute bottom-3 right-3">
            {message.trim() ? (
              <button
                onClick={handleSendMessage}
                disabled={sending}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  sending
                    ? 'bg-blue-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                }`}
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send size={18} />
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  // بدء تسجيل صوتي
                }}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <Mic size={18} className="text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* تلميحات وأرقام */}
      <div className="flex items-center justify-between mt-2 text-xs text-gray-700">
        <div>
          {message.length > 0 && (
            <span>{message.length}/1000 حرف</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>Enter للإرسال</span>
          <span>Shift+Enter للسطر الجديد</span>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
