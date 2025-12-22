"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from 'next/dynamic';
import { MapPin, Navigation, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// استيراد Leaflet بشكل ديناميكي لمنع مشاكل SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents),
  { ssr: false }
);

// مكونات مخصصة
function LocationMarker({ position, setPosition }) {
  const MapEvents = useMapEvents && useMapEvents({
    click(e) {
      if (setPosition) {
        setPosition(e.latlng);
        // تحديث الخريطة للانتقال للموقع الجديد
        e.target.flyTo(e.latlng, e.target.getZoom());
      }
    },
  });

  if (!position) return null;

  return (
    <Marker position={position}>
      <Popup>
        <div className="p-2">
          <p className="font-bold">الموقع المحدد</p>
          <p className="text-sm">Lat: {position.lat.toFixed(6)}</p>
          <p className="text-sm">Lng: {position.lng.toFixed(6)}</p>
        </div>
      </Popup>
    </Marker>
  );
}

function LocateButton({ onLocate }) {
  const map = useMapEvents && useMapEvents({
    locationfound(e) {
      if (onLocate) {
        onLocate(e.latlng);
        e.target.flyTo(e.latlng, 15);
      }
    },
  });

  const handleClick = () => {
    if (map) {
      map.locate();
    }
  };

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control">
        <button
          onClick={handleClick}
          className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100 border border-gray-300"
          title="تحديد موقعي الحالي"
        >
          <Navigation className="w-5 h-5 text-blue-600" />
        </button>
      </div>
    </div>
  );
}

