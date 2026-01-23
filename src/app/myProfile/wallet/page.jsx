"use client";

import { useState, useEffect } from "react";
import { IoWalletOutline, IoReceiptOutline, IoCheckmarkCircle, IoAlertCircle, IoTime } from "react-icons/io5";
import { FaArrowUp, FaArrowDown, FaPlus, FaHistory, FaShieldAlt, FaChartLine } from "react-icons/fa";
import { MdTrendingUp, MdSpeed, MdOutlineVerified } from "react-icons/md";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { walletApi, handleApiError, formatCurrency } from "@/utils/api";

export default function WalletPage() {
    const [walletData, setWalletData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [transactionLoading, setTransactionLoading] = useState(false);
    const router = useRouter();

    // جلب بيانات المحفظة
    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const response = await walletApi.getWalletBalance();
            
            if (response.status) {
                setWalletData(response.data);
            } else {
                Swal.fire({
                    title: "خطأ",
                    text: response.message || "فشل في تحميل بيانات المحفظة",
                    icon: "error",
                    confirmButtonColor: "#579BE8",
                });
            }
        } catch (error) {
            const errorInfo = handleApiError(error, "حدث خطأ أثناء تحميل بيانات المحفظة");
            Swal.fire({
                title: "خطأ",
                text: errorInfo.message,
                icon: "error",
                confirmButtonColor: "#579BE8",
            });
        } finally {
            setLoading(false);
        }
    };

    // جلب المعاملات
    const fetchTransactions = async () => {
        try {
            setTransactionLoading(true);
            const response = await walletApi.getTransactions(1, 5);
            
            if (response.status) {
                setTransactions(response.data.transactions || []);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setTransactionLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
        fetchTransactions();
    }, []);

    // تنسيق التاريخ
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'اليوم ' + date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'أمس ' + date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('ar-SA', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    // تحديد لون وأيقونة الحالة
    const getStatusConfig = (status) => {
        switch(status) {
            case 'completed': 
                return {
                    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
                    bg: 'bg-emerald-100',
                    icon: <IoCheckmarkCircle className="w-4 h-4" />,
                    text: 'مكتمل'
                };
            case 'pending': 
                return {
                    color: 'text-amber-600 bg-amber-50 border-amber-100',
                    bg: 'bg-amber-100',
                    icon: <IoTime className="w-4 h-4" />,
                    text: 'قيد الانتظار'
                };
            case 'failed': 
                return {
                    color: 'text-rose-600 bg-rose-50 border-rose-100',
                    bg: 'bg-rose-100',
                    icon: <IoAlertCircle className="w-4 h-4" />,
                    text: 'فشل'
                };
            default: 
                return {
                    color: 'text-slate-600 bg-slate-50 border-slate-100',
                    bg: 'bg-slate-100',
                    icon: null,
                    text: status
                };
        }
    };

    // تحديد أيقونة ونوع المعاملة
    const getTransactionConfig = (transaction) => {
        const isDeposit = transaction.type === "deposit" || transaction.amount > 0;
        
        if (isDeposit) {
            return {
                icon: <FaArrowDown className="w-4 h-4" />,
                bg: 'bg-emerald-50',
                color: 'text-emerald-600',
                sign: '+'
            };
        } else {
            return {
                icon: <FaArrowUp className="w-4 h-4" />,
                bg: 'bg-rose-50',
                color: 'text-rose-600',
                sign: '-'
            };
        }
    };

    // حساب نسبة استخدام الحد اليومي
    const calculateUsagePercentage = () => {
        if (!walletData) return 0;
        const used = parseFloat(walletData.total_deposits_today) + parseFloat(walletData.total_withdrawals_today);
        const limit = parseFloat(walletData.daily_limit);
        return Math.min((used / limit) * 100, 100);
    };

    const usagePercentage = calculateUsagePercentage();

    return (
        <div className="space-y-6 fade-in-up mt-1 p-4 md:p-6">
            {/* بطاقة الرصيد الرئيسية */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <IoWalletOutline size={120} />
                </div>
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-white">رصيد المحفظة</h2>
                        <p className="text-white/90 text-sm">الرصيد المتاح للاستخدام</p>
                    </div>
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <IoWalletOutline className="w-7 h-7" />
                    </div>
                </div>

                {loading ? (
                    <div className="h-14 bg-white/10 rounded-lg animate-pulse"></div>
                ) : walletData ? (
                    <div className="flex items-center gap-3 mb-8 relative z-10">
                        <h1 className="text-5xl font-black tracking-tight">
                            {formatCurrency(walletData.balance)}
                        </h1>
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                            <Image 
                                src="/images/RS.png" 
                                alt="ريال سعودي" 
                                width={32} 
                                height={32}
                                className="w-8 h-8"
                                quality={100}
                                unoptimized
                            />
                        </div>
                    </div>
                ) : (
                    <p className="text-white/70 relative z-10">لا توجد بيانات</p>
                )}

                {/* أزرار الإجراءات الرئيسية */}
                <div className="flex gap-3 relative z-10">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push("/myProfile/wallet/add-money")}
                        className="flex-1 bg-white text-[#579BE8] font-black py-3.5 rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        <div className="p-1.5 bg-[#579BE8]/10 rounded-lg">
                            <FaPlus className="w-4 h-4" />
                        </div>
                        <span>شحن المحفظة</span>
                    </motion.button>
                    
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push("/myProfile/wallet/payment-history")}
                        className="flex-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold py-3.5 rounded-2xl hover:bg-white/30 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <FaHistory className="w-4 h-4" />
                        <span>سجل المعاملات</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* معلومات الحد اليومي والإحصائيات */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* بطاقة الحد اليومي */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-white border border-border/60 rounded-3xl p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">الحد اليومي</h3>
                        <div className="p-2 bg-[#579BE8]/10 rounded-xl">
                            <MdSpeed className="w-5 h-5 text-[#579BE8]" />
                        </div>
                    </div>
                    
                    {walletData && (
                        <>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">المستخدم اليوم</p>
                                        <p className="text-xl font-bold text-foreground mt-1">
                                            {formatCurrency(parseFloat(walletData.total_deposits_today) + parseFloat(walletData.total_withdrawals_today))}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">الحد الأقصى</p>
                                        <p className="text-xl font-bold text-foreground mt-1">
                                            {formatCurrency(walletData.daily_limit)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="relative pt-2">
                                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                        <span>0%</span>
                                        <span>100%</span>
                                    </div>
                                    <div className="w-full bg-secondary/20 rounded-full h-2.5 overflow-hidden">
                                        <motion.div 
                                            className="bg-gradient-to-r from-[#579BE8] to-[#315782] h-full rounded-full shadow-sm"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${usagePercentage}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span className="text-xs text-muted-foreground">متبقي</span>
                                        <span className="text-xs font-medium text-[#579BE8]">{usagePercentage.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* بطاقة الإحصائيات السريعة */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-gradient-to-br from-[#579BE8] to-[#315782] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                        <FaChartLine size={80} />
                    </div>
                    
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <h3 className="text-lg font-bold">مؤشرات الأداء</h3>
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                            <FaChartLine className="w-5 h-5" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-1.5 bg-white/20 rounded-lg">
                                    <FaArrowDown className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs opacity-90">الإيداعات</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {walletData ? formatCurrency(parseFloat(walletData.total_deposits_today)) : '0.00'}
                            </p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-1.5 bg-white/20 rounded-lg">
                                    <FaArrowUp className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs opacity-90">السحوبات</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {walletData ? formatCurrency(parseFloat(walletData.total_withdrawals_today)) : '0.00'}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

           
        </div>
    );
}