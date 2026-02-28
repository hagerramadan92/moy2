"use client";

import Image from "next/image";
import React from "react"; 
import AppDownloadButtons from "../homepage/AppDownloadButtons";

export default function Cover({ data }) {
  // Extract data from API response
  const getContentValue = (key) => {
    if (!data?.contents) return null;
    const content = data.contents.find(c => c.key === key);
    return content?.value || null;
  };

  const title = getContentValue('title');
  const description = getContentValue('description');

  return (
    <>
     <div className="cover  relative px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
      <div className="container mx-auto">
      <div className="mx-auto max-w-7xl  grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
        {/* Form Section - Appears first on small screens */}
        <div className="form-left content-left order-1 md:order-2 rounded-xl sm:rounded-2xl md:rounded-[26px] border border-[#FFFFFF26] sm:border-2 md:border-[12px] lg:border-[20px] shadow-lg overflow-hidden">
          <div className="bg-[#FFFFFF26] h-full p-2 py-6 md:py-3">
            <form className="bg-[#EFF5FD] px-2 sm:px-5 md:px-6 lg:px-7 py-5 sm:py-6 md:py-7 lg:py-8 rounded-xl sm:rounded-2xl md:rounded-3xl flex flex-col gap-3 sm:gap-4 shadow-md w-full max-w-md mx-auto min-h-[380px] sm:min-h-[420px] md:min-h-[480px] justify-center">
              <h2 className="text-center text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-[#579BE8] mb-1 sm:mb-2">
                ارباحك المتوقعه
              </h2>
          {/* Daily Profit Button */}
          <div className="w-full rounded-xl sm:rounded-2xl bg-[rgba(87,155,232,0.15)] p-4 sm:p-5  mb-4 sm:mb-5">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4"> {/* Increased gap */}
                    <span className="font-cairo font-normal text-[15px] text-gray-700 text-center sm:text-left whitespace-nowrap">
                      متوسط الربح اليومي
                    </span>
                    <span className="font-cairo font-normal text-[17px] text-[#579BE8] text-center sm:text-right text-nowrap">
                      500 - 800 ريال
                    </span>
                  </div>
                </div>

                {/* Weekly Profit Button */}
                <div className="w-full rounded-xl sm:rounded-2xl bg-[rgba(87,155,232,0.15)] p-4 sm:p-5  mb-3 sm:mb-4 md:mb-5">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-1"> {/* Increased gap */}
                    <span className="font-cairo font-normal text-[15px] text-gray-700 text-center sm:text-left whitespace-nowrap">
                      متوسط الربح الاسبوعي
                    </span>
                    <span
                      className="font-cairo font-normal text-[17px] text-center sm:text-right whitespace-nowrap"
                      style={{ color: 'rgba(26, 160, 158, 1)' }}
                    >
                      3500 - 5600 ريال
                    </span>
                  </div>
                </div>
                   
              <div className="flex flex-col gap-2"> 
                <div className="flex flex-col gap-1">
                  <button
                    type="submit"
                    className="mt-2 sm:mt-3 md:mt-4 w-full h-11 sm:h-12 md:h-14 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-white text-sm sm:text-base font-semibold bg-gradient-to-r from-[#579BE8] to-[#124987] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    شاهد الفيديو التوضيحي
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Content Section - Appears second on small screens */}
        <div className="content-right order-2 md:order-1">
        <div className="flex items-center px-3 py-2 gap-2 max-w-[240px] bg-white/20 rounded-lg backdrop-blur-sm mb-3 mt-4">
              <Image
                src="/Vector (12).png"
                width={16}
                height={16}
                alt="Icon"
                className="w-4 h-4"
              />
              <span className="font-cairo font-medium text-sm text-white">
                انضم لاكثر من 500 سائق نشط
              </span>
            </div>
          <h2 className="text-lg md:text-2xl text-white font-bold mb-3">
            {title || "احصل علي دخل اضافي من توصيل المياه"}
          </h2>
          <p className="text-lg text-gray-700 mb-4 w-100 max-w-md">
            {description || "انضم الينا و أحصل علي دخل مضمون بخطوات بسيطة و مرونة كاملة في العمل ."}
          </p>
          <AppDownloadButtons userType="driver" />
        </div>
      </div>
      </div>
    </div>
    </>
  );
}