// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// قيم Firebase - تأكد أنها مطابقة للمتغيرات في .env.local
firebase.initializeApp({
  apiKey: "AIzaSyCuydYVIins0Lm9A2zqpq18C1pAZN9LjUU",
  authDomain: "moya-7058d.firebaseapp.com",
  projectId: "moya-7058d",
  storageBucket: "moya-7058d.firebasestorage.app",
  messagingSenderId: "404540571202",
  appId: "1:404540571202:web:092439b08b8bd1f863f7db",
  measurementId: "G-2H4F9PPQ9Q"
});

const messaging = firebase.messaging();

// تسجيل Service Worker
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker activating...');
  return self.clients.claim();
});

// معالجة الإشعارات عند وصول التطبيق في الخلفية
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] 📩 Received background message:', payload);
  
  try {
    const notificationTitle = payload.notification?.title || payload.data?.title || 'إشعار جديد';
    const notificationBody = payload.notification?.body || payload.data?.message || 'لديك إشعار جديد';
    
    const notificationOptions = {
      body: notificationBody,
      icon: payload.notification?.icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: payload.data?.id || Date.now().toString(),
      timestamp: Date.now(),
      data: {
        ...payload.data,
        click_action: payload.data?.action_url || payload.notification?.click_action || '/notifications'
      },
      actions: [
        {
          action: 'open',
          title: 'فتح'
        },
        {
          action: 'mark_read',
          title: 'تعليم كمقروء'
        }
      ]
    };

    // إضافة vibrate إذا كان مدعوماً
    if ('vibrate' in Notification.prototype) {
      notificationOptions.vibrate = [200, 100, 200];
    }

    // إضافة صوت إذا كان مدعوماً
    if ('sound' in Notification.prototype) {
      notificationOptions.sound = '/notification-sound.mp3';
    }

    console.log('[firebase-messaging-sw.js] 📨 Showing notification:', notificationTitle);
    
    self.registration.showNotification(notificationTitle, notificationOptions)
      .then(() => {
        console.log('[firebase-messaging-sw.js] ✅ Notification shown successfully');
      })
      .catch(error => {
        console.error('[firebase-messaging-sw.js] ❌ Error showing notification:', error);
      });

  } catch (error) {
    console.error('[firebase-messaging-sw.js] 💥 Error processing message:', error);
  }
});

// معالجة النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] 🖱️ Notification clicked:', event.notification);
  
  event.notification.close();
  
  const notificationData = event.notification.data || {};
  const action = event.action || 'open';
  
  let urlToOpen;
  
  switch (action) {
    case 'mark_read':
      // إعلام التطبيق الرئيسي بتعليم الإشعار كمقروء
      console.log('[firebase-messaging-sw.js] 📌 Mark as read action');
      urlToOpen = notificationData.action_url || notificationData.click_action || '/notifications';
      // يمكنك هنا إرسال رسالة إلى التطبيق الرئيسي
      break;
      
    case 'open':
    default:
      urlToOpen = notificationData.action_url || notificationData.click_action || '/notifications';
      break;
  }
  
  console.log('[firebase-messaging-sw.js] 🌐 Opening URL:', urlToOpen);
  
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    })
    .then((clientList) => {
      // البحث عن تبويب مفتوح
      for (const client of clientList) {
        const clientUrl = new URL(client.url);
        const targetUrl = new URL(urlToOpen, self.location.origin);
        
        if (clientUrl.pathname === targetUrl.pathname && 'focus' in client) {
          console.log('[firebase-messaging-sw.js] 🔍 Found existing tab, focusing...');
          return client.focus().then(() => {
            // إرسال رسالة إلى التطبيق
            if (action === 'mark_read' && notificationData.id) {
              client.postMessage({
                type: 'NOTIFICATION_MARK_READ',
                notificationId: notificationData.id
              });
            }
            return client.navigate(urlToOpen);
          });
        }
      }
      
      // فتح تبويب جديد
      console.log('[firebase-messaging-sw.js] 🆕 Opening new tab');
      return clients.openWindow(urlToOpen).then((newClient) => {
        if (newClient && action === 'mark_read' && notificationData.id) {
          setTimeout(() => {
            newClient.postMessage({
              type: 'NOTIFICATION_MARK_READ',
              notificationId: notificationData.id
            });
          }, 1000);
        }
        return newClient;
      });
    })
    .catch(error => {
      console.error('[firebase-messaging-sw.js] ❌ Error in notificationclick:', error);
    })
  );
});

// معالجة إغلاق الإشعار
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] ❌ Notification closed:', event.notification);
});

// استقبال الرسائل من التطبيق الرئيسي
self.addEventListener('message', (event) => {
  console.log('[firebase-messaging-sw.js] 📬 Message received from client:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// تسجيل وصول Service Worker
console.log('[firebase-messaging-sw.js] ✅ Service Worker registered successfully!');