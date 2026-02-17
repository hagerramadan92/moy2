// components/NotificationToast.js
'use client';

import { useNotification } from '@/context/NotificationContext';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes,
  FaBell
} from 'react-icons/fa';
import { useEffect, useState, useRef } from 'react';

const NotificationToast = () => {
  const { newNotifications, markAsRead, fcmToken, isFirebaseInitialized } = useNotification();
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  const timeoutRefs = useRef({});

  // التحقق من تفعيل Firebase
  useEffect(() => {
    if (!isFirebaseInitialized) {
      console.log('🔔 Firebase غير مفعل - الإشعارات قد لا تعمل');
    }
  }, [isFirebaseInitialized]);

  // تحويل إشعار Firebase إلى الصيغة الداخلية
  const convertFirebaseNotification = (firebaseMessage) => {
    console.log('🔔 Converting Firebase message:', firebaseMessage);
    
    // إذا كان الإشعار يحتوي على بيانات مخصصة
    if (firebaseMessage.data) {
      const notificationData = firebaseMessage.data;
      return {
        id: firebaseMessage.messageId || `firebase-${Date.now()}-${Math.random()}`,
        title: firebaseMessage.notification?.title || notificationData.title || 'إشعار جديد',
        message: firebaseMessage.notification?.body || notificationData.message || 'لديك إشعار جديد',
        type: notificationData.type || 'info',
        is_read: false,
        created_at: new Date().toISOString(),
        action_url: notificationData.url || notificationData.action_url,
        data: notificationData
      };
    }
    
    // إذا كان الإشعار يحتوي على حقل notification مباشرة
    if (firebaseMessage.notification) {
      return {
        id: firebaseMessage.messageId || `firebase-${Date.now()}-${Math.random()}`,
        title: firebaseMessage.notification.title || 'إشعار جديد',
        message: firebaseMessage.notification.body || 'لديك إشعار جديد',
        type: 'info',
        is_read: false,
        created_at: new Date().toISOString(),
        action_url: firebaseMessage.data?.url,
        data: firebaseMessage.data
      };
    }
    
    // الإرجاع الافتراضي
    return {
      id: `firebase-${Date.now()}-${Math.random()}`,
      title: 'إشعار جديد',
      message: 'لديك إشعار جديد من التطبيق',
      type: 'info',
      is_read: false,
      created_at: new Date().toISOString(),
      data: firebaseMessage
    };
  };

  // تحديث الإشعارات المرئية
  useEffect(() => {
    console.log('🔔 NotificationToast: New notifications:', newNotifications);
    
    if (!newNotifications || newNotifications.length === 0) {
      setVisibleNotifications([]);
      return;
    }

    // التحقق من وجود إشعارات Firebase
    const firebaseNotifications = newNotifications.filter(n => 
      n.from || n.messageId || (n.notification && (n.notification.title || n.notification.body))
    );
    
    const regularNotifications = newNotifications.filter(n => 
      !(n.from || n.messageId || (n.notification && (n.notification.title || n.notification.body)))
    );

    console.log('🔔 Firebase notifications:', firebaseNotifications.length);
    console.log('🔔 Regular notifications:', regularNotifications.length);

    // تحويل إشعارات Firebase إلى الصيغة الداخلية
    const convertedFirebaseNotifications = firebaseNotifications.map(convertFirebaseNotification);
    
    // دمج الإشعارات
    const allNotifications = [...convertedFirebaseNotifications, ...regularNotifications];
    
    if (allNotifications.length === 0) {
      setVisibleNotifications([]);
      return;
    }

    // إضافة الإشعارات الجديدة فوراً
    setVisibleNotifications(prev => {
      const currentIds = new Set(prev.map(n => n.id));
      const newToAdd = allNotifications.filter(n => !currentIds.has(n.id));
      
      if (newToAdd.length === 0) return prev;
      
      const combined = [...newToAdd, ...prev].slice(0, 3);
      
      // إعداد auto-dismiss لكل إشعار جديد
      newToAdd.forEach(notification => {
        if (!timeoutRefs.current[notification.id]) {
          timeoutRefs.current[notification.id] = setTimeout(() => {
            handleAutoDismiss(notification.id);
          }, 5000);
        }
      });
      
      console.log('🔔 Combined notifications:', combined.length);
      return combined;
    });

  }, [newNotifications]);

  const handleAutoDismiss = (notificationId) => {
    setVisibleNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
    if (timeoutRefs.current[notificationId]) {
      delete timeoutRefs.current[notificationId];
    }
  };

  // تنظيف timeouts
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
      timeoutRefs.current = {};
    };
  }, []);

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'success':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <FaExclamationCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <FaExclamationCircle className="h-5 w-5 text-red-600" />;
      case 'info':
      default:
        return <FaInfoCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('ar-EG', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'الآن';
    }
  };

  const handleNotificationClick = async (notification) => {
    console.log('🔔 Notification clicked:', notification);
    
    // محاولة وضع علامة مقروءة إذا كان لدينا معرف حقيقي
    if (!notification.is_read && notification.id && !notification.id.startsWith('firebase-')) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error('❌ Error marking as read:', error);
      }
    }
    
    // إلغاء timeout
    if (timeoutRefs.current[notification.id]) {
      clearTimeout(timeoutRefs.current[notification.id]);
      delete timeoutRefs.current[notification.id];
    }
    
    // إزالة من العرض
    setVisibleNotifications(prev => 
      prev.filter(n => n.id !== notification.id)
    );
    
    // التنقل إذا كان هناك رابط
    if (notification.action_url) {
      console.log('🔔 Navigating to:', notification.action_url);
      window.location.href = notification.action_url;
    } else if (notification.data?.url) {
      console.log('🔔 Navigating to data URL:', notification.data.url);
      window.location.href = notification.data.url;
    } else if (notification.data?.action_url) {
      console.log('🔔 Navigating to action URL:', notification.data.action_url);
      window.location.href = notification.data.action_url;
    }
  };

  const handleClose = (e, notificationId) => {
    e.stopPropagation();
    
    if (timeoutRefs.current[notificationId]) {
      clearTimeout(timeoutRefs.current[notificationId]);
      delete timeoutRefs.current[notificationId];
    }
    
    setVisibleNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  };

  // عرض رسالة إذا لم يتم تفعيل Firebase
  if (!isFirebaseInitialized) {
    return null; // يمكنك عرض رسالة بديلة إذا أردت
  }

  if (visibleNotifications.length === 0) return null;

  console.log('🔔 Rendering visible notifications:', visibleNotifications.length);

  return (
    <div className="fixed top-4 right-4 z-[1000] space-y-3">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 animate-slideInRight cursor-pointer hover:shadow-2xl transition-shadow duration-200"
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 mr-3">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-gray-800 text-sm">
                  {notification.title}
                </h4>
                <button
                  onClick={(e) => handleClose(e, notification.id)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  <FaTimes className="h-3 w-3" />
                </button>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {notification.message}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-700">
                  {formatTime(notification.created_at)}
                </span>
                {!notification.is_read && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    <FaBell className="h-3 w-3 ml-1" />
                    جديد
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;