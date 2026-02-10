"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// إصلاح مشكلة أيقونات Leaflet في Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
  iconUrl: '/leaflet/images/marker-icon.png',
  shadowUrl: '/leaflet/images/marker-shadow.png',
});

const OrderTrackingMap = ({ 
  userLocation, 
  driverLocation, 
  driverName = "السائق",
  orderStatus,
  isDriverActive = true 
}) => {
  const [map, setMap] = useState(null);
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);

  // إعدادات افتراضية إذا لم تكن البيانات متاحة
  const defaultCenter = [24.7136, 46.6753]; // الرياض
  const defaultZoom = 12;

  // إعدادات الموقع الافتراضي
  const defaultUserLocation = userLocation || defaultCenter;
  const defaultDriverLocation = driverLocation || [
    defaultCenter[0] + 0.05,
    defaultCenter[1] + 0.05
  ];

  // إنشاء أيقونات مخصصة
  const userIcon = L.divIcon({
    html: `
      <div class="relative">
        <div class="w-10 h-10 bg-white rounded-full border-4 border-[#579BE8] shadow-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#579BE8]" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="absolute -top-1 -right-1 w-5 h-5 bg-[#579BE8] text-white text-xs rounded-full flex items-center justify-center font-bold">
          أنا
        </div>
      </div>
    `,
    className: 'custom-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  const driverIcon = L.divIcon({
    html: `
      <div class="relative ${isDriverActive ? 'animate-pulse' : ''}">
        <div class="w-12 h-12 bg-white rounded-full border-4 ${orderStatus === 'in_progress' ? 'border-green-500' : 'border-amber-500'} shadow-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 ${orderStatus === 'in_progress' ? 'text-green-500' : 'text-amber-500'}" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4v1a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H20a1 1 0 001-1v-4a1 1 0 00-.293-.707l-2-2A1 1 0 0018 7h-2.586A2 2 0 0114 5.586V3a1 1 0 00-1-1h-4a1 1 0 00-1 1v2.586A2 2 0 017.586 7H5a1 1 0 00-.707.293l-2 2A1 1 0 002 10v6a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10v-1H3V5a1 1 0 00-1-1h14z" />
          </svg>
        </div>
        <div class="absolute -top-1 -right-1 w-6 h-6 bg-white border-2 ${orderStatus === 'in_progress' ? 'border-green-500' : 'border-amber-500'} text-xs rounded-full flex items-center justify-center font-bold">
          <span class="${orderStatus === 'in_progress' ? 'text-green-500' : 'text-amber-500'}">🚚</span>
        </div>
      </div>
    `,
    className: 'custom-icon',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });

  // محاكاة بيانات المسار
  useEffect(() => {
    if (userLocation && driverLocation) {
      // محاكاة نقاط المسار
      const simulatedRoute = [
        driverLocation,
        [
          (driverLocation[0] + userLocation[0]) / 2 + 0.01,
          (driverLocation[1] + userLocation[1]) / 2 + 0.01
        ],
        [
          (driverLocation[0] + userLocation[0]) / 2 - 0.005,
          (driverLocation[1] + userLocation[1]) / 2 - 0.005
        ],
        userLocation
      ];
      setRoute(simulatedRoute);

      // حساب المسافة التقريبية
      const latDiff = Math.abs(driverLocation[0] - userLocation[0]);
      const lngDiff = Math.abs(driverLocation[1] - userLocation[1]);
      const approxDistance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // تقريباً 111 كم لكل درجة
      setDistance(approxDistance.toFixed(1));

      // حساب وقت الوصول المتوقع
      const speed = 0.5; // درجات في الدقيقة (محاكاة)
      const travelTime = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) / speed;
      setEta(Math.max(5, Math.ceil(travelTime))); // لا يقل عن 5 دقائق
    }
  }, [userLocation, driverLocation]);

  // تحديث عرض الخريطة عند تغيير البيانات
  useEffect(() => {
    if (map && userLocation && driverLocation) {
      const bounds = L.latLngBounds([userLocation, driverLocation]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, userLocation, driverLocation]);

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-lg border border-border/50 h-[500px]">
      {/* معلومات التتبع العائمة */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <div className="bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${orderStatus === 'in_progress' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                {orderStatus === 'in_progress' ? '🚚' : '⏳'}
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {orderStatus === 'in_progress' ? 'جاري التوصيل الآن' : 'في الطريق إليك'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {driverName} • {isDriverActive ? 'نشط الآن' : 'متوقف'}
                </p>
              </div>
            </div>
            
            {distance && eta && (
              <div className="text-right">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">المسافة</p>
                    <p className="font-black text-lg">{distance} كم</p>
                  </div>
                  <div className="h-8 w-px bg-border"></div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">الوقت المتوقع</p>
                    <p className="font-black text-lg">{eta} دقيقة</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* الخريطة */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%', borderRadius: '1.5rem' }}
        whenCreated={setMap}
        scrollWheelZoom={true}
        className="z-[500]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* مسار التتبع */}
        {route.length > 0 && (
          <Polyline
            positions={route}
            color="#579BE8"
            weight={4}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}
        
        {/* موقع المستخدم */}
        <Marker position={defaultUserLocation} icon={userIcon}>
          <Popup>
            <div className="text-center p-2">
              <p className="font-bold text-[#579BE8]">موقعك الحالي</p>
              <p className="text-sm text-muted-foreground">نقطة التسليم</p>
            </div>
          </Popup>
        </Marker>
        
        {/* موقع السائق */}
        <Marker position={defaultDriverLocation} icon={driverIcon}>
          <Popup>
            <div className="text-center p-2">
              <p className="font-bold text-green-600">{driverName}</p>
              <p className="text-sm text-muted-foreground">ناقل الطلب</p>
              {eta && (
                <div className="mt-2 p-2 bg-green-50 rounded-lg">
                  <p className="text-xs font-bold text-green-700">الوصول خلال: {eta} دقيقة</p>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* عناصر التحكم في الخريطة */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          className="w-10 h-10 bg-white dark:bg-card rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          onClick={() => map?.setView(defaultUserLocation, 15)}
          title="العودة لموقعي"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#579BE8]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          className="w-10 h-10 bg-white dark:bg-card rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          onClick={() => {
            if (userLocation && driverLocation) {
              const bounds = L.latLngBounds([userLocation, driverLocation]);
              map?.fitBounds(bounds, { padding: [50, 50] });
            }
          }}
          title="عرض المسار كاملاً"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#579BE8]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 2a1 1 0 00-1 1v4.586a1 1 0 00.293.707l7 7a1 1 0 001.414 0l4.586-4.586a1 1 0 000-1.414l-7-7A1 1 0 006.586 1H2a1 1 0 00-1 1z" />
            <path d="M14.5 6.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
          </svg>
        </button>
      </div>

      {/* تعليمات التتبع */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-2xl p-4 shadow-lg max-w-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#579BE8]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#579BE8]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-[#579BE8] mb-1">معلومات التتبع</p>
              <p className="text-xs text-muted-foreground">
                يتم تحديث موقع السائق تلقائياً كل 30 ثانية. الخط الأزرق يمثل المسار المتوقع.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingMap;