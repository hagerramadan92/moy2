'use client';

import { useEffect, useState, Suspense, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, ArrowRight, Truck, CheckCircle2, AlertCircle, X, ArrowLeft, Navigation, Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { FaStar, FaMapMarkerAlt, FaHome, FaBriefcase, FaMapMarkedAlt, FaPlus, FaTrashAlt, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import usePusher from '@/hooks/usePusher';
import { BiCurrentLocation } from "react-icons/bi";
import { FaBuilding, FaInfoCircle } from "react-icons/fa";
import OrderSchedulePage from './OrderSchedulePage';
import Spinner from "@/components/ui/spinner";
import WaterTypeSelect from '@/components/common/WaterTypeSelect';
import ServiceSelect from '@/components/common/ServiceSelect';
import Swal from "sweetalert2";
import { FaRegTrashCan } from 'react-icons/fa6';
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

const API_BASE_URL = "https://dashboard.waytmiah.com/api/v1";

// دالة للحصول على اسم المكان من الإحداثيات
const getAddressFromCoordinates = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
      {
        headers: {
          'Accept-Language': 'ar'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error("Error getting address from coordinates:", error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};
 
// Add Address Modal Component
function AddAddressModal({ isOpen, onClose, onAddressAdded }) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'الرياض',
    area: '',
    latitude: '',
    longitude: '',
    type: 'home',
    additional_info: '',
    is_favorite: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMapSelect = async (locationData) => {
    setIsLoadingAddress(true);
    try {
      // الحصول على اسم المكان من الإحداثيات
      const addressName = await getAddressFromCoordinates(locationData.lat, locationData.lng);
      
      setFormData(prev => ({
        ...prev,
        latitude: locationData.lat.toString(),
        longitude: locationData.lng.toString(),
        address: addressName // استخدام اسم المكان بدلاً من الإحداثيات
      }));
      
      toast.success("تم تحديد الموقع بنجاح");
    } catch (error) {
      console.error("Error getting address:", error);
      setFormData(prev => ({
        ...prev,
        latitude: locationData.lat.toString(),
        longitude: locationData.lng.toString(),
        address: `${locationData.lat.toFixed(6)}, ${locationData.lng.toFixed(6)}`
      }));
    } finally {
      setIsLoadingAddress(false);
      setIsMapOpen(false);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('الرجاء إدخال اسم العنوان');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('الرجاء إدخال العنوان الكامل');
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      toast.error('الرجاء تحديد الموقع على الخريطة');
      return;
    }

    setIsSubmitting(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        toast.error("يرجى تسجيل الدخول أولاً");
        return;
      }

      // تأكد من إرسال قيم خطوط الطول والعرض كأرقام
      const dataToSend = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      console.log("Sending address data:", dataToSend);

      const response = await fetch(`${API_BASE_URL}/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();
      console.log("Address creation response:", data);
      
      if (response.ok && data.status) {
        toast.success(data.message || "تم إضافة العنوان بنجاح");
        onAddressAdded(data.data);
        onClose();
        // Reset form
        setFormData({
          name: '',
          address: '',
          city: 'الرياض',
          area: '',
          latitude: '',
          longitude: '',
          type: 'home',
          additional_info: '',
          is_favorite: false
        });
      } else {
        toast.error(data.message || "فشل إضافة العنوان");
      }
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("حدث خطأ أثناء إضافة العنوان");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <LocationPickerModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelect={handleMapSelect}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
        <div className="bg-white dark:bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FaMapMarkerAlt className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black">إضافة عنوان جديد</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* Name Field */}
            <div className="bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/5 rounded-xl p-5 border-2 border-[#579BE8]/20">
              <label className="text-sm font-bold text-foreground mb-3 block flex items-center gap-2">
                <FaMapMarkerAlt className="text-[#579BE8] w-4 h-4" />
                اسم العنوان
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-white dark:bg-card border-2 border-border/50 focus:border-[#579BE8] rounded-xl"
                placeholder="مثال: المنزل، العمل، etc"
              />
            </div>

            {/* Location Selection */}
            <div className="bg-secondary/30 rounded-xl p-5 border border-border/50">
              <label className="text-sm font-bold text-foreground mb-3 block flex items-center gap-2">
                <MapPin className="text-[#579BE8] w-4 h-4" />
                الموقع على الخريطة
              </label>
              <button
                onClick={() => setIsMapOpen(true)}
                disabled={isLoadingAddress}
                className="w-full h-14 bg-white dark:bg-card border-2 border-dashed border-[#579BE8]/30 rounded-xl flex items-center justify-center gap-2 text-[#579BE8] hover:bg-[#579BE8]/5 transition-all disabled:opacity-50"
              >
                {isLoadingAddress ? (
                  <>
                    <Spinner size="sm" />
                    <span className="font-bold">جاري تحميل العنوان...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5" />
                    <span className="font-bold">اختر الموقع على الخريطة</span>
                  </>
                )}
              </button>
              {formData.latitude && formData.longitude && (
                <div className="mt-3 p-3 bg-[#579BE8]/10 rounded-xl border border-[#579BE8]/20">
                  <p className="text-xs text-muted-foreground">الإحداثيات:</p>
                  <p className="text-sm font-mono">
                    {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                  </p>
                </div>
              )}
            </div>

            {/* Full Address Field */}
            <div className="bg-secondary/30 rounded-xl p-5 border border-border/50">
              <label className="text-sm font-bold text-foreground mb-3 block flex items-center gap-2">
                <FaMapMarkerAlt className="text-[#579BE8] w-4 h-4" />
                العنوان الكامل
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full p-4 bg-white dark:bg-card border-2 border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#579BE8] focus:border-[#579BE8] resize-none"
                rows="3"
                placeholder="سيتم ملء العنوان تلقائياً عند اختيار الموقع"
                readOnly={isLoadingAddress}
              />
              {formData.latitude && formData.longitude && !formData.address && (
                <p className="text-xs text-amber-600 mt-2">
                  يرجى الانتظار... جاري تحميل العنوان
                </p>
              )}
            </div>

            {/* City and Area Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-secondary/30 rounded-xl p-5 border border-border/50">
                <label className="text-sm font-bold text-foreground mb-3 block flex items-center gap-2">
                  <FaBuilding className="text-[#579BE8] w-4 h-4" />
                  المدينة
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full bg-white dark:bg-card border-2 border-border/50 focus:border-[#579BE8] rounded-xl"
                  placeholder="المدينة"
                />
              </div>

              <div className="bg-secondary/30 rounded-xl p-5 border border-border/50">
                <label className="text-sm font-bold text-foreground mb-3 block flex items-center gap-2">
                  <BiCurrentLocation className="text-[#579BE8] w-4 h-4" />
                  المنطقة
                </label>
                <Input
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  className="w-full bg-white dark:bg-card border-2 border-border/50 focus:border-[#579BE8] rounded-xl"
                  placeholder="المنطقة"
                />
              </div>
            </div>

            {/* Type and Favorite */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-secondary/30 rounded-xl p-5 border border-border/50">
                <label className="text-sm font-bold text-foreground mb-3 block">النوع</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-3 bg-white dark:bg-card border-2 border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#579BE8] focus:border-[#579BE8]"
                >
                  <option value="home">🏠 منزل</option>
                  <option value="work">💼 عمل</option>
                  <option value="other">📍 أخرى</option>
                </select>
              </div>

              <div className="bg-secondary/30 rounded-xl p-5 border border-border/50 flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_favorite"
                    checked={formData.is_favorite}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_favorite: e.target.checked }))}
                    className="w-6 h-6 rounded border-2 border-border/50 text-[#579BE8] focus:ring-[#579BE8] cursor-pointer"
                  />
                  <label htmlFor="is_favorite" className="text-sm font-bold text-foreground cursor-pointer flex items-center gap-2">
                    <FaStar className={`w-5 h-5 ${formData.is_favorite ? 'text-[#579BE8]' : 'text-muted-foreground'}`} />
                    إضافة إلى المفضلة
                  </label>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-secondary/30 rounded-xl p-5 border border-border/50">
              <label className="text-sm font-bold text-foreground mb-3 block flex items-center gap-2">
                <FaInfoCircle className="text-[#579BE8] w-4 h-4" />
                معلومات إضافية
              </label>
              <textarea
                value={formData.additional_info}
                onChange={(e) => setFormData(prev => ({ ...prev, additional_info: e.target.value }))}
                className="w-full p-4 bg-white dark:bg-card border-2 border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#579BE8] focus:border-[#579BE8] resize-none"
                rows="3"
                placeholder="معلومات إضافية (اختياري)"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50 dark:bg-gray-800/50">
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.address}
                className="flex-1 bg-gradient-to-r from-[#579BE8] to-[#124987] text-white py-3.5 rounded-xl hover:from-[#4a8dd8] hover:to-[#0f3d6f] transition-all font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="w-5 h-5" />
                    <span>حفظ العنوان</span>
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3.5 bg-secondary text-foreground rounded-xl hover:bg-secondary/80 transition-colors font-bold border border-border/50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
//   const handleDeleteAddress = async (addressId, addressName, event) => {
//     event.stopPropagation(); // Prevent card click
    
//     // Show confirmation dialog
//     const result = await Swal.fire({
//         title: "حذف العنوان",
//         text: `هل أنت متأكد من حذف العنوان "${addressName}"؟`,
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonText: "نعم، حذف",
//         cancelButtonText: "إلغاء",
//         confirmButtonColor: "#ef4444",
//         cancelButtonColor: "#6b7280",
//         background: "var(--background)",
//         color: "var(--foreground)",
//         width: window.innerWidth < 640 ? '90%' : '32rem',
//         customClass: {
//             popup: "rounded-2xl border border-border shadow-xl mx-4",
//             confirmButton: "rounded-xl font-bold px-4 sm:px-6 py-2 ml-2 text-sm sm:text-base",
//             cancelButton: "rounded-xl font-bold px-4 sm:px-6 py-2 text-sm sm:text-base",
//             title: "text-sm text-right",
//             htmlContainer: "text-sm sm:text-base text-right"
//         }
//     });

//     if (!result.isConfirmed) return;

//     // Show loading toast
//     const loadingToast = toast.loading("جاري حذف العنوان...", {
//         style: {
//             background: "var(--background)",
//             border: "1px solid var(--border)",
//             borderRadius: "12px",
//             padding: "16px",
//         },
//     });

//     try {
//         const accessToken = localStorage.getItem("accessToken");
        
//         if (!accessToken) {
//             toast.dismiss(loadingToast);
//             toast.error("يرجى تسجيل الدخول أولاً", {
//                 icon: <FaExclamationTriangle className="w-5 h-5" />,
//                 style: {
//                     background: "#F75A65",
//                     color: "#fff",
//                     borderRadius: "12px",
//                     padding: "16px",
//                 },
//             });
//             return;
//         }

//         const response = await fetch(`https://dashboard.waytmiah.com/api/v1/addresses/${addressId}`, {
//             method: 'DELETE',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Accept': 'application/json',
//                 'Authorization': `Bearer ${accessToken}`,
//             },
//         });

//         const data = await response.json().catch(() => ({}));

//         toast.dismiss(loadingToast);

//         if (response.ok) {
//             // Remove the address from local state
//             setAddresses(prevAddresses => prevAddresses.filter(addr => addr.id !== addressId));
//             setPlaces(prevPlaces => prevPlaces.filter(place => {
//                 if (typeof place === 'object' && place.id) {
//                     return place.id !== addressId;
//                 }
//                 return true;
//             }));
//             setFavorites(prevFavorites => prevFavorites.filter(fav => {
//                 if (typeof fav === 'object' && fav.id) {
//                     return fav.id !== addressId;
//                 }
//                 return true;
//             }));

//             // Close popup if the deleted address was selected
//             if (selectedAddress?.id === addressId) {
//                 setShowAddressPopup(false);
//                 setSelectedAddress(null);
//             }

//             toast.success(data.message || "تم حذف العنوان بنجاح", {
//                 icon: <FaCheckCircle className="w-5 h-5" />,
//                 style: {
//                     background: "#579BE8",
//                     color: "#fff",
//                     borderRadius: "12px",
//                     padding: "16px",
//                 },
//             });
//         } else {
//             const errorMessage = data.message || data.error || 'فشل حذف العنوان. يرجى المحاولة مرة أخرى';
//             toast.error(errorMessage, {
//                 icon: <FaExclamationTriangle className="w-5 h-5" />,
//                 style: {
//                     background: "#F75A65",
//                     color: "#fff",
//                     borderRadius: "12px",
//                     padding: "16px",
//                 },
//             });
//         }
//     } catch (error) {
//         toast.dismiss(loadingToast);
//         console.error('Error deleting address:', error);
//         toast.error("حدث خطأ أثناء حذف العنوان. يرجى المحاولة مرة أخرى", {
//             icon: <FaExclamationTriangle className="w-5 h-5" />,
//             style: {
//                 background: "#F75A65",
//                 color: "#fff",
//                 borderRadius: "12px",
//                 padding: "16px",
//             },
//         });
//     }
// };

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
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  
  // قوائم المياه والخدمات - يجب جلبها من الـ API
  const [waterTypes, setWaterTypes] = useState([]);
  const [services, setServices] = useState([]);
  
  const currentOrderIdRef = useRef(null);
  const isRequestInProgress = useRef(false);
  
  // const { subscribeToOrderAndUser, unsubscribeAll, addEventListener, removeEventListener } = usePusher({
  //   autoConnect: true,
  //   onConnected: () => {
  //     console.log('✅ Pusher connected');
  //   },
  //   onDisconnected: () => {
  //     console.log('🔴 Pusher disconnected');
  //   }
  // });
    const { subscribeToOrderAndUser, subscribeToOrder, unsubscribeAll, addEventListener, removeEventListener } = usePusher({
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
    
    // جلب قوائم المياه والخدمات
    fetchWaterTypes();
    fetchServices();
  }, [searchParams]);

  // دالة لجلب أنواع المياه
  const fetchWaterTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/type-water`);
      const data = await response.json();
      if (response.ok && data.status && data.data) {
        setWaterTypes(data.data);
      }
    } catch (error) {
      console.error("Error fetching water types:", error);
    }
  };

  // دالة لجلب الخدمات
  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services`);
      const data = await response.json();
      if (response.ok && data.status && data.data) {
        setServices(data.data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

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
// دالة حذف العنوان
const handleDeleteAddress = async (addressId, addressName, event) => {
  event.stopPropagation(); // Prevent card click
  
  // Show confirmation dialog
  const result = await Swal.fire({
      title: "حذف العنوان",
      text: `هل أنت متأكد من حذف العنوان "${addressName}"؟`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، حذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      background: "var(--background)",
      color: "var(--foreground)",
      width: window.innerWidth < 640 ? '90%' : '32rem',
      customClass: {
          popup: "rounded-2xl border border-border shadow-xl mx-4",
          confirmButton: "rounded-xl font-bold px-4 sm:px-6 py-2 ml-2 text-sm sm:text-base",
          cancelButton: "rounded-xl font-bold px-4 sm:px-6 py-2 text-sm sm:text-base",
          title: "text-sm text-right",
          htmlContainer: "text-sm sm:text-base text-right"
      }
  });

  if (!result.isConfirmed) return;

  // Show loading toast
  const loadingToast = toast.loading("جاري حذف العنوان...", {
      style: {
          background: "var(--background)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "16px",
      },
  });

  try {
      const accessToken = localStorage.getItem("accessToken");
      
      if (!accessToken) {
          toast.dismiss(loadingToast);
          toast.error("يرجى تسجيل الدخول أولاً", {
              icon: <FaExclamationTriangle className="w-5 h-5" />,
              style: {
                  background: "#F75A65",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "16px",
              },
          });
          return;
      }

      const response = await fetch(`https://dashboard.waytmiah.com/api/v1/addresses/${addressId}`, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
          },
      });

      const data = await response.json().catch(() => ({}));

      toast.dismiss(loadingToast);

      if (response.ok) {
          // Remove the address from local state
          setSavedLocations(prevAddresses => prevAddresses.filter(addr => addr.id !== addressId));
          
          // If the deleted address was selected, clear selection
          if (selectedSavedLocation?.id === addressId) {
              setSelectedSavedLocation(null);
              setLocationData(null);
          }

          toast.success(data.message || "تم حذف العنوان بنجاح", {
              icon: <FaCheckCircle className="w-5 h-5" />,
              style: {
                  background: "#579BE8",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "16px",
              },
          });
      } else {
          const errorMessage = data.message || data.error || 'فشل حذف العنوان. يرجى المحاولة مرة أخرى';
          toast.error(errorMessage, {
              icon: <FaExclamationTriangle className="w-5 h-5" />,
              style: {
                  background: "#F75A65",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "16px",
              },
          });
      }
  } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error deleting address:', error);
      toast.error("حدث خطأ أثناء حذف العنوان. يرجى المحاولة مرة أخرى", {
          icon: <FaExclamationTriangle className="w-5 h-5" />,
          style: {
              background: "#F75A65",
              color: "#fff",
              borderRadius: "12px",
              padding: "16px",
          },
      });
  }
};
// دالة تبديل حالة المفضلة (إضافة/إزالة)
const handleToggleFavorite = async (addressId, currentFavoriteStatus, addressName, event) => {
  event.stopPropagation(); // منع انتشار الحدث لعدم فتح تفاصيل العنوان
  
  // Show loading toast
  const loadingToast = toast.loading(
    currentFavoriteStatus ? "جاري الإزالة من المفضلة..." : "جاري الإضافة إلى المفضلة...",
    {
      style: {
        background: "var(--background)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "16px",
      },
    }
  );

  try {
    const accessToken = localStorage.getItem("accessToken");
    
    if (!accessToken) {
      toast.dismiss(loadingToast);
      toast.error("يرجى تسجيل الدخول أولاً", {
        icon: <FaExclamationTriangle className="w-5 h-5" />,
        style: {
          background: "#F75A65",
          color: "#fff",
          borderRadius: "12px",
          padding: "16px",
        },
      });
      return;
    }

    // جلب العنوان أولاً للحصول على جميع البيانات الحالية
    const getResponse = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const getData = await getResponse.json();

    if (!getResponse.ok) {
      throw new Error(getData.message || 'فشل في جلب بيانات العنوان');
    }

    // تجهيز البيانات مع تحديث حالة المفضلة
    const addressData = getData.data;
    const updateData = {
      name: addressData.name || '',
      address: addressData.address || '',
      city: addressData.city || '',
      area: addressData.area || '',
      latitude: addressData.latitude?.toString() || '',
      longitude: addressData.longitude?.toString() || '',
      type: addressData.type || 'home',
      additional_info: addressData.additional_info || '',
      is_favorite: !currentFavoriteStatus // عكس القيمة الحالية
    };

    // إرسال طلب التحديث
    const updateResponse = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updateData)
    });

    const updateResult = await updateResponse.json();
    toast.dismiss(loadingToast);

    if (updateResponse.ok && updateResult.status) {
      // تحديث الحالة المحلية في savedLocations
      setSavedLocations(prevAddresses => 
        prevAddresses.map(addr => 
          addr.id === addressId 
            ? { ...addr, is_favorite: !currentFavoriteStatus }
            : addr
        )
      );

      // إذا كان هذا العنوان هو المحدد حالياً، قم بتحديثه أيضاً
      if (selectedSavedLocation?.id === addressId) {
        setSelectedSavedLocation(prev => ({ ...prev, is_favorite: !currentFavoriteStatus }));
      }

      // عرض رسالة نجاح
      toast.success(
        !currentFavoriteStatus 
          ? `تمت إضافة "${addressName || 'العنوان'}" إلى المفضلة بنجاح`
          : `تمت إزالة "${addressName || 'العنوان'}" من المفضلة بنجاح`,
        {
          icon: !currentFavoriteStatus ? <FaStar className="w-5 h-5" /> : <FaRegTrashCan className="w-5 h-5" />,
          style: {
            background: "#579BE8",
            color: "#fff",
            borderRadius: "12px",
            padding: "16px",
          },
        }
      );
    } else {
      throw new Error(updateResult.message || 'فشل تحديث حالة المفضلة');
    }
  } catch (error) {
    toast.dismiss(loadingToast);
    console.error('Error toggling favorite:', error);
    toast.error(error.message || "حدث خطأ أثناء تحديث حالة المفضلة", {
      icon: <FaExclamationTriangle className="w-5 h-5" />,
      style: {
        background: "#F75A65",
        color: "#fff",
        borderRadius: "12px",
        padding: "16px",
      },
    });
  }
};
  const handleAddressAdded = (newAddress) => {
    setSavedLocations(prev => [newAddress, ...prev]);
    // Auto-select the newly added address
    handleSavedLocationSelect(newAddress);
    setShowAddAddressModal(false);
  };

  const handleManualLocationSelect = async (data) => {
    // تأكد من أن data يحتوي على lat, lng
    console.log("Manual location selected:", data);
    
    setIsLoadingAddress(true);
    try {
      // الحصول على اسم المكان من الإحداثيات
      const addressName = await getAddressFromCoordinates(data.lat, data.lng);
      
      setLocationData({
        lat: data.lat,
        lng: data.lng,
        address: addressName, // استخدام اسم المكان
        latitude: data.lat,
        longitude: data.lng
      });
      
      setSelectedSavedLocation(null);
      setIsManualLocation(true);
      setIsMapOpen(false);
      
      toast.success("تم تحديد الموقع بنجاح");
    } catch (error) {
      console.error("Error getting address:", error);
      // في حالة الفشل، استخدم الإحداثيات كبديل
      setLocationData({
        lat: data.lat,
        lng: data.lng,
        address: `${data.lat.toFixed(6)}, ${data.lng.toFixed(6)}`,
        latitude: data.lat,
        longitude: data.lng
      });
      setSelectedSavedLocation(null);
      setIsManualLocation(true);
      setIsMapOpen(false);
      
      toast.success("تم تحديد الموقع (بدون اسم المكان)");
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleSavedLocationSelect = (location) => {
    setSelectedSavedLocation(location);
    setLocationData({
      ...location,
      latitude: parseFloat(location.latitude),
      longitude: parseFloat(location.longitude),
      lat: parseFloat(location.latitude),
      lng: parseFloat(location.longitude),
      address: location.address
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
  // const setupPusherListener = useCallback(async (orderId, userId) => {
  //   try {
  //     console.log(`🎯 Setting up Pusher listener for order ${orderId}, user ${userId}`);
      
  //     currentOrderIdRef.current = orderId;
      
  //     removeEventListener('DriverAcceptedOrder');
      
  //     addEventListener('DriverAcceptedOrder', (data) => {
  //       console.log('🚗 DriverAcceptedOrder event triggered');
  //       handleDriverAcceptedOrder(data);
  //     });

  //     const subscriptionCallbacks = {
  //       onDriverAcceptedOrder: (data) => {
  //         console.log('🚗 Driver accepted order via Pusher callback');
  //         handleDriverAcceptedOrder(data);
  //       }
  //     };

  //     subscribeToOrderAndUser(orderId, userId, subscriptionCallbacks);
      
  //     console.log('✅ Pusher setup completed');
      
  //   } catch (error) {
  //     console.error('❌ Error setting up Pusher listener:', error);
  //   }
  // }, [addEventListener, removeEventListener, handleDriverAcceptedOrder, subscribeToOrderAndUser]);
 const setupPusherListener = useCallback(async (orderId) => {
    try {
      console.log(`🎯 Setting up Pusher listener for order ${orderId}`);
      
      currentOrderIdRef.current = orderId;
      
      // إزالة المستمع القديم إذا كان موجود
      removeEventListener('DriverAcceptedOrder');
      
      // إضافة المستمع الجديد
      addEventListener('DriverAcceptedOrder', (data) => {
        console.log('🚗 DriverAcceptedOrder event triggered');
        handleDriverAcceptedOrder(data);
      });

      // الاشتراك في قناة الطلب فقط (بدون userId)
      const subscriptionCallbacks = {
        onDriverAcceptedOrder: (data) => {
          console.log('🚗 Driver accepted order via Pusher callback on order channel');
          handleDriverAcceptedOrder(data);
        },
        onOfferCreated: (data) => {
          console.log('💰 New offer created:', data);
          // يمكن إضافة معالجة للعروض هنا إذا لزم الأمر
        },
        onOrderStatusUpdated: (data) => {
          console.log('📊 Order status updated:', data);
        }
      };

      // استخدام الدالة الجديدة subscribeToOrder
      subscribeToOrder(orderId, subscriptionCallbacks);
      
      console.log('✅ Pusher setup completed for order channel');
      
    } catch (error) {
      console.error('❌ Error setting up Pusher listener:', error);
    }
  }, [addEventListener, removeEventListener, handleDriverAcceptedOrder, subscribeToOrder]);
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
      // if (!userId) {
      //   toast.error("لا يمكن الحصول على معلومات المستخدم");
      //   isRequestInProgress.current = false;
      //   return;
      // }

      const orderData = {
        service_id: parseInt(quantity),
        water_type_id: parseInt(waterType),
        saved_location_id: selectedSavedLocation ? selectedSavedLocation.id : null
      };

      let savedLocationId = selectedSavedLocation ? selectedSavedLocation.id : null;
      
      if (isManualLocation && locationData) {
        // تأكد من وجود قيم خطوط الطول والعرض
        const latitude = locationData.lat || locationData.latitude;
        const longitude = locationData.lng || locationData.longitude;
        
        if (!latitude || !longitude) {
          toast.error("الرجاء تحديد الموقع على الخريطة بشكل صحيح");
          isRequestInProgress.current = false;
          return;
        }

        // استخدام العنوان الذي تم الحصول عليه من الخدمة العكسية
        const addressToSend = locationData.address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

        const addressDataToSend = {
          name: locationData.name || 'موقع الطلب',
          address: addressToSend, // استخدام اسم المكان بدلاً من الإحداثيات
          city: 'الرياض',
          area: 'حي عام',
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          type: 'other',
          is_favorite: false,
          additional_info: 'موقع طلب'
        };

        console.log("Sending address data:", addressDataToSend);

        const newAddressResponse = await fetch(`${API_BASE_URL}/addresses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify(addressDataToSend),
        });

        const addressData = await newAddressResponse.json();
        console.log("Address creation response:", addressData);
        
        if (newAddressResponse.ok && addressData.status && addressData.data) {
          savedLocationId = addressData.data.id;
        } else {
          toast.error(addressData.message || "فشل حفظ العنوان الجديد");
          isRequestInProgress.current = false;
          return;
        }
      }

      orderData.saved_location_id = savedLocationId;

      console.log("Sending order data:", orderData);

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
      // console.log('📦 Order creation response:', data);
      
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

        await setupPusherListener(orderId);
        
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

  // دالة معالجة الجدولة
  const handleSchedule = async (scheduleData) => {
    try {
      setIsLoading(true);
      
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        toast.error("يرجى تسجيل الدخول أولاً");
        return;
      }

      const orderData = {
        service_id: parseInt(scheduleData.quantity),
        water_type_id: parseInt(scheduleData.waterType),
        saved_location_id: scheduleData.selectedSavedLocation ? scheduleData.selectedSavedLocation.id : null,
        order_date: scheduleData.dateTime,
        notes: scheduleData.notes
      };

      let savedLocationId = scheduleData.selectedSavedLocation ? scheduleData.selectedSavedLocation.id : null;
      
      if (scheduleData.isManualLocation && scheduleData.locationData) {
        const latitude = scheduleData.locationData.lat || scheduleData.locationData.latitude;
        const longitude = scheduleData.locationData.lng || scheduleData.locationData.longitude;
        
        const addressDataToSend = {
          name: scheduleData.locationData.name || 'موقع الطلب المجدول',
          address: scheduleData.locationData.address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          city: 'الرياض',
          area: 'حي عام',
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          type: 'other',
          is_favorite: false,
          additional_info: 'موقع طلب مجدول'
        };

        const newAddressResponse = await fetch(`${API_BASE_URL}/addresses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify(addressDataToSend),
        });

        const addressData = await newAddressResponse.json();
        if (newAddressResponse.ok && addressData.status && addressData.data) {
          savedLocationId = addressData.data.id;
        } else {
          toast.error(addressData.message || "فشل حفظ العنوان الجديد");
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
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        toast.error(data.message || "فشل جدولة الطلب");
      }
    } catch (error) {
      console.error("Error scheduling order:", error);
      toast.error("حدث خطأ أثناء جدولة الطلب");
      throw error;
    } finally {
      setIsLoading(false);
    }
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
      onSchedule={handleSchedule}
      locationData={locationData}
      selectedSavedLocation={selectedSavedLocation}
      isManualLocation={isManualLocation}
      waterType={waterType}
      quantity={quantity}
      waterTypes={waterTypes}
      services={services}
      isSubmitting={isLoading}
    />;
  }

  return (
    <>
      <AddAddressModal
        isOpen={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
        onAddressAdded={handleAddressAdded}
      />

      <LocationPickerModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelect={handleManualLocationSelect}
      />

      <div className="min-h-screen bg-gray-50/50 p-3 md:p-8 flex justify-center items-start pt-12 md:pt-16">
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
                    <MapPin size={18} className={getFieldStatus('location') === 'error' ? 'text-red-600' : 'text-[#579BE8]'} />
                    موقع التوصيل
                  </label>
                  <div className="flex gap-2">
                    
                    <button
                      onClick={() => router.push('/myProfile/addresses')}
                      className="text-xs px-3 py-1.5 bg-[#579BE8]/10 text-[#579BE8] rounded-lg hover:bg-[#579BE8]/20 transition-colors font-medium flex items-center gap-1"
                    >
                      <FaMapMarkerAlt className="w-3 h-3" />
                      <span className="hidden sm:inline">إدارة العناوين</span>
                    </button>
                  </div>
                </div>

                {savedLocations.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <FaStar className="text-[#579BE8] w-4 h-4" />
                      الأماكن المحفوظة
                    </h3>
                    <div className="space-y-2">
                    {savedLocations.slice(0, showAllLocations ? savedLocations.length : 2).map((location) => (
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
          : 'bg-gray-100 text-gray-700'
      }`}>
        {location.type === 'home' ? <FaHome className="w-4 h-4" /> :
         location.type === 'work' ? <FaBriefcase className="w-4 h-4" /> :
         <FaMapMarkedAlt className="w-4 h-4" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm text-gray-900">
            {location.name}
          </h4>
          {location.is_favorite && (
            <FaStar className="text-[#579BE8] w-3 h-3" />
          )}
        </div>
        <p className="text-xs text-gray-700 truncate">
          {location.address}
        </p>
      </div>
      
      <div className="flex items-center gap-1">
        {/* زر التبديل للمفضلة */}
        <button
          onClick={(e) => handleToggleFavorite(
            location.id, 
            location.is_favorite || false, 
            location.name || 'العنوان',
            e
          )}
          className={`transition-all p-1.5 rounded-lg hover:scale-110 ${
            location.is_favorite 
              ? 'text-[#579BE8] hover:bg-[#579BE8]/10' 
              : 'text-gray-400 hover:text-[#579BE8] hover:bg-[#579BE8]/10'
          }`}
          title={location.is_favorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
        >
          <FaStar className={`w-4 h-4 ${location.is_favorite ? 'fill-current' : ''}`} />
        </button>
        
        {/* زر الحذف */}
        <button
          onClick={(e) => handleDeleteAddress(location.id, location.name || 'العنوان', e)}
          className="transition-opacity p-1.5 hover:bg-red-100 rounded-lg text-red-600 hover:scale-110"
          title="حذف العنوان"
        >
          <FaTrashAlt className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
))}
                      {savedLocations.length > 2 && (
                        <button
                          onClick={() => setShowAllLocations(!showAllLocations)}
                          className="text-[#579BE8] font-bold text-xs mt-2 hover:underline cursor-pointer w-fit mx-auto px-3 py-1.5 hover:bg-[#579BE8]/10 rounded-xl transition-all"
                        >
                          {showAllLocations ? "عرض أقل" : `عرض الكل (${savedLocations.length})`}
                        </button>
                      )}
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
                          ? 'bg-red-100 text-red-600'
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
                          {isLoadingAddress ? "جاري تحميل العنوان..." : "اضغط لتحديد موقع جديد"}
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
                      className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
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
                  label="حجم الوايت (طن)"
                  placeholder="اختر حجم المويه"
                  status={getFieldStatus('quantity')}
                  hasError={showError('quantity')}
                  className="h-12 md:h-14"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <button
                  onClick={handleOrderNow}
                  disabled={isLoading || isWaitingForOffers || isLoadingAddress}
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
                  ) : isLoadingAddress ? (
                    <>
                      <Spinner size="sm" />
                      <span className="text-sm">جاري تحميل العنوان...</span>
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
                  disabled={isLoading || isWaitingForOffers || isLoadingAddress}
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
    </>
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