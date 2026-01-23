"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalDeposits: 0,
        totalWithdrawals: 0,
        netBalance: 0
    });
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

    // تحديث الـ URL عند تغيير الفلترات
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
        
        router.replace(newUrl, { scroll: false });
    }, [activeTab, selectedStatus, selectedType, searchQuery, startDate, endDate, currentPage, router]);

    // دالة الفلترة الفعلية
    const handleSearch = useCallback(async () => {
        try {
            setLoading(true);
            
            // تحديد نوع المعاملة بناءً على التبويب النشط
            let type = selectedType;
            if (activeTab !== 'all') {
                type = activeTab === 'deposit' ? 'deposit' : 'withdrawal';
            }
            
            // استدعاء الدالة الجديدة getFilteredTransactions
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
            Swal.fire({
                title: "خطأ",
                text: errorInfo.message,
                icon: "error",
                confirmButtonColor: "#579BE8",
            });
        } finally {
            setLoading(false);
        }
    }, [activeTab, selectedStatus, selectedType, searchQuery, startDate, endDate, currentPage]);

    // حساب الإحصائيات
    const calculateStats = (transactionsList) => {
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
    };

    // جلب البيانات عند تغيير الفلترات
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch();
        }, 300);
        
        return () => clearTimeout(timeoutId);
    }, [handleSearch]);

    // تحديث الـ URL عند تغيير الفلترات
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            updateURL();
        }, 500);
        
        return () => clearTimeout(timeoutId);
    }, [activeTab, selectedStatus, selectedType, searchQuery, startDate, endDate, currentPage, updateURL]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, selectedStatus, selectedType, searchQuery, startDate, endDate]);

    // Initialize Flatpickr للتاريخ الواحد
    useEffect(() => {
        if (dateInputRef.current && !flatpickrInstance.current) {
            try {
                flatpickrInstance.current = flatpickr(dateInputRef.current, {
                    locale: Arabic,
                    dateFormat: "Y-m-d",
                    defaultDate: selectedDate || null,
                    onChange: (selectedDates, dateStr) => {
                        setSelectedDate(dateStr);
                        setStartDate(dateStr);
                        setEndDate(dateStr);
                        setActiveQuickFilter('');
                    },
                    allowInput: false,
                    clickOpens: true,
                    animate: true,
                    monthSelectorType: "static",
                    static: true,
                    disableMobile: true,
                    wrap: false,
                });
            } catch (error) {
                console.error("Error initializing Flatpickr:", error);
            }
        }

        // Initialize date range pickers
        if (startDateRef.current && !startDatePicker.current) {
            try {
                startDatePicker.current = flatpickr(startDateRef.current, {
                    locale: Arabic,
                    dateFormat: "Y-m-d",
                    defaultDate: startDate || null,
                    onChange: (selectedDates, dateStr) => {
                        setStartDate(dateStr);
                        setSelectedDate('');
                        setActiveQuickFilter('');
                    },
                    allowInput: false,
                    clickOpens: true,
                    animate: true,
                    monthSelectorType: "static",
                    static: true,
                    disableMobile: true,
                    wrap: false,
                });
            } catch (error) {
                console.error("Error initializing start date Flatpickr:", error);
            }
        }

        if (endDateRef.current && !endDatePicker.current) {
            try {
                endDatePicker.current = flatpickr(endDateRef.current, {
                    locale: Arabic,
                    dateFormat: "Y-m-d",
                    defaultDate: endDate || null,
                    onChange: (selectedDates, dateStr) => {
                        setEndDate(dateStr);
                        setSelectedDate('');
                        setActiveQuickFilter('');
                    },
                    allowInput: false,
                    clickOpens: true,
                    animate: true,
                    monthSelectorType: "static",
                    static: true,
                    disableMobile: true,
                    wrap: false,
                });
            } catch (error) {
                console.error("Error initializing end date Flatpickr:", error);
            }
        }

        return () => {
            // Cleanup
            [flatpickrInstance.current, startDatePicker.current, endDatePicker.current].forEach(picker => {
                if (picker) {
                    try {
                        picker.destroy();
                    } catch (error) {
                        console.warn("Error destroying Flatpickr:", error);
                    }
                }
            });
        };
    }, []);

    // Update flatpickr instances when dates change
    useEffect(() => {
        if (flatpickrInstance.current && selectedDate) {
            try {
                flatpickrInstance.current.setDate(selectedDate, false);
            } catch (error) {
                console.warn("Error updating Flatpickr date:", error);
            }
        }
        
        if (startDatePicker.current && startDate) {
            try {
                startDatePicker.current.setDate(startDate, false);
            } catch (error) {
                console.warn("Error updating start date Flatpickr:", error);
            }
        }
        
        if (endDatePicker.current && endDate) {
            try {
                endDatePicker.current.setDate(endDate, false);
            } catch (error) {
                console.warn("Error updating end date Flatpickr:", error);
            }
        }
    }, [selectedDate, startDate, endDate]);

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

    // Handle export statement
    const handleExportStatement = async () => {
        try {
            Swal.fire({
                title: "جاري التصدير",
                text: "يرجى الانتظار بينما نقوم بتحضير كشف الحساب...",
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                },
            });

            // استخدام التواريخ المحددة أو آخر 30 يوم
            const exportStartDate = startDate || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
            const exportEndDate = endDate || new Date().toISOString().split('T')[0];
            
            const blob = await walletApi.exportStatement(exportStartDate, exportEndDate, 'pdf');
            
            Swal.close();
            
            // تنزيل الملف
            const fileName = `wallet-statement-${exportStartDate}-to-${exportEndDate}.pdf`;
            downloadFile(blob, fileName);
            
        } catch (error) {
            const errorInfo = handleApiError(error, "حدث خطأ أثناء تصدير كشف الحساب");
            Swal.fire({
                title: "خطأ",
                text: errorInfo.message,
                icon: "error",
                confirmButtonColor: "#579BE8",
            });
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

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

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

    // معالجة DatePicker
    const handleDatePicker = (type) => {
        // هنا يمكنك استخدام مكتبة DatePicker مثل react-datepicker
        // أو تنفيذ مكون DatePicker خاص بك
    };

    // دالة لتنسيق التاريخ للعرض
    const formatDisplayDate = (date) => {
        if (!date) return "";
        return date.toLocaleDateString('ar-SA', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // دالة لتنسيق التاريخ للـ API
    const formatApiDate = (date) => {
        if (!date) return "";
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
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

    return (
        <div className="space-y-8 fade-in-up p-4 md:p-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Deposits Card */}
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all">
                    <div className="absolute -right-6 -top-6 opacity-10">
                        <FaArrowDown size={100} className="rotate-12" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
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
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all">
                    <div className="absolute -right-6 -top-6 opacity-10">
                        <FaArrowUp size={100} className="-rotate-12" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
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
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all">
                    <div className="absolute -right-6 -top-6 opacity-10">
                        <IoWalletOutline size={100} className="rotate-12" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
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

            {/* Filters and Search */}
            <div className="bg-white dark:bg-card border border-border/60 rounded-3xl shadow-sm p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#579BE8]/10 rounded-xl">
                            <IoFilter className="w-5 h-5 text-[#579BE8]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">فلترة المعاملات</h3>
                            <p className="text-sm text-muted-foreground mt-1">ابحث وفلتر المعاملات حسب احتياجك</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        <button 
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-4 py-2.5 h-[44px] bg-white dark:bg-gray-800 text-foreground dark:text-gray-300 border-2 border-border/60 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium shadow-sm hover:shadow-md hover:border-[#579BE8]/50"
                        >
                            <FaTimes className="w-3 h-3" />
                            <span>مسح الفلاتر</span>
                        </button>
                        
                        <button 
                            onClick={handleSearch}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2.5 h-[44px] bg-[#579BE8] text-white border-2 border-[#579BE8] rounded-xl hover:bg-[#4680d4] hover:shadow-lg transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaSearch className="w-4 h-4" />
                            <span>بحث وتطبيق</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Search Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-2 pr-1">
                            البحث
                        </label>
                        <div className="relative">
                            <IoSearchOutline className="absolute right-4 top-1/2 -translate-y-1/2 text-[#579BE8]" size={20} />
                            <input
                                type="text"
                                placeholder="ابحث برقم المرجع أو الوصف..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyDown}
                                className="w-full pr-12 pl-4 py-3 h-[52px] bg-white dark:bg-card border-2 border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all font-medium shadow-sm hover:shadow-md"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-2 pr-1">
                            حالة المعاملة
                        </label>
                        <Select value={selectedStatus} onValueChange={handleStatusChange} dir="rtl">
                            <SelectTrigger className="w-full h-[52px] bg-white dark:bg-card border-2 border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all cursor-pointer font-medium shadow-sm hover:shadow-md">
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

                    {/* Date Range Filter */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-2 pr-1">
                            نطاق التاريخ
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <FaCalendarAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-[#579BE8] z-10 pointer-events-none" size={16} />
                                <input 
                                    ref={startDateRef}
                                    type="text"
                                    placeholder="من تاريخ"
                                    readOnly
                                    autoComplete="off"
                                    value={startDate ? formatDisplayDate(new Date(startDate)) : ''}
                                    className="w-full pr-12 py-3 h-[52px] bg-white dark:bg-card border-2 border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all font-medium shadow-sm hover:shadow-md cursor-pointer pl-4"
                                />
                            </div>
                            
                            <div className="relative">
                                <FaCalendarAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-[#579BE8] z-10 pointer-events-none" size={16} />
                                <input 
                                    ref={endDateRef}
                                    type="text"
                                    placeholder="إلى تاريخ"
                                    readOnly
                                    autoComplete="off"
                                    value={endDate ? formatDisplayDate(new Date(endDate)) : ''}
                                    className="w-full pr-12 py-3 h-[52px] bg-white dark:bg-card border-2 border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all font-medium shadow-sm hover:shadow-md cursor-pointer pl-4"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Type Filter */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-2 pr-1">
                            نوع المعاملة
                        </label>
                        <Select value={selectedType} onValueChange={handleTypeChange} dir="rtl">
                            <SelectTrigger className="w-full h-[52px] bg-white dark:bg-card border-2 border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all cursor-pointer font-medium shadow-sm hover:shadow-md">
                                <SelectValue placeholder="جميع الأنواع" />
                            </SelectTrigger>
                            <SelectContent className="text-right">
                                {typeOptions.map(type => (
                                    <SelectItem 
                                        key={type.id} 
                                        value={type.id} 
                                        className="text-right py-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            {type.id === 'deposit' && <FaArrowDown className="w-3 h-3 text-emerald-500" />}
                                            {type.id === 'withdrawal' && <FaArrowUp className="w-3 h-3 text-rose-500" />}
                                            {type.id === 'all' && <FaArrowsAltH className="w-3 h-3 text-gray-500" />}
                                            <span>{type.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Quick Date Filters */}
                <div className="mt-6 pt-6 border-t border-border/30">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">فلاتر سريعة</h4>
                    <div className="flex flex-wrap gap-2">
                        {quickFilters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => handleQuickFilter(filter.id)}
                                className={`px-4 py-2 rounded-xl border-2 transition-all text-sm font-medium ${activeQuickFilter === filter.id 
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
            <div className="bg-white dark:bg-card border border-border/60 rounded-3xl shadow-sm overflow-hidden">
                {/* Tabs Header */}
                <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-foreground">سجل المعاملات</h3>
                        
                        <DropdownMenu dir="rtl">
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card border-2 border-border/60 rounded-xl hover:border-[#579BE8]/50 transition-all font-medium shadow-sm hover:shadow-md text-muted-foreground hover:text-foreground">
                                    <IoFilter className="w-4 h-4" />
                                    <span>فرز حسب</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>خيارات الفرز</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {}}>
                                    الأحدث أولاً
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {}}>
                                    الأقدم أولاً
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {}}>
                                    الأعلى قيمة أولاً
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {}}>
                                    الأقل قيمة أولاً
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex bg-secondary/30 p-1 rounded-2xl">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    disabled={loading}
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
                        
                        <button
                            onClick={handleExportStatement}
                            className="flex items-center gap-2 px-5 py-2.5 h-[44px] bg-gradient-to-r from-[#579BE8] to-[#315782] text-white border-2 border-transparent rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold shadow-lg active:scale-95"
                        >
                            <FaFileDownload />
                            <span>تصدير</span>
                        </button>
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-10 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#579BE8]"></div>
                            <p className="mt-4 text-muted-foreground">جاري تحميل المعاملات...</p>
                        </div>
                    ) : (
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
                                        <td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">
                                            لا توجد معاملات تطابق البحث
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer / Pagination */}
                {!loading && transactions.length > 0 && (
                    <div className="p-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-sm font-medium text-muted-foreground">
                            عرض <span className="text-foreground font-bold">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)}</span> من أصل <span className="text-foreground font-bold">{totalItems}</span> معاملة
                        </div>

                        <div className="flex items-center gap-2">
                            <button 
                                disabled={currentPage === 1 || loading}
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
                                                disabled={loading}
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
                                disabled={currentPage === totalPages || loading}
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