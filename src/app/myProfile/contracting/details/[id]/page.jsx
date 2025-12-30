"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    FaUser, FaPhoneAlt, FaMapMarkerAlt, FaCalendarAlt,
    FaArrowRight, FaCheckCircle, FaMoneyBillWave, FaTimes, FaHistory, FaPlus, FaChartLine
} from 'react-icons/fa';
import { IoDocumentText } from "react-icons/io5";
import { MdBusinessCenter } from 'react-icons/md';
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import Swal from "sweetalert2";

export default function ContractDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const contractId = params.id;

    // Mock contract data - in production, fetch based on contractId
    const contracts = [
        {
            id: "882",
            fullId: "CONT-882",
            type: "commercial",
            title: "مؤسسة وايت مياه التجارية",
            applicant: "فهد السليمان",
            phone: "0501234567",
            address: "الرياض، حي الملقا، شارع الأمير محمد بن سعد",
            date: "15 نوفمبر 2024",
            duration: "6 أشهر",
            endDate: "15 مايو 2025",
            cost: "4,500 ريال",
            status: "active",
            notes: "توصيل دوري كل يوم سبت واثنين"
        },
        {
            id: "721",
            fullId: "CONT-721",
            type: "personal",
            title: "منزل حي الملقا",
            applicant: "عبدالله محمد الفهد",
            phone: "0559876543",
            address: "الرياض، حي النرجس، فيلا 12",
            date: "02 نوفمبر 2024",
            duration: "شهر واحد",
            endDate: "02 ديسمبر 2024",
            cost: "800 ريال",
            status: "completed",
            notes: "الاتصال قبل الوصول بـ 15 دقيقة"
        },
        {
            id: "654",
            fullId: "CONT-654",
            type: "commercial",
            title: "شركة النور للتجارة",
            applicant: "سعد العتيبي",
            phone: "0551234567",
            address: "جدة، حي الروضة، شارع الأمير سلطان",
            date: "20 أكتوبر 2024",
            duration: "3 أشهر",
            endDate: "20 يناير 2025",
            cost: "2,400 ريال",
            status: "active",
            notes: "توصيل صباحي فقط"
        },
        {
            id: "543",
            fullId: "CONT-543",
            type: "personal",
            title: "استراحة العليا",
            applicant: "خالد الدوسري",
            phone: "0567891234",
            address: "الرياض، حي العليا، طريق الملك فهد",
            date: "10 سبتمبر 2024",
            duration: "شهر واحد",
            endDate: "10 أكتوبر 2024",
            cost: "600 ريال",
            status: "completed",
            notes: ""
        },
    ];

    const contract = contracts.find(c => c.id === contractId);

    if (!contract) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold">العقد غير موجود</h2>
                    <Button onClick={() => router.back()} className="bg-gradient-to-r from-[#579BE8] to-[#124987]">
                        العودة للخلف
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6 fade-in-up">
            {/* Enhanced Breadcrumb Navigation */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs md:text-sm mb-3 md:mb-4"
            >
                <button 
                    onClick={() => router.push('/myProfile/contracting/history')}
                    className="text-muted-foreground hover:text-[#579BE8] transition-all font-medium px-3 py-1.5 rounded-lg hover:bg-[#579BE8]/5 hover:shadow-sm"
                >
                    سجل التعاقدات
                </button>
                <FaArrowRight className="w-3 h-3 text-muted-foreground rotate-180" />
                <span className="font-bold text-foreground px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#579BE8]/10 to-[#124987]/10 text-[#579BE8] border border-[#579BE8]/20 text-xs md:text-sm">
                    تفاصيل العقد #{contract.fullId}
                </span>
            </motion.div>

            {/* Enhanced Professional Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white dark:bg-card border-2 border-border/60 rounded-2xl shadow-xl overflow-hidden relative group hover:shadow-2xl transition-all duration-300"
            >
                <div className="bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] text-white relative overflow-hidden">
                    {/* Enhanced Animated Background Elements */}
                    <div className="absolute top-0 right-0 opacity-[0.04]">
                        <IoDocumentText size={200} className="rotate-12" />
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
                                        {contract.type === 'commercial' ? (
                                            <MdBusinessCenter className="w-6 h-6 md:w-7 md:h-7" />
                                        ) : (
                                            <FaUser className="w-5 h-5 md:w-6 md:h-6" />
                                        )}
                                    </motion.div>
                                    <div className="flex-1">
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <p className="text-[10px] md:text-xs opacity-95 font-bold uppercase tracking-wider mb-1.5 text-white/90">
                                                {contract.type === 'commercial' ? 'تعاقد تجاري' : 'تعاقد شخصي'}
                                            </p>
                                            <h1 className="text-xl md:text-2xl lg:text-3xl font-black mb-3 leading-tight">{contract.title}</h1>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="bg-white/25 backdrop-blur-lg px-3 py-1.5 rounded-lg font-mono font-bold text-xs border-2 border-white/20 shadow-md">
                                                    #{contract.fullId}
                                                </span>
                                                <span className={`px-3 py-1.5 rounded-lg font-bold text-xs border-2 backdrop-blur-lg shadow-md ${
                                                    contract.status === 'active' 
                                                        ? 'bg-green-500/40 border-green-300/60 text-white' 
                                                        : 'bg-white/25 border-white/20'
                                                }`}>
                                                    {contract.status === 'active' ? '✓ نشط حالياً' : '✓ مكتمل'}
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
                                <p className="text-[10px] md:text-xs opacity-95 font-bold uppercase tracking-wider mb-2">القيمة الإجمالية</p>
                                <p className="text-2xl md:text-3xl font-black mb-1 drop-shadow-lg">{contract.cost}</p>
                                <div className="flex items-center justify-center gap-1.5 mt-2 pt-2 border-t border-white/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-sm"></div>
                                    <p className="text-[10px] opacity-80 font-medium">قيمة العقد</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
                {/* Left Column - Contact & Location */}
                <div className="lg:col-span-2 space-y-4 md:space-y-5">
                    {/* Enhanced Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="bg-white dark:bg-card border-2 border-border/60 rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#579BE8]/8 to-transparent rounded-full blur-3xl group-hover:opacity-80 transition-opacity"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#124987]/5 to-transparent rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                            <h3 className="text-lg md:text-xl font-black mb-4 flex items-center gap-2.5">
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#579BE8] to-[#124987] flex items-center justify-center shadow-lg shadow-[#579BE8]/30 border-2 border-[#579BE8]/20"
                                >
                                    <FaUser className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </motion.div>
                                <span>معلومات التواصل</span>
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <motion.div 
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="bg-gradient-to-br from-[#579BE8]/8 via-[#579BE8]/5 to-[#124987]/5 rounded-xl p-4 md:p-5 border-2 border-[#579BE8]/20 hover:border-[#579BE8]/50 transition-all shadow-md hover:shadow-lg group/item"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-[#579BE8] shadow-sm shadow-[#579BE8]/50"></div>
                                        <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-wider">مقدم الطلب</p>
                                    </div>
                                    <p className="text-base md:text-lg font-black text-foreground group-hover/item:text-[#579BE8] transition-colors">{contract.applicant}</p>
                                </motion.div>
                                <motion.div 
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="bg-gradient-to-br from-[#579BE8]/8 via-[#579BE8]/5 to-[#124987]/5 rounded-xl p-4 md:p-5 border-2 border-[#579BE8]/20 hover:border-[#579BE8]/50 transition-all shadow-md hover:shadow-lg group/item"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-[#579BE8] shadow-sm shadow-[#579BE8]/50"></div>
                                        <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-wider">رقم الجوال</p>
                                    </div>
                                    <p className="text-base md:text-lg font-black font-mono text-foreground group-hover/item:text-[#579BE8] transition-colors" dir="ltr">{contract.phone}</p>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Enhanced Location Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        className="bg-white dark:bg-card border-2 border-border/60 rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#579BE8]/8 to-transparent rounded-full blur-3xl group-hover:opacity-80 transition-opacity"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#124987]/5 to-transparent rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                            <h3 className="text-lg md:text-xl font-black mb-4 flex items-center gap-2.5">
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#579BE8] to-[#124987] flex items-center justify-center shadow-lg shadow-[#579BE8]/30 border-2 border-[#579BE8]/20"
                                >
                                    <FaMapMarkerAlt className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </motion.div>
                                <span>موقع التوصيل</span>
                            </h3>
                            
                            <motion.div 
                                whileHover={{ scale: 1.01, y: -2 }}
                                className="bg-gradient-to-br from-[#579BE8]/10 via-[#579BE8]/8 to-[#124987]/10 p-4 md:p-5 rounded-xl border-2 border-[#579BE8]/25 hover:border-[#579BE8]/50 transition-all shadow-md hover:shadow-lg"
                            >
                                <div className="flex items-start gap-2.5 md:gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#579BE8]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <FaMapMarkerAlt className="w-4 h-4 text-[#579BE8]" />
                                    </div>
                                    <p className="text-sm md:text-base font-bold leading-relaxed text-foreground flex-1">{contract.address}</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Enhanced Notes Section */}
                    {contract.notes && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                            className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-500/10 dark:via-orange-500/10 dark:to-amber-500/10 border-2 border-amber-200/60 dark:border-amber-500/30 rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group"
                        >
                            <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-15 transition-opacity">
                                <IoDocumentText size={100} className="text-amber-600 rotate-12" />
                            </div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-2xl"></div>
                            <div className="relative z-10">
                                <h3 className="text-lg md:text-xl font-black mb-4 flex items-center gap-2.5 text-amber-700 dark:text-amber-400">
                                    <motion.div 
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-500/25 dark:bg-amber-500/30 flex items-center justify-center shadow-lg border-2 border-amber-400/30"
                                    >
                                        <IoDocumentText className="w-5 h-5 md:w-6 md:h-6 text-amber-600 dark:text-amber-400" />
                                    </motion.div>
                                    <span>ملاحظات إضافية</span>
                                </h3>
                                <motion.div 
                                    whileHover={{ scale: 1.01 }}
                                    className="bg-white/70 dark:bg-amber-500/15 backdrop-blur-sm rounded-xl p-4 md:p-5 border-2 border-amber-200/60 dark:border-amber-500/25 shadow-md"
                                >
                                    <p className="text-sm md:text-base leading-relaxed font-medium text-amber-900 dark:text-amber-100">"{contract.notes}"</p>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right Column - Timeline */}
                <div>
                    {/* Enhanced Timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="bg-white dark:bg-card border-2 border-border/60 rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/8 to-transparent rounded-full blur-3xl group-hover:opacity-80 transition-opacity"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                            <h3 className="text-lg md:text-xl font-black mb-5 md:mb-6 flex items-center gap-2.5">
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 border-2 border-green-400/20"
                                >
                                    <FaCalendarAlt className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </motion.div>
                                <span>الجدول الزمني</span>
                            </h3>
                            
                            <div className="space-y-5 md:space-y-6">
                                <div className="relative">
                                    <div className="absolute right-[19px] md:right-[23px] top-12 bottom-12 w-1 bg-gradient-to-b from-green-500 via-green-400 to-green-200 rounded-full shadow-sm"></div>
                                    
                                    <div className="space-y-5 md:space-y-6 relative">
                                        <motion.div 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                            whileHover={{ x: 3 }}
                                            className="flex gap-3 md:gap-4"
                                        >
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-green-500/40 z-10 border-3 border-white dark:border-card">
                                                <FaCheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                                            </div>
                                            <div className="flex-1 pt-1.5">
                                                <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1.5">تاريخ البدء</p>
                                                <p className="text-sm md:text-base font-black text-foreground">{contract.date}</p>
                                            </div>
                                        </motion.div>
                                        
                                        <motion.div 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                            whileHover={{ x: 3 }}
                                            className="flex gap-3 md:gap-4"
                                        >
                                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg z-10 border-3 border-white dark:border-card ${
                                                contract.status === 'active' 
                                                    ? 'bg-gradient-to-br from-green-200 to-green-300 text-green-700 shadow-green-300/30' 
                                                    : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/40'
                                            }`}>
                                                <FaCheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                                            </div>
                                            <div className="flex-1 pt-1.5">
                                                <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1.5">تاريخ الانتهاء</p>
                                                <p className="text-sm md:text-base font-black text-foreground">{contract.endDate}</p>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                                
                                <motion.div 
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border-2 border-green-200/60 dark:border-green-500/30 p-4 md:p-5 rounded-xl text-center shadow-md hover:shadow-lg transition-all"
                                >
                                    <p className="text-[10px] md:text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider mb-1.5">المدة الإجمالية</p>
                                    <p className="text-xl md:text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{contract.duration}</p>
                                </motion.div>

                                {/* Consumption Link */}
                                <motion.div 
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                >
                                    <button
                                        onClick={() => router.push(`/myProfile/contracting/details/${contractId}/consumption`)}
                                        className="w-full bg-gradient-to-r from-[#579BE8] via-[#579BE8] to-[#124987] hover:from-[#4a8dd8] hover:via-[#4a8dd8] hover:to-[#0f3d6f] text-white py-3 md:py-4 rounded-xl font-bold text-sm md:text-base shadow-lg shadow-[#579BE8]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FaChartLine className="w-4 h-4 md:w-5 md:h-5" />
                                        <span>عرض الاستهلاك</span>
                                        <FaArrowRight className="w-3 h-3 md:w-4 md:h-4 rotate-180" />
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

