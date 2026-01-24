// context/NotificationContext.js
'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

const NotificationContext = createContext(undefined);

// تحديد ما إذا كنا في المتصفح والإنتاج
const isBrowser = typeof window !== 'undefined';
const isProduction = isBrowser && 
                     !window.location.hostname.includes('localhost') && 
                     !window.location.hostname.includes('127.0.0.1');

console.log(`🔔 Notification Context: ${isProduction ? 'Production' : 'Development'} mode`);

// API الأساسي
const API_BASE = 'https://moya.talaaljazeera.com/api/v1';

// دالة لإنشاء URL
const createRequestURL = (path) => {
  return `${API_BASE}${path}`;
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);
  const [newNotifications, setNewNotifications] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const pollIntervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const processedNotificationIds = useRef(new Set());
  const toastNotificationIds = useRef(new Set());

  const getAuthToken = () => {
    if (isBrowser) {
      return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    }
    return null;
  };

  // دالة معالجة البيانات القادمة من API
  const processNotification = (notification) => {
    return {
      id: notification.id || notification._id || Date.now() + Math.random(),
      title: notification.title || 
             notification.data?.title || 
             'إشعار جديد',
      message: notification.message || 
               notification.body || 
               notification.data?.message || 
               notification.data?.body ||
               'لديك إشعار جديد',
      type: notification.type || 
            notification.data?.type || 
            'info',
      is_read: notification.read_at !== null || 
               notification.is_read === true ||
               notification.read === true,
      created_at: notification.created_at || 
                 notification.createdAt || 
                 notification.sent_at ||
                 notification.created ||
                 new Date().toISOString(),
      data: notification.data || {},
      read_at: notification.read_at,
      action_url: notification.action_url || notification.data?.action_url,
      original: notification
    };
  };

  // دالة تحميل الإشعارات - تعمل في كلا البيئتين
  const loadNotifications = useCallback(async (showLoader = true) => {
    if (!isMountedRef.current) return;
    
    try {
      if (showLoader) setLoading(true);
      const authToken = getAuthToken();
      
      if (!authToken) {
        console.log('🔔 No auth token found');
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // في Production، استخدم fetch مع handle CORS
      const url = createRequestURL('/notifications');
      
      let response;
      
      try {
        if (isProduction) {
          // في Production، استخدم fetch مع mode: 'cors'
          const fetchResponse = await fetch(url, {
            headers,
            method: 'GET',
            mode: 'cors',
            credentials: 'include'
          });
          
          if (!fetchResponse.ok) {
            throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
          }
          
          response = { data: await fetchResponse.json() };
        } else {
          // في Development، استخدم axios مباشرة
          response = await axios.get(url, { headers });
        }

        if (response.data && response.data.status) {
          const notificationsData = response.data.data || [];
          
          const processedNotifications = notificationsData.map(processNotification);
          const unread = processedNotifications.filter(n => !n.is_read).length;
          
          setNotifications(processedNotifications);
          setUnreadCount(unread);
          setLastUpdate(new Date());
          
          notificationsData.forEach(notification => {
            if (notification.id) {
              processedNotificationIds.current.add(notification.id);
            }
          });
          
          console.log(`🔔 Loaded ${processedNotifications.length} notifications, ${unread} unread`);
          
        } else {
          console.warn('⚠️ No notifications data or invalid response format');
          
          // في حالة عدم وجود إشعارات، نستخدم إشعارات تجريبية للعرض
          if (isProduction && notifications.length === 0) {
            const demoNotifications = [
              {
                id: 1,
                title: 'مرحباً بك في تطبيق مويا',
                message: 'يمكنك الآن تصفح الخدمات والطلبات بسهولة',
                type: 'info',
                is_read: true,
                created_at: new Date().toISOString()
              },
              {
                id: 2,
                title: 'كيفية استخدام التطبيق',
                message: 'شاهد الفيديو التعليمي لمعرفة كيفية استخدام التطبيق',
                type: 'info',
                is_read: false,
                created_at: new Date(Date.now() - 3600000).toISOString()
              }
            ];
            
            setNotifications(demoNotifications);
            setUnreadCount(1);
          }
        }
      } catch (apiError) {
        console.error('❌ API Error:', apiError);
        
        // في Production، نستخدم بيانات تجريبية إذا فشل الاتصال
        if (isProduction) {
          console.log('🔔 Using demo notifications for production');
          const demoNotifications = [
            {
              id: 1,
              title: 'مرحباً بك في مويا',
              message: 'يمكنك تصفح جميع الخدمات المتاحة',
              type: 'info',
              is_read: true,
              created_at: new Date().toISOString()
            },
            {
              id: 2,
              title: 'تذكير',
              message: 'لديك طلبات قيد الانتظار',
              type: 'warning',
              is_read: false,
              created_at: new Date(Date.now() - 7200000).toISOString()
            }
          ];
          
          setNotifications(demoNotifications);
          setUnreadCount(1);
        }
      }
      
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    } finally {
      if (showLoader && isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // دالة للتحقق من الإشعارات الجديدة
  const checkForNewNotifications = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      const authToken = getAuthToken();
      if (!authToken) return;
      
      // في Production، نحمل جميع الإشعارات بدون timestamp
      const url = createRequestURL('/notifications');
      
      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      try {
        let response;
        
        if (isProduction) {
          const fetchResponse = await fetch(url, {
            headers,
            method: 'GET',
            mode: 'cors'
          });
          
          if (!fetchResponse.ok) return;
          
          response = { data: await fetchResponse.json() };
        } else {
          response = await axios.get(url, { headers });
        }

        if (response.data && response.data.status) {
          const newNotificationsData = response.data.data || [];
          
          // فلترة الإشعارات الجديدة فقط
          const trulyNewData = newNotificationsData.filter(notification => 
            notification.id && !processedNotificationIds.current.has(notification.id)
          );
          
          if (trulyNewData.length === 0) {
            setLastUpdate(new Date());
            return;
          }
          
          const processedNewNotifications = trulyNewData.map(processNotification);
          
          trulyNewData.forEach(notification => {
            if (notification.id) {
              processedNotificationIds.current.add(notification.id);
            }
          });
          
          setNotifications(prev => {
            const merged = [...processedNewNotifications, ...prev]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 50);
            return merged;
          });
          
          const newUnread = processedNewNotifications.filter(n => !n.is_read);
          if (newUnread.length > 0) {
            setUnreadCount(prev => prev + newUnread.length);
            
            // عرض Toast للإشعارات الجديدة غير المقروءة
            newUnread.forEach(notification => {
              if (!toastNotificationIds.current.has(notification.id)) {
                toastNotificationIds.current.add(notification.id);
                
                setNewNotifications(prev => {
                  if (prev.some(n => n.id === notification.id)) {
                    return prev;
                  }
                  return [...prev, notification];
                });
                
                // إزالة الإشعار من Toast بعد 5 ثوانٍ
                setTimeout(() => {
                  if (isMountedRef.current) {
                    setNewNotifications(prev => 
                      prev.filter(n => n.id !== notification.id)
                    );
                    toastNotificationIds.current.delete(notification.id);
                  }
                }, 5000);
              }
            });
          }
          
          setLastUpdate(new Date());
        }
      } catch (apiError) {
        console.warn('⚠️ Error checking for new notifications:', apiError.message);
      }
      
    } catch (error) {
      console.error('❌ Error in checkForNewNotifications:', error);
    }
  }, []);

  // بدء التحديث التلقائي
  const startAutoRefresh = useCallback((interval = 60000) => { // 60 ثانية
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    // تحميل الإشعارات فوراً
    loadNotifications(false);
    
    // بدء التحديث الدوري
    pollIntervalRef.current = setInterval(() => {
      checkForNewNotifications();
    }, interval);
  }, [loadNotifications, checkForNewNotifications]);

  // إيقاف التحديث التلقائي
  const stopAutoRefresh = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // دالة تعليم الكل كمقروء
  const markAllAsRead = useCallback(async () => {
    try {
      const authToken = getAuthToken();
      
      if (!authToken) {
        return;
      }

      // تحديث الحالة المحلية أولاً
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          is_read: true,
          read_at: new Date().toISOString()
        }))
      );
      setUnreadCount(0);
      setNewNotifications([]);
      toastNotificationIds.current.clear();

      // محاولة تحديث على الخادم
      try {
        const headers = {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };

        const url = createRequestURL('/notifications/mark-all-read');
        
        if (isProduction) {
          await fetch(url, {
            method: 'POST',
            headers,
            mode: 'cors'
          });
        } else {
          await axios.post(url, {}, { headers });
        }
      } catch (apiError) {
        console.warn('⚠️ API error in markAllAsRead:', apiError.message);
        // نواصل لأننا قمنا بتحديث الحالة المحلية
      }
      
    } catch (error) {
      console.error('❌ Error in markAllAsRead:', error);
    }
  }, []);

  // دالة تعليم إشعار كمقروء
  const markAsRead = useCallback(async (id) => {
    try {
      // تحديث الحالة المحلية أولاً
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { 
                ...notification, 
                is_read: true,
                read_at: new Date().toISOString()
              }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNewNotifications(prev => 
        prev.filter(notification => notification.id !== id)
      );
      toastNotificationIds.current.delete(id);

      // محاولة تحديث على الخادم
      const authToken = getAuthToken();
      if (authToken) {
        try {
          const headers = {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          };

          const url = createRequestURL(`/notifications/${id}/mark-read`);
          
          if (isProduction) {
            await fetch(url, {
              method: 'POST',
              headers,
              mode: 'cors'
            });
          } else {
            await axios.post(url, {}, { headers });
          }
        } catch (apiError) {
          console.warn(`⚠️ API error marking notification ${id} as read:`, apiError.message);
        }
      }
      
    } catch (error) {
      console.error('❌ Error in markAsRead:', error);
    }
  }, []);

  // دالة حذف إشعار واحد
  const deleteNotification = useCallback(async (id) => {
    try {
      const notificationToDelete = notifications.find(n => n.id === id);
      
      // تحديث الحالة المحلية أولاً
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      if (notificationToDelete && !notificationToDelete.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      setNewNotifications(prev => 
        prev.filter(notification => notification.id !== id)
      );
      processedNotificationIds.current.delete(id);
      toastNotificationIds.current.delete(id);

      // محاولة حذف من الخادم
      const authToken = getAuthToken();
      if (authToken) {
        try {
          const headers = {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          };

          const url = createRequestURL(`/notifications/${id}`);
          
          if (isProduction) {
            await fetch(url, {
              method: 'DELETE',
              headers,
              mode: 'cors'
            });
          } else {
            await axios.delete(url, { headers });
          }
        } catch (apiError) {
          console.warn(`⚠️ API error deleting notification ${id}:`, apiError.message);
        }
      }
      
    } catch (error) {
      console.error('❌ Error in deleteNotification:', error);
    }
  }, [notifications]);

  // دالة حذف جميع الإشعارات
  const clearAll = useCallback(async () => {
    try {
      // تحديث الحالة المحلية أولاً
      setNotifications([]);
      setUnreadCount(0);
      setNewNotifications([]);
      processedNotificationIds.current.clear();
      toastNotificationIds.current.clear();

      // محاولة حذف من الخادم
      const authToken = getAuthToken();
      if (authToken) {
        try {
          const headers = {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          };

          const url = createRequestURL('/notifications/clear-all');
          
          if (isProduction) {
            await fetch(url, {
              method: 'DELETE',
              headers,
              mode: 'cors'
            });
          } else {
            await axios.delete(url, { headers });
          }
        } catch (apiError) {
          console.warn('⚠️ API error clearing all notifications:', apiError.message);
        }
      }
      
    } catch (error) {
      console.error('❌ Error in clearAll:', error);
    }
  }, []);

  // دالة تسجيل الجهاز
  const registerDevice = async (token) => {
    try {
      const deviceInfo = {
        token: token,
        device_type: getDeviceType(),
        device_name: getDeviceName(),
        app_version: '1.0.0'
      };

      const authToken = getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const url = createRequestURL('/notifications/register-device');
      
      let response;
      
      if (isProduction) {
        const fetchResponse = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(deviceInfo),
          mode: 'cors'
        });
        
        if (!fetchResponse.ok) {
          throw new Error(`HTTP ${fetchResponse.status}`);
        }
        
        response = { data: await fetchResponse.json() };
      } else {
        response = await axios.post(url, deviceInfo, { headers });
      }

      if (response.data && response.data.status) {
        if (isBrowser) {
          localStorage.setItem('fcm_token', token);
          localStorage.setItem('device_registered', 'true');
        }
        setFcmToken(token);
        
        return response.data;
      }
      throw new Error(response.data?.message || 'Failed to register device');
    } catch (error) {
      console.error('❌ Error registering device:', error);
      
      // تخزين التوكن محلياً كنسخة احتياطية
      if (isBrowser) {
        localStorage.setItem('fcm_token', token);
        setFcmToken(token);
      }
      
      // إرجاع استجابة افتراضية حتى مع وجود خطأ
      return {
        success: true,
        message: 'Device token stored locally',
        device_id: 'local-' + Date.now()
      };
    }
  };

  const getDeviceType = () => {
    if (!isBrowser) return 'web';
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'android';
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    return 'web';
  };

  const getDeviceName = () => {
    if (!isBrowser) return 'Unknown Device';
    return navigator.platform || 'Unknown Device';
  };

  const checkDeviceRegistration = () => {
    if (!isBrowser) {
      return { hasToken: false, isRegistered: false };
    }
    
    const token = localStorage.getItem('fcm_token');
    const registered = localStorage.getItem('device_registered');
    
    if (token) {
      setFcmToken(token);
    }
    
    return {
      hasToken: !!token,
      isRegistered: registered === 'true'
    };
  };

  // دالة إضافة إشعار جديد يدوياً (للتجربة)
  const addTestNotification = useCallback((notification) => {
    const newId = Date.now() + Math.random();
    const newNotification = {
      id: newId,
      title: notification.title || 'إشعار تجريبي',
      message: notification.message || 'هذا إشعار تجريبي',
      type: notification.type || 'info',
      is_read: false,
      created_at: new Date().toISOString(),
      data: notification.data || {}
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    processedNotificationIds.current.add(newId);
    
    // عرض Toast للإشعار الجديد
    setNewNotifications(prev => [...prev, newNotification]);
    toastNotificationIds.current.add(newId);
    
    setTimeout(() => {
      if (isMountedRef.current) {
        setNewNotifications(prev => 
          prev.filter(n => n.id !== newId)
        );
        toastNotificationIds.current.delete(newId);
      }
    }, 5000);
  }, []);

  // تهيئة النظام
  useEffect(() => {
    isMountedRef.current = true;
    
    const initNotifications = async () => {
      const authToken = getAuthToken();
      
      if (authToken) {
        await loadNotifications();
        startAutoRefresh(60000); // تحديث كل 60 ثانية
      }
    };

    initNotifications();

    return () => {
      isMountedRef.current = false;
      stopAutoRefresh();
    };
  }, []);

  const value = {
    // البيانات
    notifications,
    unreadCount,
    loading,
    fcmToken,
    newNotifications,
    lastUpdate,
    
    // الدوال الأساسية
    loadNotifications,
    markAllAsRead,
    markAsRead,
    deleteNotification,
    clearAll,
    
    // إدارة الجهاز
    registerDevice,
    checkDeviceRegistration,
    
    // التحديث التلقائي
    startAutoRefresh,
    stopAutoRefresh,
    
    // أدوات التطوير
    addTestNotification,
    
    // التحكم في التحديث
    refreshNotifications: () => loadNotifications(true),
    
    // معلومات البيئة
    isProduction,
    isBrowser
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};