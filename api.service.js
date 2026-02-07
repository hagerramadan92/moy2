// services/message.service.js
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://moya.talaaljazeera.com/api/v1";

// إنشاء مثيل axios بنفس إعدادات الـ auth
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// معالج الطلب لإضافة التوكن
axiosInstance.interceptors.request.use((config) => {
  // احصل على الرمز من localStorage (نفس طريقة auth)
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// معالج الاستجابة
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    console.error('Message API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      // مسح التوكن إذا كان غير صالح
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    throw error;
  }
);

class MessageService {
  // الحصول على جميع الدردشات
  async getChats() {
    try {
      const response = await axiosInstance.get('/chats');
      
      // معالجة الاستجابة بنفس طريقة auth
      if (response?.status === true) {
        return response.data || [];
      }
      
      return response?.chats || response?.data || [];
    } catch (error) {
      console.error('Error getting chats:', error);
      throw error;
    }
  }

  // الحصول على رسائل دردشة معينة
  async getMessages(chatId) {
    try {
      const response = await axiosInstance.get(`/chats/${chatId}/messages`);
      
      if (response?.status === true) {
        return response.data || [];
      }
      
      return response?.messages || response?.data || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  // إرسال رسالة جديدة
  async sendMessage(chatId, message) {
    try {
      const response = await axiosInstance.post(`/chats/${chatId}/send`, {
        message: message.text,
        message_type: "text",
        metadata: "text"
      });
      
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // إنشاء دردشة جديدة
  async createChat(participantId) {
    try {
      const response = await axiosInstance.post('/chats/create', {
        participant_id: participantId,
        type: "user_user"
      });
      
      return response;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  // تحديث حالة الرسالة
  async markAsRead(messageId) {
    try {
      const response = await axiosInstance.post(`/messages/${messageId}/read`);
      return response;
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  }
}

export const messageService = new MessageService();