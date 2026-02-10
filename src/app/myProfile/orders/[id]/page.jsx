"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

import { FaDownload, FaPrint, FaStar, FaPhoneAlt, FaCommentDots, FaRegStar, FaInfoCircle, FaExclamationTriangle, FaSyncAlt, FaTimes } from "react-icons/fa";
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

// API base URL
const API_BASE_URL = "https://moya.talaaljazeera.com/api/v1";

// Dynamic import for map component to avoid SSR issues
const OrderTrackingMap = dynamic(() => import('@/components/Map/OrderTrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="h-125 rounded-3xl bg-secondary/20 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#579BE8]"></div>
        <p className="mt-4 text-muted-foreground">جاري تحميل الخريطة...</p>
      </div>
    </div>
  )
});

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id;

    // States
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [authError, setAuthError] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [ratingComment, setRatingComment] = useState("");
    const [aspects, setAspects] = useState({
        punctuality: 0,
        service_quality: 0,
        communication: 0,
        carefulness: 0
    });
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    
    // States for tracking map
    const [userLocation, setUserLocation] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
    const [trackingActive, setTrackingActive] = useState(true);
    const [isMapVisible, setIsMapVisible] = useState(false);

    // دالة للحصول على التوكن
    const getToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('accessToken')
        }
        return null;
    };

    // Initialize locations from order data
    const initializeLocations = (order) => {
        // Set user location from order data (delivery location)
        if (order?.location?.latitude && order?.location?.longitude) {
            setUserLocation([
                parseFloat(order.location.latitude),
                parseFloat(order.location.longitude)
            ]);
        } else {
            // Default to Riyadh if no location in order data
            setUserLocation([24.7136, 46.6753]);
        }

        // Set driver location if exists
        if (order?.driver?.location) {
            // If driver has location data in API response
            setDriverLocation([
                parseFloat(order.driver.location.latitude),
                parseFloat(order.driver.location.longitude)
            ]);
        } else if (order?.driver) {
            // Simulate driver location near user
            if (userLocation) {
                const initialDriverLocation = [
                    userLocation[0] + 0.015,
                    userLocation[1] + 0.015
                ];
                setDriverLocation(initialDriverLocation);
            } else {
                // Default location near Riyadh
                setDriverLocation([24.7286, 46.6903]);
            }
        } else {
            setDriverLocation(null);
        }
    };

    // Simulate driver movement (for demo purposes)
    const simulateDriverMovement = () => {
        if (!driverLocation || !userLocation) return;
        
        // Calculate direction towards user
        const latDiff = userLocation[0] - driverLocation[0];
        const lngDiff = userLocation[1] - driverLocation[1];
        
        // Move 10% closer to user
        const newLat = driverLocation[0] + (latDiff * 0.1);
        const newLng = driverLocation[1] + (lngDiff * 0.1);
        
        setDriverLocation([newLat, newLng]);
    };

    // Fetch order details from API
    useEffect(() => {
        const fetchOrderDetails = async () => {
            const token = getToken();
            if (!token) {
                setAuthError(true);
                setError("يجب تسجيل الدخول للوصول إلى هذه الصفحة");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    if (response.status === 401 || data.error_code === "UNAUTHENTICATED") {
                        setAuthError(true);
                        throw new Error("انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى");
                    }
                    throw new Error(data.message || `فشل في جلب البيانات: ${response.status}`);
                }

                if (data.status === true) {
                    setOrderData(data.data);
                    
                    // Initialize locations from order data
                    initializeLocations(data.data);
                    
                    // Show map for orders with driver or in progress
                    if (data.data.driver || 
                        data.data.status?.name === 'in_progress' || 
                        data.data.status?.name === 'assigned') {
                        setIsMapVisible(true);
                    }
                } else {
                    throw new Error(data.message || "حدث خطأ في جلب البيانات");
                }
            } catch (err) {
                console.error("Error fetching order details:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);
        const isProcessing = orderData?.status?.name === 'in_progress' || orderData?.status?.name === 'assigned';
    const isPending = orderData?.status?.name === 'pendding';
    const isCancelled = orderData?.status?.name === 'cancelled';
    const isCompleted = orderData?.status?.name === 'completed';
    const isConfirmed = orderData?.status?.name === 'confirmed';


    // Update driver location periodically for active orders
    useEffect(() => {
        let interval;
        
        if (trackingActive && isProcessing && driverLocation) {
            interval = setInterval(() => {
                simulateDriverMovement();
            }, 30000); // Update every 30 seconds
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [trackingActive, driverLocation, isProcessing]);

    // Reset rating form when modal closes
    useEffect(() => {
        if (!showRatingModal) {
            setUserRating(0);
            setHoverRating(0);
            setRatingComment("");
            setAspects({
                punctuality: 0,
                service_quality: 0,
                communication: 0,
                carefulness: 0
            });
        }
    }, [showRatingModal]);

    // Handle refresh
    const handleRefresh = () => {
        setLoading(true);
        const token = getToken();
        
        fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === true) {
                setOrderData(data.data);
                setError(null);
                // Re-initialize locations
                initializeLocations(data.data);
            } else {
                throw new Error(data.message);
            }
        })
        .catch(err => {
            setError(err.message);
        })
        .finally(() => {
            setLoading(false);
        });
    };

    // Handle login redirect
    const handleLoginRedirect = () => {
        router.push('/login');
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "غير محدد";
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format time
    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format order date
    const formatOrderDateTime = (dateString) => {
        if (!dateString) return "غير محدد";
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status style
    const getStatusStyle = (statusName) => {
        switch (statusName) {
            case 'completed':
                return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400";
            case 'in_progress':
                return "bg-[#579BE8]/10 text-[#579BE8] dark:bg-[#579BE8]/10 dark:text-[#579BE8]";
            case 'pendding':
                return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 font-bold animate-pulse";
            case 'cancelled':
                return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";
            case 'confirmed':
                return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
            case 'assigned':
                return "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400";
        }
    };

    // Get status label
    const getStatusLabel = (statusName) => {
        const statusMap = {
            'pendding': 'معلق',
            'confirmed': 'مؤكد',
            'assigned': 'معين للسائق',
            'in_progress': 'قيد التنفيذ',
            'completed': 'مكتمل',
            'cancelled': 'ملغي'
        };
        return statusMap[statusName] || statusName;
    };

    // Get status text
    const getStatusText = (statusName) => {
        const statusMap = {
            'pendding': 'انتظار التأكيد',
            'confirmed': 'تم التأكيد',
            'assigned': 'معين للسائق',
            'in_progress': 'جاري التوصيل الآن',
            'completed': 'مكتمل التسليم',
            'cancelled': 'ملغي'
        };
        return statusMap[statusName] || statusName;
    };

    // Determine if order is in progress
    // const isProcessing = orderData?.status?.name === 'in_progress' || orderData?.status?.name === 'assigned';
    // const isPending = orderData?.status?.name === 'pendding';
    // const isCancelled = orderData?.status?.name === 'cancelled';
    // const isCompleted = orderData?.status?.name === 'completed';
    // const isConfirmed = orderData?.status?.name === 'confirmed';

    // Handle rating submit
    const handleRatingSubmit = async () => {
        if (userRating === 0) return;

        setIsSubmittingRating(true);
        const token = getToken();

        try {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}/rate`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    rating: userRating,
                    comment: ratingComment || "",
                    aspects: {
                        punctuality: aspects.punctuality || userRating,
                        service_quality: aspects.service_quality || userRating,
                        communication: aspects.communication || userRating,
                        carefulness: aspects.carefulness || userRating
                    }
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "فشل في إرسال التقييم");
            }

            if (data.status === true) {
                // Success - show toast and close modal
                setShowRatingModal(false);
                setShowSuccessToast(true);
                setTimeout(() => setShowSuccessToast(false), 5000);
                
                // Reset form
                setUserRating(0);
                setRatingComment("");
                setAspects({
                    punctuality: 0,
                    service_quality: 0,
                    communication: 0,
                    carefulness: 0
                });
            } else {
                throw new Error(data.message || "حدث خطأ في إرسال التقييم");
            }
        } catch (err) {
            console.error("Error submitting rating:", err);
            alert(err.message || "حدث خطأ في إرسال التقييم. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsSubmittingRating(false);
        }
    };

    // Generate timeline based on order status
    const generateTimeline = () => {
        const timeline = [
            { 
                status: "تم استلام الطلب", 
                completed: true, 
                time: formatTime(orderData?.created_at) || "غير محدد"
            },
            { 
                status: isCancelled ? "تم إلغاء الطلب" : (isPending ? "انتظار تأكيد السائق" : "تم تأكيد الطلب"), 
                current: isPending, 
                completed: !isPending && !isCancelled, 
                time: isPending ? "الآن" : (isCancelled ? formatTime(orderData?.updated_at) || "غير محدد" : formatTime(orderData?.updated_at) || "غير محدد"),
                error: isCancelled 
            }
        ];

        if (!isCancelled && !isPending) {
            timeline.push({ 
                status: isProcessing ? "جاري التوصيل" : "تجهيز التوصيل", 
                current: isProcessing, 
                completed: isCompleted, 
                time: isProcessing ? "الآن" : (isCompleted ? formatTime(orderData?.updated_at) || "غير محدد" : "-")
            });
        }

        if (isCompleted) {
            timeline.push({ 
                status: "تم التسليم", 
                completed: true, 
                time: formatTime(orderData?.updated_at) || "غير محدد" 
            });
        }

        return timeline;
    };

    // Calculate order summary
    const calculateSummary = () => {
        if (!orderData) return null;

        const subtotalRaw = orderData.price ?? 0;
        const subtotal = typeof subtotalRaw === 'number' ? subtotalRaw : parseFloat(subtotalRaw) || 0;
        const tax = subtotal * 0.15; // 15% ضريبة
        const shipping = 0; // مجاني حالياً
        const total = subtotal + tax + shipping;

        return {
            subtotal: subtotal.toFixed(2),
            shipping: shipping.toFixed(2),
            tax: tax.toFixed(2),
            total: total.toFixed(2)
        };
    };

    // Calculate distance between two locations
    const calculateDistance = () => {
        if (!userLocation || !driverLocation) return "~2.5 كم";
        
        const toRad = (x) => (x * Math.PI) / 180;
        const R = 6371; // Earth's radius in km
        
        const dLat = toRad(driverLocation[0] - userLocation[0]);
        const dLon = toRad(driverLocation[1] - userLocation[1]);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(userLocation[0])) * Math.cos(toRad(driverLocation[0])) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return distance < 1 ? `${(distance * 1000).toFixed(0)} م` : `${distance.toFixed(1)} كم`;
    };

    // Calculate estimated arrival time
    const calculateETA = () => {
        if (!userLocation || !driverLocation) return "15 دقيقة";
        
        const distance = calculateDistance();
        if (distance.includes("م")) {
            const meters = parseInt(distance);
            const minutes = Math.ceil(meters / 250); // Assuming 250 meters per minute
            return `${minutes} دقيقة`;
        } else {
            const km = parseFloat(distance);
            const minutes = Math.ceil(km * 10); // Assuming 6 km/h average speed
            return `${minutes} دقيقة`;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#579BE8]"></div>
                <p className="text-muted-foreground">جاري تحميل تفاصيل الطلب...</p>
            </div>
        );
    }

    if (authError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <div className="text-red-500 mb-4">
                    <FaTimes className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-red-600 font-bold mb-2">يجب تسجيل الدخول</p>
                <p className="text-muted-foreground mb-4">
                    {error || "يجب تسجيل الدخول للوصول إلى هذه الصفحة"}
                </p>
                <button 
                    onClick={handleLoginRedirect}
                    className="px-6 py-3 bg-[#579BE8] text-white rounded-xl hover:bg-[#315782] transition-colors font-bold"
                >
                    تسجيل الدخول
                </button>
            </div>
        );
    }

    if (error && !authError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <div className="text-red-500 mb-4">
                    <FaTimes className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-red-600 font-bold mb-2">حدث خطأ في جلب البيانات</p>
                <p className="text-muted-foreground mb-4">{error}</p>
                <div className="flex gap-3 justify-center">
                    <button 
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-[#579BE8] text-white rounded-xl hover:bg-[#315782] transition-colors"
                    >
                        حاول مرة أخرى
                    </button>
                    <Link 
                        href="/myProfile/orders"
                        className="px-4 py-2 bg-white dark:bg-card border border-border rounded-xl hover:bg-secondary transition-colors"
                    >
                        العودة للطلبات
                    </Link>
                </div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="text-center p-10">
                <div className="text-muted-foreground mb-4">
                    <BiError className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-lg font-bold mb-2">الطلب غير موجود</p>
                <p className="text-muted-foreground mb-4">تعذر العثور على تفاصيل الطلب</p>
                <Link 
                    href="/myProfile/orders"
                    className="px-4 py-2 bg-[#579BE8] text-white rounded-xl hover:bg-[#315782] transition-colors inline-block"
                >
                    العودة للطلبات
                </Link>
            </div>
        );
    }

    const summary = calculateSummary();
    const timeline = generateTimeline();
    const currentStatus = orderData.status?.name || 'pendding';

    return (
        <>
            {/* Success Toast */}
            {showSuccessToast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <BiCheck className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-base">شكراً لك!</span>
                        <span className="font-medium text-sm opacity-90">تم استلام تقييمك بنجاح ونقدر رأيك</span>
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-md" onClick={() => setShowRatingModal(false)}></div>
                    <div className="relative bg-white dark:bg-card w-full max-w-lg rounded-3xl shadow-2xl border border-border animate-float-slow overflow-hidden">
                        <button onClick={() => setShowRatingModal(false)} className="absolute top-6 left-6 w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-[220]"><BiX className="w-6 h-6" /></button>
                        <div className="p-10 text-center relative z-[215]">
                            <div className="w-21 h-21 rounded-[2rem] mx-auto flex items-center justify-center mb-6" style={isCompleted ? { backgroundColor: 'lab(62 -4.22 -46.14 / 0.1)' } : { backgroundColor: 'rgba(245, 158, 11, 0.1)' }}><FaStar className="w-12 h-12" style={{ color: isCompleted ? 'lab(62 -4.22 -46.14)' : '#f59e0b' }} /></div>
                            <h3 className="text-2xl font-black mb-2 tracking-tight line-clamp-1">تقييم تجربة التوصيل</h3>
                            <p className="text-sm text-muted-foreground mb-8">رأيك يهمنا في تحسين جودة خدمات مياه "ستون"</p>
                            <div className="flex flex-col items-center gap-8">
                                {/* Overall Rating */}
                                <div className="w-full">
                                    <label className="text-sm font-bold text-right block mb-4 text-[#579BE8]">التقييم العام</label>
                                    <div className="flex items-center justify-center gap-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button key={star} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setUserRating(star)} className="transition-transform active:scale-90">
                                                {star <= (hoverRating || userRating) ? <FaStar className="w-10 h-10" style={{ color: isCompleted ? 'lab(62 -4.22 -46.14)' : '#fbbf24', filter: isCompleted ? 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.4))' : 'drop-shadow(0 0 15px rgba(245,158,11,0.4))' }} /> : <FaRegStar className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Aspects Rating */}
                                <div className="w-full space-y-4">
                                    <label className="text-sm font-bold text-right block mb-4 text-[#579BE8]">تقييم الجوانب (اختياري)</label>
                                    
                                    {/* Punctuality */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-right block text-muted-foreground">الالتزام بالمواعيد</label>
                                        <div className="flex items-center justify-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} onClick={() => setAspects(prev => ({ ...prev, punctuality: star }))} className="transition-transform active:scale-90">
                                                    {star <= aspects.punctuality ? <FaStar className="w-6 h-6 text-yellow-400" /> : <FaRegStar className="w-6 h-6 text-neutral-300 dark:text-neutral-700" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Service Quality */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-right block text-muted-foreground">جودة الخدمة</label>
                                        <div className="flex items-center justify-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} onClick={() => setAspects(prev => ({ ...prev, service_quality: star }))} className="transition-transform active:scale-90">
                                                    {star <= aspects.service_quality ? <FaStar className="w-6 h-6 text-yellow-400" /> : <FaRegStar className="w-6 h-6 text-neutral-300 dark:text-neutral-700" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Communication */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-right block text-muted-foreground">التواصل</label>
                                        <div className="flex items-center justify-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} onClick={() => setAspects(prev => ({ ...prev, communication: star }))} className="transition-transform active:scale-90">
                                                    {star <= aspects.communication ? <FaStar className="w-6 h-6 text-yellow-400" /> : <FaRegStar className="w-6 h-6 text-neutral-300 dark:text-neutral-700" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Carefulness */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-right block text-muted-foreground">الدقة والاهتمام</label>
                                        <div className="flex items-center justify-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} onClick={() => setAspects(prev => ({ ...prev, carefulness: star }))} className="transition-transform active:scale-90">
                                                    {star <= aspects.carefulness ? <FaStar className="w-6 h-6 text-yellow-400" /> : <FaRegStar className="w-6 h-6 text-neutral-300 dark:text-neutral-700" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Comment */}
                                <div className="w-full text-right space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-[#579BE8]">ملاحظاتك (اختياري)</label>
                                    <textarea 
                                        value={ratingComment}
                                        onChange={(e) => setRatingComment(e.target.value)}
                                        placeholder="اكتب تعليقك هنا عن جودة الخدمة أو السائق..." 
                                        className="w-full h-32 bg-secondary/30 rounded-3xl p-6 text-sm border-2 border-transparent focus:border-[#579BE8] outline-none transition-all resize-none"
                                    />
                                </div>
                                
                                <button disabled={userRating === 0 || isSubmittingRating} onClick={handleRatingSubmit} className={`w-full py-5 rounded-[2rem] font-black text-sm transition-all ${userRating === 0 ? "bg-secondary text-muted-foreground cursor-not-allowed" : "text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95"}`} style={userRating === 0 ? {} : isCompleted ? { backgroundColor: 'lab(62 -4.22 -46.14)', boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.3)' } : { backgroundColor: '#579BE8', boxShadow: '0 20px 25px -5px rgba(87, 155, 232, 0.3)' }}>{isSubmittingRating ? "جاري الإرسال..." : "تأكيد التقييم"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-8 pb-10">
                {/* Header Section */}
                <div className="bg-white dark:bg-card rounded-3xl border border-border/50 shadow-sm p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <Link href="/myProfile/orders" className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-all mt-1">
                                <BiArrowBack className="w-5 h-5 text-muted-foreground" />
                            </Link>
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">#{orderData.id}</h1>
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusStyle(currentStatus)}`}>
                                        {getStatusText(currentStatus)}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <BiCalendar className="w-4 h-4" />
                                        <span>{formatDate(orderData.created_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BiTimeFive className="w-4 h-4" />
                                        <span>{formatTime(orderData.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <div className="flex flex-wrap items-center gap-3">
                            <button 
                                onClick={handleRefresh}
                                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-white dark:bg-card border border-border hover:bg-secondary/50 transition-all shadow-sm"
                            >
                                <FaSyncAlt className="w-4 h-4 text-muted-foreground" />
                                <span>تحديث</span>
                            </button>
                            
                            {isCompleted && (
                                <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 whitespace-nowrap" style={{ backgroundColor: 'lab(62 -4.22 -46.14)' }}>
                                    <BiRefresh className="w-5 h-5" />
                                    <span>طلب مرة أخرى</span>
                                </button>
                            )}
                            <button className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-white dark:bg-card border border-border hover:bg-secondary/50 transition-all shadow-sm">
                                <FaDownload className="w-4 h-4 text-muted-foreground" />
                                <span className="hidden sm:inline">تحميل الفاتورة</span>
                                <span className="sm:hidden">الفاتورة</span>
                            </button>
                            {!isCancelled && (
                                <button className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-white dark:bg-card border border-border hover:bg-secondary/50 transition-all shadow-sm">
                                    <FaPrint className="w-4 h-4 text-muted-foreground" />
                                    <span>طباعة</span>
                                </button>
                            )}
                        </div> */}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="xl:col-span-8 space-y-6">
                        {/* Status Card */}
                        <div className="bg-white dark:bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
                            {isProcessing && (
                                <div className="relative bg-gradient-to-br from-blue-50 to-white dark:from-blue-500/5 dark:to-card p-8 md:p-12">
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-2xl bg-[#579BE8]/10 flex items-center justify-center">
                                                <BiSolidTruck className="w-10 h-10 text-[#579BE8] animate-pulse" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-4 border-white dark:border-card animate-ping"></div>
                                        </div>
                                        <div className="flex-1 text-center md:text-right">
                                            <h3 className="text-2xl font-black mb-2">جاري التوصيل الآن</h3>
                                            <p className="text-muted-foreground mb-4">متوقع الوصول خلال {calculateETA()}</p>
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-card/70 rounded-xl backdrop-blur-sm border border-border/50">
                                                <BiMapPin className="w-4 h-4 text-[#579BE8]" />
                                                <span className="text-sm font-bold">{orderData.location?.address || "جاري تحديث الموقع"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isPending && (
                                <div className="relative bg-gradient-to-br from-amber-50 to-white dark:from-amber-500/5 dark:to-card p-8 md:p-12">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="relative mb-6">
                                            <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center border-4 border-amber-500/20">
                                                <BiTimeFive className="w-12 h-12 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: 'lab(62 -4.22 -46.14)' }}>
                                                <BiWater className="w-6 h-6" />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black mb-3">جاري تأكيد طلبك</h3>
                                        <p className="text-muted-foreground max-w-md mb-6">نحن نقوم الآن بالبحث عن أفضل ناقل قريب منك</p>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">متوسط وقت التأكيد: 5 دقائق</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isCancelled && (
                                <div className="relative bg-gradient-to-br from-red-50 to-white dark:from-red-500/5 dark:to-card p-8 md:p-12">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                                            <BiError className="w-10 h-10 text-red-500" />
                                        </div>
                                        <h3 className="text-2xl font-black text-red-600 mb-4">تم إلغاء الطلب</h3>
                                        <div className="max-w-md bg-white/70 dark:bg-card/70 p-6 rounded-2xl border border-red-500/10 mb-6 backdrop-blur-sm">
                                            <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-2">حالة الطلب</p>
                                            <p className="text-sm font-bold leading-relaxed">تم إلغاء الطلب - {getStatusLabel(currentStatus)}</p>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-3">
                                            <button className="px-6 py-3 bg-[#579BE8] text-white rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-all">
                                                <BiRefresh className="w-5 h-5 inline ml-2" />
                                                إعادة الطلب
                                            </button>
                                            <button className="px-6 py-3 bg-white dark:bg-card border border-border rounded-xl font-bold text-sm hover:bg-secondary transition-all">
                                                <BiSupport className="w-5 h-5 inline ml-2" />
                                                الدعم الفني
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isCompleted && (
                                <div className="relative bg-gradient-to-br from-sky-50/50 to-white dark:from-sky-500/5 dark:to-card p-8 md:p-12">
                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-xl" style={{ backgroundColor: 'lab(62 -4.22 -46.14)' }}>
                                            <BiCheckCircle className="w-10 h-10" />
                                        </div>
                                        <div className="flex-1 text-center md:text-right">
                                            <h3 className="text-2xl md:text-3xl font-black mb-2">تم التوصيل بنجاح</h3>
                                            <p className="text-muted-foreground mb-4">شكراً لك على استخدام خدماتنا</p>
                                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                                <div className="px-4 py-2 text-white rounded-xl text-xs font-bold shadow-lg" style={{ backgroundColor: 'lab(62 -4.22 -46.14)' }}>
                                                    تقييمك: 4.9 <FaStar className="inline mb-1 ms-1" />
                                                </div>
                                                <div className="px-4 py-2 bg-secondary/70 rounded-xl text-xs font-bold">
                                                    مدة الانتظار: 25 دقيقة
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isConfirmed && (
                                <div className="relative bg-gradient-to-br from-blue-50 to-white dark:from-blue-500/5 dark:to-card p-8 md:p-12">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center border-4 border-blue-500/20 mb-6">
                                            <BiCheckCircle className="w-12 h-12 text-blue-500" />
                                        </div>
                                        <h3 className="text-2xl font-black mb-3">تم تأكيد طلبك</h3>
                                        <p className="text-muted-foreground max-w-md mb-6">تم تأكيد الطلب بنجاح، جاري إعداد التوصيل</p>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                            <span className="text-sm font-bold text-blue-700 dark:text-blue-400">جاري تجهيز المركبة</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Order Details Footer */}
                            <div className="p-6 border-t border-border/50 bg-secondary/20">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-card p-2 flex-shrink-0">
                                            <Image 
                                                src="/images/car.png" 
                                                alt="Truck" 
                                                width={40} 
                                                height={40} 
                                                className="w-full h-full object-contain" 
                                            />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-bold mb-1">الخدمة</p>
                                            <p className="text-sm font-black">{orderData.service?.name || "غير محدد"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-card flex items-center justify-center">
                                            <BiWater className="w-6 h-6 text-[#579BE8]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-bold mb-1">نوع المياه</p>
                                            <p className="text-sm font-black">{orderData.water_type?.name || "غير محدد"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-card flex items-center justify-center">
                                            <BiCalendar className="w-6 h-6 text-[#579BE8]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-bold mb-1">التاريخ</p>
                                            <p className="text-sm font-black">{formatDate(orderData.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tracking Map Section - Show for orders with driver or locations */}
                        {(isMapVisible && (orderData.driver || userLocation)) && (
                            <div className="bg-white dark:bg-card rounded-3xl border border-border/50 shadow-sm p-6 md:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'lab(62 -4.22 -46.14)' }}></div>
                                        <h2 className="text-xl font-black">خريطة التتبع المباشر</h2>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#579BE8]/10 text-[#579BE8] rounded-lg text-xs font-bold">
                                            <span className={`w-2 h-2 rounded-full ${trackingActive ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                            {trackingActive ? 'التتبع نشط' : 'التتبع متوقف'}
                                        </div>
                                        {orderData.driver && (
                                            <button 
                                                onClick={() => setTrackingActive(!trackingActive)}
                                                className="p-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-all"
                                                title={trackingActive ? 'إيقاف التتبع' : 'تشغيل التتبع'}
                                            >
                                                {trackingActive ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#579BE8]" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#579BE8]" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => setIsMapVisible(false)}
                                            className="p-2 rounded-xl bg-secondary/50 hover:bg-red-500 hover:text-white transition-all"
                                            title="إخفاء الخريطة"
                                        >
                                            <BiX className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                
                                <OrderTrackingMap 
                                    userLocation={userLocation}
                                    driverLocation={driverLocation}
                                    driverName={orderData.driver?.name || null}
                                    orderStatus={currentStatus}
                                    isDriverActive={trackingActive && orderData.driver}
                                    userAddress={orderData.location?.address}
                                />
                                
                                <div className="mt-6 pt-6 border-t border-border/30">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-secondary/30 p-4 rounded-xl text-center">
                                            <p className="text-xs text-muted-foreground mb-1">الحالة</p>
                                            <p className="text-sm font-bold text-[#579BE8]">{getStatusText(currentStatus)}</p>
                                        </div>
                                        {orderData.driver && driverLocation && (
                                            <>
                                                <div className="bg-secondary/30 p-4 rounded-xl text-center">
                                                    <p className="text-xs text-muted-foreground mb-1">مسافة السائق</p>
                                                    <p className="text-sm font-bold text-amber-600">{calculateDistance()}</p>
                                                </div>
                                                <div className="bg-secondary/30 p-4 rounded-xl text-center">
                                                    <p className="text-xs text-muted-foreground mb-1">الوقت المتوقع</p>
                                                    <p className="text-sm font-bold text-green-600">{calculateETA()}</p>
                                                </div>
                                                <div className="bg-secondary/30 p-4 rounded-xl text-center">
                                                    <p className="text-xs text-muted-foreground mb-1">سرعة السائق</p>
                                                    <p className="text-sm font-bold text-blue-600">{isProcessing ? '45 كم/س' : '--'}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Show Map Button for orders without map visible */}
                        {!isMapVisible && (orderData.driver || orderData.location) && (
                            <div className="bg-white dark:bg-card rounded-3xl border border-border/50 shadow-sm p-8 text-center">
                                <div className="w-20 h-20 rounded-2xl bg-[#579BE8]/10 flex items-center justify-center mx-auto mb-6">
                                    <BiMapPin className="w-10 h-10 text-[#579BE8]" />
                                </div>
                                <h3 className="text-xl font-black mb-3">موقع التوصيل</h3>
                                <p className="text-muted-foreground mb-4">
                                    {orderData.location?.address || "موقع التوصيل"}
                                </p>
                                <p className="text-muted-foreground mb-6">عرض موقع التوصيل على الخريطة</p>
                                <button 
                                    onClick={() => setIsMapVisible(true)}
                                    className="px-6 py-3 bg-[#579BE8] text-white rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2"
                                >
                                    <BiNavigation className="w-5 h-5" />
                                    عرض الخريطة
                                </button>
                            </div>
                        )}

                        {/* Timeline Section */}
                        <div className="bg-white dark:bg-card rounded-3xl border border-border/50 shadow-sm p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'lab(62 -4.22 -46.14)' }}></div>
                                <h2 className="text-xl font-black">خط سير الطلب</h2>
                            </div>
                            <div className="relative">
                                <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-secondary/50"></div>
                                <div className="space-y-6">
                                    {timeline.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-6 relative">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-4 border-white dark:border-card shadow-sm flex-shrink-0 relative z-10 ${item.error ? "bg-red-500 text-white" : item.completed ? "text-white" : item.current ? "bg-amber-500 text-white animate-pulse" : "bg-secondary text-muted-foreground"}`} style={item.completed ? { backgroundColor: 'lab(62 -4.22 -46.14)' } : {}}>
                                                {item.completed ? <BiCheckCircle className="w-6 h-6" /> : <div className="w-2 h-2 rounded-full bg-current"></div>}
                                            </div>
                                            <div className="flex-1 pb-6 border-b border-border/20 last:border-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className={`font-black text-base ${item.error ? "text-red-600" : item.current ? "text-amber-600" : item.completed ? "text-foreground" : "text-muted-foreground"}`}>
                                                        {item.status}
                                                    </p>
                                                    <span className="text-xs font-bold text-muted-foreground">{item.time}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground font-medium">تحديث الحالة تلقائياً</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="xl:col-span-4 space-y-6">
                        {/* Driver Card */}
                        {orderData.driver ? (
                            <div className="bg-white dark:bg-card rounded-3xl border border-border/50 shadow-sm p-6 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#579BE8]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="px-3 py-1.5 bg-[#579BE8]/10 text-[#579BE8] rounded-lg text-xs font-bold">بيانات الناقل</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-muted-foreground">{isProcessing ? "جاري التوصيل" : "تم التوصيل"}</span>
                                            <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-[#579BE8]'}`}></div>
                                        </div>
                                    </div>

                                    <div className="text-center mb-6">
                                        <div className="relative inline-block mb-4">
                                            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white dark:border-card shadow-lg bg-secondary/50 flex items-center justify-center">
                                                <BiUser className="w-12 h-12 text-muted-foreground" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-xl text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-card" style={{ backgroundColor: 'lab(62 -4.22 -46.14)' }}>
                                                <BiCheck className="w-5 h-5" />
                                            </div>
                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-card px-3 py-1 rounded-xl border border-border/50 shadow-sm flex items-center gap-1.5">
                                                <FaStar className="w-3.5 h-3.5" style={{ color: isCompleted ? 'lab(62 -4.22 -46.14)' : '#fbbf24' }} />
                                                <span className="text-xs font-black">4.8</span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black mb-2">{orderData.driver.name || "غير محدد"}</h3>
                                        <div className="text-sm text-muted-foreground mb-6">
                                            <p>رقم السائق: {orderData.driver.phone || "غير محدد"}</p>
                                        </div>

                                        {isProcessing ? (
                                            <div className="space-y-3">
                                                <button className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-95" style={{ backgroundColor: 'lab(62 -4.22 -46.14)' }}>
                                                    <BiPhoneCall className="w-5 h-5 inline ml-2" />
                                                    اتصال بالسائق
                                                </button>
                                                <button className="w-full py-3.5 rounded-xl bg-[#579BE8] text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-95">
                                                    <BiMessageSquareDetail className="w-5 h-5 inline ml-2" />
                                                    دردشة فورية
                                                </button>
                                            </div>
                                        ) : isCompleted && (
                                            <button 
                                                onClick={() => setShowRatingModal(true)} 
                                                className="w-full py-4 rounded-xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 mb-3"
                                                style={{ backgroundColor: 'lab(62 -4.22 -46.14)' }}
                                            >
                                                <FaStar className="w-4 h-4 inline ml-2" />
                                                تقييم تجربة التوصيل
                                            </button>
                                        )}

                                        <button 
                                            onClick={() => setIsMapVisible(true)}
                                            className="w-full py-3 rounded-xl bg-secondary/50 font-bold text-xs flex items-center justify-center gap-2 hover:bg-secondary transition-all border border-border/50"
                                        >
                                            <BiNavigation className="w-4 h-4 text-[#579BE8]" />
                                            تتبع الموقع على الخريطة
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-card rounded-3xl border border-border/50 shadow-sm p-6 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="px-3 py-1.5 bg-amber-500/10 text-amber-600 rounded-lg text-xs font-bold">قيد البحث عن ناقل</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-muted-foreground">بانتظار التخصيص</span>
                                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                        </div>
                                    </div>

                                    <div className="text-center mb-6">
                                        <div className="relative inline-block mb-4">
                                            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white dark:border-card shadow-lg bg-secondary/50 flex items-center justify-center">
                                                <BiSolidTruck className="w-12 h-12 text-muted-foreground" />
                                            </div>
                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-card px-3 py-1 rounded-xl border border-border/50 shadow-sm">
                                                <span className="text-xs font-black text-amber-600">جاري البحث</span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black mb-2">لم يتم تخصيص ناقل بعد</h3>
                                        <div className="text-sm text-muted-foreground mb-6">
                                            <p>نحن نبحث عن أفضل ناقل قريب من موقعك</p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="w-full py-3.5 rounded-xl bg-amber-500/10 text-amber-700 font-bold text-sm">
                                                <BiTimeFive className="w-5 h-5 inline ml-2" />
                                                متوسط وقت الانتظار: 5 دقائق
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Delivery Location Card */}
                        <div className="bg-white dark:bg-card rounded-3xl border border-border/50 shadow-sm p-6 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                        <BiMapPin className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg">موقع التوصيل</h3>
                                        <p className="text-xs text-muted-foreground">عنوان الاستلام</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-[#579BE8]/10 flex items-center justify-center flex-shrink-0 mt-1">
                                            <BiMapPin className="w-3 h-3 text-[#579BE8]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black mb-1">{orderData.location?.name || "عنوان التوصيل"}</p>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {orderData.location?.address || "لم يتم تحديد العنوان"}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {orderData.location?.latitude && orderData.location?.longitude && (
                                        <button 
                                            onClick={() => setIsMapVisible(true)}
                                            className="w-full py-3 rounded-xl bg-[#579BE8] text-white font-bold text-xs hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                        >
                                            <BiNavigation className="w-4 h-4" />
                                            عرض الموقع على الخريطة
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Invoice Card */}
                        <div className="bg-white dark:bg-card rounded-3xl border border-border/50 shadow-sm p-6 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#579BE8]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'lab(62 -4.22 -46.14)' }}></div>
                                    <h2 className="text-xl font-black">تفاصيل الفاتورة</h2>
                                </div>
                                
                                {summary && (
                                    <>
                                        <div className="space-y-4 mb-6">
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-sm text-muted-foreground">سعر الخدمة</span>
                                                <span className="text-sm font-black">{summary.subtotal} ر.س</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-sm text-[#579BE8] font-medium">الضريبة (15%)</span>
                                                <span className="text-sm font-black text-[#579BE8]">+{summary.tax} ر.س</span>
                                            </div>
                                            
                                        </div>

                                        <div className="pt-6 border-t border-border/30 mb-6">
                                            <div className="text-center">
                                                <p className="text-xs font-black uppercase tracking-widest text-[#579BE8] mb-2">المجموع الكلي</p>
                                                <div className="flex items-baseline justify-center gap-2">
                                                    <span className="text-4xl font-black">{summary.total}</span>
                                                    <span className="text-sm font-black text-muted-foreground">ريال</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className={`p-4 rounded-xl border ${isCancelled ? 'bg-red-500/5 border-red-500/10' : 'bg-gradient-to-r from-sky-500/5 to-blue-600/5 border-[#579BE8]/10'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${isCancelled ? 'bg-red-500' : ''}`} style={!isCancelled ? { backgroundColor: 'lab(62 -4.22 -46.14)' } : {}}>
                                            {isCancelled ? <BiError className="w-5 h-5" /> : <BiCheckCircle className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-extrabold mb-1 ${isCancelled ? 'text-red-600' : 'text-[#579BE8]'}`}>
                                                {isCancelled ? "غير مدفوع" : (orderData.price ? "تمت العملية" : "في انتظار التسعير")}
                                            </p>
                                            <p className="text-xs font-black truncate">
                                                {orderData.price ? "تم تسعير الطلب" : "لم يتم التسعير بعد"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}