'use client';
import { useState, useEffect } from 'react';
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
  Car
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

// Generate unique IDs for mock drivers
const generateMockDriver = (index, orderId) => ({
  id: index + 100,
  order_id: orderId,
  driver_id: 200 + index,
  price: (45.50 + (index * 15)).toFixed(2),
  status: 'pending',
  delivery_duration_minutes: 25 + (index * 10),
  created_at: new Date(Date.now() - index * 60000).toISOString(),
  updated_at: new Date().toISOString(),
  driver: {
    id: 200 + index,
    name: `السائق ${['أحمد', 'محمد', 'خالد', 'علي', 'فهد', 'سعود'][index]}`,
    rating: (4.2 + (index * 0.1)).toFixed(1),
    total_orders: 1200 + (index * 200),
    completed_orders: 1000 + (index * 150),
    vehicle_type: ['سيارة صغيرة', 'سيارة كبيرة', 'فان', 'شاحنة صغيرة'][index % 4],
    phone: `+9665${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`
  }
});

// دالة مساعدة للحصول على token
const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

// Payment Modal Component
// "use client";

// import { useState } from "react";
import {
  FaCreditCard,
  FaWallet,
  FaCheckCircle,
} from "react-icons/fa";
import { MdCalendarToday, MdAccessTime, MdClose } from "react-icons/md";
import { BiErrorCircle } from "react-icons/bi";
// import { getAccessToken } from "@/lib/auth";

