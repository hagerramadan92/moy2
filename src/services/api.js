import axios from 'axios';

// عنوان API الخاص بك
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ;

// إنشاء نسخة axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // 'Accept-Language': 'ar',
    // 'X-Requested-With': 'XMLHttpRequest'
  }
});

// إضافة التوكن للمصادقة
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken') || 
                  sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// معالجة الأخطاء
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // إعادة توجيه لصفحة تسجيل الدخول
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// تسجيل جهاز جديد
export const registerDevice = async (fcmToken) => {
  try {
    const deviceInfo = {
      token: fcmToken,
      device_type: navigator.userAgent.match(/Android/i) ? 'android' : 
                  navigator.userAgent.match(/iPhone|iPad|iPod/i) ? 'ios' : 'web',
      device_name: navigator.userAgent,
      app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
    };

    const response = await api.post('/notifications/register-device', deviceInfo);
    return response;
  } catch (error) {
    console.error('خطأ في تسجيل الجهاز:', error);
    throw error;
  }
};

// جلب الإشعارات
export const fetchNotifications = async (page = 1, perPage = 15) => {
  try {
    const response = await api.get('/notifications', {
      params: { page, per_page: perPage }
    });
    return response;
  } catch (error) {
    console.error('خطأ في جلب الإشعارات:', error);
    throw error;
  }
};

// تعليم جميع الإشعارات كمقروءة
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.post('/notifications/mark-all-read');
    return response;
  } catch (error) {
    console.error('خطأ في تعليم الإشعارات كمقروءة:', error);
    throw error;
  }
};

// حذف إشعار محدد
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response;
  } catch (error) {
    console.error('خطأ في حذف الإشعار:', error);
    throw error;
  }
};

// مسح جميع الإشعارات
export const clearAllNotifications = async () => {
  try {
    const response = await api.delete('/notifications/clear-all');
    return response;
  } catch (error) {
    console.error('خطأ في مسح الإشعارات:', error);
    throw error;
  }
};

// تحديث حالة قراءة الإشعار
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response;
  } catch (error) {
    console.error('خطأ في تحديث حالة القراءة:', error);
    throw error;
  }
};

export default api;