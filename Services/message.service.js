// services/message.service.js
import axios from 'axios';

// دالة لإنشاء Base URL ديناميكي بناءً على البيئة
const getBaseURL = () => {
  // تحقق أولاً من المتغير البيئي المخصص للـ API
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // في Production، استخدم المسار النسبي للـ Proxy
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
    return '/api/proxy';
  }
  
  // في التطوير المحلي، استخدم الخادم المباشر
  return 'https://moya.talaaljazeera.com/api/v1';
};

// الحصول على التوكن من localStorage - إصدار آمن للبناء
const getToken = () => {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
  } catch (e) {
    // تجنب الأخطاء أثناء البناء
    return null;
  }
  return null;
};

// إنشاء instance لـ axios - إصدار مبسط
const createAxiosInstance = () => {
  const baseURL = getBaseURL();
  
  const instance = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  });

  // إضافة interceptor للطلبات
  instance.interceptors.request.use((config) => {
    const token = getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  // معالج الاستجابات
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        // تأخير التوجيه لتجنب مشاكل React
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
        }, 100);
      }
      
      // تسجيل الخطأ
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Axios Error:', error.message);
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// إنشاء instance واحد لاستخدامه في كل مكان
let axiosInstance;

// دالة للحصول على instance بأمان
const getAxiosInstance = () => {
  if (!axiosInstance) {
    axiosInstance = createAxiosInstance();
  }
  return axiosInstance;
};

// دالة بديلة مبسطة تستخدم fetch مباشرة
const simpleFetchWithFallback = async (endpoint, options = {}) => {
  try {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // بناء URL بناءً على البيئة
    let url;
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      // في Production، استخدم المسار النسبي
      url = `/api/proxy${endpoint}`;
    } else {
      // في التطوير، استخدم CORS proxy
      const apiUrl = `https://moya.talaaljazeera.com/api/v1${endpoint}`;
      url = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// دالة للتخزين المؤقت - إصدار آمن
const cacheManager = {
  set: (key, data, ttl = 300000) => {
    try {
      if (typeof window !== 'undefined') {
        const cacheItem = {
          data,
          timestamp: Date.now(),
          ttl
        };
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
      }
    } catch (e) {
      // تجاهل أخطاء localStorage
    }
  },
  
  get: (key) => {
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(`cache_${key}`);
        if (!cached) return null;
        
        const cacheItem = JSON.parse(cached);
        const now = Date.now();
        
        if (now - cacheItem.timestamp > cacheItem.ttl) {
          localStorage.removeItem(`cache_${key}`);
          return null;
        }
        
        return cacheItem.data;
      }
    } catch (e) {
      // تجاهل أخطاء localStorage
    }
    return null;
  },
  
  clear: (key) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`cache_${key}`);
      }
    } catch (e) {
      // تجاهل الأخطاء
    }
  },
  
  clearAll: () => {
    try {
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('cache_')) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (e) {
      // تجاهل الأخطاء
    }
  }
};

class MessageService {
  constructor() {
    // تأخير إنشاء axiosInstance حتى يتم استدعاؤه فعلياً
    this._axiosInstance = null;
  }
  
  // خاصية getter لـ axiosInstance
  get axiosInstance() {
    if (!this._axiosInstance) {
      this._axiosInstance = createAxiosInstance();
    }
    return this._axiosInstance;
  }

