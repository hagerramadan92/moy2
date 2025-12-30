"use client";

import React from "react";

export default function IntroSection() {
  return (
    <section className="flex flex-col lg:flex-row-reverse items-center lg:items-start font-cairo gap-6 sm:gap-8 px-4 sm:px-6 py-6 sm:py-8 max-w-[1000px] mb-4 md:mb-6 mx-auto">
      
      {/* Image Section - First on mobile, second on desktop */}
      <div className="order-1 lg:order-2 w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] lg:w-[350px] lg:h-[350px] rounded-[20px] sm:rounded-[24px] overflow-hidden lg:mr-8 lg:ml-8">
        <img
          src="/driver.jpg" 
          alt="Driver using the app"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text Section - Second on mobile, first on desktop */}
      <div className="order-2 lg:order-1 flex flex-col justify-center lg:justify-start items-center lg:items-start lg:w-[550px] lg:mt-[60px]">
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-start gap-2 sm:gap-3">
          {/* "عننا" - positioned for special alignment on desktop */}
          <div className="flex flex-col items-center lg:items-start lg:mr-4">
            <span className="text-[#579BE8] font-medium text-[16px] sm:text-[18px] whitespace-nowrap lg:mb-8">
              عننا
            </span>
          </div>
          
          {/* Text content - centered on mobile, aligned on desktop */}
          <div className="flex-1 text-center lg:text-right">
            <div className="text-black font-semibold text-[18px] sm:text-[20px] lg:text-[22px] leading-[1.4] sm:leading-[1.5]">
              <div className="flex flex-col items-center lg:items-start">
                {/* First line */}
                <span>نرتقي بخدماتنا عبر ابتكارٍ لا يتوقف،</span>
                
                {/* Second line - positioned under "عننا" on desktop */}
                <div className="mt-1 lg:mt-0 lg:mr-[-40px]">
                  <span>وبفريق يؤمن أن الإنسان هو المحرك</span>
                </div>
                
                {/* Third line */}
                 <div className="mt-1 lg:mt-0 lg:mr-[-40px]">
                <span className="mt-1">الحقيقي لكل تطوّر</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="w-full mt-3 sm:mt-4 lg:mt-6 lg:mr-[-40px]">
              <p className="text-black font-normal text-[13px] sm:text-[14px] leading-[1.6] sm:leading-[1.8] lg:text-nowrap">
                يعمل تطبيق المايّة على تسهيل حياة السائقين من خلال توفير حلول ذكية تنظّم الوقت وتقلل
                <br className="hidden sm:block" />
                الجهد وتمنحهم وضوحًا أكبر في إدارة رحلاتهم وأعمالهم اليومية، مما يجعل تجربتهم أكثر راحة
                <br className="hidden sm:block" />
                وسلاسة دون أي تعقيد
              </p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}