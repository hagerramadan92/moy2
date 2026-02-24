"use client";

import { useState, useEffect } from "react";
import React from 'react'
import { FaBox, FaUserCircle, FaTag, FaHeadset, FaQuestionCircle, FaRegUser } from "react-icons/fa";
import { IoIosSearch, IoIosArrowDown, IoIosArrowBack, IoIosWater } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Faq {
    id: number;
    question: string;
    answer: string;
    sort_order: number;
    status: string;
    created_at: string;
    updated_at: string;
}

interface ApiResponse {
    status: boolean;
    message: string;
    data: Faq[];
}

export default function FaqsPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/faq`, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('فشل في تحميل الأسئلة الشائعة');
                }

                const data: ApiResponse = await response.json();
                
                if (data.status && Array.isArray(data.data)) {
                    // ترتيب الأسئلة حسب sort_order
                    const sortedFaqs = data.data.sort((a, b) => a.sort_order - b.sort_order);
                    setFaqs(sortedFaqs);
                } else {
                    throw new Error('بيانات غير صالحة');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
                console.error('Error fetching FAQs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFaqs();
    }, []);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto mt-2 md:mt-5 bg-white dark:bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-[#579BE8]/10 rounded-lg text-[#579BE8]">
                        <FaQuestionCircle size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">الاسئلة الشائعة</h3>
                </div>
                
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div key={item} className="border border-border/40 rounded-2xl p-5">
                            <div className="flex items-center justify-between">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto mt-2 md:mt-5 bg-white dark:bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-[#579BE8]/10 rounded-lg text-[#579BE8]">
                        <FaQuestionCircle size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">الاسئلة الشائعة</h3>
                </div>
                
                <div className="text-center py-8">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-[#579BE8] text-white px-6 py-2 rounded-xl hover:bg-[#4a8ad0] transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* FAQs Section */}
            <div className="max-w-4xl mx-auto mt-2 md:mt-5 bg-white dark:bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-[#579BE8]/10 rounded-lg text-[#579BE8]">
                        <FaQuestionCircle size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">الاسئلة الشائعة</h3>
                </div>

                {faqs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        لا توجد أسئلة شائعة متاحة حالياً
                    </div>
                ) : (
                    <div className="space-y-4">
                        {faqs.map((faq) => (
                            <div
                                key={faq.id}
                                className={`border border-border/40 rounded-2xl transition-all ${openFaq === faq.id ? "bg-secondary/10 border-primary/20 shadow-sm" : "hover:border-primary/30"}`}
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                                    className="w-full flex items-center justify-between p-5 text-right transition-all"
                                >
                                    <span className="font-bold text-sm sm:text-base text-foreground">{faq.question}</span>
                                    <motion.div
                                        animate={{ rotate: openFaq === faq.id ? 180 : 0 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        className="text-muted-foreground"
                                    >
                                        <IoIosArrowDown size={20} />
                                    </motion.div>
                                </button>

                                <AnimatePresence>
                                    {openFaq === faq.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/10 mt-1 pt-4">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* <footer /> */}
        </>
    );
}