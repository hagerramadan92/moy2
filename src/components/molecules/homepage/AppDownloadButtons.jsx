"use client";

import Image from "next/image";
import React from "react";

export default function AppDownloadButtons({ className = "" }) {
  return (
    <div className={`flex items-stretch sm:items-center gap-3 sm:gap-4 ${className}`}>
      {/* Google Play */}
      <button className="flex flex-row-reverse items-center justify-start gap-2 sm:gap-3 px-3   py-2  rounded-lg  border cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto text-white border-[#94c5f8] bg-gradient-to-r from-[#579BE8] to-[#124987]">
        <Image
          src="/images/Playstore.png"
          width={28}
          height={34}
          alt="Google Play"
          className="w-6 h-7  flex-shrink-0"
        />
        <div className="text-right">
          <p className="text-[10px] sm:text-xs leading-tight">Download on</p>
          <p className="text-xs font-semibold leading-tight">Google Play</p>
        </div>
      </button>

      {/* App Store */}
      <button className="flex flex-row-reverse items-center justify-start gap-2 sm:gap-3 px-3   py-2  rounded-lg  border shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto text-white border-[#94c5f8] bg-gradient-to-r from-[#579BE8] to-[#124987]">
        <Image
          src="/images/app.png"
          width={28}
          height={34}
          alt="App Store"
          className="w-6 h-7  flex-shrink-0"
        />
        <div className="text-right">
          <p className="text-[10px] sm:text-xs leading-tight">Download on</p>
          <p className="text-xs  font-semibold leading-tight">App Store</p>
        </div>
      </button>
    </div>
  );
}

