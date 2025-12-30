'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function OrderScheduledModal({ 
  isOpen, 
  onClose,
  onGoToHome 
}) {
  const router = useRouter();
  
  // Handle home button click - navigates to drivers page
  const handleGoToHome = () => {
    if (onGoToHome) {
      onGoToHome();
    } else {
      router.push('/drivers');
    }
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[99999] p-4">
      {/* Modal Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-[500px] h-auto rounded-[20px] bg-white border border-[#579BE840] shadow-[0px_0px_18px_0px_#579BE840] p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <span className="text-xl text-gray-600">×</span>
        </button>
        
        {/* Modal Content */}
        <div className="flex flex-col items-center justify-center gap-8">
          
          {/* Success Image */}
          <div className="w-[180px] h-[190px] relative">
            <Image
              src="/mark2.png"
              alt="Order Scheduled Successfully"
              fill
              className="object-contain"
              sizes="180px"
            />
          </div>

          {/* Text Content */}
          <div className="flex flex-col items-center text-center gap-4">
            {/* Main Title */}
            <h1 className="font-cairo font-semibold text-2xl md:text-3xl text-[#579BE8]">
              تم جدولة طلبك بنجاح
            </h1>

            {/* Subtitle */}
            <p className="font-cairo font-normal text-lg md:text-xl text-[#579BE8]">
              تقدر تتابعه من صفحة طلباتك
            </p>
          </div>

          {/* Home Button */}
          <button
            onClick={handleGoToHome}
            className="w-full max-w-[300px] h-14 rounded-[18px] bg-[#579BE8] hover:bg-[#4a8bd4] transition-colors flex items-center justify-center"
          >
            <span className="font-cairo font-semibold text-xl text-white">
              الرئيسية
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}