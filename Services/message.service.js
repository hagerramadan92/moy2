// services/message.service.js
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://moya.talaaljazeera.com/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

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
  async getChats() {
    try {
      const response = await axiosInstance.get('/chats');
      
      
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

  // إرسال رسالة جديدة - الإصدار المحسّن
  async sendMessage(chatId, message) {
    try {
    
      
      // التحقق من نوع message (نص مباشر أو كائن)
      const messageText = typeof message === 'string' ? message : (message.text || message.message || message);
      
      const response = await axiosInstance.post(`/chats/${chatId}/send`, {
        message: messageText,
        message_type: "text",
        metadata: ["text"]
      });
      
      
      // معالجة الرد بناءً على الهيكل المتوقع
      let messageData = null;
      
      if (response.status === "success") {
        // خيار 1: response.message مباشرة
        if (response.message) {
          messageData = response.message;
        }
        // خيار 2: response.data
        else if (response.data) {
          messageData = response.data;
        }
        // خيار 3: response نفسه
        else {
          messageData = response;
        }
      } else if (response.message) {
        // إذا كان الرد يحتوي على message مباشرة
        messageData = response;
      }
      
      // إضافة بيانات إضافية إذا كانت مفقودة
      if (messageData && !messageData.chat_id) {
        messageData.chat_id = parseInt(chatId);
      }
      
      if (messageData && !messageData.created_at) {
        messageData.created_at = new Date().toISOString();
      }
      
     
      
      return {
        success: true,
        message: messageData,
        rawResponse: response
      };
      
    } catch (error) {
      console.error('❌ [Service] خطأ في إرسال الرسالة:', error);
      
      // إرجاع كائن خطأ مفصل
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }
  }

  // إرسال رسالة (اختصار للتوافق مع الكود السابق)
  async sendMessageShort(chatId, messageText) {
    return this.sendMessage(chatId, messageText);
  }

  // إنشاء دردشة جديدة
  async createChat(participantId) {
    try {
     
      
      const response = await axiosInstance.post('/chats/create', {
        participant_id: participantId,
        type: "user_driver"
      });
      
     
      
      if (response.status === "success") {
        return {
          success: true,
          chat: response.data || response.chat || response,
          rawResponse: response
        };
      }
      
      return {
        success: true,
        chat: response,
        rawResponse: response
      };
    } catch (error) {
      console.error('❌ [Service] خطأ في إنشاء الدردشة:', error);
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  // تحديث حالة الرسالة كمقروءة
  async markAsRead(messageId) {
    try {
     
      
      const response = await axiosInstance.post(`/messages/${messageId}/read`);
      
     
      
      return {
        success: true,
        messageId: messageId,
        data: response,
        rawResponse: response
      };
    } catch (error) {
      console.error(`❌ [Service] خطأ في تحديد الرسالة ${messageId} كمقروءة:`, error);
      
      return {
        success: false,
        messageId: messageId,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  // تحديث حالة قراءة جميع رسائل الدردشة
  async markAllAsRead(chatId) {
    try {
    
      
      // أولاً: جلب جميع الرسائل
      const messages = await this.getMessages(chatId);
      
      // ثانياً: تحديث كل رسالة غير مقروءة
      const results = [];
      for (const message of messages) {
        if (message.id && !message.is_read) {
          try {
            const result = await this.markAsRead(message.id);
            results.push(result);
          } catch (error) {
            console.error(`❌ فشل تحديث الرسالة ${message.id}:`, error);
          }
        }
      }
      
      return {
        success: true,
        chatId: chatId,
        updatedCount: results.length,
        results: results
      };
    } catch (error) {
      console.error(`❌ [Service] خطأ في تحديد جميع الرسائل كمقروءة للدردشة ${chatId}:`, error);
      return {
        success: false,
        chatId: chatId,
        error: error.message
      };
    }
  }

  // حذف رسالة
  async deleteMessage(messageId) {
    try {
    
      
      const response = await axiosInstance.delete(`/messages/${messageId}`);
      
     
      
      return {
        success: true,
        messageId: messageId,
        data: response,
        rawResponse: response
      };
    } catch (error) {
      console.error(`❌ [Service] خطأ في حذف الرسالة ${messageId}:`, error);
      return {
        success: false,
        messageId: messageId,
        error: error.message
      };
    }
  }

  // تحديث رسالة
  async updateMessage(messageId, newMessage) {
    try {
      
      
      const response = await axiosInstance.put(`/messages/${messageId}`, {
        message: newMessage
      });
      
     
      
      return {
        success: true,
        messageId: messageId,
        message: response.data || response,
        rawResponse: response
      };
    } catch (error) {
      console.error(`❌ [Service] خطأ في تحديث الرسالة ${messageId}:`, error);
      return {
        success: false,
        messageId: messageId,
        error: error.message
      };
    }
  }

  // إرسال إشعار الكتابة
  async sendTypingIndicator(chatId, isTyping = true) {
    try {
    
      
      const response = await axiosInstance.post(`/chats/${chatId}/typing`, {
        is_typing: isTyping
      });
      
      return {
        success: true,
        chatId: chatId,
        isTyping: isTyping,
        data: response
      };
    } catch (error) {
      console.error(`❌ [Service] خطأ في إرسال إشعار الكتابة للدردشة ${chatId}:`, error);
      return {
        success: false,
        chatId: chatId,
        error: error.message
      };
    }
  }

  // البحث في الرسائل
  async searchMessages(chatId, query) {
    try {
      
      
      const response = await axiosInstance.get(`/chats/${chatId}/messages/search`, {
        params: { q: query }
      });
      
      let messages = [];
      
      if (response.status === "success" && response.messages && response.messages.data) {
        messages = response.messages.data;
      } else if (Array.isArray(response)) {
        messages = response;
      } else if (response?.data && Array.isArray(response.data)) {
        messages = response.data;
      }
      
      return {
        success: true,
        chatId: chatId,
        query: query,
        messages: messages,
        count: messages.length
      };
    } catch (error) {
      console.error(`❌ [Service] خطأ في البحث في رسائل الدردشة ${chatId}:`, error);
      return {
        success: false,
        chatId: chatId,
        query: query,
        error: error.message,
        messages: []
      };
    }
  }

  // الحصول على إحصائيات الدردشة
  async getChatStats(chatId) {
    try {
     
      
      const response = await axiosInstance.get(`/chats/${chatId}/stats`);
      
      return {
        success: true,
        chatId: chatId,
        stats: response.data || response
      };
    } catch (error) {
      console.error(`❌ [Service] خطأ في جلب إحصائيات الدردشة ${chatId}:`, error);
      return {
        success: false,
        chatId: chatId,
        error: error.message,
        stats: {}
      };
    }
  }

  // دالة مساعدة للاختبار
  async testConnection() {
    try {
     
      
      const response = await axiosInstance.get('/health');
      
    
      
      return {
        success: true,
        status: 'connected',
        data: response
      };
    } catch (error) {
      console.error('❌ [Service] اختبار الاتصال فاشل:', error);
      
      return {
        success: false,
        status: 'disconnected',
        error: error.message
      };
    }
  }
}

export const messageService = new MessageService();

// تصدير للاستخدام المباشر
export default messageService;