// services/message.service.js
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://moya.talaaljazeera.com/api/v1";

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
      console.log('Raw chats response:', response);
      
      // بناءً على هيكل الرد: {status: "success", chats: {data: [...]}}
      if (response.status === "success" && response.chats && response.chats.data) {
        return response.chats.data;
      }
      
      // محاولات احتياطية
      if (Array.isArray(response)) {
        return response;
      }
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      if (response?.chats && Array.isArray(response.chats)) {
        return response.chats;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting chats:', error);
      throw error;
    }
  }

  // الحصول على رسائل دردشة معينة
  async getMessages(chatId) {
    try {
      const response = await axiosInstance.get(`/chats/${chatId}/messages`);
      console.log(`Raw messages for chat ${chatId}:`, response);
      
      // بناءً على هيكل الرد الجديد: {status: "success", messages: {data: [...]}}
      if (response.status === "success" && response.messages && response.messages.data) {
        return response.messages.data;
      }
      
      // محاولات احتياطية
      if (Array.isArray(response)) {
        return response;
      }
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      if (response?.messages && Array.isArray(response.messages)) {
        return response.messages;
      }
      
      return [];
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
        metadata: ["text"]
      });
      
      console.log('Send message response:', response);
      
      // معالجة الرد
      if (response.status === "success") {
        return response.data || response.message || response;
      }
      
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
      
      if (response.status === "success") {
        return response.data || response.chat || response;
      }
      
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