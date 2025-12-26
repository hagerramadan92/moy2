"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DropletIcon } from "../Navbar";
import Image from "next/image";
export default function Footer() {
  return (
    <footer dir="rtl" className="bg-[#072D58] text-white py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          {/* Logo and Description Section */}
          <div className="flex flex-col items-center md:items-start text-center md:text-start gap-6">
            <div className="flex gap-4 items-center">
              <motion.div
                whileHover={{ rotate: -6, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/20"
              >
                <div className="absolute -inset-1 rounded-[18px] bg-blue-500/20 blur-lg" />
                <DropletIcon className="relative h-8 w-8" />
              </motion.div>
              <h3 className="text-3xl font-bold tracking-tight">وايت مياه</h3>
            </div>
            <p className="text-base text-gray-300 leading-relaxed max-w-xs">
              منصة توصيل المياة الرائدة في المملكة العربية السعودية. نربط العملاء مع سواقين موثوقين بأعلى معايير الجودة.
            </p>
          </div>

          {/* Support Section */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-lg font-bold mb-6 text-white">الدعم</h4>
            <ul className="space-y-4 text-center md:text-start">
              <li>
                <a href="#" className="text-gray-300 hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  تواصل معنا
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  الدعم الفني
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  مركز المساعدة
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  بلغ عن مشكلة
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-lg font-bold mb-6 text-white">قانوني</h4>
            <ul className="space-y-4 text-center md:text-start">
              <li>
                <a href="#" className="text-gray-300 hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  سياسة الخصوصية
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  المصطلحات والتحكم
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  سياسة الاستخدام
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  الأسئلة الشائعة
                </a>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-lg font-bold mb-6 text-white">الشركة</h4>
            <ul className="space-y-4 text-center md:text-start">
              <li>
                <a href="#" className="text-gray-300 hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  من نحن
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  كيفية العمل
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  الأسعار
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  المدونة
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Bottom Section */}
        <div className="pt-10">
          <div className="flex flex-col items-center gap-8">
            {/* Payment Methods */}
            <div className="flex items-center justify-center p-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <Image 
                src="/images/visa.png" 
                alt="Payment Methods" 
                width={120} 
                height={40}
                className="opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>

            {/* Copyright and Legal */}
            <div className="flex flex-col items-center text-center gap-6 max-w-4xl">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-200">
                  جميع الحقوق محفوظة. © 2024 WhiteMyah.
                </p>
                <p className="text-xs text-gray-400 leading-relaxed underline-offset-4 decoration-gray-500/50">
                  علامة تجارية مسجلة. لا يجوز استخدام أي جزء من هذا الموقع أو التطبيق
                  دون إذن كتابي مسبق. محمي بموجب قوانين الملكية الفكرية وحقوق النشر
                  المحلية والدولية.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <div className="w-1 h-1 rounded-full bg-gray-600 hidden sm:block" />
                <a href="#" className="hover:text-white transition-colors">Terms and Conditions</a>
                <div className="w-1 h-1 rounded-full bg-gray-600 hidden sm:block" />
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
