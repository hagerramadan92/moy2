"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { MdArrowBackIos } from "react-icons/md";
export default function ProfileStep({ name, onNameChange, error, onNext, onSkip }) {
  const [preview, setPreview] = useState(null);
  const [localName, setLocalName] = useState(name || "");

  useEffect(() => {
    setLocalName(name || "");
  }, [name]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setLocalName(value);
    onNameChange(value);
  };
  return (
    <div className="space-y-6 text-right">
      <div className="flex justify-between items-center mb-4">
           <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">إنشاء حساب</h2>
           <Button
            variant="ghost"
            onClick={onSkip}
            className="flex items-center gap-1 text-xs sm:text-sm text-gray-400 hover:text-gray-600 hover:bg-transparent p-0"
            >
            <MdArrowBackIos className="w-3 h-3 sm:w-4 sm:h-4" /> تخطي
           </Button>
      </div>

      <div className="flex flex-col items-center gap-6">
        <label className="relative group cursor-pointer">
            <div className={`w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-[#579BE8]/10 group-hover:border-[#579BE8] transition-all duration-300 ${preview ? 'bg-white' : 'bg-[#579BE8]/5'}`}>
                {preview ? (
                     <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#579BE8]/40 group-hover:text-[#579BE8] transition-colors">
                        <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                )}
            </div>
            
            <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-[#579BE8] text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg group-hover:scale-110 transition-transform">
                <FaPlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
            />
        </label>
        <p className="text-gray-700 text-xs sm:text-sm font-semibold">اضف صورة شخصية</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
            <label htmlFor="name" className="block text-sm sm:text-base font-semibold text-gray-700 mr-1">الاسم</label>
            <Input 
                id="name"
                value={localName}
                onChange={handleNameChange}
                placeholder="الاسم الكامل" 
                className={`pl-4 h-[55px] sm:h-[64px] text-base sm:text-lg bg-white border-2 ${
                  error ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-[#579BE8]/20 focus:border-[#579BE8] focus:ring-[#579BE8]/10"
                } rounded-2xl transition-all shadow-sm font-medium text-gray-800`} 
            />
            {error && (
              <p className="text-red-600 text-xs sm:text-sm font-medium mr-1">
                {error}
              </p>
            )}
        </div>
        
        <Button  
            className="w-full h-[55px] sm:h-[64px] bg-[#579BE8] hover:bg-[#4889d4] hover:shadow-lg hover:-translate-y-0.5 text-white text-base sm:text-lg md:text-xl font-bold rounded-2xl shadow-md shadow-[#579BE8]/20 mt-4 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={onNext}
            disabled={!localName || localName.trim().length < 2}
        >
          إنشاء الحساب
        </Button>
      </div>
    </div>
  );
}
