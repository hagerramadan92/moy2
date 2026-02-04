'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

// Component to update map center when it changes
function MapCenterUpdater({ center, shouldUpdate = true }) {
    const map = useMap();
    const lastCenterRef = useRef(null);
    const isUserInteractingRef = useRef(false);

    // Track user interactions
    useEffect(() => {
        if (!map) return;

        const handleInteraction = () => {
            isUserInteractingRef.current = true;
        };

        map.on('move', handleInteraction);
        map.on('zoom', handleInteraction);
        map.on('drag', handleInteraction);

        return () => {
            map.off('move', handleInteraction);
            map.off('zoom', handleInteraction);
            map.off('drag', handleInteraction);
        };
    }, [map]);

    // Update center when it changes (only if user hasn't interacted)
    useEffect(() => {
        if (!map || !center || !shouldUpdate) return;
        
        // Check if center actually changed
        const centerKey = `${center.lat}-${center.lng}`;
        if (lastCenterRef.current === centerKey) return;
        
        // Only update if user hasn't manually moved the map
        if (isUserInteractingRef.current) {
            // Reset after a delay to allow updates when needed
            setTimeout(() => {
                isUserInteractingRef.current = false;
            }, 5000);
            return;
        }

        try {
            const currentCenter = map.getCenter();
            const currentZoom = map.getZoom();
            
            // Check if the new center is significantly different (more than 0.0001 degrees ≈ 10m)
            const latDiff = Math.abs(currentCenter.lat - center.lat);
            const lngDiff = Math.abs(currentCenter.lng - center.lng);
            
            // Always update to exact location when center changes (for user location accuracy)
            // Update if difference is significant (more than 0.00001 degrees ≈ 1m) or if this is the first time
            if (latDiff > 0.00001 || lngDiff > 0.00001 || !lastCenterRef.current) {
                const targetZoom = currentZoom || 15;
                map.setView([center.lat, center.lng], targetZoom, { animate: true });
                lastCenterRef.current = centerKey;
                console.log('🗺️ Map center updated to EXACT location:', center);
                console.log('🗺️ Map view set to:', `[${center.lat}, ${center.lng}] at zoom ${targetZoom}`);
            }
        } catch (e) {
            console.warn('Error updating map center:', e);
        }
    }, [map, center, shouldUpdate]);

    return null;
}

// Component to preserve map view state
function MapViewPreserver({ shouldPreserve = true }) {
    const map = useMap();
    const savedViewRef = useRef(null);
    const isUserInteractingRef = useRef(false);

    // Save view state when user interacts with map
    useEffect(() => {
        if (!map || !shouldPreserve) return;

        const saveView = () => {
            try {
                const center = map.getCenter();
                const zoom = map.getZoom();
                if (center && zoom) {
                    savedViewRef.current = {
                        center: [center.lat, center.lng],
                        zoom: zoom
                    };
                }
            } catch (e) {
                // Ignore errors
            }
        };

        // Save view on move/zoom
        const handleMoveEnd = () => {
            isUserInteractingRef.current = true;
            saveView();
        };

        map.on('moveend', handleMoveEnd);
        map.on('zoomend', handleMoveEnd);

        return () => {
            map.off('moveend', handleMoveEnd);
            map.off('zoomend', handleMoveEnd);
        };
    }, [map, shouldPreserve]);

    // Restore view state if user was interacting
    useEffect(() => {
        if (!map || !shouldPreserve || !savedViewRef.current || !isUserInteractingRef.current) return;

        try {
            const savedView = savedViewRef.current;
            map.setView(savedView.center, savedView.zoom, { animate: false });
        } catch (e) {
            // Ignore errors
        }
    }, [map, shouldPreserve]);

    return null;
}

