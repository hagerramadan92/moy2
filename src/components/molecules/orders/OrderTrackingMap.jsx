'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef } from 'react';

// Component to fit bounds to markers
function FitBounds({ markers }) {
    const map = useMap();

    useEffect(() => {
        if (!map || markers.length === 0) return;

        try {
            const group = L.featureGroup(markers.map(m => L.marker([m.lat, m.lng])));
            if (group.getLayers().length > 0) {
                map.fitBounds(group.getBounds(), { padding: [50, 50] });
            }
        } catch (e) {
            console.warn("Error fitting bounds:", e);
        }
    }, [markers, map]);

    return null;
}

export default function OrderTrackingMap({
    deliveryLocation = { lat: 24.7136, lng: 46.6753 }, // Default Riyadh
    driverLocation = null,
    className
}) {
    const initializedRef = useRef(false);

    useEffect(() => {
        if (!initializedRef.current) {
            // Fix for Leaflet default marker icons
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });
            initializedRef.current = true;
        }
    }, []);

    // Custom Icon for delivery location - Red pin
    const deliveryIcon = useMemo(() => new L.Icon({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }), []);

    // Custom Icon for driver (car) - Memoized to prevent recreation
    const carIcon = useMemo(() => new L.Icon({
        iconUrl: '/car22.png',
        iconSize: [40, 25],
        iconAnchor: [20, 12],
        popupAnchor: [0, -10],
    }), []);

    // Calculate center point between delivery and driver if both exist
    const center = useMemo(() => {
        if (driverLocation) {
            return {
                lat: (deliveryLocation.lat + driverLocation.lat) / 2,
                lng: (deliveryLocation.lng + driverLocation.lng) / 2,
            };
        }
        return deliveryLocation;
    }, [deliveryLocation, driverLocation]);

    // Markers for FitBounds
    const markers = useMemo(() => {
        const result = [deliveryLocation];
        if (driverLocation) {
            result.push(driverLocation);
        }
        return result;
    }, [deliveryLocation, driverLocation]);

    return (
        <MapContainer
            key={`${center.lat}-${center.lng}`}
            center={[center.lat, center.lng]}
            zoom={driverLocation ? 13 : 15}
            className={className}
            style={{ width: '100%', height: '100%', minHeight: '320px' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Delivery Location Marker */}
            <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={deliveryIcon}>
                <Popup>
                    <div className="text-right">
                        <strong className="block text-sm">موقع التسليم</strong>
                        <span className="text-xs text-gray-700">الرياض - مستشفى الملك فيصل</span>
                    </div>
                </Popup>
            </Marker>

            {/* Driver Location Marker */}
            {driverLocation && (
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={carIcon}>
                    <Popup>
                        <div className="text-right">
                            <strong className="block text-sm">السائق في الطريق</strong>
                            <span className="text-xs text-gray-700">جاري التوصيل</span>
                        </div>
                    </Popup>
                </Marker>
            )}

            {/* Route Line from Driver to Delivery Location */}
            {driverLocation && (
                <Polyline
                    positions={[
                        [driverLocation.lat, driverLocation.lng],
                        [deliveryLocation.lat, deliveryLocation.lng]
                    ]}
                    pathOptions={{
                        color: '#579BE8',
                        weight: 4,
                        opacity: 0.8,
                        dashArray: '10, 10',
                        lineCap: 'round',
                        lineJoin: 'round'
                    }}
                />
            )}

            <FitBounds markers={markers} />
        </MapContainer>
    );
}

