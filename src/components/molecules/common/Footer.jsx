"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from 'next/navigation';


export default function Footer() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
 const router = useRouter();
  // جلب طرق الدفع من API
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch('https://dashboard.waytmiah.com/api/v1/payment-methods');
        const data = await response.json();
        if (data.status && data.data) {
          setPaymentMethods(data.data);
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);
  const handleSupportClick = (e) => {
    e.preventDefault();
    
    // التحقق من وجود window أولاً ثم localStorage
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken) {
        router.push('/myProfile/support');
      } else {
        router.push('/login?redirect=/myProfile/support');
      }
    }
  };

  return (
    <footer dir="rtl" className="bg-[#072D58] text-white py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-12">
          {/* Logo and Description Section */}
          <div className="flex flex-col gap-1 md:gap-6">
            <div className="flex md:gap-4 items-center">
              <motion.div
                whileHover={{ rotate: -6, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="relative flex md:h-11 md:w-11 w-9 h-9 items-center justify-center rounded-lg md:rounded-2xl text-white me-1 bg-white ring-1 ring-white/40"
              >
                <Image src="/water.png" width={32} height={32} alt="White Water Logo" />
              </motion.div>
              <h3 className="text-xl md:text-3xl font-bold tracking-tight">وايت مياه</h3>
            </div>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-xs">
              منصة توصيل وايتات المياه الرائدة في المملكة العربية السعودية. نربط العملاء مع سواقين موثوقين بأعلى معايير الجودة.
            </p>
          </div>

          {/* Support Section */}
          <div className="flex flex-col">
            <h4 className="text-sm md:text-lg font-bold mb-2 md:mb-6 text-white">الدعم</h4>
            <ul className="space-y-2 md:space-y-4 md:text-start">
              <li>
                <Link href="/contact" className="text-gray-300 text-sm hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  تواصل معنا
                </Link>
              </li>
              <li>
                <Link onClick={handleSupportClick} href="/myProfile/support" className="text-gray-300 text-sm hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  الدعم الفني
                </Link>
              </li>
              <li>
                <Link href="/myProfile/help-center" className="text-gray-300 text-sm hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  مركز المساعدة
                </Link>
              </li>
              <li>
                <Link onClick={handleSupportClick} href="/myProfile/support" className="text-gray-300 text-sm hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  بلغ عن مشكلة
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="flex flex-col md:items-start">
            <h4 className="text-sm md:text-lg font-bold mb-2 md:mb-6 text-white">قانوني</h4>
            <ul className="space-y-2 md:space-y-4 md:text-start">
              <li>
                <Link href="/privacy" className="text-gray-300 text-sm hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 text-sm hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  الشروط والأحكام
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-gray-300 text-sm hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  الأسئلة الشائعة
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div className="flex flex-col">
            <h4 className="text-sm md:text-lg font-bold mb-2 md:mb-6 text-white">الشركة</h4>
            <ul className="space-y-2 md:space-y-4 md:text-start">
              <li>
                <Link href="/about" className="text-gray-300 text-sm hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/how_work" className="text-gray-300 text-sm hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  كيفية العمل
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-gray-300 text-sm hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  الشركاء
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-gray-300 text-sm hover:text-white hover:translate-x-[-4px] transition-all duration-200 block">
                  الفريق
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Bottom Section */}
        <div className="pt-10">
          <div className="flex flex-col items-center gap-8">
            {/* Payment Methods - Dynamic from API */}
            {!loading && paymentMethods.length > 0 && (
              <div className="w-full">
                <p className="text-center text-sm text-gray-300 mb-4">طرق الدفع المتاحة</p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {paymentMethods.map((method) => (
                    <motion.div
                      key={method.id}
                      whileHover={{ scale: 1.05 }}
                      className="relative group"
                      title={method.description}
                    >
                      <div className="relative h-8 w-18 md:h-10 md:w-20 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden hover:border-white/30 transition-all">
                        <Image
                          src={method.image}
                          alt={method.name}
                          fill
                          className="object-contain p-1 opacity-90 hover:opacity-100 transition-opacity"
                          sizes="(max-width: 768px) 80px, 96px"
                        />
                      </div>
                      {/* Tooltip on hover */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        <span className="text-[10px] bg-gray-900 text-white px-2 py-1 rounded">
                          {method.name}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback static payment images if API fails or is loading */}
            {(loading || paymentMethods.length === 0) && (
              <div className="flex items-center justify-center p-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <Image 
                  src="/images/visa.png" 
                  alt="Payment Methods" 
                  width={120} 
                  height={40}
                  className="opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            )}

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
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <div className="w-1 h-1 rounded-full bg-gray-600 hidden sm:block" />
                <Link href="/terms" className="hover:text-white transition-colors">Terms and Conditions</Link>
                <div className="w-1 h-1 rounded-full bg-gray-600 hidden sm:block" />
                <Link href="/privacy" className="hover:text-white transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}