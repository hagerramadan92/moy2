'use client';

import React, { useState } from 'react';

const ContactFormSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <section 
      className="w-full min-h-[895px] flex flex-col items-center justify-center px-4 py-12 md:py-16 lg:py-20"
      style={{
        background: 'radial-gradient(103.58% 103.58% at 50% 50%, #579BE8 0%, #041221 100%)'
      }}
    >
      <div className="w-full max-w-7xl mx-auto">
        
        <div className="flex justify-center mb-1 md:mb-2 lg:mb-3">
          <h2 className="font-cairo font-semibold text-white text-2xl md:text-3xl lg:text-4xl xl:text-[43.39px] text-center py-3 md:py-4 lg:py-2 w-[90%] max-w-[534px] leading-[100%] tracking-[0%] rounded-xl">
            تواصل معنا
          </h2>
        </div>

        <div className="mx-auto w-[90%] max-w-[534px] p-6 md:p-8 lg:p-10">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            
            <div className="space-y-2 md:space-y-3">
              <label className="block text-right font-cairo font-semibold text-white text-base md:text-lg lg:text-xl leading-[100%] tracking-[0%]">
                الاسم
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full h-[50px] md:h-[57px] lg:h-[63.9px] rounded-[15.97px] bg-[#D0E0F2] border border-solid border-[#9BBFE7]/65 font-cairo text-right text-sm md:text-base lg:text-lg text-[#041221] px-3 md:px-4 lg:px-[11.41px]"
              />
            </div>

            <div className="space-y-2 md:space-y-3">
              <label className="block text-right font-cairo font-semibold text-white text-base md:text-lg lg:text-xl leading-[100%] tracking-[0%]">
                الجوال
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full h-[50px] md:h-[57px] lg:h-[63.9px] rounded-[15.97px] bg-[#D0E0F2] border border-solid border-[#9BBFE7]/65 font-cairo text-right text-sm md:text-base lg:text-lg text-[#041221] px-3 md:px-4 lg:px-[11.41px]"
              />
            </div>

            <div className="space-y-2 md:space-y-3">
              <label className="block text-right font-cairo font-semibold text-white text-base md:text-lg lg:text-xl leading-[100%] tracking-[0%]">
                رسالتك
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full h-[120px] md:h-[140px] lg:h-[159.74px] rounded-[15.97px] bg-[#D0E0F2] border border-solid border-[#9BBFE7]/65 font-cairo text-right text-sm md:text-base lg:text-lg text-[#041221] px-3 md:px-4 lg:px-[11.41px] py-3 md:py-4 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full h-[48px] md:h-[52px] lg:h-[56px] rounded-[14px] bg-[#579BE8] shadow-[0px_1px_10px_0px_rgba(183,217,255,0.25)] font-cairo font-semibold text-white text-sm md:text-base lg:text-lg hover:opacity-90 transition-opacity"
            >
              إرسال
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;