"use client";

import { useState, useEffect } from "react";
import { IoDocumentText, IoWalletOutline } from "react-icons/io5";
import { FaArrowUp, FaArrowDown, FaCalendarAlt, FaPlus, FaChevronRight } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RxDotsHorizontal } from "react-icons/rx";
import { motion, AnimatePresence } from "framer-motion";

export default function WalletPage() {
    const [activeTab, setActiveTab] = useState("all");
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const transactions = [
        { id: "456789356", type: "deposit", title: "إضافة ", date: "الثلاثاء - 10 نوفمبر 1.13ص", amount: "2,134", status: "completed" },
        { id: "456789357", type: "spend", title: "صرف", date: "الاثنين - 09 نوفمبر 4.20م", amount: "150", status: "completed" },
        { id: "456789358", type: "deposit", title: "إضافة ", date: "الأحد - 08 نوفمبر 10:30ص", amount: "75", status: "completed" },
    ];

    const filteredTransactions = transactions.filter(t => {
        if (activeTab === "deposit") return t.type === "deposit";
        if (activeTab === "spend") return t.type === "spend";
        return true;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

    const onPageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const tabs = [
        { id: "all", label: "الكل" },
        { id: "deposit", label: "الإيداع" },
        { id: "spend", label: "المصروفات" },
    ];

    return (
        <div className="space-y-6 fade-in-up">
            {/* Cards Row */}
            <div className="">
                <div className="flex py-5 flex-col gap-6 sm:py-10 sm:flex-row sm:items-center justify-between bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-primary-foreground p-8 rounded-3xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                        <IoWalletOutline size={160} />
                    </div>

                    <div className="flex flex-col gap-3 relative z-10">
                        <p className="text-sm opacity-90 font-medium">رصيد محفظتك الحالي</p>
                        <div className="flex items-center gap-3">
                            <h3 className="text-5xl md:text-6xl font-bold tracking-tight">2,134</h3>
                            <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-xl">
                                <Image src="/images/RS.png" alt="RS" width={32} height={32} quality={100}
                                    priority unoptimized className="w-8 h-8 object-contain" />
                            </div>
                        </div>
                    </div>

                    <button
                        id="addMoney"
                        onClick={() => router.push("/myProfile/wallet/add-money")}
                        className="flex py-3 px-6 items-center gap-3 bg-white text-[#579BE8] font-bold rounded-2xl cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all group relative z-10 shadow-lg"
                    >
                        <div className="bg-[#579BE8]/10 p-1.5 rounded-lg group-hover:bg-[#579BE8] group-hover:text-white transition-colors">
                            <FaPlus className="text-sm" />
                        </div>
                        <p>شحن المحفظة</p>
                    </button>
                </div>
            </div>

            <div className="flex gap-4 sm:flex-row flex-col">
                <div className="flex items-center gap-3 bg-white dark:bg-card p-3 rounded-2xl text-[15px] text-[#737375] border border-border/50 shadow-sm hover:border-primary/30 transition-colors cursor-pointer w-fit">
                    <FaCalendarAlt className="text-primary/60" />
                    <span className="font-medium">9 سبتمبر 2024 - 15 سبتمبر 2024</span>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-card p-3 rounded-2xl text-[15px] text-[#737375] border border-border/50 shadow-sm hover:border-primary/30 transition-colors cursor-pointer w-fit">
                    <IoDocumentText className="text-primary/60" />
                    <span className="font-medium">تصدير كشف حساب</span>
                </div>
            </div>

            {/* Transactions Section */}
            <div id="totalInfo" className="bg-white dark:bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                {/* Tabs Header */}
                <div className="p-6 border-b border-border/50 flex items-center justify-between">
                    <h3 className="font-black text-xl text-foreground">المعاملات</h3>
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

                {/* Transactions Content */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-right border-collapse">
                        <thead>
                            <tr className="bg-secondary/30 text-muted-foreground text-sm uppercase tracking-wider font-bold">
                                <th className="px-6 py-4 text-right">رقم المعاملة</th>
                                <th className="px-6 py-4 text-right">تفاصيل المعاملة</th>
                                <th className="px-6 py-4 hidden lg:table-cell">التاريخ والوقت</th>
                                <th className="px-6 py-4 text-center">المبلغ</th>
                                <th className="px-6 py-4 text-center">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            <AnimatePresence mode="popLayout">
                                {currentTransactions.map((transaction) => (
                                    <motion.tr
                                        key={transaction.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        layout
                                        className="hover:bg-secondary/10 transition-colors group"
                                    >
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-mono bg-secondary/40 px-2 py-1 rounded-lg text-muted-foreground">
                                                #{transaction.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl ${transaction.type === "deposit"
                                                    ? "bg-green-100/50 text-green-600 dark:bg-green-500/10"
                                                    : "bg-orange-100/50 text-orange-600 dark:bg-orange-500/10"
                                                    }`}>
                                                    {transaction.type === "deposit" ? <FaArrowDown size={14} /> : <FaArrowUp size={14} />}
                                                </div>
                                                <span className="font-bold text-foreground">{transaction.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-muted-foreground text-sm hidden lg:table-cell">{transaction.date}</td>
                                        <td className="px-6 py-5">
                                            <div className={`flex items-center justify-center gap-1 font-black text-lg ${transaction.type === "deposit" ? "text-green-600" : "text-foreground"
                                                }`}>
                                                {transaction.type === "deposit" ? "+" : "-"} {transaction.amount}
                                                <Image src="/images/RS.png" alt="RS" width={16} height={16}
                                                    priority unoptimized className="w-4 h-4 opacity-70" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button className="p-2 hover:bg-white dark:hover:bg-card rounded-lg transition-all border border-transparent hover:border-border hover:shadow-sm text-muted-foreground group-hover:text-[#579BE8]">
                                                <RxDotsHorizontal className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {currentTransactions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-muted-foreground">
                                        لا توجد معاملات تطابق البحث
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                {filteredTransactions.length > 0 && (
                    <div className="p-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-sm font-medium text-muted-foreground">
                            عرض <span className="text-foreground font-bold">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransactions.length)}</span> من أصل <span className="text-foreground font-bold">{filteredTransactions.length}</span> معاملة
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
