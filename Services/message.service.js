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
    // استخدم الـ proxy للمسارات التي تبدأ بـ /chats أو /messages أو /notifications
    if (path.startsWith('/chats') || path.startsWith('/messages') || path.startsWith('/notifications')) {
      return `/api/proxy${path}`;
    }
  }
  
  return path;
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
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
    const proxyUrl = getRequestURL(config.url);
    
    // إذا كان الـ URL مختلف، غيره
    if (proxyUrl !== config.url) {
      config.url = proxyUrl;
      // إذا استخدمنا proxy، إزالة الـ baseURL
      if (proxyUrl.startsWith('/api/proxy')) {
        config.baseURL = '';
      }
    }
    
    console.log('📱 API Request:', {
      originalUrl: originalUrl,
      finalUrl: config.baseURL ? `${config.baseURL}${config.url}` : config.url,
      method: config.method,
      usingProxy: config.url?.includes('/api/proxy/') || false
    });
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  console.error('📱 API Request Error:', error);
  return Promise.reject(error);
});

// معالج الاستجابة
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      usingProxy: response.config.url?.includes('/api/proxy/') || false
    });
    
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      code: error.code,
      usingProxy: error.config?.url?.includes('/api/proxy/') || false,
      responseData: error.response?.data
    });
    
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
  // جلب الإشعارات (الملف الأصلي فيه getChats لكن الصحيح getNotifications)
  async getNotifications(params = {}) {
    try {
      console.log('🔔 Fetching notifications...');
      const response = await axiosInstance.get('/notifications', { params });
      
      console.log('🔔 Notifications raw response:', response.data);
      
      // معالجة الـ response
      const result = response.data;
      
      // تحقق من تنسيق الـ response وعدّل له
      if (result && typeof result === 'object') {
        // الحالة 1: {status: true, message: "...", data: [...]}
        if (result.status !== undefined && result.data !== undefined) {
          return {
            status: result.status,
            message: result.message || 'تم جلب الإشعارات بنجاح',
            data: Array.isArray(result.data) ? result.data : []
          };
        }
        
        // الحالة 2: {success: true, data: [...]}
        if (result.success !== undefined && result.data !== undefined) {
          return {
            status: result.success,
            message: result.message || 'تم جلب الإشعارات بنجاح',
            data: Array.isArray(result.data) ? result.data : []
          };
        }
        
        // الحالة 3: {data: [...]} مباشرة
        if (result.data && Array.isArray(result.data)) {
          return {
            status: true,
            message: 'تم جلب الإشعارات بنجاح',
            data: result.data
          };
        }
        
        // الحالة 4: مصفوفة مباشرة
        if (Array.isArray(result)) {
          return {
            status: true,
            message: 'تم جلب الإشعارات بنجاح',
            data: result
          };
        }
      }
      
      // إذا كان الـ response غير معروف، رجع مصفوفة فارغة
      return {
        status: false,
        message: 'تنسيق البيانات غير معروف',
        data: []
      };
      
    } catch (error) {
      console.error('❌ Error getting notifications:', error);
      
      // Fallback للـ development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using fallback notifications data for development');
        return {
          status: true,
          message: 'تطوير: بيانات افتراضية',
          data: [
            {
              id: 1,
              title: 'ترحيب',
              message: 'مرحباً بك في تطبيق مويا',
              type: 'info',
              is_read: false,
              created_at: new Date().toISOString(),
              data: {}
            },
            {
              id: 2,
              title: 'طلب جديد',
              message: 'تم استلام طلبك رقم 12345',
              type: 'success',
              is_read: true,
              created_at: new Date(Date.now() - 3600000).toISOString(), // قبل ساعة
              data: { order_id: 12345 }
            }
          ]
        };
      }
      
      // في الإنتاج، أرجِع error
      throw error;
    }
  }

  // الاحتفاظ بـ getChats للتوافق مع الكود القديم (لكن يرجع بيانات افتراضية)
  async getChats() {
    console.warn('⚠️ getChats() is deprecated, use getNotifications() instead');
    return this.getNotifications();
  }

  // الحصول على رسائل دردشة معينة
  async getMessages(chatId) {
    try {
      console.log(`💬 Fetching messages for chat ${chatId}...`);
      const response = await axiosInstance.get(`/chats/${chatId}/messages`);
    
      console.log(`💬 Messages response for chat ${chatId}:`, response.data);
      
      const result = response.data;
      
      // بناءً على هيكل الرد الجديد: {status: "success", messages: {data: [...]}}
      if (result.status === "success" && result.messages && result.messages.data) {
        return result.messages.data;
      }
      
      if (result.status === "success" && result.data) {
        return Array.isArray(result.data) ? result.data : [];
      }
      
      // محاولات احتياطية
      if (Array.isArray(result)) {
        return result;
      }
      
      if (result?.data && Array.isArray(result.data)) {
        return result.data;
      }
      
      if (result?.messages && Array.isArray(result.messages)) {
        return result.messages;
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
      
      console.log(`✅ Message sent response for chat ${chatId}:`, response.data);
      
      const result = response.data;
      let messageData = null;
      
      if (result.status === "success") {
        if (result.message) {
          messageData = result.message;
        } else if (result.data) {
          messageData = result.data;
        } else {
          messageData = result;
        }
      } else if (result.message) {
        messageData = result;
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
        rawResponse: result
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
      
      console.log('✅ Create chat response:', response.data);
      
      const result = response.data;
      
      if (result.status === "success") {
        return {
          success: true,
          chat: result.data || result.chat || result,
          rawResponse: result
        };
      }
      
      return {
        success: true,
        chat: result,
        rawResponse: result
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
        data: response.data,
        rawResponse: response.data
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

  // تحديد الإشعار كمقروء (دالة جديدة)
  async markNotificationAsRead(notificationId) {
    try {
      console.log(`👁️ Marking notification ${notificationId} as read...`);
      
      const response = await axiosInstance.post(`/notifications/${notificationId}/read`);
      
      console.log(`✅ Notification marked as read:`, response.data);
      
      return {
        success: true,
        notificationId: notificationId,
        data: response.data,
        rawResponse: response.data
      };
    } catch (error) {
      console.error(`❌ Error marking notification ${notificationId} as read:`, error);
      
      return {
        success: false,
        notificationId: notificationId,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  // حذف إشعار (دالة جديدة)
  async deleteNotification(notificationId) {
    try {
      console.log(`🗑️ Deleting notification ${notificationId}...`);
      
      const response = await axiosInstance.delete(`/notifications/${notificationId}`);
      
      console.log(`✅ Notification deleted:`, response.data);
      
      return {
        success: true,
        notificationId: notificationId,
        data: response.data,
        rawResponse: response.data
      };
    } catch (error) {
      console.error(`❌ Error deleting notification ${notificationId}:`, error);
      return {
        success: false,
        notificationId: notificationId,
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
        data: response.data,
        rawResponse: response.data
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
        message: response.data || response.data,
        rawResponse: response.data
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
        data: response.data
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
      
      const result = response.data;
      let messages = [];
      
      if (result.status === "success" && result.messages && result.messages.data) {
        messages = result.messages.data;
      } else if (Array.isArray(result)) {
        messages = result;
      } else if (result?.data && Array.isArray(result.data)) {
        messages = result.data;
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
        stats: response.data || response.data
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

  // اختبار الاتصال
  async testConnection() {
    try {
      console.log('🔗 Testing API connection...');
      
      // اختبار بسيط - جلب الإشعارات
      const response = await axiosInstance.get('/notifications');
      
      return {
        success: true,
        status: 'connected',
        data: response.data,
        environment: {
          isProduction: process.env.NODE_ENV === 'production',
          isBrowser: typeof window !== 'undefined'
        }
      };
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      
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
      const response = await axiosInstance.get('/notifications');
      
      return {
        success: true,
        usingProxy: true,
        data: response.data
      };
    } catch (error) {
      console.error('Proxy test failed:', error);
      
      // محاولة الاتصال المباشر (فقط للـ debugging)
      if (process.env.NEXT_PUBLIC_API_BASE_URL) {
        try {
          const directResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications`);
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