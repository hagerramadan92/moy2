// utils/websocketTest.js
export const checkWebSocketSupport = async () => {
  // أولاً تحقق إذا كان الـ WebSocket متاحاً في المتصفح
  if (typeof WebSocket === 'undefined') {
    return { supported: false, reason: 'WebSocket not supported in this browser' };
  }

  // حاول الاتصال بخادم WebSocket تجريبي لاختبار الاتصال
  return new Promise((resolve) => {
    const testSocket = new WebSocket('wss://echo.websocket.org');
    
    const timeout = setTimeout(() => {
      testSocket.close();
      resolve({ supported: false, reason: 'Connection timeout' });
    }, 3000);
    
    testSocket.onopen = () => {
      clearTimeout(timeout);
      testSocket.close();
      resolve({ supported: true, reason: 'WebSocket connection successful' });
    };
    
    testSocket.onerror = () => {
      clearTimeout(timeout);
      testSocket.close();
      resolve({ supported: false, reason: 'WebSocket connection failed' });
    };
  });
};