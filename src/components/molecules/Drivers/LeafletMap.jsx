"use client";

import React, { useEffect, useRef, useState } from "react";

export default function LeafletMap({ truckLocations }) {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      if (typeof window === 'undefined' || !mapRef.current || leafletMapRef.current) return;

      try {
        const L = (await import('leaflet')).default;
        
        if (!document.querySelector('#leaflet-css')) {
          await import('leaflet/dist/leaflet.css');
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        leafletMapRef.current = L.map(mapRef.current, {
          zoomControl: true,
          fadeAnimation: false,
          zoomAnimation: false,
          markerZoomAnimation: false,
        }).setView([24.7136, 46.6753], 12);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(leafletMapRef.current);

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

        setTimeout(() => {
          if (leafletMapRef.current) {
            leafletMapRef.current.invalidateSize();
            setIsMapReady(true);
          }
        }, 50);

      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [truckLocations]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="absolute inset-0 w-full h-full z-10" dir="ltr" />
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#579BE8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">جاري تحميل الخريطة ...</p>
          </div>
        </div>
      )}
    </div>
  );
}