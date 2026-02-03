'use client';

import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import {
  FaBell,
  FaCheck,
  FaTrash,
  FaTimes,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle
} from 'react-icons/fa';
import { GoBell } from "react-icons/go";
const NotificationBell = () => {
  const { 
    notifications, 
    unreadCount, 
    loading,
    loadNotifications,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotification();

  const [isOpen, setIsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // تحديث الإشعارات المحلية مع إزالة التكرارات
  useEffect(() => {
    // إزالة الإشعارات المكررة بناءً على id
    const uniqueNotifications = notifications.reduce((acc, notification) => {
      const existingIndex = acc.findIndex(n => n.id === notification.id);
      if (existingIndex === -1) {
        acc.push(notification);
      } else {
        // إذا كان موجود، نستبدله بالإصدار الأحدث
        acc[existingIndex] = notification;
      }
      return acc;
    }, []);
    
    setLocalNotifications(uniqueNotifications);
  }, [notifications]);

  const handleNotificationClick = (notification) => {
    // تحديد الإشعار كمقروء
   
    
    // إغلاق القائمة
    setIsOpen(false);
    
    // الانتقال للصفحة المناسبة
    handleNotificationAction(notification);
  };

  const handleNotificationAction = (notification) => {
    const { type, data, action_url } = notification;
    
    
    
    if (action_url) {
      window.location.href = action_url;
      return;
    }
    
    // معالجة حسب النوع
    switch (type) {
      case 'order_update':
        if (data?.order_id) {
          window.location.href = `/orders/${data.order_id}`;
        }
        break;
        
      case 'message':
        if (data?.chat_id) {
          window.location.href = `/chats/${data.chat_id}`;
        }
        break;
        
      case 'payment':
        if (data?.payment_id) {
          window.location.href = `/payments/${data.payment_id}`;
        }
        break;
        
      case 'promotion':
        if (data?.promo_code) {
          window.location.href = `/promotions?code=${data.promo_code}`;
        }
        break;
        
      default:
        window.location.href = '/notifications';
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    
    try {
      await deleteNotification(notificationId);
      // تحديث القائمة المحلية
      setLocalNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف جميع الإشعارات؟')) {
      try {
        await clearAll();
        setLocalNotifications([]);
      } catch (error) {
        console.error('Failed to clear all notifications:', error);
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return <FaInfoCircle className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <FaExclamationCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <FaExclamationCircle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <FaCheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <FaEnvelope className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'الآن';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `قبل ${minutes} دقيقة`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `قبل ${hours} ساعة`;
    } else {
      return date.toLocaleDateString('ar-EG');
    }
  };

  return (
    <div className="relative">
      {/* زر الجرس */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 md:p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors"
        aria-label="الإشعارات"
      >
        <GoBell className="h-5 w-5 md:h-6 md:w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 left-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* قائمة الإشعارات */}
      {isOpen && (
        <div className="absolute left-[-30] md:left-0 mt-2 w-55 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* الهيدر */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-[16px] md:text-lg font-semibold text-gray-800">
                الإشعارات
                {unreadCount > 0 && (
                  <span className="mr-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadCount} جديد
                  </span>
                )}
              </h3>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                    title="تعليم الكل كمقروء"
                  >
                    <FaCheck className="md:h-5 md:w-5 w-4 h-4" />
                  </button>
                )}
                {localNotifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="p-0 md:p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    title="مسح الكل"
                  >
                    <FaTrash className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                  title="إغلاق"
                >
                  <FaTimes className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* قائمة الإشعارات */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-2 md:p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 text-sm md:text-base">جاري تحميل الإشعارات...</p>
              </div>
            ) : localNotifications.length === 0 ? (
              <div className=" p-4 md:p-6 text-center text-gray-500">
                <FaBell className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p>لا توجد إشعارات</p>
                <p className="text-sm mt-1">عندما تتلقى إشعارات جديدة ستظهر هنا</p>
              </div>
            ) : (
              localNotifications.map((notification, index) => (
                <div
                  key={`notification-${notification.id}-${index}`}
                  className={`p-1 md:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.is_read ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 md:mr-3 mr-1.5">
                      <div className="flex justify-between items-start md:mb-1">
                        <h4 className="font-semibold text-gray-800 text-right text-sm">
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            جديد
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[12px] md:text-sm text-gray-600 mb-2 text-right">
                        {notification.message}
                      </p>
                      
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{formatTimeAgo(notification.created_at)}</span>
                        
                        <div className="flex items-center space-x-2">
                          {notification.data?.sender && (
                            <span className="text-blue-600">
                              {notification.data.sender}
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id, e);
                            }}
                            className="text-gray-400 hover:text-red-600 p-1"
                            title="حذف الإشعار"
                          >
                            <FaTrash className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* الفوتر */}
          {localNotifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => {
                  window.location.href = '/notifications';
                }}
                className="text-sm text-blue-600 hover:text-blue-800 w-full text-center font-medium flex items-center justify-center"
              >
                <FaBell className="h-4 w-4 ml-1" />
                عرض جميع الإشعارات
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;