"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

import { FaDownload, FaPrint, FaStar, FaPhoneAlt, FaCommentDots, FaRegStar, FaInfoCircle, FaExclamationTriangle, FaSyncAlt, FaTimes, FaUser } from "react-icons/fa";
import { 
    BiArrowBack, 
    BiCalendar, 
    BiCheckCircle, 
    BiSolidNavigation, 
    BiSolidTruck, 
    BiTimeFive, 
    BiUser as BiUserIcon, 
    BiWater, 
    BiMessageSquareDetail,
    BiPhoneCall,
    BiMapPin,
    BiNavigation,
    BiX,
    BiCheck,
    BiError,
    BiSupport,
    BiRefresh,
    BiIdCard
} from "react-icons/bi";

// API base URL
const API_BASE_URL = "https://moya.talaaljazeera.com/api/v1";

// Dynamic import for enhanced map component
const EnhancedOrderTrackingMap = dynamic(() => import('@/components/Map/EnhancedOrderTrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 sm:h-96 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-[#3B82F6] mb-4 sm:mb-6"></div>
        <p className="text-gray-600 font-medium text-sm sm:text-base mb-1 sm:mb-2">جاري تحميل الخريطة...</p>
        <p className="text-gray-700 text-xs sm:text-sm">تحميل مواقع التتبع المباشر</p>
      </div>
    </div>
  )
});

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id;
    const [driverData, setDriverData] = useState(null);
    
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
    const [driverTrackingInterval, setDriverTrackingInterval] = useState(null);

    // دالة للحصول على التوكن
    const getToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('accessToken')
        }
        return null;
    };

    // تحويل موقع السائق من البيانات الحقيقية
    const parseDriverLocation = (driverData) => {
        if (!driverData?.currect_location) return null;
        
        try {
            // إذا كان الموقع مخزنًا كـ JSON string
            if (typeof driverData.currect_location === 'string') {
                const location = JSON.parse(driverData.currect_location);
                if (location.latitude && location.longitude) {
                    return [
                        parseFloat(location.latitude),
                        parseFloat(location.longitude)
                    ];
                }
            }
            // إذا كان مخزنًا كـ object مباشرة
            else if (driverData.currect_location.latitude && driverData.currect_location.longitude) {
                return [
                    parseFloat(driverData.currect_location.latitude),
                    parseFloat(driverData.currect_location.longitude)
                ];
            }
        } catch (error) {
            console.error("Error parsing driver location:", error);
        }
        
        return null;
    };

    // Initialize locations from real API data
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

        // Set driver location from real data if exists
        const driverLoc = parseDriverLocation(order?.driver);
        if (driverLoc) {
            setDriverLocation(driverLoc);
        } else if (order?.driver) {
            // If no location in data, simulate near user location
            if (userLocation) {
                const simulatedLocation = [
                    userLocation[0] + 0.01,
                    userLocation[1] + 0.01
                ];
                setDriverLocation(simulatedLocation);
            } else {
                setDriverLocation([24.7286, 46.6903]);
            }
        } else {
            setDriverLocation(null);
        }
    };

    // Fetch driver's current location from API
    const fetchDriverCurrentLocation = async () => {
        if (!orderData?.driver?.id) return;
        
        const token = getToken();
        try {
            const response = await fetch(`${API_BASE_URL}/drivers/${orderData.driver.id}/location`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setDriverData(data.data);
                if (data.status === true && data.data) {
                    const newLocation = [
                        parseFloat(data.data.latitude),
                        parseFloat(data.data.longitude)
                    ];
                    setDriverLocation(newLocation);
                    return true;
                }
            }
        } catch (error) {
            console.error("Error fetching driver location:", error);
        }
        return false;
    };

    // Start real-time tracking for active orders
    const startRealTimeTracking = () => {
        if (driverTrackingInterval) {
            clearInterval(driverTrackingInterval);
        }

        if (trackingActive && orderData?.driver && isProcessing) {
            // Fetch immediately
            fetchDriverCurrentLocation();
            
            // Then every 30 seconds
            const interval = setInterval(() => {
                fetchDriverCurrentLocation();
            }, 30000);
            
            setDriverTrackingInterval(interval);
        }
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
                    
                    // Initialize locations from real order data
                    initializeLocations(data.data);
                    
                    // Show map for orders with driver or in progress
                    if (data.data.driver || 
                        data.data.status?.name === 'in-road' || 
                        data.data.status?.name === 'in_progress' || 
                        data.data.status?.name === 'assigned') {
                        setIsMapVisible(true);
                        
                        // Start real-time tracking if driver exists
                        if (data.data.driver) {
                            setTimeout(() => {
                                startRealTimeTracking();
                            }, 1000);
                        }
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
        
        // Cleanup interval on unmount
        return () => {
            if (driverTrackingInterval) {
                clearInterval(driverTrackingInterval);
            }
        };
    }, [orderId]);

    // Restart tracking when trackingActive changes
    useEffect(() => {
        if (orderData?.driver) {
            startRealTimeTracking();
        }
    }, [trackingActive]);

    // Determine order status
    const isProcessing = orderData?.status?.name === 'in-road' || orderData?.status?.name === 'in_progress' || orderData?.status?.name === 'assigned';
    const isPending = orderData?.status?.name === 'pendding';
    const isCancelled = orderData?.status?.name === 'cancelled';
    const isCompleted = orderData?.status?.name === 'completed';
    const isConfirmed = orderData?.status?.name === 'confirmed';

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
    const handleRefresh = async () => {
        setLoading(true);
        const token = getToken();
        
        try {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            const data = await response.json();
            
            if (data.status === true) {
                setOrderData(data.data);
                setError(null);
                // Re-initialize locations
                initializeLocations(data.data);
                
                // Restart tracking if needed
                if (data.data.driver && (isProcessing || data.data.status?.name === 'in-road')) {
                    startRealTimeTracking();
                }
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
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

    // Get status style
    const getStatusStyle = (statusName) => {
        switch (statusName) {
            case 'completed':
                return "bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200";
            case 'in-road':
            case 'in_progress':
                return "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-200 animate-pulse";
            case 'pendding':
                return "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border border-amber-200 font-bold";
            case 'cancelled':
                return "bg-gradient-to-r from-red-100 to-red-50 text-red-700 border border-red-200";
            case 'confirmed':
                return "bg-gradient-to-r from-sky-100 to-sky-50 text-sky-700 border border-sky-200";
            case 'assigned':
                return "bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border border-purple-200";
            default:
                return "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200";
        }
    };

    // Get status label
    const getStatusLabel = (statusName) => {
        const statusMap = {
            'pendding': 'معلق',
            'confirmed': 'مؤكد',
            'assigned': 'معين للسائق',
            'in_progress': 'قيد التنفيذ',
            'in-road': 'في الطريق',
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
            'in_progress': 'جاري التجهيز',
            'in-road': '🚚 في الطريق إليك',
            'completed': '✅ مكتمل التسليم',
            'cancelled': '❌ ملغي'
        };
        return statusMap[statusName] || statusName;
    };

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

    // Calculate order summary
    const calculateSummary = () => {
        if (!orderData) return null;

        const subtotalRaw = orderData.price ?? 0;
        const subtotal = typeof subtotalRaw === 'number' ? subtotalRaw : parseFloat(subtotalRaw) || 0;
        const total = subtotal;

        return {
            subtotal: subtotal.toFixed(2),
            total: total.toFixed(2)
        };
    };

    // Calculate distance between locations
    const calculateDistance = () => {
        if (!userLocation || !driverLocation) return null;
        
        const R = 6371;
        const dLat = (driverLocation[0] - userLocation[0]) * Math.PI / 180;
        const dLon = (driverLocation[1] - userLocation[1]) * Math.PI / 180;
        
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userLocation[0] * Math.PI / 180) * Math.cos(driverLocation[0] * Math.PI / 180) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return distance;
    };

    // Calculate estimated arrival time
    const calculateETA = () => {
        const distance = calculateDistance();
        if (!distance) return "15 دقيقة";
        
        const minutes = Math.max(5, Math.ceil(distance * 12));
        return `${minutes} دقيقة`;
    };

    // Function to open chat with driver
    const openChat = () => {
        if (typeof window !== 'undefined' && orderData?.driver?.user) {
            window.dispatchEvent(new CustomEvent('start-new-chat', {
                detail: { 
                    participantId: orderData.driver.user.id,
                    participantName: orderData.driver.user.name 
                }
            }));
        }
    };

    // Function to navigate to driver profile page
    const navigateToDriverProfile = () => {
        if (orderData?.driver?.id) {
            router.push(`/orders/driver_profile?id=${orderData.driver.id}`);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-4">
                <div className="relative">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-[#3B82F6]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BiWater className="w-6 h-6 text-[#3B82F6] animate-pulse" />
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-gray-700 font-bold text-base mb-1">جاري تحميل تفاصيل الطلب...</p>
                    <p className="text-gray-700 text-xs">الرجاء الانتظار</p>
                </div>
            </div>
        );
    }

    if (authError) {
        return (
            <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl sm:rounded-3xl border border-red-200 p-6 sm:p-8 text-center shadow-lg mx-4 sm:mx-0">
                <div className="text-red-600 mb-4 sm:mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                        <FaTimes className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                </div>
                <p className="text-red-600 font-bold text-lg sm:text-xl mb-2 sm:mb-3">يجب تسجيل الدخول</p>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                    {error || "يجب تسجيل الدخول للوصول إلى هذه الصفحة"}
                </p>
                <button 
                    onClick={handleLoginRedirect}
                    className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white rounded-xl hover:shadow-lg transition-all hover:scale-105 font-bold text-base sm:text-lg w-full sm:w-auto"
                >
                    تسجيل الدخول
                </button>
            </div>
        );
    }

    if (error && !authError) {
        return (
            <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl sm:rounded-3xl border border-red-200 p-6 sm:p-8 text-center shadow-lg mx-4 sm:mx-0">
                <div className="text-red-600 mb-4 sm:mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                        <BiError className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                </div>
                <p className="text-red-600 font-bold text-lg sm:text-xl mb-2 sm:mb-3">حدث خطأ في جلب البيانات</p>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">{error}</p>
                <div className="flex flex-col sm:flex-row gap-3  justify-center">
                    <button 
                        onClick={handleRefresh}
                        className="px-4 sm:px-6 py-3 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white rounded-xl hover:shadow-lg transition-all hover:scale-105 font-bold text-sm sm:text-base w-full sm:w-auto"
                    >
                        حاول مرة أخرى
                    </button>
                    <Link 
                        href="/myProfile/orders"
                        className="px-4 sm:px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm sm:text-base w-full sm:w-auto text-center"
                    >
                        العودة للطلبات
                    </Link>
                </div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="text-center p-6 sm:p-12">
                <div className="text-gray-400 mb-4 sm:mb-6">
                    <BiError className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
                </div>
                <p className="text-xl sm:text-xl font-black mb-2 sm:mb-3">الطلب غير موجود</p>
                <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">تعذر العثور على تفاصيل الطلب المطلوب</p>
                <Link 
                    href="/myProfile/orders"
                    className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white rounded-xl hover:shadow-lg transition-all inline-block font-bold text-base sm:text-lg w-full sm:w-auto"
                >
                    العودة للطلبات
                </Link>
            </div>
        );
    }

    const summary = calculateSummary();
    const currentStatus = orderData.status?.name || 'pendding';
    const statusLabel = orderData.status?.label || getStatusLabel(currentStatus);

    return (
        <>
            {/* Success Toast - Mobile Responsive */}
            {showSuccessToast && (
                <div className="fixed top-4 right-4 left-4 sm:right-6 sm:left-auto z-[200] bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-in max-w-sm mx-auto sm:mx-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <BiCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex flex-col flex-1">
                        <span className="font-black text-sm sm:text-base">شكراً لك!</span>
                        <span className="font-medium text-xs sm:text-sm opacity-90">تم استلام تقييمك بنجاح</span>
                    </div>
                    <button onClick={() => setShowSuccessToast(false)} className="text-white/80 hover:text-white">
                        <BiX className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Rating Modal - Mobile Responsive */}
            {showRatingModal && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center p-2 sm:p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowRatingModal(false)}></div>
                    <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-xl sm:rounded-3xl shadow-2xl border border-gray-200 animate-scale-in overflow-hidden max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowRatingModal(false)} className="absolute top-4 left-4 sm:top-6 sm:left-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-[220]">
                            <BiX className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <div className="p-4 sm:p-8 text-center relative z-[215]">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl mx-auto flex items-center justify-center mb-4 sm:mb-6 bg-gradient-to-br from-blue-50 to-blue-100">
                                <FaStar className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500" />
                            </div>
                            <h3 className="text-xl sm:text-xl font-black mb-2">تقييم تجربة التوصيل</h3>
                            <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">رأيك يهمنا في تحسين جودة خدماتنا</p>
                            
                            <div className="flex flex-col items-center gap-6 sm:gap-8">
                                {/* Overall Rating */}
                                <div className="w-full">
                                    <label className="text-xs sm:text-sm font-bold text-right block mb-3 sm:mb-4 text-[#3B82F6]">التقييم العام</label>
                                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button 
                                                key={star} 
                                                onMouseEnter={() => setHoverRating(star)} 
                                                onMouseLeave={() => setHoverRating(0)} 
                                                onClick={() => setUserRating(star)} 
                                                className="transition-transform active:scale-90 hover:scale-110"
                                            >
                                                {star <= (hoverRating || userRating) ? 
                                                    <FaStar className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500 drop-shadow-lg" /> : 
                                                    <FaRegStar className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300" />
                                                }
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Aspects Rating */}
                                <div className="w-full">
                                    <label className="text-xs sm:text-sm font-bold text-right block mb-4 sm:mb-6 text-[#3B82F6]">تقييم الجوانب (اختياري)</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        {[
                                            { key: 'punctuality', label: 'الالتزام بالمواعيد' },
                                            { key: 'service_quality', label: 'جودة الخدمة' },
                                            { key: 'communication', label: 'التواصل' },
                                            { key: 'carefulness', label: 'الدقة والاهتمام' }
                                        ].map((aspect) => (
                                            <div key={aspect.key} className="space-y-2 sm:space-y-3">
                                                <label className="text-xs sm:text-sm font-medium text-right block text-gray-600">
                                                    {aspect.label}
                                                </label>
                                                <div className="flex items-center justify-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button 
                                                            key={star} 
                                                            onClick={() => setAspects(prev => ({ 
                                                                ...prev, 
                                                                [aspect.key]: star 
                                                            }))} 
                                                            className="transition-transform active:scale-90"
                                                        >
                                                            {star <= aspects[aspect.key] ? 
                                                                <FaStar className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" /> : 
                                                                <FaRegStar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                                                            }
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Comment */}
                                <div className="w-full text-right space-y-3 sm:space-y-4">
                                    <label className="text-xs sm:text-sm font-bold text-[#3B82F6]">ملاحظاتك (اختياري)</label>
                                    <textarea 
                                        value={ratingComment}
                                        onChange={(e) => setRatingComment(e.target.value)}
                                        placeholder="اكتب تعليقك هنا عن جودة الخدمة أو السائق..." 
                                        className="w-full h-24 sm:h-32 bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-xs sm:text-sm border-2 border-gray-200 focus:border-[#3B82F6] outline-none transition-all resize-none focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                                
                                <button 
                                    disabled={userRating === 0 || isSubmittingRating} 
                                    onClick={handleRatingSubmit} 
                                    className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg transition-all ${userRating === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8]"}`}
                                >
                                    {isSubmittingRating ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            جاري الإرسال...
                                        </span>
                                    ) : "تأكيد التقييم"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4 sm:space-y-8 pb-6 sm:pb-12 px-3 sm:px-0">
                {/* Header Section - Mobile Responsive */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-lg p-4 sm:p-6 ">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-8">
                        <div className="flex items-start gap-4 sm:gap-6">
                            <Link 
                                href="/myProfile/orders" 
                                className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 transition-all mt-1 hover:shadow flex-shrink-0"
                            >
                                <BiArrowBack className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                            </Link>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2  mb-3 sm:mb-4">
                                    <h1 className="text-xl sm:text-xl md:text-xl lg:text-xl font-black text-gray-900 tracking-tight truncate">
                                        الطلب #{orderData.id}
                                    </h1>
                                    <div className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-bold ${getStatusStyle(currentStatus)} shadow-sm w-fit`}>
                                        <span className="flex items-center gap-1 sm:gap-2">
                                            {getStatusText(currentStatus)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-gray-600 text-sm sm:text-base">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <BiCalendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                        <span className="font-medium truncate">{formatDate(orderData.created_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <BiTimeFive className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                        <span className="font-medium">{formatTime(orderData.created_at)}</span>
                                    </div>
                                    {orderData.order_date && (
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <BiWater className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                                            <span className="font-medium truncate">موعد الطلب: {formatDate(orderData.order_date)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 lg:mt-0">
                            <button 
                                onClick={handleRefresh}
                                className="flex items-center justify-center gap-2 px-3 py-2 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold bg-white border border-gray-200 hover:bg-gray-50 transition-all shadow hover:shadow-md flex-1 sm:flex-none"
                            >
                                <FaSyncAlt className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                                <span>تحديث</span>
                            </button>
                            
                            {isCompleted && (
                                <button className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all bg-gradient-to-r from-green-500 to-emerald-600 flex-1 sm:flex-none">
                                    <BiRefresh className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>طلب مرة أخرى</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid - Mobile Responsive */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 ">
                    {/* Left Column - Main Content */}
                    <div className="xl:col-span-8 space-y-4 sm:space-y-6 lg:space-y-8">
                        {/* Status Card - Mobile Responsive */}
                        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                            {currentStatus === 'in-road' && (
                                <div className="relative bg-gradient-to-br from-blue-50 to-white p-4 sm:p-6 ">
                                    <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 ">
                                        <div className="relative">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center border-3 sm:border-4 border-white shadow-lg">
                                                <BiSolidTruck className="w-8 h-8 sm:w-10 sm:h-10 text-blue-800 animate-bounce" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2
                                             w-4 h-4   bg-red-500 rounded-full 
                                             border-2 sm:border-3 border-white animate-ping"></div>
                                        </div>
                                        <div className="flex-1 text-center md:text-right">
                                            <h3 className="text-lg  font-black mb-2 sm:mb-3 text-gray-900">🚚 السائق في الطريق إليك</h3>
                                        
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isPending && (
                                <div className="relative bg-gradient-to-br from-amber-50 to-white p-4 sm:p-6 ">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="relative mb-4 sm:mb-6 ">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20  rounded-full bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center border-3 sm:border-4 border-amber-200 shadow-lg">
                                                <BiTimeFive className="w-8 h-8   text-amber-600 animate-spin" style={{ animationDuration: '3s' }} />
                                            </div>
                                        </div>
                                        <h3 className="text-lg sm:text-xl lg:text-xl  font-black mb-2 sm:mb-4 text-gray-900">جاري تأكيد طلبك</h3>
                                        <p className="text-gray-600 max-w-md mb-4 sm:mb-6 text-sm sm:text-base ">نحن نقوم الآن بالبحث عن أفضل ناقل قريب من موقعك</p>
                                        <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-100 to-amber-50 rounded-xl sm:rounded-2xl border border-amber-200 text-xs sm:text-sm">
                                            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-600 animate-pulse"></span>
                                            <span className="font-bold text-amber-800">متوسط وقت التأكيد: 5 دقائق</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isCancelled && (
                                <div className="relative bg-gradient-to-br from-red-50 to-white p-4 sm:p-6  md:p-12">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center mb-4 sm:mb-6  border-3 sm:border-4 border-red-200 shadow-lg">
                                            <BiError className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 text-red-600" />
                                        </div>
                                        <h3 className="text-lg sm:text-xl lg:text-xl  font-black text-red-700 mb-3 sm:mb-4 ">تم إلغاء الطلب</h3>
                                        <div className="max-w-md bg-white/90 p-4 sm:p-6  rounded-xl sm:rounded-2xl lg:rounded-3xl border border-red-200 mb-4 sm:mb-6  backdrop-blur-sm shadow">
                                            <p className="text-xs sm:text-sm font-black text-red-600 uppercase tracking-widest mb-2 sm:mb-3">حالة الطلب</p>
                                            <p className="text-sm sm:text-base  font-bold leading-relaxed text-gray-800">
                                                {statusLabel} - {orderData.status?.name || 'cancelled'}
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto">
                                            <button className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base  shadow-lg hover:scale-105 transition-all w-full sm:w-auto">
                                                <BiRefresh className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 inline ml-1 sm:ml-2" />
                                                إعادة الطلب
                                            </button>
                                            <button className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-white border border-gray-200 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base  hover:bg-gray-50 transition-all shadow w-full sm:w-auto">
                                                <BiSupport className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 inline ml-1 sm:ml-2" />
                                                الدعم الفني
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isCompleted && (
                                <div className="relative bg-gradient-to-br from-green-50 to-white p-4 sm:p-6  md:p-12">
                                    <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 lg:gap-10">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center text-white shadow-lg sm:shadow-2xl bg-gradient-to-br from-green-500 to-emerald-600">
                                            <BiCheckCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14" />
                                        </div>
                                        <div className="flex-1 text-center md:text-right">
                                            <h3 className="text-lg sm:text-xl lg:text-xl  xl:text-xl font-black mb-2 sm:mb-3 lg:mb-4 text-gray-900">✅ تم التوصيل بنجاح</h3>
                                            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base ">شكراً لك على استخدام خدماتنا</p>
                                            <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 lg:gap-4">
                                                <div className="px-3 py-1.5 sm:px-4 sm:py-2 lg:px-5 lg:py-3 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-lg bg-gradient-to-r from-yellow-500 to-amber-500">
                                                    تقييمك: 4.9 <FaStar className="inline mb-0.5 sm:mb-1 ms-1" />
                                                </div>
                                                <div className="px-3 py-1.5 sm:px-4 sm:py-2 lg:px-5 lg:py-3 bg-gray-100 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold text-gray-700">
                                                    ⏱️ مدة الانتظار: 25 دقيقة
                                                </div>
                                                <button 
                                                    onClick={() => setShowRatingModal(true)}
                                                    className="px-3 py-1.5 sm:px-4 sm:py-2 lg:px-5 lg:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl"
                                                >
                                                    ⭐ تقييم الخدمة
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isConfirmed && (
                                <div className="relative bg-gradient-to-br from-blue-50 to-white p-4 sm:p-6  md:p-12">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20  rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center border-3 sm:border-4 border-blue-200 shadow-lg mb-4 sm:mb-6 ">
                                            <BiCheckCircle className="w-8 h-8 sm:w-12 sm:h-12  text-blue-600" />
                                        </div>
                                        <h3 className="text-lg sm:text-xl lg:text-xl  font-black mb-2 sm:mb-4 text-gray-900">تم تأكيد طلبك</h3>
                                        <p className="text-gray-600 max-w-md mb-4 sm:mb-6  text-sm sm:text-base ">تم تأكيد الطلب بنجاح، جاري إعداد التوصيل</p>
                                        <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl sm:rounded-2xl border border-blue-200 text-xs sm:text-sm">
                                            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-600"></span>
                                            <span className="font-bold text-blue-800">جاري تجهيز المركبة</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Order Details Footer - Mobile Responsive */}
                            <div className="p-4 sm:p-6  border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 ">
                                    <div className="flex items-center gap-3  ">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14  rounded-xl sm:rounded-2xl bg-white p-2 sm:p-3 flex-shrink-0 shadow">
                                            <Image 
                                                src="/images/car.png" 
                                                alt="Truck" 
                                                width={40} 
                                                height={40} 
                                                className="w-full h-full object-contain" 
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm text-gray-700 font-bold mb-1 sm:mb-2">الخدمة</p>
                                            <p className="text-sm sm:text-base  font-black text-gray-900 truncate">{orderData.service?.name || "غير محدد"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3  ">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14  rounded-xl sm:rounded-2xl bg-white flex items-center justify-center shadow flex-shrink-0">
                                            <BiWater className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm text-gray-700 font-bold mb-1 sm:mb-2">نوع المياه</p>
                                            <p className="text-sm sm:text-base  font-black text-gray-900 truncate">{orderData.water_type?.name || "غير محدد"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3  ">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14  rounded-xl sm:rounded-2xl bg-white flex items-center justify-center shadow flex-shrink-0">
                                            <BiCalendar className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm text-gray-700 font-bold mb-1 sm:mb-2">تاريخ الطلب</p>
                                            <p className="text-sm sm:text-base  font-black text-gray-900 truncate">{formatDate(orderData.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tracking Map Section - Mobile Responsive */}
                        {(isMapVisible && userLocation) && (
                            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-lg p-4 sm:p-6 ">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6  gap-3 ">
                                    <div className="flex items-center gap-3 ">
                                        <div className="w-1.5 h-8 sm:w-2 sm:h-10 rounded-full bg-gradient-to-b from-blue-500 to-blue-600"></div>
                                        <div className="min-w-0">
                                            <h2 className="text-lg sm:text-xl lg:text-xl font-black text-gray-900 truncate">خريطة التتبع المباشر</h2>
                                            <p className="text-gray-600 text-xs sm:text-sm">تتبع موقع السائق والعنوان لحظة بلحظة</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 self-end sm:self-auto">
                                        {orderData.driver && (
                                            <>
                                                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold border border-blue-200">
                                                    <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${trackingActive ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                                    {trackingActive ? 'التتبع نشط' : 'التتبع متوقف'}
                                                </div>
                                                <button 
                                                    onClick={() => setTrackingActive(!trackingActive)}
                                                    className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 transition-all shadow"
                                                    title={trackingActive ? 'إيقاف التتبع' : 'تشغيل التتبع'}
                                                >
                                                    {trackingActive ? '⏸️' : '▶️'}
                                                </button>
                                            </>
                                        )}
                                        <button 
                                            onClick={() => setIsMapVisible(false)}
                                            className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-red-500 hover:text-white transition-all shadow"
                                            title="إخفاء الخريطة"
                                        >
                                            <BiX className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </button>
                                    </div>
                                </div>
                                
                                <EnhancedOrderTrackingMap 
                                    userLocation={userLocation}
                                    driverLocation={driverLocation}
                                    driverName={orderData.driver?.user?.name}
                                    driverPhone={orderData.driver?.user?.phone}
                                    vehiclePlate={orderData.driver?.vehicle_plate_number}
                                    driverRating={4.8}
                                    orderStatus={currentStatus}
                                    isDriverActive={trackingActive && orderData.driver && (currentStatus === 'in-road' || currentStatus === 'in_progress')}
                                    userAddress={orderData.location?.address}
                                    driverInfo={orderData.driver}
                                />
                                
                                {orderData.driver && (
                                    <div className="mt-4 sm:mt-6 lg:mt-8 pt-4 sm:pt-6 lg:pt-8 border-t border-gray-200">
                                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                                            <div className="bg-gradient-to-br from-gray-50 to-white p-3 sm:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl text-center border border-gray-200">
                                                <p className="text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2">حالة السائق</p>
                                                <p className="text-sm sm:text-base  font-bold text-blue-600">
                                                    {currentStatus === 'in-road' ? '🚚 في الطريق' : getStatusText(currentStatus)}
                                                </p>
                                            </div>
                                            {driverLocation && (
                                                <>
                                                    <div className="bg-gradient-to-br from-amber-50 to-white p-3 sm:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl text-center border border-amber-200">
                                                        <p className="text-xs sm:text-sm text-amber-600 mb-1 sm:mb-2">المسافة المتبقية</p>
                                                        <p className="text-sm sm:text-base  font-bold text-amber-700">
                                                            {calculateDistance() ? 
                                                                (calculateDistance() < 1 ? 
                                                                    `${Math.round(calculateDistance() * 1000)} م` : 
                                                                    `${calculateDistance().toFixed(1)} كم`) 
                                                                : '--'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-green-50 to-white p-3 sm:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl text-center border border-green-200">
                                                        <p className="text-xs sm:text-sm text-green-600 mb-1 sm:mb-2">الوقت المتوقع</p>
                                                        <p className="text-sm sm:text-base  font-bold text-green-700">{calculateETA()}</p>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-blue-50 to-white p-3 sm:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl text-center border border-blue-200">
                                                        <p className="text-xs sm:text-sm text-blue-600 mb-1 sm:mb-2">سرعة السائق</p>
                                                        <p className="text-sm sm:text-base  font-bold text-blue-700">
                                                            {trackingActive && currentStatus === 'in-road' ? '45 كم/س' : '--'}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Show Map Button for orders without map visible - Mobile Responsive */}
                        {!isMapVisible && orderData.location && (
                            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl sm:rounded-3xl border border-blue-200 shadow-lg p-6 sm:p-8 lg:p-10 text-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mx-auto mb-4 sm:mb-6  border-3 sm:border-4 border-white shadow-lg">
                                    <BiMapPin className="w-8 h-8 sm:w-10 sm:h-10  text-blue-600" />
                                </div>
                                <h3 className="text-lg sm:text-xl lg:text-xl font-black mb-2 sm:mb-3 lg:mb-4 text-gray-900">موقع التوصيل</h3>
                                <p className="text-gray-600 mb-3 sm:mb-4  text-sm sm:text-base  truncate">
                                    {orderData.location?.address || "موقع التوصيل"}
                                </p>
                                <p className="text-gray-700 mb-4 sm:mb-6  text-xs sm:text-sm">عرض موقع التوصيل على الخريطة التفاعلية</p>
                                <button 
                                    onClick={() => setIsMapVisible(true)}
                                    className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base  shadow-lg hover:scale-105 transition-all inline-flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto"
                                >
                                    <BiNavigation className="w-5 h-5 sm:w-6 sm:h-6" />
                                    عرض الخريطة التفاعلية
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar - Mobile Responsive */}
                    <div className="xl:col-span-4 space-y-4 sm:space-y-6 lg:space-y-8">
                        {/* Driver Card - Mobile Responsive */}
                        {orderData.driver ? (
                            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-lg p-4 sm:p-6  overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-blue-500/10 rounded-full blur-2xl sm:blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6  gap-2 sm:gap-0">
                                        <span className="px-3 py-1.5  bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg
                                         sm:rounded-xl text-xs font-bold border border-blue-200 w-fit">
                                            بيانات الناقل
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs  font-medium text-gray-600">
                                                {currentStatus === 'in-road' ? " في الطريق" : 
                                                 isProcessing ? "🔄 جاري التوصيل" : 
                                                 isCompleted ? "✅ تم التوصيل" : "📝 تم التعيين"}
                                            </span>
                                            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${currentStatus === 'in-road' ? 'bg-green-500 animate-pulse' : 
                                                              isProcessing ? 'bg-amber-500 animate-pulse' : 
                                                              isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                        </div>
                                    </div>

                                    <div className="text-center mb-4 sm:mb-6 ">
                                        <div className="relative inline-block mb-3 sm:mb-4 ">
                                            <div className="w-20 h-20 sm:w-24 sm:h-24  rounded-2xl sm:rounded-3xl overflow-hidden border-4 sm:border-5 lg:border-6 border-white shadow-lg sm:shadow-xl lg:shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                {orderData.driver.user.avatar ? (
                                                    <Image 
                                                        src={orderData.driver.user.avatar} 
                                                        alt={orderData.driver.user.name}
                                                        width={128}
                                                        height={128}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <BiUserIcon className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10  rounded-lg sm:rounded-xl lg:rounded-2xl text-white flex items-center justify-center shadow border-2 sm:border-3 lg:border-4 border-white bg-gradient-to-r from-green-500 to-emerald-600">
                                                <BiCheck className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                                            </div>
                                            
                                        </div>
                                        <h3 className="text-lg sm:text-xl lg:text-xl font-black mb-2 sm:mb-3 text-gray-900 truncate">
                                            {orderData.driver.user.name || "غير محدد"}
                                        </h3>
                                        <div className="text-gray-600 mb-4 sm:mb-6  text-sm sm:text-base">
                                            <p className="text-xs sm:text-sm mt-1 sm:mt-2">ناقل معتمد - {orderData.driver.vehicle_size || "8 طن"}</p>
                                        </div>

                                        {isCompleted && (
                                            <button 
                                                onClick={() => setShowRatingModal(true)} 
                                                className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-white font-bold text-sm sm:text-base  transition-all hover:scale-[1.02] active:scale-95 mb-3 sm:mb-4 shadow-lg hover:shadow-xl bg-gradient-to-r from-yellow-500 to-amber-500"
                                            >
                                                <FaStar className="w-4 h-4 sm:w-5 sm:h-5 inline ml-1 sm:ml-2" />
                                                تقييم تجربة التوصيل
                                            </button>
                                        )}

                                        {isProcessing && orderData.driver && (
                                            <div className="space-y-2 sm:space-y-3">
                                                <button 
                                                    onClick={openChat}
                                                    className="w-full py-2 sm:py-3 rounded-xl text-white font-bold text-sm sm:text-base transition-all hover:scale-[1.02] active:scale-95 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] shadow-lg hover:shadow-xl"
                                                >
                                                    <FaCommentDots className="w-4 h-4 sm:w-5 sm:h-5 inline ml-1 sm:ml-2" />
                                                    محادثة مع السائق
                                                </button>
                                                
                                                <button 
                                                    onClick={navigateToDriverProfile}
                                                    className="w-full py-2 sm:py-3 rounded-xl text-[#3B82F6] font-bold text-sm sm:text-base transition-all hover:scale-[1.02] bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow hover:shadow-md flex items-center justify-center gap-2"
                                                >
                                                    <FaUser className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    <span> الملف الشخصي </span>
                                                </button>
                                            </div>
                                        )}
                                        
                                        {/* Always show driver profile button if driver exists */}
                                        {orderData.driver && !isProcessing && (
                                            <button 
                                                onClick={navigateToDriverProfile}
                                                className="w-full py-2 sm:py-3 rounded-xl text-[#3B82F6] font-bold text-sm sm:text-base transition-all hover:scale-[1.02] bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow hover:shadow-md flex items-center justify-center gap-2 mt-2"
                                            >
                                                <BiIdCard className="w-4 h-4 sm:w-5 sm:h-5" />
                                                <span>الملف الشخصي للسائق</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-lg p-4 sm:p-6  overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 sm:w-30 sm:h-30  bg-amber-500/10 rounded-full blur-2xl sm:blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6  gap-2 sm:gap-0">
                                        
                                    </div>

                                    <div className="text-center mb-4 sm:mb-6 ">
                                        <div className="relative inline-block mb-3 sm:mb-4 ">
                                            <div className="w-20 h-20 sm:w-24 sm:h-24  rounded-2xl sm:rounded-3xl overflow-hidden border-4 sm:border-5 lg:border-6 border-white shadow-lg sm:shadow-xl lg:shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                <BiSolidTruck className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-gray-400" />
                                            </div>
                                            
                                        </div>
                                        <h3 className="text-sm sm:text-lg  font-black mb-2 sm:mb-3 text-gray-900">لم يتم تخصيص ناقل بعد</h3>
                                      

                                        
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Invoice Card - Mobile Responsive */}
                        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-lg p-4 sm:p-6  overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-blue-500/10 rounded-full blur-xl sm:blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3  mb-4 sm:mb-6 ">
                                    <div className="w-1.5 h-8 sm:w-2 sm:h-10 rounded-full bg-gradient-to-b from-blue-500 to-blue-600"></div>
                                    <h2 className="text-lg sm:text-xl font-black text-gray-900">تفاصيل الفاتورة</h2>
                                </div>
                                
                                {summary && (
                                    <>
                                        <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6 ">
                                            <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-200">
                                                <span className="text-gray-600 text-sm sm:text-base">سعر الخدمة</span>
                                                <span className="text-base sm:text-lg font-black text-gray-900">{summary.subtotal} ر.س</span>
                                            </div>
                                            
                                           
                                            
                                        </div>

                                       
                                    </>
                                )}

                              
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}