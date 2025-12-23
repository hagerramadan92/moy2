"use client";

import Image from "next/image";
import { FaStar } from "react-icons/fa";

export default function CustomerReviewsExact() {
  return (
    <section className="py-16 bg-gradient-to-b bg-[#EFF5FD]">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-[#579BE8] mb-12">
          أراء عملتنا
        </h2>

        <div className="max-w-6xl mx-auto ">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
              <div className="flex  justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/customer.png"
                    alt="customer"
                    width={62}
                    height={62}
                    className="rounded-full"
                  />
                  <span className="text-gray-900 font-bold text-[25px] lg:text-[28px]">
                    أبو عبدالله
                  </span>
                </div>

                <span className="text-[#A7AFC2CF] text-[15px] font-medium">
                  25/05/25
                </span>
              </div>

              <div className="flex mb-4">
                <FaStar className="w-6 h-6 text-[#FFCC00] ml-1" />
                <FaStar className="w-6 h-6 text-[#FFCC00] ml-1" />
                <FaStar className="w-6 h-6 text-[#FFCC00] ml-1" />
                <FaStar className="w-6 h-6 text-[#FFCC00] ml-1" />
                <FaStar className="w-6 h-6 text-[#FFCC00]" />
              </div>

              <p className="text-[#000000A6] text-lg leading-relaxed">
                أسرع خدمة تعاملت معها... السواق وصل خلال نص ساعة
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/customer.png"
                    alt="customer"
                    width={62}
                    height={62}
                    className="rounded-full"
                  />
                  <span className="text-gray-900 font-bold text-[25px] lg:text-[28px]">
                    أبو عبدالله
                  </span>
                </div>

                <span className="text-[#A7AFC2CF] text-[15px] font-medium">
                  25/05/25
                </span>
              </div>

              <div className="flex mb-4">
                <FaStar className="w-6 h-6 text-[#FFCC00] ml-1" />
                <FaStar className="w-6 h-6 text-[#FFCC00] ml-1" />
                <FaStar className="w-6 h-6 text-[#FFCC00] ml-1" />
                <FaStar className="w-6 h-6 text-[#FFCC00] ml-1" />
                <FaStar className="w-6 h-6 text-[#FFCC00]" />
              </div>

              <p className="text-[#000000A6] text-lg leading-relaxed">
                أسرع خدمة تعاملت معها... السواق وصل خلال نص ساعة
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/customer.png"
                    alt="customer"
                    width={62}
                    height={62}
                    className="rounded-full"
                  />
                  <span className="text-gray-900 font-bold text-[25px] lg:text-[28px]">
                    أبو عبدالله
                  </span>
                </div>

                <span className="text-[#A7AFC2CF] text-[15px] font-medium">
                  25/05/25
                </span>
              </div>

              <div className="flex mb-4">
                <FaStar className="w-6 h-6 text-[#FFCC00] ml-1" />
                <FaStar className="w-6 h-6 text-[#FFCC00] ml-1" />
                <FaStar className="w-6 h-6 text-[#FFCC00] ml-1" />
                <FaStar className="w-6 h-6 text-[#FFCC00] ml-1" />
                <FaStar className="w-6 h-6 text-[#FFCC00]" />
              </div>

              <p className="text-[#000000A6] text-lg leading-relaxed">
                أسرع خدمة تعاملت معها... السواق وصل خلال نص ساعة
              </p>
            </div>
          </div>

          <div className="flex justify-center mt-12 space-x-3">
            <div className="w-12 h-2 bg-[#5A9CF0] rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
