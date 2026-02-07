'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createPusherInstance, getConnectionState, reconnectPusher } from '@/utils/pusher';
import Spinner from '@/components/ui/spinner';

const PusherContext = createContext(null);

export const PusherProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');

  useEffect(() => {
    // تهيئة Pusher عند تحميل المكون
    const init = async () => {
      try {
        const pusher = createPusherInstance();
        
        if (pusher) {
          // مراقبة تغييرات حالة الاتصال
          pusher.connection.bind('state_change', (states) => {
            setConnectionState(states.current);
            
            // محاولة إعادة الاتصال تلقائياً عند فقدان الاتصال
            if (states.current === 'disconnected') {
              console.log('🔌 Pusher disconnected, attempting to reconnect...');
              setTimeout(() => {
                if (getConnectionState() === 'disconnected') {
                  reconnectPusher();
                }
              }, 3000);
            }
          });
          
          setIsInitialized(true);
          console.log('🚀 PusherProvider initialized');
        } else {
          setIsInitialized(true);
          console.warn('⚠️ Pusher could not be initialized');
        }
      } catch (error) {
        console.error('❌ Error initializing PusherProvider:', error);
        setIsInitialized(true);
      }
    };

    init();

    return () => {
      // تنظيف عند إلغاء المكون
      const pusher = getPusherInstance();
      if (pusher) {
        pusher.disconnect();
      }
    };
  }, []);

  const value = {
    isInitialized,
    connectionState,
    reconnect: reconnectPusher
  };

  if (!isInitialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <div className="text-center">
            <p className="text-gray-700 font-medium">جاري تهيئة الاتصال...</p>
            <p className="text-gray-500 text-sm mt-1">يرجى الانتظار</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PusherContext.Provider value={value}>
      {children}
      
      {/* Connection Status Indicator */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border ${
          connectionState === 'connected' 
            ? 'bg-green-500/10 text-green-700 border-green-500/20' 
            : connectionState === 'connecting'
            ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'
            : 'bg-red-500/10 text-red-700 border-red-500/20'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionState === 'connected' 
                ? 'bg-green-500 animate-pulse' 
                : connectionState === 'connecting'
                ? 'bg-yellow-500 animate-pulse'
                : 'bg-red-500'
            }`} />
            <span>
              {connectionState === 'connected' 
                ? 'متصال' 
                : connectionState === 'connecting'
                ? 'جاري الاتصال...'
                : 'غير متصل'}
            </span>
          </div>
        </div>
      </div>
    </PusherContext.Provider>
  );
};

export const usePusherContext = () => {
  const context = useContext(PusherContext);
  if (!context) {
    throw new Error('usePusherContext must be used within PusherProvider');
  }
  return context;
};

export default PusherProvider;