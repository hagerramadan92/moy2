"use client";

import React from "react";

export default function StatsSection() {
  const stats = [
    { number: "+500", label: "سائق نشط" },
    { number: "15K+", label: "طلب شهر يا" },
    { number: "98%", label: "رضا السائقين" },
  ];

  return (
    <section className="flex flex-col sm:flex-row justify-center items-center px-4 sm:px-6 py-8 sm:py-12 lg:py-16 bg-white my-4 lg:my-8">
      {stats.map((stat, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center justify-center w-full sm:w-auto min-w-[200px] sm:min-w-[250px] lg:w-[359px] h-[150px] sm:h-[180px] lg:h-[200px] text-center relative px-4">
            <h3 className="text-[36px] sm:text-[44px] lg:text-[52px] font-semibold text-[#579BE8] leading-[1.2] sm:leading-[1.4] lg:leading-[1.6]">
              {stat.number}
            </h3>
            <p className="text-[18px] sm:text-[22px] lg:text-[24px] font-normal text-[#579BE8] leading-[1.2] sm:leading-[1.4] lg:leading-[1.6] mt-1 sm:mt-2">
              {stat.label}
            </p>
          </div>

          {index < stats.length - 1 && (
            <>
              {/* Vertical line for large screens */}
              <div className="hidden sm:block w-[2px] h-[100px] lg:h-[120px] self-center bg-gradient-to-b from-transparent via-[#579BE8] to-transparent mx-4 lg:mx-6"></div>
              
              {/* Horizontal line for mobile */}
              <div className="sm:hidden w-[120px] h-[2px] my-3 bg-gradient-to-r from-transparent via-[#579BE8] to-transparent"></div>
            </>
          )}
        </React.Fragment>
      ))}
    </section>
  );
}