"use client";

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaTruck, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import { BiNavigation } from 'react-icons/bi';

// إصلاح مشكلة أيقونات الـ leaflet
delete L.Icon.Default.prototype._getIconUrl;

// استخدام أيقونات من CDN لتجنب مشاكل المسارات
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// مكون لضبط عرض الخريطة على النقاط
function FitBounds({ bounds }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { 
        padding: [50, 50],
        maxZoom: 15 
      });
    }
  }, [map, bounds]);
  
  return null;
}

const EnhancedOrderTrackingMap = ({ 
  userLocation,
  driverLocation,
  driverName,
  driverPhone,
  vehiclePlate,
  driverRating = 4.8,
  orderStatus,
  isDriverActive = true,
  userAddress,
  driverInfo
}) => {
  const mapRef = useRef(null);
  const [bounds, setBounds] = useState(null);
  const [route, setRoute] = useState([]);
  const [estimatedTime, setEstimatedTime] = useState(null);

  // إنشاء أيقونة مخصصة للسائق
  const createDriverIcon = (isActive) => {
    const iconHtml = renderToStaticMarkup(
      <div className="relative">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-500 shadow-lg' : 'bg-gray-400'} border-3 border-white`}>
          <FaTruck className="w-6 h-6 text-white" />
        </div>
        {isActive && (
          <>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </>
        )}
      </div>
    );

    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48]
    });
  };

  // إنشاء أيقونة مخصصة للعميل
  const createUserIcon = () => {
    const iconHtml = renderToStaticMarkup(
      <div className="relative">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500 border-3 border-white shadow-lg">
          <FaMapMarkerAlt className="w-6 h-6 text-white" />
        </div>
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-lg text-xs font-bold shadow whitespace-nowrap border border-gray-200">
          موقع التوصيل
        </div>
      </div>
    );

    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [48, 60],
      iconAnchor: [24, 48],
      popupAnchor: [0, -60]
    });
  };

  // حساب المسافة والمسار
  useEffect(() => {
    if (userLocation && driverLocation) {
      // إنشاء خط مستقيم بين النقطتين (في التطبيق الحقيقي، استخدم خدمة مثل OSRM)
      const newRoute = [driverLocation, userLocation];
      setRoute(newRoute);
      
      // حساب الحدود لتضمين كل النقاط
      const allPoints = [userLocation, driverLocation];
      const newBounds = L.latLngBounds(allPoints);
      setBounds(newBounds);
      
      // حساب الوقت المتوقع بناءً على المسافة
      const distance = calculateDistance();
      if (distance) {
        const minutes = Math.max(5, Math.ceil(distance * 12)); // تقدير 12 دقيقة لكل كم
        setEstimatedTime(minutes);
      }
    }
  }, [userLocation, driverLocation]);

  // حساب المسافة بين النقطتين
  const calculateDistance = () => {
    if (!userLocation || !driverLocation) return null;
    
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    
    const dLat = (driverLocation[0] - userLocation[0]) * Math.PI / 180;
    const dLon = (driverLocation[1] - userLocation[1]) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation[0] * Math.PI / 180) * Math.cos(driverLocation[0] * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  };

  const distance = calculateDistance();

  // تنسيق المسافة للعرض
  const formatDistance = () => {
    if (!distance) return '--';
    if (distance < 1) {
      return `${Math.round(distance * 1000)} متر`;
    }
    return `${distance.toFixed(1)} كم`;
  };

  // تنسيق الإحداثيات
  const formatCoordinates = (lat, lng) => {
    return {
      lat: lat?.toFixed(6) || '--',
      lng: lng?.toFixed(6) || '--'
    };
  };

  if (!userLocation) {
    return (
      <div className="h-125 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-8 border border-gray-200">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <FaMapMarkerAlt className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium mb-2 text-lg">لم يتم تحديد موقع التوصيل</p>
          <p className="text-gray-700">يرجى التحقق من معلومات العنوان في الطلب</p>
        </div>
      </div>
    );
  }
