// components/Chat/FloatingChatIcon.js
"use client";
import React, { useState, useEffect } from "react";
import { MessageCircle, X, Users, HeadphonesIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FloatingChatIcon = ({ onOpenChat, onOpenSupport, currentUserId = 39 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  // محاكاة التحقق من الرسائل غير المقروءة
  useEffect(() => {
    const checkUnreadMessages = () => {
      // يمكنك استبدال هذا بـ API حقيقي
      const unreadCount = localStorage.getItem('unread_messages_count') || 0;
      setMessageCount(unreadCount);
      setHasUnreadMessages(unreadCount > 0);
    };

    checkUnreadMessages();
    const interval = setInterval(checkUnreadMessages, 30000); // كل 30 ثانية
    return () => clearInterval(interval);
  }, []);

  const handleChatClick = () => {
    setIsExpanded(false);
    if (onOpenChat) {
      onOpenChat();
    }
  };

  const handleSupportClick = () => {
    setIsExpanded(false);
    if (onOpenSupport) {
      onOpenSupport();
    }
  };

  return (
    <>
      {/* Floating Icon */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="fixed right-4 bottom-12 z-888 flex flex-col items-end gap-2"
      >
        {/* Main Chat Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative  rounded-full shadow-2xl flex items-center justify-center ${
            isExpanded 
              ? 'bg-gradient-to-br from-red-500 to-red-600  w-8 h-8 ' 
              : 'bg-gradient-to-br from-[#579BE8] to-[#124987] w-14 h-14'
          }`}
        >
          {isExpanded ? (
            <X size={20} className="text-white" />
          ) : (
            <>
              <MessageCircle size={24} className="text-white" />
              {hasUnreadMessages && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                >
                  {messageCount}
                </motion.span>
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
              className="bg-white rounded-2xl shadow-2xl p-4 w-64"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-center">مركز المحادثات</h3>
                  <p className="text-xs text-gray-500 text-center">اختر نوع المحادثة</p>
                </div>

                {/* Chats Option */}
                <button
                  onClick={handleChatClick}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-100">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="font-bold text-gray-800">محادثاتي</h4>
                    <p className="text-xs text-gray-500">الاطلاع على جميع المحادثات</p>
                  </div>
                  {hasUnreadMessages && (
                    <span className="w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {messageCount}
                    </span>
                  )}
                </button>

                {/* Support Option */}
                {/* <button
                  onClick={handleSupportClick}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center group-hover:from-green-200 group-hover:to-green-100">
                    <HeadphonesIcon size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="font-bold text-gray-800">الدعم الفني</h4>
                    <p className="text-xs text-gray-500">التواصل مع فريق الدعم</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </button> */}

                {/* Status */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-600">الدعم متاح</span>
                    </div>
                    <span className="text-gray-500">٢٤/٧</span>
                  </div>
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