import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// تهيئة Firebase
let app;
let messaging = null;

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  messaging = getMessaging(app);
}

// طلب إذن الإشعارات
export const registerDevice = async () => {
  if (typeof window === 'undefined' || !messaging) {
    console.warn('Firebase غير متاح في بيئة الخادم');
    return null;
  }

  try {
    // التحقق من دعم Service Worker
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker غير مدعوم في هذا المتصفح');
      return null;
    }

    // التحقق من دعم الإشعارات
    if (!('Notification' in window)) {
      console.warn('الإشعارات غير مدعومة في هذا المتصفح');
      return null;
    }

    // طلب الإذن
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      });

      if (token) {
        return token;
      } else {
        console.warn('لم يتم الحصول على token من Firebase');
      }
    } else {
      console.warn('تم رفض إذن الإشعارات');
    }
  } catch (error) {
    console.error('حدث خطأ في الحصول على التوكن:', error);
  }

  return null;
};

// الاستماع للإشعارات
export const onMessageListener = () => {
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    return payload;
  });
};

export { messaging };