// services/message.service.js
import axios from 'axios';

// دالة لإنشاء URL بناءً على البيئة
const createBaseURL = () => {
  // إذا كان هناك متغير بيئة محدد، استخدمه
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  // في Production، استخدم مسار API المحلي الذي سننشئه
  if (process.env.NODE_ENV === 'production') {
    return '/api/proxy'; // سيتم توجيه هذا إلى Vercel Proxy
  }
  
  // في التطوير، استخدم الخادم المباشر
  return 'https://moya.talaaljazeera.com/api/v1';
};

// الحصول على التوكن من localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

// إنشاء instance لـ axios
const axiosInstance = axios.create({
  baseURL: createBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // 'Accept-Language': 'ar',
  }
});

// إضافة interceptor لإضافة التوكن تلقائياً
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // إضافة header للطلبات عبر Proxy
  if (process.env.NODE_ENV === 'production' && config.baseURL === '/api/proxy') {
    // يمكن إضافة headers إضافية إذا لزم الأمر
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// معالج الاستجابات - إضافة معالجة لأخطاء CORS
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // إذا كان التوكن منتهي الصلاحية
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    
    // معالجة أخطاء CORS بشكل خاص
    if (error.code === 'ERR_NETWORK' || 
        error.message?.includes('CORS') || 
        error.message?.includes('Network Error')) {
      console.warn('⚠️ خطأ في الشبكة أو CORS، جرب بديل API');
      
      // محاولة الاستخدام المباشر في حالة فشل Proxy
      if (process.env.NODE_ENV === 'production') {
        error.isCorsError = true;
        error.suggestedFix = 'تحقق من إعدادات Proxy أو استخدم API مباشرة';
      }
    }
    
    return Promise.reject(error);
  }
);

