// services/message.service.js
import axios from 'axios';

// تحديد ما إذا كنا في المتصفح والإنتاج
const isBrowser = typeof window !== 'undefined';
const isProduction = isBrowser && 
                     !window.location.hostname.includes('localhost') && 
                     !window.location.hostname.includes('127.0.0.1');

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

// دالة التحقق من تسجيل الدخول
const checkAuthentication = (showToast = true, context = '') => {
  const token = getToken();
  const isAuthenticated = !!token;
  
  // if (!isAuthenticated && isBrowser && showToast) {
  //   // عرض toast message
  //   let message = 'يجب تسجيل الدخول للوصول إلى هذه الميزة';
  //   if (context === 'chats') {
  //     message = 'سجل الدخول لعرض المحادثات والرسائل';
  //   }  else if (context === 'messages') {
  //     message = 'سجل الدخول لإرسال الرسائل';
  //   }
  //   showLoginToast(message, 'info');
  // }
  
  return isAuthenticated;
};

// دالة عرض toast message
const showLoginToast = (message, type = 'info', options = {}) => {
  if (!isBrowser) return;
  
  // تحقق إذا كان هناك toast مسبقاً من نفس النوع
  const existingToast = document.getElementById(`global-toast-${type}`);
  if (existingToast && !options.force) {
    return;
  }
  
  // إنشاء عنصر toast
  const toast = document.createElement('div');
  toast.id = `global-toast-${type}-${Date.now()}`;
  
  // ألوان حسب النوع
  const colors = {
    info: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    error: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    chat: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)'
  };
  
  toast.style.cssText = `
    position: fixed;
    top: ${options.position === 'top' ? '20px' : '80px'};
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    z-index: 999999;
    max-width: 400px;
    animation: slideInToast 0.3s ease-out;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    align-items: center;
    gap: 12px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  `;
  
  // أيقونة حسب النوع
  const icons = {
    info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    error: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    success: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    warning: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
    chat: 'M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z'
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
  
  // أضف أنيميشن للـ CSS إذا لم تكن موجودة
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
      #global-toast-info button:hover,
      #global-toast-error button:hover,
      #global-toast-success button:hover,
      #global-toast-warning button:hover,
      #global-toast-chat button:hover {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }
  
  // إضافة الـ toast إلى الـ body
  document.body.appendChild(toast);
  
  // زر الإغلاق
  const closeBtn = toast.querySelector('#close-global-toast');
  closeBtn.addEventListener('click', () => {
    removeToast(toast);
  });
  
  // إزالة الـ toast تلقائياً بعد المدة المحددة
  const duration = options.duration || 5000;
  setTimeout(() => {
    removeToast(toast);
  }, duration);
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

// عرض toast عند النقر على أيقونة المحادثات
const showChatsIconToast = () => {
  if (!isBrowser) return;
  
  // التحقق من تسجيل الدخول أولاً
  if (!checkAuthentication(false)) {
    showLoginToast('سجل الدخول لبدء محادثة جديدة وعرض رسائلك', 'chat', {
      position: 'top',
      duration: 6000
    });
  } else {
    // إذا كان مسجل دخول، عرض رسالة ترحيبية
    showLoginToast('مرحباً! يمكنك الآن عرض محادثاتك وبدء محادثات جديدة', 'success', {
      position: 'top',
      duration: 4000
    });
  }
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
      console.log('📤 Request:', config.method?.toUpperCase(), config.url, config.params || '');
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
        console.log('📥 Response:', response.status, response.config.url);
      }
      return response;
    },
    (error) => {
      const status = error.response?.status;
      const url = error.config?.url;
      
      
      
      // عرض toast للخطأ
      if (isBrowser) {
        let errorMessage = 'حدث خطأ أثناء الاتصال بالخادم';
        
        if (status === 401) {
          errorMessage = 'انتهت جلسة الدخول. يرجى تسجيل الدخول مرة أخرى';
          setTimeout(() => {
            localStorage.removeItem('accessToken');
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }, 100);
        } else if (status === 403) {
          errorMessage = 'ليس لديك صلاحية للوصول إلى هذا المورد';
        } else if (status === 404) {
          errorMessage = 'لم يتم العثور على المورد المطلوب';
        } else if (status === 500) {
          errorMessage = 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً';
        }
        
        if (errorMessage && !url?.includes('/login')) {
          showLoginToast(errorMessage, 'error');
        }
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
        if (!isProduction) {
          console.log('💾 Cache set:', key);
        }
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
        
        if (!isProduction) {
          console.log('💾 Cache hit:', key);
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
        if (!isProduction) {
          console.log('🗑️ Cache cleared:', key);
        }
      }
    } catch (e) {
      console.warn('⚠️ Cache clear error:', e);
    }
  },
  
  clearPattern: (pattern) => {
    try {
      if (isBrowser) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(`cache_${pattern}`)) {
            localStorage.removeItem(key);
          }
        });
        if (!isProduction) {
          console.log('🗑️ Cache pattern cleared:', pattern);
        }
      }
    } catch (e) {
      console.warn('⚠️ Cache pattern clear error:', e);
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
    // التحقق من المصادقة أولاً
    if (!checkAuthentication(true, 'chats')) {
      return {
        success: false,
        data: [],
        error: 'يجب تسجيل الدخول للوصول إلى المحادثات',
        requiresLogin: true,
        source: 'auth-check'
      };
    }
    
    const cacheKey = `chats_${JSON.stringify(params)}`;
    
    // محاولة الحصول من التخزين المؤقت
    const cached = cacheManager.get(cacheKey);
    if (cached) {
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
        
        // عرض رسالة إذا لم تكن هناك محادثات
        if (result.data.length === 0) {
          showLoginToast('لا توجد محادثات حالياً. ابدأ محادثة جديدة!', 'info', {
            position: 'top',
            duration: 4000
          });
        }
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
      
      // إرجاع بيانات من التخزين المؤقت القديم كبديل
      const cachedData = cacheManager.get('chats_fallback');
      if (cachedData) {
        return {
          ...cachedData,
          source: 'cached-fallback',
          fromCache: true
        };
      }
      
      return {
        success: false,
        data: [],
        error: 'فشل تحميل المحادثات',
        source: 'failed',
        details: error.message
      };
    }
  }

  // ==================== الحصول على الرسائل ====================
  async getMessages(chatId, params = {}) {
    // التحقق من المصادقة أولاً
    if (!checkAuthentication(true, 'messages')) {
      return {
        success: false,
        data: [],
        error: 'يجب تسجيل الدخول لعرض الرسائل',
        requiresLogin: true,
        source: 'auth-check'
      };
    }
    
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
        cacheManager.set(cacheKey, result, 60000); // 1 دقيقة للتخزين المؤقت
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ Error getting messages for chat ${chatId}:`, error.message);
      
      return {
        success: false,
        data: [],
        error: 'فشل تحميل الرسائل',
        source: 'failed',
        details: error.message
      };
    }
  }

  // ==================== الحصول على الإشعارات ====================
  async getNotifications(params = {}) {
    // التحقق من المصادقة أولاً
    if (!checkAuthentication(true, 'notifications')) {
      return {
        success: false,
        data: [],
        error: 'يجب تسجيل الدخول لعرض الإشعارات',
        requiresLogin: true,
        source: 'auth-check'
      };
    }
    
    // ⛔️ ⛔️ ⛔️ تعطيل جلب الإشعارات في Production نهائياً ⛔️ ⛔️ ⛔️
    // لأن الإشعارات لها خدمة منفصلة (NotificationContext)
    if (isProduction) {
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
    // التحقق من المصادقة أولاً
    if (!checkAuthentication(true, 'messages')) {
      return {
        success: false,
        error: 'يجب تسجيل الدخول لإرسال الرسائل',
        requiresLogin: true,
        source: 'auth-check'
      };
    }
    
    const payload = {
      message: messageData.message || messageData.text || messageData,
      message_type: messageData.message_type || "text",
      metadata: messageData.metadata || ["text"]
    };
    
    try {
      const response = await this.axiosInstance.post(`/chats/${chatId}/send`, payload);
      
      if (response.data.status === "success" && response.data.message) {
        // مسح التخزين المؤقت للرسائل
        cacheManager.clearPattern(`messages_${chatId}`);
        
        // عرض رسالة نجاح
        showLoginToast('تم إرسال الرسالة بنجاح', 'success', {
          duration: 3000
        });
        
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
      
      return {
        success: false,
        error: 'فشل إرسال الرسالة. تحقق من اتصالك بالإنترنت.',
        source: 'failed',
        details: error.message
      };
    }
  }

  // ==================== إنشاء محادثة جديدة ====================
  async createChat(participantId, type = "user_user", participantName = '') {
    // التحقق من المصادقة أولاً
    if (!checkAuthentication(true, 'chats')) {
      return {
        success: false,
        error: 'يجب تسجيل الدخول لإنشاء محادثة',
        requiresLogin: true,
        source: 'auth-check'
      };
    }
    
    try {
      const response = await this.axiosInstance.post('/chats/create', {
        participant_id: participantId,
        type: type
      });
      
      if (response.data.status === "success") {
        // مسح التخزين المؤقت للدردشات
        cacheManager.clearPattern('chats_');
        
        // عرض رسالة نجاح مع اسم المشارك
        const successMessage = participantName 
          ? `تم إنشاء محادثة مع ${participantName} بنجاح`
          : 'تم إنشاء المحادثة بنجاح';
        
        showLoginToast(successMessage, 'success', {
          duration: 4000
        });
        
        return {
          success: true,
          chat: response.data.chat,
          data: response.data,
          source: 'axios'
        };
      } else {
        // عرض رسالة خطأ من الخادم
        const errorMessage = response.data.message || 'فشل إنشاء المحادثة';
        
        // تحليل رسالة الخطأ
        let userMessage = errorMessage;
        if (errorMessage.includes('participant') || errorMessage.includes('not found')) {
          userMessage = participantName 
            ? `لم يتم العثور على المستخدم ${participantName}`
            : 'لم يتم العثور على المستخدم المطلوب';
        } else if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
          userMessage = participantName 
            ? `المحادثة مع ${participantName} موجودة بالفعل`
            : 'المحادثة موجودة بالفعل';
        }
        
        showLoginToast(userMessage, 'error', {
          duration: 5000
        });
        
        return {
          success: false,
          error: errorMessage,
          userMessage: userMessage,
          source: 'axios'
        };
      }
      
    } catch (error) {
      console.error('❌ Error creating chat:', error);
      
      // تحليل الخطأ لعرض رسالة مناسبة
      let errorMessage = 'فشل إنشاء المحادثة';
      let userMessage = errorMessage;
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        
        // تحليل رسالة الخطأ المحددة
        if (errorMessage.includes('participant') || errorMessage.includes('not found')) {
          userMessage = participantName 
            ? `لم يتم العثور على المستخدم ${participantName} (ID: ${participantId})`
            : `لم يتم العثور على المستخدم بالمعرف ${participantId}`;
        } else if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
          userMessage = participantName 
            ? `المحادثة مع ${participantName} موجودة بالفعل`
            : 'المحادثة موجودة بالفعل';
        } else if (errorMessage.includes('Invalid participant')) {
          userMessage = 'معرف المستخدم غير صحيح';
        }
      } else if (error.response?.status === 500) {
        userMessage = 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً';
      } else if (error.response?.status === 400) {
        userMessage = 'بيانات غير صحيحة. يرجى التحقق من معرف المستخدم';
      } else if (error.code === 'ERR_NETWORK') {
        userMessage = 'فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت';
      }
      
      // عرض رسالة الخطأ المناسبة للمستخدم
      showLoginToast(userMessage, 'error', {
        duration: 5000
      });
      
      return {
        success: false,
        error: errorMessage,
        userMessage: userMessage,
        source: 'failed',
        details: error.message,
        status: error.response?.status
      };
    }
  }

  // ==================== تحديد الرسالة كمقروءة ====================
  async markMessageAsRead(messageId) {
    // التحقق من المصادقة أولاً
    if (!checkAuthentication(false)) {
      return {
        success: false,
        error: 'يجب تسجيل الدخول',
        requiresLogin: true,
        source: 'auth-check'
      };
    }
    
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

  // ==================== الحصول على تفاصيل محادثة ====================
  async getChatDetails(chatId) {
    // التحقق من المصادقة أولاً
    if (!checkAuthentication(true, 'chats')) {
      return {
        success: false,
        error: 'يجب تسجيل الدخول لعرض تفاصيل المحادثة',
        requiresLogin: true,
        source: 'auth-check'
      };
    }
    
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
      console.error(`❌ Error getting chat details ${chatId}:`, error.message);
      return {
        success: false,
        error: error.message,
        source: 'failed'
      };
    }
  }

  // ==================== البحث في المحادثات ====================
  async searchChats(query, params = {}) {
    // التحقق من المصادقة أولاً
    if (!checkAuthentication(true, 'chats')) {
      return {
        success: false,
        data: [],
        error: 'يجب تسجيل الدخول للبحث في المحادثات',
        requiresLogin: true,
        source: 'auth-check'
      };
    }
    
    try {
      const response = await this.axiosInstance.get('/chats/search', {
        params: { query, ...params }
      });
      
      if (response.data.status === "success") {
        const results = response.data.results || [];
        
        // عرض رسالة إذا لم توجد نتائج
        if (results.length === 0 && query.trim()) {
          showLoginToast(`لم يتم العثور على نتائج لـ "${query}"`, 'info', {
            duration: 4000
          });
        }
        
        return {
          success: true,
          data: results,
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

  // ==================== الحصول على عدد الرسائل غير المقروءة ====================
  async getUnreadMessagesCount() {
    // التحقق من المصادقة أولاً
    if (!checkAuthentication(false)) {
      return {
        success: false,
        count: 0,
        error: 'يجب تسجيل الدخول',
        requiresLogin: true,
        source: 'auth-check'
      };
    }
    
    try {
      const response = await this.axiosInstance.get('/messages/unread-count');
      
      if (response.data.status === "success") {
        return {
          success: true,
          count: response.data.count || 0,
          source: 'axios'
        };
      }
      
      return {
        success: false,
        count: 0,
        error: 'تنسيق البيانات غير صحيح',
        source: 'axios'
      };
    } catch (error) {
      console.error('❌ Error getting unread messages count:', error.message);
      return {
        success: false,
        count: 0,
        error: error.message,
        source: 'failed'
      };
    }
  }

  // ==================== الحصول على آخر المحادثات النشطة ====================
  async getActiveChats(limit = 10) {
    return this.getChats({ limit, order_by: 'last_message_at', order: 'desc' });
  }

  // ==================== مسح التخزين المؤقت ====================
  clearCache() {
    try {
      if (isBrowser) {
        const keys = Object.keys(localStorage);
        const deletedKeys = [];
        keys.forEach(key => {
          if (key.startsWith('cache_')) {
            localStorage.removeItem(key);
            deletedKeys.push(key);
          }
        });
        if (!isProduction) {
          console.log('🗑️ Cleared cache keys:', deletedKeys.length);
        }
      }
    } catch (e) {
      console.warn('⚠️ Error clearing cache:', e);
    }
  }
  
  // دالة للتحقق من حالة تسجيل الدخول
  checkAuthStatus() {
    return checkAuthentication(false);
  }
  
  // دالة لعرض toast عند النقر على أيقونة المحادثات
  showChatIconToast() {
    showChatsIconToast();
  }
}

// ==================== تصدير الخدمة ====================
export const messageService = new MessageService();
export default messageService;