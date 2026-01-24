// [file name]: FloatingChatIcon.js
// [file content begin]
// components/Chat/FloatingChatIcon.js
"use client";
import React, { useState, useEffect } from "react";
import { MessageCircle, X, Users, HeadphonesIcon, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { messageService } from "../../../Services/message.service";

const FloatingChatIcon = ({ onOpenChat, onOpenSupport, currentUserId = 39 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [lastUpdate, setLastUpdate] = useState("الآن");

  // جلب عدد الرسائل غير المقروءة من API
  const checkUnreadMessages = async () => {
    try {
      setLoading(true);
      
      // جلب جميع المحادثات
      const chatsResponse = await messageService.getChats();
      
      let totalUnread = 0;
      
      if (chatsResponse.success && Array.isArray(chatsResponse.data)) {
        // حساب الرسائل غير المقروءة في كل دردشة
        for (const chat of chatsResponse.data) {
          if (chat.messages && Array.isArray(chat.messages)) {
            const chatUnread = chat.messages.filter(msg => 
              !msg.is_read && 
              msg.sender_id && 
              msg.sender_id !== currentUserId &&
              msg.sender_id !== currentUserId?.toString()
            ).length;
            totalUnread += chatUnread;
          }
        }
        
        setMessageCount(totalUnread);
        setHasUnreadMessages(totalUnread > 0);
        
        // حفظ في localStorage للاستخدام السريع
        if (typeof window !== 'undefined') {
          localStorage.setItem('unread_messages_count', totalUnread);
        }
      }
      
      // جلب الإشعارات غير المقروءة
      try {
        const notificationsResponse = await messageService.getNotifications({
          read: false
        });
        
        if (notificationsResponse.success) {
          setUnreadNotifications(notificationsResponse.data?.length || 0);
        }
      } catch (notifError) {
        
      }
      
      // تحديث وقت آخر تحديث
      const now = new Date();
      setLastUpdate(now.toLocaleTimeString('ar-SA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
      
    } catch (error) {
      console.error('خطأ في جلب الرسائل غير المقروءة:', error);
      
      // استخدام القيمة المخزنة محلياً في حالة الخطأ
      if (typeof window !== 'undefined') {
        const storedCount = localStorage.getItem('unread_messages_count') || 0;
        setMessageCount(Number(storedCount));
        setHasUnreadMessages(Number(storedCount) > 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // التحقق من الرسائل غير المقروءة عند تحميل المكون
    checkUnreadMessages();
    
    // تحديث دوري كل 30 ثانية
    const interval = setInterval(checkUnreadMessages, 30000);
    
    // تحديث عند تركيز النافذة
    const handleFocus = () => {
      checkUnreadMessages();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // دالة لفتح المحادثات
  const handleOpenChatModal = () => {
    // تحديث عدد الرسائل غير المقروءة قبل الفتح
    checkUnreadMessages();
    
    // إغلاق القائمة الموسعة
    setIsExpanded(false);
    
    // فتح Modal المحادثات
    if (onOpenChat) {
      onOpenChat();
    }
  };

  // دالة لفتح الدعم الفني
  const handleOpenSupportModal = () => {
    setIsExpanded(false);
    if (onOpenSupport) {
      onOpenSupport();
    }
  };

  const handleNotificationsClick = () => {
    setIsExpanded(false);
    // يمكنك توجيه المستخدم لصفحة الإشعارات هنا
    
    // window.location.href = '/notifications';
  };

  // إعادة تحميل عدد الرسائل غير المقروءة
  const refreshUnreadCount = () => {
    checkUnreadMessages();
  };

  // دالة لفتح محادثة جديدة مباشرة
  const handleNewChat = () => {
    setIsExpanded(false);
    // هنا يمكنك فتح نموذج لإنشاء محادثة جديدة
    
    // أو يمكنك فتح ChatModal مع وضع خاص لإنشاء محادثة
    if (onOpenChat) {
      onOpenChat('new');
    }
  };

  // دالة لفتح صفحة البحث
  const handleSearch = () => {
    setIsExpanded(false);
   
    // يمكنك تنفيذ البحث هنا
  };

  return (
    <>
      {/* Floating Icon */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="fixed right-4 bottom-12 z-[9999] flex flex-col items-end gap-2"
      >
        {/* Main Chat Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
            isExpanded 
              ? 'bg-gradient-to-br from-red-500 to-red-600 w-12 h-12 ring-2 ring-white' 
              : 'bg-gradient-to-br from-[#579BE8] to-[#124987] w-14 h-14 hover:shadow-xl'
          }`}
        >
          {isExpanded ? (
            <X size={20} className="text-white" />
          ) : loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <MessageCircle size={24} className="text-white" />
              {/* {hasUnreadMessages && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white shadow-lg font-bold"
                >
                  {messageCount > 9 ? '9+' : messageCount}
                </motion.span>
              )} */}
            </>
          )}
        </motion.button>

        {/* Expanded Options */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-4 w-72 border border-gray-200 backdrop-blur-sm bg-white/95"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="pb-3 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800 text-lg">مركز المحادثات</h3>
                    <button
                      onClick={refreshUnreadCount}
                      className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                      title="تحديث"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'تحديث'
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">اختر نوع المحادثة</p>
                  
                  {/* Statistics */}
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${hasUnreadMessages ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
                      {/* <span className={hasUnreadMessages ? 'text-red-600 font-medium' : 'text-gray-500'}>
                        {hasUnreadMessages ? `${messageCount} رسالة جديدة` : 'لا توجد رسائل جديدة'}
                      </span> */}
                    </div>
                    {unreadNotifications > 0 && (
                      <div className="flex items-center gap-2">
                        <Bell size={12} className="text-orange-500" />
                        <span className="text-orange-600 font-medium">
                          {unreadNotifications} إشعار
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chats Option */}
                <button
                  onClick={handleOpenChatModal}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-all duration-200 group border border-transparent hover:border-blue-200 active:scale-[0.98]"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-100 transition-all duration-200 shadow-sm">
                      <Users size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
                    </div>
                    {/* {hasUnreadMessages && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white shadow-sm font-bold">
                        {messageCount > 9 ? '9+' : messageCount}
                      </div>
                    )} */}
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">محادثاتي</h4>
                    <p className="text-xs text-gray-500">عرض جميع المحادثات</p>
                    {/* {hasUnreadMessages && (
                      <p className="text-xs text-red-600 mt-1 font-medium">
                        {messageCount} رسالة جديدة
                      </p>
                    )} */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        مباشر
                      </span>
                      <span className="text-xs text-gray-400">
                        {loading ? 'جاري التحميل...' : 'تحديث تلقائي'}
                      </span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Notifications Option */}
                {/* {unreadNotifications > 0 && (
                  <button
                    onClick={handleNotificationsClick}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-all duration-200 group border border-transparent hover:border-orange-200 active:scale-[0.98]"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-100 transition-all duration-200 shadow-sm">
                        <Bell size={20} className="text-orange-600 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white shadow-sm font-bold">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <h4 className="font-bold text-gray-800 group-hover:text-orange-700 transition-colors">الإشعارات</h4>
                      <p className="text-xs text-gray-500">عرض الإشعارات الجديدة</p>
                      <p className="text-xs text-orange-600 mt-1 font-medium">
                        {unreadNotifications} إشعار جديد
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )} */}

                {/* Support Option */}
                {/* <button
                  onClick={handleOpenSupportModal}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-all duration-200 group border border-transparent hover:border-green-200 active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center group-hover:from-green-200 group-hover:to-green-100 transition-all duration-200 shadow-sm">
                    <HeadphonesIcon size={20} className="text-green-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="font-bold text-gray-800 group-hover:text-green-700 transition-colors">الدعم الفني</h4>
                    <p className="text-xs text-gray-500">التواصل مع فريق الدعم</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">متاح الآن</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button> */}

                {/* Quick Actions */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={handleNewChat}
                      className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-1 active:scale-[0.98]"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      محادثة جديدة
                    </button>
                    <button 
                      onClick={handleSearch}
                      className="text-xs px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1 active:scale-[0.98]"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      بحث
                    </button>
                  </div>
                </div>

                {/* Footer Status */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-600 font-medium">الدعم متاح</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">آخر تحديث: {lastUpdate}</span>
                    </div>
                    <span className="text-gray-500 font-medium">٢٤/٧</span>
                  </div>
                  
                  {/* Connection Status */}
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-500">متصل</span>
                    </div>
                    <span className="text-gray-400 text-[10px]">
                      v1.0 • {new Date().getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* تلميح عند التمرير فوق الأيقونة */}
      {/* {!isExpanded && hasUnreadMessages && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-16 bottom-4 bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap"
        >
          {messageCount} رسالة جديدة
          <div className="absolute right-[-4px] top-1/2 transform -translate-y-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
        </motion.div>
      )} */}
    </>
  );
};

// إضافة أنماط CSS مخصصة
const styles = `
  @keyframes pulse-subtle {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
  .animate-pulse-subtle {
    animation: pulse-subtle 2s infinite;
  }
`;

// إضافة الأنماط إلى head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default FloatingChatIcon;
