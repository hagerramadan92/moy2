"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { FaMobileAlt, FaMoneyBillWave, FaRoute, FaShieldAlt, FaClock, FaCheckCircle, FaStar, FaUsers, FaTruck, FaChartLine } from "react-icons/fa";
import AppDownloadButtons from "../homepage/AppDownloadButtons";

export default function AppPromotionSectionDriver() {
  const features = [
    { icon: FaMoneyBillWave, title: "اكسب دخل إضافي", desc: "حقق أرباحاً ممتازة مع كل توصيلة", color: "text-green-500" },
    { icon: FaRoute, title: "عروض قريبة منك", desc: "استقبل عروضاً قريبة من موقعك الحالي", color: "text-blue-500" },
    { icon: FaShieldAlt, title: "دفع مضمون", desc: "تحويلات آمنة ومستحقاتك في موعدها", color: "text-purple-500" },
  ];

  const stats = [
    { icon: FaTruck, value: "5000+", label: "سائق نشط" },
    { icon: FaChartLine, value: "₪8,000+", label: "متوسط الدخل الشهري" },
    { icon: FaCheckCircle, value: "15K+", label: "طلبات يومياً" },
  ];

  return (
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden overflow-y-hidden sm:overflow-y-visible w-full h-auto bg-gradient-to-br from-slate-50 via-white to-blue-50/40" dir="rtl">
      {/* Elegant background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-10 w-[500px] aspect-square bg-gradient-to-br from-[#579BE8]/12 via-[#4788d5]/8 to-transparent rounded-full blur-3xl"
        ></motion.div>
        <motion.div
          animate={{ 
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 left-10 w-[450px] aspect-square bg-gradient-to-tr from-[#1C7C4B]/10 via-[#2A9D5F]/6 to-transparent rounded-full blur-3xl"
        ></motion.div>
      </div>

      <div className="px-3 mx-auto max-w-7xl px-4 sm:px-6 md:px-8 relative z-10 h-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Side - Phone Image with Elegant Design */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex justify-center lg:justify-end order-2 lg:order-2"
          >
            <div className="relative">
              {/* Elegant glow layers */}
              <div className="absolute inset-0 -m-12">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.3, 0.2],
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-[#579BE8]/25 to-[#4788d5]/15 rounded-full blur-3xl"
                ></motion.div>
              </div>
              
              {/* Phone with smooth animation */}
              <motion.div
                animate={{ 
                  y: [0, -12, 0],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative w-[180px] sm:w-[220px] md:w-[260px] lg:w-[320px] aspect-[4/5] z-10"
              >
                <Image
                  src="/iPhone 16.png"
                  alt="iPhone 16"
                  fill
                  className="object-contain drop-shadow-2xl"
                  sizes="(max-width: 640px) 180px, (max-width: 768px) 220px, (max-width: 1024px) 260px, 320px"
                  priority
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Enhanced Content for Drivers */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col justify-center text-center lg:text-right order-1 lg:order-1 space-y-5 sm:space-y-6"
          >
            {/* Elegant Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 justify-center lg:justify-start mb-3"
            >
              <span className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold text-[#579BE8] bg-white/80 backdrop-blur-sm border-2 border-[#579BE8]/30 px-3 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300">
                <FaTruck className="text-[#579BE8] text-xs" />
                <span>تطبيق السائقين الاحترافي</span>
              </span>
            </motion.div>

            {/* Elegant Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl  font-black text-gray-900 leading-tight mb-3"
            >
              <span className="block bg-gradient-to-r from-[#579BE8] via-[#4788d5] to-[#315782] bg-clip-text text-transparent mb-2">
                تطبيق وايت مياه دريفر
              </span>
             
                
          
            </motion.h2>

            {/* Elegant Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base mb-3  text-gray-600 leading-relaxed mb-6 max-w-2xl mx-auto lg:mx-0"
            >
              انضم إلى عائلتنا من السائقين واستمتع بمرونة العمل
              <br className="hidden sm:block" />
              <span className="hidden sm:inline">استقبل العروض القريبة منك واكسب دخل إضافي مع كل توصيلة</span>
            </motion.p>

            {/* Enhanced Features for Drivers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col gap-4 mb-8"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-4 justify-center lg:justify-end text-right group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#579BE8] to-[#4788d5] flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <Icon className="text-white text-base sm:text-lg" />
                    </div>
                    <div className="text-right flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Download Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="w-60 md:w-full mx-auto">
                <AppDownloadButtons userType="driver"/>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}