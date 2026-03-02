"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaTruck, FaMapMarkerAlt, FaUser } from 'react-icons/fa';

// إصلاح مشكلة أيقونات الـ leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// دالة مساعدة لحساب المسافة بين نقطتين
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// مكون للتحكم في عرض الخريطة
function MapController({ bounds, shouldFitBounds, onMapReady }) {
  const map = useMap();
  
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  useEffect(() => {
    if (bounds && bounds.isValid() && shouldFitBounds) {
      map.fitBounds(bounds, { 
        padding: [50, 50],
        maxZoom: 15,
        animate: true,
        duration: 1
      });
    }
  }, [map, bounds, shouldFitBounds]);
  
  return null;
}

// مكون للتعامل مع تغيير حجم الخريطة
function ResizeHandler() {
  const map = useMap();
  
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    
    const observer = new ResizeObserver(() => {
      handleResize();
    });
    
    observer.observe(map.getContainer());

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [map]);
  
  return null;
}

// مكون محسن لجلب المسار مع تقليل الطلبات
function FetchRoute({ start, end, onRouteFetched, onLoadingChange }) {
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [lastStart, setLastStart] = useState(null);
  const [lastEnd, setLastEnd] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const fetchTimeoutRef = useRef(null);
  const routeFetchedRef = useRef(false);
  
  const fetchRoute = useCallback(async () => {
    // إذا تم جلب المسار مسبقاً، لا نجلبه مرة أخرى
    if (routeFetchedRef.current) {
      return;
    }
    
    if (isFetching) return;
    
    if (!start || !end) return;
    
    setIsFetching(true);
    onLoadingChange?.(true);
    
    try {
      console.log('Fetching route for the first time...');
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      );
      
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        onRouteFetched({
          coordinates,
          distance: route.distance / 1000,
          duration: route.duration / 60
        });
        
        routeFetchedRef.current = true;
        setLastFetchTime(Date.now());
        setLastStart(start);
        setLastEnd(end);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      onRouteFetched({
        coordinates: [start, end],
        distance: null,
        duration: null
      });
      routeFetchedRef.current = true;
    } finally {
      setIsFetching(false);
      onLoadingChange?.(false);
    }
  }, [start, end, onRouteFetched, onLoadingChange, isFetching]);

  useEffect(() => {
    // تأخير الطلب قليلاً
    fetchTimeoutRef.current = setTimeout(() => {
      fetchRoute();
    }, 1000);
    
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchRoute]);

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
  const [routeDistance, setRouteDistance] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [mapKey, setMapKey] = useState(Date.now());
  const [shouldFitBounds, setShouldFitBounds] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const [map, setMap] = useState(null);
  const [initialBoundsSet, setInitialBoundsSet] = useState(false);
  const [routeFetched, setRouteFetched] = useState(false);

  // إنشاء أيقونة مخصصة للسائق
  const createDriverIcon = (isActive) => {
    const iconHtml = renderToStaticMarkup(
      <div className="relative">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-600 shadow-lg' : 'bg-gray-400'} border-3 border-white`}>
          <FaTruck className="w-6 h-6 text-white" />
        </div>
        {isActive && (
          <>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </>
        )}
        {driverInfo?.currect_location?.last_updated_at && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-2 py-0.5 rounded text-[10px] whitespace-nowrap">
            آخر تحديث: {new Date(driverInfo.currect_location.last_updated_at).toLocaleTimeString('ar-SA')}
          </div>
        )}
      </div>
    );

    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [48, 58],
      iconAnchor: [24, 48],
      popupAnchor: [0, -58]
    });
  };

  // إنشاء أيقونة مخصصة للعميل
  const createUserIcon = () => {
    const iconHtml = renderToStaticMarkup(
      <div className="relative">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-600 border-3 border-white shadow-lg">
          <FaUser className="w-6 h-6 text-white" />
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

  // معالجة المسار المستلم
  const handleRouteFetched = (routeData) => {
    setRoute(routeData.coordinates);
    setRouteInfo(routeData);
    setIsLoadingRoute(false);
    setRouteFetched(true);
    
    if (routeData.distance) {
      setRouteDistance(routeData.distance);
      setEstimatedTime(Math.ceil(routeData.duration));
    }
    
    // تحديث الحدود فقط إذا لم يتفاعل المستخدم ولم يتم تعيين الحدود مسبقاً
    if (routeData.coordinates.length > 0 && !userInteracted && !initialBoundsSet) {
      const allPoints = [userLocation, driverLocation, ...routeData.coordinates];
      const newBounds = L.latLngBounds(allPoints);
      setBounds(newBounds);
      setInitialBoundsSet(true);
    }
  };

  // تحديث الحدود عند تحميل المواقع لأول مرة
  useEffect(() => {
    if (userLocation && driverLocation && !initialBoundsSet) {
      setIsLoadingRoute(true);
      const allPoints = [userLocation, driverLocation];
      const newBounds = L.latLngBounds(allPoints);
      setBounds(newBounds);
      setShouldFitBounds(true);
      setLastUpdateTime(new Date());
    }
  }, [userLocation, driverLocation, initialBoundsSet]);

  // مراقبة تفاعل المستخدم مع الخريطة
  useEffect(() => {
    if (map) {
      const handleZoomStart = () => {
        setUserInteracted(true);
        setShouldFitBounds(false);
      };

      const handleDragStart = () => {
        setUserInteracted(true);
        setShouldFitBounds(false);
      };

      map.on('zoomstart', handleZoomStart);
      map.on('dragstart', handleDragStart);

      return () => {
        map.off('zoomstart', handleZoomStart);
        map.off('dragstart', handleDragStart);
      };
    }
  }, [map]);

  // دالة لإعادة ضبط الخريطة إلى الحدود الأصلية
  const resetMapBounds = () => {
    if (userLocation && driverLocation) {
      const allPoints = [userLocation, driverLocation];
      if (route.length > 0) {
        allPoints.push(...route);
      }
      const newBounds = L.latLngBounds(allPoints);
      setBounds(newBounds);
      setShouldFitBounds(true);
      setUserInteracted(false);
    }
  };

  // حساب المسافة المباشرة
  const calculateDirectDistance = () => {
    if (!userLocation || !driverLocation) return null;
    
    const R = 6371;
    const dLat = (driverLocation[0] - userLocation[0]) * Math.PI / 180;
    const dLon = (driverLocation[1] - userLocation[1]) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation[0] * Math.PI / 180) * Math.cos(driverLocation[0] * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const directDistance = calculateDirectDistance();

  // تنسيق المسافة
  const formatDistance = () => {
    const dist = routeDistance || directDistance;
    if (!dist) return '--';
    if (dist < 1) {
      return `${Math.round(dist * 1000)} متر`;
    }
    return `${dist.toFixed(1)} كم`;
  };

  // الحصول على سرعة السائق من البيانات
  const getDriverSpeed = () => {
    if (driverInfo?.currect_location?.speed) {
      const speed = parseFloat(driverInfo.currect_location.speed);
      if (speed > 0) {
        return `${Math.round(speed * 3.6)} كم/س`;
      }
    }
    return '--';
  };

  const handleMapReady = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const handleLoadingChange = (loading) => {
    setIsLoadingRoute(loading);
  };

  if (!userLocation) {
    return (
      <div className="h-125 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-8 border border-gray-200">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <FaMapMarkerAlt className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium mb-2 text-lg">جاري تحميل موقع التوصيل...</p>
          <p className="text-gray-700">الرجاء الانتظار</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-80 md:h-120 rounded-3xl overflow-hidden border-2 border-gray-200 shadow-xl">
      
      {/* أزرار التحكم في الخريطة */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {isLoadingRoute && !routeFetched && (
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700">جاري تحميل المسار...</span>
          </div>
        )}

        {userInteracted && (
          <button
            onClick={resetMapBounds}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all"
            title="إعادة ضبط عرض الخريطة"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span className="text-sm">إعادة ضبط العرض</span>
          </button>
        )}
      </div>

      {lastUpdateTime && (
        <div className="absolute top-4 left-4 z-[1000] bg-black/75 text-white px-3 py-1.5 rounded-lg text-xs">
          آخر تحديث: {lastUpdateTime.toLocaleTimeString('ar-SA')}
        </div>
      )}

      <MapContainer
        key={mapKey}
        center={userLocation}
        zoom={14}
        className="h-full w-full"
        ref={mapRef}
        scrollWheelZoom={true}
        zoomControl={true}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
          handleMapReady(mapInstance);
        }}
      >
        <ResizeHandler />
        
        <MapController 
          bounds={bounds} 
          shouldFitBounds={shouldFitBounds && !userInteracted}
          onMapReady={handleMapReady}
        />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* جلب المسار الفعلي - مرة واحدة فقط */}
        {userLocation && driverLocation && !routeFetched && (
          <FetchRoute 
            start={userLocation} 
            end={driverLocation} 
            onRouteFetched={handleRouteFetched}
            onLoadingChange={handleLoadingChange}
          />
        )}
        
        {/* موقع العميل */}
        <Marker position={userLocation} icon={createUserIcon()}>
          <Popup className="custom-popup">
            <div className="p-3 min-w-[200px]">
              <h3 className="font-bold text-green-700 mb-2">موقع التوصيل</h3>
              {userAddress ? (
                <p className="text-sm text-gray-700 mb-2">{userAddress}</p>
              ) : (
                <p className="text-sm text-gray-500 mb-2">عنوان التوصيل</p>
              )}
              <div className="text-xs text-gray-600">
                <div>خط العرض: {userLocation[0].toFixed(6)}</div>
                <div>خط الطول: {userLocation[1].toFixed(6)}</div>
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
                  <h3 className="font-bold text-blue-700 mb-2">موقع السائق</h3>
                  
                  {driverName && (
                    <div className="mb-2">
                      <div className="font-bold">{driverName}</div>
                      {driverPhone && (
                        <div className="text-sm text-gray-600">📱 {driverPhone}</div>
                      )}
                    </div>
                  )}
                  
                  {vehiclePlate && (
                    <div className="mb-2 text-sm">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        🚗 {vehiclePlate}
                      </span>
                    </div>
                  )}
                  
                  {/* معلومات إضافية من البيانات الحقيقية */}
                  {driverInfo?.currect_location && (
                    <div className="mb-3 text-xs bg-gray-50 p-2 rounded">
                      <div>السرعة: {getDriverSpeed()}</div>
                      <div>الاتجاه: {driverInfo.currect_location.heading}°</div>
                      <div>آخر تحديث: {new Date(driverInfo.currect_location.last_updated_at).toLocaleString('ar-SA')}</div>
                    </div>
                  )}
                  
                  {/* <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">خط العرض</div>
                      <div className="font-mono font-bold">{driverLocation[0].toFixed(6)}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">خط الطول</div>
                      <div className="font-mono font-bold">{driverLocation[1].toFixed(6)}</div>
                    </div>
                  </div> */}
                  
                  {/* معلومات المسافة والوقت */}
                  {(directDistance || routeDistance) && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs text-blue-600">المسافة المتبقية</div>
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
            
            {/* المسار الفعلي */}
            {route.length > 1 && (
              <Polyline
                pathOptions={{ 
                  color: '#3B82F6', 
                  weight: 5,
                  opacity: isDriverActive ? 0.8 : 0.4,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
                positions={route}
              />
            )}
            
            {/* دائرة حول السائق (200 متر) */}
            <Circle
              center={driverLocation}
              radius={200}
              pathOptions={{
                fillColor: '#3B82F6',
                fillOpacity: 0.1,
                color: '#3B82F6',
                weight: 2,
              }}
            />
            
            {/* دائرة حول موقع التوصيل (500 متر) */}
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
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default EnhancedOrderTrackingMap;