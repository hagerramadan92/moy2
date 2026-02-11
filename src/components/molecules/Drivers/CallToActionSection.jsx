"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaHeadset } from "react-icons/fa";
import { FiTruck } from "react-icons/fi";
import dynamic from 'next/dynamic';

// استيراد Leaflet بشكل ديناميكي مع تعطيل SSR - يتم التحميل مسبقاً
const LeafletMap = dynamic(
  () => import('./LeafletMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#579BE8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">جاري تحميل الخريطة...</p>
        </div>
      </div>
    )
  }
);

// مكون الخريطة المنفصل
function MapComponent({ mapRef, leafletMapRef, markersRef, truckLocations }) {
  const [isMapReady, setIsMapReady] = useState(false);
  const mapInitialized = useRef(false); // استخدام useRef بدلاً من useState

  useEffect(() => {
    // تحميل Leaflet مباشرة عند تحميل المكون
    const initMap = async () => {
      // منع التهيئة إذا كانت الخريطة موجودة بالفعل أو تمت التهيئة مسبقاً
      if (typeof window === 'undefined' || !mapRef.current || mapInitialized.current || leafletMapRef.current) {
        return;
      }

      try {
        // علامة أن التهيئة بدأت
        mapInitialized.current = true;

        // استيراد Leaflet مع التحميل المسبق
        const L = (await import('leaflet')).default;
        
        // استيراد CSS مرة واحدة فقط
        if (!document.querySelector('#leaflet-css')) {
          await import('leaflet/dist/leaflet.css');
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Fix Leaflet icon issue
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        // التأكد مرة أخرى أن الخريطة لم تنشأ بعد
        if (leafletMapRef.current) {
          return;
        }

        // Create map only if not already created
        leafletMapRef.current = L.map(mapRef.current, {
          zoomControl: true,
          fadeAnimation: false,
          zoomAnimation: false,
          markerZoomAnimation: false,
        }).setView([24.7136, 46.6753], 12);

        // Add tiles - خريطة ملونة وجميلة (CartoDB Voyager)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, © CartoDB',
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(leafletMapRef.current);

        // Add markers
        const selectedLocations = truckLocations.slice(0, 4);
        selectedLocations.forEach((location) => {
          const truckIcon = L.divIcon({
            className: 'truck-marker',
            html: `
              <div class="relative group cursor-pointer" dir="rtl">
                <div class="w-14 h-14 rounded-full shadow-xl transform hover:scale-110 transition-transform duration-300 flex items-center justify-center border-2 border-white overflow-hidden" style="background: linear-gradient(135deg, #579BE8, #124987);">
                  <img 
                    src="/car3.png" 
                    alt="شاحنة"
                    class="w-9 h-9 object-contain" 
                    onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'40\\' height=\\'40\\' viewBox=\\'0 0 256 256\\'%3E%3Cpath fill=\\'white\\' d=\\'M240,112H208V80a8,8,0,0,0-8-8H160V40a8,8,0,0,0-8-8H24A16,16,0,0,0,8,48V176a16,16,0,0,0,16,16H40a32,32,0,0,0,62,0h52a32,32,0,0,0,62,0h24a16,16,0,0,0,16-16V120A8,8,0,0,0,240,112ZM72,192a16,16,0,1,1,16-16A16,16,0,0,1,72,192Zm112,0a16,16,0,1,1,16-16A16,16,0,0,1,184,192Zm48-64H208V128h24Z\\'/%3E%3C/svg%3E'"
                  />
                </div>
              </div>
            `,
            iconSize: [56, 74],
            iconAnchor: [28, 74],
            popupAnchor: [0, -74],
          });

          L.marker([location.lat, location.lng], { 
            icon: truckIcon,
            riseOnHover: true,
          }).addTo(leafletMapRef.current);
        });

        // Force resize after initialization
        setTimeout(() => {
          if (leafletMapRef.current) {
            leafletMapRef.current.invalidateSize();
            setIsMapReady(true);
          }
        }, 50);

      } catch (error) {
        console.error("Error initializing map:", error);
        mapInitialized.current = false; // إعادة تعيين في حالة الخطأ
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        mapInitialized.current = false;
      }
    };
  }, [truckLocations]); // إضافة dependency

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="absolute inset-0 w-full h-full z-10" dir="ltr" />
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#579BE8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">جاري تحميل خريطة الرياض...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CallToActionSection() {
  const router = useRouter();
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const [isClient, setIsClient] = useState(false);

  // Real locations in Riyadh, Saudi Arabia
  const truckLocations = [
    { lat: 24.7136, lng: 46.6753, name: "الرياض - وسط المدينة", area: "العليا" },
    { lat: 24.7743, lng: 46.7385, name: "الرياض - الملك فهد", area: "طريق الملك فهد" },
    { lat: 24.6880, lng: 46.7224, name: "الرياض - النخيل", area: "حي النخيل" },
    { lat: 24.8123, lng: 46.6289, name: "الرياض - الصحافة", area: "حي الصحافة" },
    { lat: 24.7519, lng: 46.6557, name: "الرياض - المحمدية", area: "حي المحمدية" },
    { lat: 24.7337, lng: 46.6744, name: "الرياض - الملقا", area: "حي الملقا" },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <section className="relative py-14 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden my-0">
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#579BE8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">جاري التحميل...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-14 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden my-0">
      {/* Background Pattern - نفس الكود */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#579BE8]/10 via-[#124987]/5 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#1C7C4B]/10 via-[#2A9D5F]/5 to-transparent rounded-full blur-3xl"
        />
        
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle, #579BE8 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}></div>
        
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, #579BE8 10px, #579BE8 11px)`,
        }}></div>
        
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#579BE8]/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#579BE8]/20 to-transparent"></div>
      </div>

      <div className="px-3 mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8 md:mb-10"
        >
          <div className="inline-block mb-2 md:mb-3">
            <span className="text-xs md:text-sm font-bold text-[#579BE8] bg-[#579BE8]/10 px-3 py-1.5 rounded-full">
              خدمة احترافية موثوقة
            </span>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-900 mb-2 md:mb-3 leading-tight">
            <span className="block text-[#579BE8]">جاهز تطلب المويه؟</span>
            <span className="block text-sm sm:text-base md:text-lg text-gray-600 mt-1">
              احصل علي عروض أسعار فورية من السائقين في منطقتك الان
            </span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mx-auto"></div>
        </motion.div>

        {/* Real Map with Truck Icons - Riyadh */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative w-full max-w-6xl mx-auto mb-12 sm:mb-14 md:mb-16"
        >
          {/* Map Container */}
          <div className="relative w-full h-[300px] sm:h-[500px] md:h-[550px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
            {/* Map Component */}
            <MapComponent 
              mapRef={mapRef}
              leafletMapRef={leafletMapRef}
              markersRef={markersRef}
              truckLocations={truckLocations}
            />
          </div>

          {/* Map overlay with driver count */}
          <div className="absolute -bottom-5 right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg border border-gray-200 z-30">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#579BE8] to-[#124987] border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                    <FiTruck />
                  </div>
                ))}
              </div>
              <span className="text-sm font-bold text-gray-800">
                <span className="text-[#579BE8] text-lg ml-1">4</span> سائقين متاحين  
              </span>
            </div>
          </div>

          {/* Riyadh badge */}
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-2 py-2 rounded-lg shadow-lg z-30">
            <div className="flex items-center gap-2">
              <span className="text-white text-2xl">🇸🇦</span>
              <span className="text-white font-bold text-sm md:text-lg">الرياض، السعودية</span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex gap-2 sm:gap-4 justify-center items-center max-w-md mx-auto"
        >
          <motion.button
            onClick={() => router.push("/orders")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative w-full sm:w-auto sm:min-w-[180px] md:min-w-[200px] h-12 sm:h-14 rounded-xl border border-[#94c5f8] bg-gradient-to-r from-[#579BE8] to-[#124987] text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full"
              transition={{ duration: 0.6 }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span>اطلب الآن</span>
              <FaArrowLeft className="text-xs group-hover:-translate-x-0.5 transition-transform" />
            </span>
          </motion.button>

          <motion.button
            onClick={() => router.push("/myProfile/help-center")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative w-full sm:w-auto sm:min-w-[220px] md:min-w-[240px] h-12 sm:h-14 rounded-xl border border-[#94c5f8] bg-gradient-to-r from-[#579BE8] to-[#124987] text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full"
              transition={{ duration: 0.6 }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <FaHeadset className="text-sm" />
              <span>خدمة العملاء</span>
            </span>
          </motion.button>
        </motion.div>
      </div>

      <style jsx>{`
        :global(.leaflet-popup-content-wrapper) {
          border-radius: 1rem;
          padding: 0.5rem;
          direction: rtl;
          background: white;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        :global(.leaflet-popup-tip) {
          background: white;
        }
        :global(.leaflet-container) {
          font-family: 'Cairo', sans-serif;
          background: #e8e8e8;
        }
        :global(.truck-marker) {
          background: transparent;
          border: none;
        }
        :global(.leaflet-popup-content) {
          margin: 8px 12px;
        }
      `}</style>
    </section>
  );
}