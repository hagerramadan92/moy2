'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaGift, FaStar, FaPercent } from 'react-icons/fa';

const SpecialOffersSection = () => {
  const gradient = 'from-[#579BE8] to-[#6BA8F0]';

  const offers = [
    {
      title: 'عرض خاص لفترة محدودة',
      mainText: 'اشترِ 10 واحصل على 2 مجاناً',
      description: 'على جميع عبوات المياه الكبيرة',
      icon: FaGift,
    },
    {
      title: 'برنامج الولاء',
      mainText: 'اجمع النقاط واستبدلها',
      description: 'كل 100 ريال = 10 نقاط مجانية',
      icon: FaStar,
    },
    {
      title: 'احتفالية الافتتاح الكبير',
      mainText: 'خصم 30% على الطلب الأول',
      code: 'WATER30',
      icon: FaPercent,
    }
  ];

  return (
    <section className="relative w-full py-8 md:py-10 bg-gradient-to-b from-gray-50 to-white">
      <div className="px-4 mx-auto max-w-6xl relative z-10">
        {/* Simple Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 md:mb-8"
        >
          <div className="inline-block mb-2">
            <span className="text-sm font-medium text-[#579BE8] bg-[#579BE8]/10 px-3 py-1 rounded-full">
              عروض حصرية
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1.5">
            <span className="text-[#579BE8]">عروض خاصة</span>
          </h2>
          <div className="w-12 h-0.5 bg-gradient-to-r from-[#579BE8] to-[#6BA8F0] rounded-full mx-auto"></div>
        </motion.div>

        {/* Advanced Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {offers.map((offer, index) => {
            const Icon = offer.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group"
              >
                <div className="relative bg-white rounded-lg p-4 md:p-5 h-full flex flex-col border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  {/* Subtle gradient accent */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  <div className="flex flex-col items-center text-center space-y-3 flex-1">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center w-full">
                      <h3 className="text-base md:text-lg font-semibold mb-1.5 text-gray-900">
                        {offer.title}
                      </h3>
                      <p className={`text-base md:text-lg font-bold mb-1.5 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                        {offer.mainText}
                      </p>
                      {offer.description && (
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {offer.description}
                        </p>
                      )}
                      {offer.code && (
                        <div className={`inline-flex items-center px-3 py-1.5 mt-2 bg-gradient-to-r ${gradient} rounded-full self-center`}>
                          <span className="text-sm font-bold text-white">{offer.code}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffersSection;
