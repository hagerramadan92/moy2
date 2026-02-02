// context/NotificationContext.js
'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const NotificationContext = createContext(undefined);

const isBrowser = typeof window !== 'undefined';

// API الحقيقي للباك إند - لا نستخدم بيانات تجريبية
const API_BASE_URL = 'https://moya.talaaljazeera.com/api/v1';

const createRequestURL = (path) => {
  const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

// دالة fetch محسنة للباك إند الحقيقي مع معالجة CORS
const enhancedFetch = async (url, options = {}) => {
  // دالة للحصول على التوكن
  const getAuthToken = () => {
    if (!isBrowser) return null;
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    return token;
  };

  const authToken = getAuthToken();
  
  // إنشاء headers الأساسية
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const defaultOptions = {
    method: 'GET',
    headers,
    mode: 'cors', // مهم للـ CORS
    cache: 'no-store', // لا نستخدم الكاش
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  // تحويل body إلى JSON إذا كان موجوداً
  if (options.body && typeof options.body !== 'string') {
    finalOptions.body = JSON.stringify(options.body);
  }

  try {
    
    // إضافة timeout للطلب (15 ثانية)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    finalOptions.signal = controller.signal;
    
    const response = await fetch(url, finalOptions);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`❌ Backend Error ${response.status}: ${response.statusText}`);
      
      // إذا كان 401 (غير مصرح)، نطلب إعادة تسجيل الدخول
      if (response.status === 401) {
        if (isBrowser) {
          // تنظيف بيانات الجلسة
          localStorage.removeItem('accessToken');
          sessionStorage.removeItem('accessToken');
          // يمكن إعادة التوجيه للصفحة الرئيسية
          // window.location.href = '/login';
        }
        throw new Error('انتهت جلسة الدخول، يرجى إعادة تسجيل الدخول');
      }
      
      // إذا كان 404 (غير موجود)
      if (response.status === 404) {
        throw new Error('الرابط غير موجود على الخادم');
      }
      
      // إذا كان 500 (خطأ داخلي في الخادم)
      if (response.status >= 500) {
        throw new Error('خطأ داخلي في الخادم، يرجى المحاولة لاحقاً');
      }
      
      throw new Error(`خطأ ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    }
    
    // إذا لم تكن JSON، نعيد النص
    const textData = await response.text();
    return { 
      status: true, 
      data: textData,
      isText: true 
    };
    
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ Fetch Error Details:', {
      url,
      error: error.message,
      errorName: error.name,
      isNetworkError: error.name === 'TypeError' || error.name === 'AbortError'
    });
    
    throw error; // نرمي الخطأ للتعامل معه في الكود الرئيسي
  }
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);
  const [newNotifications, setNewNotifications] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showChatAlerts, setShowChatAlerts] = useState(false);
  
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

  // دالة معالجة الإشعارات القادمة من الباك إند
  const processNotification = (notification) => {
    return {
      id: notification.id || notification._id,
      title: notification.title || 'إشعار جديد',
      message: notification.message || 'لديك إشعار جديد',
      type: notification.type || 'info',
      is_read: notification.is_read === false ? false : true,
      created_at: notification.created_at || new Date().toISOString(),
      data: notification.data || {},
      read_at: notification.read_at,
      action_url: notification.action_url,
      original: notification
    };
  };

  // دالة جلب الإشعارات الحقيقية من الباك إند
  const loadNotifications = useCallback(async (showLoader = true) => {
    if (!isMountedRef.current) return;
    
    try {
      if (showLoader) {
        setLoading(true);
        setError(null);
      }
      
      const authToken = getAuthToken();
      
      // إذا لم يكن هناك token، نوقف التحميل
      if (!authToken) {
        setNotifications([]);
        setUnreadCount(0);
        setError('يجب تسجيل الدخول لعرض الإشعارات');
        return;
      }

      try {
        const url = createRequestURL('/notifications');
        
        const response = await enhancedFetch(url);
        
        // توقع استجابة Laravel النموذجية
        if (response && (response.success === true || response.status === 'success' || response.status === true)) {
          const notificationsData = response.data || [];
          
          if (Array.isArray(notificationsData)) {
            const processedNotifications = notificationsData.map(processNotification);
            const unread = processedNotifications.filter(n => !n.is_read).length;
            
            setNotifications(processedNotifications);
            setUnreadCount(unread);
            setLastUpdate(new Date());
            
            // حفظ IDs المعالجة لتتبع الإشعارات الجديدة
            notificationsData.forEach(notification => {
              if (notification.id) {
                processedNotificationIds.current.add(notification.id);
              }
            });
            
          } else {
            throw new Error('تنسيق البيانات غير صحيح من الخادم');
          }
          
        } else {
          throw new Error(response?.message || 'استجابة غير متوقعة من الخادم');
        }
      } catch (apiError) {
        console.error('❌ API Error in loadNotifications:', apiError.message);
        setError(apiError.message);
        
        // نترك القائمة فارغة عند فشل الاتصال - لا نعرض بيانات تجريبية
        setNotifications([]);
        setUnreadCount(0);
      }
      
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      setError(error.message);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      if (showLoader && isMountedRef.current) {
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    }
  }, []);

  // دالة التحقق من إشعارات جديدة
  const checkForNewNotifications = useCallback(async (forceShow = false) => {
    if (!isMountedRef.current) {
      console.log('🔔 NotificationContext: Component not mounted, skipping check');
      return;
    }
    
    try {
      const authToken = getAuthToken();
      if (!authToken) {
        console.log('🔔 NotificationContext: No auth token, skipping check');
        return;
      }
      
      console.log('🔔 NotificationContext: Checking for new notifications...');
      const url = createRequestURL('/notifications');
      
      try {
        const response = await enhancedFetch(url);
        
        if (response && (response.success === true || response.status === 'success' || response.status === true)) {
          const newNotificationsData = response.data || [];
          
          console.log('🔔 NotificationContext: Received notifications:', newNotificationsData.length);
          
          if (!Array.isArray(newNotificationsData)) return;
          
          // معالجة جميع الإشعارات
          const processedNotifications = newNotificationsData.map(processNotification);
          
          // فلترة الإشعارات الجديدة (غير موجودة في processedNotificationIds)
          const trulyNewData = newNotificationsData.filter(notification => 
            notification.id && !processedNotificationIds.current.has(notification.id)
          );
          
          console.log('🔔 NotificationContext: Truly new notifications:', trulyNewData.length, 'Total notifications:', newNotificationsData.length, 'Processed IDs count:', processedNotificationIds.current.size);
          
          // حفظ IDs الجديدة
          newNotificationsData.forEach(notification => {
            if (notification.id) {
              processedNotificationIds.current.add(notification.id);
            }
          });
          
          // تحديث الإشعارات مع إزالة التكرارات
          setNotifications(prev => {
            // إنشاء Map لإزالة التكرارات (نحتفظ بالإصدار الأحدث)
            const notificationsMap = new Map();
            
            // إضافة الإشعارات القديمة
            prev.forEach(notification => {
              if (notification.id) {
                notificationsMap.set(notification.id, notification);
              }
            });
            
            // إضافة/تحديث الإشعارات الجديدة
            processedNotifications.forEach(notification => {
              if (notification.id) {
                notificationsMap.set(notification.id, notification);
              }
            });
            
            // تحويل Map إلى Array وترتيب حسب التاريخ
            const merged = Array.from(notificationsMap.values())
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 50);
            
            return merged;
          });
          
          // تحديث عدد الإشعارات غير المقروءة
          const allUnread = processedNotifications.filter(n => !n.is_read);
          const newUnread = allUnread.filter(n => !toastNotificationIds.current.has(n.id));
          
          if (allUnread.length > 0) {
            setUnreadCount(allUnread.length);
            
            // عرض إشعارات Toast تلقائياً للإشعارات غير المقروءة التي لم تُعرض من قبل
            if (newUnread.length > 0) {
              console.log('🔔 NotificationContext: New unread notifications to show:', newUnread.length);
              
              newUnread.forEach(notification => {
                console.log('🔔 NotificationContext: Adding notification to toast:', notification.id, notification.title);
                toastNotificationIds.current.add(notification.id);
                
                // إضافة الإشعار فوراً للعرض
                setNewNotifications(prev => {
                  if (prev.some(n => n.id === notification.id)) {
                    console.log('🔔 NotificationContext: Notification already in list, skipping');
                    return prev;
                  }
                  console.log('🔔 NotificationContext: Adding notification to newNotifications state');
                  return [...prev, notification];
                });
                
                // إزالة Toast بعد 5 ثوانٍ (يتم التعامل معها في NotificationToast)
                setTimeout(() => {
                  if (isMountedRef.current) {
                    setNewNotifications(prev => 
                      prev.filter(n => n.id !== notification.id)
                    );
                    toastNotificationIds.current.delete(notification.id);
                  }
                }, 5000);
              });
            } else {
              console.log('🔔 NotificationContext: All unread notifications already shown');
            }
          } else {
            console.log('🔔 NotificationContext: No unread notifications');
          }
          
          setLastUpdate(new Date());
        }
      } catch (apiError) {
        console.warn('⚠️ Error checking for new notifications:', apiError.message);
      }
      
    } catch (error) {
      console.error('❌ Error in checkForNewNotifications:', error);
    }
  }, [showAlerts, showChatAlerts]);

  // بدء التحديث التلقائي
  const startAutoRefresh = useCallback((interval = 5000) => { // تقليل من 30 ثانية إلى 5 ثوانٍ
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    console.log('🔔 NotificationContext: Starting auto refresh with interval:', interval);
    
    // تحميل الإشعارات أولاً بدون عرض toasts
    loadNotifications(false);
    
    // التحقق فوراً من الإشعارات الجديدة
    setTimeout(() => {
      checkForNewNotifications(true);
    }, 1000); // بعد ثانية واحدة من التحميل
    
    // بدء التحديث الدوري كل 5 ثوانٍ (بدلاً من 30)
    pollIntervalRef.current = setInterval(() => {
      console.log('🔔 NotificationContext: Polling for new notifications...');
      // تمرير true لعرض الإشعارات تلقائياً
      checkForNewNotifications(true);
    }, interval);
    
  }, [loadNotifications, checkForNewNotifications]);

  // إيقاف التحديث التلقائي
  const stopAutoRefresh = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // دالة لتفعيل/إلغاء تفعيل عرض الـ alerts
  const toggleAlerts = useCallback((show = true) => {
    setShowAlerts(show);
  }, []);

  // دالة لتفعيل/إلغاء تفعيل عرض الـ alerts للشات
  const toggleChatAlerts = useCallback((show = true) => {
    setShowChatAlerts(show);
  }, []);

  // دالة لجلب الإشعارات وعرض الـ toasts
  const loadNotificationsWithAlerts = useCallback(async () => {
    // تفعيل عرض الـ alerts مؤقتاً
    setShowAlerts(true);
    await loadNotifications(true);
    // بعد تحميل الإشعارات، نعطل عرض الـ alerts تلقائياً
    setTimeout(() => setShowAlerts(false), 1000);
  }, [loadNotifications]);

  // دالة التحقق من إشعارات جديدة مع عرض الـ toasts
  const checkNewNotificationsWithAlerts = useCallback(async () => {
    // تفعيل عرض الـ alerts مؤقتاً
    setShowAlerts(true);
    await checkForNewNotifications(true);
    // بعد التحقق، نعطل عرض الـ alerts تلقائياً
    setTimeout(() => setShowAlerts(false), 1000);
  }, [checkForNewNotifications]);

  // تعليم جميع الإشعارات كمقروءة
  const markAllAsRead = useCallback(async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('يجب تسجيل الدخول');
      }

      const url = createRequestURL('/notifications/mark-all-read');
      const response = await enhancedFetch(url, { method: 'POST' });
      
      if (response && (response.success === true || response.status === 'success')) {
        // بعد النجاح على الباك إند، نحدث الحالة المحلية
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
        
      } else {
        throw new Error(response?.message || 'فشل في تعليم الإشعارات كمقروءة');
      }
      
    } catch (error) {
      console.error('❌ Error in markAllAsRead:', error);
      setError(error.message);
      throw error;
    }
  }, []);

  // تعليم إشعار كمقروء
  const markAsRead = useCallback(async (id) => {
    try {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('يجب تسجيل الدخول');
      }

      const url = createRequestURL(`/notifications/${id}/mark-read`);
      const response = await enhancedFetch(url, { method: 'POST' });
      
      if (response && (response.success === true || response.status === 'success')) {
        // تحديث الحالة المحلية بعد النجاح
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
        
      } else {
        throw new Error(response?.message || 'فشل في تعليم الإشعار كمقروء');
      }
      
    } catch (error) {
      console.error('❌ Error in markAsRead:', error);
      throw error;
    }
  }, []);

  // حذف إشعار
  const deleteNotification = useCallback(async (id) => {
    try {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('يجب تسجيل الدخول');
      }

      const url = createRequestURL(`/notifications/${id}`);
      const response = await enhancedFetch(url, { method: 'DELETE' });
      
      if (response && (response.success === true || response.status === 'success')) {
        // تحديث الحالة المحلية بعد النجاح
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
        
      } else {
        throw new Error(response?.message || 'فشل في حذف الإشعار');
      }
      
    } catch (error) {
      console.error('❌ Error in deleteNotification:', error);
      throw error;
    }
  }, [notifications]);

  // مسح جميع الإشعارات
  const clearAll = useCallback(async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('يجب تسجيل الدخول');
      }

      const url = createRequestURL('/notifications/clear-all');
      const response = await enhancedFetch(url, { method: 'DELETE' });
      
      if (response && (response.success === true || response.status === 'success')) {
        // تحديث الحالة المحلية بعد النجاح
        setNotifications([]);
        setUnreadCount(0);
        setNewNotifications([]);
        processedNotificationIds.current.clear();
        toastNotificationIds.current.clear();
        
      } else {
        throw new Error(response?.message || 'فشل في مسح جميع الإشعارات');
      }
      
    } catch (error) {
      console.error('❌ Error in clearAll:', error);
      throw error;
    }
  }, []);

  // دالة تسجيل الجهاز للإشعارات
  const registerDevice = async (token) => {
    try {
    //  const authToken = getAuthToken();
      const sessionId = getSessionId();
      // التحقق من وجود التوكن
      // if (!authToken) {
      //   throw new Error('يجب تسجيل الدخول لتسجيل الجهاز');
      // }

      const deviceInfo = {
        token: token,
        device_type: getDeviceType(),
        device_name: getDeviceName(),
        app_version: '1.0.0',
        platform: 'web',
        session_id: sessionId,
      };

      const url = createRequestURL('/notifications/register-device');
      const response = await enhancedFetch(url, {
        method: 'POST',
        body: deviceInfo
      });

      // تحسين التحقق من الـ response
      if (response && (response.success === true || response.status === 'success' || response.status === true)) {
        if (isBrowser) {
          localStorage.setItem('fcm_token', token);
          localStorage.setItem('device_registered', 'true');
          localStorage.setItem('current_device_id', response.data?.device_id || response.device_id || 'real-device-' + Date.now());
        }
        setFcmToken(token);
        
        return {
          success: true,
          message: response.message || 'تم تسجيل الجهاز بنجاح',
          data: response.data || response
        };
      }
      
      // إذا وصلنا هنا، فهناك مشكلة في الـ response
      const errorMessage = response?.message || response?.error || 'فشل في تسجيل الجهاز';
      throw new Error(errorMessage);
      
    } catch (error) {
      console.error('❌ Error registering device:', error);
      
      // إعادة الخطأ بشكل منظم
      throw new Error(error.message || 'حدث خطأ غير متوقع أثناء تسجيل الجهاز');
    }
  };
   function getSessionId() {
    if (typeof window === "undefined") return null;
  
    const key = "session_id";
    let sessionId = localStorage.getItem(key);
  
    if (!sessionId) {
      sessionId =
        crypto?.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  
      localStorage.setItem(key, sessionId);
    }
  
    return sessionId;
  }

  
  // الحصول على نوع الجهاز
  const getDeviceType = () => {
    if (!isBrowser) return 'web';
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'android';
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    return 'web';
  };

  // الحصول على اسم الجهاز
  const getDeviceName = () => {
    if (!isBrowser) return 'Unknown Device';
    return navigator.platform || 'Unknown Device';
  };

  // التحقق من تسجيل الجهاز
  const checkDeviceRegistration = () => {
    if (!isBrowser) {
      return { hasToken: false, isRegistered: false };
    }
    
    const token = localStorage.getItem('fcm_token');
    const registered = localStorage.getItem('device_registered');
    const deviceId = localStorage.getItem('current_device_id');
    
    if (token) {
      setFcmToken(token);
    }
    
    return {
      hasToken: !!token,
      isRegistered: registered === 'true',
      deviceId: deviceId
    };
  };

  // تهيئة نظام الإشعارات
  useEffect(() => {
    isMountedRef.current = true;
    
    const initNotifications = async () => {
      const authToken = getAuthToken();
      
      if (authToken) {
        await loadNotifications(false); // بدون عرض toasts عند التهيئة
        startAutoRefresh(5000); // تحديث كل 5 ثوانٍ (بدلاً من 30)
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    // تهيئة فورية بدون تأخير
    initNotifications();

    return () => {
      isMountedRef.current = false;
      stopAutoRefresh();
    };
  }, []);

  // الاستماع لتغيرات حالة المصادقة
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken' || e.key === null) {
        loadNotifications(false); // بدون عرض toasts عند تغيير التوكن
        // التحقق من الإشعارات الجديدة بعد تحديث التوكن
        setTimeout(() => {
          checkForNewNotifications(true);
        }, 500);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // التحقق فوراً من الإشعارات عند عودة التركيز
        checkForNewNotifications(true);
      }
    };

    if (isBrowser) {
      window.addEventListener('storage', handleStorageChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    return () => {
      if (isBrowser) {
        window.removeEventListener('storage', handleStorageChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [loadNotifications, checkForNewNotifications]);

  // دالة اختبار الاتصال بالباك إند
  const testBackendConnection = useCallback(async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) {
        return { connected: false, message: 'لم يتم تسجيل الدخول' };
      }

      const url = createRequestURL('/notifications');
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        },
        method: 'GET',
        mode: 'cors'
      });

      return {
        connected: response.ok,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      return {
        connected: false,
        message: error.message
      };
    }
  }, []);

  const value = {
    // البيانات الحقيقية من الباك إند
    notifications,
    unreadCount,
    loading,
    fcmToken,
    newNotifications,
    lastUpdate,
    error,
    showAlerts,
    showChatAlerts,
    
    // الدوال الأساسية
    loadNotifications: loadNotificationsWithAlerts, // استخدام الدالة المعدلة
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
    
    // التحكم في عرض الـ alerts
    toggleAlerts,
    toggleChatAlerts,
    checkNewNotificationsWithAlerts, // دالة جديدة
    
    // اختبار الاتصال
    testBackendConnection,
    
    // معلومات التصحيح
    debugInfo: () => ({
      notificationsCount: notifications.length,
      unreadCount,
      hasAuthToken: !!getAuthToken(),
      apiBase: API_BASE_URL,
      lastUpdate: lastUpdate?.toISOString(),
      processedIdsCount: processedNotificationIds.current.size,
      toastIdsCount: toastNotificationIds.current.size,
      isConnected: !!getAuthToken(),
      showAlerts,
      showChatAlerts
    })
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