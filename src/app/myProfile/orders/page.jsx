"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BiDotsVerticalRounded, BiSort, BiHelpCircle, BiSolidShow, BiFilter } from "react-icons/bi";
import { FaCalendarAlt, FaDownload, FaPlus, FaChevronDown, FaTimes, FaBox, FaSearch, FaSyncAlt } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
// import { FaChevronDown, FaTimes, FaBox, FaSearch, FaSyncAlt, FaCalendarAlt } from "react-icons/fa";
// import { FaBox } from "react-icons/fa";
import flatpickr from "flatpickr";
import { Arabic } from "flatpickr/dist/l10n/ar.js";
import "flatpickr/dist/flatpickr.min.css";

// API base URL
const API_BASE_URL = "https://moya.talaaljazeera.com/api/v1";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchOrderNumber, setSearchOrderNumber] = useState("");
    const [openOrderId, setOpenOrderId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [perPage] = useState(10);
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [period, setPeriod] = useState("all");
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [authError, setAuthError] = useState(false);
    
    const router = useRouter();
    const dropdownRef = useRef(null);
    const dateInputRef = useRef(null);
    const flatpickrInstance = useRef(null);

    // Available status options based on API response
    const [statusOptions, setStatusOptions] = useState([]);

    // Fetch order statuses
    const fetchOrderStatuses = useCallback(async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(
                `${API_BASE_URL}/orders/statuses`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (response.ok && data.status === true) {
                setStatusOptions(data.data || []);
            } else {
                console.error("Failed to fetch statuses", data);
            }
        } catch (error) {
            console.error("Error fetching order statuses:", error);
        }
    }, []);

    useEffect(() => {
        fetchOrderStatuses();
    }, [fetchOrderStatuses]);

    // Period options - updated to include 7_days
    const periodOptions = [
        { value: "all", label: "جميع الفترات" },
        { value: "today", label: "اليوم" },
        { value: "yesterday", label: "أمس" },
        { value: "7_days", label: "آخر 7 أيام" },
        { value: "week", label: "هذا الأسبوع" },
        { value: "month", label: "هذا الشهر" },
        { value: "year", label: "هذا العام" }
    ];

    // دالة للحصول على التوكن من localStorage
    const getToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('accessToken') || 
                   localStorage.getItem('auth_token') || 
                   localStorage.getItem('accesstoken');
        }
        return null;
    };

    // دالة للتحقق من المصادقة وإعادة التوجيه
    const checkAuthAndRedirect = () => {
        const token = getToken();
        if (!token) {
            setAuthError(true);
            setError("يجب تسجيل الدخول للوصول إلى هذه الصفحة");
            return false;
        }
        return true;
    };

    // Fetch orders from API
    const fetchOrders = useCallback(async () => {
        // التحقق من المصادقة أولاً
        if (!checkAuthAndRedirect()) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setAuthError(false);
            
            const token = getToken();
            
            // بناء query parameters
            const params = new URLSearchParams({
                page: currentPage.toString(),
            });

            // إضافة status_ids إذا تم اختيارها - باستخدام status_ids[]
            if (selectedStatuses.length > 0) {
                selectedStatuses.forEach(statusId => {
                    params.append('status_ids[]', statusId);
                });
            }

            // إضافة period إذا لم تكن "all"
            if (period && period !== "all") {
                params.append('period', period);
            }

            // إضافة تاريخ محدد إذا تم اختياره
            if (selectedDate) {
                params.append('date', selectedDate);
            }

            // For debugging - log the URL
            console.log("Fetching orders with URL:", `${API_BASE_URL}/orders?${params.toString()}`);
            console.log("Selected statuses:", selectedStatuses);
            console.log("Period:", period);
            console.log("Date:", selectedDate);

            const response = await fetch(`${API_BASE_URL}/orders?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || data.error_code === "UNAUTHENTICATED") {
                    setAuthError(true);
                    throw new Error("انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى");
                }
                throw new Error(data.message || `فشل في جلب البيانات: ${response.status}`);
            }

            if (data.status === true) {
                setOrders(data.data || []);
                setTotalOrders(data.meta?.total || 0);
                setTotalPages(data.meta?.last_page || 1);
            } else {
                throw new Error(data.message || "حدث خطأ في جلب البيانات");
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(err.message);
            setOrders([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentPage, selectedStatuses, period, selectedDate]);

    // Initial fetch and refetch when filters change
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenOrderId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Initialize Flatpickr
    useEffect(() => {
        if (dateInputRef.current && !flatpickrInstance.current) {
            try {
                flatpickrInstance.current = flatpickr(dateInputRef.current, {
                    locale: Arabic,
                    dateFormat: "Y-m-d",
                    defaultDate: selectedDate || null,
                    onChange: (selectedDates, dateStr) => {
                        setSelectedDate(dateStr);
                        setCurrentPage(1);
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

        return () => {
            if (flatpickrInstance.current) {
                try {
                    if (dateInputRef.current && dateInputRef.current.parentNode) {
                        flatpickrInstance.current.destroy();
                    }
                } catch (error) {
                    console.warn("Error destroying Flatpickr:", error);
                } finally {
                    flatpickrInstance.current = null;
                }
            }
        };
    }, []);

    // Update flatpickr when selectedDate changes externally
    useEffect(() => {
        if (flatpickrInstance.current) {
            try {
                if (selectedDate) {
                    flatpickrInstance.current.setDate(selectedDate, false);
                } else {
                    flatpickrInstance.current.clear();
                }
            } catch (error) {
                console.warn("Error updating Flatpickr date:", error);
            }
        }
    }, [selectedDate]);

    // Handle status filter change
    const handleStatusFilterChange = (statusId) => {
        setSelectedStatuses(prev => {
            if (prev.includes(statusId)) {
                return prev.filter(id => id !== statusId);
            } else {
                return [...prev, statusId];
            }
        });
        setCurrentPage(1);
    };

    // Handle period change
    const handlePeriodChange = (value) => {
        setPeriod(value);
        setCurrentPage(1);
    };

    // Handle search by order ID
    const handleSearch = (e) => {
        setSearchOrderNumber(e.target.value);
        setCurrentPage(1);
    };

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    // Handle login redirect
    const handleLoginRedirect = () => {
        router.push('/login');
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSelectedStatuses([]);
        setPeriod("all");
        setSelectedDate("");
        setSearchOrderNumber("");
        setCurrentPage(1);
        if (flatpickrInstance.current) {
            flatpickrInstance.current.clear();
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "غير محدد";
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format order date
    const formatOrderDate = (dateString) => {
        if (!dateString) return "غير محدد";
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status style
    const getStatusStyle = (statusName) => {
        switch (statusName) {
            case 'completed':
                return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400";
            case 'in_progress':
                return "bg-[#579BE8]/10 text-[#579BE8] dark:bg-[#579BE8]/10 dark:text-[#579BE8]";
            case 'pendding':
                return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 font-bold animate-pulse";
            case 'cancelled':
                return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";
            case 'confirmed':
                return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
            case 'assigned':
                return "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400";
        }
    };

    // Get status label
    const getStatusLabel = (statusName) => {
        const status = statusOptions.find(s => s.name === statusName);
        return status ? status.label : statusName;
    };

    // Handle page change
    const onPageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Filter orders locally based on search
    const filteredOrders = orders.filter(order => {
        if (!searchOrderNumber) return true;
        return order.id.toString().includes(searchOrderNumber);
    });

    // Statistics
    const stats = [
        { 
            label: "الطلبات", 
            value: totalOrders, 
            color: "text-amber-600", 
            bg: "bg-amber-500 border-amber-500/20", 
            icon: "/images/icontruck.png",
        },
    ];

    return (
        <div className="space-y-8 fade-in-up">
            {/* Error Message for Authentication */}
            {authError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                    <div className="text-red-500 mb-4">
                        <FaTimes className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-red-600 font-bold mb-2">يجب تسجيل الدخول</p>
                    <p className="text-muted-foreground mb-4">
                        {error || "يجب تسجيل الدخول للوصول إلى هذه الصفحة"}
                    </p>
                    <button 
                        onClick={handleLoginRedirect}
                        className="px-6 py-3 bg-[#579BE8] text-white rounded-xl hover:bg-[#315782] transition-colors font-bold"
                    >
                        تسجيل الدخول
                    </button>
                </div>
            )}

            {!authError && (
                <>
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-3xl md:p-6 p-2 shadow-xl relative  group hover:shadow-2xl hover:-translate-y-1 transition-all">
                                {/* Decorative Elements */}
                                <div className="absolute -right-6 -top-6 opacity-10">
                                    <FaBox size={100} className="rotate-12" />
                                </div>
                                <div className="absolute -left-4 -bottom-4 opacity-10">
                                    <div className="w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                            <FaBox className="text-lg" />
                                        </div>
                                        <p className="text-sm md:text-2xl font-bold opacity-90">{stat.label}</p>
                                    </div>
                                    <div className="flex items-center ">
                                        <h3 className="md:text-4xl text-2xl font-black drop-shadow-lg">{stat.value}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters and Actions */}
                    <div className="flex  gap-1 items-start sm:items-center justify-between">
                        <div className="grid grid-cols-2 gap-2 md:gap-5 flex-1 w-full">
                            {/* Search by Order Number */}
                            <div className="relative flex-1 max-w-md w-full">
                                <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-[#579BE8] z-10 pointer-events-none" size={18} />
                                <input 
                                    type="text"
                                    placeholder="البحث برقم الطلب (ID)"
                                    value={searchOrderNumber}
                                    onChange={handleSearch}
                                    className={`w-full pr-12 py-3.5 h-[52px] bg-white dark:bg-card border-2 border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all font-medium shadow-sm hover:shadow-md ${searchOrderNumber ? 'pl-12' : 'pl-4'}`}
                                />
                                {searchOrderNumber && (
                                    <button 
                                        onClick={(e) => { 
                                            e.preventDefault(); 
                                            e.stopPropagation();
                                            setSearchOrderNumber("");
                                        }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-destructive/10 hover:bg-destructive/20 p-1.5 rounded-full transition-all group shadow-sm hover:shadow-md border border-destructive/20 hover:border-destructive/30"
                                        title="مسح البحث"
                                    >
                                        <FaTimes className="w-3.5 h-3.5 text-destructive group-hover:scale-110 transition-transform" />
                                    </button>
                                )}
                            </div>

                          

                            {/* Period Filter */}
                            <div className="relative flex-1 max-w-md w-full">
                                <Select value={period} onValueChange={handlePeriodChange} dir="rtl">
                                    <SelectTrigger className="pr-10 pl-10 py-0 !h-[52px] bg-white dark:bg-card border-2 border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all cursor-pointer font-medium shadow-sm hover:shadow-md hover:border-[#579BE8]/50 w-full data-[size=default]:!h-[52px]">
                                        <div className="flex items-center gap-2 w-full">
                                            <BiFilter className="text-[#579BE8] w-4 h-4 flex-shrink-0" />
                                            <SelectValue placeholder="الفترة الزمنية" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="text-right" dir="rtl">
                                        {periodOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value} className="text-right">
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-3 flex-wrap">
                            {/* Refresh Button */}
                            <button 
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="md:flex hidden items-center gap-2 px-5 py-3.5 bg-white dark:bg-card border-2 border-border/60 rounded-2xl hover:shadow-md hover:border-[#579BE8]/50 transition-all font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaSyncAlt className={`${refreshing ? 'animate-spin' : ''}`} />
                                <span>تحديث</span>
                            </button>
                            
                            {/* Clear Filters Button */}
                            {(selectedStatuses.length > 0 || period !== "all" || selectedDate || searchOrderNumber) && (
                                <button 
                                    onClick={clearAllFilters}
                                    className="md:flex hidden items-center md:gap-2 md:px-5 md:py-3.5 px-3 py-1.5 bg-white dark:bg-card border-2 border-border/60 rounded-lg md:rounded-2xl hover:shadow-md hover:border-red-500/50 transition-all font-bold shadow-sm text-red-500 hover:text-red-600"
                                >
                                    <FaTimes className="" />
                                    <span className="text-sm">إلغاء الفلتر</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Status Filter Buttons */}
                    <div className="bg-white dark:bg-card border border-border/60 rounded-2xl p-4">
                        <h3 className="font-bold text-lg mb-3">فلتر حسب الحالة:</h3>
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map(status => (
                                <button
                                    key={status.id}
                                    onClick={() => handleStatusFilterChange(status.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                                        selectedStatuses.includes(status.id)
                                        ? "bg-[#579BE8] text-white shadow-sm" 
                                        : "bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                    }`}
                                >
                                    {status.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Orders Table Section */}
                    <div className="bg-white dark:bg-card border border-border/60 rounded-2xl shadow-sm">
                        <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-black text-xl text-foreground">أحدث الطلبات</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    إجمالي الطلبات: <span className="font-bold text-[#579BE8]">{totalOrders}</span>
                                    {searchOrderNumber && (
                                        <span className="mr-4">
                                            | نتائج البحث: <span className="font-bold text-[#579BE8]">{filteredOrders.length}</span>
                                        </span>
                                    )}
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="text-sm text-muted-foreground">
                                    {selectedStatuses.length > 0 && `حالة مختارة: ${selectedStatuses.length}`}
                                </div>
                                {refreshing && (
                                    <div className="flex items-center gap-2 text-sm text-amber-600">
                                        <FaSyncAlt className="animate-spin" />
                                        <span>جاري التحديث...</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto scrollbar-hide">
                            {loading ? (
                                <div className="p-10 text-center">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#579BE8] mb-4"></div>
                                    <p className="text-muted-foreground">جاري تحميل الطلبات...</p>
                                </div>
                            ) : error && !authError ? (
                                <div className="p-10 text-center">
                                    <div className="text-red-500 mb-4">
                                        <FaTimes className="w-12 h-12 mx-auto" />
                                    </div>
                                    <p className="text-red-600 font-bold mb-2">حدث خطأ في جلب البيانات</p>
                                    <p className="text-muted-foreground mb-4">{error}</p>
                                    <button 
                                        onClick={handleRefresh}
                                        className="px-4 py-2 bg-[#579BE8] text-white rounded-xl hover:bg-[#315782] transition-colors"
                                    >
                                        حاول مرة أخرى
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <table className="w-full min-w-[800px] text-right border-collapse">
                                        <thead>
                                            <tr className="bg-secondary/30 text-muted-foreground text-sm uppercase tracking-wider font-bold">
                                                <th className="px-6 py-4 text-right">رقم الطلب</th>
                                                <th className="px-6 py-4 text-right">الخدمة</th>
                                                <th className="px-6 py-4 text-right">نوع المياه</th>
                                                <th className="px-6 py-4 text-right">التاريخ</th>
                                                <th className="px-6 py-4 text-center">الحالة</th>
                                                <th className="px-6 py-4 text-center">الإجراء</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {filteredOrders.length > 0 ? (
                                                filteredOrders.map((order) => (
                                                    <tr key={order.id} className="hover:bg-secondary/10 transition-colors group">
                                                        <td className="px-6 py-5">
                                                            <span className="font-bold text-[#579BE8]">
                                                                #{order.id}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-foreground">{order.service?.name}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {order.price ? `${order.price} ر.س` : "لم يتم التسعير بعد"}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className="font-medium">{order.water_type?.name}</span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">
                                                                    {formatDate(order.created_at)}
                                                                </span>
                                                                {order.order_date && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        محدد: {formatOrderDate(order.order_date)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-center">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(order.status?.name)}`}>
                                                                {getStatusLabel(order.status?.name)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5 text-center relative">
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenOrderId(openOrderId === order.id ? null : order.id);
                                                                }}
                                                                className={`p-2 hover:bg-white dark:hover:bg-card rounded-lg transition-all border border-transparent hover:border-border hover:shadow-sm ${openOrderId === order.id ? "bg-white dark:bg-card border-border shadow-sm text-[#579BE8]" : "text-muted-foreground"}`}
                                                            >
                                                                <BiDotsVerticalRounded className="w-5 h-5" />
                                                            </button>

                                                            {/* Action Dropdown */}
                                                            {openOrderId === order.id && (
                                                                <div 
                                                                    ref={dropdownRef}
                                                                    className="absolute left-6 top-[70%] z-[100] w-[180px] bg-white dark:bg-card border border-border rounded-2xl shadow-xl py-2 fade-in animate-in zoom-in-95 duration-200 "
                                                                >
                                                                    <Link 
                                                                        href={`/myProfile/orders/${order.id}`}
                                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-secondary/50 transition-colors text-foreground"
                                                                    >
                                                                        <BiSolidShow className="w-4 h-4 text-[#579BE8]" />
                                                                        <span>تفاصيل الطلب</span>
                                                                    </Link>
                                                          
                                                                    <Link 
                                                                        href="/myProfile/help-center"
                                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-secondary/50 transition-colors text-foreground border-t border-border/50"
                                                                    >
                                                                        <BiHelpCircle className="w-4 h-4 text-amber-500" />
                                                                        <span>مركز المساعدة</span>
                                                                    </Link>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">
                                                        {searchOrderNumber 
                                                            ? "لا توجد طلبات تطابق رقم البحث" 
                                                            : "لا توجد طلبات تطابق الفلتر المختار"}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

                                    {/* Pagination Controls */}
                                    {!searchOrderNumber && (
                                        <div className="p-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
                                            <div className="text-sm font-medium text-muted-foreground">
                                                عرض <span className="text-foreground font-bold">
                                                    {Math.min((currentPage - 1) * perPage + 1, totalOrders)}-
                                                    {Math.min(currentPage * perPage, totalOrders)}
                                                </span> من أصل <span className="text-foreground font-bold">{totalOrders}</span> طلب
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    disabled={currentPage === 1}
                                                    onClick={() => onPageChange(currentPage - 1)}
                                                    className="p-2 rounded-xl border border-border hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                >
                                                    <FaChevronDown className="w-3 h-3 -rotate-90" />
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
                                                                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                                                                        currentPage === pageNum 
                                                                        ? "bg-[#579BE8] text-white shadow-lg shadow-[#579BE8]/20" 
                                                                        : "hover:bg-secondary/50 text-muted-foreground"
                                                                    }`}
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
                                                    disabled={currentPage === totalPages}
                                                    onClick={() => onPageChange(currentPage + 1)}
                                                    className="p-2 rounded-xl border border-border hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                >
                                                    <FaChevronDown className="w-3 h-3 rotate-90" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}