// context/NotificationContext.js
'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

const NotificationContext = createContext(undefined);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);
  const [newNotifications, setNewNotifications] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const pollIntervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const processedNotificationIds = useRef(new Set()); // تخزين IDs الإشعارات التي تم معالجتها
  const toastNotificationIds = useRef(new Set()); // تخزين IDs الإشعارات المعروضة كـ Toast

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://moya.talaaljazeera.com/api/v1';

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
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

  // دالة تحميل الإشعارات من الخادم
  const loadNotifications = useCallback(async (showLoader = true) => {
    if (!isMountedRef.current) return;
    
    try {
      if (showLoader) setLoading(true);
      const authToken = getAuthToken();
      
      if (!authToken) {
        console.log('⚠️ No auth token available');
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      console.log('🔄 Loading notifications from:', `${API_BASE_URL}/notifications`);
      const response = await axios.get(
        `${API_BASE_URL}/notifications`,
        { headers }
      );

      console.log('📨 API Response:', response.data);

      if (response.data.status) {
        const notificationsData = response.data.data || [];
        console.log(`📊 Processing ${notificationsData.length} notifications`);
        
        // معالجة البيانات
        const processedNotifications = notificationsData.map(processNotification);
        
        // حساب الإشعارات غير المقروءة
        const unread = processedNotifications.filter(n => !n.is_read).length;
        
        setNotifications(processedNotifications);
        setUnreadCount(unread);
        setLastUpdate(new Date());
        
        // إضافة جميع IDs إلى المجموعة المعالجة
        notificationsData.forEach(notification => {
          processedNotificationIds.current.add(notification.id);
        });
        
        console.log(`✅ Loaded ${processedNotifications.length} notifications, ${unread} unread`);
      } else {
        console.error('❌ Error loading notifications:', response.data.message);
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      if (showLoader && isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [API_BASE_URL]);

  // دالة للتحقق من الإشعارات الجديدة مع منع التكرار
  const checkForNewNotifications = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      const authToken = getAuthToken();
      if (!authToken) return;
      
      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // استخدام timestamp آخر تحديث
      const timestamp = lastUpdate ? Math.floor(lastUpdate.getTime() / 1000) : 0;
      const url = `${API_BASE_URL}/notifications?since=${timestamp}`;
      
      console.log('🔄 Checking for new notifications since:', new Date(timestamp * 1000));
      const response = await axios.get(url, { headers });

      if (response.data.status) {
        const newNotificationsData = response.data.data || [];
        
        if (newNotificationsData.length > 0) {
          console.log(`🔄 Found ${newNotificationsData.length} potential new notifications`);
          
          // تصفية الإشعارات التي لم يتم معالجتها من قبل
          const trulyNewData = newNotificationsData.filter(notification => 
            !processedNotificationIds.current.has(notification.id)
          );
          
          if (trulyNewData.length === 0) {
            console.log('📭 No truly new notifications (all already processed)');
            setLastUpdate(new Date());
            return;
          }
          
          console.log(`✅ Found ${trulyNewData.length} truly new notifications`);
          
          // معالجة الإشعارات الجديدة الحقيقية
          const processedNewNotifications = trulyNewData.map(processNotification);
          
          // إضافة IDs إلى المجموعة المعالجة
          trulyNewData.forEach(notification => {
            processedNotificationIds.current.add(notification.id);
          });
          
          // إضافة الإشعارات الجديدة للقائمة الرئيسية
          setNotifications(prev => {
            // دمج وتصنيف حسب التاريخ
            const merged = [...processedNewNotifications, ...prev]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 50);
            
            return merged;
          });
          
          // تحديث العداد بالإشعارات الجديدة غير المقروءة فقط
          const newUnread = processedNewNotifications.filter(n => !n.is_read);
          if (newUnread.length > 0) {
            setUnreadCount(prev => prev + newUnread.length);
            
            // عرض Toast للإشعارات الجديدة غير المقروءة فقط التي لم تظهر من قبل
            newUnread.forEach(notification => {
              // التحقق إذا كان الـ Toast معروضاً بالفعل
              if (!toastNotificationIds.current.has(notification.id)) {
                toastNotificationIds.current.add(notification.id);
                
                // إضافة للإشعارات الجديدة المعروضة
                setNewNotifications(prev => {
                  // التأكد من عدم التكرار في حالة التحديث السريع
                  if (prev.some(n => n.id === notification.id)) {
                    return prev;
                  }
                  return [...prev, notification];
                });
                
                // إزالة Toast بعد 5 ثواني
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
          // تحديث lastUpdate حتى لو لم تكن هناك إشعارات جديدة
          setLastUpdate(new Date());
        }
      }
    } catch (error) {
      console.error('❌ Error checking for new notifications:', error);
    }
  }, [API_BASE_URL, lastUpdate]);

  // بدء التحديث التلقائي كل 30 ثانية (وليس كل ثانية)
  const startAutoRefresh = useCallback((interval = 30000) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    console.log(`🔄 Starting auto-refresh every ${interval/1000} seconds`);
    
    // التحقق الأولي فوري
    checkForNewNotifications();
    
    // ثم كل فترة محددة (30 ثانية)
    pollIntervalRef.current = setInterval(() => {
      checkForNewNotifications();
    }, interval);
  }, [checkForNewNotifications]);

  // إيقاف التحديث التلقائي
  const stopAutoRefresh = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
      console.log('⏹️ Auto-refresh stopped');
    }
  }, []);

  // دالة تعليم الكل كمقروء
  const markAllAsRead = useCallback(async () => {
    try {
      const authToken = getAuthToken();
      
      if (!authToken) {
        console.log('⚠️ No auth token available');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      console.log('📝 Marking all notifications as read...');
      
      try {
        const response = await axios.post(
          `${API_BASE_URL}/notifications/mark-all-read`,
          {},
          { headers }
        );
        
        if (response.data.status) {
          console.log('✅ All notifications marked as read');
        }
      } catch (apiError) {
        console.log('⚠️ Mark-all-read API failed, updating locally only');
      }
      
      // تحديث الحالة المحلية
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          is_read: true,
          read_at: new Date().toISOString()
        }))
      );
      setUnreadCount(0);
      
      // مسح الإشعارات الجديدة المعروضة
      setNewNotifications([]);
      toastNotificationIds.current.clear();
      
    } catch (error) {
      console.error('❌ Error in markAllAsRead:', error);
    }
  }, [API_BASE_URL]);

  // دالة تعليم إشعار كمقروء
  const markAsRead = useCallback(async (id) => {
    try {
      const authToken = getAuthToken();
      
      if (!authToken) {
        console.log('⚠️ No auth token available');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      console.log(`📝 Marking notification ${id} as read...`);
      
      try {
        const response = await axios.post(
          `${API_BASE_URL}/notifications/${id}/mark-read`,
          {},
          { headers }
        );
        
        if (response.data.status) {
          console.log(`✅ Notification ${id} marked as read`);
        } else {
          console.log(`⚠️ Mark-read API returned error for ${id}`);
        }
      } catch (apiError) {
        console.log(`⚠️ Mark-read API failed for ${id}, updating locally only`);
      }
      
      // تحديث الحالة المحلية
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
      
      // إزالة من الإشعارات الجديدة المعروضة
      setNewNotifications(prev => 
        prev.filter(notification => notification.id !== id)
      );
      
      // إزالة من مجموعة Toast IDs
      toastNotificationIds.current.delete(id);
      
    } catch (error) {
      console.error('❌ Error in markAsRead:', error);
    }
  }, [API_BASE_URL]);

  // دالة حذف إشعار واحد
  const deleteNotification = useCallback(async (id) => {
    try {
      const authToken = getAuthToken();
      
      if (!authToken) {
        console.log('⚠️ No auth token available');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      console.log(`🗑️ Deleting notification ${id}...`);
      
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/notifications/${id}`,
          { headers }
        );
        
        if (response.data.status) {
          console.log(`✅ Notification ${id} deleted`);
        }
      } catch (apiError) {
        console.log(`⚠️ Delete API failed for ${id}, updating locally only`);
      }
      
      const notificationToDelete = notifications.find(n => n.id === id);
      
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      if (notificationToDelete && !notificationToDelete.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // إزالة من الإشعارات الجديدة المعروضة
      setNewNotifications(prev => 
        prev.filter(notification => notification.id !== id)
      );
      
      // إزالة من المجموعات
      processedNotificationIds.current.delete(id);
      toastNotificationIds.current.delete(id);
      
    } catch (error) {
      console.error('❌ Error in deleteNotification:', error);
    }
  }, [API_BASE_URL, notifications]);

  // دالة حذف جميع الإشعارات
  const clearAll = useCallback(async () => {
    try {
      const authToken = getAuthToken();
      
      if (!authToken) {
        console.log('⚠️ No auth token available');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      console.log('🗑️ Clearing all notifications...');
      
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/notifications/clear-all`,
          { headers }
        );
        
        if (response.data.status) {
          console.log('✅ All notifications cleared');
        }
      } catch (apiError) {
        console.log('⚠️ Clear-all API failed, updating locally only');
      }
      
      setNotifications([]);
      setUnreadCount(0);
      setNewNotifications([]);
      
      // مسح جميع المجموعات
      processedNotificationIds.current.clear();
      toastNotificationIds.current.clear();
      
    } catch (error) {
      console.error('❌ Error in clearAll:', error);
    }
  }, [API_BASE_URL]);

  // دالة تسجيل الجهاز
  const registerDevice = async (token) => {
    try {
      console.log('📱 Registering device with token:', token.substring(0, 20) + '...');
      
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

      console.log('Registering device at:', `${API_BASE_URL}/notifications/register-device`);
      const response = await axios.post(
        `${API_BASE_URL}/notifications/register-device`,
        deviceInfo,
        { headers }
      );

      console.log('Register device response:', response.data);

      if (response.data.status) {
        console.log('✅ Device registered successfully');
        
        localStorage.setItem('fcm_token', token);
        localStorage.setItem('device_registered', 'true');
        setFcmToken(token);
        
        return response.data;
      }
      throw new Error(response.data.message);
    } catch (error) {
      console.error('❌ Error registering device:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      localStorage.setItem('fcm_token', token);
      setFcmToken(token);
      
      throw error;
    }
  };

  const getDeviceType = () => {
    if (typeof navigator === 'undefined') return 'web';
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'android';
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    return 'web';
  };

  const getDeviceName = () => {
    if (typeof navigator === 'undefined') return 'Unknown Device';
    return navigator.platform || 'Unknown Device';
  };

  const checkDeviceRegistration = () => {
    if (typeof window === 'undefined') {
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
    
    // إضافة إلى المجموعة المعالجة
    processedNotificationIds.current.add(newId);
    
    // عرض Toast
    setNewNotifications(prev => [...prev, newNotification]);
    toastNotificationIds.current.add(newId);
    
    // إزالة بعد 5 ثواني
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
        console.log('🚀 Initializing notification system...');
        
        // تحميل الإشعارات الأولية
        await loadNotifications();
        
        // بدء التحديث التلقائي كل 30 ثانية
        startAutoRefresh(30000);
      } else {
        console.log('⏸️ No auth token, skipping notification initialization');
      }
    };

    initNotifications();

    // تنظيف عند إغلاق المكون
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
    refreshNotifications: () => loadNotifications(true)
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