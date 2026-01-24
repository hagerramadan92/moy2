// services/message.service.js
import axios from 'axios';

// تحديد الـ base URL بناءً على البيئة
const getBaseURL = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isBrowser = typeof window !== 'undefined';
  
  // في الإنتاج والمتصفح، استخدم الـ proxy
  if (isProduction && isBrowser) {
    return '';
  }
  
  // في التطوير أو server-side، استخدم الـ API مباشرة
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://moya.talaaljazeera.com/api/v1";
};

// دالة لتحويل الـ URL إلى proxy URL في الإنتاج
const getRequestURL = (path) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isBrowser = typeof window !== 'undefined';
  
  if (isProduction && isBrowser) {
    // استخدم الـ proxy للمسارات التي تبدأ بـ /chats أو /messages
    if (path.startsWith('/chats') || path.startsWith('/messages')) {
      return `/api/proxy${path}`;
    }
  }
  
  return path;
};

const axiosInstance = axios.create({
  baseURL: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const isProduction = process.env.NODE_ENV === 'production';
  const isBrowser = typeof window !== 'undefined';
  
  // تحويل الـ URL في الإنتاج
  if (isProduction && isBrowser && config.url) {
    const originalUrl = config.url;
    config.url = getRequestURL(config.url);
    
    console.log('💬 Message Service Request:', {
      originalUrl,
      finalUrl: config.url,
      method: config.method,
      usingProxy: config.url.includes('/api/proxy/')
    });
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  console.error('💬 Message Service Request Error:', error);
  return Promise.reject(error);
});

// معالج الاستجابة
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('💬 Message Service Response:', {
      url: response.config.url,
      status: response.status,
      usingProxy: response.config.url?.includes('/api/proxy/') || false
    });
    
    return response.data;
  },
  async (error) => {
    console.error('💬 Message API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      code: error.code,
      usingProxy: error.config?.url?.includes('/api/proxy/') || false
    });
    
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // إذا كان خطأ في الـ proxy، جرب الاتصال المباشر (فقط للتطوير)
    if (error.code === 'ERR_NETWORK' && error.config?.url?.includes('/api/proxy/')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Proxy failed, trying direct connection for development...');
        // يمكن إضافة retry logic هنا
      }
    }
    
    throw error;
  }
);

