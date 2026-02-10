"use client";
import React, { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  Phone, 
  MessageCircle, 
  Star, 
  ChevronLeft,
  MapPin,
  Calendar,
  IdCard,
  Car,
  CheckCircle2,
  XCircle,
  Clock,
  Navigation,
  Shield,
  Award,
  User,
  Mail,
  Building
} from "lucide-react";
import { API_BASE_URL, getAccessToken } from "@/components/molecules/orders/utils/api";
import { motion } from "framer-motion";

// Dynamically import map to avoid SSR
const DriverLocationMap = dynamic(
  () => import('./DriverLocationMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[300px] sm:h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#579BE8] mx-auto mb-2"></div>
          <span className="text-gray-400 text-sm">جاري تحميل الخريطة...</span>
        </div>
      </div>
    )
  }
);

function DriverProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const driverId = searchParams?.get("driverId") || searchParams?.get("id");
  
  const [driverData, setDriverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!driverId) {
      setError('معرف السائق مطلوب');
      setLoading(false);
      return;
    }

    fetchDriverData();
  }, [driverId]);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = getAccessToken();
      if (!accessToken) {
        setError('يجب تسجيل الدخول للوصول إلى هذه الصفحة');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/driver/${driverId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        cache: 'no-store'
      });

      const data = await response.json();

      if (response.ok && data.status && data.data) {
        setDriverData(data.data);
      } else {
        throw new Error(data.message || 'فشل في جلب بيانات السائق');
      }
    } catch (err) {
      console.error('Error fetching driver data:', err);
      setError(err.message || 'حدث خطأ أثناء جلب بيانات السائق');
    } finally {
      setLoading(false);
    }
  };

  const openChat = () => {
    if (typeof window !== 'undefined' && driverData?.user) {
      window.dispatchEvent(new CustomEvent('start-new-chat', {
        detail: { 
          participantId: driverData.user.id,
          participantName: driverData.user.name 
        }
      }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'غير محدد';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#579BE8] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جاري تحميل بيانات السائق...</p>
        </div>
      </div>
    );
  }

  if (error || !driverData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">حدث خطأ</h2>
          <p className="text-gray-600 mb-6">{error || 'لم يتم العثور على بيانات السائق'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-[#579BE8] text-white rounded-xl font-medium hover:bg-[#4a8dd8] transition"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  const user = driverData.user || {};
  const location = driverData.currect_location || {};
  const avatar = user.avatar || driverData.personal_photo || '/images/driver.png';
  const isActive = driverData.is_active;
  const isVerified = driverData.is_verified;
  const status = driverData.status;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-8">
        {/* Header with Back Button */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-[#579BE8] transition-all font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-[#579BE8]/5"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>العودة</span>
          </button>
        </div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] text-white rounded-2xl shadow-2xl overflow-hidden mb-6"
        >
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
                  <Image 
                    src={avatar} 
                    alt={user.name || 'سائق'} 
                    width={160} 
                    height={160} 
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.src = '/images/driver.png';
                    }}
                  />
                </div>
                {isActive && (
                  <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Driver Info */}
              <div className="flex-1 text-center sm:text-right">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">{user.name || 'سائق'}</h1>
                  {isVerified && (
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" fill="currentColor" />
                  )}
                </div>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 mb-4">
                 
                  
                  <button 
                    onClick={openChat}
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-lg rounded-lg hover:bg-white/30 transition border border-white/30"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm sm:text-base">دردشة</span>
                  </button>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    isActive 
                      ? 'bg-green-500/30 text-green-100 border border-green-300/50' 
                      : 'bg-red-500/30 text-red-100 border border-red-300/50'
                  }`}>
                    {isActive ? 'نشط' : 'غير نشط'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    isVerified 
                      ? 'bg-yellow-500/30 text-yellow-100 border border-yellow-300/50' 
                      : 'bg-gray-500/30 text-gray-100 border border-gray-300/50'
                  }`}>
                    {isVerified ? 'موثق' : 'غير موثق'}
                  </span>
                  {status && (
                    <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-white/20 backdrop-blur-lg border border-white/30">
                      {status === 'saudi' ? 'سعودي' : status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Main Information */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Personal Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#579BE8]/10 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#579BE8]" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">المعلومات الشخصية</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <InfoItem 
                  icon={<Calendar className="w-5 h-5 text-[#579BE8]" />}
                  label="تاريخ الميلاد"
                  value={formatDate(driverData.date_of_birth)}
                />
             
                <InfoItem 
                  icon={<Mail className="w-5 h-5 text-[#579BE8]" />}
                  label="حالة الحساب"
                  value={user.status === 'active' ? 'نشط' : user.status || 'غير محدد'}
                />
              </div>
            </motion.div>

            {/* Vehicle Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#579BE8]/10 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 sm:w-6 sm:h-6 text-[#579BE8]" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">معلومات المركبة</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem 
                  icon={<Car className="w-5 h-5 text-[#579BE8]" />}
                  label="حجم المركبة"
                  value={driverData.vehicle_size ? `${driverData.vehicle_size} طن` : 'غير محدد'}
                />
              
                <InfoItem 
                  icon={<IdCard className="w-5 h-5 text-[#579BE8]" />}
                  label="رقم اللوحة"
                  value={driverData.vehicle_plate_number || 'غير محدد'}
                />
                {driverData.vehicle_registration_number && (
                  <InfoItem 
                    icon={<Award className="w-5 h-5 text-[#579BE8]" />}
                    label="رقم التسجيل"
                    value={driverData.vehicle_registration_number}
                  />
                )}
              </div>
            </motion.div>

            {/* Location Information Card */}
            {location && (location.lat || location.lng) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#579BE8]/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#579BE8]" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">الموقع الحالي</h2>
                </div>

                {/* Map */}
                {location.lat && location.lng && (
                  <div className="mb-4 sm:mb-6 rounded-lg overflow-hidden border border-gray-200 h-[300px] sm:h-[400px]">
                    <DriverLocationMap 
                      lat={parseFloat(location.lat)} 
                      lng={parseFloat(location.lng)}
                      driverName={user.name || 'سائق'}
                      speed={location.speed}
                      heading={location.heading}
                    />
                  </div>
                )}

                
              </motion.div>
            )}

            {/* Additional Information Card */}
            {(driverData.max_daily_orders || driverData.radius_km || driverData.preferred_working_hours || driverData.verified_at || driverData.rejection_reason) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#579BE8]/10 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#579BE8]" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">معلومات إضافية</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {driverData.max_daily_orders && (
                    <InfoItem 
                      icon={<Clock className="w-5 h-5 text-[#579BE8]" />}
                      label="الحد الأقصى للطلبات اليومية"
                      value={driverData.max_daily_orders}
                    />
                  )}
                  {driverData.radius_km && (
                    <InfoItem 
                      icon={<MapPin className="w-5 h-5 text-[#579BE8]" />}
                      label="نطاق العمل (كم)"
                      value={`${driverData.radius_km} كم`}
                    />
                  )}
                  {driverData.preferred_working_hours && (
                    <InfoItem 
                      icon={<Clock className="w-5 h-5 text-[#579BE8]" />}
                      label="ساعات العمل المفضلة"
                      value={driverData.preferred_working_hours}
                      className="sm:col-span-2"
                    />
                  )}
                  {driverData.verified_at && (
                    <InfoItem 
                      icon={<CheckCircle2 className="w-5 h-5 text-[#579BE8]" />}
                      label="تاريخ التوثيق"
                      value={formatDateTime(driverData.verified_at)}
                    />
                  )}
                  {driverData.rejection_reason && (
                    <InfoItem 
                      icon={<XCircle className="w-5 h-5 text-red-500" />}
                      label="سبب الرفض"
                      value={driverData.rejection_reason}
                      className="sm:col-span-2"
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* Reviews List Card */}
            {driverData.reviews && driverData.reviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#579BE8]/10 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[#579BE8]" fill="currentColor" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">تقييمات العملاء</h2>
                  </div>
                  <span className="px-3 py-1 bg-[#579BE8]/10 text-[#579BE8] rounded-full text-sm font-medium">
                    {driverData.reviews.length} تقييم
                  </span>
                </div>

                <ReviewsList reviews={driverData.reviews} formatDateTime={formatDateTime} />
              </motion.div>
            )}
          </div>

          {/* Right Column - Quick Stats */}
          <div className="space-y-4 sm:space-y-6">
            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">إحصائيات سريعة</h3>
              <div className="space-y-4">
                <StatItem 
                  label="معرف السائق"
                  value={`#${driverData.id}`}
                />
              
                {driverData.created_at && (
                  <StatItem 
                    label="تاريخ التسجيل"
                    value={formatDate(driverData.created_at)}
                  />
                )}
                {driverData.updated_at && (
                  <StatItem 
                    label="آخر تحديث"
                    value={formatDate(driverData.updated_at)}
                  />
                )}
              </div>
            </motion.div>

            {/* Reviews Summary Card */}
            {driverData.reviews && driverData.reviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">ملخص التقييمات</h3>
                <div className="text-center">
                  {(() => {
                    const avgRating = driverData.reviews.reduce((sum, review) => sum + parseFloat(review.rating || 0), 0) / driverData.reviews.length;
                    const roundedRating = Math.round(avgRating * 10) / 10;
                    return (
                      <>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 fill-current" />
                          <div className="text-3xl sm:text-4xl font-bold text-[#579BE8]">
                            {roundedRating.toFixed(1)}
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">
                          من {driverData.reviews.length} تقييم
                        </p>
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Info Item Component
function InfoItem({ icon, label, value, className = '' }) {
  return (
    <div className={`flex items-start gap-3 p-3 bg-gray-50 rounded-lg ${className}`}>
      <div className="flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm sm:text-base font-medium text-gray-900 break-words">{value}</p>
      </div>
    </div>
  );
}

// Stat Item Component
function StatItem({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-bold text-[#579BE8]">{value}</span>
    </div>
  );
}

// Reviews List Component with "Show More" functionality
function ReviewsList({ reviews, formatDateTime }) {
  const [showAll, setShowAll] = useState(false);
  const maxVisible = 7;
  const hasMore = reviews.length > maxVisible;
  const visibleReviews = showAll ? reviews : reviews.slice(0, maxVisible);

  return (
    <>
      <div className="space-y-4">
        {visibleReviews.map((review, index) => (
          <ReviewCard key={review.id || index} review={review} formatDateTime={formatDateTime} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-3 bg-[#579BE8] text-white rounded-xl font-medium hover:bg-[#4a8dd8] transition-all flex items-center gap-2 mx-auto"
          >
            {showAll ? (
              <>
                <ChevronLeft className="w-4 h-4 rotate-180" />
                عرض أقل
              </>
            ) : (
              <>
                عرض المزيد ({reviews.length - maxVisible} تقييم إضافي)
                <ChevronLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}

// Review Card Component
function ReviewCard({ review, formatDateTime }) {
  const user = review.user || {};
  const rating = parseFloat(review.rating || 0);
  const roundedRating = Math.round(rating);

  return (
    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 border border-gray-200 hover:border-[#579BE8]/30 transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#579BE8]/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#579BE8]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-1 truncate">
              {user.name || 'عميل'}
            </h4>
            {user.phone && (
              <p className="text-xs text-gray-500 truncate">{user.phone}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                  star <= roundedRating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#579BE8]">
            {rating.toFixed(1)}
          </span>
        </div>
      </div>

      {review.comment && (
        <p className="text-sm text-gray-700 mb-3 leading-relaxed">
          {review.comment}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDateTime(review.created_at)}</span>
        </div>
        {review.order_id && (
          <span className="text-xs text-[#579BE8] bg-[#579BE8]/10 px-2 py-1 rounded-full font-medium">
            طلب #{review.order_id}
          </span>
        )}
      </div>
    </div>
  );
}

export default function DriverProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#579BE8] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جاري التحميل...</p>
        </div>
      </div>
    }>
      <DriverProfileContent />
    </Suspense>
  );
}
