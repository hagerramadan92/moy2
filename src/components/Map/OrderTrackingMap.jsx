// @/components/Map/OrderTrackingMap.jsx
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Fix for default markers in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
  iconUrl: '/leaflet/images/marker-icon.png',
  shadowUrl: '/leaflet/images/marker-shadow.png',
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: '/images/user-marker.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const driverIcon = new L.Icon({
  iconUrl: '/images/driver-marker.png',
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -50],
});

const completedIcon = new L.Icon({
  iconUrl: '/images/completed-marker.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

export default function OrderTrackingMap({ 
  userLocation, 
  driverLocation, 
  driverName, 
  orderStatus, 
  isDriverActive,
  userAddress 
}) {
  const [mapCenter, setMapCenter] = useState([24.7136, 46.6753]); // Default to Riyadh
  const [zoom, setZoom] = useState(13);
  
  // Calculate center based on available locations
  useEffect(() => {
    if (userLocation && driverLocation) {
      // Center between user and driver
      const centerLat = (userLocation[0] + driverLocation[0]) / 2;
      const centerLng = (userLocation[1] + driverLocation[1]) / 2;
      setMapCenter([centerLat, centerLng]);
      setZoom(12);
    } else if (userLocation) {
      setMapCenter(userLocation);
      setZoom(14);
    } else if (driverLocation) {
      setMapCenter(driverLocation);
      setZoom(14);
    }
  }, [userLocation, driverLocation]);
  
  const isCompleted = orderStatus === 'completed';
  const isProcessing = orderStatus === 'in_progress' || orderStatus === 'assigned';
  
  return (
    <div className="h-125 rounded-3xl overflow-hidden relative">
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        className="h-full w-full rounded-3xl"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={isCompleted ? completedIcon : userIcon}>
            <Popup>
              <div className="text-right p-2">
                <h3 className="font-bold text-lg mb-1">موقع التوصيل</h3>
                <p className="text-sm text-gray-600">{userAddress || "عنوان التوصيل"}</p>
                <p className="text-xs text-gray-700 mt-2">
                  {isCompleted ? "تم التوصيل هنا" : "يتم التوصيل إلى هذا الموقع"}
                </p>
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -20]} opacity={0.9} permanent={!driverLocation}>
              <span className="font-bold">موقع التوصيل</span>
            </Tooltip>
          </Marker>
        )}
        
        {/* Driver Marker */}
        {driverLocation && driverName && (
          <>
            <Marker 
              position={driverLocation} 
              icon={driverIcon}
            >
              <Popup>
                <div className="text-right p-2">
                  <h3 className="font-bold text-lg mb-1">{driverName}</h3>
                  <p className="text-sm text-gray-600">السائق {isCompleted ? "تم التوصيل" : "جاري التوصيل"}</p>
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${isProcessing ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {isProcessing ? 'جاري التوصيل' : 'تم التوصيل'}
                    </span>
                  </div>
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -25]} opacity={0.9} permanent>
                <span className="font-bold">{driverName}</span>
              </Tooltip>
            </Marker>
            
            {/* Line connecting driver to user */}
            {userLocation && isProcessing && (
              <Polyline
                positions={[driverLocation, userLocation]}
                pathOptions={{ 
                  color: '#579BE8', 
                  weight: 3, 
                  dashArray: '10, 10',
                  opacity: 0.7 
                }}
              />
            )}
          </>
        )}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg z-[1000]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#579BE8]"></div>
            <span className="text-xs font-medium">مسار التوصيل</span>
          </div>
          {userLocation && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-xs font-medium">موقع التوصيل</span>
            </div>
          )}
          {driverLocation && driverName && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500"></div>
              <span className="text-xs font-medium">موقع السائق</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}