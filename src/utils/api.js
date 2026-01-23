// api.js
import api, { REAL_API_URL } from './axios-config';

// وظائف API الخاصة بالمياه مع دعم Proxy
export const waterApi = {
  // جلب أنواع المياه
  async getWaterTypes() {
    try {
      console.log('Fetching water types from API');
      const response = await api.get('/type-water');
      console.log('Water types response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching water types:', error);
      
      // إرجاع بيانات افتراضية في حالة الخطأ
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'فشل في جلب أنواع المياه',
        data: [
          { id: 1, name: 'مياه عادية', value: 'regular', description: 'مياه شرب عادية' },
          { id: 2, name: 'مياه معدنية', value: 'mineral', description: 'مياه غنية بالمعادن' },
          { id: 3, name: 'مياه قلوية', value: 'alkaline', description: 'مياه قلوية متوازنة' }
        ]
      };
    }
  },

  // جلب أحجام / خدمات المياه - مع دعم Proxy
  async getWaterServices() {
    try {
      console.log('🔄 Fetching water services...');
      
      const response = await api.get('/services');
      
      console.log('✅ Water services response:', {
        success: response.data.status,
        count: response.data.data?.length || 0,
        message: response.data.message
      });
      
      // التأكد من تنسيق الـ response
      const result = response.data;
      
      // إذا كان الـ response به data مباشرة
      if (result.data !== undefined) {
        return {
          status: result.status !== undefined ? result.status : true,
          message: result.message || 'تم جلب الخدمات بنجاح',
          data: Array.isArray(result.data) ? result.data : []
        };
      }
      
      // إذا كان الـ response مصفوفة مباشرة
      if (Array.isArray(result)) {
        return {
          status: true,
          message: 'تم جلب الخدمات بنجاح',
          data: result
        };
      }
      
      // إرجاع كما هو مع ضمان وجود الحقول المطلوبة
      return {
        status: result.status !== undefined ? result.status : true,
        message: result.message || 'تم جلب الخدمات بنجاح',
        data: Array.isArray(result) ? result : []
      };
      
    } catch (error) {
      console.error('❌ Error fetching water services:', error);
      
      // إرجاع بيانات افتراضية في حالة الخطأ
      return {
        status: false,
        message: error.response?.data?.message || error.message || 'فشل في جلب الخدمات',
        data: [
          { 
            id: 1, 
            name: '6 طن',
            image_url: 'https://i.ibb.co/HfQygsxR/Whats-App-Image-2025-12-25-at-12-09-56-AM.jpg',
            is_active: 1,
            start_price: 'يبدا من 30',
            title: 'افضل سعر'
          },
          { 
            id: 2, 
            name: '8 طن',
            image_url: 'https://i.ibb.co/HfQygsxR/Whats-App-Image-2025-12-25-at-12-09-56-AM.jpg',
            is_active: 1,
            start_price: 'يبدا من 30',
            title: 'افضل سعر'
          },
          { 
            id: 3, 
            name: '16 طن',
            image_url: 'https://i.ibb.co/HfQygsxR/Whats-App-Image-2025-12-25-at-12-09-56-AM.jpg',
            is_active: 1,
            start_price: 'يبدا من 30',
            title: 'افضل سعر'
          },
          { 
            id: 4, 
            name: '3 طن',
            image_url: 'https://i.ibb.co/HfQygsxR/Whats-App-Image-2025-12-25-at-12-09-56-AM.jpg',
            is_active: 1,
            start_price: 'يبدا من 30',
            title: 'افضل سعر'
          }
        ]
      };
    }
  },

  // جلب العروض الخاصة (إذا كانت متوفرة)
  async getWaterOffers() {
    try {
      const response = await api.get('/offers');
      return response.data;
    } catch (error) {
      console.error('Error fetching water offers:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        data: []
      };
    }
  }
};

