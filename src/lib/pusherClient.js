// lib/pusherClient.js
import Pusher from 'pusher-js';

// تحديد التكوين بناءً على البيئة
const isLocalLaravelBroadcasting = false; // غيّر هذا إذا كان Laravel محلياً

let pusherConfig;

if (isLocalLaravelBroadcasting) {
  // Laravel محلي مع Echo Server (منفذ 6001)
  pusherConfig = {
    wsHost: window.location.hostname,
    wsPort: 6001,
    wssPort: 6001,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: 'https://moya.talaaljazeera.com/api/v1/broadcasting/auth', // Laravel مباشرة
    auth: {
      headers: {
        'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''}`
      }
    }
  };
} else {
  // Pusher Cloud (الافتراضي)
  pusherConfig = {
    appKey: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
    forceTLS: true,
    
    // استخدام authEndpoint الخاص بـ Next.js الذي يتصل بـ Laravel
    authEndpoint: 'https://moya.talaaljazeera.com/api/v1/broadcasting/auth',
    
    auth: {
      headers: {
        'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''}`
      }
    },
    
    // إزالة إعدادات WebSocket المضللة
    // wsHost و wsPort و wssPort ليسوا مطلوبين لـ Pusher Cloud
  };
}



let pusherClient = null;

if (typeof window !== 'undefined') {
  try {
    if (isLocalLaravelBroadcasting) {
      // Laravel محلي
      pusherClient = new Pusher(pusherConfig.appKey || 'local', pusherConfig);
    } else {
      // Pusher Cloud - التكوين البسيط
      pusherClient = new Pusher(pusherConfig.appKey, {
        cluster: pusherConfig.cluster,
        forceTLS: pusherConfig.forceTLS,
        authEndpoint: pusherConfig.authEndpoint,
        auth: pusherConfig.auth,
        
        // إعدادات مهمة
        disableStats: true,
        enabledTransports: ['ws', 'wss']
      });
    }

    // إضافة مستمعات للأحداث للتصحيح
    pusherClient.connection.bind('state_change', (states) => {
     
    });

    pusherClient.connection.bind('connected', () => {
  
    });

    pusherClient.connection.bind('disconnected', () => {
  
    });

    pusherClient.connection.bind('error', (err) => {
      console.error('⚠️ Pusher Error:', err);
    });

    // إضافة خاصية الاشتراك الآمن
    pusherClient.safeSubscribe = (channelName, callbacks = {}) => {
      try {
       
        
        const channel = pusherClient.subscribe(channelName);
        
        // الأحداث القياسية
        channel.bind('pusher:subscription_succeeded', (data) => {
         
          if (callbacks.onSubscribed) callbacks.onSubscribed(data);
        });

        channel.bind('pusher:subscription_error', (error) => {
          console.error(`❌ Subscription error for ${channelName}:`, error);
          if (callbacks.onError) callbacks.onError(error);
        });

        // الأحداث المخصصة
        if (callbacks.events) {
          Object.entries(callbacks.events).forEach(([eventName, callback]) => {
            channel.bind(eventName, (data) => {
              
              callback(data);
            });
          });
        }

        return channel;
      } catch (error) {
        console.error(`❌ Failed to subscribe to ${channelName}:`, error);
        throw error;
      }
    };

   

  } catch (error) {
    console.error('❌ Failed to initialize Pusher:', error);
  }
} else {
  
}

export { pusherClient };