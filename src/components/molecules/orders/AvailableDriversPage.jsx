'use client';

import { useState, useEffect, Suspense, useMemo, memo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  Star, 
  ChevronLeft, 
  Truck, 
  Users, 
  AlertCircle, 
  RefreshCw,
  Shield,
  Award,
  TrendingUp,
  CreditCard,
  Wallet,
  Banknote,
  CheckCircle,
  LogIn,
  X,
  MapPin,
  Home,
  Briefcase,
  Phone,
  Car,
  User,
  ExternalLink
} from 'lucide-react';

// Dynamically import map to avoid SSR
const DriversMap = dynamic(
  () => import('./DriversMap'),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center animate-pulse">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#579BE8] mx-auto mb-2"></div>
          <span className="text-gray-400 text-sm">جاري تحميل الخريطة...</span>
        </div>
      </div>
    ) 
  }
);

const API_BASE_URL = 'https://moya.talaaljazeera.com/api/v1';


// دالة مساعدة للحصول على token
const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

// Payment Modal Component
import {
  FaCreditCard,
  FaWallet,
  FaCheckCircle,
} from "react-icons/fa";
import { MdCalendarToday, MdAccessTime, MdClose } from "react-icons/md";
import { BiErrorCircle } from "react-icons/bi";

/* =============================
   ربط icon string من API بـ react-icons
============================= */
const ICONS_MAP = {
  "credit-card": FaCreditCard,
  wallet: FaWallet,
  calendar: MdCalendarToday,
  clock: MdAccessTime,
};

