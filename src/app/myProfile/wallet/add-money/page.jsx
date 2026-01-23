"use client";

import { useState, useEffect } from "react";
import { FaArrowRight, FaPlus } from "react-icons/fa";
import { IoWalletOutline } from "react-icons/io5";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";
import { BsCreditCard2FrontFill } from "react-icons/bs";
import { MdSecurity } from "react-icons/md";
import { walletApi, handleApiError } from "@/utils/api";

export default function AddMoneyPage() {
    const router = useRouter();
    const [amount, setAmount] = useState("");
    const [selectedMethod, setSelectedMethod] = useState("");
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [walletData, setWalletData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const quickAmounts = ["50", "100", "200", "500", "1000"];

    // جلب طرق الدفع وبيانات المحفظة
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // جلب طرق الدفع
                const methodsResponse = await walletApi.getPaymentMethods();
                if (methodsResponse.status) {
                    setPaymentMethods(methodsResponse.data);
                    // تحديد طريقة الدفع الافتراضية (الأولى)
                    if (methodsResponse.data.length > 0) {
                        setSelectedMethod(methodsResponse.data[0].id);
                    }
                }

                // جلب بيانات المحفظة
                const walletResponse = await walletApi.getWalletBalance();
                if (walletResponse.status) {
                    setWalletData(walletResponse.data);
                }
            } catch (error) {
                const errorInfo = handleApiError(error, "حدث خطأ أثناء تحميل البيانات");
                Swal.fire({
                    title: "خطأ",
                    text: errorInfo.message,
                    icon: "error",
                    confirmButtonColor: "#579BE8",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAddFund = async () => {
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

        if (!selectedMethod) {
            Swal.fire({
                title: "خطأ",
                text: "يرجى اختيار طريقة الدفع",
                icon: "error",
                confirmButtonColor: "#579BE8",
                confirmButtonText: "موافق"
            });
            return;
        }

        setPaymentLoading(true);

        try {
            // إظهار نافذة التحميل
            Swal.fire({
                title: "جاري المعالجة",
                text: "يرجى الانتظار بينما نقوم بمعالجة طلبك...",
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                },
            });

            // طلب الإيداع
            const response = await walletApi.depositMoney(amount, selectedMethod);

            if (response.status) {
                // إغلاق نافذة التحميل
                Swal.close();

                // التحقق من وجود رابط الدفع
                if (response.data && response.data.payment_url) {
                    // عرض تفاصيل الدفع
                    Swal.fire({
                        title: "انتقال إلى بوابة الدفع",
                        html: `
                            <div class="text-right">
                                <p class="mb-2">سيتم نقلك إلى بوابة الدفع لإكمال العملية</p>
                                <p class="mb-1"><strong>رقم الطلب:</strong> ${response.data.order_id || 'N/A'}</p>
                                <p class="mb-1"><strong>المبلغ:</strong> ${response.data.amount || amount} ر.س</p>
                                <p class="mb-3"><strong>طريقة الدفع:</strong> ${selectedMethod}</p>
                                <p class="text-sm text-gray-500">يرجى عدم إغلاق هذه النافذة حتى تكمل عملية الدفع</p>
                            </div>
                        `,
                        icon: "info",
                        showCancelButton: true,
                        confirmButtonColor: "#579BE8",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "انتقال للدفع",
                        cancelButtonText: "إلغاء",
                        customClass: {
                            htmlContainer: 'text-right'
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // فتح رابط الدفع في نافذة جديدة
                            const paymentWindow = window.open(response.data.payment_url, '_blank');
                            
                            // مراقبة إغلاق نافذة الدفع
                            const checkWindowClosed = setInterval(() => {
                                if (paymentWindow.closed) {
                                    clearInterval(checkWindowClosed);
                                    // بعد إغلاق نافذة الدفع، تحديث البيانات
                                    handlePaymentComplete();
                                }
                            }, 1000);
                        }
                    });
                } else {
                    // إذا لم يكن هناك رابط دفع (ربما عملية فورية)
                    Swal.fire({
                        title: "تمت العملية",
                        text: response.message || "تم إضافة الأموال بنجاح",
                        icon: "success",
                        confirmButtonColor: "#579BE8",
                        confirmButtonText: "العودة للمحفظة"
                    }).then(() => {
                        // تحديث البيانات
                        fetchWalletData();
                        router.push("/myProfile/wallet");
                    });
                }
            } else {
                Swal.fire({
                    title: "خطأ",
                    text: response.message || "فشل في إنشاء طلب الدفع",
                    icon: "error",
                    confirmButtonColor: "#579BE8",
                });
            }
        } catch (error) {
            const errorInfo = handleApiError(error, "حدث خطأ أثناء معالجة الطلب");
            Swal.fire({
                title: "خطأ",
                text: errorInfo.message,
                icon: "error",
                confirmButtonColor: "#579BE8",
            });
        } finally {
            setPaymentLoading(false);
        }
    };

    // دالة للتأكد من اكتمال الدفع
    const handlePaymentComplete = async () => {
        try {
            Swal.fire({
                title: "جاري التحقق",
                text: "جاري التحقق من حالة الدفع...",
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                },
            });

            // انتظر قليلاً ثم تحديث البيانات
            setTimeout(async () => {
                await fetchWalletData();
                
                Swal.fire({
                    title: "تمت العملية",
                    text: "تم التحقق من عملية الدفع بنجاح",
                    icon: "success",
                    confirmButtonColor: "#579BE8",
                    confirmButtonText: "العودة للمحفظة"
                }).then(() => {
                    router.push("/myProfile/wallet");
                });
            }, 2000);

        } catch (error) {
            Swal.fire({
                title: "تحذير",
                text: "إذا قمت بالدفع بالفعل، سيظهر الرصيد قريباً. إذا لم يظهر، يرجى التواصل مع الدعم.",
                icon: "warning",
                confirmButtonColor: "#579BE8",
            });
        }
    };

    // دالة لجلب بيانات المحفظة بعد التحديث
    const fetchWalletData = async () => {
        try {
            const response = await walletApi.getWalletBalance();
            if (response.status) {
                setWalletData(response.data);
            }
        } catch (error) {
            console.error("Error fetching wallet data:", error);
        }
    };

    // الحصول على أيقونة طريقة الدفع
    const getMethodIcon = (methodId) => {
        const method = paymentMethods.find(m => m.id === methodId);
        if (!method) return <IoWalletOutline />;

        switch (method.icon) {
            case 'credit-card':
                return <BsCreditCard2FrontFill />;
            case 'wallet':
                return <IoWalletOutline />;
            case 'calendar':
                return <span className="text-2xl">📅</span>;
            case 'clock':
                return <span className="text-2xl">⏰</span>;
            default:
                return <IoWalletOutline />;
        }
    };

    // الحصول على اسم طريقة الدفع
    const getMethodName = (methodId) => {
        const method = paymentMethods.find(m => m.id === methodId);
        return method ? method.name : 'غير معروف';
    };

    return (
        <div className="space-y-6 fade-in-up mt-1">
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

            {loading ? (
                <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#579BE8]"></div>
                    <p className="mt-4 text-muted-foreground">جاري تحميل البيانات...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Amount Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-card border border-border/60 rounded-3xl p-8 shadow-sm">
                            <label className="text-lg font-bold mb-4 block">كم تبغي تضيف إلى رصيدك في موية جو كاش؟</label>

                            <div className="relative mb-6">
                                <Input
                                    type="text"
                                    value={amount}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9.]/g, '');
                                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                            setAmount(value);
                                        }
                                    }}
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {paymentMethods.map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedMethod(method.id)}
                                        disabled={method.requires_balance && (!walletData || parseFloat(walletData.balance) <= 0)}
                                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${selectedMethod === method.id
                                            ? "border-[#579BE8] bg-[#579BE8]/5 shadow-md text-[#579BE8]"
                                            : "border-border/60 hover:border-[#579BE8]/30"
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <span className={`text-2xl ${selectedMethod === method.id ? "text-[#579BE8]" : "text-muted-foreground"}`}>
                                            {getMethodIcon(method.id)}
                                        </span>
                                        <div className="text-center">
                                            <span className="font-bold text-sm block">{method.name}</span>
                                            <span className="text-xs text-muted-foreground mt-1">{method.description}</span>
                                            {method.requires_balance && (
                                                <span className="text-xs text-red-500 mt-1">(يتطلب رصيد في المحفظة)</span>
                                            )}
                                        </div>
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
                                    <span>{amount ? parseFloat(amount).toLocaleString('ar-SA') : "0"} ر.س</span>
                                </div>
                                <div className="flex justify-between text-sm opacity-80">
                                    <span>طريقة الدفع:</span>
                                    <span className="font-bold">{getMethodName(selectedMethod)}</span>
                                </div>
                                <div className="flex justify-between text-sm opacity-80">
                                    <span>رسوم الخدمة:</span>
                                    <span>0.00 ر.س</span>
                                </div>
                                <div className="h-[1px] bg-white/20 my-2" />
                                <div className="flex justify-between text-xl font-black">
                                    <span>الإجمالي:</span>
                                    <span>{amount ? parseFloat(amount).toLocaleString('ar-SA') : "0"} ر.س</span>
                                </div>
                            </div>
                            
                            {/* معلومات الحد اليومي */}
                            {walletData && (
                                <div className="mb-6 p-3 bg-white/10 rounded-xl">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>الرصيد الحالي:</span>
                                        <span className="font-bold">{parseFloat(walletData.balance).toLocaleString('ar-SA')} ر.س</span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>الحد اليومي المتبقي:</span>
                                        <span className="font-bold">
                                            {Math.max(0, parseFloat(walletData.daily_limit) - 
                                            (parseFloat(walletData.total_deposits_today) + parseFloat(walletData.total_withdrawals_today))).toLocaleString('ar-SA')} ر.س
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/20 rounded-full h-1.5">
                                        <div 
                                            className="bg-white h-1.5 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${Math.min(
                                                    ((parseFloat(walletData.total_deposits_today) + parseFloat(walletData.total_withdrawals_today)) / 
                                                    parseFloat(walletData.daily_limit)) * 100, 100
                                                )}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleAddFund}
                                disabled={!amount || paymentLoading || !selectedMethod}
                                className="w-full bg-white text-[#579BE8] font-black py-4 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {paymentLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#579BE8]"></div>
                                        <span>جاري المعالجة...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaPlus />
                                        <span>تأكيد الإضافة</span>
                                    </>
                                )}
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
            )}
        </div>
    );
}