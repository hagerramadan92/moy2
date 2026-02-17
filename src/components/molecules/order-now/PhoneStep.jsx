"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function PhoneStep({ phone, countryCode, onPhoneChange, onCountryCodeChange, error, onNext, loading }) {
  const [localPhone, setLocalPhone] = useState(phone || "");

  useEffect(() => {
    setLocalPhone(phone || "");
  }, [phone]);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 9) {
      setLocalPhone(value);
      onPhoneChange(value);
    }
  };

  return (
    <div className="space-y-8 text-right">
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-900 tracking-tight">مرحبًا بك</h2>
        <p className="text-gray-700 text-center text-sm sm:text-base md:text-lg font-medium">سجل دخولك للاستمرار</p>
      </div>
      
      <div className="space-y-5">
        <label className="text-right block text-sm sm:text-base font-semibold text-gray-700 mr-1">رقم الجوال</label>
        <div className="flex gap-2">
          {countryCode && onCountryCodeChange && (
            <select
              value={countryCode}
              onChange={(e) => onCountryCodeChange(e.target.value)}
              className="h-[60px] sm:h-[70px] px-3 sm:px-4 text-base sm:text-lg font-bold text-[#579BE8] bg-white border-2 border-[#579BE8]/20 rounded-2xl focus:border-[#579BE8] focus:ring-[#579BE8]/10 outline-none"
            >
              <option value="+20">+20</option>
              <option value="+966">+966</option>
            </select>
          )}
          <div className="relative group flex-1">
            <div className="absolute top-1/2 -translate-y-1/2 left-4 w-[60px] h-[30px] opacity-90 transition-opacity">
              <Image 
                src="/images/phone-icon.png" 
                alt="Phone Icon" 
                width={79} 
                height={31} 
                className="w-full h-full object-contain" 
              />
            </div>
            <Input
              value={localPhone}
              onChange={handlePhoneChange}
              placeholder="5xxxxxxxx"
              dir="ltr"
              disabled={loading}
              className={`text-left pl-20 sm:pl-24 h-[60px] sm:h-[70px] text-lg sm:text-xl md:text-2xl tracking-widest font-bold text-[#579BE8] bg-white border-2 ${
                error ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-[#579BE8]/20 focus:border-[#579BE8] focus:ring-[#579BE8]/10"
              } rounded-2xl transition-all placeholder:text-gray-300 pointer-events-auto shadow-sm ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            />
          </div>
        </div>
        {error && (
          <p className="text-red-600 text-xs sm:text-sm font-medium mr-1">
            {error}
          </p>
        )}
      </div>
    
      <Button
        className="w-full h-[60px] sm:h-[70px] bg-[#579BE8] hover:bg-[#4889d4] hover:shadow-lg hover:-translate-y-0.5 text-white text-base sm:text-lg md:text-xl font-bold rounded-2xl shadow-md shadow-[#579BE8]/20 active:scale-[0.98] transition-all cursor-pointer mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onNext}
        disabled={!localPhone || localPhone.length < 9 || loading}
      >
        {loading ? "جاري الإرسال..." : "تأكيد"}
      </Button>
    </div>
  );
}
