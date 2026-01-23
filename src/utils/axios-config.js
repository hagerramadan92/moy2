import axios from 'axios';

// عنوان API الأساسي من الباك إند
export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://moya.talaaljazeera.com/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': 'ar'
  }
});

// Request interceptor
api.interceptors.request.use(config => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  
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
      data: error.response?.data
    });
    
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
    
    return Promise.reject(error);
  }
);

export default api;