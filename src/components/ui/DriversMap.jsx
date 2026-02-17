'use client';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// حل مشكلة أيقونات Leaflet
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
    iconUrl: '/leaflet/images/marker-icon.png',
    shadowUrl: '/leaflet/images/marker-shadow.png',
  });
}

export default function DriversMap({ drivers, className }) {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !drivers || drivers.length === 0) return;

    // تأخير التهيئة لضمان تحميل DOM
    const initMap = () => {
      const mapContainer = document.getElementById('drivers-map');
      if (!mapContainer) return;

      // إزالة الخريطة السابقة إذا كانت موجودة
      if (map) {
        map.remove();
      }

      // مركز الخريطة (الرياض)
      const mapInstance = L.map('drivers-map').setView([24.7136, 46.6753], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstance);

      setMap(mapInstance);

      // إضافة العلامات
      const newMarkers = drivers.map((driver, index) => {
        // إحداثيات عشوائية حول مركز الخريطة
        const lat = 24.7136 + (Math.random() - 0.5) * 0.1;
        const lng = 46.6753 + (Math.random() - 0.5) * 0.1;
        
        // إنشاء أيقونة مخصصة
        const customIcon = L.divIcon({
          html: `
            <div class="relative">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-lg">
                ${index + 1}
              </div>
              <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-blue-500"></div>
            </div>
          `,
          className: 'custom-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        });

        const marker = L.marker([lat, lng], { icon: customIcon })
          .addTo(mapInstance)
          .bindPopup(`
            <div class="p-3 min-w-[200px]">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                  <span class="text-sm font-bold">${index + 1}</span>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900">${driver.name}</h4>
                  <p class="text-xs text-gray-600">سائق #${driver.driverId}</p>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">الوقت:</span>
                  <span class="font-medium">${driver.deliveryTime}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">السعر:</span>
                  <span class="font-bold text-green-600">${driver.price}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">التقييم:</span>
                  <span class="font-medium">${driver.rating}/5</span>
                </div>
              </div>
            </div>
          `);

        return marker;
      });

      setMarkers(newMarkers);

      // ضبط العرض ليشمل جميع العلامات
      if (newMarkers.length > 0) {
        const group = L.featureGroup(newMarkers);
        mapInstance.fitBounds(group.getBounds().pad(0.1));
      }

      // إضافة طبقة التحكم
      L.control.scale().addTo(mapInstance);

      // تنظيف
      return () => {
        mapInstance.remove();
      };
    };

    const timer = setTimeout(initMap, 100);
    return () => clearTimeout(timer);
  }, [drivers]);

  if (!drivers || drivers.length === 0) {
    return (
      <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <Truck className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-700">لا توجد سائقين على الخريطة</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="drivers-map" 
      className={`w-full h-full ${className}`}
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '400px',
        borderRadius: '12px'
      }}
    />
  );
}