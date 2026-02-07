import { useState, useEffect, useCallback, useRef } from 'react';
import pusherService, { getPusherInstance, disconnectPusher } from '@/utils/pusher';

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

  // دالة للاشتراك في قناة
  const subscribe = useCallback((channelName, events) => {
    const pusher = getPusherInstance();
    if (!pusher) return null;

    try {
      const channel = pusher.subscribe(channelName);
      
      // ربط الأحداث
      if (events) {
        Object.entries(events).forEach(([eventName, callback]) => {
          channel.bind(eventName, callback);
        });
      }

      // إضافة إلى المصفوفة للمتابعة
      channelsRef.current.push({ channelName, channel });
      
      return channel;
    } catch (error) {
      console.error(`❌ Error subscribing to ${channelName}:`, error);
      return null;
    }
  }, []);

  // دالة للاشتراك في قناتين (order + user)
  const subscribeToOrderAndUser = useCallback((orderId, userId, eventHandlers) => {
    const channels = {
      orderChannel: null,
      userChannel: null
    };

    if (orderId) {
      channels.orderChannel = subscribe(`order.${orderId}`, {
        'offer.created': eventHandlers?.onOfferCreated,
        'order.status.updated': eventHandlers?.onOrderStatusUpdated,
        'order.expired': eventHandlers?.onOrderExpired,
        'order.cancelled': eventHandlers?.onOrderCancelled
      });
    }

    if (userId) {
      channels.userChannel = subscribe(`user.${userId}`, {
        'DriverAcceptedOrder': eventHandlers?.onDriverAcceptedOrder,
        'driver.assigned': eventHandlers?.onDriverAssigned,
        'order.updated': eventHandlers?.onOrderUpdated,
        'driver.location.updated': eventHandlers?.onDriverLocationUpdated
      });
    }

    return channels;
  }, [subscribe]);

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
  }, []);

  // دالة لقطع الاتصال
  const disconnect = useCallback(() => {
    unsubscribeAll();
    disconnectPusher();
    setIsConnected(false);
    setConnectionState('disconnected');
  }, [unsubscribeAll]);

  // دالة لإعادة الاتصال
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      initPusher();
    }, 1000);
  }, [disconnect, initPusher]);

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
    getPusherInstance
  };
};

export default usePusher;