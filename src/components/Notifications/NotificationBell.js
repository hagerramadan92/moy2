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
  FaInfoCircle,
  FaExclamationTriangle,
  FaUserCircle
} from 'react-icons/fa';

const NotificationBell = () => {
  const { 
    notifications, 
    unreadCount, 
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refreshNotifications
  } = useNotification();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [localNotifications, setLocalNotifications] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // تحميل الإشعارات عند فتح القائمة
  useEffect(() => {
    if (isOpen) {
      loadInitialNotifications();
    }
  }, [isOpen]);

  // تحديث الإشعارات المحلية عندما تتغير من الـ context
  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const loadInitialNotifications = async () => {
    try {
      await loadNotifications();
      setCurrentPage(1);
      setHasMore(true);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const loadMoreNotifications = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      // يمكنك إضافة منطق لجلب المزيد من الإشعارات هنا
      // const moreNotifications = await loadMoreNotificationsFromAPI(nextPage);
      
      // إذا كانت هناك المزيد من الإشعارات
      // if (moreNotifications.length > 0) {
      //   setLocalNotifications(prev => [...prev, ...moreNotifications]);
      //   setCurrentPage(nextPage);
      // } else {
      //   setHasMore(false);
      // }
      
      setHasMore(false); // مؤقتاً حتى يتم تنفيذ الـ pagination
    } catch (error) {
      console.error('Failed to load more notifications:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // تحديد الإشعار كمقروء
      if (!notification.is_read) {
        await markAsRead(notification.id);
      }
      
      // إغلاق القائمة
      setIsOpen(false);
      
      // معالجة الإشعار بناءً على النوع
      handleNotificationAction(notification);
      
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const handleNotificationAction = (notification) => {
    const { type, data, action_url } = notification;
    
    console.log('Notification clicked:', notification);
    
    // إذا كان هناك رابط إجراء مخصص
    if (action_url) {
      window.location.href = action_url;
      return;
    }
    
    // معالجة حسب النوع
    switch (type) {
      case 'order_update':
        // الانتقال لصفحة تفاصيل الطلب
        if (data?.order_id) {
          window.location.href = `/orders/${data.order_id}`;
        }
        break;
        
      case 'message':
        // فتح صفحة الدردشة
        if (data?.chat_id) {
          window.location.href = `/chats/${data.chat_id}`;
        }
        break;
        
      case 'payment':
        // الانتقال لصفحة الدفع
        if (data?.payment_id) {
          window.location.href = `/payments/${data.payment_id}`;
        }
        break;
        
      case 'promotion':
        // عرض العرض الترويجي
        if (data?.promo_code) {
          window.location.href = `/promotions?code=${data.promo_code}`;
        }
        break;
        
      default:
        // الانتقال لصفحة جميع الإشعارات
        window.location.href = '/notifications';
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      // تحديث العدد المحلي
      refreshNotifications();
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
      case 'news':
        return <FaInfoCircle className="h-5 w-5 text-blue-500" />;
        
      case 'warning':
      case 'alert':
        return <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />;
        
      case 'error':
      case 'danger':
        return <FaExclamationCircle className="h-5 w-5 text-red-500" />;
        
      case 'success':
      case 'completed':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
        
      case 'order':
      case 'order_update':
        return <FaCheckCircle className="h-5 w-5 text-purple-500" />;
        
      case 'message':
      case 'chat':
        return <FaEnvelope className="h-5 w-5 text-indigo-500" />;
        
      case 'payment':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
        
      case 'promotion':
      case 'offer':
        return <FaExclamationCircle className="h-5 w-5 text-orange-500" />;
        
      default:
        return <FaBell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationTypeText = (type) => {
    const typeMap = {
      'info': 'معلومة',
      'news': 'أخبار',
      'warning': 'تحذير',
      'alert': 'تنبيه',
      'error': 'خطأ',
      'danger': 'خطر',
      'success': 'نجاح',
      'completed': 'مكتمل',
      'order': 'طلب',
      'order_update': 'تحديث طلب',
      'message': 'رسالة',
      'chat': 'محادثة',
      'payment': 'دفع',
      'promotion': 'عرض',
      'offer': 'تخفيض'
    };
    
    return typeMap[type] || 'إشعار';
  };

  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'تاريخ غير معروف';
      
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
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `قبل ${days} يوم`;
      } else {
        return date.toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch {
      return 'تاريخ غير معروف';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-r-4 border-r-red-500';
      case 'medium':
        return 'bg-yellow-50 border-r-4 border-r-yellow-500';
      case 'low':
        return 'bg-blue-50 border-r-4 border-r-blue-500';
      default:
        return 'bg-gray-50';
    }
  };

  // دالة لتنسيق نص الرسالة
  const formatMessage = (message) => {
    if (!message) return '';
    
    // تقليم النص إذا كان طويلاً
    if (message.length > 120) {
      return message.substring(0, 120) + '...';
    }
    
    return message;
  };

  return (
    <div className="relative">
      {/* زر الجرس */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full transition-all duration-200 hover:bg-blue-50"
        aria-label="الإشعارات"
        aria-expanded={isOpen}
        aria-controls="notifications-dropdown"
      >
        <div className="relative">
          <FaBell className="h-6 w-6 transition-transform duration-200 hover:scale-110" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* قائمة الإشعارات */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-10 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div 
            id="notifications-dropdown"
            className="absolute left-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-fade-in"
            role="dialog"
            aria-label="قائمة الإشعارات"
          >
            {/* الهيدر */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FaBell className="h-5 w-5 text-blue-600 ml-2" />
                  <h3 className="text-lg font-bold text-gray-800">
                    الإشعارات
                    {unreadCount > 0 && (
                      <span className="mr-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full animate-bounce">
                        {unreadCount} جديد
                      </span>
                    )}
                  </h3>
                </div>
                <div className="flex space-x-1 space-x-reverse">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                      title="تعليم الكل كمقروء"
                      aria-label="تعليم جميع الإشعارات كمقروءة"
                    >
                      <FaCheck className="h-4 w-4" />
                    </button>
                  )}
                  {localNotifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="مسح الكل"
                      aria-label="حذف جميع الإشعارات"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title="إغلاق"
                    aria-label="إغلاق قائمة الإشعارات"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* قائمة الإشعارات */}
            <div className="max-h-96 overflow-y-auto">
              {error ? (
                <div className="p-6 text-center">
                  <FaExclamationCircle className="h-12 w-12 mx-auto text-red-400 mb-3" />
                  <p className="text-red-600 font-medium">حدث خطأ في تحميل الإشعارات</p>
                  <button
                    onClick={loadInitialNotifications}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              ) : loading && localNotifications.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-3 text-gray-600 font-medium">جاري تحميل الإشعارات...</p>
                  <p className="text-sm text-gray-500 mt-1">يرجى الانتظار</p>
                </div>
              ) : localNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <div className="relative mx-auto w-20 h-20 mb-4">
                    <div className="absolute inset-0 bg-blue-100 rounded-full"></div>
                    <FaBell className="absolute inset-0 m-auto h-10 w-10 text-blue-400" />
                  </div>
                  <p className="font-medium text-gray-700">لا توجد إشعارات</p>
                  <p className="text-sm mt-1">عندما تتلقى إشعارات جديدة ستظهر هنا</p>
                  <button
                    onClick={refreshNotifications}
                    className="mt-4 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    تحديث
                  </button>
                </div>
              ) : (
                <>
                  {localNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                        !notification.is_read ? getPriorityColor(notification.priority || 'low') : 'bg-white'
                      } ${notification.is_read ? 'opacity-80' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => e.key === 'Enter' && handleNotificationClick(notification)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          {notification.sender_avatar ? (
                            <img
                              src={notification.sender_avatar}
                              alt={notification.sender_name}
                              className="h-10 w-10 rounded-full border-2 border-white shadow-sm"
                            />
                          ) : notification.sender_name ? (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FaUserCircle className="h-8 w-8 text-blue-600" />
                            </div>
                          ) : (
                            getNotificationIcon(notification.type)
                          )}
                        </div>
                        
                        <div className="flex-1 mr-3">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h4 className="font-bold text-gray-800 text-right">
                                {notification.title}
                              </h4>
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full mr-2">
                                {getNotificationTypeText(notification.type)}
                              </span>
                            </div>
                            {!notification.is_read && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                                جديد
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2 text-right leading-relaxed">
                            {formatMessage(notification.message)}
                          </p>
                          
                          {notification.data && Object.keys(notification.data).length > 0 && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs">
                              {Object.entries(notification.data).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-gray-600">
                                  <span>{key}:</span>
                                  <span className="font-medium">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                            <div className="flex items-center">
                              <span>{formatTimeAgo(notification.created_at)}</span>
                              {notification.sender_name && (
                                <span className="mr-2 text-blue-600 font-medium flex items-center">
                                  <FaUserCircle className="h-3 w-3 ml-1" />
                                  {notification.sender_name}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2 space-x-reverse">
                              {notification.action_url && (
                                <span className="text-blue-500 hover:text-blue-700 text-xs font-medium">
                                  عرض التفاصيل
                                </span>
                              )}
                              <button
                                onClick={(e) => handleDeleteNotification(notification.id, e)}
                                className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                                title="حذف الإشعار"
                                aria-label={`حذف إشعار ${notification.title}`}
                              >
                                <FaTrash className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {hasMore && (
                    <div className="p-4 text-center border-t border-gray-200">
                      <button
                        onClick={loadMoreNotifications}
                        disabled={isLoadingMore}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingMore ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 inline-block ml-2"></div>
                            جاري التحميل...
                          </>
                        ) : (
                          'تحميل المزيد'
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* الفوتر */}
            {(localNotifications.length > 0 || error) && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="flex justify-between items-center">
                  <button
                    onClick={refreshNotifications}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center transition-colors"
                    disabled={loading}
                  >
                    <span className="ml-1">🔄</span>
                    تحديث
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = '/notifications';
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors"
                  >
                    <FaBell className="h-4 w-4 ml-1" />
                    عرض جميع الإشعارات
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* أنميشن CSS */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;