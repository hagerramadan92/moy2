"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    FaUser, FaPhoneAlt, FaMapMarkerAlt, FaCalendarAlt,
    FaArrowRight, FaCheckCircle, FaMoneyBillWave, FaTimes, FaHistory, FaPlus
} from 'react-icons/fa';
import { IoDocumentText } from "react-icons/io5";
import { MdBusinessCenter } from 'react-icons/md';
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import Swal from "sweetalert2";

export default function ContractDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const contractId = params.id as string;

    // Mock contract data - in production, fetch based on contractId
    const contracts = [
        {
            id: "CONT-882",
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
            id: "CONT-721",
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
        <div className="space-y-8 fade-in-up">
            {/* Enhanced Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm mb-6">
                <button 
                    onClick={() => router.push('/myProfile/contracting')}
                    className="text-muted-foreground hover:text-primary transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-secondary/50"
                >
                    التعاقدات
                </button>
                <FaArrowRight className="w-3 h-3 text-muted-foreground rotate-180" />
                <span className="font-bold text-foreground px-3 py-1.5 rounded-lg bg-primary/10 text-primary">تفاصيل العقد #{contractId}</span>
            </div>

            {/* Enhanced Professional Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white dark:bg-card border border-border/60 rounded-[2.5rem] shadow-xl overflow-hidden relative"
            >
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#124987] text-white relative overflow-hidden">
                    {/* Animated Background Elements */}
                    <div className="absolute top-0 right-0 opacity-[0.03]">
                        <IoDocumentText size={220} />
                    </div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-white/3 rounded-full blur-2xl"></div>
                    
                    <div className="relative z-10 p-8 md:p-12">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            {/* Left Section */}
                            <div className="space-y-5 flex-1">
                                <div className="flex items-start gap-4">
                                    <motion.div 
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                        className="w-18 h-18 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/10"
                                    >
                                        {contract.type === 'commercial' ? (
                                            <MdBusinessCenter className="w-9 h-9" />
                                        ) : (
                                            <FaUser className="w-8 h-8" />
                                        )}
                                    </motion.div>
                                    <div className="flex-1">
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <p className="text-xs opacity-90 font-bold uppercase tracking-wider mb-2">
                                                {contract.type === 'commercial' ? 'تعاقد تجاري' : 'تعاقد شخصي'}
                                            </p>
                                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3">{contract.title}</h1>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl font-mono font-bold text-sm border border-white/10">
                                                    #{contract.id}
                                                </span>
                                                <span className={`px-4 py-2 rounded-xl font-bold text-sm border ${
                                                    contract.status === 'active' 
                                                        ? 'bg-green-500/30 border-green-300/50 backdrop-blur-md' 
                                                        : 'bg-white/20 border-white/10 backdrop-blur-md'
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
                                className="bg-white/20 backdrop-blur-md rounded-2xl p-6 min-w-[200px] text-center border border-white/10 shadow-lg"
                            >
                                <p className="text-xs opacity-90 font-bold uppercase tracking-wider mb-3">القيمة الإجمالية</p>
                                <p className="text-4xl md:text-5xl font-black mb-1">{contract.cost}</p>
                                <div className="flex items-center justify-center gap-1.5 mt-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                                    <p className="text-xs opacity-70">قيمة العقد</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Contact & Location */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Enhanced Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="bg-white dark:bg-card border-2 border-border/60 rounded-[2.5rem] p-8 shadow-lg hover:shadow-xl transition-all overflow-hidden relative group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#579BE8]/5 to-transparent rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#579BE8] to-[#124987] flex items-center justify-center shadow-lg shadow-[#579BE8]/20"
                                >
                                    <FaUser className="w-7 h-7 text-white" />
                                </motion.div>
                                معلومات التواصل
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-[#579BE8]/5 to-[#124987]/5 rounded-2xl p-6 border-2 border-[#579BE8]/20 hover:border-[#579BE8]/40 transition-all">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-[#579BE8]"></div>
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">مقدم الطلب</p>
                                    </div>
                                    <p className="text-xl font-black text-foreground">{contract.applicant}</p>
                                </div>
                                <div className="bg-gradient-to-br from-[#579BE8]/5 to-[#124987]/5 rounded-2xl p-6 border-2 border-[#579BE8]/20 hover:border-[#579BE8]/40 transition-all">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-[#579BE8]"></div>
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">رقم الجوال</p>
                                    </div>
                                    <p className="text-xl font-black font-mono text-foreground" dir="ltr">{contract.phone}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Enhanced Location Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        className="bg-white dark:bg-card border-2 border-border/60 rounded-[2.5rem] p-8 shadow-lg hover:shadow-xl transition-all overflow-hidden relative group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#579BE8]/5 to-transparent rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#579BE8] to-[#124987] flex items-center justify-center shadow-lg shadow-[#579BE8]/20"
                                >
                                    <FaMapMarkerAlt className="w-7 h-7 text-white" />
                                </motion.div>
                                موقع التوصيل
                            </h3>
                            
                            <div className="bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/10 p-6 rounded-2xl border-2 border-[#579BE8]/20 hover:border-[#579BE8]/40 transition-all">
                                <div className="flex items-start gap-3">
                                    <FaMapMarkerAlt className="w-5 h-5 text-[#579BE8] mt-1 flex-shrink-0" />
                                    <p className="text-base font-bold leading-relaxed text-foreground">{contract.address}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Enhanced Notes Section */}
                    {contract.notes && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                            className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-500/10 dark:via-orange-500/10 dark:to-amber-500/10 border-2 border-amber-200 dark:border-amber-500/30 rounded-[2.5rem] p-8 shadow-lg hover:shadow-xl transition-all overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 opacity-10">
                                <IoDocumentText size={120} className="text-amber-600" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black mb-5 flex items-center gap-3 text-amber-700 dark:text-amber-400">
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 dark:bg-amber-500/30 flex items-center justify-center">
                                        <IoDocumentText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    ملاحظات إضافية
                                </h3>
                                <div className="bg-white/60 dark:bg-amber-500/10 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50 dark:border-amber-500/20">
                                    <p className="text-base leading-relaxed font-medium text-amber-900 dark:text-amber-100">"{contract.notes}"</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right Column - Timeline & Actions */}
                <div className="space-y-6">
                    {/* Enhanced Timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="bg-white dark:bg-card border-2 border-border/60 rounded-[2.5rem] p-8 shadow-lg hover:shadow-xl transition-all overflow-hidden relative group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/5 to-transparent rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20"
                                >
                                    <FaCalendarAlt className="w-7 h-7 text-white" />
                                </motion.div>
                                الجدول الزمني
                            </h3>
                            
                            <div className="space-y-8">
                                <div className="relative">
                                    <div className="absolute right-[23px] top-12 bottom-12 w-1 bg-gradient-to-b from-green-500 via-green-400 to-green-200 rounded-full"></div>
                                    
                                    <div className="space-y-8 relative">
                                        <motion.div 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="flex gap-5"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-green-500/30 z-10 border-4 border-white dark:border-card">
                                                <FaCheckCircle className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 pt-2">
                                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">تاريخ البدء</p>
                                                <p className="text-lg font-black text-foreground">{contract.date}</p>
                                            </div>
                                        </motion.div>
                                        
                                        <motion.div 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="flex gap-5"
                                        >
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl z-10 border-4 border-white dark:border-card ${
                                                contract.status === 'active' 
                                                    ? 'bg-gradient-to-br from-green-200 to-green-300 text-green-700' 
                                                    : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/30'
                                            }`}>
                                                <FaCheckCircle className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 pt-2">
                                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">تاريخ الانتهاء</p>
                                                <p className="text-lg font-black text-foreground">{contract.endDate}</p>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                                
                                <motion.div 
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border-2 border-green-200 dark:border-green-500/30 p-6 rounded-2xl text-center hover:shadow-lg transition-all"
                                >
                                    <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider mb-2">المدة الإجمالية</p>
                                    <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{contract.duration}</p>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Enhanced Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        className="bg-white dark:bg-card border-2 border-border/60 rounded-[2.5rem] p-6 shadow-lg space-y-3"
                    >
                        <h3 className="text-lg font-black text-foreground mb-4 px-2">الإجراءات</h3>
                        
                        <Button 
                            onClick={() => router.back()}
                            className="w-full py-6 rounded-2xl text-base font-black bg-gradient-to-r from-[#579BE8] via-[#579BE8] to-[#124987] hover:from-[#4a8dd8] hover:via-[#4a8dd8] hover:to-[#0f3d6f] hover:shadow-2xl hover:-translate-y-1 text-white shadow-lg shadow-[#579BE8]/30 transition-all flex items-center justify-center gap-2"
                        >
                            <FaArrowRight className="w-5 h-5 rotate-180" />
                            <span>العودة إلى التعاقدات</span>
                        </Button>
                        
                        {contract.status === 'active' && (
                            <Button 
                                className="w-full py-6 rounded-2xl text-base font-black bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 hover:from-amber-600 hover:via-orange-600 hover:to-orange-700 hover:shadow-2xl hover:-translate-y-1 text-white shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
                            >
                                <IoDocumentText className="w-5 h-5" />
                                <span>تعديل العقد</span>
                            </Button>
                        )}

                        {/* Payment History Button */}
                        <Button 
                            onClick={() => {
                                router.push(`/myProfile/contracting/contractDetails/${contractId}/payments`);
                            }}
                            className="w-full py-6 rounded-2xl text-base font-black bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 hover:shadow-2xl hover:-translate-y-1 text-white shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                        >
                            <FaHistory className="w-5 h-5" />
                            <span>سجل المدفوعات</span>
                        </Button>

                        {/* Cancel Contract Button - Only for active contracts */}
                        {contract.status === 'active' && (
                            <Button 
                                onClick={() => {
                                    Swal.fire({
                                        title: "إلغاء العقد",
                                        text: "هل أنت متأكد من إلغاء هذا العقد؟ لا يمكن التراجع عن هذا الإجراء.",
                                        icon: "warning",
                                        showCancelButton: true,
                                        confirmButtonText: "نعم، إلغاء العقد",
                                        cancelButtonText: "إلغاء",
                                        confirmButtonColor: "#dc2626",
                                        cancelButtonColor: "#579BE8",
                                        background: "var(--background)",
                                        color: "var(--foreground)",
                                        customClass: {
                                            popup: "rounded-[2.5rem] border border-border/50 shadow-2xl",
                                            confirmButton: "rounded-2xl font-black px-10 py-3",
                                            cancelButton: "rounded-2xl font-black px-10 py-3",
                                        }
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            console.log('Canceling contract:', contractId);
                                            Swal.fire({
                                                title: "تم الإلغاء!",
                                                text: "تم إلغاء العقد بنجاح.",
                                                icon: "success",
                                                confirmButtonText: "حسناً",
                                                confirmButtonColor: "#579BE8",
                                                background: "var(--background)",
                                                color: "var(--foreground)",
                                                customClass: {
                                                    popup: "rounded-[2.5rem] border border-border/50 shadow-2xl",
                                                    confirmButton: "rounded-2xl font-black px-10 py-3",
                                                }
                                            });
                                        }
                                    });
                                }}
                                className="w-full py-6 rounded-2xl text-base font-black bg-gradient-to-r from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:via-red-700 hover:to-rose-700 hover:shadow-2xl hover:-translate-y-1 text-white shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
                            >
                                <FaTimes className="w-5 h-5" />
                                <span>إلغاء العقد</span>
                            </Button>
                        )}

                        {/* Create New Contract Button */}
                        <Button 
                            onClick={() => {
                                router.push('/myProfile/contracting');
                            }}
                            className="w-full py-6 rounded-2xl text-base font-black bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-700 hover:shadow-2xl hover:-translate-y-1 text-white shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
                        >
                            <FaPlus className="w-5 h-5" />
                            <span>إنشاء عقد جديد</span>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
