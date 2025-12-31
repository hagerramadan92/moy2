"use client";

import Image from "next/image";
import React from "react";
import WaterTypeSelect from "../homepage/WaterTypeSelect";
import WaterSizeSelect from "../homepage/WaterSizeSelect";
import AppDownloadButtons from "../homepage/AppDownloadButtons";

export default function Cover() {
  return (
    // <div className="relative min-h-screen flex items-center">
    //   {/* Background Image */}
    //   <div className="absolute inset-0 -z-10">
    //     <img
    //       src="/cover.png"
    //       alt="Cover Background"
    //       className="object-cover w-full h-full"
    //       loading="eager"
    //     />
    //   </div>

    //   <div className="relative container mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 lg:pt-32 pb-8 sm:pb-10 md:pb-12 lg:pb-16">
    //     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 items-start">
          
    //       {/* Right Card - First on mobile, second on desktop */}
    //       <div className="order-1 lg:order-2 lg:-mt-14 xl:-mt-20">
    //         <div 
    //           className="form-left content-left rounded-[60px] border-[#FFFFFF26] border-[36.5px] shadow h-full min-h-[500px] pb-0 sm:pb-2"
    //         >
    //           <div className="bg-[#EFF5FD] rounded-4xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 h-full flex flex-col w-full max-w-[420px] lg:max-w-[480px] mx-auto">
    //             {/* Card Title */}
    //             <h2 className="font-cairo font-semibold text-lg sm:text-xl md:text-2xl text-center text-[#579BE8] mb-4 sm:mb-6 md:mb-8 mt-8 lg:mt-10">
    //               ارباحك المتوقعه
    //             </h2>

    //             {/* Daily Profit Button */}
    //             <div className="w-full rounded-xl sm:rounded-2xl bg-[rgba(87,155,232,0.15)] p-4 sm:p-5 md:p-6 mb-4 sm:mb-5">
    //               <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4"> {/* Increased gap */}
    //                 <span className="font-cairo font-normal text-[15px] text-gray-700 text-center sm:text-left whitespace-nowrap">
    //                   متوسط الربح اليومي
    //                 </span>
    //                 <span className="font-cairo font-normal text-[17px] text-[#579BE8] text-center sm:text-right text-nowrap">
    //                   500 - 800 ريال
    //                 </span>
    //               </div>
    //             </div>

    //             {/* Weekly Profit Button */}
    //             <div className="w-full rounded-xl sm:rounded-2xl bg-[rgba(87,155,232,0.15)] p-4 sm:p-5 md:p-6 mb-3 sm:mb-4 md:mb-5">
    //               <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-1"> {/* Increased gap */}
    //                 <span className="font-cairo font-normal text-[15px] text-gray-700 text-center sm:text-left whitespace-nowrap">
    //                   متوسط الربح الاسبوعي
    //                 </span>
    //                 <span
    //                   className="font-cairo font-normal text-[17px] text-center sm:text-right whitespace-nowrap"
    //                   style={{ color: 'rgba(26, 160, 158, 1)' }}
    //                 >
    //                   3500 - 5600 ريال
    //                 </span>
    //               </div>
    //             </div>

    //             {/* Video Button */}
    //             <div className="mt-2 sm:mt-3 md:mt-4 mb-6 sm:mb-8 md:mb-6 lg:mb-8">
    //               <button
    //                 className="w-full rounded-xl sm:rounded-2xl py-3 sm:py-4 md:py-5 text-white font-cairo font-medium text-base sm:text-lg md:text-xl hover:opacity-90 transition-opacity duration-300"
    //                 style={{ background: 'linear-gradient(90deg, #579BE8 0%, #124987 100%)' }}
    //               >
    //                 شاهد الفيديو التوضيحي
    //               </button>
    //             </div>
    //           </div>
    //         </div>
    //       </div>

    //       {/* Left Content - Second on mobile, first on desktop */}
    //       <div className="text-white order-2 lg:order-1 mt-0 lg:mt-12 mr-0 lg:mr-10">
    //         {/* Badge */}
            // <div className="flex items-center px-4 py-4 gap-2 max-w-[280px] bg-white/20 rounded-[24px] backdrop-blur-sm mb-4 sm:mb-6 lg:mb-8 mt-4 lg:mt-12">
            //   <Image
            //     src="/Vector (12).png"
            //     width={20}
            //     height={20}
            //     alt="Icon"
            //     className="w-5 h-5 sm:w-6 sm:h-6"
            //   />
            //   <span className="font-cairo font-medium text-lg text-white text-nowrap">
            //     انضم لاكثر من 500 سائق نشط
            //   </span>
            // </div>

    //         {/* Main Title */}
    //         <h1 className="font-cairo font-normal text-[16px] sm:text-lg md:text-xl lg:text-xl mb-3 sm:mb-4 lg:mb-6 leading-tight">
    //           احصل علي دخل اضافي من توصيل المياه
    //         </h1>

    //         {/* Description */}
    //         <div className="p-4 sm:p-6 md:p-0 mb-6 sm:mb-8 lg:mb-2">
    //           <p className="font-cairo font-medium text-[18px] sm:text-[20px] md:text-[23px] text-white/90 leading-relaxed">
    //             كن شريكا معنا و احصل علي طلبات مستمره، ارباح مجزيه، ومرونه كامله في العمل. انضم الان و ابدأ الربح من هاتفك!
    //           </p>
    //         </div>

    //         {/* App Store Buttons */}
    //         <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
    //           <button
    //             className="flex items-center justify-center px-4 py-2 rounded-xl hover:opacity-90 transition-all duration-300 w-full sm:w-auto shadow-lg"
    //             style={{
    //               background: '#1212120D',
    //               border: '1px solid #579BE8',
    //               boxShadow: '0px 8px 16px 0px #00000040'
    //             }}
    //           >
    //             <div className="flex flex-col items-center ml-2">
    //               <span className="font-cairo font-medium text-sm sm:text-base text-white/80 leading-tight">
    //                 Download on the
    //               </span>
    //               <span className="font-cairo font-medium text-sm sm:text-base text-white/80 leading-tight">
    //                 Google Play
    //               </span>
    //             </div>
    //             <Image
    //               src="/Playstore.png"
    //               width={28}
    //               height={28}
    //               alt="Google Play"
    //               className="w-7 h-7 sm:w-8 sm:h-8"
    //             />
    //           </button>

    //           <button
    //             className="flex items-center justify-center px-4 py-2 rounded-xl hover:opacity-90 transition-all duration-300 w-full sm:w-auto shadow-lg"
    //             style={{
    //               background: '#1212120D',
    //               border: '1px solid #579BE8',
    //               boxShadow: '0px 8px 16px 0px #00000040'
    //             }}
    //           >
    //             <div className="flex flex-col items-center ml-2">
    //               <span className="font-cairo font-medium text-sm sm:text-base text-white/80 leading-tight">
    //                 Download on the
    //               </span>
    //               <span className="font-cairo font-medium text-sm sm:text-base text-white/80 leading-tight">
    //                 App Store
    //               </span>
    //             </div>
    //             <Image
    //               src="/app.png"
    //               width={28}
    //               height={28}
    //               alt="App Store"
    //               className="w-7 h-7 sm:w-8 sm:h-8"
    //             />
    //           </button>
    //         </div>
    //       </div>

    //     </div>
    //   </div>
    // </div>
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
          <div className="w-full rounded-xl sm:rounded-2xl bg-[rgba(87,155,232,0.15)] p-4 sm:p-5 md:p-6 mb-4 sm:mb-5">
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
                <div className="w-full rounded-xl sm:rounded-2xl bg-[rgba(87,155,232,0.15)] p-4 sm:p-5 md:p-6 mb-3 sm:mb-4 md:mb-5">
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
          <h1 className="text-xl sm:text-2xl font-bold mb-3">احصل علي دخل اضافي من توصيل المياه</h1>
          <p className="text-lg text-gray-600 mb-4">
          كن شريكا معنا و احصل علي طلبات مستمره، ارباح مجزيه، ومرونه كامله في العمل. انضم الان و ابدأ الربح من هاتفك!
          </p>
          <AppDownloadButtons />
        </div>
      </div>
      </div>
    </div>
    </>
  );
}