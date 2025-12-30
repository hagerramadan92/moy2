
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { BiDotsVerticalRounded, BiSort, BiHelpCircle, BiSolidShow } from "react-icons/bi";
import { FaCalendarAlt, FaDownload, FaPlus, FaChevronDown, FaTimes, FaBox, FaSearch } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import flatpickr from "flatpickr";
import { Arabic } from "flatpickr/dist/l10n/ar.js";
import "flatpickr/dist/flatpickr.min.css";

export default function OrdersPage() {
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("date-desc");
    const [selectedDate, setSelectedDate] = useState("");
    const [searchOrderNumber, setSearchOrderNumber] = useState("");
    const [openOrderId, setOpenOrderId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const dropdownRef = useRef(null);
    const dateInputRef = useRef(null);
    const flatpickrInstance = useRef(null);

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
                    // Check if the input element still exists in the DOM
                    if (dateInputRef.current && dateInputRef.current.parentNode) {
                        flatpickrInstance.current.destroy();
                    }
                } catch (error) {
                    // Silently handle cleanup errors
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

    const ordersData = [
        { id: "#WTR-782", status: "completed", date: "2023-12-28", amount: 402.50, items: 1, customer: "سعود بن ناصر" },
        { id: "#WTR-002", status: "processing", date: "2023-12-28", amount: 120.00, items: 1, customer: "محمد العتيبي" },
        { id: "#WTR-003", status: "pending", date: "2025-12-28", amount: 200.00, items: 1, customer: "نواف الحربي" },
        { id: "#WTR-004", status: "cancelled", date: "2023-11-15", amount: 50.00, items: 1, customer: "أحمد الفهد" },
        { id: "#WTR-551", status: "completed", date: "2023-12-20", amount: 350.00, items: 1, customer: "خالد بن عبدالله" },
        { id: "#WTR-881", status: "completed", date: "2023-12-18", amount: 280.00, items: 1, customer: "بدر القحطاني" },
        { id: "#WTR-882", status: "processing", date: "2023-12-15", amount: 150.00, items: 1, customer: "ياسر الشمري" },
        { id: "#WTR-883", status: "completed", date: "2023-12-10", amount: 320.00, items: 1, customer: "فيصل العتبي" },
        { id: "#WTR-884", status: "cancelled", date: "2023-12-05", amount: 45.00, items: 1, customer: "تركي السبيعي" },
        { id: "#WTR-885", status: "completed", date: "2023-12-01", amount: 400.00, items: 1, customer: "عمر المطيري" },
        { id: "#WTR-886", status: "completed", date: "2023-11-28", amount: 360.00, items: 1, customer: "فهد البقمي" },
        { id: "#WTR-887", status: "processing", date: "2023-11-25", amount: 110.00, items: 1, customer: "صالح الغامدي" },
    ];

    const statusStyles = {
        completed: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
        processing: "bg-[#579BE8]/10 text-[#579BE8] dark:bg-[#579BE8]/10 dark:text-[#579BE8]",
        pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 font-bold animate-pulse",
        cancelled: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    };

    const statusText = {
        all: "الكل",
        completed: "مكتمل التسليم",
        processing: "جاري التوصيل الآن",
        pending: "انتظار التأكيد",
        cancelled: "ملغي",
    };

    const stats = [
        { label: "الطلبات المكتملة", value: "441", color: "text-[#1C7C4B]", bg: "bg-[#1C7C4B] border-[#1C7C4B]/20", icon: "/images/icontruck.png" },
        { label: "الطلبات بالطريق", value: "12", color: "text-[#D59C00]", bg: "bg-[#D59C00] border-[#FFC107]/20", icon: "/images/icontruck.png" },
        { label: "الطلبات المجدولة", value: "24", color: "text-[#579BE8]", bg: "bg-[#579BE8] border-[#579BE8]/20", icon: "/images/icontruck.png" },
        { label: "الطلبات الملغية", value: "5", color: "text-red-600", bg: "bg-[#FF0000] border-[#FF0000]/20", icon: "/images/icontruck.png" },
    ];

    const filteredOrders = ordersData
        .filter(order => statusFilter === "all" || order.status === statusFilter)
        .filter(order => !selectedDate || order.date === selectedDate)
        .filter(order => !searchOrderNumber || order.id.toLowerCase().includes(searchOrderNumber.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === "date-desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
            if (sortBy === "date-asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
            if (sortBy === "amount-desc") return b.amount - a.amount;
            if (sortBy === "amount-asc") return a.amount - b.amount;
            return 0;
        });

    // Pagination Logic
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

    const onPageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="space-y-8 fade-in-up">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all">
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
                                <p className="text-sm font-bold opacity-90">{stat.label}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-4xl font-black drop-shadow-lg">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                    {/* Search by Order Number */}
                    <div className="relative flex-1 max-w-md w-full">
                        <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-[#579BE8] z-10 pointer-events-none" size={18} />
                        <input 
                            type="text"
                            placeholder="البحث برقم الطلب"
                            value={searchOrderNumber}
                            onChange={(e) => setSearchOrderNumber(e.target.value)}
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

                    {/* Date Filter */}
                    <div className="relative flex-1 w-full sm:max-w-md">
                        <FaCalendarAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-[#579BE8] z-10 pointer-events-none" size={20} />
                        <input 
                            ref={dateInputRef}
                            type="text"
                            placeholder="اختر التاريخ"
                            readOnly
                            autoComplete="off"
                            inputMode="none"
                            data-input
                            className={`w-full pr-12 py-3.5 h-[52px] bg-white dark:bg-card border-2 border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all font-medium shadow-sm hover:shadow-md cursor-pointer ${selectedDate ? 'pl-12' : 'pl-4'}`}
                        />
                        {selectedDate && (
                            <button 
                                onClick={(e) => { 
                                    e.preventDefault(); 
                                    e.stopPropagation();
                                    setSelectedDate("");
                                    if (flatpickrInstance.current) {
                                        try {
                                            flatpickrInstance.current.clear();
                                        } catch (error) {
                                            console.warn("Error clearing Flatpickr:", error);
                                        }
                                    }
                                }}
                                className="absolute md:left-[10.5rem] left-[5.5rem] top-1/2 -translate-y-1/2 z-20 bg-destructive/10 hover:bg-destructive/20 p-1.5 rounded-full transition-all group shadow-sm hover:shadow-md border border-destructive/20 hover:border-destructive/30"
                                title="مسح التاريخ"
                            >
                                <FaTimes className="w-3.5 h-3.5 text-destructive group-hover:scale-110 transition-transform" />
                            </button>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative flex-1 max-w-md w-full">
                        <Select value={sortBy} onValueChange={setSortBy} dir="rtl">
                            <SelectTrigger className="pr-10 pl-10 py-0 !h-[52px] bg-white dark:bg-card border-2 border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all cursor-pointer font-medium shadow-sm hover:shadow-md hover:border-[#579BE8]/50 w-full data-[size=default]:!h-[52px]">
                                <div className="flex items-center gap-2 w-full">
                                    <BiSort className="text-[#579BE8] w-4 h-4 flex-shrink-0" />
                                    <SelectValue placeholder="ترتيب حسب" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="text-right">
                                <SelectItem value="date-desc" className="text-right">
                                    الأحدث أولاً
                                </SelectItem>
                                <SelectItem value="date-asc" className="text-right">
                                    الأقدم أولاً
                                </SelectItem>
                                <SelectItem value="amount-desc" className="text-right">
                                    الأعلى سعراً
                                </SelectItem>
                                <SelectItem value="amount-asc" className="text-right">
                                    الأقل سعراً
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* <div className="flex gap-3 flex-wrap">
                    <button className="flex items-center gap-2 px-5 py-3.5 bg-white dark:bg-card border-2 border-border/60 rounded-2xl hover:shadow-md hover:border-[#579BE8]/50 transition-all font-bold shadow-sm">
                        <FaDownload />
                        <span>تصدير</span>
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#579BE8] to-[#315782] text-white border-2 border-transparent rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold shadow-lg active:scale-95">
                        <FaPlus />
                        <span>طلب جديد</span>
                    </button>
                </div> */}
            </div>

            {/* Orders Table Section */}
            <div className="bg-white dark:bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h3 className="font-black text-xl text-foreground">أحدث الطلبات</h3>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Filter */}
                        <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-2xl">
                            {["all", "completed", "processing", "pending", "cancelled"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                                        statusFilter === status 
                                        ? "bg-[#579BE8] text-white shadow-sm" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                    }`}
                                >
                                    {statusText[status]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full min-w-[800px] text-right border-collapse">
                        <thead>
                            <tr className="bg-secondary/30 text-muted-foreground text-sm uppercase tracking-wider font-bold">
                                <th className="px-6 py-4 text-right">رقم الطلب</th>
                                <th className="px-6 py-4 text-right">العميل</th>
                                <th className="px-6 py-4 hidden xl:table-cell">التاريخ</th>
                                <th className="px-6 py-4 hidden xl:table-cell">العناصر</th>
                                <th className="px-6 py-4 text-center">الإجمالي</th>
                                <th className="px-6 py-4 text-center">الحالة</th>
                                <th className="px-6 py-4 text-center">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {currentOrders.length > 0 ? (
                                currentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-secondary/10 transition-colors group">
                                        <td className="px-6 py-5">
                                            <Link href={`/myProfile/orders/${order.id.replace('#WTR-', '')}`} className="font-bold text-[#579BE8] hover:underline">
                                                {order.id}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-medium text-foreground">{order.customer}</span>
                                        </td>
                                        <td className="px-6 py-5 text-muted-foreground text-sm hidden xl:table-cell">{order.date}</td>
                                        <td className="px-6 py-5 text-sm hidden xl:table-cell">{order.items} عناصر</td>
                                        <td className="px-6 py-5 font-bold text-center">{order.amount.toFixed(2)} ر.س</td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles[order.status]}`}>
                                                {statusText[order.status]}
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
                                                    className="absolute left-6 top-[70%] z-[100] w-[180px] bg-white dark:bg-card border border-border rounded-2xl shadow-xl py-2 fade-in animate-in zoom-in-95 duration-200 overflow-hidden"
                                                >
                                                    <Link 
                                                        href={`/myProfile/orders/${order.id.replace('#WTR-', '')}`}
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
                                    <td colSpan="7" className="px-6 py-10 text-center text-muted-foreground">
                                        لا توجد طلبات تطابق الفلتر المختار
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm font-medium text-muted-foreground">
                        عرض <span className="text-foreground font-bold">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredOrders.length)}</span> من أصل <span className="text-foreground font-bold">{filteredOrders.length}</span> طلب
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
            </div>
        </div>
    );
}
