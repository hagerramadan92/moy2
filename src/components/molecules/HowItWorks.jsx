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
      className="py-12 md:py-16 lg:py-18 bg-[#EFF5FD] shadow-lg shadow-[#EFF5FD] relative overflow-x-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-[36px] font-bold text-[#579BE8] mb-4">
            كيف تعمل الخدمة؟
          </h2>
        </div>

        <div className="relative px-4 md:px-5">
          {/* الخطوط - للشاشات المتوسطة وما فوق */}
          <div className="hidden lg:block">
            <div className="absolute top-[30px] md:top-[40px] right-[15%] xl:right-[210px] w-[20%] xl:w-[183px] z-0">
              <Image 
                src="/images/line1.png" 
                width={183} 
                height={8} 
                alt="line1"
                className="w-full h-2 object-contain"
              />
            </div>
            <div className="absolute top-[30px] md:top-[40px] right-[35%] xl:right-[55%] w-[20%] xl:w-[183px] z-0">
              <Image 
                src="/images/line1.png" 
                width={183} 
                height={8} 
                alt="line1"
                className="w-full h-2 object-contain"
              />
            </div>
            <div className="absolute top-[30px] md:top-[40px] right-[55%] xl:right-[35%] w-[20%] xl:w-[183px] z-0">
              <Image 
                src="/images/line2.png" 
                width={183} 
                height={8} 
                alt="line2"
                className="w-full h-2 object-contain"
              />
            </div>
            <div className="absolute top-[30px] md:top-[40px] left-[5%] xl:left-[10%] w-[25%] xl:w-[210px] z-0">
              <Image 
                src="/images/line3.png" 
                width={210} 
                height={8} 
                alt="line3"
                className="w-full h-2 object-contain"
              />
            </div>
          </div>

          {/* الخطوط - للشاشات الصغيرة */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-8 h-1 bg-[#579BE8] rounded-full"></div>
              <div className="w-8 h-1 bg-[#DF4F3C] rounded-full"></div>
              <div className="w-8 h-1 bg-[#44A816] rounded-full"></div>
              <div className="w-8 h-1 bg-[#5B72EE] rounded-full"></div>
              <div className="w-8 h-1 bg-[#F48C06] rounded-full"></div>
            </div>
          </div>

          {/* الخطوات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-4 lg:gap-0 relative z-10">
            
            {/* STEP 1 */}
            <div className="group relative xl:mt-15 flex justify-center">
              <div className="relative rounded-2xl transition-all duration-300 w-full max-w-[280px] md:max-w-none md:w-76.25 px-4 py-6 md:p-0">
                <div className="flex justify-center mb-4 md:mb-6">
                  <div
                    className="w-14 h-14 md:w-16 md:h-16 lg:w-17.5 lg:h-17.5 rounded-[14px] flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: "#579BE8" }}
                  >
                    <IoWaterOutline className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg md:text-xl lg:text-[22px] xl:text-[24px] font-bold mb-2 md:mb-3 text-[#333]">
                    اختر السعه و نوع المويه
                  </h3>
                  <p className="text-[#00000061] text-sm md:text-base lg:text-lg xl:text-[20px]">
                    حدد حجم التنكر و نوع المويه المناسب
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="group relative flex justify-center">
              <div className="relative rounded-2xl transition-all duration-300 w-full max-w-[280px] md:max-w-none md:w-76.25 px-4 py-6 md:p-0">
                <div className="flex justify-center mb-4 md:mb-6">
                  <div
                    className="w-14 h-14 md:w-16 md:h-16 lg:w-17.5 lg:h-17.5 rounded-[14px] flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: "#DF4F3C" }}
                  >
                    <SlLocationPin className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg md:text-xl lg:text-[22px] xl:text-[24px] font-bold mb-2 md:mb-3 text-[#333]">
                    حدد موقعك علي الخريطه
                  </h3>
                  <p className="text-[#00000061] text-sm md:text-base lg:text-lg xl:text-[20px]">
                    ادخل عنوانك بدقه لتوصيل اسرع
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 3 */}
            <div className="group relative lg:mt-15 xl:mt-15 flex justify-center">
              <div className="relative rounded-2xl transition-all duration-300 w-full max-w-[280px] md:max-w-none md:w-76.25 px-4 py-6 md:p-0">
                <div className="flex justify-center mb-4 md:mb-6">
                  <div
                    className="w-14 h-14 md:w-16 md:h-16 lg:w-17.5 lg:h-17.5 rounded-[14px] flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: "#44A816" }}
                  >
                    <FaMoneyBillWave className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg md:text-xl lg:text-[22px] xl:text-[24px] font-bold mb-2 md:mb-3 text-[#333]">
                    اختر السعر و ادفع
                  </h3>
                  <p className="text-[#00000061] text-sm md:text-base lg:text-lg xl:text-[20px]">
                    اختر العرض الأنسب وادفع بأمان
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 4 */}
            <div className="group relative flex justify-center">
              <div className="relative rounded-2xl transition-all duration-300 w-full max-w-[280px] md:max-w-none md:w-76.25 px-4 py-6 md:p-0">
                <div className="flex justify-center mb-4 md:mb-6">
                  <div
                    className="w-14 h-14 md:w-16 md:h-16 lg:w-17.5 lg:h-17.5 rounded-[14px] flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: "#5B72EE" }}
                  >
                    <IoEyeOutline className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg md:text-xl lg:text-[22px] xl:text-[24px] font-bold mb-2 md:mb-3 text-[#333]">
                    تابع السائق حتى باب بيتك
                  </h3>
                  <p className="text-[#00000061] text-sm md:text-base lg:text-lg xl:text-[20px]">
                    تتبع مباشر حتى وصول الطلب
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 5 */}
            <div className="group relative lg:mt-15 xl:mt-15 flex justify-center">
              <div className="relative rounded-2xl transition-all duration-300 w-full max-w-[280px] md:max-w-none md:w-76.25 px-4 py-6 md:p-0">
                <div className="flex justify-center mb-4 md:mb-6">
                  <div
                    className="w-14 h-14 md:w-16 md:h-16 lg:w-17.5 lg:h-17.5 rounded-[14px] flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: "#F48C06" }}
                  >
                    <Package className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg md:text-xl lg:text-[22px] xl:text-[24px] font-bold mb-2 md:mb-3 text-[#333]">
                    حصل على الماء
                  </h3>
                  <p className="text-[#00000061] text-sm md:text-base lg:text-lg xl:text-[20px]">
                    احصل علي اسعار من عده سواقين قريبين
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;