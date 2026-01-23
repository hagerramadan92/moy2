import axios from 'axios';

// عنوان API الأساسي - استخدم HTTPS في الإنتاج
export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://moya.talaaljazeera.com/api/v1' 
    : 'http://moya.talaaljazeera.com/api/v1');

// تحديد ما إذا كنا في بيئة تطوير أو إنتاج
const isProduction = process.env.NODE_ENV === 'production';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // 'Accept-Language': 'ar',
    // إضافة CORS headers في الإنتاج
    ...(isProduction && {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    })
  },
  // إعدادات CORS
  withCredentials: false,
});

// Request interceptor
api.interceptors.request.use(config => {
  const requestUrl = `${config.baseURL}${config.url}`;
  console.log(`API Request: ${config.method?.toUpperCase()} ${requestUrl}`);
  
  // استخدام proxy في الإنتاج لتجنب مشاكل CORS
  if (isProduction && !requestUrl.includes('/api/proxy/')) {
    // يمكنك استخدام Next.js API routes كـ proxy
    const shouldUseProxy = requestUrl.includes(BASE_URL) && 
                          !requestUrl.includes('localhost') && 
                          !requestUrl.includes('127.0.0.1');
    
    if (shouldUseProxy) {
      // استبدل baseURL بـ /api/proxy لاستخدام Next.js API routes
      const proxyPath = requestUrl.replace(BASE_URL, '');
      config.baseURL = '';
      config.url = `/api/proxy${proxyPath}`;
      console.log(`Using proxy for request: ${config.url}`);
    }
  }
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
}, error => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  error => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      code: error.code,
      config: error.config
    });
    
    // التعامل مع أخطاء الشبكة و CORS
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.error('Network/CORS Error detected');
      
      // عرض رسالة ودية للمستخدم
      if (typeof window !== 'undefined') {
        // يمكنك عرض notification أو toast هنا
        console.warn('فشل الاتصال بالخادم. قد يكون بسبب قيود الشبكة.');
        
        // إرجاع بيانات افتراضية بدلاً من رفض الطلب
        return Promise.resolve({
          data: {
            success: false,
            message: 'فشل الاتصال بالخادم. يرجى المحاولة لاحقاً.',
            data: [],
            isFallback: true // علم بأن هذه بيانات افتراضية
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        });
      }
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        // يمكنك إعادة التوجيه للصفحة الرئيسية بدلاً من login
        window.location.href = '/';
      }
    }
    
    if (error.response?.status === 404) {
      console.warn('API endpoint not found:', error.config?.url);
    }
    
    // إرجاع خطأ محسن للمستخدم
    if (error.response) {
      // الخادم رد برسالة خطأ
      return Promise.reject({
        ...error,
        userMessage: error.response.data?.message || 'حدث خطأ في الخادم'
      });
    } else if (error.request) {
      // تم إرسال الطلب لكن لم يتم الحصول على رد
      return Promise.reject({
        ...error,
        userMessage: 'لا يوجد اتصال بالخادم'
      });
    } else {
      // خطأ في إعداد الطلب
      return Promise.reject({
        ...error,
        userMessage: 'حدث خطأ أثناء إعداد الطلب'
      });
    }
  }
);

// دالة مساعدة لاستخدام proxy في الإنتاج
export const createProxyRequest = (url, options = {}) => {
  if (isProduction && url.startsWith(BASE_URL)) {
    const proxyUrl = url.replace(BASE_URL, '/api/proxy');
    return api({
      ...options,
      url: proxyUrl,
      baseURL: ''
    });
  }
  return api(url, options);
};

// دالة لاختبار الاتصال بالخادم
export const testConnection = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return {
      connected: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    console.error('Connection test failed:', error);
    return {
      connected: false,
      error: error.message,
      code: error.code
    };
  }
};

// دالة لإنشاء طلب مع retry logic
export const createRequestWithRetry = async (config, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await api(config);
    } catch (error) {
      lastError = error;
      
      // إذا لم يكن خطأ شبكة، لا تحاول مرة أخرى
      if (error.code !== 'ERR_NETWORK' && !error.message.includes('Network Error')) {
        break;
      }
      
      // انتظر قليلاً قبل المحاولة مرة أخرى
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

export default api;