"use client";

import React from "react";
import { FaMapMarkerAlt, FaSearch, FaClock, FaCheckCircle, FaStar } from "react-icons/fa";

export default function CurrentLocation() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* القسم الأيسر - النصوص والمميزات */}
            <div>
              {/* العنوان الرئيسي */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1E3A8A] mb-6 leading-tight">
                تحديد دقيق
              </h1>
              
              {/* العنوان الفرعي */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#3B82F6] mb-4 leading-relaxed">
                تتبع موقعك بدقة عالية على الخريطة
              </h2>
              
              {/* العنوان الثالث */}
              <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-[#2563EB] mb-8">
                نتائج مباشرة في الوقت الفعلي
              </h3>
              
              {/* العنوان الرابع */}
              <h4 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-10 border-t-2 border-blue-200 pt-6">
                حدد موقعك الآن
              </h4>
              
              {/* الخط الفاصل */}
              <div className="w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mb-10"></div>
              
              {/* قائمة النتائج */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-green-500 text-xl" />
                  <span className="text-lg sm:text-xl font-medium text-gray-800">Survance</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-green-500 text-xl" />
                  <span className="text-lg sm:text-xl font-medium text-gray-800">H Mart Survance</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-green-500 text-xl" />
                  <span className="text-lg sm:text-xl font-medium text-gray-800">الخالي</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-green-500 text-xl" />
                  <span className="text-lg sm:text-xl font-medium text-gray-800">Ridgewood</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-green-500 text-xl" />
                  <span className="text-lg sm:text-xl font-medium text-gray-800">Allendale</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-green-500 text-xl" />
                  <span className="text-lg sm:text-xl font-medium text-gray-800">The Home Depot</span>
                </div>
              </div>
            </div>
            
            {/* القسم الأيمن - الخريطة والبحث */}
            <div className="relative">
              {/* خريطة وهمية */}
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl p-6 shadow-2xl">
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  {/* شريط البحث */}
                  <div className="flex items-center bg-gray-50 rounded-xl p-3 mb-6">
                    <FaMapMarkerAlt className="text-blue-500 text-xl mr-3" />
                    <input 
                      type="text" 
                      placeholder="ابحث عن موقع أو عنوان..." 
                      className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-500 text-lg"
                    />
                    <button className="bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 transition-colors">
                      <FaSearch />
                    </button>
                  </div>
                  
                  {/* الخريطة المصغرة */}
                  <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                    {/* نقاط على الخريطة */}
                    <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-yellow-500 rounded-full animate-pulse border-2 border-white"></div>
                    
                    {/* شبكة الخريطة */}
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="h-20 bg-white/50 rounded-lg border border-blue-100"></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* معلومات الموقع */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-blue-500" />
                        <span className="font-semibold text-gray-800">موقعك الحالي</span>
                      </div>
                      <span className="text-sm text-green-600 font-medium">✓ متصل</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaClock className="text-blue-400" />
                      <span>تحديث في الوقت الحقيقي</span>
                    </div>
                  </div>
                </div>
                
                {/* إحصائيات */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow text-center">
                    <div className="text-2xl font-bold text-blue-600">99.8%</div>
                    <div className="text-sm text-gray-600">دقة الموقع</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow text-center">
                    <div className="text-2xl font-bold text-green-600">&lt; 2 ثانية</div>
                    <div className="text-sm text-gray-600">سرعة التحديث</div>
                  </div>
                </div>
              </div>
              
              {/* تأثيرات زخرفية */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-200 rounded-full opacity-30"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-100 rounded-full opacity-40"></div>
            </div>
          </div>
          
          {/* أزرار إضافية */}
          <div className="flex flex-wrap justify-center gap-4 mt-12">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2">
              <FaStar />
              ابدأ التتبع الآن
            </button>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg border border-blue-200">
              تعرف على المزيد
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}