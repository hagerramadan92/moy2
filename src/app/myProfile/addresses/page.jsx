"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaMapMarkerAlt, FaStar, FaChevronLeft, FaBuilding, FaCheckCircle, FaInfoCircle, FaPlus, FaCrosshairs, FaSearchLocation, FaHome, FaBriefcase, FaMapMarkedAlt, FaEye, FaTrashAlt, FaExclamationTriangle } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { BiCurrentLocation } from "react-icons/bi";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import Spinner from "@/components/ui/spinner";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';
import Swal from "sweetalert2";

// Dynamic import for Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);


// إصلاح مشكلة أيقونات Leaflet
const fixLeafletIcons = () => {
  if (typeof window !== 'undefined') {
    const L = require('leaflet');
    
    // مسارات الصور داخل مجلد public
    delete L.Icon.Default.prototype._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/marker-icon-2x.png',
      iconUrl: '/images/marker-icon.png',
      shadowUrl: '/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }
};

const API_BASE_URL = "https://dashboard.waytmiah.com/api/v1";

// Saudi Arabia coordinates and cities data
const SAUDI_CITIES = [
  { name: "الرياض", lat: 24.7136, lng: 46.6753, districts: ["حي النرجس", "حي العليا", "حي الملز", "حي الصحافة"] },
  { name: "جدة", lat: 21.4858, lng: 39.1925, districts: ["حي الزمالك", "حي السلامة", "حي الشرفية", "حي البغداديه"] },
  { name: "مكة المكرمة", lat: 21.3891, lng: 39.8579, districts: ["حي العزيزية", "حي الشوقية", "حي المعابدة"] },
  { name: "المدينة المنورة", lat: 24.5247, lng: 39.5692, districts: ["حي العيون", "حي قباء", "حي السيح"] },
  { name: "الدمام", lat: 26.3927, lng: 50.1925, districts: ["حي الشاطئ", "حي الروضة", "حي الفيصلية"] },
  { name: "الخبر", lat: 26.2172, lng: 50.1971, districts: ["حي الحزام الذهبي", "حي الراكة", "حي الجسر"] },
  { name: "الطائف", lat: 21.2757, lng: 40.4063, districts: ["حي الشفا", "حي قروى", "حي الهدا"] },
  { name: "تبوك", lat: 28.3835, lng: 36.5662, districts: ["حي المصيف", "حي العليا", "حي الفيصلية"] },
  { name: "بريدة", lat: 26.3591, lng: 43.9818, districts: ["حي الروضة", "حي الازدهار", "حي العليا"] },
  { name: "حائل", lat: 27.5114, lng: 41.7208, districts: ["حي المليداء", "حي القاع", "حي السماح"] }
];

// Get nearest Saudi city based on coordinates
const getNearestSaudiCity = (lat, lng) => {
  let nearestCity = SAUDI_CITIES[0];
  let minDistance = Infinity;

  for (const city of SAUDI_CITIES) {
    const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2));
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }

  return {
    city: nearestCity,
    distance: minDistance
  };
};

