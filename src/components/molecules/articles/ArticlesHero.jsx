'use client';

import React from 'react';

const ArticlesHero = () => {
  const categories = [
    {
      id: 1,
      name: 'الكل',
      gradient: 'linear-gradient(260.48deg, #1C7C4B 0%, rgba(102, 102, 102, 0) 100%)',
      textColor: 'text-[#1C7C4B]',
    },
    {
      id: 2,
      name: 'الصحة',
      gradient: 'linear-gradient(259.57deg, #579BE8 2.46%, rgba(102, 102, 102, 0) 100%)',
      textColor: 'text-[#579BE8]',
    },
    {
      id: 3,
      name: 'اخبار',
      gradient: 'linear-gradient(257.28deg, #B70005 3.19%, rgba(102, 102, 102, 0) 100%)',
      textColor: 'text-[#B70005]',
    },
  ];

  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 lg:py-24 min-h-[70vh] flex flex-col justify-center items-center">
        
        {/* Header Section */}
        <div className="w-full max-w-3xl mb-2 md:mb-4 text-center space-y-4 md:space-y-6">
          <h1 className="font-cairo font-semibold text-2xl sm:text-3xl md:text-4xl text-[#579BE8] leading-tight">
            📚 مدونة وايت مياه
          </h1>
          
          {/* Main Text */}
          <div className="w-full">
            <p className="font-cairo font-normal text-lg sm:text-xl md:text-2xl lg:text-3xl text-black leading-relaxed md:leading-normal">
              <span className="block md:inline">
                اكتشف أحدث المقالات والنصائح حول المياه والصحة
              </span>{' '}
              <span className="block md:inline">
                وخدماتنا المميزة
              </span>
            </p>
          </div>
        </div>

        {/* Categories Buttons */}
        <div className="w-full max-w-md mt-8 md:mt-12">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-5">
            {categories.map((category) => (
              <button
                key={category.id}
                className="min-w-[100px] sm:min-w-[110px] h-12 sm:h-14 md:h-[50px] rounded-full px-4 flex items-center justify-center hover:opacity-90 transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  border: '1px solid transparent',
                  borderImageSource: category.gradient,
                  borderImageSlice: 1,
                }}
              >
                <span className={`font-cairo font-semibold text-sm sm:text-base ${category.textColor}`}>
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ArticlesHero;