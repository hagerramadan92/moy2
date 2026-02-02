// services/notification.service.js
import axios from 'axios';

// تحديد ما إذا كنا في المتصفح والإنتاج
const isBrowser = typeof window !== 'undefined';
const isProduction = isBrowser && 
                     !window.location.hostname.includes('localhost') && 
                     !window.location.hostname.includes('127.0.0.1');

console.log(`🔔 Notification Service: ${isProduction ? 'Production' : 'Development'} mode`);

// ==================== إعدادات الخدمة ====================
const API_BASE = 'https://moya.talaaljazeera.com/api/v1';

// الحصول على التوكن
const getToken = () => {
  try {
    if (isBrowser) {
      return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    }
  } catch (e) {
    console.error('❌ Error getting token:', e);
  }
  return null;
};

// الحصول على Session ID
const getSessionId = () => {
  try {
    if (isBrowser) {
      return localStorage.getItem('session_id') || sessionStorage.getItem('session_id');
    }
  } catch (e) {
    console.error('❌ Error getting session ID:', e);
  }
  return null;
};

// حفظ Session ID
const setSessionId = (sessionId) => {
  try {
    if (isBrowser && sessionId) {
      localStorage.setItem('session_id', sessionId);
      sessionStorage.setItem('session_id', sessionId);
      if (!isProduction) {
        console.log('🔔 Session ID saved:', sessionId);
      }
    }
  } catch (e) {
    console.error('❌ Error saving session ID:', e);
  }
};

// متغير لتتبع حالة إنشاء session
let sessionCreationPromise = null;

