'use client';

import { useState, useMemo, memo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Star, 
  Truck, 
  CheckCircle,
  X,
  Phone,
  Car,
  User,
} from 'lucide-react';

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

export default DriverCard;

