"use client";

import { motion } from "framer-motion";
import { IoWaterOutline, IoEyeOutline } from "react-icons/io5";
import { SlLocationPin } from "react-icons/sl";
import { FaMoneyBillWave } from "react-icons/fa6";
import { Package } from "lucide-react";
import { PiTruck } from "react-icons/pi";
import { FaLocationDot } from "react-icons/fa6";
import { MdCloudDone } from "react-icons/md";

// Icon mapping for dynamic icons
const iconMap = {
  location: <FaLocationDot className="w-8 h-8 md:w-9 md:h-9" />,
  truck: <PiTruck className="w-8 h-8 md:w-9 md:h-9" />,
  pay: <FaMoneyBillWave className="w-8 h-8 md:w-9 md:h-9" />,
  done: <MdCloudDone className="w-8 h-8 md:w-9 md:h-9" />,
};

// Color mapping for icons
const colorMap = {
   location: "#5a9cf0",  // Red - matches default step 2
  truck: "#5a9cf0",     // Green - matches default step 3
  pay: "#5a9cf0",       // Purple - matches default step 4
  done: "#5a9cf0",      // برتقالي - يطابق default step 4
};

// Default steps (مطابقة للألوان والأيقونات الأصلية)
const defaultSteps = [
  {
    icon: <SlLocationPin className="w-8 h-8 md:w-9 md:h-9" />,
    color: "#5a9cf0",
    title: "حدد موقعك",
    desc: "اختر موقع التوصيل"
  },
  {
    icon: <Package className="w-8 h-8 md:w-9 md:h-9" />,
    color: "#5a9cf0",
    title: "اختر السائق",
    desc: "استلم عروض متعددة"
  },
  {
    icon: <FaMoneyBillWave className="w-8 h-8 md:w-9 md:h-9" />,
    color: "#5a9cf0",
    title: "ادفع بأمان",
    desc: "وسائل دفع متعددة"
  },
  {
    icon: <IoEyeOutline className="w-8 h-8 md:w-9 md:h-9" />,
    color: "#5a9cf0",
    title: "تم التوصيل",
    desc: "استلم طلبك بسهولة"
  }
];

const HowItWorks = ({ data }) => {
  // معالجة آمنة للبيانات - لو مفيش data أو contents استخدم الـ default
  const processSteps = () => {
    try {
      // التأكد من وجود data و contents
      if (!data?.contents || !Array.isArray(data.contents)) {
        return defaultSteps;
      }

      // فلترة الخطوات وجلب اللي key = 'step' بس
      const stepContents = data.contents.filter(c => c?.key === 'step');
      
      // لو مفيش خطوات، استخدم default
      if (stepContents.length === 0) {
        return defaultSteps;
      }

      // تحويل البيانات الجاية من API
      const apiSteps = stepContents.map((c, index) => {
        // التأكد من وجود value
        if (!c?.value) return null;

        const stepData = c.value;
        const iconKey = stepData?.icon;
        
        // استخدام icon من الـ API أو fallback
        const icon = iconKey && iconMap[iconKey] 
          ? iconMap[iconKey] 
          : defaultSteps[index]?.icon || <Package className="w-8 h-8 md:w-9 md:h-9" />;
        
        // استخدام color من colorMap أو fallback
        const color = (iconKey && colorMap[iconKey]) 
          ? colorMap[iconKey] 
          : defaultSteps[index]?.color || "#579BE8";
        
        return {
          icon: icon,
          color: color,
          title: stepData?.title || defaultSteps[index]?.title || "",
          desc: stepData?.description || defaultSteps[index]?.desc || ""
        };
      }).filter(step => step !== null); // إزالة أي null values

      // لو الخطوات المعالجة أقل من 4، أكمل بالـ default
      if (apiSteps.length < 4) {
        // دمج الخطوات الجاية مع default عشان نكمل للـ 4 خطوات
        const mergedSteps = [];
        for (let i = 0; i < 4; i++) {
          if (apiSteps[i]) {
            mergedSteps[i] = apiSteps[i];
          } else {
            mergedSteps[i] = defaultSteps[i];
          }
        }
        return mergedSteps;
      }

      return apiSteps;
    } catch (error) {
      // لو حصل أي خطأ، استخدم default من غير ما المستخدم يحس
      console.error('Error processing steps:', error);
      return defaultSteps;
    }
  };

  const displaySteps = processSteps();

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
        <div className="hidden xl:block absolute top-[125px] left-0 right-0 w-full h-[100px] pointer-events-none z-0">
          <svg className="w-full h-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
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
            const isBottomRow = index >= 2 && index < 4;
            
            return (
              <div 
                key={index} 
                className="group flex flex-col items-center text-center relative"
              >
                <div 
                  className={`w-16 h-16 md:w-18 md:h-18 rounded-xl flex items-center justify-center text-white shadow-xl mb-6 transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-105 ${isBottomRow ? "sm:mb-8 lg:mb-6" : ""}`}
                  style={{ 
                    backgroundColor: step.color, 
                    boxShadow: `0 10px 25px -5px ${step.color}60` 
                  }}
                >
                  {step.icon}
                </div>

                <h3 className="text-xl font-bold text-[#333] mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-700 text-sm md:text-base max-w-[200px]">
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