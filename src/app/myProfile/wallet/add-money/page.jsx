"use client";

import { useState } from "react";
import { FaAppleAlt, FaApplePay, FaArrowRight, FaPlus } from "react-icons/fa";
import { IoWalletOutline } from "react-icons/io5";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";
import { BsCreditCard2FrontFill } from "react-icons/bs";
import { MdSecurity } from "react-icons/md";

export default function AddMoneyPage() {
    const router = useRouter();
    const [amount, setAmount] = useState("");
    const [selectedMethod, setSelectedMethod] = useState("card");

    const quickAmounts = ["50", "100", "200", "500", "1000"];

    const handleAddFund = () => {
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            Swal.fire({
                title: "خطأ",
                text: "يرجى إدخال مبلغ صحيح",
                icon: "error",
                confirmButtonColor: "#579BE8",
                confirmButtonText: "موافق"
            });
            return;
        }

        Swal.fire({
            title: "جاري المعالجة",
            text: "يرجى الانتظار بينما نقوم بمعالجة طلبك...",
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            },
            timer: 2000
        }).then(() => {
            Swal.fire({
                title: "محفظتك صارت أثقل",
                text: `تم إضافة ${amount} ر.س إلى محفظتك`,
                icon: "success",
                confirmButtonColor: "#579BE8",
                confirmButtonText: "العودة للمحفظة"
            }).then(() => {
                router.push("/myProfile/wallet");
            });
        });
    };

    return (
        <div className="space-y-6 fade-in-up mt-1" >
            {/* Header */}
            <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <IoWalletOutline size={120} />
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl hover:bg-white/20 transition-all shadow-lg group"
                    >
                        <FaArrowRight className="text-white group-hover:scale-110 transition-transform" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-white">إضافة أموال</h2>
                        <p className="text-white/90 text-sm">قم بشحن محفظتك بسهولة وأمان</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Amount Selection */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-card border border-border/60 rounded-3xl p-8 shadow-sm">
                        <label className="text-lg font-bold mb-4 block">كم تبغي تضيف إلى رصيدك في موية جو كاش؟</label>

                        <div className="relative mb-6">
                            <Input
                                type="text"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="h-[80px] text-4xl font-black pr-16 text-center focus:ring-4 focus:ring-[#579BE8]/10 border-2 border-[#579BE8]/20 rounded-2xl"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-secondary/50 p-2 rounded-xl">
                                <Image src="/images/RS2.png" alt="RS" width={32} height={32} quality={100} unoptimized />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {quickAmounts.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => setAmount(q)}
                                    className={`py-3 rounded-xl font-bold border-2 transition-all ${amount === q
                                        ? "bg-[#579BE8] border-[#579BE8] text-white shadow-lg shadow-[#579BE8]/20"
                                        : "border-border/60 hover:border-[#579BE8]/50 hover:bg-[#579BE8]/5 text-muted-foreground"
                                        }`}
                                >
                                    +{q}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-card border border-border/60 rounded-3xl p-8 shadow-sm">
                        <label className="text-lg font-bold mb-4 block"> اختر طريقة الدفع</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { id: "card", label: "بطاقة أتمان", icon: <BsCreditCard2FrontFill /> },
                                { id: "apple", label: "أبل باي", icon: <FaApplePay /> },
                                { id: "stc", label: "باي STC ", icon: <Image src="/images/stc.png" alt="STC" width={32} height={32} quality={100} unoptimized /> }
                            ].map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${selectedMethod === method.id
                                        ? "border-[#579BE8] bg-[#579BE8]/5 shadow-md text-[#579BE8]"
                                        : "border-border/60 hover:border-[#579BE8]/30"
                                        }`}
                                >
                                    <span className={`text-2xl ${selectedMethod === method.id ? "text-[#579BE8]" : "text-muted-foreground"}`}>{method.icon}</span>
                                    <span className="font-bold text-sm">{method.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="h-fit space-y-6">
                    <div className="bg-gradient-to-br from-[#579BE8] to-[#315782] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                            <IoWalletOutline size={120} />
                        </div>
                        <h4 className="text-lg font-bold mb-4 opacity-90">ملخص العملية</h4>
                        <div className="space-y-3 mb-6 relative z-10">
                            <div className="flex justify-between text-sm opacity-80">
                                <span>المبلغ المدخل:</span>
                                <span>{amount || "0"} ر.س</span>
                            </div>
                            <div className="flex justify-between text-sm opacity-80">
                                <span>رسوم الخدمة:</span>
                                <span>0.00 ر.س</span>
                            </div>
                            <div className="h-[1px] bg-white/20 my-2" />
                            <div className="flex justify-between text-xl font-black">
                                <span>الإجمالي:</span>
                                <span>{amount || "0"} ر.س</span>
                            </div>
                        </div>
                        <button
                            onClick={handleAddFund}
                            className="w-full bg-white text-[#579BE8] font-black py-4 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                        >
                            <FaPlus />
                            <span>تأكيد الإضافة</span>
                        </button>
                    </div>

                    <div className="bg-secondary/10 border border-border/50 rounded-2xl p-4 flex gap-3">
                        <div className="text-2xl text-gray-500">
                            <MdSecurity />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            جميع معاملاتك المالية مشفرة وآمنة وفقاً لأعلى معايير الأمان العالمية.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
