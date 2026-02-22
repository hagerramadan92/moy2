"use client";

import React from "react";

export default function ServicesSection() {
  const services = [
    // {
    //   id: 1,
    //   title: "عروض خاصة",
    //   subItems: [
    //     "عروض ومكافآت حصرية للسائقين",
    //     "خصومات على المعدات وخدمات الصيانة",
    //     "كوبونات بأسعار تفضيلية",
    //   ],
    // },
    {
      id: 2,
      title: "الترقيات والمستويات",
      subItems: [
        "مستويات متنوعة تُمنح حسب الأداء",
        "مزايا إضافية كلما ارتفع مستواك",
        "أولوية في الطلبات والمكافآت",
      ],
    },
    {
      id: 3,
      title: "عمولة تنافسية",
      subItems: [
        "نسب عمولة عادلة ومحفّزة",
        "مكافآت إضافية على عدد الرحلات",
        "برامج دعم وتحفيز مستمرة",
      ],
    },
  ];

  return (
    <section className="container py-10 sm:py-12 lg:py-14 my-6 lg:my-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-10 lg:mb-12">
          <div className="inline-block mb-2 md:mb-3">
            <span className="text-xs md:text-sm font-bold text-[#579BE8] bg-[#579BE8]/10 px-3 py-1.5 rounded-full">
              خدمات مميزة
            </span>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-gray-900 mb-2 md:mb-3 leading-tight">
            <span className="block text-[#579BE8]">الخدمات المقدمه للسائقين</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mx-auto"></div>
        </div>

        {/* Services Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 text-center">
          
          {services.map((service) => (
            <div 
              key={service.id}
              className="group items-center flex flex-col bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:border-[#579BE8]/30"
            >
              {/* Title */}
              <div className="text-right mb-6">
                <h3 className="font-cairo font-bold text-xl lg:text-2xl text-[#579BE8] mb-1">
                  {service.title}
                </h3>
                <div className="w-12 h-0.5 bg-[#579BE8] rounded-full"></div>
              </div>

              {/* Sub Items List */}
              <div className="space-y-4">
                {service.subItems.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 text-right"
                  >
                    {/* Bullet */}
                    <div className="flex-shrink-0 mt-2">
                      <div className="w-2 h-2 rounded-full bg-[#579BE8]"></div>
                    </div>
                    
                    {/* Text */}
                    <span className="font-cairo font-normal text-sm lg:text-base leading-relaxed text-gray-700 flex-1">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}