// وظائف API الخاصة بالمحفظة
export const walletApi = {
  // الحصول على رصيد المحفظة
  async getWalletBalance() {
    try {
      const response = await api.get('/user/wallet');
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  },

  // الحصول على المعاملات
  async getTransactions(page = 1, limit = 10, type = 'all') {
    try {
      let url = `/user/wallet/transactions?page=${page}&limit=${limit}`;
      if (type !== 'all') {
        url += `&type=${type}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // الحصول على المعاملات مع فلترة متقدمة
  async getFilteredTransactions(
    page = 1, 
    limit = 10, 
    type = 'all', 
    status = 'all', 
    search = '', 
    startDate = '', 
    endDate = ''
  ) {
    try {
      let url = `/user/wallet/transactions?page=${page}&limit=${limit}`;
      
      const params = new URLSearchParams();
      
      if (type && type !== 'all') params.append('type', type);
      if (status && status !== 'all') params.append('status', status);
      if (search) params.append('search', search);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      if (params.toString()) {
        url += `&${params.toString()}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered transactions:', error);
      throw error;
    }
  },

  // إضافة أموال
  async depositMoney(amount, payment_method) {
    try {
      const response = await api.post('/user/wallet/deposit', {
        amount: parseFloat(amount),
        payment_method
      });
      return response.data;
    } catch (error) {
      console.error('Error depositing money:', error);
      throw error;
    }
  },

  // الحصول على طرق الدفع
  async getPaymentMethods() {
    try {
      const response = await api.get('/payment-methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  // تصدير كشف الحساب
  async exportStatement(startDate, endDate, format = 'pdf') {
    try {
      const response = await api.get(
        `/user/wallet/statement?start_date=${startDate}&end_date=${endDate}&format=${format}`,
        {
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting statement:', error);
      throw error;
    }
  },

  // الحصول على تفاصيل معاملة محددة
  async getTransactionDetails(transactionId) {
    try {
      const response = await api.get(`/user/wallet/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      throw error;
    }
  },

  // الحصول على إحصائيات المعاملات
  async getTransactionStats(startDate = '', endDate = '') {
    try {
      let url = '/user/wallet/transactions/stats';
      const params = new URLSearchParams();
      
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw error;
    }
  }
};

// وظائف API عامة
export const generalApi = {
  // جلب بيانات الصفحة الرئيسية
  async getHomePageData() {
    try {
      const response = await api.get('/pages/home');
      return response.data;
    } catch (error) {
      console.error('Error fetching home page data:', error);
      // إرجاع بيانات افتراضية للصفحة الرئيسية
      return {
        success: true,
        data: {
          sections: [
            { id: 1, type: 'hero', order: 1, title: 'مرحباً بكم في مويا' },
            { id: 2, type: 'features', order: 2, title: 'لماذا تختارنا' },
            { id: 3, type: 'packages', order: 3, title: 'باقاتنا المميزة' },
            { id: 4, type: 'steps', order: 4, title: 'كيف نعمل' },
            { id: 5, type: 'testimonials', order: 5, title: 'آراء عملائنا' }
          ]
        }
      };
    }
  },

  // جلب العروض
  async getDeals() {
    try {
      const response = await api.get('/deals');
      return response.data;
    } catch (error) {
      console.error('Error fetching deals:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        data: []
      };
    }
  },

  // جلب التقييمات
  async getReviews() {
    try {
      const response = await api.get('/reviews');
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        data: []
      };
    }
  },

  // جلب خطوات العمل
  async getHowItWorks() {
    try {
      const response = await api.get('/how-it-works');
      return response.data;
    } catch (error) {
      console.error('Error fetching how it works:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        data: []
      };
    }
  },

  // جلب الموقع الحالي (إذا كان هناك API للمواقع)
  async getLocations() {
    try {
      const response = await api.get('/locations');
      return response.data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        data: []
      };
    }
  }
};

// وظائف API الخاصة بالمستخدم
export const userApi = {
  // تسجيل الدخول
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // التسجيل
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  },

  // الحصول على بيانات المستخدم
  async getUserProfile() {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // تحديث بيانات المستخدم
  async updateUserProfile(userData) {
    try {
      const response = await api.put('/user/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // تحديث كلمة المرور
  async updatePassword(currentPassword, newPassword) {
    try {
      const response = await api.put('/user/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },

  // نسيان كلمة المرور
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Error in forgot password:', error);
      throw error;
    }
  },

  // إعادة تعيين كلمة المرور
  async resetPassword(token, email, password, password_confirmation) {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        email,
        password,
        password_confirmation
      });
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
};

// وظائف API للطلبات
export const ordersApi = {
  // إنشاء طلب جديد
  async createOrder(orderData) {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // جلب طلبات المستخدم
  async getUserOrders(page = 1, limit = 10, status = '') {
    try {
      let url = `/user/orders?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  // جلب تفاصيل طلب معين
  async getOrderDetails(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  },

  // تحديث حالة الطلب
  async updateOrderStatus(orderId, status) {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // إلغاء الطلب
  async cancelOrder(orderId) {
    try {
      const response = await api.delete(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  }
};

// دالة مساعدة لمعالجة الأخطاء
export const handleApiError = (error, defaultMessage = 'حدث خطأ أثناء العملية') => {
  console.error('API Error Details:', error);
  
  if (error.response) {
    // الخادم رد برسالة خطأ
    const errorData = error.response.data;
    return {
      status: false,
      message: errorData?.message || errorData?.error || defaultMessage,
      code: error.response.status,
      data: errorData
    };
  } else if (error.request) {
    // تم إرسال الطلب لكن لم يتم الحصول على رد
    return {
      status: false,
      message: 'لا يوجد اتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت',
      code: 0
    };
  } else {
    // خطأ في إعداد الطلب
    return {
      status: false,
      message: error.message || defaultMessage,
      code: -1
    };
  }
};

// دالة للتحقق من صحة الرصيد
export const validateBalance = (walletData, amount) => {
  if (!walletData) return false;
  
  const dailyLimit = parseFloat(walletData.daily_limit || 0);
  const usedToday = parseFloat(walletData.total_deposits_today || 0) + parseFloat(walletData.total_withdrawals_today || 0);
  const remaining = dailyLimit - usedToday;
  
  return parseFloat(amount) <= remaining;
};

// دالة لتحميل الملف
export const downloadFile = (blob, fileName) => {
  if (typeof window === 'undefined') return;
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// دالة لتنسيق التاريخ
export const formatDate = (dateString, format = 'ar-SA') => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleDateString(format, { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// دالة لتنسيق العملة
export const formatCurrency = (amount, currency = 'SAR') => {
  const numAmount = parseFloat(amount || 0);
  return numAmount.toLocaleString('ar-SA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// دالة للتحقق من صلاحية الـ Token
export const checkAuthToken = () => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('accessToken');
  if (!token) return false;
  
  // يمكنك إضافة تحقق إضافي من صلاحية الـ token هنا
  try {
    // تحقق بسيط - يمكنك إضافة JWT decoding إذا كنت تستخدم JWT
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return false;
    
    return true;
  } catch {
    return false;
  }
};

// دالة لإزالة token
export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
  }
};

// دالة لحفظ token
export const saveAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);
  }
};

// دالة مساعدة للتحقق من الـ environment
export const getApiConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isBrowser = typeof window !== 'undefined';
  
  return {
    isProduction,
    isBrowser,
    shouldUseProxy: isProduction && isBrowser,
    apiUrl: REAL_API_URL
  };
};

// دالة لاختبار الـ proxy
export const testProxyConnection = async () => {
  try {
    const response = await api.get('/services');
    return {
      success: true,
      data: response.data,
      proxyUsed: response.config.url.includes('/api/proxy/'),
      config: {
        url: response.config.url,
        baseURL: response.config.baseURL,
        method: response.config.method
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      proxyUsed: error.config?.url?.includes('/api/proxy/') || false,
      config: {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method
      }
    };
  }
};

// دالة للحصول على الـ services مباشرة (بدون proxy)
export const getServicesDirect = async () => {
  try {
    const response = await fetch('http://moya.talaaljazeera.com/api/v1/services', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Direct fetch error:', error);
    throw error;
  }
};

// Default export للـ axios instance للتوافق مع الكود الحالي
export default api;

// Named exports لكل الدوال
export {
  waterApi,
  walletApi,
  generalApi,
  userApi,
  ordersApi,
  handleApiError,
  validateBalance,
  downloadFile,
  formatDate,
  formatCurrency,
  checkAuthToken,
  removeAuthToken,
  saveAuthToken,
  REAL_API_URL,
  getApiConfig,
  testProxyConnection,
  getServicesDirect
};