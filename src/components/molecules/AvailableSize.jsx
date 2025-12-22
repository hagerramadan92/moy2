"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useState, useEffect, useCallback } from "react";

export default function AvailableSize() {
  const [api, setApi] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!api) return;

    // تحديث الفهرس الحالي عند التمرير
    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect(); // تحديث الفهرس الأولي

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Auto-play يدوي
  useEffect(() => {
    if (!autoPlay || !api) return;

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0); // العودة للبداية
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [api, autoPlay]);

  // تحديد إذا كان الكارت في المنتصف
  const isCenterCard = (index) => {
    return index === currentIndex;
  };

  // تحديد إذا كان الكارت على الجانبين
  const isSideCard = (index) => {
    return Math.abs(index - currentIndex) === 1;
  };

  // إيقاف Auto-play عند التفاعل
  const handleInteraction = useCallback(() => {
    setAutoPlay(false);
    // إعادة تشغيل Auto-play بعد 10 ثواني من عدم التفاعل
    setTimeout(() => setAutoPlay(true), 10000);
  }, []);

  return (
    <section dir="rtl" className="py-12 sm:py-16 md:py-20 bg-white overflow-hidden">
      <h2 className="text-center text-2xl sm:text-2.5xl md:text-3xl font-bold text-[#5A9CF0] mb-10 sm:mb-12 md:mb-14">
        السعات المتاحة
      </h2>

      <div className="relative max-w-6xl mx-auto px-4">
        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            direction: "rtl",
            loop: true,
            skipSnaps: false,
            watchDrag: true,
          }}
          className="w-full"
          onMouseEnter={handleInteraction}
          onTouchStart={handleInteraction}
        >
          <CarouselContent className="ml-0">
            {[1, 2, 3, 4, 5].map((item, index) => (
              <CarouselItem
                key={item}
                className={`
                  pl-4 md:pl-6
                  basis-10/12 sm:basis-8/12 md:basis-6/12 lg:basis-4/12
                  transition-all duration-700 ease-out
                  ${isCenterCard(index) ? 'z-30' : isSideCard(index) ? 'z-20' : 'z-10'}
                `}
              >
                <div
                  className={`
                    relative rounded-2xl bg-white p-5 sm:p-6 text-center
                    border-2 transition-all duration-700 ease-out
                    transform-gpu
                    ${isCenterCard(index) 
                      ? 'border-[#5A9CF0] border-3 scale-100 opacity-100 shadow-[0_0_0_4px_rgba(90,156,240,0.4),0_30px_70px_rgba(90,156,240,0.35)]' 
                      : isSideCard(index)
                      ? 'border-[#5A9CF0]/40 scale-95 opacity-80 shadow-[0_10px_40px_rgba(90,156,240,0.2)]'
                      : 'border-gray-200 scale-90 opacity-50 shadow-[0_5px_20px_rgba(0,0,0,0.05)]'
                    }
                    hover:scale-105 hover:shadow-[0_20px_60px_rgba(90,156,240,0.3)] hover:border-[#5A9CF0]/60
                    cursor-pointer
                  `}
                  onClick={() => {
                    if (api) {
                      api.scrollTo(index);
                      handleInteraction();
                    }
                  }}
                >
                  {/* شارة الأكثر طلباً على الكارت الثالث فقط */}
                  {item === 3 && isCenterCard(index) && (
                    <span className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs sm:text-sm px-3 sm:px-4 py-1 rounded-full z-40 animate-pulse shadow-lg">
                      ⭐ الأكثر طلبًا
                    </span>
                  )}

                  {/* تأثير إشعاع خلف الكارت المختار */}
                  {isCenterCard(index) && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-50/30 to-cyan-50/30 -z-10" />
                  )}

                  {/* الصورة مع تأثيرات مختلفة حسب المركز */}
                  <div className={`
                    relative mx-auto mb-4 transition-all duration-700
                    ${isCenterCard(index) ? 'scale-110' : isSideCard(index) ? 'scale-100' : 'scale-90'}
                  `}>
                    <Image
                      src="/images/car.png"
                      alt={`شاحنة ${item} طن`}
                      width={260}
                      height={160}
                      className={`
                        mx-auto w-full max-w-[220px] sm:max-w-[260px] h-auto
                        transition-all duration-700
                        ${isCenterCard(index) ? 'brightness-100' : 'brightness-90'}
                      `}
                    />
                    {/* تأثير تألق على الصورة المختارة */}
                    {isCenterCard(index) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-100/20 to-transparent rounded-lg" />
                    )}
                  </div>

                  <h3 className={`
                    mt-4 sm:mt-6 text-xl sm:text-2xl font-bold transition-all duration-700
                    ${isCenterCard(index) ? 'text-[#5A9CF0] text-2xl sm:text-3xl' : 'text-gray-800'}
                  `}>
                    {item === 1 && "3 طن"}
                    {item === 2 && "5 طن"}
                    {item === 3 && "6 طن"}
                    {item === 4 && "8 طن"}
                    {item === 5 && "10 طن"}
                  </h3>

                  <p className={`
                    text-gray-500 text-sm sm:text-base mt-2 transition-all duration-700
                    ${isCenterCard(index) ? 'text-gray-700 font-medium' : 'text-gray-500'}
                  `}>
                    {item === 1 && "مناسب للاستخدامات الصغيرة"}
                    {item === 2 && "مناسب للاستخدامات المتوسطة"}
                    {item === 3 && "مناسب للاستخدامات الكبيرة"}
                    {item === 4 && "مناسب للمشاريع المتوسطة"}
                    {item === 5 && "مناسب للمشاريع الكبيرة"}
                  </p>

                  <p className={`
                    mt-3 sm:mt-4 font-semibold text-base sm:text-lg transition-all duration-700
                    ${isCenterCard(index) 
                      ? 'text-[#5A9CF0] text-lg sm:text-xl font-bold' 
                      : 'text-[#5A9CF0]/70'
                    }
                  `}>
                    {item === 1 && "يبدأ من 120 ريال"}
                    {item === 2 && "يبدأ من 180 ريال"}
                    {item === 3 && "يبدأ من 240 ريال"}
                    {item === 4 && "يبدأ من 320 ريال"}
                    {item === 5 && "يبدأ من 400 ريال"}
                  </p>

                  <button 
                    className={`
                      mt-4 sm:mt-6 w-full rounded-xl py-2.5 sm:py-3 
                      transition-all duration-500 ease-out
                      font-semibold
                      ${isCenterCard(index) 
                        ? 'bg-gradient-to-r from-[#5A9CF0] to-[#3A7CD0] text-white shadow-lg hover:shadow-xl hover:scale-[1.02]' 
                        : isSideCard(index)
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-500'
                      }
                      transform-gpu
                    `}
                    onClick={(e) => {
                      e.stopPropagation(); // منع حدث النقر من الانتشار للكارت
                      handleInteraction();
                    }}
                  >
                    {isCenterCard(index) ? '🚀 اطلب الآن' : 'اطلب الآن'}
                  </button>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* أزرار التنقل مع تحسينات */}
          <div className="hidden sm:block">
            <CarouselPrevious 
              className="
                absolute right-[-40px] sm:right-[-50px] md:right-[-60px] 
                top-1/2 transform -translate-y-1/2
                border-2 border-[#5A9CF0] text-[#5A9CF0] 
                bg-white hover:bg-[#5A9CF0] hover:text-white hover:border-[#5A9CF0]
                w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg
                transition-all duration-300
              "
              onClick={handleInteraction}
            />
            <CarouselNext 
              className="
                absolute left-[-40px] sm:left-[-50px] md:left-[-60px] 
                top-1/2 transform -translate-y-1/2
                border-2 border-[#5A9CF0] text-[#5A9CF0] 
                bg-white hover:bg-[#5A9CF0] hover:text-white hover:border-[#5A9CF0]
                w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg
                transition-all duration-300
              "
              onClick={handleInteraction}
            />
          </div>
        </Carousel>

        {/* مؤشرات الصفحات */}
        <div className="flex justify-center mt-8 sm:mt-10 space-x-2">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (api) {
                  api.scrollTo(index);
                  handleInteraction();
                }
              }}
              className={`
                w-3 h-3 rounded-full transition-all duration-500 ease-out
                ${isCenterCard(index) 
                  ? 'bg-[#5A9CF0] w-8 scale-110' 
                  : isSideCard(index)
                  ? 'bg-[#5A9CF0]/40 w-4'
                  : 'bg-gray-300 w-2'
                }
              `}
              aria-label={`انتقل إلى البطاقة ${index + 1}`}
            />
          ))}
        </div>

        {/* زر التحكم في Auto-play */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className="text-sm text-gray-600 hover:text-[#5A9CF0] flex items-center gap-2 transition-colors"
          >
            {autoPlay ? (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                التشغيل التلقائي: نشط
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                التشغيل التلقائي: متوقف
              </>
            )}
          </button>
        </div>
      </div>

    </section>
  );
}