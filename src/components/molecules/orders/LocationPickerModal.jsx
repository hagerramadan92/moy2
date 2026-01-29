"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, Navigation, Check, AlertCircle, Search , MapPin } from "lucide-react";
import toast from "react-hot-toast";
 
// ✅ Fix Leaflet marker icons in Next.js
const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

function MapRefBridge({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    return () => {
      mapRef.current = null;
    };
  }, [map, mapRef]);
  return null;
}

function LocationMarker({ position, setPosition }) {
  const map = useMap();

  useEffect(() => {
    if (position) map.flyTo(position, Math.max(map.getZoom(), 15));
  }, [position, map]);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

/**
 * ✅ Search input (top of map)
 * Uses Nominatim Search API (OpenStreetMap)
 */
function SearchBox({ onPick }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  const abortRef = useRef(null);
  const debRef = useRef(null);

  const runSearch = async (query) => {
    const text = query.trim();
    if (!text) {
      setResults([]);
      setOpen(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setBusy(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        text
      )}&limit=7&accept-language=ar&addressdetails=1`;

      const res = await fetch(url, {
        signal: abortRef.current.signal,
        headers: { "Accept-Language": "ar" },
      });

      if (!res.ok) throw new Error("Search failed");

      const list = await res.json();
      const clean = Array.isArray(list) ? list : [];

      setResults(clean);
      setOpen(clean.length > 0);
    } catch (e) {
      if (e?.name !== "AbortError") {
        setResults([]);
        setOpen(false);
        toast.error("تعذر البحث الآن");
      }
    } finally {
      setBusy(false);
    }
  };

  // ✅ Debounced search while typing
  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => runSearch(q), 350);
    return () => clearTimeout(debRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const pickItem = (item) => {
    const lat = Number(item.lat);
    const lng = Number(item.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const label = item.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    onPick({ lat, lng }, label);

    setQ(label);
    setOpen(false);
    setResults([]);
    toast.success("تم تحديد الموقع");
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-[1200]">
      <div className="relative">
        {/* Input */}
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-2 flex items-center gap-2">
          <Search size={18} className="text-gray-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setOpen(true);
            }}
            placeholder="ابحث عن مكان (مثال: حي اليرموك الرياض)"
            className="flex-1 h-10 px-2 text-sm outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={() => runSearch(q)}
            disabled={busy}
            className="h-10 px-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? "..." : "بحث"}
          </button>
        </div>

        {/* Results dropdown */}
        {open && results.length > 0 && (
          <div className="mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <ul className="max-h-64 overflow-auto">
              {results.map((item) => {
                const title = item.display_name || "نتيجة";
                return (
                  <li key={item.place_id}>
                    <button
                      type="button"
                      onClick={() => pickItem(item)}
                      className="w-full text-right px-4 py-3 hover:bg-gray-50 transition flex items-start gap-2"
                    >
                      <MapPin size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-800 leading-5">{title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="p-2 border-t bg-gray-50 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                اختر نتيجة لتحديدها على الخريطة
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}

        {/* No results */}
        {open && !busy && q.trim() && results.length === 0 && (
          <div className="mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 text-right text-sm text-gray-600">
            لا توجد نتائج
          </div>
        )}
      </div>
    </div>
  );
}


export default function LocationPickerModal({ isOpen, onClose, onSelect, initialLocation }) {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [lastLocateError, setLastLocateError] = useState(null);

  const mapRef = useRef(null);
  const hardTimeoutRef = useRef(null);

  const isHttps = typeof window !== "undefined" ? window.location.protocol === "https:" : false;

  useEffect(() => {
    fixLeafletIcons();

    if (isOpen) {
      setLastLocateError(null);

      if (initialLocation?.lat && initialLocation?.lng) {
        setPosition({ lat: initialLocation.lat, lng: initialLocation.lng });
      }

      const t = setTimeout(() => setMapReady(true), 100);
      return () => clearTimeout(t);
    } else {
      setMapReady(false);
      setLoading(false);
      setLastLocateError(null);

      if (hardTimeoutRef.current) {
        clearTimeout(hardTimeoutRef.current);
        hardTimeoutRef.current = null;
      }
    }
  }, [isOpen, initialLocation]);

  const stopLoading = () => {
    setLoading(false);
    if (hardTimeoutRef.current) {
      clearTimeout(hardTimeoutRef.current);
      hardTimeoutRef.current = null;
    }
  };

  const handleLocateMe = () => {
    setLastLocateError(null);

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("المتصفح لا يدعم تحديد الموقع");
      return;
    }
    if (!mapReady) {
      toast.error("الخريطة غير جاهزة بعد");
      return;
    }

    setLoading(true);

    if (hardTimeoutRef.current) clearTimeout(hardTimeoutRef.current);
    hardTimeoutRef.current = setTimeout(() => {
      setLastLocateError({ code: 3, message: "timeout" });
      stopLoading();
      toast.error("انتهت مهلة تحديد الموقع");
    }, 12000);

    const success = (pos) => {
      const { latitude, longitude } = pos.coords;
      const coords = { lat: latitude, lng: longitude };
      setPosition(coords);

      if (mapRef.current) mapRef.current.flyTo(coords, Math.max(mapRef.current.getZoom(), 15));

      toast.success("تم تحديد موقعك");
      stopLoading();
    };

    const fail = (err) => {
      setLastLocateError(err);
      stopLoading();

      // keep it short (as you asked)
      if (!isHttps) {
        toast.error("الموقع يحتاج HTTPS لتحديد الموقع");
        return;
      }
      toast.error("تعذر تحديد الموقع — استخدم البحث بالأعلى");
    };

    // Fast-first then fallback to high accuracy
    navigator.geolocation.getCurrentPosition(
      success,
      () => {
        navigator.geolocation.getCurrentPosition(success, fail, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  const handleConfirm = async () => {
    if (!position) {
      toast.error("يرجى تحديد موقع على الخريطة أولاً");
      return;
    }

    let addressText = `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`,
        { headers: { "Accept-Language": "ar" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) addressText = data.display_name;
      }
    } catch {}

    onSelect?.({ lat: position.lat, lng: position.lng, address: addressText });
    onClose?.();
  };

  const handlePickFromSearch = (coords) => {
    setPosition(coords);
    setLastLocateError(null);
    if (mapRef.current) mapRef.current.flyTo(coords, Math.max(mapRef.current.getZoom(), 15));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="text-right">
            <h3 className="font-bold text-lg text-gray-800">تحديد الموقع</h3>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="flex-1 relative bg-gray-100">
          {/* ✅ Search input ALWAYS at top of map */}
          {/* <SearchBox onPick={handlePickFromSearch} /> */}

          {mapReady && (
            <MapContainer
              center={position || { lat: 24.7136, lng: 46.6753 }}
              zoom={position ? 15 : 13}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapRefBridge mapRef={mapRef} />

              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
          )}

          {/* Loading */}
          {loading && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-[1000]">
              <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="font-bold text-gray-800">جاري تحديد موقعك...</p>
              </div>
            </div>
          )}

          {/* ✅ ONLY show this panel when locate fails */}
          {lastLocateError && !loading && (
            <div className="absolute top-20 left-4 right-4 z-[1100]">
              <div className="bg-white/95 backdrop-blur-sm border border-red-200 rounded-2xl shadow-lg p-3 flex items-start gap-2">
                <AlertCircle className="text-red-500 mt-0.5" size={18} />
                <div className="flex-1 text-right">
                  <p className="font-bold text-gray-800">تعذر تحديد موقعك تلقائيًا</p>
                  <p className="text-xs text-gray-600 mt-1">
                    استخدم البحث بالأعلى لتحديد موقعك بسرعة.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex md:gap-3 gap-2 z-[1000] w-full px-4 justify-center">
            <button
              onClick={handleLocateMe}
              disabled={loading}
              className="flex  items-center md:gap-2 bg-white text-blue-600 md:px-6 md:py-3 py-1 rounded-xl shadow-lg font-semibold hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-70 min-w-[160px] justify-center"
            >
              <Navigation size={20} className={loading ? "animate-spin" : ""} />
              <span>{loading ? "جاري التحديد..." : "موقعي الحالي"}</span>
            </button>

            <button
              onClick={handleConfirm}
              disabled={!position}
              className="flex items-center md:gap-2 bg-blue-600 text-white md:px-8 md:py-3 rounded-xl shadow-lg font-semibold hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale min-w-[160px] justify-center"
            >
              <Check size={20} />
              <span>تأكيد الموقع</span>
            </button>
          </div>
        </div>

        <div className="p-3 bg-white border-t text-center text-sm text-gray-500">
          يمكنك تحريك الخريطة والنقر لتحديد موقعك بدقة
        </div>
      </div>
    </div>
  );
}
