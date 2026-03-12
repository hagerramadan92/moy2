"use client";

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useReducer,
} from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDriverData } from "./DriverCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChevronLeft,
  Truck,
  Users,
  AlertCircle,
  RefreshCw,
  LogIn,
  X,
  MapPin,
  Navigation,
  Wifi,
  WifiOff,
} from "lucide-react";
import DriverCard from "./DriverCard";
import PaymentModal from "./PaymentModal";
import { API_BASE_URL, getAccessToken } from "./utils/api";
import {
  getPaymentCallbackData,
  getPendingOfferData,
} from "./utils/paymentHelpers";
import usePusher from "@/hooks/usePusher";
import toast from "react-hot-toast";

// Dynamically import map to avoid SSR
const DriversMap = dynamic(() => import("./DriversMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center animate-pulse">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#579BE8] mx-auto mb-2"></div>
        <span className="text-gray-400 text-sm">جاري تحميل الخريطة...</span>
      </div>
    </div>
  ),
});

// Action Types for offers reducer
const OFFER_ACTIONS = {
  SET_OFFERS: "SET_OFFERS",
  ADD_OFFER: "ADD_OFFER",
  UPDATE_OFFER: "UPDATE_OFFER",
  REMOVE_OFFER: "REMOVE_OFFER",
};

// Offers Reducer with deep merge
const offersReducer = (state, action) => {
  // console.log('🔄 Reducer action:', action.type, action.payload?.id);

  switch (action.type) {
    case OFFER_ACTIONS.SET_OFFERS:
      // console.log('📦 Setting offers:', action.payload?.length || 0);
      return action.payload || [];

    case OFFER_ACTIONS.ADD_OFFER:
      if (state.some((offer) => offer.id === action.payload.id)) {
        // console.log(`⚠️ Offer ${action.payload.id} already exists, skipping add.`);
        return state;
      }
      // console.log(`✅ Adding new offer ${action.payload.id}`);
      return [action.payload, ...state];

    case OFFER_ACTIONS.UPDATE_OFFER:
      // console.log(`🔄 Updating offer ${action.payload.id}`);
      return state.map((offer) => {
        if (offer.id === action.payload.id) {
          // Deep merge
          const updatedOffer = { ...offer, ...action.payload };

          if (action.payload.order) {
            updatedOffer.order = { ...offer.order, ...action.payload.order };
          }

          if (action.payload.driver) {
            updatedOffer.driver = { ...offer.driver, ...action.payload.driver };
          }

          return updatedOffer;
        }
        return offer;
      });

    case OFFER_ACTIONS.REMOVE_OFFER:
      // console.log(`🗑️ Removing offer ${action.payload}`);
      return state.filter((offer) => offer.id !== action.payload);

    default:
      return state;
  }
};

