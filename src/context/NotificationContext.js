// context/NotificationContext.js
'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { messaging, getToken, onMessage, deleteToken, VAPID_KEY } from '../../config/firebase-config';

const NotificationContext = createContext(undefined);

const isBrowser = typeof window !== 'undefined';

// API الحقيقي للباك إند
const API_BASE_URL = 'https://dashboard.waytmiah.com/api/v1';

const createRequestURL = (path) => {
  const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

// دالة fetch محسنة
const enhancedFetch = async (url, options = {}) => {
  const getAuthToken = () => {
    if (!isBrowser) return null;
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  };

  const authToken = getAuthToken();
  
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
    mode: 'cors',
    cache: 'no-store',
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  if (options.body && typeof options.body !== 'string') {
    finalOptions.body = JSON.stringify(options.body);
  }

  try {
    const controller = new AbortController();
    // const timeoutId = setTimeout(() => controller.abort(), 15000);
    finalOptions.signal = controller.signal;
    
    const response = await fetch(url, finalOptions);
    // clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 401) {
        if (isBrowser) {
          localStorage.removeItem('accessToken');
          sessionStorage.removeItem('accessToken');
        }
        throw new Error('انتهت جلسة الدخول');
      }
      
      throw new Error(`خطأ ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    const textData = await response.text();
    return { 
      status: true, 
      data: textData,
      isText: true 
    };
    
  } catch (error) {
    console.error('❌ Fetch Error:', error.message);
    throw error;
  }
};

// طلب إذن الإشعارات
const requestNotificationPermission = async () => {
  if (!isBrowser || !('Notification' in window)) {
    console.log('🔔 Browser does not support notifications');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('🔔 Notification permission:', permission);
    return permission;
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return 'denied';
  }
};

// التحقق من دعم Service Worker
const checkServiceWorkerSupport = () => {
  if (!isBrowser) return false;
  
  if (!('serviceWorker' in navigator)) {
    console.log('🔔 Service Worker not supported');
    return false;
  }
  
  if (!('PushManager' in window)) {
    console.log('🔔 Push notifications not supported');
    return false;
  }
  
  return true;
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
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false);
  const [actionToasts, setActionToasts] = useState([]);
  
  const isMountedRef = useRef(true);
  const processedNotificationIds = useRef(new Set());
  const toastNotificationIds = useRef(new Set());
  const firebaseMessageListener = useRef(null);
  const pollIntervalRef = useRef(null);

  const getAuthToken = () => {
    if (isBrowser) {
      return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    }
    return null;
  };

  const getUserId = () => {
    if (!isBrowser) return null;
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || user._id;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return null;
  };

  // دالة لإضافة Toast
  const addActionToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, timestamp: new Date() };
    
    setActionToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setActionToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
    
    return id;
  }, []);

  const removeActionToast = useCallback((id) => {
    setActionToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

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

  // الحصول على اسم الجهاز مع معلومات إضافية
  const getDeviceName = () => {
    if (!isBrowser) return 'Unknown Device';
    
    const userAgent = navigator.userAgent;
    let deviceName = 'Web Device';
    
    // الكشف عن نوع الجهاز
    if (/android/i.test(userAgent)) {
      deviceName = 'Android Device';
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
      deviceName = 'iOS Device';
    } else if (/Macintosh|Mac/.test(userAgent)) {
      deviceName = 'Mac Device';
    } else if (/Windows/.test(userAgent)) {
      deviceName = 'Windows Device';
    } else if (/Linux/.test(userAgent)) {
      deviceName = 'Linux Device';
    }
    
    // إضافة معلومات المتصفح
    if (/Chrome/.test(userAgent)) {
      deviceName += ' (Chrome)';
    } else if (/Firefox/.test(userAgent)) {
      deviceName += ' (Firefox)';
    } else if (/Safari/.test(userAgent)) {
      deviceName += ' (Safari)';
    } else if (/Edge/.test(userAgent)) {
      deviceName += ' (Edge)';
    }
    
    return deviceName;
  };

  // الحصول على نوع الجهاز
  const getDeviceType = () => {
    if (!isBrowser) return 'web';
    const ua = navigator.userAgent.toLowerCase();
    
    if (/android/.test(ua)) return 'android';
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/windows phone/.test(ua)) return 'windows';
    
    // للويب، يمكن استخدام 'web' أو 'browser'
    return 'web';
  };

  // الحصول على معلومات الجهاز المسجلة
  const getRegisteredDeviceInfo = useCallback(() => {
    if (!isBrowser) return null;
    
    try {
      const deviceInfoStr = localStorage.getItem('device_info');
      if (deviceInfoStr) {
        return JSON.parse(deviceInfoStr);
      }
    } catch (error) {
      console.error('Error parsing device info:', error);
    }
    
    return {
      session_id: localStorage.getItem('device_session_id'),
      device_id: localStorage.getItem('current_device_id'),
      registered: localStorage.getItem('device_registered') === 'true'
    };
  }, []);

  // دالة مساعدة لتسجيل الجهاز (بدون useCallback)
  const registerDeviceFunc = async (token, authToken) => {
    try {
      // إنشاء معرف الجلسة فريد
      const generateSessionId = () => {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      };

      const deviceInfo = {
        token: token,
        device_type: getDeviceType(),
        device_name: getDeviceName(),
        app_version: '1.0.0',
        session_id: generateSessionId() // هذا الحقل مطلوب حسب الـ API
      };

      console.log('🔔 Registering device with data:', deviceInfo);

      const url = createRequestURL('/notifications/register-device');
      const response = await enhancedFetch(url, {
        method: 'POST',
        body: deviceInfo
      });

      console.log('🔔 Device registration response:', response);

      if (response && response.status === true) {
        console.log('🔔 Device registered successfully on backend');
        
        // حفظ معلومات الجهاز في localStorage
        localStorage.setItem('device_registered', 'true');
        localStorage.setItem('device_session_id', deviceInfo.session_id);
        localStorage.setItem('current_device_id', response.data?.device_id || 'firebase-device-' + Date.now());
        
        // حفظ معلومات إضافية من الاستجابة إذا وجدت
        if (response.data) {
          localStorage.setItem('device_info', JSON.stringify(response.data));
        }
        
        return {
          success: true,
          message: response.message || 'تم تسجيل الجهاز بنجاح',
          data: response.data,
          session_id: deviceInfo.session_id
        };
      }
      
      // محاولة تنسيقات مختلفة للاستجابة
      if (response && response.success) {
        console.log('🔔 Device registered (success format)');
        
        localStorage.setItem('device_registered', 'true');
        localStorage.setItem('device_session_id', deviceInfo.session_id);
        
        return {
          success: true,
          message: response.message || 'تم تسجيل الجهاز بنجاح',
          data: response.data || response,
          session_id: deviceInfo.session_id
        };
      }
      
      const errorMessage = response?.message || 'فشل في تسجيل الجهاز';
      console.error('🔔 Registration failed:', errorMessage, response);
      throw new Error(errorMessage);
      
    } catch (error) {
      console.error('❌ Error registering device:', error);
      throw error;
    }
  };

  // دالة جلب الإشعارات
  const loadNotifications = useCallback(async (showLoader = true) => {
    if (!isMountedRef.current) return;
    
    try {
      if (showLoader) {
        setLoading(true);
        setError(null);
      }
      
      const authToken = getAuthToken();
      
      if (!authToken) {
        setNotifications([]);
        setUnreadCount(0);
        setError('يجب تسجيل الدخول لعرض الإشعارات');
        return;
      }

      const url = createRequestURL('/notifications');
      const response = await enhancedFetch(url);
      
      if (response && (response.status === true || response.success === true)) {
        const notificationsData = response.data || [];
        
        if (Array.isArray(notificationsData)) {
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
        } else {
          throw new Error('تنسيق البيانات غير صحيح من الخادم');
        }
      } else {
        throw new Error(response?.message || 'استجابة غير متوقعة من الخادم');
      }
    } catch (apiError) {
      console.error('❌ API Error in loadNotifications:', apiError.message);
      setError(apiError.message);
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

  // دالة جلب عدد الإشعارات غير المقروءة
  const loadUnreadCount = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      const authToken = getAuthToken();
      if (!authToken) {
        setUnreadCount(0);
        return;
      }

      const url = createRequestURL('/notifications/unread-count');
      const response = await enhancedFetch(url);
      
      if (response && response.status === true) {
        const count = response.data?.count || response.count || 0;
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('❌ Error loading unread count:', error);
      const localUnread = notifications.filter(n => !n.is_read).length;
      setUnreadCount(localUnread);
    }
  }, []);

  // دالة معالجة إشعار Firebase عند استلامه
  const handleFirebaseMessage = useCallback((payload) => {
    if (!isMountedRef.current || !payload) return;
    
    console.log('🔔 Firebase: Message received:', payload);
    
    try {
      const notificationData = payload.data || payload.notification || {};
      
      // إذا كانت بيانات الإشعار موجودة في payload.data
      if (notificationData.notificationId || notificationData.id) {
        const processed = processNotification(notificationData);
        
        if (processedNotificationIds.current.has(processed.id)) {
          console.log('🔔 Firebase: Notification already processed');
          return;
        }
        
        processedNotificationIds.current.add(processed.id);
        
        // تحديث قائمة الإشعارات
        setNotifications(prev => {
          const exists = prev.some(n => n.id === processed.id);
          if (exists) {
            return prev.map(n => n.id === processed.id ? processed : n);
          }
          
          const newList = [processed, ...prev].slice(0, 50);
          return newList;
        });
        
        // تحديث عدد الإشعارات غير المقروءة
        if (!processed.is_read) {
          setUnreadCount(prev => prev + 1);
        }
        
        // عرض Toast إذا كان الإشعار غير مقروء
        if (!processed.is_read && showAlerts && !toastNotificationIds.current.has(processed.id)) {
          toastNotificationIds.current.add(processed.id);
          
          setNewNotifications(prev => {
            if (prev.some(n => n.id === processed.id)) {
              return prev;
            }
            return [...prev, processed];
          });
          
          // إزالة Toast بعد 5 ثوان
          setTimeout(() => {
            if (isMountedRef.current) {
              setNewNotifications(prev => 
                prev.filter(n => n.id !== processed.id)
              );
              toastNotificationIds.current.delete(processed.id);
            }
          }, 5000);
        }
        
        setLastUpdate(new Date());
        
        // عرض إشعار النظام إذا كان التطبيق في الخلفية
        if (payload.notification && Notification.permission === 'granted') {
          const { title, body, icon } = payload.notification;
          new Notification(title || 'إشعار جديد', {
            body: body || 'لديك إشعار جديد',
            icon: icon || '/notification-icon.png',
            badge: '/badge-icon.png',
            tag: processed.id,
            data: processed.data || {}
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Error handling Firebase message:', error);
    }
  }, [showAlerts]);

  // دالة الحصول على FCM Token
  const getFCMToken = useCallback(async () => {
    if (!isBrowser || !messaging) {
      return null;
    }

    try {
      // التحقق من إذن الإشعارات
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
      
      if (permission !== 'granted') {
        addActionToast('تم رفض إذن الإشعارات', 'warning');
        return null;
      }

      // التحقق من دعم Service Worker
      if (!checkServiceWorkerSupport()) {
        return null;
      }

      // تسجيل Service Worker
      let registration;
      try {
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      } catch (swError) {
        console.error('❌ Service Worker registration failed:', swError);
        
        // محاولة استخدام service worker افتراضي
        if ('serviceWorker' in navigator) {
          registration = await navigator.serviceWorker.ready;
        } else {
          throw new Error('Service Worker غير مدعوم في هذا المتصفح');
        }
      }

      // الانتظار حتى يصبح Service Worker نشطاً (مطلوب لـ PushManager)
      const waitForActiveRegistration = (reg) => {
        if (reg.active) return Promise.resolve(reg);
        const sw = reg.installing || reg.waiting;
        if (!sw) return navigator.serviceWorker.ready.then(() => reg);
        return new Promise((resolve) => {
          const onStateChange = () => {
            if (sw.state === 'activated' && reg.active) {
              sw.removeEventListener('statechange', onStateChange);
              resolve(reg);
            }
          };
          sw.addEventListener('statechange', onStateChange);
          if (reg.active) {
            sw.removeEventListener('statechange', onStateChange);
            resolve(reg);
          }
        });
      };
      registration = await waitForActiveRegistration(registration);

      // الحصول على FCM Token
      const currentToken = await getToken(messaging, { 
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });
      
      if (currentToken) {
        setFcmToken(currentToken);
        
        // حفظ التوكن في localStorage
        localStorage.setItem('fcm_token', currentToken);
        localStorage.setItem('fcm_token_updated', new Date().toISOString());
        
        // إرسال التوكن للخادم
        const authToken = getAuthToken();
        if (authToken) {
          await registerDeviceFunc(currentToken, authToken);
        }
        
        return currentToken;
      } else {
        return null;
      }
      
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      addActionToast('حدث خطأ في تفعيل الإشعارات', 'error');
      return null;
    }
  }, [addActionToast]); // إزالة registerDevice من dependencies

  // دالة تسجيل الجهاز في الخادم (مع useCallback)
  // دالة تسجيل الجهاز في الخادم (مع useCallback)
// دالة تسجيل الجهاز في الخادم
const registerDevice = useCallback(async (token) => {
  try {
    // إنشاء session_id فريد
    const generateSessionId = () => {
      return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    };
    
    // إعداد بيانات الجهاز
    const deviceInfo = {
      token: token,
      device_type: getDeviceType(),
      device_name: getDeviceName(),
      app_version: '1.0.0',
      session_id: generateSessionId()
    };
    
    
    // عمل API call
    const url = createRequestURL('/notifications/register-device');
    const response = await enhancedFetch(url, {
      method: 'POST',
      body: deviceInfo
    });
    
    
    if (response && response.status === true) {
      
      // حفظ معلومات الجهاز
      localStorage.setItem('device_registered', 'true');
      localStorage.setItem('device_session_id', deviceInfo.session_id);
      localStorage.setItem('current_device_id', response.data?.device_id || 'firebase-device-' + Date.now());
      
      if (response.data) {
        localStorage.setItem('device_info', JSON.stringify(response.data));
      }
      
      return {
        success: true,
        message: response.message || 'تم تسجيل الجهاز بنجاح',
        data: response.data,
        session_id: deviceInfo.session_id
      };
    }
    
    // معالجة تنسيقات مختلفة للاستجابة
    if (response && response.success) {
      
      localStorage.setItem('device_registered', 'true');
      localStorage.setItem('device_session_id', deviceInfo.session_id);
      
      return {
        success: true,
        message: response.message || 'تم تسجيل الجهاز بنجاح',
        data: response.data || response,
        session_id: deviceInfo.session_id
      };
    }
    
    const errorMessage = response?.message || 'فشل في تسجيل الجهاز';
    console.error('🔔 Registration failed:', errorMessage, response);
    
    // حتى إذا فشل التسجيل في الخادم، نعيد نجاحاً جزئياً
    localStorage.setItem('device_registered', 'true');
    localStorage.setItem('device_session_id', deviceInfo.session_id);
    
    return {
      success: true,
      message: 'تم حفظ الجهاز محلياً',
      data: { saved_locally: true },
      session_id: deviceInfo.session_id
    };
    
  } catch (error) {
    console.error('❌ Error registering device:', error);
    
    // في حالة الخطأ، نحفظ البيانات محلياً
    localStorage.setItem('device_registered', 'true');
    localStorage.setItem('fcm_token', token);
    localStorage.setItem('fcm_token_updated', new Date().toISOString());
    
    return {
      success: true,
      message: 'تم حفظ الجهاز محلياً',
      data: { saved_locally: true }
    };
  }
}, []);

  // دالة إلغاء تسجيل الجهاز
  const unregisterDevice = useCallback(async () => {
    try {
      const authToken = getAuthToken();
      
      // حذف التوكن من Firebase
      if (messaging && fcmToken) {
        try {
          await deleteToken(messaging);
        } catch (firebaseError) {
          console.error('❌ Error deleting FCM token:', firebaseError);
        }
      }

      // إعلام الخادم بإلغاء التسجيل إذا كان هناك توكن
      if (fcmToken && authToken) {
        try {
          const sessionId = localStorage.getItem('device_session_id');
          const unregisterData = { 
            token: fcmToken,
            session_id: sessionId || undefined
          };

          const url = createRequestURL('/notifications/unregister-device');
          await enhancedFetch(url, {
            method: 'POST',
            body: unregisterData
          });
          
        } catch (apiError) {
          console.error('❌ Error unregistering from backend:', apiError);
        }
      }

      // مسح جميع البيانات المحلية
      const itemsToRemove = [
        'fcm_token',
        'device_registered',
        'current_device_id',
        'fcm_token_updated',
        'device_session_id',
        'device_info'
      ];
      
      itemsToRemove.forEach(item => {
        localStorage.removeItem(item);
      });
      
      setFcmToken(null);
      
      addActionToast('تم إيقاف الإشعارات', 'info');
      
    } catch (error) {
      console.error('❌ Error unregistering device:', error);
      addActionToast('حدث خطأ أثناء إيقاف الإشعارات', 'error');
    }
  }, [fcmToken, addActionToast]);

  // التحقق من تسجيل الجهاز
  const checkDeviceRegistration = useCallback(() => {
    if (!isBrowser) {
      return { hasToken: false, isRegistered: false };
    }
    
    const token = localStorage.getItem('fcm_token');
    const registered = localStorage.getItem('device_registered');
    const deviceId = localStorage.getItem('current_device_id');
    const tokenUpdated = localStorage.getItem('fcm_token_updated');
    const sessionId = localStorage.getItem('device_session_id');
    const deviceInfo = getRegisteredDeviceInfo();
    
    // التحقق من عمر التوكن (أكثر من 7 أيام)
    let tokenValid = true;
    if (tokenUpdated) {
      const updateDate = new Date(tokenUpdated);
      const now = new Date();
      const daysDiff = (now - updateDate) / (1000 * 60 * 60 * 24);
      if (daysDiff > 7) {
        tokenValid = false;
      }
    }
    
    if (token) {
      setFcmToken(token);
    }
    
    return {
      hasToken: !!token && tokenValid,
      isRegistered: registered === 'true',
      deviceId,
      sessionId,
      deviceInfo,
      permission: notificationPermission,
      firebaseInitialized: isFirebaseInitialized
    };
  }, [notificationPermission, isFirebaseInitialized, getRegisteredDeviceInfo]);

  // دالة تهيئة Firebase والإشعارات
  const initializeFirebase = useCallback(async () => {
    if (!isBrowser || !messaging) {
      setIsFirebaseInitialized(false);
      return;
    }

    try {
      
      // التحقق من إذن الإشعارات
      const permission = Notification.permission;
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // الحصول على التوكن إذا كان مسموحاً
        const token = await getFCMToken();
        
        if (token) {
          // الاستماع للرسائل الواردة
          if (!firebaseMessageListener.current) {
            firebaseMessageListener.current = onMessage(messaging, (payload) => {
              handleFirebaseMessage(payload);
            });
          }
          
          setIsFirebaseInitialized(true);
        }
      } else {
        setIsFirebaseInitialized(false);
      }
      
    } catch (error) {
      console.error('❌ Error initializing Firebase:', error);
      setIsFirebaseInitialized(false);
    }
  }, [getFCMToken, handleFirebaseMessage]);

  // بدء التحديث التلقائي (fallback polling)
  // const startAutoRefresh = useCallback((interval = 30000) => {
  //   if (pollIntervalRef.current) {
  //     clearInterval(pollIntervalRef.current);
  //   }
    
  //   console.log('🔔 Starting fallback polling with interval:', interval);
    
  //   // تحميل الإشعارات أولاً
  //   loadNotifications(false);
  //   loadUnreadCount();
    
  //   // التحديث الدوري
  //   pollIntervalRef.current = setInterval(() => {
  //     if (!isFirebaseInitialized) {
  //       console.log('🔔 Fallback polling: Firebase not initialized, checking for updates');
  //       loadUnreadCount();
  //       loadNotifications(false);
  //     }
  //   }, interval);
    
  // }, [loadNotifications, loadUnreadCount, isFirebaseInitialized]);

  // إيقاف التحديث التلقائي
  const stopAutoRefresh = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // تعليم جميع الإشعارات كمقروءة
  const markAllAsRead = useCallback(async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('يجب تسجيل الدخول');

      const url = createRequestURL('/notifications/mark-all-read');
      const response = await enhancedFetch(url, { 
        method: 'POST',
        body: {}
      });
      
      if (response && response.status === true) {
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
        
        addActionToast(response.message || 'تم تعليم جميع الإشعارات كمقروءة', 'success');
        
        return {
          success: true,
          message: response.message || 'تم تعليم جميع الإشعارات كمقروءة'
        };
      }
      
      throw new Error(response?.message || 'فشل في تعليم الإشعارات كمقروءة');
    } catch (error) {
      console.error('❌ Error in markAllAsRead:', error);
      addActionToast(error.message || 'حدث خطأ أثناء تعليم الإشعارات كمقروءة', 'error');
      throw error;
    }
  }, [addActionToast]);

  // تعليم إشعار كمقروء
  const markAsRead = useCallback(async (id) => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('يجب تسجيل الدخول');

      const url = createRequestURL(`/notifications/${id}/mark-read`);
      const response = await enhancedFetch(url, { 
        method: 'POST',
        body: {}
      });
      
      if (response && response.status === true) {
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
        
        loadUnreadCount();
        
        setNewNotifications(prev => 
          prev.filter(notification => notification.id !== id)
        );
        toastNotificationIds.current.delete(id);
        
        addActionToast('تم تعليم الإشعار كمقروء', 'success');
        
        return { success: true, message: response.message || 'تم تعليم الإشعار كمقروء' };
      }
      
      throw new Error(response?.message || 'فشل في تعليم الإشعار كمقروء');
    } catch (error) {
      console.error('❌ Error in markAsRead:', error);
      addActionToast('حدث خطأ أثناء تعليم الإشعار كمقروء', 'error');
      throw error;
    }
  }, [loadUnreadCount, addActionToast]);

  // حذف إشعار
  const deleteNotification = useCallback(async (id, showToast = true) => {
    try {
      const authToken = getAuthToken();
      if (!authToken) throw new Error('يجب تسجيل الدخول');

      const url = createRequestURL(`/notifications/${id}`);
      const response = await enhancedFetch(url, { method: 'DELETE' });
      
      if (response && response.status === true) {
        const notificationToDelete = notifications.find(n => n.id === id);
        
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        
        if (notificationToDelete && !notificationToDelete.is_read) {
          loadUnreadCount();
        }
        
        setNewNotifications(prev => 
          prev.filter(notification => notification.id !== id)
        );
        processedNotificationIds.current.delete(id);
        toastNotificationIds.current.delete(id);
        
        if (showToast) {
          addActionToast('تم حذف الإشعار بنجاح', 'success');
        }
        
        return { success: true, message: response.message || 'تم حذف الإشعار بنجاح' };
      }
      
      throw new Error(response?.message || 'فشل في حذف الإشعار');
    } catch (error) {
      console.error('❌ Error in deleteNotification:', error);
      addActionToast('حدث خطأ أثناء حذف الإشعار', 'error');
      throw error;
    }
  }, [notifications, loadUnreadCount, addActionToast]);

  // دالة طلب إذن الإشعارات يدوياً
  const requestNotificationPermissionManual = useCallback(async () => {
    try {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        await initializeFirebase();
        return { success: true, message: 'تم تفعيل الإشعارات بنجاح' };
      } else {
        return { 
          success: false, 
          message: permission === 'denied' 
            ? 'تم رفض إذن الإشعارات. يرجى السماح بالإشعارات من إعدادات المتصفح' 
            : 'لم يتم اختيار خيار للإشعارات' 
        };
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return { success: false, message: error.message };
    }
  }, [initializeFirebase]);

  // دالة تحديث FCM Token
  const refreshFCMToken = useCallback(async () => {
    try {
      if (!messaging) {
        throw new Error('Firebase Messaging غير متاح');
      }

      const token = await getFCMToken();
      if (token) {
        return { success: true, token, message: 'تم تحديث رمز الإشعارات' };
      } else {
        return { success: false, message: 'فشل في تحديث رمز الإشعارات' };
      }
    } catch (error) {
      console.error('❌ Error refreshing FCM token:', error);
      return { success: false, message: error.message };
    }
  }, [getFCMToken]);

  // اختبار الاتصال
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
        statusText: response.statusText,
        firebaseInitialized: isFirebaseInitialized,
        notificationPermission,
        hasFCMToken: !!fcmToken
      };
    } catch (error) {
      return {
        connected: false,
        message: error.message,
        firebaseInitialized: isFirebaseInitialized
      };
    }
  }, [isFirebaseInitialized, notificationPermission, fcmToken]);

  // تهيئة نظام الإشعارات
  useEffect(() => {
    isMountedRef.current = true;
    
    const initNotifications = async () => {
      const authToken = getAuthToken();
      
      if (authToken) {
        // تحميل الإشعارات أولاً
        await loadNotifications(false);
        loadUnreadCount();
        
        // تهيئة Firebase
        if (isBrowser && messaging) {
          await initializeFirebase();
        }
        
        // بدء fallback polling
        // startAutoRefresh(30000);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    initNotifications();

    return () => {
      isMountedRef.current = false;
      stopAutoRefresh();
      
      // إزالة مستمع Firebase
      if (firebaseMessageListener.current) {
        firebaseMessageListener.current = null;
      }
    };
  }, []);

  // الاستماع لتغيرات حالة المصادقة
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken' || e.key === null) {
        const authToken = getAuthToken();
        
        if (authToken) {
          loadNotifications(false);
          loadUnreadCount();
          
          if (isBrowser && messaging) {
            initializeFirebase();
          }
        } else {
          setNotifications([]);
          setUnreadCount(0);
          setFcmToken(null);
        }
      }
    };

    if (isBrowser) {
      window.addEventListener('storage', handleStorageChange);
      
      // تحديث عند التركيز على الصفحة
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          loadUnreadCount();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [loadNotifications, loadUnreadCount, initializeFirebase]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fcmToken,
    newNotifications,
    lastUpdate,
    error,
    showAlerts,
    showChatAlerts,
    actionToasts,
    notificationPermission,
    isFirebaseInitialized,
    
    // الدوال الأساسية
    loadNotifications,
    markAllAsRead,
    markAsRead,
    deleteNotification,
    
    // إدارة Firebase
    getFCMToken,
    registerDevice,
    unregisterDevice,
    checkDeviceRegistration,
    requestNotificationPermission: requestNotificationPermissionManual,
    refreshFCMToken,
    initializeFirebase,
    
    // التحديث التلقائي
    // startAutoRefresh,
    stopAutoRefresh,
    
    // التحكم في عرض الـ alerts
    toggleAlerts: useCallback((show = true) => setShowAlerts(show), []),
    toggleChatAlerts: useCallback((show = true) => setShowChatAlerts(show), []),
    
    // إدارة Toast الإجراءات
    addActionToast,
    removeActionToast,
    
    // اختبار الاتصال
    testBackendConnection,
    
    // دالة جلب عدد الإشعارات غير المقروءة
    loadUnreadCount,
    
    // دالة للحصول على معلومات الجهاز المسجلة
    getRegisteredDeviceInfo,
    
    // معلومات التصحيح
    debugInfo: () => ({
      notificationsCount: notifications.length,
      unreadCount,
      hasAuthToken: !!getAuthToken(),
      apiBase: API_BASE_URL,
      lastUpdate: lastUpdate?.toISOString(),
      processedIdsCount: processedNotificationIds.current.size,
      toastIdsCount: toastNotificationIds.current.size,
      notificationPermission,
      isFirebaseInitialized,
      hasFCMToken: !!fcmToken,
      showAlerts,
      showChatAlerts,
      actionToastsCount: actionToasts.length,
      deviceInfo: checkDeviceRegistration()
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