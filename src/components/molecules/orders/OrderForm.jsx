'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, ArrowRight, Truck, CheckCircle2, AlertCircle, Search, ArrowLeft, ChevronDown, ChevronUp, X, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { FaStar, FaMapMarkerAlt, FaHome, FaBriefcase, FaMapMarkedAlt } from 'react-icons/fa';

// استيراد ملفات Pusher الجديدة
import { getPusherInstance, subscribeToOrderAndUserChannels, disconnectPusher } from '@/utils/pusher';
import usePusher from '@/hooks/usePusher';

import OrderSchedulePage from './OrderSchedulePage';
import Spinner from "@/components/ui/spinner";
import WaterTypeSelect from '@/components/common/WaterTypeSelect';
import ServiceSelect from '@/components/common/ServiceSelect';

// LocationPickerModal مع تحسينات الريسبونسيف
const LocationPickerModal = dynamic(
  () => import('./LocationPickerModal'),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-slate-700 max-w-sm w-full mx-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#579BE8]/20 border-t-[#579BE8] rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-[#579BE8] animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">جاري تحميل البيانات...</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">يرجى الانتظار...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
);

const API_BASE_URL = "https://moya.talaaljazeera.com/api/v1";

// Separate component that uses useSearchParams
function OrderFormContent() {
  // State management
  const [waterType, setWaterType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedSavedLocation, setSelectedSavedLocation] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [savedLocations, setSavedLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [locationData, setLocationData] = useState(null);
  
  // New states for API data
  const [waterTypes, setWaterTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingWaterTypes, setLoadingWaterTypes] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // New states for request prevention and Pusher
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForOffers, setIsWaitingForOffers] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [driverAcceptedOrder, setDriverAcceptedOrder] = useState(false);
  const [pusherChannels, setPusherChannels] = useState({ orderChannel: null, userChannel: null });
  
  // استخدام custom hook لـ Pusher
  const {
    isConnected: pusherConnected,
    connectionState: pusherState,
    subscribeToOrderAndUser,
    unsubscribeAll,
    reconnect
  } = usePusher({
    autoConnect: true,
    onConnected: () => {
      console.log('✅ Pusher connected successfully');
    },
    onDisconnected: () => {
      console.log('🔴 Pusher disconnected');
    },
    onError: (error) => {
      console.error('❌ Pusher error:', error);
    }
  });
  
  // Refs for request prevention
  const isRequestInProgress = useRef(false);
  const requestTimeoutRef = useRef(null);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    setWaterType(searchParams.get("waterType") || "");
    setQuantity(searchParams.get("waterSize") || "");
  }, [searchParams]);

  // Fetch all required data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch all required data
  const fetchAllData = async () => {
    try {
      await fetchSavedLocations();
    } catch (error) {
      console.error("Error fetching all data:", error);
      toast.error("حدث خطأ في تحميل البيانات");
    }
  };

  // Fetch saved locations from API
  const fetchSavedLocations = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("يرجى تسجيل الدخول أولاً");
      router.push('/login');
      return;
    }

    try {
      setLoadingLocations(true);
      const response = await fetch(`${API_BASE_URL}/addresses`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.status && data.data) {
        setSavedLocations(data.data);
        if (data.data.length > 0) {
          const favoriteLocation = data.data.find(loc => loc.is_favorite);
          if (favoriteLocation) {
            setSelectedSavedLocation(favoriteLocation);
            setLocationData({
              ...favoriteLocation,
              latitude: parseFloat(favoriteLocation.latitude),
              longitude: parseFloat(favoriteLocation.longitude)
            });
          } else {
            setSelectedSavedLocation(data.data[0]);
            setLocationData({
              ...data.data[0],
              latitude: parseFloat(data.data[0].latitude),
              longitude: parseFloat(data.data[0].longitude)
            });
          }
        }
      } else {
        toast.error(data.message || "فشل جلب الأماكن المحفوظة");
      }
    } catch (error) {
      console.error("Error fetching saved locations:", error);
      toast.error("حدث خطأ أثناء جلب الأماكن المحفوظة");
    } finally {
      setLoadingLocations(false);
    }
  };

  // Navigate to saved addresses page
  const navigateToAddressesPage = () => {
    router.push('/myProfile');
  };

  // Handle manual location selection from map
  const handleManualLocationSelect = (data) => {
    setLocationData(data);
    setSelectedSavedLocation(null);
    setIsManualLocation(true);
    setIsMapOpen(false);
  };

  // Handle saved location selection
  const handleSavedLocationSelect = (location) => {
    setSelectedSavedLocation(location);
    setLocationData({
      ...location,
      latitude: parseFloat(location.latitude),
      longitude: parseFloat(location.longitude)
    });
    setIsManualLocation(false);
    setIsMobileMenuOpen(false);
  };

  // Clear location selection
  const handleClearLocation = () => {
    setLocationData(null);
    setSelectedSavedLocation(null);
    setIsManualLocation(false);
  };

  // Validation state - tracks which fields have been interacted with
  const [touched, setTouched] = useState({
    location: false,
    waterType: false,
    quantity: false
  });
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const router = useRouter();

  // Validation helpers
  const validation = {
    location: !!locationData,
    waterType: !!waterType,
    quantity: !!quantity
  };

  const showError = (field) => (touched[field] || attemptedSubmit) && !validation[field];
  const showSuccess = (field) => validation[field];

  const getFieldStatus = (field) => {
    if (showSuccess(field)) return 'success';
    if (showError(field)) return 'error';
    return 'default';
  };

  // Function to prevent multiple requests
  const preventMultipleRequests = () => {
    if (isRequestInProgress.current) {
      toast.error('يرجى الانتظار حتى تكتمل العملية الحالية');
      return false;
    }

    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }

    isRequestInProgress.current = true;
    
    requestTimeoutRef.current = setTimeout(() => {
      isRequestInProgress.current = false;
    }, 5000);

    return true;
  };

  // Cleanup request prevention
  const cleanupRequestPrevention = () => {
    isRequestInProgress.current = false;
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
      requestTimeoutRef.current = null;
    }
  };

  // Setup Pusher listener for order updates
  const setupPusherListener = async (orderId, userId) => {
    try {
      console.log(`🎯 Setting up Pusher listeners for order ${orderId} and user ${userId}`);
      
      const channels = subscribeToOrderAndUser(orderId, userId, {
        onDriverAcceptedOrder: (data) => {
          console.log('🚗 Driver accepted order via Pusher:', data);
          
          // Check if this event is for our current order
          if (data.order_id && data.order_id.toString() === orderId.toString()) {
            setDriverAcceptedOrder(true);
            
            toast.success('🎉 تم قبول طلبك من قبل السائق!', {
              duration: 5000,
            });

            // Navigate to order tracking page
            setIsWaitingForOffers(false);
            setIsLoading(false);
            cleanupRequestPrevention();
            
            setTimeout(() => {
              router.push(`/orders/tracking?orderId=${orderId}`);
            }, 1000);
          }
        },

        onOfferCreated: (data) => {
          console.log('🎯 New offer received via Pusher:', data);
          
          toast.success('تم استلام عرض جديد!', {
            icon: '🎉',
            duration: 3000,
          });

          // Navigate to drivers page when an offer is received
          setIsWaitingForOffers(false);
          setIsLoading(false);
          cleanupRequestPrevention();
          
          setTimeout(() => {
            router.push(`/orders/available-drivers?orderId=${orderId}`);
          }, 1000);
        },

        onOrderStatusUpdated: (data) => {
          console.log('📊 Order status updated:', data);
          
          if (data.status === 'expired' || data.status === 'cancelled') {
            toast.error(`تم ${data.status === 'expired' ? 'انتهاء' : 'إلغاء'} الطلب`, {
              icon: '⚠️',
              duration: 5000,
            });
            
            setIsWaitingForOffers(false);
            setIsLoading(false);
            cleanupRequestPrevention();
            
            if (data.status === 'expired') {
              localStorage.setItem(`order_${orderId}_expired`, 'true');
            }
          }
        },

        onDriverAssigned: (data) => {
          console.log('👤 Driver assigned to order:', data);
          // يمكنك إضافة معالجة إضافية هنا
        },

        onOrderUpdated: (data) => {
          console.log('📝 Order updated:', data);
          // يمكنك إضافة معالجة إضافية هنا
        }
      });

      setPusherChannels(channels);
      return channels;
      
    } catch (error) {
      console.error('❌ Error setting up Pusher listener:', error);
      return null;
    }
  };

  // Cleanup Pusher listener
  const cleanupPusherListener = () => {
    unsubscribeAll();
    setPusherChannels({ orderChannel: null, userChannel: null });
  };

  // دالة للحصول على معرف المستخدم
  const getUserId = async (accessToken) => {
    try {
      const userResponse = await fetch(`${API_BASE_URL}/auth/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.status && userData.data) {
          return userData.data.id;
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch user ID:', error);
    }
    return null;
  };

  const handleOrderNow = async () => {
    if (!preventMultipleRequests()) {
      return;
    }

    setAttemptedSubmit(true);

    if (!locationData) {
      toast.error('الرجاء تحديد الموقع أولاً');
      cleanupRequestPrevention();
      return;
    }
    if (!waterType) {
      toast.error('الرجاء اختيار نوع المياه');
      cleanupRequestPrevention();
      return;
    }
    if (!quantity) {
      toast.error('الرجاء اختيار الكمية');
      cleanupRequestPrevention();
      return;
    }

    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        toast.error("يرجى تسجيل الدخول أولاً");
        cleanupRequestPrevention();
        return;
      }

      // Get user ID
      const userId = await getUserId(accessToken);
      if (!userId) {
        toast.error("لا يمكن الحصول على معلومات المستخدم");
        setIsLoading(false);
        cleanupRequestPrevention();
        return;
      }

      const orderData = {
        service_id: parseInt(quantity),
        water_type_id: parseInt(waterType),
        saved_location_id: selectedSavedLocation ? selectedSavedLocation.id : null
      };

      let savedLocationId = selectedSavedLocation ? selectedSavedLocation.id : null;
      
      if (isManualLocation && locationData) {
        const newAddressResponse = await fetch(`${API_BASE_URL}/addresses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: locationData.name || 'موقع الطلب',
            address: locationData.address,
            city: locationData.city || 'الرياض',
            area: locationData.area || 'حي عام',
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            type: 'other',
            is_favorite: false,
            additional_info: 'موقع طلب'
          }),
        });

        const addressData = await newAddressResponse.json();
        if (newAddressResponse.ok && addressData.status && addressData.data) {
          savedLocationId = addressData.data.id;
        } else {
          toast.error("فشل حفظ العنوان الجديد");
          setIsLoading(false);
          cleanupRequestPrevention();
          return;
        }
      }

      orderData.saved_location_id = savedLocationId;

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      console.log('📦 Order creation response:', data);
      
      if (response.ok && data.status) {
        toast.success(data.message || "تم إنشاء الطلب بنجاح!");
        
        let orderId;
        
        if (data.data?.id) {
          orderId = data.data.id;
        } else if (data.data?.order_id) {
          orderId = data.data.order_id;
        } else if (data.id) {
          orderId = data.id;
        } else if (data.order_id) {
          orderId = data.order_id;
        } else if (data.order?.id) {
          orderId = data.order.id;
        } else {
          console.warn('⚠️ Could not find orderId in response');
          toast.error('لم يتم الحصول على رقم الطلب من الخادم');
          setIsLoading(false);
          cleanupRequestPrevention();
          return;
        }
        
        console.log('✅ Order ID retrieved:', orderId);
        setCurrentOrderId(orderId);

        // Setup Pusher listener with user ID
        const channels = await setupPusherListener(orderId, userId);
        
        // Start waiting for offers
        await waitForOffers(orderId, accessToken, channels);
        
      } else {
        toast.error(data.message || "فشل إنشاء الطلب");
        setIsLoading(false);
        cleanupRequestPrevention();
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("حدث خطأ أثناء إنشاء الطلب");
      setIsLoading(false);
      cleanupRequestPrevention();
    }
  };

  const waitForOffers = async (orderId, accessToken, pusherChannels = null) => {
    setIsWaitingForOffers(true);
    setWaitingMessage('جاري البحث عن سائقين متاحين...');
    
    const startTime = Date.now();
    let pollIntervalId = null;
    
    let expiresAt = null;
    try {
      const statusResponse = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        cache: 'no-store'
      });
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.status && statusData.data) {
          expiresAt = statusData.data?.expires_in?.expires_at || null;
          console.log('⏰ Expires at from status:', expiresAt);
        }
      }
    } catch (statusError) {
      console.warn('⚠️ Could not fetch order status:', statusError);
    }

    const maxWaitTime = expiresAt ? 
      Math.min(new Date(expiresAt).getTime() - Date.now(), 60000) : 
      60000;
      console.log('⏰ Max wait time:', maxWaitTime);

    // إذا لم يكن Pusher متصلاً، استخدم polling
    if (!pusherChannels || !pusherConnected) {
      console.log('🔄 Pusher not connected, falling back to polling');
      
      const checkForOffers = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/orders/${orderId}/offers`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            cache: 'no-store'
          });

          if (response.status === 404) {
            return false;
          }

          const data = await response.json();
          
          if (response.ok && data.status && data.data) {
            const offers = data.data.offers || [];
            const activeOffers = offers.filter(offer => {
              return offer.status !== 'expired' && offer.status !== 'cancelled';
            });
            
            if (activeOffers.length > 0) {
              if (pollIntervalId) {
                clearInterval(pollIntervalId);
              }
              
              setIsWaitingForOffers(false);
              setIsLoading(false);
              cleanupRequestPrevention();
              toast.success(`تم العثور على ${activeOffers.length} عرض متاح`);
              
              router.push(`/orders/available-drivers?orderId=${orderId}`);
              return true;
            }
          }
          
          return false;
        } catch (error) {
          console.error("Error checking for offers:", error);
          return false;
        }
      };

      const hasOffers = await checkForOffers();
      if (hasOffers) return;

      pollIntervalId = setInterval(async () => {
        const elapsedTime = Date.now() - startTime;
        
        if (elapsedTime < 10000) {
          setWaitingMessage('جاري البحث عن سائقين متاحين...');
        } else if (elapsedTime < 30000) {
          setWaitingMessage('لا يزال البحث جارياً عن سائقين...');
        } else {
          setWaitingMessage('قد يستغرق الأمر بعض الوقت، يرجى الانتظار...');
        }

        const hasOffers = await checkForOffers();
        if (hasOffers) {
          if (pollIntervalId) {
            clearInterval(pollIntervalId);
          }
          return;
        }

        if (elapsedTime >= maxWaitTime) {
          if (pollIntervalId) {
            clearInterval(pollIntervalId);
          }
          
          const isExpired = expiresAt && new Date(expiresAt).getTime() <= Date.now();
          
          if (isExpired) {
            toast.error('تم انتهاء وقت الطلب', {
              icon: '⏰',
              duration: 5000,
            });
            localStorage.setItem(`order_${orderId}_expired`, 'true');
          }
          
          setIsWaitingForOffers(false);
          setIsLoading(false);
          cleanupRequestPrevention();
          router.push(`/orders/available-drivers?orderId=${orderId}${isExpired ? '&expired=true' : ''}`);
        }
      }, 2000);

      return () => {
        if (pollIntervalId) {
          clearInterval(pollIntervalId);
        }
      };
    } else {
      console.log('🎯 Using Pusher for real-time updates');
      
      const timeoutId = setTimeout(() => {
        const isExpired = expiresAt && new Date(expiresAt).getTime() <= Date.now();
        
        if (isExpired) {
          toast.error('تم انتهاء وقت الطلب', {
            icon: '⏰',
            duration: 5000,
          });
          localStorage.setItem(`order_${orderId}_expired`, 'true');
        }
        
        setIsWaitingForOffers(false);
        setIsLoading(false);
        cleanupRequestPrevention();
        router.push(`/orders/available-drivers?orderId=${orderId}${isExpired ? '&expired=true' : ''}`);
      }, maxWaitTime);

      const messageIntervalId = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        
        if (elapsedTime < 10000) {
          setWaitingMessage('جاري الاستماع للعروض...');
        } else if (elapsedTime < 30000) {
          setWaitingMessage('لا يزال البحث جارياً عن سائقين...');
        } else {
          setWaitingMessage('نستقبل العروض في الوقت الفعلي...');
        }
      }, 5000);

      return () => {
        clearTimeout(timeoutId);
        clearInterval(messageIntervalId);
      };
    }
  };

  const handleGoToSchedule = () => {
    if (!preventMultipleRequests()) {
      return;
    }

    setAttemptedSubmit(true);
    
    if (!locationData) {
      toast.error('الرجاء تحديد الموقع أولاً');
      cleanupRequestPrevention();
      return;
    }
    if (!waterType) {
      toast.error('الرجاء اختيار نوع المياه');
      setTouched(prev => ({ ...prev, waterType: true }));
      cleanupRequestPrevention();
      return;
    }
    if (!quantity) {
      toast.error('الرجاء اختيار الكمية');
      setTouched(prev => ({ ...prev, quantity: true }));
      cleanupRequestPrevention();
      return;
    }
    
    setShowSchedule(true);
    cleanupRequestPrevention();
  };

  const handleScheduleOrder = async (scheduleData) => {
    if (!preventMultipleRequests()) {
      return;
    }

    setAttemptedSubmit(true);

    if (!locationData) {
      toast.error('الرجاء تحديد الموقع أولاً');
      cleanupRequestPrevention();
      return;
    }
    if (!waterType) {
      toast.error('الرجاء اختيار نوع المياه');
      cleanupRequestPrevention();
      return;
    }
    if (!quantity) {
      toast.error('الرجاء اختيار الكمية');
      cleanupRequestPrevention();
      return;
    }

    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        toast.error("يرجى تسجيل الدخول أولاً");
        cleanupRequestPrevention();
        return;
      }

      const orderData = {
        service_id: parseInt(quantity),
        water_type_id: parseInt(waterType),
        saved_location_id: selectedSavedLocation ? selectedSavedLocation.id : null,
        order_date: scheduleData.dateTime,
        notes: scheduleData.notes || "توصيل مجدول"
      };

      let savedLocationId = selectedSavedLocation ? selectedSavedLocation.id : null;
      
      if (isManualLocation && locationData) {
        const newAddressResponse = await fetch(`${API_BASE_URL}/addresses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: locationData.name || 'موقع مجدول',
            address: locationData.address,
            city: locationData.city || 'الرياض',
            area: locationData.area || 'حي عام',
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            type: 'other',
            is_favorite: false,
            additional_info: 'موقع مجدول'
          }),
        });

        const addressData = await newAddressResponse.json();
        if (newAddressResponse.ok && addressData.status && addressData.data) {
          savedLocationId = addressData.data.id;
        } else {
          toast.error("فشل حفظ العنوان الجديد");
          setIsLoading(false);
          cleanupRequestPrevention();
          return;
        }
      }

      orderData.saved_location_id = savedLocationId;

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      
      if (response.ok && data.status) {
        toast.success(data.message || "تم جدولة الطلب بنجاح!");
        router.push('/');
      } else {
        toast.error(data.message || "فشل جدولة الطلب");
      }
    } catch (error) {
      console.error("Error scheduling order:", error);
      toast.error("حدث خطأ أثناء جدولة الطلب");
    } finally {
      setIsLoading(false);
      cleanupRequestPrevention();
    }
  };

  // إضافة مؤشر حالة اتصال Pusher
  const PusherStatusIndicator = () => (
    <div className="fixed bottom-4 left-4 z-40">
      <div className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border flex items-center gap-2 ${
        pusherState === 'connected' 
          ? 'bg-green-500/10 text-green-700 border-green-500/20' 
          : pusherState === 'connecting'
          ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'
          : 'bg-red-500/10 text-red-700 border-red-500/20'
      }`}>
        {pusherState === 'connected' ? (
          <Wifi size={12} className="text-green-500" />
        ) : (
          <WifiOff size={12} className="text-red-500" />
        )}
        <span>
          {pusherState === 'connected' 
            ? 'متصال' 
            : pusherState === 'connecting'
            ? 'جاري الاتصال...'
            : 'غير متصل'}
        </span>
      </div>
    </div>
  );

  useEffect(() => {
    return () => {
      cleanupRequestPrevention();
      cleanupPusherListener();
    };
  }, []);

  if (showSchedule) {
    return <OrderSchedulePage 
      onBack={() => setShowSchedule(false)} 
      onSchedule={handleScheduleOrder}
      locationData={locationData}
      selectedSavedLocation={selectedSavedLocation}
      isManualLocation={isManualLocation}
      waterType={waterType}
      quantity={quantity}
      waterTypes={waterTypes}
      services={services}
    />;
  }

  const displayedLocations = showAllLocations 
    ? savedLocations 
    : savedLocations.slice(0, 1);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-3 md:p-8 flex justify-center items-start pt-12 md:pt-16">
      {/* مؤشر حالة Pusher */}
      <PusherStatusIndicator />

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">الأماكن المحفوظة</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto max-h-[calc(100vh-120px)]">
                {loadingLocations ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner />
                    <span className="mr-2 text-sm text-gray-500">جاري تحميل الأماكن...</span>
                  </div>
                ) : savedLocations.length > 0 ? (
                  <div className="space-y-3">
                    {savedLocations.map((location) => (
                      <div
                        key={location.id}
                        onClick={() => handleSavedLocationSelect(location)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedSavedLocation?.id === location.id
                            ? 'bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/5 border-[#579BE8]'
                            : 'bg-gray-50/50 border-gray-200 hover:border-[#579BE8]/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            selectedSavedLocation?.id === location.id
                              ? 'bg-[#579BE8] text-white'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {location.type === 'home' ? <FaHome className="w-4 h-4" /> :
                             location.type === 'work' ? <FaBriefcase className="w-4 h-4" /> :
                             <FaMapMarkedAlt className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm text-gray-900">
                                {location.name}
                              </h4>
                              {location.is_favorite && (
                                <FaStar className="text-[#579BE8] w-3 h-3 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {location.address}
                            </p>
                            {selectedSavedLocation?.id === location.id && (
                              <div className="mt-1">
                                <span className="text-xs px-2 py-0.5 bg-[#579BE8]/10 text-[#579BE8] rounded">
                                  محددة حالياً
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <MapPin className="text-gray-400" size={24} />
                    </div>
                    <p className="text-gray-500">لا توجد أماكن محفوظة</p>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsMapOpen(true);
                      }}
                      className="mt-4 px-4 py-2 bg-[#579BE8] text-white rounded-lg text-sm"
                    >
                      إضافة موقع جديد
                    </button>
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsMapOpen(true);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-[#579BE8] to-[#124987] text-white rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <MapPin size={18} />
                  تحديد موقع جديد
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LocationPickerModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelect={handleManualLocationSelect}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-3xl space-y-4 md:space-y-6 relative"
      >

        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-xl md:rounded-3xl p-4 md:p-6 shadow-lg border border-[#579BE8]/20 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987]">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
          </div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-white font-cairo mb-1">اطلب الآن</h1>
              <p className="text-white/80 text-xs md:text-sm">قم بملء البيانات التالية لإتمام طلبك</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white border border-white/30">
              <Truck size={20} />
            </div>
          </div>
        </motion.div>

        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-xl shadow-[#124987]/10 border border-[#579BE8]/20 relative overflow-hidden">

          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987]" />

          <div className="space-y-6 md:space-y-8">

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-gray-700 font-bold text-sm md:text-base">
                  <MapPin size={18} className={getFieldStatus('location') === 'error' ? 'text-red-500' : 'text-[#579BE8]'} />
                  موقع التوصيل
                </label>
                <button
                  onClick={navigateToAddressesPage}
                  className="text-xs px-3 py-1.5 bg-[#579BE8]/10 text-[#579BE8] rounded-lg hover:bg-[#579BE8]/20 transition-colors font-medium flex items-center gap-1"
                >
                  <FaMapMarkerAlt className="w-3 h-3" />
                  <span className="hidden sm:inline">إدارة العناوين</span>
                  <span className="sm:hidden">العناوين</span>
                </button>
              </div>

              {loadingLocations ? (
                <div className="flex items-center justify-center py-4">
                  <Spinner size="sm" />
                  <span className="mr-2 text-sm text-gray-500">جاري تحميل الأماكن المحفوظة...</span>
                </div>
              ) : savedLocations.length > 0 && (
                <>
                  <div className="hidden md:block space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <FaStar className="text-[#579BE8] w-4 h-4" />
                        الأماكن المحفوظة
                      </h3>
                      {savedLocations.length > 1 && (
                        <button
                          onClick={() => setShowAllLocations(!showAllLocations)}
                          className="text-xs text-[#579BE8] hover:text-[#124987] flex items-center gap-1"
                        >
                          {showAllLocations ? (
                            <>
                              <ChevronUp size={12} />
                              إخفاء البعض
                            </>
                          ) : (
                            <>
                              <ChevronDown size={12} />
                              عرض الكل ({savedLocations.length})
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {displayedLocations.map((location) => (
                        <div
                          key={location.id}
                          onClick={() => {
                            setTouched(prev => ({ ...prev, location: true }));
                            handleSavedLocationSelect(location);
                          }}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedSavedLocation?.id === location.id
                              ? 'bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/5 border-[#579BE8]'
                              : 'bg-gray-50/50 border-gray-200 hover:border-[#579BE8]/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              selectedSavedLocation?.id === location.id
                                ? 'bg-[#579BE8] text-white'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {location.type === 'home' ? <FaHome className="w-4 h-4" /> :
                               location.type === 'work' ? <FaBriefcase className="w-4 h-4" /> :
                               <FaMapMarkedAlt className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm text-gray-900 truncate">
                                  {location.name}
                                </h4>
                                {location.is_favorite && (
                                  <FaStar className="text-[#579BE8] w-3 h-3 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 truncate">
                                {location.address}
                              </p>
                              {selectedSavedLocation?.id === location.id && (
                                <div className="mt-1 flex items-center gap-1">
                                  <span className="text-xs px-2 py-0.5 bg-[#579BE8]/10 text-[#579BE8] rounded">
                                    محدد
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:hidden">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <FaStar className="text-[#579BE8] w-4 h-4" />
                        الأماكن المحفوظة
                      </h3>
                      <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="text-xs text-[#579BE8] hover:text-[#124987] flex items-center gap-1"
                      >
                        عرض الكل
                        <ChevronDown size={12} />
                      </button>
                    </div>
                    
                    {selectedSavedLocation && (
                      <div
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-3 rounded-xl border-2 border-[#579BE8] bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/5 cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#579BE8] text-white flex items-center justify-center">
                            {selectedSavedLocation.type === 'home' ? <FaHome className="w-4 h-4" /> :
                             selectedSavedLocation.type === 'work' ? <FaBriefcase className="w-4 h-4" /> :
                             <FaMapMarkedAlt className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm text-gray-900 truncate">
                                {selectedSavedLocation.name}
                              </h4>
                              {selectedSavedLocation.is_favorite && (
                                <FaStar className="text-[#579BE8] w-3 h-3 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {selectedSavedLocation.address}
                            </p>
                            <div className="mt-1">
                              <span className="text-xs px-2 py-0.5 bg-[#579BE8]/10 text-[#579BE8] rounded">
                                محددة حالياً
                              </span>
                            </div>
                          </div>
                          <ChevronDown className="text-gray-400" size={16} />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="pt-2">
                <div
                  onClick={() => {
                    setTouched(prev => ({ ...prev, location: true }));
                    setIsMapOpen(true);
                  }}
                  className={`group cursor-pointer relative w-full h-14 md:h-16 rounded-xl md:rounded-2xl transition-all duration-300 flex items-center px-3 md:px-4 overflow-hidden border-2 border-dashed
                    ${getFieldStatus('location') === 'success'
                      ? 'bg-[#579BE8]/5 border-[#579BE8]/50 hover:border-[#579BE8]/70'
                      : getFieldStatus('location') === 'error'
                        ? 'bg-red-50 border-red-300 hover:border-red-400'
                        : 'bg-gradient-to-r from-[#579BE8]/5 to-[#124987]/5 hover:from-[#579BE8]/10 hover:to-[#124987]/10 border-[#579BE8]/30 hover:border-[#579BE8]/60'
                    }`}
                >
                  <div className="flex-1 flex items-center gap-2 md:gap-3">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-colors 
                      ${getFieldStatus('location') === 'success'
                        ? 'bg-gradient-to-r from-[#579BE8] to-[#124987] text-white'
                        : getFieldStatus('location') === 'error'
                          ? 'bg-red-100 text-red-500'
                          : 'bg-[#579BE8]/10 text-[#579BE8]'
                      }`}>
                      <MapPin size={18} />
                    </div>
                  <div className="flex flex-col items-start overflow-hidden flex-1">
                    {locationData ? (
                      <>
                        <span className="text-xs md:text-sm font-bold text-gray-900 truncate w-full text-right">
                          {selectedSavedLocation ? selectedSavedLocation.name : 'موقع على الخريطة'}
                        </span>
                        <span className="text-xs text-gray-600 truncate w-full text-right mt-0.5">
                          {locationData.address || selectedSavedLocation?.address}
                        </span>
                        <span className="text-[#579BE8] text-xs mt-0.5">
                          ✓ {isManualLocation ? 'موقع على الخريطة' : 'مكان محفوظ'}
                        </span>
                      </>
                    ) : (
                      <span className={`text-xs md:text-sm font-medium truncate w-full text-right ${
                        getFieldStatus('location') === 'error' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        اضغط لتحديد موقع جديد
                      </span>
                    )}
                  </div>
                  </div>
                  {locationData && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearLocation();
                      }}
                      className="absolute left-2 md:left-3 p-1 md:p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  )}
                  <div className="bg-gradient-to-r from-[#579BE8] to-[#124987] text-white p-1.5 md:p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity absolute left-2 md:left-3">
                    <ArrowRight size={14} />
                  </div>
                </div>
                <AnimatePresence>
                  {showError('location') && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-xs flex items-center gap-1 mt-1"
                    >
                      <AlertCircle size={12} />
                      الرجاء تحديد موقع التوصيل
                    </motion.p>
                  )}
                </AnimatePresence>
                {locationData && isManualLocation && (
                  <div className="mt-2 p-2 md:p-3 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-xs text-green-700 flex items-center gap-2">
                      <CheckCircle2 size={12} />
                      سيتم حفظ هذا الموقع تلقائياً مع الطلب
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2 md:space-y-3">
              <WaterTypeSelect
                value={waterType}
                onChange={(value) => {
                  setWaterType(value);
                  setTouched(prev => ({ ...prev, waterType: true }));
                }}
                onTouched={() => setTouched(prev => ({ ...prev, waterType: true }))}
                label="نوع المياه"
                placeholder="اختر نوع المياه"
                status={getFieldStatus('waterType')}
                hasError={showError('waterType')}
                className="h-12 md:h-14"
              />
            </div>

            <div className="space-y-2 md:space-y-3">
              <ServiceSelect
                value={quantity}
                onChange={(value) => {
                  setQuantity(value);
                  setTouched(prev => ({ ...prev, quantity: true }));
                }}
                onTouched={() => setTouched(prev => ({ ...prev, quantity: true }))}
                label="الكمية (طن)"
                placeholder="اختر حجم المويه"
                status={getFieldStatus('quantity')}
                hasError={showError('quantity')}
                className="h-12 md:h-14"
              />
            </div>
            </div>

            <motion.div variants={itemVariants} className="pt-2 md:pt-4 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <button
                onClick={handleOrderNow}
                disabled={isLoading || isWaitingForOffers}
                className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987] hover:from-[#4a8dd8] hover:via-[#3a7dc8] hover:to-[#0d3a6a] text-white font-bold text-sm md:text-lg shadow-lg shadow-[#124987]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" />
                    <span className="text-sm">جاري إنشاء الطلب...</span>
                  </>
                ) : isWaitingForOffers ? (
                  <>
                    <Spinner size="sm" />
                    <span className="text-sm">جاري البحث عن سائقين...</span>
                  </>
                ) : (
                  <>
                    <span>اطلب الآن</span>
                    <ArrowLeft size={16} />
                  </>
                )}
              </button>

            <button
              onClick={handleGoToSchedule}
              disabled={isLoading || isWaitingForOffers}
              className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-white border-2 border-[#579BE8]/30 text-[#579BE8] font-bold text-sm md:text-lg hover:bg-gradient-to-r hover:from-[#579BE8]/5 hover:to-[#124987]/5 hover:border-[#579BE8]/50 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calendar size={16} />
              <span>جدولة الطلب</span>
            </button>
            </motion.div>

            <div className="pt-3 md:pt-4 border-t border-gray-100">
              <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-blue-50/50 rounded-xl">
                <AlertCircle size={16} className="text-[#579BE8] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600">
                    • يمكنك اختيار مكان محفوظ أو تحديد موقع جديد على الخريطة
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    • المواقع الجديدة سيتم حفظها تلقائياً مع الطلب
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    • حالة الاتصال: 
                    <span className={`ml-2 font-medium ${pusherConnected ? 'text-green-600' : 'text-yellow-600'}`}>
                      {pusherConnected ? 'متصل ✓' : 'جاري الاتصال...'}
                    </span>
                  </p>
                  {driverAcceptedOrder && (
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      • 🚗 تم قبول طلبك من قبل سائق! جاري التوجيه...
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

      </motion.div>

      <AnimatePresence>
        {(isLoading || isWaitingForOffers) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white/95 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl shadow-[#579BE8]/20 border border-[#579BE8]/20 w-full max-w-xs md:max-w-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987]" />
              <div className="flex items-center gap-3 md:gap-4">
                <div className="relative flex-shrink-0">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border-3 border-[#579BE8]/20 border-t-[#579BE8]"
                    style={{ borderWidth: '3px' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-6 h-6 md:w-7 md:h-7 bg-gradient-to-r from-[#579BE8] to-[#124987] rounded-lg flex items-center justify-center shadow-md"
                    >
                      {isWaitingForOffers ? (
                        pusherConnected ? (
                          <div className="relative">
                            <div className="w-3 h-3 bg-white rounded-full" />
                            <div className="absolute -inset-1 border-2 border-white/30 rounded-full animate-ping" />
                          </div>
                        ) : (
                          <Truck size={12} className="text-white" />
                        )
                      ) : (
                        <Search size={12} className="text-white" />
                      )}
                    </motion.div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-[#124987] font-cairo">
                    {isWaitingForOffers 
                      ? waitingMessage || 'جاري البحث عن سائقين متاحين...'
                      : isManualLocation 
                        ? 'جاري حفظ الموقع وإنشاء الطلب' 
                        : 'جاري إنشاء الطلب'
                    }
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <p className="text-gray-400 text-xs">
                      {isWaitingForOffers 
                        ? (pusherConnected ? 'نستقبل العروض في الوقت الفعلي' : 'يرجى الانتظار حتى يتوفر عرض')
                        : 'يرجى الانتظار'
                      }
                    </p>
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                          className="w-1 h-1 bg-[#579BE8] rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                  {isWaitingForOffers && (
                    <div className={`mt-2 text-xs flex items-center gap-1 ${pusherConnected ? 'text-green-600' : 'text-yellow-600'}`}>
                      {pusherConnected ? (
                        <>
                          <Wifi size={10} />
                          <span>متصل بخدمة البث المباشر</span>
                        </>
                      ) : (
                        <>
                          <WifiOff size={10} />
                          <span>جاري محاولة الاتصال...</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


export default function OrderForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-[#579BE8] rounded-full"></div>
          </div>
          <p className="text-gray-500">جاري تحميل نموذج الطلب...</p>
        </div>
      </div>
    }>
      <OrderFormContent />
    </Suspense>
  );
}