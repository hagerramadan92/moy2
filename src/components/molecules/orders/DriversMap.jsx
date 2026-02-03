'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef } from 'react';

// Component to fit bounds to markers
function FitBounds({ markers, shouldUpdate = true }) {
    const map = useMap();
    const hasFittedRef = useRef(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        // Clear any pending timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (!map || !shouldUpdate) return;
        
        // Validate markers
        const validMarkers = markers.filter(m => 
            m && 
            typeof m.lat === 'number' && 
            typeof m.lng === 'number' && 
            !isNaN(m.lat) && 
            !isNaN(m.lng) &&
            isFinite(m.lat) &&
            isFinite(m.lng)
        );

        if (validMarkers.length === 0) return;
        
        // Only fit bounds once when shouldUpdate becomes true
        if (!hasFittedRef.current && shouldUpdate) {
            // Wait for map to be fully ready
            timeoutRef.current = setTimeout(() => {
                try {
                    // Check if map is still valid
                    if (!map || !map.getContainer()) return;

                    // Create temporary markers for bounds calculation
                    const tempMarkers = validMarkers.map(m => {
                        try {
                            return L.marker([m.lat, m.lng], { 
                                icon: L.divIcon({ className: 'dummy-marker' }) 
                            });
                        } catch (e) {
                            return null;
                        }
                    }).filter(m => m !== null);

                    if (tempMarkers.length === 0) return;

                    const group = L.featureGroup(tempMarkers);
                    
                    // Check if group has valid layers
            if (group.getLayers().length > 0) {
                        const bounds = group.getBounds();
                        if (bounds.isValid()) {
                            map.fitBounds(bounds, { padding: [50, 50] });
                            hasFittedRef.current = true;
                        }
                    }

                    // Clean up temporary markers
                    tempMarkers.forEach(m => {
                        try {
                            if (m && m.remove) m.remove();
                        } catch (e) {
                            // Ignore cleanup errors
                        }
                    });
        } catch (e) {
            console.warn("Error fitting bounds:", e);
        }
            }, 500); // Wait 500ms for map to be ready
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [markers, map, shouldUpdate]);

    // Reset when shouldUpdate changes to false
    useEffect(() => {
        if (!shouldUpdate) {
            hasFittedRef.current = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        }
    }, [shouldUpdate]);

    return null;
}

export default function DriversMap({
    drivers = [],
    center = { lat: 24.7136, lng: 46.6753 }, // Default Riyadh
    className,
    shouldUpdate = true // New prop to control updates
}) {
    const initializedRef = useRef(false);
    const stableDriversRef = useRef([]);
    const mapKeyRef = useRef(0);

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

    // Store initial drivers and only update when shouldUpdate is true
    useEffect(() => {
        if (shouldUpdate && drivers.length > 0) {
            stableDriversRef.current = drivers;
            mapKeyRef.current += 1; // Force remount when real data arrives
        }
    }, [drivers, shouldUpdate]);

    // Use stable drivers (initial data) until shouldUpdate is true
    const driversToUse = shouldUpdate ? drivers : stableDriversRef.current;

    // Create markers from drivers (mocking positions nearby center for now if not provided)
    const driverMarkers = useMemo(() => {
        if (!driversToUse || driversToUse.length === 0) return [];
        
        return driversToUse
            .filter(driver => driver && driver.id) // Filter out invalid drivers
            .map((driver, index) => {
                // Use stable random positions for drivers without coordinates
                const stableSeed = driver.id || index;
                const random1 = (stableSeed * 0.1) % 1;
                const random2 = (stableSeed * 0.2) % 1;
                
                return {
            ...driver,
                    lat: driver.lat || (center.lat + (random1 - 0.5) * 0.05),
                    lng: driver.lng || (center.lng + (random2 - 0.5) * 0.05),
                };
            })
            .filter(marker => 
                marker.lat && 
                marker.lng && 
                !isNaN(marker.lat) && 
                !isNaN(marker.lng) &&
                isFinite(marker.lat) &&
                isFinite(marker.lng)
            );
    }, [driversToUse, center]);

    // Custom Icon for drivers (car) - Memoized to prevent recreation
    const carIcon = useMemo(() => new L.Icon({
        iconUrl: '/car22.png', // Updated to use the car image we know exists locally
        iconSize: [40, 25],
        iconAnchor: [20, 12],
        popupAnchor: [0, -10],
    }), []);

    return (
        <MapContainer
            key={`map-${mapKeyRef.current}-${shouldUpdate ? 'real' : 'stable'}`} // Force remount only when real data arrives
            center={center}
            zoom={13}
            className={className}
            style={{ width: '100%', height: '100%', minHeight: '400px' }} // Ensure height is present
            zoomControl={true}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Current Location Marker - Blue with custom icon */}
            <Marker 
                position={[center.lat, center.lng]}
                icon={new L.Icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })}
            >
                <Popup>
                    <div className="text-right">
                        <strong className="block text-sm">📍 موقعك الحالي</strong>
                        <span className="text-xs text-gray-500">موقع التوصيل</span>
                    </div>
                </Popup>
            </Marker>

            {/* Driver Markers */}
            {driverMarkers.map((driver) => {
                // Validate position before rendering
                if (!driver || !driver.lat || !driver.lng || isNaN(driver.lat) || isNaN(driver.lng)) {
                    return null;
                }
                
                return (
                <Marker
                        key={driver.id || `driver-${driver.driverId || Math.random()}`}
                    position={[driver.lat, driver.lng]}
                    icon={carIcon}
                >
                    <Popup>
                        <div className="text-right">
                                <strong className="block text-sm">{driver.name || 'سائق'}</strong>
                                <span className="text-xs text-gray-500">{driver.deliveryTime || 'غير محدد'}</span>
                        </div>
                    </Popup>
                </Marker>
                );
            })}

            <FitBounds 
                markers={[
                    { lat: center.lat, lng: center.lng },
                    ...driverMarkers.map(d => ({ lat: d.lat, lng: d.lng }))
                ]} 
                shouldUpdate={shouldUpdate} 
            />
        </MapContainer>
    );
}
