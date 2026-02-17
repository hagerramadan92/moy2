// app/orders/[id]/page.js
'use client';
import { useParams, useRouter } from 'next/navigation';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  // orderId يأتي من URL مثل /orders/154
  const orderId = params.id; // أو params.orderId حسب تسميتك
  
  const handleViewAvailableDrivers = () => {
    // 1. تمرير orderId في query parameter
    router.push(`/available-drivers?orderId=${orderId}`);
    
    // أو 2. استخدام Dynamic Route
    // router.push(`/orders/${orderId}/drivers`);
  };
  
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* تفاصيل الطلب */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              تفاصيل الطلب #{orderId}
            </h1>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              قيد الانتظار
            </span>
          </div>
          
          {/* معلومات الطلب */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">معلومات التوصيل</h3>
              <div className="space-y-2">
                <p><span className="font-medium">من:</span> الرياض - حي الملك فهد</p>
                <p><span className="font-medium">إلى:</span> جدة - حي السلامة</p>
                <p><span className="font-medium">نوع الشحنة:</span> أجهزة إلكترونية</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">التوقيت</h3>
              <div className="space-y-2">
                <p><span className="font-medium">تاريخ الطلب:</span> 28 يناير 2024</p>
                <p><span className="font-medium">الوقت المتوقع:</span> 30 دقيقة</p>
              </div>
            </div>
          </div>
          
          {/* زر عرض السائقين */}
          <div className="border-t pt-6">
            <button
              onClick={handleViewAvailableDrivers}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>عرض السائقين المتاحين</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <p className="text-sm text-gray-700 text-center mt-3">
              سيتم عرض جميع السائقين المتاحين لتوصيل طلبك
            </p>
          </div>
        </div>
        
        {/* يمكنك إضافة مكونات أخرى هنا */}
      </div>
    </div>
  );
}