
'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function SearchDriverPage() {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev % 3) + 1);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F5F5F5]">
      <div className="absolute inset-0 w-full h-full bg-black/40 z-0"></div>
      
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src="/man.png"
          alt="Background"
          fill
          className="object-cover opacity-70"
          sizes="100vw"
          priority
          style={{ objectPosition: 'center' }}
        />
      </div>

      <div className="relative z-10 flex justify-center items-center min-h-screen">
        <div 
          className="w-[418px] h-[412px] bg-white rounded-[24px] border border-[#579BE8]/25 relative"
          style={{
            boxShadow: '0px 0px 18px 0px rgba(87, 155, 232, 0.25)',
          }}
        >
          <div 
            className="absolute w-[216px] h-[216px] rounded-full border-[10px] border-[#D9D9D9] bg-white"
            style={{
              top: '46px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                border: '10px solid transparent',
                borderTopColor: '#579BE8',
                borderRightColor: '#579BE8',
                transform: 'rotate(45deg)',
              }}
            ></div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[82px] h-[82px]">
              <Image
                src="/pic.png"
                alt="Driver"
                fill
                className="object-contain"
                sizes="82px"
              />
            </div>
          </div>

          <div 
            className="absolute w-[327px] text-center"
            style={{
              top: '286px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <h2 className="font-cairo font-semibold text-[24px] leading-[41px] text-[#579BE8] mb-1">
              تم طلب الموية
            </h2>
            <p className="font-cairo font-medium text-[18px] leading-[31px] text-[#000000]">
              جاري البحث عن السائقين القريبين
            </p>
          </div>

          <div 
            className="absolute flex gap-1"
            style={{
              top: '380px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {[1, 2, 3].map((dot) => (
              <div
                key={dot}
                className={`w-[14px] h-[14px] rounded-full ${dots >= dot ? 'bg-[#579BE8]' : 'bg-[#579BE8]/30'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div 
        className="absolute w-[1357px] h-[271px] rounded-[12px] bg-black/50 backdrop-blur-[2.82px]"
        style={{
          bottom: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <div 
          className="absolute"
          style={{
            bottom:'130px',
            right: '50px',
          }}
        >
          <h3 className="font-cairo font-normal text-[48px] leading-[82px] text-right text-white">
            عرض خاص!
          </h3>
        </div>

        <div 
          className="absolute text-right"
          style={{
            bottom:'20px',
            right: '50px',
            width: '534px',
          }}
        >
          <p className="font-cairo font-normal text-[36px] leading-[54px] text-white">
            اطلب موية اليــــــوم واحصل
            <br />
            علــى <span className="text-yellow-500">خصم 10 %</span> على أول توصيل 💧
          </p>
        </div>
      </div>
    </div>
  );
}