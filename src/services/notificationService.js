// services/notification.service.js
import axios from 'axios';

// تحديد ما إذا كنا في الإنتاج والمتصفح
const isProduction = process.env.NODE_ENV === 'production';
const isBrowser = typeof window !== 'undefined';

// دالة لبناء الـ URL الصحيح بناءً على البيئة
const buildApiUrl = (path) => {
  // في المتصفح، استخدم دائمًا الـ proxy للإشعارات
  if (isBrowser) {
    // استخدم الـ proxy للمسارات التي تبدأ بـ /notifications
    if (path.startsWith('/notifications')) {
      return `/api/proxy${path}`;
    }
  }
  
  // في server-side، استخدم الـ API مباشرة
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://moya.talaaljazeera.com/api/v1"; // غيرت إلى HTTPS
  return `${baseURL}${path}`;
};

// إنشاء axios instance واحد
const axiosInstance = axios.create({
  baseURL: '', // سنبني الـ URLs يدوياً
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use((config) => {
  const originalUrl = config.url;
  
  // تحويل الـ URL بناءً على البيئة
  if (originalUrl) {
    config.url = buildApiUrl(originalUrl);
  }
  
  // إضافة token
  if (isBrowser) {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  console.log('🔔 Notification Service Request:', {
    originalUrl,
    finalUrl: config.url,
    method: config.method,
    usingProxy: config.url?.includes('/api/proxy/') || false,
    isProduction,
    isBrowser
  });
  
  return config;
}, (error) => {
  console.error('🔔 Notification Service Request Error:', error);
  return Promise.reject(error);
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('🔔 Notification Service Response:', {
      url: response.config.url,
      status: response.status,
      usingProxy: response.config.url?.includes('/api/proxy/') || false
    });
    return response;
  },
  async (error) => {
    console.error('🔔 Notification Service Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      code: error.code,
      usingProxy: error.config?.url?.includes('/api/proxy/') || false,
      isProduction,
      isBrowser
    });
    
    // معالجة أخطاء المصادقة
    if (error.response?.status === 401) {
      if (isBrowser) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('accessToken');
        // يمكنك إعادة التوجيه للصفحة الرئيسية بدلاً من login
        window.location.href = '/';
      }
    }
    
    // معالجة أخطاء Mixed Content
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      if (isBrowser && error.config?.url?.startsWith('http:')) {
        console.error('⚠️ Mixed Content Error Detected! Trying to use HTTPS or proxy...');
        
        // إذا كان الـ URL يستخدم HTTP، حاول استخدام HTTPS بدلاً منه
        const httpUrl = error.config.url;
        if (httpUrl.startsWith('http://')) {
          const httpsUrl = httpUrl.replace('http://', 'https://');
          console.warn(`🔄 Retrying with HTTPS: ${httpsUrl}`);
          
          // يمكنك إضافة منطق إعادة المحاولة هنا
          // أو توجيه المستخدم إلى استخدام HTTPS
        }
      }
    }
    
    throw error;
  }
);

