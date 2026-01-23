import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

class NotificationService {
  // تسجيل الجهاز
  async registerDevice(deviceData) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // 'Accept-Language': 'ar'
      };

      // إضافة التوكن إذا كان موجوداً
      const authToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await axios.post(
        `${API_BASE_URL}/notifications/register-device`,
        deviceData,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  // تحديث حالة الجهاز
  async updateDevice(deviceId, data) {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await axios.put(
        `${API_BASE_URL}/notifications/devices/${deviceId}`,
        data,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error updating device:', error);
      throw error;
    }
  }

  // إلغاء تفعيل الجهاز
  async deactivateDevice(deviceId) {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      const authToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await axios.delete(
        `${API_BASE_URL}/notifications/devices/${deviceId}`,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error deactivating device:', error);
      throw error;
    }
  }

  // الحصول على الأجهزة المسجلة
  async getRegisteredDevices() {
    try {
      const headers = {
        'Accept': 'application/json'
      };

      const authToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await axios.get(
        `${API_BASE_URL}/notifications/devices`,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting devices:', error);
      throw error;
    }
  }
}

export default new NotificationService();