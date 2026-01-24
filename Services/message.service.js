
// services/message.service.js
import axios from 'axios';

// الحصول على التوكن من localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

// إنشاء instance لـ axios
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://moya.talaaljazeera.com/api/v1',
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
  return config;
}, (error) => {
  return Promise.reject(error);
});

// معالج الاستجابات
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
    return Promise.reject(error);
  }
);

class MessageService {
  // الحصول على قائمة الدردشات
  async getChats(params = {}) {
    try {
      
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
      return {
        success: false,
        data: [],
        error: error.message
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
      return {
        success: false,
        data: [],
        error: error.message
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
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // تحديث حالة الرسالة كمقروءة
  async markMessageAsRead(messageId) {
    try {
      const response = await axiosInstance.put(`/messages/${messageId}/read`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`❌ خطأ في تحديث حالة الرسالة ${messageId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

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
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  // الحصول على تفاصيل دردشة معينة
  async getChatDetails(chatId) {
    try {
      const response = await axiosInstance.get(`/chats/${chatId}`);
      
      if (response.data.status === "success") {
        return {
          success: true,
          data: response.data.chat
        };
      }
      
      return {
        success: false,
        error: 'تنسيق البيانات غير صحيح'
      };
    } catch (error) {
      console.error(`❌ خطأ في جلب تفاصيل الدردشة ${chatId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // البحث عن دردشات أو مستخدمين
  async searchChats(query, params = {}) {
    try {
      const response = await axiosInstance.get('/chats/search', {
        params: { query, ...params }
      });
      
      if (response.data.status === "success") {
        return {
          success: true,
          data: response.data.results || []
        };
      }
      
      return {
        success: false,
        data: [],
        error: 'تنسيق البيانات غير صحيح'
      };
    } catch (error) {
      console.error('❌ خطأ في البحث:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }
}

export const messageService = new MessageService();
export default messageService;