function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  selectedDriverId,
  selectedOfferId,
  orderId,
  offerAmount,
  useMockData = false,
  onOfferExpired,
}) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedPaymentData, setSelectedPaymentData] = useState(null);
  const [selectedPaymentUrl, setSelectedPaymentUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [processingMethod, setProcessingMethod] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState(null);

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
    if (isOpen && !useMockData) {
      fetchPaymentMethods();
    } else if (!isOpen) {
      // Reset state when modal closes
      setSelectedMethod(null);
      setSelectedPaymentData(null);
      setSelectedPaymentUrl(null);
      setProcessingMethod(null);
      setError(null);
      setIsConfirming(false);
    }
  }, [isOpen]);

  /* =============================
     Initiate Payment
  ============================== */
  const initiatePayment = async (orderId, offerId, gateway, paymentMethod, saveCard = false) => {
    const accessToken = getAccessToken();

    // Get or create device ID for metadata
    let deviceId;
    if (typeof window !== 'undefined') {
      deviceId = localStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('deviceId', deviceId);
      }
    } else {
      deviceId = `device-${Date.now()}`;
    }
    
    // Get IP address (simplified - in production you might want to get this from a service)
    const ipAddress = '0.0.0.0'; // You can enhance this later with an IP detection service

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
     Initiate Order Payment API
  ============================== */
  const initiateOrderPayment = async (orderId, offerId, gateway, paymentMethod, saveCard = false) => {
    const accessToken = getAccessToken();

    // Get or create device ID for metadata
    let deviceId;
    if (typeof window !== 'undefined') {
      deviceId = localStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('deviceId', deviceId);
      }
    } else {
      deviceId = `device-${Date.now()}`;
    }
    
    // Get IP address (simplified - in production you might want to get this from a service)
    const ipAddress = '0.0.0.0'; // You can enhance this later with an IP detection service

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
     Confirm Driver API
  ============================== */
  const confirmDriver = async (orderId, driverId, offerId) => {
    const accessToken = getAccessToken();

    const res = await fetch(
      `${API_BASE_URL}/orders/${orderId}/confirm-driver`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          driver_id: driverId,
          offer_id: offerId,
        }),
      }
    );

    const data = await res.json();

    if (res.ok && data.status) return data.data;

    throw new Error(data.message || "فشل تأكيد السائق");
  };

  /* =============================
     Handle Payment Method Click - Select method only
  ============================== */
  const handlePaymentMethodClick = async (method) => {
    if (useMockData) {
      setSelectedMethod(method);
      setSelectedPaymentUrl('https://example.com/payment');
      return;
    }

    try {
      setProcessingMethod(method.id);
      setError(null);
      setSelectedMethod(null);
      setSelectedPaymentData(null);
      setSelectedPaymentUrl(null);

      // Get the first payment method from the methods array, or use gateway id
      const paymentMethod = method.methods && method.methods.length > 0
        ? method.methods[0]
        : method.id; // fallback to gateway id if no methods array
      
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
      
      // Extract payment URL from response - check multiple possible locations
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
        // Store payment data and URL for confirmation
        setSelectedMethod(method);
        setSelectedPaymentData(paymentData);
        setSelectedPaymentUrl(paymentUrl);
        
        // ✅ تحديث حالة العرض بناءً على response
        // الحصول على حالة العرض من response
        const offerStatus = paymentData?.offer?.status || paymentData?.status || 'pending_payment';
        
        // حفظ حالة العرض في localStorage
        localStorage.setItem('pendingOfferData', JSON.stringify({
          orderId,
          offerId: selectedOfferId,
          driverId: selectedDriverId,
          status: offerStatus,
          paymentData: paymentData // حفظ بيانات الدفع الكاملة
        }));
        
        // تحديث حالة العرض في state
        if (offerStatus === 'pending_payment' || offerStatus === 'accepted') {
          setPendingPaymentOfferId(selectedOfferId);
        }
      } else {
        throw new Error("لم يتم الحصول على رابط الدفع من بوابة الدفع");
      }
    } catch (err) {
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
     Handle Confirm Payment - Redirect to payment
  ============================== */
  const handleConfirmPayment = async () => {
    if (!selectedPaymentUrl || !selectedMethod) {
      setError('يرجى اختيار طريقة الدفع أولاً');
      return;
    }

    try {
      setIsConfirming(true);
      setError(null);

      const payment = selectedPaymentData?.payment;

      // Store payment and driver confirmation data for after payment callback
      const paymentCallbackData = {
        orderId,
        driverId: selectedDriverId,
        offerId: selectedOfferId,
        paymentId: payment?.payment_id,
        sessionId: payment?.session_id,
        gateway: selectedMethod.id
      };
      
      // Store in sessionStorage for after payment callback
      sessionStorage.setItem('paymentCallbackData', JSON.stringify(paymentCallbackData));
      
      // Also store temporary data to show "في انتظار الدفع" state
      localStorage.setItem('pendingOfferData', JSON.stringify({
        orderId,
        offerId: selectedOfferId,
        driverId: selectedDriverId,
        status: 'pending_payment'
      }));
      
      // Redirect to payment URL
      window.location.href = selectedPaymentUrl;
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء التوجيه إلى صفحة الدفع');
      setIsConfirming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between">
          <h2 className="text-xl font-bold">تأكيد الدفع</h2>
          <button onClick={onClose}>
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
                const isSelected = selectedMethod?.id === method.id;

                return (
                  <button
                    key={method.id}
                    onClick={() => handlePaymentMethodClick(method)}
                    disabled={isDisabled || isProcessing}
                    className={`w-full p-4 rounded-xl border-2 flex gap-4 transition ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 shadow-md"
                        : isProcessing
                        ? "border-blue-500 bg-blue-50"
                        : isDisabled
                        ? "border-gray-200 opacity-50 cursor-not-allowed"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : isProcessing
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
                        {isSelected && !isProcessing && (
                          <span className="text-xs text-blue-600 font-bold">✓ تم الاختيار</span>
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

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 border rounded-lg py-3 font-medium hover:bg-gray-50 transition"
              disabled={isConfirming}
            >
              إلغاء
            </button>
            {selectedMethod && selectedPaymentUrl && (
            <button
                onClick={handleConfirmPayment}
                disabled={isConfirming || !selectedPaymentUrl}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg py-3 font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isConfirming ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>جاري التوجيه...</span>
                  </>
                ) : (
                  <>
                    <span>تأكيد والدفع</span>
                  </>
                )}
            </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// DriverCard Component - Optimized with memo and useMemo
const DriverCard = memo(function DriverCard({
  id,
  driverId,
  name,
  deliveryTime,
  price,
  rating,
  successfulOrders,
  ordersCount,
  status,
  onAcceptOrder,
  onViewProfile,
  isPending = true,
  isAccepted = false,
  isPendingPayment = false,
  isExpired = false,
  offerId,
  createdAt,
  vehicleType,
  phone,
  index
}) {
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    if (!isPending || accepting || isAccepted || isPendingPayment || isExpired) return;
    
    setAccepting(true);
    try {
      await onAcceptOrder();
    } finally {
      setAccepting(false);
    }
  };

  // Memoize time ago calculation
  const timeAgo = useMemo(() => {
    if (!createdAt) return 'الآن';
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `قبل ${diffMins} دقيقة`;
    if (diffMins < 1440) return `قبل ${Math.floor(diffMins / 60)} ساعة`;
    return `قبل ${Math.floor(diffMins / 1440)} يوم`;
  }, [createdAt]);

  // Memoize badge color
  const badgeColor = useMemo(() => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-amber-500 to-amber-600',
      'from-rose-500 to-rose-600',
      'from-indigo-500 to-indigo-600'
    ];
    return colors[index % colors.length];
  }, [index]);

  // Memoize rating stars
  const ratingValue = useMemo(() => Math.round(parseFloat(rating)), [rating]);

  // Memoize card classes
  const cardClasses = useMemo(() => {
    if (isAccepted) return 'border-green-500 bg-green-50/30';
    if (isPendingPayment) return 'border-amber-500 bg-amber-50/30';
    if (isExpired) return 'border-red-300 bg-red-50/30 opacity-75';
    return 'border-gray-200';
  }, [isAccepted, isPendingPayment, isExpired]);

  // Memoize header gradient
  const headerGradient = useMemo(() => {
    if (isAccepted) return 'from-green-50 to-emerald-50';
    if (isPendingPayment) return 'from-amber-50 to-orange-50';
    if (isExpired) return 'from-red-50 to-rose-50';
    return 'from-gray-50 to-gray-100';
  }, [isAccepted, isPendingPayment, isExpired]);

  // Memoize icon background
  const iconBg = useMemo(() => {
    if (isAccepted) return 'bg-gradient-to-br from-green-500 to-emerald-600';
    if (isPendingPayment) return 'bg-gradient-to-br from-amber-500 to-orange-600';
    if (isExpired) return 'bg-gradient-to-br from-red-500 to-rose-600';
    return 'bg-gradient-to-br from-blue-500 to-indigo-600';
  }, [isAccepted, isPendingPayment, isExpired]);

  // Memoize badge gradient
  const badgeGradient = useMemo(() => {
    if (isAccepted) return 'from-green-500 to-emerald-600';
    if (isPendingPayment) return 'from-amber-500 to-orange-600';
    if (isExpired) return 'from-red-500 to-rose-600';
    return badgeColor;
  }, [isAccepted, isPendingPayment, isExpired, badgeColor]);

  // Memoize button classes
  const buttonClasses = useMemo(() => {
    if (isAccepted) return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg';
    if (isPendingPayment) return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg';
    if (isExpired) return 'bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-lg opacity-75 cursor-not-allowed';
    if (isPending) return 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl';
    return 'bg-gray-100 text-gray-400 cursor-not-allowed';
  }, [isAccepted, isPendingPayment, isExpired, isPending]);

  return (
    <div className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col ${cardClasses}`}>
      {/* Header with badge */}
      <div className="relative">
        {/* {isAccepted && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3" />
            تم القبول
          </div>
        )}
        {isPendingPayment && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            في انتظار الدفع
          </div>
        )}
        {isExpired && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 flex items-center gap-1.5">
            <X className="w-3 h-3" />
            انتهت الصلاحية
          </div>
        )} */}
        <div className={`absolute top-4 right-4 bg-gradient-to-r ${badgeGradient} text-white text-xs font-bold px-3 py-1 rounded-full z-10`}>
          العرض #{index + 1}
        </div>
        
        <div className={`bg-gradient-to-r p-6 ${headerGradient}`}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${iconBg}`}>
                <Truck className={`w-7 h-7 ${isExpired ? 'opacity-60' : 'text-white'}`} />
              </div>
              {isPending && !isAccepted && !isPendingPayment && !isExpired && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              )}
              {isAccepted && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
              {isPendingPayment && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
              )}
              {isExpired && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
                {onViewProfile && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewProfile();
                    }}
                    className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-gray-600 hover:text-[#579BE8] transition-all shadow-sm hover:shadow-md"
                    title="عرض الملف الشخصي"
                  >
                    <User className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= ratingValue ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-900">{rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Price and Time */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-blue-600 mb-1">الوقت المتوقع</p>
                <p className="font-bold text-gray-900 text-lg">{deliveryTime}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 text-white rounded-lg flex items-center justify-center">
                <span className="font-bold text-sm">ر.س</span>
              </div>
              <div>
                <p className="text-xs text-green-600 mb-1">السعر</p>
                <p className="font-bold text-gray-900 text-2xl">{price}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">نوع المركبة:</span>
            </div>
            <span className="font-medium text-gray-900">{vehicleType}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">الطلبات المكتملة:</span>
            </div>
            <span className="font-medium text-gray-900">{ordersCount}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">الهاتف:</span>
            </div>
            <span className="font-medium text-gray-900 text-sm">{phone}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">تم العرض:</span>
            </div>
            <span className="font-medium text-gray-500 text-sm">{timeAgo}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <button
            onClick={handleAccept}
            disabled={!isPending || accepting || isAccepted || isPendingPayment || isExpired}
            className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-3 ${buttonClasses}`}
          >
            {accepting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>جاري القبول...</span>
              </>
            ) : isAccepted ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>تم قبول العرض</span>
              </>
            ) : isPendingPayment ? (
              <>
                <Clock className="w-5 h-5 animate-pulse" />
                <span>في انتظار الدفع</span>
              </>
            ) : isExpired ? (
              <>
                <X className="w-5 h-5" />
                <span>انتهت صلاحية العرض</span>
              </>
            ) : isPending ? (
              <>
                <span>قبول العرض</span>
                <span className="text-lg">•</span>
                <span>{price}</span>
              </>
            ) : (
              'غير متاح'
            )}
          </button>
          
          <div className="flex justify-between items-center mt-3">
            <p className="text-xs text-gray-400">
              رقم العرض: #{offerId}
            </p>
            <p className="text-xs text-gray-400">
              سائق #{driverId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

// المكون الداخلي الذي يستخدم useSearchParams
function AvailableDriversContent({ onBack }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offersData, setOffersData] = useState(null);
  const [acceptedOfferId, setAcceptedOfferId] = useState(null);
  const [pendingPaymentOfferId, setPendingPaymentOfferId] = useState(null);
  const [expiredOfferIds, setExpiredOfferIds] = useState([]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isOrderExpired, setIsOrderExpired] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [stats, setStats] = useState({
    totalOffers: 0,
    averagePrice: 0,
    fastestDelivery: 0,
    lowestPrice: 0
  });

  // Helper function to get payment callback data
  const getPaymentCallbackData = () => {
    if (typeof window === 'undefined') return null;
    
    const data = sessionStorage.getItem('paymentCallbackData');
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (err) {
      console.error('Error parsing payment callback data:', err);
      return null;
    }
  };

  // Helper function to get pending payment data from localStorage
  const getPendingOfferData = () => {
    if (typeof window === 'undefined') return null;
    
    const data = localStorage.getItem('pendingOfferData');
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (err) {
      console.error('Error parsing pending offer data:', err);
      return null;
    }
  };

  // Get orderId from URL
  const orderId = searchParams.get('orderId');
  const paymentStatus = searchParams.get('payment');
  const paymentSuccessParam = searchParams.get('success');
  const paymentCancelParam = searchParams.get('cancel');
  const isExpiredParam = searchParams.get('expired');

  // Check for payment success and pending offers on component mount
  useEffect(() => {
    // Check URL params for payment cancellation
    if (paymentStatus === 'cancel' || paymentCancelParam === 'true') {
      // Clear pending payment state
      setPendingPaymentOfferId(null);
      setPaymentSuccess(false);
      // Clear pending payment data
      localStorage.removeItem('pendingOfferData');
      sessionStorage.removeItem('paymentCallbackData');
      
      // Clean up URL params
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('payment');
        url.searchParams.delete('cancel');
        window.history.replaceState({}, '', url);
      }
    }
    
    // Check URL params for payment success
    if (paymentStatus === 'success' || paymentSuccessParam === 'true') {
      setPaymentSuccess(true);
      
      // Get payment callback data from sessionStorage
      const callbackData = getPaymentCallbackData();
      if (callbackData && callbackData.offerId) {
        setAcceptedOfferId(callbackData.offerId);
        setPendingPaymentOfferId(null);
        // Clear pending payment data
        localStorage.removeItem('pendingOfferData');
      }
      
      // Clean up URL params
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('payment');
        url.searchParams.delete('success');
        window.history.replaceState({}, '', url);
      }
    }
    
    // Check sessionStorage for payment callback data (for returning from payment)
    const callbackData = getPaymentCallbackData();
    if (callbackData && callbackData.offerId && !paymentCancelParam) {
      setAcceptedOfferId(callbackData.offerId);
      setPendingPaymentOfferId(null);
      setPaymentSuccess(true);
    }
    
    // Check localStorage for pending payment offers (only if not cancelled)
    if (!paymentCancelParam && paymentStatus !== 'cancel') {
      const pendingOfferData = getPendingOfferData();
      if (pendingOfferData && pendingOfferData.orderId === orderId) {
        setPendingPaymentOfferId(pendingOfferData.offerId);
        setSelectedDriverId(pendingOfferData.driverId);
        setSelectedOfferId(pendingOfferData.offerId);
      }
    }
    
    // Listen for page visibility changes (when user returns from payment window)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if payment was cancelled by checking if we still have pending data
        // but no payment callback data (meaning payment was cancelled/closed)
        const pendingData = getPendingOfferData();
        const callbackData = getPaymentCallbackData();
        
        // If there's pending data but no callback data, and we're back on the page
        // it likely means the payment window was closed
        if (pendingData && !callbackData) {
          // Wait a bit to see if payment callback happens
          setTimeout(() => {
            const stillPending = getPendingOfferData();
            const stillNoCallback = !getPaymentCallbackData();
            
            // If still pending and no callback after 2 seconds, clear pending state
            if (stillPending && stillNoCallback) {
              setPendingPaymentOfferId(null);
              localStorage.removeItem('pendingOfferData');
            }
          }, 2000);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [orderId, paymentStatus, paymentSuccessParam, paymentCancelParam]);

  useEffect(() => {
    if (orderId) {
      // التحقق من حالة انتهاء الطلب من localStorage
      const expiredFlag = localStorage.getItem(`order_${orderId}_expired`);
      if (expiredFlag === 'true' || isExpiredParam === 'true') {
        setIsOrderExpired(true);
        // إزالة العلامة من localStorage بعد استخدامها
        localStorage.removeItem(`order_${orderId}_expired`);
      }
      
      fetchOffers();
      fetchOrderStatus();
    } else {
      router.back();
    }
  }, [orderId, isExpiredParam]);

  // Get current user location
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError(null);
        },
        (error) => {
          console.warn('Error getting location:', error);
          setLocationError(error.message);
          // Use default location (Riyadh) if geolocation fails
          setCurrentLocation({
            lat: 24.7136,
            lng: 46.6753
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      // Use default location if geolocation is not supported
      setCurrentLocation({
        lat: 24.7136,
        lng: 46.6753
      });
    }
  }, []);

  // Poll order status every 30 seconds
  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(() => {
      fetchOrderStatus();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [orderId]);

  // Calculate time remaining countdown
  useEffect(() => {
    if (!orderStatus?.expires_in?.expires_at) return;

    const calculateTimeRemaining = () => {
      const expiresAt = new Date(orderStatus.expires_in.expires_at);
      const now = new Date();
      const diff = expiresAt - now;

      if (diff <= 0) {
        // Order has expired
        setIsOrderExpired(true);
        setTimeRemaining(null);
        
        // Mark all offers as expired
        if (offersData?.offers && offersData.offers.length > 0) {
          const allOfferIds = offersData.offers.map(offer => offer.id);
          setExpiredOfferIds(prev => {
            return [...new Set([...prev, ...allOfferIds])];
          });
        }
        return;
      }

      setIsOrderExpired(false);
      
      // Calculate time components
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        total: diff
      });
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [orderStatus, offersData]);

  // Debug: مراقبة تغييرات offersData و loading (disabled for performance)
  // useEffect(() => {
  //   console.log('Loading state:', loading);
  //   console.log('Refreshing state:', refreshing);
  //   if (offersData) {
  //     console.log('offersData updated:', offersData);
  //     console.log('offers array:', offersData.offers);
  //     console.log('offers count:', offersData.offers?.length);
  //   }
  // }, [offersData, loading, refreshing]);

  // 🔴 **تحديث دالة fetchOffers مع token ومعالجة المصادقة**
  const fetchOffers = async () => {
    try {
      setRefreshing(true);
      setLoading(true); // تأكد من تفعيل حالة التحميل
      
      // الحصول على token
      const accessToken = getAccessToken();
      
      if (!accessToken) {
        // إذا لم يكن هناك token، توجيه لصفحة تسجيل الدخول
        setError('يجب تسجيل الدخول للوصول إلى هذه الصفحة');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      // محاولة جلب البيانات الحقيقية مع token
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/offers`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        cache: 'no-store'
      });

      // Check for 404 Not Found
      if (response.status === 404) {
        setIsNotFound(true);
        setLoading(false);
        setRefreshing(false);
        setError(null);
        setOffersData(null);
        return;
      }

      const data = await response.json();
      
      if (response.ok && data.status) {
        setIsNotFound(false);
        
        // التحقق من وجود البيانات
        if (!data.data) {
          setError('لا توجد بيانات في الاستجابة');
          setLoading(false);
          setRefreshing(false);
          return;
        }

        // عرض البيانات فوراً قبل أي معالجة أخرى
        const offersDataToSet = {
          ...data.data,
          offers: data.data.offers || [],
          total_offers: data.data.total_offers || (data.data.offers?.length || 0),
          active_offers: data.data.active_offers || (data.data.offers?.length || 0)
        };
        
        // Set data immediately
        setOffersData(offersDataToSet);
        setUseMockData(false);
        setError(null);
        
        // Set accepted offer ID if exists - prioritize this to show immediately
        if (data.data.accepted_offer) {
          const acceptedId = data.data.accepted_offer.id || data.data.accepted_offer;
          setAcceptedOfferId(acceptedId);
          setPendingPaymentOfferId(null);
          localStorage.removeItem('pendingOfferData');
        }
        
        // Stop loading immediately after setting data
        setLoading(false);
        setRefreshing(false);
        
        // Process stats and fetch status in background (non-blocking)
        setTimeout(() => {
          if (data.data.offers && data.data.offers.length > 0) {
        calculateStats(data.data.offers);
          }
          fetchOrderStatus();
        }, 0);
      } else {
        // إذا كان هناك خطأ في المصادقة
        if (data.error_code === 'UNAUTHENTICATED' || data.message?.includes('تسجيل الدخول')) {
          setError('انتهت جلسة الدخول. يرجى تسجيل الدخول مرة أخرى.');
          // حذف token القديم
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
        } else {
          throw new Error(data.message || 'فشل في جلب البيانات');
        }
        setLoading(false);
      }
    } catch (err) {
      console.warn('API Error:', err.message);
      
      // Check if error is 404
      if (err.message?.includes('404') || err.message?.includes('Not Found')) {
        setIsNotFound(true);
        setLoading(false);
        setRefreshing(false);
        setError(null);
        setOffersData(null);
        return;
      }
      
      // استخدام البيانات الوهمية كبديل فقط للأخطاء الأخرى
      setUseMockData(true);
      const mockOffers = Array.from({ length: 4 }, (_, i) => generateMockDriver(i, orderId));
      
      const mockData = {
        order_id: orderId,
        order_status: 'pending',
        total_offers: mockOffers.length,
        active_offers: mockOffers.length,
        accepted_offer: null,
        offers: mockOffers
      };
      
      setOffersData(mockData);
      calculateStats(mockOffers);
      setError(`تم تحميل بيانات تجريبية: ${err.message}`);
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  const calculateStats = (offers) => {
    if (!offers || offers.length === 0) return;

    const prices = offers.map(o => parseFloat(o.price));
    const times = offers.map(o => o.delivery_duration_minutes);

    setStats({
      totalOffers: offers.length,
      averagePrice: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2),
      fastestDelivery: Math.min(...times),
      lowestPrice: Math.min(...prices).toFixed(2)
    });
  };

  // Fetch order status
  const fetchOrderStatus = async () => {
    if (!orderId) return;

    try {
      const accessToken = getAccessToken();
      if (!accessToken) return;

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        cache: 'no-store'
      });

      const data = await response.json();

      if (response.ok && data.status && data.data) {
        setOrderStatus(data.data);

        // Check if order has expired (remaining_offers is 0 and expires_in.minutes is negative)
        if (data.data.remaining_offers === 0 && data.data.expires_in?.minutes < 0) {
          // Mark all offers as expired if order has expired
          setExpiredOfferIds(prev => {
            // Get current offers from state
            const currentOffers = offersData?.offers || [];
            if (currentOffers.length > 0) {
              const allOfferIds = currentOffers.map(offer => offer.id);
              // Merge with existing expired offers
              return [...new Set([...prev, ...allOfferIds])];
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.warn('Error fetching order status:', err.message);
    }
  };

  const handleDriverSelect = (driverId, offerId, driverData, offer) => {
    setSelectedDriverId(driverId);
    setSelectedOfferId(offerId);
    setSelectedOffer(offer);
    setIsModalOpen(true);
    // Mark this offer as pending payment (not accepted yet)
    setPendingPaymentOfferId(offerId);
    // Store driver data in session for modal
    sessionStorage.setItem('selectedDriver', JSON.stringify(driverData));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Clear pending payment state when modal is closed without payment
    setPendingPaymentOfferId(null);
    localStorage.removeItem('pendingOfferData');
  };

  const handleOfferExpired = (offerId) => {
    // Mark offer as expired
    setExpiredOfferIds(prev => [...prev, offerId]);
    // Clear pending payment state
    setPendingPaymentOfferId(null);
    localStorage.removeItem('pendingOfferData');
    // Close modal
    setIsModalOpen(false);
  };

  // 🔴 **تحديث دالة handleConfirmPayment**
  const handleConfirmPayment = async (methodId, driverId, paymentData = null) => {
    try {
      // ✅ Payment initiation is handled in PaymentModal
      // After success, redirect to confirmation page
      const params = new URLSearchParams({
        driver: driverId,
        offer: selectedOfferId,
        gateway: methodId
      });
      
      if (paymentData) {
        // Add payment data to URL if needed
        if (paymentData.payment_url) {
          params.append('payment_url', paymentData.payment_url);
        }
        if (paymentData.payment_id) {
          params.append('payment_id', paymentData.payment_id);
        }
      }
      
      router.push(`/orders/${orderId}/confirmation?${params.toString()}`);
    } catch (err) {
      console.error('Error in payment confirmation:', err);
      alert('حدث خطأ في تأكيد الطلب. يرجى المحاولة مرة أخرى.');
    }
  };

  // Format time remaining for display
  const formatTimeRemaining = () => {
    if (!timeRemaining) return null;
    
    const { days, hours, minutes, seconds } = timeRemaining;
    
    if (days > 0) {
      return `${days} يوم ${hours} ساعة ${minutes} دقيقة`;
    } else if (hours > 0) {
      return `${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`;
    } else if (minutes > 0) {
      return `${minutes} دقيقة ${seconds} ثانية`;
    } else {
      return `${seconds} ثانية`;
    }
  };

  const formatDriverData = (offer) => ({
    id: offer.id,
    driverId: offer.driver_id,
    name: offer.driver?.name || `السائق ${offer.driver_id}`,
    deliveryTime: `${offer.delivery_duration_minutes} دقيقة`,
    price: `${offer.price} ريال`,
    rating: offer.driver?.rating || "4.5",
    successfulOrders: `(${offer.driver?.completed_orders || '1,439'}) طلب ناجح`,
    ordersCount: offer.driver?.total_orders || "238",
    status: offer.status,
    offerId: offer.id,
    createdAt: offer.created_at,
    vehicleType: offer.driver?.vehicle_type || 'سيارة صغيرة',
    phone: offer.driver?.phone || '+966500000000'
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // 🔴 **صفحة تسجيل الدخول عند فقدان المصادقة**
  if (error && error.includes('تسجيل الدخول')) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">يجب تسجيل الدخول</h2>
              
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => router.push(`/login?return=/available-drivers?orderId=${orderId}`)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition"
                >
                  <LogIn className="w-5 h-5" />
                  تسجيل الدخول
                </button>
                
                <button
                  onClick={() => router.push('/')}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  العودة للرئيسية
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mt-6">
                لا تملك حساباً؟{' '}
                <button 
                  onClick={() => router.push('/register')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  سجل الآن
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found state
  if (isNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
              <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">الطلب غير موجود</h2>
              
              <p className="text-gray-600 mb-6">
                عذراً، لم يتم العثور على الطلب المطلوب. يرجى التحقق من رقم الطلب والمحاولة مرة أخرى.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={onBack}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition"
                >
                  <ChevronLeft className="w-5 h-5 rotate-180" />
                  العودة
                </button>
                
                <button
                  onClick={() => router.push('/')}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  العودة للرئيسية
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mt-6">
                رقم الطلب: #{orderId}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-[#579BE8]"></div>
              <Truck className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#579BE8]" />
            </div>
            <p className="mt-6 text-gray-600 font-medium text-lg">جاري البحث عن سائقين...</p>
            <p className="text-sm text-gray-400 mt-2">رقم الطلب: #{orderId}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="pt-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-[#579BE8] transition-all font-medium px-4 py-2 rounded-lg hover:bg-[#579BE8]/5"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span>العودة</span>
            </button>

            <div className="flex items-center gap-4">
              {useMockData && (
                <div className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" />
                  بيانات تجريبية
                </div>
              )}
              
              <button
                onClick={fetchOffers}
                disabled={refreshing}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                تحديث العروض
              </button>
            </div>
          </motion.div>

          {/* Main Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] text-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 md:p-8 relative overflow-hidden">
              {/* Background Elements */}
              <div className="absolute top-0 right-0 opacity-10">
                <Truck size={200} className="rotate-12" />
              </div>
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-xl">
                        <Truck className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm opacity-90 font-medium mb-2">اختيار السائق</p>
                        <h1 className="text-2xl md:text-3xl font-black mb-4">السائقين المتاحين</h1>
                        
                        <div className="flex flex-wrap gap-3">
                          <div className="bg-white/20 backdrop-blur-lg px-4 py-2 rounded-xl border border-white/30">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                              <span className="font-medium">طلب #<span className="font-bold">{orderId}</span></span>
                            </div>
                          </div>
                          
                          <div className="bg-white/20 backdrop-blur-lg px-4 py-2 rounded-xl border border-white/30">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span className="font-medium">{offersData?.total_offers || 0} عرض متاح</span>
                            </div>
                          </div>
                          
                          {isOrderExpired ? (
                            <div className="bg-red-500/30 backdrop-blur-lg px-4 py-2 rounded-xl border border-red-300/50">
                              <div className="flex items-center gap-2">
                                <X className="w-4 h-4" />
                                <span className="font-medium">انتهت صلاحية الطلب</span>
                              </div>
                            </div>
                          ) : timeRemaining ? (
                            <div className="bg-white/20 backdrop-blur-lg px-4 py-2 rounded-xl border border-white/30">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">الوقت المتبقي: <span className="font-bold">{formatTimeRemaining()}</span></span>
                              </div>
                            </div>
                          ) : (
                          <div className="bg-white/20 backdrop-blur-lg px-4 py-2 rounded-xl border border-white/30">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">جاري البحث</span>
                            </div>
                          </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Card */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/15 backdrop-blur-lg rounded-xl p-5 border border-white/20"
                  >
                    <p className="text-sm opacity-90 font-medium mb-4 text-center">إحصائيات العروض</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{stats.totalOffers}</div>
                        <div className="text-xs opacity-90">عدد العروض</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{stats.averagePrice}</div>
                        <div className="text-xs opacity-90">متوسط السعر</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{stats.fastestDelivery}</div>
                        <div className="text-xs opacity-90">أسرع وقت</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{stats.lowestPrice}</div>
                        <div className="text-xs opacity-90">أقل سعر</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Expired Message */}
          {isOrderExpired && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-red-800 font-bold text-lg mb-2">
                    انتهت صلاحية الطلب
                  </h3>
                  <p className="text-red-600 text-sm mb-3">
                    عذراً، انتهت صلاحية هذا الطلب ولم يعد من الممكن قبول العروض. يرجى إنشاء طلب جديد.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-red-500">
                    <Clock className="w-4 h-4" />
                    <span>انتهى في: {orderStatus?.expires_in?.expires_at ? new Date(orderStatus.expires_in.expires_at).toLocaleString('ar-SA') : 'غير محدد'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Pending Payment Message */}
          {pendingPaymentOfferId && !paymentSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0 animate-pulse" />
                <div className="flex-1">
                  <p className="text-amber-800 font-medium text-sm">
                    جاري انتظار الدفع لاستكمال قبول العرض...
                  </p>
                  <p className="text-amber-600 text-xs mt-1">
                    تم حجز العرض مؤقتاً. يرجى إتمام عملية الدفع خلال 15 دقيقة
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Reset pending payment state
                    setPendingPaymentOfferId(null);
                    localStorage.removeItem('pendingOfferData');
                  }}
                  className="text-xs text-amber-700 hover:text-amber-900 font-medium"
                >
                  إلغاء الحجز
                </button>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && !error.includes('تسجيل الدخول') && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-amber-800 text-sm">{error}</p>
                  {useMockData && (
                    <p className="text-amber-600 text-xs mt-1">
                      هذه البيانات للتجربة فقط. تأكد من اتصال الخادم للبيانات الحقيقية.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
          {/* Drivers List - Left Column */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-8"
          >
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  العروض المتاحة
                </h2>
                <div className="text-sm text-gray-500">
                  {offersData?.total_offers || 0} عرض متاح
                </div>
              </div>
            </div>

         

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {offersData?.offers && Array.isArray(offersData.offers) && offersData.offers.length > 0 ? (
                offersData.offers.map((offer, index) => {
                  const isAccepted = acceptedOfferId === offer.id;
                  const isPendingPayment = pendingPaymentOfferId === offer.id;
                  const isExpired = expiredOfferIds.includes(offer.id);
                  return (
                <motion.div
                  key={offer.id}
                  variants={itemVariants}
                  custom={index}
                      whileHover={(!isAccepted && !isPendingPayment && !isExpired) ? { y: -5 } : {}}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <DriverCard
                    {...formatDriverData(offer)}
                    onAcceptOrder={() => handleDriverSelect(
                      offer.driver_id, 
                      offer.id, 
                          formatDriverData(offer),
                          offer
                    )}
                    onViewProfile={() => {
                      const driverData = formatDriverData(offer);
                      router.push(`/orders/driver_profile?id=${offer.driver_id}&name=${encodeURIComponent(driverData.name)}&phone=${encodeURIComponent(driverData.phone)}&rate=${driverData.rating}&avatar=/images/driver.png`);
                    }}
                        isPending={!isAccepted && !isPendingPayment && !isExpired}
                        isAccepted={isAccepted}
                        isPendingPayment={isPendingPayment}
                        isExpired={isExpired}
                    index={index}
                  />
                </motion.div>
                  );
                })
              ) : null}
            </div>

            {/* Empty State */}
            {(!offersData || offersData.offers.length === 0) && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Truck className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد عروض حالياً</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  لم يتقدم أي سائق لعرض سعر على طلبك بعد. يمكنك الانتظار أو تحديث الصفحة.
                </p>
                <button
                  onClick={fetchOffers}
                  className="bg-[#579BE8] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#4a8dd8] transition inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  تحديث العروض
                </button>
              </motion.div>
            )}

          
          </motion.div>

          {/* Map - Right Column */}
          <div className="lg:col-span-4">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden h-[600px]">
                <div className="p-4 border-b">
                  <h3 className="font-bold text-gray-900">خريطة السائقين</h3>
                  <p className="text-sm text-gray-500">مواقع السائقين الحالية</p>
                </div>
                
                <div className="h-[calc(100%-80px)]">
                  {currentLocation ? (
                  <DriversMap
                    drivers={offersData?.offers?.map(formatDriverData) || []}
                      center={currentLocation}
                      shouldUpdate={!loading && !refreshing && offersData && !useMockData}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#579BE8] mx-auto mb-2"></div>
                        <span className="text-gray-400 text-sm">جاري تحديد الموقع...</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">معلومات الخريطة</p>
                      <p className="text-xs text-gray-500">
                        {loading || refreshing ? 'جاري التحميل...' : 'يتم تحديث المواقع كل 30 ثانية'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
                  </div>
                  </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmPayment}
        selectedDriverId={selectedDriverId}
        selectedOfferId={selectedOfferId}
        orderId={orderId}
        offerAmount={selectedOffer?.price}
        useMockData={useMockData}
        onOfferExpired={handleOfferExpired}
      />

      {/* Floating Action Button */}
      <button
        onClick={fetchOffers}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-all hover:scale-110 border border-gray-200"
        title="تحديث العروض"
      >
        <RefreshCw className={`w-5 h-5 text-[#579BE8] ${refreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}

// المكون الرئيسي مع Suspense
export default function AvailableDriversPage({ onBack }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-[#579BE8]"></div>
              <Truck className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#579BE8]" />
            </div>
            <p className="mt-6 text-gray-600 font-medium">جاري تحميل السائقين...</p>
          </div>
        </div>
      </div>
    }>
      <AvailableDriversContent onBack={onBack} />
    </Suspense>
  );
}

/* =============================
   Utility Function for Payment Callback
   Use this function in your payment callback/success page
============================= */
export const confirmDriverAfterPayment = async (orderId, driverId, offerId) => {
  const API_BASE_URL = 'https://moya.talaaljazeera.com/api/v1';
  
  const getAccessToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }

  const res = await fetch(
    `${API_BASE_URL}/orders/${orderId}/confirm-driver`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        driver_id: driverId,
        offer_id: offerId,
      }),
    }
  );

  const data = await res.json();

  if (res.ok && data.status) {
    // Clear the stored callback data after successful confirmation
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('paymentCallbackData');
      localStorage.removeItem('pendingOfferData');
    }
    return data.data;
  }

  throw new Error(data.message || "فشل تأكيد السائق");
};

