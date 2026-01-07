'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

export default function DriversMap({
    drivers = [],
    center = { lat: 24.7136, lng: 46.6753 }, // Default Riyadh
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

    // Create markers from drivers (mocking positions nearby center for now if not provided)
    const driverMarkers = useMemo(() => {
        return drivers.map((driver) => ({
            ...driver,
            lat: driver.lat || center.lat + (Math.random() - 0.5) * 0.05,
            lng: driver.lng || center.lng + (Math.random() - 0.5) * 0.05,
        }));
    }, [drivers, center]);

    // Custom Icon for drivers (car) - Memoized to prevent recreation
    const carIcon = useMemo(() => new L.Icon({
        iconUrl: '/car22.png', // Updated to use the car image we know exists locally
        iconSize: [40, 25],
        iconAnchor: [20, 12],
        popupAnchor: [0, -10],
    }), []);

    return (
        <MapContainer
            key={`${center.lat}-${center.lng}`} // Force remount on center change to avoid internal state mismatch
            center={center}
            zoom={13}
            className={className}
            style={{ width: '100%', height: '100%', minHeight: '400px' }} // Ensure height is present
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Location Marker */}
            <Marker position={center}>
                <Popup>موقع التوصيل</Popup>
            </Marker>

            {/* Driver Markers */}
            {driverMarkers.map((driver) => (
                <Marker
                    key={driver.id}
                    position={[driver.lat, driver.lng]}
                    icon={carIcon}
                >
                    <Popup>
                        <div className="text-right">
                            <strong className="block text-sm">{driver.name}</strong>
                            <span className="text-xs text-gray-500">{driver.deliveryTime}</span>
                        </div>
                    </Popup>
                </Marker>
            ))}

            <FitBounds markers={[center, ...driverMarkers]} />
        </MapContainer>
    );
}
