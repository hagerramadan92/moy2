'use client';

import Image from 'next/image';

export default function SearchDriverPage() {
  return (
    <div className="min-h-screen relative bg-[#F5F5F5]">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/man.png"
          alt="Background"
          fill
          className="object-cover opacity-70"
          sizes="100vw"
          priority
          style={{ objectPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Main content wrapper */}
      <div className="relative z-10 flex flex-col items-center justify-between min-h-screen px-4 py-4 lg:py-0">
        
        {/* Main white card */}
        <div className="w-full max-w-[360px] lg:max-w-[380px] h-[380px] lg:h-[412px] 
                       bg-white rounded-[24px] border border-[#579BE8]/25 
                       relative shadow-[0px_0px_18px_0px_rgba(87,155,232,0.25)] 
                       z-20 mt-[60px] lg:mt-[20px]">
          
          {/* Circular progress indicator */}
          <div className="absolute w-[190px] h-[190px] lg:w-[216px] lg:h-[216px] 
                         rounded-full border-[8px] lg:border-[10px] border-[#D9D9D9] 
                         bg-white top-[40px] lg:top-[46px] left-1/2 -translate-x-1/2">
            
            {/* Blue progress arc */}
            <div className="absolute inset-0 rounded-full border-[8px] lg:border-[10px] 
                           border-transparent border-t-[#579BE8] border-r-[#579BE8] rotate-45">
            </div>

            {/* Driver image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                           w-[70px] h-[70px] lg:w-[82px] lg:h-[82px]">
              <Image
                src="/pic.png"
                alt="Driver"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 70px, 82px"
              />
            </div>
          </div>

          {/* Status message */}
          <div className="absolute w-full max-w-[300px] lg:max-w-[327px] 
                         text-center top-[250px] lg:top-[286px] 
                         left-1/2 -translate-x-1/2 px-4 lg:px-0">
            <h2 className="font-semibold text-[22px] lg:text-[24px] 
                          leading-[36px] lg:leading-[41px] text-[#579BE8] mb-1">
              تم طلب الموية 
            </h2>
            <p className="font-medium text-[16px] lg:text-[18px] 
                         leading-[28px] lg:leading-[31px] text-[#000000]">
              جاري البحث عن السائقين القريبين
            </p>
          </div>

          {/* Loading animation dots */}
          <div className="absolute flex gap-1 top-[340px] lg:top-[380px] left-1/2 -translate-x-1/2">
            <div className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] 
                           rounded-full bg-[#579BE8]">
            </div>
            <div className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] 
                           rounded-full bg-[#579BE8]">
            </div>
            <div className="w-[12px] h-[12px] lg:w-[14px] lg:h-[14px] 
                           rounded-full bg-[#579BE8]">
            </div>
          </div>
        </div>

        {/* Special offer - Mobile version */}
        <div className="lg:hidden w-full max-w-[360px]">
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 
                         text-right w-full mb-[140px]">
            <h3 className="text-xl font-normal text-white mb-4 text-center">
              عرض خاص!
            </h3>
            <p className="text-base font-normal text-white leading-relaxed text-center">
              اطلب مـــــــــــــوية اليــــــوم واحصل
              <br />
              علــــــى <span className="text-yellow-400 font-semibold">خصم 10%</span>{' '}
              على أول توصيل 💧
            </p>
          </div>
        </div>

        {/* Special offer - Desktop version */}
        <div className="hidden lg:block absolute w-full max-w-[1400px] 
                       xl:w-[1357px] h-[220px] lg:h-[250px] rounded-[12px] 
                       bg-black/50 backdrop-blur-[2.82px] bottom-0 left-1/2 -translate-x-1/2 z-10">
          
          {/* Offer title */}
          <div className="absolute bottom-[100px] lg:bottom-[160px] 
                         right-[40px] lg:right-[40px]">
            <h3 className="font-normal text-[36px] lg:text-[48px] 
                          leading-[60px] lg:leading-[82px] text-right text-white">
              عرض خاص!
            </h3>
          </div>

          {/* Offer description */}
          <div className="absolute text-right bottom-[20px] lg:bottom-[60px] 
                         right-[40px] lg:right-[40px] w-[500px] lg:w-[534px]">
            <p className="font-normal text-[24px] lg:text-[36px] 
                         leading-[40px] lg:leading-[54px] text-white text-nowrap">
              اطلب مـــــــــــــوية اليــــــوم واحصل
              <br />
              علــــــى <span className="text-yellow-500">خصم 10 %</span> على أول توصيل 💧
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}