// باقي الكود كما هو...
class NotificationService {
  // تسجيل الجهاز
  async registerDevice(deviceData) {
    try {
      console.log('📱 Registering device:', deviceData);
      
      const response = await axiosInstance.post('/notifications/register-device', deviceData);
      
      console.log('✅ Device registered:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error registering device:', error);
      
      // Fallback للـ development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock response for development');
        return {
          success: true,
          message: 'Device registered successfully (mock)',
          device_id: 'mock-device-' + Date.now()
        };
      }
      
      throw error;
    }
  }

  // تحديث حالة الجهاز
  async updateDevice(deviceId, data) {
    try {
      console.log(`🔄 Updating device ${deviceId}:`, data);
      
      const response = await axiosInstance.put(`/notifications/devices/${deviceId}`, data);
      
      console.log(`✅ Device ${deviceId} updated:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating device ${deviceId}:`, error);
      throw error;
    }
  }

  // إلغاء تفعيل الجهاز
  async deactivateDevice(deviceId) {
    try {
      console.log(`🚫 Deactivating device ${deviceId}`);
      
      const response = await axiosInstance.delete(`/notifications/devices/${deviceId}`);
      
      console.log(`✅ Device ${deviceId} deactivated:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deactivating device ${deviceId}:`, error);
      throw error;
    }
  }

  // الحصول على الأجهزة المسجلة
  async getRegisteredDevices() {
    try {
      console.log('📱 Getting registered devices...');
      
      const response = await axiosInstance.get('/notifications/devices');
      
      console.log('✅ Registered devices:', {
        count: response.data?.data?.length || response.data?.length || 0,
        success: response.data?.success || response.data?.status
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error getting devices:', error);
      
      // Fallback للـ development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock devices for development');
        return {
          success: true,
          data: [
            {
              id: 'mock-device-1',
              device_type: 'browser',
              device_token: 'mock-token-1',
              is_active: true,
              created_at: new Date().toISOString()
            }
          ]
        };
      }
      
      throw error;
    }
  }

  // الحصول على الإشعارات
  async getNotifications(params = {}) {
    try {
      console.log('🔔 Getting notifications with params:', params);
      
      const response = await axiosInstance.get('/notifications', { params });
      
      console.log('✅ Notifications response:', {
        count: response.data?.data?.length || response.data?.length || 0,
        success: response.data?.success || response.data?.status
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting notifications:', error);
      
      // Fallback للـ development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock notifications for development');
        return {
          success: true,
          data: [],
          message: 'No notifications (mock)'
        };
      }
      
      throw error;
    }
  }

  // تحديد الإشعار كمقروء
  async markAsRead(notificationId) {
    try {
      console.log(`👁️ Marking notification ${notificationId} as read`);
      
      const response = await axiosInstance.post(`/notifications/${notificationId}/read`);
      
      console.log(`✅ Notification ${notificationId} marked as read:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  }

  // تحديد جميع الإشعارات كمقروءة
  async markAllAsRead() {
    try {
      console.log('👁️ Marking all notifications as read');
      
      const response = await axiosInstance.post('/notifications/mark-all-read');
      
      console.log('✅ All notifications marked as read:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  // حذف الإشعار
  async deleteNotification(notificationId) {
    try {
      console.log(`🗑️ Deleting notification ${notificationId}`);
      
      const response = await axiosInstance.delete(`/notifications/${notificationId}`);
      
      console.log(`✅ Notification ${notificationId} deleted:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting notification ${notificationId}:`, error);
      throw error;
    }
  }

  // حذف جميع الإشعارات
  async deleteAllNotifications() {
    try {
      console.log('🗑️ Deleting all notifications');
      
      const response = await axiosInstance.delete('/notifications/clear-all');
      
      console.log('✅ All notifications deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting all notifications:', error);
      throw error;
    }
  }

  // الحصول على عدد الإشعارات غير المقروءة
  async getUnreadCount() {
    try {
      console.log('🔢 Getting unread notifications count');
      
      const response = await axiosInstance.get('/notifications/unread-count');
      
      console.log('✅ Unread count:', response.data);
      
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
      console.error('❌ Error getting unread count:', error);
      
      // Fallback للـ development
      if (process.env.NODE_ENV === 'development') {
        return 0;
      }
      
      throw error;
    }
  }

  // الحصول على الإشعارات الجديدة منذ وقت محدد
  async getNewNotifications(sinceTimestamp) {
    try {
      console.log(`🆕 Getting new notifications since: ${new Date(sinceTimestamp).toLocaleString()}`);
      
      const response = await axiosInstance.get('/notifications/new', {
        params: { since: sinceTimestamp }
      });
      
      console.log(`✅ New notifications since ${sinceTimestamp}:`, {
        count: response.data?.data?.length || response.data?.length || 0
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Error getting new notifications since ${sinceTimestamp}:`, error);
      
      // Fallback للـ development
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          data: [],
          message: 'No new notifications (mock)'
        };
      }
      
      throw error;
    }
  }

  // اختبار الاتصال
  async testConnection() {
    try {
      console.log('🔗 Testing notification service connection...');
      
      // محاولة جلب عدد الإشعارات غير المقروءة (طريقة خفيفة)
      const response = await axiosInstance.get('/notifications/unread-count');
      
      return {
        success: true,
        status: 'connected',
        data: response.data,
        environment: {
          isProduction,
          isBrowser,
          usingProxy: response.config.url?.includes('/api/proxy/') || false
        }
      };
    } catch (error) {
      console.error('❌ Notification service connection test failed:', error);
      
      return {
        success: false,
        status: 'disconnected',
        error: error.message,
        environment: {
          isProduction,
          isBrowser,
          usingProxy: error.config?.url?.includes('/api/proxy/') || false
        }
      };
    }
  }

  // اختبار الـ proxy
  async testProxy() {
    if (!isProduction || !isBrowser) {
      return {
        success: false,
        message: 'Proxy test only available in production browser environment'
      };
    }
    
    try {
      const endpoints = [
        '/notifications',
        '/notifications/unread-count',
        '/notifications/devices'
      ];
      
      const results = [];
      
      for (const endpoint of endpoints) {
        try {
          const response = await axiosInstance.get(endpoint);
          results.push({
            endpoint,
            success: true,
            status: response.status,
            usingProxy: response.config.url?.includes('/api/proxy/'),
            proxyUrl: response.config.url
          });
        } catch (error) {
          results.push({
            endpoint,
            success: false,
            error: error.message,
            usingProxy: error.config?.url?.includes('/api/proxy/'),
            proxyUrl: error.config?.url
          });
        }
      }
      
      return {
        success: true,
        results,
        summary: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      };
    } catch (error) {
      console.error('❌ Proxy test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // تهيئة الإشعارات في التطبيق
  async initialize() {
    if (!isBrowser) return;
    
    try {
      console.log('🚀 Initializing notification service...');
      
      // تسجيل الجهاز إذا لزم الأمر
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
          console.log('📱 Device registered with ID:', registration.device_id);
        }
      }
      
      return {
        success: true,
        deviceId: deviceId || 'none',
        message: 'Notification service initialized'
      };
    } catch (error) {
      console.error('❌ Error initializing notification service:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// إنشاء instance واحد وإعادته
const notificationService = new NotificationService();

// تصدير للاستخدام
export default notificationService;