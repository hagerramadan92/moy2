"use client";
import React, { useState, useEffect, useRef } from "react";
import { pusherClient } from "@/lib/pusherClient";

export default function TestPusherPage() {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [events, setEvents] = useState([]);
  const [testMessage, setTestMessage] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [tokenExists, setTokenExists] = useState(false);
  
  // useRef لحفظ معرف فريد لكل حدث
  const eventCounter = useRef(0);

  // التحقق من localStorage فقط على العميل
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTokenExists(!!localStorage.getItem('accessToken'));
    }
  }, []);

  // حالة الاتصال
  useEffect(() => {
    if (!pusherClient) {
      setConnectionState('not_initialized');
      return;
    }

    // مستمعات حالة الاتصال
    pusherClient.connection.bind('state_change', (states) => {
      console.log('Pusher State Change:', states);
      setConnectionState(states.current);
      addEvent(`State changed: ${states.previous} -> ${states.current}`);
    });

    pusherClient.connection.bind('connected', () => {
      console.log('✅ Pusher Connected');
      setConnectionState('connected');
      addEvent('✅ Connected to Pusher');
    });

    pusherClient.connection.bind('disconnected', () => {
      console.log('❌ Pusher Disconnected');
      setConnectionState('disconnected');
      addEvent('❌ Disconnected from Pusher');
    });

    pusherClient.connection.bind('error', (err) => {
      console.error('⚠️ Pusher Error:', err);
      addEvent(`⚠️ Error: ${err.message || JSON.stringify(err)}`);
    });

    return () => {
      if (pusherClient) {
        pusherClient.disconnect();
      }
    };
  }, []);

  const addEvent = (message) => {
    eventCounter.current += 1;
    const uniqueId = `${Date.now()}_${eventCounter.current}`;
    
    setEvents(prev => [
      {
        id: uniqueId,
        message,
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev.slice(0, 20) // احتفظ بآخر 20 حدث
    ]);
  };

  const subscribeToChannel = () => {
    try {
      const channel = pusherClient.subscribe('chat-app');
      
      channel.bind('pusher:subscription_succeeded', () => {
        console.log('✅ Subscribed to chat-app channel');
        setIsSubscribed(true);
        addEvent('✅ Subscribed to chat-app channel');
      });

      channel.bind('pusher:subscription_error', (error) => {
        console.error('❌ Subscription error:', error);
        addEvent(`❌ Subscription error: ${error.status} - ${error.message}`);
      });

      channel.bind('new-upcoming-message', (data) => {
        console.log('📨 New message via Pusher:', data);
        addEvent(`📨 New message: ${data.message || 'No message text'} (Chat: ${data.chat_id})`);
      });

      channel.bind('message-sent', (data) => {
        console.log('📤 Message sent via Pusher:', data);
        addEvent(`📤 Message sent: ${data.message} (ID: ${data.id})`);
      });

      channel.bind('message-read', (data) => {
        console.log('👁️ Message read via Pusher:', data);
        addEvent(`👁️ Message read: ID ${data.message_id}`);
      });

      // استمع لأي حدث آخر للتصحيح
      channel.bind('pusher:*', (eventName, data) => {
        console.log(`🔍 Pusher internal event: ${eventName}`, data);
      });

      addEvent('📡 Attempting to subscribe to chat-app channel...');

    } catch (error) {
      console.error('Subscription failed:', error);
      addEvent(`❌ Subscription failed: ${error.message}`);
    }
  };

  const unsubscribeFromChannel = () => {
    try {
      pusherClient.unsubscribe('chat-app');
      setIsSubscribed(false);
      addEvent('🔇 Unsubscribed from chat-app channel');
    } catch (error) {
      console.error('Unsubscribe failed:', error);
    }
  };

  const testConnection = () => {
    if (!pusherClient) {
      addEvent('❌ Pusher client not initialized');
      return;
    }

    addEvent('🔄 Testing Pusher connection...');
    
    // محاولة الاتصال إذا لم يكن متصلاً
    if (connectionState !== 'connected') {
      pusherClient.connect();
    }

    // اختبار الاشتراك
    subscribeToChannel();
  };

  const sendTestMessage = async () => {
    if (!testMessage.trim()) return;

    try {
      // الحصول على التوكن بشكل آمن
      let token = '';
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('accessToken') || '';
      }

      const response = await fetch('/api/test-pusher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: testMessage,
          channel: 'chat-app',
          event: 'new-upcoming-message'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        addEvent(`📤 Test message sent: "${testMessage}"`);
        setTestMessage("");
      } else {
        addEvent(`❌ Failed to send test message: ${data.error}`);
      }
    } catch (error) {
      console.error('Send test message error:', error);
      addEvent(`❌ Error sending test message: ${error.message}`);
    }
  };

  const getStatusColor = (state) => {
    switch (state) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (state) => {
    switch (state) {
      case 'connected': return 'متصل';
      case 'connecting': return 'جاري الاتصال...';
      case 'disconnected': return 'غير متصل';
      case 'not_initialized': return 'غير مهيأ';
      default: return state;
    }
  };

  // دالة لفتح Pusher Debug Console
  const openPusherDebug = () => {
    if (typeof window !== 'undefined' && pusherClient) {
      (window).pusherClient = pusherClient;
      console.log('🔍 Pusher Client:', pusherClient);
      console.log('🔗 Connection:', pusherClient.connection);
      console.log('📡 Channels:', pusherClient.channels?.channels);
      
      // فتح نافذة جديدة للتصحيح
      const debugWindow = window.open('', '_blank');
      if (debugWindow) {
        debugWindow.document.write(`
          <html>
            <head>
              <title>Pusher Debug</title>
              <style>
                body { font-family: monospace; padding: 20px; background: #f5f5f5; }
                pre { background: white; padding: 10px; border-radius: 5px; overflow-x: auto; }
                .section { margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <h1>Pusher Debug Information</h1>
              <div class="section">
                <h2>Connection State:</h2>
                <pre>${JSON.stringify(pusherClient.connection?.state, null, 2)}</pre>
              </div>
              <div class="section">
                <h2>Socket ID:</h2>
                <pre>${pusherClient.connection?.socket_id || 'N/A'}</pre>
              </div>
              <div class="section">
                <h2>Subscribed Channels:</h2>
                <pre>${JSON.stringify(Object.keys(pusherClient.channels?.channels || {}), null, 2)}</pre>
              </div>
              <div class="section">
                <h2>Events Log:</h2>
                <pre>${JSON.stringify(events.slice(0, 10), null, 2)}</pre>
              </div>
            </body>
          </html>
        `);
      }
      addEvent('🔍 تم فتح نافذة التصحيح');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">اختبار Pusher</h1>
          <p className="text-gray-600 mb-4">صفحة لاختبار اتصال Pusher واستقبال الرسائل المباشرة</p>
          
          {/* Status Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">حالة الاتصال:</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(connectionState)}`}></div>
                  <span>{getStatusText(connectionState)}</span>
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Socket ID: {pusherClient?.connection?.socket_id || 'N/A'}
              </div>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">حالة القناة:</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isSubscribed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>{isSubscribed ? 'مشترك' : 'غير مشترك'}</span>
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                القناة: chat-app
              </div>
            </div>
          </div>

          {/* Connection Controls */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={testConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔗 اختبار الاتصال
            </button>
            
            <button
              onClick={subscribeToChannel}
              disabled={connectionState !== 'connected' || isSubscribed}
              className={`px-4 py-2 rounded-lg transition-colors ${
                connectionState !== 'connected' || isSubscribed
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              📡 الاشتراك في القناة
            </button>
            
            <button
              onClick={unsubscribeFromChannel}
              disabled={!isSubscribed}
              className={`px-4 py-2 rounded-lg transition-colors ${
                !isSubscribed
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              🔇 إلغاء الاشتراك
            </button>
            
            <button
              onClick={openPusherDebug}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              🔍 فتح نافذة التصحيح
            </button>
          </div>

          {/* Test Message Input */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">إرسال رسالة اختبار</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="اكتب رسالة اختبار..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
              />
              <button
                onClick={sendTestMessage}
                disabled={!testMessage.trim()}
                className={`px-4 py-2 rounded-lg ${
                  !testMessage.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                إرسال
              </button>
            </div>
          </div>
        </div>

        {/* Events Log */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">سجل الأحداث</h2>
            <div className="flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(events, null, 2))}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                title="نسخ السجل"
              >
                📋 نسخ
              </button>
              <button
                onClick={() => setEvents([])}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              >
                مسح السجل
              </button>
            </div>
          </div>
          
          <div className="h-96 overflow-y-auto bg-gray-50 rounded-lg p-4">
            {events.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                لا توجد أحداث حتى الآن. ابدأ باختبار الاتصال.
              </div>
            ) : (
              <div className="space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg ${
                      event.message.includes('✅') ? 'bg-green-50 border border-green-100' :
                      event.message.includes('❌') ? 'bg-red-50 border border-red-100' :
                      event.message.includes('⚠️') ? 'bg-yellow-50 border border-yellow-100' :
                      event.message.includes('📨') ? 'bg-blue-50 border border-blue-100' :
                      'bg-white border border-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium break-words max-w-[80%]">{event.message}</div>
                      <div className="text-sm text-gray-500 whitespace-nowrap ml-2">
                        {event.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-500 mt-4 flex justify-between items-center">
            <span>{events.length} حدث • يتم تحديث السجل تلقائياً</span>
            <span className="text-xs">آخر ID: {events[0]?.id?.split('_')[0] || 'N/A'}</span>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-gray-800 text-gray-200 rounded-lg">
          <h3 className="font-medium mb-2">معلومات التصحيح:</h3>
          <div className="text-sm font-mono space-y-1">
            <div>
              NEXT_PUBLIC_PUSHER_APP_KEY: {
                process.env.NEXT_PUBLIC_PUSHER_APP_KEY
                  ? '••••' + process.env.NEXT_PUBLIC_PUSHER_APP_KEY.slice(-4) 
                  : 'NOT SET'
              }
            </div>
            <div>
              NEXT_PUBLIC_PUSHER_CLUSTER: {
                process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1 (default)'
              }
            </div>
            <div>
              Token exists: {tokenExists ? '✅ Yes' : '❌ No'}
            </div>
            <div>
              Current time: {new Date().toLocaleTimeString()}
            </div>
            <div>
              Event counter: {eventCounter.current}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700">
            <h4 className="font-medium mb-2">نصائح للتصحيح:</h4>
            <ul className="text-xs space-y-1">
              <li>1. تحقق من متغيرات البيئة في ملف .env.local</li>
              <li>2. تأكد من أن Backend يرسل إلى القناة الصحيحة</li>
              <li>3. افتح نافذة التصحيح لمزيد من المعلومات</li>
              <li>4. تحقق من كونسول المطور (F12) لتفاصيل WebSocket</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}