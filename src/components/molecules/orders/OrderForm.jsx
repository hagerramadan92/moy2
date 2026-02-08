'use client';

import { useEffect, useState, Suspense, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, ArrowRight, Truck, CheckCircle2, AlertCircle, X, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { FaStar, FaMapMarkerAlt, FaHome, FaBriefcase, FaMapMarkedAlt } from 'react-icons/fa';

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
          </div>
        </div>
      </div>
    )
  }
);

const API_BASE_URL = "https://moya.talaaljazeera.com/api/v1";

function OrderFormContent() {
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForOffers, setIsWaitingForOffers] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  
  const currentOrderIdRef = useRef(null);
  const isRequestInProgress = useRef(false);
  
  const { subscribeToOrderAndUser, unsubscribeAll, addEventListener, removeEventListener } = usePusher({
    autoConnect: true,
    onConnected: () => {
      console.log('✅ Pusher connected');
    },
    onDisconnected: () => {
      console.log('🔴 Pusher disconnected');
    }
  });
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setWaterType(searchParams.get("waterType") || "");
    setQuantity(searchParams.get("waterSize") || "");
  }, [searchParams]);

  useEffect(() => {
    fetchSavedLocations();
  }, []);

  const fetchSavedLocations = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
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
          }
        }
      }
    } catch (error) {
      console.error("Error fetching saved locations:", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleManualLocationSelect = (data) => {
    setLocationData(data);
    setSelectedSavedLocation(null);
    setIsManualLocation(true);
    setIsMapOpen(false);
  };

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

  const handleClearLocation = () => {
    setLocationData(null);
    setSelectedSavedLocation(null);
    setIsManualLocation(false);
  };

  const [touched, setTouched] = useState({
    location: false,
    waterType: false,
    quantity: false
  });
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const validation = {
    location: !!locationData,
    waterType: !!waterType,
    quantity: !!quantity
  };

  const showError = (field) => (touched[field] || attemptedSubmit) && !validation[field];
  const getFieldStatus = (field) => {
    if (validation[field]) return 'success';
    if (showError(field)) return 'error';
    return 'default';
  };

  // دالة معالجة حدث DriverAcceptedOrder
  const handleDriverAcceptedOrder = useCallback((data) => {
    console.log('🚗 DriverAcceptedOrder event received:', data);
    
    const acceptedOrderId = data.order_id;
    const currentOrderId = currentOrderIdRef.current;
    
    if (acceptedOrderId && acceptedOrderId.toString() === currentOrderId?.toString()) {
      console.log(`✅ Driver accepted our order ${currentOrderId}`);
      
      toast.success('🎉 تم قبول طلبك من قبل السائق! جاري التوجيه...', {
        duration: 3000,
        icon: '🚗'
      });

      setIsWaitingForOffers(false);
      setIsLoading(false);
      
      unsubscribeAll();
      removeEventListener('DriverAcceptedOrder');
      
      setTimeout(() => {
        router.push(`/orders/available-drivers?orderId=${currentOrderId}`);
      }, 1000);
    }
  }, [router, unsubscribeAll, removeEventListener]);

  // إعداد مستمع Pusher
  const setupPusherListener = useCallback(async (orderId, userId) => {
    try {
      console.log(`🎯 Setting up Pusher listener for order ${orderId}, user ${userId}`);
      
      currentOrderIdRef.current = orderId;
      
      removeEventListener('DriverAcceptedOrder');
      
      addEventListener('DriverAcceptedOrder', (data) => {
        console.log('🚗 DriverAcceptedOrder event triggered');
        handleDriverAcceptedOrder(data);
      });

      const subscriptionCallbacks = {
        onDriverAcceptedOrder: (data) => {
          console.log('🚗 Driver accepted order via Pusher callback');
          handleDriverAcceptedOrder(data);
        }
      };

      subscribeToOrderAndUser(orderId, userId, subscriptionCallbacks);
      
      console.log('✅ Pusher setup completed');
      
    } catch (error) {
      console.error('❌ Error setting up Pusher listener:', error);
    }
  }, [addEventListener, removeEventListener, handleDriverAcceptedOrder, subscribeToOrderAndUser]);

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
    if (isRequestInProgress.current) {
      toast.error('يرجى الانتظار حتى تكتمل العملية الحالية');
      return;
    }

    isRequestInProgress.current = true;
    setAttemptedSubmit(true);

    if (!locationData || !waterType || !quantity) {
      toast.error('الرجاء ملء جميع البيانات المطلوبة');
      isRequestInProgress.current = false;
      return;
    }

    setIsLoading(true);
    setIsWaitingForOffers(true);

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        toast.error("يرجى تسجيل الدخول أولاً");
        isRequestInProgress.current = false;
        return;
      }

      const userId = await getUserId(accessToken);
      if (!userId) {
        toast.error("لا يمكن الحصول على معلومات المستخدم");
        isRequestInProgress.current = false;
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
          isRequestInProgress.current = false;
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
        
        let orderId = null;
        if (data.data?.id) {
          orderId = data.data.id;
        } else if (data.data?.order_id) {
          orderId = data.data.order_id;
        } else if (data.id) {
          orderId = data.id;
        }
        
        if (!orderId) {
          toast.error('لم يتم الحصول على رقم الطلب من الخادم');
          isRequestInProgress.current = false;
          return;
        }
        
        setCurrentOrderId(orderId);
        currentOrderIdRef.current = orderId;

        await setupPusherListener(orderId, userId);
        
      } else {
        toast.error(data.message || "فشل إنشاء الطلب");
        isRequestInProgress.current = false;
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("حدث خطأ أثناء إنشاء الطلب");
      isRequestInProgress.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToSchedule = () => {
    setAttemptedSubmit(true);
    
    if (!locationData || !waterType || !quantity) {
      toast.error('الرجاء ملء جميع البيانات المطلوبة');
      return;
    }
    
    setShowSchedule(true);
  };

  const cancelWaiting = () => {
    console.log('❌ User cancelled waiting');
    
    unsubscribeAll();
    removeEventListener('DriverAcceptedOrder');
    setIsWaitingForOffers(false);
    setIsLoading(false);
    isRequestInProgress.current = false;
    
    toast('تم إلغاء عملية البحث عن سائقين', {
      icon: '⚠️',
    });
  };

  useEffect(() => {
    return () => {
      unsubscribeAll();
      removeEventListener('DriverAcceptedOrder');
      isRequestInProgress.current = false;
    };
  }, []);

  if (showSchedule) {
    return <OrderSchedulePage 
      onBack={() => setShowSchedule(false)} 
      locationData={locationData}
      selectedSavedLocation={selectedSavedLocation}
      isManualLocation={isManualLocation}
      waterType={waterType}
      quantity={quantity}
    />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-3 md:p-8 flex justify-center items-start pt-12 md:pt-16">
      <LocationPickerModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelect={handleManualLocationSelect}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl space-y-4 md:space-y-6"
      >
        <div className="relative overflow-hidden rounded-xl md:rounded-3xl p-4 md:p-6 shadow-lg border border-[#579BE8]/20 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987]">
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-white font-cairo mb-1">اطلب الآن</h1>
              <p className="text-white/80 text-xs md:text-sm">قم بملء البيانات التالية لإتمام طلبك</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white border border-white/30">
              <Truck size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-xl shadow-[#124987]/10 border border-[#579BE8]/20 relative overflow-hidden">
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-gray-700 font-bold text-sm md:text-base">
                  <MapPin size={18} className={getFieldStatus('location') === 'error' ? 'text-red-500' : 'text-[#579BE8]'} />
                  موقع التوصيل
                </label>
                <button
                  onClick={() => router.push('/myProfile')}
                  className="text-xs px-3 py-1.5 bg-[#579BE8]/10 text-[#579BE8] rounded-lg hover:bg-[#579BE8]/20 transition-colors font-medium flex items-center gap-1"
                >
                  <FaMapMarkerAlt className="w-3 h-3" />
                  <span className="hidden sm:inline">إدارة العناوين</span>
                </button>
              </div>

              {savedLocations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <FaStar className="text-[#579BE8] w-4 h-4" />
                    الأماكن المحفوظة
                  </h3>
                  <div className="space-y-2">
                    {savedLocations.slice(0, 2).map((location) => (
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
                            <h4 className="font-medium text-sm text-gray-900">
                              {location.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {location.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                onClick={() => {
                  setTouched(prev => ({ ...prev, location: true }));
                  setIsMapOpen(true);
                }}
                className={`cursor-pointer relative w-full h-14 md:h-16 rounded-xl md:rounded-2xl flex items-center px-4 overflow-hidden border-2 border-dashed
                  ${getFieldStatus('location') === 'success'
                    ? 'bg-[#579BE8]/5 border-[#579BE8]/50'
                    : getFieldStatus('location') === 'error'
                      ? 'bg-red-50 border-red-300'
                      : 'bg-gradient-to-r from-[#579BE8]/5 to-[#124987]/5 border-[#579BE8]/30'
                  }`}
              >
                <div className="flex-1 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center 
                    ${getFieldStatus('location') === 'success'
                      ? 'bg-gradient-to-r from-[#579BE8] to-[#124987] text-white'
                      : getFieldStatus('location') === 'error'
                        ? 'bg-red-100 text-red-500'
                        : 'bg-[#579BE8]/10 text-[#579BE8]'
                    }`}>
                    <MapPin size={18} />
                  </div>
                  <div className="flex flex-col items-start">
                    {locationData ? (
                      <>
                        <span className="text-sm font-bold text-gray-900">
                          {selectedSavedLocation ? selectedSavedLocation.name : 'موقع على الخريطة'}
                        </span>
                        <span className="text-xs text-gray-600">
                          {locationData.address}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">
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
                    className="p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <WaterTypeSelect
                value={waterType}
                onChange={(value) => {
                  setWaterType(value);
                  setTouched(prev => ({ ...prev, waterType: true }));
                }}
                label="نوع المياه"
                placeholder="اختر نوع المياه"
                status={getFieldStatus('waterType')}
                hasError={showError('waterType')}
                className="h-12 md:h-14"
              />

              <ServiceSelect
                value={quantity}
                onChange={(value) => {
                  setQuantity(value);
                  setTouched(prev => ({ ...prev, quantity: true }));
                }}
                label="الكمية (طن)"
                placeholder="اختر حجم المويه"
                status={getFieldStatus('quantity')}
                hasError={showError('quantity')}
                className="h-12 md:h-14"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <button
                onClick={handleOrderNow}
                disabled={isLoading || isWaitingForOffers}
                className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987] hover:from-[#4a8dd8] hover:via-[#3a7dc8] hover:to-[#0d3a6a] text-white font-bold text-sm md:text-lg shadow-lg shadow-[#124987]/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" />
                    <span className="text-sm">جاري إنشاء الطلب...</span>
                  </>
                ) : isWaitingForOffers ? (
                  <>
                    <Spinner size="sm" />
                    <span className="text-sm">جاري البحث عن سائق...</span>
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
                className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-white border-2 border-[#579BE8]/30 text-[#579BE8] font-bold text-sm md:text-lg hover:bg-gradient-to-r hover:from-[#579BE8]/5 hover:to-[#124987]/5 hover:border-[#579BE8]/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calendar size={16} />
                <span>جدولة الطلب</span>
              </button>
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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-[#579BE8]/20 border border-[#579BE8]/20 w-full max-w-sm"
            >
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 rounded-full border-3 border-[#579BE8]/20 border-t-[#579BE8]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#579BE8] to-[#124987] rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-base font-bold text-[#124987] mb-4">
                    جاري البحث عن سائق...
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    عند قبول السائق للطلب، سيتم توجيهك تلقائياً لصفحة العروض
                  </p>
                  
                  <button
                    onClick={cancelWaiting}
                    className="w-full py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors border border-red-200"
                  >
                    إلغاء البحث
                  </button>
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-[#579BE8] rounded-full animate-spin"></div>
      </div>
    }>
      <OrderFormContent />
    </Suspense>
  );
}