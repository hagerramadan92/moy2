"use client";

import { motion } from "framer-motion";
import { IoWaterOutline, IoEyeOutline } from "react-icons/io5";
import { SlLocationPin } from "react-icons/sl";
import { FaMoneyBillWave } from "react-icons/fa6";
import { Package } from "lucide-react";

// Icon mapping for dynamic icons
const iconMap = {
  location: <SlLocationPin className="w-8 h-8 md:w-9 md:h-9" />,
  truck: <Package className="w-8 h-8 md:w-9 md:h-9" />,
  pay: <FaMoneyBillWave className="w-8 h-8 md:w-9 md:h-9" />,
  done: <IoEyeOutline className="w-8 h-8 md:w-9 md:h-9" />,
};

// Color mapping for icons (matching default steps colors)
const colorMap = {
  location: "#DF4F3C",  // Red - matches default step 2
  truck: "#44A816",     // Green - matches default step 3
  pay: "#5B72EE",       // Purple - matches default step 4
  done: "#F48C06",      // Orange - matches default step 5 (if exists)
};

// Default steps (4 steps)
// const defaultSteps = [
//   {
//     icon: <SlLocationPin className="w-8 h-8 md:w-9 md:h-9" />,
//     color: "#DF4F3C",
//     title: "حدد موقعك",
//     desc: "اختر موقع التوصيل"
//   },
//   {
//     icon: <Package className="w-8 h-8 md:w-9 md:h-9" />,
//     color: "#44A816",
//     title: "اختر السائق",
//     desc: "استلم عروض متعددة"
//   },
//   {
//     icon: <FaMoneyBillWave className="w-8 h-8 md:w-9 md:h-9" />,
//     color: "#5B72EE",
//     title: "ادفع بأمان",
//     desc: "وسائل دفع متعددة"
//   },
//   {
//     icon: <IoEyeOutline className="w-8 h-8 md:w-9 md:h-9" />,
//     color: "#F48C06",
//     title: "تم التوصيل",
//     desc: "استلم طلبك بسهولة"
//   }
// ];

const HowItWorks = ({ data }) => {
  // Extract steps from API response
  const apiSteps = data?.contents?.filter(c => c.key === 'step').map((c, index) => {
    const stepData = c.value;
    const iconKey = stepData.icon;
    // Use color from colorMap based on icon, or fallback to defaultSteps colors by index
    const color = colorMap[iconKey] || (defaultSteps[index]?.color || "#579BE8");
    return {
      icon: iconMap[iconKey] || <Package className="w-8 h-8 md:w-9 md:h-9" />,
      color: color,
      title: stepData.title || "",
      desc: stepData.description || ""
    };
  }) || [];

  const displaySteps = apiSteps.length > 0 ? apiSteps : defaultSteps;
  return (
    <section
      dir="rtl"
      className="py-16 md:py-24 bg-[#EFF5FD] relative overflow-hidden"
    >
        <div className="px-3 mx-auto max-w-7xl relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8 md:mb-10"
        >
          <div className="inline-block mb-2 md:mb-3">
            <span className="text-xs md:text-sm font-bold text-[#579BE8] bg-[#579BE8]/10 px-3 py-1.5 rounded-full">
              خطوات العمل
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-2 md:mb-3 leading-tight">
            <span className="block text-[#579BE8]">كيف تعمل الخدمة؟</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mx-auto"></div>
        </motion.div>

        {/* Desktop Wave Line SVG */}
        {/* Visible only on XL/LG screens where the 4-col grid exists */}
        <div className="hidden xl:block absolute top-[140px] left-0 right-0 w-full h-[100px] pointer-events-none z-0">
          <svg className="w-full h-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
             {/* 
                Path logic for 4 steps:
                Start approx 12.5% width (Step 1 center) at bottom
                Curve to 37.5% width (Step 2 center) at top
                Curve to 62.5% width (Step 3 center) at bottom
                Curve to 87.5% width (Step 4 center) at top
             */}
             <path 
                d="M180,100 C360,100 360,20 540,20 S720,100 900,100 S1080,20 1260,20"
                fill="none"
                stroke="#579BE8"
                strokeWidth="2"
                strokeDasharray="12 8"
                className="opacity-40"
             />
          </svg>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-4 relative z-10">
          {displaySteps.map((step, index) => {
            // Add margin bottom for bottom row items (2-column grid: last 2 items)
            const isBottomRow = index >= 2 && index < 4; // Items 2 and 3 are in bottom row for 2-column grid
            
            return (
            <div 
              key={index} 
              className="group flex flex-col items-center text-center relative"
            >
              <div 
                className={`w-16 h-16 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-white shadow-xl mb-6 transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-105 ${isBottomRow ? "sm:mb-8 lg:mb-6" : ""}`}
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

            
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;