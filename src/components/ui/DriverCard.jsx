// components/ui/DriverCard.jsx
'use client';

import Image from 'next/image';

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

// Sub Components
const FileIconWithLabel = () => (
  <div className="absolute w-8 h-10 top-7 left-8 flex flex-col items-center">
    <div className="relative w-6 h-6 mb-1">
      <Image
        src={getImagePath(IMAGE_PATHS.fileIcon)}
        alt="File icon"
        fill
        className="object-contain"
      />
    </div>
    <span className="font-sf-arabic font-normal text-xs text-gray-600">
      الملف
    </span>
  </div>
);

const DriverImage = ({ imageUrl, alt }) => (
  <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
    <div className="relative w-28 h-28">
      <div className="relative w-full h-full rounded-[32px] overflow-hidden">
        <Image
          src={getImagePath(imageUrl)}
          alt={alt}
          fill
          className="object-cover"
          sizes="112px"
        />
      </div>
    </div>
  </div>
);

const DriverNameWithStar = ({ name }) => (
  <div className="absolute w-full top-40 px-6 flex items-center justify-center gap-2">
    <h3 className="font-cairo font-medium text-xl text-blue-600 whitespace-nowrap">
      {name}
    </h3>
    <div className="relative w-6 h-6">
      <Image
        src={getImagePath(IMAGE_PATHS.starIcon)}
        alt="Star icon"
        fill
        className="object-contain"
      />
    </div>
  </div>
);

const DriverInfoRow = ({ deliveryTime, rating, successfulOrders }) => (
  <div className="absolute w-[calc(100%-2rem)] top-48 left-6 flex items-center justify-between">
    {/* Delivery Time */}
    <div className="flex items-center gap-1">
      <div className="relative w-4 h-5">
        <Image
          src={getImagePath(IMAGE_PATHS.timeIcon)}
          alt="Delivery time"
          fill
          className="object-contain"
        />
      </div>
      <span className="font-sf-arabic font-normal text-sm text-blue-600 whitespace-nowrap">
        يصل في {deliveryTime}
      </span>
    </div>

    {/* Separator */}
    <div className="w-2 h-5">
      <span className="font-sf-arabic font-normal text-sm text-blue-600/50">
        |
      </span>
    </div>

    {/* Rating */}
    <div className="flex items-center gap-2">
      <div className="relative w-6 h-6">
        <Image
          src={getImagePath(IMAGE_PATHS.ratingStar)}
          alt="Rating"
          fill
          className="object-contain"
        />
      </div>
      <span className="font-sf-arabic font-medium text-xs text-blue-600 whitespace-nowrap">
        تقييم {rating}
      </span>
    </div>

    {/* Separator */}
    <div className="w-2 h-5">
      <span className="font-sf-arabic font-normal text-sm text-blue-600/50">
        |
      </span>
    </div>

    {/* Successful Orders */}
    <div className="flex items-center gap-2">
      <div className="relative w-4 h-4">
        <Image
          src={getImagePath(IMAGE_PATHS.ratingStar)}
          alt="Successful orders"
          fill
          className="object-contain"
        />
      </div>
      <span className="font-cairo font-medium text-xs text-blue-600 whitespace-nowrap">
        {successfulOrders}
      </span>
    </div>
  </div>
);

const OrdersButton = ({ ordersCount, onClick }) => (
  <button
    onClick={onClick}
    className="
      absolute w-80 h-14 
      lg:w-65
      top-56 left-4
      rounded-2xl
      bg-blue-50
      flex items-center justify-center gap-2
      hover:bg-blue-100
      transition-colors duration-200
    "
  >
    <span className="
      font-poppins font-semibold text-lg
      text-blue-600
    ">
      {ordersCount}
    </span>
    <div className="relative w-4 h-4">
      <Image
        src={getImagePath(IMAGE_PATHS.ordersIcon)}
        alt="Orders"
        fill
        className="object-contain"
      />
    </div>
  </button>
);

const AcceptButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="
      absolute w-80 h-14 
      lg:w-65
      top-72 left-4
      rounded-2xl
      bg-blue-600
      flex items-center justify-center gap-2
      hover:bg-blue-700
      transition-colors duration-200
    "
  >
    <div className="relative w-4 h-4">
      <Image
        src={getImagePath(IMAGE_PATHS.acceptIcon)}
        alt="Accept"
        fill
        className="object-contain"
        style={{ filter: 'brightness(0) invert(1)' }}
      />
    </div>
    <span className="
      font-cairo font-semibold text-lg
      text-white
    ">
      قبول
    </span>
  </button>
);

// Main Component
const DriverCard = ({
  driverName = "سعود بن ناصر المطيري",
  driverImage = IMAGE_PATHS.driver,
  deliveryTime = "55 د",
  rating = "4,5",
  successfulOrders = "(1,439) طلب ناجح",
  ordersCount = "238",
  driverId,
  onAcceptOrder,
  onViewOrders
}) => {
  const handleViewOrders = () => onViewOrders?.(driverId);
  const handleAcceptOrder = () => onAcceptOrder?.(driverId);

  return (
    <div className="
      w-full max-w-[420px] h-[365px]
      bg-white 
      rounded-2xl 
      border border-blue-500
      shadow-lg
      relative
    ">
      <FileIconWithLabel />
      <DriverImage imageUrl={driverImage} alt={`${driverName} photo`} />
      <DriverNameWithStar name={driverName} />
      <DriverInfoRow 
        deliveryTime={deliveryTime}
        rating={rating}
        successfulOrders={successfulOrders}
      />
      <OrdersButton ordersCount={ordersCount} onClick={handleViewOrders} />
      <AcceptButton onClick={handleAcceptOrder} />
    </div>
  );
};

export default DriverCard;