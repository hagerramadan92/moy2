"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaUsers, FaShoppingCart, FaHeart, FaWater } from "react-icons/fa";
import { IoWaterOutline } from "react-icons/io5";

// Count-up animation hook
function useCountUp(end, duration = 2000, suffix = "", prefix = "") {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime = null;
    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  // Format number with K notation if needed
  const formatNumber = (num) => {
    if (num >= 1000 && num < 1000000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  return { count, ref, formattedCount: `${prefix}${formatNumber(count)}${suffix}` };
}

// Stat Card Component - Horizontal Design
function StatCard({ stat, index, delay, icon: Icon }) {
  const { count, ref, formattedCount } = useCountUp(stat.value, 2000, stat.suffix, stat.prefix);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative group"
    >
      {/* Card Container - Horizontal Layout */}
      <div className="relative bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-r-4 border-[#579BE8] hover:border-[#315782] overflow-hidden">
        {/* Gradient Background on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#579BE8]/5 to-[#315782]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content - Horizontal Layout */}
        <div className="relative z-10 flex items-center gap-6">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="p-4 rounded-lg bg-gradient-to-br from-[#579BE8] to-[#315782] group-hover:scale-110 transition-transform duration-300">
              <Icon className="text-2xl text-white" />
            </div>
          </div>
          
          {/* Text Content */}
          <div className="flex-1">
            <motion.h3
              key={count}
              initial={{ scale: 1.1, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-3xl sm:text-4xl font-black text-[#579BE8] mb-1"
            >
              {formattedCount}
            </motion.h3>
            <p className="text-base font-cairo font-semibold text-gray-700">
              {stat.label}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function StatsSection() {
  const stats = [
    { number: "+500", label: "سائق نشط", value: 500, suffix: "+", prefix: "+", icon: FaUsers },
    { number: "15K+", label: "طلب شهرياً", value: 15000, suffix: "+", prefix: "", icon: FaShoppingCart },
    { number: "98%", label: "رضا السائقين", value: 98, suffix: "%", prefix: "", icon: FaHeart },
  ];

  return (
    <section className="relative w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated Water Background - Same as Login */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D0E8FF] via-[#E0F2FF] to-[#C8E5FF] overflow-hidden">
        {/* Floating Water Drops with Animation */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-20 w-32 h-32 bg-[#579BE8]/10 rounded-full blur-2xl"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-40 left-32 w-48 h-48 bg-[#579BE8]/8 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute top-1/2 left-1/4 w-40 h-40 bg-[#579BE8]/12 rounded-full blur-2xl"
        />
        
        {/* Water Ripple Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#D0E8FF]/8 via-transparent to-transparent" />
      </div>

      {/* Decorative Water Icons */}
      <div className="absolute top-10 right-10 text-[#579BE8]/15 z-0">
        <IoWaterOutline size={120} className="rotate-12" />
      </div>
      <div className="absolute bottom-10 left-10 text-[#579BE8]/15 z-0">
        <FaWater size={100} className="-rotate-12" />
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-cairo font-bold text-gray-900 mb-3">
            أرقامنا تتحدث
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mx-auto" />
        </motion.div>

        {/* Stats Grid - One Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} delay={index * 0.1} icon={stat.icon} />
          ))}
        </div>
      </div>
    </section>
  );
}