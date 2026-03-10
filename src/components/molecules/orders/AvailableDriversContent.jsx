'use client';

import { useState, useEffect, useMemo, useRef, useCallback, useReducer } from 'react';
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
  Wifi,
  WifiOff
} from 'lucide-react';
import DriverCard from './DriverCard';
import PaymentModal from './PaymentModal';
import { API_BASE_URL, getAccessToken } from './utils/api';
import { getPaymentCallbackData, getPendingOfferData } from './utils/paymentHelpers';
import usePusher from '@/hooks/usePusher';
import toast from 'react-hot-toast';

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

// Action Types for offers reducer
const OFFER_ACTIONS = {
  SET_OFFERS: 'SET_OFFERS',
  ADD_OFFER: 'ADD_OFFER',
  UPDATE_OFFER: 'UPDATE_OFFER',
  REMOVE_OFFER: 'REMOVE_OFFER',
};

// Offers Reducer with deep merge
const offersReducer = (state, action) => {
  console.log('🔄 Reducer action:', action.type, action.payload?.id);
  
  switch (action.type) {
    case OFFER_ACTIONS.SET_OFFERS:
      console.log('📦 Setting offers:', action.payload?.length || 0);
      return action.payload || [];

    case OFFER_ACTIONS.ADD_OFFER:
      if (state.some(offer => offer.id === action.payload.id)) {
        console.log(`⚠️ Offer ${action.payload.id} already exists, skipping add.`);
        return state;
      }
      console.log(`✅ Adding new offer ${action.payload.id}`);
      return [action.payload, ...state];

    case OFFER_ACTIONS.UPDATE_OFFER:
      console.log(`🔄 Updating offer ${action.payload.id}`);
      return state.map(offer => {
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
      console.log(`🗑️ Removing offer ${action.payload}`);
      return state.filter(offer => offer.id !== action.payload);

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
  
  // Update ref when offers change
  useEffect(() => {
    offersRef.current = offers;
    
    // Detect new offers for toast notifications
    if (offers.length > lastOfferCountRef.current && lastOfferCountRef.current > 0) {
      const newOffersCount = offers.length - lastOfferCountRef.current;
      const latestOffers = offers.slice(0, newOffersCount);
      
      latestOffers.forEach(offer => {
        toast.success(`💰 عرض جديد بقيمة ${offer.price} ريال`, {
          duration: 4000,
          icon: '💰',
          position: 'top-left',
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
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  
  // Notification states
  const [newOfferNotification, setNewOfferNotification] = useState(null);
  const [driverAcceptedNotification, setDriverAcceptedNotification] = useState(null);
  const [offerExpiredNotification, setOfferExpiredNotification] = useState(null);
  
  // States for payment flow
  const [selectedForPaymentOfferId, setSelectedForPaymentOfferId] = useState(null);
  const [processingPaymentOfferId, setProcessingPaymentOfferId] = useState(null);

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
      setShowConnectionStatus(true);
      // toast.success('✅ متصل بالخادم - في انتظار العروض', {
      //   duration: 2000,
      //   icon: '📡',
      // });
      setTimeout(() => setShowConnectionStatus(false), 3000);
    },
    onDisconnected: () => {
      console.log('🔴 Pusher disconnected in AvailableDrivers');
      setShowConnectionStatus(true);
      // toast.error('🔴 انقطع الاتصال - جاري إعادة الاتصال...', {
      //   duration: 3000,
      //   icon: '⚠️',
      // });
      setTimeout(() => setShowConnectionStatus(false), 3000);
    }
  });

  const orderId = searchParams.get('orderId');
  const paymentStatus = searchParams.get('payment');
  const paymentSuccessParam = searchParams.get('success');
  const paymentCancelParam = searchParams.get('cancel');
  const isExpiredParam = searchParams.get('expired');

  // ============= إعادة تحميل الصفحة عند الدخول =============
  useEffect(() => {
    // التأكد من وجود orderId
    if (!orderId) return;
    
    const hasReloaded = sessionStorage.getItem(`pageReloaded_${orderId}`);
    
    if (!hasReloaded) {
      // تعيين علامة في sessionStorage لمنع إعادة التحميل المتكررة
      sessionStorage.setItem(`pageReloaded_${orderId}`, 'true');
      
      // إعادة تحميل الصفحة بعد 1.5 ثانية
      setTimeout(() => {
        console.log('🔄 إعادة تحميل الصفحة عند الدخول للطلب:', orderId);
        window.location.reload();
      }, 1500);
    }
  }, [orderId]);

  // ============= إعادة تحميل الصفحة عند ظهور driverAcceptedNotification =============
  useEffect(() => {
    if (driverAcceptedNotification) {
      console.log('📢 Driver accepted notification detected, reloading page in 2 seconds...');
      
      // إعادة تحميل الصفحة بعد ثانيتين
      setTimeout(() => {
        console.log('🔄 جاري إعادة تحميل الصفحة بعد قبول السائق...');
        window.location.reload();
      }, 2000);
    }
  }, [driverAcceptedNotification]);

  // ============= دوال مساعدة =============
  const formatDriverDataFromEvent = useCallback((driverData) => {
    if (!driverData) return null;
    
    return {
      id: driverData.id,
      name: driverData.user?.name || driverData.name || 'سائق',
      rating: 4.5, // القيمة الافتراضية
      ratingCount: 0,
      vehicle: {
        type: driverData.vehicle_size || 'مركبة',
        model: driverData.vehicle_size || 'مركبة',
        plate_number: driverData.vehicle_plate_number || 'XXX'
      },
      image: driverData.user?.avatar || driverData.personal_photo || null,
      location: driverData.currect_location ? {
        lat: parseFloat(driverData.currect_location.lat),
        lng: parseFloat(driverData.currect_location.lng)
      } : null
    };
  }, []);

  // ============= دوال معالجة الأحداث =============
  const handleOfferCreated = useCallback((data) => {
    console.log('💰 ===== NEW OFFER CREATED EVENT =====', data);
    
    const newOffer = data.offer || data;
    const offerOrderId = data.order_id || data.order?.id;
    
    if (offerOrderId && offerOrderId.toString() === orderId?.toString() && newOffer?.id) {
      console.log(`✅ New offer ${newOffer.id} belongs to our order ${orderId}`);
      
      // تنسيق بيانات العرض
      const formattedOffer = {
        id: newOffer.id,
        driver_id: newOffer.driver_id || newOffer.driver?.id,
        driver: newOffer.driver ? formatDriverDataFromEvent(newOffer.driver) : null,
        price: newOffer.price,
        status: 'pending',
        order: newOffer.order || {
          payment_status: 'pending'
        },
        created_at: newOffer.created_at || new Date().toISOString(),
        expires_at: new Date(Date.now() + 5 * 60000).toISOString(), // 5 دقائق افتراضياً
        delivery_duration_minutes: newOffer.delivery_duration_minutes || 30
      };
      
      dispatchOffers({ type: OFFER_ACTIONS.ADD_OFFER, payload: formattedOffer });
      
      setNewOfferNotification({
        id: Date.now(),
        message: 'تم إضافة عرض جديد',
        driverName: formattedOffer.driver?.name || 'سائق جديد',
        price: formattedOffer.price,
        expiresIn: 5
      });
      
      // إظهار toast notification
      toast.success(`💰 عرض جديد بقيمة ${formattedOffer.price} ريال`, {
        duration: 5000,
        icon: '💰',
        position: 'top-left',
      });
    }
  }, [orderId, formatDriverDataFromEvent]);

  const handleOfferUpdated = useCallback((data) => {
    console.log('🔄 ===== OFFER UPDATED EVENT =====', data);
    
    const updatedOffer = data.offer || data;
    const offerOrderId = data.order_id || data.order?.id;
    
    if (offerOrderId && offerOrderId.toString() === orderId?.toString() && updatedOffer?.id) {
      console.log(`🔄 Updating offer ${updatedOffer.id}`);
      
      dispatchOffers({ type: OFFER_ACTIONS.UPDATE_OFFER, payload: updatedOffer });
      
      if (updatedOffer.status === 'expired' || updatedOffer.status === 'rejected') {
        setExpiredOfferIds(prev => [...prev, updatedOffer.id]);
        
        setOfferExpiredNotification({
          id: Date.now(),
          message: 'انتهت صلاحية عرض',
          driverName: updatedOffer.driver?.name || 'سائق',
          expiresIn: 3
        });
        
        // toast.error(`⏰ انتهت صلاحية عرض السائق ${updatedOffer.driver?.name || ''}`, {
        //   duration: 3000,
        // });
      }
    }
  }, [orderId]);

  const handleOfferExpired = useCallback((data) => {
    console.log('⏰ ===== OFFER EXPIRED EVENT =====', data);
    
    const expiredOfferId = data.offer_id || data.offer?.id || data.id;
    const offerOrderId = data.order_id || data.order?.id;
    
    if (offerOrderId && offerOrderId.toString() === orderId?.toString() && expiredOfferId) {
      console.log(`⏰ Offer ${expiredOfferId} expired`);
      
      dispatchOffers({ type: OFFER_ACTIONS.REMOVE_OFFER, payload: expiredOfferId });
      setExpiredOfferIds(prev => [...prev, expiredOfferId]);
      
      setOfferExpiredNotification({
        id: Date.now(),
        message: 'انتهت صلاحية عرض',
        driverName: data.driver?.name || 'سائق',
        expiresIn: 3
      });
      
      if (pendingPaymentOfferId === expiredOfferId || selectedForPaymentOfferId === expiredOfferId) {
        setPendingPaymentOfferId(null);
        setSelectedForPaymentOfferId(null);
        paymentProcessedRef.current = false;
      }
      
      toast.warning('⏰ انتهت صلاحية أحد العروض', {
        duration: 3000,
      });
    }
  }, [orderId, pendingPaymentOfferId, selectedForPaymentOfferId]);

  const handleDriverAcceptedOrder = useCallback((data) => {
    console.log('🚗 ===== DRIVER ACCEPTED ORDER EVENT =====', data);
    console.log('📋 Full event data:', JSON.stringify(data, null, 2));
    
    const acceptedOrderId = data.order_id || data.order?.id;
    const currentOrderId = orderId;
    const paymentStatus = data.order?.payment_status || 'pending';
    
    if (acceptedOrderId && acceptedOrderId.toString() === currentOrderId?.toString()) {
      // console.log(`✅ Driver accepted our order ${currentOrderId}, payment_status: ${paymentStatus}`);
      
      // إظهار toast notification
      toast.success('🚗 تم قبول طلبك من قبل السائق!', {
        duration: 4000,
        icon: '🎉',
        position: 'top-left',
      });
      
      // الحصول على بيانات العرض من الحدث
      const offerData = data.offer;
      const acceptedOfferId = offerData?.id;
      
      if (!acceptedOfferId) {
        console.error('❌ No offer ID found in event data');
        return;
      }
      
      console.log(`🎯 Processing accepted offer ID: ${acceptedOfferId}`);
      
      // البحث عن العرض الحالي في القائمة
      const currentOffers = offersRef.current;
      const existingOffer = currentOffers.find(o => o.id === acceptedOfferId);
      
      let offerToUpdate;
      
      if (offerData) {
        // لدينا بيانات كاملة من الحدث - تنسيقها حسب هيكل البيانات الجديد
        console.log('📦 Using full offer data from event');
        
        // تنسيق بيانات السائق
        const driverData = offerData.driver ? formatDriverDataFromEvent(offerData.driver) : (existingOffer?.driver || null);
        
        offerToUpdate = {
          id: offerData.id,
          driver_id: offerData.driver_id,
          driver: driverData,
          price: offerData.price,
          status: paymentStatus === 'paid' ? 'accepted' : 'payment_pending',
          order: {
            ...(offerData.order || {}),
            payment_status: paymentStatus
          },
          created_at: offerData.created_at,
          delivery_duration_minutes: offerData.delivery_duration_minutes || 30
        };
      } else if (existingOffer) {
        // لدينا العرض في القائمة، نحدثه مع الحفاظ على البيانات
        console.log('📦 Using existing offer data from state');
        offerToUpdate = {
          ...existingOffer,
          status: paymentStatus === 'paid' ? 'accepted' : 'payment_pending',
          order: {
            ...(existingOffer.order || {}),
            payment_status: paymentStatus
          }
        };
      }
      
      if (offerToUpdate) {
        // تحديث العرض في القائمة
        console.log('🔄 Updating offer with data:', offerToUpdate);
        dispatchOffers({
          type: OFFER_ACTIONS.UPDATE_OFFER,
          payload: offerToUpdate
        });
        
        // تحديث الحالات المختلفة
        if (paymentStatus === 'paid') {
          setAcceptedOfferId(acceptedOfferId);
          setPaidOfferIds(prev => new Set([...prev, acceptedOfferId]));
          setPendingPaymentOfferId(null);
          setSelectedForPaymentOfferId(null);
          setPaymentSuccess(true);
          
          setDriverAcceptedNotification({
            id: Date.now(),
            message: 'تم قبول طلبك من قبل سائق!',
            driverName: offerToUpdate.driver?.name || 'سائق',
            price: offerToUpdate.price,
            offerId: acceptedOfferId,
            expiresIn: 10
          });
          
          toast.success('✅ تم الدفع وقبول الطلب!', {
            duration: 5000,
            icon: '🎉',
          });
          
        } else {
          console.log(`⚠️ Driver accepted order but payment not completed. Status: ${paymentStatus}`);
          setPendingPaymentOfferId(acceptedOfferId);
          
          setDriverAcceptedNotification({
            id: Date.now(),
            message: 'تم قبول العرض - في انتظار إتمام الدفع',
            driverName: offerToUpdate.driver?.name || 'سائق',
            price: offerToUpdate.price,
            offerId: acceptedOfferId,
            expiresIn: 10
          });
          
          // toast('💳 تم قبول العرض - يرجى إتمام الدفع', {
          //   duration: 5000,
          //   icon: '💳',
          // });
        }
      }
      
      // تأكيد التحديث بعد فترة قصيرة
      setTimeout(() => {
        console.log('⏱️ After update, offers count:', offersRef.current.length);
        console.log('⏱️ Updated offer:', offersRef.current.find(o => o.id === acceptedOfferId));
      }, 500);
    }
  }, [orderId, formatDriverDataFromEvent]);

  const handleTripStartedForUser = useCallback((data) => {
    console.log('🚀 ===== TRIP STARTED FOR USER EVENT =====', data);
    
    const eventOrderId = data.order?.id || data.order_id;
    
    if (eventOrderId && eventOrderId.toString() === orderId?.toString()) {
      console.log(`✅ Trip started for order ${orderId}`);
      
      if (data.order?.accepted_offer_id) {
        const acceptedOfferId = data.order.accepted_offer_id;
        const fullOfferData = data.offer || data.order?.accepted_offer;
        
        if (fullOfferData) {
          dispatchOffers({
            type: OFFER_ACTIONS.UPDATE_OFFER,
            payload: {
              ...fullOfferData,
              status: 'accepted',
              order: { ...fullOfferData.order, payment_status: 'paid' }
            }
          });
        } else {
          dispatchOffers({
            type: OFFER_ACTIONS.UPDATE_OFFER,
            payload: {
              id: acceptedOfferId,
              status: 'accepted',
              order: { payment_status: 'paid' }
            }
          });
        }
        
        setPaidOfferIds(prev => new Set([...prev, acceptedOfferId]));
        setAcceptedOfferId(acceptedOfferId);
        setPendingPaymentOfferId(null);
        setSelectedForPaymentOfferId(null);
        setPaymentSuccess(true);
        
        setDriverAcceptedNotification({
          id: Date.now(),
          message: data.message || 'تم الدفع والرحلة بدأت الآن',
          driverName: data.order?.driver?.name || data.driver?.name || 'سائق',
          price: data.order?.price || data.price,
          offerId: acceptedOfferId,
          expiresIn: 10
        });
        
        toast.success('🚀 بدأت الرحلة!', {
          duration: 5000,
          icon: '🎉',
        });
      }
    }
  }, [orderId]);

  const handleOrderExpired = useCallback((data) => {
    console.log('⏱️ ===== ORDER EXPIRED EVENT =====', data);
    
    const expiredOrderId = data.order_id || data.order?.id || data.id;
    
    if (expiredOrderId && expiredOrderId.toString() === orderId?.toString()) {
      setIsOrderExpired(true);
      dispatchOffers({ type: OFFER_ACTIONS.SET_OFFERS, payload: [] });
      
      setOfferExpiredNotification({
        id: Date.now(),
        message: 'انتهت صلاحية الطلب بالكامل',
        expiresIn: 5
      });
      
      setPendingPaymentOfferId(null);
      setSelectedForPaymentOfferId(null);
      paymentProcessedRef.current = false;
      
      toast.error('⏰ انتهت صلاحية الطلب', {
        duration: 5000,
        icon: '⏰',
      });
    }
  }, [orderId]);

  const handlePaymentSuccess = useCallback((data) => {
    console.log('💰 Payment success callback received:', data);
    
    if (data.offer?.id) {
      dispatchOffers({
        type: OFFER_ACTIONS.UPDATE_OFFER,
        payload: {
          ...data.offer,
          status: 'accepted',
          order: { ...data.offer.order, payment_status: 'paid' }
        }
      });
    }
    
    if (data.order?.id === orderId) {
      setAcceptedOfferId(data.order?.accepted_offer_id || selectedOfferId);
      setPendingPaymentOfferId(null);
      setSelectedForPaymentOfferId(null);
      setPaymentSuccess(true);
      
      localStorage.removeItem('pendingOfferData');
      sessionStorage.removeItem('paymentCallbackData');
      
      setDriverAcceptedNotification({
        id: Date.now(),
        message: 'تم الدفع بنجاح! جاري تجهيز الرحلة...',
        driverName: data.driver?.name || data.order?.driver?.name || 'السائق',
        expiresIn: 5
      });
      
      toast.success('✅ تم الدفع بنجاح!', {
        duration: 4000,
        icon: '💰',
      });
    }
  }, [orderId, selectedOfferId]);

  const handlePaymentFailure = useCallback((data) => {
    console.log('❌ Payment failure callback received:', data);
    
    if (data.offer?.id) {
      dispatchOffers({
        type: OFFER_ACTIONS.UPDATE_OFFER,
        payload: {
          id: data.offer.id,
          status: 'pending',
          order: { payment_status: 'failed' }
        }
      });
    }
    
    setError('فشلت عملية الدفع. يرجى المحاولة مرة أخرى.');
    setPendingPaymentOfferId(null);
    setSelectedForPaymentOfferId(null);
    paymentProcessedRef.current = false;
    
    toast.error('❌ فشلت عملية الدفع', {
      duration: 4000,
    });
  }, []);

  // ============= دوال الإعداد والتنسيق =============
  const requestLocationPermission = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم تحديد الموقع');
      setCurrentLocation({ lat: 24.7136, lng: 46.6753 });
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
        
        localStorage.setItem('userLocation', JSON.stringify(location));
        localStorage.setItem('locationPermissionGranted', 'true');
        
        console.log('✅ Location obtained:', location);
        toast.success('📍 تم تحديد موقعك بنجاح');
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
        toast.error(errorMessage);
        
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

  const skipLocation = useCallback(() => {
    const defaultLocation = { lat: 24.7136, lng: 46.6753 };
    setCurrentLocation(defaultLocation);
    localStorage.setItem('userLocation', JSON.stringify(defaultLocation));
    setShowLocationPrompt(false);
    toast('📍 تم استخدام الموقع الافتراضي');
  }, []);

  // دالة إعداد مستمع Pusher
  const setupPusherListener = useCallback(async (orderId) => {
    try {
      console.log(`🎯 Setting up Pusher listener for available drivers page - order ${orderId}`);
      
      if (!orderId) {
        console.warn('⚠️ No order ID provided for Pusher setup');
        return;
      }

      // تنظيف المستمعين القدامى
      removeEventListener('offer.created');
      removeEventListener('offer.updated');
      removeEventListener('offer.expired');
      removeEventListener('order.expired');
      removeEventListener('DriverAcceptedOrder');
      removeEventListener('TripStartedForUser');

      // إضافة المستمعين الجدد
      addEventListener('offer.created', handleOfferCreated);
      addEventListener('offer.updated', handleOfferUpdated);
      addEventListener('offer.expired', handleOfferExpired);
      addEventListener('order.expired', handleOrderExpired);
      addEventListener('DriverAcceptedOrder', handleDriverAcceptedOrder);
      addEventListener('TripStartedForUser', handleTripStartedForUser);

      // الاشتراك في قناة الطلب
      const subscriptionCallbacks = {
        'offer.created': handleOfferCreated,
        'offer.updated': handleOfferUpdated,
        'offer.expired': handleOfferExpired,
        'order.expired': handleOrderExpired,
        'DriverAcceptedOrder': handleDriverAcceptedOrder,
        'TripStartedForUser': handleTripStartedForUser
      };

      subscribe(`order.${orderId}`, subscriptionCallbacks);
      
      // أيضاً الاشتراك في قناة المستخدم إذا كان متاحاً
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.id) {
            subscribe(`user.${user.id}`, {
              'DriverAcceptedOrder': handleDriverAcceptedOrder,
              'TripStartedForUser': handleTripStartedForUser,
              'offer.created': handleOfferCreated
            });
            console.log(`✅ Subscribed to user.${user.id} channel`);
          }
        } catch (error) {
          console.warn('Error parsing user data:', error);
        }
      }
      
      console.log('✅ Pusher setup completed for available drivers page');
      // toast.success('📡 جاهز لاستقبال العروض', { duration: 2000 });
      
    } catch (error) {
      console.error('❌ Error setting up Pusher listener:', error);
      toast.error('❌ خطأ في الاتصال بالخادم');
    }
  }, [addEventListener, removeEventListener, subscribe, 
      handleOfferCreated, handleOfferUpdated, handleOfferExpired, 
      handleOrderExpired, handleDriverAcceptedOrder, handleTripStartedForUser]);

  // ============= دوال API =============
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
        
        const offersFromApi = data.data.offers || [];
        console.log('📥 Fetched offers from API:', offersFromApi.length);
        
        dispatchOffers({ type: OFFER_ACTIONS.SET_OFFERS, payload: offersFromApi });
        
        setOffersData(data.data);
        setError(null);
        setAcceptedOfferId(null);
        
        if (data.data.accepted_offer) {
          const acceptedId = data.data.accepted_offer.id || data.data.accepted_offer;
          const orderPaymentStatus = data.data.order?.payment_status;
          
          if (orderPaymentStatus === 'paid') {
            setAcceptedOfferId(acceptedId);
            setPendingPaymentOfferId(null);
            setSelectedForPaymentOfferId(null);
            setPaidOfferIds(prev => new Set([...prev, acceptedId]));
            setPaymentSuccess(true);
            localStorage.removeItem('pendingOfferData');
            // toast.success('✅ تم العثور على عرض مقبول مسبقاً');
          }
        }
        
        // if (offersFromApi.length > 0) {
        //   toast.success(`📦 تم تحميل ${offersFromApi.length} عرض`, { duration: 2000 });
        // }
        
        setLoading(false);
        setRefreshing(false);
        
      } else {
        if (data.error_code === 'UNAUTHENTICATED') {
          setError('انتهت جلسة الدخول. يرجى تسجيل الدخول مرة أخرى.');
          localStorage.removeItem('accessToken');
          toast.error('انتهت الجلسة - يرجى تسجيل الدخول مجدداً');
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
      setRefreshing(false);
      setOffersData(null);
      toast.error('❌ فشل تحميل العروض');
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
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        cache: 'no-store'
      });

      const data = await response.json();

      if (response.ok && data.status && data.data) {
        setOrderStatus(data.data);
      }
    } catch (err) {
      console.warn('Error fetching order status:', err.message);
    }
  };

  // ============= دوال المعالجة =============
  const handleDriverSelect = (driverId, offerId, driverData, offer) => {
    setSelectedDriverId(driverId);
    setSelectedOfferId(offerId);
    setSelectedOffer(offer);
    setSelectedForPaymentOfferId(offerId);
    setIsModalOpen(true);
    sessionStorage.setItem('selectedDriver', JSON.stringify(driverData));
    paymentProcessedRef.current = false;
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPendingPaymentOfferId(null);
    setSelectedForPaymentOfferId(null);
    localStorage.removeItem('pendingOfferData');
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

  // ============= حساب الإحصائيات =============
  const stats = useMemo(() => {
    if (!offers || offers.length === 0) {
      return {
        totalOffers: 0,
        averagePrice: 0,
        fastestDelivery: 0,
        lowestPrice: 0
      };
    }

    const prices = offers.map(o => parseFloat(o.price)).filter(p => !isNaN(p));
    const times = offers.map(o => o.delivery_duration_minutes || 0).filter(t => t > 0);

    return {
      totalOffers: offers.length,
      averagePrice: prices.length > 0 ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2) : 0,
      fastestDelivery: times.length > 0 ? Math.min(...times) : 0,
      lowestPrice: prices.length > 0 ? Math.min(...prices).toFixed(2) : 0
    };
  }, [offers]);

  // Memoize drivers data for map
  const memoizedDrivers = useMemo(() => {
    return offers.map(formatDriverData);
  }, [offers]);

  // ============= Effects =============

  // التحقق من إذن الموقع عند التحميل
  useEffect(() => {
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

  // مراقبة حالة اتصال Pusher
  useEffect(() => {
    if (pusherConnected) {
      console.log('✅ Pusher connected - ready to receive offers');
      if (orderId) {
        setupPusherListener(orderId);
      }
    } else {
      console.log('🔴 Pusher disconnected - attempting to reconnect...');
    }
  }, [pusherConnected, orderId, setupPusherListener]);

  // Setup Pusher listeners
  useEffect(() => {
    if (!orderId) {
      console.log(`⏳ Waiting for orderId`);
      return;
    }
    
    if (!pusherConnected) {
      console.log(`⏳ Waiting for Pusher connection: orderId=${orderId}, connected=${pusherConnected}`);
      return;
    }
    
    console.log(`🎯 Setting up enhanced Pusher listeners for order ${orderId}`);
    
    // استدعاء دالة الإعداد المحسنة
    setupPusherListener(orderId);
    
    return () => {
      console.log('🧹 Cleaning up Pusher listeners');
      removeEventListener('offer.created');
      removeEventListener('offer.updated');
      removeEventListener('offer.expired');
      removeEventListener('order.expired');
      removeEventListener('DriverAcceptedOrder');
      removeEventListener('TripStartedForUser');
      unsubscribeAll();
    };
  }, [orderId, pusherConnected, setupPusherListener, removeEventListener, unsubscribeAll]);

  // Monitor offers changes
  useEffect(() => {
    console.log('📊 Offers updated, current count:', offers.length);
  }, [offers]);

  // تأثير إضافي لعرض إشعارات العروض الجديدة
  useEffect(() => {
    if (offers.length > lastOfferCount && lastOfferCount > 0) {
      // تم التعامل مع هذا في useEffect السابق الذي يراقب offers
    }
    setLastOfferCount(offers.length);
  }, [offers, lastOfferCount]);

  // Check for expired offers periodically
  useEffect(() => {
    if (expiryCheckIntervalRef.current) {
      clearInterval(expiryCheckIntervalRef.current);
    }
    
    if (isOrderExpired) {
      return;
    }
    
    expiryCheckIntervalRef.current = setInterval(() => {
      const currentOffers = offersRef.current;
      if (currentOffers && currentOffers.length > 0) {
        const now = new Date();
        
        currentOffers.forEach(offer => {
          if (offer.expires_at && !expiredOfferIds.includes(offer.id)) {
            const expiresAt = new Date(offer.expires_at);
            
            if (expiresAt <= now) {
              console.log(`⏰ Offer ${offer.id} expired (periodic check)`);
              handleOfferExpired({ offer_id: offer.id, order_id: orderId });
            }
          }
        });
      }
    }, 30000);
    
    return () => {
      if (expiryCheckIntervalRef.current) {
        clearInterval(expiryCheckIntervalRef.current);
      }
    };
  }, [expiredOfferIds, isOrderExpired, orderId, handleOfferExpired]);

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
        handleOrderExpired({ order_id: orderId });
        return;
      }

      setIsOrderExpired(false);
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds, total: diff });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [orderStatus, orderId, handleOrderExpired]);

  // Initial data fetch
  useEffect(() => {
    if (orderId && !initialFetchDoneRef.current) {
      const expiredFlag = localStorage.getItem(`order_${orderId}_expired`);
      if (expiredFlag === 'true' || isExpiredParam === 'true') {
        setIsOrderExpired(true);
        localStorage.removeItem(`order_${orderId}_expired`);
      }
      
      fetchOffers();
      fetchOrderStatus();
      initialFetchDoneRef.current = true;
    } else if (!orderId) {
      router.back();
    }
  }, [orderId, isExpiredParam]);

  // Payment status check
  useEffect(() => {
    if (paymentProcessedRef.current) return;
    
    if (paymentStatus === 'cancel' || paymentCancelParam === 'true') {
      setPendingPaymentOfferId(null);
      setSelectedForPaymentOfferId(null);
      setPaymentSuccess(false);
      localStorage.removeItem('pendingOfferData');
      paymentProcessedRef.current = true;
      toast.info('تم إلغاء عملية الدفع');
      return;
    }
    
    if (paymentStatus === 'success' || paymentSuccessParam === 'true') {
      setPaymentSuccess(true);
      const callbackData = getPaymentCallbackData();
      if (callbackData && callbackData.offerId) {
        const acceptedId = callbackData.offerId;
        setAcceptedOfferId(acceptedId);
        setPendingPaymentOfferId(null);
        setSelectedForPaymentOfferId(null);
        localStorage.removeItem('pendingOfferData');
        paymentProcessedRef.current = true;
        setPaidOfferIds(prev => new Set([...prev, acceptedId]));
        
        dispatchOffers({
          type: OFFER_ACTIONS.UPDATE_OFFER,
          payload: {
            id: acceptedId,
            status: 'accepted',
            order: { payment_status: 'paid' }
          }
        });
        
        toast.success('✅ تم الدفع بنجاح!');
      }
      return;
    }
    
    const callbackData = getPaymentCallbackData();
    if (callbackData && callbackData.offerId && !paymentCancelParam && !paymentProcessedRef.current) {
      const acceptedId = callbackData.offerId;
      setAcceptedOfferId(acceptedId);
      setPendingPaymentOfferId(null);
      setSelectedForPaymentOfferId(null);
      setPaymentSuccess(true);
      setPaidOfferIds(prev => new Set([...prev, acceptedId]));
      paymentProcessedRef.current = true;
      
      dispatchOffers({
        type: OFFER_ACTIONS.UPDATE_OFFER,
        payload: {
          id: acceptedId,
          status: 'accepted',
          order: { payment_status: 'paid' }
        }
      });
      
      toast.success('✅ تم الدفع بنجاح!');
      return;
    }
    
    if (!paymentCancelParam && paymentStatus !== 'cancel' && !paymentProcessedRef.current) {
      const pendingOfferData = getPendingOfferData();
      if (pendingOfferData && pendingOfferData.orderId === orderId) {
        setPendingPaymentOfferId(pendingOfferData.offerId);
        setSelectedForPaymentOfferId(pendingOfferData.offerId);
        setSelectedDriverId(pendingOfferData.driverId);
        setSelectedOfferId(pendingOfferData.offerId);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, paymentStatus, paymentSuccessParam, paymentCancelParam]);

  // ============= Error and loading states =============
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
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2"
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
              <p className="text-gray-600 mb-6">عذراً، لم يتم العثور على الطلب المطلوب.</p>
              <button
                onClick={() => router.push('/')}
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
            <p className="mt-6 text-gray-600 font-medium text-lg">جاري البحث عن سائقين...</p>
            <p className="text-sm text-gray-400 mt-2">رقم الطلب: #{orderId}</p>
            {timeRemaining && (
              <p className="text-sm text-[#579BE8] mt-2">⏳ الوقت المتبقي: {formatTimeRemaining()}</p>
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

        {/* Connection Status Indicator */}
        <AnimatePresence>
          {showConnectionStatus && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
            >
              {/* <div className={`px-4 py-2 rounded-full shadow-lg flex items-center gap-2 ${
                pusherConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {pusherConnected ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    <span className="text-sm font-medium">متصل بالخادم</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm font-medium">جاري إعادة الاتصال...</span>
                  </>
                )}
              </div> */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Location Prompt Modal */}
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
                  <h3 className="text-xl font-bold text-gray-900 mb-3">تحديد موقعك الحالي</h3>
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

        {/* Driver Accepted Notification */}
        <AnimatePresence>
          {driverAcceptedNotification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-40 left-4 right-4 z-40 md:left-auto md:right-4 md:w-96"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-2xl p-4 border border-green-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">
                        {driverAcceptedNotification.message.includes('تم الدفع') ? '✅ تم الدفع' : 'تم قبول طلبك!'}
                      </h4>
                      <p className="text-xs opacity-90 mt-1">{driverAcceptedNotification.message}</p>
                      {driverAcceptedNotification.driverName && (
                        <p className="text-xs font-bold mt-1">السائق: {driverAcceptedNotification.driverName}</p>
                      )}
                      {driverAcceptedNotification.price && (
                        <p className="text-xs font-bold mt-1">السعر: {driverAcceptedNotification.price} ريال</p>
                      )}
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

        {/* New Offer Notification */}
        <AnimatePresence>
          {newOfferNotification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 left-4 right-4 z-40 md:left-auto md:right-4 md:w-96"
            >
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-2xl p-4 border border-blue-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-lg">💰</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">عرض جديد!</h4>
                      <p className="text-xs opacity-90 mt-1">
                        {newOfferNotification.message} بقيمة {newOfferNotification.price} ريال
                      </p>
                      <p className="text-xs font-bold mt-1">السائق: {newOfferNotification.driverName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNewOfferNotification(null)}
                    className="text-white/80 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Offer Expired Notification */}
        <AnimatePresence>
          {offerExpiredNotification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 left-4 right-4 z-40 md:left-auto md:right-4 md:w-96"
            >
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl shadow-2xl p-4 border border-orange-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">انتهاء صلاحية</h4>
                      <p className="text-xs opacity-90 mt-1">{offerExpiredNotification.message}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOfferExpiredNotification(null)}
                    className="text-white/80 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
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
            className="flex items-center justify-between mb-4 sm:mb-6"
          >
            <button 
              onClick={() => router.push('/')}
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
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
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
                      <p className="text-xs sm:text-sm opacity-90 font-medium mb-1">اختيار السائق</p>
                      <h1 className="text-lg sm:text-2xl md:text-3xl font-black mb-2">السائقين المتاحين</h1>
                      
                      <div className="flex flex-wrap gap-2">
                        <div className="bg-white/20 backdrop-blur-lg px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/30">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="font-medium text-xs sm:text-sm">طلب #{orderId}</span>
                          </div>
                        </div>
                        
                        <div className="bg-white/20 backdrop-blur-lg px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/30">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="font-medium text-xs sm:text-sm">{stats.totalOffers} عرض</span>
                          </div>
                        </div>
                        
                        <div className="bg-white/20 backdrop-blur-lg px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/30">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="font-medium text-xs sm:text-sm">
                              {isOrderExpired ? 'انتهت الصلاحية' : timeRemaining ? `متبقي: ${formatTimeRemaining()}` : 'جاري الحساب...'}
                            </span>
                          </div>
                        </div>

                        {/* Pusher Connection Status */}
                        {/* <div className="bg-white/20 backdrop-blur-lg px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/30">
                          <div className="flex items-center gap-1.5">
                            {pusherConnected ? (
                              <>
                                <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="font-medium text-xs sm:text-sm">متصل</span>
                              </>
                            ) : (
                              <>
                                <WifiOff className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="font-medium text-xs sm:text-sm">غير متصل</span>
                              </>
                            )}
                          </div>
                        </div> */}
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
                  <p className="text-xs sm:text-sm opacity-90 font-medium mb-3 text-center">إحصائيات العروض</p>
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
                  <h3 className="text-red-800 font-bold text-base sm:text-lg mb-1">انتهت صلاحية الطلب</h3>
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
              
              {/* {pusherConnected && offers.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">تحديث مباشر</span>
                </div>
              )} */}
            </div>

            {/* {offers.length > 0 && pusherConnected && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-800 flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                🎉 أنت متصل ومستقبل للعروض بشكل مباشر!
              </div>
            )} */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
              {offers.map((offer, index) => {
                const offerStatus = offer.status;
                const orderPaymentStatus = offer.order?.payment_status;
                const isPaymentPending = offerStatus === 'payment_pending' || 
                                        orderPaymentStatus === 'processing' || 
                                        orderPaymentStatus === 'pending';
                
                const isAccepted = acceptedOfferId === offer.id && !isPaymentPending;
                const isPendingPayment = pendingPaymentOfferId === offer.id;
                const isExpired = expiredOfferIds.includes(offer.id) || offerStatus === 'expired';
                const isSelectedForPayment = selectedForPaymentOfferId === offer.id && 
                                           !isAccepted && !isPendingPayment && !isExpired;
                const isPaid = paidOfferIds.has(offer.id);
                
                // Check if this is a new offer (created in last 10 seconds)
                const isNewOffer = new Date(offer.created_at) > new Date(Date.now() - 10000);
                
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
                      onAcceptOrder={() => handleDriverSelect(
                        offer.driver_id, 
                        offer.id, 
                        formatDriverData(offer),
                        offer
                      )}
                      onViewProfile={() => router.push(`/orders/driver_profile?driverId=${offer.driver_id}`)}
                      isPending={!isAccepted && !isPendingPayment && !isExpired && !isSelectedForPayment && !isPaid} 
                      isSelectedForPayment={isSelectedForPayment} 
                      isAccepted={isAccepted}
                      isPendingPayment={isPendingPayment}
                      isExpired={isExpired}
                      isPaid={isPaid}
                      index={index}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* {offers.length > 0 && pusherConnected && (
              <div className="mt-6 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                🚚 في انتظار عروض جديدة...
              </div>
            )} */}

            {offers.length === 0 && !loading && (
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
                  سيتم إشعارك فور وصول أي عرض جديد.
                </p>
                {/* {pusherConnected ? (
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>في انتظار العروض...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
                    <WifiOff className="w-4 h-4" />
                    <span>غير متصل - جاري إعادة الاتصال...</span>
                  </div>
                )} */}
                <button
                  onClick={fetchOffers}
                  disabled={refreshing}
                  className="bg-[#579BE8] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#4a8dd8] transition inline-flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'جاري التحديث...' : 'تحديث العروض'}
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Map Section */}
          <div className="lg:col-span-4 order-1 lg:order-2">
            <div className="sticky top-4 sm:top-8">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden h-[400px] sm:h-[500px] lg:h-[600px]">
                <div className="p-3 sm:p-4 border-b flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">خريطة السائقين</h3>
                  
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
                        <p className="text-sm text-gray-600 mb-4">جاري تحميل الخريطة...</p>
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
        onOfferExpired={handleOfferExpired}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
        router={router}
      />
    </div>
  );
}