"use client";

import React, { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
    FaArrowRight, FaCreditCard, FaLock, FaCheckCircle, FaTimes, FaShieldAlt, FaUser, FaCalendarAlt, FaReceipt
} from 'react-icons/fa';
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import Swal from "sweetalert2";

export default function PaymentPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const contractId = params.id as string;
    const paymentId = searchParams.get('paymentId');

    // Mock payment data
    const paymentAmount = 750; // In production, fetch from API
    const contractNumber = contractId;

    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\D/g, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCardNumber(formatCardNumber(e.target.value));
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setExpiryDate(formatExpiryDate(e.target.value));
    };

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value.replace(/\D/g, '');
        if (v.length <= 3) {
            setCvv(v);
        }
    };

    const handlePayment = async () => {
        if (!cardNumber || !cardName || !expiryDate || !cvv) {
            Swal.fire({
                icon: 'error',
                title: 'خطأ',
                text: 'يرجى ملء جميع الحقول',
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#579BE8'
            });
            return;
        }

        if (cardNumber.replace(/\s/g, '').length < 16) {
            Swal.fire({
                icon: 'error',
                title: 'خطأ',
                text: 'يرجى إدخال رقم بطاقة صحيح',
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#579BE8'
            });
            return;
        }

        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            setIsProcessing(false);
            Swal.fire({
                icon: 'success',
                title: 'تم الدفع بنجاح!',
                text: `تم دفع ${paymentAmount} ريال بنجاح`,
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#579BE8'
            }).then(() => {
                router.push(`/myProfile/contracting/contractDetails/${contractId}/payments`);
            });
        }, 2000);
    };

    return (
        <div className="space-y-6 fade-in-up">
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
                    تفاصيل العقد
                </button>
                <FaArrowRight className="w-3 h-3 text-muted-foreground rotate-180" />
                <button 
                    onClick={() => router.push(`/myProfile/contracting/contractDetails/${contractId}/payments`)}
                    className="text-muted-foreground hover:text-primary transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-secondary/50"
                >
                    سجل المدفوعات
                </button>
                <FaArrowRight className="w-3 h-3 text-muted-foreground rotate-180" />
                <span className="font-bold text-foreground px-3 py-1.5 rounded-lg bg-primary/10 text-primary">الدفع</span>
            </div>

            {/* Payment Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#124987] text-white rounded-[2.5rem] p-8 md:p-10 shadow-xl overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 opacity-10">
                    <FaCreditCard size={180} />
                </div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                            <FaLock className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2">الدفع الآمن</h1>
                            <p className="text-sm opacity-90">معاملة آمنة ومشفرة</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/10">
                            <p className="text-xs opacity-80 mb-1">مبلغ الدفع</p>
                            <p className="text-2xl font-black">{paymentAmount.toLocaleString()} ريال</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/10">
                            <p className="text-xs opacity-80 mb-1">رقم العقد</p>
                            <p className="text-lg font-black">#{contractNumber}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/10">
                            <p className="text-xs opacity-80 mb-1">رقم الفاتورة</p>
                            <p className="text-lg font-black">#{paymentId || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Payment Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payment Card Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white dark:bg-card border border-border/60 rounded-[2.5rem] p-8 shadow-lg"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#579BE8] to-[#124987] flex items-center justify-center">
                            <FaCreditCard className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-foreground">معلومات البطاقة</h2>
                    </div>

                    <div className="space-y-5">
                        {/* Card Number */}
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">
                                رقم البطاقة
                            </label>
                            <input
                                type="text"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                className="w-full px-4 py-3 rounded-xl border-2 border-border/60 focus:border-[#579BE8] focus:ring-2 focus:ring-[#579BE8]/20 outline-none transition-all text-lg font-mono"
                            />
                        </div>

                        {/* Card Name */}
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">
                                اسم حامل البطاقة
                            </label>
                            <input
                                type="text"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                placeholder="AHMED MOHAMMED"
                                className="w-full px-4 py-3 rounded-xl border-2 border-border/60 focus:border-[#579BE8] focus:ring-2 focus:ring-[#579BE8]/20 outline-none transition-all"
                            />
                        </div>

                        {/* Expiry and CVV */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">
                                    تاريخ الانتهاء
                                </label>
                                <input
                                    type="text"
                                    value={expiryDate}
                                    onChange={handleExpiryChange}
                                    placeholder="MM/YY"
                                    maxLength={5}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-border/60 focus:border-[#579BE8] focus:ring-2 focus:ring-[#579BE8]/20 outline-none transition-all font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">
                                    CVV
                                </label>
                                <input
                                    type="text"
                                    value={cvv}
                                    onChange={handleCvvChange}
                                    placeholder="123"
                                    maxLength={3}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-border/60 focus:border-[#579BE8] focus:ring-2 focus:ring-[#579BE8]/20 outline-none transition-all font-mono"
                                />
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20">
                            <FaShieldAlt className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                                معاملة آمنة ومشفرة - جميع بياناتك محمية
                            </p>
                        </div>

                        {/* Submit Button */}
                        <Button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="w-full py-6 rounded-xl bg-gradient-to-r from-[#579BE8] via-[#579BE8] to-[#124987] hover:from-[#4a8dd8] hover:via-[#4a8dd8] hover:to-[#0f3d6f] text-white font-black text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                            {isProcessing ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    جاري المعالجة...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <FaLock className="w-5 h-5" />
                                    تأكيد الدفع
                                </span>
                            )}
                        </Button>
                    </div>
                </motion.div>

                {/* Payment Summary */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-card border border-border/60 rounded-[2.5rem] p-6 shadow-lg h-fit"
                >
                    <h3 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
                        <FaReceipt className="w-5 h-5 text-[#579BE8]" />
                        ملخص الدفع
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                            <div className="flex items-center gap-2">
                                <FaUser className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">العقد</span>
                            </div>
                            <span className="text-sm font-bold text-foreground">#{contractNumber}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                            <div className="flex items-center gap-2">
                                <FaCalendarAlt className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">التاريخ</span>
                            </div>
                            <span className="text-sm font-bold text-foreground">
                                {new Date().toLocaleDateString('ar-SA')}
                            </span>
                        </div>

                        <div className="pt-4 border-t border-border/40">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-muted-foreground">المبلغ</span>
                                <span className="text-lg font-bold text-foreground">{paymentAmount.toLocaleString()} ريال</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">رسوم المعاملة</span>
                                <span className="text-sm font-bold text-green-600">مجاني</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t-2 border-border/60">
                            <div className="flex items-center justify-between">
                                <span className="text-base font-black text-foreground">الإجمالي</span>
                                <span className="text-2xl font-black bg-gradient-to-r from-[#579BE8] to-[#124987] bg-clip-text text-transparent">
                                    {paymentAmount.toLocaleString()} ريال
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Back Button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center"
            >
                <Button 
                    onClick={() => router.push(`/myProfile/contracting/contractDetails/${contractId}/payments`)}
                    variant="outline"
                    className="px-8 py-5 rounded-2xl text-base font-black border-2 hover:bg-secondary/50 transition-all"
                >
                    <FaArrowRight className="w-4 h-4 mr-2 rotate-180" />
                    العودة إلى سجل المدفوعات
                </Button>
            </motion.div>
        </div>
    );
}

