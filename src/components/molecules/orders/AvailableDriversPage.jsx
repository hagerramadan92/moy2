'use client';

import { Suspense } from 'react';
import { Truck } from 'lucide-react';
import AvailableDriversContent from './AvailableDriversContent';

// Re-export utility functions for backward compatibility
export { confirmDriverAfterPayment, getPaymentCallbackData, getPendingOfferData } from './utils/paymentHelpers';

// المكون الرئيسي مع Suspense
export default function AvailableDriversPage({ onBack }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-[#579BE8]"></div>
              <Truck className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#579BE8]" />
            </div>
            <p className="mt-6 text-gray-600 font-medium">جاري تحميل السائقين...</p>
          </div>
        </div>
      </div>
    }>
      <AvailableDriversContent onBack={onBack} />
    </Suspense>
  );
}
