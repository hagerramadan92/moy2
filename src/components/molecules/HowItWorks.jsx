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
      className="py-16 lg:py-18 bg-[#EFF5FD] shadow-lg shadow-[#EFF5FD] relative"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-[36px] font-bold text-[#579BE8] mb-4">
            كيف تعمل الخدمة؟
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 relative">

          <div className="xl:absolute hidden top-[10px] right-[210px]">
            <Image src="/images/line1.png" width={183} height={8} alt="line1" />
       
          </div>
          <div className="xl:absolute hidden top-[10px] right-[55%] ">
            <Image src="/images/line1.png" width={183} height={8} alt="line1" />
     
          </div>
          <div className="xl:absolute hidden top-[10px] right-[35%] ">
            <Image src="/images/line2.png" width={183} height={8} alt="line2" />
          </div>
          <div className="xl:absolute hidden top-[10px] left-[10%] ">
            <Image src="/images/line3.png" width={210} height={8} alt="line3" />
          </div>
          {/* STEP 1 */}
          <div className="group relative mt-15">
            <div className="relative rounded-2xl transition-all duration-300 w-76.25">
              <div className="flex justify-center mb-6">
                <div
                  className="w-17.5 h-17.5 rounded-[14px] flex items-center justify-center text-white"
                  style={{ backgroundColor: "#579BE8" }}
                >
                  <IoWaterOutline className="w-10 h-10" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-[24px] font-bold mb-3">
                  اختر السعه و نوع المويه
                </h3>
                <p className="text-[#00000061] text-[20px]">
                  حدد حجم التنكر و نوع المويه المناسب
                </p>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="group relative">
            <div className="relative rounded-2xl transition-all duration-300 w-76.25">
              <div className="flex justify-center mb-6">
                <div
                  className="w-17.5 h-17.5 rounded-[14px] flex items-center justify-center text-white"
                  style={{ backgroundColor: "#DF4F3C" }}
                >
                  <SlLocationPin className="w-10 h-10" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-[24px] font-bold mb-3">
                  حدد موقعك علي الخريطه
                </h3>
                <p className="text-[#00000061] text-[20px]">
                  ادخل عنوانك بدقه لتوصيل اسرع
                </p>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="group relative mt-15">
            <div className="relative rounded-2xl transition-all duration-300 w-76.25">
              <div className="flex justify-center mb-6">
                <div
                  className="w-17.5 h-17.5 rounded-[14px] flex items-center justify-center text-white"
                  style={{ backgroundColor: "#44A816" }}
                >
                  <FaMoneyBillWave className="w-10 h-10" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-[24px] font-bold mb-3">
                  اختر السعر و ادفع
                </h3>
                <p className="text-[#00000061] text-[20px]">
                  اختر العرض الأنسب وادفع بأمان
                </p>
              </div>
            </div>
          </div>

          {/* STEP 4 */}
          <div className="group relative">
            <div className="relative rounded-2xl transition-all duration-300 w-76.25">
              <div className="flex justify-center mb-6">
                <div
                  className="w-17.5 h-17.5 rounded-[14px] flex items-center justify-center text-white"
                  style={{ backgroundColor: "#5B72EE" }}
                >
                  <IoEyeOutline className="w-10 h-10" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-[24px] font-bold mb-3">
                  تابع السائق حتى باب بيتك
                </h3>
                <p className="text-[#00000061] text-[20px]">
                  تتبع مباشر حتى وصول الطلب
                </p>
              </div>
            </div>
          </div>

          {/* STEP 5 */}
          <div className="group relative mt-15">
            <div className="relative rounded-2xl transition-all duration-300 w-76.25">
              <div className="flex justify-center mb-6">
                <div
                  className="w-17.5 h-17.5 rounded-[14px] flex items-center justify-center text-white"
                  style={{ backgroundColor: "#F48C06" }}
                >
                  <Package className="w-10 h-10" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-[24px] font-bold mb-3">حقق اهدافك</h3>
                <p className="text-[#00000061] text-[20px]">
                  احصل علي اسعار من عده سواقين قريبين
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
