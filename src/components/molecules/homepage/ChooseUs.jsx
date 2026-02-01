"use client";

import React from "react";
import { motion } from "framer-motion";
import { HiArrowTrendingDown } from "react-icons/hi2";
import { BsLightningCharge } from "react-icons/bs";
import { FiHeadphones } from "react-icons/fi";
import { MdOutlineLocalPolice } from "react-icons/md";

// Icon mapping for dynamic icons
const iconMap = {
  price: <HiArrowTrendingDown className="w-6 h-6 md:w-9 md:h-9" />,
  fast: <BsLightningCharge className="w-6 h-6 md:w-9 md:h-9" />,
  safe: <MdOutlineLocalPolice className="w-6 h-6 md:w-9 md:h-9" />,
  support: <FiHeadphones className="w-6 h-6 md:w-9 md:h-9" />,
};

const gradientMap = {
  price: "from-[#9CC6F4] to-[#4787D0]",
  fast: "from-[#E5BD8A] to-[#D57B06]",
  safe: "from-[#68E62E] to-[#348C0B]",
  support: "from-[#E0AAF0] to-[#B508E9]",
};

const shadowColorMap = {
  price: "shadow-blue-200",
  fast: "shadow-amber-200",
  safe: "shadow-green-200",
  support: "shadow-purple-200",
};

export default function ChooseUs({ data }) {
  // Extract features from API response
  const features = data?.contents?.filter(c => c.key === 'item').map(c => c.value) || [];
  
  // Default features if no data
  const defaultFeatures = [
    {
      icon: "price",
      title: "أسعار تنافسية",
      description: "نضمن لك أفضل الأسعار في السوق مع عروض حصرية ومتجددة تناسب كافة احتياجاتك اليومية."
    },
    {
      icon: "fast",
      title: "سرعة في التنفيذ",
      description: "شبكة توصيل ذكية وسريعة تضمن وصول طلبك في الوقت المحدد وبأعلى كفاءة ممكنة."
    },
    {
      icon: "safe",
      title: "موثوقية وأمان",
      description: "جميع السائقين معتمدين وموثقين لضمان خدمة آمنة واحترافية لك ولعائلتك."
    },
    {
      icon: "support",
      title: "دعم فني",
      description: "فريق دعم متواجد على مدار الساعة للإجابة على استفساراتك وخدمتك في أي وقت."
    }
  ];

  const displayFeatures = features.length > 0 ? features : defaultFeatures;

  return (
    <section className="relative py-14 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Creative Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#579BE8]/10 via-[#124987]/5 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#1C7C4B]/10 via-[#2A9D5F]/5 to-transparent rounded-full blur-3xl"
        />
        
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle, #579BE8 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}></div>
        
        {/* Diagonal lines */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, #579BE8 10px, #579BE8 11px)`,
        }}></div>
        
        {/* Top and bottom accent lines */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#579BE8]/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#579BE8]/20 to-transparent"></div>
      </div>

      <div className="px-3 mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-10">
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
              لماذا نحن
            </span>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-gray-900 mb-2 md:mb-3 leading-tight">
            <span className="block text-[#579BE8]">ليش تختارنا ؟</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mx-auto"></div>
          <p className="text-xs sm:text-sm md:text-base max-w-3xl mx-auto leading-relaxed mt-4">
            نوفر لك أفضل تجربة طلب وتوصيل مياه بأحدث التقنيات وأعلى معايير الجودة
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6 lg:gap-6 pt-8">
          {displayFeatures.map((feature, index) => (
            <Card
              key={index}
              icon={iconMap[feature.icon] || iconMap.price}
              title={feature.title || "عنوان"}
              desc={feature.description || "وصف"}
              gradient={gradientMap[feature.icon] || gradientMap.price}
              shadowColor={shadowColorMap[feature.icon] || shadowColorMap.price}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===== Card Component ===== */
function Card({ icon, title, desc, gradient, shadowColor }) {
  return (
    <div
      className="group relative bg-white rounded-2xl
                 p-2 sm:pb-3 sm:pt-8
                 text-center w-full
                 border border-gray-100
                 shadow-[0_8px_30px_rgb(0,0,0,0.04)]
                 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]
                 transition-all duration-300 hover:-translate-y-2"
    >
      <div
        className={`absolute -top-5 sm:-top-10 left-1/2 -translate-x-1/2
                    w-10 h-10  sm:w-20 sm:h-20 md:w-20 md:h-20
                    flex items-center justify-center
                    rounded-sm sm:rounded-2xl
                    bg-gradient-to-b ${gradient}
                    text-white shadow-xl ${shadowColor}
                    group-hover:scale-110 transition-transform duration-300 ease-out`}
      >
        <div className="brightness-110 drop-shadow-md ">
           {icon}
        </div>
      </div>

      <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-900 mt-6 mb-3">
        {title}
      </h3>
      <p className="text-gray-500 text-xs sm:text-sm md:text-base leading-relaxed">
        {desc}
      </p>
    </div>
  );
}