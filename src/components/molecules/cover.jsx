"use client";

import Image from "next/image";
import React from "react";
import { BsCart } from "react-icons/bs";

export default function Cover() {
  return (
    <div className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/cover.png"
          alt="Cover Background"
          fill
          className="object-cover"
          priority
        /> 
      </div>

      {/* Main Content Container */}
      <div className="relative container mx-auto   pt-20 pb-12 md:pt-32 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          
          {/* Left Column - Content */}
          <div className="text-white order-2 lg:order-1 mt-8 lg:mt-12 mr-10">
            
            {/* Join Badge */}
            <div className="flex items-center px-5 py-3 gap-3 max-w-[274px] bg-white/20 rounded-[24px] backdrop-blur-sm mb-6 lg:mb-8">
              <BsCart className="text-white w-5 h-5" />
              <span className="font-cairo font-medium text-sm text-white">
                انضم لاكثر من 500 سائق نشط
              </span>
            </div>

            {/* Main Heading - Updated to smaller text */}
            <h1 className="font-cairo font-normal text-xl md:text-xl lg:text-xl mb-4 lg:mb-6">
              احصل علي دخل اضافي من توصيل المياه
            </h1>

            {/* Description */}
            <p className="font-cairo font-normal text-base md:text-lg lg:text-xl text-white/90 mb-8 lg:mb-10 leading-relaxed">
              كن شريكا معنا و احصل علي طلبات مستمره، ارباح مجزيه، ومرونه كامله في العمل. انضم الان و ابدأ الربح من هاتفك!
            </p>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              
              {/* Google Play Button */}
              <button 
                className="flex items-center justify-between px-6 py-3 rounded-xl backdrop-blur-sm hover:opacity-90 transition-all duration-300 min-w-[180px]"
                style={{
                  border: '1px solid rgba(87, 155, 232, 1)',
                  background: 'rgba(18, 18, 18, 0.05)'
                }}
              >
                <div className="text-left flex-shrink-0">
                  <p className="font-cairo font-normal text-[10px] text-white/80 leading-tight">Download on the</p>
                  <p className="font-cairo font-medium text-sm text-white leading-tight">Google Play</p>
                </div>
                <Image
                  src="/Playstore.png"
                  width={32}
                  height={32}
                  alt="Google Play"
                  className="ml-3 flex-shrink-0"
                />
              </button>

              {/* App Store Button */}
              <button 
                className="flex items-center justify-between px-6 py-3 rounded-xl backdrop-blur-sm hover:opacity-90 transition-all duration-300 min-w-[180px]"
                style={{
                  border: '1px solid rgba(87, 155, 232, 1)',
                  background: 'rgba(18, 18, 18, 0.05)'
                }}
              >
                <div className="text-left flex-shrink-0">
                  <p className="font-cairo font-normal text-[10px] text-white/80 leading-tight">Download on the</p>
                  <p className="font-cairo font-medium text-sm text-white leading-tight">App Store</p>
                </div>
                <Image
                  src="/app.png"
                  width={32}
                  height={32}
                  alt="App Store"
                  className="ml-3 flex-shrink-0"
                />
              </button>
              
            </div>
          </div>

          {/* Right Column - Earnings Card - Moved up and shifted left */}
          <div className="order-1 lg:order-2 lg:mt-[-60px] lg:-translate-x-10">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-3 shadow-2xl w-full max-w-[460px] h-[460px] mx-auto lg:mx-0">
              
              <div className="bg-white rounded-3xl p-8 h-full flex flex-col">
                
                {/* Card Title */}
                <h2 className="font-cairo font-semibold text-xl md:text-2xl text-center text-[#579BE8] mb-12">
                  ارباحك المتوقعه
                </h2>

                {/* Daily Profit Card */}
                <div className="w-full rounded-2xl bg-[rgba(87,155,232,0.15)] p-5 mb-10">
                  <div className="flex justify-between items-center">
                    <span className="font-cairo font-normal text-base md:text-lg text-gray-700 whitespace-nowrap">
                      متوسط الربح اليومي
                    </span>
                    <span className="font-cairo font-semibold text-lg md:text-xl text-[#579BE8] whitespace-nowrap">
                      500 - 800 ريال
                    </span>
                  </div>
                </div>

                {/* Weekly Profit Card */}
                <div className="w-full rounded-2xl bg-[rgba(87,155,232,0.15)] p-5 mb-10">
                  <div className="flex justify-between items-center">
                    <span className="font-cairo font-normal text-base md:text-lg text-gray-700 whitespace-nowrap">
                      متوسط الربح الاسبوعي
                    </span>
                    <span 
                      className="font-cairo font-semibold text-lg md:text-xl whitespace-nowrap"
                      style={{ color: 'rgba(26, 160, 158, 1)' }}
                    >
                      3,500 - 5,600 ريال
                    </span>
                  </div>
                </div>

                {/* Watch Video Button */}
                <button className="w-full rounded-2xl py-5 text-white font-cairo font-semibold text-lg hover:opacity-90 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(90deg, #579BE8 0%, #124987 100%)' }}>
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