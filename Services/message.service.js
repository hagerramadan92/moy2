// services/message.service.js
import axios from 'axios';

// تحديد ما إذا كنا في المتصفح والإنتاج
const isBrowser = typeof window !== 'undefined';
const isProduction = isBrowser && 
                     !window.location.hostname.includes('localhost') && 
                     !window.location.hostname.includes('127.0.0.1');

console.log(`📱 Message Service: ${isProduction ? 'Production' : 'Development'} mode`);

// ==================== دوال مساعدة ====================
const getToken = () => {
  try {
    if (isBrowser) {
      return localStorage.getItem('accessToken');
    }
  } catch (e) {
    console.error('❌ خطأ في قراءة التوكن:', e);
  }
  return null;
};

// ==================== إنشاء Axios Instance ====================
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: 'https://moya.talaaljazeera.com/api/v1',
    timeout: 20000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  // Request interceptor
  instance.interceptors.request.use((config) => {
    const token = getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // تسجيل الطلب في التطوير
    if (!isProduction) {
      console.log(`🚀 Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  }, (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  });

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      if (!isProduction) {
        console.log(`✅ Response: ${response.status} ${response.config.url}`);
      }
      return response;
    },
    (error) => {
      console.error('❌ Response error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // معالجة أخطاء المصادقة
      if (error.response?.status === 401 && isBrowser) {
        setTimeout(() => {
          localStorage.removeItem('accessToken');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }, 100);
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// ==================== إدارة التخزين المؤقت ====================
const cacheManager = {
  set: (key, data, ttl = 300000) => {
    try {
      if (isBrowser) {
        const cacheItem = {
          data,
          timestamp: Date.now(),
          ttl
        };
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
      }
    } catch (e) {
      console.warn('⚠️ Cache set error:', e);
    }
  },
  
  get: (key) => {
    try {
      if (isBrowser) {
        const cached = localStorage.getItem(`cache_${key}`);
        if (!cached) return null;
        
        const cacheItem = JSON.parse(cached);
        const now = Date.now();
        
        // تحقق من انتهاء الصلاحية
        if (now - cacheItem.timestamp > cacheItem.ttl) {
          localStorage.removeItem(`cache_${key}`);
          return null;
        }
        
        return cacheItem.data;
      }
    } catch (e) {
      console.warn('⚠️ Cache get error:', e);
    }
    return null;
  },
  
  clear: (key) => {
    try {
      if (isBrowser) {
        localStorage.removeItem(`cache_${key}`);
      }
    } catch (e) {
      console.warn('⚠️ Cache clear error:', e);
    }
  }
};

// ==================== الفئة الرئيسية للخدمة ====================
class MessageService {
  constructor() {
    this._axiosInstance = null;
  }
  
  get axiosInstance() {
    if (!this._axiosInstance) {
      this._axiosInstance = createAxiosInstance();
    }
    return this._axiosInstance;
  }

  // ==================== الحصول على المحادثات ====================
  async getChats(params = {}) {
    const cacheKey = `chats_${JSON.stringify(params)}`;
    
    // محاولة الحصول من التخزين المؤقت
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      if (!isProduction) console.log('📦 Using cached chats');
      return cached;
    }
    
    try {
      const response = await this.axiosInstance.get('/chats', { params });
      
      let result;
      
      if (response.data.status === "success" && response.data.chats) {
        result = {
          success: true,
          data: response.data.chats.data || [],
          pagination: {
            current_page: response.data.chats.current_page,
            total: response.data.chats.total,
            per_page: response.data.chats.per_page,
            last_page: response.data.chats.last_page
          },
          source: 'axios'
        };
      } else {
        result = {
          success: false,
          data: [],
          error: 'تنسيق البيانات غير صحيح',
          source: 'axios'
        };
      }
      
      // تخزين في الذاكرة المؤقتة
      if (result.success) {
        cacheManager.set(cacheKey, result);
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Error getting chats:', error.message);
      
      // المحاولة الثانية: استخدام fetch مباشرة مع proxy في Production
      if (isProduction || error.code === 'ERR_NETWORK') {
        try {
          const token = getToken();
          const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const queryString = new URLSearchParams(params).toString();
          const apiUrl = `https://moya.talaaljazeera.com/api/v1/chats${queryString ? `?${queryString}` : ''}`;
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
          
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: headers
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.status === "success" && data.chats) {
            const result = {
              success: true,
              data: data.chats.data || [],
              pagination: {
                current_page: data.chats.current_page,
                total: data.chats.total,
                per_page: data.chats.per_page,
                last_page: data.chats.last_page
              },
              source: 'cors-proxy'
            };
            
            cacheManager.set(cacheKey, result);
            return result;
          }
        } catch (proxyError) {
          console.error('❌ CORS proxy also failed:', proxyError);
        }
      }
      
      return {
        success: false,
        data: [],
        error: 'فشل تحميل المحادثات',
        source: 'failed'
      };
    }
  }

  // ==================== الحصول على الرسائل ====================
  async getMessages(chatId, params = {}) {
    const cacheKey = `messages_${chatId}_${JSON.stringify(params)}`;
    const cached = cacheManager.get(cacheKey);
    
    if (cached && !params.refresh) {
      return cached;
    }
    
    try {
      const response = await this.axiosInstance.get(`/chats/${chatId}/messages`, { params });
      
      let result;
      
      if (response.data.status === "success") {
        result = {
          success: true,
          data: response.data.messages?.data || response.data.messages || [],
          pagination: response.data.messages?.meta || {},
          source: 'axios'
        };
      } else {
        result = {
          success: false,
          data: [],
          error: 'تنسيق البيانات غير صحيح',
          source: 'axios'
        };
      }
      
      if (result.success) {
        cacheManager.set(cacheKey, result, 60000);
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ Error getting messages for chat ${chatId}:`, error.message);
      
      // محاولة fetch مع proxy في Production
      if (isProduction || error.code === 'ERR_NETWORK') {
        try {
          const token = getToken();
          const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const queryString = new URLSearchParams(params).toString();
          const apiUrl = `https://moya.talaaljazeera.com/api/v1/chats/${chatId}/messages${queryString ? `?${queryString}` : ''}`;
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
          
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: headers
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.status === "success") {
            const result = {
              success: true,
              data: data.messages?.data || data.messages || [],
              pagination: data.messages?.meta || {},
              source: 'cors-proxy'
            };
            
            cacheManager.set(cacheKey, result, 60000);
            return result;
          }
        } catch (proxyError) {
          console.error('❌ CORS proxy failed:', proxyError);
        }
      }
      
      return {
        success: false,
        data: [],
        error: 'فشل تحميل الرسائل',
        source: 'failed'
      };
    }
  }

  // ==================== الحصول على الإشعارات ====================
  async getNotifications(params = {}) {
    console.log('📞 getNotifications called');
    
    // ⛔️ ⛔️ ⛔️ تعطيل جلب الإشعارات في Production نهائياً ⛔️ ⛔️ ⛔️
    // لأن الإشعارات لها خدمة منفصلة (NotificationContext)
    if (isProduction) {
      console.log('🚫 NOTIFICATIONS DISABLED IN PRODUCTION - Using separate NotificationContext');
      return {
        success: true,
        data: [],
        message: 'الإشعارات معطلة في الإنتاج - استخدم NotificationContext بدلاً من ذلك',
        source: 'disabled-production'
      };
    }
    
    // في Development فقط، حاول جلب الإشعارات
    try {
      const response = await this.axiosInstance.get('/notifications', { params });
      
      if (response.data.status === "success") {
        return {
          success: true,
          data: response.data.notifications?.data || [],
          pagination: response.data.notifications?.meta || {},
          source: 'axios-development'
        };
      }
      
      return {
        success: false,
        data: [],
        error: 'تنسيق البيانات غير صحيح',
        source: 'axios-development'
      };
      
    } catch (error) {
      console.error('❌ Error getting notifications:', error.message);
      
      // في Development، نعود بمصفوفة فارغة بدلاً من خطأ
      return {
        success: true,
        data: [],
        error: 'لا يمكن تحميل الإشعارات حالياً',
        source: 'empty-fallback-development'
      };
    }
  }

  // ==================== إرسال الرسائل ====================
  async sendMessage(chatId, messageData) {
    console.log(`📤 sendMessage to chat ${chatId}`);
    
    const payload = {
      message: messageData.message || messageData.text || messageData,
      message_type: messageData.message_type || "text",
      metadata: messageData.metadata || ["text"]
    };
    
    try {
      const response = await this.axiosInstance.post(`/chats/${chatId}/send`, payload);
      
      if (response.data.status === "success" && response.data.message) {
        // مسح التخزين المؤقت للرسائل
        cacheManager.clear(`messages_${chatId}`);
        
        return {
          success: true,
          message: response.data.message,
          data: response.data,
          source: 'axios'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'فشل إرسال الرسالة',
        source: 'axios'
      };
      
    } catch (error) {
      console.error(`❌ Error sending message to chat ${chatId}:`, error.message);
      
      // محاولة fetch مع proxy في Production
      if (isProduction || error.code === 'ERR_NETWORK') {
        try {
          const token = getToken();
          const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const apiUrl = `https://moya.talaaljazeera.com/api/v1/chats/${chatId}/send`;
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
          
          const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.status === "success" && data.message) {
            cacheManager.clear(`messages_${chatId}`);
            
            return {
              success: true,
              message: data.message,
              data: data,
              source: 'cors-proxy'
            };
          }
        } catch (proxyError) {
          console.error('❌ CORS proxy failed:', proxyError);
        }
      }
      
      return {
        success: false,
        error: 'فشل إرسال الرسالة. تحقق من اتصالك بالإنترنت.',
        source: 'failed'
      };
    }
  }

  // ==================== باقي الدوال ====================
  async createChat(participantId, type = "user_user") {
    try {
      const response = await this.axiosInstance.post('/chats/create', {
        participant_id: participantId,
        type: type
      });
      
      if (response.data.status === "success") {
        // مسح التخزين المؤقت للدردشات
        cacheManager.clear('chats_');
        
        return {
          success: true,
          chat: response.data.chat,
          data: response.data,
          source: 'axios'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'فشل إنشاء المحادثة',
        source: 'axios'
      };
      
    } catch (error) {
      console.error('❌ Error creating chat:', error.message);
      return {
        success: false,
        error: 'فشل إنشاء المحادثة',
        source: 'failed'
      };
    }
  }

  async markMessageAsRead(messageId) {
    try {
      const response = await this.axiosInstance.put(`/messages/${messageId}/read`);
      return {
        success: true,
        data: response.data,
        source: 'axios'
      };
    } catch (error) {
      console.error(`❌ Error marking message ${messageId} as read:`, error.message);
      return {
        success: false,
        error: error.message,
        source: 'failed'
      };
    }
  }

  async getChatDetails(chatId) {
    const cacheKey = `chat_details_${chatId}`;
    const cached = cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    try {
      const response = await this.axiosInstance.get(`/chats/${chatId}`);
      
      if (response.data.status === "success") {
        const result = {
          success: true,
          data: response.data.chat,
          source: 'axios'
        };
        
        cacheManager.set(cacheKey, result, 300000);
        return result;
      }
      
      return {
        success: false,
        error: 'تنسيق البيانات غير صحيح',
        source: 'axios'
      };
    } catch (error) {
      console.error(`❌ Error getting chat details ${chatId}:`, error.message);
      return {
        success: false,
        error: error.message,
        source: 'failed'
      };
    }
  }

  async searchChats(query, params = {}) {
    try {
      const response = await this.axiosInstance.get('/chats/search', {
        params: { query, ...params }
      });
      
      if (response.data.status === "success") {
        return {
          success: true,
          data: response.data.results || [],
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
      console.error('❌ Error searching chats:', error.message);
      return {
        success: false,
        data: [],
        error: error.message,
        source: 'failed'
      };
    }
  }

  clearCache() {
    try {
      if (isBrowser) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('cache_')) {
            localStorage.removeItem(key);
          }
        });
        console.log('🧹 Message service cache cleared');
      }
    } catch (e) {
      console.warn('⚠️ Error clearing cache:', e);
    }
  }
}

// ==================== تصدير الخدمة ====================
export const messageService = new MessageService();
export default messageService;