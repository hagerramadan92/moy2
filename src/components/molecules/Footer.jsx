"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#072D58] to-[#072D58] text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
       
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          
        <div className="md:col-span-2 lg:col-span-2">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 pb-2">
              ويت مي
            </h3>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
              خدمة توصيل المياه الرائدة في المملكة العربية السعودية، 
              نربط بين العملاء مع سائقين موثوقين لتوصيل المياه بسرعة وأمان.
            </p>
            
           
            <div className="bg-blue-900/30 rounded-lg p-4 mt-6">
              <p className="text-xs text-gray-400 mb-2">
                © 2024 WhiteWash. جميع الحقوق محفوظة
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                دفوع الموقع متوافق مع جميع الأجهزة | عربية إدارة ومتطلبات الوصول | 
                لا يجوز استخدام أي جزء من هذا الموقع أو التطبيق دون إذن خطي مسبق | 
                يتماشى مع قوانين الشريعة الإسلامية والقوانين المحلية والدولية
              </p>
            </div>
          </div>
          <div className="md:col-span-1">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 pb-2 ">
              الدعم
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200">
                  تواصل معنا
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200">
                  الدعم الفني
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200">
                  مركز المساعدة
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200">
                  بلغ عن مشكلة
                </a>
              </li>
            </ul>
          </div>

        
          <div className="md:col-span-1">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 pb-2 ">
              قانوني
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200">
                  سياسة الخصوصية
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200">
                  المصطلحات والتحكم
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200">
                  سياسة الاستخدام
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200">
                  الأسئلة الشائعة
                </a>
              </li>
            </ul>
          </div>

       
          <div className="md:col-span-1">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 pb-2 ">
              الشركة
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200">
                  من نحن
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200">
                  كيفية العمل
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200">
                  الأسعار
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200">
                  المدونة
                </a>
              </li>
            </ul>
          </div>

    
          
        </div>

      
        <div className="border-t border-white my-6 sm:my-8"></div>

       
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
          <div className="text-center sm:text-left order-2 sm:order-1">
            <p className="text-gray-400 text-xs leading-relaxed max-w-2xl">
              تم تصميم وتطوير هذا الموقع وفق أعلى معايير الجودة والأمان
            </p>
          </div>
          
          <div className="flex gap-4 order-1 sm:order-2 mb-4 sm:mb-0">
            <a href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm transition-colors duration-200">
              Privacy Policy
            </a>
            <span className="text-gray-600">|</span>
            <a href="#" className="text-gray-300 hover:text-white text-xs sm:text-sm transition-colors duration-200">
              Terms and Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}