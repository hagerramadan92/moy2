"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { IoLocationOutline } from "react-icons/io5";
import { toast } from "react-hot-toast";

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export default function CurrentLocation() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([24.7136, 46.6753]); // Default to Riyadh, Saudi Arabia
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fix Leaflet icon issue in Next.js
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
    }
  }, []);

  useEffect(() => {
    // Set map center to detected location if available
    if (currentLocation) {
      setMapCenter([currentLocation.lat, currentLocation.lng]);
    }
  }, [currentLocation]);

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        }
      );
      const data = await response.json();
      if (data && data.display_name) {
        return data.display_name;
      }
      return null;
    } catch (error) {
      console.error("Error fetching address:", error);
      return null;
    }
  };

  const detectCurrentLocation = () => {
    // Prevent re-detection if location is already detected
    if (currentLocation || locationAddress) {
      return;
    }

    if (!navigator.geolocation) {
      toast.error("المتصفح لا يدعم تحديد الموقع");
      setError("Geolocation is not supported by your browser");
      return;
    }

    // Show permission request toast
    const toastId = toast(
      (t) => (
        <div className="flex flex-col gap-3 p-2">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#579BE8]/10 flex items-center justify-center">
              <IoLocationOutline className="w-5 h-5 text-[#579BE8]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">السماح بالوصول إلى موقعك</h3>
              <p className="text-sm text-gray-600 mb-3">
                نحتاج إلى الوصول إلى موقعك لتحديد موقعك بدقة على الخريطة
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    proceedWithLocationDetection();
                  }}
                  className="px-4 py-2 bg-[#579BE8] text-white rounded-lg text-sm font-semibold hover:bg-[#4889d4] transition-colors"
                >
                  السماح
                </button>
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    toast.error("يجب السماح بالوصول إلى موقعك لتحديد موقعك بدقة", {
                      duration: 3000,
                    });
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  رفض
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: "top-center",
        style: {
          background: "white",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          maxWidth: "400px",
        },
      }
    );
  };

  const proceedWithLocationDetection = () => {
    setIsLoading(true);
    setError(null);
    setLocationAddress(null);

    // Show loading toast
    const loadingToast = toast.loading("جاري تحديد موقعك...", {
      position: "top-center",
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({
          lat: latitude,
          lng: longitude,
        });
        setMapCenter([latitude, longitude]);
        
        // Get address from coordinates
        const address = await getAddressFromCoordinates(latitude, longitude);
        setLocationAddress(address || "لم يتم العثور على اسم الموقع");
        
        setIsLoading(false);
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success("تم تحديد موقعك بنجاح!", {
          position: "top-center",
          duration: 3000,
          icon: "📍",
        });
      },
      (err) => {
        setIsLoading(false);
        
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        
        let errorMessage = "لم يتم السماح بالوصول إلى موقعك";
        if (err.code === err.PERMISSION_DENIED) {
          errorMessage = "تم رفض الوصول إلى موقعك. يرجى السماح بالوصول في إعدادات المتصفح";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMessage = "موقعك غير متاح حالياً";
        } else if (err.code === err.TIMEOUT) {
          errorMessage = "انتهت مهلة طلب الموقع";
        }
        
        toast.error(errorMessage, {
          position: "top-center",
          duration: 4000,
        });
        
        setError(errorMessage);
        console.error("Geolocation error:", err);
      }
    );
  };

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#579BE8]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#DF4F3C]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="px-3 mx-auto max-w-7xl  sm:px-6 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-right mb-6 sm:mb-8 md:mb-10"
              >
                <div className="inline-block mb-2 md:mb-3">
                  <span className="text-[10px] sm:text-xs font-bold text-[#579BE8] bg-[#579BE8]/10 px-3 py-1.5 rounded-full">
                    تحديد الموقع
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-gray-900 mb-2 md:mb-3 leading-tight">
                  <span className="block text-[#579BE8]">حدد موقعك بدقة ليصلك السائق بأسرع وقت</span>
                </h1>
                <div className="w-16 h-1 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full ml-auto"></div>
              </motion.div>

              {/* Features */}
              <div className="space-y-6 pt-4">
                <div className="group flex items-start gap-5 p-5 rounded-2xl bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <div
                    className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: "#579BE8" }}
                  >
                    <IoLocationOutline className="w-7 h-7 md:w-8 md:h-8" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                      تحديد دقيق
                    </h2>
                    <p className="text-base text-gray-600 leading-relaxed">
                      حدد موقعك بدقة عالية على الخريطة
                    </p>
                  </div>
                </div>

                <div className="group flex items-start gap-5 p-5 rounded-2xl bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <div
                    className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: "#DF4F3C" }}
                  >
                    <Image
                      width={100}
                      height={100}
                      src="/images/north.png"
                      alt="Location Icon"
                      className="w-8 h-8 md:w-10 md:h-10"
                    />
                  </div>
                  <div className="flex-1 pt-1">
                    <h2 className="text-xl md:text-[28px] font-bold text-gray-900 mb-2">
                      تتبع مباشر
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      تابع موقع السائق في الوقت الفعلي
                    </p>
                  </div>
                </div>
              </div>

              {/* Button */}
              <div className="pt-4">
                <button
                  onClick={detectCurrentLocation}
                  disabled={isLoading || currentLocation || locationAddress}
                  className="group relative w-full md:w-auto md:px-12 py-4 bg-gradient-to-r from-[#579BE8] to-[#315782] text-white text-base md:text-lg font-semibold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[#4788d5] to-[#2a4a6f] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <IoLocationOutline 
                    size={22} 
                    className={`relative z-10 ${isLoading ? 'animate-pulse' : (currentLocation || locationAddress) ? '' : 'group-hover:animate-bounce'}`} 
                  />
                  <span className="relative z-10">
                    {isLoading ? "جاري التحميل..." : (currentLocation || locationAddress) ? "تم تحديد الموقع" : "حدد موقعك الآن"}
                  </span>
                  {isLoading && (
                    <span className="relative z-10 w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></span>
                  )}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 shadow-sm animate-in fade-in duration-300">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Location Address Display */}
              {locationAddress && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#579BE8]/10 to-[#315782]/10 border-2 border-[#579BE8]/20 shadow-lg backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#579BE8] flex items-center justify-center text-white shadow-md">
                      <IoLocationOutline size={22} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-700 mb-2">
                        موقعك الحالي
                      </h3>
                      <p className="text-base md:text-lg font-bold text-[#579BE8] leading-relaxed">
                        {locationAddress}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Map Container */}
            <div className="relative group">
              <div className={`relative w-full h-[500px] md:h-[550px] lg:h-[600px] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden bg-gray-100 transition-all duration-500 ring-1 ring-gray-200/50 ${
                currentLocation || locationAddress 
                  ? 'cursor-default' 
                  : 'cursor-pointer hover:shadow-[0_25px_70px_rgba(0,0,0,0.25)] hover:scale-[1.02]'
              }`}>
                {/* Gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50 z-10 pointer-events-none"></div>
                
                {/* Centered overlay text */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-20 text-white pointer-events-none px-6 text-center max-w-lg w-full">
                  {locationAddress ? (
                    <div className="animate-in fade-in zoom-in duration-500 space-y-3">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30">
                          <IoLocationOutline size={28} className="text-white" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                          موقعي الحالي
                        </h3>
                      </div>
                      <div className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                        <p className="text-base md:text-lg font-semibold text-white leading-relaxed">
                          {locationAddress}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30 animate-pulse">
                          <IoLocationOutline size={32} className="text-white" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                          موقعي الحالي
                        </h3>
                      </div>
                      <p className="text-sm md:text-base text-white/90 font-medium backdrop-blur-sm px-4 py-2 rounded-xl bg-white/10">
                        انقر على الخريطة لتحديد موقعك
                      </p>
                    </div>
                  )}
                </div>

                {/* Map */}
                {mounted && (
                  <MapWithClickHandler
                    center={mapCenter}
                    onMapClick={detectCurrentLocation}
                    currentLocation={currentLocation}
                  />
                )}
              </div>

              {/* Decorative glow effects */}
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-[#579BE8]/30 to-[#315782]/20 rounded-full blur-3xl -z-10 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-gradient-to-tr from-[#DF4F3C]/30 to-[#B3000D]/20 rounded-full blur-3xl -z-10 group-hover:opacity-60 transition-opacity duration-500"></div>
              {/* Inner glow effect */}
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Separate component for the map with click handler
function MapWithClickHandler({ center, onMapClick, currentLocation }) {
  // Component to handle map clicks
  function MapClickHandler() {
    try {
      const { useMapEvents } = require("react-leaflet");
      
      useMapEvents({
        click: (e) => {
          if (onMapClick && typeof onMapClick === 'function') {
            try {
              // Extract lat/lng from the click event
              const latlng = e.latlng;
              if (latlng && typeof latlng.lat === 'number' && typeof latlng.lng === 'number') {
                // Call onMapClick with lat and lng if it accepts parameters
                // Otherwise just call it without parameters
                if (onMapClick.length > 0) {
                  onMapClick(latlng.lat, latlng.lng);
                } else {
                  onMapClick();
                }
              } else {
                // If no valid coordinates, just call the function
                onMapClick();
              }
            } catch (error) {
              console.error('Error handling map click:', error);
              // Fallback: try calling without parameters
              try {
                onMapClick();
              } catch (fallbackError) {
                console.error('Error in fallback map click handler:', fallbackError);
              }
            }
          }
        },
      });
      
      return null;
    } catch (error) {
      console.error('Error initializing MapClickHandler:', error);
      return null;
    }
  }

  // Component to update map center when location changes
  function MapCenterUpdater({ center }) {
    const { useMap } = require("react-leaflet");
    const map = useMap();
    
    React.useEffect(() => {
      if (!center || !map) return;
      
      // Wait for map to be fully initialized
      if (!map.setView || !map.getZoom) {
        return;
      }
      
      try {
        // Check if center is a valid array with 2 elements
        if (Array.isArray(center) && center.length === 2 && 
            typeof center[0] === 'number' && typeof center[1] === 'number' &&
            !isNaN(center[0]) && !isNaN(center[1])) {
          const currentZoom = map.getZoom();
          // Use setTimeout to ensure map is ready
          setTimeout(() => {
            if (map && map.setView) {
              map.setView(center, currentZoom, { animate: true });
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error updating map center:', error);
      }
    }, [center, map]);
    
    return null;
  }

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%", zIndex: 1 }}
      className="rounded-3xl"
      key={JSON.stringify(center)} // Force re-render when center changes
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {currentLocation && (
        <Marker position={[currentLocation.lat, currentLocation.lng]}>
          <Popup>موقعك الحالي</Popup>
        </Marker>
      )}
      <MapClickHandler />
      <MapCenterUpdater center={center} />
    </MapContainer>
  );
}
