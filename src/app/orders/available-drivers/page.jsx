'use client';

import AvailableDriversPage from '@/components/molecules/orders/AvailableDriversPage';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
// import LoadingSpinner from '@/components/atoms/LoadingSpinner'; // إذا كان لديك

export default function AvailableDriversRoute() {
  const router = useRouter();
  
  const handleBack = () => {
    router.push('/order/search-driver');
  };
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-[#579BE8]"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">جاري تحميل الصفحة...</p>
          </div>
        </div>
      </div>
    }>
      <AvailableDriversPage onBack={handleBack} />
    </Suspense>
  );
}