export default function AvailableDriversContent({ onBack }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offersData, setOffersData] = useState(null);
  const [acceptedOfferId, setAcceptedOfferId] = useState(null);
  const [pendingPaymentOfferId, setPendingPaymentOfferId] = useState(null);
  const [expiredOfferIds, setExpiredOfferIds] = useState([]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paidOfferIds, setPaidOfferIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isOrderExpired, setIsOrderExpired] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [lastOfferCount, setLastOfferCount] = useState(0);
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);

  // Map refresh key
  const [mapKey, setMapKey] = useState(0);

  // Use reducer for offers list
  const [offers, dispatchOffers] = useReducer(offersReducer, []);

  // Refs
  const mapInitializedRef = useRef(false);
  const isLocationInitializedRef = useRef(false);
  const paymentProcessedRef = useRef(false);
  const initialFetchDoneRef = useRef(false);
  const expiryCheckIntervalRef = useRef(null);
  const offersRef = useRef(offers);
  const lastOfferCountRef = useRef(0);

  // State for order expiry countdown
  const [orderExpiryTime, setOrderExpiryTime] = useState(null);
  const [countdown, setCountdown] = useState({
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  // Update ref when offers change
  useEffect(() => {
    offersRef.current = offers;

    // Detect new offers for toast notifications
    if (
      offers.length > lastOfferCountRef.current &&
      lastOfferCountRef.current > 0
    ) {
      const newOffersCount = offers.length - lastOfferCountRef.current;
      const latestOffers = offers.slice(0, newOffersCount);

      latestOffers.forEach((offer) => {
        toast.success(`💰 عرض جديد بقيمة ${offer.price} ريال`, {
          duration: 4000,
          icon: "💰",
          position: "top-left",
        });
      });
    }

    lastOfferCountRef.current = offers.length;
  }, [offers]);

  // Location state
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);

  // Notification states
  const [newOfferNotification, setNewOfferNotification] = useState(null);
  const [driverAcceptedNotification, setDriverAcceptedNotification] =
    useState(null);
  const [offerExpiredNotification, setOfferExpiredNotification] =
    useState(null);

  // States for payment flow
  const [selectedForPaymentOfferId, setSelectedForPaymentOfferId] =
    useState(null);
  const [processingPaymentOfferId, setProcessingPaymentOfferId] =
    useState(null);

  const {
    isConnected: pusherConnected,
    connectionState: pusherState,
    subscribe,
    unsubscribeAll,
    addEventListener,
    removeEventListener,
  } = usePusher({
    autoConnect: true,
    onConnected: () => {
      // console.log('✅ Pusher connected in AvailableDrivers');
      setShowConnectionStatus(true);
      setTimeout(() => setShowConnectionStatus(false), 3000);
    },
    onDisconnected: () => {
      // console.log('🔴 Pusher disconnected in AvailableDrivers');
      setShowConnectionStatus(true);
      setTimeout(() => setShowConnectionStatus(false), 3000);
    },
  });

  const orderId = searchParams.get("orderId");
  const paymentStatus = searchParams.get("payment");
  const paymentSuccessParam = searchParams.get("success");
  const paymentCancelParam = searchParams.get("cancel");
  const isExpiredParam = searchParams.get("expired");

  // ============= دوال حساب الوقت =============

  // دالة حساب الوقت المتبقي من تاريخ الانتهاء
  const calculateTimeRemaining = (expiresAt) => {
    if (!expiresAt) return null;

    const expiryTime = new Date(expiresAt).getTime();
    const now = new Date().getTime();
    const diff = expiryTime - now;

    if (diff <= 0) {
      return { minutes: 0, seconds: 0, expired: true };
    }

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { minutes, seconds, expired: false };
  };

  // دالة تنسيق الوقت المتبقي (للعداد الكبير)
  const formatTimeRemaining = () => {
    if (!timeRemaining) return "جاري الحساب...";

    const { days, hours, minutes, seconds } = timeRemaining;

    if (days > 0) {
      return `${days} يوم ${hours} ساعة ${minutes} دقيقة`;
    } else if (hours > 0) {
      return `${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`;
    } else if (minutes > 0) {
      return `${minutes} دقيقة ${seconds} ثانية`;
    } else {
      return `${seconds} ثانية`;
    }
  };

  // دالة حساب الوقت المتبقي مع تحديد انتهاء الصلاحية
  const calculateTimeRemainingWithExpiry = (expiresAt) => {
    if (!expiresAt) return null;

    const expiryTime = new Date(expiresAt).getTime();
    const now = new Date().getTime();
    const diff = expiryTime - now;

    if (diff <= 0) {
      setIsOrderExpired(true);
      return null;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  // دالة تنسيق العداد (MM:SS)
  const formatCountdown = () => {
    if (countdown.expired) {
      return "انتهت صلاحية الطلب";
    }

    const minutes = countdown.minutes.toString().padStart(2, "0");
    const seconds = countdown.seconds.toString().padStart(2, "0");

    return `${minutes}:${seconds}`;
  };

  // ============= دوال معالجة الأحداث =============

  // ✅ دالة معالجة حدث DriverAcceptedOrder فقط
  const handleDriverAcceptedOrder = useCallback(
    (data) => {
      // console.log('🚗 ===== DRIVER ACCEPTED ORDER EVENT =====', data);
      // console.log('📋 Full event data:', JSON.stringify(data, null, 2));

      const acceptedOrderId = data.order_id || data.order?.id;
      const currentOrderId = orderId;

      if (
        acceptedOrderId &&
        acceptedOrderId.toString() === currentOrderId?.toString()
      ) {
        // console.log(`✅ Driver accepted our order ${currentOrderId}`);

        // استخراج بيانات العرض من البيانات المرتجعة
        const offerData = data.offer;

        if (!offerData) {
          console.error("❌ No offer data found in event");
          return;
        }

        // ✅ استخراج بيانات الموقع بشكل صحيح
        let driverLocation = null;

        // التحقق من وجود currect_location في البيانات
        if (offerData.driver?.currect_location) {
          // console.log('📍 Raw location data:', offerData.driver.currect_location);

          // التأكد من تحويل الإحداثيات إلى أرقام
          driverLocation = {
            lat: parseFloat(offerData.driver.currect_location.lat) || 0,
            lng: parseFloat(offerData.driver.currect_location.lng) || 0,
            last_updated_at: offerData.driver.currect_location.last_updated_at,
          };

          // console.log('✅ Formatted location:', driverLocation);
        } else {
          console.warn("⚠️ No location data found for driver");
        }

        // ✅ تنسيق بيانات السائق من الهيكل الجديد مع تضمين الموقع
        // يجب أن يتطابق هذا الكائن مع ما تتوقعه دالة formatDriverData
        const formattedDriver = {
          id: offerData.driver_id,
          name: offerData.driver?.user?.name || offerData.driver_name || "سائق",
          rating: 4.5,
          ratingCount: 0,
          phone: offerData.driver?.user?.phone || offerData.driver_phone,
          image:
            offerData.driver?.user?.avatar || offerData.driver?.personal_photo,
          vehicle: {
            type: offerData.driver?.vehicle_size || "مركبة",
            model: offerData.driver?.vehicle_size || "مركبة",
            plate_number: offerData.driver?.vehicle_plate_number || "XXX",
          },
          // ✅ يجب وضع الموقع داخل كائن driver بنفس هيكل API
          user: offerData.driver?.user || {
            id: offerData.driver_id,
            name: offerData.driver?.user?.name || offerData.driver_name,
            phone: offerData.driver?.user?.phone || offerData.driver_phone,
            avatar:
              offerData.driver?.user?.avatar ||
              offerData.driver?.personal_photo,
          },
          personal_photo: offerData.driver?.personal_photo,
          vehicle_size: offerData.driver?.vehicle_size,
          vehicle_plate_number: offerData.driver?.vehicle_plate_number,
          // ✅ هذا هو المفتاح - نضيف currect_location مباشرة في كائن driver
          currect_location: driverLocation,
        };

        // ✅ إنشاء كائن العرض بالتنسيق المطلوب
        const formattedOffer = {
          id: offerData.id,
          driver_id: offerData.driver_id,
          driver: formattedDriver, // ✅ هذا سيتم تمريره إلى formatDriverData
          price: offerData.price,
          status: "payment_pending", // لأن الدفع لم يتم بعد
          order: {
            id: offerData.order?.id || acceptedOrderId,
            payment_status: "pending",
            location: offerData.order?.location,
            service: offerData.order?.service,
            water_type: offerData.order?.water_type,
          },
          created_at: offerData.created_at,
          delivery_duration_minutes: offerData.delivery_duration_minutes || 30,
          expires_at: new Date(Date.now() + 5 * 60000).toISOString(), // 5 دقائق
        };

        // ✅ إضافة العرض إلى القائمة إذا لم يكن موجوداً
        dispatchOffers({
          type: OFFER_ACTIONS.ADD_OFFER,
          payload: formattedOffer,
        });

        // ✅ تحديث الخريطة بتغيير المفتاح
        setMapKey((prev) => prev + 1);

        // ✅ تحديث الحالات المختلفة
        setPendingPaymentOfferId(offerData.id);
        setSelectedForPaymentOfferId(offerData.id);

        // ✅ عرض إشعار للمستخدم
        setDriverAcceptedNotification({
          id: Date.now(),
          message: "تم قبول العرض - في انتظار إتمام الدفع",
          driverName: formattedDriver.name,
          price: offerData.price,
          offerId: offerData.id,
          expiresIn: 10,
        });
      }
    },
    [orderId],
  );

  // دوال أخرى (يمكنك إضافتها حسب الحاجة)
  const handleOfferCreated = useCallback((data) => {
    // console.log('💰 New offer created:', data);
    // يمكن إضافة منطق معالجة العروض الجديدة هنا
  }, []);

  const handleOfferUpdated = useCallback((data) => {
    // console.log('🔄 Offer updated:', data);
    // يمكن إضافة منطق تحديث العروض هنا
  }, []);

  const handleOfferExpired = useCallback((data) => {
    // console.log('⏰ Offer expired:', data);
    // يمكن إضافة منطق انتهاء العروض هنا
  }, []);

  const handleOrderExpired = useCallback((data) => {
    // console.log('⏱️ Order expired:', data);
    // يمكن إضافة منطق انتهاء الطلب هنا
  }, []);

  const handleTripStartedForUser = useCallback((data) => {
    // console.log('🚀 Trip started:', data);
    // يمكن إضافة منطق بدء الرحلة هنا
  }, []);

  // ============= دالة إعداد Pusher =============

  // ✅ دالة إعداد Pusher للاستماع لحدث DriverAcceptedOrder فقط
  const setupPusherListener = useCallback(
    async (orderId) => {
      try {
        // console.log(`🎯 Setting up Pusher listener for available drivers page - order ${orderId}`);

        if (!orderId) {
          // console.warn('⚠️ No order ID provided for Pusher setup');
          return;
        }

        // ✅ إزالة أي مستمعين سابقين
        removeEventListener("DriverAcceptedOrder");

        // ✅ إضافة مستمع لحدث DriverAcceptedOrder عبر addEventListener
        addEventListener("DriverAcceptedOrder", (data) => {
          // console.log('🚗 DriverAcceptedOrder event triggered via addEventListener');
          handleDriverAcceptedOrder(data);
        });

        // ✅ الاشتراك في قناة الطلب - هذا هو الجزء الأهم
        // استخدام subscribe مع تمرير الأحداث مباشرة
        const channel = subscribe(`order.${orderId}`, {
          // ✅ الاستماع لحدث DriverAcceptedOrder فقط
          DriverAcceptedOrder: (data) => {
            // console.log('🚗 ===== DRIVER ACCEPTED ORDER EVENT RECEIVED VIA SUBSCRIBE =====');
            // console.log('📋 Raw event data:', data);
            handleDriverAcceptedOrder(data);
          },
        });

        if (channel) {
          // console.log(`✅ Successfully subscribed to order.${orderId} channel`);
          // console.log('📡 Listening for DriverAcceptedOrder event only');
        } else {
          console.error(`❌ Failed to subscribe to order.${orderId} channel`);
        }
      } catch (error) {
        console.error("❌ Error setting up Pusher listener:", error);
        toast.error("❌ خطأ في الاتصال بالخادم");
      }
    },
    [
      subscribe,
      addEventListener,
      removeEventListener,
      handleDriverAcceptedOrder,
    ],
  );

  // ============= دوال API =============
  const fetchOffers = async () => {
    try {
      setRefreshing(true);
      setLoading(true);

      const accessToken = getAccessToken();

      if (!accessToken) {
        setError("يجب تسجيل الدخول للوصول إلى هذه الصفحة");
        router.push("/login");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/offers`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      if (response.status === 404) {
        setIsNotFound(true);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const data = await response.json();

      if (response.ok && data.status) {
        setIsNotFound(false);

        const offersFromApi = data.data.offers || [];
        // console.log('📥 Fetched offers from API:', offersFromApi.length);

        dispatchOffers({
          type: OFFER_ACTIONS.SET_OFFERS,
          payload: offersFromApi,
        });

        // ✅ استخراج وقت انتهاء الطلب
        if (offersFromApi.length > 0 && offersFromApi[0].order?.expires_at) {
          setOrderExpiryTime(offersFromApi[0].order.expires_at);
        } else if (data.data.expires_at) {
          setOrderExpiryTime(data.data.expires_at);
        }

        if (data.data.expires_at) {
          setTimeRemaining(
            calculateTimeRemainingWithExpiry(data.data.expires_at),
          );
        }

        setOffersData(data.data);
        setError(null);
        setAcceptedOfferId(null);

        if (data.data.accepted_offer) {
          const acceptedId =
            data.data.accepted_offer.id || data.data.accepted_offer;
          const orderPaymentStatus = data.data.order?.payment_status;

          if (orderPaymentStatus === "paid") {
            setAcceptedOfferId(acceptedId);
            setPendingPaymentOfferId(null);
            setSelectedForPaymentOfferId(null);
            setPaidOfferIds((prev) => new Set([...prev, acceptedId]));
            setPaymentSuccess(true);
            localStorage.removeItem("pendingOfferData");
          }
        }

        setLoading(false);
        setRefreshing(false);
      } else {
        if (data.error_code === "UNAUTHENTICATED") {
          setError("انتهت جلسة الدخول. يرجى تسجيل الدخول مرة أخرى.");
          localStorage.removeItem("accessToken");
          toast.error("انتهت الجلسة - يرجى تسجيل الدخول مجدداً");
        }
        setLoading(false);
      }
    } catch (err) {
      console.warn("API Error:", err.message);

      if (err.message?.includes("404")) {
        setIsNotFound(true);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setError(`حدث خطأ في جلب البيانات: ${err.message}`);
      setLoading(false);
      setRefreshing(false);
      setOffersData(null);
      toast.error("❌ فشل تحميل العروض");
    } finally {
      setRefreshing(false);
    }
  };

  const fetchOrderStatus = async () => {
    if (!orderId) return;

    try {
      const accessToken = getAccessToken();
      if (!accessToken) return;

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (response.ok && data.status && data.data) {
        setOrderStatus(data.data);
      }
    } catch (err) {
      console.warn("Error fetching order status:", err.message);
    }
  };

  // ============= Effects =============
  // ✅ Effect للـ countdown - يتحدث كل ثانية
  useEffect(() => {
    if (!orderExpiryTime) return;

    const updateCountdown = () => {
      const remaining = calculateTimeRemaining(orderExpiryTime);

      // إذا كان الفرق أقل من 1 ثانية (يعني صفر أو أقل)
      if (remaining?.minutes === 0 && remaining?.seconds === 0) {
        setCountdown({ minutes: 0, seconds: 0, expired: true });
        setIsOrderExpired(true);
      } else {
        setCountdown(remaining);
      }
    };

    // تحديث فوري
    updateCountdown();

    // تحديث كل ثانية
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [orderExpiryTime]);

  // جلب موقع المستخدم الحقيقي
  useEffect(() => {
    const getUserLocation = () => {
      if (!navigator.geolocation) {
        setLocationError("المتصفح لا يدعم تحديد الموقع");
        return;
      }

      setLocationLoading(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setCurrentLocation(userLocation);
          setLocationPermissionGranted(true);
          setLocationError(null);
          setShowLocationPrompt(false);

          // حفظ الموقع في localStorage
          localStorage.setItem("userLocation", JSON.stringify(userLocation));
          localStorage.setItem("locationPermissionGranted", "true");

          setLocationLoading(false);

          // تحديث الخريطة
          setMapKey((prev) => prev + 1);
        },
        (error) => {
          console.warn("Error getting location:", error);
          setLocationError("تعذر الحصول على الموقع");
          setLocationLoading(false);
          setShowLocationPrompt(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    };

    // إذا كان هناك إذن مسبق أو لم يتم التحقق بعد، جلب الموقع
    if (!currentLocation && !locationLoading) {
      getUserLocation();
    }
  }, [currentLocation, locationLoading]);

  // متابعة حالة اتصال Pusher وإعادة الاشتراك عند الحاجة
  useEffect(() => {
    if (pusherConnected && orderId) {
      // console.log(`🔄 Pusher connected, ensuring subscription for order ${orderId}`);
      setupPusherListener(orderId);
    }
  }, [pusherConnected, orderId, setupPusherListener]);

  // ✅ Setup Pusher listeners - تعديل ليعمل فور تحميل الصفحة بدون انتظار الاتصال
  useEffect(() => {
    // console.log('🔄 Pusher setup effect running...');

    if (!orderId) {
      // console.log(`⏳ Waiting for orderId`);
      return;
    }

    // console.log(`🎯 Setting up Pusher listener for order ${orderId} immediately`);

    // محاولة الاشتراك فوراً
    setupPusherListener(orderId);

    // أيضاً نحاول مرة أخرى بعد فترة قصيرة للتأكد
    const retryTimer = setTimeout(() => {
      // console.log(`🔄 Retrying Pusher subscription for order ${orderId}`);
      setupPusherListener(orderId);
    }, 2000);

    return () => {
      // console.log('🧹 Cleaning up Pusher listeners');
      clearTimeout(retryTimer);
      unsubscribeAll();
      removeEventListener("DriverAcceptedOrder");
    };
  }, [orderId, setupPusherListener, unsubscribeAll, removeEventListener]);

  // Initial data fetch
  useEffect(() => {
    if (orderId && !initialFetchDoneRef.current) {
      const expiredFlag = localStorage.getItem(`order_${orderId}_expired`);
      if (expiredFlag === "true" || isExpiredParam === "true") {
        setIsOrderExpired(true);
        localStorage.removeItem(`order_${orderId}_expired`);
      }

      fetchOffers();
      fetchOrderStatus();
      initialFetchDoneRef.current = true;
    } else if (!orderId) {
      router.back();
    }
  }, [orderId, isExpiredParam, router]);

  // ============= دوال المعالجة =============
  const handleDriverSelect = (driverId, offerId, driverData, offer) => {
    setSelectedDriverId(driverId);
    setSelectedOfferId(offerId);
    setSelectedOffer(offer);
    setSelectedForPaymentOfferId(offerId);
    setIsModalOpen(true);
    sessionStorage.setItem("selectedDriver", JSON.stringify(driverData));
    paymentProcessedRef.current = false;
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPendingPaymentOfferId(null);
    setSelectedForPaymentOfferId(null);
    localStorage.removeItem("pendingOfferData");
    paymentProcessedRef.current = false;
  };

  const handleConfirmPayment = async (
    methodId,
    driverId,
    paymentData = null,
  ) => {
    try {
      const params = new URLSearchParams({
        driver: driverId,
        offer: selectedOfferId,
        gateway: methodId,
      });

      if (paymentData?.payment_url) {
        params.append("payment_url", paymentData.payment_url);
      }

      router.push(`/orders/${orderId}/confirmation?${params.toString()}`);
    } catch (err) {
      console.error("Error in payment confirmation:", err);
      alert("حدث خطأ في تأكيد الطلب. يرجى المحاولة مرة أخرى.");
    }
  };

  // ============= حساب الإحصائيات =============
  const stats = useMemo(() => {
    if (!offers || offers.length === 0) {
      return {
        totalOffers: 0,
        averagePrice: 0,
        fastestDelivery: 0,
        lowestPrice: 0,
      };
    }

    const prices = offers
      .map((o) => parseFloat(o.price))
      .filter((p) => !isNaN(p));
    const times = offers
      .map((o) => o.delivery_duration_minutes || 0)
      .filter((t) => t > 0);

    return {
      totalOffers: offers.length,
      averagePrice:
        prices.length > 0
          ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)
          : 0,
      fastestDelivery: times.length > 0 ? Math.min(...times) : 0,
      lowestPrice: prices.length > 0 ? Math.min(...prices).toFixed(2) : 0,
    };
  }, [offers]);

  // Memoize drivers data for map
  const memoizedDrivers = useMemo(() => {
    return offers.map(formatDriverData);
  }, [offers]);

  // Force map refresh when drivers change
  useEffect(() => {
    if (memoizedDrivers.length > 0) {
      // console.log('🔄 Drivers changed, forcing map refresh');
      setMapKey((prev) => prev + 1);
    }
  }, [memoizedDrivers]);

  // التحقق من إذن الموقع عند التحميل
  useEffect(() => {
    if (isLocationInitializedRef.current) return;

    const savedPermission = localStorage.getItem("locationPermissionGranted");
    const savedLocation = localStorage.getItem("userLocation");

    if (savedPermission === "true" && savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        setCurrentLocation(location);
        setLocationPermissionGranted(true);
      } catch (error) {
        console.warn("Error parsing saved location:", error);
        const timer = setTimeout(() => {
          setShowLocationPrompt(true);
        }, 2000);

        return () => clearTimeout(timer);
      }
    } else {
      const timer = setTimeout(() => {
        setShowLocationPrompt(true);
      }, 2000);

      return () => clearTimeout(timer);
    }

    isLocationInitializedRef.current = true;
  }, []);

  // ============= Error and loading states =============
  if (error && error.includes("تسجيل الدخول")) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                يجب تسجيل الدخول
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-y-4">
                <button
                  onClick={() =>
                    router.push(
                      `/login?return=/available-drivers?orderId=${orderId}`,
                    )
                  }
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  العودة للرئيسية
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
              <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                الطلب غير موجود
              </h2>
              <p className="text-gray-600 mb-6">
                عذراً، لم يتم العثور على الطلب المطلوب.
              </p>
              <button
                onClick={() => router.push("/")}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition"
              >
                العودة للرئيسية
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-[#579BE8]"></div>
              <Truck className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#579BE8]" />
            </div>
            <p className="mt-6 text-gray-600 font-medium text-lg">
              جاري البحث عن سائقين...
            </p>
            <p className="text-sm text-gray-400 mt-2">رقم الطلب: #{orderId}</p>
            {timeRemaining && (
              <p className="text-sm text-[#579BE8] mt-2">
                ⏳ الوقت المتبقي: {formatTimeRemaining()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============= Return JSX =============
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8">
        {/* Header */}
        <div className="pt-4 sm:pt-6 md:pt-8 pb-4 sm:pb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4 sm:mb-6"
          >
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-[#579BE8] transition-all font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[#579BE8]/5 text-sm sm:text-base"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-180" />
              <span className="hidden sm:inline">العودة للرئيسية</span>
            </button>

            <button
              onClick={fetchOffers}
              disabled={refreshing}
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium shadow-sm"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">تحديث العروض</span>
              <span className="sm:hidden">تحديث</span>
            </button>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] text-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
                <div className="flex-1">
                  <div className="flex items-start gap-2 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-xl">
                      <Truck className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm opacity-90 font-medium mb-1">
                        اختيار السائق
                      </p>
                      <h1 className="text-lg sm:text-2xl md:text-3xl font-black mb-2">
                        السائقين المتاحين
                      </h1>

                      <div className="flex flex-wrap gap-2">
                        <div className="bg-white/20 backdrop-blur-lg px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/30">
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="font-medium text-xs sm:text-sm">
                              طلب #{orderId}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white/20 backdrop-blur-lg px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/30">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="font-medium text-xs sm:text-sm">
                              {stats.totalOffers} عرض
                            </span>
                          </div>
                        </div>
                       {loading ? (
  // حالة التحميل الأولي
  <div className="bg-white/20 backdrop-blur-lg px-2 sm:px-4 py-1.5 sm:py-0 flex flex-col justify-center rounded-lg sm:rounded-xl border border-white/30">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 sm:w-5 sm:h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      <span className="text-xs sm:text-sm font-medium text-white/90">
        جاري تحميل الوقت...
      </span>
    </div>
  </div>
) : refreshing ? (
  // حالة تحديث العروض
  <div className="bg-white/20 backdrop-blur-lg px-2 sm:px-4 py-1.5 sm:py-0 flex flex-col justify-center rounded-lg sm:rounded-xl border border-white/30">
    <div className="flex items-center gap-2">
      <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white/90" />
      <span className="text-xs sm:text-sm font-medium text-white/90">
        جاري تحديث العروض...
      </span>
    </div>
  </div>
) : !offers.length == 0 && (
  countdown.minutes === 0 && offers.length > 0 ? (
    <div className="bg-red-800/20 backdrop-blur-lg px-2 sm:px-4 py-1.5 sm:py-0 flex flex-col justify-center rounded-lg sm:rounded-xl border border-red-300">
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-300 rounded-full flex items-center justify-center">
          <X className="w-2 h-2 sm:w-3 sm:h-3 text-red-500" />
        </div>
        <span className="font-medium text-xs sm:text-sm text-[#ffa7a7]">
          انتهت صلاحية الطلب
        </span>
      </div>
    </div>
  ) : (
    <div className="bg-white/20 backdrop-blur-lg px-2 sm:px-4 py-1.5 sm:py-0 flex flex-col justify-center rounded-lg sm:rounded-xl border border-white/30">
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm font-medium">
            الوقت المتبقي:
          </span>
        </div>
        <div
          className={`text-sm sm:text-xl font-mono font-bold ${
            countdown.expired
              ? "text-red-300"
              : countdown.minutes <= 2
                ? "text-red-300 animate-pulse"
                : ""
          }`}
        >
          {countdown.expired
            ? "انتهت صلاحية الطلب"
            : formatCountdown()}
        </div>
      </div>
    </div>
  )
)}
                      </div>

                      {/* Countdown Timer Section */}
                      <div className="mt-4 pt-4 border-t border-white/20">
                        {/* إضافة تاريخ الانتهاء */}
                        {orderExpiryTime && !countdown.expired && (
                          <div className="mt-1 text-xs opacity-80 text-start">
                            ينتهي في:{" "}
                            {new Date(orderExpiryTime).toLocaleString("ar-SA", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white/15 backdrop-blur-lg rounded-lg sm:rounded-xl p-3 sm:p-5 border border-white/20 mt-4 lg:mt-0"
                >
                  <p className="text-xs sm:text-sm opacity-90 font-medium mb-3 text-center">
                    إحصائيات العروض
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold">
                        {stats.totalOffers}
                      </div>
                      <div className="text-[10px] sm:text-xs opacity-90">
                        عدد العروض
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold">
                        {stats.averagePrice}
                      </div>
                      <div className="text-[10px] sm:text-xs opacity-90">
                        متوسط السعر
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Order Expired Warning */}
          {isOrderExpired && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 sm:mt-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-red-800 font-bold text-base sm:text-lg mb-1">
                    انتهت صلاحية الطلب
                  </h3>
                  <p className="text-red-600 text-xs sm:text-sm">
                    عذراً، انتهت صلاحية هذا الطلب ولم يعد من الممكن قبول العروض.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 pb-12 sm:pb-20">
          {/* Offers List */}
          <motion.div
            initial="hidden"
            animate="visible"
            className="lg:col-span-8 order-2 lg:order-1"
          >
            <div className="mb-4 sm:mb-6 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                العروض المتاحة
                <span className="mr-2 bg-[#579BE8] text-white px-2 py-0.5 rounded-full text-sm">
                  {offers.length}
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
              {offers.map((offer, index) => {
                const offerStatus = offer.status;
                const orderPaymentStatus = offer.order?.payment_status;
                const isPaymentPending =
                  offerStatus === "payment_pending" ||
                  orderPaymentStatus === "processing" ||
                  orderPaymentStatus === "pending";

                const isAccepted =
                  acceptedOfferId === offer.id && !isPaymentPending;
                const isPendingPayment = pendingPaymentOfferId === offer.id;
                const isExpired =
                  expiredOfferIds.includes(offer.id) ||
                  offerStatus === "expired";
                const isSelectedForPayment =
                  selectedForPaymentOfferId === offer.id &&
                  !isAccepted &&
                  !isPendingPayment &&
                  !isExpired;
                const isPaid = paidOfferIds.has(offer.id);

                // ✅ حالات الطلب العامة
                const isOrderDelivered =
                  orderStatus?.status_name === "delivered" ||
                  offersData?.order_status === "delivered";
                const isOrderCancelled =
                  orderStatus?.status_name === "cancelled" ||
                  offersData?.order_status === "cancelled";
                const isOrderInRoad =
                  orderStatus?.status_name === "in-road" ||
                  offersData?.order_status === "in-road";

                // ✅ حالة العرض إذا كان مرفوضاً
                const isOfferRejected = offer.status === "rejected";

                // Check if this is a new offer (created in last 10 seconds)
                const isNewOffer =
                  new Date(offer.created_at) > new Date(Date.now() - 10000);

                return (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    {isNewOffer && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                          جديد
                        </div>
                      </div>
                    )}

                    <DriverCard
                      {...formatDriverData(offer)}
                      onAcceptOrder={() =>
                        handleDriverSelect(
                          offer.driver_id,
                          offer.id,
                          formatDriverData(offer),
                          offer,
                        )
                      }
                      onViewProfile={() =>
                        router.push(
                          `/orders/driver_profile?driverId=${offer.driver_id}`,
                        )
                      }
                      isPending={
                        !isAccepted &&
                        !isPendingPayment &&
                        !isExpired &&
                        !isSelectedForPayment &&
                        !isPaid &&
                        !isOrderDelivered &&
                        !isOrderCancelled &&
                        !isOrderInRoad &&
                        !isOfferRejected &&
                        !isOrderExpired
                      }
                      isSelectedForPayment={isSelectedForPayment}
                      isAccepted={isAccepted}
                      isPendingPayment={isPendingPayment}
                      isExpired={isExpired}
                      isPaid={isPaid}
                      isDelivered={isOrderDelivered}
                      isCancelled={isOrderCancelled || isOfferRejected}
                      isRejected={isOfferRejected}
                      isInRoad={isOrderInRoad}
                      isOrderExpired={isOrderExpired}
                      index={index}
                    />
                  </motion.div>
                );
              })}
            </div>

            {offers.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Truck className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  لا توجد عروض حالياً
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  لم يتقدم أي سائق لعرض سعر على طلبك بعد. سيتم إشعارك فور وصول
                  أي عرض جديد.
                </p>
                <button
                  onClick={fetchOffers}
                  disabled={refreshing}
                  className="bg-[#579BE8] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#4a8dd8] transition inline-flex items-center gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  {refreshing ? "جاري التحديث..." : "تحديث العروض"}
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Map Section */}
          <div className="lg:col-span-4 order-1 lg:order-2">
            <div className="sticky top-4 sm:top-8">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden h-[400px] sm:h-[500px] lg:h-[600px]">
                <div className="p-3 sm:p-4 border-b flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                    خريطة السائقين
                  </h3>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setMapKey((prev) => prev + 1)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition"
                      title="تحديث الخريطة"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">تحديث</span>
                    </button>

                    {currentLocation && (
                      <button
                        onClick={() => {
                          setLocationLoading(true);
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              const newLocation = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                              };
                              setCurrentLocation(newLocation);
                              localStorage.setItem(
                                "userLocation",
                                JSON.stringify(newLocation),
                              );
                              setMapKey((prev) => prev + 1);
                              setLocationLoading(false);
                            },
                            (error) => {
                              console.warn("Error refreshing location:", error);
                              setLocationLoading(false);
                              toast.error("تعذر تحديث الموقع");
                            },
                            {
                              enableHighAccuracy: true,
                              timeout: 10000,
                            },
                          );
                        }}
                        disabled={locationLoading}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#579BE8] text-white text-xs rounded-lg hover:bg-[#4a8dd8] transition disabled:opacity-50"
                        title="تحديث موقعي"
                      >
                        <Navigation
                          className={`w-3.5 h-3.5 ${locationLoading ? "animate-pulse" : ""}`}
                        />
                        <span className="hidden sm:inline">موقعي</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="h-[calc(100%-60px)]">
                  {currentLocation ? (
                    <DriversMap
                      key={mapKey}
                      drivers={memoizedDrivers}
                      center={currentLocation}
                      shouldUpdate={true}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-100 p-4">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-4">
                          جاري تحميل الخريطة...
                        </p>
                        <button
                          onClick={() => {
                            // طلب تحديد الموقع
                          }}
                          className="px-4 py-2 bg-[#579BE8] text-white text-sm rounded-lg hover:bg-[#4a8dd8] transition"
                        >
                          تحديد موقعي
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmPayment}
        selectedDriverId={selectedDriverId}
        selectedOfferId={selectedOfferId}
        orderId={orderId}
        offerAmount={selectedOffer?.price}
        setPendingPaymentOfferId={setPendingPaymentOfferId}
        onOfferExpired={() => {}}
        onPaymentSuccess={() => {}}
        onPaymentFailure={() => {}}
        router={router}
      />
    </div>
  );
}
