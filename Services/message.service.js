// services/message.service.js
import axios from 'axios';

// ==================== إعدادات أساسية ====================
const API_BASE = 'https://moya.talaaljazeera.com/api/v1';

// تحقق إذا كنا في Production أم Development
const isProduction = typeof window !== 'undefined' && 
                     !window.location.hostname.includes('localhost') && 
                     !window.location.hostname.includes('127.0.0.1');

console.log(`🌍 Environment: ${isProduction ? 'Production' : 'Development'}`);

// ==================== قائمة CORS Proxies ====================
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/'
];

// ==================== دوال مساعدة ====================
const getToken = () => {
  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      console.log('🔑 Token status:', token ? 'Exists' : 'Missing');
      return token;
    }
  } catch (e) {
    console.error('❌ Error getting token:', e);
  }
  return null;
};

// دالة لإنشاء URL مع CORS Proxy في Production
const createRequestURL = (endpoint) => {
  // في التطوير، استخدم الـ API مباشرة
  if (!isProduction) {
    return `${API_BASE}${endpoint}`;
  }
  
  // في Production، استخدم CORS Proxy
  // اختيار proxy عشوائي لتوزيع الحمل
  const randomProxy = CORS_PROXIES[Math.floor(Math.random() * CORS_PROXIES.length)];
  const apiUrl = `${API_BASE}${endpoint}`;
  
  if (randomProxy.includes('allorigins.win')) {
    return `${randomProxy}${encodeURIComponent(apiUrl)}`;
  }
  
  return `${randomProxy}${apiUrl}`;
};

