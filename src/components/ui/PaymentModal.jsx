'use client';
import { useState } from 'react';
import { X, CreditCard, Wallet, Banknote, CheckCircle } from 'lucide-react';

export default function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  selectedDriverId,
  selectedOfferId,
  orderId,
  useMockData = false
}) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const paymentMethods = [
    { id: 1, name: 'بطاقة ائتمان', icon: CreditCard, description: 'الدفع باستخدام بطاقة Visa أو Mastercard' },
    { id: 2, name: 'محفظة إلكترونية', icon: Wallet, description: 'الدفع باستخدام STC Pay أو Apple Pay' },
    { id: 3, name: 'الدفع عند الاستلام', icon: Banknote, description: 'الدفع نقداً عند تسليم الشحنة' },
  ];

  const handleConfirm = async () => {
    if (!selectedMethod) {
      setError('يرجى اختيار طريقة الدفع');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // محاكاة عملية الدفع
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (useMockData) {
        console.log('Mock payment confirmed:', { selectedMethod, selectedOfferId });
      }
      
      onConfirm(selectedMethod.id, selectedDriverId);
    } catch (err) {
      setError('حدث خطأ في عملية الدفع');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">تأكيد الطلب</h2>
              <p className="text-sm opacity-90 mt-1">
                طلب #{orderId} - عرض #{selectedOfferId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <X size={24} />
            </button>
          </div>
          
          {useMockData && (
            <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3 text-sm">
              ⚠️ تجربة - بيانات تجريبية
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-medium text-gray-900 mb-3">ملخص الطلب</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">رقم السائق:</span>
                <span className="font-medium">#{selectedDriverId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">رقم العرض:</span>
                <span className="font-medium">#{selectedOfferId}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">حالة الطلب:</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    في انتظار الدفع
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-4">اختر طريقة الدفع</h3>
            
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod?.id === method.id;
                
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method)}
                    className={`w-full p-4 rounded-xl border-2 flex items-start gap-4 transition-all text-right ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-3 rounded-lg flex-shrink-0 ${
                      isSelected
                        ? 'bg-blue-100 text-[#579BE8] '
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{method.name}</span>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-700 text-right">{method.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedMethod || loading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري المعالجة...
                </>
              ) : (
                'تأكيد الدفع'
              )}
            </button>
          </div>

          {/* Security Note */}
          <p className="text-xs text-gray-400 text-center mt-4">
            جميع المعاملات مشفرة وآمنة
          </p>
        </div>
      </div>
    </div>
  );
}