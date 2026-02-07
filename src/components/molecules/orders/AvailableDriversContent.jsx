'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  Star, 
  ChevronLeft, 
  Truck, 
  Users, 
  AlertCircle, 
  RefreshCw,
  LogIn,
  X,
  MapPin,
} from 'lucide-react';
import DriverCard from './DriverCard';
import PaymentModal from './PaymentModal';
import { API_BASE_URL, getAccessToken } from './utils/api';
import { getPaymentCallbackData, getPendingOfferData } from './utils/paymentHelpers';
import usePusher from '@/hooks/usePusher'; // ✅ إضافة استيراد Pusher

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

// المكون الداخلي الذي يستخدم useSearchParams
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isOrderExpired, setIsOrderExpired] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationPermissionRequested, setLocationPermissionRequested] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showLocationPermissionPopup, setShowLocationPermissionPopup] = useState(false);
  const [stats, setStats] = useState({
    totalOffers: 0,
    averagePrice: 0,
    fastestDelivery: 0,
    lowestPrice: 0
  });
  
  // ✅ إضافة حالة جديدة للعروض الجديدة عبر Pusher
  const [newOfferNotification, setNewOfferNotification] = useState(null);
  const [offerUpdates, setOfferUpdates] = useState([]);
  
  // Ref to track if map has been initialized to prevent unnecessary reloads
  const mapInitializedRef = useRef(false);
  
  // ✅ استخدام usePusher للاتصال بالبث المباشر
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

  // Format driver data function - memoized to prevent recreation
  const formatDriverData = useCallback((offer) => {
    // Extract location from currect_location (note: API has typo "currect" instead of "current")
    const location = offer.driver?.currect_location;
    const lat = location?.lat ? parseFloat(location.lat) : null;
    const lng = location?.lng ? parseFloat(location.lng) : null;
    
    // Get driver name from user object or driver object
    const driverName = offer.driver?.user?.name || offer.driver?.name || `السائق ${offer.driver_id}`;
    const driverPhone = offer.driver?.user?.phone || offer.driver?.phone || '+966500000000';
    const driverUserId = offer.driver?.user?.id || offer.driver_id;
    const driverAvatar = offer.driver?.user?.avatar || offer.driver?.personal_photo || '/images/driver.png';
    
    return {
      id: offer.id,
      driverId: offer.driver_id,
      driverUserId: driverUserId, // User ID for profile navigation
      name: driverName,
      deliveryTime: `${offer.delivery_duration_minutes} د`,
      price: `${offer.price} `,
      rating: offer.driver?.rating || "4.5",
      successfulOrders: `(${offer.driver?.completed_orders || '1,439'}) طلب ناجح`,
      ordersCount: offer.driver?.total_orders || "238",
      status: offer.status,
      offerId: offer.id,
      createdAt: offer.created_at,
      vehicleType: offer.driver?.vehicle_size || offer.driver?.vehicle_type || 'سيارة صغيرة',
      phone: driverPhone,
      avatar: driverAvatar,
      // Location data for map
      lat: lat,
      lng: lng,
      // Store full location object for reference
      location: location
    };
  }, []);

  // Memoize drivers data for map to prevent unnecessary re-renders
  const memoizedDrivers = useMemo(() => {
    if (!offersData?.offers) return [];
    return offersData.offers.map(formatDriverData);
  }, [offersData?.offers, formatDriverData]);

  // Memoize shouldUpdate to prevent map reloads
  const mapShouldUpdate = useMemo(() => {
    // تثبيت shouldUpdate بعد التحميل الأول لمنع إعادة تحميل الخريطة
    const isReady = !loading && !refreshing && offersData;
    if (isReady && !mapInitializedRef.current) {
      mapInitializedRef.current = true;
    }
    // بعد التهيئة الأولى، نرجع true دائماً لتحديث البيانات فقط بدون إعادة تحميل الخريطة
    return mapInitializedRef.current ? true : isReady;
  }, [loading, refreshing, offersData]);

  // Get orderId from URL
  const orderId = searchParams.get('orderId');
  const paymentStatus = searchParams.get('payment');
  const paymentSuccessParam = searchParams.get('success');
  const paymentCancelParam = searchParams.get('cancel');
  const isExpiredParam = searchParams.get('expired');

  // ✅ إعداد Pusher للاستماع للعروض الجديدة
  useEffect(() => {
    if (!orderId || !pusherConnected) return;
    
    console.log(`🎯 Setting up Pusher listener for order ${orderId} in AvailableDrivers`);
    
    // الاشتراك في قناة الطلب
    const channel = subscribe(`order.${orderId}`, {
      'offer.created': (data) => {
        console.log('🎯 New offer received via Pusher in AvailableDrivers:', data);
        
        // التحقق من أن العرض لهذا الطلب
        const offerOrderId = data.order_id || data.order?.id || data.orderId;
        if (offerOrderId && offerOrderId.toString() === orderId.toString()) {
          // إظهار إشعار بالعرض الجديد
          setNewOfferNotification({
            id: Date.now(),
            message: 'تم إضافة عرض جديد',
            driverName: data.driver?.name || 'سائق جديد',
            price: data.price,
            expiresIn: 5 // ثواني
          });
          
          // تحديث قائمة العروض تلقائياً بعد 2 ثانية
          setTimeout(() => {
            console.log('🔄 Auto-refreshing offers due to new offer');
            fetchOffers();
          }, 2000);
          
          // إضافة إلى سجل التحديثات
          setOfferUpdates(prev => [...prev, {
            id: data.offer_id || Date.now(),
            timestamp: new Date().toLocaleTimeString('ar-SA'),
            message: `عرض جديد من ${data.driver?.name || 'سائق'} بقيمة ${data.price}`,
            data: data
          }]);
        }
      },
      
      'order.status.updated': (data) => {
        console.log('📊 Order status updated in AvailableDrivers:', data);
        
        if (data.order_id && data.order_id.toString() === orderId.toString()) {
          if (data.status === 'expired') {
            setIsOrderExpired(true);
            setNewOfferNotification({
              id: Date.now(),
              message: 'انتهت صلاحية الطلب',
              type: 'warning'
            });
          }
        }
      },
      
      'order.expired': (data) => {
        console.log('⏰ Order expired via Pusher in AvailableDrivers:', data);
        if (data.order_id && data.order_id.toString() === orderId.toString()) {
          setIsOrderExpired(true);
        }
      }
    });
    
    // تنظيف عند إلغاء المكون
    return () => {
      if (channel) {
        unsubscribeAll();
      }
    };
  }, [orderId, pusherConnected, subscribe, unsubscribeAll]);

  // Check for payment success and pending offers on component mount
  useEffect(() => {
    // Check URL params for payment cancellation
    if (paymentStatus === 'cancel' || paymentCancelParam === 'true') {
      // Clear pending payment state
      setPendingPaymentOfferId(null);
      setPaymentSuccess(false);
      // Clear pending payment data
      localStorage.removeItem('pendingOfferData');
      sessionStorage.removeItem('paymentCallbackData');
      
      // Clean up URL params
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('payment');
        url.searchParams.delete('cancel');
        window.history.replaceState({}, '', url);
      }
    }
    
    // Check URL params for payment success
    if (paymentStatus === 'success' || paymentSuccessParam === 'true') {
      setPaymentSuccess(true);
      
      // Get payment callback data from sessionStorage
      const callbackData = getPaymentCallbackData();
      if (callbackData && callbackData.offerId) {
        const acceptedId = callbackData.offerId;
        setAcceptedOfferId(acceptedId);
        setPendingPaymentOfferId(null);
        // Clear pending payment data
        localStorage.removeItem('pendingOfferData');
        
        // Reject other offers when an offer is accepted
        rejectOtherOffers(acceptedId);
      }
      
      // Clean up URL params
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('payment');
        url.searchParams.delete('success');
        window.history.replaceState({}, '', url);
      }
    }
    
    // Check sessionStorage for payment callback data (for returning from payment)
    const callbackData = getPaymentCallbackData();
    if (callbackData && callbackData.offerId && !paymentCancelParam) {
      const acceptedId = callbackData.offerId;
      setAcceptedOfferId(acceptedId);
      setPendingPaymentOfferId(null);
      setPaymentSuccess(true);
      
      // Reject other offers when an offer is accepted
      rejectOtherOffers(acceptedId);
    }
    
    // Check localStorage for pending payment offers (only if not cancelled)
    if (!paymentCancelParam && paymentStatus !== 'cancel') {
      const pendingOfferData = getPendingOfferData();
      if (pendingOfferData && pendingOfferData.orderId === orderId) {
        setPendingPaymentOfferId(pendingOfferData.offerId);
        setSelectedDriverId(pendingOfferData.driverId);
        setSelectedOfferId(pendingOfferData.offerId);
      }
    }
    
    // Listen for page visibility changes (when user returns from payment window)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if payment was cancelled by checking if we still have pending data
        // but no payment callback data (meaning payment was cancelled/closed)
        const pendingData = getPendingOfferData();
        const callbackData = getPaymentCallbackData();
        
        // If there's pending data but no callback data, and we're back on the page
        // it likely means the payment window was closed
        if (pendingData && !callbackData) {
          // Wait a bit to see if payment callback happens
          setTimeout(() => {
            const stillPending = getPendingOfferData();
            const stillNoCallback = !getPaymentCallbackData();
            
            // If still pending and no callback after 2 seconds, clear pending state
            if (stillPending && stillNoCallback) {
              setPendingPaymentOfferId(null);
              localStorage.removeItem('pendingOfferData');
            }
          }, 2000);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [orderId, paymentStatus, paymentSuccessParam, paymentCancelParam]);

  useEffect(() => {
    if (orderId) {
      // التحقق من حالة انتهاء الطلب من localStorage
      const expiredFlag = localStorage.getItem(`order_${orderId}_expired`);
      if (expiredFlag === 'true' || isExpiredParam === 'true') {
        setIsOrderExpired(true);
        // إزالة العلامة من localStorage بعد استخدامها
        localStorage.removeItem(`order_${orderId}_expired`);
      }
      
      fetchOffers();
      fetchOrderStatus();
    } else {
      router.back();
    }
  }, [orderId, isExpiredParam]);

  // Function to request location permission and get current location
  const requestLocationPermission = () => {
    // Close popup first
    setShowLocationPermissionPopup(false);
    
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('المتصفح لا يدعم تحديد الموقع');
      // Use default location
      setCurrentLocation({
        lat: 24.7136,
        lng: 46.6753
      });
      return;
    }

    setLocationLoading(true);
    setLocationPermissionRequested(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Use exact coordinates without rounding to ensure maximum accuracy
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(location);
        setLocationError(null);
        setLocationLoading(false);
        // Save permission granted status
        localStorage.setItem('locationPermissionGranted', 'true');
        console.log('✅ Location obtained (EXACT):', location);
        console.log('📍 Coordinates:', `Lat: ${location.lat}, Lng: ${location.lng}`);
        console.log('📍 Accuracy:', position.coords.accuracy ? `${position.coords.accuracy}m` : 'unknown');
      },
      (error) => {
        console.warn('Error getting location:', error);
        setLocationLoading(false);
        
        let errorMessage = 'فشل الحصول على الموقع';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'تم رفض الوصول إلى الموقع. يرجى السماح بالوصول في إعدادات المتصفح';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'معلومات الموقع غير متاحة';
            break;
          case error.TIMEOUT:
            errorMessage = 'انتهت مهلة طلب الموقع';
            break;
          default:
            errorMessage = 'حدث خطأ أثناء الحصول على الموقع';
            break;
        }
        
        setLocationError(errorMessage);
        // Use default location (Riyadh) if geolocation fails
        setCurrentLocation({
          lat: 24.7136,
          lng: 46.6753
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // Check if location permission was previously granted
  useEffect(() => {
    // Check if we have a saved location preference
    const savedLocationPermission = localStorage.getItem('locationPermissionGranted');
    
    if (savedLocationPermission === 'true' && typeof window !== 'undefined' && navigator.geolocation) {
      // Auto-request location if permission was previously granted
      setLocationLoading(true);
      setLocationPermissionRequested(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Use exact coordinates without rounding to ensure maximum accuracy
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          setLocationError(null);
          setLocationLoading(false);
          console.log('✅ Location obtained (EXACT):', location);
          console.log('📍 Coordinates:', `Lat: ${location.lat}, Lng: ${location.lng}`);
          console.log('📍 Accuracy:', position.coords.accuracy ? `${position.coords.accuracy}m` : 'unknown');
        },
        (error) => {
          console.warn('Error getting location:', error);
          setLocationLoading(false);
          setLocationError('فشل الحصول على الموقع');
          // Use default location (Riyadh) if geolocation fails
          setCurrentLocation({
            lat: 24.7136,
            lng: 46.6753
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    } else {
      // Use default location and show popup to request permission
      setCurrentLocation({
        lat: 24.7136,
        lng: 46.6753
      });
      // Show popup if permission wasn't granted before
      if (typeof window !== 'undefined' && navigator.geolocation) {
        setShowLocationPermissionPopup(true);
      }
    }
  }, []);

  // Poll order status every 30 seconds
  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(() => {
      fetchOrderStatus();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [orderId]);

  // Calculate time remaining countdown
  useEffect(() => {
    if (!orderStatus?.expires_in?.expires_at) return;

    const calculateTimeRemaining = () => {
      const expiresAt = new Date(orderStatus.expires_in.expires_at);
      const now = new Date();
      const diff = expiresAt - now;

      if (diff <= 0) {
        // Order has expired
        setIsOrderExpired(true);
        setTimeRemaining(null);
        
        // Mark all offers as expired
        if (offersData?.offers && offersData.offers.length > 0) {
          const allOfferIds = offersData.offers.map(offer => offer.id);
          setExpiredOfferIds(prev => {
            return [...new Set([...prev, ...allOfferIds])];
          });
        }
        return;
      }

      setIsOrderExpired(false);
      
      // Calculate time components
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

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [orderStatus, offersData]);

  // 🔴 **تحديث دالة fetchOffers مع token ومعالجة المصادقة**
  const fetchOffers = async () => {
    try {
      setRefreshing(true);
      setLoading(true); // تأكد من تفعيل حالة التحميل
      
      // الحصول على token
      const accessToken = getAccessToken();
      
      if (!accessToken) {
        // إذا لم يكن هناك token، توجيه لصفحة تسجيل الدخول
        setError('يجب تسجيل الدخول للوصول إلى هذه الصفحة');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      // محاولة جلب البيانات الحقيقية مع token
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/offers`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        cache: 'no-store'
      });

      // Check for 404 Not Found
      if (response.status === 404) {
        setIsNotFound(true);
        setLoading(false);
        setRefreshing(false);
        setError(null);
        setOffersData(null);
        return;
      }

      const data = await response.json();
      
      if (response.ok && data.status) {
        setIsNotFound(false);
        
        // التحقق من وجود البيانات
        if (!data.data) {
          setError('لا توجد بيانات في الاستجابة');
          setLoading(false);
          setRefreshing(false);
          return;
        }

        // عرض البيانات فوراً قبل أي معالجة أخرى
        const offersDataToSet = {
          ...data.data,
          offers: data.data.offers || [],
          total_offers: data.data.total_offers || (data.data.offers?.length || 0),
          active_offers: data.data.active_offers || (data.data.offers?.length || 0)
        };
        
        // Set data immediately
        setOffersData(offersDataToSet);
        setError(null);
        
        // Set accepted offer ID if exists - prioritize this to show immediately
        if (data.data.accepted_offer) {
          const acceptedId = data.data.accepted_offer.id || data.data.accepted_offer;
          setAcceptedOfferId(acceptedId);
          setPendingPaymentOfferId(null);
          localStorage.removeItem('pendingOfferData');
          
          // Reject other offers when an offer is accepted
          // Use setTimeout to ensure offersData is set first
          setTimeout(() => {
            rejectOtherOffers(acceptedId);
          }, 500);
        }
        
        // Stop loading immediately after setting data
        setLoading(false);
        setRefreshing(false);
        
        // Process stats and fetch status in background (non-blocking)
        setTimeout(() => {
          if (data.data.offers && data.data.offers.length > 0) {
            calculateStats(data.data.offers);
          }
          fetchOrderStatus();
        }, 0);
      } else {
        // إذا كان هناك خطأ في المصادقة
        if (data.error_code === 'UNAUTHENTICATED' || data.message?.includes('تسجيل الدخول')) {
          setError('انتهت جلسة الدخول. يرجى تسجيل الدخول مرة أخرى.');
          // حذف token القديم
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
        } else {
          throw new Error(data.message || 'فشل في جلب البيانات');
        }
        setLoading(false);
      }
    } catch (err) {
      console.warn('API Error:', err.message);
      
      // Check if error is 404
      if (err.message?.includes('404') || err.message?.includes('Not Found')) {
        setIsNotFound(true);
        setLoading(false);
        setRefreshing(false);
        setError(null);
        setOffersData(null);
        return;
      }
      
      // عرض رسالة الخطأ
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

  // Fetch order status
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

        // Check if order has expired (remaining_offers is 0 and expires_in.minutes is negative)
        if (data.data.remaining_offers === 0 && data.data.expires_in?.minutes < 0) {
          // Mark all offers as expired if order has expired
          setExpiredOfferIds(prev => {
            // Get current offers from state
            const currentOffers = offersData?.offers || [];
            if (currentOffers.length > 0) {
              const allOfferIds = currentOffers.map(offer => offer.id);
              // Merge with existing expired offers
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

  // Reject other offers when an offer is accepted
  const rejectOtherOffers = useCallback(async (acceptedOfferId) => {
    if (!orderId || !acceptedOfferId) return;

    try {
      const accessToken = getAccessToken();
      if (!accessToken) return;

      // Get current offers from state
      const currentOffers = offersData?.offers || [];
      if (currentOffers.length === 0) return;

      // Get all other offer IDs (excluding the accepted one)
      const otherOfferIds = currentOffers
        .filter(offer => offer.id !== acceptedOfferId)
        .map(offer => offer.id);

      if (otherOfferIds.length === 0) return;

      // Mark other offers as expired in the UI immediately
      setExpiredOfferIds(prev => [...new Set([...prev, ...otherOfferIds])]);

      // Try to reject offers via API (if endpoint exists)
      // Note: This is a best-effort attempt. If the API doesn't have this endpoint,
      // the UI will still show them as expired
      const rejectPromises = otherOfferIds.map(async (offerId) => {
        try {
          // Try common API patterns for rejecting offers
          const endpoints = [
            `${API_BASE_URL}/orders/${orderId}/offers/${offerId}/reject`,
            `${API_BASE_URL}/offers/${offerId}/reject`,
            `${API_BASE_URL}/orders/${orderId}/offers/${offerId}/decline`,
          ];

          for (const endpoint of endpoints) {
            try {
              const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${accessToken}`
                },
                cache: 'no-store'
              });

              if (response.ok) {
                console.log(`✅ Offer ${offerId} rejected successfully`);
                return true;
              }
            } catch (err) {
              // Continue to next endpoint
              continue;
            }
          }
          return false;
        } catch (err) {
          console.warn(`Failed to reject offer ${offerId}:`, err.message);
          return false;
        }
      });

      // Wait for all rejections (don't block if they fail)
      await Promise.allSettled(rejectPromises);

      // Refresh offers data to get updated status
      setTimeout(() => {
        fetchOffers();
      }, 1000);
    } catch (err) {
      console.warn('Error rejecting other offers:', err.message);
      // Still mark as expired in UI even if API call fails
    }
  }, [orderId, offersData?.offers]);

  const handleDriverSelect = (driverId, offerId, driverData, offer) => {
    setSelectedDriverId(driverId);
    setSelectedOfferId(offerId);
    setSelectedOffer(offer);
    setIsModalOpen(true);
    // Mark this offer as pending payment (not accepted yet)
    setPendingPaymentOfferId(offerId);
    // Store driver data in session for modal
    sessionStorage.setItem('selectedDriver', JSON.stringify(driverData));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Clear pending payment state when modal is closed without payment
    setPendingPaymentOfferId(null);
    localStorage.removeItem('pendingOfferData');
  };

  const handleOfferExpired = (offerId) => {
    // Mark offer as expired
    setExpiredOfferIds(prev => [...prev, offerId]);
    // Clear pending payment state
    setPendingPaymentOfferId(null);
    localStorage.removeItem('pendingOfferData');
    // Close modal
    setIsModalOpen(false);
  };

  // 🔴 **تحديث دالة handleConfirmPayment**
  const handleConfirmPayment = async (methodId, driverId, paymentData = null) => {
    try {
      // ✅ Payment initiation is handled in PaymentModal
      // After success, redirect to confirmation page
      const params = new URLSearchParams({
        driver: driverId,
        offer: selectedOfferId,
        gateway: methodId
      });
      
      if (paymentData) {
        // Add payment data to URL if needed
        if (paymentData.payment_url) {
          params.append('payment_url', paymentData.payment_url);
        }
        if (paymentData.payment_id) {
          params.append('payment_id', paymentData.payment_id);
        }
      }
      
      router.push(`/orders/${orderId}/confirmation?${params.toString()}`);
    } catch (err) {
      console.error('Error in payment confirmation:', err);
      alert('حدث خطأ في تأكيد الطلب. يرجى المحاولة مرة أخرى.');
    }
  };

  // Format time remaining for display
  const formatTimeRemaining = () => {
    if (!timeRemaining) return null;
    
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // 🔴 **صفحة تسجيل الدخول عند فقدان المصادقة**
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
              
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              
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
              
              <p className="text-sm text-gray-500 mt-6">
                لا تملك حساباً؟{' '}
                <button 
                  onClick={() => router.push('/register')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  سجل الآن
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found state
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
                عذراً، لم يتم العثور على الطلب المطلوب. يرجى التحقق من رقم الطلب والمحاولة مرة أخرى.
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
              
              <p className="text-sm text-gray-500 mt-6">
                رقم الطلب: #{orderId}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8">

        {/* ✅ إشعار بالعرض الجديد */}
        <AnimatePresence>
          {newOfferNotification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-2xl p-4 border border-green-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">عرض جديد تم إضافته!</h4>
                      <p className="text-xs opacity-90 mt-1">
                        {newOfferNotification.message}
                      </p>
                      {newOfferNotification.driverName && newOfferNotification.price && (
                        <p className="text-xs font-medium mt-1">
                          {newOfferNotification.driverName} - {newOfferNotification.price} ر.س
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setNewOfferNotification(null)}
                    className="text-white/80 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3 h-1 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: newOfferNotification.expiresIn || 5, ease: 'linear' }}
                    onAnimationComplete={() => setNewOfferNotification(null)}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
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

          {/* Main Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] text-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 sm:p-6 md:p-8 relative overflow-hidden">
              {/* Background Elements */}
              <div className="absolute top-0 right-0 opacity-10 hidden sm:block">
                <Truck size={200} className="rotate-12" />
              </div>
              
              <div className="relative z-10">
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
                          
                          {/* ✅ مؤشر اتصال Pusher */}
                          <div className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border ${
                            pusherState === 'connected' 
                              ? 'bg-green-500/30 border-green-300/50' 
                              : pusherState === 'connecting'
                              ? 'bg-yellow-500/30 border-yellow-300/50'
                              : 'bg-red-500/30 border-red-300/50'
                          }`}>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                                pusherState === 'connected' 
                                  ? 'bg-green-400 animate-pulse' 
                                  : pusherState === 'connecting'
                                  ? 'bg-yellow-400 animate-pulse'
                                  : 'bg-red-400'
                              }`} />
                              <span className="font-medium text-xs sm:text-sm">
                                {pusherState === 'connected' 
                                  ? 'البث المباشر ✓' 
                                  : pusherState === 'connecting'
                                  ? 'جاري الاتصال...'
                                  : 'غير متصل'}
                              </span>
                            </div>
                          </div>
                          
                          {isOrderExpired ? (
                            <div className="bg-red-500/30 backdrop-blur-lg px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-red-300/50">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="font-medium text-xs sm:text-sm">انتهت الصلاحية</span>
                              </div>
                            </div>
                          ) : timeRemaining ? (
                            <div className="bg-white/20 backdrop-blur-lg px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/30">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="font-medium text-xs sm:text-sm">متبقي: <span className="font-bold">{formatTimeRemaining()}</span></span>
                              </div>
                            </div>
                          ) : (
                          <div className="bg-white/20 backdrop-blur-lg px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/30">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="font-medium text-xs sm:text-sm">جاري البحث</span>
                            </div>
                          </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Card */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
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
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-bold">{stats.fastestDelivery}</div>
                        <div className="text-[10px] sm:text-xs opacity-90">أسرع وقت</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-bold">{stats.lowestPrice}</div>
                        <div className="text-[10px] sm:text-xs opacity-90">أقل سعر</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Expired Message */}
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
                    عذراً، انتهت صلاحية هذا الطلب ولم يعد من الممكن قبول العروض. يرجى إنشاء طلب جديد.
                  </p>
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-red-500">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="break-words">انتهى في: {orderStatus?.expires_in?.expires_at ? new Date(orderStatus.expires_in.expires_at).toLocaleString('ar-SA') : 'غير محدد'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Pending Payment Message */}
          {pendingPaymentOfferId && !paymentSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 sm:mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg sm:rounded-xl p-3 sm:p-4"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className="text-amber-800 font-medium text-xs sm:text-sm">
                    جاري انتظار الدفع لاستكمال قبول العرض...
                  </p>
                  <p className="text-amber-600 text-[10px] sm:text-xs mt-1">
                    تم حجز العرض مؤقتاً. يرجى إتمام عملية الدفع خلال 15 دقيقة
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Reset pending payment state
                    setPendingPaymentOfferId(null);
                    localStorage.removeItem('pendingOfferData');
                  }}
                  className="text-[10px] sm:text-xs text-amber-700 hover:text-amber-900 font-medium flex-shrink-0"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && !error.includes('تسجيل الدخول') && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 sm:mt-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg sm:rounded-xl p-3 sm:p-4"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-amber-800 text-xs sm:text-sm break-words">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 pb-12 sm:pb-20">
          {/* Drivers List - Left Column */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-8 order-2 lg:order-1"
          >
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  العروض المتاحة
                </h2>
                <div className="flex items-center gap-2">
                  <div className="text-xs sm:text-sm text-gray-500">
                    {offersData?.total_offers || 0} عرض
                  </div>
                  {/* ✅ مؤشر تحديث العروض */}
                  {pusherConnected && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] sm:text-xs text-green-600 font-medium">
                        متصل بالبث المباشر
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
              {offersData?.offers && Array.isArray(offersData.offers) && offersData.offers.length > 0 ? (
                offersData.offers.map((offer, index) => {
                  const isAccepted = acceptedOfferId === offer.id;
                  const isPendingPayment = pendingPaymentOfferId === offer.id;
                  const isExpired = expiredOfferIds.includes(offer.id);
                  return (
                    <motion.div
                      key={offer.id}
                      variants={itemVariants}
                      custom={index}
                      whileHover={(!isAccepted && !isPendingPayment && !isExpired) ? { y: -5 } : {}}
                      transition={{ type: "spring", stiffness: 300 }}
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
                          // Use driverUserId (user.id) for profile navigation, fallback to driver_id
                          const profileId = driverData.driverUserId || offer.driver_id;
                          const driverAvatar = offer.driver?.user?.avatar || offer.driver?.personal_photo || '/images/driver.png';
                          router.push(`/orders/driver_profile?id=${profileId}&driverId=${offer.driver_id}&name=${encodeURIComponent(driverData.name)}&phone=${encodeURIComponent(driverData.phone)}&rate=${driverData.rating}&avatar=${encodeURIComponent(driverAvatar)}`);
                        }}
                        isPending={!isAccepted && !isPendingPayment && !isExpired}
                        isAccepted={isAccepted}
                        isPendingPayment={isPendingPayment}
                        isExpired={isExpired}
                        index={index}
                      />
                    </motion.div>
                  );
                })
              ) : null}
            </div>

            {/* Empty State */}
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
                  لم يتقدم أي سائق لعرض سعر على طلبك بعد. يمكنك الانتظار أو تحديث الصفحة.
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

          {/* Map - Right Column */}
          <div className="lg:col-span-4 order-1 lg:order-2">
            <div className="sticky top-4 sm:top-8">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden h-[300px] sm:h-[400px] lg:h-[600px]">
                <div className="p-2 sm:p-4 border-b">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">خريطة السائقين</h3>
                      <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">مواقع السائقين الحالية</p>
                    </div>
                    {!locationPermissionRequested && (
                      <button
                        onClick={requestLocationPermission}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#579BE8] text-white text-[10px] sm:text-xs font-medium rounded-lg hover:bg-[#4a8dd8] transition flex items-center gap-1 sm:gap-1.5 flex-shrink-0"
                      >
                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">تحديد موقعي</span>
                        <span className="sm:hidden">موقعي</span>
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="h-[calc(100%-80px)]">
                  {locationLoading ? (
                    <div className="h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#579BE8] mx-auto mb-2"></div>
                        <span className="text-gray-400 text-sm">جاري تحديد الموقع...</span>
                      </div>
                    </div>
                  ) : locationError && !currentLocation ? (
                    <div className="h-full flex items-center justify-center bg-gray-100 p-4">
                      <div className="text-center max-w-sm">
                        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                        <p className="text-sm text-gray-700 mb-2 font-medium">{locationError}</p>
                        <button
                          onClick={requestLocationPermission}
                          className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
                        >
                          <MapPin className="w-4 h-4" />
                          المحاولة مرة أخرى
                        </button>
                      </div>
                    </div>
                  ) : currentLocation ? (
                    <DriversMap
                      drivers={memoizedDrivers}
                      center={currentLocation}
                      shouldUpdate={mapShouldUpdate}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-100 p-4">
                      <div className="text-center max-w-sm">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-4">
                          لتحديد موقعك على الخريطة، يرجى السماح بالوصول إلى موقعك
                        </p>
                        <button
                          onClick={requestLocationPermission}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
                        >
                          <MapPin className="w-4 h-4" />
                          السماح بتحديد الموقع
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-2 sm:p-4 border-t bg-gray-50">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#579BE8]/10 text-[#579BE8] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium">معلومات الخريطة</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">
                        {loading || refreshing ? 'جاري التحميل...' : 'يتم تحديث المواقع كل 30 ثانية'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Permission Popup */}
      {showLocationPermissionPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center">
              {/* Icon */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#579BE8]/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-[#579BE8]" />
              </div>
              
              {/* Title */}
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                السماح بمشاركة الموقع
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed px-1">
                نحتاج إلى الوصول إلى موقعك الحالي لعرض مواقع السائقين على الخريطة بشكل دقيق. 
                سيتم استخدام موقعك فقط لعرض الخريطة ولن يتم مشاركته مع أي طرف آخر.
              </p>
              
              {/* Buttons */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  onClick={requestLocationPermission}
                  className="px-2 sm:px-3 md:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-[#579BE8] to-[#4a8dd8] text-white rounded-lg sm:rounded-xl font-bold hover:from-[#4a8dd8] hover:to-[#3b7bc8] transition text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">السماح بمشاركة الموقع</span>
                  <span className="sm:hidden">السماح</span>
                </button>
                <button
                  onClick={() => {
                    setShowLocationPermissionPopup(false);
                    // Use default location
                    setCurrentLocation({
                      lat: 24.7136,
                      lng: 46.6753
                    });
                  }}
                  className="px-3 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl font-medium hover:bg-gray-50 transition text-xs sm:text-sm"
                >
                  تخطي
                </button>
              </div>
              
              {/* Privacy Note */}
              <p className="text-[10px] sm:text-xs text-gray-500 mt-3 sm:mt-4">
                يمكنك تغيير هذا الإعداد في أي وقت من الاعدادات
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmPayment}
        selectedDriverId={selectedDriverId}
        selectedOfferId={selectedOfferId}
        orderId={orderId}
        offerAmount={selectedOffer?.price}
        onOfferExpired={handleOfferExpired}
        setPendingPaymentOfferId={setPendingPaymentOfferId}
      />
    </div>
  );
}