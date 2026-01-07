'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Calendar,
  Package,
  Phone,
  MessageCircle,
  ArrowRight,
  HelpCircle,
  Clock,
  CheckCircle2,
  Navigation,
  Droplet,
  FileText,
  Truck,
  Shield,
  Star,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  X,
  Eye
} from 'lucide-react';
import CancelOrderModal from '../../ui/CancelOrderModal';
import CustomerSupportPage from './CustomerSupportPage';

// Dynamically import map to avoid SSR
const OrderTrackingMap = dynamic(
  () => import('./OrderTrackingMap'),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center animate-pulse"><span className="text-gray-400">جاري تحميل الخريطة...</span></div> }
);

/**
 * Main component for displaying order details and driver information
 */
export default function OrderDetailsPage() {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [showSupportPage, setShowSupportPage] = useState(false);
  const router = useRouter();

  const handleOpenCancelModal = () => {
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
  };

  const handleCancelOrder = () => {
    console.log('Order cancelled');
    setIsCancelModalOpen(false);
  };

  const handleHelpClick = () => {
    setShowSupportPage(true);
  };

  const handleBackFromSupport = () => {
    setShowSupportPage(false);
  };

  const handleContinueOrder = () => {
    console.log('Continue order - modal handles this action');
  };

  const handleDriverCardClick = () => {
    router.push('/driver-rating');
  };

  if (showSupportPage) {
    return <CustomerSupportPage onBack={handleBackFromSupport} />;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto py-3 px-3 md:px-6 lg:px-8 ">
        <div className="">
          {/*  Header Section */}
          {/* Enhanced Breadcrumb Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs md:text-sm mb-3 md:mb-4"
          >
            <button 
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-[#579BE8] transition-all font-medium px-3 py-1.5 rounded-lg hover:bg-[#579BE8]/5 hover:shadow-sm"
            >
              العودة
            </button>
            <ChevronLeft className="w-3 h-3 text-muted-foreground rotate-180" />
            <span className="font-bold text-foreground px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#579BE8]/10 to-[#124987]/10 text-[#579BE8] border border-[#579BE8]/20 text-xs md:text-sm">
              تفاصيل الطلب #112312121
            </span>
          </motion.div>

          {/* Enhanced Professional Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-card border-2 border-border/60 rounded-2xl shadow-xl overflow-hidden relative group hover:shadow-2xl transition-all duration-300 mb-6"
          >
            <div className="bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] text-white relative overflow-hidden">
              {/* Enhanced Animated Background Elements */}
              <div className="absolute top-0 right-0 opacity-[0.04]">
                <Package size={200} className="rotate-12" />
              </div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/8 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 p-4 md:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
                  {/* Left Section */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start gap-3">
                      <motion.div 
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/25 backdrop-blur-lg flex items-center justify-center shadow-xl border-2 border-white/20 group-hover:border-white/30 transition-all"
                      >
                        <Package className="w-6 h-6 md:w-7 md:h-7" />
                      </motion.div>
                      <div className="flex-1">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <p className="text-[10px] md:text-xs opacity-95 font-bold uppercase tracking-wider mb-1.5 text-white/90">
                            طلب توصيل مياه
                          </p>
                          <h1 className="text-xl md:text-2xl lg:text-3xl font-black mb-3 leading-tight">تفاصيل الطلب</h1>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-white/25 backdrop-blur-lg px-3 py-1.5 rounded-lg font-mono font-bold text-xs border-2 border-white/20 shadow-md">
                              #112312121
                            </span>
                            <span className="px-3 py-1.5 rounded-lg font-bold text-xs border-2 backdrop-blur-lg shadow-md bg-green-500/40 border-green-300/60 text-white">
                              <span className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                نشط
                              </span>
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Section - Cost */}
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/25 backdrop-blur-lg rounded-xl p-4 md:p-5 min-w-[160px] md:min-w-[180px] text-center border-2 border-white/20 shadow-xl"
                  >
                    <p className="text-[10px] md:text-xs opacity-95 font-bold uppercase tracking-wider mb-2">التكلفة الإجمالية</p>
                    <p className="text-2xl md:text-3xl font-black mb-1 drop-shadow-lg">150 ريال</p>
                    <div className="flex items-center justify-center gap-1.5 mt-2 pt-2 border-t border-white/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-sm"></div>
                      <p className="text-[10px] opacity-80 font-medium">قيمة الطلب</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Progress Timeline - Modern Card Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border-2 border-[#579BE8]/20 p-5 mb-6 overflow-hidden relative"
          >
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#579BE8] rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#4a8dd8]/70 rounded-full blur-3xl" />
            </div>

            <div className="relative flex flex-col md:flex-row items-center gap-4 md:gap-6">
              {/* Progress Steps */}
              <div className="flex items-center gap-3 flex-1 w-full">
                {/* Step 1 - Confirmed */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="flex items-center gap-3 bg-gradient-to-r from-[#579BE8]/10 to-[#579BE8]/5 rounded-xl px-4 py-3 border border-[#579BE8]/20 flex-1"
                >
                  <div className="w-10 h-10 bg-[#579BE8] rounded-xl flex items-center justify-center shadow-md shadow-[#579BE8]/30">
                    <CheckCircle2 size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#579BE8] font-bold uppercase tracking-wider">الخطوة 1</p>
                    <p className="text-sm font-bold text-gray-900">تم التأكيد</p>
                  </div>
                </motion.div>

                {/* Connector */}
                <div className="hidden md:flex items-center">
                  <div className="w-6 h-1 bg-[#579BE8] rounded-full" />
                  <div className="w-2 h-2 bg-[#579BE8] rounded-full" />
                </div>

                {/* Step 2 - In Progress */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="flex items-center gap-3 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987] rounded-xl px-4 py-3 flex-1 shadow-lg shadow-[#579BE8]/30"
                >
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center animate-pulse">
                    <Truck size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">الخطوة 2</p>
                    <p className="text-sm font-bold text-white">قيد التنفيذ</p>
                  </div>
                </motion.div>

                {/* Connector */}
                <div className="hidden md:flex items-center">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <div className="w-6 h-1 bg-gray-200 rounded-full" />
                </div>

                {/* Step 3 - Delivery */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 flex-1"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
                    <Package size={20} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">الخطوة 3</p>
                    <p className="text-sm font-bold text-gray-400">التسليم</p>
                  </div>
                </motion.div>
              </div>

              {/* Time Display */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] rounded-xl px-5 py-3 shadow-lg shadow-[#579BE8]/30"
              >
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Clock size={20} className="text-white" />
                </div>
                <div className="text-white">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">الوقت المتوقع</p>
                  <p className="text-xl font-black">55 دقيقة</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">


            {/* Right Column - Main Content */}
            <div className="lg:col-span-8 space-y-6">

              {/* Order Details Card - Professional Layout */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Package size={24} className="text-[#579BE8]" />
                    تفاصيل الطلب
                  </h3>
                </div>

                <div className="p-6 space-y-6">
                  {/* Location */}
                  <div className="flex items-start gap-4 p-4 bg-[#579BE8]/10 rounded-2xl border border-[#579BE8]/20">
                    <div className="w-12 h-12 bg-[#579BE8]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin size={24} className="text-[#579BE8]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">موقع التسليم</p>
                      <p className="text-lg font-bold text-gray-900">الرياض - مستشفى الملك فيصل</p>
                    </div>
                  </div>

                  {/* Order Info Grid - Professional Design */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Water Type */}
                    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#579BE8]/0 to-[#124987]/0 group-hover:from-[#579BE8]/5 group-hover:to-[#124987]/5 transition-all duration-300"></div>
                      <div className="relative p-5 text-center">
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/10 rounded-xl flex items-center justify-center border border-[#579BE8]/20 group-hover:border-[#579BE8]/30 transition-colors">
                            <Droplet size={20} className="text-[#579BE8]" />
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">نوع المياه</p>
                          <p className="text-base font-bold text-gray-900 leading-tight">غير صالحة للشرب</p>
                        </div>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#579BE8]/0 to-[#124987]/0 group-hover:from-[#579BE8]/5 group-hover:to-[#124987]/5 transition-all duration-300"></div>
                      <div className="relative p-5 text-center">
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/10 rounded-xl flex items-center justify-center border border-[#579BE8]/20 group-hover:border-[#579BE8]/30 transition-colors">
                            <Package size={20} className="text-[#579BE8]" />
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">الكمية</p>
                          <p className="text-base font-bold text-gray-900 leading-tight">6 طن</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Number */}
                    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#579BE8]/0 to-[#124987]/0 group-hover:from-[#579BE8]/5 group-hover:to-[#124987]/5 transition-all duration-300"></div>
                      <div className="relative p-5 text-center">
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/10 rounded-xl flex items-center justify-center border border-[#579BE8]/20 group-hover:border-[#579BE8]/30 transition-colors">
                            <FileText size={20} className="text-[#579BE8]" />
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">رقم الطلب</p>
                          <p className="text-base font-bold text-gray-900 font-mono leading-tight">112312121</p>
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#579BE8]/0 to-[#124987]/0 group-hover:from-[#579BE8]/5 group-hover:to-[#124987]/5 transition-all duration-300"></div>
                      <div className="relative p-5 text-center">
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/10 rounded-xl flex items-center justify-center border border-[#579BE8]/20 group-hover:border-[#579BE8]/30 transition-colors">
                            <Calendar size={20} className="text-[#579BE8]" />
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">التاريخ</p>
                          <div className="space-y-1">
                            <p className="text-base font-bold text-gray-900 leading-tight">3 نوفمبر</p>
                            <p className="text-xs font-medium text-gray-500">12:00 ص</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {/* <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={handleOpenCancelModal}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl h-12 font-semibold transition-all border-2 border-red-200 hover:border-red-300"
                    >
                      <X size={20} />
                      <span>إلغاء الطلب</span>
                    </button>

                    <button
                      onClick={handleHelpClick}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#579BE8] to-[#124987] hover:from-[#4a8dd8] hover:to-[#0f3d6f] text-white rounded-xl h-12 font-semibold transition-all shadow-lg shadow-[#579BE8]/30"
                    >
                      <HelpCircle size={20} />
                      <span>مساعدة</span>
                    </button>
                  </div> */}
                </div>
              </motion.div>

              {/* Map Section - Professional Design */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Navigation size={24} className="text-[#579BE8]" />
                    موقع التسليم
                  </h3>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 via-green-400/10 to-emerald-500/10 border border-green-300/30 rounded-xl backdrop-blur-sm shadow-sm">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <div className="absolute w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="absolute w-2.5 h-2.5 bg-green-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <Clock size={15} className="text-green-600 relative z-10" />
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wider">تحديث مباشر</span>
                  </div>
                </div>
                <div className="relative h-80 md:h-96">
                  <OrderTrackingMap 
                    deliveryLocation={{ lat: 24.7136, lng: 46.6753 }}
                    driverLocation={{ lat: 24.7186, lng: 46.6803 }}
                    className="w-full h-full rounded-b-3xl"
                  />
                </div>
              </motion.div>
            </div>
            {/* Left Sidebar - Driver Card */}
            <div className="lg:col-span-4 space-y-6">
              {/* Driver Card - Clean White Design */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border-2 border-[#579BE8]/20 shadow-lg shadow-[#579BE8]/5 hover:shadow-2xl hover:shadow-[#579BE8]/20 hover:border-[#579BE8]/40 transition-all duration-300 overflow-hidden sticky top-24"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full border border-green-200">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-medium text-green-700">في الطريق</span>
                        </div>
                      </div>
                 
                    </div>
                    <button
                      onClick={handleDriverCardClick}
                      className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity duration-200 active:scale-95"
                      aria-label="عرض تفاصيل السائق"
                    >
                      <div className="relative w-6 h-6">
                        <Image
                          src="/Vector (6).png"
                          alt="File icon"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="font-cairo font-medium text-[10px] text-gray-500">الملف</span>
                    </button>
                  </div>

                  {/* Driver Image */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden ring-3 ring-[#579BE8]/10 hover:ring-[#579BE8]/20 transition-all duration-300">
                        <Image
                          src="/image 4.png"
                          alt="Driver"
                          fill
                          className="object-cover hover:scale-110 transition-transform duration-300"
                          sizes="96px"
                          quality={90}
                          priority
                        />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 bg-[#579BE8] rounded-full p-1 shadow-lg">
                        <CheckCircle2 size={12} className="text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Driver Name */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <h3 className="text-base font-bold text-gray-900 text-center">سعود بن ناصر المطيري</h3>
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between gap-2 bg-gray-50/50 rounded-xl p-3 border border-gray-100 mb-4">
                    <div className="flex items-center gap-1.5 flex-1">
                      <Clock size={14} className="text-gray-500" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900">55 د</span>
                        <span className="text-[9px] text-gray-500">دقيقة</span>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="flex items-center gap-1.5 flex-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900">4.5</span>
                        <span className="text-[9px] text-gray-500">تقييم</span>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="flex items-center gap-1.5 flex-1">
                      <TrendingUp size={14} className="text-gray-500" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900">1,439</span>
                        <span className="text-[9px] text-gray-500">طلب</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button
                      className="w-full h-10 rounded-xl bg-gradient-to-r from-[#579BE8]/10 to-[#579BE8]/5 border border-[#579BE8]/20 flex items-center justify-center gap-2 hover:from-[#579BE8]/20 hover:to-[#579BE8]/10 hover:border-[#579BE8]/30 hover:shadow-md transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('اتصال بالسائق');
                      }}
                    >
                      <Phone size={16} className="text-[#579BE8]" />
                      <span className="text-sm font-bold text-[#579BE8]">اتصال</span>
                    </button>
                    <button
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987] hover:from-[#4a8dd8] hover:via-[#3d7bc7] hover:to-[#0f3d6f] shadow-lg shadow-[#579BE8]/30 hover:shadow-xl hover:shadow-[#579BE8]/40 flex items-center justify-center gap-2 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('دردشة مع السائق');
                      }}
                    >
                      <MessageCircle size={16} className="text-white" />
                      <span className="text-sm font-bold text-white">دردشة</span>
                    </button>
                  </div>
                </div>
              </motion.div>




            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={handleCloseCancelModal}
        onCancelOrder={handleCancelOrder}
        onContinueOrder={handleContinueOrder}
      />
    </>
  );
}