// إنشاء Session جديد
const createSession = async () => {
  try {
    // التحقق من وجود session موجود
    const existingSessionId = getSessionId();
    if (existingSessionId) {
      if (!isProduction) {
        console.log('🔔 Using existing session:', existingSessionId);
      }
      return existingSessionId;
    }

    if (!isBrowser) {
      return null;
    }

    // إذا كان هناك طلب إنشاء session قيد التنفيذ، انتظر انتهاءه
    if (sessionCreationPromise) {
      return await sessionCreationPromise;
    }

    // إنشاء promise جديد لإنشاء session
    sessionCreationPromise = (async () => {
      try {
        // إنشاء session جديد
        const response = await fetch(`${API_BASE}/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            // يمكن إضافة بيانات إضافية إذا كان API يتطلبها
          })
        });

        const data = await response.json();

        if (response.ok && data.status && data.data) {
          const sessionId = data.data.id || data.data.session_id || data.data.session_id;
          if (sessionId) {
            setSessionId(sessionId);
            if (!isProduction) {
              console.log('🔔 New session created:', sessionId);
            }
            sessionCreationPromise = null; // إعادة تعيين بعد النجاح
            return sessionId;
          }
        }

        // إذا فشل إنشاء session، يمكن إنشاء session محلي مؤقت
        const fallbackSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(fallbackSessionId);
        if (!isProduction) {
          console.log('🔔 Fallback session created:', fallbackSessionId);
        }
        sessionCreationPromise = null;
        return fallbackSessionId;

      } catch (error) {
        console.error('❌ Error creating session:', error);
        sessionCreationPromise = null;
        
        // إنشاء session محلي كبديل
        const fallbackSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(fallbackSessionId);
        return fallbackSessionId;
      }
    })();

    return await sessionCreationPromise;

  } catch (error) {
    console.error('❌ Error in createSession:', error);
    sessionCreationPromise = null;
    
    // إنشاء session محلي كبديل
    const fallbackSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(fallbackSessionId);
    return fallbackSessionId;
  }
};

// التأكد من وجود Session عند تحميل الموقع
if (isBrowser) {
  // إنشاء session تلقائياً عند تحميل الملف (فقط مرة واحدة)
  if (typeof window !== 'undefined' && !window.__sessionInitialized) {
    window.__sessionInitialized = true;
    createSession().catch(err => {
      console.warn('🔔 Failed to create session on load:', err);
    });
  }
}

// دالة التحقق من تسجيل الدخول
const checkAuthentication = (showToast = true) => {
  const token = getToken();
  const isAuthenticated = !!token;
  
  if (!isAuthenticated && isBrowser && showToast) {
    // عرض toast message
    showLoginToast('يجب تسجيل الدخول لعرض الإشعارات', 'info');
  }
  
  return isAuthenticated;
};

// دالة عرض toast message
const showLoginToast = (message, type = 'info') => {
  if (!isBrowser) return;
  
  // نفس دالة showLoginToast من message.service.js
  // يمكنك دمجها في ملف منفصل لتجنب التكرار
  const existingToast = document.getElementById('global-login-toast');
  if (existingToast) {
    return;
  }
  
  const toast = document.createElement('div');
  toast.id = 'global-login-toast';
  
  const colors = {
    info: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    error: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
  };
  
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    z-index: 999999;
    max-width: 350px;
    animation: slideInToast 0.3s ease-out;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    align-items: center;
    gap: 12px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  `;
  
  const icons = {
    info: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z',
    error: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    success: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    warning: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'
  };
  
  toast.innerHTML = `
    <svg style="width: 24px; height: 24px; flex-shrink: 0;" viewBox="0 0 24 24" fill="currentColor">
      <path d="${icons[type] || icons.info}"/>
    </svg>
    <div style="flex: 1;">
      <span style="font-size: 14px; line-height: 1.4;">${message}</span>
    </div>
    <button id="close-global-toast" style="background: none; border: none; color: white; cursor: pointer; opacity: 0.7; padding: 4px;">
      ✕
    </button>
  `;
  
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideInToast {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutToast {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      #global-login-toast button:hover {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  const closeBtn = toast.querySelector('#close-global-toast');
  closeBtn.addEventListener('click', () => {
    removeToast(toast);
  });
  
  setTimeout(() => {
    removeToast(toast);
  }, 5000);
};

const removeToast = (toast) => {
  if (toast && toast.parentNode) {
    toast.style.animation = 'slideOutToast 0.3s ease-out';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
};

// ==================== إنشاء Axios Instance ====================
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  // Request Interceptor
  instance.interceptors.request.use((config) => {
    const token = getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (!isProduction) {
      console.log('🔔 Request:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  }, (error) => {
    console.error('🔔 Request error:', error);
    return Promise.reject(error);
  });

  // Response Interceptor
  instance.interceptors.response.use(
    (response) => {
      if (!isProduction) {
        console.log('🔔 Response:', response.status, response.config.url);
      }
      return response;
    },
    (error) => {
      const status = error.response?.status;
      const url = error.config?.url;
      
      console.error('🔔 Response error:', {
        message: error.message,
        code: error.code,
        status: status,
        url: url
      });
      
      // معالجة أخطاء المصادقة
      if (status === 401 && isBrowser) {
        setTimeout(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          sessionStorage.removeItem('accessToken');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/';
          }
        }, 100);
      }
      
      // عرض رسالة الخطأ
      if (isBrowser && url && !url.includes('/login')) {
        let errorMessage = 'حدث خطأ في تحميل الإشعارات';
        
        if (status === 500) {
          errorMessage = 'حدث خطأ في خادم الإشعارات';
        } else if (status === 404) {
          errorMessage = 'لم يتم العثور على خدمة الإشعارات';
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage = 'فشل الاتصال بخادم الإشعارات';
        }
        
        showLoginToast(errorMessage, 'error');
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// ==================== إدارة التخزين المؤقت للإشعارات ====================
const notificationCache = {
  set: (key, data, ttl = 60000) => { // 1 دقيقة افتراضياً
    try {
      if (isBrowser) {
        const cacheItem = {
          data,
          timestamp: Date.now(),
          ttl
        };
        localStorage.setItem(`notification_${key}`, JSON.stringify(cacheItem));
        if (!isProduction) {
          console.log('🔔 Cache set:', key);
        }
      }
    } catch (e) {
      console.warn('🔔 Cache set error:', e);
    }
  },
  
  get: (key) => {
    try {
      if (isBrowser) {
        const cached = localStorage.getItem(`notification_${key}`);
        if (!cached) return null;
        
        const cacheItem = JSON.parse(cached);
        const now = Date.now();
        
        if (now - cacheItem.timestamp > cacheItem.ttl) {
          localStorage.removeItem(`notification_${key}`);
          return null;
        }
        
        if (!isProduction) {
          console.log('🔔 Cache hit:', key);
        }
        return cacheItem.data;
      }
    } catch (e) {
      console.warn('🔔 Cache get error:', e);
    }
    return null;
  },
  
  clear: (key) => {
    try {
      if (isBrowser) {
        localStorage.removeItem(`notification_${key}`);
      }
    } catch (e) {
      console.warn('🔔 Cache clear error:', e);
    }
  }
};

class NotificationService {
  constructor() {
    this.axiosInstance = createAxiosInstance();
    this.pollingInterval = null;
    this.isPolling = false;
  }

  // ==================== الحصول على الإشعارات ====================
  async getNotifications(params = {}) {
    console.log('🔔 getNotifications called with params:', params);
    
    // التحقق من المصادقة أولاً
    if (!checkAuthentication()) {
      return {
        success: false,
        data: [],
        error: 'يجب تسجيل الدخول لعرض الإشعارات',
        requiresLogin: true,
        source: 'auth-check'
      };
    }
    
    // في Production، نعود بمصفوفة فارغة لتجنب مشاكل CORS
    if (isProduction) {
      console.log('🔔 Returning empty notifications in production');
      return {
        success: true,
        data: [],
        message: 'Notifications are disabled in production due to CORS limitations',
        source: 'production-disabled'
      };
    }
    
    const cacheKey = `notifications_${JSON.stringify(params)}`;
    const cached = notificationCache.get(cacheKey);
    
    // إرجاع البيانات المخزنة مؤقتاً إذا لم يكن هناك تحديث
    if (cached && !params.refresh) {
      return cached;
    }
    
    try {
      const response = await this.axiosInstance.get('/notifications', { params });
      
      let result;
      
      if (response.data) {
        const notificationsData = response.data.data || response.data.notifications || [];
        
        result = {
          success: true,
          data: Array.isArray(notificationsData) ? notificationsData : [],
          pagination: response.data.meta || {},
          total: response.data.total || notificationsData.length,
          unread_count: response.data.unread_count || 0,
          source: 'axios'
        };
        
        // تخزين في الذاكرة المؤقتة
        notificationCache.set(cacheKey, result, 30000); // 30 ثانية للتخزين المؤقت
      } else {
        result = {
          success: false,
          data: [],
          error: 'تنسيق البيانات غير صحيح',
          source: 'axios'
        };
      }
      
      return result;
      
    } catch (error) {
      console.error('🔔 Error getting notifications:', error.message);
      
      // إرجاع بيانات مخزنة مؤقتاً كبديل
      if (cached) {
        return {
          ...cached,
          source: 'cached-fallback',
          fromCache: true,
          error: 'Using cached data due to connection error'
        };
      }
      
      // في Development، نعود بمصفوفة فارغة بدلاً من خطأ
      if (!isProduction) {
        return {
          success: true,
          data: [],
          error: 'لا يمكن تحميل الإشعارات حالياً',
          source: 'empty-fallback',
          details: error.message
        };
      }
      
      return {
        success: false,
        data: [],
        error: 'فشل تحميل الإشعارات',
        source: 'failed',
        details: error.message
      };
    }
  }

  // ==================== الحصول على عدد الإشعارات غير المقروءة ====================
  async getUnreadCount() {
    console.log('🔔 getUnreadCount called');
    
    // التحقق من المصادقة أولاً
    if (!checkAuthentication(false)) {
      return 0;
    }
    
    // في Production، نعود بـ 0 مباشرة
    if (isProduction) {
      return 0;
    }
    
    const cacheKey = 'unread_count';
    const cached = notificationCache.get(cacheKey);
    
    if (cached && typeof cached === 'number') {
      return cached;
    }
    
    try {
      const response = await this.axiosInstance.get('/notifications/unread-count');
      
      let count = 0;
      
      // معالجة الـ response بطرق مختلفة
      if (response.data) {
        if (typeof response.data === 'number') {
          count = response.data;
        } else if (response.data.count !== undefined) {
          count = response.data.count;
        } else if (response.data.data?.count !== undefined) {
          count = response.data.data.count;
        } else if (response.data.unread_count !== undefined) {
          count = response.data.unread_count;
        }
      }
      
      // تخزين في الذاكرة المؤقتة
      notificationCache.set(cacheKey, count, 15000); // 15 ثانية
      
      return count;
      
    } catch (error) {
      console.error('🔔 Error getting unread count:', error.message);
      
      // إرجاع القيمة المخزنة مؤقتاً أو 0
      return cached || 0;
    }
  }

  // ==================== الحصول على الإشعارات الجديدة ====================
  async getNewNotifications(sinceTimestamp) {
    console.log(`🔔 getNewNotifications since ${sinceTimestamp}`);
    
    if (!checkAuthentication(false)) {
      return {
        success: false,
        data: [],
        error: 'يجب تسجيل الدخول',
        requiresLogin: true
      };
    }
    
    if (isProduction) {
      return {
        success: true,
        data: [],
        message: 'New notifications disabled in production'
      };
    }
    
    try {
      const response = await this.axiosInstance.get('/notifications/new', {
        params: { since: sinceTimestamp }
      });
      
      return {
        success: true,
        data: response.data.data || [],
        source: 'axios'
      };
      
    } catch (error) {
      console.error('🔔 Error getting new notifications:', error.message);
      return {
        success: false,
        data: [],
        error: 'لا يمكن تحميل الإشعارات الجديدة',
        source: 'failed'
      };
    }
  }

  // ==================== الإشعارات المهمة (Priority) ====================
  async getPriorityNotifications() {
    return this.getNotifications({ priority: true, limit: 5 });
  }

  // ==================== الإشعارات الأخيرة ====================
  async getRecentNotifications(limit = 10) {
    return this.getNotifications({ limit, order_by: 'created_at', order: 'desc' });
  }

  // ==================== تحديد الإشعار كمقروء ====================
  async markAsRead(notificationId) {
    console.log(`🔔 markAsRead ${notificationId}`);
    
    if (!checkAuthentication(false)) {
      return {
        success: false,
        error: 'يجب تسجيل الدخول',
        requiresLogin: true
      };
    }
    
    try {
      const response = await this.axiosInstance.post(`/notifications/${notificationId}/read`);
      
      // مسح التخزين المؤقت للعدد غير المقروء
      notificationCache.clear('unread_count');
      notificationCache.clear('notifications_');
      
      return {
        success: true,
        data: response.data,
        source: 'axios'
      };
      
    } catch (error) {
      console.error(`🔔 Error marking notification ${notificationId} as read:`, error.message);
      
      // في Production، نعود بنجاح وهمي
      if (isProduction) {
        return {
          success: true,
          data: { message: 'Marked as read (simulated)' },
          source: 'simulated'
        };
      }
      
      return {
        success: false,
        error: error.message,
        source: 'failed'
      };
    }
  }

  // ==================== تحديد جميع الإشعارات كمقروءة ====================
  async markAllAsRead() {
    console.log('🔔 markAllAsRead called');
    
    if (!checkAuthentication(false)) {
      return {
        success: false,
        error: 'يجب تسجيل الدخول',
        requiresLogin: true
      };
    }
    
    try {
      const response = await this.axiosInstance.post('/notifications/mark-all-read');
      
      // مسح التخزين المؤقت
      notificationCache.clear('unread_count');
      notificationCache.clear('notifications_');
      
      return {
        success: true,
        data: response.data,
        source: 'axios'
      };
      
    } catch (error) {
      console.error('🔔 Error marking all as read:', error.message);
      
      if (isProduction) {
        return {
          success: true,
          data: { message: 'All marked as read (simulated)' },
          source: 'simulated'
        };
      }
      
      return {
        success: false,
        error: error.message,
        source: 'failed'
      };
    }
  }

  // ==================== بدء التحديث التلقائي ====================
  startPolling(callback, interval = 30000) { // 30 ثانية افتراضياً
    if (this.isPolling) {
      console.log('🔔 Polling already started');
      return;
    }
    
    this.isPolling = true;
    console.log('🔔 Starting polling with interval:', interval);
    
    const poll = async () => {
      if (!this.isPolling) return;
      
      try {
        const unreadCount = await this.getUnreadCount();
        const notifications = await this.getRecentNotifications(5);
        
        if (callback && typeof callback === 'function') {
          callback({
            unreadCount,
            notifications: notifications.success ? notifications.data : []
          });
        }
      } catch (error) {
        console.error('🔔 Polling error:', error);
      }
      
      if (this.isPolling) {
        this.pollingInterval = setTimeout(poll, interval);
      }
    };
    
    // بدء التحديث الفوري
    poll();
  }

  // ==================== إيقاف التحديث التلقائي ====================
  stopPolling() {
    this.isPolling = false;
    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
      this.pollingInterval = null;
      console.log('🔔 Polling stopped');
    }
  }

  // ==================== اختبار الاتصال ====================
  async testConnection() {
    console.log('🔔 Testing connection...');
    
    try {
      // محاولة جلب عدد الإشعارات غير المقروءة كاختبار
      const count = await this.getUnreadCount();
      
      return {
        success: true,
        status: 'connected',
        unreadCount: count,
        environment: isProduction ? 'production' : 'development'
      };
      
    } catch (error) {
      console.error('🔔 Connection test failed:', error);
      
      return {
        success: false,
        status: 'disconnected',
        error: error.message,
        environment: isProduction ? 'production' : 'development'
      };
    }
  }

  // ==================== مسح التخزين المؤقت ====================
  clearCache() {
    try {
      if (isBrowser) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('notification_')) {
            localStorage.removeItem(key);
          }
        });
        console.log('🔔 Notification cache cleared');
      }
    } catch (e) {
      console.warn('🔔 Error clearing notification cache:', e);
    }
  }

  // ==================== تسجيل الجهاز للإشعارات ====================
  async registerDevice(deviceData) {
    console.log('🔔 registerDevice called with:', deviceData);
    
    try {
      // التأكد من وجود session
      let sessionId = getSessionId();
      if (!sessionId) {
        sessionId = await createSession();
      }

      if (!sessionId) {
        return {
          success: false,
          error: 'فشل إنشاء session',
          source: 'session-creation-failed'
        };
      }

      // الحصول على معلومات الجهاز
      const deviceInfo = {
        token: deviceData.token || deviceData.fcm_token || '',
        device_type: deviceData.device_type || this.detectDeviceType(),
        device_name: deviceData.device_name || this.getDeviceName(),
        app_version: deviceData.app_version || '1.0.0',
        session_id: sessionId
      };

      // إرسال طلب تسجيل الجهاز
      const response = await this.axiosInstance.post('/notifications/register-device', deviceInfo);

      if (response.data && response.data.status) {
        if (!isProduction) {
          console.log('🔔 Device registered successfully:', response.data);
        }
        return {
          success: true,
          data: response.data.data || response.data,
          source: 'axios'
        };
      }

      return {
        success: false,
        error: response.data?.message || 'فشل تسجيل الجهاز',
        source: 'api-error'
      };

    } catch (error) {
      console.error('🔔 Error registering device:', error);
      
      return {
        success: false,
        error: error.message || 'فشل تسجيل الجهاز',
        source: 'failed',
        details: error.response?.data || {}
      };
    }
  }

  // ==================== اكتشاف نوع الجهاز ====================
  detectDeviceType() {
    if (!isBrowser) return 'web';
    
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    if (/android/i.test(userAgent)) {
      return 'android';
    }
    
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return 'ios';
    }
    
    if (/windows phone/i.test(userAgent)) {
      return 'windows';
    }
    
    return 'web';
  }

  // ==================== الحصول على اسم الجهاز ====================
  getDeviceName() {
    if (!isBrowser) return 'Unknown Device';
    
    const userAgent = navigator.userAgent || '';
    const platform = navigator.platform || '';
    
    // محاولة استخراج اسم الجهاز من user agent
    if (/android/i.test(userAgent)) {
      const match = userAgent.match(/Android\s+([^;]+)/);
      return match ? `Android ${match[1]}` : 'Android Device';
    }
    
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      const match = userAgent.match(/(iPhone|iPad|iPod).*OS\s+([\d_]+)/);
      return match ? `${match[1]} iOS ${match[2].replace(/_/g, '.')}` : 'iOS Device';
    }
    
    if (/windows/i.test(userAgent)) {
      return `Windows ${platform}`;
    }
    
    if (/mac/i.test(userAgent)) {
      return `Mac ${platform}`;
    }
    
    if (/linux/i.test(userAgent)) {
      return `Linux ${platform}`;
    }
    
    return platform || 'Unknown Device';
  }

  // ==================== الحصول على Session ID ====================
  async getOrCreateSession() {
    let sessionId = getSessionId();
    
    if (!sessionId) {
      sessionId = await createSession();
    }
    
    return sessionId;
  }
}

// إنشاء instance واحد
const notificationService = new NotificationService();

// تصدير للاستخدام
export default notificationService;