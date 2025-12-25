"use client";

import React from "react";
import { MdOutlineStarBorder } from "react-icons/md";
import { AiTwotoneCheckCircle } from "react-icons/ai";
import { BsStars } from "react-icons/bs";

export default function CallToActionSection() {
  return (
    <section
      className="
        container
        h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[560px]
        flex
        flex-col
        items-center
        justify-center
        gap-[12px] sm:gap-[20px] lg:gap-[30px]
        bg-[radial-gradient(50%_116.88%_at_50%_50%,rgba(233,242,252,0)_0%,rgba(152,193,241,0.7)_100%)]
        font-['Cairo',_sans-serif]
        py-6 sm:py-8
        my-2 lg:my-4
      "
    >
      <div className="container px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center gap-[4px] sm:gap-[6px] lg:gap-[8px]">
        <h2 className="font-cairo font-normal text-xl sm:text-2xl md:text-3xl lg:text-[32px] xl:text-[40px] leading-[130%] sm:leading-[140%] lg:leading-[150%] text-[#253B80] text-center">
          جاهز تطلب المويه؟
        </h2>
        <p className="font-cairo font-normal text-lg sm:text-xl md:text-2xl lg:text-[28px] xl:text-[40px] leading-[130%] sm:leading-[140%] lg:leading-[150%] text-[#253B80] text-center">
          احصل على عروض أسعار فورية من سواقين موثوقين في منطقتك الآن
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-[12px] sm:gap-[16px] lg:gap-[20px] w-full px-4 sm:px-6 lg:px-8">
        <button className="w-full sm:w-[180px] md:w-[200px] lg:w-[221px] h-[55px] sm:h-[65px] md:h-[75px] lg:h-[88px] rounded-[16px] sm:rounded-[20px] lg:rounded-[24px] flex items-center justify-center font-normal text-base sm:text-lg md:text-xl lg:text-[24px] xl:text-[28px] leading-[130%] sm:leading-[140%] lg:leading-[150%] text-white bg-gradient-to-b from-[#245893] to-[#0B1B2D] hover:opacity-90 transition-opacity duration-200">
          اطلب الآن
        </button>

        <button className="w-full sm:w-[250px] md:w-[280px] lg:w-[307px] h-[55px] sm:h-[65px] md:h-[75px] lg:h-[88px] rounded-[16px] sm:rounded-[20px] lg:rounded-[24px] flex items-center justify-center font-normal text-base sm:text-lg md:text-xl lg:text-[24px] xl:text-[28px] leading-[130%] sm:leading-[140%] lg:leading-[150%] text-[#1C4471] border border-[#1C4471] bg-transparent hover:bg-[#1C4471] hover:text-white transition-all duration-200">
          تحدث مع خدمة العملاء
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-[12px] sm:gap-[20px] lg:gap-[30px] xl:gap-[40px] mt-1 sm:mt-2 lg:mt-3 w-full px-4 sm:px-6 lg:px-8">
        <button className="flex items-center gap-2 w-auto h-[28px] sm:h-[32px] lg:h-[36px] hover:opacity-80 transition-opacity duration-200">
          <MdOutlineStarBorder 
            className="w-[16px] h-[15px] sm:w-[18px] sm:h-[17px] lg:w-[20px] lg:h-[19px] xl:w-[22px] xl:h-[21px] text-[#253B80] opacity-100"
          />
          <span className="text-[#253B80] font-normal text-sm sm:text-base lg:text-lg xl:text-[24px] leading-[130%] sm:leading-[140%] lg:leading-[150%]">
            تقييم ٤.٩
          </span>
        </button>

        <button className="flex items-center gap-2 w-auto h-[28px] sm:h-[32px] lg:h-[36px] hover:opacity-80 transition-opacity duration-200">
          <AiTwotoneCheckCircle 
            className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] lg:w-[24px] lg:h-[24px] xl:w-[28px] xl:h-[28px] text-[#253B80] opacity-100"
          />
          <span className="text-[#253B80] font-normal text-sm sm:text-base lg:text-lg xl:text-[24px] leading-[130%] sm:leading-[140%] lg:leading-[150%]">
            موثوق
          </span>
        </button>

        <button className="flex items-center gap-2 w-auto h-[28px] sm:h-[32px] lg:h-[36px] hover:opacity-80 transition-opacity duration-200">
          <BsStars 
            className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] lg:w-[24px] lg:h-[24px] xl:w-[28px] xl:h-[28px] text-[#253B80] opacity-100"
          />
          <span className="text-[#253B80] font-normal text-sm sm:text-base lg:text-lg xl:text-[24px] leading-[130%] sm:leading-[140%] lg:leading-[150%]">
            خدمة سريعة
          </span>
        </button>
      </div>
    </section>
  );
}