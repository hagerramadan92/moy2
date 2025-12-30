"use client";

import Image from "next/image";
import React from "react";
import WaterTypeSelect from "../homepage/WaterTypeSelect";
import WaterSizeSelect from "../homepage/WaterSizeSelect";
import AppDownloadButtons from "../homepage/AppDownloadButtons";

export default function HomeCover() {
  const [waterType, setWaterType] = React.useState("");
  const [waterSize, setWaterSize] = React.useState("");

  return (
    <div className="cover  relative px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
      <div className="container mx-auto">
      <div className="mx-auto max-w-7xl  grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
        {/* Form Section - Appears first on small screens */}
        <div className="form-left content-left order-1 md:order-2 rounded-xl sm:rounded-2xl md:rounded-[26px] border border-[#FFFFFF26] sm:border-2 md:border-[12px] lg:border-[20px] shadow-lg overflow-hidden">
          <div className="bg-[#FFFFFF26] h-full p-2 py-6 md:py-3">
            <form className="bg-[#EFF5FD] px-2 sm:px-5 md:px-6 lg:px-7 py-5 sm:py-6 md:py-7 lg:py-8 rounded-xl sm:rounded-2xl md:rounded-3xl flex flex-col gap-3 sm:gap-4 shadow-md w-full max-w-md mx-auto min-h-[380px] sm:min-h-[420px] md:min-h-[480px] justify-center">
              <h2 className="text-center text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-[#579BE8] mb-1 sm:mb-2">
                اختر اللي يناسبك
              </h2>

              <div className="space-y-1 sm:space-y-2">
                <label className="text-[#579BE8] text-xs sm:text-sm font-medium block">اختر نوع المويه</label>
                <WaterTypeSelect value={waterType} onChange={setWaterType} />
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <label className="text-[#579BE8] text-xs sm:text-sm font-medium block">اختر حجم المويه</label>
                <WaterSizeSelect value={waterSize} onChange={setWaterSize} />
              </div>

              <button
                type="submit"
                className="mt-2 sm:mt-3 md:mt-4 w-full h-11 sm:h-12 md:h-14 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-white text-sm sm:text-base font-semibold bg-gradient-to-r from-[#579BE8] to-[#124987] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                ابدأ الطلب
              </button>
            </form>
          </div>
        </div>

        {/* Content Section - Appears second on small screens */}
        <div className="content-right order-2 md:order-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">اسرع خدمة توصيل في الممكلة</h1>
          <p className="desc text-base sm:text-lg md:text-xl mb-6 sm:mb-8">
            حدد الكمية والموقع واستقبل عروض الأسعار من السواقين فورا
          </p>
          <AppDownloadButtons />
        </div>
      </div>
      </div>
    </div>
  );
}
