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
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h1 className="font-cairo font-semibold text-lg sm:text-xl md:text-2xl text-[#579BE8] leading-relaxed">
            ابدأ رحلتك معنا الآن!
            <br />
            انضم لمئات السائقين الذين يحققون دخلاً مستقراً ومجزياً
          </h1>
        </div>

        {/* Content Container */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 sm:gap-8 lg:gap-12">
          
          {/* Left Side - Features */}
          <div className="w-full lg:w-1/2 space-y-4 sm:space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="relative">
                <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-[#579BE8] opacity-90"></div>
                
                <div className="pr-10 sm:pr-12">
                  <h2 className="font-cairo font-bold text-base sm:text-lg md:text-xl text-[#579BE8] mb-2 sm:mb-3 leading-relaxed text-right">
                    {feature.title}
                  </h2>
                  
                  <ul className="space-y-1.5 sm:space-y-2">
                    {feature.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-[#579BE8] rounded-full mt-[6px] sm:mt-[7px] flex-shrink-0"></div>
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

          {/* Right Side - Image */}
          <div className="w-full lg:w-1/2">
            <div className="rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-md sm:shadow-lg">
              <div className="relative w-full aspect-[750/635]">
                <Image
                  src="/Frame.png"
                  alt="سائقين يعملون معنا"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
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