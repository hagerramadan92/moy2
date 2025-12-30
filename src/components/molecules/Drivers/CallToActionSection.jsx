"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MdOutlineStarBorder } from "react-icons/md";
import { AiTwotoneCheckCircle } from "react-icons/ai";
import { BsStars } from "react-icons/bs";
import { FaArrowLeft, FaHeadset } from "react-icons/fa";

export default function CallToActionSection() {
  const router = useRouter();
  const features = [
    { icon: MdOutlineStarBorder, text: "تقييم ٤.٩", desc: "من آلاف العملاء" },
    { icon: AiTwotoneCheckCircle, text: "موثوق", desc: "سائقين معتمدين" },
    { icon: BsStars, text: "خدمة سريعة", desc: "توصيل خلال ساعات" },
  ];

  return (
    <section
      className="relative w-full h-auto py-14 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50"
      dir="rtl"
    >
      {/* Professional Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#579BE8]/3 via-transparent to-[#124987]/3"></div>
        
        {/* Professional dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle, #579BE8 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}></div>
        
        {/* Subtle diagonal lines */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, #579BE8 10px, #579BE8 11px)`,
        }}></div>
        
        {/* Top and bottom borders */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#579BE8]/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#579BE8]/20 to-transparent"></div>
        
        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#579BE8]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#124987]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-3xl mb-8 sm:mb-10"
          >
            {/* Professional Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full bg-[#579BE8]/10 border border-[#579BE8]/30"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#579BE8]"></div>
              <span className="text-xs font-medium text-[#579BE8]">خدمة احترافية موثوقة</span>
            </motion.div>

            {/* Main Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              <span className="text-[#579BE8]">جاهز تطلب المويه؟</span>
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
              احصل على عروض أسعار فورية من سواقين موثوقين في منطقتك الآن
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 w-full mb-8 sm:mb-10"
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
      </div>
    </section>
  );
}