// Component to fit bounds to markers
function FitBounds({ markers, shouldUpdate = true, preserveView = true }) {
    const map = useMap();
    const hasFittedRef = useRef(false);
    const timeoutRef = useRef(null);
    const isMapReadyRef = useRef(false);
    const mountedRef = useRef(false);
    const userHasInteractedRef = useRef(false);

    // Wait for map to be fully ready
    useEffect(() => {
        if (!map) return;
        mountedRef.current = true;

        const checkMapReady = () => {
            try {
                if (!map || !map.getContainer) return false;
                
                const container = map.getContainer();
                if (!container || !container.parentElement) return false;
                
                // Check if map pane exists and is initialized
                const pane = map.getPane('mapPane');
                if (!pane) return false;
                
                // Check if pane has been properly initialized (no _leaflet_pos errors)
                if (!pane._leaflet_id) return false;
                
                // Check if map has valid bounds methods
                if (typeof map.getBounds !== 'function' || typeof map.fitBounds !== 'function') return false;
                
                // Check if container has dimensions
                const rect = container.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return false;
                
                // Additional check: try to get bounds to ensure map is fully initialized
                try {
                    const testBounds = map.getBounds();
                    if (!testBounds || !testBounds.isValid || !testBounds.isValid()) return false;
                } catch (e) {
                    return false;
                }
                
                return true;
            } catch (e) {
                return false;
            }
        };

        // Wait a bit before first check to ensure DOM is ready
        const initialDelay = setTimeout(() => {
            if (checkMapReady()) {
                isMapReadyRef.current = true;
            } else {
                // If not ready, check periodically
                const checkInterval = setInterval(() => {
                    if (checkMapReady()) {
                        isMapReadyRef.current = true;
                        clearInterval(checkInterval);
                    }
                }, 150);

                // Clear interval after 5 seconds max
                setTimeout(() => {
                    clearInterval(checkInterval);
                    if (!isMapReadyRef.current) {
                        console.warn('Map did not become ready within timeout');
                    }
                }, 5000);
            }
        }, 300);

        return () => {
            clearTimeout(initialDelay);
            mountedRef.current = false;
        };
    }, [map]);

    useEffect(() => {
        // Clear any pending timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (!map || !shouldUpdate || !isMapReadyRef.current || !mountedRef.current) return;
        
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
        
        // Only fit bounds once when shouldUpdate becomes true AND user hasn't interacted
        if (!hasFittedRef.current && shouldUpdate && !userHasInteractedRef.current) {
            // Wait for map to be fully ready with longer delay
            timeoutRef.current = setTimeout(() => {
                try {
                    // Final validation before fitting bounds
                    if (!map || typeof map.getContainer !== 'function') return;
                    
                    const container = map.getContainer();
                    if (!container || !container.parentElement) return;
                    
                    // Check if map pane is ready
                    const pane = map.getPane('mapPane');
                    if (!pane || !pane._leaflet_id) return;
                    
                    // Check if map methods exist
                    if (typeof map.getBounds !== 'function' || typeof map.fitBounds !== 'function') return;

                    // Check if user has interacted (moved/zoomed) - if yes, preserve their view
                    if (userHasInteractedRef.current && preserveView) {
                        hasFittedRef.current = true;
                        return;
                    }

                    // Use simple bounds calculation instead of creating markers
                    const lats = validMarkers.map(m => m.lat);
                    const lngs = validMarkers.map(m => m.lng);
                    
                    const minLat = Math.min(...lats);
                    const maxLat = Math.max(...lats);
                    const minLng = Math.min(...lngs);
                    const maxLng = Math.max(...lngs);
                    
                    // Create bounds directly
                    const bounds = L.latLngBounds(
                        [minLat, minLng],
                        [maxLat, maxLng]
                    );
                    
                    if (bounds && typeof bounds.isValid === 'function' && bounds.isValid()) {
                        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
                        hasFittedRef.current = true;
                    }
                } catch (e) {
                    console.warn("Error fitting bounds:", e);
                }
            }, 1200); // Increased delay to ensure map is fully ready
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [markers, map, shouldUpdate]);

    // Track user interactions to preserve view
    useEffect(() => {
        if (!map || !preserveView) return;

        const handleInteraction = () => {
            userHasInteractedRef.current = true;
        };

        map.on('move', handleInteraction);
        map.on('zoom', handleInteraction);
        map.on('drag', handleInteraction);

        return () => {
            map.off('move', handleInteraction);
            map.off('zoom', handleInteraction);
            map.off('drag', handleInteraction);
        };
    }, [map, preserveView]);

    // Reset when shouldUpdate changes to false
    useEffect(() => {
        if (!shouldUpdate) {
            hasFittedRef.current = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }
    }, [shouldUpdate]);

    return null;
}

export default function DriversMap({
    drivers = [],
    center = { lat: 24.7136, lng: 46.6753 }, // Default Riyadh
    className,
    shouldUpdate = true, // New prop to control updates
    onDriverClick = null // Callback for driver marker clicks
}) {
    const router = useRouter();
    const initializedRef = useRef(false);
    const stableDriversRef = useRef([]);
    const mapKeyRef = useRef(0);
    const [mounted, setMounted] = useState(false);

    // Ensure component only renders on client
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && !initializedRef.current) {
            // Fix for Leaflet default marker icons
            try {
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                });
                initializedRef.current = true;
            } catch (e) {
                console.warn('Error initializing Leaflet icons:', e);
            }
        }
    }, []);

    // Store initial drivers and only update when shouldUpdate is true
    // Use a ref to track if we've already initialized to prevent unnecessary remounts
    const hasInitializedRef = useRef(false);
    
    useEffect(() => {
        if (shouldUpdate && drivers.length > 0 && !hasInitializedRef.current) {
            stableDriversRef.current = drivers;
            hasInitializedRef.current = true;
            // Only remount once when real data first arrives
            mapKeyRef.current += 1;
        } else if (shouldUpdate && drivers.length > 0) {
            // Update drivers without remounting the map
            stableDriversRef.current = drivers;
        }
    }, [drivers, shouldUpdate]);

    // Use stable drivers (initial data) until shouldUpdate is true
    const driversToUse = shouldUpdate ? drivers : stableDriversRef.current;

    // Create markers from drivers (use actual coordinates from API if available)
    const driverMarkers = useMemo(() => {
        if (!driversToUse || driversToUse.length === 0) return [];
        
        return driversToUse
            .filter(driver => driver && driver.id) // Filter out invalid drivers
            .map((driver, index) => {
                // Prioritize actual lat/lng from API (currect_location)
                // Only use random positions as fallback if no location data
                let lat = driver.lat;
                let lng = driver.lng;
                
                // If no coordinates from API, use stable random positions as fallback
                if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
                    const stableSeed = driver.id || index;
                    const random1 = (stableSeed * 0.1) % 1;
                    const random2 = (stableSeed * 0.2) % 1;
                    lat = center.lat + (random1 - 0.5) * 0.05;
                    lng = center.lng + (random2 - 0.5) * 0.05;
                }
                
                return {
                    ...driver,
                    lat: lat,
                    lng: lng,
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
    const carIcon = useMemo(() => {
        if (typeof window === 'undefined') return null;
        try {
            return new L.Icon({
                iconUrl: '/car22.png', // Updated to use the car image we know exists locally
                iconSize: [40, 25],
                iconAnchor: [20, 12],
                popupAnchor: [0, -10],
            });
        } catch (e) {
            console.warn('Error creating car icon:', e);
            return null;
        }
    }, []);

    // Function to create custom icon with driver name
    const createDriverIcon = (driverName) => {
        if (typeof window === 'undefined') return null;
        try {
            // Create a container div for the icon and name
            const iconHtml = `
                <div style="display: flex; flex-direction: column; align-items: center; transform: translateY(-5px);">
                    <div style="
                        background: white;
                        border: 2px solid rgb(16, 151, 185);
                        border-radius: 8px;
                        padding: 4px 8px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                        font-size: 11px;
                        font-weight: bold;
                        color:rgb(16, 131, 185);
                        white-space: nowrap;
                        margin-bottom: 2px;
                        direction: rtl;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    ">
                        ${driverName || 'سائق'}
                    </div>
                    <img 
                        src="/car22.png" 
                        alt="car" 
                        style="width: 40px; height: 25px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));"
                    />
                </div>
            `;
            
            return L.divIcon({
                html: iconHtml,
                className: 'custom-driver-icon',
                iconSize: [60, 50],
                iconAnchor: [30, 45],
                popupAnchor: [0, -45],
            });
        } catch (e) {
            console.warn('Error creating driver icon with name:', e);
            return carIcon;
        }
    };

    // Map ready state - MUST be declared before any conditional returns (Rules of Hooks)
    const [mapReady, setMapReady] = useState(false);

    // Validate center coordinates - Use exact location from props
    // Always use the provided center if it's valid, even if it matches default coordinates
    // MUST be calculated before any conditional returns to maintain hook order
    const validCenter = useMemo(() => {
        return (center && 
            typeof center.lat === 'number' && 
            typeof center.lng === 'number' &&
            !isNaN(center.lat) && 
            !isNaN(center.lng) &&
            isFinite(center.lat) &&
            isFinite(center.lng))
            ? { lat: center.lat, lng: center.lng } // Use exact coordinates
            : { lat: 24.7136, lng: 46.6753 }; // Fallback to default only if center is invalid
    }, [center]);

    // Log center for debugging - verify exact location is used
    // MUST be declared before any conditional returns (Rules of Hooks)
    useEffect(() => {
        if (validCenter && validCenter.lat && validCenter.lng) {
            console.log('🗺️ Map center (validCenter):', validCenter);
            console.log('🗺️ Map center coordinates:', `Lat: ${validCenter.lat}, Lng: ${validCenter.lng}`);
            console.log('🗺️ Center prop received:', center);
            console.log('🗺️ Are they equal?', center?.lat === validCenter.lat && center?.lng === validCenter.lng);
        }
    }, [validCenter, center]);

    // Don't render map until mounted on client
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

    return (
        <MapContainer
            key={`map-${mapKeyRef.current}`} // Use stable key after initial mount to prevent unnecessary remounts
            center={[validCenter.lat, validCenter.lng]}
            zoom={15}
            className={className}
            style={{ width: '100%', height: '100%', minHeight: '400px' }} // Ensure height is present
            zoomControl={true}
            scrollWheelZoom={true}
            whenReady={(map) => {
                // Map is ready - wait longer to ensure DOM and Leaflet internals are fully initialized
                setTimeout(() => {
                    try {
                        const mapInstance = map.target;
                        if (!mapInstance) {
                            setMapReady(true);
                            return;
                        }
                        
                        const container = mapInstance.getContainer();
                        if (!container || !container.parentElement) {
                            // Retry after a bit more time
                            setTimeout(() => setMapReady(true), 300);
                            return;
                        }
                        
                        // Check if map panes are initialized
                        const pane = mapInstance.getPane('mapPane');
                        if (pane && pane._leaflet_id) {
                            setMapReady(true);
                        } else {
                            // Wait a bit more for panes to initialize
                            setTimeout(() => setMapReady(true), 400);
                        }
                    } catch (e) {
                        console.warn('Error checking map readiness:', e);
                        // Set ready anyway after delay to prevent blocking
                        setTimeout(() => setMapReady(true), 500);
                    }
                }, 500);
            }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Current Location Marker - Blue with custom icon - Only render when map is ready */}
            {mapReady && validCenter && (
                <>
                    {/* Circle to highlight user location */}
                    <Circle
                        center={[validCenter.lat, validCenter.lng]}
                        radius={500} // 500 meters radius
                        pathOptions={{
                            color: '#3B82F6',
                            fillColor: '#3B82F6',
                            fillOpacity: 0.1,
                            weight: 2
                        }}
                    />
                    <Marker 
                        position={[validCenter.lat, validCenter.lng]}
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
                                <strong className="block text-sm mb-1">📍 موقعك الحالي</strong>
                                <span className="text-xs text-gray-500 block mb-1">موقع التوصيل</span>
                                <span className="text-xs text-blue-600 block mb-1">
                                    {validCenter.lat.toFixed(8)}, {validCenter.lng.toFixed(8)}
                                </span>
                                <span className="text-xs text-gray-400">
                                    (من GPS)
                                </span>
                            </div>
                        </Popup>
                    </Marker>
                </>
            )}

            {/* Driver Markers - Only render when map is ready */}
            {mapReady && driverMarkers.map((driver) => {
                // Validate position before rendering - Only show drivers with valid coordinates from API
                if (!driver || !driver.lat || !driver.lng || isNaN(driver.lat) || isNaN(driver.lng)) {
                    return null;
                }
                
                // Only show drivers with actual location data from API (currect_location)
                // Skip drivers with fallback random positions
                if (!driver.location || !driver.location.lat || !driver.location.lng) {
                    return null;
                }
                
                const handleMarkerClick = () => {
                    if (onDriverClick) {
                        onDriverClick(driver);
                    } else if (driver.driverUserId || driver.driverId) {
                        // Navigate to driver profile
                        const profileId = driver.driverUserId || driver.driverId;
                        const driverId = driver.driverId;
                        const name = encodeURIComponent(driver.name || 'سائق');
                        const phone = encodeURIComponent(driver.phone || '');
                        const rate = driver.rating || '4.5';
                        const avatar = encodeURIComponent(driver.avatar || '/images/driver.png');
                        router.push(`/orders/driver_profile?id=${profileId}&driverId=${driverId}&name=${name}&phone=${phone}&rate=${rate}&avatar=${avatar}`);
                    }
                };
                
                // Create custom icon with driver name
                const driverName = driver.name || 'سائق';
                const markerIcon = createDriverIcon(driverName) || carIcon || new L.Icon({
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                });
                
                return (
                    <React.Fragment key={driver.id || `driver-${driver.driverId || Math.random()}`}>
                        {/* Circle to highlight driver location */}
                        <Circle
                            center={[driver.lat, driver.lng]}
                            radius={300} // 300 meters radius
                            pathOptions={{
                                color: '#10B981',
                                fillColor: '#10B981',
                                fillOpacity: 0.1,
                                weight: 2
                            }}
                        />
                        <Marker
                            position={[driver.lat, driver.lng]}
                            icon={markerIcon}
                            eventHandlers={{
                                click: handleMarkerClick
                            }}
                        >
                            <Popup>
                                <div className="text-right">
                                    <strong className="block text-sm mb-1">{driver.name || 'سائق'}</strong>
                                    <span className="text-xs text-gray-500 block mb-1">{driver.deliveryTime || 'غير محدد'}</span>
                                    {driver.price && (
                                        <span className="text-xs text-green-600 font-medium block mb-1">{driver.price}</span>
                                    )}
                                    <span className="text-xs text-gray-400 block mb-2">
                                        {driver.lat.toFixed(6)}, {driver.lng.toFixed(6)}
                                    </span>
                                    <button
                                        onClick={handleMarkerClick}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium underline mt-1"
                                    >
                                        عرض الملف الشخصي
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    </React.Fragment>
                );
            })}

            {/* Update map center when currentLocation changes */}
            {mapReady && (
                <MapCenterUpdater 
                    center={validCenter} 
                    shouldUpdate={true}
                />
            )}

            {/* Preserve map view state */}
            {mapReady && <MapViewPreserver shouldPreserve={true} />}

            {/* Only render FitBounds when map is ready to prevent _leaflet_pos errors */}
            {mapReady && (
                <FitBounds 
                    markers={[
                        { lat: validCenter.lat, lng: validCenter.lng },
                        ...driverMarkers.map(d => ({ lat: d.lat, lng: d.lng }))
                    ]} 
                    shouldUpdate={shouldUpdate && mapReady}
                    preserveView={true}
                />
            )}
        </MapContainer>
    );
}
