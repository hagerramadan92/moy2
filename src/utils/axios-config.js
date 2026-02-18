// axios-config.js
import axios from 'axios';

// تحديد ما إذا كنا في متصفح أم في server
const isBrowser = typeof window !== 'undefined';

// Base URL للإنتاج - استخدم Next.js API routes كـ proxy
export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://dashboard.waytmiah.com/api/v1' 
    : 'https://dashboard.waytmiah.com/api/v1');

// عنوان الـ API الحقيقي
export const REAL_API_URL = 'https://dashboard.waytmiah.com/api/v1';

// دالة لبناء الـ URL الصحيح بناءً على البيئة
const getApiUrl = (path) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // في الإنتاج، استخدم Next.js API routes كـ proxy
  if (isProduction && isBrowser) {
    // استبدل http بـ https في المسارات
    const cleanPath = path.replace(/^https?:\/\//, '');
    return `/api/proxy/${cleanPath}`;
  }
  
  // في التطوير، استخدم الـ API مباشرة
  return `${REAL_API_URL}${path}`;
};

const api = axios.create({
  baseURL: '', // سنبني الـ URLs يدوياً
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor
api.interceptors.request.use(config => {
  // إضافة baseURL للـ paths النسبية
  if (!config.url.startsWith('http') && !config.url.startsWith('/api/')) {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction && isBrowser) {
      // في الإنتاج في المتصفح، استخدم proxy
      const proxyPath = config.url.startsWith('/') ? config.url.substring(1) : config.url;
      config.url = `/api/proxy/${proxyPath}`;
    } else {
      // في التطوير أو في الـ server، استخدم الـ API مباشرة
      config.url = `${REAL_API_URL}${config.url.startsWith('/') ? config.url : '/' + config.url}`;
    }
  }
  
  
  // إضافة token إذا موجود
  if (isBrowser) {
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
    return response;
  },
  error => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      code: error.code
    });
    
    return Promise.reject(error);
  }
);

export default api;