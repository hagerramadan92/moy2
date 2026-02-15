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
  onPaymentSuccess, // إضافة callback جديد للنجاح
  onPaymentFailure, // إضافة callback جديد للفشل
  router, // إضافة router للتوجيه
}) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [processingMethod, setProcessingMethod] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [showPaymentStatus, setShowPaymentStatus] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'failure', 'processing'
  
  // Refs للتتبع
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const paymentInitiatedRef = useRef(false);
  const currentOrderIdRef = useRef(orderId);
  const currentDriverIdRef = useRef(selectedDriverId);

  // تحديث refs عند تغيير props
  useEffect(() => {
    currentOrderIdRef.current = orderId;
    currentDriverIdRef.current = selectedDriverId;
  }, [orderId, selectedDriverId]);

  /* =============================
     إعداد Pusher للاستماع للدفع
  ============================== */
  const setupPusherListener = (orderId, driverId) => {
    try {
      // تنظيف الاتصال السابق إذا وجد
      if (channelRef.current) {
        channelRef.current.unbind_all();
        channelRef.current.unsubscribe();
      }
      
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }

      // إنشاء اتصال Pusher جديد
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
        authEndpoint: `${API_BASE_URL}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            Accept: 'application/json',
          },
        },
      });

      // الاشتراك في القناة
      const channelName = `TripStartedForDriver`;
      channelRef.current = pusherRef.current.subscribe(channelName);

      // الاستماع للحدث الخاص بالسائق
      const eventName = `driver.${driverId}`;
      
      channelRef.current.bind(eventName, (data) => {
        console.log('Pusher event received:', data);
        
        // التحقق من حالة الدفع
        if (data.paid_at || (data.data?.payment?.status === 'paid')) {
          // دفع ناجح
          setPaymentStatus('success');
          setShowPaymentStatus(true);
          
          // تأخير التوجيه لصفحة التفاصيل
          setTimeout(() => {
            if (router) {
              router.push(`/orders/${orderId}`);
            }
            onClose();
          }, 2000);
        }
      });

      // الاستماع لأخطاء الاتصال
      pusherRef.current.connection.bind('error', (err) => {
        console.error('Pusher connection error:', err);
      });

    } catch (error) {
      console.error('Error setting up Pusher:', error);
    }
  };

  /* =============================
     GET payment methods
  ============================== */
  const fetchPaymentMethods = async () => {
    try {
      setLoadingMethods(true);

      const accessToken = getAccessToken();

      const res = await fetch(`${API_BASE_URL}/payment-methods`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.status) {
        setPaymentMethods(data.data);
      } else {
        throw new Error(data.message || "فشل تحميل طرق الدفع");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMethods(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
      // إعادة تعيين الحالات
      setPaymentStatus(null);
      setShowPaymentStatus(false);
      paymentInitiatedRef.current = false;
    } else {
      // Reset state when modal closes
      setSelectedMethod(null);
      setProcessingMethod(null);
      setError(null);
      setIsConfirming(false);
      setPaymentStatus(null);
      setShowPaymentStatus(false);
      paymentInitiatedRef.current = false;
      
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
  }, [isOpen]);

  /* =============================
     Initiate Order Payment API
  ============================== */
  const initiateOrderPayment = async (orderId, offerId, gateway, paymentMethod, saveCard = false) => {
    const accessToken = getAccessToken();
    const deviceId = getDeviceId();
    const ipAddress = getIpAddress();

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

    if (res.ok && data.status) return data.data;

    throw new Error(data.message || "فشل بدء عملية الدفع");
  };

  /* =============================
     التحقق من حالة الدفع
  ============================== */
  const checkPaymentStatus = async (orderId) => {
    try {
      const accessToken = getAccessToken();
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.status) {
        const paymentStatus = data.data?.payment?.status;
        if (paymentStatus === 'paid') {
          setPaymentStatus('success');
          setShowPaymentStatus(true);
          
          setTimeout(() => {
            if (router) {
              router.push(`/orders/${orderId}`);
            }
            onClose();
          }, 2000);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return false;
    }
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
        method.id, // gateway (e.g., "tabby", "paymob", "tamara")
        paymentMethod, // payment_method
        saveCard
      );
      
      // Extract payment URL from response
      const payment = paymentData?.payment;
      let paymentUrl = null;
      
      if (payment) {
        // Check direct payment URLs first
        paymentUrl = payment.payment_url || 
                    payment.checkout_url || 
                    payment.qr_code_url;
        
        // If not found, check raw_response for gateway-specific URLs
        if (!paymentUrl && payment.raw_response) {
          const rawResponse = payment.raw_response;
          
          // Check for Tabby web_url in installments
          if (rawResponse.configuration?.available_products?.installments?.[0]?.web_url) {
            paymentUrl = rawResponse.configuration.available_products.installments[0].web_url;
          }
          
          // Check for QR code URL
          if (!paymentUrl && rawResponse.configuration?.available_products?.installments?.[0]?.qr_code) {
            paymentUrl = rawResponse.configuration.available_products.installments[0].qr_code;
          }
        }
      }

      if (paymentUrl) {
        // تحديث حالة العرض
        const offerStatus = paymentData?.offer?.status || paymentData?.status || 'pending_payment';
        
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
          paymentId: payment?.payment_id,
          sessionId: payment?.session_id,
          gateway: method.id
        };
        
        sessionStorage.setItem('paymentCallbackData', JSON.stringify(paymentCallbackData));

        // إعداد مستمع Pusher قبل التوجيه لبوابة الدفع
        if (selectedDriverId) {
          setupPusherListener(orderId, selectedDriverId);
        }

        // تأخير بسيط للتأكد من إعداد Pusher
        setTimeout(() => {
          // التوجيه المباشر لبوابة الدفع
          window.location.href = paymentUrl;
        }, 500);
        
      } else {
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

  /* =============================
     التحقق من حالة الدفع عند العودة للصفحة
  ============================== */
  useEffect(() => {
    // التحقق من وجود بيانات دفع معلقة عند فتح المودال
    const checkPendingPayment = async () => {
      const pendingData = sessionStorage.getItem('paymentCallbackData');
      if (pendingData && isOpen && orderId && selectedDriverId) {
        try {
          const parsedData = JSON.parse(pendingData);
          if (parsedData.orderId === orderId) {
            // إعداد مستمع Pusher
            setupPusherListener(orderId, selectedDriverId);
            
            // التحقق من حالة الدفع
            await checkPaymentStatus(orderId);
          }
        } catch (error) {
          console.error('Error checking pending payment:', error);
        }
      }
    };

    checkPendingPayment();

    // تنظيف عند إغلاق المودال
    return () => {
      if (!isOpen) {
        sessionStorage.removeItem('paymentCallbackData');
      }
    };
  }, [isOpen, orderId, selectedDriverId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative">
        {/* Payment Status Overlay */}
        {showPaymentStatus && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center p-6">
              {paymentStatus === 'success' ? (
                <>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">تم الدفع بنجاح!</h3>
                  <p className="text-gray-600">جاري تحويلك لصفحة تفاصيل الطلب...</p>
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
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    حاول مرة أخرى
                  </button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-600 mb-2">جاري معالجة الدفع</h3>
                  <p className="text-gray-600">يرجى الانتظار...</p>
                </>
              )}
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

        {/* Content */}
        <div className="p-6">
          <h3 className="font-bold mb-4">اختر طريقة الدفع</h3>

          {loadingMethods ? (
            <p className="text-sm text-gray-500">جاري تحميل طرق الدفع...</p>
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
                    disabled={isDisabled || isProcessing || showPaymentStatus}
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
                          ? "bg-blue-100 text-blue-600"
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
                          <span className="text-xs text-blue-600">جاري التحضير...</span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500">
                        {method.description}
                      </p>

                      {method.supports_installments && (
                        <p className="text-xs text-indigo-600 mt-1">
                          يدعم التقسيط
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
      </div>
    </div>
  );
}