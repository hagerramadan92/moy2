"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    FaUser, FaPhoneAlt, FaMapMarkerAlt, FaCalendarAlt,
    FaArrowRight, FaCheckCircle, FaMoneyBillWave
} from 'react-icons/fa';
import { IoDocumentText } from "react-icons/io5";
import { MdBusinessCenter } from 'react-icons/md';
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';

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
        <div className="space-y-6 fade-in-up">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm">
                <button 
                    onClick={() => router.push('/myProfile/contracting')}
                    className="text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                    التعاقدات
                </button>
                <FaArrowRight className="w-3 h-3 text-muted-foreground rotate-180" />
                <span className="font-bold text-foreground">تفاصيل العقد #{contractId}</span>
            </div>

            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-[2.5rem] shadow-xl overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 opacity-10">
                    <IoDocumentText size={200} />
                </div>
                
                <div className="relative z-10 p-8 md:p-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                    {contract.type === 'commercial' ? (
                                        <MdBusinessCenter className="w-8 h-8" />
                                    ) : (
                                        <FaUser className="w-7 h-7" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm opacity-80 font-medium">
                                        {contract.type === 'commercial' ? 'تعاقد تجاري' : 'تعاقد شخصي'}
                                    </p>
                                    <h1 className="text-3xl md:text-4xl font-black">{contract.title}</h1>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl font-mono font-bold">
                                    #{contract.id}
                                </span>
                                <span className={`px-4 py-2 rounded-xl font-bold ${
                                    contract.status === 'active' 
                                        ? 'bg-green-500/20 border-2 border-green-300' 
                                        : 'bg-white/20'
                                }`}>
                                    {contract.status === 'active' ? '✓ نشط حالياً' : 'مكتمل'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="text-right">
                            <p className="text-sm opacity-80 mb-2">القيمة الإجمالية</p>
                            <p className="text-5xl font-black">{contract.cost}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Contact & Location */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-card border border-border/60 rounded-[2rem] p-8 shadow-sm"
                    >
                        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#579BE8]/10 flex items-center justify-center">
                                <FaUser className="text-[#579BE8]" />
                            </div>
                            معلومات التواصل
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">مقدم الطلب</p>
                                <p className="text-lg font-bold">{contract.applicant}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">رقم الجوال</p>
                                <p className="text-lg font-bold font-mono" dir="ltr">{contract.phone}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Location Information */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-card border border-border/60 rounded-[2rem] p-8 shadow-sm"
                    >
                        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#579BE8]/10 flex items-center justify-center">
                                <FaMapMarkerAlt className="text-[#579BE8]" />
                            </div>
                            موقع التوصيل
                        </h3>
                        
                        <div className="bg-secondary/20 p-6 rounded-2xl border border-border/40">
                            <p className="text-base font-bold leading-relaxed">{contract.address}</p>
                        </div>
                    </motion.div>

                    {/* Notes Section */}
                    {contract.notes && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-orange-50 dark:bg-orange-500/5 border border-orange-200 dark:border-orange-500/20 rounded-[2rem] p-8 shadow-sm"
                        >
                            <h3 className="text-xl font-black mb-4 flex items-center gap-3 text-orange-600">
                                <IoDocumentText className="w-6 h-6" />
                                ملاحظات إضافية
                            </h3>
                            <p className="text-base leading-relaxed italic">"{contract.notes}"</p>
                        </motion.div>
                    )}
                </div>

                {/* Right Column - Timeline & Actions */}
                <div className="space-y-6">
                    {/* Timeline */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-card border border-border/60 rounded-[2rem] p-8 shadow-sm"
                    >
                        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <FaCalendarAlt className="text-green-600" />
                            </div>
                            الجدول الزمني
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="relative">
                                <div className="absolute right-[19px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-green-500 to-green-200"></div>
                                
                                <div className="space-y-6 relative">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30 z-10">
                                            <FaCheckCircle />
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <p className="text-xs text-muted-foreground font-bold mb-1">تاريخ البدء</p>
                                            <p className="font-bold">{contract.date}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-10 ${
                                            contract.status === 'active' 
                                                ? 'bg-green-200 text-green-600' 
                                                : 'bg-green-500 text-white shadow-green-500/30'
                                        }`}>
                                            <FaCheckCircle />
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <p className="text-xs text-muted-foreground font-bold mb-1">تاريخ الانتهاء</p>
                                            <p className="font-bold">{contract.endDate}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 p-4 rounded-2xl text-center">
                                <p className="text-xs text-green-600 font-bold mb-1">المدة الإجمالية</p>
                                <p className="text-2xl font-black text-green-600">{contract.duration}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-3"
                    >
                        <Button 
                            onClick={() => router.back()}
                            className="w-full py-6 rounded-2xl text-base font-black bg-gradient-to-r from-[#579BE8] to-[#124987] hover:shadow-xl hover:-translate-y-1 text-white shadow-lg shadow-[#579BE8]/20 transition-all"
                        >
                            العودة إلى التعاقدات
                        </Button>
                        
                        {contract.status === 'active' && (
                            <Button 
                                variant="outline"
                                className="w-full py-6 rounded-2xl text-base font-black border-2 hover:bg-secondary/50 transition-all"
                            >
                                تعديل العقد
                            </Button>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
