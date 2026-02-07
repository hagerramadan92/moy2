import { useState, useEffect, useCallback, useRef } from 'react';
import { getPusherInstance, disconnectPusher } from '@/utils/pusher';

export const usePusher = (options = {}) => {
  const {
    autoConnect = true,
    onConnected = () => {},
    onDisconnected = () => {},
    onError = () => {}
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const channelsRef = useRef([]);
  const eventListenersRef = useRef({});

  // تسجيل مستمع للأحداث
  const addEventListener = useCallback((eventName, callback) => {
    eventListenersRef.current[eventName] = callback;
  }, []);

  // إزالة مستمع للأحداث
  const removeEventListener = useCallback((eventName) => {
    delete eventListenersRef.current[eventName];
  }, []);

  // تشغيل مستمع حدث
  const triggerEventListener = useCallback((eventName, data) => {
    const listener = eventListenersRef.current[eventName];
    if (listener) {
      listener(data);
    }
  }, []);

  // تهيئة Pusher
  const initPusher = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const pusher = getPusherInstance();
    if (!pusher) return null;

    // إضافة معالجين للأحداث
    pusher.connection.bind('connected', () => {
      setIsConnected(true);
      setConnectionState('connected');
      onConnected();
      console.log('✅ Pusher connected via hook');
    });

    pusher.connection.bind('disconnected', () => {
      setIsConnected(false);
      setConnectionState('disconnected');
      onDisconnected();
      console.log('🔴 Pusher disconnected via hook');
    });

    pusher.connection.bind('state_change', (states) => {
      setConnectionState(states.current);
      console.log(`🔄 Pusher state: ${states.current}`);
    });

    pusher.connection.bind('error', (error) => {
      onError(error);
      console.error('❌ Pusher error:', error);
    });

    return pusher;
  }, [onConnected, onDisconnected, onError]);

  // دالة للاشتراك في قناة مع إمكانية إضافة مستمعين
  const subscribe = useCallback((channelName, events) => {
    const pusher = getPusherInstance();
    if (!pusher) return null;

    try {
      // التحقق من عدم الاشتراك مسبقاً
      const existingChannel = channelsRef.current.find(ch => ch.channelName === channelName);
      if (existingChannel) {
        console.log(`ℹ️ Already subscribed to channel ${channelName}`);
        return existingChannel.channel;
      }

      const channel = pusher.subscribe(channelName);
      
      // ربط الأحداث
      if (events) {
        Object.entries(events).forEach(([eventName, callback]) => {
          channel.bind(eventName, callback);
        });
      }

      // إضافة معالج للخطأ في الاشتراك
      channel.bind('pusher:subscription_error', (error) => {
        console.error(`❌ Subscription error for channel ${channelName}:`, error);
      });

      channel.bind('pusher:subscription_succeeded', () => {
        console.log(`✅ Successfully subscribed to channel ${channelName}`);
      });

      // إضافة إلى المصفوفة للمتابعة
      channelsRef.current.push({ channelName, channel });
      
      return channel;
    } catch (error) {
      console.error(`❌ Error subscribing to ${channelName}:`, error);
      return null;
    }
  }, []);

  // دالة للاشتراك في قناتين (order + user) مع تحسينات
  const subscribeToOrderAndUser = useCallback((orderId, userId, eventHandlers) => {
    const channels = {
      orderChannel: null,
      userChannel: null
    };

    if (orderId) {
      channels.orderChannel = subscribe(`order.${orderId}`, {
        'offer.created': (data) => {
          console.log('🎯 New offer received via Pusher:', data);
          if (eventHandlers?.onOfferCreated) {
            eventHandlers.onOfferCreated(data);
          }
          triggerEventListener('offer_created', data);
        },
        'order.status.updated': (data) => {
          if (eventHandlers?.onOrderStatusUpdated) {
            eventHandlers.onOrderStatusUpdated(data);
          }
          triggerEventListener('order_status_updated', data);
        },
        'order.expired': (data) => {
          if (eventHandlers?.onOrderExpired) {
            eventHandlers.onOrderExpired(data);
          }
          triggerEventListener('order_expired', data);
        },
        'order.cancelled': (data) => {
          if (eventHandlers?.onOrderCancelled) {
            eventHandlers.onOrderCancelled(data);
          }
          triggerEventListener('order_cancelled', data);
        }
      });
    }

    if (userId) {
      channels.userChannel = subscribe(`user.${userId}`, {
        'DriverAcceptedOrder': (data) => {
          if (eventHandlers?.onDriverAcceptedOrder) {
            eventHandlers.onDriverAcceptedOrder(data);
          }
          triggerEventListener('driver_accepted_order', data);
        },
        'driver.assigned': (data) => {
          if (eventHandlers?.onDriverAssigned) {
            eventHandlers.onDriverAssigned(data);
          }
          triggerEventListener('driver_assigned', data);
        },
        'order.updated': (data) => {
          if (eventHandlers?.onOrderUpdated) {
            eventHandlers.onOrderUpdated(data);
          }
          triggerEventListener('order_updated', data);
        },
        'driver.location.updated': (data) => {
          if (eventHandlers?.onDriverLocationUpdated) {
            eventHandlers.onDriverLocationUpdated(data);
          }
          triggerEventListener('driver_location_updated', data);
        }
      });
    }

    return channels;
  }, [subscribe, triggerEventListener]);

  // دالة لإلغاء الاشتراك من قناة
  const unsubscribe = useCallback((channelName) => {
    const pusher = getPusherInstance();
    if (!pusher) return;

    try {
      pusher.unsubscribe(channelName);
      
      // إزالة من المصفوفة
      channelsRef.current = channelsRef.current.filter(
        ch => ch.channelName !== channelName
      );
      console.log(`🔕 Unsubscribed from ${channelName}`);
    } catch (error) {
      console.error(`❌ Error unsubscribing from ${channelName}:`, error);
    }
  }, []);

  // دالة لإلغاء جميع الاشتراكات
  const unsubscribeAll = useCallback(() => {
    const pusher = getPusherInstance();
    if (!pusher) return;

    channelsRef.current.forEach(({ channelName }) => {
      try {
        pusher.unsubscribe(channelName);
      } catch (error) {
        console.error(`❌ Error unsubscribing from ${channelName}:`, error);
      }
    });

    channelsRef.current = [];
    console.log('🔕 Unsubscribed from all channels');
  }, []);

  // دالة لقطع الاتصال
  const disconnect = useCallback(() => {
    unsubscribeAll();
    disconnectPusher();
    setIsConnected(false);
    setConnectionState('disconnected');
    console.log('🔌 Pusher disconnected via hook');
  }, [unsubscribeAll]);

  // دالة لإعادة الاتصال
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      const newInstance = initPusher();
      if (newInstance) {
        console.log('🔄 Pusher reconnected via hook');
      }
    }, 1000);
  }, [disconnect, initPusher]);

  // التحقق من الاشتراك في قناة
  const isSubscribed = useCallback((channelName) => {
    return channelsRef.current.some(ch => ch.channelName === channelName);
  }, []);

  // الحصول على معلومات الاشتراكات
  const getSubscriptions = useCallback(() => {
    return channelsRef.current.map(ch => ch.channelName);
  }, []);

  // التهيئة التلقائية
  useEffect(() => {
    if (autoConnect) {
      initPusher();
    }

    return () => {
      // تنظيف عند إلغاء المكون
      unsubscribeAll();
    };
  }, [autoConnect, initPusher, unsubscribeAll]);

  return {
    isConnected,
    connectionState,
    subscribe,
    subscribeToOrderAndUser,
    unsubscribe,
    unsubscribeAll,
    disconnect,
    reconnect,
    getPusherInstance,
    addEventListener,
    removeEventListener,
    triggerEventListener,
    isSubscribed,
    getSubscriptions
  };
};

export default usePusher;