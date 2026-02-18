"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { useState, useEffect } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { ChevronLeft } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useRouter } from 'next/navigation';
import LoginFlowDialog from '@/components/molecules/order-now/LoginFlowDialog';
import { waterApi } from "@/utils/api";


export default function AvailableSize() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swiper, setSwiper] = useState(null);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const isCenterCard = (index) => {
    return index === currentIndex;
  };

  const isSideCard = (index) => {
    return Math.abs(index - currentIndex) === 1;
  };

  const scrollNext = () => {
    if (swiper) {
      swiper.slideNext();
    }
  };

  const scrollPrev = () => {
    if (swiper) {
      swiper.slidePrev();
    }
  };

  const goToSlide = (index) => {
    if (swiper) {
      swiper.slideTo(index);
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        // استخدام الرابط مباشرة هنا
        const response = await fetch('https://moya.talaaljazeera.com/api/v1/services');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (!mounted) return;

        if (data?.status && Array.isArray(data.data)) {
          setServices(data.data);
        } else {
          setServices([]);
          setError(data?.message || "فشل تحميل السعات");
        }
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("فشل تحميل السعات");
        setServices([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchServices();

    return () => {
      mounted = false;
    };
  }, []); // لا توجد dependencies لأننا نريد جلب البيانات مرة واحدة فقط


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
          <h2 className="text-xl sm:text-2xl md:text-3xl  font-black text-gray-900 mb-2 md:mb-3 leading-tight">
            <span className="block text-[#579BE8]">اختر السعة اللي تحتاجها</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mx-auto"></div>
        </motion.div>

        <div className="relative mx-auto">
          <div className="relative px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12">
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[360px] sm:min-h-[400px] md:min-h-[440px] lg:min-h-[481px] gap-4">
                <Spinner size="lg" />
                {/* <p className="text-gray-700 text-sm sm:text-base">جاري التحميل...</p> */}
              </div>
            ) : error ? (
              <div className="flex items-center justify-center min-h-[360px] sm:min-h-[400px] md:min-h-[440px] lg:min-h-[481px] px-4">
                <p className="text-red-600 text-sm sm:text-base text-center">خطأ في تحميل البيانات: {error}</p>
              </div>
            ) : services.length === 0 ? (
              <div className="flex items-center justify-center min-h-[360px] sm:min-h-[400px] md:min-h-[440px] lg:min-h-[481px]">
                <p className="text-gray-700 text-sm sm:text-base">لا توجد خدمات متاحة</p>
              </div>
            ) : (
              <Swiper
                onSwiper={setSwiper}
                modules={[Navigation]}
                spaceBetween={12}
                slidesPerView={1}
                breakpoints={{
                  480: {
                    slidesPerView: 1.5,
                    spaceBetween: 16,
                  },
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                  },
                  768: {
                    slidesPerView: 2.5,
                    spaceBetween: 24,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 24,
                  },
                }}
                loop={services.length > 3}
                centeredSlides={true}
                initialSlide={Math.min(3, services.length - 1)}
                onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
                navigation={{
                  nextEl: '.swiper-button-next-custom',
                  prevEl: '.swiper-button-prev-custom',
                }}
                className="!pb-8 min-h-[400px] sm:min-h-[450px] md:min-h-[480px] lg:min-h-[512px]"
                dir="rtl"
              >
                {services.map((service, index) => {
                  // Extract service data from API
                  const serviceId = service.id || service._id || index;
                  const capacity = service.name || `${index + 1} طن`;
                  const description = service.description || service.title || "مناسب للاستخدامات المختلفة";
                  const price = service.start_price || service.starting_price || service.price || service.cost || 120;
                  const image = service.image || service.image_url || "/images/car.png";
                  const isPopular = service.is_popular || service.most_requested || index === 2;
                  
                  return (
                    <SwiperSlide key={serviceId}>
                      <div
                        className={`
                          relative rounded-lg sm:rounded-xl md:rounded-2xl bg-white p-3 sm:p-4 md:p-5 text-center
                          border-2 transition-all duration-300 ease-out
                          flex flex-col w-full max-w-[280px] sm:max-w-[320px] md:max-w-[350px] lg:max-w-[380px] mx-auto
                          min-h-[360px] sm:min-h-[400px] md:min-h-[440px] lg:min-h-[481px]
                          ${
                            isCenterCard(index)
                              ? "border-[#5A9CF0] scale-100 opacity-100 shadow-lg"
                              : isSideCard(index)
                              ? "border-[#5A9CF0]/20 scale-95 opacity-90 shadow-md"
                              : "border-gray-200 scale-90 opacity-80"
                          }
                          hover:shadow-xl hover:scale-[1.02] cursor-pointer
                        `}
                        onClick={() => goToSlide(index)}
                      >
                        {isPopular && isCenterCard(index) && (
                          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gradient-to-b from-[#E9BD85] to-[#F48C06] text-white text-xs sm:text-sm md:text-base px-2 py-1 sm:px-3 sm:py-2 rounded-full z-10">
                            الأكثر طلبًا
                          </span>
                        )}

                        {/* المحتوى */}
                        <div className="flex-1 flex flex-col justify-center py-2 sm:py-4">
                          <div
                            className={`
                            mb-2 sm:mb-3 md:mb-4 transition-all duration-300 w-full max-w-[140px] sm:max-w-[180px] md:max-w-[200px] lg:max-w-[220px] mx-auto
                            ${isCenterCard(index) ? "scale-105" : "scale-95"}
                          `}
                          >
                            <Image
                              src={image}
                              alt={`شاحنة ${capacity}`}
                              width={220}
                              height={140}
                              className="mx-auto w-full h-auto transition-all duration-300"
                              onError={(e) => {
                                e.target.src = "/images/car.png";
                              }}
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
                            {capacity}
                          </h3>

                          <p className="text-[#000000A6] text-sm sm:text-base md:text-[16.03px] mb-2 sm:mb-3">
                            {description}
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
                            {typeof price === 'number' ? `يبدأ من ${price} ريال` : (`${price} ريال` || `يبدأ من 120 ريال`)}
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
                            // استخدام serviceId كمعرف للخدمة المختارة
                            const selectedServiceId = serviceId;
                            
                            // Check if user is logged in
                            const accessToken = localStorage.getItem("accessToken");
                            if (accessToken) {
                              // User is logged in, navigate to orders page with service ID
                              router.push(`/orders?waterSize=${encodeURIComponent(selectedServiceId)}`);
                            } else {
                              // User is not logged in, open login dialog
                              setIsLoginDialogOpen(true);
                            }
                          }}
                        >
                          {"اطلب الآن"}
                        </Button>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            )}

            {!loading && !error && services.length > 0 && (
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none z-20">
                <button
                  className="swiper-button-next-custom pointer-events-auto absolute right-2 sm:right-3 md:right-4 transform translate-x-1/2 sm:translate-x-0
                    w-8 h-8 sm:w-10 sm:h-10
                    cursor-pointer
                    rounded-full 
                    bg-white hover:bg-[#5A9CF0] 
                    border-0 
                    text-[#5A9CF0] hover:text-white
                    transition-all duration-300
                    hover:scale-110
                    active:scale-95
                    p-0
                    shadow-md hover:shadow-lg
                    flex items-center justify-center"
                  onClick={scrollNext}
                  aria-label="الكارت التالي"
                >
                  <span className="scale-150">
                    <IoIosArrowForward className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </span>
                  <span className="sr-only">الكارت التالي</span>
                </button>

                <button
                  className="swiper-button-prev-custom pointer-events-auto absolute left-2 sm:left-3 md:left-4 transform -translate-x-1/2 sm:translate-x-0
                    w-8 h-8 sm:w-10 sm:h-10
                    cursor-pointer
                    rounded-full 
                    bg-white hover:bg-[#5A9CF0] 
                    border-0 
                    text-[#5A9CF0] hover:text-white
                    transition-all duration-300
                    hover:scale-110
                    active:scale-95
                    p-0
                    shadow-md hover:shadow-lg
                    flex items-center justify-center"
                  onClick={scrollPrev}
                  aria-label="الكارت السابق"
                >
                  <span className="scale-150">
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </span>
                  <span className="sr-only">الكارت السابق</span>
                </button>
              </div>
            )}
          </div>

          {!loading && !error && services.length > 0 && (
            <div className="flex justify-center items-center mt-6 sm:mt-8 gap-2">
              {services.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`
                    h-2 rounded-full transition-all duration-300
                    ${isCenterCard(index) ? "bg-[#5A9CF0] w-6 sm:w-8" : "bg-gray-300 w-2"}
                  `}
                  aria-label={`انتقل إلى البطاقة ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <LoginFlowDialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} />
    </section>
  );
}