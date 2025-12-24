"use client";

import Image from "next/image";
import React from "react";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaClock,
  FaCheckCircle,
  FaStar,
} from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";

export default function CurrentLocation() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-2xl md:text-[28px]   mb-8 leading-tight">
                حدد موقعك بدقة ليصلك السائق بأسرع وقت
              </h1>
              <div className="flex flex-col gap-7">
                <div className="flex md:items-center gap-4">
                  <div
                    className="w-13 h-13 md:w-12 md:h-12 lg:w-13.5 lg:h-13.5 rounded-[14px] flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: "#579BE8" }}
                  >
                    <IoLocationOutline className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10" />
                  </div>
                  <div>
                    <h2 className="text-[26px]">تحديد دقيق</h2>
                    <p className="text-[#0000007D] text-xl">
                      حدد موقعك بدقة عالية على الخريطة
                    </p>
                  </div>
                </div>
                <div className="flex md:items-center gap-4">
                  <div
                    className="w-13 h-13 md:w-12 md:h-12 lg:w-13.5 lg:h-13.5 rounded-[14px] flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: "#DF4F3C" }}
                  >
                    {/* <IoLocationOutline   /> */}
                    <Image
                      width={100}
                      height={100}
                      src="/images/north.png"
                      alt="Location Icon"
                      className="w-8 h-8 lg:w-9 lg:h-9 xl:w-12 xl:h-12"
                    />
                  </div>
                  <div>
                    <h2 className="text-[26px]"> تتبع مباشر</h2>
                    <p className="text-[#0000007D] text-xl">
                      تابع موقع السائق في الوقت الفعلي
                    </p>
                  </div>
                </div>

                <button className="justify-center w-full md:w-86.25 text-[26px] bg-[#579BE8]  text-white  mb-10 flex items-center gap-1 px-8 py-3 rounded-xl  transition-colors cursor-pointer">
                  <IoLocationOutline size={30} />
                  حدد موقعك الآن
                </button>
              </div>
            </div>

            <div className="relative maps ">
              <div className=" absolute left-1/2  top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10 text-white">
                  <div className="flex items-center ">
                     <IoLocationOutline size={50} />
                <p className="text-2xl lg:text-[27.5px]  border-white pb-3 border-b-2">موقعي الحالي</p>
                  </div>
                 
              </div>
              <Image
                src="/images/location.png"
                width={1880}
                height={1340}
                alt="Current Location"
                className="w-188 h-134 rounded-[24px] shadow-lg"
              />
 
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
