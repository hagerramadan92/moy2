"use client";

import Image from "next/image";
import { IoWaterOutline, IoEyeOutline } from "react-icons/io5";
import { SlLocationPin } from "react-icons/sl";
import { FaMoneyBillWave } from "react-icons/fa6";
import { Package } from "lucide-react";

const HowItWorks = () => {
  return (
    <section
      dir="rtl"
      className="py-12 sm:py-16 lg:py-20 bg-[#EFF5FD] shadow-lg shadow-[#EFF5FD] relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#579BE8] mb-4">
            كيف تعمل الخدمة؟
          </h2>
        </div>

        {/* Steps Container */}
        <div className="relative">
          {/* Lines - Hidden on mobile, shown on medium screens and up */}
          <div className="hidden md:block">
            {/* Line 1 */}
            <div className="absolute top-[40px] right-[18%] xl:right-[21%] w-[16%] max-w-[183px] z-0">
              <div className="w-full h-2 bg-gradient-to-l from-[#579BE8] to-[#DF4F3C] rounded-full"></div>
            </div>
            
            {/* Line 2 */}
            <div className="absolute top-[40px] right-[38%] xl:right-[40%] w-[16%] max-w-[183px] z-0">
              <div className="w-full h-2 bg-gradient-to-l from-[#DF4F3C] to-[#44A816] rounded-full"></div>
            </div>
            
            {/* Line 3 */}
            <div className="absolute top-[40px] right-[58%] xl:right-[59%] w-[16%] max-w-[183px] z-0">
              <div className="w-full h-2 bg-gradient-to-l from-[#44A816] to-[#5B72EE] rounded-full"></div>
            </div>
            
            {/* Line 4 */}
            <div className="absolute top-[40px] right-[78%] xl:right-[78%] w-[16%] max-w-[210px] z-0">
              <div className="w-full h-2 bg-gradient-to-l from-[#5B72EE] to-[#F48C06] rounded-full"></div>
            </div>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 md:gap-6 lg:gap-4 xl:gap-0 relative z-10">
            
            {/* STEP 1 */}
            <div className="group relative flex flex-col items-center">
              <div className="relative rounded-2xl transition-all duration-300 w-full max-w-[300px] sm:max-w-none px-4 py-6 md:p-6 bg-white shadow-sm hover:shadow-md">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-[14px] flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: "#579BE8" }}
                  >
                    <IoWaterOutline className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg sm:text-xl md:text-[22px] lg:text-[24px] font-bold mb-2 md:mb-3 text-[#333]">
                    اختر السعه و نوع المويه
                  </h3>
                  <p className="text-[#00000061] text-sm sm:text-base md:text-lg lg:text-[20px] leading-relaxed">
                    حدد حجم التنكر و نوع المويه المناسب
                  </p>
                </div>
                
                {/* Step Number - Mobile Only */}
                <div className="md:hidden absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#579BE8] text-white flex items-center justify-center font-bold">
                  1
                </div>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="group relative flex flex-col items-center md:mt-10 lg:mt-0">
              <div className="relative rounded-2xl transition-all duration-300 w-full max-w-[300px] sm:max-w-none px-4 py-6 md:p-6 bg-white shadow-sm hover:shadow-md">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-[14px] flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: "#DF4F3C" }}
                  >
                    <SlLocationPin className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg sm:text-xl md:text-[22px] lg:text-[24px] font-bold mb-2 md:mb-3 text-[#333]">
                    حدد موقعك علي الخريطه
                  </h3>
                  <p className="text-[#00000061] text-sm sm:text-base md:text-lg lg:text-[20px] leading-relaxed">
                    ادخل عنوانك بدقه لتوصيل اسرع
                  </p>
                </div>
                
                {/* Step Number - Mobile Only */}
                <div className="md:hidden absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#DF4F3C] text-white flex items-center justify-center font-bold">
                  2
                </div>
              </div>
            </div>

            {/* STEP 3 */}
            <div className="group relative flex flex-col items-center lg:mt-10 xl:mt-15">
              <div className="relative rounded-2xl transition-all duration-300 w-full max-w-[300px] sm:max-w-none px-4 py-6 md:p-6 bg-white shadow-sm hover:shadow-md">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-[14px] flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: "#44A816" }}
                  >
                    <FaMoneyBillWave className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg sm:text-xl md:text-[22px] lg:text-[24px] font-bold mb-2 md:mb-3 text-[#333]">
                    اختر السعر و ادفع
                  </h3>
                  <p className="text-[#00000061] text-sm sm:text-base md:text-lg lg:text-[20px] leading-relaxed">
                    اختر العرض الأنسب وادفع بأمان
                  </p>
                </div>
                
                {/* Step Number - Mobile Only */}
                <div className="md:hidden absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#44A816] text-white flex items-center justify-center font-bold">
                  3
                </div>
              </div>
            </div>

            {/* STEP 4 */}
            <div className="group relative flex flex-col items-center md:mt-10 lg:mt-0">
              <div className="relative rounded-2xl transition-all duration-300 w-full max-w-[300px] sm:max-w-none px-4 py-6 md:p-6 bg-white shadow-sm hover:shadow-md">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-[14px] flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: "#5B72EE" }}
                  >
                    <IoEyeOutline className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg sm:text-xl md:text-[22px] lg:text-[24px] font-bold mb-2 md:mb-3 text-[#333]">
                    تابع السائق حتى باب بيتك
                  </h3>
                  <p className="text-[#00000061] text-sm sm:text-base md:text-lg lg:text-[20px] leading-relaxed">
                    تتبع مباشر حتى وصول الطلب
                  </p>
                </div>
                
                {/* Step Number - Mobile Only */}
                <div className="md:hidden absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#5B72EE] text-white flex items-center justify-center font-bold">
                  4
                </div>
              </div>
            </div>

            {/* STEP 5 */}
            <div className="group relative flex flex-col items-center lg:mt-10 xl:mt-15">
              <div className="relative rounded-2xl transition-all duration-300 w-full max-w-[300px] sm:max-w-none px-4 py-6 md:p-6 bg-white shadow-sm hover:shadow-md">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-[14px] flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: "#F48C06" }}
                  >
                    <Package className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg sm:text-xl md:text-[22px] lg:text-[24px] font-bold mb-2 md:mb-3 text-[#333]">
                    حصل على الماء
                  </h3>
                  <p className="text-[#00000061] text-sm sm:text-base md:text-lg lg:text-[20px] leading-relaxed">
                    احصل علي اسعار من عده سواقين قريبين
                  </p>
                </div>
                
                {/* Step Number - Mobile Only */}
                <div className="md:hidden absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#F48C06] text-white flex items-center justify-center font-bold">
                  5
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Connection Dots */}
          <div className="md:hidden flex justify-center mt-8">
            <div className="flex space-x-4 rtl:space-x-reverse">
              {[1, 2, 3, 4].map((dot) => (
                <div key={dot} className="w-3 h-3 rounded-full bg-gray-300"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;