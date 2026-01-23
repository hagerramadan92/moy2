importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

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

// معالجة الإشعارات في الخلفية
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});