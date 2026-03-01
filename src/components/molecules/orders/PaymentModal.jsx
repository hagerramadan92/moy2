'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FaCreditCard,
  FaWallet,
} from "react-icons/fa";
import { MdCalendarToday, MdAccessTime, MdClose } from "react-icons/md";
import { BiErrorCircle } from "react-icons/bi";
import { API_BASE_URL, getAccessToken, getDeviceId, getIpAddress } from './utils/api';
import Pusher from 'pusher-js';

/* =============================
   ربط icon string من API بـ react-icons
============================= */
const ICONS_MAP = {
  "credit-card": FaCreditCard,
  wallet: FaWallet,
  calendar: MdCalendarToday,
  clock: MdAccessTime,
};

export default function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  selectedDriverId,
  selectedOfferId,
  orderId,
  offerAmount,
  onOfferExpired,
  setPendingPaymentOfferId,
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentCompleted, // ✅ callback جديد - يتم استدعاؤه عند إتمام الدفع (للمحفظة أو عند الاستلام)
  router,
}) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [processingMethod, setProcessingMethod] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [showPaymentStatus, setShowPaymentStatus] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'failure'
  const [tripData, setTripData] = useState(null); // تخزين بيانات الرحلة
  const [successMessage, setSuccessMessage] = useState(''); // رسالة النجاح المخصصة
  const [paymentType, setPaymentType] = useState(''); // نوع الدفع (wallet, cash, gateway)
  
  // Refs للتتبع
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const paymentInitiatedRef = useRef(false);
  const currentOrderIdRef = useRef(orderId);
  const currentDriverIdRef = useRef(selectedDriverId);
  const successShownRef = useRef(false); // منع عرض شاشة النجاح أكثر من مرة
  const fetchAttemptedRef = useRef(false); // منع محاولات الجلب المتكررة

  // تحديث refs عند تغيير props - ✅ مهم جداً
  useEffect(() => {
    console.log('🔄 PaymentModal: Updating refs with new props', { orderId, selectedDriverId });
    currentOrderIdRef.current = orderId;
    currentDriverIdRef.current = selectedDriverId;
    
    // إعادة تعيين بعض الـ refs عندما يتغير orderId
    if (orderId) {
      paymentInitiatedRef.current = false;
      successShownRef.current = false;
      
      // التحقق من وجود بيانات دفع معلقة
      const pendingData = sessionStorage.getItem('paymentCallbackData');
      if (pendingData) {
        try {
          const parsedData = JSON.parse(pendingData);
          if (parsedData.orderId === orderId) {
            console.log('📦 Found pending payment data for order:', orderId);
            setupPusherListener(orderId);
          }
        } catch (error) {
          console.error('Error checking pending payment:', error);
        }
      }
    }
  }, [orderId, selectedDriverId]);

  /* =============================
     إعداد Pusher للاستماع للحدث الخاص بالمستخدم
  ============================== */
  const setupPusherListener = (orderId) => {
    try {
      // تنظيف الاتصال السابق إذا وجد
      if (channelRef.current) {
        channelRef.current.unbind_all();
        channelRef.current.unsubscribe();
      }
      
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }

      // إعادة تعيين ref النجاح عند إعداد مستمع جديد
      successShownRef.current = false;

      // إنشاء اتصال Pusher جديد
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        authEndpoint: `${API_BASE_URL}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            Accept: 'application/json',
          },
        },
      });

      // الاشتراك في القناة الخاصة بالطلب
      const channelName = `order.${orderId}`;
      console.log('🔔 Subscribing to channel:', channelName);
      channelRef.current = pusherRef.current.subscribe(channelName);

      // الاستماع للحدث TripStartedForUser
      const eventName = 'TripStartedForUser';
      
      channelRef.current.bind(eventName, (data) => {
        console.log('🎉 Pusher event received - TripStartedForUser:', data);
        
        // التأكد من أننا لم نعرض النجاح من قبل
        if (successShownRef.current) {
          console.log('Success already shown, ignoring event');
          return;
        }
        
        // حفظ بيانات الرحلة
        setTripData(data);
        
        // التحقق من حالة الدفع والرحلة
        if (data.paid_at || data.order?.payment_status === 'paid') {
          // دفع ناجح وبدء الرحلة - نعرض شاشة النجاح فقط هنا
          successShownRef.current = true;
          setPaymentStatus('success');
          setSuccessMessage('تم الدفع بنجاح! جاري تحويلك لصفحة تفاصيل الطلب...');
          setShowPaymentStatus(true);
          
          // استدعاء callback النجاح
          if (onPaymentSuccess) {
            onPaymentSuccess(data);
          }
          
          // ✅ استدعاء callback إتمام الدفع لتحديث حالة العرض في الصفحة الرئيسية
          if (onPaymentCompleted) {
            onPaymentCompleted(selectedOfferId, 'paid');
          }
          
          // مسح بيانات الدفع من الجلسة
          sessionStorage.removeItem('paymentCallbackData');
          localStorage.removeItem('pendingOfferData');
          
          // تأخير التوجيه لصفحة تفاصيل الطلب
          setTimeout(() => {
            if (router) {
              router.push(`/myProfile/orders/${orderId}`);
            }
            onClose();
          }, 3000);
        }
      });

      // الاستماع لأي أحداث أخرى متعلقة بالدفع
      channelRef.current.bind('payment.succeeded', (data) => {
        console.log('💰 Payment succeeded event:', data);
        // نعرض شاشة النجاح فقط عند نجاح الدفع الفعلي
        if (!successShownRef.current) {
          successShownRef.current = true;
          setPaymentStatus('success');
          setSuccessMessage('تم الدفع بنجاح! جاري تحويلك لصفحة تفاصيل الطلب...');
          setShowPaymentStatus(true);
          
          if (onPaymentSuccess) {
            onPaymentSuccess(data);
          }
          
          // ✅ استدعاء callback إتمام الدفع لتحديث حالة العرض في الصفحة الرئيسية
          if (onPaymentCompleted) {
            onPaymentCompleted(selectedOfferId, 'paid');
          }
          
          sessionStorage.removeItem('paymentCallbackData');
          localStorage.removeItem('pendingOfferData');
          
          setTimeout(() => {
            if (router) {
              router.push(`/myProfile/orders/${orderId}`);
            }
            onClose();
          }, 3000);
        }
      });

      channelRef.current.bind('payment.failed', (data) => {
        console.log('❌ Payment failed event:', data);
        // نعرض شاشة الفشل عند فشل الدفع
        setPaymentStatus('failure');
        setShowPaymentStatus(true);
        
        if (onPaymentFailure) {
          onPaymentFailure(data);
        }
      });

      // الاستماع لأخطاء الاتصال
      pusherRef.current.connection.bind('error', (err) => {
        console.error('Pusher connection error:', err);
      });

      // الاستماع لحالة الاتصال
      pusherRef.current.connection.bind('connected', () => {
        console.log('✅ Pusher connected successfully');
      });

    } catch (error) {
      console.error('Error setting up Pusher:', error);
    }
  };

  /* =============================
     GET payment methods
  ============================== */
  const fetchPaymentMethods = async () => {
    // منع المحاولات المتكررة
    if (fetchAttemptedRef.current) return;
    
    try {
      setLoadingMethods(true);
      setError(null); // مسح أي أخطاء سابقة
      fetchAttemptedRef.current = true;

      const accessToken = getAccessToken();
      
      if (!accessToken) {
        setError('يرجى تسجيل الدخول أولاً');
        setLoadingMethods(false);
        return;
      }

      console.log('Fetching payment methods...');
      const res = await fetch(`${API_BASE_URL}/payment-methods`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      console.log('Payment methods response:', data);

      if (res.ok && data.status) {
        setPaymentMethods(data.data || []);
        console.log('Payment methods loaded:', data.data);
      } else {
        throw new Error(data.message || "فشل تحميل طرق الدفع");
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching payment methods:', err);
    } finally {
      setLoadingMethods(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      console.log('🔓 PaymentModal opened with orderId:', orderId);
      // إعادة تعيين ref عند الفتح
      fetchAttemptedRef.current = false;
      fetchPaymentMethods();
      
      // إعادة تعيين الحالات - نعرض فقط شاشة اختيار طرق الدفع
      setPaymentStatus(null);
      setShowPaymentStatus(false);
      setTripData(null);
      setError(null);
      paymentInitiatedRef.current = false;
      successShownRef.current = false;
      setProcessingMethod(null);
      setSelectedMethod(null);
      setSuccessMessage('');
      setPaymentType('');
      
      // التحقق من وجود بيانات دفع معلقة عند فتح المودال
      const pendingData = sessionStorage.getItem('paymentCallbackData');
      if (pendingData && orderId) {
        try {
          const parsedData = JSON.parse(pendingData);
          if (parsedData.orderId === orderId) {
            console.log('Found pending payment data, setting up Pusher listener');
            // إعداد مستمع Pusher على القناة الصحيحة
            setupPusherListener(orderId);
          }
        } catch (error) {
          console.error('Error checking pending payment:', error);
        }
      }
    } else {
      // Reset state when modal closes
      setSelectedMethod(null);
      setProcessingMethod(null);
      setError(null);
      setIsConfirming(false);
      setPaymentStatus(null);
      setShowPaymentStatus(false);
      setTripData(null);
      setSuccessMessage('');
      setPaymentType('');
      paymentInitiatedRef.current = false;
      successShownRef.current = false;
      fetchAttemptedRef.current = false;
      
      // تنظيف Pusher عند إغلاق المودال
      if (channelRef.current) {
        channelRef.current.unbind_all();
        channelRef.current.unsubscribe();
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    }

    // تنظيف عند إزالة المكون
    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        channelRef.current.unsubscribe();
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, [isOpen, orderId]);

  /* =============================
     Initiate Order Payment API
  ============================== */
  const initiateOrderPayment = async (orderId, offerId, gateway, paymentMethod, saveCard = false) => {
    const accessToken = getAccessToken();
    const deviceId = getDeviceId();
    const ipAddress = getIpAddress();

    console.log('Initiating payment with:', { orderId, offerId, gateway, paymentMethod });

    const res = await fetch(
      `${API_BASE_URL}/orders/payments/${orderId}/initiate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          offer_id: offerId,
          gateway: gateway,
          payment_method: paymentMethod,
          save_card: saveCard,
          metadata: {
            device_id: deviceId,
            ip_address: ipAddress
          }
        }),
      }
    );

    const data = await res.json();
    
    // طباعة الـ response من API
    console.log('Initiate Payment Response:', data);

    if (res.ok && data.status) {
      // تأكد من إرجاع البيانات كاملة
      return data;
    }

    throw new Error(data.message || "فشل بدء عملية الدفع");
  };

  /* =============================
     Handle Payment Method Click - Direct payment
  ============================== */
  const handlePaymentMethodClick = async (method) => {
    // منع تكرار النقر إذا كان هناك عملية جارية
    if (paymentInitiatedRef.current || processingMethod) return;
    
    try {
      setProcessingMethod(method.id);
      setError(null);
      paymentInitiatedRef.current = true;

      // Get the first payment method from the methods array, or use gateway id
      const paymentMethod = method.methods && method.methods.length > 0
        ? method.methods[0]
        : method.id;
      
      // Get save_card preference (default to false)
      const saveCard = false;
      
      // Step 1: Initiate order payment to get payment URL
      const paymentData = await initiateOrderPayment(
        orderId,
        selectedOfferId,
        method.id,
        paymentMethod,
        saveCard
      );
      
      // طباعة الـ response بالكامل للتحقق
      console.log('Full Payment Response:', JSON.stringify(paymentData, null, 2));

      // ========== منطق مختلف حسب طريقة الدفع ==========
      
      // 1. طريقة الدفع "عند الاستلام" - ينتقل مباشرة لتفاصيل الطلب
      if (method.id === 'cash_on_delivery' || method.id === 'cash' || method.id === 'cod') {
        console.log('💰 Cash on delivery selected - redirecting to order details');
        
        // تعيين نوع الدفع
        setPaymentType('cash');
        
        // عرض رسالة نجاح سريعة
        setPaymentStatus('success');
        setSuccessMessage('تم تأكيد الطلب بنجاح! جاري تحويلك لصفحة تفاصيل الطلب...');
        setShowPaymentStatus(true);
        
        // مسح أي بيانات معلقة
        sessionStorage.removeItem('paymentCallbackData');
        localStorage.removeItem('pendingOfferData');
        
        // تحديث حالة العرض
        if (setPendingPaymentOfferId && typeof setPendingPaymentOfferId === 'function') {
          setPendingPaymentOfferId(null); // مسح العرض المعلق لأنه تم تأكيده
        }
        
        // ✅ استدعاء callback إتمام الدفع لتحديث حالة العرض في الصفحة الرئيسية
        if (onPaymentCompleted) {
          onPaymentCompleted(selectedOfferId, 'paid');
        }
        
        // تأخير بسيط ثم التوجيه لصفحة تفاصيل الطلب
        setTimeout(() => {
          if (router) {
            router.push(`/myProfile/orders/${orderId}`);
          }
          onClose();
        }, 1500);
        
        return;
      }
      
      // 2. طريقة الدفع "المحفظة" - دفع فوري (لا يحتاج لتوجيه لرابط)
      if (method.id === 'wallet') {
        console.log('💰 Wallet payment selected - processing wallet payment');
        
        // تعيين نوع الدفع
        setPaymentType('wallet');
        
        // عرض رسالة نجاح
        setPaymentStatus('success');
        setSuccessMessage('تم الدفع من المحفظة بنجاح! جاري تحويلك لصفحة تفاصيل الطلب...');
        setShowPaymentStatus(true);
        
        // تحديث حالة العرض
        const offerStatus = 'paid'; // المحفظة تعني دفع فوري
        
        // حفظ بيانات العرض
        localStorage.setItem('pendingOfferData', JSON.stringify({
          orderId,
          offerId: selectedOfferId,
          driverId: selectedDriverId,
          status: offerStatus,
          paymentData: paymentData
        }));
        
        // تحديث حالة العرض
        if (offerStatus === 'paid') {
          if (setPendingPaymentOfferId && typeof setPendingPaymentOfferId === 'function') {
            setPendingPaymentOfferId(null); // مسح العرض المعلق لأنه تم دفعه
          }
        }
        
        // ✅ استدعاء callback إتمام الدفع لتحديث حالة العرض في الصفحة الرئيسية
        if (onPaymentCompleted) {
          onPaymentCompleted(selectedOfferId, 'paid');
        }
        
        // إعداد مستمع Pusher للمتابعة (اختياري)
        setupPusherListener(orderId);
        
        // تأخير بسيط ثم التوجيه لصفحة تفاصيل الطلب
        setTimeout(() => {
          if (router) {
            router.push(`/myProfile/orders/${orderId}`);
          }
          onClose();
        }, 2000);
        
        return;
      }
      
      // 3. بوابات الدفع الأخرى (مدى، تابي، تمارا) - تحتاج توجيه لرابط
      
      // تعيين نوع الدفع
      setPaymentType('gateway');
      
      // استخراج رابط الدفع مباشرة من payment_url
      let paymentUrl = paymentData.payment_url || null;
      
      // إذا لم نجد payment_url، نحاول البحث في المسارات الأخرى كـ fallback
      if (!paymentUrl) {
        // البحث في البيانات المتداخلة (احتياطي للتوافق مع الإصدارات السابقة)
        if (paymentData?.data?.payment?.payment_url) {
          paymentUrl = paymentData.data.payment.payment_url;
        } else if (paymentData?.data?.payment_url) {
          paymentUrl = paymentData.data.payment_url;
        }
      }

      if (paymentUrl) {
        // تحديث حالة العرض
        const offerStatus = paymentData?.data?.order?.status || 
                           paymentData?.data?.payment?.status || 
                           'pending_payment';
        
        // حفظ بيانات العرض
        localStorage.setItem('pendingOfferData', JSON.stringify({
          orderId,
          offerId: selectedOfferId,
          driverId: selectedDriverId,
          status: offerStatus,
          paymentData: paymentData
        }));
        
        // تحديث حالة العرض
        if (offerStatus === 'pending_payment' || offerStatus === 'accepted') {
          if (setPendingPaymentOfferId && typeof setPendingPaymentOfferId === 'function') {
            setPendingPaymentOfferId(selectedOfferId);
          }
        }

        // تخزين بيانات الدفع للمتابعة بعد العودة من بوابة الدفع
        const paymentCallbackData = {
          orderId,
          driverId: selectedDriverId,
          offerId: selectedOfferId,
          paymentId: paymentData?.data?.payment?.payment_id || 
                     paymentData?.data?.payment_id,
          sessionId: paymentData?.data?.payment?.session_id || 
                     paymentData?.data?.session_id,
          gateway: method.id
        };
        
        sessionStorage.setItem('paymentCallbackData', JSON.stringify(paymentCallbackData));

        // إعداد مستمع Pusher على القناة الصحيحة قبل التوجيه لبوابة الدفع
        setupPusherListener(orderId);

        // تأخير بسيط للتأكد من إعداد Pusher
        setTimeout(() => {
          // التوجيه المباشر لبوابة الدفع - لا نعرض شاشة النجاح هنا
          console.log('Redirecting to payment URL:', paymentUrl);
          window.location.href = paymentUrl;
        }, 500);
        
      } else {
        console.error('Payment Data Structure:', paymentData);
        throw new Error("لم يتم الحصول على رابط الدفع من بوابة الدفع");
      }
    } catch (err) {
      paymentInitiatedRef.current = false;
      const errorMessage = err.message || '';
      
      // Check if offer is expired or not available for payment
      if (
        errorMessage.includes('Offer is not available for payment') ||
        errorMessage.includes('offer expired') ||
        errorMessage.includes('العرض منتهي') ||
        errorMessage.includes('العرض غير متاح') ||
        errorMessage.toLowerCase().includes('expired')
      ) {
        // Offer has expired
        if (onOfferExpired && selectedOfferId) {
          onOfferExpired(selectedOfferId);
        }
        setError('انتهت صلاحية هذا العرض. يرجى اختيار عرض آخر.');
      } else {
        setError(err.message);
      }
    } finally {
      setProcessingMethod(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative">
        {/* Payment Status Overlay - نعرضها فقط عند نجاح أو فشل الدفع الفعلي */}
        {showPaymentStatus && paymentStatus && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center p-6">
              {paymentStatus === 'success' ? (
                <>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">
                    {paymentType === 'cash' ? 'تم تأكيد الطلب!' : 'تم الدفع بنجاح!'}
                  </h3>
                  
                  {/* رسالة مخصصة حسب نوع الدفع */}
                  <p className="text-gray-700 mb-4">{successMessage}</p>
                  
                  {/* عرض بيانات الرحلة إذا وجدت */}
                  {tripData && (
                    <div className="mb-4 text-right">
                      {tripData.message && (
                        <p className="text-gray-700 mb-2">{tripData.message}</p>
                      )}
                      
                      {tripData.driver && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-2">
                          <p className="text-sm text-gray-600">السائق: {tripData.driver.name}</p>
                          <p className="text-sm text-gray-600">رقم السائق: {tripData.driver.phone}</p>
                        </div>
                      )}
                      
                      {tripData.order && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">رقم الطلب: {tripData.order.id}</p>
                          <p className="text-sm text-gray-600">الحالة: {tripData.order.status?.label || 'قيد التنفيذ'}</p>
                          <p className="text-sm text-gray-600">السعر: {tripData.order.price} ريال</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : paymentStatus === 'failure' ? (
                <>
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-red-600 mb-2">فشل عملية الدفع</h3>
                  <p className="text-gray-600 mb-4">يرجى المحاولة مرة أخرى أو اختيار طريقة دفع مختلفة</p>
                  <button
                    onClick={() => {
                      setShowPaymentStatus(false);
                      setPaymentStatus(null);
                      paymentInitiatedRef.current = false;
                      // إعادة تحميل طرق الدفع
                      fetchAttemptedRef.current = false;
                      fetchPaymentMethods();
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    حاول مرة أخرى
                  </button>
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between">
          <h2 className="text-xl font-bold">تأكيد الدفع</h2>
          <button onClick={onClose} disabled={showPaymentStatus}>
            <MdClose size={22} />
          </button>
        </div>

        {/* Content - نعرض طرق الدفع دائمًا ما لم يكن هناك نجاح أو فشل */}
        {!showPaymentStatus && (
          <div className="p-6">
            <h3 className="font-bold mb-4">اختر طريقة الدفع</h3>

            {loadingMethods ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-700">جاري تحميل طرق الدفع...</p>
              </div>
            ) : paymentMethods.length === 0 && !error ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-700">لا توجد طرق دفع متاحة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = ICONS_MAP[method.icon] || FaCreditCard;
                  const isProcessing = processingMethod === method.id;
                  const isDisabled = processingMethod !== null && !isProcessing;

                  return (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentMethodClick(method)}
                      disabled={isDisabled || isProcessing}
                      className={`w-full p-4 rounded-xl border-2 flex gap-4 transition ${
                        isProcessing
                          ? "border-blue-500 bg-blue-50"
                          : isDisabled
                          ? "border-gray-200 opacity-50 cursor-not-allowed"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-lg ${
                          isProcessing
                            ? "bg-blue-100 text-[#579BE8] "
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {isProcessing ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        ) : (
                        <Icon size={20} />
                        )}
                      </div>

                      <div className="flex-1 text-right">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{method.name}</span>
                          {isProcessing && (
                            <span className="text-xs text-[#579BE8] ">جاري التحضير...</span>
                          )}
                        </div>

                        <p className="text-xs text-gray-700">
                          {method.description}
                        </p>

                        {method.supports_installments && (
                          <p className="text-xs text-indigo-600 mt-1">
                            يدعم التقسيط
                          </p>
                        )}
                        
                        {/* إضافة تلميحات حسب نوع الدفع */}
                        {method.id === 'wallet' && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ سيتم خصم المبلغ من محفظتك فوراً
                          </p>
                        )}
                        
                        {method.id === 'cash_on_delivery' && (
                          <p className="text-xs text-amber-600 mt-1">
                            💵 الدفع نقداً عند الاستلام
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded flex gap-2">
                <BiErrorCircle size={18} />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}