/* =============================
   Helper function to get payment callback data from sessionStorage
============================= */
export const getPaymentCallbackData = () => {
  if (typeof window === 'undefined') return null;
  
  const data = sessionStorage.getItem('paymentCallbackData');
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error('Error parsing payment callback data:', err);
    return null;
  }
};

/* =============================
   Helper function to get pending offer data from localStorage
============================= */
export const getPendingOfferData = () => {
  if (typeof window === 'undefined') return null;
  
  const data = localStorage.getItem('pendingOfferData');
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error('Error parsing pending offer data:', err);
    return null;
  }
};

/* =============================
   Generate Mock Driver Data
============================= */
function generateMockDriver(index, orderId) {
  const names = ["أحمد محمد", "سعيد علي", "عبدالله خالد", "فيصل حسن", "محمد عبدالعزيز"];
  const vehicles = ["سيارة صغيرة", "سيارة كبيرة", "فان", "بيك أب"];
  const phones = ["+966500123456", "+966501234567", "+966502345678", "+966503456789", "+966504567890"];
  
  return {
    id: `offer-${Date.now()}-${index}`,
    driver_id: `driver-${1000 + index}`,
    driver: {
      name: names[index % names.length],
      rating: (4.5 + Math.random() * 0.5).toFixed(1),
      completed_orders: Math.floor(1000 + Math.random() * 500),
      total_orders: Math.floor(1200 + Math.random() * 300),
      vehicle_type: vehicles[index % vehicles.length],
      phone: phones[index % phones.length]
    },
    delivery_duration_minutes: Math.floor(15 + Math.random() * 45),
    price: (50 + Math.random() * 150).toFixed(2),
    status: "pending",
    created_at: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    order_id: orderId
  };
}