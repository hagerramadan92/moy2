"use client";

import React from "react";

export default function IntroSection() {
  return (
    <section className="flex flex-col lg:flex-row-reverse  font-cairo gap-4 sm:gap-6 px-4 sm:px-6 py-6 sm:py-8 max-w-[1000px] mb-4 md:mb-6 mx-auto">
      
      {/* Text Section */}
      <div className="flex flex-col justify-center items-start  lg:w-[550px] gap-3 sm:gap-4">
        <div className="flex items-start">
          {/*عننا */}
          <span className="text-[#579BE8] font-medium text-[16px] sm:text-[18px] whitespace-nowrap mt-1">
            عننا
          </span>
          
          <div className="text-black font-semibold text-[18px] sm:text-[20px] lg:text-[22px] leading-[1.4] sm:leading-[1.5] mr-3 sm:mr-4">
            <div className="flex flex-col">
              <span>نرتقي بخدماتنا عبر ابتكارٍ لا يتوقف،</span>
              <span className="mr-[-20px] sm:mr-[-30px] lg:mr-[-40px]">وبفريق يؤمن أن الإنسان هو المحرك</span>
              <span className="mr-[-20px] sm:mr-[-30px] lg:mr-[-40px]">الحقيقي لكل تطوّر</span>
            </div>
          </div>
        </div>

        <p className="text-black font-normal text-[13px] sm:text-[14px] leading-[1.6] sm:leading-[1.8] mt-3 sm:mt-4">
          يعمل تطبيق المايّة على تسهيل حياة السائقين من خلال توفير حلول ذكية تنظّم الوقت وتقلل
          <br className="hidden sm:block" />
          الجهد وتمنحهم وضوحًا أكبر في إدارة رحلاتهم وأعمالهم اليومية، مما يجعل تجربتهم أكثر راحة
          <br className="hidden sm:block" />
          وسلاسة دون أي تعقيد
        </p>
      </div>

      {/* Image Section */}
      <div className="w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] lg:w-[320px] lg:h-[320px] rounded-[20px] sm:rounded-[24px] overflow-hidden">
        <img
          src="/driver.jpg" 
          alt="picture of driver"
          className="w-full h-full object-cover"
        />
      </div>

    </section>
  );
}