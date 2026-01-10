"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, Navigation, Check, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

// Fix for Leaflet default marker icons in Next.js
const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

function LocationMarker({ position, setPosition }) {
  const map = useMap();

  useEffect(() => {
    if (position) map.flyTo(position, Math.max(map.getZoom(), 15));
  }, [position, map]);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function LocationPickerModal({
  isOpen,
  onClose,
  onSelect,
  initialLocation,
}) {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  const watchIdRef = useRef(null);
  const hardTimeoutRef = useRef(null);

  useEffect(() => {
    fixLeafletIcons();

    if (isOpen) {
      // Log environment info
      console.log("LocationPicker opened - Environment check:");
      console.log("HTTPS:", window.location.protocol === "https:");
      console.log("Geolocation available:", !!navigator.geolocation);
      console.log("Permissions API:", !!navigator.permissions);
      
      setDebugInfo(`HTTPS: ${window.location.protocol === "https:" ? "Yes" : "No"}`);

      // set initial location if provided
      if (initialLocation?.lat && initialLocation?.lng) {
        setPosition({ lat: initialLocation.lat, lng: initialLocation.lng });
      }

      // Check permissions if API available
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          console.log('Initial permission state:', result.state);
          setDebugInfo(prev => `${prev} | Permission: ${result.state}`);
          
          result.onchange = () => {
            console.log('Permission changed to:', result.state);
            setDebugInfo(prev => `${prev} | Permission changed: ${result.state}`);
          };
        }).catch(err => {
          console.error('Permission query error:', err);
        });
      }

      const t = setTimeout(() => setMapReady(true), 100);
      return () => clearTimeout(t);
    } else {
      setMapReady(false);
      setLoading(false);
      setDebugInfo("");
      
      // cleanup watchers
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (hardTimeoutRef.current) {
        clearTimeout(hardTimeoutRef.current);
        hardTimeoutRef.current = null;
      }
    }
  }, [isOpen, initialLocation]);

  const testGeolocation = () => {
    console.log("=== Geolocation Test ===");
    console.log("navigator.geolocation:", navigator.geolocation);
    console.log("UserAgent:", navigator.userAgent);
    console.log("Platform:", navigator.platform);
    
    if (!navigator.geolocation) {
      toast.error("Geolocation API not available in this browser");
      return;
    }
    
    toast.success("Check browser console for test results");
  };

  const handleLocateMe = () => {
    console.log("handleLocateMe triggered");
    setLoading(true);
    
    // Clear any existing timeouts/watchers
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (hardTimeoutRef.current) {
      clearTimeout(hardTimeoutRef.current);
      hardTimeoutRef.current = null;
    }

    if (!navigator.geolocation) {
      console.error("Geolocation not supported by browser");
      toast.error(
        <div className="text-right">
          <p className="font-bold">المتصفح لا يدعم تحديد الموقع</p>
          <p className="text-sm mt-1">يرجى استخدام Chrome, Firefox, أو Safari</p>
        </div>
      );
      setLoading(false);
      return;
    }

    // Show permission guide
    const showPermissionGuide = () => {
      toast.error(
        <div className="text-right">
          <p className="font-bold">تم رفض إذن الموقع</p>
          <div className="text-xs mt-2 space-y-1 text-gray-600">
            <p>✓ تحقق من شريط المتصفح لأيقونة الموقع</p>
            <p>✓ انقر عليها واختر "السماح"</p>
            <p>✓ على الهاتف: تأكد من تفعيل GPS</p>
            <p>✓ امسح ذاكرة التخزين المؤقت وأعد المحاولة</p>
          </div>
        </div>,
        { duration: 8000, icon: <AlertCircle className="text-red-500" /> }
      );
    };

    const options = {
      enableHighAccuracy: true,  // Use GPS if available
      timeout: 10000,            // 10 seconds
      maximumAge: 0,             // Don't use cached position
    };

    console.log("Requesting geolocation with options:", options);

    // Try getCurrentPosition first
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("✅ Geolocation SUCCESS:", pos);
        console.log(`Coordinates: ${pos.coords.latitude}, ${pos.coords.longitude}`);
        console.log(`Accuracy: ${pos.coords.accuracy} meters`);
        
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        
        toast.success(
          <div className="text-right">
            <p className="font-bold">تم تحديد موقعك بنجاح</p>
            <p className="text-sm mt-1">
              الدقة: {Math.round(pos.coords.accuracy)} متر
            </p>
          </div>,
          { duration: 3000 }
        );
        
        setLoading(false);
        if (hardTimeoutRef.current) {
          clearTimeout(hardTimeoutRef.current);
          hardTimeoutRef.current = null;
        }
      },
      (err) => {
        console.error("❌ Geolocation ERROR:", err);
        console.error("Error code:", err.code);
        console.error("Error message:", err.message);
        
        setLoading(false);
        
        // Try watchPosition as fallback for some devices
        if (err.code === 3 || err.code === 2) { // TIMEOUT or POSITION_UNAVAILABLE
          console.log("Trying fallback with watchPosition...");
          
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              console.log("✅ WatchPosition success:", pos.coords);
              const { latitude, longitude } = pos.coords;
              setPosition({ lat: latitude, lng: longitude });
              
              toast.success(
                <div className="text-right">
                  <p className="font-bold">تم تحديد الموقع باستخدام watchPosition</p>
                  <p className="text-sm mt-1">الدقة: {Math.round(pos.coords.accuracy)} متر</p>
                </div>,
                { duration: 3000 }
              );
              
              setLoading(false);
              navigator.geolocation.clearWatch(watchIdRef.current);
              watchIdRef.current = null;
              
              if (hardTimeoutRef.current) {
                clearTimeout(hardTimeoutRef.current);
                hardTimeoutRef.current = null;
              }
            },
            (watchErr) => {
              console.error("WatchPosition error:", watchErr);
              handleGeolocationError(watchErr);
            },
            { ...options, timeout: 15000 }
          );
        } else {
          handleGeolocationError(err);
        }
        
        if (hardTimeoutRef.current) {
          clearTimeout(hardTimeoutRef.current);
          hardTimeoutRef.current = null;
        }
      },
      options
    );

    // Hard timeout for safety
    hardTimeoutRef.current = setTimeout(() => {
      if (loading) {
        console.log("⚠️ Geolocation hard timeout reached");
        setLoading(false);
        toast.error(
          <div className="text-right">
            <p className="font-bold">انتهت مهلة تحديد الموقع</p>
            <p className="text-sm mt-1">يرجى المحاولة مرة أخرى أو التحقق من إعدادات الموقع</p>
          </div>,
          { duration: 5000 }
        );
        
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      }
    }, 20000); // 20 seconds max
  };

  const handleGeolocationError = (err) => {
    console.error("Geolocation error details:", err);
    
    switch(err.code) {
      case 1: // PERMISSION_DENIED
        toast.error(
          <div className="text-right">
            <p className="font-bold">تم رفض إذن الموقع</p>
            <div className="text-xs mt-2 space-y-1 text-gray-600">
              <p>1. ابحث عن أيقونة 🔒 أو 🌐 في شريط العنوان</p>
              <p>2. انقر عليها واختر "السماح" للموقع</p>
              <p>3. على الهاتف: تأكد من تفعيل GPS في الإعدادات</p>
              <p>4. جرب فتح الموقع في نافذة متصفح جديدة</p>
            </div>
          </div>,
          { duration: 10000, icon: <AlertCircle className="text-red-500" /> }
        );
        break;
        
      case 2: // POSITION_UNAVAILABLE
        toast.error(
          <div className="text-right">
            <p className="font-bold">تعذر الوصول إلى موقعك</p>
            <p className="text-sm mt-1">يرجى تفعيل خدمة الموقع (GPS) على جهازك</p>
          </div>,
          { duration: 6000 }
        );
        break;
        
      case 3: // TIMEOUT
        toast.error(
          <div className="text-right">
            <p className="font-bold">انتهت مهلة البحث</p>
            <p className="text-sm mt-1">جاري البحث عن موقعك لكنه يستغرق وقتاً</p>
            <p className="text-xs mt-1">تأكد من اتصال الإنترنت وخدمة GPS</p>
          </div>,
          { duration: 6000 }
        );
        break;
        
      default:
        toast.error(
          <div className="text-right">
            <p className="font-bold">خطأ في تحديد الموقع</p>
            <p className="text-sm mt-1">{err.message || "حدث خطأ غير متوقع"}</p>
            <p className="text-xs mt-1">يرجى المحاولة مرة أخرى</p>
          </div>,
          { duration: 5000 }
        );
    }
  };

  const handleConfirm = async () => {
    if (!position) {
      toast.error("يرجى تحديد موقع على الخريطة أولاً");
      return;
    }

    let addressText = `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`,
        {
          headers: {
            'Accept-Language': 'ar', // Request Arabic results if available
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          addressText = data.display_name;
          console.log("Reverse geocode result:", data.display_name);
        }
      }
    } catch (e) {
      console.error("Reverse geocoding error:", e);
    }

    console.log("Confirming location:", { position, addressText });
    onSelect?.({ lat: position.lat, lng: position.lng, address: addressText });
    onClose?.();
  };

  const handleManualLocation = async (coords) => {
    try {
      setLoading(true);
      const [lat, lng] = coords.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setPosition({ lat, lng });
        toast.success("تم تعيين الموقع يدوياً");
      } else {
        toast.error("إحداثيات غير صالحة. استخدم تنسيق: خط العرض, خط الطول");
      }
    } catch (e) {
      toast.error("خطأ في الإحداثيات المدخلة");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-lg text-gray-800">تحديد الموقع</h3>
            {debugInfo && (
              <p className="text-xs text-gray-500 mt-1">{debugInfo}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Debug button - remove in production */}
            <button
              onClick={testGeolocation}
              className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              title="Debug geolocation"
            >
              Test
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 relative bg-gray-100">
          {mapReady && (
            <MapContainer
              center={position || { lat: 24.7136, lng: 46.6753 }} // Riyadh coordinates
              zoom={position ? 15 : 13}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-[1000]">
              <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="font-bold text-gray-800">جاري تحديد موقعك...</p>
                <p className="text-sm text-gray-600 mt-2">
                  قد يستغرق هذا بضع ثوانٍ
                </p>
                <p className="text-xs text-gray-500 mt-3">
                  تأكد من منح إذن الموقع للمتصفح
                </p>
              </div>
            </div>
          )}

          {/* Quick Location Buttons */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <button
              onClick={() => setPosition({ lat: 24.7136, lng: 46.6753 })}
              className="bg-white px-3 py-2 rounded-lg shadow-md hover:bg-gray-50 text-sm font-medium"
            >
              الرياض
            </button>
            <button
              onClick={() => setPosition({ lat: 21.4858, lng: 39.1925 })}
              className="bg-white px-3 py-2 rounded-lg shadow-md hover:bg-gray-50 text-sm font-medium"
            >
              مكة
            </button>
            <button
              onClick={() => setPosition({ lat: 24.4686, lng: 39.6142 })}
              className="bg-white px-3 py-2 rounded-lg shadow-md hover:bg-gray-50 text-sm font-medium"
            >
              المدينة
            </button>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-[1000] w-full px-4 justify-center">
            <button
              onClick={handleLocateMe}
              disabled={loading}
              className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl shadow-lg font-semibold hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-70 min-w-[160px] justify-center"
            >
              <Navigation size={20} className={loading ? "animate-spin" : ""} />
              <span>{loading ? "جاري التحديد..." : "موقعي الحالي"}</span>
            </button>

            <button
              onClick={handleConfirm}
              disabled={!position}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl shadow-lg font-semibold hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale min-w-[160px] justify-center"
            >
              <Check size={20} />
              <span>تأكيد الموقع</span>
            </button>
          </div>

          {/* Position Display */}
          {position && (
            <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg max-w-xs">
              <p className="text-sm font-bold text-gray-800">الموقع المحدد:</p>
              <p className="text-xs text-gray-600 mt-1 font-mono">
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        <div className="p-3 bg-white border-t text-center text-sm text-gray-500">
          <div className="flex flex-col md:flex-row justify-center items-center gap-2">
            <span>يمكنك تحريك الخريطة والنقر لتحديد موقعك بدقة</span>
            <span className="hidden md:inline">•</span>
            <span className="text-blue-600 font-medium">
              {position ? "✓ موقع محدد" : "ⓘ اختر موقعًا من الخريطة"}
            </span>
          </div>
           
        </div>
      </div>
    </div>
  );
}