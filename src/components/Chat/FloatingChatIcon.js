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
      
      const chatsResponse = await messageService.getChats();
      
      let totalUnread = 0;
      
      if (chatsResponse.success && Array.isArray(chatsResponse.data)) {
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
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('unread_messages_count', totalUnread);
        }
      }
      
      try {
        const notificationsResponse = await messageService.getNotifications({
          read: false
        });
        
        if (notificationsResponse.success) {
          setUnreadNotifications(notificationsResponse.data?.length || 0);
        }
      } catch (notifError) {}
      
      const now = new Date();
      setLastUpdate(now.toLocaleTimeString('ar-SA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
      
    } catch (error) {
      console.error('خطأ في جلب الرسائل غير المقروءة:', error);
      
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
    checkUnreadMessages();
    
    const interval = setInterval(checkUnreadMessages, 30000);
    
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
    checkUnreadMessages();
    setIsExpanded(false);
    if (onOpenChat) {
      onOpenChat();
    }
  };

  // دالة لإغلاق القائمة الموسعة
  const handleCloseExpanded = () => {
    setIsExpanded(false);
  };

  return (
    <>
      {/* Floating Icon */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="fixed right-3 sm:right-4 bottom-16 sm:bottom-12 z-[9999] flex flex-col items-end gap-2"
      >
        {/* Main Chat Button - بدون X */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative rounded-full shadow-lg flex items-center justify-center transition-all duration-300 bg-gradient-to-br from-[#579BE8] to-[#124987] w-11 h-11 sm:w-14 sm:h-14 hover:shadow-xl`}
        >
          {loading ? (
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <MessageCircle size={18} className="text-white sm:size-6" />
              {hasUnreadMessages && messageCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {messageCount > 9 ? '9+' : messageCount}
                </div>
              )}
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
              className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-3 sm:p-4 w-[280px] sm:w-72 border border-gray-200 backdrop-blur-sm bg-white/95 fixed bottom-24 right-3 sm:right-4 sm:relative sm:bottom-auto"
            >
              {/* Header مع زر الإغلاق داخل المودال */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-base sm:text-lg">مركز المحادثات</h3>
                
                {/* زر الإغلاق داخل المودال */}
                <button
                  onClick={handleCloseExpanded}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="إغلاق"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Statistics */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 text-xs gap-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${hasUnreadMessages ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className="text-gray-600">
                      {hasUnreadMessages ? `${messageCount} رسالة جديدة` : 'لا توجد رسائل جديدة'}
                    </span>
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

                {/* Chats Option */}
                <button
                  onClick={handleOpenChatModal}
                  className="w-full flex items-center gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-200 group border border-transparent hover:border-blue-200 active:scale-[0.98]"
                >
                  <div className="relative">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-100 transition-all duration-200 shadow-sm">
                      <Users size={16} className="text-blue-600 group-hover:scale-110 transition-transform sm:size-5" />
                    </div>
                    {hasUnreadMessages && messageCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {messageCount > 9 ? '9+' : messageCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors text-sm sm:text-base">محادثاتي</h4>
                    <p className="text-xs text-gray-500">عرض جميع المحادثات</p>
                    {/* <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        مباشر
                      </span>
                      <span className="text-xs text-gray-400 hidden sm:inline">
                        {loading ? 'جاري التحميل...' : 'تحديث تلقائي'}
                      </span>
                    </div> */}
                  </div>
                  {/* <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg> */}
                </button>

                {/* Quick Actions */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        setIsExpanded(false);
                        if (onOpenChat) onOpenChat('new');
                      }}
                      className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-1 active:scale-[0.98]"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      محادثة جديدة
                    </button>
                    <button 
                      onClick={() => {
                        setIsExpanded(false);
                        if (onOpenSupport) onOpenSupport();
                      }}
                      className="text-xs px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1 active:scale-[0.98]"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      دعم فني
                    </button>
                  </div>
                </div>

                {/* Footer Status */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-600 font-medium">الدعم متاح</span>
                      </div>
                      {/* <span className="text-gray-400 hidden sm:inline">•</span> */}
                      {/* <span className="text-gray-500 text-[10px] sm:text-xs">آخر تحديث: {lastUpdate}</span> */}
                    </div>
                    <span className="text-gray-500 font-medium text-xs">٢٤/٧</span>
                  </div>
                  
                  {/* <div className="flex items-center justify-between mt-1 sm:mt-2 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-500">متصل</span>
                    </div>
                    <span className="text-gray-400 text-[10px]">
                      v1.0 • {new Date().getFullYear()}
                    </span>
                  </div> */}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default FloatingChatIcon;