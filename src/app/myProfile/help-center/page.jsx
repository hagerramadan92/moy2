

"use client";

import { useState, useEffect } from "react";
import { IoIosSearch, IoIosArrowDown, IoIosArrowBack, IoIosWater } from "react-icons/io";
import { FaBox, FaUserCircle, FaTag, FaHeadset, FaQuestionCircle, FaRegUser } from "react-icons/fa";

import Link from "next/link";
import { FaRegHandshake } from "react-icons/fa6";
import { CgCreditCard } from "react-icons/cg";
import { BsGift } from "react-icons/bs";
export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [openFaq, setOpenFaq] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const categories = [
        { id: "orders", title: "الطلبات", icon: <IoIosWater />, description: " ادارة الطلبات - التتبع - الألغاء - تعديل", link: "/myProfile/orders" },
        { id: "account", title: " الحساب", icon: <FaRegUser />, description: "اعدادات الحسا ب والملف الشخصي", link: "/myProfile" },
        { id: "wallet", title: " الدفع والمحفظة", icon: <CgCreditCard />, description: "طرق الدفع - الرصيد - الاسترجاع ", link: "/myProfile" },
        { id: "deals", title: "التعاقدات", icon: <FaRegHandshake />, description: "العقود - الاشتراكات - التجديد", link: "/deals" },
        { id: "help", title: "الدعم الفني", icon: <FaHeadset />, description: "مساعدة فورية وحلول سريعة", link: "/myProfile/help-center" },
        { id: "gift", title: "العروض والخصومات", icon: <BsGift />, description: "كوبونات - عروض خاصة  ", link: "/myProfile/help-center" },
    ];

  

    // Skeleton Components
    const SupportSkeleton = () => (
        <div className="space-y-10 fade-in-up">
            {/* Search Header Skeleton */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] rounded-2xl p-8 sm:p-12 text-center text-white shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <FaHeadset size={160} />
                </div>
                <div className="absolute bottom-0 left-0 p-4 opacity-10 -rotate-12">
                    <FaQuestionCircle size={140} />
                </div>
                <div className="relative z-10 space-y-4">
                    <div className="h-8 sm:h-10 w-64 bg-white/20 rounded-lg animate-pulse mx-auto"></div>
                    <div className="h-4 w-96 bg-white/10 rounded-lg animate-pulse mx-auto"></div>
                    <div className="max-w-xl mx-auto mt-8">
                        <div className="h-14 bg-white/20 rounded-2xl animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Categories Skeleton */}
            <div>
                <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white dark:bg-card flex items-center gap-4 border border-border/50 p-6 rounded-3xl">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQs Skeleton */}
            <div className="bg-white dark:bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="border border-border/40 rounded-2xl p-5">
                            <div className="flex items-center justify-between">
                                <div className="h-5 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-10 p-6 bg-secondary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="h-12 w-40 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <SupportSkeleton />;
    }

    return (
        <div className="space-y-10 fade-in-up">
            {/* Search Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] rounded-2xl p-8 sm:p-12 text-center text-white shadow-2xl">
                {/* Decorative Background Icons */}
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <FaHeadset size={160} />
                </div>
                <div className="absolute bottom-0 left-0 p-4 opacity-10 -rotate-12">
                    <FaQuestionCircle size={140} />
                </div>

                <div className="relative z-10 space-y-4">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight"> المساعدة</h2>
                    <p className="text-white/80 max-w-lg mx-auto text-sm sm:text-base">
                        المساعدة اللي تبيها في مكان واحد أسأل و ابحث بسهولة
                    </p>

                    <div className="max-w-xl mx-auto mt-8 relative group">
                        <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none group-focus-within:text-[#579BE8] text-gray-400 transition-colors">
                            <IoIosSearch size={24} />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث عن سؤالك هنا (مثلاً: تتبع الطلب)..."
                            className="w-full py-4 pr-14 pl-6 bg-white dark:bg-card text-foreground rounded-2xl border-none shadow-2xl focus:ring-4 focus:ring-white/20 outline-none font-medium transition-all placeholder:text-gray-400 text-sm sm:text-base"
                        />
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            </div>

            {/* Support Categories */}
            <h1 className="text-2xl font-bold text-foreground">التصنيفات الرئيسية</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => (
                    <Link href={cat.link || "/"} key={cat.id}>
                        <div className="bg-white dark:bg-card flex items-center gap-4 border border-border/50 p-6 rounded-3xl hover:shadow-2xl hover:-translate-y-2 transition-all group h-full cursor-pointer relative overflow-hidden">
                            <div className="bg-[#579BE8]/10 p-3 text-xl rounded-lg w-fit text-[#579BE8] group-hover:bg-[#579BE8] group-hover:text-white transition-all duration-300 mb-4 shadow-sm">
                                {cat.icon}
                            </div>
                            <div>
                                <h2 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">{cat.title}</h2>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {cat.description}
                                </p>
                                <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                                    <IoIosArrowBack className="text-[#579BE8]" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            
        </div>
    );
}
