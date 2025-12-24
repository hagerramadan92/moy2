"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { MdArrowBackIos } from "react-icons/md";
import { FaCirclePlus } from "react-icons/fa6";
export default function ProfileStep({ onNext, onSkip }) {
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="space-y-6 text-right">
      <div className="flex justify-between items-center mb-4">
           <h2 className="text-2xl font-bold text-gray-900">إنشاء حساب</h2>
           <Button
            variant="ghost"
            onClick={onSkip}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 hover:bg-transparent p-0"
            >
            <MdArrowBackIos className="w-4 h-4" /> تخطي
           </Button>
      </div>

      <div className="flex flex-col items-center gap-4">
        <label className="relative group cursor-pointer">
            <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 group-hover:border-blue-100 transition-colors ${preview ? 'bg-white' : 'bg-gray-100'}`}>
                {preview ? (
                     <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                )}
            </div>
            
            <div className="absolute bottom-1 right-1 bg-[#579BE8] text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm group-hover:scale-110 transition-transform">
                <FaPlusCircle className="w-5 h-5" />
            </div>

            <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
            />
        </label>
        <p className="text-gray-500 text-sm font-medium">اضف صورة شخصية</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700">الاسم</label>
            <Input 
                placeholder="الاسم الكامل" 
                className="pl-4 h-14 text-lg bg-gray-50/50 border-gray-200 focus:border-[#579BE8] focus:ring-[#579BE8]/10 rounded-xl transition-all" 
            />
        </div>
        
        <Button  
            className="w-full h-16 bg-[#579BE8] hover:bg-[#4a8cd9] text-white text-xl font-bold rounded-2xl shadow-lg shadow-blue-500/20 mt-4 active:scale-[0.98] transition-all" 
            onClick={onNext}
        >
          إنشاء الحساب
        </Button>
      </div>
    </div>
  );
}
