'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaTruck, FaHandshake } from 'react-icons/fa';

const ContactHero = () => {
  const features = [
    {
      title: 'جودة مضمونة',
      description: 'مياه نقية 100% معتمدة من هيئة الغذاء ضمان الجوده',
      icon: FaShieldAlt,
      gradient: 'from-[#9CC6F4] to-[#4787D0]',
      shadowColor: 'shadow-blue-200',
    },
    {
      title: 'توصيل سريع',
      description: 'توصيل مجاني للطلبات أكثر من 100 ريال خلال ساعة',
      icon: FaTruck,
      gradient: 'from-[#E5BD8A] to-[#D57B06]',
      shadowColor: 'shadow-amber-200',
    },
    {
      title: 'عروض الشركات',
      description: 'خصومات خاصة للتعاقدات السنوية - خصم 20%',
      icon: FaHandshake,
      gradient: 'from-[#68E62E] to-[#348C0B]',
      shadowColor: 'shadow-green-200',
    }
  ];

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
              تواصل معنا
            </span>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-gray-900 mb-2 md:mb-3 leading-tight">
            <span className="block text-[#579BE8]">نحن هنا للإجابة على جميع استفساراتك</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mx-auto"></div>
          <p className="text-xs sm:text-sm md:text-base max-w-3xl mx-auto leading-relaxed mt-4">
            نوفر لك أفضل تجربة طلب وتوصيل مياه بأحدث التقنيات وأعلى معايير الجودة
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-6 lg:gap-6 pt-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                icon={<Icon className="w-8 h-8 md:w-9 md:h-9" />}
                title={feature.title}
                desc={feature.description}
                gradient={feature.gradient}
                shadowColor={feature.shadowColor}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ===== Card Component ===== */
function Card({ icon, title, desc, gradient, shadowColor }) {
  return (
    <div
      className="group relative bg-white rounded-2xl
                 px-5 sm:px-6 md:px-7 pt-12 sm:pt-14 pb-6 sm:pb-8
                 text-center w-full
                 border border-gray-100
                 shadow-[0_8px_30px_rgb(0,0,0,0.04)]
                 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]
                 transition-all duration-300 hover:-translate-y-2"
    >
      <div
        className={`absolute -top-8 sm:-top-10 left-1/2 -translate-x-1/2
                    w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20
                    flex items-center justify-center
                    rounded-xl sm:rounded-2xl
                    bg-gradient-to-b ${gradient}
                    text-white shadow-xl ${shadowColor}
                    group-hover:scale-110 transition-transform duration-300 ease-out`}
      >
        <div className="brightness-110 drop-shadow-md">
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

export default ContactHero;
