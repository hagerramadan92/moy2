'use client';

import React from 'react';

const ContactHero = () => {
  const features = [
    {
      title: 'جودة مضمونة',
      description: 'مياه نقية 100% معتمدة من هيئة الغذاء ضمان الجوده',
      textColor: 'text-[#1C7C4B]',
      borderGradient: 'linear-gradient(260.48deg, #1C7C4B 0%, rgba(102, 102, 102, 0) 100%)'
    },
    {
      title: 'توصيل سريع',
      description: 'توصيل مجاني للطلبات أكثر من 100 ريال خلال ساعة',
      textColor: 'text-[#579BE8]',
      borderGradient: 'linear-gradient(259.57deg, #579BE8 2.46%, rgba(102, 102, 102, 0) 100%)'
    },
    {
      title: 'عروض الشركات',
      textColor: 'text-[#B70005]',
      borderGradient: 'linear-gradient(257.28deg, #B70005 3.19%, rgba(102, 102, 102, 0) 100%)',
      isTwoLines: true,
      line1: 'خصومات خاصة للتعاقدات السنوية',
      line2: 'خصم 20%'
    }
  ];

  return (
    <section className="w-full flex flex-col items-center justify-start pt-8 md:pt-12 lg:pt-16 pb-8 md:pb-12 lg:pb-16 px-4">
      
      <div className="flex flex-col items-center w-full max-w-6xl mx-auto mb-4 md:mb-8 lg:mb-12">
        
        <div className="w-full max-w-[300px] md:max-w-[450px] lg:max-w-[617px] h-[40px] md:h-[80px] lg:h-[101px] flex items-center justify-center mb-1 md:mb-1 lg:mb-1">
          <h1 
            className="font-cairo font-semibold text-2xl md:text-3xl lg:text-4xl xl:text-4xl text-center px-2 md:px-4"
            style={{ 
              lineHeight: '100%',
              color: 'rgba(87, 155, 232, 1)',
              marginBottom: '2px'
            }}
          >
            تواصل معنا
          </h1>
        </div>

        <p 
          className="text-center max-w-[90%] md:max-w-[80%] lg:max-w-3xl px-2 md:px-4"
          style={{
            fontFamily: 'Cairo, sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(16px, 4vw, 24px)',
            lineHeight: '100%',
            letterSpacing: '0%',
            color: 'rgba(0, 0, 0, 0.72)',
            marginTop: '0',
            marginBottom: '0'
          }}
        >
          نحن هنا للإجابة على جميع استفساراتك ومساعدتك في أي وقت
        </p>
      </div>

      <div className="flex flex-col lg:flex-row justify-center items-center gap-6 md:gap-8 lg:gap-12 w-full max-w-7xl mx-auto px-2 md:px-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="relative w-full max-w-[280px] md:max-w-[320px] lg:max-w-[354px] h-[120px] md:h-[135px] lg:h-[145px]"
          >
            <div
              className="w-full h-full rounded-[24px] md:rounded-[28px] lg:rounded-[32px] p-[8px] md:p-[10px] flex flex-col items-center justify-center gap-[8px] md:gap-[10px] bg-white"
              style={{
                border: '1px solid transparent',
                borderImageSource: feature.borderGradient,
                borderImageSlice: 1,
              }}
            >
              <div 
                className="w-full h-full rounded-[20px] md:rounded-[24px] lg:rounded-[28px] flex flex-col items-center justify-center gap-2 md:gap-3 lg:gap-4 bg-white"
              >
                <h3 
                  className={`text-center px-2 ${feature.textColor}`}
                  style={{
                    fontFamily: 'Cairo, sans-serif',
                    fontWeight: 600,
                    fontSize: 'clamp(20px, 5vw, 30px)',
                    lineHeight: '120%',
                    letterSpacing: '0%'
                  }}
                >
                  {feature.title}
                </h3>
                
                {feature.isTwoLines ? (
                  <div className={`text-center px-2 md:px-4 ${feature.textColor}`}>
                    <div style={{
                      fontFamily: 'Cairo, sans-serif',
                      fontWeight: 500,
                      fontSize: 'clamp(14px, 3.5vw, 18px)',
                      lineHeight: '140%',
                      letterSpacing: '0%'
                    }}>
                      {feature.line1}
                    </div>
                    <div style={{
                      fontFamily: 'Cairo, sans-serif',
                      fontWeight: 500,
                      fontSize: 'clamp(14px, 3.5vw, 18px)',
                      lineHeight: '140%',
                      letterSpacing: '0%',
                      marginTop: '2px'
                    }}>
                      {feature.line2}
                    </div>
                  </div>
                ) : (
                  <p 
                    className={`text-center px-2 md:px-4 ${feature.textColor}`}
                    style={{
                      fontFamily: 'Cairo, sans-serif',
                      fontWeight: 500,
                      fontSize: 'clamp(14px, 3.5vw, 18px)',
                      lineHeight: '140%',
                      letterSpacing: '0%'
                    }}
                  >
                    {feature.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContactHero;