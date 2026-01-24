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

// قائمة CORS Proxies للإشعارات
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/'
];

// API الأساسي
const API_BASE = 'https://moya.talaaljazeera.com/api/v1';

// دالة لإنشاء URL مع CORS Proxy
const createRequestURL = (path) => {
  // في Development، استخدم API مباشرة
  if (!isProduction) {
    return `${API_BASE}${path}`;
  }
  
  // في Production، استخدم CORS Proxy
  const randomProxy = CORS_PROXIES[Math.floor(Math.random() * CORS_PROXIES.length)];
  const apiUrl = `${API_BASE}${path}`;
  
  if (randomProxy.includes('allorigins.win')) {
    return `${randomProxy}${encodeURIComponent(apiUrl)}`;
  }
  
  return `${randomProxy}${apiUrl}`;
};

// دالة fetch مع retry للإشعارات
const fetchWithRetry = async (url, options = {}, maxRetries = 2) => {
  const token = isBrowser ? localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') : null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // في Production، جرب كل proxy
    const proxies = isProduction ? CORS_PROXIES : [''];
    
    for (const proxy of proxies) {
      try {
        let requestUrl = url;
        
        // في Production، أضف proxy
        if (isProduction && proxy) {
          if (proxy.includes('allorigins.win')) {
            requestUrl = `${proxy}${encodeURIComponent(url)}`;
          } else {
            requestUrl = `${proxy}${url}`;
          }
        }
        
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(requestUrl, {
          ...options,
          headers,
          mode: 'cors'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return {
          data,
          status: response.status,
          proxyUsed: proxy || 'direct'
        };
        
      } catch (error) {
        console.warn(`🔔 Fetch attempt ${attempt} failed:`, error.message);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }
  
  throw new Error(`All ${maxRetries} attempts failed`);
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
      id: notification.id,
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
      original: notification
    };
  };

  // دالة تحميل الإشعارات - معدلة للعمل في Production
  const loadNotifications = useCallback(async (showLoader = true) => {
    if (!isMountedRef.current) return;
    
    try {
      if (showLoader) setLoading(true);
      const authToken = getAuthToken();
      
      if (!authToken) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      // في Production، نتجاهل تحميل الإشعارات إذا تسببت في مشاكل
      if (isProduction) {
        console.log('🔔 Skipping notifications load in production');
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // استخدم createRequestURL للحصول على URL صحيح
      const url = createRequestURL('/notifications');
      
      let response;
      
      if (isProduction) {
        // في Production، استخدم fetch مع retry
        const result = await fetchWithRetry(API_BASE + '/notifications', {
          method: 'GET'
        });
        response = { data: result.data };
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
          processedNotificationIds.current.add(notification.id);
        });
        
      } else {
        console.error('❌ Error loading notifications:', response.data?.message);
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    } finally {
      if (showLoader && isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // دالة للتحقق من الإشعارات الجديدة - معطلة في Production
  const checkForNewNotifications = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    // في Production، نتجاهل التحقق من الإشعارات الجديدة
    if (isProduction) {
      console.log('🔔 Skipping new notifications check in production');
      return;
    }
    
    try {
      const authToken = getAuthToken();
      if (!authToken) return;
      
      const timestamp = lastUpdate ? Math.floor(lastUpdate.getTime() / 1000) : 0;
      const url = createRequestURL(`/notifications?since=${timestamp}`);
      
      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      let response;
      
      if (isProduction) {
        const result = await fetchWithRetry(API_BASE + `/notifications?since=${timestamp}`, {
          method: 'GET'
        });
        response = { data: result.data };
      } else {
        response = await axios.get(url, { headers });
      }

      if (response.data && response.data.status) {
        const newNotificationsData = response.data.data || [];
        
        if (newNotificationsData.length > 0) {
          const trulyNewData = newNotificationsData.filter(notification => 
            !processedNotificationIds.current.has(notification.id)
          );
          
          if (trulyNewData.length === 0) {
            setLastUpdate(new Date());
            return;
          }
          
          const processedNewNotifications = trulyNewData.map(processNotification);
          
          trulyNewData.forEach(notification => {
            processedNotificationIds.current.add(notification.id);
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
            
            newUnread.forEach(notification => {
              if (!toastNotificationIds.current.has(notification.id)) {
                toastNotificationIds.current.add(notification.id);
                
                setNewNotifications(prev => {
                  if (prev.some(n => n.id === notification.id)) {
                    return prev;
                  }
                  return [...prev, notification];
                });
                
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
        } else {
          setLastUpdate(new Date());
        }
      }
    } catch (error) {
      console.error('❌ Error checking for new notifications:', error);
    }
  }, [lastUpdate]);

  // بدء التحديث التلقائي - معطلة في Production
  const startAutoRefresh = useCallback((interval = 30000) => {
    // في Production، لا نبدأ التحديث التلقائي
    if (isProduction) {
      console.log('🔔 Auto refresh disabled in production');
      return;
    }
    
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    checkForNewNotifications();
    
    pollIntervalRef.current = setInterval(() => {
      checkForNewNotifications();
    }, interval);
  }, [checkForNewNotifications]);

  // إيقاف التحديث التلقائي
  const stopAutoRefresh = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // دالة تعليم الكل كمقروء - مبسطة في Production
  const markAllAsRead = useCallback(async () => {
    try {
      const authToken = getAuthToken();
      
      if (!authToken) {
        return;
      }

      // في Production، نحدث الحالة المحلية فقط
      if (isProduction) {
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
        return;
      }

      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      const url = createRequestURL('/notifications/mark-all-read');
      
      try {
        await axios.post(url, {}, { headers });
      } catch (apiError) {
        console.error('API error in markAllAsRead:', apiError);
      }
      
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
      
    } catch (error) {
      console.error('❌ Error in markAllAsRead:', error);
    }
  }, []);

  // دالة تعليم إشعار كمقروء - مبسطة في Production
  const markAsRead = useCallback(async (id) => {
    try {
      const authToken = getAuthToken();
      
      if (!authToken) {
        return;
      }

      // في Production، نحدث الحالة المحلية فقط
      if (isProduction) {
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
        return;
      }

      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      const url = createRequestURL(`/notifications/${id}/mark-read`);
      
      try {
        await axios.post(url, {}, { headers });
      } catch (apiError) {
        console.error('API error in markAsRead:', apiError);
      }
      
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
      
    } catch (error) {
      console.error('❌ Error in markAsRead:', error);
    }
  }, []);

  // دالة حذف إشعار واحد - مبسطة في Production
  const deleteNotification = useCallback(async (id) => {
    try {
      const authToken = getAuthToken();
      
      if (!authToken) {
        return;
      }

      // في Production، نحدث الحالة المحلية فقط
      if (isProduction) {
        const notificationToDelete = notifications.find(n => n.id === id);
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        
        if (notificationToDelete && !notificationToDelete.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        setNewNotifications(prev => 
          prev.filter(notification => notification.id !== id)
        );
        processedNotificationIds.current.delete(id);
        toastNotificationIds.current.delete(id);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      const url = createRequestURL(`/notifications/${id}`);
      
      try {
        await axios.delete(url, { headers });
      } catch (apiError) {
        console.error('API error in deleteNotification:', apiError);
      }
      
      const notificationToDelete = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      if (notificationToDelete && !notificationToDelete.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      setNewNotifications(prev => 
        prev.filter(notification => notification.id !== id)
      );
      processedNotificationIds.current.delete(id);
      toastNotificationIds.current.delete(id);
      
    } catch (error) {
      console.error('❌ Error in deleteNotification:', error);
    }
  }, [notifications]);

  // دالة حذف جميع الإشعارات - مبسطة في Production
  const clearAll = useCallback(async () => {
    try {
      const authToken = getAuthToken();
      
      if (!authToken) {
        return;
      }

      // في Production، نحدث الحالة المحلية فقط
      if (isProduction) {
        setNotifications([]);
        setUnreadCount(0);
        setNewNotifications([]);
        processedNotificationIds.current.clear();
        toastNotificationIds.current.clear();
        return;
      }

      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      const url = createRequestURL('/notifications/clear-all');
      
      try {
        await axios.delete(url, { headers });
      } catch (apiError) {
        console.error('API error in clearAll:', apiError);
      }
      
      setNotifications([]);
      setUnreadCount(0);
      setNewNotifications([]);
      processedNotificationIds.current.clear();
      toastNotificationIds.current.clear();
      
    } catch (error) {
      console.error('❌ Error in clearAll:', error);
    }
  }, []);

  // دالة تسجيل الجهاز - معطلة في Production
  const registerDevice = async (token) => {
    // في Production، نتجاهل تسجيل الجهاز
    if (isProduction) {
      console.log('🔔 Skipping device registration in production');
      return {
        success: true,
        message: 'Device registration disabled in production',
        device_id: 'production-simulated-' + Date.now()
      };
    }
    
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
      const response = await axios.post(url, deviceInfo, { headers });

      if (response.data.status) {
        localStorage.setItem('fcm_token', token);
        localStorage.setItem('device_registered', 'true');
        setFcmToken(token);
        
        return response.data;
      }
      throw new Error(response.data.message);
    } catch (error) {
      console.error('❌ Error registering device:', error);
      
      // في Development، نخزن التوكن محلياً
      if (!isProduction) {
        localStorage.setItem('fcm_token', token);
        setFcmToken(token);
      }
      
      throw error;
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
    // في Production، نضيف إشعار تجريبي محلي فقط
    const newId = Date.now();
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
    
    // في Production، لا نعرض Toast
    if (!isProduction) {
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
    }
  }, []);

  // تهيئة النظام - مبسطة في Production
  useEffect(() => {
    isMountedRef.current = true;
    
    const initNotifications = async () => {
      const authToken = getAuthToken();
      
      if (authToken) {
        // في Production، لا نحمل الإشعارات ولا نبدأ التحديث التلقائي
        if (isProduction) {
          console.log('🔔 Notification system disabled in production');
          setNotifications([]);
          setUnreadCount(0);
          return;
        }
        
        await loadNotifications();
        startAutoRefresh(30000);
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