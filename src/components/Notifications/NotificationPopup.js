'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

export default function NotificationPopup() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { 
    getFCMToken, 
    registerDevice, 
    checkDeviceRegistration,
    notificationPermission,
    isFirebaseInitialized 
  } = useNotification();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window === 'undefined') return;
      
      const permission = notificationPermission;
      const skipped = localStorage.getItem('notifications_skipped');
      const shown = sessionStorage.getItem('popup_shown');
      const deviceCheck = checkDeviceRegistration();
      
      console.log('🔔 Popup check:', {
        permission,
        skipped,
        shown,
        deviceCheck,
        isFirebaseInitialized
      });
      
      // عرض البوب أب إذا:
      // 1. الإذن default أو granted
      // 2. لم يتم التخطي
      // 3. لم يتم العرض من قبل
      // 4. Firebase غير مفعل أو الجهاز غير مسجل
      if (
        (permission === 'default' || permission === 'granted') &&
        !skipped && 
        !shown && 
        !deviceCheck.hasToken
      ) {
        setShow(true);
        sessionStorage.setItem('popup_shown', 'true');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [notificationPermission, isFirebaseInitialized]);

  const handleAllow = async () => {
    try {
      setLoading(true);
      
      let permission = notificationPermission;
      
      // إذا كان الإذن default، اطلبه
      if (permission === 'default') {
        // استخدام دالة requestNotificationPermission من Context
        const result = await window.Notification.requestPermission();
        permission = result;
      }
      
      if (permission !== 'granted') {
        setShow(false);
        localStorage.setItem('notifications_skipped', 'true');
        return;
      }
      
      // الحصول على FCM Token
      const fcmToken = await getFCMToken();
      
      if (fcmToken) {
        // تسجيل الجهاز
        try {
          await registerDevice(fcmToken);
          
          // إخفاء البوب أب بعد نجاح التسجيل
          setTimeout(() => {
            setShow(false);
          }, 1000);
          
        } catch (error) {
          console.error('❌ Error registering device:', error);
          setShow(false);
        }
      } else {
        console.error('❌ Failed to get FCM token');
        setShow(false);
      }
      
    } catch (error) {
      console.error('💥 Error in handleAllow:', error);
      setShow(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('notifications_skipped', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999999] p-2 md:p-5 animate-fadeIn">
      <div className="bg-white rounded-2xl p-3 md:p-8 max-w-md w-full text-center shadow-2xl animate-slideUp">
        <div className="mb-2 md:mb-7">
          {/* أيقونة الجرس */}
          <div className="md:w-20 md:h-20 w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-blue-100">
            <Bell size={30} className="text-blue-500" />
          </div>
          
          {/* السؤال */}
          <h2 className="md:text-2xl font-bold text-blue-800 md:mb-3 mb-1 text-lg">
            هل تريد تفعيل الإشعارات؟
          </h2>
          
          {/* الوصف */}
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            اسمح لنا بإرسال إشعارات إليك لتبقى على اطلاع دائم بآخر التحديثات.
          </p>
        </div>
        
        {/* الأزرار */}
        <div className="flex flex-col gap-2 md:gap-3 md:mt-6 mt-2">
          <button 
            onClick={handleAllow}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold
             md:py-4 md:px-6 py-2 px-2 rounded-md md:rounded-xl transition-all duration-200 
             hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-blue-500/30 
             hover:shadow-blue-500/40 disabled:opacity-70 disabled:cursor-not-allowed 
             disabled:hover:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري التفعيل...
              </span>
            ) : 'تفعيل الإشعارات'}
          </button>
          
          <button 
            onClick={handleSkip}
            disabled={loading}
            className="bg-transparent hover:bg-gray-50
             text-gray-500 font-medium md:py-4 md:px-6 py-1 px-2 
             rounded-md md:rounded-xl border-2 border-gray-200 
             transition-all duration-200 hover:-translate-y-0.5 
             active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed 
             disabled:hover:transform-none"
          >
            لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
}