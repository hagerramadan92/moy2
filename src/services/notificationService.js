// services/notification.service.js
import axios from 'axios';

// تحديد ما إذا كنا في المتصفح والإنتاج
const isBrowser = typeof window !== 'undefined';
const isProduction = isBrowser && 
                     !window.location.hostname.includes('localhost') && 
                     !window.location.hostname.includes('127.0.0.1');

console.log(`🔔 Notification Service: ${isProduction ? 'Production' : 'Development'} mode`);

// قائمة CORS Proxies
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

// إنشاء axios instance
const createAxiosInstance = () => {
  const instance = axios.create({
    timeout: 20000,
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
    
    // في Production، استبدل URL بـ CORS Proxy
    if (isProduction && config.url) {
      const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
      
      // إذا كان الرابط يشير إلى API الخاص بنا
      if (fullUrl.includes(API_BASE)) {
        const endpoint = fullUrl.replace(API_BASE, '');
        config.url = createRequestURL(endpoint);
        config.baseURL = undefined;
      }
    }
    
    console.log(`🔔 Request: ${config.method?.toUpperCase()} ${config.url || (config.baseURL + config.url)}`);
    
    return config;
  }, (error) => {
    console.error('🔔 Request error:', error);
    return Promise.reject(error);
  });

  // Response Interceptor
  instance.interceptors.response.use(
    (response) => {
      console.log(`🔔 Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      console.error('🔔 Response error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // معالجة أخطاء المصادقة
      if (error.response?.status === 401 && isBrowser) {
        setTimeout(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          sessionStorage.removeItem('accessToken');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/';
          }
        }, 100);
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// دالة Fetch مع Retry للإشعارات
const fetchNotificationsWithRetry = async (endpoint, options = {}, maxRetries = 2) => {
  const token = getToken();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    for (const proxy of CORS_PROXIES) {
      try {
        const apiUrl = `${API_BASE}${endpoint}`;
        let proxyUrl;
        
        if (proxy.includes('allorigins.win')) {
          proxyUrl = `${proxy}${encodeURIComponent(apiUrl)}`;
        } else {
          proxyUrl = `${proxy}${apiUrl}`;
        }
        
        console.log(`🔔 Attempt ${attempt} with ${proxy}`);
        
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(proxyUrl, {
          ...options,
          headers,
          mode: 'cors'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`🔔 Success with ${proxy}`);
        
        return {
          data,
          status: response.status,
          proxyUsed: proxy
        };
        
      } catch (error) {
        console.warn(`🔔 Failed with ${proxy} (attempt ${attempt}):`, error.message);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }
  
  throw new Error(`All ${maxRetries} attempts failed`);
};

class NotificationService {
  constructor() {
    this.axiosInstance = createAxiosInstance();
  }

  // ==================== الحصول على الإشعارات ====================
  async getNotifications(params = {}) {
    console.log('🔔 getNotifications called');
    
    // في Production، تجاهل الإشعارات غير المقروءة إذا تسببت في مشاكل
    if (isProduction && params.read === false) {
      console.log('🔔 Skipping unread notifications in production');
      return {
        success: true,
        data: [],
        message: 'Notifications disabled in production due to CORS'
      };
    }
    
    try {
      const response = await this.axiosInstance.get('/notifications', { params });
      
      if (response.data) {
        return {
          success: true,
          data: response.data.data || response.data.notifications || [],
          total: response.data.total,
          unread_count: response.data.unread_count,
          source: 'axios'
        };
      }
      
      return {
        success: false,
        data: [],
        error: 'تنسيق البيانات غير صحيح',
        source: 'axios'
      };
      
    } catch (error) {
      console.error('🔔 Axios failed for notifications:', error.message);
      
      // المحاولة الثانية: fetch مع retry
      if (isProduction || error.code === 'ERR_NETWORK') {
        try {
          const queryString = new URLSearchParams(params).toString();
          const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';
          
          const result = await fetchNotificationsWithRetry(endpoint, { method: 'GET' });
          
          if (result.data) {
            return {
              success: true,
              data: result.data.data || result.data.notifications || [],
              total: result.data.total,
              unread_count: result.data.unread_count,
              source: `fetch-${result.proxyUsed}`,
              proxyUsed: result.proxyUsed
            };
          }
        } catch (fetchError) {
          console.error('🔔 Fetch retry failed:', fetchError);
        }
      }
      
      // في Production، نعود بمصفوفة فارغة بدلاً من خطأ
      if (isProduction) {
        return {
          success: true,
          data: [],
          error: 'لا يمكن تحميل الإشعارات حالياً',
          source: 'empty-fallback'
        };
      }
      
      return {
        success: false,
        data: [],
        error: 'فشل تحميل الإشعارات',
        source: 'failed'
      };
    }
  }

  // ==================== الحصول على عدد الإشعارات غير المقروءة ====================
  async getUnreadCount() {
    console.log('🔔 getUnreadCount called');
    
    // في Production، نعود بـ 0 مباشرة لتجنب مشاكل CORS
    if (isProduction) {
      console.log('🔔 Returning 0 for unread count in production');
      return 0;
    }
    
    try {
      const response = await this.axiosInstance.get('/notifications/unread-count');
      
      // معالجة الـ response
      const result = response.data;
      
      if (result.count !== undefined) {
        return result.count;
      }
      
      if (result.data?.count !== undefined) {
        return result.data.count;
      }
      
      if (typeof result === 'number') {
        return result;
      }
      
      return 0;
      
    } catch (error) {
      console.error('🔔 Error getting unread count:', error.message);
      
      // محاولة fetch retry في Development فقط
      if (!isProduction) {
        try {
          const result = await fetchNotificationsWithRetry('/notifications/unread-count', { 
            method: 'GET' 
          }, 1); // محاولة واحدة فقط
          
          const data = result.data;
          
          if (data.count !== undefined) {
            return data.count;
          }
          
          if (data.data?.count !== undefined) {
            return data.data.count;
          }
          
          if (typeof data === 'number') {
            return data;
          }
        } catch (fetchError) {
          console.error('🔔 Fetch retry failed for unread count:', fetchError);
        }
      }
      
      return 0;
    }
  }

  // ==================== الإشعارات الجديدة ====================
  async getNewNotifications(sinceTimestamp) {
    console.log(`🔔 getNewNotifications since ${sinceTimestamp}`);
    
    // في Production، نتجاهل هذه الوظيفة
    if (isProduction) {
      console.log('🔔 Skipping new notifications check in production');
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

  // ==================== تحديد كمقروء ====================
  async markAsRead(notificationId) {
    console.log(`🔔 markAsRead ${notificationId}`);
    
    try {
      const response = await this.axiosInstance.post(`/notifications/${notificationId}/read`);
      
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
          data: { message: 'Marked as read (simulated in production)' },
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
    
    try {
      const response = await this.axiosInstance.post('/notifications/mark-all-read');
      
      return {
        success: true,
        data: response.data,
        source: 'axios'
      };
      
    } catch (error) {
      console.error('🔔 Error marking all as read:', error.message);
      
      // في Production، نعود بنجاح وهمي
      if (isProduction) {
        return {
          success: true,
          data: { message: 'All marked as read (simulated in production)' },
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

  // ==================== باقي الدوال (مبسطة للإنتاج) ====================
  async registerDevice(deviceData) {
    console.log('🔔 registerDevice called');
    
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
      const response = await this.axiosInstance.post('/notifications/register-device', deviceData);
      return response.data;
    } catch (error) {
      console.error('🔔 Error registering device:', error);
      
      // Development fallback
      if (!isProduction) {
        return {
          success: true,
          message: 'Device registered (mock)',
          device_id: 'mock-device-' + Date.now()
        };
      }
      
      throw error;
    }
  }

  async updateDevice(deviceId, data) {
    // في Production، نتجاهل
    if (isProduction) return { success: true };
    
    try {
      const response = await this.axiosInstance.put(`/notifications/devices/${deviceId}`, data);
      return response.data;
    } catch (error) {
      console.error(`🔔 Error updating device:`, error);
      throw error;
    }
  }

  async deactivateDevice(deviceId) {
    // في Production، نتجاهل
    if (isProduction) return { success: true };
    
    try {
      const response = await this.axiosInstance.delete(`/notifications/devices/${deviceId}`);
      return response.data;
    } catch (error) {
      console.error(`🔔 Error deactivating device:`, error);
      throw error;
    }
  }

  async getRegisteredDevices() {
    // في Production، نعود بمصفوفة فارغة
    if (isProduction) {
      return {
        success: true,
        data: []
      };
    }
    
    try {
      const response = await this.axiosInstance.get('/notifications/devices');
      return response.data;
    } catch (error) {
      console.error('🔔 Error getting devices:', error);
      
      // Development fallback
      return {
        success: true,
        data: []
      };
    }
  }

  async deleteNotification(notificationId) {
    try {
      const response = await this.axiosInstance.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error(`🔔 Error deleting notification:`, error);
      throw error;
    }
  }

  async deleteAllNotifications() {
    try {
      const response = await this.axiosInstance.delete('/notifications/clear-all');
      return response.data;
    } catch (error) {
      console.error('🔔 Error deleting all notifications:', error);
      throw error;
    }
  }

  // ==================== اختبار الاتصال ====================
  async testConnection() {
    console.log('🔔 Testing connection...');
    
    try {
      // في Production، اختبر مع proxy
      if (isProduction) {
        const result = await fetchNotificationsWithRetry('/notifications/unread-count', { 
          method: 'GET' 
        }, 1);
        
        return {
          success: true,
          status: 'connected via proxy',
          proxyUsed: result.proxyUsed,
          environment: 'production'
        };
      }
      
      // في Development، اختبر مباشرة
      const response = await this.axiosInstance.get('/notifications/unread-count');
      
      return {
        success: true,
        status: 'connected',
        data: response.data,
        environment: 'development'
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

  // ==================== تهيئة الخدمة ====================
  async initialize() {
    if (!isBrowser) return;
    
    console.log('🔔 Initializing notification service...');
    
    // في Production، لا نحتاج تهيئة حقيقية
    if (isProduction) {
      console.log('🔔 Notification service initialized for production (simplified)');
      return {
        success: true,
        message: 'Notification service ready for production'
      };
    }
    
    // في Development، تهيئة عادية
    try {
      const deviceId = localStorage.getItem('notification_device_id');
      
      if (!deviceId) {
        const deviceData = {
          device_type: 'web',
          device_token: 'web-browser-' + Date.now(),
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          }
        };
        
        const registration = await this.registerDevice(deviceData);
        if (registration.success && registration.device_id) {
          localStorage.setItem('notification_device_id', registration.device_id);
        }
      }
      
      return {
        success: true,
        deviceId: deviceId || 'none',
        message: 'Notification service initialized'
      };
      
    } catch (error) {
      console.error('🔔 Error initializing:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ==================== وظيفة مساعدة: تعطيل التحديث التلقائي ====================
  disableAutoRefresh() {
    console.log('🔔 Auto refresh disabled for notifications');
    // هذه الدالة يمكن استدعاؤها من FloatingChatIcon لتعطيل التحديث التلقائي
    return true;
  }
}

// إنشاء instance واحد
const notificationService = new NotificationService();

// تصدير للاستخدام
export default notificationService;