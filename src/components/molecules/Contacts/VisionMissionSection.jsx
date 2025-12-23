'use client';

import React from 'react';
import Image from 'next/image';

const VisionMissionSection = () => {
  const visionItems = [
    {
      id: 1,
      title: 'رؤيتنا',
      description: 'أن نكون الخيار الأول لتوصيل المياه في المملكة من خلال الجودة والسرعة',
      borderColor: '#BE7C04',
      image: '/oction.png',
    },
    {
      id: 2,
      title: 'رسالتنا',
      description: 'توفير مياه نقية وآمنة لكل منزل ومؤسسة مع الحفاظ على البيئة',
      borderColor: '#1C7C4B',
      image: '/badge.png',
    },
    {
      id: 3,
      title: 'هدفنا',
      description: 'تغطية جميع مناطق المملكة بخدمات توصيل المياه خلال السنوات الثلاث القادمة',
      borderColor: '#579BE8',
      image: '/time.png',
    },
    {
      id: 4,
      title: 'قيمنا',
      description: 'الجودة، السرعة، الموثوقية، والابتكار في كل ما نقدمه',
      borderColor: '#B70005',
      image: '/vec.png',
    }
  ];

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-12 md:gap-16 lg:gap-20">
        
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex justify-center mb-4 md:mb-6">
            <h2 className="font-cairo font-semibold text-[#579BE8] text-2xl md:text-3xl lg:text-4xl text-center">
              عن WaterHub Express
            </h2>
          </div>
          
          <div className="w-full">
            <p className="font-cairo font-normal text-gray-700 text-center text-base md:text-lg lg:text-xl leading-relaxed">
              نحن شركة رائدة في مجال توصيل المياه النقية في المملكة العربية السعودية، نسعى لتوفير مياه نظيفة وصحية لكل منزل ومؤسسة
            </p>
          </div>
        </div>

        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-12">
            {visionItems.map((item) => (
              <div
                key={item.id}
                className="w-full h-48 md:h-52 lg:h-56 rounded-b-lg p-4 md:p-5 bg-white shadow-lg border-t-4 hover:shadow-xl transition-shadow duration-300"
                style={{ borderTopColor: item.borderColor }}
              >
                <div className="w-full h-full flex items-center gap-4 md:gap-6">
                  
                  <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center">
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-gray-100">
                        <Image 
                          src={item.image} 
                          alt={item.title}
                          fill
                          className="object-contain p-1 md:p-2"
                          sizes="(max-width: 768px) 64px, 80px, 96px"
                          priority={item.id === 1}
                        />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-gray-50 -z-10" />
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center gap-2 md:gap-3 border-r-2 border-gray-200 pr-3 md:pr-4 lg:pr-6">
                    <h3 className="font-cairo font-semibold text-gray-900 text-lg md:text-xl lg:text-2xl text-right">
                      {item.title}
                    </h3>
                    <p className="font-cairo font-semibold text-gray-700 text-sm md:text-base lg:text-lg text-right leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default VisionMissionSection;