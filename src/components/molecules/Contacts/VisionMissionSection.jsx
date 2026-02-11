'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaEye, FaBullseye, FaFlag, FaHeart } from 'react-icons/fa';

const VisionMissionSection = () => {
  const gradient = 'from-[#579BE8] to-[#6BA8F0]';

  const visionItems = [
    {
      id: 1,
      title: 'رؤيتنا',
      description: 'أن نكون الخيار الأول لتوصيل المياه في المملكة من خلال الجودة والسرعة',
      icon: FaEye,
      image: '/oction.png',
    },
    {
      id: 2,
      title: 'رسالتنا',
      description: 'تسهيل الوصول للمياة النقية لكل منزل و مؤسسة في جميع انحاء المملكة',
      icon: FaBullseye,
      image: '/badge.png',
    },
    {
      id: 3,
      title: 'هدفنا',
      description: 'تغطية جميع مناطق المملكة بخدمات توصيل المياه خلال السنوات الثلاث القادمة',
      icon: FaFlag,
      image: '/time.png',
    },
    {
      id: 4,
      title: 'قيمنا',
      description: 'الجودة، السرعة، الموثوقية، والابتكار في كل ما نقدمه',
      icon: FaHeart,
      image: '/vec.png',
    }
  ];

  return (
    <section className="relative w-full py-10 md:py-12 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
      <div className="px-3 mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-10"
        >
          <div className="inline-block mb-3 md:mb-4">
            <span className="text-xs md:text-sm font-bold text-[#579BE8] bg-[#579BE8]/10 px-4 py-2 rounded-full">
              من نحن
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl  font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
            <span className="block text-[#579BE8]">عن ويت مياة</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#579BE8] to-[#6BA8F0] rounded-full mx-auto mb-5"></div>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            نحن شركة رائدة في مجال توصيل المياه النقية في المملكة العربية السعودية، نسعى لتوفير مياه نظيفة وصحية لكل منزل ومؤسسة
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-6xl mx-auto">
          {visionItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="relative h-full bg-white rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-transparent overflow-hidden">
                  {/* Gradient Top Border */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient}`}></div>
                  
                  <div className="relative z-10 flex items-center gap-3 md:gap-4">
                    {/* Icon Container */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                        <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 flex flex-col gap-2 md:gap-3 border-r-2 border-gray-200 pr-3 md:pr-4">
                      <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Simple Hover Background */}
                  <div className="absolute inset-0 bg-[#579BE8]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VisionMissionSection;
