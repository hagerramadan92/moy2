"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    FaArrowRight, FaMoneyBillWave, FaCheckCircle, FaClock, FaTimes, FaDownload, FaFileContract, FaWallet, FaCalendarAlt, FaReceipt, FaCreditCard
} from 'react-icons/fa';
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';

// Count up animation hook
function useCountUp(end: number, duration: number = 2000, start: number = 0): number {
    const [count, setCount] = useState(start);

    useEffect(() => {
        let startTime: number | null = null;
        const startValue = start;
        const endValue = end;

        const animate = (currentTime: number) => {
            if (startTime === null) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
            
            setCount(currentCount);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(endValue);
            }
        };

        requestAnimationFrame(animate);
    }, [end, duration, start]);

    return count;
}

export default function PaymentHistoryPage() {
    const router = useRouter();
    const params = useParams();
    const contractId = params.id as string;

    // Mock payment data - in production, fetch based on contractId
    const payments = [
        {
            id: "PAY-001",
            date: "15 نوفمبر 2024",
            amount: "750 ريال",
            status: "paid",
            method: "تحويل بنكي",
            invoiceNumber: "INV-2024-001",
            description: "دفعة شهرية - نوفمبر 2024"
        },
        {
            id: "PAY-002",
            date: "15 أكتوبر 2024",
            amount: "750 ريال",
            status: "paid",
            method: "بطاقة ائتمانية",
            invoiceNumber: "INV-2024-002",
            description: "دفعة شهرية - أكتوبر 2024"
        },
        {
            id: "PAY-003",
            date: "15 سبتمبر 2024",
            amount: "750 ريال",
            status: "paid",
            method: "محفظة إلكترونية",
            invoiceNumber: "INV-2024-003",
            description: "دفعة شهرية - سبتمبر 2024"
        },
        {
            id: "PAY-004",
            date: "15 ديسمبر 2024",
            amount: "750 ريال",
            status: "pending",
            method: "تحويل بنكي",
            invoiceNumber: "INV-2024-004",
            description: "دفعة شهرية - ديسمبر 2024"
        },
    ];

    const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => {
        return sum + parseInt(p.amount.replace(/[^0-9]/g, ''));
    }, 0);

    const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => {
        return sum + parseInt(p.amount.replace(/[^0-9]/g, ''));
    }, 0);

    // Mock contract total cost - in production, fetch from contract data
    const contractTotalCost = 4500; // Total contract value
    const totalRestMoney = contractTotalCost - totalPaid;
    const totalContracts = 1; // Current contract

    // Count up animations
    const countUpPaid = useCountUp(totalPaid, 2000);
    const countUpPending = useCountUp(totalPending, 2000);

    return (
        <div className="space-y-8 fade-in-up">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm mb-6">
                <button 
                    onClick={() => router.push('/myProfile/contracting')}
                    className="text-muted-foreground hover:text-primary transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-secondary/50"
                >
                    التعاقدات
                </button>
                <FaArrowRight className="w-3 h-3 text-muted-foreground rotate-180" />
                <button 
                    onClick={() => router.push(`/myProfile/contracting/contractDetails/${contractId}`)}
                    className="text-muted-foreground hover:text-primary transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-secondary/50"
                >
                    تفاصيل العقد #{contractId}
                </button>
                <FaArrowRight className="w-3 h-3 text-muted-foreground rotate-180" />
                <span className="font-bold text-foreground px-3 py-1.5 rounded-lg bg-primary/10 text-primary">سجل المدفوعات</span>
            </div>

            {/* Enhanced Professional Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white dark:bg-card border border-border/60 rounded-[2.5rem] shadow-xl overflow-hidden relative"
            >
                {/* Gradient Background with Multiple Layers */}
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#124987] text-white relative overflow-hidden">
                    {/* Animated Background Elements */}
                    <div className="absolute top-0 right-0 opacity-[0.03]">
                        <FaMoneyBillWave size={200} />
                    </div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-white/3 rounded-full blur-2xl"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 p-8 md:p-12">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            {/* Left Section - Title & Info */}
                            <div className="space-y-4 flex-1">
                                <div className="flex items-start gap-4">
                                    <motion.div 
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                        className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/10"
                                    >
                                        <FaMoneyBillWave className="w-8 h-8" />
                                    </motion.div>
                                    <div className="flex-1">
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <p className="text-xs opacity-90 font-bold uppercase tracking-wider mb-2">سجل المدفوعات الشامل</p>
                                            <h1 className="text-3xl md:text-4xl font-black mb-2">العقد #{contractId}</h1>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                                                <p className="text-xs opacity-80">تتبع جميع المعاملات المالية للعقد</p>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Section - Stats Cards */}
                            <div className="flex gap-4 lg:gap-5">
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                                    className="bg-white/20 backdrop-blur-md rounded-2xl p-5 min-w-[140px] text-center border border-white/20 shadow-lg hover:bg-white/25 transition-all group"
                                >
                                    <div className="flex items-center justify-center gap-1.5 mb-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                        <p className="text-[10px] opacity-90 font-bold uppercase tracking-wider">المدفوع</p>
                                    </div>
                                    <motion.p 
                                        key={countUpPaid}
                                        initial={{ scale: 1.2 }}
                                        animate={{ scale: 1 }}
                                        className="text-2xl md:text-3xl font-black mb-1"
                                    >
                                        {countUpPaid.toLocaleString()}
                                    </motion.p>
                                    <p className="text-[10px] opacity-70 font-medium">ريال سعودي</p>
                                </motion.div>
                                
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                                    className="bg-white/20 backdrop-blur-md rounded-2xl p-5 min-w-[140px] text-center border border-white/20 shadow-lg hover:bg-white/25 transition-all group"
                                >
                                    <div className="flex items-center justify-center gap-1.5 mb-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                                        <p className="text-[10px] opacity-90 font-bold uppercase tracking-wider">المعلق</p>
                                    </div>
                                    <motion.p 
                                        key={countUpPending}
                                        initial={{ scale: 1.2 }}
                                        animate={{ scale: 1 }}
                                        className="text-2xl md:text-3xl font-black mb-1"
                                    >
                                        {countUpPending.toLocaleString()}
                                    </motion.p>
                                    <p className="text-[10px] opacity-70 font-medium">ريال سعودي</p>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Online Payment Button */}
            {totalPending > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-r from-[#579BE8] via-[#579BE8] to-[#124987] rounded-2xl p-6 shadow-xl overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 opacity-10">
                        <FaCreditCard size={150} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <FaCreditCard className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white mb-1">دفع المبلغ المتبقي</h3>
                                <p className="text-sm text-white/80">يمكنك دفع المبلغ المتبقي ({totalPending.toLocaleString()} ريال) الآن عبر الإنترنت</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => router.push(`/myProfile/contracting/contractDetails/${contractId}/payments/pay`)}
                            className="bg-white text-[#579BE8] hover:bg-white/90 font-black px-8 py-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
                        >
                            <FaCreditCard className="w-5 h-5" />
                            <span>الدفع الآن</span>
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Enhanced Professional Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Contracts Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
                    className="group bg-white dark:bg-card border-2 border-border/60 rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
                >
                    {/* Gradient Background Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#579BE8]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#579BE8]/10 to-transparent rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#579BE8] to-[#124987] flex items-center justify-center shadow-xl shadow-[#579BE8]/30 border-2 border-white/20"
                            >
                                <FaFileContract className="w-8 h-8 text-white" />
                            </motion.div>
                            <div className="text-right flex-1">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-3">إجمالي العقود</p>
                                <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#579BE8] via-[#579BE8] to-[#124987] bg-clip-text text-transparent leading-none mb-2">
                                    {totalContracts}
                                </p>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="pt-5 border-t-2 border-border/40">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <p className="text-xs text-muted-foreground font-semibold">الحالة</p>
                                </div>
                                <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-500/20 dark:to-emerald-500/20 text-green-700 dark:text-green-400 text-[10px] font-black border border-green-200 dark:border-green-500/30">
                                    نشط
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Total Payment Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                    className="group bg-white dark:bg-card border-2 border-border/60 rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
                >
                    {/* Gradient Background Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#579BE8]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#579BE8]/10 to-transparent rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#315782] flex items-center justify-center shadow-xl shadow-[#579BE8]/30 border-2 border-white/20"
                            >
                                <FaMoneyBillWave className="w-8 h-8 text-white" />
                            </motion.div>
                            <div className="text-right flex-1">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-3">إجمالي المدفوع</p>
                                <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#579BE8] via-[#579BE8] to-[#124987] bg-clip-text text-transparent leading-none mb-1">
                                    {totalPaid.toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground font-semibold">ريال سعودي</p>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="pt-5 border-t-2 border-border/40">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FaMoneyBillWave className="w-3 h-3 text-[#579BE8]" />
                                    <p className="text-xs text-muted-foreground font-semibold">الدفعات</p>
                                </div>
                                <span className="text-lg font-black bg-gradient-to-r from-[#579BE8] to-[#124987] bg-clip-text text-transparent">
                                    {payments.filter(p => p.status === 'paid').length}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Total Rest Money Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                    className="group bg-white dark:bg-card border-2 border-border/60 rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
                >
                    {/* Gradient Background Effect */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        totalRestMoney > 0
                            ? 'bg-gradient-to-br from-[#4a8dd8]/5 via-transparent to-transparent'
                            : 'bg-gradient-to-br from-[#579BE8]/5 via-transparent to-transparent'
                    }`}></div>
                    <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl ${
                        totalRestMoney > 0
                            ? 'bg-gradient-to-br from-[#4a8dd8]/10 to-transparent'
                            : 'bg-gradient-to-br from-[#579BE8]/10 to-transparent'
                    }`}></div>
                    
                    <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/20 ${
                                    totalRestMoney > 0
                                        ? 'bg-gradient-to-br from-[#4a8dd8] via-[#579BE8] to-[#315782] shadow-[#4a8dd8]/30'
                                        : 'bg-gradient-to-br from-[#579BE8] to-[#124987] shadow-[#579BE8]/30'
                                }`}
                            >
                                <FaWallet className="w-8 h-8 text-white" />
                            </motion.div>
                            <div className="text-right flex-1">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-3">المبلغ المتبقي</p>
                                <p className={`text-3xl md:text-4xl font-black bg-clip-text text-transparent leading-none mb-1 ${
                                    totalRestMoney > 0
                                        ? 'bg-gradient-to-r from-[#4a8dd8] to-[#315782]'
                                        : 'bg-gradient-to-r from-[#579BE8] to-[#124987]'
                                }`}>
                                    {totalRestMoney.toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground font-semibold">ريال سعودي</p>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="pt-5 border-t-2 border-border/40">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                        totalRestMoney > 0 ? 'bg-amber-500' : 'bg-green-500'
                                    } animate-pulse`}></div>
                                    <p className="text-xs text-muted-foreground font-semibold">الحالة</p>
                                </div>
                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black border ${
                                    totalRestMoney > 0
                                        ? 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                                        : 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-500/20 dark:to-emerald-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30'
                                }`}>
                                    {totalRestMoney > 0 ? 'متبقي' : 'مكتمل'}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* New Modern Payments Grid Design */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-foreground flex items-center gap-3 mb-1">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#579BE8] to-[#124987] flex items-center justify-center">
                                <FaReceipt className="w-4 h-4 text-white" />
                            </div>
                            قائمة المدفوعات
                        </h2>
                        <p className="text-xs text-muted-foreground mr-12">جميع المعاملات المالية المرتبطة بهذا العقد</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {payments.map((payment, index) => (
                        <motion.div
                            key={payment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                                payment.status === 'paid'
                                    ? 'bg-gradient-to-br from-white to-[#579BE8]/5 dark:from-card dark:to-[#579BE8]/10 border-[#579BE8]/20'
                                    : 'bg-gradient-to-br from-white to-[#4a8dd8]/5 dark:from-card dark:to-[#4a8dd8]/10 border-[#4a8dd8]/20'
                            }`}
                        >
                            {/* Decorative gradient overlay */}
                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 ${
                                payment.status === 'paid'
                                    ? 'bg-[#579BE8]'
                                    : 'bg-[#4a8dd8]'
                            }`}></div>
                            
                            <div className="relative p-6 space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg ${
                                            payment.status === 'paid' 
                                                ? 'bg-gradient-to-br from-[#579BE8] to-[#124987]' 
                                                : 'bg-gradient-to-br from-[#4a8dd8] to-[#315782]'
                                        }`}>
                                            {payment.status === 'paid' ? (
                                                <FaCheckCircle className="w-7 h-7" />
                                            ) : (
                                                <FaClock className="w-7 h-7" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-base text-foreground mb-1">{payment.description}</h3>
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold text-white ${
                                                payment.status === 'paid'
                                                    ? 'bg-gradient-to-r from-[#579BE8] to-[#124987]'
                                                    : 'bg-gradient-to-r from-[#4a8dd8] to-[#315782]'
                                            }`}>
                                                {payment.status === 'paid' ? '✓ مدفوع' : '⏳ معلق'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Amount Section */}
                                <div className={`rounded-xl p-4 ${
                                    payment.status === 'paid'
                                        ? 'bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/10'
                                        : 'bg-gradient-to-br from-[#4a8dd8]/10 to-[#315782]/10'
                                }`}>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">المبلغ</p>
                                    <p className={`text-3xl font-black ${
                                        payment.status === 'paid'
                                            ? 'bg-gradient-to-r from-[#579BE8] to-[#124987] bg-clip-text text-transparent'
                                            : 'bg-gradient-to-r from-[#4a8dd8] to-[#315782] bg-clip-text text-transparent'
                                    }`}>{payment.amount}</p>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-[#579BE8]/10 flex items-center justify-center">
                                            <FaMoneyBillWave className="w-3.5 h-3.5 text-[#579BE8]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">طريقة الدفع</p>
                                            <p className="text-xs font-bold text-foreground">{payment.method}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-[#579BE8]/10 flex items-center justify-center">
                                            <FaCalendarAlt className="w-3.5 h-3.5 text-[#579BE8]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">التاريخ</p>
                                            <p className="text-xs font-bold text-foreground">{payment.date}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Invoice Number */}
                                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                                    <div className="flex items-center gap-2">
                                        <FaReceipt className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">رقم الفاتورة:</span>
                                        <span className="text-xs font-mono font-bold text-foreground">#{payment.invoiceNumber}</span>
                                    </div>
                                    {payment.status === 'paid' ? (
                                        <Button
                                            size="sm"
                                            className="rounded-lg bg-gradient-to-r from-[#579BE8] to-[#124987] hover:from-[#4a8dd8] hover:to-[#0f3d6f] text-white shadow-md hover:shadow-lg transition-all h-8 px-3 text-[10px]"
                                        >
                                            <FaDownload className="w-3 h-3 mr-1" />
                                            تحميل
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => router.push(`/myProfile/contracting/contractDetails/${contractId}/payments/pay?paymentId=${payment.id}`)}
                                            size="sm"
                                            className="rounded-lg bg-gradient-to-r from-[#579BE8] to-[#124987] hover:from-[#4a8dd8] hover:to-[#0f3d6f] text-white shadow-md hover:shadow-lg transition-all h-8 px-3 text-[10px]"
                                        >
                                            <FaCreditCard className="w-3 h-3 mr-1" />
                                            دفع الآن
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Professional Summary Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-card border border-border/60 rounded-[2.5rem] shadow-lg overflow-hidden"
            >
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#124987] text-white p-6">
                    <h3 className="text-lg font-black mb-1.5 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <FaMoneyBillWave className="w-4 h-4" />
                        </div>
                        ملخص المدفوعات الشامل
                    </h3>
                    <p className="text-xs opacity-80">نظرة عامة على جميع المعاملات المالية</p>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-gradient-to-br from-[#579BE8]/5 to-[#124987]/5 border-2 border-[#579BE8]/20 rounded-xl p-5 hover:shadow-lg transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#579BE8] to-[#124987] flex items-center justify-center">
                                    <FaCheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-bold">
                                    مدفوع
                                </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1.5">إجمالي المدفوعات</p>
                            <p className="text-3xl font-black bg-gradient-to-r from-[#579BE8] to-[#124987] bg-clip-text text-transparent mb-1.5">{totalPaid.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">ريال • {payments.filter(p => p.status === 'paid').length} دفعة</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-[#4a8dd8]/5 to-[#315782]/5 border-2 border-[#4a8dd8]/20 rounded-xl p-5 hover:shadow-lg transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4a8dd8] to-[#315782] flex items-center justify-center">
                                    <FaClock className="w-5 h-5 text-white" />
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                                    معلق
                                </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1.5">المدفوعات المعلقة</p>
                            <p className="text-3xl font-black bg-gradient-to-r from-[#4a8dd8] to-[#315782] bg-clip-text text-transparent mb-1.5">{totalPending.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">ريال • {payments.filter(p => p.status === 'pending').length} دفعة</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-[#579BE8]/5 to-[#124987]/5 border-2 border-[#579BE8]/20 rounded-xl p-5 hover:shadow-lg transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#579BE8] to-[#124987] flex items-center justify-center">
                                    <FaMoneyBillWave className="w-5 h-5 text-white" />
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-[#579BE8]/10 text-[#579BE8] text-[10px] font-bold border border-[#579BE8]/20">
                                    إجمالي
                                </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1.5">إجمالي المبلغ</p>
                            <p className="text-3xl font-black bg-gradient-to-r from-[#579BE8] to-[#124987] bg-clip-text text-transparent mb-1.5">{(totalPaid + totalPending).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">ريال • {payments.length} دفعة إجمالية</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Professional Back Button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center pt-4"
            >
                <Button 
                    onClick={() => router.push(`/myProfile/contracting/contractDetails/${contractId}`)}
                    className="px-8 py-5 rounded-2xl text-base font-black bg-gradient-to-r from-[#579BE8] via-[#579BE8] to-[#124987] hover:from-[#4a8dd8] hover:via-[#4a8dd8] hover:to-[#0f3d6f] hover:shadow-2xl hover:-translate-y-1 text-white shadow-xl shadow-[#579BE8]/30 transition-all duration-300 flex items-center gap-2.5 group"
                >
                    <FaArrowRight className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                    <span>العودة إلى تفاصيل العقد</span>
                </Button>
            </motion.div>
        </div>
    );
}




