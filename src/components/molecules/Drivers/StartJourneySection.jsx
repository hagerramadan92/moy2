"use client";

import Image from "next/image";
import React, { useState } from "react";

export default function StartJourneySection() {
  const [showMore, setShowMore] = useState(false);
  const features = [
    {
      title: "دعم و مساعده 24/7",
      items: [
        "دعم فوري عبر الشات و الهاتف",
        "تدريب مجاني علي استخدام التطبيق",
        "حل سريع لأي مشكله تواجهك",
      ],
    },
    {
      title: "اعمل بالمرونه التي تناسبك",
      items: [
        "لا التزامات في ساعات العمل",
        "اشتغل صباحا او مساء كما تحب",
        "اداره كامله لوقتك و طلباتك",
      ],
    },
    {
      title: "تطبيق ذكي و سهل",
      items: [
        "واجهه بسيطه وواضحه",
        "اشعارات فوريه للطلبات",
        "تتبع ارباحك بشكل لحظي",
      ],
    },
  ];

  return (
    <section className="relative container py-10 sm:py-12 lg:py-14 bg-white my-6 lg:my-8 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#579BE8]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tl from-[#579BE8]/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Heading */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-14">
          <div className="inline-block mb-4">
            <span className="font-cairo font-bold text-xs sm:text-sm text-[#579BE8] bg-[#579BE8]/10 px-4 py-1.5 rounded-full">
              انضم إلينا
            </span>
          </div>
          <h1 className="font-cairo font-black text-xl sm:text-2xl lg:text-3xl text-gray-900 mb-4 leading-tight">
            <span className="text-[#579BE8]">ابدأ رحلتك معنا الآن!</span>
            <br className="hidden sm:block" />
            <span className="text-gray-700">انضم لمئات السائقين الذين يحققون دخلاً مستقراً ومجزياً</span>
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mx-auto shadow-sm"></div>
        </div>

        {/* Content Container */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 sm:gap-8 lg:gap-4">
          
          {/* Left Side - Features */}
          <div className="w-full lg:w-1/2">
            {/* Desktop Layout - Vertical Stack */}
            <div className="hidden lg:block space-y-6 lg:space-y-8">
              {features.slice(0, 2).map((feature, index) => (
                <div key={index} className="group relative bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 transition-all duration-300 hover:shadow-xl hover:border-[#579BE8]/30 hover:-translate-y-1 overflow-hidden">
                  {/* Decorative Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#579BE8]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#579BE8]/5 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Gradient Accent Bar */}
                  <div 
                    className="absolute right-0 top-0 w-1.5 h-full bg-gradient-to-b from-[#579BE8] to-[#315782] rounded-r-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  ></div>
                  
                  {/* Number Badge */}
                  <div className="absolute top-6 left-6 w-12 h-12 rounded-xl bg-gradient-to-br from-[#579BE8] to-[#315782] flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                    <span className="font-cairo font-bold text-white text-lg">{index + 1}</span>
                  </div>
                  
                  <div className="pr-6 sm:pr-8 lg:pr-10">
                    <h2 className="font-cairo font-bold text-lg lg:text-xl text-[#579BE8] mb-4 leading-tight text-right">
                      {feature.title}
                    </h2>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mb-5"></div>
                    
                    <ul className="space-y-3">
                      {feature.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3 text-right group/item">
                          <div className="relative flex-shrink-0 mt-2">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#579BE8] to-[#315782] group-hover/item:scale-125 transition-transform duration-300 shadow-sm"></div>
                            <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#579BE8] opacity-0 group-hover/item:opacity-30 group-hover/item:scale-150 transition-all duration-300"></div>
                          </div>
                          <span className="font-cairo font-normal text-sm lg:text-base text-gray-700 leading-relaxed flex-1 group-hover/item:text-[#579BE8] transition-colors duration-300">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
              
              {/* Third Feature - Hidden by default */}
              {showMore && (
                <div className="group relative bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 transition-all duration-500 hover:shadow-xl hover:border-[#579BE8]/30 hover:-translate-y-1 overflow-hidden"
                     style={{ animation: 'fadeIn 0.5s ease-out' }}>
                  {/* Decorative Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#579BE8]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#579BE8]/5 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Gradient Accent Bar */}
                  <div 
                    className="absolute right-0 top-0 w-1.5 h-full bg-gradient-to-b from-[#579BE8] to-[#315782] rounded-r-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  ></div>
                  
                  {/* Number Badge */}
                  <div className="absolute top-6 left-6 w-12 h-12 rounded-xl bg-gradient-to-br from-[#579BE8] to-[#315782] flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                    <span className="font-cairo font-bold text-white text-lg">3</span>
                  </div>
                  
                  <div className="pr-6 sm:pr-8 lg:pr-10">
                    <h2 className="font-cairo font-bold text-lg lg:text-xl text-[#579BE8] mb-4 leading-tight text-right">
                      {features[2].title}
                    </h2>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mb-5"></div>
                    
                    <ul className="space-y-3">
                      {features[2].items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3 text-right group/item">
                          <div className="relative flex-shrink-0 mt-2">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#579BE8] to-[#315782] group-hover/item:scale-125 transition-transform duration-300 shadow-sm"></div>
                            <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#579BE8] opacity-0 group-hover/item:opacity-30 group-hover/item:scale-150 transition-all duration-300"></div>
                          </div>
                          <span className="font-cairo font-normal text-sm lg:text-base text-gray-700 leading-relaxed flex-1 group-hover/item:text-[#579BE8] transition-colors duration-300">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Show More Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="font-cairo font-semibold text-sm lg:text-base text-[#579BE8] bg-[#579BE8]/10 hover:bg-[#579BE8]/20 px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
                >
                  {showMore ? "عرض أقل" : "عرض المزيد"}
                </button>
              </div>
            </div>

            {/* Mobile Layout - Horizontal Grid */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* First Column on Mobile - First two features */}
              <div className="space-y-4 sm:space-y-6">
                {features.slice(0, 2).map((feature, index) => (
                  <div key={index} className="group relative bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:border-[#579BE8]/30 overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#579BE8]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div 
                      className="absolute right-0 top-0 w-1.5 h-full bg-gradient-to-b from-[#579BE8] to-[#315782] rounded-r-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    ></div>
                    
                    {/* Number Badge */}
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-lg bg-gradient-to-br from-[#579BE8] to-[#315782] flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="font-cairo font-bold text-white text-sm">{index + 1}</span>
                    </div>
                    
                    <div className="pr-4 sm:pr-6">
                      <h2 className="font-cairo font-bold text-base sm:text-lg text-[#579BE8] mb-3 leading-tight text-right">
                        {feature.title}
                      </h2>
                      <div className="w-12 h-0.5 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mb-4"></div>
                      
                      <ul className="space-y-2.5">
                        {feature.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2.5 text-right group/item">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#579BE8] to-[#315782] mt-2 flex-shrink-0 shadow-sm"></div>
                            <span className="font-cairo font-normal text-xs sm:text-sm text-gray-700 leading-relaxed flex-1">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Second Column on Mobile - Third feature */}
              {showMore && (
                <div className="group relative bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 transition-all duration-500 hover:shadow-xl hover:border-[#579BE8]/30 overflow-hidden"
                     style={{ animation: 'fadeIn 0.5s ease-out' }}>
                  {/* Decorative Background */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#579BE8]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div 
                    className="absolute right-0 top-0 w-1.5 h-full bg-gradient-to-b from-[#579BE8] to-[#315782] rounded-r-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  ></div>
                  
                  {/* Number Badge */}
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-lg bg-gradient-to-br from-[#579BE8] to-[#315782] flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="font-cairo font-bold text-white text-sm">3</span>
                  </div>
                  
                  <div className="pr-4 sm:pr-6">
                    <h2 className="font-cairo font-bold text-base sm:text-lg text-[#579BE8] mb-3 leading-tight text-right">
                      {features[2].title}
                    </h2>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mb-4"></div>
                    
                    <ul className="space-y-2.5">
                      {features[2].items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2.5 text-right">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#579BE8] to-[#315782] mt-2 flex-shrink-0 shadow-sm"></div>
                          <span className="font-cairo font-normal text-xs sm:text-sm text-gray-700 leading-relaxed flex-1">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Show More Button - Mobile */}
              <div className="col-span-1 sm:col-span-2 flex justify-center mt-4">
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="font-cairo font-semibold text-sm text-[#579BE8] bg-[#579BE8]/10 hover:bg-[#579BE8]/20 px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
                >
                  {showMore ? "عرض أقل" : "عرض المزيد"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="w-full lg:w-[90%]">
            <div className="group relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl">
              {/* Decorative Border on Hover */}
              <div className="absolute inset-0 rounded-2xl lg:rounded-3xl border-2 border-[#579BE8]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"></div>
              
              <div className="relative w-full aspect-[850/700]">
                <Image
                  src="/Frame.png"
                  alt="سائقين يعملون معنا"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 800px"
                  priority
                />
              </div>
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#579BE8]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Corner Decorative Elements */}
              <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-[#579BE8]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-tr from-[#579BE8]/10 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>

        </div>
      </div>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}