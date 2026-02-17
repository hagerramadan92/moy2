'use client';
import { useState } from 'react';
import { Clock, Star, Truck, Phone, Package, User, CheckCircle } from 'lucide-react';

export default function DriverCard({
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

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'غير متوفر';
    return phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 border-b border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
              <p className="text-sm text-gray-600">رقم السائق: #{driverId}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isPending 
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
              : 'bg-green-100 text-green-800 border border-green-200'
          }`}>
            {isPending ? 'في انتظار الرد' : 'تم القبول'}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(parseFloat(rating)) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="font-bold text-gray-900 mr-1">{rating}</span>
            <span className="text-xs text-gray-700">({successfulOrders} تقييم)</span>
          </div>
          
          <div className="text-xs text-gray-700">
            العرض #{offerId} • {getTimeAgo(createdAt)}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-700">الوقت المتوقع</span>
            </div>
            <p className="font-bold text-gray-900">{deliveryTime}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-700">نوع المركبة</span>
            </div>
            <p className="font-bold text-gray-900">{vehicleType}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-gray-700">الطلبات المكتملة</span>
            </div>
            <p className="font-bold text-gray-900">{ordersCount}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-gray-700">رقم الهاتف</span>
            </div>
            <p className="font-bold text-gray-900">{formatPhoneNumber(phone)}</p>
          </div>
        </div>

        {/* Price Section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">سعر التوصيل</p>
              <p className="font-bold text-gray-900 text-2xl">{price} ر.س</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-700 mb-1">ترتيب العرض</p>
              <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                {index + 1}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={handleAccept}
            disabled={!isPending || accepting}
            className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              isPending 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow' 
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
                <CheckCircle className="w-5 h-5" />
                <span>قبول هذا العرض</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>تم قبول العرض</span>
              </>
            )}
          </button>
          
          {isPending && (
            <p className="text-xs text-gray-400 text-center mt-3">
              سيتم إلغاء العروض الأخرى تلقائياً عند قبول هذا العرض
            </p>
          )}
        </div>
      </div>
    </div>
  );
}