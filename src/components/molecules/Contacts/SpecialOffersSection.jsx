'use client';

import React from 'react';
 
const SpecialOffersSection = () => {
  const offers = [
    {
      title: 'عرض خاص لفترة محدودة',
      mainText: 'اشترِ 10 واحصل على 2 مجاناً',
      description: 'على جميع عبوات المياه الكبيرة',
    },
    {
      title: 'برنامج الولاء',
      mainText: 'اجمع النقاط واستبدلها',
      description: 'كل 100 ريال = 10 نقاط مجانية',
    }
  ];

  const bigOffer = {
    title: '🎉 احتفالية الافتتاح الكبير 🎉',
    mainText: 'خصم 30% على الطلب الأول',
    code: 'استخدم كود: WATER30',
  };

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-10 md:gap-12 lg:gap-16">
        
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
          {offers.map((offer, index) => (
            <div
              key={index}
              className="w-full h-[274px] rounded-[24px] p-6 md:p-8 bg-white border border-solid border-transparent shadow-[0px_2px_4px_0px_#EFF5FD]"
              style={{ borderImage: 'linear-gradient(180deg, #F3F8FE 0%, #579BE8 100%) 1' }}
            >
              <div className="w-full h-full flex flex-col justify-center pr-4 md:pr-6 lg:pr-8">
                <p className="font-cairo font-normal text-right text-gray-800 text-lg md:text-xl mb-6">
                  {offer.title}
                </p>
                <p className="font-cairo font-semibold text-right text-[#579BE8] text-lg md:text-xl lg:text-2xl mb-3 md:mb-4">
                  {offer.mainText}
                </p>
                <p className="font-cairo font-normal text-right text-gray-600 text-base md:text-lg">
                  {offer.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="w-full h-[274px] rounded-[24px] p-6 md:p-8 lg:p-10 bg-white border border-solid border-transparent shadow-[0px_2px_4px_0px_#EFF5FD]"
          style={{ borderImage: 'linear-gradient(180deg, #F3F8FE 0%, #579BE8 100%) 1' }}
        >
          <div className="w-full h-full flex flex-col items-center justify-center text-center">
            <p className="font-cairo font-normal text-[rgba(0,0,0,0.63)] text-lg md:text-xl mb-6 md:mb-8">
              {bigOffer.title}
            </p>
            <div className="space-y-4 md:space-y-6">
              <p className="font-cairo font-semibold text-[#579BE8] text-xl md:text-2xl lg:text-3xl">
                {bigOffer.mainText}
              </p>
              <p className="font-cairo font-normal text-[rgba(0,0,0,0.63)] text-lg md:text-xl">
                {bigOffer.code}
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default SpecialOffersSection;