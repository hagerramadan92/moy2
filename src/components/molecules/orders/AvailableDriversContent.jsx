'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDriverData } from './DriverCard';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import DriverCard from './DriverCard';
import PaymentModal from './PaymentModal';
import { API_BASE_URL, getAccessToken } from './utils/api';
import { getPaymentCallbackData, getPendingOfferData } from './utils/paymentHelpers';
import usePusher from '@/hooks/usePusher';

// Dynamically import map to avoid SSR
const DriversMap = dynamic(
  () => import('./DriversMap'),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center animate-pulse">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#579BE8] mx-auto mb-2"></div>
          <span className="text-gray-400 text-sm">جاري تحميل الخريطة...</span>
        </div>
      </div>
    ) 
  }
);

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
  const [paidOfferIds, setPaidOfferIds] = useState(new Set()); // ✅ حالة لتتبع العروض المدفوعة
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isOrderExpired, setIsOrderExpired] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  
  // ✅ إضافة حالة لتحديد الموقع
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  
  const [stats, setStats] = useState({
    totalOffers: 0,
    averagePrice: 0,
    fastestDelivery: 0,
    lowestPrice: 0
  });
  
  const [newOfferNotification, setNewOfferNotification] = useState(null);
  const [driverAcceptedNotification, setDriverAcceptedNotification] = useState(null);
  
  const mapInitializedRef = useRef(false);
  const isLocationInitializedRef = useRef(false); // ✅ إضافة ref لمنع التكرار
  const paymentProcessedRef = useRef(false); // ✅ إضافة ref لمنع معالجة الدفع أكثر من مرة
  
  // ✅ حالات جديدة للتمييز بين اختيار الدفع والقبول الفعلي
  const [selectedForPaymentOfferId, setSelectedForPaymentOfferId] = useState(null); // ✅ عرض تم اختياره للدفع
  const [processingPaymentOfferId, setProcessingPaymentOfferId] = useState(null); // ✅ عرض جاري معالجة الدفع

  const {
    isConnected: pusherConnected,
    connectionState: pusherState,
    subscribe,
    unsubscribeAll,
    addEventListener,
    removeEventListener
  } = usePusher({
    autoConnect: true,
    onConnected: () => {
      console.log('✅ Pusher connected in AvailableDrivers');
    },
    onDisconnected: () => {
      console.log('🔴 Pusher disconnected in AvailableDrivers');
    }
  });

  const orderId = searchParams.get('orderId');
  const paymentStatus = searchParams.get('payment');
  const paymentSuccessParam = searchParams.get('success');
  const paymentCancelParam = searchParams.get('cancel');
  const isExpiredParam = searchParams.get('expired');

  // Memoize drivers data for map
  const memoizedDrivers = useMemo(() => {
    if (!offersData?.offers) return [];
    return offersData.offers.map(formatDriverData);
  }, [offersData?.offers]);

  // ✅ دالة طلب إذن الموقع
  const requestLocationPermission = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم تحديد الموقع');
      setCurrentLocation({ lat: 24.7136, lng: 46.6753 }); // موقع افتراضي (الرياض)
      localStorage.setItem('userLocation', JSON.stringify({ lat: 24.7136, lng: 46.6753 }));
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(location);
        setLocationLoading(false);
        setLocationPermissionGranted(true);
        setShowLocationPrompt(false);
        
        // ✅ حفظ في localStorage
        localStorage.setItem('userLocation', JSON.stringify(location));
        localStorage.setItem('locationPermissionGranted', 'true');
        
        console.log('✅ Location obtained:', location);
      },
      (error) => {
        console.warn('Error getting location:', error);
        setLocationLoading(false);
        
        let errorMessage = 'فشل الحصول على الموقع';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'تم رفض الوصول إلى الموقع';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'معلومات الموقع غير متاحة';
            break;
          case error.TIMEOUT:
            errorMessage = 'انتهت مهلة طلب الموقع';
            break;
        }
        
        setLocationError(errorMessage);
        const defaultLocation = { lat: 24.7136, lng: 46.6753 };
        setCurrentLocation(defaultLocation);
        localStorage.setItem('userLocation', JSON.stringify(defaultLocation));
        setShowLocationPrompt(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  // ✅ التحقق من إذن الموقع عند التحميل - بدون dependency على currentLocation
  useEffect(() => {
    // ✅ استخدام ref لمنع التكرار
    if (isLocationInitializedRef.current) return;
    
    const savedPermission = localStorage.getItem('locationPermissionGranted');
    const savedLocation = localStorage.getItem('userLocation');
    
    if (savedPermission === 'true' && savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        setCurrentLocation(location);
        setLocationPermissionGranted(true);
      } catch (error) {
        console.warn('Error parsing saved location:', error);
        // تأجيل عرض البرومبت باستخدام setTimeout مباشرة
        const timer = setTimeout(() => {
          setShowLocationPrompt(true);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    } else {
      // تأجيل عرض البرومبت
      const timer = setTimeout(() => {
        setShowLocationPrompt(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    isLocationInitializedRef.current = true;
  }, []); // ✅ إزالة currentLocation من الـ dependencies

  // Handle driver accepted order
  const handleDriverAcceptedOrder = useCallback((data) => {
    console.log('🚗 ===== DRIVER ACCEPTED ORDER EVENT RECEIVED =====', data);
    
    const acceptedOrderId = data.order_id || data.order?.id;
    const currentOrderId = orderId;
    const paymentStatus = data.order?.payment_status || data.payment_status;
    
    if (acceptedOrderId && acceptedOrderId.toString() === currentOrderId?.toString()) {
      console.log(`✅ Driver accepted our order ${currentOrderId}, payment_status: ${paymentStatus}`);
      
      // ✅ فقط إذا كان الدفع مكتملاً (paid) نضبط acceptedOfferId
      if (paymentStatus === 'paid') {
        setDriverAcceptedNotification({
          id: Date.now(),
          message: 'تم قبول طلبك من قبل سائق!',
          driverName: data.driver?.name || data.order?.driver?.name || 'سائق',
          price: data.price || data.order?.price || selectedOffer?.price,
          offerId: data.offer?.id || data.order?.accepted_offer_id,
          expiresIn: 10
        });
        
        if (data.offer?.id || data.order?.accepted_offer_id) {
          const offerId = data.offer?.id || data.order?.accepted_offer_id;
          setAcceptedOfferId(offerId);
          setPaidOfferIds(prev => new Set([...prev, offerId]));
          setPendingPaymentOfferId(null);
          setSelectedForPaymentOfferId(null);
          setPaymentSuccess(true);
          rejectOtherOffers(offerId);
        }
        
        setTimeout(() => {
          fetchOffers();
        }, 2000);
      } else {
        // ✅ إذا كان الدفع لم يكتمل بعد (processing/pending)
        console.log(`⚠️ Driver accepted order but payment not completed yet. Status: ${paymentStatus}`);
        // لا نضبط acceptedOfferId - نتركه null حتى يكتمل الدفع
        // يمكن إظهار إشعار بأن الدفع قيد المعالجة
        setDriverAcceptedNotification({
          id: Date.now(),
          message: 'تم قبول العرض - في انتظار إتمام الدفع',
          driverName: data.driver?.name || data.order?.driver?.name || 'سائق',
          price: data.price || data.order?.price || selectedOffer?.price,
          offerId: data.offer?.id || data.order?.accepted_offer_id,
          expiresIn: 10
        });
      }
    }
  }, [orderId, selectedOffer, router]);

  // ✅ معالج حدث TripStartedForUser (تم الدفع وبدأت الرحلة)
  const handleTripStartedForUser = useCallback((data) => {
    console.log('🚀 ===== TRIP STARTED FOR USER EVENT RECEIVED =====', data);
    
    const eventOrderId = data.order?.id || data.order_id;
    const currentOrderId = orderId;
    
    if (eventOrderId && eventOrderId.toString() === currentOrderId?.toString()) {
      console.log(`✅ Trip started for order ${currentOrderId}, payment_status: ${data.order?.payment_status}`);
      
      // إذا كان الدفع تم (paid)
      if (data.order?.payment_status === 'paid' || data.payment_status === 'paid') {
        // تحديث حالة الدفع للعرض المقبول
        if (data.order?.accepted_offer_id) {
          const paidOfferId = data.order.accepted_offer_id;
          setPaidOfferIds(prev => new Set([...prev, paidOfferId]));
          setAcceptedOfferId(paidOfferId);
          setPendingPaymentOfferId(null);
          setSelectedForPaymentOfferId(null);
          setPaymentSuccess(true);
          
          console.log(`💰 Payment confirmed for offer ${paidOfferId}`);
          
          // إظهار إشعار
          setDriverAcceptedNotification({
            id: Date.now(),
            message: data.message || 'تم الدفع والرحلة بدأت الآن',
            driverName: data.order?.driver?.name || 'سائق',
            price: data.order?.price,
            offerId: paidOfferId,
            expiresIn: 10
          });
          
          // تحديث العروض بعد ثانيتين
          setTimeout(() => {
            fetchOffers();
          }, 2000);
        }
      }
    }
  }, [orderId]);

  // Handle successful payment
  const handlePaymentSuccess = useCallback((data) => {
    console.log('💰 Payment success callback received:', data);
    
    // تحديث حالة الطلب بعد الدفع الناجح
    if (data.order?.id === orderId) {
      setAcceptedOfferId(data.order?.accepted_offer_id || selectedOfferId);
      setPendingPaymentOfferId(null);
      setSelectedForPaymentOfferId(null); // ✅ إعادة تعيين حالة اختيار الدفع
      setPaymentSuccess(true);
      
      // تنظيف البيانات
      localStorage.removeItem('pendingOfferData');
      sessionStorage.removeItem('paymentCallbackData');
      
      // إظهار إشعار النجاح
      setDriverAcceptedNotification({
        id: Date.now(),
        message: 'تم الدفع بنجاح! جاري تجهيز الرحلة...',
        driverName: data.driver?.name || 'السائق',
        expiresIn: 5
      });
      
      // إعادة تحميل العروض بعد ثانية
      setTimeout(() => {
        fetchOffers();
      }, 1000);
    }
  }, [orderId, selectedOfferId]);


  
  // Handle payment failure
  const handlePaymentFailure = useCallback((data) => {
    console.log('❌ Payment failure callback received:', data);
    
    // إظهار إشعار الفشل
    setError('فشلت عملية الدفع. يرجى المحاولة مرة أخرى.');
    
    // إعادة تعيين حالة الدفع
    setPendingPaymentOfferId(null);
    setSelectedForPaymentOfferId(null); // ✅ إعادة تعيين حالة اختيار الدفع
    paymentProcessedRef.current = false;
  }, []);

  // Handle offer expired
  const handleOfferExpired = useCallback((offerId) => {
    console.log('⏰ Offer expired:', offerId);
    
    setExpiredOfferIds(prev => [...prev, offerId]);
    setPendingPaymentOfferId(null);
    setSelectedForPaymentOfferId(null); // ✅ إعادة تعيين حالة اختيار الدفع
    paymentProcessedRef.current = false;
    
    // إظهار إشعار انتهاء العرض
    setError('انتهت صلاحية هذا العرض. يرجى اختيار عرض آخر.');
  }, []);

  // Setup Pusher listeners
  useEffect(() => {
    if (!orderId || !pusherConnected) return;
    
    console.log(`🎯 Setting up Pusher listeners for order ${orderId}`);
    
    removeEventListener('DriverAcceptedOrder');
    removeEventListener('offer.created');
    removeEventListener('TripStartedForUser');
    
    addEventListener('DriverAcceptedOrder', (data) => {
      handleDriverAcceptedOrder(data);
    });
    
    addEventListener('TripStartedForUser', (data) => {
      handleTripStartedForUser(data);
    });
    
    const channel = subscribe(`order.${orderId}`, {
      'offer.created': (data) => {
        const offerOrderId = data.order_id || data.order?.id || data.orderId;
        if (offerOrderId && offerOrderId.toString() === orderId.toString()) {
          setNewOfferNotification({
            id: Date.now(),
            message: 'تم إضافة عرض جديد',
            driverName: data.driver?.name || 'سائق جديد',
            price: data.price,
            expiresIn: 5
          });
          
          setTimeout(() => {
            fetchOffers();
          }, 2000);
        }
      },
      
      'DriverAcceptedOrder': (data) => {
        handleDriverAcceptedOrder(data);
      },
      
      // ✅ استماع على حدث TripStartedForUser لتحديث حالة الدفع
      'TripStartedForUser': (data) => {
        handleTripStartedForUser(data);
      }
    });
    
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.id) {
          subscribe(`user.${user.id}`, {
            'DriverAcceptedOrder': (data) => {
              handleDriverAcceptedOrder(data);
            }
          });
        }
      } catch (error) {
        console.warn('Could not parse user data:', error);
      }
    }
    
    return () => {
      removeEventListener('DriverAcceptedOrder');
      removeEventListener('offer.created');
      removeEventListener('TripStartedForUser');
      unsubscribeAll();
    };
  }, [orderId, pusherConnected, subscribe, unsubscribeAll, addEventListener, removeEventListener, handleDriverAcceptedOrder, handleTripStartedForUser]);

  // Calculate time remaining
  useEffect(() => {
    if (!orderStatus?.expires_in?.expires_at) return;

    const calculateTimeRemaining = () => {
      const expiresAt = new Date(orderStatus.expires_in.expires_at);
      const now = new Date();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setIsOrderExpired(true);
        setTimeRemaining(null);
        
        if (offersData?.offers && offersData.offers.length > 0) {
          const allOfferIds = offersData.offers.map(offer => offer.id);
          setExpiredOfferIds(prev => {
            return [...new Set([...prev, ...allOfferIds])];
          });
        }
        return;
      }

      setIsOrderExpired(false);
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        total: diff
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [orderStatus, offersData]);

  // Initial data fetch
  useEffect(() => {
    if (orderId) {
      const expiredFlag = localStorage.getItem(`order_${orderId}_expired`);
      if (expiredFlag === 'true' || isExpiredParam === 'true') {
        setIsOrderExpired(true);
        localStorage.removeItem(`order_${orderId}_expired`);
      }
      
      fetchOffers();
      fetchOrderStatus();
    } else {
      router.back();
    }
  }, [orderId, isExpiredParam]);

  // Payment status check
  useEffect(() => {
    // منع المعالجة المتكررة
    if (paymentProcessedRef.current) return;
    
    if (paymentStatus === 'cancel' || paymentCancelParam === 'true') {
      setPendingPaymentOfferId(null);
      setSelectedForPaymentOfferId(null); // ✅ إعادة تعيين حالة اختيار الدفع
      setPaymentSuccess(false);
      localStorage.removeItem('pendingOfferData');
      paymentProcessedRef.current = true;
    }
    
    if (paymentStatus === 'success' || paymentSuccessParam === 'true') {
      setPaymentSuccess(true);
      const callbackData = getPaymentCallbackData();
      if (callbackData && callbackData.offerId) {
        const acceptedId = callbackData.offerId;
        setAcceptedOfferId(acceptedId);
        setPendingPaymentOfferId(null);
        setSelectedForPaymentOfferId(null); // ✅ إعادة تعيين حالة اختيار الدفع
        localStorage.removeItem('pendingOfferData');
        rejectOtherOffers(acceptedId);
        paymentProcessedRef.current = true;
      }
    }
    
    const callbackData = getPaymentCallbackData();
    if (callbackData && callbackData.offerId && !paymentCancelParam && !paymentProcessedRef.current) {
      const acceptedId = callbackData.offerId;
      setAcceptedOfferId(acceptedId);
      setPendingPaymentOfferId(null);
      setSelectedForPaymentOfferId(null); // ✅ إعادة تعيين حالة اختيار الدفع
      setPaymentSuccess(true);
      rejectOtherOffers(acceptedId);
      paymentProcessedRef.current = true;
    }
    
    if (!paymentCancelParam && paymentStatus !== 'cancel' && !paymentProcessedRef.current) {
      const pendingOfferData = getPendingOfferData();
      if (pendingOfferData && pendingOfferData.orderId === orderId) {
        setPendingPaymentOfferId(pendingOfferData.offerId);
        setSelectedForPaymentOfferId(pendingOfferData.offerId); // ✅ تعيين كـ "محدد للدفع"
        setSelectedDriverId(pendingOfferData.driverId);
        setSelectedOfferId(pendingOfferData.offerId);
      }
    }

    // إعادة تعيين ref بعد 5 ثواني للسماح بمحاولة جديدة
    return () => {
      setTimeout(() => {
        paymentProcessedRef.current = false;
      }, 5000);
    };
  }, [orderId, paymentStatus, paymentSuccessParam, paymentCancelParam]);

  const fetchOffers = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      
      const accessToken = getAccessToken();
      
      if (!accessToken) {
        setError('يجب تسجيل الدخول للوصول إلى هذه الصفحة');
        router.push('/login');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/offers`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        cache: 'no-store'
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
        
        const offersDataToSet = {
          ...data.data,
          offers: data.data.offers || [],
          total_offers: data.data.total_offers || (data.data.offers?.length || 0),
          active_offers: data.data.active_offers || (data.data.offers?.length || 0)
        };
        
        setOffersData(offersDataToSet);
        setError(null);
        
        // ✅ إعادة تعيين acceptedOfferId في البداية (سيتم ضبطه فقط إذا كان الدفع مكتملاً)
        setAcceptedOfferId(null);
        
        // ✅ التحقق من حالة الدفع من API - فقط إذا كان accepted_offer موجود و payment_status === 'paid'
        if (data.data.accepted_offer) {
          const acceptedId = data.data.accepted_offer.id || data.data.accepted_offer;
          const orderPaymentStatus = data.data.order?.payment_status;
          const offerPaymentStatus = data.data.accepted_offer?.payment_status;
          
          // ✅ فقط إذا كان الدفع مكتملاً (paid) نضبط acceptedOfferId
          if (orderPaymentStatus === 'paid' || offerPaymentStatus === 'paid') {
            setAcceptedOfferId(acceptedId);
            setPendingPaymentOfferId(null);
            setSelectedForPaymentOfferId(null);
            setPaidOfferIds(prev => new Set([...prev, acceptedId]));
            setPaymentSuccess(true);
            localStorage.removeItem('pendingOfferData');
            console.log(`💰 Payment confirmed from API for offer ${acceptedId}`);
            
            setTimeout(() => {
              rejectOtherOffers(acceptedId);
            }, 500);
          } else {
            // ✅ إذا كان accepted_offer موجود لكن الدفع لم يكتمل بعد (processing/pending)
            console.log(`⚠️ Accepted offer ${acceptedId} exists but payment not completed yet. Status: ${orderPaymentStatus || offerPaymentStatus}`);
            // لا نضبط acceptedOfferId - نتركه null حتى يكتمل الدفع
            setAcceptedOfferId(null);
          }
        } else {
          // ✅ لا يوجد accepted_offer - إعادة تعيين الحالة
          setAcceptedOfferId(null);
        }
        
        // ✅ التحقق من حالة الدفع في كل عرض من العروض
        if (data.data.offers && Array.isArray(data.data.offers)) {
          const paidIds = new Set();
          data.data.offers.forEach(offer => {
            // ✅ فقط إذا كان العرض مقبولاً ومدفوعاً بالكامل
            const offerOrderPaymentStatus = offer.order?.payment_status;
            const offerStatus = offer.status;
            
            // التحقق من أن الدفع مكتمل (paid) وليس في انتظار (payment_pending/processing)
            if (offerOrderPaymentStatus === 'paid' && offerStatus !== 'payment_pending') {
              paidIds.add(offer.id);
            }
          });
          if (paidIds.size > 0) {
            setPaidOfferIds(prev => new Set([...prev, ...paidIds]));
            setPaymentSuccess(true);
          }
        }
        
        setLoading(false);
        setRefreshing(false);
        
        if (data.data.offers && data.data.offers.length > 0) {
          calculateStats(data.data.offers);
        }
        
      } else {
        if (data.error_code === 'UNAUTHENTICATED' || data.message?.includes('تسجيل الدخول')) {
          setError('انتهت جلسة الدخول. يرجى تسجيل الدخول مرة أخرى.');
          localStorage.removeItem('accessToken');
        }
        setLoading(false);
      }
    } catch (err) {
      console.warn('API Error:', err.message);
      
      if (err.message?.includes('404')) {
        setIsNotFound(true);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      setError(`حدث خطأ في جلب البيانات: ${err.message}`);
      setLoading(false);
      setOffersData(null);
    } finally {
      setRefreshing(false);
    }
  };

  const calculateStats = (offers) => {
    if (!offers || offers.length === 0) return;

    const prices = offers.map(o => parseFloat(o.price));
    const times = offers.map(o => o.delivery_duration_minutes);

    setStats({
      totalOffers: offers.length,
      averagePrice: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2),
      fastestDelivery: Math.min(...times),
      lowestPrice: Math.min(...prices).toFixed(2)
    });
  };

  const fetchOrderStatus = async () => {
    if (!orderId) return;

    try {
      const accessToken = getAccessToken();
      if (!accessToken) return;

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        cache: 'no-store'
      });

      const data = await response.json();

      if (response.ok && data.status && data.data) {
        setOrderStatus(data.data);

        if (data.data.remaining_offers === 0 && data.data.expires_in?.minutes < 0) {
          setExpiredOfferIds(prev => {
            const currentOffers = offersData?.offers || [];
            if (currentOffers.length > 0) {
              const allOfferIds = currentOffers.map(offer => offer.id);
              return [...new Set([...prev, ...allOfferIds])];
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.warn('Error fetching order status:', err.message);
    }
  };

  const rejectOtherOffers = useCallback(async (acceptedOfferId) => {
    if (!orderId || !acceptedOfferId) return;

    try {
      const currentOffers = offersData?.offers || [];
      if (currentOffers.length === 0) return;

      const otherOfferIds = currentOffers
        .filter(offer => offer.id !== acceptedOfferId)
        .map(offer => offer.id);

      if (otherOfferIds.length === 0) return;

      setExpiredOfferIds(prev => [...new Set([...prev, ...otherOfferIds])]);

      setTimeout(() => {
        fetchOffers();
      }, 1000);
    } catch (err) {
      console.warn('Error rejecting other offers:', err.message);
    }
  }, [orderId, offersData?.offers]);

  const handleDriverSelect = (driverId, offerId, driverData, offer) => {
    setSelectedDriverId(driverId);
    setSelectedOfferId(offerId);
    setSelectedOffer(offer);
    setSelectedForPaymentOfferId(offerId); // ✅ تعيين كـ "محدد للدفع"
    setIsModalOpen(true);
    sessionStorage.setItem('selectedDriver', JSON.stringify(driverData));
    // إعادة تعيين ref عند اختيار سائق جديد
    paymentProcessedRef.current = false;
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPendingPaymentOfferId(null);
    setSelectedForPaymentOfferId(null); // ✅ إعادة تعيين حالة اختيار الدفع
    localStorage.removeItem('pendingOfferData');
    // إعادة تعيين ref عند إغلاق المودال
    paymentProcessedRef.current = false;
  };

  const handleConfirmPayment = async (methodId, driverId, paymentData = null) => {
    try {
      const params = new URLSearchParams({
        driver: driverId,
        offer: selectedOfferId,
        gateway: methodId
      });
      
      if (paymentData?.payment_url) {
        params.append('payment_url', paymentData.payment_url);
      }
      
      router.push(`/orders/${orderId}/confirmation?${params.toString()}`);
    } catch (err) {
      console.error('Error in payment confirmation:', err);
      alert('حدث خطأ في تأكيد الطلب. يرجى المحاولة مرة أخرى.');
    }
  };

  const formatTimeRemaining = () => {
    if (!timeRemaining) return 'جاري الحساب...';
    
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

  // ✅ دالة لتخطي تحديد الموقع
  const skipLocation = useCallback(() => {
    const defaultLocation = { lat: 24.7136, lng: 46.6753 };
    setCurrentLocation(defaultLocation);
    localStorage.setItem('userLocation', JSON.stringify(defaultLocation));
    setShowLocationPrompt(false);
  }, []);

  if (error && error.includes('تسجيل الدخول')) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">يجب تسجيل الدخول</h2>
              
              <p className="text-gray-600 mb-6">{error}</p>
              
              <div className="space-y-4">
                <button
                  onClick={() => router.push(`/login?return=/available-drivers?orderId=${orderId}`)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition"
                >
                  <LogIn className="w-5 h-5" />
                  تسجيل الدخول
                </button>
                
                <button
                  onClick={() => router.push('/')}
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
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">الطلب غير موجود</h2>
              
              <p className="text-gray-600 mb-6">
                عذراً، لم يتم العثور على الطلب المطلوب.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={onBack}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition"
                >
                  <ChevronLeft className="w-5 h-5 rotate-180" />
                  العودة
                </button>
                
                <button
                  onClick={() => router.push('/')}
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

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-[#579BE8]"></div>
              <Truck className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#579BE8]" />
            </div>
            <p className="mt-6 text-gray-600 font-medium text-lg">جاري البحث عن سائقين...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8">

        {/* ✅ برومبت تحديد الموقع */}
        <AnimatePresence>
          {showLocationPrompt && !currentLocation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-10 h-10 text-[#579BE8]" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    تحديد موقعك الحالي
                  </h3>
                  
                  <p className="text-gray-600 mb-6">
                    هل تريد تحديد موقعك الحالي على الخريطة لعرض مواقع السائقين بدقة؟
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={requestLocationPermission}
                      disabled={locationLoading}
                      className="bg-gradient-to-r from-[#579BE8] to-[#4a8dd8] text-white py-3 rounded-xl font-bold hover:from-[#4a8dd8] hover:to-[#3b7bc8] transition disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {locationLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          جاري التحديد...
                        </>
                      ) : (
                        <>
                          <Navigation className="w-4 h-4" />
                          نعم، حدد موقعي
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={skipLocation}
                      className="border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                    >
                      تخطي الآن
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-700 mt-4">
                    يمكنك تغيير هذا الإعداد لاحقاً من إعدادات التطبيق
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* إشعار قبول السائق */}
        <AnimatePresence>
          {driverAcceptedNotification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 left-4 right-4 z-40 md:left-auto md:right-4 md:w-96"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-2xl p-4 border border-green-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">
                        {driverAcceptedNotification.message.includes('تم الدفع') ? '✅ تم الدفع' : 'تم قبول طلبك!'}
                      </h4>
                      <p className="text-xs opacity-90 mt-1">
                        {driverAcceptedNotification.message}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDriverAcceptedNotification(null)}
                    className="text-white/80 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-4 sm:pt-6 md:pt-8 pb-4 sm:pb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4 sm:mb-6 gap-2"
          >
            <button 
              onClick={onBack}
              className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-[#579BE8] transition-all font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[#579BE8]/5 text-sm sm:text-base"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-180" />
              <span className="hidden sm:inline">العودة</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={fetchOffers}
                disabled={refreshing}
                className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">تحديث العروض</span>
                <span className="sm:hidden">تحديث</span>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] text-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
                <div className="flex-1">
                  <div className="flex items-start gap-2 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-xl flex-shrink-0">
                      <Truck className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm opacity-90 font-medium mb-1 sm:mb-2">اختيار السائق</p>
                      <h1 className="text-lg sm:text-2xl md:text-3xl font-black mb-2 sm:mb-4">السائقين المتاحين</h1>
                      
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        <div className="bg-white/20 backdrop-blur-lg px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/30">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="font-medium text-xs sm:text-sm">طلب #<span className="font-bold">{orderId}</span></span>
                          </div>
                        </div>
                        
                        <div className="bg-white/20 backdrop-blur-lg px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/30">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="font-medium text-xs sm:text-sm">{offersData?.total_offers || 0} عرض</span>
                          </div>
                        </div>
                        
                        <div className="bg-white/20 backdrop-blur-lg px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/30">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="font-medium text-xs sm:text-sm">
                              {isOrderExpired ? 'انتهت الصلاحية' : timeRemaining ? `متبقي: ${formatTimeRemaining()}` : 'جاري الحساب...'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white/15 backdrop-blur-lg rounded-lg sm:rounded-xl p-3 sm:p-5 border border-white/20 mt-4 lg:mt-0"
                >
                  <p className="text-xs sm:text-sm opacity-90 font-medium mb-3 sm:mb-4 text-center">إحصائيات العروض</p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold">{stats.totalOffers}</div>
                      <div className="text-[10px] sm:text-xs opacity-90">عدد العروض</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-2xl font-bold">{stats.averagePrice}</div>
                      <div className="text-[10px] sm:text-xs opacity-90">متوسط السعر</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {isOrderExpired && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 sm:mt-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-red-800 font-bold text-base sm:text-lg mb-1 sm:mb-2">
                    انتهت صلاحية الطلب
                  </h3>
                  <p className="text-red-600 text-xs sm:text-sm mb-2 sm:mb-3">
                    عذراً، انتهت صلاحية هذا الطلب ولم يعد من الممكن قبول العروض.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 pb-12 sm:pb-20">
          <motion.div
            initial="hidden"
            animate="visible"
            className="lg:col-span-8 order-2 lg:order-1"
          >
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                العروض المتاحة ({offersData?.total_offers || 0})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
              {offersData?.offers?.map((offer, index) => {
                // ✅ التحقق من حالة العرض - إذا كان status === 'payment_pending' فلا نعتبره مقبولاً حتى يكتمل الدفع
                const offerStatus = offer.status;
                const orderPaymentStatus = offer.order?.payment_status;
                const isPaymentPending = offerStatus === 'payment_pending' || orderPaymentStatus === 'processing' || orderPaymentStatus === 'pending';
                
                const isAccepted = acceptedOfferId === offer.id && !isPaymentPending; // ✅ فقط إذا كان مقبولاً ومدفوعاً
                const isPendingPayment = pendingPaymentOfferId === offer.id;
                const isExpired = expiredOfferIds.includes(offer.id);
                const isSelectedForPayment = selectedForPaymentOfferId === offer.id && !isAccepted && !isPendingPayment && !isExpired; // ✅ حالة جديدة
                const isPaid = paidOfferIds.has(offer.id); // ✅ حالة الدفع من Pusher أو API
                
                return (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <DriverCard
                      {...formatDriverData(offer)}
                      onAcceptOrder={() => handleDriverSelect(
                        offer.driver_id, 
                        offer.id, 
                        formatDriverData(offer),
                        offer
                      )}
                      onViewProfile={() => {
                        const driverData = formatDriverData(offer);
                        router.push(`/orders/driver_profile?driverId=${offer.driver_id}`);
                      }}
                      isPending={!isAccepted && !isPendingPayment && !isExpired && !isSelectedForPayment && !isPaid} 
                      isSelectedForPayment={isSelectedForPayment} 
                      isAccepted={isAccepted}
                      isPendingPayment={isPendingPayment}
                      isExpired={isExpired}
                      isPaid={isPaid} // ✅ تمرير حالة الدفع للبطاقة
                      index={index}
                    />
                  </motion.div>
                );
              })}
            </div>

            {(!offersData || offersData.offers.length === 0) && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Truck className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد عروض حالياً</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  لم يتقدم أي سائق لعرض سعر على طلبك بعد.
                </p>
                <button
                  onClick={fetchOffers}
                  className="bg-[#579BE8] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#4a8dd8] transition inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  تحديث العروض
                </button>
              </motion.div>
            )}
          </motion.div>

          <div className="lg:col-span-4 order-1 lg:order-2">
            <div className="sticky top-4 sm:top-8">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden h-[400px] sm:h-[500px] lg:h-[600px]">
                <div className="p-3 sm:p-4 border-b flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">خريطة السائقين</h3>
                  
                  {/* زر تحديث الموقع */}
                  {currentLocation && (
                    <button
                      onClick={requestLocationPermission}
                      disabled={locationLoading}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#579BE8] text-white text-xs rounded-lg hover:bg-[#4a8dd8] transition"
                      title="تحديث موقعي"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">موقعي</span>
                    </button>
                  )}
                </div>
                
                <div className="h-[calc(100%-60px)]">
                  {currentLocation ? (
                    <DriversMap
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
                          onClick={requestLocationPermission}
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

      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmPayment}
        selectedDriverId={selectedDriverId}
        selectedOfferId={selectedOfferId}
        orderId={orderId}
        offerAmount={selectedOffer?.price}
        setPendingPaymentOfferId={setPendingPaymentOfferId}
        onOfferExpired={handleOfferExpired}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
        router={router}
      />
    </div>
  );
}