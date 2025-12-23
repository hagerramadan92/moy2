"use client";

import React from "react";

export default function ServicesSection() {
  const services = [
    {
      id: 1,
      title: "عروض خاصة",
      subItems: [
        "عروض ومكافآت حصرية للسائقين",
        "خصومات على المعدات وخدمات الصيانة",
        "كوبونات بأسعار تفضيلية",
      ],
      gradient: "linear-gradient(237.22deg, #1C7C4B 6.99%, rgba(102, 102, 102, 0) 90.26%)",
      color: "#1C7C4B",
    },
    {
      id: 2,
      title: "الترقيات والمستويات",
      subItems: [
        "مستويات متنوعة تُمنح حسب الأداء",
        "مزايا إضافية كلما ارتفع مستواك",
        "أولوية في الطلبات والمكافآت",
      ],
      gradient: "linear-gradient(237.22deg, #579BE8 6.99%, rgba(102, 102, 102, 0) 90.26%)",
      color: "#579BE8",
    },
    {
      id: 3,
      title: "عمولة تنافسية",
      subItems: [
        "نسب عمولة عادلة ومحفّزة",
        "مكافآت إضافية على عدد الرحلات",
        "برامج دعم وتحفيز مستمرة",
      ],
      gradient: "linear-gradient(237.22deg, #B3000D 6.99%, rgba(102, 102, 102, 0) 90.26%)",
      color: "#B3000D",
    },
  ];

  return (
    <section className="w-full py-8 sm:py-10 md:py-12 lg:py-16 my-4 lg:my-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="font-cairo font-semibold text-xl sm:text-2xl md:text-[28px] leading-[150%] sm:leading-[170%] text-[#579BE8] py-2 sm:py-3">
            الخدمات المقدمه للسائقين
          </h2>
        </div>

        {/* Services Cards Container */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 sm:gap-8 lg:gap-12">
          
          {services.map((service) => (
            <div 
              key={service.id}
              className="w-full max-w-[320px] sm:max-w-[350px] md:max-w-[380px] h-[320px] sm:h-[350px] md:h-[380px] rounded-[20px] sm:rounded-[22px] md:rounded-[24px] p-[2px] sm:p-[2.5px] md:p-[3px]"
              style={{
                background: service.gradient,
              }}
            >
              {/* Card Content */}
              <div className="w-full h-full bg-white rounded-[18px] sm:rounded-[20px] md:rounded-[21px] flex flex-col p-4 sm:p-6 md:p-8">
                
                {/* Title */}
                <div className="w-full text-right mb-3 sm:mb-4">
                  <h3 className="font-cairo font-semibold text-xl sm:text-2xl md:text-[32px] leading-[140%] sm:leading-[150%] md:leading-[170%] mt-8 sm:mt-10 md:mt-12"
                    style={{ color: service.color }}>
                    {service.title}
                  </h3>
                </div>

                {/* Sub Items List */}
                <div className="w-full space-y-2 sm:space-y-3 pr-0 flex-1">
                  {service.subItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 text-right">
                      <div 
                        className="flex-shrink-0 w-[3px] sm:w-[4px] h-[3px] sm:h-[4px] mt-[9px] sm:mt-[10px] ml-1"
                        style={{ 
                          backgroundColor: service.color,
                          borderRadius: '0.5px'
                        }}
                      ></div>
                      
                      <span 
                        className="font-cairo font-normal text-xs sm:text-sm md:text-base leading-relaxed flex-1 text-right"
                        style={{ color: service.color }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}