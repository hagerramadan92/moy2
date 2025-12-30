"use client";

import Image from "next/image";
import React from "react";

export default function StartJourneySection() {
  const features = [
    {
      title: "دعم و مساعده 24/7",
      items: [
        "دعم فوري عبر الشات و الهاتف",
        "تدريب مجاني علي استخدام التطبيق",
        "حل سريع لأي مشكله تواجهك",
      ],
    },
    {
      title: "اعمل بالمرونه التي تناسبك",
      items: [
        "لا التزامات في ساعات العمل",
        "اشتغل صباحا او مساء كما تحب",
        "اداره كامله لوقتك و طلباتك",
      ],
    },
    {
      title: "تطبيق ذكي و سهل",
      items: [
        "واجهه بسيطه وواضحه",
        "اشعارات فوريه للطلبات",
        "تتبع ارباحك بشكل لحظي",
      ],
    },
  ];

  return (
    <section className="container py-8 sm:py-10 md:py-12 bg-white my-4 lg:my-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Heading */}
        <div className="text-center mb-6 sm:mb-8 md:mb-14">
          <h1 className="font-cairo font-medium text-lg sm:text-xl md:text-2xl text-[#579BE8] leading-relaxed">
            ابدأ رحلتك معنا الآن!
            <br />
            انضم لمئات السائقين الذين يحققون دخلاً مستقراً ومجزياً
          </h1>
        </div>

        {/* Content Container */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 sm:gap-8 lg:gap-4">
          
          {/* Left Side - Features */}
          <div className="w-full lg:w-1/2">
            {/* Desktop Layout - Vertical Stack */}
            <div className="hidden lg:block space-y-6 lg:space-y-8">
              {features.map((feature, index) => (
                <div key={index} className="relative">
                  <div 
                    className="absolute right-0 w-[4px]"
                    style={{
                      background: '#579BE8',
                      opacity: 0.9,
                      height: '95px',
                      top: '45px',
                    }}
                  ></div>
                  
                  <div className="pr-6 sm:pr-8 lg:pr-10">
                    <h2 className="font-cairo font-bold text-base sm:text-lg md:text-xl text-[#579BE8] mb-4 leading-relaxed text-right">
                      {feature.title}
                    </h2>
                    
                    <ul className="space-y-1 sm:space-y-2">
                      {feature.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 sm:gap-3">
                          <div className="w-1.5 h-1.5 bg-[#579BE8] rounded-full mt-2 flex-shrink-0"></div>
                          <span className="font-cairo font-normal text-xs sm:text-sm md:text-base text-[#579BE8] leading-relaxed text-right flex-1">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Layout - Horizontal Grid */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* First Column on Mobile - First two features */}
              <div className="space-y-4 sm:space-y-6">
                {features.slice(0, 2).map((feature, index) => (
                  <div key={index} className="relative">
                    <div 
                      className="absolute right-0 w-[4px]"
                      style={{
                        background: '#579BE8',
                        opacity: 0.9,
                        height: '95px',
                        top: '45px',
                      }}
                    ></div>
                    
                    <div className="pr-6 sm:pr-8">
                      <h2 className="font-cairo font-bold text-base sm:text-lg text-[#579BE8] mb-3 sm:mb-4 leading-relaxed text-right">
                        {feature.title}
                      </h2>
                      
                      <ul className="space-y-1 sm:space-y-2">
                        {feature.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2 sm:gap-3">
                            <div className="w-1.5 h-1.5 bg-[#579BE8] rounded-full mt-2 flex-shrink-0"></div>
                            <span className="font-cairo font-normal text-xs sm:text-sm text-[#579BE8] leading-relaxed text-right flex-1">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Second Column on Mobile - Third feature */}
              <div className="relative">
                <div 
                  className="absolute right-0 w-[4px]"
                  style={{
                    background: '#579BE8',
                    opacity: 0.9,
                    height: '95px',
                    top: '45px',
                  }}
                ></div>
                
                <div className="pr-6 sm:pr-8">
                  <h2 className="font-cairo font-bold text-base sm:text-lg text-[#579BE8] mb-3 sm:mb-4 leading-relaxed text-right">
                    {features[2].title}
                  </h2>
                  
                  <ul className="space-y-1 sm:space-y-2">
                    {features[2].items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 sm:gap-3">
                        <div className="w-1.5 h-1.5 bg-[#579BE8] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="font-cairo font-normal text-xs sm:text-sm text-[#579BE8] leading-relaxed text-right flex-1">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="w-full lg:w-[90%]">
            <div className="rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-md sm:shadow-lg">
              <div className="relative w-full aspect-[850/700]">
                <Image
                  src="/Frame.png"
                  alt="سائقين يعملون معنا"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 800px"
                  priority
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}