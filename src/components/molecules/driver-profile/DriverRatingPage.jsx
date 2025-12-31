'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ReportDriverModal from '../../ui/ReportDriverModal'; 

const DriverRatingPage = () => {
    // State for modal visibility
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // Function to open modal
    const openReportModal = () => {
        setIsReportModalOpen(true);
    };

    // Function to close modal
    const closeReportModal = () => {
        setIsReportModalOpen(false);
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 flex items-start justify-center p-0" dir="rtl">
                {/* Main container */}
                <div className="container max-w-[1440px] min-h-[1460px] rounded-[24px] bg-white relative overflow-hidden">
                    {/* Top frame section */}
                    <div className="relative w-full h-[240px] lg:h-[369px] lg:absolute lg:top-[0px] rounded-[24px] bg-[#FFFFFF0A] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.25)] overflow-hidden">
                        {/* Gray rectangle */}
                        <div className="w-full h-[120px] lg:h-[234px] bg-[#D9D9D9]"></div>

                        {/* Profile image circle */}
                        <div className="absolute top-[60px] right-6 lg:top-[130px] lg:right-[72px] w-[100px] h-[100px] lg:w-[196px] lg:h-[196px] rounded-full border-2 lg:border-[3px] border-white bg-[#D9D9D9] shadow-lg overflow-hidden">
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                {/* Add driver image here */}
                            </div>
                        </div>

                        {/* Driver name and rating section */}
                        <div className="absolute top-[170px] right-[30px] lg:top-[260px] lg:right-[280px] flex flex-col">
                            <h1 className="font-cairo font-semibold text-xl lg:text-[32px] leading-none text-black text-nowrap mb-2 lg:mb-4">
                                ابو السعود
                            </h1>
                            
                            {/* Rating and stars */}
                            <div className="flex items-center gap-0 lg:gap-1">
                                <span className="font-cairo font-semibold text-base lg:text-[20px] leading-none text-black">
                                    4.5
                                </span>

                                {/* Empty stars */}
                                <div className="flex gap-0">
                                    {[...Array(5)].map((_, i) => (
                                        <div 
                                            key={i}
                                            className="w-5 h-5 lg:w-[28px] lg:h-[28px] flex items-center justify-center"
                                        >
                                            <span className="text-[#579BE8] text-lg lg:text-xl">☆</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Report button - Updated to open modal */}
                        <div className="absolute top-[160px] left-4 lg:top-[260px] lg:left-[51px]">
                            <button 
                                onClick={openReportModal}
                                className="w-[110px] lg:w-[127px] h-[40px] lg:h-[50px] rounded-[24px] border border-[#B70005] flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                            >
                                <span className="font-cairo font-medium text-sm lg:text-[16px] leading-none text-[#B70005]">
                                    إبلاغ
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Stats boxes section */}
                    <div className="relative w-full max-w-[800px] mx-auto mt-[60px] lg:mt-[-60px] lg:absolute lg:top-[510px] lg:left-1/2 lg:transform lg:-translate-x-1/2 px-4 lg:px-0 lg:w-[792px]">
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-[30px]">
                            
                            {/* Orders box */}
                            <div className="w-full max-w-[244px] h-[140px] lg:h-[181px] flex flex-col items-center justify-center bg-gray-100 rounded-xl border border-gray-200">
                                <div className="w-full h-[100px] lg:h-[144px] flex flex-col items-center justify-center gap-2 lg:gap-[11px]">
                                    <div className="w-12 h-10 lg:w-[50px] lg:h-[45px] flex items-center justify-center">
                                        <Image
                                            src="/car3.png"
                                            alt="Orders"
                                            width={50}
                                            height={50}
                                            className="object-contain"
                                        /> 
                                    </div>

                                    <div className="flex flex-col items-center gap-1 lg:gap-[4px]">
                                        <div className="w-[65px] h-[35px] lg:w-[89px] lg:h-[48px] flex items-center justify-center">
                                            <span className="font-cairo font-semibold text-xl lg:text-[36px] leading-none text-center text-[#579BE8]">
                                                1,342
                                            </span>
                                        </div>

                                        <div className="w-[45px] h-[22px] lg:h-[30px] flex items-center justify-center">
                                            <span className="font-cairo font-medium text-xs lg:text-[16px] leading-none text-center text-[#1C4471]">
                                                الطلبات
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Rating box */}
                            <div className="w-full max-w-[244px] h-[140px] lg:h-[181px] flex flex-col items-center justify-center bg-gray-100 rounded-xl border border-gray-200">
                                <div className="w-full h-[100px] lg:h-[144px] flex flex-col items-center justify-center gap-2 lg:gap-[11px]">
                                    <div className="w-8 h-8 lg:w-[50px] lg:h-[45px] flex items-center justify-center">
                                        <Image
                                            src="/Star 1.png"
                                            alt="Rating"
                                            width={40}
                                            height={40}
                                            className="object-contain"
                                        /> 
                                    </div>

                                    <div className="flex flex-col items-center gap-1 lg:gap-[4px]">
                                        <div className="w-[65px] h-[35px] lg:w-[89px] lg:h-[48px] flex items-center justify-center">
                                            <span className="font-cairo font-semibold text-xl lg:text-[36px] leading-none text-center text-[#579BE8]">
                                                4.5
                                            </span>
                                        </div>

                                        <div className="w-[45px] h-[22px] lg:h-[30px] flex items-center justify-center">
                                            <span className="font-cairo font-medium text-xs lg:text-[16px] leading-none text-center text-[#1C4471]">
                                                التقييم
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Likes box */}
                            <div className="w-full max-w-[244px] h-[140px] lg:h-[181px] flex flex-col items-center justify-center bg-gray-100 rounded-xl border border-gray-200">
                                <div className="w-full h-[100px] lg:h-[144px] flex flex-col items-center justify-center gap-2 lg:gap-[11px]">
                                    <div className="w-10 h-9 lg:w-[50px] lg:h-[45px] flex items-center justify-center">
                                        <Image
                                            src="/Vector (21).png"
                                            alt="Likes"
                                            width={40}
                                            height={40}
                                            className="object-contain"
                                        /> 
                                    </div>

                                    <div className="flex flex-col items-center gap-1 lg:gap-[4px]">
                                        <div className="w-[65px] h-[35px] lg:w-[89px] lg:h-[48px] flex items-center justify-center">
                                            <span className="font-cairo font-semibold text-xl lg:text-[36px] leading-none text-center text-[#579BE8]">
                                                1,342
                                            </span>
                                        </div>

                                        <div className="w-[55px] h-[22px] lg:h-[30px] flex items-center justify-center">
                                            <span className="font-cairo font-medium text-xs lg:text-[16px] leading-none text-center text-[#1C4471]">
                                                الإعجابات
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comments section */}
                    <div className="relative w-full max-w-[1300px] mx-auto mt-12 lg:mt-8 lg:absolute lg:top-[700px] lg:left-1/2 lg:transform lg:-translate-x-1/2 px-4 lg:px-0 lg:w-[1269px]">
                        <div className="flex flex-col gap-6 lg:gap-[30px]">
                            
                            {/* Section title */}
                            <div className="w-full">
                                <h2 className="font-cairo font-semibold text-lg lg:text-[24px] leading-none text-right text-black">
                                    تعليقات و تقييمات السائق
                                </h2>
                        </div>

                        {/* Comments list */}
                        <div className="flex flex-col gap-2 lg:gap-[12px]">
                            
                            {/* Comment 1 */}
                            <div className="w-full min-h-[140px] lg:h-[158.76px] rounded-2xl lg:rounded-[15.64px] border border-[#579BE8] bg-white p-3 lg:pt-[20.11px] lg:pr-[17.87px] lg:pb-[20.11px] lg:pl-[17.87px] flex flex-col gap-2 lg:gap-[15.64px]">
                                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="relative w-10 h-10 lg:w-[55.67px] lg:h-[55.67px] rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                                            <Image
                                                src="/girl.jpg"
                                                alt="Khadeeja Ahmed"
                                                width={50}
                                                height={50}
                                                className="object-contain"
                                            /> 
                                        </div>
                                        <span className="font-cairo font-medium text-sm lg:text-[20px] leading-none text-[#579BE8]">
                                            خديجة أحمد
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-6 h-6 lg:w-[22px] lg:h-[22px] rounded flex items-center justify-center bg-white">
                                            <span className="text-[#579BE8] text-sm">★</span>
                                        </div>
                                        <span className="font-cairo font-semibold text-sm lg:text-[20px] leading-none text-black">
                                            3.9
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full">
                                    <p className="font-cairo font-light text-xs lg:text-[13.4px] leading-relaxed text-right text-black">
                                        السائق كان محترم ووصلني بسلام، لكن القيادة كانت سريعة شوي والتكييف ما كان مضبوط. التجربة بشكل عام جيدة
                                    </p>
                                </div>
                            </div>

                            {/* Comment 2 */}
                            <div className="w-full min-h-[140px] lg:h-[158.76px] rounded-2xl lg:rounded-[15.64px] border border-[#579BE8] bg-white p-3 lg:pt-[20.11px] lg:pr-[17.87px] lg:pb-[20.11px] lg:pl-[17.87px] flex flex-col gap-2 lg:gap-[15.64px]">
                                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="relative w-10 h-10 lg:w-[55.67px] lg:h-[55.67px] rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                                            <Image
                                                src="/girl.jpg"
                                                alt="Khadeeja Ahmed"
                                                width={50}
                                                height={50}
                                                className="object-contain"
                                            />      
                                        </div>
                                        <span className="font-cairo font-medium text-sm lg:text-[20px] leading-none text-[#579BE8]">
                                            خديجة أحمد
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-6 h-6 lg:w-[18px] lg:h-[18px] rounded flex items-center justify-center bg-white">
                                            <span className="text-[#579BE8] text-sm">★</span>
                                        </div>
                                        <span className="font-cairo font-semibold text-sm lg:text-[20px] leading-none text-black">
                                            4.2
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full">
                                    <p className="font-cairo font-light text-xs lg:text-[13.4px] leading-relaxed text-right text-black">
                                        السائق كان محترم ووصلني بسلام، لكن القيادة كانت سريعة شوي والتكييف ما كان مضبوط. التجربة بشكل عام جيدة
                                    </p>
                                </div>
                            </div>

                            {/* Comment 3 */}
                            <div className="w-full min-h-[140px] lg:h-[158.76px] rounded-2xl lg:rounded-[15.64px] border border-[#579BE8] bg-white p-3 lg:pt-[20.11px] lg:pr-[17.87px] lg:pb-[20.11px] lg:pl-[17.87px] flex flex-col gap-2 lg:gap-[15.64px]">
                                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="relative w-10 h-10 lg:w-[55.67px] lg:h-[55.67px] rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                                            <Image
                                                src="/girl.jpg"
                                                alt="Khadeeja Ahmed"
                                                width={50}
                                                height={50}
                                                className="object-contain"
                                            /> 
                                        </div>
                                        <span className="font-cairo font-medium text-sm lg:text-[20px] leading-none text-[#579BE8]">
                                            خديجة أحمد
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-6 h-6 lg:w-[18px] lg:h-[18px] rounded flex items-center justify-center bg-white">
                                            <span className="text-[#579BE8] text-sm">★</span>
                                        </div>
                                        <span className="font-cairo font-semibold text-sm lg:text-[20px] leading-none text-black">
                                            4.5
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full">
                                    <p className="font-cairo font-light text-xs lg:text-[13.4px] leading-relaxed text-right text-black">
                                        السائق كان محترم ووصلني بسلام، لكن القيادة كانت سريعة شوي والتكييف ما كان مضبوط. التجربة بشكل عام جيدة
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

            {/* Report Driver Modal */}
            <ReportDriverModal 
                isOpen={isReportModalOpen}
                onClose={closeReportModal}
            />
        </>
    );
};

export default DriverRatingPage;