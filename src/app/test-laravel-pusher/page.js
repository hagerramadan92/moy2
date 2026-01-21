"use client";
import React, { useState, useEffect } from "react";
import { pusherClient } from "@/lib/pusherClient";

export default function TestLaravelPusherPage() {
  const [userId, setUserId] = useState("");
  const [connectionState, setConnectionState] = useState('disconnected');
  const [events, setEvents] = useState([]);
  const [testChannel, setTestChannel] = useState("private-chat.39");
  const [testEvent, setTestEvent] = useState("message.sent");
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserId(localStorage.getItem('userId') || "39");
      setTestChannel(`private-chat.${localStorage.getItem('userId') || "39"}`);
    }
  }, []);

  useEffect(() => {
    if (!pusherClient) return;

    pusherClient.connection.bind('connected', () => {
      setConnectionState('connected');
      addEvent('✅ متصل بـ Laravel Broadcasting');
    });

    pusherClient.connection.bind('disconnected', () => {
      setConnectionState('disconnected');
      addEvent('❌ تم قطع الاتصال');
    });

    return () => {
      pusherClient.disconnect();
    };
  }, []);

  const addEvent = (message, data = null) => {
    const id = `${Date.now()}_${Math.random()}`;
    setEvents(prev => [{
      id,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev.slice(0, 20)]);
  };

  const subscribeToChannel = () => {
    try {
      addEvent(`📡 جاري الاشتراك في ${testChannel}...`);
      
      const channel = pusherClient.subscribeToLaravelChannel(testChannel, {
        onSubscribed: (data) => {
          addEvent(`✅ تم الاشتراك في ${testChannel}`, data);
          setChannels(prev => [...prev, testChannel]);
        },
        onEvent: (eventName, data) => {
          addEvent(`📨 حدث ${eventName} من ${testChannel}`, data);
        },
        events: {
          'message.sent': (data) => addEvent('📤 تم إرسال رسالة', data),
          'chat.created': (data) => addEvent('💬 تم إنشاء محادثة جديدة', data),
          'message.read': (data) => addEvent('👁️ تمت قراءة رسالة', data)
        }
      });
      
    } catch (error) {
      addEvent(`❌ فشل الاشتراك: ${error.message}`);
    }
  };

  const testLaravelAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('/api/broadcasting/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          socket_id: 'test_socket_id_123',
          channel_name: testChannel
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        addEvent('✅ مصادقة Laravel ناجحة', data);
      } else {
        addEvent(`❌ فشل المصادقة: ${data.error}`);
      }
    } catch (error) {
      addEvent(`❌ خطأ في المصادقة: ${error.message}`);
    }
  };

  const sendTestToLaravel = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // إرسال رسالة حقيقية عبر Laravel API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://moya.talaaljazeera.com/api/v1'}/chats/25/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            message: `Test from Next.js at ${new Date().toLocaleTimeString()}`,
            message_type: "text",
            metadata: []
          })
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        addEvent('📤 تم إرسال رسالة عبر Laravel API', data);
      } else {
        addEvent(`❌ فشل إرسال الرسالة: ${data.message}`);
      }
    } catch (error) {
      addEvent(`❌ خطأ في الإرسال: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">اختبار Laravel + Pusher</h1>
          <p className="text-gray-600 mb-4">اختبار تكامل Next.js مع Laravel Broadcasting</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="font-medium text-blue-800 mb-1">حالة الاتصال</div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                connectionState === 'connected' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {connectionState === 'connected' ? '✅ متصل' : '❌ غير متصل'}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="font-medium text-blue-800 mb-1">معرف المستخدم</div>
              <div className="font-mono">{userId || 'غير محدد'}</div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="font-medium text-blue-800 mb-1">القنوات المشتركة</div>
              <div className="text-sm">{channels.length} قناة</div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                قناة الاختبار (Laravel Channel)
              </label>
              <input
                type="text"
                value={testChannel}
                onChange={(e) => setTestChannel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="مثال: private-chat.39"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={subscribeToChannel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                📡 الاشتراك في القناة
              </button>
              
              <button
                onClick={testLaravelAuth}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🔐 اختبار مصادقة Laravel
              </button>
              
              <button
                onClick={sendTestToLaravel}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                📤 إرسال رسالة عبر Laravel
              </button>
              
              <button
                onClick={() => {
                  console.log('Pusher:', pusherClient);
                  console.log('Channels:', pusherClient?.channels?.channels);
                  addEvent('🔍 تم عرض التفاصيل في الكونسول');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                🔍 عرض التفاصيل
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">سجل الأحداث</h2>
          
          <div className="h-96 overflow-y-auto bg-gray-50 rounded-lg p-4">
            {events.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                لا توجد أحداث حتى الآن. ابدأ باختبار الاشتراك.
              </div>
            ) : (
              <div className="space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border ${
                      event.message.includes('✅') ? 'bg-green-50 border-green-200' :
                      event.message.includes('❌') ? 'bg-red-50 border-red-200' :
                      event.message.includes('📨') ? 'bg-blue-50 border-blue-200' :
                      'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{event.message}</div>
                        {event.data && (
                          <div className="mt-1 text-xs text-gray-600 bg-gray-100 p-2 rounded">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(event.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 whitespace-nowrap ml-2">
                        {event.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}