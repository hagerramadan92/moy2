"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation, CheckCircle, AlertCircle, Search } from "lucide-react";

export default function SimpleLocationSelector() {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState("الرياض");

  const cities = [
    "الرياض",
    "جدة", 
    "الدمام",
    "مكة",
    "المدينة"
  ];

  const nearbyPlaces = [
    { name: "H Mart", category: "سوبرماركت" },
    { name: "الخالي مول", category: "مركز تسوق" },
    { name: "Ridgewood", category: "حي سكني" },
    { name: "Allendale", category: "منطقة تجارية" },
    { name: "The Home Depot", category: "مواد بناء" },
  ];

  const handleSearch = (e) => {
    const value = e.target.value;
    setAddress(value);
    
    if (value.length > 2) {
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

  const handleGetLocation = () => {
    setIsLoading(true);
    setTimeout(() => {
      setAddress(`${selectedCity} - المملكة العربية السعودية`);
      setIsLoading(false);
    }, 1500);
  };

  const handleConfirm = () => {
    if (address) {
      alert(`تم تأكيد الموقع:\n${address}`);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* العمود الأيسر */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">تحديد دقيق</h2>
          </div>
          <p className="text-gray-600 mb-6">
            حدد موقعك بدقة عالية على الخريطة
          </p>

          {/* نتائج مباشرة */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">نتائج مباشرة</h3>
            </div>
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

          {/* تحديد الموقع */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">حدد موقعك الآن</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اكتب العنوان
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onChange={handleSearch}
                    placeholder="اكتب عنوانك هنا..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                </div>
                
                {suggestions.length > 0 && (
                  <div className="mt-2 bg-white border rounded-md shadow-lg">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setAddress(suggestion);
                          setSuggestions([]);
                        }}
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

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGetLocation}
                  disabled={isLoading}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      جاري التحديد
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      موقعي الحالي
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleConfirm}
                  disabled={!address}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  تأكيد الموقع
                </button>
              </div>
            </div>
          </div>

          {/* المواقع القريبة */}
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4">المواقع القريبة</h4>
            
            <div className="space-y-3">
              {nearbyPlaces.map((place, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{place.name}</p>
                    <p className="text-sm text-gray-500">{place.category}</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">قريب</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* العمود الأيمن: خريطة وهمية */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg h-full">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">خريطة الموقع</h2>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    مباشر
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    دقة عالية
                  </span>
                </div>
              </div>
            </div>
            
            {/* خريطة وهمية */}
            <div className="p-4">
              <div className="relative h-[400px] bg-gradient-to-br from-blue-50 to-gray-100 rounded-lg overflow-hidden border">
                {/* محاكاة خريطة */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-64 h-64 bg-white rounded-lg shadow-lg p-4">
                      {/* نقاط على الخريطة */}
                      {cities.map((city, index) => (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedCity(city);
                            setAddress(`${city} - المملكة العربية السعودية`);
                          }}
                          className={`absolute ${
                            index === 0 ? "top-1/4 left-1/4" :
                            index === 1 ? "top-1/3 right-1/4" :
                            index === 2 ? "bottom-1/4 right-1/3" :
                            index === 3 ? "top-2/3 left-1/3" :
                            "bottom-1/3 left-1/4"
                          }`}
                        >
                          <div className={`flex flex-col items-center ${
                            selectedCity === city ? "text-blue-600" : "text-gray-600"
                          }`}>
                            <MapPin className={`w-6 h-6 ${selectedCity === city ? "text-blue-600" : "text-gray-400"}`} />
                            <span className="text-xs mt-1">{city}</span>
                          </div>
                        </button>
                      ))}
                      
                      {/* موقع المستخدم */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                            <Navigation className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute inset-0 w-12 h-12 border-4 border-blue-300 rounded-full animate-ping"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* معلومات الموقع */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 rounded-lg p-4 shadow-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold">الموقع المحدد: {selectedCity}</h4>
                      {address && (
                        <p className="text-sm text-gray-600 mt-1">{address}</p>
                      )}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(address)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      نسخ العنوان
                    </button>
                  </div>
                </div>
              </div>
              
              {/* أزرار المدن */}
              <div className="mt-4 flex flex-wrap gap-2">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setAddress(`${city} - المملكة العربية السعودية`);
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      selectedCity === city
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}