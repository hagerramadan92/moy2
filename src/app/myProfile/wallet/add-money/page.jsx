"use client";

import { useState, useEffect } from "react";
import { FaArrowRight, FaPlus } from "react-icons/fa";
import { IoWalletOutline } from "react-icons/io5";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";
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
                    customClass: {
                        popup: '!w-[90%] sm:!w-[400px] md:!w-[500px] !max-w-[90vw]',
                        title: '!text-base sm:!text-lg md:!text-xl',
                        htmlContainer: '!text-sm sm:!text-base',
                        confirmButton: '!text-xs sm:!text-sm md:!text-base !py-2 sm:!py-2.5 md:!py-3 !px-4 sm:!px-6 md:!px-8'
                    }
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
                confirmButtonText: "موافق",
                customClass: {
                    popup: '!w-[90%] sm:!w-[400px] md:!w-[500px] !max-w-[90vw]',
                    title: '!text-base sm:!text-lg md:!text-xl',
                    htmlContainer: '!text-sm sm:!text-base',
                    confirmButton: '!text-xs sm:!text-sm md:!text-base !py-2 sm:!py-2.5 md:!py-3 !px-4 sm:!px-6 md:!px-8'
                }
            });
            return;
        }

        if (!selectedMethod) {
            Swal.fire({
                title: "خطأ",
                text: "يرجى اختيار طريقة الدفع",
                icon: "error",
                confirmButtonColor: "#579BE8",
                confirmButtonText: "موافق",
                customClass: {
                    popup: '!w-[90%] sm:!w-[400px] md:!w-[500px] !max-w-[90vw]',
                    title: '!text-base sm:!text-lg md:!text-xl',
                    htmlContainer: '!text-sm sm:!text-base',
                    confirmButton: '!text-xs sm:!text-sm md:!text-base !py-2 sm:!py-2.5 md:!py-3 !px-4 sm:!px-6 md:!px-8'
                }
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
                customClass: {
                    popup: '!w-[90%] sm:!w-[350px] md:!w-[400px] !max-w-[90vw]',
                    title: '!text-base sm:!text-lg md:!text-xl',
                    htmlContainer: '!text-sm sm:!text-base'
                },
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
                                <p class="mb-2 text-sm sm:text-base">سيتم نقلك إلى بوابة الدفع لإكمال العملية</p>
                                <p class="mb-1 text-xs sm:text-sm md:text-base"><strong>رقم الطلب:</strong> ${response.data.order_id || 'N/A'}</p>
                                <p class="mb-1 text-xs sm:text-sm md:text-base"><strong>المبلغ:</strong> ${response.data.amount || amount} ر.س</p>
                                <p class="mb-3 text-xs sm:text-sm md:text-base"><strong>طريقة الدفع:</strong> ${selectedMethod}</p>
                                <p class="text-xs sm:text-sm text-gray-700">يرجى عدم إغلاق هذه النافذة حتى تكمل عملية الدفع</p>
                            </div>
                        `,
                        icon: "info",
                        showCancelButton: true,
                        confirmButtonColor: "#579BE8",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "انتقال للدفع",
                        cancelButtonText: "إلغاء",
                        customClass: {
                            popup: '!w-[90%] sm:!w-[400px] md:!w-[500px] !max-w-[90vw]',
                            title: '!text-base sm:!text-lg md:!text-xl',
                            htmlContainer: '!text-right !text-sm sm:!text-base',
                            confirmButton: '!text-xs sm:!text-sm md:!text-base !py-2 sm:!py-2.5 md:!py-3 !px-4 sm:!px-6 md:!px-8 !mx-1 sm:!mx-2',
                            cancelButton: '!text-xs sm:!text-sm md:!text-base !py-2 sm:!py-2.5 md:!py-3 !px-4 sm:!px-6 md:!px-8 !mx-1 sm:!mx-2'
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
                        confirmButtonText: "العودة للمحفظة",
                        customClass: {
                            popup: '!w-[90%] sm:!w-[400px] md:!w-[500px] !max-w-[90vw]',
                            title: '!text-base sm:!text-lg md:!text-xl',
                            htmlContainer: '!text-sm sm:!text-base',
                            confirmButton: '!text-xs sm:!text-sm md:!text-base !py-2 sm:!py-2.5 md:!py-3 !px-4 sm:!px-6 md:!px-8'
                        }
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
                    customClass: {
                        popup: '!w-[90%] sm:!w-[400px] md:!w-[500px] !max-w-[90vw]',
                        title: '!text-base sm:!text-lg md:!text-xl',
                        htmlContainer: '!text-sm sm:!text-base',
                        confirmButton: '!text-xs sm:!text-sm md:!text-base !py-2 sm:!py-2.5 md:!py-3 !px-4 sm:!px-6 md:!px-8'
                    }
                });
            }
        } catch (error) {
            const errorInfo = handleApiError(error, "حدث خطأ أثناء معالجة الطلب");
            Swal.fire({
                title: "خطأ",
                text: errorInfo.message,
                icon: "error",
                confirmButtonColor: "#579BE8",
                customClass: {
                    popup: '!w-[90%] sm:!w-[400px] md:!w-[500px] !max-w-[90vw]',
                    title: '!text-base sm:!text-lg md:!text-xl',
                    htmlContainer: '!text-sm sm:!text-base',
                    confirmButton: '!text-xs sm:!text-sm md:!text-base !py-2 sm:!py-2.5 md:!py-3 !px-4 sm:!px-6 md:!px-8'
                }
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
                customClass: {
                    popup: '!w-[90%] sm:!w-[350px] md:!w-[400px] !max-w-[90vw]',
                    title: '!text-base sm:!text-lg md:!text-xl',
                    htmlContainer: '!text-sm sm:!text-base'
                },
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
                    confirmButtonText: "العودة للمحفظة",
                    customClass: {
                        popup: '!w-[90%] sm:!w-[400px] md:!w-[500px] !max-w-[90vw]',
                        title: '!text-base sm:!text-lg md:!text-xl',
                        htmlContainer: '!text-sm sm:!text-base',
                        confirmButton: '!text-xs sm:!text-sm md:!text-base !py-2 sm:!py-2.5 md:!py-3 !px-4 sm:!px-6 md:!px-8'
                    }
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
                customClass: {
                    popup: '!w-[90%] sm:!w-[400px] md:!w-[500px] !max-w-[90vw]',
                    title: '!text-base sm:!text-lg md:!text-xl',
                    htmlContainer: '!text-sm sm:!text-base',
                    confirmButton: '!text-xs sm:!text-sm md:!text-base !py-2 sm:!py-2.5 md:!py-3 !px-4 sm:!px-6 md:!px-8'
                }
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

    // الحصول على صورة طريقة الدفع
    const getMethodImage = (method) => {
        if (!method) return null;
        
        // استخدام image من method إذا كان موجوداً
        if (method.image) {
            return (
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
                    <Image
                        src={method.image}
                        alt={method.name}
                        fill
                        className="object-contain"
                        quality={100}
                        unoptimized
                    />
                </div>
            );
        }
        
        // استخدام صور افتراضية بناءً على method.id أو method.name
        const methodId = method.id?.toLowerCase() || method.name?.toLowerCase() || '';
        
        if (methodId.includes('tabby') || methodId.includes('تابي')) {
            return (
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
                    <Image
                        src="/images/tabby.webp"
                        alt={method.name}
                        fill
                        className="object-contain"
                        quality={100}
                        unoptimized
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling?.classList.remove('hidden');
                        }}
                    />
                </div>
            );
        }
        
        if (methodId.includes('tamara') || methodId.includes('تمارا')) {
            return (
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
                    <Image
                        src="/images/tamara.webp"
                        alt={method.name}
                        fill
                        className="object-contain"
                        quality={100}
                        unoptimized
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling?.classList.remove('hidden');
                        }}
                    />
                </div>
            );
        }
        
        if (methodId.includes('paymob') || methodId.includes('credit') || methodId.includes('card') || methodId.includes('بطاقة')) {
            return (
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
                    <Image
                        src="/images/paymob.png"
                        alt={method.name}
                        fill
                        className="object-contain"
                        quality={100}
                        unoptimized
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling?.classList.remove('hidden');
                        }}
                    />
                </div>
            );
        }
        
        if (methodId.includes('apple') || methodId.includes('آبل')) {
            return (
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
                    <Image
                        src="/images/ApplePay.png"
                        alt={method.name}
                        fill
                        className="object-contain"
                        quality={100}
                        unoptimized
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling?.classList.remove('hidden');
                        }}
                    />
                </div>
            );
        }
        
        // افتراضي: محفظة
        return (
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
                <Image
                    src="/images/wallet-icon.png"
                    alt={method.name}
                    fill
                    className="object-contain"
                    quality={100}
                    unoptimized
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling?.classList.remove('hidden');
                    }}
                />
            </div>
        );
    };

    // الحصول على اسم طريقة الدفع
    const getMethodName = (methodId) => {
        const method = paymentMethods.find(m => m.id === methodId);
        return method ? method.name : 'غير معروف';
    };

    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6 fade-in-up mt-1 p-2 sm:p-4 md:p-0">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 sm:p-3 md:p-4 opacity-10 rotate-12">
                    <IoWalletOutline size={80} className="sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-[120px] lg:h-[120px]" />
                </div>
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 relative z-10">
                    <button
                        onClick={() => router.back()}
                        className="p-2 sm:p-2.5 md:p-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all shadow-lg group"
                    >
                        <FaArrowRight className="text-white w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                    </button>
                    <div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">إضافة أموال</h2>
                        <p className="text-white/90 text-xs sm:text-sm">قم بشحن محفظتك بسهولة وأمان</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                    {/* Amount Selection Skeleton */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
                        <div className="bg-white dark:bg-card border border-border/60 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm">
                            <div className="h-5 sm:h-6 w-48 sm:w-56 md:w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-3 sm:mb-4"></div>
                            <div className="relative mb-4 sm:mb-5 md:mb-6">
                                <div className="h-16 sm:h-20 md:h-[80px] bg-gray-200 dark:bg-gray-700 rounded-xl sm:rounded-2xl animate-pulse"></div>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="h-10 sm:h-11 md:h-12 bg-gray-200 dark:bg-gray-700 rounded-lg sm:rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-card border border-border/60 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm">
                            <div className="h-5 sm:h-6 w-36 sm:w-40 md:w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-3 sm:mb-4"></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-24 sm:h-28 md:h-32 bg-gray-200 dark:bg-gray-700 rounded-xl sm:rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary Card Skeleton */}
                    <div className="h-fit space-y-4 sm:space-y-5 md:space-y-6">
                        <div className="bg-gradient-to-br from-[#579BE8] to-[#315782] text-white rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 shadow-xl relative overflow-hidden">
                            <div className="h-5 sm:h-6 w-24 sm:w-28 md:w-32 bg-white/20 rounded animate-pulse mb-3 sm:mb-4"></div>
                            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5 md:mb-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex justify-between">
                                        <div className="h-3 sm:h-3.5 md:h-4 w-20 sm:w-22 md:w-24 bg-white/20 rounded animate-pulse"></div>
                                        <div className="h-3 sm:h-3.5 md:h-4 w-16 sm:w-18 md:w-20 bg-white/20 rounded animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                            <div className="h-10 sm:h-11 md:h-12 w-full bg-white/20 rounded-xl sm:rounded-2xl animate-pulse"></div>
                        </div>
                        <div className="bg-secondary/10 border border-border/50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                            <div className="h-12 sm:h-14 md:h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                    {/* Amount Selection */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
                        <div className="bg-white dark:bg-card border border-border/60 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm">
                            <label className="text-base sm:text-lg font-bold mb-3 sm:mb-4 block">كم تبغي تضيف إلى رصيدك في موية جو كاش؟</label>

                            <div className="relative mb-4 sm:mb-5 md:mb-6">
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
                                    className="h-16 sm:h-20 md:h-[80px] text-2xl sm:text-3xl md:text-4xl font-black pr-12 sm:pr-14 md:pr-16 text-center focus:ring-4 focus:ring-[#579BE8]/10 border-2 border-[#579BE8]/20 rounded-xl sm:rounded-2xl"
                                />
                                <div className="absolute right-3 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 bg-secondary/50 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
                                    <Image src="/images/RS2.png" alt="RS" width={24} height={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" quality={100} unoptimized />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                                {quickAmounts.map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => setAmount(q)}
                                        className={`py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-bold border-2 transition-all text-sm sm:text-base ${amount === q
                                            ? "bg-[#579BE8] border-[#579BE8] text-white shadow-lg shadow-[#579BE8]/20"
                                            : "border-border/60 hover:border-[#579BE8]/50 hover:bg-[#579BE8]/5 text-muted-foreground"
                                            }`}
                                    >
                                        +{q}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-card border border-border/60 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm">
                            <label className="text-base sm:text-lg font-bold mb-3 sm:mb-4 block"> اختر طريقة الدفع</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                {paymentMethods.map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedMethod(method.id)}
                                        disabled={method.requires_balance && (!walletData || parseFloat(walletData.balance) <= 0)}
                                        className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${selectedMethod === method.id
                                            ? "border-[#579BE8] bg-[#579BE8]/5 shadow-md text-[#579BE8]"
                                            : "border-border/60 hover:border-[#579BE8]/30"
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <div className={`${selectedMethod === method.id ? "opacity-100" : "opacity-70"}`}>
                                            {getMethodImage(method)}
                                        </div>
                                        <div className="text-center">
                                            <span className="font-bold text-xs sm:text-sm block">{method.name}</span>
                                            <span className="text-xs text-muted-foreground mt-1">{method.description}</span>
                                            {method.requires_balance && (
                                                <span className="text-xs text-red-600 mt-1 block">(يتطلب رصيد في المحفظة)</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="h-fit space-y-4 sm:space-y-5 md:space-y-6">
                        <div className="bg-gradient-to-br from-[#579BE8] to-[#315782] text-white rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute -right-2 sm:-right-3 md:-right-4 -bottom-2 sm:-bottom-3 md:-bottom-4 opacity-10">
                                <IoWalletOutline size={80} className="sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-[120px] lg:h-[120px]" />
                            </div>
                            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 opacity-90">ملخص العملية</h4>
                            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5 md:mb-6 relative z-10">
                                <div className="flex justify-between text-xs sm:text-sm opacity-80">
                                    <span>المبلغ المدخل:</span>
                                    <span>{amount ? parseFloat(amount).toLocaleString('ar-SA') : "0"} ر.س</span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-sm opacity-80">
                                    <span>طريقة الدفع:</span>
                                    <span className="font-bold">{getMethodName(selectedMethod)}</span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-sm opacity-80">
                                    <span>رسوم الخدمة:</span>
                                    <span>0.00 ر.س</span>
                                </div>
                                <div className="h-[1px] bg-white/20 my-1 sm:my-2" />
                                <div className="flex justify-between text-lg sm:text-xl font-black">
                                    <span>الإجمالي:</span>
                                    <span>{amount ? parseFloat(amount).toLocaleString('ar-SA') : "0"} ر.س</span>
                                </div>
                            </div>
                            
                            {/* معلومات الحد اليومي */}
                            {walletData && (
                                <div className="mb-4 sm:mb-5 md:mb-6 p-2 sm:p-3 bg-white/10 rounded-lg sm:rounded-xl">
                                    <div className="flex justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
                                        <span>الرصيد الحالي:</span>
                                        <span className="font-bold">{parseFloat(walletData.balance).toLocaleString('ar-SA')} ر.س</span>
                                    </div>
                                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                                        <span>الحد اليومي المتبقي:</span>
                                        <span className="font-bold">
                                            {Math.max(0, parseFloat(walletData.daily_limit) - 
                                            (parseFloat(walletData.total_deposits_today) + parseFloat(walletData.total_withdrawals_today))).toLocaleString('ar-SA')} ر.س
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/20 rounded-full h-1 sm:h-1.5">
                                        <div 
                                            className="bg-white h-1 sm:h-1.5 rounded-full transition-all duration-300"
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
                                className="w-full bg-white text-[#579BE8] font-black py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                                {paymentLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-[#579BE8]"></div>
                                        <span>جاري المعالجة...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span>تأكيد الإضافة</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="bg-secondary/10 border border-border/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex gap-2 sm:gap-3">
                            <div className="text-xl sm:text-2xl text-gray-700 flex-shrink-0">
                                <MdSecurity />
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                جميع معاملاتك المالية مشفرة وآمنة وفقاً لأعلى معايير الأمان العالمية.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}