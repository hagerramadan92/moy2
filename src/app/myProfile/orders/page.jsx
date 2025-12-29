
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { BiDotsVerticalRounded, BiSort, BiHelpCircle, BiSolidShow } from "react-icons/bi";
import { FaCalendarAlt, FaDownload, FaPlus, FaChevronDown, FaTimes } from "react-icons/fa";

export default function OrdersPage() {
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("date-desc");
    const [selectedDate, setSelectedDate] = useState("");
    const [openOrderId, setOpenOrderId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const dropdownRef = useRef(null);

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
        <div className="space-y-8 fade-in-up ">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">إدارة الطلبات</h2>
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 xl:gap-3">
                    <div className="relative group flex-1 md:flex-none">
                        <label className="flex items-center gap-2 bg-white dark:bg-card px-3 xl:px-4 py-2.5 rounded-xl text-[12px] xl:text-[14px] font-medium border border-border shadow-sm hover:border-[#579BE8]/30 transition-all cursor-pointer">
                            <FaCalendarAlt className="text-[#579BE8]" />
                            <span className="whitespace-nowrap">{selectedDate || "تصفية باليوم"}</span>
                            <input 
                                type="date" 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                            {selectedDate && (
                                <button 
                                    onClick={(e) => { e.preventDefault(); setSelectedDate(""); }}
                                    className="z-10 bg-secondary/50 p-1 rounded-full hover:bg-secondary transition-colors mr-2"
                                >
                                    <FaTimes className="w-2.5 h-2.5 text-muted-foreground" />
                                </button>
                            )}
                        </label>
                    </div>
                    <button className="flex items-center gap-2 bg-white dark:bg-card px-3 xl:px-4 py-2.5 rounded-xl text-[12px] xl:text-[14px] font-medium border border-border shadow-sm hover:shadow-md transition-all cursor-pointer flex-1 md:flex-none">
                        <FaDownload className="text-muted-foreground shrink-0" />
                        <span className="whitespace-nowrap">تنزيل التقرير</span>
                    </button>
                    <button className="flex items-center gap-2 bg-[#579BE8] text-white px-4 xl:px-5 py-2.5 rounded-xl text-[12px] xl:text-[14px] font-bold shadow-lg shadow-[#579BE8]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex-1 md:flex-none">
                        <FaPlus className="shrink-0" />
                        <span className="whitespace-nowrap">طلب جديد</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-2.5 xl:gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-card p-4 lg:p-2.5 xl:p-5 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-3 lg:mb-2 xl:mb-4">
                            <div className={`${stat.bg} p-2.5 lg:p-1.5 xl:p-3 rounded-2xl border transition-all duration-300 group-hover:scale-110 shadow-sm flex items-center justify-center`}>
                                <div className="relative w-5 h-5 lg:w-3.5 lg:h-3.5 xl:w-6 xl:h-6">
                                    <Image src={stat.icon} alt={stat.label} fill className="invert brightness-0 object-contain" />
                                </div>
                            </div>
                            <div className="bg-secondary/50 px-2 lg:px-1.5 py-0.5 xl:px-2.5 xl:py-1 rounded-lg">
                                <span className="text-[10px] xl:text-[11px] font-bold text-muted-foreground">+12.5%</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-[12px] lg:text-[10px] xl:text-sm mb-1">{stat.label}</p>
                            <h3 className={`text-xl lg:text-base xl:text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Orders Table Section */}
            <div className="bg-white dark:bg-card rounded-2xl border border-border/50 shadow-sm overflow-visible">
                <div className="p-5 xl:p-6 border-b border-border/50 flex flex-col lg:flex-col xl:flex-row xl:items-center justify-between gap-4 lg:gap-6">
                    <h3 className="font-bold text-lg">أحدث الطلبات</h3>
                    
                    <div className="flex flex-wrap items-center gap-2 xl:gap-3 max-w-full lg:w-full xl:w-auto lg:justify-between">
                        {/* Status Filter - Scrollable on small to mid screens */}
                        <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-xl overflow-x-auto scrollbar-hide max-w-full">
                            {["all", "completed", "processing", "pending", "cancelled"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                                    className={`px-3 lg:px-2.5 xl:px-4 py-1.5 rounded-lg text-[11px] lg:text-[10px] xl:text-sm font-bold transition-all whitespace-nowrap ${
                                        statusFilter === status 
                                        ? "bg-white dark:bg-card text-[#579BE8] shadow-sm" 
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {statusText[status]}
                                </button>
                            ))}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative group">
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-white dark:bg-card border border-border rounded-xl px-4 py-2 pr-10 text-sm font-medium focus:ring-2 focus:ring-[#579BE8]/20 outline-none cursor-pointer hover:border-[#579BE8]/30 transition-all"
                            >
                                <option value="date-desc">الأحدث أولاً</option>
                                <option value="date-asc">الأقدم أولاً</option>
                                <option value="amount-desc">الأعلى سعراً</option>
                                <option value="amount-asc">الأقل سعراً</option>
                            </select>
                            <FaChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none w-3 h-3" />
                            <BiSort className="absolute right-3 top-1/2 -translate-y-1/2 text-[#579BE8] pointer-events-none w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-hide min-h-[450px] pb-20">
                    <table className="w-full min-w-[800px] text-right border-collapse">
                        <thead>
                            <tr className="bg-secondary/30 text-muted-foreground text-[13px] uppercase tracking-wider font-bold text-center">
                                <th className="px-6 py-4 text-right">رقم الطلب</th>
                                <th className="px-6 py-4 text-right">العميل</th>
                                <th className="px-6 py-4 hidden xl:table-cell">التاريخ</th>
                                <th className="px-6 py-4 hidden xl:table-cell">العناصر</th>
                                <th className="px-6 py-4">الإجمالي</th>
                                <th className="px-6 py-4">الحالة</th>
                                <th className="px-6 py-4">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {currentOrders.length > 0 ? (
                                currentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-secondary/10 transition-colors group">
                                        <td className="px-6 py-5 font-bold text-[#579BE8]">
                                            <Link href={`/myProfile/orders/${order.id.replace('#WTR-', '')}`} className="hover:underline">
                                                {order.id}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                                                    {order.customer.charAt(0)}
                                                </div>
                                                <span className="font-medium">{order.customer}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-muted-foreground hidden xl:table-cell">{order.date}</td>
                                        <td className="px-6 py-5 hidden xl:table-cell">{order.items} عناصر</td>
                                        <td className="px-6 py-5 font-bold text-center">{order.amount.toFixed(2)} ر.س</td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${statusStyles[order.status]}`}>
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
                                                    className="absolute left-6 top-[70%] z-[100] w-[180px] bg-white dark:bg-card border border-border rounded-2xl shadow-xl py-2 fade-in animate-in zoom-in-95 duration-200"
                                                >
                                                    <Link 
                                                        href={`/myProfile/orders/${order.id.replace('#', '')}`}
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
                                // Simple logic to show current, first, last, and points around current
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