// ==================== إنشاء Axios Instance ====================
const createAxiosInstance = () => {
  const instance = axios.create({
    timeout: 25000, // 25 ثانية
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
    
    // في Production، استخدم CORS Proxy URL
    if (isProduction && config.url && !config.url.includes('corsproxy.io') && 
        !config.url.includes('allorigins.win') && !config.url.includes('cors-anywhere')) {
      
      // إذا كان baseURL موجود، اجمعها مع url
      const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
      
      // إذا كان الرابط يشير إلى API الخاص بنا
      if (fullUrl.includes(API_BASE)) {
        // استخرج الـ endpoint فقط
        const endpoint = fullUrl.replace(API_BASE, '');
        config.url = createRequestURL(endpoint);
        config.baseURL = undefined; // لا نحتاج baseURL عند استخدام proxy
      }
    }
    
    // تسجيل الطلب
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url || (config.baseURL + config.url)}`);
    
    return config;
  }, (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  });

  // Response Interceptor
  instance.interceptors.response.use(
    (response) => {
      console.log(`✅ ${response.status} ${response.config.url}`);
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
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
        }, 100);
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// ==================== دالة Fetch مع Retry ====================
const fetchWithRetry = async (endpoint, options = {}, maxRetries = 3) => {
  const token = getToken();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // جرب كل proxy في كل محاولة
    for (const proxy of CORS_PROXIES) {
      try {
        const apiUrl = `${API_BASE}${endpoint}`;
        let proxyUrl;
        
        if (proxy.includes('allorigins.win')) {
          proxyUrl = `${proxy}${encodeURIComponent(apiUrl)}`;
        } else {
          proxyUrl = `${proxy}${apiUrl}`;
        }
        
        console.log(`🔄 Attempt ${attempt} with ${proxy}`);
        
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
        console.log(`✅ Success with ${proxy} (attempt ${attempt})`);
        
        return {
          data,
          status: response.status,
          proxyUsed: proxy
        };
        
      } catch (error) {
        console.warn(`❌ Failed with ${proxy} (attempt ${attempt}):`, error.message);
        // انتظر قليلاً قبل المحاولة التالية
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
  }
  
  throw new Error(`All ${maxRetries} attempts failed`);
};

// ==================== التخزين المؤقت ====================
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
      console.warn('⚠️ Cache clear all error:', e);
    }
  }
};

// ==================== الفئة الرئيسية ====================
class MessageService {
  constructor() {
    this.axiosInstance = createAxiosInstance();
  }

  // ==================== المحادثات ====================
  async getChats(params = {}) {
    console.log('📞 getChats called');
    
    const cacheKey = `chats_${JSON.stringify(params)}`;
    const cached = cacheManager.get(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached chats');
      return cached;
    }
    
    try {
      // المحاولة الأولى: axios
      const response = await this.axiosInstance.get('/chats', { params });
      
      if (response.data.status === "success" && response.data.chats) {
        const result = {
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
        
        cacheManager.set(cacheKey, result);
        return result;
      }
      
      return {
        success: false,
        data: [],
        error: 'تنسيق البيانات غير صحيح',
        source: 'axios'
      };
      
    } catch (error) {
      console.error('❌ Axios failed for getChats:', error.message);
      
      // المحاولة الثانية: fetch مع retry (فقط في Production)
      if (isProduction || error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
        try {
          const queryString = new URLSearchParams(params).toString();
          const endpoint = queryString ? `/chats?${queryString}` : '/chats';
          
          const result = await fetchWithRetry(endpoint, { method: 'GET' });
          
          if (result.data.status === "success" && result.data.chats) {
            const finalResult = {
              success: true,
              data: result.data.chats.data || [],
              pagination: {
                current_page: result.data.chats.current_page,
                total: result.data.chats.total,
                per_page: result.data.chats.per_page,
                last_page: result.data.chats.last_page
              },
              source: `fetch-${result.proxyUsed}`,
              proxyUsed: result.proxyUsed
            };
            
            cacheManager.set(cacheKey, finalResult);
            return finalResult;
          }
        } catch (fetchError) {
          console.error('❌ Fetch retry also failed:', fetchError);
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

  // ==================== الرسائل ====================
  async getMessages(chatId, params = {}) {
    console.log(`📞 getMessages for chat ${chatId}`);
    
    const cacheKey = `messages_${chatId}_${JSON.stringify(params)}`;
    const cached = cacheManager.get(cacheKey);
    
    if (cached && !params.refresh) {
      return cached;
    }
    
    try {
      const response = await this.axiosInstance.get(`/chats/${chatId}/messages`, { params });
      
      if (response.data.status === "success") {
        const result = {
          success: true,
          data: response.data.messages?.data || response.data.messages || [],
          pagination: response.data.messages?.meta || {},
          source: 'axios'
        };
        
        cacheManager.set(cacheKey, result, 60000); // 1 دقيقة
        return result;
      }
      
      return {
        success: false,
        data: [],
        error: 'تنسيق البيانات غير صحيح',
        source: 'axios'
      };
      
    } catch (error) {
      console.error(`❌ Axios failed for getMessages ${chatId}:`, error.message);
      
      // المحاولة الثانية: fetch مع retry
      if (isProduction || error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
        try {
          const queryString = new URLSearchParams(params).toString();
          const endpoint = queryString 
            ? `/chats/${chatId}/messages?${queryString}` 
            : `/chats/${chatId}/messages`;
          
          const result = await fetchWithRetry(endpoint, { method: 'GET' });
          
          if (result.data.status === "success") {
            const finalResult = {
              success: true,
              data: result.data.messages?.data || result.data.messages || [],
              pagination: result.data.messages?.meta || {},
              source: `fetch-${result.proxyUsed}`,
              proxyUsed: result.proxyUsed
            };
            
            cacheManager.set(cacheKey, finalResult, 60000);
            return finalResult;
          }
        } catch (fetchError) {
          console.error('❌ Fetch retry failed:', fetchError);
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

  // ==================== إرسال الرسائل ====================
  async sendMessage(chatId, messageData) {
    console.log(`📤 sendMessage to chat ${chatId}:`, messageData);
    
    const payload = {
      message: messageData.message || messageData.text || messageData,
      message_type: messageData.message_type || "text",
      metadata: messageData.metadata || ["text"]
    };
    
    // دالة معالجة الاستجابة
    const handleResponse = (data, source, proxyUsed = null) => {
      if (data.status === "success" && data.message) {
        // مسح ذاكرة التخزين المؤقت للرسائل
        cacheManager.clear(`messages_${chatId}`);
        
        return {
          success: true,
          message: data.message,
          data: data,
          source: source,
          ...(proxyUsed && { proxyUsed })
        };
      }
      
      return {
        success: false,
        error: data.message || 'فشل إرسال الرسالة',
        source: source,
        ...(proxyUsed && { proxyUsed })
      };
    };
    
    try {
      // المحاولة الأولى: axios
      const response = await this.axiosInstance.post(`/chats/${chatId}/send`, payload);
      return handleResponse(response.data, 'axios');
      
    } catch (error) {
      console.error(`❌ Axios failed for sendMessage ${chatId}:`, error.message);
      
      // المحاولة الثانية: fetch مع retry (خاصة في Production)
      try {
        const result = await fetchWithRetry(`/chats/${chatId}/send`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        
        return handleResponse(result.data, 'fetch', result.proxyUsed);
        
      } catch (fetchError) {
        console.error('❌ Fetch retry failed:', fetchError);
        
        // المحاولة الأخيرة: axios بدون baseURL (للمشاكل الخاصة)
        if (isProduction) {
          try {
            console.log('🔄 Last attempt: Direct axios with manual URL');
            
            const token = getToken();
            const headers = {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            };
            
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }
            
            // استخدم proxy مباشرة مع axios
            const apiUrl = `${API_BASE}/chats/${chatId}/send`;
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
            
            const lastResponse = await axios.post(proxyUrl, payload, { headers });
            return handleResponse(lastResponse.data, 'direct-axios');
            
          } catch (lastError) {
            console.error('❌ Last attempt failed:', lastError);
          }
        }
        
        return {
          success: false,
          error: 'فشل إرسال الرسالة. تحقق من اتصالك بالإنترنت.',
          source: 'failed'
        };
      }
    }
  }

  // ==================== الإشعارات ====================
  async getNotifications(params = {}) {
    console.log('📞 getNotifications called');
    
    // في Production، نتجاهل الإشعارات غير المقروءة إذا كانت تسبب مشاكل
    if (isProduction && params.read === false) {
      console.log('📭 Skipping unread notifications in production');
      return {
        success: true,
        data: [],
        source: 'skipped'
      };
    }
    
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
      console.error('❌ Failed to get notifications:', error.message);
      
      // في Production، لا نحاول fetch retry للإشعارات
      if (!isProduction) {
        try {
          const result = await fetchWithRetry('/notifications', { 
            method: 'GET' 
          }, 2); // محاولتين فقط للإشعارات
          
          if (result.data.status === "success") {
            return {
              success: true,
              data: result.data.notifications?.data || [],
              pagination: result.data.notifications?.meta || {},
              source: `fetch-${result.proxyUsed}`,
              proxyUsed: result.proxyUsed
            };
          }
        } catch (fetchError) {
          console.error('❌ Fetch retry failed for notifications:', fetchError);
        }
      }
      
      return {
        success: false,
        data: [],
        error: 'لا يمكن تحميل الإشعارات حالياً',
        source: 'failed'
      };
    }
  }

  // ==================== باقي الدوال ====================
  async createChat(participantId, type = "user_user") {
    console.log(`📞 createChat with ${participantId}`);
    
    const payload = {
      participant_id: participantId,
      type: type
    };
    
    try {
      const response = await this.axiosInstance.post('/chats/create', payload);
      
      if (response.data.status === "success") {
        // مسح ذاكرة التخزين المؤقت للمحادثات
        cacheManager.clearAll();
        
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
      console.error('❌ Failed to create chat:', error.message);
      
      if (isProduction || error.code === 'ERR_NETWORK') {
        try {
          const result = await fetchWithRetry('/chats/create', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          
          if (result.data.status === "success") {
            cacheManager.clearAll();
            
            return {
              success: true,
              chat: result.data.chat,
              data: result.data,
              source: `fetch-${result.proxyUsed}`,
              proxyUsed: result.proxyUsed
            };
          }
        } catch (fetchError) {
          console.error('❌ Fetch retry failed for createChat:', fetchError);
        }
      }
      
      return {
        success: false,
        error: 'فشل إنشاء المحادثة',
        source: 'failed'
      };
    }
  }

  async markMessageAsRead(messageId) {
    console.log(`📞 markMessageAsRead ${messageId}`);
    
    try {
      const response = await this.axiosInstance.put(`/messages/${messageId}/read`);
      return {
        success: true,
        data: response.data,
        source: 'axios'
      };
    } catch (error) {
      console.error(`❌ Failed to mark message ${messageId} as read:`, error.message);
      return {
        success: false,
        error: error.message,
        source: 'failed'
      };
    }
  }

  async getChatDetails(chatId) {
    console.log(`📞 getChatDetails ${chatId}`);
    
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
        
        cacheManager.set(cacheKey, result, 300000); // 5 دقائق
        return result;
      }
      
      return {
        success: false,
        error: 'تنسيق البيانات غير صحيح',
        source: 'axios'
      };
    } catch (error) {
      console.error(`❌ Failed to get chat details ${chatId}:`, error.message);
      return {
        success: false,
        error: error.message,
        source: 'failed'
      };
    }
  }

  async searchChats(query, params = {}) {
    console.log(`📞 searchChats for "${query}"`);
    
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
      console.error('❌ Failed to search chats:', error.message);
      return {
        success: false,
        data: [],
        error: error.message,
        source: 'failed'
      };
    }
  }

  clearCache() {
    cacheManager.clearAll();
    console.log('🧹 Cache cleared');
  }
  
  // دالة لاختبار الاتصال
  testConnection = async () => {
    console.log('🔍 Testing API connection...');
    
    try {
      const response = await this.axiosInstance.get('/chats', { params: { limit: 1 } });
      const isConnected = response.status === 200;
      console.log(`🔍 Connection test: ${isConnected ? '✅ Success' : '❌ Failed'}`);
      return isConnected;
    } catch (error) {
      console.error('🔍 Connection test failed:', error.message);
      return false;
    }
  }
}

// ==================== تصدير ====================
export const messageService = new MessageService();

// دالة لاختبار CORS Proxy
export const testProxy = async () => {
  console.log('🔍 Testing CORS proxies...');
  
  const testUrl = 'https://moya.talaaljazeera.com/api/v1/chats';
  
  for (const proxy of CORS_PROXIES) {
    try {
      let proxyUrl;
      if (proxy.includes('allorigins.win')) {
        proxyUrl = `${proxy}${encodeURIComponent(testUrl)}`;
      } else {
        proxyUrl = `${proxy}${testUrl}`;
      }
      
      console.log(`🔍 Testing: ${proxy}`);
      const response = await fetch(proxyUrl, { method: 'GET' });
      console.log(`🔍 ${proxy}: ${response.ok ? '✅ Works' : '❌ Fails'}`);
      
    } catch (error) {
      console.log(`🔍 ${proxy}: ❌ Error - ${error.message}`);
    }
  }
};

export default messageService;