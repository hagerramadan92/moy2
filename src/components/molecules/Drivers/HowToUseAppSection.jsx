"use client";

import React from "react";
import { AiOutlinePlayCircle } from "react-icons/ai";

export default function HowToUseAppSection() {
  return (
    <section className="relative container h-[300px] sm:h-[350px] md:h-[400px] lg:h-[466px] bg-[rgba(87,155,232,0.13)] overflow-hidden my-8 lg:my-12">
      <AiOutlinePlayCircle
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
             text-[#579BE8] w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] md:w-[110px] md:h-[110px] lg:w-[130px] lg:h-[130px] font-thin"
      />
      <div className="absolute bottom-0 right-0
                     w-full md:w-[800px] lg:w-[1062px] h-[80px] sm:h-[100px] md:h-[110px] lg:h-[125px] 
                     flex items-center px-4 sm:px-6 lg:px-2.5 gap-2.5
                     bg-gradient-to-r from-transparent to-[#579BE8] to-[129.87%]">

        <div className="w-full max-w-[300px] sm:max-w-[350px] md:w-[375px] 
               h-[50px] sm:h-[60px] md:h-[68px] 
               flex items-center justify-center 
               font-cairo font-normal text-xl sm:text-2xl md:text-3xl lg:text-4xl 
               leading-[1.5] sm:leading-[1.6] md:leading-[1.7] 
               text-white text-center px-4 lg:whitespace-nowrap">
          كيفيه استخدام التطبيق
        </div>
      </div>
    </section>
  );
}