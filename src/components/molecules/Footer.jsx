"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DropletIcon } from "./Navbar";
import Image from "next/image";
export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#072D58] to-[#072D58] text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 items-center md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          <div className="md:col-span-2 lg:col-span-2 col-span-1 flex gap-2 items-start">
            <motion.div
              whileHover={{ rotate: -6, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm ring-1 ring-white/40"
            >
              <div className="absolute -inset-1 rounded-[18px] bg-gradient-to-br from-sky-500/25 to-blue-600/25 blur-md" />
              <DropletIcon className="relative h-6 w-6" />
            </motion.div>
            <div className="mt-0">
              <h3 className="text-[36px] mt-[-0.7rem] mb-4 ">وايت مياه</h3>
              <p className=" text-[16px] w-[271px] leading-relaxed mb-6">
                منصة توصيل المياة الرائدة في المملكة العربية السعودية نرب
                العملاء مع سواقين موثوقين
              </p>
            </div>
          </div>
          <div className="md:col-span-1 col-span-2">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 pb-2 ">
              الدعم
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200"
                >
                  تواصل معنا
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200"
                >
                  الدعم الفني
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200"
                >
                  مركز المساعدة
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200"
                >
                  بلغ عن مشكلة
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 pb-2 ">
              قانوني
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200"
                >
                  سياسة الخصوصية
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200"
                >
                  المصطلحات والتحكم
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200"
                >
                  سياسة الاستخدام
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200"
                >
                  الأسئلة الشائعة
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 pb-2 ">
              الشركة
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200"
                >
                  من نحن
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200"
                >
                  كيفية العمل
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200"
                >
                  الأسعار
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200"
                >
                  المدونة
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white my-6 sm:my-8"></div>

      <div className="flex flex-col px-2 md:px-1 justify-center items-center gap-4">
       <Image src="/images/visa.png" alt="Logo" width={150} height={50} />
        <p className="w-full md:w-full lg:w-[573px] text-[16px] leading-[170%] text-center">
          جميع الحقوق محفوظة. © 2024 WhiteMyah.
          <br />
          علامة تجارية مسجلة. لا يجوز استخدام أي جزء من هذا الموقع أو التطبيق
          دون إذن كتابي مسبق. محمي بموجب قوانين الملكية الفكرية وحقوق النشر
          المحلية والدولية.
        </p>
        <div className="flex gap-4 order-1 sm:order-2 mb-4 sm:mb-0">
          <a
            href="#"
            className="text-gray-300 hover:text-white text-xs sm:text-sm transition-colors duration-200"
          >
            Privacy Policy
          </a>
          <span className="text-gray-600">|</span>
          <a
            href="#"
            className="text-gray-300 hover:text-white text-xs sm:text-sm transition-colors duration-200"
          >
            Terms and Conditions
          </a>
        </div>
      </div>
    </footer>
  );
}
