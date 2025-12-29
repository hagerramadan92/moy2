"use client";

import { useState } from "react";
import { IoWalletOutline, IoFilterSharp, IoSearchOutline, IoDocumentText } from "react-icons/io5";
import { FaArrowUp, FaArrowDown, FaArrowRight, FaChevronRight, FaFileDownload, FaHistory } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RxDotsHorizontal } from "react-icons/rx";
import { motion, AnimatePresence } from "framer-motion";
import { MdDateRange, MdTrendingUp } from "react-icons/md";

export default function PaymentHistoryPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState("all");

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
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all border border-white/10">
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
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all border border-white/10">
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
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all border border-white/10">
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
                <div className="relative flex-1 max-w-md w-full">
                    <IoSearchOutline className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                        type="text"
                        placeholder="ابحث برقم المعاملة أو الوصف..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-12 pl-4 py-3.5 bg-white dark:bg-card border-2 border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all font-medium shadow-sm hover:shadow-md"
                    />
                </div>

                <div className="flex gap-3 flex-wrap">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-5 py-3.5 bg-white dark:bg-card border-2 border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all cursor-pointer font-bold shadow-sm hover:shadow-md hover:border-[#579BE8]/50"
                    >
                        {periods.map(period => (
                            <option key={period.id} value={period.id}>{period.label}</option>
                        ))}
                    </select>

                    <button className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#579BE8] to-[#315782] text-white border-2 border-transparent rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold shadow-lg active:scale-95">
                        <FaFileDownload />
                        <span>تصدير</span>
                    </button>
                </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-white dark:bg-card border border-border/60 rounded-[2.5rem] shadow-sm overflow-hidden">\n
                {/* Tabs Header */}
                <div className="p-3 border-b border-border/60 flex items-center justify-between bg-secondary/5">
                    <div className="flex bg-secondary/30 p-1 rounded-2xl w-fit">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all relative ${activeTab === tab.id
                                    ? "text-primary shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white dark:bg-card rounded-xl shadow-sm"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="text-sm text-muted-foreground font-medium">
                        {filteredPayments.length} معاملة
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-secondary/10 text-muted-foreground/70 text-sm font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">رقم المعاملة</th>
                                <th className="px-6 py-4">التفاصيل</th>
                                <th className="px-6 py-4">طريقة الدفع</th>
                                <th className="px-6 py-4">التاريخ والوقت</th>
                                <th className="px-6 py-4">الرسوم</th>
                                <th className="px-6 py-4">المبلغ</th>
                                <th className="px-6 py-4 text-center">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            <AnimatePresence mode="popLayout">
                                {filteredPayments.map((payment) => (
                                    <motion.tr
                                        key={payment.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        layout
                                        className="hover:bg-secondary/10 transition-colors group"
                                    >
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-mono bg-secondary/40 px-2 py-1 rounded-lg text-muted-foreground">
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
                                        <td className="px-6 py-5">
                                            <span className="text-sm text-muted-foreground">{payment.method}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm text-muted-foreground">{payment.date}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm text-muted-foreground">
                                                {payment.fee} ر.س
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div
                                                className={`flex items-center gap-1 font-black text-lg ${payment.type === "deposit" ? "text-green-600" : "text-foreground"
                                                    }`}
                                            >
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
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100/50 text-green-600 dark:bg-green-500/10 rounded-full text-xs font-bold">
                                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                                                مكتملة
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filteredPayments.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                            <div className="bg-secondary/20 p-6 rounded-full mb-4">
                                <IoWalletOutline size={48} className="text-muted-foreground/30" />
                            </div>
                            <h4 className="text-lg font-bold mb-1">لا توجد معاملات</h4>
                            <p className="text-sm text-muted-foreground">
                                لم يتم العثور على أي معاملات تطابق البحث.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer / Pagination */}
                {filteredPayments.length > 0 && (
                    <div className="p-6 border-t border-border/60 bg-secondary/5 flex items-center justify-between flex-wrap gap-4">
                        <p className="text-sm text-muted-foreground font-medium">
                            عرض 1-{filteredPayments.length} من {paymentHistory.length} معاملة
                        </p>

                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-xl border border-border hover:bg-white dark:hover:bg-card hover:border-primary/50 transition-all text-muted-foreground hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed group">
                                <FaChevronRight className="w-4 h-4" />
                            </button>

                            {[1, 2, 3].map((page, i) => (
                                <button
                                    key={i}
                                    className={`min-w-[40px] h-[40px] rounded-xl font-bold transition-all ${page === 1
                                        ? "bg-gradient-to-r from-[#579BE8] to-[#124987] text-white shadow-lg shadow-[#579BE8]/20"
                                        : "border border-border hover:bg-white dark:hover:bg-card hover:border-primary/50 text-muted-foreground hover:text-primary shadow-sm"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button className="p-2 rounded-xl border border-border hover:bg-white dark:hover:bg-card hover:border-primary/50 transition-all text-muted-foreground hover:text-primary rotate-180">
                                <FaChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
