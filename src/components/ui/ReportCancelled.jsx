'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ReportCancelled({ isOpen, onClose }) {
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  const handleClose = () => {
    onClose();
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4">
      <div 
        className="w-full max-w-[400px] rounded-2xl bg-white relative"
        style={{
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)'
        }}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <span className="text-lg text-gray-600">×</span>
        </button>

        <div className="px-4 py-6 flex flex-col items-center">
          
          <div className="relative w-14 h-14 mb-4">
            <Image
              src="/mark.png"
              alt="Order Cancelled"
              fill
              className="object-contain"
            />
          </div>

          <div className="text-center mb-3">
            <h2 className="font-cairo font-semibold text-lg text-black">
              تم الابلاغ بنجاح
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}