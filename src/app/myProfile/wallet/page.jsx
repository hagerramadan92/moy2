"use client";

import { useState } from "react";
import { IoDocumentText, IoWalletOutline } from "react-icons/io5";
import { FaArrowUp, FaArrowDown, FaCalendarAlt, FaPlus, FaChevronRight } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { RxDotsHorizontal } from "react-icons/rx";
import { motion, AnimatePresence } from "framer-motion";

export default function WalletPage() {
    const [activeTab, setActiveTab] = useState("all");

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

                    <button className="flex py-3 px-6 items-center gap-3 bg-white text-[#579BE8] font-bold rounded-2xl cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all group relative z-10 shadow-lg">
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
            <div id="totalInfo" className="bg-white dark:bg-card border border-border/60 rounded-3xl shadow-sm overflow-hidden flex flex-col">
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
                </div>

                {/* Transactions Content */}
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-secondary/10 text-muted-foreground/70 text-sm font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">رقم الطلب </th>
                                <th className="px-6 py-4">تفاصيل المعاملة</th>
                                <th className="px-6 py-4">التاريخ والوقت</th>
                                <th className="px-6 py-4">المبلغ</th>
                                <th className="px-6 py-4 text-center">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            <AnimatePresence mode="popLayout">
                                {filteredTransactions.map((transaction) => (
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
                                        <td className="px-6 py-5">
                                            <span className="text-sm text-muted-foreground">{transaction.date}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={`flex items-center gap-1 font-black text-lg ${transaction.type === "deposit" ? "text-green-600" : "text-foreground"
                                                }`}>
                                                {transaction.type === "deposit" ? "+" : "-"} {transaction.amount}
                                                <Image src="/images/RS.png" alt="RS" width={16} height={16}
                                                    priority unoptimized className="w-4 h-4 opacity-70" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button className="p-2 hover:bg-white dark:hover:bg-card rounded-full transition-all border border-transparent hover:border-border hover:shadow-sm">
                                                <RxDotsHorizontal className="text-muted-foreground group-hover:text-primary transition-colors" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filteredTransactions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                            <div className="bg-secondary/20 p-6 rounded-full mb-4">
                                <IoWalletOutline size={48} className="text-muted-foreground/30" />
                            </div>
                            <h4 className="text-lg font-bold mb-1">لا توجد معاملات</h4>
                            <p className="text-sm text-muted-foreground">لم يتم العثور على أي عمليات في هذا القسم حتى الآن.</p>
                        </div>
                    )}
                </div>

                {/* Footer / Pagination */}
                <div className="p-6 border-t border-border/60 bg-secondary/5 flex items-center justify-between flex-wrap gap-4">
                    <p className="text-sm text-muted-foreground font-medium">عرض 1-10 من 50 معاملة</p>

                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl border border-border hover:bg-white dark:hover:bg-card hover:border-primary/50 transition-all text-muted-foreground hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed group">
                            <FaChevronRight className="w-4 h-4" />
                        </button>

                        {[1, 2, 3, "...", 12].map((page, i) => (
                            <button
                                key={i}
                                className={`min-w-[40px] h-[40px] rounded-xl font-bold transition-all ${page === 1
                                    ? "bg-[#579BE8] text-white shadow-lg shadow-[#579BE8]/20"
                                    : page === "..."
                                        ? "text-muted-foreground cursor-default"
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
            </div>
        </div>
    );
}
