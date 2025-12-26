import Image from "next/image";
import React from "react";

export default function AppPromotionSection() {
  return (
    <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8">
      <div className="container max-w-[300px] sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px] xl:max-w-[1100px] 2xl:w-[1296px] 
                     h-[150px] sm:h-[200px] md:h-[250px] lg:h-[300px] xl:h-[340px] 2xl:h-[377px] 
                     rounded-[16px] sm:rounded-[20px] md:rounded-[24px] lg:rounded-[28px] xl:rounded-[30px] 2xl:rounded-[32px] 
                     bg-[#EFF5FD] mx-auto relative">
        
        {/* Phone Image - Small on mobile, Big on desktop */}
        <div className="absolute 
                       w-[80px] h-[100px] 
                       sm:w-[100px] sm:h-[125px] 
                       md:w-[120px] md:h-[150px]
                       lg:w-[180px] lg:h-[225px]  
                       xl:w-[240px] xl:h-[300px]  
                       2xl:w-[350px] 2xl:h-[450px] 
                       
                       top-1/2 -translate-y-1/2 
                       sm:top-1/2 sm:-translate-y-1/2 
                       md:top-[-10px] md:-translate-y-0
                       lg:top-[-20px] 
                       xl:top-[-40px] 
                       2xl:top-[-120px]
                       
                       left-[20px] sm:left-[30px] md:left-[40px] lg:left-[60px] xl:left-[100px] 2xl:left-[165px]">
          <Image
            src="/iPhone 16.png"
            alt="iPhone 16"
            fill
            className="object-contain drop-shadow-[0px_4px_16.3px_rgba(0,0,0,0.31)]"
            sizes="(max-width: 640px) 80px, (max-width: 768px) 100px, (max-width: 1024px) 120px, (max-width: 1280px) 180px, (max-width: 1536px) 240px, 350px"
            priority
          />
        </div>

        {/* Text and Buttons */}
        <div className="absolute 
                       w-[calc(100%-40px)] sm:w-auto
                       left-[20px] sm:left-auto
                       right-[20px] sm:right-[30px] md:right-[40px] lg:right-[50px] xl:right-[60px] 2xl:right-[40px]
                       
                       top-1/2 -translate-y-1/2 
                       text-center sm:text-right">
          
          <h2 className="font-cairo font-normal 
                        text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-[48px] 
                        leading-[100%] text-[#579BE8] 
                        mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6">
            تطبيق وايت مياه
          </h2>

          <p className="font-cairo font-normal 
                       text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-[32px] 
                       leading-[100%] text-[#579BE8] 
                       mb-3 sm:mb-4 md:mb-5 lg:mb-6 xl:mb-8 2xl:mb-10
                       hidden sm:block">
            اطلب المويه من خلال جوالك مع تطبيق وايت مياه !
          </p>

          <p className="font-cairo font-normal 
                       text-xs leading-[100%] text-[#579BE8] 
                       mb-3
                       block sm:hidden">
            اطلب المويه من جوالك
          </p>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 
                         justify-center sm:justify-end
                         mx-auto sm:mx-0">
            
            {/* App Store Button */}
            <div className="w-[80px] h-[25px] sm:w-[100px] sm:h-[32px] md:w-[120px] md:h-[38px] 
                          lg:w-[140px] lg:h-[44px] xl:w-[160px] xl:h-[50px] 2xl:w-[192px] 2xl:h-[60px] 
                          relative mx-auto sm:mx-0">
              <Image
                src="/appStore.png"
                alt="Download on App Store"
                fill
                className="object-contain"
                sizes="(max-width: 640px) 80px, (max-width: 768px) 100px, (max-width: 1024px) 120px, (max-width: 1280px) 140px, (max-width: 1536px) 160px, 192px"
              />
            </div>

            {/* Google Play Button */}
            <div className="w-[80px] h-[25px] sm:w-[100px] sm:h-[32px] md:w-[120px] md:h-[38px] 
                          lg:w-[140px] lg:h-[44px] xl:w-[160px] xl:h-[50px] 2xl:w-[192px] 2xl:h-[60px] 
                          relative mx-auto sm:mx-0">
              <Image
                src="/googlePlay.png"
                alt="Download on Google Play"
                fill
                className="object-contain"
                sizes="(max-width: 640px) 80px, (max-width: 768px) 100px, (max-width: 1024px) 120px, (max-width: 1280px) 140px, (max-width: 1536px) 160px, 192px"
              />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}