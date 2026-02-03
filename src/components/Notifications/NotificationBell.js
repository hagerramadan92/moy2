'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../context/NotificationContext';
import {
  FaBell,
  FaCheck,
  FaTrash,
  FaTimes,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaCog
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
    clearAll,
    markAsRead,
    isFirebaseInitialized,
    notificationPermission,
    requestNotificationPermission,
    fcmToken
  } = useNotification();

  const [isOpen, setIsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState([]);
  const [showFirebaseAlert, setShowFirebaseAlert] = useState(false);

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
    
    // ترتيب الإشعارات من الأحدث إلى الأقدم
    const sortedNotifications = uniqueNotifications.sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });
    
    setLocalNotifications(sortedNotifications);
  }, [notifications]);

  // تحميل الإشعارات عند فتح القائمة
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      
      // التحقق من حالة Firebase إذا كانت القائمة مفتوحة
      if (!isFirebaseInitialized && notificationPermission === 'default') {
        setShowFirebaseAlert(true);
      }
    }
  }, [isOpen, loadNotifications, isFirebaseInitialized, notificationPermission]);

  // التحقق من Firebase وإظهار التنبيه إذا لزم
  useEffect(() => {
    if (isOpen && !isFirebaseInitialized && notificationPermission === 'default') {
      const timer = setTimeout(() => {
        setShowFirebaseAlert(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isFirebaseInitialized, notificationPermission]);

  const handleNotificationClick = async (notification) => {
    // تحديد الإشعار كمقروء إذا لم يكن مقروءاً
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error('فشل في تعليم الإشعار كمقروء:', error);
      }
    }
    
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
      // تحديث الإشعارات المحلية
      setLocalNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          is_read: true,
          read_at: new Date().toISOString()
        }))
      );
    } catch (error) {
      console.error('فشل في تعليم الكل كمقروء:', error);
    }
  };

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    
    try {
      await deleteNotification(notificationId);
      // تحديث القائمة المحلية
      setLocalNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('فشل في حذف الإشعار:', error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف جميع الإشعارات؟')) {
      try {
        await clearAll();
        setLocalNotifications([]);
      } catch (error) {
        console.error('فشل في حذف جميع الإشعارات:', error);
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
    try {
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
        const days = Math.floor(diffInSeconds / 86400);
        if (days < 7) {
          return `قبل ${days} يوم`;
        } else {
          return date.toLocaleDateString('ar-EG', {
            month: 'short',
            day: 'numeric'
          });
        }
      }
    } catch {
      return 'تاريخ غير معروف';
    }
  };

  const handleEnableFirebaseNotifications = async () => {
    try {
      const result = await requestNotificationPermission();
      if (result.success) {
        setShowFirebaseAlert(false);
        // إعادة تحميل الإشعارات
        loadNotifications();
      }
    } catch (error) {
      console.error('فشل في تفعيل إشعارات Firebase:', error);
    }
  };

  const handleDismissFirebaseAlert = () => {
    setShowFirebaseAlert(false);
    localStorage.setItem('firebase_alert_dismissed', 'true');
  };

  const renderFirebaseAlert = () => {
    if (!showFirebaseAlert) return null;

    return (
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <FaExclamationCircle className="h-5 w-5 text-yellow-600 mt-0.5 ml-2 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-yellow-800 font-medium">
              الإشعارات الفورية غير مفعلة
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              قم بتفعيل الإشعارات لتلقي تحديثات فورية
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleEnableFirebaseNotifications}
                className="px-3 py-1 bg-yellow-600 text-white text-xs font-medium rounded hover:bg-yellow-700 transition-colors"
              >
                تفعيل الإشعارات
              </button>
              <button
                onClick={handleDismissFirebaseAlert}
                className="px-3 py-1 text-yellow-700 text-xs font-medium hover:text-yellow-800 transition-colors"
              >
                لاحقاً
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* زر الجرس */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 md:p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors group"
        aria-label="الإشعارات"
        aria-expanded={isOpen}
      >
        <div className="relative">
          <GoBell className="h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:scale-110" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          الإشعارات
          {unreadCount > 0 && ` (${unreadCount} جديد)`}
        </div>
      </button>

      {/* قائمة الإشعارات */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* القائمة */}
          <div className="absolute left-[-50px] md:left-[-100px] mt-2 w-60 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] flex flex-col">
            {/* الهيدر */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
              <div className="flex justify-between items-center">
                <h3 className="text-[16px] md:text-lg font-semibold text-gray-800 flex items-center">
                  <FaBell className="h-4 w-4 ml-2 text-blue-600" />
                  الإشعارات
                  {unreadCount > 0 && (
                    <span className="mr-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                      {unreadCount} جديد
                    </span>
                  )}
                </h3>
                <div className="flex space-x-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                      title="تعليم الكل كمقروء"
                      aria-label="تعليم جميع الإشعارات كمقروءة"
                    >
                      <FaCheck className="h-4 w-4" />
                    </button>
                  )}
                  {localNotifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      title="مسح الكل"
                      aria-label="حذف جميع الإشعارات"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    title="إغلاق"
                    aria-label="إغلاق قائمة الإشعارات"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* زر إعدادات الإشعارات */}
              {/* <div className="mt-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/settings/notifications';
                  }}
                  className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                >
                  <FaCog className="h-3 w-3 ml-1" />
                  إعدادات الإشعارات
                </button>
              </div> */}
            </div>

            {/* تنبيه Firebase */}
            {renderFirebaseAlert()}

            {/* قائمة الإشعارات */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 md:p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-3 text-gray-600 text-sm">جاري تحميل الإشعارات...</p>
                </div>
              ) : localNotifications.length === 0 ? (
                <div className="p-6 md:p-8 text-center text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FaBell className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-700 font-medium">لا توجد إشعارات</p>
                  <p className="text-sm text-gray-500 mt-2">
                    عندما تتلقى إشعارات جديدة ستظهر هنا
                  </p>
                  {!isFirebaseInitialized && (
                    <button
                      onClick={handleEnableFirebaseNotifications}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                    >
                      تفعيل الإشعارات الفورية
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {localNotifications.map((notification, index) => (
                    <div
                      key={`notification-${notification.id}-${index}`}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                        !notification.is_read 
                          ? 'bg-blue-50 border-r-2 border-r-blue-500' 
                          : ''
                      } ${index === 0 ? 'rounded-t' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleNotificationClick(notification);
                        }
                      }}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 mr-3">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`font-semibold text-right text-sm line-clamp-1 ${
                              !notification.is_read 
                                ? 'text-blue-900' 
                                : 'text-gray-800'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                                جديد
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs md:text-sm text-gray-600 mb-2 text-right line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              {notification.data?.sender && (
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                  {notification.data.sender}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(notification.created_at)}
                              </span>
                            </div>
                            
                            <button
                              onClick={(e) => handleDeleteNotification(notification.id, e)}
                              className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                              title="حذف الإشعار"
                              aria-label="حذف هذا الإشعار"
                            >
                              <FaTrash className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* الفوتر */}
            {localNotifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg sticky bottom-0">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/notifications';
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 w-full text-center font-medium flex items-center justify-center group"
                >
                  <span>عرض جميع الإشعارات</span>
                  <FaBell className="h-4 w-4 mr-2 transition-transform group-hover:translate-x-1" />
                </button>
                
                {/* معلومات Firebase */}
                {!isFirebaseInitialized && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      لتفعيل الإشعارات الفورية، انتقل إلى{' '}
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          window.location.href = '/settings/notifications';
                        }}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        إعدادات الإشعارات
                      </button>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;