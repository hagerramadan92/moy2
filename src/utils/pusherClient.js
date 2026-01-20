/**
 * Pusher Configuration Utility
 * Handles real-time messaging setup with Pusher
 */

import Pusher from 'pusher-js';

let pusherInstance = null;

/**
 * Initialize Pusher client
 * @returns {Pusher} Pusher instance
 */
export const initializePusher = () => {
  if (pusherInstance) {
    return pusherInstance;
  }

  const appKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appKey) {
    console.error('Pusher App Key is not defined. Please set NEXT_PUBLIC_PUSHER_APP_KEY in your environment variables.');
    throw new Error('Pusher App Key is required');
  }

  if (!cluster) {
    console.error('Pusher Cluster is not defined. Please set NEXT_PUBLIC_PUSHER_CLUSTER in your environment variables.');
    throw new Error('Pusher Cluster is required');
  }

  pusherInstance = new Pusher(appKey, {
    cluster: cluster,
    encrypted: true,
    useTLS: true,
  });

  return pusherInstance;
};

/**
 * Get Pusher instance (initialize if needed)
 * @returns {Pusher} Pusher instance
 */
export const getPusherInstance = () => {
  return pusherInstance || initializePusher();
};

/**
 * Subscribe to a chat channel
 * @param {string} orderId - Order ID to create unique channel name
 * @param {Function} callback - Callback function to handle new messages
 * @returns {Object} Channel object
 */
export const subscribeToChat = (orderId, callback) => {
  const pusher = getPusherInstance();
  const channelName = `chat-order-${orderId}`;

  // Subscribe to the channel
  const channel = pusher.subscribe(channelName);

  // Listen for new messages
  channel.bind('new-message', (data) => {
    callback(data);
  });

  return channel;
};

/**
 * Unsubscribe from a chat channel
 * @param {string} orderId - Order ID
 */
export const unsubscribeFromChat = (orderId) => {
  const pusher = getPusherInstance();
  const channelName = `chat-order-${orderId}`;
  pusher.unsubscribe(channelName);
};

/**
 * Subscribe to typing indicators
 * @param {string} orderId - Order ID
 * @param {Function} callback - Callback for typing events
 * @returns {Object} Channel object
 */
export const subscribeToTypingIndicator = (orderId, callback) => {
  const pusher = getPusherInstance();
  const channelName = `chat-typing-${orderId}`;

  const channel = pusher.subscribe(channelName);

  channel.bind('user-typing', (data) => {
    callback(data);
  });

  return channel;
};

/**
 * Disconnect Pusher
 */
export const disconnectPusher = () => {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }
};