class MessageService {
  async getChats() {
    try {
      console.log('📨 Fetching chats...');
      const response = await axiosInstance.get('/chats');
      
      console.log('📨 Chats response:', response);
      
      // تنسيق الـ response بناءً على الهيكل المتوقع
      if (response.status === "success" && response.chats && response.chats.data) {
        return response.chats.data;
      }
      
      if (response.status === "success" && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }
      
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
      console.error('❌ Error getting chats:', error);
      
      // Fallback للـ development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using fallback chat data for development');
        return [];
      }
      
      throw error;
    }
  }

  // الحصول على رسائل دردشة معينة
  async getMessages(chatId) {
    try {
      console.log(`💬 Fetching messages for chat ${chatId}...`);
      const response = await axiosInstance.get(`/chats/${chatId}/messages`);
    
      console.log(`💬 Messages response for chat ${chatId}:`, response);
      
      // بناءً على هيكل الرد الجديد: {status: "success", messages: {data: [...]}}
      if (response.status === "success" && response.messages && response.messages.data) {
        return response.messages.data;
      }
      
      if (response.status === "success" && response.data) {
        return Array.isArray(response.data) ? response.data : [];
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
      console.error(`❌ Error getting messages for chat ${chatId}:`, error);
      
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using fallback messages for development');
        return [];
      }
      
      throw error;
    }
  }

  // إرسال رسالة جديدة
  async sendMessage(chatId, message) {
    try {
      console.log(`📤 Sending message to chat ${chatId}:`, message);
      
      const messageText = typeof message === 'string' ? message : (message.text || message.message || message);
      
      const response = await axiosInstance.post(`/chats/${chatId}/send`, {
        message: messageText,
        message_type: "text",
        metadata: ["text"]
      });
      
      console.log(`✅ Message sent response for chat ${chatId}:`, response);
      
      let messageData = null;
      
      if (response.status === "success") {
        if (response.message) {
          messageData = response.message;
        } else if (response.data) {
          messageData = response.data;
        } else {
          messageData = response;
        }
      } else if (response.message) {
        messageData = response;
      }
      
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
      console.error(`❌ Error sending message to chat ${chatId}:`, error);
      
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }
  }

  // إرسال رسالة (اختصار)
  async sendMessageShort(chatId, messageText) {
    return this.sendMessage(chatId, messageText);
  }

  // إنشاء دردشة جديدة
  async createChat(participantId) {
    try {
      console.log(`➕ Creating chat with participant ${participantId}...`);
      
      const response = await axiosInstance.post('/chats/create', {
        participant_id: participantId,
        type: "user_driver"
      });
      
      console.log('✅ Create chat response:', response);
      
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
      console.error('❌ Error creating chat:', error);
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
      console.log(`👁️ Marking message ${messageId} as read...`);
      
      const response = await axiosInstance.post(`/messages/${messageId}/read`);
      
      return {
        success: true,
        messageId: messageId,
        data: response,
        rawResponse: response
      };
    } catch (error) {
      console.error(`❌ Error marking message ${messageId} as read:`, error);
      
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
      console.log(`👁️ Marking all messages as read for chat ${chatId}...`);
      
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
            console.error(`❌ Failed to update message ${message.id}:`, error);
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
      console.error(`❌ Error marking all messages as read for chat ${chatId}:`, error);
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
      console.log(`🗑️ Deleting message ${messageId}...`);
      
      const response = await axiosInstance.delete(`/messages/${messageId}`);
      
      return {
        success: true,
        messageId: messageId,
        data: response,
        rawResponse: response
      };
    } catch (error) {
      console.error(`❌ Error deleting message ${messageId}:`, error);
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
      console.log(`✏️ Updating message ${messageId}:`, newMessage);
      
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
      console.error(`❌ Error updating message ${messageId}:`, error);
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
      console.log(`⌨️ Sending typing indicator for chat ${chatId}:`, isTyping);
      
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
      console.error(`❌ Error sending typing indicator for chat ${chatId}:`, error);
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
      console.log(`🔍 Searching messages in chat ${chatId} for:`, query);
      
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
      console.error(`❌ Error searching messages in chat ${chatId}:`, error);
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
      console.log(`📊 Getting stats for chat ${chatId}...`);
      
      const response = await axiosInstance.get(`/chats/${chatId}/stats`);
      
      return {
        success: true,
        chatId: chatId,
        stats: response.data || response
      };
    } catch (error) {
      console.error(`❌ Error getting stats for chat ${chatId}:`, error);
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
      console.log('🔗 Testing message service connection...');
      
      // اختبار بسيط - جلب الـ chats
      const response = await axiosInstance.get('/chats');
      
      return {
        success: true,
        status: 'connected',
        data: response,
        environment: {
          isProduction: process.env.NODE_ENV === 'production',
          isBrowser: typeof window !== 'undefined'
        }
      };
    } catch (error) {
      console.error('❌ Message service connection test failed:', error);
      
      return {
        success: false,
        status: 'disconnected',
        error: error.message,
        environment: {
          isProduction: process.env.NODE_ENV === 'production',
          isBrowser: typeof window !== 'undefined'
        }
      };
    }
  }
  
  // دالة خاصة للإنتاج - محاولة استخدام الـ proxy
  async testProxyConnection() {
    if (process.env.NODE_ENV !== 'production') {
      return { success: false, message: 'Not in production mode' };
    }
    
    try {
      // محاولة الاتصال عبر الـ proxy
      const response = await axiosInstance.get('/chats');
      
      return {
        success: true,
        usingProxy: true,
        data: response
      };
    } catch (error) {
      console.error('Proxy test failed:', error);
      
      // محاولة الاتصال المباشر (فقط للـ debugging)
      if (process.env.NEXT_PUBLIC_API_BASE_URL) {
        try {
          const directResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chats`);
          return {
            success: false,
            proxyFailed: true,
            directConnected: directResponse.ok,
            error: error.message
          };
        } catch (directError) {
          return {
            success: false,
            proxyFailed: true,
            directConnected: false,
            error: error.message,
            directError: directError.message
          };
        }
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const messageService = new MessageService();

// تصدير للاستخدام المباشر
export default messageService;