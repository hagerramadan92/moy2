"use client";

import Image from "next/image";
import { motion } from "framer-motion";
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
  const [currentIndex, setCurrentIndex] = useState(1);
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    // Start from second card (index 1)
    api.scrollTo(1, false);
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
    setTimeout(() => setAutoPlay(false), 10000);
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
    <section dir="rtl" className="py-8 sm:py-12 container mx-auto md:py-16 lg:py-20 bg-white">
      <div className=" px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8 md:mb-10"
        >
          <div className="inline-block mb-2 md:mb-3">
            <span className="text-xs md:text-sm font-bold text-[#579BE8] bg-[#579BE8]/10 px-3 py-1.5 rounded-full">
              السعات المتاحة
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-2 md:mb-3 leading-tight">
            <span className="block text-[#579BE8]">اختر السعة المناسبة لك</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mx-auto"></div>
        </motion.div>

        <div className="relative mx-auto">
          <div className="relative px-4 sm:px-6 md:px-8 lg:px-12">
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
              className="w-full"
              onMouseEnter={handleInteraction}
              onTouchStart={handleInteraction}
            >
              <CarouselContent className="ml-0 -mr-1
               sm:-mr-2 min-h-[500px] sm:min-h-[450px] md:min-h-[480px] lg:min-h-[512px]">
                {[1, 2, 3, 4, 5].map((item, index) => (
                  <CarouselItem
                    key={item}
                    className={`
                      pr-1 sm:pr-2
                      basis-full sm:basis-2/3 md:basis-1/2 lg:basis-1/3
                      transition-all duration-300 ease-out
                      ${isCenterCard(index) ? "z-10" : "z-0"}
                    `}
                  >
                    <div
                      className={`
                        relative rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 md:p-5 text-center
                        border-2 transition-all duration-300 ease-out
                        flex flex-col w-full max-w-[300px] sm:max-w-[350px] md:max-w-[380px] mx-auto
                        min-h-[380px] sm:min-h-[420px] md:min-h-[460px] lg:h-[481px]
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
                        <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gradient-to-b from-[#E9BD85] to-[#F48C06] text-white text-xs sm:text-sm md:text-base px-2 py-1 sm:px-3 sm:py-2 rounded-full z-10">
                          الأكثر طلبًا
                        </span>
                      )}

                      {/* المحتوى */}
                      <div className="flex-1 flex flex-col justify-center py-2 sm:py-4">
                        <div
                          className={`
                          mb-3 sm:mb-4 transition-all duration-300 w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] mx-auto
                          ${isCenterCard(index) ? "scale-105" : "scale-95"}
                        `}
                        >
                          <Image
                            src="/images/car.png"
                            alt={`شاحنة ${item} طن`}
                            width={220}
                            height={140}
                            className="mx-auto w-full h-auto transition-all duration-300"
                          />
                        </div>

                        <h3
                          className={`
                          text-base sm:text-xl md:text-2xl lg:text-[34.29px] font-bold mb-2 sm:mb-3 transition-all duration-300
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

                        <p className="text-[#000000A6] text-sm sm:text-base md:text-[16.03px] mb-2 sm:mb-3">
                          {item === 1 && "مناسب للاستخدامات الصغيرة"}
                          {item === 2 && "مناسب للاستخدامات المتوسطة"}
                          {item === 3 && "مناسب للاستخدامات الكبيرة"}
                          {item === 4 && "مناسب للمشاريع المتوسطة"}
                          {item === 5 && "مناسب للمشاريع الكبيرة"}
                        </p>

                        <p
                          className={`
                          font-semibold text-sm sm:text-base md:text-lg lg:text-[20.58px] mb-0 transition-all duration-300
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
                          w-full rounded-lg sm:rounded-xl py-3 sm:py-4 md:py-5 lg:py-6 
                          transition-all duration-300
                          font-semibold text-sm sm:text-base
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

            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none z-20">
              <div className="pointer-events-auto absolute right-0 sm:right-2 md:right-4 transform translate-x-1/2 sm:translate-x-0">
                <Button
                  variant="outline"
                  className="
                          w-8 h-8 sm:w-10 sm:h-10
                          cursor-pointer
                          rounded-full 
                          bg-white hover:bg-[#5A9CF0] 
                          border-0 
                          text-[#5A9CF0] hover:text-white
                          transition-all duration-300
                          hover:scale-110
                          p-0
                          shadow-md
                        "
                  onClick={scrollNext}
                >
                  <span className="scale-150">
                    <IoIosArrowForward className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </span>
                  <span className="sr-only">الكارت التالي</span>
                </Button>
              </div>

              <div className="pointer-events-auto absolute left-0 sm:left-2 md:left-4 transform -translate-x-1/2 sm:translate-x-0">
                <Button
                  className="
                          w-8 h-8 sm:w-10 sm:h-10
                          cursor-pointer
                          rounded-full 
                          bg-white hover:bg-[#5A9CF0] 
                          border-0 
                          text-[#5A9CF0] hover:text-white
                          transition-all duration-300
                          hover:scale-110
                          p-0
                          shadow-md
                  "
                  onClick={scrollPrev}
                >
                  <span className="scale-150">
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </span>
                  <span className="sr-only">الكارت السابق</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center  mt-6 sm:mt-8 gap-2">
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
                  h-2 rounded-full transition-all duration-300
                  ${isCenterCard(index) ? "bg-[#5A9CF0] w-6 sm:w-8" : "bg-gray-300 w-2"}
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
