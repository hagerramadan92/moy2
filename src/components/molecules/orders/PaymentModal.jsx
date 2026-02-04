'use client';

import { useState, useEffect } from 'react';
import {
  FaCreditCard,
  FaWallet,
} from "react-icons/fa";
import { MdCalendarToday, MdAccessTime, MdClose } from "react-icons/md";
import { BiErrorCircle } from "react-icons/bi";
import { API_BASE_URL, getAccessToken, getDeviceId, getIpAddress } from './utils/api';

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
  useMockData = false,
  onOfferExpired,
  setPendingPaymentOfferId,
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
          if (setPendingPaymentOfferId && typeof setPendingPaymentOfferId === 'function') {
            setPendingPaymentOfferId(selectedOfferId);
          }
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