// Enhanced Reverse Geocoding function with better Arabic support
const reverseGeocode = async (lat, lng) => {
  try {
    // First try with Arabic language
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1&accept-language=ar`,
      {
        headers: {
          'User-Agent': 'MoyaApp/1.0',
          'Accept-Language': 'ar'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

// Smart address extraction with Saudi-specific logic
const extractAddressComponents = (nominatimData, lat, lng) => {
  const nearestCityData = getNearestSaudiCity(lat, lng);
  const nearestCity = nearestCityData.city;
  
  const extracted = {
    name: '',
    address: '',
    city: '',
    area: '',
    type: 'home'
  };

  // Smart name generation
  const hour = new Date().getHours();
  let locationType = "موقع";
  
  if (hour >= 6 && hour < 12) locationType = "موقع الصباح";
  else if (hour >= 12 && hour < 18) locationType = "موقع الظهيرة";
  else locationType = "موقع المساء";

  // Try to get meaningful name from Nominatim or use default
  if (nominatimData && nominatimData.address) {
    const address = nominatimData.address;
    
    if (address.road) {
      extracted.name = `${locationType} في ${address.road}`;
    } else if (address.suburb) {
      extracted.name = `${locationType} في ${address.suburb}`;
    } else if (address.city) {
      extracted.name = `${locationType} في ${address.city}`;
    } else {
      extracted.name = 'البيت';
    }

    // Build address
    const addressParts = [];
    if (address.road) {
      addressParts.push(`شارع ${address.road.replace(/^شارع\s*/i, '')}`);
    }
    if (address.suburb) {
      addressParts.push(address.suburb);
    }
    if (address.city) {
      addressParts.push(address.city);
    }

    extracted.address = addressParts.join(' - ') || `${nearestCity.name} - موقع عام`;
    extracted.city = address.city || address.town || address.county || nearestCity.name;
    
    if (address.suburb) {
      extracted.area = address.suburb.replace(/حي\s*/i, 'حي ');
    } else if (address.neighbourhood) {
      extracted.area = address.neighbourhood.replace(/حي\s*/i, 'حي ');
    } else if (address.city_district) {
      extracted.area = address.city_district.replace(/حي\s*/i, 'حي ');
    } else {
      // Get random district from nearest city
      if (nearestCity.districts && nearestCity.districts.length > 0) {
        const randomIndex = Math.floor(Math.random() * nearestCity.districts.length);
        extracted.area = nearestCity.districts[randomIndex];
      } else {
        extracted.area = 'حي عام';
      }
    }
  } else {
    // Fallback to nearest Saudi city data
    extracted.name = 'البيت';
    extracted.city = nearestCity.name;
    
    if (nearestCity.districts && nearestCity.districts.length > 0) {
      const randomIndex = Math.floor(Math.random() * nearestCity.districts.length);
      extracted.area = nearestCity.districts[randomIndex];
    } else {
      extracted.area = 'حي عام';
    }
    
    extracted.address = `${nearestCity.name} - ${extracted.area}`;
  }

  return extracted;
};

// Simple Map Component
function SimpleMapPicker({ initialPosition, onLocationSelect }) {
  const [position, setPosition] = useState([initialPosition.lat, initialPosition.lng]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const markerRef = useRef(null);

  useEffect(() => {
      if (typeof window !== 'undefined') {
      // إصلاح الأيقونات عند التحميل
      fixLeafletIcons();
      setMapLoaded(true);
    }

  }, []);

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    setPosition([lat, lng]);
    
    setIsFetchingAddress(true);
    
    try {
      onLocationSelect({ 
        lat, 
        lng,
        address: `جاري تحديد العنوان...`,
        isProcessing: true
      });

      const nominatimData = await reverseGeocode(lat, lng);
      const addressComponents = extractAddressComponents(nominatimData, lat, lng);
      
      onLocationSelect({ 
        lat, 
        lng,
        address: addressComponents?.address || `موقع مختار`,
        addressComponents: addressComponents || {}
      });
      
      toast.success("تم تحديد العنوان بنجاح!");
    } catch (error) {
      console.error('Error:', error);
      const fallbackComponents = extractAddressComponents(null, lat, lng);
      onLocationSelect({ 
        lat, 
        lng,
        address: fallbackComponents.address,
        addressComponents: fallbackComponents
      });
    toast("تم تحديد الموقع مع اقتراح عنوان", { icon: 'ℹ️' });
    } finally {
      setIsFetchingAddress(false);
    }
  };

  if (!mapLoaded) {
    return (
      <div className="h-[300px] rounded-xl bg-secondary/30 flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="text-muted-foreground mt-2">جاري تحميل الخريطة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px] rounded-xl overflow-hidden border-2 border-border/50 relative">
      {isFetchingAddress && (
        <div className="absolute top-2 left-2 right-2 z-[1000] bg-blue-600 text-white p-2 rounded-lg text-center text-sm animate-pulse">
          <FaSearchLocation className="inline ml-2" />
          جاري تحديد العنوان...
        </div>
      )}
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="rounded-xl"
        whenCreated={(map) => {
          map.on('click', handleMapClick);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} ref={markerRef}>
          <Popup>
            الموقع المحدد<br />
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

// Display Map Component (Read-only)
function DisplayMap({ lat, lng }) {
  const [position, setPosition] = useState([lat, lng]);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
      if (typeof window !== 'undefined') {
     fixLeafletIcons();
    setMapLoaded(true);
    setPosition([lat, lng]);
      }

  }, [lat, lng]);

  if (!mapLoaded) {
    return (
      <div className="h-[300px] rounded-xl bg-secondary/30 flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="text-muted-foreground mt-2">جاري تحميل الخريطة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px] rounded-xl overflow-hidden border-2 border-border/50">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="rounded-xl"
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            موقع العنوان<br />
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default function AddressesPage() {
    const router = useRouter();
    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [loadingAddressDetails, setLoadingAddressDetails] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [showAllAddresses, setShowAllAddresses] = useState(false);
    const [deletingAddressId, setDeletingAddressId] = useState(null);
    const [editAddressForm, setEditAddressForm] = useState({
        name: 'البيت',
        address: 'الرياض - حي النرجس',
        city: 'الرياض',
        area: 'حي النرجس',
        latitude: '24.7136',
        longitude: '46.6753',
        type: 'home',
        additional_info: 'البيت الرئيسي',
        is_favorite: true
    });
    const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [isMapAvailable, setIsMapAvailable] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [locationName, setLocationName] = useState('');

    useEffect(() => {
        setIsMapAvailable(typeof window !== 'undefined');
    }, []);

    useEffect(() => {
        const fetchAddresses = async () => {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                toast.error("يرجى تسجيل الدخول أولاً");
                router.push('/login');
                return;
            }

            try {
                setLoadingAddresses(true);
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
                    setAddresses(data.data);
                } else {
                    toast.error(data.message || "فشل جلب العناوين");
                }
            } catch (error) {
                toast.error("حدث خطأ أثناء جلب العناوين");
            } finally {
                setLoadingAddresses(false);
            }
        };

        fetchAddresses();
    }, [router]);

    const fetchAddressDetails = async (addressId) => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            toast.error("يرجى تسجيل الدخول أولاً");
            return;
        }

        try {
            setLoadingAddressDetails(true);
            setSelectedAddress(null);
            setIsEditingAddress(false);
            setIsAddingNewAddress(false);

            const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();
            if (response.ok && data.status && data.data) {
                const addressData = data.data;
                setSelectedAddress(addressData);
                setEditAddressForm({
                    name: addressData.name || 'البيت',
                    address: addressData.address || 'الرياض - حي النرجس',
                    city: addressData.city || 'الرياض',
                    area: addressData.area || 'حي النرجس',
                    latitude: addressData.latitude || '24.7136',
                    longitude: addressData.longitude || '46.6753',
                    type: addressData.type || 'home',
                    additional_info: addressData.additional_info || 'البيت الرئيسي',
                    is_favorite: addressData.is_favorite || false
                });
            } else {
                toast.error(data.message || "فشل جلب تفاصيل العنوان");
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء جلب تفاصيل العنوان");
        } finally {
            setLoadingAddressDetails(false);
        }
    };

       const handleDeleteAddress = async (addressId, addressName, event) => {
      
        
        // Show confirmation dialog
        const result = await Swal.fire({
            title: "حذف العنوان",
            text: `هل أنت متأكد من حذف العنوان `,
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
                setAddresses(prevAddresses => prevAddresses.filter(addr => addr.id !== addressId));
             
    
                // Close popup if the deleted address was selected
                if (selectedAddress?.id === addressId) {
                    setShowAddressPopup(false);
                    setSelectedAddress(null);
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

    const handleUpdateAddress = async () => {
        if (!selectedAddress?.id) return;

        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            toast.error("يرجى تسجيل الدخول أولاً");
            return;
        }

        try {
            setIsUpdatingAddress(true);
            const response = await fetch(`${API_BASE_URL}/addresses/${selectedAddress.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    name: editAddressForm.name,
                    address: editAddressForm.address,
                    city: editAddressForm.city,
                    area: editAddressForm.area,
                    latitude: parseFloat(editAddressForm.latitude) || 0,
                    longitude: parseFloat(editAddressForm.longitude) || 0,
                    type: editAddressForm.type,
                    is_favorite: editAddressForm.is_favorite,
                    additional_info: editAddressForm.additional_info
                }),
            });

            const data = await response.json();
            if (response.ok && data.status) {
                toast.success(data.message || "تم تحديث العنوان بنجاح");
                setIsEditingAddress(false);
                await refreshAddressesList(accessToken);
                await fetchAddressDetails(selectedAddress.id);
            } else {
                toast.error(data.message || "فشل تحديث العنوان");
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء تحديث العنوان");
        } finally {
            setIsUpdatingAddress(false);
        }
    };

    const handleAddNewAddress = async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            toast.error("يرجى تسجيل الدخول أولاً");
            return;
        }

        if (!editAddressForm.name.trim()) {
            toast.error("يرجى إدخال اسم العنوان");
            return;
        }

        try {
            setIsAddingAddress(true);
            const response = await fetch(`${API_BASE_URL}/addresses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    name: editAddressForm.name || 'البيت',
                    address: editAddressForm.address || 'الرياض - حي النرجس',
                    city: editAddressForm.city || 'الرياض',
                    area: editAddressForm.area || 'حي النرجس',
                    latitude: parseFloat(editAddressForm.latitude) || 24.7136,
                    longitude: parseFloat(editAddressForm.longitude) || 46.6753,
                    type: editAddressForm.type || 'home',
                    is_favorite: editAddressForm.is_favorite || false,
                    additional_info: editAddressForm.additional_info || 'البيت الرئيسي'
                }),
            });

            const data = await response.json();
            if (response.ok && data.status && data.data) {
                toast.success("تم إضافة العنوان بنجاح");
                setIsAddingNewAddress(false);
                setShowMapPicker(false);
                await refreshAddressesList(accessToken);
                await fetchAddressDetails(data.data.id);
                setEditAddressForm({
                    name: 'البيت',
                    address: 'الرياض - حي النرجس',
                    city: 'الرياض',
                    area: 'حي النرجس',
                    latitude: '24.7136',
                    longitude: '46.6753',
                    type: 'home',
                    additional_info: 'البيت الرئيسي',
                    is_favorite: true
                });
            } else {
                toast.error(data.message || "فشل إضافة العنوان");
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء إضافة العنوان");
        } finally {
            setIsAddingAddress(false);
        }
    };

    const refreshAddressesList = async (accessToken) => {
        try {
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
                setAddresses(data.data);
            }
        } catch (error) {
            console.error("Error refreshing addresses:", error);
        }
    };

    const handleLocationSelect = async (location) => {
        const { lat, lng, addressComponents = {} } = location;
        
        const updatedForm = {
            name: addressComponents.name || 'البيت',
            address: addressComponents.address || `الرياض - حي النرجس`,
            city: addressComponents.city || 'الرياض',
            area: addressComponents.area || 'حي النرجس',
            latitude: lat.toString(),
            longitude: lng.toString(),
            type: addressComponents.type || 'home',
            additional_info: 'البيت الرئيسي',
            is_favorite: editAddressForm.is_favorite
        };

        setEditAddressForm(updatedForm);
        setShowMapPicker(false);
        
        if (addressComponents.name) {
            setLocationName(addressComponents.name);
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("متصفحك لا يدعم خدمة تحديد الموقع");
            return;
        }

        setIsFetchingLocation(true);
        toast.loading("جاري تحديد موقعك...", { id: "location" });
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                let updatedForm = {
                    ...editAddressForm,
                    latitude: latitude.toString(),
                    longitude: longitude.toString()
                };

                setEditAddressForm(updatedForm);
                
                try {
                    const nominatimData = await reverseGeocode(latitude, longitude);
                    const addressComponents = extractAddressComponents(nominatimData, latitude, longitude);
                    
                    if (addressComponents) {
                        updatedForm = {
                            ...updatedForm,
                            name: addressComponents.name || 'البيت',
                            address: addressComponents.address || `الرياض - حي النرجس`,
                            city: addressComponents.city || 'الرياض',
                            area: addressComponents.area || 'حي النرجس',
                            type: addressComponents.type || 'home'
                        };
                        
                        setEditAddressForm(updatedForm);
                        setLocationName(addressComponents.name || 'موقعي الحالي');
                        toast.success("تم تحديد العنوان تلقائياً!", { id: "location" });
                    }
                } catch (error) {
                    console.error('Error:', error);
                    toast.success("تم تحديد الموقع!", { id: "location" });
                }
                
                setShowMapPicker(true);
                setIsFetchingLocation(false);
            },
            (error) => {
                let errorMessage = "حدث خطأ أثناء تحديد الموقع";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "تم رفض الإذن لتحديد الموقع";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "معلومات الموقع غير متوفرة";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "انتهت مهلة طلب الموقع";
                        break;
                }
                toast.error(errorMessage, { id: "location" });
                setIsFetchingLocation(false);
            }
        );
    };

    const startAddingNewAddress = () => {
        setIsAddingNewAddress(true);
        setIsEditingAddress(true);
        setSelectedAddress(null);
        setEditAddressForm({
            name: 'البيت',
            address: 'الرياض - حي النرجس',
            city: 'الرياض',
            area: 'حي النرجس',
            latitude: '24.7136',
            longitude: '46.6753',
            type: 'home',
            additional_info: 'البيت الرئيسي',
            is_favorite: true
        });
        setLocationName('');
    };

    const handleCancel = () => {
        if (isAddingNewAddress) {
            setIsAddingNewAddress(false);
            setIsEditingAddress(false);
            setEditAddressForm({
                name: 'البيت',
                address: 'الرياض - حي النرجس',
                city: 'الرياض',
                area: 'حي النرجس',
                latitude: '24.7136',
                longitude: '46.6753',
                type: 'home',
                additional_info: 'البيت الرئيسي',
                is_favorite: true
            });
        } else {
            setIsEditingAddress(false);
            if (selectedAddress) {
                setEditAddressForm({
                    name: selectedAddress.name || 'البيت',
                    address: selectedAddress.address || 'الرياض - حي النرجس',
                    city: selectedAddress.city || 'الرياض',
                    area: selectedAddress.area || 'حي النرجس',
                    latitude: selectedAddress.latitude || '24.7136',
                    longitude: selectedAddress.longitude || '46.6753',
                    type: selectedAddress.type || 'home',
                    additional_info: selectedAddress.additional_info || 'البيت الرئيسي',
                    is_favorite: selectedAddress.is_favorite || false
                });
            }
        }
        setShowMapPicker(false);
        setLocationName('');
    };

    // Quick location buttons
    const setQuickLocation = (city, district) => {
        const cityData = SAUDI_CITIES.find(c => c.name === city);
        if (cityData) {
            setEditAddressForm(prev => ({
                ...prev,
                city: city,
                area: district,
                address: `${city} - ${district}`,
                latitude: cityData.lat.toString(),
                longitude: cityData.lng.toString()
            }));
            toast.success(`تم تعيين العنوان: ${city} - ${district}`);
        }
    };

    const setQuickName = (name, type = 'home') => {
        setEditAddressForm(prev => ({
            ...prev,
            name: name,
            type: type
        }));
        toast.success(`تم تعيين الاسم: ${name}`);
    };

    // Get displayed addresses based on showAllAddresses
    const displayedAddresses = showAllAddresses ? addresses : addresses.slice(0, 3);

    // Render display mode (read-only) similar to edit form
    const renderDisplayMode = () => (
        <div className="space-y-5">
            {/* اسم العنوان */}
            <div className="bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/5 rounded-2xl p-5 border-2 border-[#579BE8]/20">
                <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                    <FaMapMarkerAlt className="text-[#579BE8] w-4 h-4" />
                    اسم العنوان
                </label>
                <div className="w-full p-3 bg-white/50 dark:bg-card/50 border-2 border-border/30 rounded-xl text-foreground">
                    {selectedAddress.name}
                </div>
            </div>

            {/* العنوان الكامل */}
            <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50">
                <label className="text-sm font-bold text-foreground mb-3 block flex items-center gap-2">
                    <FaMapMarkerAlt className="text-[#579BE8] w-4 h-4" />
                    العنوان الكامل
                </label>
                <div className="w-full p-4 bg-white/50 dark:bg-card/50 border-2 border-border/30 rounded-xl text-foreground">
                    {selectedAddress.address}
                </div>
            </div>

            {/* موقع العنوان على الخريطة */}
            <div className="bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-2xl p-5 border-2 border-border/50">
                <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
                    <FaMapMarkerAlt className="text-[#579BE8] w-4 h-4" />
                    موقع العنوان على الخريطة
                </label>
                
                <div className="mb-4">
                    {isMapAvailable && selectedAddress.latitude && selectedAddress.longitude ? (
                        <DisplayMap 
                            lat={parseFloat(selectedAddress.latitude) || 24.7136}
                            lng={parseFloat(selectedAddress.longitude) || 46.6753}
                        />
                    ) : (
                        <div className="h-[300px] rounded-xl bg-secondary/30 flex items-center justify-center">
                            <div className="text-center">
                                <FaMapMarkerAlt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">خريطة الموقع غير متوفرة</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="text-sm font-bold text-foreground mb-2 block">خط العرض</label>
                        <div className="w-full p-3 bg-white/50 dark:bg-card/50 border-2 border-border/30 rounded-xl font-mono text-foreground">
                            {selectedAddress.latitude}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-foreground mb-2 block">خط الطول</label>
                        <div className="w-full p-3 bg-white/50 dark:bg-card/50 border-2 border-border/30 rounded-xl font-mono text-foreground">
                            {selectedAddress.longitude}
                        </div>
                    </div>
                </div>
            </div>

            {/* المدينة والمنطقة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50">
                    <label className="text-sm font-bold text-foreground mb-3 block flex items-center gap-2">
                        <FaBuilding className="text-[#579BE8] w-4 h-4" />
                        المدينة
                    </label>
                    <div className="w-full p-3 bg-white/50 dark:bg-card/50 border-2 border-border/30 rounded-xl text-foreground">
                        {selectedAddress.city}
                    </div>
                </div>

                <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50">
                    <label className="text-sm font-bold text-foreground mb-3 block flex items-center gap-2">
                        <BiCurrentLocation className="text-[#579BE8] w-4 h-4" />
                        المنطقة
                    </label>
                    <div className="w-full p-3 bg-white/50 dark:bg-card/50 border-2 border-border/30 rounded-xl text-foreground">
                        {selectedAddress.area || 'غير محدد'}
                    </div>
                </div>
            </div>

            {/* النوع والمفضلة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50">
                    <label className="text-sm font-bold text-foreground mb-3 block">النوع</label>
                    <div className="w-full p-3 bg-white/50 dark:bg-card/50 border-2 border-border/30 rounded-xl text-foreground">
                        {selectedAddress.type === 'home' ? '🏠 منزل' : 
                         selectedAddress.type === 'work' ? '💼 عمل' : 
                         selectedAddress.type === 'other' ? '📍 أخرى' : selectedAddress.type}
                    </div>
                </div>

                <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50 flex items-center justify-center">
                    <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded border-2 border-border/50 flex items-center justify-center ${selectedAddress.is_favorite ? 'bg-[#579BE8]/20' : 'bg-transparent'}`}>
                            {selectedAddress.is_favorite && (
                                <FaStar className="text-[#579BE8] w-4 h-4" />
                            )}
                        </div>
                        <span className="text-sm font-bold text-foreground flex items-center gap-2">
                            <FaStar className={`w-5 h-5 ${selectedAddress.is_favorite ? 'text-[#579BE8]' : 'text-muted-foreground'}`} />
                            {selectedAddress.is_favorite ? 'مضافة إلى المفضلة' : 'غير مضافة إلى المفضلة'}
                        </span>
                    </div>
                </div>
            </div>

            {/* معلومات إضافية */}
            {selectedAddress.additional_info && (
                <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50">
                    <label className="text-sm font-bold text-foreground mb-3 block flex items-center gap-2">
                        <FaInfoCircle className="text-[#579BE8] w-4 h-4" />
                        معلومات إضافية
                    </label>
                    <div className="w-full p-4 bg-white/50 dark:bg-card/50 border-2 border-border/30 rounded-xl text-foreground">
                        {selectedAddress.additional_info}
                    </div>
                </div>
            )}

            {/* أزرار التعديل والإلغاء */}
            <div className="flex gap-3 pt-2">
                <button
                    onClick={() => setIsEditingAddress(true)}
                    className="flex-1 bg-gradient-to-r from-[#579BE8] to-[#124987] text-white py-3.5 rounded-xl hover:from-[#4a8dd8] hover:to-[#0f3d6f] transition-all font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                    <CiEdit className="w-5 h-5" />
                    <span>تعديل العنوان</span>
                </button>
                <button
                    onClick={() => {
                        setSelectedAddress(null);
                        setIsEditingAddress(false);
                    }}
                    className="px-6 py-3.5 bg-secondary text-foreground rounded-xl hover:bg-secondary/80 transition-colors font-bold border border-border/50"
                >
                    رجوع للقائمة
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 fade-in-up">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-secondary/50 rounded-xl transition-colors"
                    >
                        <FaChevronLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-foreground">الأماكن المحفوظة</h1>
                        <p className="text-sm text-muted-foreground mt-1">إدارة عناوينك المحفوظة والمفضلة</p>
                    </div>
                </div>
                <button
                    onClick={startAddingNewAddress}
                    className="px-4 py-2 bg-gradient-to-r from-[#579BE8] to-[#124987] text-white rounded-xl hover:from-[#4a8dd8] hover:to-[#0f3d6f] transition-all font-bold flex items-center gap-2"
                >
                    <FaPlus className="w-4 h-4" />
                    <span>إضافة عنوان جديد</span>
                </button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Addresses List */}
                <div className="lg:col-span-1 ">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-card rounded-2xl shadow-xl border border-border/60 p-4 sm:p-6 h-fit min-h-[600px] flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-foreground">قائمة العناوين</h2>
                            {addresses.length > 3 && (
                                <button
                                    onClick={() => setShowAllAddresses(!showAllAddresses)}
                                    className="text-sm px-3 py-1 bg-[#579BE8]/10 text-[#579BE8] rounded-lg hover:bg-[#579BE8]/20 transition-colors font-bold"
                                >
                                    {showAllAddresses ? 'عرض أقل' : `عرض المزيد (${addresses.length - 3})`}
                                </button>
                            )}
                        </div>
                        
                        {loadingAddresses ? (
                            <div className="flex items-center justify-center py-12 flex-1">
                                <Spinner />
                            </div>
                        ) : addresses.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground flex-1 flex flex-col items-center justify-center">
                                <FaMapMarkerAlt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>لا توجد عناوين محفوظة</p>
                                <button
                                    onClick={startAddingNewAddress}
                                    className="mt-4 px-4 py-2 bg-gradient-to-r from-[#579BE8] to-[#124987] text-white rounded-xl hover:from-[#4a8dd8] hover:to-[#0f3d6f] transition-all font-bold flex items-center gap-2"
                                >
                                    <FaPlus className="w-4 h-4" />
                                    <span>إضافة أول عنوان</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3 flex-1 overflow-y-auto">
                                {displayedAddresses.map((address) => (
                                    <div
                                        key={address.id}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            selectedAddress?.id === address.id
                                                ? 'bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/5 border-[#579BE8] shadow-lg'
                                                : 'bg-secondary/30 border-border/50 hover:border-[#579BE8]/50 hover:shadow-md'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div 
                                                className="flex-1 min-w-0 cursor-pointer"
                                                onClick={() => fetchAddressDetails(address.id)}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-bold text-sm text-foreground truncate">
                                                        {address.name}
                                                    </h4>
                                                    {address.is_favorite && (
                                                        <FaStar className="text-[#579BE8] w-4 h-4 flex-shrink-0" />
                                                    )}
                                                </div>
                                                {address.address && (
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {address.address}
                                                    </p>
                                                )}
                                                {address.type && (
                                                    <span className="inline-block mt-2 text-xs px-2 py-1 rounded-lg bg-[#579BE8]/10 text-[#579BE8]">
                                                        {address.type === 'home' ? '🏠 منزل' : 
                                                         address.type === 'work' ? '💼 عمل' : 
                                                         address.type === 'other' ? '📍 أخرى' : address.type}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAddress(address.id)}
                                                disabled={deletingAddressId === address.id}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="حذف العنوان"
                                            >
                                                {deletingAddressId === address.id ? (
                                                    <Spinner size="sm" />
                                                ) : (
                                                    <FaTrashAlt className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                
                                {!showAllAddresses && addresses.length > 3 && (
                                    <button
                                        onClick={() => setShowAllAddresses(true)}
                                        className="w-full p-3 bg-[#579BE8]/5 border-2 border-dashed border-[#579BE8]/30 rounded-xl text-[#579BE8] hover:bg-[#579BE8]/10 transition-all font-bold flex items-center justify-center gap-2"
                                    >
                                        <FaEye className="w-4 h-4" />
                                        عرض {addresses.length - 3} عنوان إضافي
                                    </button>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Address Details / Add New */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-card rounded-2xl shadow-xl border border-border/60 overflow-hidden h-fit min-h-[600px] flex flex-col"
                    >
                        {!selectedAddress && !isAddingNewAddress ? (
                            <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#579BE8]/20 to-[#124987]/20 flex items-center justify-center">
                                    <FaMapMarkerAlt className="w-10 h-10 text-[#579BE8]" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">اختر عنواناً لعرض التفاصيل</h3>
                                <p className="text-sm text-muted-foreground">انقر على أي عنوان من القائمة لعرض وتعديل تفاصيله</p>
                                <button
                                    onClick={startAddingNewAddress}
                                    className="mt-6 px-6 py-3 bg-gradient-to-r from-[#579BE8] to-[#124987] text-white rounded-xl hover:from-[#4a8dd8] hover:to-[#0f3d6f] transition-all font-bold flex items-center gap-2"
                                >
                                    <FaPlus className="w-5 h-5" />
                                    <span>إضافة عنوان جديد</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="relative bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] p-6 sm:p-8 text-white overflow-hidden flex-shrink-0">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 blur-2xl"></div>
                                    
                                    <div className="relative z-10 flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                    <FaMapMarkerAlt className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl sm:text-2xl font-black mb-1">
                                                        {isAddingNewAddress ? "إضافة عنوان جديد" : selectedAddress.name}
                                                    </h3>
                                                    {!isAddingNewAddress && selectedAddress.type && (
                                                        <p className="text-white/80 text-sm">
                                                            {selectedAddress.type === 'home' ? '🏠 منزل' : 
                                                             selectedAddress.type === 'work' ? '💼 عمل' : 
                                                             selectedAddress.type === 'other' ? '📍 أخرى' : selectedAddress.type}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!isAddingNewAddress && selectedAddress.is_favorite && (
                                                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/30">
                                                    <FaStar className="w-5 h-5" />
                                                </div>
                                            )}
                                            {!loadingAddressDetails && !isAddingNewAddress && !isEditingAddress && (
                                                <button
                                                    onClick={() => setIsEditingAddress(true)}
                                                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all font-bold text-sm flex items-center gap-2 border border-white/30"
                                                >
                                                    <CiEdit className="w-4 h-4" />
                                                    تعديل
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 sm:p-8 overflow-y-auto flex-1">
                                    {loadingAddressDetails ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Spinner />
                                        </div>
                                    ) : isAddingNewAddress || isEditingAddress ? (
                                        <div className="space-y-5">
                                            {/* اسم العنوان مع اقتراحات سريعة */}
                                            <div className="bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/5 rounded-2xl p-5 border-2 border-[#579BE8]/20">
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                                        <FaMapMarkerAlt className="text-[#579BE8] w-4 h-4" />
                                                        اسم العنوان
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setQuickName('البيت', 'home')}
                                                            className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                                                        >
                                                            <FaHome className="w-3 h-3" />
                                                            البيت
                                                        </button>
                                                        <button
                                                            onClick={() => setQuickName('العمل', 'work')}
                                                            className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1"
                                                        >
                                                            <FaBriefcase className="w-3 h-3" />
                                                            العمل
                                                        </button>
                                                        <button
                                                            onClick={() => setQuickName('مكان آخر', 'other')}
                                                            className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1"
                                                        >
                                                            <FaMapMarkedAlt className="w-3 h-3" />
                                                            آخر
                                                        </button>
                                                    </div>
                                                </div>
                                                <Input
                                                    value={editAddressForm.name}
                                                    onChange={(e) => setEditAddressForm(prev => ({ ...prev, name: e.target.value }))}
                                                    className="w-full bg-white dark:bg-card border-2 border-border/50 focus:border-[#579BE8] rounded-xl mt-2"
                                                    placeholder="اسم العنوان"
                                                />
                                            </div>

                                            {/* العنوان الكامل */}
                                            <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50">
                                                <label className="text-sm font-bold text-foreground mb-3 block flex items-center gap-2">
                                                    <FaMapMarkerAlt className="text-[#579BE8] w-4 h-4" />
                                                    العنوان الكامل
                                                </label>
                                                <textarea
                                                    value={editAddressForm.address}
                                                    onChange={(e) => setEditAddressForm(prev => ({ ...prev, address: e.target.value }))}
                                                    className="w-full p-4 bg-white dark:bg-card border-2 border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#579BE8] focus:border-[#579BE8] resize-none"
                                                    rows="2"
                                                    placeholder="العنوان الكامل"
                                                />
                                            </div>

                                            {/* تحديد الموقع على الخريطة */}
                                            <div className="bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-2xl p-5 border-2 border-border/50">
                                                <div className="flex items-center justify-between mb-4">
                                                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                                        <FaMapMarkerAlt className="text-[#579BE8] w-4 h-4" />
                                                        تحديد الموقع على الخريطة
                                                    </label>
                                                    <button
                                                        onClick={getCurrentLocation}
                                                        disabled={isFetchingLocation}
                                                        className="px-3 py-2 bg-[#579BE8] text-white rounded-lg hover:bg-[#4a8dd8] transition-colors text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        <FaCrosshairs className="w-4 h-4" />
                                                        {isFetchingLocation ? 'جاري...' : 'موقعي الحالي'}
                                                    </button>
                                                </div>
                                                
                                                {showMapPicker ? (
                                                    <div className="mb-4">
                                                        <SimpleMapPicker
                                                            initialPosition={{
                                                                lat: parseFloat(editAddressForm.latitude) || 24.7136,
                                                                lng: parseFloat(editAddressForm.longitude) || 46.6753
                                                            }}
                                                            onLocationSelect={handleLocationSelect}
                                                        />
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setShowMapPicker(true)}
                                                        className="w-full p-4 bg-white dark:bg-card border-2 border-dashed border-border/50 rounded-xl hover:border-[#579BE8] hover:bg-[#579BE8]/5 transition-all flex flex-col items-center justify-center gap-2"
                                                    >
                                                        <FaMapMarkerAlt className="w-8 h-8 text-[#579BE8]" />
                                                        <span className="text-foreground font-bold">اضغط هنا لفتح الخريطة وتحديد الموقع</span>
                                                        <span className="text-sm text-muted-foreground">انقر على الخريطة لتحديد الموقع وسيتم ملء البيانات تلقائياً</span>
                                                    </button>
                                                )}

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                                    <div>
                                                        <label className="text-sm font-bold text-foreground mb-2 block">خط العرض</label>
                                                        <Input
                                                            type="text"
                                                            value={editAddressForm.latitude}
                                                            onChange={(e) => setEditAddressForm(prev => ({ ...prev, latitude: e.target.value }))}
                                                            className="w-full bg-white dark:bg-card border-2 border-border/50 focus:border-[#579BE8] rounded-xl font-mono"
                                                            placeholder="24.7136"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-sm font-bold text-foreground mb-2 block">خط الطول</label>
                                                        <Input
                                                            type="text"
                                                            value={editAddressForm.longitude}
                                                            onChange={(e) => setEditAddressForm(prev => ({ ...prev, longitude: e.target.value }))}
                                                            className="w-full bg-white dark:bg-card border-2 border-border/50 focus:border-[#579BE8] rounded-xl font-mono"
                                                            placeholder="46.6753"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* المدينة والمنطقة مع اقتراحات */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                                            <FaBuilding className="text-[#579BE8] w-4 h-4" />
                                                            المدينة
                                                        </label>
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => setQuickLocation('الرياض', 'حي النرجس')}
                                                                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                            >
                                                                الرياض
                                                            </button>
                                                            <button
                                                                onClick={() => setQuickLocation('جدة', 'حي الزمالك')}
                                                                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                            >
                                                                جدة
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <Input
                                                        value={editAddressForm.city}
                                                        onChange={(e) => setEditAddressForm(prev => ({ ...prev, city: e.target.value }))}
                                                        className="w-full bg-white dark:bg-card border-2 border-border/50 focus:border-[#579BE8] rounded-xl"
                                                        placeholder="المدينة"
                                                    />
                                                </div>

                                                <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                                            <BiCurrentLocation className="text-[#579BE8] w-4 h-4" />
                                                            المنطقة
                                                        </label>
                                                        <button
                                                            onClick={() => setEditAddressForm(prev => ({ ...prev, area: 'حي النرجس' }))}
                                                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                        >
                                                            النرجس
                                                        </button>
                                                    </div>
                                                    <Input
                                                        value={editAddressForm.area}
                                                        onChange={(e) => setEditAddressForm(prev => ({ ...prev, area: e.target.value }))}
                                                        className="w-full bg-white dark:bg-card border-2 border-border/50 focus:border-[#579BE8] rounded-xl"
                                                        placeholder="المنطقة"
                                                    />
                                                </div>
                                            </div>

                                            {/* النوع والمفضلة */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50">
                                                    <label className="text-sm font-bold text-foreground mb-3 block">النوع</label>
                                                    <select
                                                        value={editAddressForm.type}
                                                        onChange={(e) => setEditAddressForm(prev => ({ ...prev, type: e.target.value }))}
                                                        className="w-full p-3 bg-white dark:bg-card border-2 border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#579BE8] focus:border-[#579BE8]"
                                                    >
                                                        <option value="home">🏠 منزل</option>
                                                        <option value="work">💼 عمل</option>
                                                        <option value="other">📍 أخرى</option>
                                                    </select>
                                                </div>

                                                <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50 flex items-center justify-center">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            id="is_favorite"
                                                            checked={editAddressForm.is_favorite}
                                                            onChange={(e) => setEditAddressForm(prev => ({ ...prev, is_favorite: e.target.checked }))}
                                                            className="w-6 h-6 rounded border-2 border-border/50 text-[#579BE8] focus:ring-[#579BE8] cursor-pointer"
                                                        />
                                                        <label htmlFor="is_favorite" className="text-sm font-bold text-foreground cursor-pointer flex items-center gap-2">
                                                            <FaStar className={`w-5 h-5 ${editAddressForm.is_favorite ? 'text-[#579BE8]' : 'text-muted-foreground'}`} />
                                                            إضافة إلى المفضلة
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* معلومات إضافية */}
                                            <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50">
                                                <label className="text-sm font-bold text-foreground mb-3 block flex items-center gap-2">
                                                    <FaInfoCircle className="text-[#579BE8] w-4 h-4" />
                                                    معلومات إضافية
                                                </label>
                                                <textarea
                                                    value={editAddressForm.additional_info}
                                                    onChange={(e) => setEditAddressForm(prev => ({ ...prev, additional_info: e.target.value }))}
                                                    className="w-full p-4 bg-white dark:bg-card border-2 border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#579BE8] focus:border-[#579BE8] resize-none"
                                                    rows="2"
                                                    placeholder="معلومات إضافية مثل رقم الشقة، الطابق، إلخ..."
                                                />
                                            </div>

                                            {/* أزرار الحفظ والإلغاء */}
                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    onClick={isAddingNewAddress ? handleAddNewAddress : handleUpdateAddress}
                                                    disabled={isAddingAddress || isUpdatingAddress}
                                                    className="flex-1 bg-gradient-to-r from-[#579BE8] to-[#124987] text-white py-3.5 rounded-xl hover:from-[#4a8dd8] hover:to-[#0f3d6f] transition-all font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {(isAddingAddress || isUpdatingAddress) ? (
                                                        <>
                                                            <Spinner />
                                                            <span>جاري الحفظ...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaCheckCircle className="w-5 h-5" />
                                                            <span>{isAddingNewAddress ? "إضافة العنوان" : "حفظ التغييرات"}</span>
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="px-6 py-3.5 bg-secondary text-foreground rounded-xl hover:bg-secondary/80 transition-colors font-bold border border-border/50"
                                                >
                                                    إلغاء
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Display mode (read-only) - similar to edit form
                                        renderDisplayMode()
                                    )}
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}