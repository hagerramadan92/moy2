'use client';

import Image from 'next/image';

/**
 * Customer Support Chat Interface
 * Displays a conversation between customer and support agent
 */
export default function CustomerSupportPage({ onBack }) {
  return (
    <div className="min-h-screen bg-gray-50 font-cairo">
      <link
        href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Back Button */}
      <div className="container mx-auto px-4 pt-1 max-w-7xl">
        <button 
          onClick={onBack}
          className="mb-8 text-[#579BE8] hover:text-[#579BE8]/80 flex items-center gap-2 text-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 py-0 max-w-7xl">
        
        {/* Support Header - Right aligned on desktop, centered on mobile */}
        <div className="mb-8">
          <div className="w-full max-w-4xl mx-auto">
            <h1 className="text-[#579BE8] text-3xl md:text-4xl font-normal text-center md:text-right">
              الدعم الفني
            </h1>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="flex justify-center mb-12">
          <div className="w-full max-w-4xl bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-start gap-4">
              
              {/* User Avatar - On the left side (before the text) */}
              <div className="w-20 h-20 rounded-full border border-[#EAEEF5] flex items-center justify-center overflow-hidden flex-shrink-0">
                <Image
                  src="/carton.png"
                  alt="User Avatar"
                  width={77}
                  height={70}
                  className="object-contain"
                />
              </div>

              {/* User Details - On the right side (after the image) */}
              <div className="text-right flex flex-col gap-2 flex-1">
                <h2 className="text-[#579BE8] text-lg font-medium leading-relaxed">
                  سعود بن ناصر المطيري
                </h2>
                <p className="text-[#579BE8] text-sm font-normal">
                  +9660576783729
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl rounded-3xl p-6">
            
            {/* Customer Messages - Right aligned */}
            <div className="flex flex-col gap-6 mb-8">
              
              {/* Customer Message Group 1 */}
              <div className="flex justify-end">
                <div className="flex flex-col items-end gap-3 max-w-[80%] md:max-w-[70%]">
                  
                  {/* First Message */}
                  <div className="flex items-end gap-3">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-right text-black text-sm font-medium leading-relaxed max-w-xs">
                        السلام عليكم، لو سمحت أبغى أطلب وايت موية ٢٠٠٠ لتر لحي الروابي.
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                      <Image
                        src="/carton.png"
                        alt="Customer"
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Second Message */}
                  <div className="flex items-end gap-3">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-right text-black text-sm font-normal leading-relaxed max-w-xs">
                        ودي يوصل خلال ساعة إذا تقدرون.
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0 opacity-0">
                      {/* Hidden avatar for alignment */}
                    </div>
                  </div>

                  {/* Third Message */}
                  <div className="flex items-end gap-3">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-right text-black text-sm font-normal leading-relaxed max-w-xs">
                        أكد لي الطلب.
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0 opacity-0">
                      {/* Hidden avatar for alignment */}
                    </div>
                  </div>

                </div>
              </div>

              {/* Support Response - Left aligned */}
              <div className="flex justify-start">
                <div className="flex items-start gap-3 max-w-[80%] md:max-w-[70%]">
                  <div className="w-10 h-10 rounded-lg bg-[#579BE8] overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <Image
                      src="/person.png"
                      alt="Support Agent"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <div className="bg-[#579BE8] rounded-xl p-4">
                    <p className="text-right text-white text-sm font-medium leading-relaxed max-w-xs">
                      تمام، نقدر نوصل خلال ساعة إن شاء الله.
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Response - Right aligned */}
              <div className="flex justify-end">
                <div className="flex items-end gap-3 max-w-[80%] md:max-w-[70%]">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-right text-black text-sm font-normal leading-relaxed max-w-xs">
                      يعطيكم العافية
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                    <Image
                      src="/carton.png"
                      alt="Customer"
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Final Support Response - Left aligned */}
              <div className="flex justify-start">
                <div className="flex items-start gap-3 max-w-[80%] md:max-w-[70%]">
                  <div className="w-10 h-10 rounded-lg bg-[#579BE8] overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <Image
                      src="/person.png"
                      alt="Support Agent"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <div className="bg-[#579BE8] rounded-xl p-4">
                    <p className="text-right text-white text-sm font-medium leading-relaxed max-w-xs">
                      الله يعافيك، أي خدمة ثانية إحنا حاضرين.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}