// بديل لـ axios يستخدم fetch مباشرة مع معالجة CORS
const fetchWithCorsFallback = async (url, options = {}) => {
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
    
    // استخدام CORS Anywhere كبديل في Production
    if (process.env.NODE_ENV === 'production') {
      // محاولة استخدام Proxy مجاني إذا فشل الاتصال المباشر
      const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      
      const response = await fetch(corsProxyUrl, {
        ...options,
        headers,
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    }
    
    // في التطوير، استخدم fetch مباشرة
    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ خطأ في fetchWithCorsFallback:', error);
    throw error;
  }
};

class MessageService {
  // الحصول على قائمة الدردشات مع معالجة CORS
  async getChats(params = {}) {
    try {
      // محاولة استخدام axios أولاً
      const response = await axiosInstance.get('/chats', { params });
      
      if (response.data.status === "success" && response.data.chats) {
        return {
          success: true,
          data: response.data.chats.data || [],
          pagination: {
            current_page: response.data.chats.current_page,
            total: response.data.chats.total,
            per_page: response.data.chats.per_page,
            last_page: response.data.chats.last_page
          }
        };
      }
      
      return {
        success: false,
        data: [],
        error: 'تنسيق البيانات غير صحيح'
      };
      
    } catch (error) {
      console.error('❌ خطأ في جلب المحادثات:', error);
      
      // إذا كان خطأ CORS، جرب البديل
      if (error.isCorsError || error.code === 'ERR_NETWORK') {
        console.log('🔄 محاولة استخدام CORS fallback...');
        try {
          // استخدام fetch مع CORS proxy
          const directUrl = 'https://moya.talaaljazeera.com/api/v1/chats';
          const data = await fetchWithCorsFallback(directUrl, {
            method: 'GET'
          });
          
          if (data.status === "success" && data.chats) {
            return {
              success: true,
              data: data.chats.data || [],
              pagination: {
                current_page: data.chats.current_page,
                total: data.chats.total,
                per_page: data.chats.per_page,
                last_page: data.chats.last_page
              }
            };
          }
        } catch (fallbackError) {
          console.error('❌ فشل CORS fallback:', fallbackError);
        }
      }
      
      // في حالة عدم وجود اتصال، حاول استخدام البيانات المخزنة محلياً
      if (typeof window !== 'undefined') {
        try {
          const storedChats = localStorage.getItem('chats_cache');
          const storedTime = localStorage.getItem('chats_cache_time');
          
          // إذا كانت البيانات مخزنة لأقل من 5 دقائق، استخدمها
          if (storedChats && storedTime) {
            const cacheTime = new Date(storedTime).getTime();
            const currentTime = new Date().getTime();
            const fiveMinutes = 5 * 60 * 1000;
            
            if (currentTime - cacheTime < fiveMinutes) {
              console.log('📦 استخدام البيانات المخزنة مؤقتاً');
              const parsedChats = JSON.parse(storedChats);
              return {
                success: true,
                data: parsedChats,
                fromCache: true,
                error: 'الاتصال بالخادم غير متاح، استخدام البيانات المخزنة'
              };
            }
          }
        } catch (cacheError) {
          console.error('❌ خطأ في قراءة البيانات المخزنة:', cacheError);
        }
      }
      
      return {
        success: false,
        data: [],
        error: error.message || 'فشل الاتصال بالخادم'
      };
    }
  }

  // الحصول على رسائل دردشة معينة
  async getMessages(chatId, params = {}) {
    try {
      const response = await axiosInstance.get(`/chats/${chatId}/messages`, { params });
      
      if (response.data.status === "success") {
        return {
          success: true,
          data: response.data.messages?.data || response.data.messages || [],
          pagination: response.data.messages?.meta || {}
        };
      }
      
      return {
        success: false,
        data: [],
        error: 'تنسيق البيانات غير صحيح'
      };
      
    } catch (error) {
      console.error(`❌ خطأ في جلب رسائل الدردشة ${chatId}:`, error);
      
      // معالجة CORS لهذا الطلب أيضاً
      if (error.isCorsError || error.code === 'ERR_NETWORK') {
        console.log(`🔄 محاولة CORS fallback للرسائل ${chatId}...`);
        try {
          const directUrl = `https://moya.talaaljazeera.com/api/v1/chats/${chatId}/messages`;
          const data = await fetchWithCorsFallback(directUrl, {
            method: 'GET'
          });
          
          if (data.status === "success") {
            return {
              success: true,
              data: data.messages?.data || data.messages || [],
              pagination: data.messages?.meta || {}
            };
          }
        } catch (fallbackError) {
          console.error('❌ فشل CORS fallback للرسائل:', fallbackError);
        }
      }
      
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  // باقي الوظائف بنفس الطريقة ولكن مع إضافة معالجة CORS...

  // الحصول على الإشعارات
  async getNotifications(params = {}) {
    try {
      const response = await axiosInstance.get('/notifications', { params });
      
      if (response.data.status === "success") {
        return {
          success: true,
          data: response.data.notifications?.data || [],
          pagination: response.data.notifications?.meta || {}
        };
      }
      
      return {
        success: false,
        data: [],
        error: 'تنسيق البيانات غير صحيح'
      };
    } catch (error) {
      console.error('❌ خطأ في جلب الإشعارات:', error);
      
      // معالجة CORS للإشعارات
      if (error.isCorsError || error.code === 'ERR_NETWORK') {
        console.log('🔄 محاولة CORS fallback للإشعارات...');
        // يمكن إضافة fallback للإشعارات هنا
      }
      
      return {
        success: false,
        data: [],
        error: error.message || 'فشل الاتصال بالخادم'
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
      
      const response = await axiosInstance.post(`/chats/${chatId}/send`, payload);
      
      if (response.data.status === "success" && response.data.message) {
        return {
          success: true,
          message: response.data.message,
          data: response.data
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'فشل إرسال الرسالة'
      };
      
    } catch (error) {
      console.error(`❌ خطأ في إرسال الرسالة للدردشة ${chatId}:`, error);
      
      // معالجة CORS لإرسال الرسائل
      if (error.isCorsError || error.code === 'ERR_NETWORK') {
        console.log(`🔄 محاولة CORS fallback لإرسال الرسالة...`);
        try {
          const directUrl = `https://moya.talaaljazeera.com/api/v1/chats/${chatId}/send`;
          const data = await fetchWithCorsFallback(directUrl, {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          
          if (data.status === "success" && data.message) {
            return {
              success: true,
              message: data.message,
              data: data
            };
          }
        } catch (fallbackError) {
          console.error('❌ فشل CORS fallback لإرسال الرسالة:', fallbackError);
        }
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // إنشاء دردشة جديدة
  async createChat(participantId, type = "user_user") {
    try {
      const response = await axiosInstance.post('/chats/create', {
        participant_id: participantId,
        type: type
      });
      
      if (response.data.status === "success") {
        return {
          success: true,
          chat: response.data.chat,
          data: response.data
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'فشل إنشاء المحادثة'
      };
      
    } catch (error) {
      console.error('❌ خطأ في إنشاء الدردشة:', error);
      
      // معالجة CORS لإنشاء الدردشة
      if (error.isCorsError || error.code === 'ERR_NETWORK') {
        console.log('🔄 محاولة CORS fallback لإنشاء الدردشة...');
        try {
          const directUrl = 'https://moya.talaaljazeera.com/api/v1/chats/create';
          const data = await fetchWithCorsFallback(directUrl, {
            method: 'POST',
            body: JSON.stringify({
              participant_id: participantId,
              type: type
            })
          });
          
          if (data.status === "success") {
            return {
              success: true,
              chat: data.chat,
              data: data
            };
          }
        } catch (fallbackError) {
          console.error('❌ فشل CORS fallback لإنشاء الدردشة:', fallbackError);
        }
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // باقي الوظائف (markMessageAsRead, getChatDetails, searchChats) تبقى كما هي
  // مع إمكانية إضافة معالجة CORS مشابهة إذا لزم الأمر

  // ... باقي الكود كما هو ...

}

// وظيفة لتهيئة التخزين المؤقت
export const initializeCache = () => {
  if (typeof window !== 'undefined') {
    // تهيئة التخزين المؤقت إذا لم يكن موجوداً
    if (!localStorage.getItem('chats_cache')) {
      localStorage.setItem('chats_cache', '[]');
      localStorage.setItem('chats_cache_time', new Date().toISOString());
    }
  }
};

// تحديث التخزين المؤقت
export const updateChatsCache = (chats) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('chats_cache', JSON.stringify(chats));
      localStorage.setItem('chats_cache_time', new Date().toISOString());
    } catch (error) {
      console.error('❌ خطأ في تحديث التخزين المؤقت:', error);
    }
  }
};

export const messageService = new MessageService();
export default messageService;