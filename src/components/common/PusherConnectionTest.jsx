'use client';

import { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import usePusher from '@/hooks/usePusher';

export default function PusherConnectionTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  
  const {
    isConnected,
    connectionState,
    reconnect
  } = usePusher();

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // اختبار WebSocket مباشرة
      const wsTest = await testWebSocket();
      
      if (wsTest.success) {
        setTestResult({
          success: true,
          message: '✅ اتصال WebSocket يعمل بشكل صحيح',
          details: wsTest
        });
      } else {
        setTestResult({
          success: false,
          message: '❌ فشل اتصال WebSocket',
          details: wsTest
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: '❌ خطأ في اختبار الاتصال',
        error: error.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  const testWebSocket = () => {
    return new Promise((resolve) => {
      const PUSHER_APP_KEY = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
      const PUSHER_APP_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER;
      
      if (!PUSHER_APP_KEY || PUSHER_APP_KEY === 'your-pusher-key') {
        resolve({
          success: false,
          error: 'مفتاح Pusher غير مضبوط'
        });
        return;
      }

      const ws = new WebSocket(
        `wss://ws-${PUSHER_APP_CLUSTER}.pusher.com/app/${PUSHER_APP_KEY}?protocol=7&client=js&version=8.4.0`
      );

      const timeout = setTimeout(() => {
        ws.close();
        resolve({
          success: false,
          error: 'انتهت مهلة الاتصال'
        });
      }, 5000);

      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        resolve({
          success: true,
          message: 'اتصال WebSocket ناجح'
        });
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        ws.close();
        resolve({
          success: false,
          error: 'فشل الاتصال',
          details: error
        });
      };
    });
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="text-green-500" size={20} />
          ) : (
            <WifiOff className="text-red-600" size={20} />
          )}
          <h3 className="font-bold text-gray-800">حالة اتصال Pusher</h3>
        </div>
        
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {connectionState}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`} />
          <span className="text-gray-600">
            {isConnected ? 'متصل بخدمة Pusher' : 'غير متصل'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            process.env.NEXT_PUBLIC_PUSHER_APP_KEY && 
            process.env.NEXT_PUBLIC_PUSHER_APP_KEY !== 'your-pusher-key'
              ? 'bg-green-500' 
              : 'bg-red-500'
          }`} />
          <span className="text-gray-600">
            {process.env.NEXT_PUBLIC_PUSHER_APP_KEY && 
             process.env.NEXT_PUBLIC_PUSHER_APP_KEY !== 'your-pusher-key'
              ? 'مفتاح Pusher مضبوط' 
              : 'مفتاح Pusher غير مضبوط'}
          </span>
        </div>

        {testResult && (
          <div className={`mt-3 p-3 rounded-lg ${
            testResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start gap-2">
              {testResult.success ? (
                <CheckCircle className="text-green-500 mt-0.5" size={16} />
              ) : (
                <AlertCircle className="text-red-600 mt-0.5" size={16} />
              )}
              <div>
                <p className={`font-medium ${
                  testResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {testResult.message}
                </p>
                {testResult.details && (
                  <p className="text-xs text-gray-600 mt-1">
                    {JSON.stringify(testResult.details)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={testConnection}
            disabled={isTesting}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isTesting ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                جاري الاختبار...
              </>
            ) : (
              <>
                <Wifi size={16} />
                اختبار الاتصال
              </>
            )}
          </button>

          <button
            onClick={reconnect}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <RefreshCw size={16} />
            إعادة الاتصال
          </button>
        </div>
      </div>
    </div>
  );
}