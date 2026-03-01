'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet default marker icons
if (typeof window !== 'undefined') {
  try {
    delete L.Icon.Default.prototype._getIconUrl;
  } catch (e) {
    // Ignore if already deleted or doesn't exist
  }
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Component to update map center
function MapCenterUpdater({ center }) {
  const map = useMap();
  const lastCenterRef = useRef(null);

  useEffect(() => {
    if (!map || !center) return;
    
    const centerKey = `${center.lat}-${center.lng}`;
    if (lastCenterRef.current === centerKey) return;
    
    try {
      map.setView([center.lat, center.lng], 15, { animate: true });
      lastCenterRef.current = centerKey;
    } catch (e) {
      console.warn('Error updating map center:', e);
    }
  }, [map, center]);

  return null;
}

export default function DriverLocationMap({ lat, lng, driverName, speed, heading }) {
  const [mounted, setMounted] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof window === 'undefined') {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#579BE8] mx-auto mb-2"></div>
          <span className="text-gray-400 text-sm">جاري تحميل الخريطة...</span>
        </div>
      </div>
    );
  }

  // Validate coordinates
  const validLat = lat && !isNaN(parseFloat(lat)) ? parseFloat(lat) : null;
  const validLng = lng && !isNaN(parseFloat(lng)) ? parseFloat(lng) : null;

  if (!validLat || !validLng) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-sm">لا توجد إحداثيات صحيحة للعرض</p>
        </div>
      </div>
    );
  }

  // Create custom icon for driver
  const driverIcon = new L.Icon({
    iconUrl: '/car22.png',
    iconSize: [40, 25],
    iconAnchor: [20, 12],
    popupAnchor: [0, -10],
  });

  // Fallback to default icon if car icon doesn't exist
  const defaultIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  return (
    <MapContainer
      center={[validLat, validLng]}
      zoom={15}
      className="w-full h-full"
      style={{ width: '100%', height: '100%', minHeight: '300px' }}
      zoomControl={true}
      scrollWheelZoom={true}
      whenReady={(map) => {
        setTimeout(() => {
          setMapReady(true);
        }, 300);
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Circle to highlight driver location */}
      {mapReady && (
        <>
          <Circle
            center={[validLat, validLng]}
            radius={500}
            pathOptions={{
              color: '#579BE8',
              fillColor: '#579BE8',
              fillOpacity: 0.1,
              weight: 2
            }}
          />
          <Marker
            position={[validLat, validLng]}
            icon={driverIcon || defaultIcon}
          >
            <Popup>
              <div className="text-right">
                <strong className="block text-sm mb-1">{driverName || 'سائق'}</strong>
                <span className="text-xs text-gray-700 block mb-1">الموقع الحالي</span>
                {speed && (
                  <span className="text-xs text-[#579BE8]  block mb-1">
                    السرعة: {speed} كم/ساعة
                  </span>
                )}
                {heading && (
                  <span className="text-xs text-[#579BE8]  block mb-1">
                    الاتجاه: {heading}°
                  </span>
                )}
                <span className="text-xs text-gray-400 block">
                  {validLat.toFixed(6)}, {validLng.toFixed(6)}
                </span>
              </div>
            </Popup>
          </Marker>
          <MapCenterUpdater center={{ lat: validLat, lng: validLng }} />
        </>
      )}
    </MapContainer>
  );
}

