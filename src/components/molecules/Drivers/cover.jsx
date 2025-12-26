"use client";

import Image from "next/image";
import React from "react";
import { BsCart } from "react-icons/bs";

export default function Cover() {
  return (
    <div className="relative min-h-screen flex items-center">
      <div className="absolute inset-0 -z-10">
        <img
          src="/cover.png"
          alt="Cover Background"
          className="object-cover w-full h-full"
          loading="eager"
        />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 lg:pt-32 pb-8 sm:pb-10 md:pb-12 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 items-start">

          {/* Left Content */}
          <div className="text-white order-1 lg:order-1 mt-0 lg:mt-12 mr-0 lg:mr-10">
            <div className="flex items-center px-4 sm:px-5 py-2 sm:py-3 gap-3 max-w-[274px] bg-white/20 rounded-[24px] backdrop-blur-sm mb-4 sm:mb-6 lg:mb-8">
              <BsCart className="text-white w-4 sm:w-5 h-4 sm:h-5" />
              <span className="font-cairo font-medium text-xs sm:text-sm text-white">
                انضم لاكثر من 500 سائق نشط
              </span>
            </div>

            <h1 className="font-cairo font-normal text-sm sm:text-xl md:text-xl lg:text-2xl mb-3 sm:mb-4 lg:mb-6 leading-tight">
              احصل علي دخل اضافي من توصيل المياه
            </h1>

            <p className="font-cairo font-normal text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 lg:mb-10 leading-relaxed">
              كن شريكا معنا و احصل علي طلبات مستمره، ارباح مجزيه، ومرونه كامله في العمل. انضم الان و ابدأ الربح من هاتفك!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                className="flex items-center justify-center sm:justify-between px-4 sm:px-5 md:px-6 py-3 sm:py-3 rounded-xl hover:opacity-90 transition-all duration-300 w-full sm:w-auto sm:min-w-[180px] shadow-lg shadow-black/30 mb-2 sm:mb-0"
                style={{
                  border: '1px solid rgba(87, 155, 232, 1)',
                  background: 'rgba(18, 18, 18, 0.15)'
                }}
              >
                <div className="flex flex-col items-center sm:items-start flex-shrink-0">
                  <span className="font-cairo font-normal text-[10px] sm:text-xs text-white/80 leading-tight">
                    Download on the
                  </span>
                  <span className="font-cairo font-medium text-sm sm:text-base text-white leading-tight hidden sm:block">
                    Google Play
                  </span>
                  <span className="font-cairo font-medium text-sm sm:text-base text-white leading-tight sm:hidden">
                    Google Play
                  </span>
                </div>
                <Image
                  src="/Playstore.png"
                  width={28}
                  height={28}
                  alt="Google Play"
                  className="ml-2 sm:ml-3 flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8"
                />
              </button>

              <button
                className="flex items-center justify-center sm:justify-between px-4 sm:px-5 md:px-6 py-3 sm:py-3 rounded-xl hover:opacity-90 transition-all duration-300 w-full sm:w-auto sm:min-w-[180px] shadow-lg shadow-black/30 mt-2 sm:mt-0"
                style={{
                  border: '1px solid rgba(87, 155, 232, 1)',
                  background: 'rgba(18, 18, 18, 0.15)'
                }}
              >
                <div className="flex flex-col items-center sm:items-start flex-shrink-0">
                  <span className="font-cairo font-normal text-[10px] sm:text-xs text-white/80 leading-tight">
                    Download on the
                  </span>
                  <span className="font-cairo font-medium text-sm sm:text-base text-white leading-tight hidden sm:block">
                    App Store
                  </span>
                  <span className="font-cairo font-medium text-sm sm:text-base text-white leading-tight sm:hidden">
                    App Store
                  </span>
                </div>
                <Image
                  src="/app.png"
                  width={28}
                  height={28}
                  alt="App Store"
                  className="ml-2 sm:ml-3 flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8"
                />
              </button>
            </div>
          </div>

          {/* Right Card */}
          <div className="order-2 lg:order-2 lg:-mt-10 xl:-mt-16">
            <div className="form-left content-left rounded-[26px] border-[#FFFFFF26] border-[32.5px] shadow">
              <div className="bg-[#EFF5FD] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 h-full flex flex-col">
                <h2 className="font-cairo font-semibold text-lg sm:text-xl md:text-2xl text-center text-[#579BE8] mb-4 sm:mb-6 md:mb-8 lg:mb-10">
                  ارباحك المتوقعه
                </h2>

                <div className="w-full rounded-xl sm:rounded-2xl bg-[rgba(87,155,232,0.15)] p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 md:mb-8">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
                    <span className="font-cairo font-normal text-sm sm:text-base md:text-lg text-gray-700 text-center sm:text-left whitespace-nowrap">
                      متوسط الربح اليومي
                    </span>
                    <span className="font-cairo font-semibold text-base sm:text-lg md:text-xl text-[#579BE8] text-center sm:text-right">
                      500 - 800 ريال
                    </span>
                  </div>
                </div>

                <div className="w-full rounded-xl sm:rounded-2xl bg-[rgba(87,155,232,0.15)] p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 md:mb-8">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
                    <span className="font-cairo font-normal text-sm sm:text-base md:text-lg text-gray-700 text-center sm:text-left whitespace-nowrap">
                      متوسط الربح الاسبوعي
                    </span>
                    <span
                      className="font-cairo font-semibold text-base sm:text-lg md:text-xl text-center sm:text-right whitespace-nowrap"
                      style={{ color: 'rgba(26, 160, 158, 1)' }}
                    >
                      3500 - 5600 ريال
                    </span>
                  </div>
                </div>

                <button
                  className="w-full rounded-xl sm:rounded-2xl py-2 sm:py-3 md:py-4 text-white font-cairo font-semibold text-sm sm:text-base md:text-lg hover:opacity-90 transition-opacity duration-300 mt-2 sm:mt-4"
                  style={{ background: 'linear-gradient(90deg, #579BE8 0%, #124987 100%)' }}
                >
                  شاهد الفيديو التوضيحي
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}