export default function LocationMap() {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // المواقع الافتراضية للمدن السعودية
  const saudiCities = useMemo(() => ({
    الرياض: { lat: 24.7136, lng: 46.6753 },
    جدة: { lat: 21.5433, lng: 39.1728 },
    الدمام: { lat: 26.4207, lng: 50.0888 },
    مكة: { lat: 21.3891, lng: 39.8579 },
    المدينة: { lat: 24.4672, lng: 39.6113 },
  }), []);

  // تحديث الموقع الحالي عند تحميل المكون
  useEffect(() => {
    const getCurrentLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setPosition({ lat: latitude, lng: longitude });
            setIsMapLoaded(true);
          },
          (error) => {
            console.error("Error getting location:", error);
            // استخدام الرياض كموقع افتراضي
            setPosition(saudiCities.الرياض);
            setIsMapLoaded(true);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        setPosition(saudiCities.الرياض);
        setIsMapLoaded(true);
      }
    };

    getCurrentLocation();
  }, [saudiCities]);

  const handleLocate = (latlng) => {
    setPosition(latlng);
    setIsLoading(true);
    
    // محاكاة جلب العنوان
    setTimeout(() => {
      setAddress("الموقع الحالي - المملكة العربية السعودية");
      setIsLoading(false);
    }, 1000);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setAddress(value);
    
    if (value.length > 2) {
      // محاكاة البحث عن مواقع
      const mockSuggestions = [
        "الرياض - المملكة العربية السعودية",
        "جدة - المملكة العربية السعودية",
        "الدمام - المملكة العربية السعودية",
        "مكة المكرمة - المملكة العربية السعودية",
        "المدينة المنورة - المملكة العربية السعودية",
      ].filter(loc => loc.includes(value));
      
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setAddress(suggestion);
    setSuggestions([]);
    
    // تحديث الموقع على الخريطة
    const city = Object.keys(saudiCities).find(city => suggestion.includes(city));
    if (city && saudiCities[city]) {
      setPosition(saudiCities[city]);
    }
  };

  const handleConfirmLocation = () => {
    if (position) {
      alert(`تم تأكيد الموقع:\nالعنوان: ${address}\nالإحداثيات: ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`);
    }
  };

  const handleCitySelect = (city) => {
    if (saudiCities[city]) {
      setPosition(saudiCities[city]);
      setAddress(`${city} - المملكة العربية السعودية`);
    }
  };

  // الموقع الافتراضي للخريطة
  const defaultCenter = position || saudiCities.الرياض;

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* العمود الأيسر: معلومات التحكم */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              تحديد دقيق
            </CardTitle>
            <CardDescription>
              حدد موقعك بدقة عالية على الخريطة
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* نتائج مباشرة */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-green-600" />
                نتائج مباشرة
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                نتائج موقع السائق في الوقت الفعلي
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">معلومات الموقع متوفرة</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">الخريطة محدثة لحظياً</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">دقة تحديد عالية</span>
                </div>
              </div>
            </div>

            {/* حدد موقعك الآن */}
            <div>
              <h3 className="text-lg font-semibold mb-3">حدد موقعك الآن</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">اكتب العنوان</Label>
                  <div className="relative">
                    <Input
                      id="address"
                      value={address}
                      onChange={handleSearch}
                      placeholder="اكتب عنوانك هنا..."
                      className="pr-10"
                    />
                    {isLoading && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* اقتراحات البحث */}
                  {suggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                          onClick={() => handleSelectSuggestion(suggestion)}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{suggestion}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* الأزرار */}
                <div className="flex gap-3">
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="flex-1"
                  >
                    تحديث الخريطة
                  </Button>
                  <Button 
                    onClick={handleConfirmLocation}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={!position}
                  >
                    تأكيد الموقع
                  </Button>
                </div>
              </div>
            </div>

            {/* خط فاصل */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">المواقع القريبة</h4>
              
              <div className="space-y-2">
                {[
                  { name: "H Mart", category: "سوبرماركت" },
                  { name: "الخالي مول", category: "مركز تسوق" },
                  { name: "Ridgewood", category: "حي سكني" },
                  { name: "Allendale", category: "منطقة تجارية" },
                  { name: "The Home Depot", category: "مواد بناء" },
                ].map((place, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium">{place.name}</p>
                      <p className="text-xs text-gray-500">{place.category}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      قريب
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* العمود الأيمن: الخريطة */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>خريطة الموقع</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="default" className="bg-green-600">
                    مباشر
                  </Badge>
                  <Badge variant="outline">
                    دقة عالية
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="relative h-[500px]">
                {isMapLoaded && (
                  <div className="h-full w-full rounded-b-lg">
                    <style jsx global>{`
                      .leaflet-container {
                        width: 100%;
                        height: 100%;
                        border-radius: 0 0 0.5rem 0.5rem;
                      }
                      .leaflet-control-container .leaflet-top {
                        top: 10px;
                      }
                      .leaflet-control-container .leaflet-right {
                        right: 10px;
                      }
                    `}</style>
                    
                    <MapContainer
                      center={[defaultCenter.lat, defaultCenter.lng]}
                      zoom={13}
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      {position && (
                        <LocationMarker 
                          position={position} 
                          setPosition={setPosition}
                        />
                      )}
                      
                      {/* إضافة علامات للمدن الرئيسية */}
                      {Object.entries(saudiCities).map(([city, coords]) => (
                        <Marker key={city} position={[coords.lat, coords.lng]}>
                          <Popup>
                            <div className="p-2">
                              <p className="font-bold">{city}</p>
                              <Button
                                size="sm"
                                className="mt-2"
                                onClick={() => handleCitySelect(city)}
                              >
                                تحديد هذه المدينة
                              </Button>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                )}
                
                {/* معلومات الموقع المحدد */}
                {position && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold">الموقع المحدد</h4>
                        <p className="text-sm text-gray-600">
                          خط العرض: {position.lat.toFixed(6)} | خط الطول: {position.lng.toFixed(6)}
                        </p>
                        {address && (
                          <p className="text-sm mt-1">{address}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(`${position.lat}, ${position.lng}`)}
                        >
                          نسخ الإحداثيات
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* حالة التحميل */}
                {!isMapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">جاري تحميل الخريطة...</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* أزرار التنقل السريع */}
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.keys(saudiCities).map((city) => (
              <Button
                key={city}
                variant="outline"
                size="sm"
                onClick={() => handleCitySelect(city)}
                className="flex-1 min-w-[120px]"
              >
                {city}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-semibold">تلميح</h4>
                <p className="text-sm text-gray-600">انقر على الخريطة لتحديد موقع دقيق</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Navigation className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-semibold">تحديد تلقائي</h4>
                <p className="text-sm text-gray-600">استخدم زر "تحديد موقعي" للبحث التلقائي</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-semibold">جاهز للتوصيل</h4>
                <p className="text-sm text-gray-600">حدد موقعك وابدأ الطلب فوراً</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}