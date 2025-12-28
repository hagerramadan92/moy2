'use client';

import Image from 'next/image';

export default function SearchDriverPage() {
  return (
    <div className="min-h-screen relative bg-[#F5F5F5]">
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

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 pt-8 pb-4 lg:pt-0 lg:pb-0 lg:justify-center lg:flex-row">
        <div className="w-full max-w-[418px] lg:w-[418px] h-[412px] bg-white rounded-[24px] border border-[#579BE8]/25 relative shadow-[0px_0px_18px_0px_rgba(87,155,232,0.25)] z-20 mb-6 lg:mb-0">
          <div 
            className="absolute w-[216px] h-[216px] rounded-full border-[10px] border-[#D9D9D9] bg-white top-[46px] left-1/2 -translate-x-1/2"
          >
            <div className="absolute inset-0 rounded-full border-[10px] border-transparent border-t-[#579BE8] border-r-[#579BE8] rotate-45"></div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[82px] h-[82px]">
              <Image
                src="/pic.png"
                alt="Driver"
                fill
                className="object-contain"
                sizes="82px"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="absolute w-full max-w-[327px] text-center top-[286px] left-1/2 -translate-x-1/2 px-4 lg:px-0">
            <h2 className="font-semibold text-[24px] leading-[41px] text-[#579BE8] mb-1">
              تم طلب المويه 
            </h2>
            <p className="font-medium text-[18px] leading-[31px] text-[#000000]">
              جاري البحث عن السائقين القريبين
            </p>
          </div>

          {/* Loading Dots */}
          <div className="absolute flex gap-1 top-[380px] left-1/2 -translate-x-1/2">
            <div className="w-[14px] h-[14px] rounded-full bg-[#579BE8]"></div>
            <div className="w-[14px] h-[14px] rounded-full bg-[#579BE8]"></div>
            <div className="w-[14px] h-[14px] rounded-full bg-[#579BE8]"></div>
          </div>
        </div>

        <div className="hidden lg:block absolute w-[1357px] h-[271px] rounded-[12px] bg-black/50 backdrop-blur-[2.82px] bottom-0 left-1/2 -translate-x-1/2 z-10">
          <div className="absolute bottom-[130px] right-[50px]">
            <h3 className="font-normal text-[48px] leading-[82px] text-right text-white">
              عرض خاص!
            </h3>
          </div>

          <div className="absolute text-right bottom-[20px] right-[50px] w-[534px]">
            <p className="font-normal text-[36px] leading-[54px] text-white">
              اطلب مياه اليوم واحصل
              <br />
              على <span className="text-yellow-500">خصم 10 %</span> على أول توصيل 💧
            </p>
          </div>
        </div>

        <div className="lg:hidden w-full">
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 text-right mt-8">
            <h3 className="text-2xl font-normal text-white mb-4">
              عرض خاص!
            </h3>
            <p className="text-lg font-normal text-white leading-relaxed">
              اطلب مياه اليوم واحصل على{' '}
              <span className="text-yellow-400 font-semibold">خصم 10%</span>{' '}
              على أول توصيل 💧
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}