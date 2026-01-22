// components/MessageSender.js
"use client";
import React, { useState, useRef, useEffect } from "react";
import { messageService } from "../../../Services/message.service";
import { Send, Paperclip, Smile, Image, Mic } from "lucide-react";

const MessageSender = ({ chatId, currentUserId = 39, onMessageSent }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const textareaRef = useRef(null);

  // إعادة ضبط textarea عند تغيير المحتوى
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // إرسال الرسالة
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
        isCurrentUser: true,
        is_temp: true,
        time: new Date().toISOString(),
        created_at: new Date().toISOString(),
        is_read: false,
        read_at: null,
        sender_name: 'أنت'
      };

      // إخطار المكون الأب بالرسالة المؤقتة
      if (onMessageSent) {
        onMessageSent(tempMessage, null);
      }

      // إرسال الرسالة إلى API
      const response = await messageService.sendMessage(chatId, message);
      
      console.log('📨 [MessageSender] استجابة API:', response);

      if (response && response.success && response.message) {
        // إرسال الرسالة النهائية للمكون الأب
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
        throw new Error(response?.error || 'فشل إرسال الرسالة');
      }

    } catch (error) {
      console.error('❌ [MessageSender] خطأ في إرسال الرسالة:', error);
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

  // إضافة رسائل سريعة
  const quickMessages = [
    { text: "مرحباً!", emoji: "👋" },
    { text: "كيف حالك؟", emoji: "😊" },
    { text: "شكراً لك", emoji: "🙏" },
    { text: "نعم، موافق", emoji: "✅" },
    { text: "لا، غير موافق", emoji: "❌" },
    { text: "متى يمكننا الاجتماع؟", emoji: "📅" },
    { text: "هل يمكنك المساعدة؟", emoji: "🤔" },
    { text: "رائع، شكراً!", emoji: "🎉" }
  ];

  return (
    <div className="border-t bg-white p-4 shadow-sm">
      {/* عرض الرسائل السريعة */}
      <div className="mb-3">
        <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
          {quickMessages.map((quickMsg, index) => (
            <button
              key={index}
              onClick={() => setMessage(prev => prev + quickMsg.text + " ")}
              className="flex-shrink-0 px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 rounded-lg border border-blue-200 transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-sm">{quickMsg.emoji}</span>
              <span className="text-xs font-medium">{quickMsg.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* عرض الرسائل الناجحة والخطأ */}
      <div className="space-y-2 mb-3">
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-green-700 text-sm">تم إرسال الرسالة بنجاح</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* حقل إرسال الرسالة */}
      <div className="flex gap-3">
        {/* الأزرار الجانبية */}
        <div className="flex flex-col gap-2">
          <button className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <Paperclip size={20} className="text-gray-600" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <Image size={20} className="text-gray-600" />
          </button>
        </div>

        {/* حقل النص الرئيسي */}
        <div className="flex-1 relative">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="اكتب رسالتك هنا..."
              className="w-full p-4 pr-24 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none min-h-[60px] max-h-[120px] leading-relaxed"
              rows="1"
              disabled={sending}
            />
            
            {/* زر الإيموجي */}
            <button className="absolute bottom-3 right-14 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <Smile size={18} className="text-gray-600" />
            </button>
            
            {/* زر التسجيل الصوتي أو الإرسال */}
            <div className="absolute bottom-3 right-3">
              {message.trim() ? (
                <button
                  onClick={handleSendMessage}
                  disabled={sending}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    sending
                      ? 'bg-blue-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              ) : (
                <button className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <Mic size={18} className="text-gray-600" />
                </button>
              )}
            </div>
          </div>
          
          {/* عدّاد الأحرف */}
          <div className="absolute bottom-2 left-3 text-xs text-gray-400">
            {message.length}/1000
          </div>
        </div>
      </div>

      {/* تلميحات */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          اضغط <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd> للإرسال • اضغط <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Shift + Enter</kbd> للسطر الجديد
        </p>
      </div>
    </div>
  );
};

// إضافة الأنماط
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`;

// إضافة الأنماط إلى head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default MessageSender;