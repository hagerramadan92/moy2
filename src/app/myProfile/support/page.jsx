"use client";

import { useState } from "react";
import { IoIosSearch, IoIosArrowDown, IoIosArrowBack, IoIosWater } from "react-icons/io";
import { FaBox, FaUserCircle, FaTag, FaHeadset, FaQuestionCircle, FaRegUser } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaRegHandshake } from "react-icons/fa6";
import { CgCreditCard } from "react-icons/cg";
import { BsGift } from "react-icons/bs";
export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [openFaq, setOpenFaq] = useState(null);

    const categories = [
        { id: "orders", title: "الطلبات", icon: <IoIosWater />, description: " ادارة الطلبات - التتبع - الألغاء - تعديل", link: "/myProfile/orders" },
        { id: "account", title: " الحساب", icon: <FaRegUser />, description: "اعدادات الحسا ب والملف الشخصي", link: "/myProfile" },
        { id: "wallet", title: " الدفع والمحفظة", icon: <CgCreditCard />, description: "طرق الدفع - الرصيد - الاسترجاع ", link: "/myProfile" },
        { id: "deals", title: "التعاقدات", icon: <FaRegHandshake />, description: "العقود - الاشتراكات - التجديد", link: "/deals" },
        { id: "help", title: "الدعم الفني", icon: <FaHeadset />, description: "مساعدة فورية وحلول سريعة", link: "/myProfile/help-center" },
        { id: "gift", title: "العروض والخصومات", icon: <BsGift />, description: "كوبونات - عروض خاصة  ", link: "/myProfile/help-center" },
    ];

    const faqs = [
        {
            q:"كيف اعدل طلبي؟",
            a: "يمكنك تتبع شحنتك من خلال الانتقال إلى صفحة 'طلباتي' والضغط على زر تتبع الشحنة بجانب الطلب المعني."
        },
        {
            q: "كيف أتواصل مع السائق؟",
            a: "نقبل الاسترجاع خلال 14 يوماً من تاريخ الاستلام، بشرط أن يكون المنتج في حالته الأصلية وبتغليفه الأصلي."
        },
        {
            q: "ما هي طرق الدفع المتاحة؟",
            a: "يمكنك تعديل عنوان التوصيل للطلبات التي لم يتم شحنها بعد عبر التواصل مع الدعم الفني فوراً."
        },
        {
            q: "كيف الغي طلبي؟",
            a: "تابع صفحة العروض لدينا واشترك في النشرة البريدية للحصول على أحدث الكوبونات والخصومات الحصرية."
        },
        {
            q: "كم المدة المتوفعة للتوصيل؟",
            a: "تابع صفحة العروض لدينا واشترك في النشرة البريدية للحصول على أحدث الكوبونات والخصومات الحصرية."
        },
        {
            q: "هل يمكنني جدولة الطلب مسبقا؟",
            a: "تابع صفحة العروض لدينا واشترك في النشرة البريدية للحصول على أحدث الكوبونات والخصومات الحصرية."
        }
    ];

    return (
        <div className="space-y-10 fade-in-up">
            {/* Search Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] rounded-[2.5rem] p-8 sm:p-12 text-center text-white shadow-2xl border border-white/10">
                {/* Decorative Background Icons */}
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <FaHeadset size={160} />
                </div>
                <div className="absolute bottom-0 left-0 p-4 opacity-10 -rotate-12">
                    <FaQuestionCircle size={140} />
                </div>

                <div className="relative z-10 space-y-4">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight">مركز المساعدة</h2>
                    <p className="text-white/80 max-w-lg mx-auto text-sm sm:text-base">
                        اسأل وابحث واحصل على المساعدة بكل سهولة
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

            {/* FAQs Section */}
            <div className="bg-white dark:bg-card border border-border/50 rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-[#579BE8]/10 rounded-lg text-[#579BE8]">
                        <FaQuestionCircle size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">الاسئلة الشائعة</h3>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className={`border border-border/40 rounded-2xl transition-all ${openFaq === i ? "bg-secondary/10 border-primary/20 shadow-sm" : "hover:border-primary/30"}`}
                        >
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full flex items-center justify-between p-5 text-right transition-all"
                            >
                                <span className="font-bold text-sm sm:text-base text-foreground">{faq.q}</span>
                                <motion.div
                                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="text-muted-foreground"
                                >
                                    <IoIosArrowDown size={20} />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {openFaq === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/10 mt-1 pt-4">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Still Need Help? */}
                <div className="mt-10 p-6 bg-secondary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-border/10">
                    <div className="text-center sm:text-right">
                        <h5 className="font-bold text-lg mb-1">مازلت بحاجة للمساعدة؟</h5>
                        <p className="text-sm text-muted-foreground">فريقنا متاح لمساعدتك على مدار الساعة عبر الدردشة المباشرة</p>
                    </div>
                    <Link href="/myProfile/help-center">
                        <button className="bg-[#579BE8] text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-[#579BE8]/20 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-2">
                            <FaHeadset />
                            تواصل معنا الآن
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
