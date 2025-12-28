
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

import { FaDownload, FaPrint, FaStar, FaPhoneAlt, FaCommentDots, FaRegStar, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";
import { 
    BiArrowBack, 
    BiCalendar, 
    BiCheckCircle, 
    BiSolidNavigation, 
    BiSolidTruck, 
    BiTimeFive, 
    BiUser, 
    BiWater, 
    BiMessageSquareDetail,
    BiPhoneCall,
    BiMapPin,
    BiNavigation,
    BiX,
    BiCheck,
    BiError,
    BiSupport,
    BiRefresh
} from "react-icons/bi";

export default function OrderDetailsPage() {
    const params = useParams();
    const orderId = params.id;

    // States for Rating Modal
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    // Enhanced State Logic
    // 002 -> In Way (Processing)
    // 003 -> Pending
    // 004 -> Cancelled
    // default/001 -> Completed
    const isProcessing = orderId?.includes("002");
    const isPending = orderId?.includes("003");
    const isCancelled = orderId?.includes("004");
    const isCompleted = !isProcessing && !isPending && !isCancelled;

    const currentStatus = isProcessing ? "processing" : isPending ? "pending" : isCancelled ? "cancelled" : "completed";

    const orderData = {
        id: `#WTR-${orderId || "782"}`,
        status: currentStatus,
        date: "28 ديسمبر 2023",
        time: "11:45 صباحاً",
        waterType: "مياه تحلية نقية",
        size: "19 طن (وايت كبير)",
        quantity: "1 وايت كامل",
        cancellationReason: isCancelled ? "تم الإلغاء بناءً على طلب العميل - لم يتم العثور على سائق متوفر في الوقت المناسب" : null,
        customer: {
            name: "سعود بن ناصر",
            phone: "+966 50 987 6543",
            email: "s.nasser@example.com",
            address: "حي الملقا، طريق أنس بن مالك، الرياض"
        },
        driver: (isPending || isCancelled) ? null : {
            name: "أحمد الرشيدي",
            image: "/images/customer.png",
            rating: 4.9,
            phone: "+966 55 000 1111",
            vehicle: "وايت مرسيدس - لوحة (أ ب ج 1234)",
            deliveryTime: isProcessing ? "متوقع خلال 15 دقيقة" : "11:45 صباحاً",
            currentLocation: "طريق الملك فهد، الرياض"
        },
        payment: {
            method: "بطاقة فيزا (**** 5521)",
            status: isCancelled ? "مسترجع" : "مدفوع",
            transactionId: "TXN-1029384"
        },
        items: [
            { id: 1, name: "وايت مياه تحلية", category: "مياه صالحة للاستخدام", quantity: "19 طن", price: 350.00 },
        ],
        summary: {
            subtotal: 350.00,
            shipping: 0.00,
            tax: 52.50,
            total: 402.50
        },
        timeline: [
            { status: "تم استلام الطلب", completed: true, time: "11:00 AM" },
            { 
                status: isCancelled ? "تم إلغاء الطلب" : (isPending ? "انتظار تأكيد السائق" : "تجهيز الوايت"), 
                current: isPending || isCancelled, 
                completed: !isPending && !isCancelled, 
                time: isPending ? "الآن" : (isCancelled ? "11:05 AM" : "11:15 AM"),
                error: isCancelled 
            },
            { status: "جاري التوصيل", current: isProcessing, completed: isCompleted, time: isProcessing ? "الآن" : (isCompleted ? "11:30 AM" : "-"), hidden: isCancelled },
            { status: "تم التسليم", completed: isCompleted, time: isCompleted ? "11:45 AM" : "-", hidden: isCancelled },
        ]
    };

    const statusStyles = {
        completed: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
        processing: "bg-[#579BE8]/10 text-[#579BE8] dark:bg-[#579BE8]/10 dark:text-[#579BE8]",
        pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 font-bold animate-pulse",
        cancelled: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    };

    const statusText = {
        completed: "مكتمل التسليم",
        processing: "جاري التوصيل الآن",
        pending: "انتظار التأكيد",
        cancelled: "ملغي",
    };

    const handleRatingSubmit = () => {
        setIsSubmittingRating(true);
        setTimeout(() => {
            setIsSubmittingRating(false);
            setShowRatingModal(false);
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 3000);
            setUserRating(0);
        }, 1500);
    };

    return (
        <div className="space-y-6 fade-in-up pb-10 relative">
            
            {/* Success Toast */}
            {showSuccessToast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <BiCheck className="w-6 h-6" />
                    </div>
                    <span className="font-black text-sm">شكراً لك! تم استلام تقييمك بنجاح</span>
                </div>
            )}

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setShowRatingModal(false)}></div>
                    <div className="relative bg-white dark:bg-card w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-border animate-float-slow">
                        <button onClick={() => setShowRatingModal(false)} className="absolute top-6 left-6 w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-10"><BiX className="w-6 h-6" /></button>
                        <div className="p-10 text-center">
                            <div className="w-21 h-21 rounded-[2rem] bg-amber-500/10 mx-auto flex items-center justify-center mb-6"><FaStar className="w-12 h-12 text-amber-500" /></div>
                            <h3 className="text-2xl font-black mb-2 tracking-tight">تقييم تجربة التوصيل</h3>
                            <p className="text-sm text-muted-foreground mb-8">رأيك يهمنا في تحسين جودة خدمات مياه "ستون"</p>
                            <div className="flex flex-col items-center gap-8">
                                <div className="flex items-center gap-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setUserRating(star)} className="transition-transform active:scale-90">
                                            {star <= (hoverRating || userRating) ? <FaStar className="w-10 h-10 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]" /> : <FaRegStar className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />}
                                        </button>
                                    ))}
                                </div>
                                <div className="w-full text-right space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-[#579BE8]">ملاحظاتك (اختياري)</label>
                                    <textarea placeholder="اكتب تعليقك هنا عن جودة الخدمة أو السائق..." className="w-full h-32 bg-secondary/30 rounded-3xl p-6 text-sm border-2 border-transparent focus:border-[#579BE8] outline-none transition-all resize-none"></textarea>
                                </div>
                                <button disabled={userRating === 0 || isSubmittingRating} onClick={handleRatingSubmit} className={`w-full py-5 rounded-[2rem] font-black text-sm transition-all ${userRating === 0 ? "bg-secondary text-muted-foreground cursor-not-allowed" : "bg-[#579BE8] text-white shadow-xl shadow-[#579BE8]/30 hover:shadow-2xl hover:scale-[1.02] active:scale-95"}`}>{isSubmittingRating ? "جاري الإرسال..." : "تأكيد التقييم"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/myProfile/orders" className="p-3 rounded-2xl bg-white dark:bg-card border border-border hover:bg-secondary/50 transition-all shadow-sm"><BiArrowBack className="w-5 h-5" /></Link>
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h2 className="text-xl md:text-2xl font-black tracking-tight">{orderData.id}</h2>
                            <span className={`px-3 py-1 rounded-full text-[10px] md:text-[12px] font-bold ${statusStyles[orderData.status]}`}>{statusText[orderData.status]}</span>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">{isCancelled ? "أُلغي في:" : isProcessing ? "توقيت الطلب:" : "اكتمل في:"} {orderData.date} - {orderData.time}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {isCompleted && (
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#579BE8] text-white px-5 py-3 rounded-2xl text-[13px] font-black shadow-lg shadow-[#579BE8]/20 hover:scale-105 transition-all active:scale-95 whitespace-nowrap">
                            <BiRefresh className="w-5 h-5" />
                            <span>طلب مرة أخرى</span>
                        </button>
                    )}
                    <button className="flex items-center justify-center gap-2 bg-white dark:bg-card px-4 py-3 rounded-2xl text-[13px] font-medium border border-border shadow-sm hover:shadow-md transition-all flex-1 md:flex-none">
                        <FaDownload className="text-muted-foreground" />
                        <span className="hidden sm:inline">تحميل الفاتورة</span>
                        <span className="sm:hidden">الفاتورة</span>
                    </button>
                    {!isCancelled && (
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-card px-4 py-3 rounded-2xl text-[13px] font-medium border border-border shadow-sm hover:shadow-md transition-all group">
                            <FaPrint className="text-muted-foreground group-hover:text-foreground transition-colors" />
                            <span className="hidden sm:inline">طباعة</span>
                            <span className="sm:hidden">طباعة</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content View Adapts to State */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Visual Vision Area (Map or Banner) */}
                <div className="lg:col-span-3 bg-white dark:bg-card rounded-[2rem] md:rounded-[2.5rem] border border-border/50 shadow-sm overflow-hidden relative min-h-[400px] md:min-h-[500px] flex flex-col">
                    
                    {/* 1. Processing State: Map & Live Tracking */}
                    {isProcessing && (
                         <div className="flex-1 relative bg-secondary/10 min-h-[400px] md:min-h-0">
                            <Image src="/images/location.png" alt="Map" fill className="object-cover opacity-40 grayscale-[0.3]" />
                            <div className="absolute top-4 right-4 z-10 md:hidden">
                                <div className="flex items-center gap-2 bg-amber-500/10 backdrop-blur-md text-amber-600 px-3 py-1.5 rounded-full border border-amber-500/20 text-[10px] font-black animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    تتبع مباشر
                                </div>
                            </div>
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 500">
                               <path d="M 200 400 Q 400 350 500 250 T 800 100" fill="none" stroke="#579BE8" strokeWidth="4" strokeDasharray="10 10" className="animate-[dash_20s_linear_infinite]" strokeLinecap="round" />
                            </svg>
                            <div className="absolute top-[45%] left-[45%] md:top-[45%] md:left-[45%] scale-75 md:scale-100">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-[#579BE8] rounded-full flex items-center justify-center shadow-xl shadow-[#579BE8]/40 border-4 border-white dark:border-card animate-pulse"><BiSolidTruck className="text-white w-7 h-7" /></div>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white dark:bg-card px-3 py-1 rounded-lg text-[10px] font-black border border-border shadow-sm">جاري التوصيل...</div>
                                </div>
                            </div>
                            <div className="absolute top-6 left-6 right-6 md:right-auto md:w-80 bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-5 md:p-6 lg:top-8 lg:left-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#579BE8]/10 flex items-center justify-center text-[#579BE8]">
                                        <div className="relative">
                                            <BiTimeFive className="w-7 h-7 animate-spin-slow" />
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-card animate-ping"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tight">الوقت المتبقي</p>
                                        <p className="font-black text-md md:text-lg text-[#579BE8]">12:45 م (خلال 15 د.)</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground mb-1 uppercase tracking-tight">الموقع الحالي للناقل:</p>
                                        <p className="text-xs md:text-sm font-black leading-tight border-r-2 border-[#579BE8] ps-3">{orderData.driver?.currentLocation}</p>
                                    </div>
                                    <button className="w-full py-3 bg-white/50 dark:bg-card/50 rounded-2xl text-[10px] font-black hover:bg-[#579BE8] hover:text-white transition-all flex items-center justify-center gap-2 border border-border shadow-sm">
                                        <BiNavigation className="w-4 h-4" />
                                        مشاركة موقع الطلب
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Pending State: Preparation Animation/Banner */}
                    {isPending && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 md:p-10 bg-gradient-to-br from-amber-50 to-white dark:from-amber-500/5 dark:to-card">
                            <div className="w-24 h-24 md:w-32 md:h-32 relative mb-8">
                                <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping"></div>
                                <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-card rounded-full border-4 border-amber-500/20 flex items-center justify-center shadow-2xl shadow-amber-500/10">
                                    <BiTimeFive className="w-12 h-12 md:w-16 md:h-16 text-amber-500 animate-[spin_5s_linear_infinite]" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-10 h-10 md:w-12 md:h-12 bg-[#579BE8] rounded-2xl flex items-center justify-center text-white shadow-xl animate-bounce">
                                    <BiWater className="w-6 h-6 md:w-7 md:h-7" />
                                </div>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black mb-4">جاري تأكيد طلبك...</h3>
                            <p className="text-xs md:text-sm text-muted-foreground max-w-xs md:max-w-md mb-8 px-4 font-medium leading-relaxed">نحن نقوم الآن بالبحث عن أفضل ناقل قريب منك لتوصيل طلب المياه في أسرع وقت ممكن.</p>
                            <div className="flex items-center gap-3 px-5 py-2.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                <span className="text-amber-700 dark:text-amber-400 font-extrabold text-[11px] md:text-xs">متوسط وقت التأكيد: 5 دقائق</span>
                            </div>
                        </div>
                    )}

                    {/* 3. Cancelled State: Error Information */}
                    {isCancelled && (
                         <div className="flex-1 flex flex-col items-center justify-center text-center p-8 md:p-12 bg-neutral-50 dark:bg-red-500/5">
                            <div className="w-20 h-20 md:w-28 md:h-28 bg-red-100 dark:bg-red-500/20 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mb-6 md:mb-8 border border-red-200">
                                <BiError className="w-12 h-12 md:w-16 md:h-16 text-red-500" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-red-600 mb-6">تم إلغاء هذا الطلب</h3>
                            <div className="max-w-md bg-white dark:bg-card/50 p-6 md:p-8 rounded-[2rem] border border-red-500/10 shadow-xl shadow-red-500/5 mb-8">
                                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-3">سبب الإلغاء</p>
                                <p className="text-sm md:text-lg font-bold leading-relaxed">{orderData.cancellationReason}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none px-6">
                                <button className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-[#579BE8] text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all active:scale-95 text-sm">
                                    <BiRefresh className="w-5 h-5" />
                                    <span>إعادة الطلب</span>
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-card border border-border rounded-2xl font-black hover:bg-secondary transition-all text-sm">
                                    <BiSupport className="w-5 h-5" />
                                    <span>الدعم الفني</span>
                                </button>
                            </div>
                         </div>
                    )}

                    {/* 4. Completed State: Success Hero */}
                    {isCompleted && (
                        <div className="flex-1 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 lg:p-14 relative overflow-hidden bg-gradient-to-l from-green-50/50 to-white dark:from-green-500/5 dark:to-card">
                             <div className="relative z-10 flex-1 text-center md:text-right space-y-6 md:space-y-8 w-full">
                                <div>
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white mb-6 md:mx-0 mx-auto shadow-xl shadow-green-500/20 animate-bounce">
                                        <BiCheckCircle className="w-7 h-7 md:w-8 md:h-8" />
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-black mb-2 leading-tight">شكراً لك!<br/>تم التوصيل بنجاح</h3>
                                    <p className="text-muted-foreground text-xs md:text-sm font-medium">تم إغلاق الطلب وتأكيد الاستلام بنجاح.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right">
                                    <div className="bg-white/50 dark:bg-card/50 p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-green-500/10 backdrop-blur-sm">
                                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">عنوان التوصيل</p>
                                        <p className="text-xs md:text-sm font-black leading-snug truncate md:whitespace-normal">{orderData.customer.address}</p>
                                    </div>
                                    <div className="bg-white/50 dark:bg-card/50 p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-green-500/10 backdrop-blur-sm">
                                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">المستلم</p>
                                        <p className="text-xs md:text-sm font-black leading-snug">{orderData.customer.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{orderData.customer.phone}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <div className="px-4 py-2 bg-green-500 text-white rounded-full text-[10px] md:text-xs font-black shadow-lg shadow-green-500/20">تقييمك: 4.9 <FaStar className="inline mb-1 ms-1" /></div>
                                    <div className="px-4 py-2 bg-secondary/70 rounded-full text-[10px] md:text-xs font-black">مدة الانتظار: 25 دقيقة</div>
                                </div>
                             </div>
                             <div className="flex-1 relative w-full h-[300px] md:h-[400px] mt-8 md:mt-0 animate-float-slow hidden lg:block">
                                <Image src="/images/car.png" alt="Truck Success" fill className="object-contain drop-shadow-[0_20px_50px_rgba(87,155,232,0.3)]" />
                             </div>
                        </div>
                    )}

                    {/* Common Specs Footer for all states except cancelled */}
                    <div className="bg-white dark:bg-card p-6 md:p-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="w-14 h-14 md:w-16 md:h-16 relative bg-secondary/20 rounded-2xl p-2 flex-shrink-0">
                                <Image src="/images/car.png" alt="Truck" fill className={`object-contain ${isCancelled ? 'grayscale brightness-150 opacity-40' : ''}`} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-md md:text-lg leading-tight">وايت مياه صحيّة</h4>
                                <p className="text-[10px] md:text-xs text-muted-foreground">{orderData.size}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-8 text-center border-t sm:border-t-0 sm:border-r w-full sm:w-auto pt-4 sm:pt-0 sm:ps-8 border-border/50">
                            <div className={isCancelled ? 'opacity-40' : ''}>
                                <p className="text-[9px] md:text-[10px] text-muted-foreground font-black uppercase mb-1">الكمية</p>
                                <p className="font-black text-sm md:text-lg">{orderData.quantity}</p>
                            </div>
                            <div className={isCancelled ? 'opacity-40' : ''}>
                                <p className="text-[9px] md:text-[10px] text-muted-foreground font-black uppercase mb-1">النوع</p>
                                <p className="font-black text-sm md:text-lg">{orderData.waterType.split(' ')[0]}</p>
                            </div>
                            <div>
                                <p className="text-[9px] md:text-[10px] text-muted-foreground font-black uppercase mb-1">التاريخ</p>
                                <p className="font-black text-sm md:text-lg whitespace-nowrap">{orderData.date.split(' ').slice(0, 2).join(' ')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side Card: Driver Info or Support */}
                <div className="flex flex-col gap-6 w-full">
                    {/* Driver Card */}
                    {orderData.driver && (
                        <div className="bg-white dark:bg-card rounded-[2rem] md:rounded-[2.5rem] border border-border/50 shadow-sm p-6 md:p-8 flex flex-col items-center flex-1 text-center">
                            <div className="w-full flex justify-between items-center mb-6 md:mb-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground">بيانات الناقل</p>
                                <div className={`w-2.5 h-2.5 rounded-full ${isProcessing ? 'bg-amber-500 animate-ping' : 'bg-green-500'}`}></div>
                            </div>
                            <div className="relative mb-6">
                                <div className="w-24 h-24 md:w-28 md:h-28 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-card shadow-2xl mx-auto">
                                    <Image src={orderData.driver.image} alt={orderData.driver.name} fill className="object-cover" />
                                </div>
                                <div className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-[#579BE8] text-white px-3 py-1 rounded-full border-2 border-white dark:border-card shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                                    <FaStar className="w-3 h-3 mb-0.5" /><span className="text-[9px] md:text-[10px] font-black uppercase tracking-tight">{orderData.driver.rating} التصنيف</span>
                                </div>
                            </div>
                            <h4 className="font-black text-xl md:text-2xl mb-1 mt-4">{orderData.driver.name}</h4>
                            <p className="text-[11px] md:text-xs text-muted-foreground mb-6 md:mb-8 font-medium leading-relaxed max-w-[200px]">{orderData.driver.vehicle}</p>
                            
                            {isProcessing ? (
                                <div className="w-full grid grid-cols-2 gap-3 mb-4">
                                    <button className="flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl md:rounded-3xl bg-green-500 text-white shadow-lg shadow-green-500/20 gap-2 active:scale-95 transition-all"><div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white/20 flex items-center justify-center"><BiPhoneCall className="w-5 h-5 md:w-6 md:h-6" /></div><span className="text-[9px] md:text-[10px] font-black">اتصال</span></button>
                                    <button className="flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl md:rounded-3xl bg-[#579BE8] text-white shadow-lg shadow-[#579BE8]/20 gap-2 active:scale-95 transition-all"><div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white/20 flex items-center justify-center"><BiMessageSquareDetail className="w-5 h-5 md:w-6 md:h-6" /></div><span className="text-[9px] md:text-[10px] font-black">دردشة</span></button>
                                </div>
                            ) : (
                                <button onClick={() => setShowRatingModal(true)} className="w-full py-4 md:py-5 rounded-2xl md:rounded-[2rem] bg-[#579BE8] text-white font-black text-xs hover:shadow-xl transition-all flex items-center justify-center gap-3 mb-4 active:scale-95"><FaStar className="w-4 h-4 text-amber-300" /><span>تقييم تجربة التوصيل</span></button>
                            )}
                            <button className="w-full py-3 md:py-4 rounded-xl md:rounded-[1.5rem] bg-secondary/50 font-black text-[9px] md:text-[10px] flex items-center justify-center gap-2 mt-auto hover:bg-secondary active:scale-95 transition-all"><BiNavigation className="w-4 h-4 text-[#579BE8]" /><span>متابعة على الخريطة</span></button>
                        </div>
                    )}

                    {/* Support Card */}
                    {!orderData.driver && (
                         <div className="bg-white dark:bg-card rounded-[2rem] md:rounded-[2.5rem] border border-border/50 shadow-sm p-8 flex flex-col items-center flex-1 text-center">
                             <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#579BE8]/10 flex items-center justify-center mb-6 mt-6 md:mt-10">
                                <BiSupport className="w-7 h-7 md:w-8 md:h-8 text-[#579BE8]" />
                             </div>
                             <h4 className="font-black text-lg md:text-xl mb-3">مركز المساعدة</h4>
                             <p className="text-[11px] md:text-xs text-muted-foreground mb-8 md:mb-10 leading-relaxed px-2">اذا كنت تواجه مشكلة في طلبك أو تود الاستفسار، فريقنا متاح لخدمتك دائماً.</p>
                             <div className="w-full space-y-3 md:space-y-4 mb-4">
                                <button className="w-full py-3.5 md:py-4 rounded-2xl bg-green-500 text-white font-black text-xs shadow-lg shadow-green-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all">
                                    <BiMessageSquareDetail className="w-5 h-5" />
                                    <span>محادثة فورية</span>
                                </button>
                                <button className="w-full py-3.5 md:py-4 rounded-2xl border-2 border-[#579BE8] text-[#579BE8] font-black text-xs flex items-center justify-center gap-3 active:scale-95 transition-all">
                                    <BiPhoneCall className="w-5 h-5" />
                                    <span>اتصال هاتفي</span>
                                </button>
                             </div>
                             {isPending && (
                                <button className="w-full py-4 rounded-xl bg-red-500/10 text-red-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest mt-auto active:scale-95 transition-all">إلغاء الطلب الآن</button>
                             )}
                         </div>
                    )}

                    <div className="bg-[#579BE8]/10 rounded-2xl md:rounded-[2rem] p-5 md:p-6 border border-[#579BE8]/20 group hover:bg-[#579BE8] transition-all duration-500 cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#579BE8] flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#579BE8] transition-colors"><BiTimeFive className="w-6 h-6 md:w-7 md:h-7" /></div>
                            <div>
                                <h4 className="font-bold text-xs md:text-sm tracking-tight group-hover:text-white transition-colors">دعم العملاء</h4>
                                <p className="text-[9px] md:text-[10px] text-muted-foreground group-hover:text-white/80 transition-colors">متاح على مدار الساعة</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Timeline & Financials */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                <div className="lg:col-span-2 bg-white dark:bg-card rounded-[2rem] md:rounded-[2.5rem] border border-border/50 shadow-sm p-6 md:p-10">
                    <h3 className="font-black text-lg md:text-xl mb-8 md:mb-10 flex items-center gap-3"><span className="w-1.5 h-6 md:w-2 md:h-8 bg-[#579BE8] rounded-full"></span>خط سير الطلب</h3>
                    <div className="flex flex-col space-y-6 md:space-y-8 relative">
                         <div className="absolute top-2 bottom-2 right-[19px] md:right-[21px] w-0.5 bg-secondary/50"></div>
                         {orderData.timeline.filter(i => !i.hidden).map((item, idx) => (
                             <div key={idx} className="flex items-center gap-6 md:gap-8 relative z-10">
                                 <div className={`w-10 h-10 md:w-11 md:h-11 rounded-[14px] md:rounded-2xl flex items-center justify-center border-4 border-white dark:border-card shadow-sm flex-shrink-0 ${item.error ? "bg-red-500 text-white" : item.completed ? "bg-green-500 text-white" : item.current ? "bg-amber-500 text-white animate-pulse" : "bg-secondary text-muted-foreground"}`}>
                                     {item.completed ? <BiCheckCircle className="w-5 h-5 md:w-6 md:h-6" /> : <div className="w-2 h-2 rounded-full bg-current"></div>}
                                 </div>
                                 <div className="flex-1 flex items-center justify-between border-b border-border/20 pb-4">
                                     <div>
                                         <p className={`font-black text-sm md:text-md tracking-tight ${item.error ? "text-red-600" : item.current ? "text-amber-600" : item.completed ? "text-foreground" : "text-muted-foreground"}`}>{item.status}</p>
                                         <p className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5 font-bold uppercase tracking-tight">تحديث الحالة تلقائياً</p>
                                     </div>
                                     <div className="text-left font-black text-[11px] md:text-sm text-muted-foreground whitespace-nowrap ps-2">{item.time}</div>
                                 </div>
                             </div>
                         ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-card rounded-[2rem] md:rounded-[2.5rem] border border-border/50 shadow-sm p-8 md:p-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-[#579BE8]/5 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16"></div>
                    <h3 className="font-black text-lg md:text-xl mb-8 md:mb-10 relative z-10 flex items-center gap-3"><span className="w-1.5 h-6 md:w-2 md:h-8 bg-green-500 rounded-full"></span>تفاصيل الفاتورة</h3>
                    <div className="space-y-4 md:space-y-6 relative z-10">
                        <div className="flex justify-between items-center group font-medium"><span className="text-[13px] md:text-sm text-muted-foreground tracking-tight">سعر وحدة المياه:</span><span className="font-black text-foreground text-sm md:text-base">{orderData.items[0].price.toFixed(2)} ر.س</span></div>
                        <div className="flex justify-between items-center group text-green-600 font-medium"><span className="text-[13px] md:text-sm tracking-tight">الضريبة (15%):</span><span className="font-black text-sm md:text-base">+{orderData.summary.tax.toFixed(2)} ر.س</span></div>
                        <div className="pt-6 md:pt-8 border-t border-border/30 flex flex-col items-center text-center gap-2">
                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#579BE8]">المجموع الكلي المدفوع</p>
                            <div className="flex items-baseline gap-2"><span className="text-4xl md:text-5xl font-black tracking-tighter">{orderData.summary.total.toFixed(2)}</span><span className="text-[10px] md:text-xs font-black text-muted-foreground">ريال</span></div>
                        </div>
                        <div className="pt-6 md:pt-10">
                            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${isCancelled ? 'bg-red-500/5 border-red-500/10' : 'bg-green-500/5 border-green-500/10'}`}>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${isCancelled ? 'bg-red-500' : 'bg-green-500'}`}>{isCancelled ? <BiError className="w-5 h-5" /> : <BiCheckCircle className="w-5 h-5" />}</div>
                                <div className="text-right flex-1 min-w-0">
                                    <p className={`text-[9px] font-extrabold leading-none mb-1 ${isCancelled ? 'text-red-600' : 'text-green-600'}`}>{isCancelled ? "عملية مسترجعة" : "تمت العملية"}</p>
                                    <p className="text-[10px] md:text-[11px] font-black tracking-tight truncate">{orderData.payment.method}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
