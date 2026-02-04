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
    isFirebaseInitialized,
    requestNotificationPermission,
    addActionToast
  } = useNotification();

  useEffect(() => {
    // إضافة تأخير أكبر للتأكد من تحميل السياق
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
      
      // شروط عرض البوب أب:
      // 1. الإذن ليس 'denied'
      // 2. لم يتم التخطي من قبل
      // 3. لم يتم العرض في هذه الجلسة
      // 4. ليس لديه token مسجل بالفعل
      const shouldShow = (
        permission !== 'denied' &&
        !skipped && 
        !shown && 
        !deviceCheck.hasToken
      );
      
      if (shouldShow) {
        console.log('🔔 Showing notification popup');
        setShow(true);
        sessionStorage.setItem('popup_shown', 'true');
      }
    }, 3000); // زيادة التأخير إلى 3 ثواني

    return () => clearTimeout(timer);
  }, [notificationPermission, isFirebaseInitialized, checkDeviceRegistration]);

 const handleAllow = async () => {
  try {
    setLoading(true);
    console.log('🔔 User clicked allow, requesting permission...');
    
    // 1. طلب الإذن من المستخدم
    const permissionResult = await requestNotificationPermission();
    
    if (!permissionResult.success) {
      console.log('❌ Permission request failed:', permissionResult.message);
      
      // إذا تم رفض الإذن، تخزين التخطي
      if (permissionResult.message.includes('رفض') || 
          permissionResult.message.includes('denied') ||
          permissionResult.message.includes('رخصة')) {
        localStorage.setItem('notifications_skipped', 'true');
      }
      
      setShow(false);
      return;
    }
    
    console.log('✅ Permission granted, proceeding with FCM setup...');
    
    // 2. الحصول على FCM Token
    const fcmToken = await getFCMToken();
    
    if (!fcmToken) {
      console.log('⚠️ No FCM token obtained, hiding popup');
      addActionToast('لم يتم الحصول على رمز الإشعارات', 'warning');
      setShow(false);
      return;
    }
    
    console.log('✅ FCM Token obtained:', fcmToken.substring(0, 20) + '...');
    
    // 3. عمل API call مباشرة لتسجيل الجهاز
    console.log('🔔 Making API call to register device...');
    const apiResult = await registerDeviceDirect(fcmToken);
    
    if (apiResult.success) {
      console.log('✅ Device registered successfully with API');
      addActionToast('تم تفعيل الإشعارات بنجاح!', 'success');
    } else {
      console.error('❌ API registration failed:', apiResult.message);
      
      // حتى إذا فشل API، نحفظ التوكن محلياً
      localStorage.setItem('fcm_token', fcmToken);
      localStorage.setItem('fcm_token_updated', new Date().toISOString());
      addActionToast('تم تفعيل الإشعارات محلياً', 'info');
    }
    
    // إخفاء البوب أب بعد النجاح
    setTimeout(() => {
      setShow(false);
    }, 1000);
    
  } catch (error) {
    console.error('💥 Error in handleAllow:', error);
    addActionToast('حدث خطأ أثناء التفعيل', 'error');
    setShow(false);
  } finally {
    setLoading(false);
  }
};

