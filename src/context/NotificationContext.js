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
  
  // حالة جديدة لإدارة Toast الإجراءات
  const [actionToasts, setActionToasts] = useState([]);
  
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

  // دالة لإضافة Toast للإجراءات
  const addActionToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, timestamp: new Date() };
    
    setActionToasts(prev => [...prev, toast]);
    
    // إزالة Toast تلقائياً بعد 5 ثوان
    setTimeout(() => {
      setActionToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
    
    return id;
  }, []);

  // دالة لإزالة Toast محدد
  const removeActionToast = useCallback((id) => {
    setActionToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

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
        if (response && (response.status === true || response.success === true)) {
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
      // في حالة الخطأ، نحسب من الإشعارات المحلية
      const localUnread = notifications.filter(n => !n.is_read).length;
      setUnreadCount(localUnread);
    }
  }, [notifications]);

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
        
        if (response && response.status === true) {
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
          
          // تحديث عدد الإشعارات غير المقروءة باستخدام API منفصل
          loadUnreadCount();
          
          // عرض إشعارات Toast تلقائياً للإشعارات غير المقروءة التي لم تُعرض من قبل
          if (trulyNewData.length > 0 && (forceShow || showAlerts)) {
            console.log('🔔 NotificationContext: New notifications to show:', trulyNewData.length);
            
            trulyNewData.forEach(notification => {
              const processed = processNotification(notification);
              
              // عرض Toast فقط للإشعارات غير المقروءة
              if (!processed.is_read && !toastNotificationIds.current.has(processed.id)) {
                console.log('🔔 NotificationContext: Adding notification to toast:', processed.id, processed.title);
                toastNotificationIds.current.add(processed.id);
                
                // إضافة الإشعار فوراً للعرض
                setNewNotifications(prev => {
                  if (prev.some(n => n.id === processed.id)) {
                    console.log('🔔 NotificationContext: Notification already in list, skipping');
                    return prev;
                  }
                  console.log('🔔 NotificationContext: Adding notification to newNotifications state');
                  return [...prev, processed];
                });
                
                // إزالة Toast بعد 5 ثوانٍ
                setTimeout(() => {
                  if (isMountedRef.current) {
                    setNewNotifications(prev => 
                      prev.filter(n => n.id !== processed.id)
                    );
                    toastNotificationIds.current.delete(processed.id);
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
  }, [showAlerts, showChatAlerts, loadUnreadCount]);

  // بدء التحديث التلقائي
  const startAutoRefresh = useCallback((interval = 30000) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    console.log('🔔 NotificationContext: Starting auto refresh with interval:', interval);
    
    // تحميل الإشعارات أولاً بدون عرض toasts
    loadNotifications(false);
    
    // التحقق فوراً من الإشعارات الجديدة
    setTimeout(() => {
      checkForNewNotifications(true);
    }, 1000);
    
    // بدء التحديث الدوري
    pollIntervalRef.current = setInterval(() => {
      console.log('🔔 NotificationContext: Polling for new notifications...');
      // تحديث عدد الإشعارات غير المقروءة أولاً
      loadUnreadCount();
      // ثم التحقق من الإشعارات الجديدة
      checkForNewNotifications(true);
    }, interval);
    
  }, [loadNotifications, checkForNewNotifications, loadUnreadCount]);

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
      const response = await enhancedFetch(url, { 
        method: 'POST',
        body: {} // إرسال body فارغ أو حسب ما يتطلبه الـ API
      });
      
      if (response && response.status === true) {
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
        
        // عرض Toast نجاح
        addActionToast(response.message || 'تم تعليم جميع الإشعارات كمقروءة', 'success');
        
        return {
          success: true,
          message: response.message || 'تم تعليم جميع الإشعارات كمقروءة',
          count: response.data?.count || 0
        };
        
      } else {
        throw new Error(response?.message || 'فشل في تعليم الإشعارات كمقروءة');
      }
      
    } catch (error) {
      console.error('❌ Error in markAllAsRead:', error);
      setError(error.message);
      // عرض Toast خطأ
      addActionToast(error.message || 'حدث خطأ أثناء تعليم الإشعارات كمقروءة', 'error');
      throw error;
    }
  }, [addActionToast]);

  // تعليم إشعار كمقروء
  const markAsRead = useCallback(async (id) => {
    try {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('يجب تسجيل الدخول');
      }

      const url = createRequestURL(`/notifications/${id}/mark-read`);
      const response = await enhancedFetch(url, { 
        method: 'POST',
        body: {} // إرسال body فارغ
      });
      
      if (response && response.status === true) {
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
        
        // تحديث عدد الإشعارات غير المقروءة
        loadUnreadCount();
        
        setNewNotifications(prev => 
          prev.filter(notification => notification.id !== id)
        );
        toastNotificationIds.current.delete(id);
        
        // عرض Toast نجاح
        addActionToast('تم تعليم الإشعار كمقروء', 'success');
        
        return {
          success: true,
          message: response.message || 'تم تعليم الإشعار كمقروء'
        };
        
      } else {
        throw new Error(response?.message || 'فشل في تعليم الإشعار كمقروء');
      }
      
    } catch (error) {
      console.error('❌ Error in markAsRead:', error);
      // عرض Toast خطأ
      addActionToast('حدث خطأ أثناء تعليم الإشعار كمقروء', 'error');
      throw error;
    }
  }, [loadUnreadCount, addActionToast]);

  // حذف إشعار
  const deleteNotification = useCallback(async (id, showToast = true) => {
    try {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('يجب تسجيل الدخول');
      }

      const url = createRequestURL(`/notifications/${id}`);
      const response = await enhancedFetch(url, { method: 'DELETE' });
      
      if (response && response.status === true) {
        // تحديث الحالة المحلية بعد النجاح
        const notificationToDelete = notifications.find(n => n.id === id);
        
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        
        // إذا كان الإشعار غير مقروء، نحدث العدد
        if (notificationToDelete && !notificationToDelete.is_read) {
          loadUnreadCount();
        }
        
        setNewNotifications(prev => 
          prev.filter(notification => notification.id !== id)
        );
        processedNotificationIds.current.delete(id);
        toastNotificationIds.current.delete(id);
        
        // عرض Toast نجاح إذا طُلب
        if (showToast) {
          addActionToast('تم حذف الإشعار بنجاح', 'success');
        }
        
        return {
          success: true,
          message: response.message || 'تم حذف الإشعار بنجاح'
        };
        
      } else {
        throw new Error(response?.message || 'فشل في حذف الإشعار');
      }
      
    } catch (error) {
      console.error('❌ Error in deleteNotification:', error);
      // عرض Toast خطأ
      addActionToast('حدث خطأ أثناء حذف الإشعار', 'error');
      throw error;
    }
  }, [notifications, loadUnreadCount, addActionToast]);

  // مسح جميع الإشعارات مع تأكيد
  const clearAll = useCallback(async () => {
    // هذه الدالة يجب أن تستدعى مع تأكيد من المستخدم
    return new Promise((resolve, reject) => {
      try {
        // نعيد Promise للمستخدم يمكنه إظهار dialog تأكيد
        resolve({
          confirm: async () => {
            try {
              const authToken = getAuthToken();
              if (!authToken) {
                throw new Error('يجب تسجيل الدخول');
              }

              // حذف الإشعارات واحداً تلو الآخر
              const deletePromises = notifications.map(notification => 
                deleteNotification(notification.id, false) // لا نعرض toast لكل حذف
              );
              
              await Promise.all(deletePromises);
              
              // تحديث الحالة المحلية بعد النجاح
              setNotifications([]);
              setUnreadCount(0);
              setNewNotifications([]);
              processedNotificationIds.current.clear();
              toastNotificationIds.current.clear();
              
              // عرض Toast نجاح
              addActionToast(`تم حذف جميع الإشعارات (${notifications.length})`, 'success');
              
              return {
                success: true,
                message: `تم حذف جميع الإشعارات (${notifications.length})`,
                count: notifications.length
              };
              
            } catch (error) {
              console.error('❌ Error in clearAll:', error);
              // عرض Toast خطأ
              addActionToast('حدث خطأ أثناء حذف جميع الإشعارات', 'error');
              throw error;
            }
          },
          count: notifications.length
        });
      } catch (error) {
        reject(error);
      }
    });
  }, [notifications, deleteNotification, addActionToast]);

  // دالة تسجيل الجهاز للإشعارات
  const registerDevice = async (token) => {
    try {
      const sessionId = getSessionId();

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

      // التحقق من الـ response
      if (response && response.status === true) {
        if (isBrowser) {
          localStorage.setItem('fcm_token', token);
          localStorage.setItem('device_registered', 'true');
          localStorage.setItem('current_device_id', response.data?.device_id || 'real-device-' + Date.now());
        }
        setFcmToken(token);
        
        // عرض Toast نجاح
        addActionToast('تم تسجيل الجهاز بنجاح', 'success');
        
        return {
          success: true,
          message: response.message || 'تم تسجيل الجهاز بنجاح',
          data: response.data
        };
      }
      
      // إذا وصلنا هنا، فهناك مشكلة في الـ response
      const errorMessage = response?.message || 'فشل في تسجيل الجهاز';
      throw new Error(errorMessage);
      
    } catch (error) {
      console.error('❌ Error registering device:', error);
      // عرض Toast خطأ
      addActionToast('حدث خطأ أثناء تسجيل الجهاز', 'error');
      
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
        // تحميل عدد الإشعارات غير المقروءة منفصلاً
        loadUnreadCount();
        startAutoRefresh(30000);
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
        // تحديث عدد الإشعارات غير المقروءة
        setTimeout(() => {
          loadUnreadCount();
        }, 500);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // التحقق فوراً من الإشعارات عند عودة التركيز
        loadUnreadCount();
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
  }, [loadNotifications, checkForNewNotifications, loadUnreadCount]);

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
    actionToasts, // إضافة actionToasts للقيمة
    
    // الدوال الأساسية
    loadNotifications: loadNotificationsWithAlerts, // استخدام الدالة المعدلة
    markAllAsRead,
    markAsRead,
    deleteNotification,
    clearAll, // الآن ترجع Promise مع تأكيد
    
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
    
    // إدارة Toast الإجراءات
    addActionToast,
    removeActionToast,
    
    // اختبار الاتصال
    testBackendConnection,
    
    // دالة جلب عدد الإشعارات غير المقروءة
    loadUnreadCount,
    
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
      showChatAlerts,
      actionToastsCount: actionToasts.length
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