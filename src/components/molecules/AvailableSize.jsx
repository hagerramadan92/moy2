"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { IoIosArrowForward } from "react-icons/io";
export default function AvailableSize() {
  const [api, setApi] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!autoPlay || !api) return;

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [api, autoPlay]);

  const isCenterCard = (index) => {
    return index === currentIndex;
  };

  const isSideCard = (index) => {
    return Math.abs(index - currentIndex) === 1;
  };

  const handleInteraction = useCallback(() => {
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  }, []);

  const scrollNext = useCallback(() => {
    if (api) {
      api.scrollNext();
      handleInteraction();
    }
  }, [api, handleInteraction]);

  const scrollPrev = useCallback(() => {
    if (api) {
      api.scrollPrev();
      handleInteraction();
    }
  }, [api, handleInteraction]);

  return (
    <section dir="rtl" className="py-12 sm:py-16 md:py-20 bg-white ">
      <div className="container px-4 ">
        <h2 className="text-center text-2xl sm:text-2.5xl md:text-3xl font-bold text-[#5A9CF0] mb-10 sm:mb-12 md:mb-14">
          السعات المتاحة
        </h2>

        <div className="relative  sm:px-4 mx-auto ">
          <div className="relative px-8">
            <Carousel
              setApi={setApi}
              opts={{
                align: "center",
                direction: "rtl",
                loop: true,
                skipSnaps: false,
                watchDrag: true,
                duration: 20,
              }}
              className="w-full "
              onMouseEnter={handleInteraction}
              onTouchStart={handleInteraction}
            >
              <CarouselContent className="ml-0 -mr-4 h-[512px] ">
                {[1, 2, 3, 4, 5].map((item, index) => (
                  <CarouselItem
                    key={item}
                    className={`
                      pr-4
                      basis-full sm:basis-2/3 md:basis-1/2 lg:basis-1/3
                      transition-all duration-300 ease-out
                      ${isCenterCard(index) ? "z-10" : "z-0"}
                    `}
                  >
                    <div
                      className={`
                        relative rounded-2xl bg-white p-4 sm:p-5 text-center
                        border-2 transition-all duration-300 ease-out
                        flex flex-col  w-[382.75457763671875px] h-[481.4996032714844px]
                        ${
                          isCenterCard(index)
                            ? "border-[#5A9CF0] scale-100 opacity-100 shadow-lg"
                            : isSideCard(index)
                            ? "border-[#5A9CF0]/20 scale-95 opacity-90 shadow-md"
                            : "opacity-0 scale-90 pointer-events-none"
                        }
                        hover:shadow-xl hover:scale-[1.02]
                      `}
                      onClick={() => {
                        if (api) {
                          api.scrollTo(index);
                          handleInteraction();
                        }
                      }}
                    >
                      {item === 3 && isCenterCard(index) && (
                        <span className="absolute top-3  right-3 bg-linear-to-b from-[#E9BD85] to-[#F48C06] text-white text-[15.88px] px-3 py-2 rounded-full z-10">
                          الأكثر طلبًا
                        </span>
                      )}

                      {/* المحتوى */}
                      <div className="flex-1 flex flex-col justify-center">
                        <div
                          className={`
                          mb-4 transition-all duration-300 w-[290.8114318847656px] h-[200.23081970214844px]
                          ${isCenterCard(index) ? "scale-105" : "scale-95"}
                        `}
                        >
                          <Image
                            src="/images/car.png"
                            alt={`شاحنة ${item} طن`}
                            width={220}
                            height={140}
                            className={`
                              mx-auto w-full max-w-[200px] sm:max-w-[220px] h-auto
                              transition-all duration-300 
                            `}
                          />
                        </div>

                        <h3
                          className={`
                          text-lg sm:text-[34.29px] font-bold mb-2 transition-all duration-300
                          ${
                            isCenterCard(index)
                              ? "text-black"
                              : "opacity-70"
                          }
                        `}
                        >
                          {item === 1 && "3 طن"}
                          {item === 2 && "5 طن"}
                          {item === 3 && "6 طن"}
                          {item === 4 && "8 طن"}
                          {item === 5 && "10 طن"}
                        </h3>

                        <p className="text-[#000000A6] text-[16.03px]  mb-3">
                          {item === 1 && "مناسب للاستخدامات الصغيرة"}
                          {item === 2 && "مناسب للاستخدامات المتوسطة"}
                          {item === 3 && "مناسب للاستخدامات الكبيرة"}
                          {item === 4 && "مناسب للمشاريع المتوسطة"}
                          {item === 5 && "مناسب للمشاريع الكبيرة"}
                        </p>

                        <p
                          className={`
                          font-semibold text-base sm:text-[20.58px] mb-0 transition-all duration-300
                          ${
                            isCenterCard(index)
                              ? "text-[#5A9CF0]"
                              : "text-[#5A9CF0]/70"
                          }
                        `}
                        >
                          {item === 1 && "يبدأ من 120 ريال"}
                          {item === 2 && "يبدأ من 180 ريال"}
                          {item === 3 && "يبدأ من 240 ريال"}
                          {item === 4 && "يبدأ من 320 ريال"}
                          {item === 5 && "يبدأ من 400 ريال"}
                        </p>
                      </div>

                      <Button
                        className={`
                          w-full rounded-xl py-6 
                          transition-all duration-300
                          font-semibold text-base
                          ${
                            isCenterCard(index)
                              ? "bg-[#5A9CF0] text-white hover:bg-[#4278be]"
                              : "bg-[#579BE8] text-white hover:bg-[#4278be]"
                          }
                          mt-auto
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInteraction();
                        }}
                      >
                        {"اطلب الآن"}
                      </Button>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            <div className="absolute inset-y-0 left-5 right-0 flex items-center justify-between pointer-events-none z-20">
              <div className="pointer-events-auto absolute right-0 transform translate-x-1/2">
                <Button
                  variant="outline"
                  className="
                          w-10 h-10
                          cursor-pointer
                          rounded-full 
                          bg-white hover:bg-[#5A9CF0] 
                          border-0 
                          text-[#5A9CF0] hover:text-white
                          transition-all duration-300
                          hover:scale-110
                          p-0
                        "
                  onClick={scrollNext}
                >
                  <span className="scale-150">
                    <IoIosArrowForward  className="w-5 h-5 sm:w-6 sm:h-6" />
                  </span>

                  <span className="sr-only">الكارت التالي</span>
                </Button>
              </div>

              <div className="pointer-events-auto absolute left-0 transform -translate-x-1/2">
                <Button
               
                  className="
                   w-10 h-10
                          cursor-pointer
                          rounded-full 
                          bg-white hover:bg-[#5A9CF0] 
                          border-0 
                          text-[#5A9CF0] hover:text-white
                          transition-all duration-300
                          hover:scale-110
                          p-0
                  "
                  onClick={scrollPrev}
                >
                    <span className="scale-150">
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />

                    </span>
                  <span className="sr-only">الكارت السابق</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
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
                  w-2 h-2 rounded-full transition-all duration-300
                  ${isCenterCard(index) ? "bg-[#5A9CF0] w-6" : "bg-gray-300"}
                `}
                aria-label={`انتقل إلى البطاقة ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
