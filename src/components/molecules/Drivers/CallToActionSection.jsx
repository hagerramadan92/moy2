"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaHeadset } from "react-icons/fa";

export default function CallToActionSection() {
  const router = useRouter();

  return (
    <section className="relative py-14
     sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b 
     from-gray-50 via-white to-gray-50 overflow-hidden my-0">
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
              خدمة احترافية موثوقة
            </span>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-gray-900 mb-2 md:mb-3 leading-tight">
            <span className="block text-[#579BE8]">جاهز تطلب المويه؟</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mx-auto"></div>
          <p className="text-xs sm:text-sm md:text-base max-w-3xl mx-auto leading-relaxed mt-4">
            احصل على عروض أسعار فورية من سواقين موثوقين في منطقتك الآن
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4"
        >
          {/* Primary Button */}
          <motion.button
            onClick={() => router.push("/orders")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative w-full sm:w-auto sm:min-w-[180px] md:min-w-[200px] h-12 sm:h-14 rounded-xl border border-[#94c5f8] bg-gradient-to-r from-[#579BE8] to-[#124987] text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            {/* Subtle shine on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full"
              transition={{ duration: 0.6 }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span>اطلب الآن</span>
              <FaArrowLeft className="text-xs group-hover:-translate-x-0.5 transition-transform" />
            </span>
          </motion.button>

          {/* Secondary Button */}
          <motion.button
            onClick={() => router.push("/myProfile/help-center")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative w-full sm:w-auto sm:min-w-[220px] md:min-w-[240px] h-12 sm:h-14 rounded-xl border border-[#94c5f8] bg-gradient-to-r from-[#579BE8] to-[#124987] text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            {/* Subtle shine on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full"
              transition={{ duration: 0.6 }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <FaHeadset className="text-sm" />
              <span>تحدث مع خدمة العملاء</span>
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}