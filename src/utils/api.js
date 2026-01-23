import axiosInstance, { BASE_URL } from './axios-config';

// وظائف API الخاصة بالمحفظة
export const walletApi = {
  // الحصول على رصيد المحفظة
  async getWalletBalance() {
    try {
      const response = await axiosInstance.get('/user/wallet');
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
      
      const response = await axiosInstance.get(url);
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
      
      if (type && type !== 'all') {
        url += `&type=${type}`;
      }
      
      if (status && status !== 'all') {
        url += `&status=${status}`;
      }
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      if (startDate) {
        url += `&start_date=${startDate}`;
      }
      
      if (endDate) {
        url += `&end_date=${endDate}`;
      }
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered transactions:', error);
      throw error;
    }
  },

  // إضافة أموال
  async depositMoney(amount, payment_method) {
    try {
      const response = await axiosInstance.post('/user/wallet/deposit', {
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
      const response = await axiosInstance.get('/payment-methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  // تصدير كشف الحساب
  async exportStatement(startDate, endDate, format = 'pdf') {
    try {
      const response = await axiosInstance.get(
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
      const response = await axiosInstance.get(`/user/wallet/transactions/${transactionId}`);
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
      
      if (startDate) {
        url += `?start_date=${startDate}`;
      }
      
      if (endDate) {
        url += `${startDate ? '&' : '?'}end_date=${endDate}`;
      }
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw error;
    }
  }
  
};
// وظائف API الخاصة بالمياه
export const waterApi = {
  // جلب أنواع المويه
  async getWaterTypes() {
    try {
      const response = await axiosInstance.get('/type-water');
      return response.data;
    } catch (error) {
      console.error('Error fetching water types:', error);
      throw error;
    }
  },

  // جلب أحجام / خدمات المويه
  async getWaterServices() {
    try {
      const response = await axiosInstance.get('/services');
      return response.data;
    } catch (error) {
      console.error('Error fetching water services:', error);
      throw error;
    }
  }
};

// دالة مساعدة لمعالجة الأخطاء
export const handleApiError = (error, defaultMessage = 'حدث خطأ أثناء العملية') => {
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// دالة للتحقق من صلاحية الـ Token
export const checkAuthToken = () => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('accessToken');
  if (!token) return false;
  
  return true;
};

// Default export للـ axios instance للتوافق مع الشفرة الحالية
const api = axiosInstance;

export default api;

// Named exports لكل الدوال
export {
  walletApi,
  handleApiError,
  validateBalance,
  downloadFile,
  formatDate,
  formatCurrency,
  checkAuthToken,
  BASE_URL
};