  // الحصول على قائمة الدردشات
  async getChats(params = {}) {
    const cacheKey = `chats_${JSON.stringify(params)}`;
    
    // محاولة الحصول من التخزين المؤقت أولاً
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      // المحاولة الأولى: استخدام axios
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
      console.error('❌ Error in getChats:', error.message);
      
      // المحاولة الثانية: استخدام fetch fallback
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network')) {
        try {
          const queryString = new URLSearchParams(params).toString();
          const endpoint = queryString ? `/chats?${queryString}` : '/chats';
          
          const data = await simpleFetchWithFallback(endpoint, { method: 'GET' });
          
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
              source: 'fetch-fallback'
            };
            
            cacheManager.set(cacheKey, result);
            return result;
          }
        } catch (fallbackError) {
          console.error('❌ Fetch fallback failed:', fallbackError);
        }
      }
      
      // المحاولة الثالثة: استخدام البيانات المخزنة سابقاً
      const fallbackCache = cacheManager.get('chats_fallback');
      if (fallbackCache) {
        return {
          ...fallbackCache,
          source: 'fallback-cache',
          isFallback: true,
          error: 'الاتصال بالخادم غير متاح، استخدام البيانات المخزنة'
        };
      }
      
      // أخيراً: إرجاع خطأ
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || error.message || 'فشل الاتصال بالخادم',
        source: 'error'
      };
    }
  }

  // الحصول على رسائل دردشة معينة
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
      console.error(`❌ Error in getMessages for chat ${chatId}:`, error.message);
      
      // محاولة fallback
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network')) {
        try {
          const queryString = new URLSearchParams(params).toString();
          const endpoint = queryString 
            ? `/chats/${chatId}/messages?${queryString}` 
            : `/chats/${chatId}/messages`;
          
          const data = await simpleFetchWithFallback(endpoint, { method: 'GET' });
          
          if (data.status === "success") {
            const result = {
              success: true,
              data: data.messages?.data || data.messages || [],
              pagination: data.messages?.meta || {},
              source: 'fetch-fallback'
            };
            
            cacheManager.set(cacheKey, result, 60000);
            return result;
          }
        } catch (fallbackError) {
          console.error('❌ Fetch fallback failed:', fallbackError);
        }
      }
      
      return {
        success: false,
        data: [],
        error: error.message,
        source: 'error'
      };
    }
  }

  // الحصول على الإشعارات
  async getNotifications(params = {}) {
    try {
      const response = await this.axiosInstance.get('/notifications', { params });
      
      if (response.data.status === "success") {
        return {
          success: true,
          data: response.data.notifications?.data || [],
          pagination: response.data.notifications?.meta || {},
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
      console.error('❌ Error in getNotifications:', error.message);
      
      // محاولة fallback
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network')) {
        try {
          const queryString = new URLSearchParams(params).toString();
          const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';
          
          const data = await simpleFetchWithFallback(endpoint, { method: 'GET' });
          
          if (data.status === "success") {
            return {
              success: true,
              data: data.notifications?.data || [],
              pagination: data.notifications?.meta || {},
              source: 'fetch-fallback'
            };
          }
        } catch (fallbackError) {
          console.error('❌ Fetch fallback failed:', fallbackError);
        }
      }
      
      return {
        success: false,
        data: [],
        error: error.message,
        source: 'error'
      };
    }
  }

  // إرسال رسالة جديدة
  async sendMessage(chatId, messageData) {
    try {
      const payload = {
        message: messageData.message || messageData.text || messageData,
        message_type: messageData.message_type || "text",
        metadata: messageData.metadata || ["text"]
      };
      
      const response = await this.axiosInstance.post(`/chats/${chatId}/send`, payload);
      
      if (response.data.status === "success" && response.data.message) {
        // مسح التخزين المؤقت للرسائل بعد الإرسال
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
      
      // محاولة fallback
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network')) {
        try {
          const data = await simpleFetchWithFallback(`/chats/${chatId}/send`, {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          
          if (data.status === "success" && data.message) {
            cacheManager.clear(`messages_${chatId}`);
            
            return {
              success: true,
              message: data.message,
              data: data,
              source: 'fetch-fallback'
            };
          }
        } catch (fallbackError) {
          console.error('❌ Fetch fallback failed:', fallbackError);
        }
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        source: 'error'
      };
    }
  }

  // إنشاء دردشة جديدة
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
      
      // محاولة fallback
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network')) {
        try {
          const data = await simpleFetchWithFallback('/chats/create', {
            method: 'POST',
            body: JSON.stringify({
              participant_id: participantId,
              type: type
            })
          });
          
          if (data.status === "success") {
            cacheManager.clear('chats_');
            
            return {
              success: true,
              chat: data.chat,
              data: data,
              source: 'fetch-fallback'
            };
          }
        } catch (fallbackError) {
          console.error('❌ Fetch fallback failed:', fallbackError);
        }
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        source: 'error'
      };
    }
  }

  // تحديث حالة الرسالة كمقروءة
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
        source: 'error'
      };
    }
  }

  // الحصول على تفاصيل دردشة معينة
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
        source: 'error'
      };
    }
  }

  // البحث عن دردشات أو مستخدمين
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
        source: 'error'
      };
    }
  }

  // مسح جميع التخزين المؤقت
  clearCache() {
    cacheManager.clearAll();
  }
}

// إنشاء نسخة من الخدمة
export const messageService = new MessageService();

// تصدير أدوات مساعدة
export { cacheManager };

export default messageService;