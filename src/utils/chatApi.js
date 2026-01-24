/**
 * Chat API Utilities
 * Handles all chat-related API calls to the backend
 */

import { getCsrfToken } from './csrf';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://moya.talaaljazeera.com/api/v1';

/**
 * Get authorization headers with access token and CSRF token
 * @returns {Object} Headers object with Authorization and CSRF token
 */
const getAuthHeaders = async () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add CSRF token if available
    const csrfToken = await getCsrfToken();
    
    if (csrfToken) {
      headers['X-CSRF-TOKEN'] = csrfToken;
      headers['X-XSRF-TOKEN'] = csrfToken;
    }
  }

  return headers;
};

/**
 * Get authorization headers synchronously (for fallback)
 * @returns {Object} Headers object with Authorization
 */
const getAuthHeadersSync = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Try to get CSRF token from storage or meta tag
    const csrfToken = localStorage.getItem('csrfToken') || 
                      document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    if (csrfToken) {
      headers['X-CSRF-TOKEN'] = csrfToken;
      headers['X-XSRF-TOKEN'] = csrfToken;
    }
  }

  return headers;
};

/**
 * Fetch all messages for a chat conversation
 * @param {string} orderId - Order ID or conversation ID
 * @param {string} driverId - Driver ID
 * @returns {Promise<Array>} Array of message objects
 */
export const fetchChatMessages = async (orderId, driverId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chats?order_id=${orderId}&driver_id=${driverId}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      if (response.status === 401) {
        console.warn('Unauthorized: Please log in again');
      }
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle different response structures
    let messages = [];
    if (Array.isArray(data)) {
      messages = data;
    } else if (Array.isArray(data.data)) {
      messages = data.data;
    } else if (Array.isArray(data.messages)) {
      messages = data.messages;
    } else if (data.data && Array.isArray(data.data.messages)) {
      messages = data.data.messages;
    } else if (typeof data === 'object' && data !== null) {
      // Try to find an array property in the response
      const firstArray = Object.values(data).find(val => Array.isArray(val));
      messages = firstArray || [];
    }
    
    return messages;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }
};

/**
 * Send a new message to the chat
 * @param {Object} messageData - Message object containing text, chatId (or conversation ID)
 * @returns {Promise<Object>} Created message object
 */
export const sendChatMessage = async (messageData) => {
  try {
    // Use orderId as chat ID or use a composite ID if needed
    const chatId = messageData.chat_id || messageData.orderId || messageData.order_id;
    
    if (!chatId) {
      throw new Error('Chat ID is required to send message');
    }

    
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/send`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(messageData),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      console.error('Error response body:', data);
      
      if (response.status === 401) {
        console.warn('Unauthorized: Please log in again');
      }
      
      // Provide more detailed error message
      const errorMessage = data.message || data.error || data.errors?.join(', ') || response.statusText;
      throw new Error(`Failed to send message: ${errorMessage}`);
    }

    return data.data || data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Mark messages as read
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} Response from API
 */
export const markMessagesAsRead = async (conversationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chats/${conversationId}/read`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to mark as read: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

/**
 * Get driver info for the chat
 * @param {string} driverId - Driver ID
 * @returns {Promise<Object>} Driver information
 */
export const getDriverInfo = async (driverId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/drivers/${driverId}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch driver info: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching driver info:', error);
    return null;
  }
};

/**
 * Get list of all drivers the user has chatted with
 * @returns {Promise<Array>} Array of driver objects with chat info
 */
export const getChatDrivers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/chats/drivers`, {
      method: 'GET',
      headers: await getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch drivers: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle different response structures
    let drivers = [];
    if (Array.isArray(data)) {
      drivers = data;
    } else if (Array.isArray(data.data)) {
      drivers = data.data;
    } else if (Array.isArray(data.drivers)) {
      drivers = data.drivers;
    } else if (data.data && Array.isArray(data.data.drivers)) {
      drivers = data.data.drivers;
    }
    
    return drivers;
  } catch (error) {
    console.error('Error fetching chat drivers:', error);
    return [];
  }
};