// const API_BASE_URL = "https://moya.talaaljazeera.com/api/v1";

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
  useMockData = false,
}) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [error, setError] = useState(null);

  /* =============================
     GET payment methods
  ============================== */
 const fetchPaymentMethods = async () => {
  try {
    setLoadingMethods(true);

    const accessToken = getAccessTokenFromStorage();

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
    }
  }, [isOpen]);

  /* =============================
     Confirm Driver
  ============================== */
  const confirmDriver = async (driverId, offerId) => {
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
     Confirm Payment
  ============================== */
  const handleConfirm = async () => {
    if (!selectedMethod) {
      setError("يرجى اختيار طريقة الدفع");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!useMockData) {
        await confirmDriver(selectedDriverId, selectedOfferId);
        await new Promise((r) => setTimeout(r, 1000));
        onConfirm(selectedMethod.id, selectedDriverId);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
                const isSelected = selectedMethod?.id === method.id;

                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method)}
                    className={`w-full p-4 rounded-xl border-2 flex gap-4 transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg ${
                        isSelected
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Icon size={20} />
                    </div>

                    <div className="flex-1 text-right">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{method.name}</span>
                        {isSelected && (
                          <FaCheckCircle className="text-green-500" />
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
              className="flex-1 border rounded-lg py-3"
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedMethod || loading}
              className="flex-1 bg-blue-600 text-white rounded-lg py-3 disabled:opacity-50"
            >
              {loading ? "جاري التأكيد..." : "تأكيد الدفع"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// export default PaymentModal;

// DriverCard Component
function DriverCard({
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
  isPending = true,
  offerId,
  createdAt,
  vehicleType,
  phone,
  index
}) {
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    if (!isPending || accepting) return;
    
    setAccepting(true);
    try {
      await onAcceptOrder();
    } finally {
      setAccepting(false);
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'الآن';
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `قبل ${diffMins} دقيقة`;
    if (diffMins < 1440) return `قبل ${Math.floor(diffMins / 60)} ساعة`;
    return `قبل ${Math.floor(diffMins / 1440)} يوم`;
  };

  const getBadgeColor = (index) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-amber-500 to-amber-600',
      'from-rose-500 to-rose-600',
      'from-indigo-500 to-indigo-600'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
      {/* Header with badge */}
      <div className="relative">
        <div className={`absolute top-4 right-4 bg-gradient-to-r ${getBadgeColor(index)} text-white text-xs font-bold px-3 py-1 rounded-full z-10`}>
          العرض #{index + 1}
        </div>
        
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Truck className="w-7 h-7 text-white" />
              </div>
              {isPending && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg mb-1">{name}</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= Math.round(parseFloat(rating)) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-900">{rating}</span>
                <span className="text-xs text-gray-500">{successfulOrders}</span>
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
            <span className="font-medium text-gray-500 text-sm">{getTimeAgo(createdAt)}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <button
            onClick={handleAccept}
            disabled={!isPending || accepting}
            className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-3 ${
              isPending 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {accepting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>جاري القبول...</span>
              </>
            ) : isPending ? (
              <>
                <span>قبول العرض</span>
                <span className="text-lg">•</span>
                <span>{price}</span>
              </>
            ) : (
              'تم قبول العرض'
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
}

// Main Component
export default function AvailableDriversPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [offersData, setOffersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const [stats, setStats] = useState({
    totalOffers: 0,
    averagePrice: 0,
    fastestDelivery: 0,
    lowestPrice: 0
  });

  // Get orderId from URL
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      fetchOffers();
    } else {
      router.back();
    }
  }, [orderId]);

  // 🔴 **تحديث دالة fetchOffers مع token ومعالجة المصادقة**
  const fetchOffers = async () => {
    try {
      setRefreshing(true);
      
      // الحصول على token
      const accessToken = getAccessToken();
      
      if (!accessToken) {
        // إذا لم يكن هناك token، توجيه لصفحة تسجيل الدخول
        setError('يجب تسجيل الدخول للوصول إلى هذه الصفحة');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log('Fetching offers with token:', accessToken?.substring(0, 20) + '...');
      
      // محاولة جلب البيانات الحقيقية مع token
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/offers`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        cache: 'no-store'
      });

      const data = await response.json();
      console.log('Offers API response:', data);
      
      if (response.ok && data.status) {
        setOffersData(data.data);
        setUseMockData(false);
        setError(null);
        calculateStats(data.data.offers);
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
      }
    } catch (err) {
      console.warn('API Error:', err.message);
      
      // استخدام البيانات الوهمية كبديل
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
    } finally {
      setLoading(false);
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

  const handleDriverSelect = (driverId, offerId, driverData) => {
    setSelectedDriverId(driverId);
    setSelectedOfferId(offerId);
    setIsModalOpen(true);
    // Store driver data in session for modal
    sessionStorage.setItem('selectedDriver', JSON.stringify(driverData));
  };

  // 🔴 **تحديث دالة handleConfirmPayment**
  const handleConfirmPayment = async (methodId, driverId) => {
    try {
      // ✅ سيتم تنفيذ قبول السائق في PaymentModal
      // بعد النجاح، توجيه المستخدم لصفحة تأكيد الطلب
      router.push(`/orders/${orderId}/confirmation?driver=${driverId}&offer=${selectedOfferId}`);
    } catch (err) {
      console.error('Error in payment confirmation:', err);
      alert('حدث خطأ في تأكيد الطلب. يرجى المحاولة مرة أخرى.');
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
            <p className="mt-6 text-gray-600 font-medium">جاري البحث عن أفضل العروض...</p>
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
              onClick={() => router.back()}
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
                          
                          <div className="bg-white/20 backdrop-blur-lg px-4 py-2 rounded-xl border border-white/30">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">جاري البحث</span>
                            </div>
                          </div>
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
                <h2 className="text-xl font-bold text-gray-900">العروض المتاحة</h2>
                <div className="text-sm text-gray-500">
                  يتم ترتيب العروض حسب السعر والأقرب
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {offersData?.offers?.map((offer, index) => (
                <motion.div
                  key={offer.id}
                  variants={itemVariants}
                  custom={index}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <DriverCard
                    {...formatDriverData(offer)}
                    onAcceptOrder={() => handleDriverSelect(
                      offer.driver_id, 
                      offer.id, 
                      formatDriverData(offer)
                    )}
                    isPending={offer.status === 'pending'}
                    index={index}
                  />
                </motion.div>
              ))}
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

            {/* Tips Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6"
            >
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                نصائح للاختيار الأمثل
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <h4 className="font-medium">السعر والتوقيت</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    اختر العرض الذي يوازن بين السعر المناسب ووقت التوصيل الأمثل
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <h4 className="font-medium">التقييم والخبرة</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    انظر إلى تقييم السائق وعدد الطلبات المكتملة للتجربة الأفضل
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <h4 className="font-medium">نوع المركبة</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    تأكد من أن نوع المركبة مناسب لحجم وشكل شحنتك
                  </p>
                </div>
              </div>
            </motion.div>
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
                  <DriversMap
                    drivers={offersData?.offers?.map(formatDriverData) || []}
                  />
                </div>
                
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">معلومات الخريطة</p>
                      <p className="text-xs text-gray-500">
                        يتم تحديث المواقع كل 30 ثانية
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 bg-white rounded-2xl shadow-md border border-gray-200 p-5">
                <h4 className="font-bold text-gray-900 mb-4">معلومات سريعة</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">رقم الطلب:</span>
                    <span className="font-medium">#{orderId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">عدد العروض:</span>
                    <span className="font-medium">{offersData?.total_offers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">العروض النشطة:</span>
                    <span className="font-medium text-green-600">{offersData?.active_offers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">أقل سعر:</span>
                    <span className="font-medium text-blue-600">{stats.lowestPrice} ريال</span>
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
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmPayment}
        selectedDriverId={selectedDriverId}
        selectedOfferId={selectedOfferId}
        orderId={orderId}
        useMockData={useMockData}
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