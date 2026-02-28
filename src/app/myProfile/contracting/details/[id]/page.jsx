"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    FaUser, FaPhoneAlt, FaMapMarkerAlt, FaCalendarAlt,
    FaArrowRight, FaCheckCircle, FaMoneyBillWave, FaTimes, FaHistory, FaPlus, FaChartLine, FaSync
} from 'react-icons/fa';
import { IoDocumentText } from "react-icons/io5";
import { MdBusinessCenter } from 'react-icons/md';
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";

export default function ContractDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const contractId = params.id;
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRenewing, setIsRenewing] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);

    useEffect(() => {
        fetchContract();
    }, [contractId]);

    const mapDurationToArabic = (durationType) => {
        const durationMap = {
            'monthly': 'شهر واحد',
            'quarterly': '3 أشهر',
            'semi_annual': '6 أشهر',
            'yearly': 'سنة كاملة'
        };
        return durationMap[durationType] || durationType;
    };

    const fetchContract = async () => {
        try {
            setLoading(true);
            const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

            if (!accessToken) {
                toast.error("يجب تسجيل الدخول لعرض تفاصيل العقد", {
                    duration: 3000,
                    icon: "❌",
                });
                setLoading(false);
                return;
            }

            const response = await fetch(`https://dashboard.waytmiah.com/api/v1/contracts/${contractId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok && data.success && data.data && data.data.contract) {
                const contractData = data.data.contract;
                const stats = data.data.stats || {};
                
                // Format contract ID
                const fullId = contractData.contract_number || `CONT-${contractData.id}`;
                
                // Get address from delivery_locations if available
                let address = '';
                if (contractData.delivery_locations && contractData.delivery_locations.length > 0) {
                    const savedLocation = contractData.delivery_locations[0].saved_location;
                    if (savedLocation) {
                        address = savedLocation.address || 
                                 (savedLocation.city && savedLocation.area 
                                     ? `${savedLocation.city}, ${savedLocation.area}` 
                                     : savedLocation.city || savedLocation.area || '');
                    }
                }

                // Map API response to component format
                const mappedContract = {
                    id: contractData.id.toString(),
                    fullId: fullId,
                    type: contractData.contract_type === 'company' ? 'commercial' : 'personal',
                    title: contractData.company_name || 'عقد بدون اسم',
                    applicant: contractData.applicant_name || '',
                    phone: contractData.phone || '',
                    address: address,
                    date: contractData.start_date ? new Date(contractData.start_date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
                    duration: mapDurationToArabic(contractData.duration_type),
                    endDate: contractData.end_date ? new Date(contractData.end_date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
                    cost: `${parseFloat(contractData.total_amount || 0).toLocaleString('ar-SA')} ريال`,
                    status: contractData.status || 'active',
                    notes: contractData.notes || '',
                    // Additional fields
                    remainingOrders: contractData.remaining_orders,
                    totalOrdersLimit: contractData.total_orders_limit,
                    paidAmount: contractData.paid_amount,
                    remainingAmount: contractData.remaining_amount,
                    // Stats
                    totalOrdersUsed: stats.total_orders_used || 0,
                    paymentProgress: stats.payment_progress || 0,
                    daysRemaining: stats.days_remaining || 0,
                    canRenew: stats.can_renew || false
                };
                
                
                setContract(mappedContract);
            } else {
                toast.error(data.message || "فشل تحميل تفاصيل العقد", {
                    duration: 3000,
                    icon: "❌",
                });
                setContract(null);
            }
        } catch (error) {
            console.error('Error fetching contract:', error);
            toast.error("حدث خطأ أثناء تحميل تفاصيل العقد", {
                duration: 3000,
                icon: "❌",
            });
            setContract(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRenew = async () => {
        const result = await Swal.fire({
            title: "تجديد العقد",
            text: "هل أنت متأكد من تجديد هذا العقد؟",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "نعم، تجديد العقد",
            cancelButtonText: "إلغاء",
            confirmButtonColor: "#579BE8",
            cancelButtonColor: "#6b7280",
            background: "var(--background)",
            color: "var(--foreground)",
            customClass: {
                popup: "rounded-[2.5rem] border border-border/50 shadow-2xl",
                confirmButton: "rounded-2xl font-black px-10 py-3",
                cancelButton: "rounded-2xl font-black px-10 py-3",
            }
        });

        if (!result.isConfirmed) return;

        setIsRenewing(true);
        const loadingToast = toast.loading("جاري تجديد العقد...", {
            duration: Infinity,
        });

        try {
            const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

            if (!accessToken) {
                toast.dismiss(loadingToast);
                toast.error("يجب تسجيل الدخول لتجديد العقد. يرجى تسجيل الدخول أولاً", {
                    duration: 4000,
                    icon: "❌",
                });
                setIsRenewing(false);
                return;
            }

            const response = await fetch(`https://dashboard.waytmiah.com/api/v1/contracts/${contractId}/renew`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const data = await response.json().catch(() => ({}));

            toast.dismiss(loadingToast);

            if (response.ok) {
                toast.success(data.message || "تم تجديد العقد بنجاح", {
                    duration: 4000,
                    icon: "✅",
                });
                
                Swal.fire({
                    title: "تم التجديد!",
                    text: data.message || "تم تجديد العقد بنجاح.",
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

                // Refresh contract data
                await fetchContract();
            } else {
                const errorMessage = data.message || data.error || 'فشل تجديد العقد. يرجى المحاولة مرة أخرى';
                toast.error(errorMessage, {
                    duration: 5000,
                    icon: "❌",
                });
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("حدث خطأ أثناء تجديد العقد. يرجى المحاولة مرة أخرى", {
                duration: 5000,
                icon: "❌",
            });
        } finally {
            setIsRenewing(false);
        }
    };

    const handleCancel = async () => {
        const result = await Swal.fire({
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
        });

        if (!result.isConfirmed) return;

        setIsCanceling(true);
        const loadingToast = toast.loading("جاري إلغاء العقد...", {
            duration: Infinity,
        });

        try {
            const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

            if (!accessToken) {
                toast.dismiss(loadingToast);
                toast.error("يجب تسجيل الدخول لإلغاء العقد. يرجى تسجيل الدخول أولاً", {
                    duration: 4000,
                    icon: "❌",
                });
                setIsCanceling(false);
                return;
            }

            const response = await fetch(`https://dashboard.waytmiah.com/api/v1/contracts/${contractId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const data = await response.json().catch(() => ({}));

            toast.dismiss(loadingToast);

            if (response.ok) {
                toast.success(data.message || "تم إلغاء العقد بنجاح", {
                    duration: 4000,
                    icon: "✅",
                });
                
                Swal.fire({
                    title: "تم الإلغاء!",
                    text: data.message || "تم إلغاء العقد بنجاح.",
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

                // Navigate back to contracts list
                setTimeout(() => {
                    router.push('/myProfile/contracting/history');
                }, 1000);
            } else {
                const errorMessage = data.message || data.error || 'فشل إلغاء العقد. يرجى المحاولة مرة أخرى';
                toast.error(errorMessage, {
                    duration: 5000,
                    icon: "❌",
                });
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("حدث خطأ أثناء إلغاء العقد. يرجى المحاولة مرة أخرى", {
                duration: 5000,
                icon: "❌",
            });
        } finally {
            setIsCanceling(false);
        }
    };

    // Skeleton Components
    const ContractDetailsSkeleton = () => (
        <div className="space-y-4 md:space-y-6 fade-in-up">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2 text-xs md:text-sm mb-3 md:mb-4">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>

            {/* Header Card Skeleton */}
            <div className="bg-white dark:bg-card border-2 border-border/60 rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] text-white relative overflow-hidden p-4 md:p-6 lg:p-8">
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/20 backdrop-blur-lg animate-pulse"></div>
                        <div className="flex-1 space-y-3">
                            <div className="h-4 w-32 bg-white/20 rounded animate-pulse"></div>
                            <div className="h-8 md:h-10 w-64 bg-white/20 rounded animate-pulse"></div>
                            <div className="flex gap-2">
                                <div className="h-6 w-24 bg-white/20 rounded animate-pulse"></div>
                                <div className="h-6 w-28 bg-white/20 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
                {/* Left Column Skeleton */}
                <div className="lg:col-span-2 space-y-4 md:space-y-5">
                    {/* Contact Info Skeleton */}
                    <div className="bg-white dark:bg-card border-2 border-border/60 rounded-2xl p-4 md:p-6 shadow-lg">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-xl p-4 md:p-5 h-24 animate-pulse"></div>
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-xl p-4 md:p-5 h-24 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Location Skeleton */}
                    <div className="bg-white dark:bg-card border-2 border-border/60 rounded-2xl p-4 md:p-6 shadow-lg">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-xl p-4 md:p-5 h-20 animate-pulse"></div>
                    </div>
                </div>

                {/* Right Column Skeleton */}
                <div>
                    <div className="bg-white dark:bg-card border-2 border-border/60 rounded-2xl p-4 md:p-6 shadow-lg">
                        <div className="flex items-center gap-2.5 mb-5 md:mb-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                        <div className="space-y-5 md:space-y-6">
                            <div className="flex gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="flex gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-xl p-4 md:p-5 h-20 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <ContractDetailsSkeleton />;
    }

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
                                                        ? 'bg-blue-500/40 border-blue-300/60 text-white' 
                                                        : contract.status === 'pending'
                                                        ? 'bg-yellow-500/40 border-yellow-300/60 text-white'
                                                        : 'bg-white/25 border-white/20'
                                                }`}>
                                                    {contract.status === 'active' 
                                                        ? '✓ نشط حالياً' 
                                                        : contract.status === 'pending'
                                                        ? '⏳ قيد الانتظار'
                                                        : '✓ مكتمل'}
                                                </span>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                            
                        
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

                {/* Right Column - Timeline and Financial Info */}
<div>
    {/* Enhanced Timeline */}
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="bg-white dark:bg-card border-2 border-border/60 rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group mb-4 md:mb-5"
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/8 to-transparent rounded-full blur-3xl group-hover:opacity-80 transition-opacity"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
            <h3 className="text-lg md:text-xl font-black mb-5 md:mb-6 flex items-center gap-2.5">
                <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 border-2 border-blue-400/20"
                >
                    <FaCalendarAlt className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </motion.div>
                <span>الجدول الزمني</span>
            </h3>
            
            <div className="space-y-5 md:space-y-6">
                <div className="relative">
                    <div className="absolute right-[19px] md:right-[23px] top-12 bottom-12 w-1 bg-gradient-to-b from-blue-500 via-blue-400 to-blue-200 rounded-full shadow-sm"></div>
                    
                    <div className="space-y-5 md:space-y-6 relative">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ x: 3 }}
                            className="flex gap-3 md:gap-4"
                        >
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/40 z-10 border-3 border-white dark:border-card">
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
                                    ? 'bg-gradient-to-br from-blue-200 to-blue-300 text-blue-700 shadow-blue-300/30' 
                                    : contract.status === 'pending'
                                    ? 'bg-gradient-to-br from-yellow-200 to-yellow-300 text-yellow-700 shadow-yellow-300/30'
                                    : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/40'
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
                    className="bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-800/10 dark:to-blue-800/10 border-2 border-blue-200/60 dark:border-blue-500/30 p-4 md:p-5 rounded-xl text-center shadow-md hover:shadow-lg transition-all"
                >
                    <p className="text-[10px] md:text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1.5">المدة الإجمالية</p>
                    <p className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">{contract.duration}</p>
                </motion.div>
            </div>
        </div>
    </motion.div>

    {/* New Section: الاستهلاك والمبالغ المالية */}
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="bg-white dark:bg-card border-2 border-border/60 rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group"
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/8 to-transparent rounded-full blur-3xl group-hover:opacity-80 transition-opacity"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
            <h3 className="text-lg md:text-xl font-black mb-5 md:mb-6 flex items-center gap-2.5">
                <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-emerald-400/20"
                >
                    <FaChartLine className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </motion.div>
                <span>الاستهلاك والمدفوعات</span>
            </h3>
            
            <div className="space-y-4 md:space-y-5">
                {/* Orders Consumption */}
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gradient-to-br from-emerald-50 to-emerald-50 dark:from-emerald-800/10 dark:to-emerald-800/10 border-2 border-emerald-200/60 dark:border-emerald-500/30 p-4 md:p-5 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs md:text-sm font-bold text-muted-foreground">الاستهلاك</p>
                        <span className="text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-lg font-bold">
                            {contract.totalOrdersUsed} / {contract.totalOrdersLimit}
                        </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(contract.totalOrdersUsed / contract.totalOrdersLimit) * 100}%` }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                        />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                        <p className="text-xs text-muted-foreground">الطلبات المستخدمة</p>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                            {contract.totalOrdersUsed} طلب
                        </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm mt-1">
                        <p className="text-xs text-muted-foreground">الطلبات المتبقية</p>
                        <p className="text-sm font-black text-blue-600 dark:text-blue-400">
                            {contract.remainingOrders} طلب
                        </p>
                    </div>
                </motion.div>

                {/* Financial Information */}
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-800/10 dark:to-blue-800/10 border-2 border-blue-200/60 dark:border-blue-500/30 p-4 md:p-5 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <FaMoneyBillWave className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs md:text-sm font-bold text-muted-foreground">المدفوعات</p>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">المبلغ الإجمالي</p>
                            <p className="text-sm font-black text-foreground">{contract.cost}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">المبلغ المدفوع</p>
                            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                {parseFloat(contract.paidAmount || 0).toLocaleString('ar-SA')} ريال
                            </p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">المبلغ المتبقي</p>
                            <p className="text-sm font-black text-red-600 dark:text-red-400">
                                {parseFloat(contract.remainingAmount || 0).toLocaleString('ar-SA')} ريال
                            </p>
                        </div>

                        {/* Payment Progress */}
                        <div className="mt-3 pt-3 border-t border-border/60">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-muted-foreground">نسبة الدفع</p>
                                <span className="text-xs bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg font-bold">
                                    {contract.paymentProgress}%
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${contract.paymentProgress}%` }}
                                    transition={{ delay: 0.7, duration: 0.8 }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Consumption Link */}
                {/* <motion.div 
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
                        <span>عرض تفاصيل الاستهلاك</span>
                        <FaArrowRight className="w-3 h-3 md:w-4 md:h-4 rotate-180" />
                    </button>
                </motion.div> */}

                {/* Action Buttons */}
                {/* {(contract.status === 'active' || contract.status === 'pending') && (
                    <>
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                        >
                            <button
                                onClick={handleRenew}
                                disabled={isRenewing || isCanceling}
                                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 md:py-4 rounded-xl font-bold text-sm md:text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                <FaSync className={`w-4 h-4 md:w-5 md:h-5 ${isRenewing ? 'animate-spin' : ''}`} />
                                <span>{isRenewing ? 'جاري التجديد...' : 'تجديد العقد'}</span>
                            </button>
                        </motion.div>
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                        >
                            <button
                                onClick={handleCancel}
                                disabled={isRenewing || isCanceling}
                                className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white py-3 md:py-4 rounded-xl font-bold text-sm md:text-base shadow-lg shadow-red-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                <FaTimes className={`w-4 h-4 md:w-5 md:h-5 ${isCanceling ? 'animate-pulse' : ''}`} />
                                <span>{isCanceling ? 'جاري الإلغاء...' : 'إلغاء العقد'}</span>
                            </button>
                        </motion.div>
                    </>
                )} */}
            </div>
        </div>
    </motion.div>
</div>
            </div>
        </div>
    );
}