// دالة جديدة لعمل API call مباشر
const registerDeviceDirect = async (fcmToken) => {
  try {
    // إنشاء session_id فريد
    const generateSessionId = () => {
      return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    };
    
    // الحصول على اسم الجهاز
    const getDeviceName = () => {
      const userAgent = navigator.userAgent;
      let deviceName = 'Web Device';
      
      if (/android/i.test(userAgent)) {
        deviceName = 'Android Device';
      } else if (/iPad|iPhone|iPod/.test(userAgent)) {
        deviceName = 'iOS Device';
      } else if (/Macintosh|Mac/.test(userAgent)) {
        deviceName = 'Mac Device';
      } else if (/Windows/.test(userAgent)) {
        deviceName = 'Windows Device';
      } else if (/Linux/.test(userAgent)) {
        deviceName = 'Linux Device';
      }
      
      if (/Chrome/.test(userAgent)) {
        deviceName += ' (Chrome)';
      } else if (/Firefox/.test(userAgent)) {
        deviceName += ' (Firefox)';
      } else if (/Safari/.test(userAgent)) {
        deviceName += ' (Safari)';
      }
      
      return deviceName;
    };
    
    // الحصول على نوع الجهاز
    const getDeviceType = () => {
      const ua = navigator.userAgent.toLowerCase();
      if (/android/.test(ua)) return 'android';
      if (/iphone|ipad|ipod/.test(ua)) return 'ios';
      if (/windows phone/.test(ua)) return 'windows';
      return 'web';
    };
    
    // إعداد البيانات للـ API
    const deviceData = {
      token: fcmToken,
      device_type: getDeviceType(),
      device_name: getDeviceName(),
      app_version: '1.0.0',
      session_id: generateSessionId()
    };
    
    console.log('🔔 Sending device data to API:', deviceData);
    
    // عمل API call مباشر
    const API_BASE_URL = 'https://moya.talaaljazeera.com/api/v1';
    const url = `${API_BASE_URL.replace(/\/$/, '')}/notifications/register-device`;
    
    // إعداد headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // إضافة token المصادقة إذا كان موجوداً
    const authToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(deviceData),
      mode: 'cors'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return {
        success: false,
        message: `خطأ ${response.status}: ${response.statusText}`
      };
    }
    
    const responseData = await response.json();
    console.log('✅ API Response:', responseData);
    
    if (responseData && (responseData.status === true || responseData.success === true)) {
      // حفظ بيانات النجاح في localStorage
      localStorage.setItem('device_registered', 'true');
      localStorage.setItem('device_session_id', deviceData.session_id);
      localStorage.setItem('current_device_id', responseData.data?.device_id || 'firebase-device-' + Date.now());
      
      if (responseData.data) {
        localStorage.setItem('device_info', JSON.stringify(responseData.data));
      }
      
      return {
        success: true,
        message: responseData.message || 'تم تسجيل الجهاز بنجاح',
        data: responseData.data
      };
    }
    
    return {
      success: false,
      message: responseData?.message || 'فشل في تسجيل الجهاز'
    };
    
  } catch (error) {
    console.error('❌ Error in direct API call:', error);
    return {
      success: false,
      message: error.message || 'خطأ في الاتصال بالخادم'
    };
  }
};

  const handleSkip = () => {
    console.log('🔔 User skipped notifications');
    localStorage.setItem('notifications_skipped', 'true');
    setShow(false);
    addActionToast('يمكنك تفعيل الإشعارات لاحقاً من الإعدادات', 'info');
  };

  // إخفاء البوب أب إذا كان الإذن مرفوضاً
  useEffect(() => {
    if (notificationPermission === 'denied') {
      console.log('🔔 Permission already denied, hiding popup');
      setShow(false);
      localStorage.setItem('notifications_skipped', 'true');
    }
  }, [notificationPermission]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999999] p-2 md:p-5 animate-fadeIn">
      <div className="bg-white rounded-2xl p-3 md:p-8 max-w-md w-full text-center shadow-2xl animate-slideUp">
        <div className="mb-2 md:mb-7">
          <div className="md:w-20 md:h-20 w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-blue-100">
            <Bell size={30} className="text-blue-500" />
          </div>
          
          <h2 className="md:text-2xl font-bold text-blue-800 md:mb-3 mb-1 text-lg">
            هل تريد تفعيل الإشعارات؟
          </h2>
          
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            سيسمح لنا هذا بإرسال إشعارات فورية عن:
            <br />
            • تحديثات الطلبات
            <br />
            • الرسائل الجديدة
            <br />
            • العروض والتخفيضات
          </p>
        </div>
        
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
            تخطي الآن
          </button>
        </div>
        
        <div className="mt-3 md:mt-4 text-xs text-gray-400">
          <p>يمكنك تغيير هذا الإعداد لاحقاً من إعدادات المتصفح</p>
        </div>
      </div>
    </div>
  );
}