'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ArticleCard = ({ 
  id,
  imageUrl = "/man.png",
  category = "الصحة",
  title = "فوائد شرب الماء للجسم والصحة العامة",
  description = "تعرف على أهمية شرب الماء يومياً وكيف يؤثر على صحتك ونشاطك اليومي...",
  author = "د. عماد حسن",
  date = "6 ديسمبر 2025",
  readTime = "5 دقائق",
  personIconUrl = "/person.png",
  calendarIconUrl = "/calender.png",
  timeIconUrl = "/time2.png"
}) => {
  return (
    <Link href={`/articles/${id}`} className="block">
      <div className="w-full max-w-[555.48px] h-[509.55px] bg-white 
                     shadow-[0px_4.37383px_4.37383px_rgba(0,0,0,0.25)] 
                     rounded-[26.243px] overflow-hidden relative
                     hover:shadow-[0px_8px_16px_rgba(0,0,0,0.15)]
                     transition-shadow duration-300 cursor-pointer">
        
        <div className="relative w-full h-[254.78px] overflow-hidden border-b-[8.75px] border-[#579BE8]">
          <div className="absolute w-[619.99px] h-[619.99px] left-[-33.9px] top-[-120.28px]">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 619.99px"
            />
          </div>
        </div>

        <button 
          className="absolute top-[274.46px] right-[27.91px] 
                    w-[61.98px] h-[28.37px] 
                    rounded-[13.65px] 
                    p-[5.69px] 
                    flex items-center justify-center gap-[5.69px]
                    hover:opacity-90 transition-opacity"
          style={{
            background: 'rgba(87, 155, 232, 0.5)',
          }}
        >
          <span className="font-cairo font-semibold text-[9.1px] leading-[100%] text-center text-white">
            {category}
          </span>
        </button>

        {/* title */}
        <div className="absolute top-[321.48px] right-[27.47px] w-[329px]">
          <h3 className="font-cairo font-semibold text-[21.87px] leading-[120%] text-right text-[#579BE8] tracking-[-0.76px] 
                        overflow-hidden
                        line-clamp-2 md:line-clamp-1
                        md:whitespace-nowrap md:overflow-visible
                        pb-3 md:pb-0">
            {title}
          </h3>
        </div>

        {/* description */}
        <div className="absolute top-[375px] md:top-[361.94px] right-[26.76px] w-[415px]">
          <p className="font-cairo font-normal text-[15.31px] leading-[140%] md:leading-[100%] text-right text-[#757575] tracking-[-0.76px] 
                       overflow-hidden
                       line-clamp-2 md:line-clamp-1
                       md:whitespace-nowrap md:overflow-visible
                       pt-1 md:pt-0">
            {description}
          </p>
        </div>

        {/*  Line */}
        <div className="absolute top-[415px] md:top-[403.49px] left-1/2 transform -translate-x-1/2 w-[500.8px] h-[0px] mt-2">
          <div className="w-full border-t-[0.87px] border-[#579BE8]"></div>
        </div>

        <div className="absolute top-[435px] md:top-[419.89px] right-[27.91px] w-auto h-[28.43px] flex items-center gap-[4.37px]" dir="rtl">
          <div className="relative w-[28.43px] h-[28.43px] flex-shrink-0">
            <Image
              src={personIconUrl}
              alt="person"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-cairo font-semibold text-[13.12px] leading-[25px] text-[#979797] whitespace-nowrap">
            {author}
          </span>
        </div>

        <div className="absolute top-[470px] md:top-[455.97px] right-[27.91px] w-auto h-[26.24px] flex items-center gap-[4.37px]" dir="rtl">
          <div className="relative w-[26.24px] h-[26.24px] flex-shrink-0">
            <Image
              src={calendarIconUrl}
              alt="calendar"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-cairo font-semibold text-[13.12px] leading-[25px] text-[#979797] whitespace-nowrap">
            {date}
          </span>
        </div>

        <div className="absolute top-[435px] md:top-[420.98px] left-[27.91px] w-auto h-[26.24px] flex items-center gap-[4.37px]">
          <div className="relative w-[26.24px] h-[26.24px] flex-shrink-0">
            <Image
              src={timeIconUrl}
              alt="time"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-cairo font-semibold text-[13.12px] leading-[25px] text-[#979797] whitespace-nowrap">
            {readTime}
          </span>
        </div>

      </div>
    </Link>
  );
};

export default ArticleCard;


