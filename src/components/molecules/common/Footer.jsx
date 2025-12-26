"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DropletIcon } from "../Navbar";
import Image from "next/image";
export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#072D58] to-[#072D58] text-white py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8 sm:mb-12">
          {/* Logo and Description Section */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col sm:flex-row lg:flex-col gap-4 items-start">
            <div className="flex gap-3 items-start">
              <motion.div
                whileHover={{ rotate: -6, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="relative flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm ring-1 ring-white/40"
              >
                <div className="absolute -inset-1 rounded-[18px] bg-gradient-to-br from-sky-500/25 to-blue-600/25 blur-md" />
                <DropletIcon className="relative h-6 w-6" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">وايت مياه</h3>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-xs">
                  منصة توصيل المياة الرائدة في المملكة العربية السعودية نرب العملاء مع سواقين موثوقين
                </p>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="sm:col-span-1">
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">
              الدعم
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200 block"
                >
                  تواصل معنا
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200 block"
                >
                  الدعم الفني
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200 block"
                >
                  مركز المساعدة
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200 block"
                >
                  بلغ عن مشكلة
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="sm:col-span-1">
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">
              قانوني
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200 block"
                >
                  سياسة الخصوصية
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200 block"
                >
                  المصطلحات والتحكم
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200 block"
                >
                  سياسة الاستخدام
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200 block"
                >
                  الأسئلة الشائعة
                </a>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div className="sm:col-span-1">
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">
              الشركة
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200 block"
                >
                  من نحن
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200 block"
                >
                  كيفية العمل
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200 block"
                >
                  الأسعار
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200 block"
                >
                  المدونة
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/20"></div>

      {/* Bottom Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="flex flex-col items-center gap-6 sm:gap-8">
          {/* Payment Logo */}
          <div className="flex justify-center">
            <Image 
              src="/images/visa.png" 
              alt="Payment Methods" 
              width={150} 
              height={50}
            />
          </div>

          {/* Copyright Text */}
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
              جميع الحقوق محفوظة. © 2024 WhiteMyah.
            </p>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              علامة تجارية مسجلة. لا يجوز استخدام أي جزء من هذا الموقع أو التطبيق
              دون إذن كتابي مسبق. محمي بموجب قوانين الملكية الفكرية وحقوق النشر
              المحلية والدولية.
            </p>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <span className="text-gray-600">|</span>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Terms and Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
