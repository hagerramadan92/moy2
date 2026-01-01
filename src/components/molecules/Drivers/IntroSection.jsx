"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function IntroSection() {
  return (
    <section className="relative w-full py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#579BE8]/10 to-transparent rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tl from-[#315782]/10 to-transparent rounded-full blur-3xl -z-0" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-12">
          
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2 relative w-full max-w-[400px] lg:max-w-[450px] aspect-square rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl shadow-[#579BE8]/20 group"
          >
            <Image
              src="/driver.jpg" 
              alt="Driver using the app"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#579BE8]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {/* Decorative Border */}
            <div className="absolute inset-0 border-4 border-transparent bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-2xl lg:rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10 blur-xl" />
          </motion.div>

          {/* Text Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-2 lg:order-1 flex-1 max-w-2xl"
          >
            {/* Section Label */}
            <div className="mb-2 md:mb-3">
              <span className="inline-block text-xs md:text-sm font-bold text-[#579BE8] bg-[#579BE8]/10 px-3 py-1.5 rounded-full">
                عننا
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-gray-900 mb-2 md:mb-3 leading-tight">
              <span className="block">نرتقي بخدماتنا عبر ابتكارٍ لا يتوقف،</span>
              <span className="block mt-2">وبفريق يؤمن أن الإنسان هو المحرك</span>
              <span className="block mt-2 text-[#579BE8]">
                الحقيقي لكل تطوّر
              </span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mb-4 lg:mb-6" />

            {/* Description */}
            <div className="relative">
              
              <p className="text-gray-600 font-cairo font-normal text-base leading-relaxed">
                يعمل تطبيق المايّة على تسهيل حياة السائقين من خلال توفير حلول ذكية تنظّم الوقت وتقلل الجهد وتمنحهم وضوحًا أكبر في إدارة رحلاتهم وأعمالهم اليومية، مما يجعل تجربتهم أكثر راحة وسلاسة دون أي تعقيد
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}