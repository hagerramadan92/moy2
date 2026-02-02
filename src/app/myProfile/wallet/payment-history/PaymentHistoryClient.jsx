"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { IoWalletOutline, IoSearchOutline, IoFilter } from "react-icons/io5";
import { FaArrowUp, FaArrowDown, FaArrowRight, FaChevronRight, FaFileDownload, FaCalendarAlt, FaTimes, FaSyncAlt, FaSearch, FaArrowsAltH } from "react-icons/fa";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import flatpickr from "flatpickr";
import { Arabic } from "flatpickr/dist/l10n/ar.js";
import "flatpickr/dist/flatpickr.min.css";
import Swal from "sweetalert2";
import { walletApi, handleApiError, formatDate, formatCurrency, downloadFile } from "@/utils/api";

export default function PaymentHistoryClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedType, setSelectedType] = useState("all");
    const [selectedDate, setSelectedDate] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [activeQuickFilter, setActiveQuickFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [transactions, setTransactions] = useState([]);
    const [paginationMeta, setPaginationMeta] = useState({ 
        total: 0, 
        current_page: 1, 
        last_page: 1,
        per_page: 10 
    });
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false); // حالة تحميل الجدول فقط
    const [stats, setStats] = useState({
        totalDeposits: 0,
        totalWithdrawals: 0,
        netBalance: 0
    });
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    
    const itemsPerPage = 20;
    
    const dateInputRef = useRef(null);
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);
    const flatpickrInstance = useRef(null);
    const startDatePicker = useRef(null);
    const endDatePicker = useRef(null);

    // خيارات الفلاتر
    const statusOptions = [
        { id: "all", label: "جميع الحالات" },
        { id: "pending", label: "قيد الانتظار" },
        { id: "completed", label: "مكتملة" },
        { id: "failed", label: "فشلت" },
        { id: "expired", label: "منتهية" },
        { id: "cancelled", label: "ملغاة" },
    ];

    const typeOptions = [
        { id: "all", label: "جميع الأنواع" },
        { id: "deposit", label: "الإيداعات" },
        { id: "withdrawal", label: "السحوبات" }
    ];

    const quickFilters = [
        { id: "today", label: "اليوم" },
        { id: "yesterday", label: "أمس" },
        { id: "week", label: "الأسبوع الحالي" },
        { id: "month", label: "الشهر الحالي" },
        { id: "lastMonth", label: "الشهر الماضي" }
    ];

    const tabs = [
        { id: "all", label: "الكل" },
        { id: "deposit", label: "الإيداعات" },
        { id: "spend", label: "السحوبات" },
    ];

    // استخدام useMemo لتحسين الأداء
    const filterParams = useMemo(() => ({
        activeTab,
        selectedStatus,
        selectedType,
        searchQuery,
        startDate,
        endDate,
        currentPage
    }), [activeTab, selectedStatus, selectedType, searchQuery, startDate, endDate, currentPage]);

    // تحليل الـ URL للحصول على الفلترات - مرة واحدة فقط عند التحميل الأول
    useEffect(() => {
        const tab = searchParams.get('tab') || 'all';
        const status = searchParams.get('status') || 'all';
        const type = searchParams.get('type') || 'all';
        const page = parseInt(searchParams.get('page') || '1');
        const query = searchParams.get('search') || '';
        const start = searchParams.get('start_date') || '';
        const end = searchParams.get('end_date') || '';
        
        setActiveTab(tab);
        setSelectedStatus(status);
        setSelectedType(type);
        setCurrentPage(page);
        setSearchQuery(query);
        setStartDate(start);
        setEndDate(end);
    }, [searchParams]);

    // تحديث الـ URL عند تغيير الفلترات بدون إعادة تحميل
    const updateURL = useCallback(() => {
        const params = new URLSearchParams();
        
        if (activeTab !== 'all') params.set('tab', activeTab);
        if (selectedStatus !== 'all') params.set('status', selectedStatus);
        if (selectedType !== 'all') params.set('type', selectedType);
        if (searchQuery) params.set('search', searchQuery);
        if (startDate) params.set('start_date', startDate);
        if (endDate) params.set('end_date', endDate);
        if (currentPage > 1) params.set('page', currentPage.toString());
        
        const queryString = params.toString();
        const newUrl = queryString ? `/myProfile/wallet/payment-history?${queryString}` : '/myProfile/wallet/payment-history';
        
        // استخدام replace بدون إعادة تحميل الصفحة
        router.replace(newUrl, { scroll: false });
    }, [activeTab, selectedStatus, selectedType, searchQuery, startDate, endDate, currentPage, router]);

    // دالة الفلترة الفعلية مع تحسين الأداء
    const fetchData = useCallback(async (isInitialLoad = false) => {
        // إذا كان التحميل الأولي تم بالفعل ولا يوجد تغيير في الفلاتر، لا تفعل شيئًا
        if (!isInitialLoad && initialLoadComplete) {
            setTableLoading(true);
        } else {
            setLoading(true);
        }
        
        try {
            // تحديد نوع المعاملة بناءً على التبويب النشط
            let type = selectedType;
            if (activeTab !== 'all') {
                type = activeTab === 'deposit' ? 'deposit' : 'withdrawal';
            }
            
            // استدعاء API
            const response = await walletApi.getFilteredTransactions(
                currentPage,
                itemsPerPage,
                type !== 'all' ? type : undefined,
                selectedStatus !== 'all' ? selectedStatus : undefined,
                searchQuery || undefined,
                startDate || undefined,
                endDate || undefined
            );
            
            if (response.status) {
                setTransactions(response.data || []);
                setPaginationMeta(response.meta || { 
                    total: 0, 
                    current_page: 1, 
                    last_page: 1,
                    per_page: itemsPerPage 
                });
                
                // حساب الإحصائيات
                calculateStats(response.data || []);
                
                if (isInitialLoad) {
                    setInitialLoadComplete(true);
                }
            } else {
                Swal.fire({
                    title: "خطأ",
                    text: response.message || "فشل في تحميل سجل المعاملات",
                    icon: "error",
                    confirmButtonColor: "#579BE8",
                });
            }
        } catch (error) {
            const errorInfo = handleApiError(error, "حدث خطأ أثناء تحميل المعاملات");
            if (!isInitialLoad) {
                Swal.fire({
                    title: "خطأ",
                    text: errorInfo.message,
                    icon: "error",
                    confirmButtonColor: "#579BE8",
                });
            }
        } finally {
            if (!isInitialLoad && initialLoadComplete) {
                setTableLoading(false);
            } else {
                setLoading(false);
            }
        }
    }, [filterParams, initialLoadComplete]);

    // التحميل الأولي للبيانات
    useEffect(() => {
        if (!initialLoadComplete) {
            fetchData(true);
        }
    }, [initialLoadComplete]);

    // جلب البيانات عند تغيير الفلترات (للتحميلات اللاحقة)
    useEffect(() => {
        if (initialLoadComplete) {
            const timeoutId = setTimeout(() => {
                fetchData();
            }, 300);
            
            return () => clearTimeout(timeoutId);
        }
    }, [fetchData, initialLoadComplete]);

    // تحديث الـ URL عند تغيير الفلترات
    useEffect(() => {
        if (initialLoadComplete) {
            const timeoutId = setTimeout(() => {
                updateURL();
            }, 500);
            
            return () => clearTimeout(timeoutId);
        }
    }, [updateURL, initialLoadComplete]);

    // Reset to first page when filters change
    useEffect(() => {
        if (initialLoadComplete) {
            setCurrentPage(1);
        }
    }, [activeTab, selectedStatus, selectedType, searchQuery, startDate, endDate]);

    // حساب الإحصائيات
    const calculateStats = useCallback((transactionsList) => {
        let totalDeposits = 0;
        let totalWithdrawals = 0;
        
        transactionsList.forEach(transaction => {
            const amount = parseFloat(transaction.amount || 0);
            const type = getTransactionType(transaction);
            
            if (type === 'deposit') {
                if (transaction.status === 'completed') {
                    totalDeposits += amount;
                }
            } else if (type === 'spend' || type === 'withdrawal') {
                if (transaction.status === 'completed') {
                    totalWithdrawals += amount;
                }
            }
        });
        
        setStats({
            totalDeposits,
            totalWithdrawals,
            netBalance: totalDeposits - totalWithdrawals
        });
    }, []);

    // Handle search with debounce
    const handleSearch = useCallback(() => {
        if (initialLoadComplete) {
            fetchData();
        }
    }, [fetchData, initialLoadComplete]);

    // Handle Enter key press in search
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // معالجة تغيير الحالة
    const handleStatusChange = (value) => {
        setSelectedStatus(value);
    };

    // معالجة تغيير النوع
    const handleTypeChange = (value) => {
        setSelectedType(value);
    };

    // معالجة تغيير التبويب
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    // معالجة الفلاتر السريعة
    const handleQuickFilter = (filterId) => {
        setActiveQuickFilter(filterId);
        setSelectedDate('');
        
        const today = new Date();
        let newStartDate = new Date();
        let newEndDate = new Date();

        switch(filterId) {
            case "today":
                // اليوم فقط
                newStartDate.setHours(0, 0, 0, 0);
                newEndDate.setHours(23, 59, 59, 999);
                break;
            case "yesterday":
                // أمس
                newStartDate.setDate(today.getDate() - 1);
                newStartDate.setHours(0, 0, 0, 0);
                newEndDate.setDate(today.getDate() - 1);
                newEndDate.setHours(23, 59, 59, 999);
                break;
            case "week":
                // الأسبوع الحالي
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                newStartDate = startOfWeek;
                break;
            case "month":
                // الشهر الحالي
                newStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
                newEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                newEndDate.setHours(23, 59, 59, 999);
                break;
            case "lastMonth":
                // الشهر الماضي
                newStartDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                newEndDate = new Date(today.getFullYear(), today.getMonth(), 0);
                newEndDate.setHours(23, 59, 59, 999);
                break;
        }

        setStartDate(formatApiDate(newStartDate));
        setEndDate(formatApiDate(newEndDate));
    };

    // Pagination Logic
    const totalPages = paginationMeta.last_page || 1;
    const totalItems = paginationMeta.total || 0;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const onPageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Clear all filters
    const clearFilters = () => {
        setActiveTab("all");
        setSelectedStatus("all");
        setSelectedType("all");
        setSearchQuery("");
        setSelectedDate("");
        setStartDate("");
        setEndDate("");
        setActiveQuickFilter("");
        setCurrentPage(1);
    };

    // دالة للحصول على لون الحالة
    const getStatusColorClass = (status) => {
        switch(status) {
            case 'completed': return 'bg-emerald-500';
            case 'pending': return 'bg-amber-500';
            case 'failed': return 'bg-rose-500';
            case 'expired': return 'bg-gray-500';
            case 'cancelled': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    };

    // تحديد نوع المعاملة بناءً على type field
    const getTransactionType = (transaction) => {
        if (!transaction || !transaction.type) return 'other';
        
        const type = transaction.type.toLowerCase();
        if (type.includes('deposit')) return 'deposit';
        if (type.includes('withdrawal') || type.includes('spend') || type.includes('payment')) return 'withdrawal';
        return 'other';
    };

    // تحديد عنوان المعاملة
    const getTransactionTitle = (transaction) => {
        if (!transaction) return 'معاملة';
        
        const type = transaction.type || '';
        
        if (type.includes('deposit_pending')) return 'إيداع معلق';
        if (type.includes('deposit')) return 'إيداع';
        if (type.includes('withdrawal_pending')) return 'سحب معلق';
        if (type.includes('withdrawal')) return 'سحب';
        if (type.includes('transfer')) return 'تحويل';
        if (type.includes('payment')) return 'دفع';
        
        return transaction.description || 'معاملة';
    };

    // تحديد طريقة الدفع
    const getPaymentMethod = (transaction) => {
        if (!transaction) return 'غير محدد';
        
        const method = transaction.metadata?.payment_method || transaction.payment_method;
        
        if (!method) return 'غير محدد';
        
        const methodsMap = {
            'paymob': 'Paymob',
            'tabby': 'تابي',
            'tamara': 'تمارا',
            'credit_card': 'بطاقة ائتمان',
            'mada': 'مدى',
            'apple_pay': 'Apple Pay',
            'stc_pay': 'STC Pay',
            'wallet': 'المحفظة'
        };
        
        return methodsMap[method] || method;
    };

    // تحديد حالة المعاملة
    const getStatusText = (status) => {
        if (!status) return 'غير معروف';
        
        const statusMap = {
            'pending': 'قيد الانتظار',
            'completed': 'مكتملة',
            'failed': 'فشلت',
            'expired': 'منتهية',
            'cancelled': 'ملغاة'
        };
        
        return statusMap[status] || status;
    };

    // تحديد لون الحالة للخلفية
    const getStatusColor = (status) => {
        if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-400';
        
        const colorMap = {
            'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400',
            'completed': 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400',
            'failed': 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400',
            'expired': 'bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-400',
            'cancelled': 'bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400'
        };
        
        return colorMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-400';
    };

    // دالة لتنسيق التاريخ للـ API
    const formatApiDate = (date) => {
        if (!date) return "";
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    };

    // Skeleton Components - بنفس أبعاد ومتباينات الصفحة الفعلية
    const PaymentHistorySkeleton = () => (
        <div className="space-y-4 sm:space-y-6 md:space-y-8 fade-in-up p-2 sm:p-4 md:p-6 w-full">
            {/* Statistics Cards Skeleton - بنفس أبعاد البطاقات الفعلية */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-full bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute -right-3 sm:-right-6 -top-3 sm:-top-6 opacity-10">
                            <div className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/10 rounded-full animate-pulse"></div>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-white/30 rounded animate-pulse"></div>
                                </div>
                                <div className="h-3 sm:h-3.5 md:h-4 w-20 sm:w-24 md:w-28 bg-white/20 rounded animate-pulse"></div>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="h-6 sm:h-8 md:h-10 w-20 sm:w-24 md:w-28 bg-white/20 rounded animate-pulse"></div>
                                <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-white/20 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters and Search Skeleton - بنفس الهيكل */}
            <div className="w-full">
                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 md:gap-6 w-full mb-4 sm:mb-5 md:mb-6">
                    {/* Search Input Skeleton */}
                    <div className="space-y-0 w-full sm:max-w-md">
                        <div className="relative w-full">
                            <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                            <div className="w-full h-10 sm:h-12 md:h-[52px] bg-gray-200 dark:bg-gray-700 rounded-xl sm:rounded-2xl animate-pulse"></div>
                        </div>
                    </div>

                    {/* Status Filter Skeleton */}
                    <div className="space-y-0 w-full sm:max-w-sm">
                        <div className="w-full h-10 sm:h-12 md:h-[52px] bg-gray-200 dark:bg-gray-700 rounded-xl sm:rounded-2xl animate-pulse"></div>
                    </div>
                </div>

                {/* Quick Date Filters Skeleton */}
                <div className="mt-1 sm:mt-3 md:mt-5 pt-0 bg-white dark:bg-card rounded-xl sm:rounded-2xl md:rounded-3xl p-2 sm:p-3 md:p-6 shadow-sm border border-border/60 w-full">
                    <div className="h-3 sm:h-3.5 md:h-4 w-20 sm:w-24 md:w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 sm:mb-3"></div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-8 sm:h-9 md:h-10 w-16 sm:w-20 md:w-24 bg-gray-200 dark:bg-gray-700 rounded-lg sm:rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Payment History Table Skeleton - بنفس الهيكل */}
            <div className="bg-white dark:bg-card border border-border/60 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-sm overflow-hidden w-full">
                {/* Tabs Header Skeleton */}
                <div className="p-3 sm:p-4 md:p-6 border-b border-border/50 flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 items-start sm:items-center justify-between w-full">
                    <div className="h-5 sm:h-6 w-24 sm:w-28 md:w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="flex bg-secondary/30 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-8 sm:h-9 md:h-10 w-14 sm:w-16 md:w-20 bg-gray-200 dark:bg-gray-700 rounded-lg sm:rounded-xl animate-pulse ml-0.5 sm:ml-1"></div>
                        ))}
                    </div>
                </div>

                {/* Table Skeleton */}
                <div className="overflow-x-auto p-2 sm:p-4 md:p-6 w-full">
                    <TableSkeleton />
                </div>

                {/* Pagination Skeleton */}
                <div className="p-3 sm:p-4 md:p-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-3 md:gap-4 w-full">
                    <div className="h-3 sm:h-3.5 md:h-4 w-32 sm:w-40 md:w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 bg-gray-200 dark:bg-gray-700 rounded-lg sm:rounded-xl animate-pulse"></div>
                        <div className="flex items-center gap-0.5 sm:gap-1">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 bg-gray-200 dark:bg-gray-700 rounded-lg sm:rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                        <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 bg-gray-200 dark:bg-gray-700 rounded-lg sm:rounded-xl animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Table Skeleton فقط للجدول - بنفس أبعاد الجدول الفعلي بالضبط
    const TableSkeleton = () => (
        <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[600px] sm:min-w-[800px] md:min-w-[1000px] text-right border-collapse">
                <thead>
                    <tr className="bg-secondary/30">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <th key={i} className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                                <div className="h-3 sm:h-3.5 md:h-4 w-10 sm:w-12 md:w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {[1, 2, 3, 4, 5].map((row) => (
                        <tr key={row} className="hover:bg-secondary/10">
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
                                <div className="text-left">
                                    <div className="h-3 sm:h-3.5 md:h-4 w-12 sm:w-14 md:w-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-1 inline-block"></div>
                                    <div className="block">
                                        <div className="h-2.5 sm:h-3 w-8 sm:w-9 md:w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
                                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gray-200 dark:bg-gray-700 rounded-lg sm:rounded-xl animate-pulse flex-shrink-0"></div>
                                    <div className="text-right flex-1 min-w-0">
                                        <div className="h-3 sm:h-3.5 md:h-4 w-16 sm:w-20 md:w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                                        <div className="h-2.5 sm:h-3 w-24 sm:w-28 md:w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 text-center">
                                <div className="h-5 sm:h-5.5 md:h-6 w-14 sm:w-16 md:w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse inline-block"></div>
                            </td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 text-center">
                                <div className="flex flex-col gap-0.5 sm:gap-1">
                                    <div className="h-3 sm:h-3.5 md:h-4 w-20 sm:w-20 md:w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    <div className="h-2.5 sm:h-3 w-14 sm:w-16 md:w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                </div>
                            </td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 text-center">
                                <div className="flex flex-col gap-0.5 sm:gap-1 items-center">
                                    <div className="h-5 sm:h-5.5 md:h-6 w-20 sm:w-24 md:w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    <div className="h-2.5 sm:h-3 w-28 sm:w-32 md:w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                </div>
                            </td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 text-center">
                                <div className="h-5 sm:h-5.5 md:h-6 w-14 sm:w-16 md:w-20 bg-gray-200 dark:bg-gray-700 rounded-lg sm:rounded-xl animate-pulse inline-block"></div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Show skeleton on initial load
    if (loading && !initialLoadComplete) {
        return <PaymentHistorySkeleton />;
    }

    return (
        <div className="space-y-5 md:space-y-8 fade-in-up p-1 md:p-6 w-full">
            {/* Statistics Cards - تبقى ثابتة */}
            <div className="grid grid-cols-2 md:grid-cols-3 md:gap-6 gap-3 w-full">
                {/* Total Deposits Card */}
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-xl md:rounded-3xl p-3 md:p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all w-full">
                    <div className="absolute -right-6 -top-6 opacity-10">
                        <FaArrowDown size={100} className="rotate-12" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-3">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                <FaArrowDown className="text-lg" />
                            </div>
                            <p className="text-sm font-bold opacity-90">إجمالي الإيداعات</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-4xl font-black drop-shadow-lg">
                                {formatCurrency(stats.totalDeposits)}
                            </h3>
                            <Image src="/images/RS.png" alt="RS" width={28} height={28} quality={100} unoptimized className="opacity-90" />
                        </div>
                    </div>
                </div>

                {/* Total Withdrawals Card */}
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] 
                text-white rounded-xl md:rounded-3xl p-3 md:p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all w-full">
                    <div className="absolute -right-6 -top-6 opacity-10">
                        <FaArrowUp size={100} className="-rotate-12" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-3">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                <FaArrowUp className="text-lg" />
                            </div>
                            <p className="text-sm font-bold opacity-90">إجمالي السحوبات</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-4xl font-black drop-shadow-lg">
                                {formatCurrency(stats.totalWithdrawals)}
                            </h3>
                            <Image src="/images/RS.png" alt="RS" width={28} height={28} quality={100} unoptimized className="opacity-90" />
                        </div>
                    </div>
                </div>

                {/* Net Balance Card */}
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782]
                 text-white rounded-xl md:rounded-3xl p-3 md:p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all w-full">
                    <div className="absolute -right-6 -top-6 opacity-10">
                        <IoWalletOutline size={100} className="rotate-12" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-3">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                <IoWalletOutline className="text-lg" />
                            </div>
                            <p className="text-sm font-bold opacity-90">الرصيد الصافي</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-4xl font-black drop-shadow-lg">
                                {formatCurrency(stats.netBalance)}
                            </h3>
                            <Image src="/images/RS.png" alt="RS" width={28} height={28} quality={100} unoptimized className="opacity-90" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search - تبقى ثابتة */}
            <div className="w-full">
                <div className="md:gap-6 grid grid-cols-2 md:grid-cols-3 gap-3 w-full mb-6">
                    {/* Search Input */}
                    <div className="space-y-0 w-full max-w-md">
                        <div className="relative w-full">
                            <IoSearchOutline className="absolute right-4 top-1/2 -translate-y-1/2 text-[#579BE8]" size={20} />
                            <input
                                type="text"
                                placeholder="ابحث برقم المرجع أو الوصف..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full md:pr-12 pr-9 pl-4 py-2 md:py-3 h-[44px] md:h-[48px] lg:h-[52px] !h-[44px] md:!h-[48px] lg:!h-[52px] bg-white dark:bg-card border-2 border-border/60 rounded-xl md:rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all font-medium shadow-sm hover:shadow-md"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-0 w-full max-w-sm">
                        <Select value={selectedStatus} onValueChange={handleStatusChange} dir="rtl">
                            <SelectTrigger className="px-3 md:px-4 lg:px-5 h-[44px] md:h-[48px] lg:h-[52px] !h-[44px] md:!h-[48px] lg:!h-[52px] py-0 bg-white dark:bg-card border-2 border-border/60 rounded-xl md:rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all cursor-pointer font-bold text-xs md:text-sm shadow-sm hover:shadow-md hover:border-[#579BE8]/50 min-w-[140px] md:min-w-[160px] lg:min-w-[180px] w-full data-[size=default]:!h-[44px] md:data-[size=default]:!h-[48px] lg:data-[size=default]:!h-[52px]">
                                <SelectValue placeholder="جميع الحالات" />
                            </SelectTrigger>
                            <SelectContent className="text-right max-h-[300px]">
                                {statusOptions.map(status => (
                                    <SelectItem 
                                        key={status.id} 
                                        value={status.id} 
                                        className="text-right py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${getStatusColorClass(status.id)}`}></span>
                                            <span>{status.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Quick Date Filters */}
                <div className="mt-1 md:mt-5 pt-0 bg-white dark:bg-card rounded-3xl p-3 md:p-6 shadow-sm border border-border/60 w-full">
                    <h4 className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 mb-3">فلاتر سريعة</h4>
                    <div className="flex flex-wrap gap-2 w-full">
                        {quickFilters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => handleQuickFilter(filter.id)}
                                className={`px-4 py-2 rounded-xl border-2 text-muted-foreground transition-all text-sm font-medium ${activeQuickFilter === filter.id 
                                    ? 'bg-[#579BE8] text-white border-[#579BE8] shadow-md' 
                                    : 'bg-white dark:bg-card text-foreground border-border/60 hover:border-[#579BE8]/50'}`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-white dark:bg-card border border-border/60 rounded-3xl shadow-sm overflow-hidden w-full">
                {/* Tabs Header */}
                <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-foreground">سجل المعاملات</h3>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex bg-secondary/30 p-1 rounded-2xl">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    disabled={tableLoading}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${activeTab === tab.id
                                        ? "bg-[#579BE8] text-white shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-[#579BE8] rounded-xl shadow-sm"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto w-full">
                    {tableLoading ? (
                        <div className="p-6 w-full">
                            <TableSkeleton />
                        </div>
                    ) : (
                        <div className="w-full">
                            <table className="w-full min-w-[1000px] text-right border-collapse">
                                <thead>
                                    <tr className="bg-secondary/30 text-muted-foreground text-sm uppercase tracking-wider font-bold">
                                        <th className="px-6 py-4 text-right">رقم المرجع</th>
                                        <th className="px-6 py-4 text-right">تفاصيل المعاملة</th>
                                        <th className="px-6 py-4 text-center">طريقة الدفع</th>
                                        <th className="px-6 py-4 text-center">التاريخ والوقت</th>
                                        <th className="px-6 py-4 text-center">المبلغ</th>
                                        <th className="px-6 py-4 text-center">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    <AnimatePresence mode="popLayout">
                                        {transactions.map((transaction) => (
                                            <motion.tr
                                                key={transaction.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                layout
                                                className="hover:bg-secondary/10 transition-colors group"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="text-left">
                                                        <span className="text-xs font-mono bg-secondary/40 px-2 py-1 rounded-lg text-muted-foreground block">
                                                            #{transaction.reference || transaction.id}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground mt-1">
                                                            ID: {transaction.id}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`p-2 rounded-xl ${getTransactionType(transaction) === "deposit"
                                                                ? "bg-green-100/50 text-green-600 dark:bg-green-500/10"
                                                                : "bg-orange-100/50 text-orange-600 dark:bg-orange-500/10"
                                                                }`}
                                                        >
                                                            {getTransactionType(transaction) === "deposit" ? (
                                                                <FaArrowDown size={14} />
                                                            ) : (
                                                                <FaArrowUp size={14} />
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-bold text-foreground block">
                                                                {getTransactionTitle(transaction)}
                                                            </span>
                                                            <span className="text-sm text-muted-foreground mt-1">
                                                                {transaction.description}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 text-sm font-medium">
                                                        {getPaymentMethod(transaction)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-foreground font-medium">
                                                            {formatDate(transaction.created_at)}
                                                        </span>
                                                        {transaction.expires_at && (
                                                            <span className="text-xs text-muted-foreground">
                                                                تنتهي: {formatDate(transaction.expires_at)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className={`flex items-center justify-center gap-1 font-black text-lg ${getTransactionType(transaction) === "deposit" ? "text-green-600" : "text-foreground"
                                                        }`}>
                                                        {getTransactionType(transaction) === "deposit" ? "+" : "-"} 
                                                        {formatCurrency(Math.abs(parseFloat(transaction.amount || 0)))}
                                                        <Image
                                                            src="/images/RS.png"
                                                            alt="RS"
                                                            width={16}
                                                            height={16}
                                                            priority
                                                            unoptimized
                                                            className="w-4 h-4 opacity-70"
                                                        />
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {transaction.balance_before && `قبل: ${formatCurrency(transaction.balance_before)}`}
                                                        {transaction.balance_after && ` | بعد: ${formatCurrency(transaction.balance_after)}`}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${getStatusColor(transaction.status)}`}>
                                                        <span className={`w-2 h-2 rounded-full ${getStatusColorClass(transaction.status)}`}></span>
                                                        {getStatusText(transaction.status)}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-muted-foreground w-full">
                                                لا توجد معاملات تطابق البحث
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer / Pagination */}
                {!tableLoading && transactions.length > 0 && (
                    <div className="p-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                        <div className="text-sm font-medium text-muted-foreground">
                            عرض <span className="text-foreground font-bold">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)}</span> من أصل <span className="text-foreground font-bold">{totalItems}</span> معاملة
                        </div>

                        <div className="flex items-center gap-2">
                            <button 
                                disabled={currentPage === 1 || tableLoading}
                                onClick={() => onPageChange(currentPage - 1)}
                                className="p-2 rounded-xl border border-border hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <FaChevronRight className="w-3 h-3" />
                            </button>

                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, idx) => {
                                    const pageNum = idx + 1;
                                    if (
                                        pageNum === 1 || 
                                        pageNum === totalPages || 
                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => onPageChange(pageNum)}
                                                disabled={tableLoading}
                                                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                                                    currentPage === pageNum 
                                                    ? "bg-[#579BE8] text-white shadow-lg shadow-[#579BE8]/20" 
                                                    : "hover:bg-secondary/50 text-muted-foreground"
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (
                                        pageNum === currentPage - 2 || 
                                        pageNum === currentPage + 2
                                    ) {
                                        return <span key={pageNum} className="px-1 text-muted-foreground">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button 
                                disabled={currentPage === totalPages || tableLoading}
                                onClick={() => onPageChange(currentPage + 1)}
                                className="p-2 rounded-xl border border-border hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all rotate-180"
                            >
                                <FaChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}