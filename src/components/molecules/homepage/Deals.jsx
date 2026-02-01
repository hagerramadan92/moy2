"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  FaTruck, 
  FaHeadset, 
  FaPercent,
  FaArrowLeft
} from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Deals() {
  const router = useRouter();
  
  const services = [
    {
      id: 1,
      title: "توصيل مجاني",
      subtitle: "للطلبات الكبيرة",
      description: "توصيل مجاني لجميع الطلبات التي تزيد عن 500 ريال",
      gradient: "from-[#1C7C4B] via-[#2A9D5F] to-[#1C7C4B]",
      color: "#1C7C4B",
      icon: FaTruck,
      bgPattern: "bg-[#1C7C4B]/5",
    },
    {
      id: 2,
      title: "دعم مخصص",
      subtitle: "24/7 للشركات",
      description: "دعم فني متخصص على مدار الساعة للشركات والمؤسسات",
      gradient: "from-[#579BE8] via-[#6BA8F0] to-[#579BE8]",
      color: "#579BE8",
      icon: FaHeadset,
      bgPattern: "bg-[#579BE8]/5",
    },
    {
      id: 3,
      title: "خصم 20%",
      subtitle: "للعقود السنوية",
      description: "احصل على خصم 20% عند الاشتراك في عقد سنوي",
      gradient: "from-[#B3000D] via-[#D40015] to-[#B3000D]",
      color: "#B3000D",
      icon: FaPercent,
      bgPattern: "bg-[#B3000D]/5",
    },
  ];

  return (
    <section className="w-full py-8 sm:py-10 md:py-12 lg:py-14 bg-gradient-to-br from-gray-50 via-blue-50/30 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#579BE8]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#1C7C4B]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
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
              عروض حصرية
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-2 md:mb-3 leading-tight">
            {/* <span className="block">التعاقدات</span> */}
            <span className="block text-[#579BE8]">عروض خاصة للأفراد والمؤسسات</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mx-auto"></div>
        </motion.div>

        {/* Deals Cards */}
        <div className="grid grid-cols-1 ms:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8 md:mb-10">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="relative h-full
                 rounded-xl md:rounded-2xl overflow-hidden
                  bg-white shadow-md hover:shadow-xl transition-all
                   duration-500 hover:-translate-y-1 border border-gray-100">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  {/* Pattern Background */}
                  <div className={`absolute inset-0 ${service.bgPattern} opacity-50`}></div>
                  
                  {/* Content */}
                  <div className="relative p-0 py-1 mb-5 sm:p-5 md:p-6 flex flex-col h-full text-center">
                    {/* Icon */}
                    <div className="mb-1 md:mb-4 flex justify-center">
                      <div 
                        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300"
                        style={{ backgroundColor: `${service.color}15` }}
                      >
                        <Icon 
                          className="text-xl sm:text-2xl md:text-3xl"
                          style={{ color: service.color }}
                        />
                      </div>
                    </div>

                    {/* Title and Subtitle */}
                    <div className="flex-1">
                      <h3 
                        className="text-lg sm:text-xl md:text-2xl font-black mb-1 md:mb-2 leading-tight"
                        style={{ color: service.color }}
                      >
                        {service.title}
                      </h3>
                      <p 
                        className="text-sm  sm:text-base md:text-lg font-bold mb-2 md:mb-3 opacity-90"
                        style={{ color: service.color }}
                      >
                        {service.subtitle}
                      </p>
                      <p className="text-xs  sm:text-sm text-gray-600 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* Decorative Element */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full"></div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div 
                    className="absolute inset-0 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      boxShadow: `0 0 30px ${service.color}40`
                    }}
                  ></div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <button
            onClick={() => router.push('/contracts')}
            className="group relative inline-flex items-center gap-2 px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-4 bg-gradient-to-r from-[#579BE8] to-[#315782] text-white text-sm sm:text-base md:text-lg font-bold rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#4788d5] to-[#2a4a6f] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10">انتقل إلى التعاقدات</span>
            <FaArrowLeft className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
