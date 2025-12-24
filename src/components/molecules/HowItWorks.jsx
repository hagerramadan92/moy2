"use client";

import { IoWaterOutline, IoEyeOutline } from "react-icons/io5";
import { SlLocationPin } from "react-icons/sl";
import { FaMoneyBillWave } from "react-icons/fa6";
import { Package } from "lucide-react";

// Icons map with EXACT user text content
const steps = [
  {
    icon: <IoWaterOutline className="w-8 h-8 md:w-9 md:h-9" />,
    color: "#579BE8",
    title: "اختر السعه و نوع المويه",
    desc: "حدد حجم التنكر و نوع المويه المناسب"
  },
  {
    icon: <SlLocationPin className="w-8 h-8 md:w-9 md:h-9" />,
    color: "#DF4F3C",
    title: "حدد موقعك علي الخريطه",
    desc: "ادخل عنوانك بدقه لتوصيل اسرع"
  },
  {
    icon: <FaMoneyBillWave className="w-8 h-8 md:w-9 md:h-9" />,
    color: "#44A816",
    title: "اختر السعر و ادفع",
    desc: "اختر العرض الأنسب وادفع بأمان"
  },
  {
    icon: <IoEyeOutline className="w-8 h-8 md:w-9 md:h-9" />,
    color: "#5B72EE",
    title: "تابع السائق حتى باب بيتك",
    desc: "تتبع مباشر حتى وصول الطلب"
  },
  {
    icon: <Package className="w-8 h-8 md:w-9 md:h-9" />,
    color: "#F48C06",
    title: "حصل على الماء",
    desc: "احصل علي اسعار من عده سواقين قريبين"
  }
];

const HowItWorks = () => {
  return (
    <section
      dir="rtl"
      className="py-16 md:py-24 bg-[#EFF5FD] relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#579BE8] mb-4">
            كيف تعمل الخدمة؟
          </h2>
          {/* User didn't have a sub-paragraph in the reverted version, but adding a spacer or keeping it clean */}
        </div>

        {/* Desktop Wave Line SVG */}
        {/* Visible only on XL/LG screens where the 5-col grid exists */}
        <div className="hidden xl:block absolute top-[140px] left-0 right-0 w-full h-[150px] pointer-events-none z-0">
          <svg className="w-full h-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
             {/* 
                Path logic:
                Start approx 10% width (Step 1 center) at bottom
                Curve to 30% width (Step 2 center) at top
                Curve to 50% width (Step 3 center) at bottom
                Curve to 70% width (Step 4 center) at top
                Curve to 90% width (Step 5 center) at bottom
             */}
             <path 
                d="M140,100 C280,100 280,20 420,20 S560,100 720,100 S880,20 1020,20 S1160,100 1300,100"
                fill="none"
                stroke="#579BE8"
                strokeWidth="2"
                strokeDasharray="12 8"
                className="opacity-40"
             />
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 xl:gap-4 relative z-10">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`group flex flex-col items-center text-center relative
                ${/* Add vertical staggering for desktop wave effect */ ""}
                ${index % 2 === 0 ? "xl:mt-16" : "xl:mt-0"}
              `}
            >
              <div 
                className="w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-white shadow-xl mb-6 transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-105"
                style={{ backgroundColor: step.color, boxShadow: `0 10px 25px -5px ${step.color}60` }}
              >
                {step.icon}
              </div>

              <h3 className="text-xl font-bold text-[#333] mb-2">
                {step.title}
              </h3>
              <p className="text-gray-500 text-sm md:text-base max-w-[200px]">
                {step.desc}
              </p>

              {/* Mobile/Tablet connecting line (vertical or simple) */}
              {index < steps.length - 1 && (
                 <div className="xl:hidden absolute top-24 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gray-200 -z-10 sm:hidden"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;