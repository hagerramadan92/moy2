// services/message.service.js
import axios from 'axios';

// 1. استخدام API مباشرة مع CORS proxy في جميع البيئات
const getBaseURL = () => {
  return 'https://moya.talaaljazeera.com/api/v1';
};

// 2. الحصول على التوكن
const getToken = () => {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
  } catch (e) {
    console.error('❌ خطأ في قراءة التوكن:', e);
  }
  return null;
};

// 3. إنشاء axios instance مع CORS headers
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: getBaseURL(),
    timeout: 20000, // 20 ثانية
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
    
    // إضافة معلومات إضافية للتصحيح
    config.headers['X-Client-Source'] = 'moya-web-app';
    
    // تسجيل الطلب في التطوير
    if (process.env.NODE_ENV === 'development') {
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
      if (process.env.NODE_ENV === 'development') {
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
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          // تأخير التوجيه لتجنب مشاكل React
          setTimeout(() => {
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }, 100);
        }
      }
      
      // معالجة أخطاء CORS
      if (error.message?.includes('CORS') || error.code === 'ERR_NETWORK') {
        console.warn('⚠️ CORS/Network error detected');
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// 4. دالة fetch بديلة باستخدام CORS proxy
const fetchWithCorsProxy = async (endpoint, options = {}) => {
  try {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // استخدام CORS proxy
    const apiUrl = `https://moya.talaaljazeera.com/api/v1${endpoint}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
    
    console.log('🔄 Using CORS proxy:', apiUrl);
    
    const response = await fetch(proxyUrl, {
      ...options,
      headers,
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ CORS proxy fetch error:', error);
    throw error;
  }
};

// 5. إدارة التخزين المؤقت
const cacheManager = {
  set: (key, data, ttl = 300000) => { // 5 دقائق افتراضياً
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
      console.warn('⚠️ Cache set error:', e);
    }
  },
  
  get: (key) => {
    try {
      if (typeof window !== 'undefined') {
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`cache_${key}`);
      }
    } catch (e) {
      console.warn('⚠️ Cache clear error:', e);
    }
  }
};

// 6. الفئة الرئيسية للخدمة
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

  // الحصول على قائمة الدردشات
  async getChats(params = {}) {
    const cacheKey = `chats_${JSON.stringify(params)}`;
    
    // محاولة الحصول من التخزين المؤقت
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      console.log('📦 Using cached chats');
      return cached;
    }
    
    try {
      // المحاولة الأولى: استخدام axios مباشرة
      console.log('🔄 Attempt 1: Direct axios request');
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
          source: 'direct-api'
        };
      } else {
        result = {
          success: false,
          data: [],
          error: 'تنسيق البيانات غير صحيح',
          source: 'direct-api'
        };
      }
      
      // تخزين في الذاكرة المؤقتة
      if (result.success) {
        cacheManager.set(cacheKey, result);
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Direct API failed:', error.message);
      
      // المحاولة الثانية: استخدام CORS proxy
      if (error.code === 'ERR_NETWORK' || error.message.includes('CORS') || error.message.includes('Network')) {
        console.log('🔄 Attempt 2: Using CORS proxy');
        
        try {
          const queryString = new URLSearchParams(params).toString();
          const endpoint = queryString ? `/chats?${queryString}` : '/chats';
          
          const data = await fetchWithCorsProxy(endpoint, { method: 'GET' });
          
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
      
      // المحاولة الثالثة: استخدام البيانات المخزنة سابقاً
      const fallbackCache = cacheManager.get('chats_fallback');
      if (fallbackCache) {
        console.log('🔄 Using fallback cached data');
        return {
          ...fallbackCache,
          source: 'fallback-cache',
          isFallback: true,
          error: 'الاتصال بالخادم غير متاح، استخدام البيانات المخزنة'
        };
      }
      
      // إذا فشلت كل المحاولات
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || error.message || 'فشل الاتصال بالخادم',
        source: 'failed'
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
          source: 'direct-api'
        };
      } else {
        result = {
          success: false,
          data: [],
          error: 'تنسيق البيانات غير صحيح',
          source: 'direct-api'
        };
      }
      
      if (result.success) {
        cacheManager.set(cacheKey, result, 60000); // 1 دقيقة
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ Error getting messages for chat ${chatId}:`, error.message);
      
      // محاولة CORS proxy
      if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
        try {
          const queryString = new URLSearchParams(params).toString();
          const endpoint = queryString 
            ? `/chats/${chatId}/messages?${queryString}` 
            : `/chats/${chatId}/messages`;
          
          const data = await fetchWithCorsProxy(endpoint, { method: 'GET' });
          
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
        error: error.message,
        source: 'failed'
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
          source: 'direct-api'
        };
      }
      
      return {
        success: false,
        data: [],
        error: 'تنسيق البيانات غير صحيح',
        source: 'direct-api'
      };
      
    } catch (error) {
      console.error('❌ Error getting notifications:', error.message);
      
      // محاولة CORS proxy
      if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
        try {
          const queryString = new URLSearchParams(params).toString();
          const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';
          
          const data = await fetchWithCorsProxy(endpoint, { method: 'GET' });
          
          if (data.status === "success") {
            return {
              success: true,
              data: data.notifications?.data || [],
              pagination: data.notifications?.meta || {},
              source: 'cors-proxy'
            };
          }
        } catch (proxyError) {
          console.error('❌ CORS proxy failed:', proxyError);
        }
      }
      
      return {
        success: false,
        data: [],
        error: error.message,
        source: 'failed'
      };
    }
  }

  // إرسال رسالة جديدة
 async sendMessage(chatId, messageData) {
  console.log('📤 Sending message to chat:', chatId);
  
  const payload = {
    message: messageData.message || messageData.text || messageData,
    message_type: messageData.message_type || "text",
    metadata: messageData.metadata || ["text"]
  };
  
  // جرب الطريقة التي تعمل في Development أولاً
  if (process.env.NODE_ENV === 'development') {
    try {
      const response = await this.axiosInstance.post(`/chats/${chatId}/send`, payload);
      
      if (response.data.status === "success" && response.data.message) {
        cacheManager.clear(`messages_${chatId}`);
        return {
          success: true,
          message: response.data.message,
          data: response.data
        };
      }
    } catch (error) {
      console.error('Development send error:', error);
    }
  }
  
  // في Production، استخدم fetch مع CORS proxy مباشرة
  try {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // استخدم CORS proxy مباشرة
    const apiUrl = `https://moya.talaaljazeera.com/api/v1/chats/${chatId}/send`;
    
    // جرب عدة CORS proxies
    const proxyServices = [
      `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`,
      `https://cors-anywhere.herokuapp.com/${apiUrl}`
    ];
    
    let lastError = null;
    
    for (const proxyUrl of proxyServices) {
      try {
        console.log('🔄 Trying proxy:', proxyUrl);
        
        const response = await fetch(proxyUrl, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload),
          mode: 'cors'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === "success" && data.message) {
          cacheManager.clear(`messages_${chatId}`);
          console.log('✅ Message sent via proxy');
          
          return {
            success: true,
            message: data.message,
            data: data
          };
        }
      } catch (proxyError) {
        lastError = proxyError;
        console.error('❌ Proxy failed:', proxyUrl, proxyError.message);
        continue; // جرب الـ proxy التالي
      }
    }
    
    // إذا فشلت جميع الـ proxies
    throw lastError || new Error('All proxies failed');
    
  } catch (error) {
    console.error('❌ All send attempts failed:', error);
    
    return {
      success: false,
      error: 'فشل إرسال الرسالة. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.'
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
          source: 'direct-api'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'فشل إنشاء المحادثة',
        source: 'direct-api'
      };
      
    } catch (error) {
      console.error('❌ Error creating chat:', error.message);
      
      // محاولة CORS proxy
      if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
        try {
          const data = await fetchWithCorsProxy('/chats/create', {
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
              source: 'cors-proxy'
            };
          }
        } catch (proxyError) {
          console.error('❌ CORS proxy failed:', proxyError);
        }
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        source: 'failed'
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
        source: 'direct-api'
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
          source: 'direct-api'
        };
        
        cacheManager.set(cacheKey, result, 300000); // 5 دقائق
        return result;
      }
      
      return {
        success: false,
        error: 'تنسيق البيانات غير صحيح',
        source: 'direct-api'
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
          source: 'direct-api'
        };
      }
      
      return {
        success: false,
        data: [],
        error: 'تنسيق البيانات غير صحيح',
        source: 'direct-api'
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

  // مسح جميع التخزين المؤقت
  clearCache() {
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
      console.warn('⚠️ Error clearing cache:', e);
    }
  }
}

// تصدير الخدمة
export const messageService = new MessageService();
export default messageService;