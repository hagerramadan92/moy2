// API Configuration and Helper Functions

export const API_BASE_URL = 'https://dashboard.waytmiah.com/api/v1';

/**
 * Get access token from localStorage
 */
export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

/**
 * Get or create device ID for metadata
 */
export const getDeviceId = () => {
  if (typeof window !== 'undefined') {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }
  return `device-${Date.now()}`;
};

/**
 * Get IP address (simplified - in production you might want to get this from a service)
 */
export const getIpAddress = () => {
  return '0.0.0.0'; // You can enhance this later with an IP detection service
};

