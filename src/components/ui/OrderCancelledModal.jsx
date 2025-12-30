'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export default function OrderCancelledModal({ 
  isOpen, 
  onClose, 
  onNewOrder,
  onConfirmCancel 
}) {
  
  // Auto-close and confirm after 30 seconds
  useEffect(() => {
    if (isOpen) {
      // Disable body scrolling
      document.body.style.overflow = 'hidden';
      
      // Set timer for auto-confirmation after 30 seconds
      const timer = setTimeout(() => {
        onConfirmCancel?.();
        onClose?.();
      }, 30000);
      
      // Cleanup function
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'auto';
      };
    }
  }, [isOpen, onClose, onConfirmCancel]);

  // Don't render if modal is not open
  if (!isOpen) return null;

  // Handle new order button click
  const handleNewOrder = () => {
    onNewOrder?.();
    onClose?.();
  };

  // Handle close button click
  const handleClose = () => {
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4">
      {/* Modal Container */}
      <div 
        className="w-full max-w-[512px] rounded-2xl bg-white relative"
        style={{
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <span className="text-lg text-gray-600">×</span>
        </button>

        {/* Modal Content */}
        <div className="px-4 py-6 flex flex-col items-center">
          
          {/* Success Icon */}
          <div className="relative w-14 h-14 mb-4">
            <Image
              src="/mark.png"
              alt="Order Cancelled"
              fill
              className="object-contain"
            />
          </div>

          {/* Title */}
          <div className="text-center mb-3">
            <h2 className="font-cairo font-semibold text-lg text-black">
              تم اِلغاء طلبك
            </h2>
          </div>

          {/* Message */}
          <div className="px-2 mb-6">
            <p className="font-cairo font-normal text-center text-black text-sm">
              تم تحويل الاموال الي محفظتك و تستطيع استخدامها في الطلبات القادمه او استردادها من خلال تقديم طلب
            </p>
          </div>

          {/* New Order Button */}
          <button
            onClick={handleNewOrder}
            className="w-full h-12 rounded-xl bg-[#579BE8] hover:bg-[#4688d6] transition-colors flex items-center justify-center"
          >
            <span className="font-cairo font-semibold text-lg text-white">
              طلب جديد
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}