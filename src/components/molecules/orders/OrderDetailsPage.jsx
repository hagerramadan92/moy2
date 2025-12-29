'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function OrderDetailsPage() {

  return (
    <div className="container min-h-screen bg-white p-4 md:p-8 font-cairo rtl">
      <div className="mb-8 md:mb-12">
        <h1 className="text-2xl md:text-4xl font-semibold text-black text-right">
          تفاصيل الطلب
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="lg:hidden bg-[#F6FBFF] rounded-3xl p-4 md:p-6">
            <div className="w-full h-48 flex justify-center mb-6">
              <div className="relative w-64 h-48">
                <Image
                  src="/car22.png"
                  alt="Car"
                  fill
                  className="object-contain"
                  sizes="256px"
                />
              </div>
            </div>

            {/* Text Content - Mobile */}
            <div>
              <div className="flex items-start gap-2 mb-6">
                <div className="rounded-full bg-[#E6F0FC80] flex items-center justify-center w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                  <div className="relative w-6 h-5 md:w-8 md:h-7">
                    <Image
                      src="/location2.png"
                      alt="Location"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-base md:text-xl font-normal text-[#579BE8] text-right leading-relaxed">
                    الرياض - مستشفى الملك فيصل
                  </h2>
                </div>
              </div>

              {/* Mobile Details - Stacked */}
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="relative w-5 h-5">
                    <Image
                      src="/Mask group.png"
                      alt="Not drinkable"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[#579BE8] text-sm">غير صالحة للشرب</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-6 h-6">
                    <Image
                      src="/water.png"
                      alt="Water"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[#579BE8] font-medium text-sm">6 طن</span>
                </div>

                <span className="text-[#579BE8] font-semibold text-sm">
                  رقم الطلب: 112312121
                </span>
              </div>

              <div className="flex items-center gap-3 md:gap-4 mb-6">
                <span className="text-black/50 text-sm">تاريخ الطلب</span>
                <div className="flex items-center gap-2">
                  <div className="relative w-5 h-5 md:w-6 md:h-6">
                    <Image
                      src="/Vector (10).png"
                      alt="Calendar"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-black text-sm">3 نوفمبر - 12:00 ص</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button
                  className="bg-[#F75A65] hover:bg-[#F75A65]/90 text-white rounded-xl h-12 md:h-14 flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="text-base md:text-xl font-medium">الغاء الطلب</span>
                </button>

                <button
                  className="bg-[#579BE8] hover:bg-[#579BE8]/90 text-white rounded-xl h-12 md:h-14 flex items-center justify-center gap-2 transition-colors"
                >
                  <div className="relative w-5 h-5 md:w-6 md:h-6">
                    <Image
                      src="/Vector (11).png"
                      alt="Help"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-base md:text-xl font-semibold">مساعدة</span>
                </button>
              </div>
            </div>
          </div>

          {/* Order Info Card - Desktop Layout */}
          <div className="hidden lg:block bg-[#F6FBFF] rounded-3xl p-6 h-[337px]">
            <div className="flex items-start h-full">
              <div className="w-1/2 h-full flex items-center justify-center pl-8">
                <div className="relative w-full h-56">
                  <Image
                    src="/car22.png"
                    alt="Car"
                    fill
                    className="object-contain"
                    sizes="100%"
                  />
                </div>
              </div>

              <div className="w-1/2">
                <div className="flex items-start gap-2 mb-6">
                  <div className="rounded-full bg-[#E6F0FC80] flex items-center justify-center w-12 h-12 flex-shrink-0">
                    <div className="relative w-8 h-7">
                      <Image
                        src="/location2.png"
                        alt="Location"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-normal text-[#579BE8] text-right leading-relaxed">
                      الرياض - مستشفى الملك فيصل
                    </h2>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="relative w-5 h-5">
                      <Image
                        src="/Mask group.png"
                        alt="Not drinkable"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-[#579BE8] text-sm">غير صالحة للشرب</span>
                  </div>
                  <div className="h-4 w-px bg-[#579BE8]/50 mx-2" />
                  <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6">
                      <Image
                        src="/water.png"
                        alt="Water"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-[#579BE8] font-medium text-sm">6 طن</span>
                  </div>
                  <div className="h-4 w-px bg-[#579BE8]/50 mx-2" />
                  <span className="text-[#579BE8] font-semibold text-sm">
                    رقم الطلب: 112312121
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <span className="text-black/50">تاريخ الطلب</span>
                  <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6">
                      <Image
                        src="/Vector (10).png"
                        alt="Calendar"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-black">3 نوفمبر - 12:00 ص</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    className="bg-[#F75A65] hover:bg-[#F75A65]/90 text-white rounded-xl h-14 flex items-center justify-center gap-2 transition-colors"
                  >
                    <span className="text-2xl font-medium">الغاء الطلب</span>
                  </button>

                  <button
                    className="bg-[#579BE8] hover:bg-[#579BE8]/90 text-white rounded-xl h-14 flex items-center justify-center gap-2 transition-colors"
                  >
                    <div className="relative w-6 h-6">
                      <Image
                        src="/Vector (11).png"
                        alt="Help"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-2xl font-semibold">مساعدة</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="rounded-3xl overflow-hidden h-64 md:h-80 lg:h-[410px] relative">
            <Image
              src="/locat3.png"
              alt="Map"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>

          {/* Driver Card - Mobile Only */}
          <div className="lg:hidden">
            <div className="bg-white rounded-3xl border border-[#579BE8] shadow-lg p-4 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-semibold text-black">ملف السائق</h2>
                <div className="flex flex-col items-center">
                  <div className="relative w-5 h-4 md:w-6 md:h-5 mb-1">
                    <Image
                      src="/Vector (6).png"
                      alt="File"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs text-black/60">الملف</span>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#579BE8]">
                  <Image
                    src="/image 4.png"
                    alt="Driver"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 128px, 160px"
                    quality={90}
                    priority
                  />
                </div>
              </div>

              <div className="flex justify-center items-center gap-2 mb-6">
                <span className="text-lg md:text-xl font-medium text-[#579BE8] text-center">
                  سعود بن ناصر المطيري
                </span>
                <div className="relative w-5 h-5">
                  <Image
                    src="/Vector (3).png"
                    alt="Star"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="relative w-5 h-5">
                    <Image
                      src="/time.png"
                      alt="Time"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm font-semibold text-[#579BE8]">
                    يصل في 55 د
                  </span>
                </div>

                <div className="hidden sm:block h-4 w-px bg-[#579BE8]/30" />

                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#579BE8] rounded-sm" />
                  <span className="text-sm font-medium text-[#579BE8]">
                    تقييم 4,5
                  </span>
                </div>

                <div className="hidden sm:block h-4 w-px bg-[#579BE8]/30" />

                <div className="flex items-center gap-2">
                  <div className="relative w-4 h-4">
                    <Image
                      src="/Vector (4).png"
                      alt="Orders"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium text-[#579BE8]">
                    (1,439) طلب ناجح
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  className="w-full bg-[#579BE8] hover:bg-[#579BE8]/90 text-white rounded-xl h-12 md:h-14 flex items-center justify-center gap-3 transition-colors"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-base md:text-xl font-medium">اتصال</span>
                </button>

                <button
                  className="w-full bg-white border border-[#579BE8] text-[#579BE8] hover:bg-gray-50 rounded-xl h-12 md:h-14 flex items-center justify-center gap-3 transition-colors"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-base md:text-xl font-medium">دردشة</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Card - Desktop Only */}
        <div className="hidden lg:block w-1/3">
          <div className="bg-white rounded-3xl border border-[#579BE8] shadow-lg p-6 h-[699px]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-black">ملف السائق</h2>
              <div className="flex flex-col items-center">
                <div className="relative w-6 h-5 mb-1">
                  <Image
                    src="/Vector (6).png"
                    alt="File"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xs text-black/60">الملف</span>
              </div>
            </div>

            <div className="flex justify-center mb-8">
              <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-[#579BE8]">
                <Image
                  src="/image 4.png"
                  alt="Driver"
                  fill
                  className="object-cover"
                  sizes="192px"
                  quality={90}
                  priority
                />
              </div>
            </div>

            <div className="flex justify-center items-center gap-2 mb-8">
              <span className="text-xl font-medium text-[#579BE8] text-center">
                سعود بن ناصر المطيري
              </span>
              <div className="relative w-5 h-5">
                <Image
                  src="/Vector (3).png"
                  alt="Star"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-10 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="relative w-5 h-5">
                  <Image
                    src="/time.png"
                    alt="Time"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-[#579BE8]">
                  يصل في 55 د
                </span>
              </div>

              <div className="h-4 w-px bg-[#579BE8]/30" />

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#579BE8] rounded-sm" />
                <span className="text-sm font-medium text-[#579BE8]">
                  تقييم 4,5
                </span>
              </div>

              <div className="h-4 w-px bg-[#579BE8]/30" />

              <div className="flex items-center gap-2">
                <div className="relative w-4 h-4">
                  <Image
                    src="/Vector (4).png"
                    alt="Orders"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-[#579BE8]">
                  (1,439) طلب ناجح
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                className="w-full bg-[#579BE8] hover:bg-[#579BE8]/90 text-white rounded-xl h-14 flex items-center justify-center gap-3 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-2xl font-medium">اتصال</span>
              </button>

              <button
                className="w-full bg-white border border-[#579BE8] text-[#579BE8] hover:bg-gray-50 rounded-xl h-14 flex items-center justify-center gap-3 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-2xl font-medium">دردشة</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}