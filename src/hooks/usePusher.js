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
    if (!eventListenersRef.current[eventName]) {
      eventListenersRef.current[eventName] = [];
    }
    eventListenersRef.current[eventName].push(callback);
    console.log(`🎯 Event listener added for: ${eventName}`);
  }, []);

  // إزالة مستمع للأحداث
  const removeEventListener = useCallback((eventName, callback = null) => {
    if (callback && eventListenersRef.current[eventName]) {
      eventListenersRef.current[eventName] = eventListenersRef.current[eventName].filter(
        cb => cb !== callback
      );
    } else {
      delete eventListenersRef.current[eventName];
    }
    console.log(`🎯 Event listener removed for: ${eventName}`);
  }, []);

  // تشغيل مستمع حدث
  const triggerEventListener = useCallback((eventName, data) => {
    console.log(`🎯 Triggering event: ${eventName}`, data);
    
    const listeners = eventListenersRef.current[eventName];
    if (listeners && listeners.length > 0) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`❌ Error in ${eventName} listener:`, error);
        }
      });
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

      console.log(`🔔 Attempting to subscribe to channel: ${channelName}`);
      const channel = pusher.subscribe(channelName);
      
      // ربط الأحداث
      if (events) {
        Object.entries(events).forEach(([eventName, callback]) => {
          channel.bind(eventName, (data) => {
            console.log(`🎯 Event received on ${channelName}: ${eventName}`, data);
            callback(data);
          });
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

  // دالة للاشتراك في قناة الطلب (order) فقط
  const subscribeToOrder = useCallback((orderId, eventHandlers) => {
    if (!orderId) {
      console.log('⚠️ No orderId provided for subscription');
      return null;
    }

    const channelName = `order.${orderId}`;
    console.log(`🎯 Setting up subscription for order channel: ${channelName}`);

    return subscribe(channelName, {
      'offer.created': (data) => {
        console.log('🎯 New offer received via Pusher:', data);
        if (eventHandlers?.onOfferCreated) {
          eventHandlers.onOfferCreated(data);
        }
        triggerEventListener('offer_created', data);
      },
      'order.status.updated': (data) => {
        console.log('📊 Order status updated via Pusher:', data);
        if (eventHandlers?.onOrderStatusUpdated) {
          eventHandlers.onOrderStatusUpdated(data);
        }
        triggerEventListener('order_status_updated', data);
      },
      'order.expired': (data) => {
        console.log('⏰ Order expired via Pusher:', data);
        if (eventHandlers?.onOrderExpired) {
          eventHandlers.onOrderExpired(data);
        }
        triggerEventListener('order_expired', data);
      },
      'order.cancelled': (data) => {
        console.log('❌ Order cancelled via Pusher:', data);
        if (eventHandlers?.onOrderCancelled) {
          eventHandlers.onOrderCancelled(data);
        }
        triggerEventListener('order_cancelled', data);
      },
      // ✅ إضافة حدث قبول السائق مباشرة على قناة الطلب
      'DriverAcceptedOrder': (data) => {
        console.log('🚗 ===== DRIVER ACCEPTED ORDER EVENT ON ORDER CHANNEL =====');
        console.log('📋 Full event data:', JSON.stringify(data, null, 2));
        console.log('🎯 Channel:', channelName);
        console.log('🎯 Event: DriverAcceptedOrder');
        
        // تشغيل المعالج المخصص إذا موجود
        if (eventHandlers?.onDriverAcceptedOrder) {
          eventHandlers.onDriverAcceptedOrder(data);
        }
        
        // تشغيل جميع المستمعين المسجلين لهذا الحدث
        triggerEventListener('driver_accepted_order', data);
      },
      'driver.assigned': (data) => {
        console.log('👤 Driver assigned via Pusher:', data);
        if (eventHandlers?.onDriverAssigned) {
          eventHandlers.onDriverAssigned(data);
        }
        triggerEventListener('driver_assigned', data);
      },
      'order.updated': (data) => {
        console.log('📝 Order updated via Pusher:', data);
        if (eventHandlers?.onOrderUpdated) {
          eventHandlers.onOrderUpdated(data);
        }
        triggerEventListener('order_updated', data);
      },
      'driver.location.updated': (data) => {
        console.log('📍 Driver location updated via Pusher:', data);
        if (eventHandlers?.onDriverLocationUpdated) {
          eventHandlers.onDriverLocationUpdated(data);
        }
        triggerEventListener('driver_location_updated', data);
      }
    });
  }, [subscribe, triggerEventListener]);

  // الاحتفاظ بالدالة القديمة للتوافق مع الكود الحالي
  const subscribeToOrderAndUser = useCallback((orderId, userId, eventHandlers) => {
    console.log('⚠️ subscribeToOrderAndUser is deprecated. Use subscribeToOrder instead.');
    return subscribeToOrder(orderId, eventHandlers);
  }, [subscribeToOrder]);

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
    return channelsRef.current.map(ch => ({
      name: ch.channelName,
      subscribed: !!ch.channel
    }));
  }, []);

  // التهيئة التلقائية — التشغيل عند التركيب فقط، والتنظيف عند إلغاء المكون فقط (لتجنب إلغاء الاشتراكات عند كل re-render)
  useEffect(() => {
    if (autoConnect) {
      initPusher();
    }
    return () => {
      unsubscribeAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- تعمد الاعتماد على autoConnect فقط لتفادي تفريغ الاشتراكات عند تغيّر initPusher/unsubscribeAll
  }, [autoConnect]);

  return {
    isConnected,
    connectionState,
    subscribe,
    subscribeToOrder, // ✅ دالة جديدة للاشتراك في قناة الطلب فقط
    subscribeToOrderAndUser, // ✅ محتفظ بها للتوافق
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