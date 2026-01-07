'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Navigation, Check } from 'lucide-react';
import toast from 'react-hot-toast';

// Fix for Leaflet default marker icons in Next.js
const fixLeafletIcons = () => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
};

// Component to handle map clicks and updates
function LocationMarker({ position, setPosition }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position ? <Marker position={position} /> : null;
}

export default function LocationPickerModal({ isOpen, onClose, onSelect, initialLocation }) {
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        fixLeafletIcons();
        if (isOpen) {
            // Delay map rendering slightly to ensure container size is correct for Leaflet
            const timer = setTimeout(() => setMapReady(true), 100);
            return () => clearTimeout(timer);
        } else {
            setMapReady(false);
        }
    }, [isOpen]);

    // Handle "Locate Me"
    const handleLocateMe = () => {
        setLoading(true);
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                const newPos = { lat: latitude, lng: longitude };
                setPosition(newPos);
                setLoading(false);
                toast.success('تم تحديد موقعك بنجاح');
            },
            () => {
                toast.error('Unable to retrieve your location');
                setLoading(false);
            }
        );
    };

    const handleConfirm = async () => {
        if (!position) {
            toast.error('Please select a location on the map');
            return;
        }

        // Try to reverse geocode simple display string
        let addressText = `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`);
            if (res.ok) {
                const data = await res.json();
                if (data.display_name) addressText = data.display_name;
            }
        } catch (e) {
            console.error('Reverse geocoding failed', e);
        }

        onSelect({ lat: position.lat, lng: position.lng, address: addressText });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">تحديد الموقع</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Map Container */}
                <div className="flex-1 relative bg-gray-100">
                    {mapReady && (
                        <MapContainer
                            center={position || { lat: 24.7136, lng: 46.6753 }} // Default to Riyadh
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationMarker position={position} setPosition={setPosition} />
                        </MapContainer>
                    )}

                    {/* Controls Overlay */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-[1000] w-full px-4 justify-center">
                        <button
                            onClick={handleLocateMe}
                            disabled={loading}
                            className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl shadow-lg font-semibold hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-70"
                        >
                            <Navigation size={20} className={loading ? 'animate-spin' : ''} />
                            <span>{loading ? 'جاري التحديد...' : 'موقعي الحالي'}</span>
                        </button>

                        <button
                            onClick={handleConfirm}
                            disabled={!position}
                            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl shadow-lg font-semibold hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                        >
                            <Check size={20} />
                            <span>تأكيد الموقع</span>
                        </button>
                    </div>
                </div>

                {/* Footer / Instructions */}
                <div className="p-3 bg-white border-t text-center text-sm text-gray-500">
                    يمكنك تحريك الخريطة والنقر لتحديد موقعك بدقة
                </div>
            </div>
        </div>
    );
}