// في بداية المكون، أضف هذا التحقق
useEffect(() => {

}, [driverLocation, userLocation]);
  const userCoords = formatCoordinates(userLocation[0], userLocation[1]);
  const driverCoords = driverLocation ? 
    formatCoordinates(driverLocation[0], driverLocation[1]) : 
    { lat: '--', lng: '--' };

  return (
    <div className="relative h-80 md:h-120 rounded-3xl overflow-hidden border-2 border-gray-200 shadow-xl">
 
  
      <MapContainer
        center={userLocation}
        zoom={14}
        className="h-full w-full"
        ref={mapRef}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {bounds && <FitBounds bounds={bounds} />}
        
        {/* موقع العميل */}
        <Marker position={userLocation} icon={createUserIcon()}>
          <Popup className="custom-popup">
            <div className="p-3 min-w-[250px]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <FaMapMarkerAlt className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-green-700 text-lg">موقع التوصيل</h3>
                  <p className="text-xs text-gray-700">موقع الطلب</p>
                </div>
              </div>
              
              {userAddress && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 font-medium">{userAddress}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-700">خط العرض</div>
                  <div className="font-mono font-bold">{userCoords.lat}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-700">خط الطول</div>
                  <div className="font-mono font-bold">{userCoords.lng}</div>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
        
        {/* موقع السائق */}
        {driverLocation && (
          <>
            <Marker 
              position={driverLocation} 
              icon={createDriverIcon(isDriverActive)}
            >
              <Popup className="custom-popup">
                <div className="p-3 min-w-[250px]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaTruck className="w-4 h-4 text-[#579BE8] " />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-700 text-lg">موقع السائق</h3>
                      <p className="text-xs text-gray-700">ناقل الطلب</p>
                    </div>
                  </div>
                  
                  {driverName && (
                    <div className="mb-2">
                      <div className="text-sm font-bold text-gray-900">{driverName}</div>
                      {driverPhone && (
                        <div className="text-sm text-gray-600">📱 {driverPhone}</div>
                      )}
                    </div>
                  )}
                  
                  {vehiclePlate && (
                    <div className="mb-3">
                      <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                        🚗 {vehiclePlate}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-700">خط العرض</div>
                      <div className="font-mono font-bold">{driverCoords.lat}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-700">خط الطول</div>
                      <div className="font-mono font-bold">{driverCoords.lng}</div>
                    </div>
                  </div>
                  
                  {distance && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs text-[#579BE8] ">المسافة المتبقية</div>
                          <div className="font-bold text-blue-700">{formatDistance()}</div>
                        </div>
                        {estimatedTime && (
                          <div className="text-right">
                            <div className="text-xs text-green-600">الوقت المتوقع</div>
                            <div className="font-bold text-green-700">{estimatedTime} دقيقة</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
            
            {/* خط المسار */}
            {route.length > 0 && (
              <Polyline
                pathOptions={{ 
                  color: '#3B82F6', 
                  weight: 4,
                  dashArray: isDriverActive ? null : '10, 10',
                  opacity: isDriverActive ? 0.7 : 0.4,
                  lineCap: 'round'
                }}
                positions={route}
              />
            )}
            
            {/* دائرة نصف قطر التوصيل (500 متر) */}
            <Circle
              center={userLocation}
              radius={500}
              pathOptions={{
                fillColor: '#10B981',
                fillOpacity: 0.1,
                color: '#10B981',
                weight: 2,
                dashArray: '5, 5'
              }}
            />
            
            {/* دائرة حول السائق (200 متر) */}
            <Circle
              center={driverLocation}
              radius={200}
              pathOptions={{
                fillColor: '#3B82F6',
                fillOpacity: 0.1,
                color: '#3B82F6',
                weight: 2,
                dashArray: '3, 3'
              }}
            />
          </>
        )}
      </MapContainer>

      
    </div>
  );
};

export default EnhancedOrderTrackingMap;