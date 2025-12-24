"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function PhoneStep({ onNext }) {
  return (
    <div className="space-y-8 text-right">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-center text-gray-900 tracking-tight">مرحبًا بك</h2>
        <p className="text-gray-500 text-center text-lg font-medium">سجل دخولك للاستمرار</p>
      </div>
      
      <div className="space-y-5">
        <label className="text-right block text-md font-semibold text-gray-700 mr-1">رقم الجوال</label>
        <div className="relative group">
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
            placeholder="5xxxxxxxx"
            dir="ltr"
            className="text-left pl-24 h-[70px] text-2xl tracking-widest font-bold text-[#579BE8] bg-white border-2 border-[#579BE8]/20 focus:border-[#579BE8] focus:ring-4 focus:ring-[#579BE8]/10 rounded-2xl transition-all placeholder:text-gray-300 pointer-events-auto shadow-sm"
          />
        </div>
      </div>
    
      <Button
        className="w-full h-[70px] bg-[#579BE8] hover:bg-[#4889d4] hover:shadow-lg hover:-translate-y-0.5 text-white text-xl font-bold rounded-2xl shadow-md shadow-[#579BE8]/20 active:scale-[0.98] transition-all cursor-pointer mt-4"
        onClick={onNext}
      >
        تأكيد
      </Button>
    </div>
  );
}
