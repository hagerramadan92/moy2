'use client';

import React from 'react';

const ArticlesHero = () => {
  const categories = [
    {
      id: 1,
      name: 'الكل',
      gradient: 'linear-gradient(260.48deg, #1C7C4B 0%, rgba(102, 102, 102, 0) 100%)',
      textColor: 'text-primary-green',
    },
    {
      id: 2,
      name: 'الصحة',
      gradient: 'linear-gradient(259.57deg, #579BE8 2.46%, rgba(102, 102, 102, 0) 100%)',
      textColor: 'text-primary-blue',
    },
    {
      id: 3,
      name: 'اخبار',
      gradient: 'linear-gradient(257.28deg, #B70005 3.19%, rgba(102, 102, 102, 0) 100%)',
      textColor: 'text-primary-red',
    },
  ];

  return (
    <section className="container bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24 min-h-[70vh] flex flex-col justify-center items-center">
        
        {/* Header Section */}
        <div className="container max-w-3xl mb-6 md:mb-8 text-center">
          <h1 className="font-cairo font-semibold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#579BE8] mb-4 md:mb-6">
            📚 مدونة وايت مياه
          </h1>
          
          {/* Main Text */}
          <div className="w-full">
            <p className="font-cairo font-normal text-base sm:text-lg md:text-xl lg:text-2xl text-gray-900 leading-relaxed">
              <span className="block md:inline-block md:whitespace-nowrap md:overflow-visible">
                اكتشف أحدث المقالات والنصائح حول المياه والصحة وخدماتنا المميزه
              </span>
            </p>
          </div>
        </div>

        {/* Categories Buttons */}
        <div className="w-full max-w-md mt-2 md:mt-2 lg:mt-4">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                className="relative min-w-[100px] sm:min-w-[120px] h-12 sm:h-14 rounded-full px-5 sm:px-6 flex items-center justify-center hover:opacity-90 transition-all duration-300 hover:scale-105 active:scale-95 group"
                style={{
                  background: `linear-gradient(white, white) padding-box, ${category.gradient} border-box`,
                  border: '2px solid transparent',
                  borderRadius: '9999px',
                }}
              >
                <span className={`font-cairo font-semibold text-sm sm:text-base ${category.textColor} transition-colors duration-300 group-hover:opacity-80`}>
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


