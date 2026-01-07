// components/ui/DriverCard.jsx
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Clock, Star, CheckCircle2, Package } from 'lucide-react';

// Constants
const IMAGE_PATHS = {
  driver: "/image%204.png",
  fileIcon: "/Vector (6).png",  
  starIcon: "/Vector (3).png",
  timeIcon: "/time.png",
  ratingStar: "/Vector (4).png",
  ordersIcon: "/images/RS2.png",
  acceptIcon: "/Vector (5).png"
};

// Helper Functions
const getImagePath = (path) => {
  if (path && path.includes(' ')) {
    return encodeURI(path);
  }
  return path;
};

// Main Component
const DriverCard = ({
  name,
  driverName,
  driverImage = IMAGE_PATHS.driver,
  deliveryTime = "55 د",
  rating = "4.5",
  successfulOrders = "(1,439) طلب ناجح",
  ordersCount = "238",
  id,
  driverId,
  onAcceptOrder,
  onViewOrders
}) => {
  // Support both 'name' and 'driverName' props for compatibility
  const displayName = name || driverName || "سعود بن ناصر المطيري";
  const currentDriverId = id || driverId;
  const router = useRouter();
  
  const handleViewOrders = () => onViewOrders?.(currentDriverId);
  const handleAcceptOrder = () => onAcceptOrder?.(currentDriverId);
  
  const handleFileIconClick = () => {
    if (currentDriverId) {
      router.push(`/driver-rating?id=${currentDriverId}`);
    } else {
      router.push('/driver-rating');
    }
  };

  return (
    <div className="
      group
      w-full
      min-w-[180px]
      md:min-w-[250px]
      bg-white
      rounded-2xl
      border-2
      border-[#579BE8]/20
      shadow-lg
      shadow-[#579BE8]/5
      hover:shadow-2xl
      hover:shadow-[#579BE8]/20
      hover:border-[#579BE8]/40
      transition-all
      duration-300
      overflow-hidden
      relative
    ">
      {/* Top Section with File Icon */}
      <div className="relative pt-4 px-4 pb-2">
        <div className="flex items-start justify-between">
            {/* Status Badge */}
            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full border border-green-200">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-medium text-green-700">متاح</span>
          </div>
          {/* File Icon */}
          <button
            onClick={handleFileIconClick}
            className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity duration-200 active:scale-95"
            aria-label="عرض تفاصيل السائق"
          >
            <div className="relative w-6 h-6">
              <Image
                src={getImagePath(IMAGE_PATHS.fileIcon)}
                alt="File icon"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-cairo font-medium text-[10px] text-gray-500">
              الملف
            </span>
          </button>
          
        
        </div>
      </div>

      {/* Driver Image Section */}
      <div className="flex justify-center -mt-2 mb-2">
        <div className="relative">
          {/* Image Container with Border */}
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden ring-3 ring-[#579BE8]/10 group-hover:ring-[#579BE8]/20 transition-all duration-300">
            <Image
              src={getImagePath(driverImage)}
              alt={`${displayName} photo`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="96px"
            />
          </div>
          {/* Verified Badge */}
          <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-br from-[#579BE8] to-[#124987] rounded-full p-1 shadow-lg">
            <CheckCircle2 size={12} className="text-white" />
          </div>
        </div>
      </div>

      {/* Driver Name Section */}
      <div className="px-4 mb-3">
        <div className="flex items-center justify-center gap-1.5">
          <h3 className="font-cairo font-bold text-base text-gray-900 text-center">
            {displayName}
          </h3>
          <div className="relative w-4 h-4 flex-shrink-0">
            <Image
              src={getImagePath(IMAGE_PATHS.starIcon)}
              alt="Star icon"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Info Stats Section */}
      <div className="px-4 mb-3">
        <div className="flex items-center justify-between gap-2 bg-gray-50/50 rounded-xl p-2 border border-gray-100">
          {/* Delivery Time */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="relative w-3.5 h-3.5 flex-shrink-0">
              <Image
                src={getImagePath(IMAGE_PATHS.timeIcon)}
                alt="Delivery time"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-cairo font-bold text-xs text-gray-900 leading-tight">
                {deliveryTime}
              </span>
              <span className="font-cairo font-normal text-[9px] text-gray-500 leading-tight">
                دقيقة
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200" />

          {/* Rating */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="relative w-3.5 h-3.5 flex-shrink-0">
              <Image
                src={getImagePath(IMAGE_PATHS.ratingStar)}
                alt="Rating"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-cairo font-bold text-xs text-gray-900 leading-tight">
                {rating}
              </span>
              <span className="font-cairo font-normal text-[9px] text-gray-500 leading-tight">
                تقييم
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200" />

          {/* Successful Orders */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Package size={14} className="text-gray-700 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-cairo font-bold text-xs text-gray-900 leading-tight truncate">
                {successfulOrders.split(' ')[0]}
              </span>
              <span className="font-cairo font-normal text-[9px] text-gray-500 leading-tight">
                طلب
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="px-4 pb-4 space-y-2">
        {/* Orders Count Button */}
        <button
          onClick={handleViewOrders}
          className="
            w-full
            h-10
            rounded-xl
            bg-gradient-to-r
            from-[#579BE8]/10
            to-[#579BE8]/5
            border
            border-[#579BE8]/20
            flex
            items-center
            justify-center
            gap-1.5
            hover:from-[#579BE8]/20
            hover:to-[#579BE8]/10
            hover:border-[#579BE8]/30
            hover:shadow-md
            transition-all
            duration-200
            group/btn
          "
        >
          <span className="font-cairo font-bold text-sm text-[#579BE8]">
            {ordersCount}
          </span>
          <div className="relative w-4 h-4">
            <Image
              src={getImagePath(IMAGE_PATHS.ordersIcon)}
              alt="Orders"
              fill
              className="object-contain group-hover/btn:scale-110 transition-transform"
            />
          </div>
          <span className="font-cairo font-medium text-xs text-[#4a8dd8]">
            طلب
          </span>
        </button>

        {/* Accept Button */}
        <button
          onClick={handleAcceptOrder}
          className="
            w-full
            h-11
            rounded-xl
            bg-gradient-to-r
            from-[#579BE8]
            via-[#4a8dd8]
            to-[#124987]
            hover:from-[#4a8dd8]
            hover:via-[#3d7bc7]
            hover:to-[#0f3d6f]
            shadow-lg
            shadow-[#579BE8]/30
            hover:shadow-xl
            hover:shadow-[#579BE8]/40
            flex
            items-center
            justify-center
            gap-2
            transition-all
            duration-200
            group/accept
            relative
            overflow-hidden
          "
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/accept:translate-x-full transition-transform duration-1000" />
          
          <div className="relative w-4 h-4 z-10">
            <Image
              src={getImagePath(IMAGE_PATHS.acceptIcon)}
              alt="Accept"
              fill
              className="object-contain brightness-0 invert"
            />
          </div>
          <span className="font-cairo font-bold text-sm text-white z-10">
            قبول الطلب
          </span>
        </button>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#579BE8]/0 via-[#4a8dd8]/0 to-[#124987]/0 group-hover:from-[#579BE8]/5 group-hover:via-[#4a8dd8]/3 group-hover:to-[#124987]/5 pointer-events-none transition-all duration-300 -z-10" />
    </div>
  );
};

export default DriverCard;
