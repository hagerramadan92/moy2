"use client";

import { useState, useEffect, useRef } from "react";
import { IoWalletOutline, IoFilterSharp, IoSearchOutline, IoDocumentText } from "react-icons/io5";
import { FaArrowUp, FaArrowDown, FaArrowRight, FaChevronRight, FaFileDownload, FaHistory, FaCalendarAlt, FaTimes } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RxDotsHorizontal } from "react-icons/rx";
import { motion, AnimatePresence } from "framer-motion";
import { MdDateRange, MdTrendingUp } from "react-icons/md";
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

export default function PaymentHistoryPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState("all");
    const [selectedDate, setSelectedDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const dateInputRef = useRef(null);
    const flatpickrInstance = useRef(null);

    // Sample payment history data
    const paymentHistory = [
        {
            id: "TRX789456123",
            type: "deposit",
            title: "شحن المحفظة",
            method: "بطاقة ائتمان",
            date: "الأربعاء - 28 ديسمبر 3:45م",
            amount: "500",
            status: "completed",
            fee: "0"
        },
        {
            id: "TRX789456122",
            type: "spend",
            title: "دفع فاتورة",
            method: "محفظة",
            date: "الثلاثاء - 27 ديسمبر 11:20ص",
            amount: "250",
            status: "completed",
            fee: "5"
        },
        {
            id: "TRX789456121",
            type: "deposit",
            title: "شحن المحفظة",
            method: "STC Pay",
            date: "الاثنين - 26 ديسمبر 9:15ص",
            amount: "1000",
            status: "completed",
            fee: "0"
        },
        {
            id: "TRX789456120",
            type: "spend",
            title: "شراء خدمة",
            method: "محفظة",
            date: "الأحد - 25 ديسمبر 6:30م",
            amount: "150",
            status: "completed",
            fee: "3"
        },
        {
            id: "TRX789456119",
            type: "deposit",
            title: "شحن المحفظة",
            method: "Apple Pay",
            date: "السبت - 24 ديسمبر 2:10م",
            amount: "300",
            status: "completed",
            fee: "0"
        },
        {
            id: "TRX789456118",
            type: "spend",
            title: "دفع اشتراك",
            method: "محفظة",
            date: "الجمعة - 23 ديسمبر 4:55م",
            amount: "99",
            status: "completed",
            fee: "2"
        },
        {
            id: "TRX789456117",
            type: "deposit",
            title: "شحن المحفظة",
            method: "بطاقة ائتمان",
            date: "الخميس - 22 ديسمبر 10:30ص",
            amount: "750",
            status: "completed",
            fee: "0"
        },
    ];

    const filteredPayments = paymentHistory.filter(payment => {
        const matchesTab = activeTab === "all" || payment.type === activeTab;
        const matchesSearch = payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);

    const onPageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

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

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery, selectedDate]);

    const tabs = [
        { id: "all", label: "الكل" },
        { id: "deposit", label: "الإيداعات" },
        { id: "spend", label: "المصروفات" },
    ];

    const periods = [
        { id: "all", label: "كل الفترات" },
        { id: "week", label: "آخر أسبوع" },
        { id: "month", label: "آخر شهر" },
        { id: "3months", label: "آخر 3 أشهر" },
    ];

    // Calculate totals
    const totalDeposits = paymentHistory
        .filter(p => p.type === "deposit")
        .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalSpent = paymentHistory
        .filter(p => p.type === "spend")
        .reduce((sum, p) => sum + Number(p.amount), 0);

    return (
        <div className="space-y-8 fade-in-up">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Deposits Card */}
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all">
                    {/* Decorative Elements */}
                    <div className="absolute -right-6 -top-6 opacity-10">
                        <FaArrowDown size={100} className="rotate-12" />
                    </div>
                    <div className="absolute -left-4 -bottom-4 opacity-10">
                        <div className="w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                    </div>

                    {/* Animated Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                <FaArrowDown className="text-lg" />
                            </div>
                            <p className="text-sm font-bold opacity-90">إجمالي الإيداعات</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-4xl font-black drop-shadow-lg">{totalDeposits.toLocaleString()}</h3>
                            <Image src="/images/RS.png" alt="RS" width={28} height={28} quality={100} unoptimized className="opacity-90" />
                        </div>
                        <p className="text-xs opacity-75 mt-2 font-medium">+{paymentHistory.filter(p => p.type === 'deposit').length} معاملة</p>
                    </div>
                </div>

                {/* Total Spent Card */}
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all">
                    {/* Decorative Elements */}
                    <div className="absolute -right-6 -top-6 opacity-10">
                        <FaArrowUp size={100} className="-rotate-12" />
                    </div>
                    <div className="absolute -left-4 -bottom-4 opacity-10">
                        <div className="w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                    </div>

                    {/* Animated Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                <FaArrowUp className="text-lg" />
                            </div>
                            <p className="text-sm font-bold opacity-90">إجمالي المصروفات</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-4xl font-black drop-shadow-lg">{totalSpent.toLocaleString()}</h3>
                            <Image src="/images/RS.png" alt="RS" width={28} height={28} quality={100} unoptimized className="opacity-90" />
                        </div>
                        <p className="text-xs opacity-75 mt-2 font-medium">-{paymentHistory.filter(p => p.type === 'spend').length} معاملة</p>
                    </div>
                </div>

                {/* Net Balance Card */}
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all">
                    {/* Decorative Elements */}
                    <div className="absolute -right-6 -top-6 opacity-10">
                        <IoWalletOutline size={100} className="rotate-12" />
                    </div>
                    <div className="absolute -left-4 -bottom-4 opacity-10">
                        <div className="w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                    </div>

                    {/* Animated Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                <IoWalletOutline className="text-lg" />
                            </div>
                            <p className="text-sm font-bold opacity-90">الرصيد الصافي</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-4xl font-black drop-shadow-lg">{(totalDeposits - totalSpent).toLocaleString()}</h3>
                            <Image src="/images/RS.png" alt="RS" width={28} height={28} quality={100} unoptimized className="opacity-90" />
                        </div>
                        <p className="text-xs opacity-75 mt-2 font-medium">محفظتك الحالية</p>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md w-full">
                        <IoSearchOutline className="absolute right-4 top-1/2 -translate-y-1/2 text-[#579BE8]" size={20} />
                        <input
                            type="text"
                            placeholder="ابحث برقم المعاملة أو الوصف..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-12 pl-4 py-3.5 h-[52px] bg-white dark:bg-card border-2 border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all font-medium shadow-sm hover:shadow-md"
                        />
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
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-destructive/10 hover:bg-destructive/20 p-1.5 rounded-full transition-all group shadow-sm hover:shadow-md border border-destructive/20 hover:border-destructive/30"
                                title="مسح التاريخ"
                            >
                                <FaTimes className="w-3.5 h-3.5 text-destructive group-hover:scale-110 transition-transform" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 flex-wrap">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod} dir="rtl">
                        <SelectTrigger className="px-5 py-0 !h-[52px] bg-white dark:bg-card border-2 border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all cursor-pointer font-bold shadow-sm hover:shadow-md hover:border-[#579BE8]/50 min-w-[180px] data-[size=default]:!h-[52px]">
                            <SelectValue placeholder="اختر الفترة" />
                        </SelectTrigger>
                        <SelectContent className="text-right">
                            {periods.map(period => (
                                <SelectItem key={period.id} value={period.id} className="text-right">
                                    {period.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <button className="flex items-center gap-2 px-5 py-3.5 h-[52px] bg-gradient-to-r from-[#579BE8] to-[#315782] text-white border-2 border-transparent rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold shadow-lg active:scale-95">
                        <FaFileDownload />
                        <span>تصدير</span>
                    </button>
                </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-white dark:bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
                {/* Tabs Header */}
                <div className="p-6 border-b border-border/50 flex items-center justify-between">
                    <h3 className="font-black text-xl text-foreground">سجل المدفوعات</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-secondary/30 p-1 rounded-2xl">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${activeTab === tab.id
                                        ? "bg-[#579BE8] text-white shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                        }`}
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
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-right border-collapse">
                        <thead>
                            <tr className="bg-secondary/30 text-muted-foreground text-sm uppercase tracking-wider font-bold">
                                <th className="px-6 py-4 text-right">رقم المعاملة</th>
                                <th className="px-6 py-4 text-right">التفاصيل</th>
                                <th className="px-6 py-4 hidden lg:table-cell">طريقة الدفع</th>
                                <th className="px-6 py-4 hidden xl:table-cell">التاريخ والوقت</th>
                                <th className="px-6 py-4 hidden lg:table-cell">الرسوم</th>
                                <th className="px-6 py-4 text-center">المبلغ</th>
                                <th className="px-6 py-4 text-center">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            <AnimatePresence mode="popLayout">
                                {currentPayments.map((payment) => (
                                    <motion.tr
                                        key={payment.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        layout
                                        className="hover:bg-secondary/10 transition-colors group"
                                    >
                                        <td className="px-6 py-5">
                                            <span className="font-bold text-[#579BE8] hover:underline cursor-pointer">
                                                #{payment.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`p-2 rounded-xl ${payment.type === "deposit"
                                                        ? "bg-green-100/50 text-green-600 dark:bg-green-500/10"
                                                        : "bg-orange-100/50 text-orange-600 dark:bg-orange-500/10"
                                                        }`}
                                                >
                                                    {payment.type === "deposit" ? (
                                                        <FaArrowDown size={14} />
                                                    ) : (
                                                        <FaArrowUp size={14} />
                                                    )}
                                                </div>
                                                <span className="font-bold text-foreground">{payment.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-muted-foreground text-sm hidden lg:table-cell">{payment.method}</td>
                                        <td className="px-6 py-5 text-muted-foreground text-sm hidden xl:table-cell">{payment.date}</td>
                                        <td className="px-6 py-5 text-muted-foreground text-sm hidden lg:table-cell">
                                            {payment.fee} ر.س
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={`flex items-center justify-center gap-1 font-black text-lg ${payment.type === "deposit" ? "text-green-600" : "text-foreground"
                                                }`}>
                                                {payment.type === "deposit" ? "+" : "-"} {payment.amount}
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
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400`}>
                                                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                                مكتملة
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {currentPayments.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center text-muted-foreground">
                                        لا توجد معاملات تطابق البحث
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                {filteredPayments.length > 0 && (
                    <div className="p-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-sm font-medium text-muted-foreground">
                            عرض <span className="text-foreground font-bold">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPayments.length)}</span> من أصل <span className="text-foreground font-bold">{filteredPayments.length}</span> معاملة
                        </div>

                        <div className="flex items-center gap-2">
                            <button 
                                disabled={currentPage === 1}
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
