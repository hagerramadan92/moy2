import Pusher from 'pusher-js';

// التكوين الأساسي
const PUSHER_CONFIG = {
  appKey: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '262509ce3ae27d53f4cd',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
  forceTLS: true,
  enabledTransports: ['ws', 'wss', 'xhr_streaming', 'xhr_polling'],
  disableStats: true,
  authEndpoint: process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/broadcasting/auth` 
    : null,
  auth: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }
};

// متغيرات حالة الاتصال
let pusherInstance = null;
let connectionState = 'disconnected';

// دالة لإنشاء مثيل Pusher
export const createPusherInstance = () => {
  if (!PUSHER_CONFIG.appKey || PUSHER_CONFIG.appKey === 'your-pusher-key') {
    console.warn('⚠️ Pusher app key is not configured properly');
    return null;
  }

  try {
    // تنظيف المثيل السابق إذا كان موجوداً
    if (pusherInstance) {
      pusherInstance.disconnect();
    }

    pusherInstance = new Pusher(PUSHER_CONFIG.appKey, {
      cluster: PUSHER_CONFIG.cluster,
      forceTLS: PUSHER_CONFIG.forceTLS,
      enabledTransports: PUSHER_CONFIG.enabledTransports,
      disableStats: PUSHER_CONFIG.disableStats,
      authEndpoint: PUSHER_CONFIG.authEndpoint,
      auth: PUSHER_CONFIG.auth
    });

    // إضافة معالجين للأحداث
    pusherInstance.connection.bind('state_change', (states) => {
      connectionState = states.current;
      console.log(`🔌 Pusher state changed: ${states.previous} -> ${states.current}`);
    });

    pusherInstance.connection.bind('error', (error) => {
      console.error('❌ Pusher connection error:', error);
    });

    pusherInstance.connection.bind('connected', () => {
      console.log('✅ Pusher connected successfully');
    });

    pusherInstance.connection.bind('disconnected', () => {
      console.log('🔴 Pusher disconnected');
    });

    return pusherInstance;
  } catch (error) {
    console.error('❌ Failed to create Pusher instance:', error);
    return null;
  }
};

// دالة للحصول على مثيل Pusher
export const getPusherInstance = () => {
  if (!pusherInstance) {
    return createPusherInstance();
  }
  return pusherInstance;
};

// دالة للاشتراك في قناة
export const subscribeToChannel = (channelName, events) => {
  const pusher = getPusherInstance();
  if (!pusher) {
    console.warn('⚠️ Pusher instance not available');
    return null;
  }

  try {
    const channel = pusher.subscribe(channelName);
    
    // إضافة معالج خطأ للاشتراك
    channel.bind('pusher:subscription_error', (status) => {
      console.error(`❌ Failed to subscribe to channel ${channelName}:`, status);
    });

    channel.bind('pusher:subscription_succeeded', () => {
      console.log(`✅ Successfully subscribed to channel ${channelName}`);
    });

    // ربط الأحداث
    if (events) {
      Object.entries(events).forEach(([eventName, callback]) => {
        channel.bind(eventName, callback);
      });
    }

    return channel;
  } catch (error) {
    console.error(`❌ Error subscribing to channel ${channelName}:`, error);
    return null;
  }
};

// دالة لإلغاء الاشتراك من قناة
export const unsubscribeFromChannel = (channelName) => {
  const pusher = getPusherInstance();
  if (!pusher) return;

  try {
    pusher.unsubscribe(channelName);
    console.log(`🔕 Unsubscribed from channel ${channelName}`);
  } catch (error) {
    console.error(`❌ Error unsubscribing from channel ${channelName}:`, error);
  }
};

// دالة للاشتراك في قناتين (order + user)
export const subscribeToOrderAndUserChannels = (orderId, userId, eventHandlers) => {
  const channels = {
    orderChannel: null,
    userChannel: null
  };

  // اشتراك في قناة الطلب
  if (orderId) {
    channels.orderChannel = subscribeToChannel(`order.${orderId}`, {
      'offer.created': eventHandlers?.onOfferCreated || (() => {}),
      'order.status.updated': eventHandlers?.onOrderStatusUpdated || (() => {}),
      'order.expired': eventHandlers?.onOrderExpired || (() => {})
    });
  }

  // اشتراك في قناة المستخدم
  if (userId) {
    channels.userChannel = subscribeToChannel(`user.${userId}`, {
      'DriverAcceptedOrder': eventHandlers?.onDriverAcceptedOrder || (() => {}),
      'driver.assigned': eventHandlers?.onDriverAssigned || (() => {}),
      'order.updated': eventHandlers?.onOrderUpdated || (() => {})
    });
  }

  return channels;
};

// دالة لقطع الاتصال
export const disconnectPusher = () => {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
    connectionState = 'disconnected';
    console.log('🔌 Pusher disconnected');
  }
};

// دالة للتحقق من حالة الاتصال
export const getConnectionState = () => connectionState;

// دالة لإعادة الاتصال
export const reconnectPusher = () => {
  disconnectPusher();
  return createPusherInstance();
};

// تصدير التكوين
export default {
  createPusherInstance,
  getPusherInstance,
  subscribeToChannel,
  unsubscribeFromChannel,
  subscribeToOrderAndUserChannels,
  disconnectPusher,
  getConnectionState,
  reconnectPusher
};