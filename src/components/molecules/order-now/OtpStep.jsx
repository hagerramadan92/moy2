"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRef, useState } from "react";

export default function OtpStep({ onNext, onBack }) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;

    // Allow single digit or empty string (for deletion)
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input if value is a digit and we're not at the end
      if (value && index < inputsRef.current.length - 1) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
        if (otp[index] === "" && index > 0) {
            // If empty and backspace pressed, move to previous
            inputsRef.current[index - 1].focus();
        } else if (otp[index] !== "") {
            // Standard backspace behavior clears the input (handled by onChange),
            // but we usually don't need to do anything else here.
        }
    }
  };
  return (
    <div className="space-y-8 text-right">
      <div className="space-y-6">
           <div className="space-y-2">
                <h2 className="text-3xl font-bold text-center text-gray-900 tracking-tight">التحقق</h2>
                <p className="text-gray-500 text-center text-lg font-medium">أدخل الرمز المرسل لجوالك</p>
           </div>
           
           <div className="flex justify-center">
                <div className="text-sm text-center text-[#579BE8] bg-[#579BE8]/10 px-4 py-2 rounded-2xl font-bold border border-[#579BE8]/20">
                    تم ارسال رمز الOTP عبر Whatsapp
                </div>
           </div>
      </div>

      <div className="flex gap-4 justify-center" dir="ltr">
        {otp.map((value, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            value={value}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => (inputsRef.current[index] = el)}
            className="w-[72px] h-[72px] text-center text-3xl font-bold rounded-2xl border-2 border-[#579BE8]/20 bg-white focus:border-[#579BE8] focus:ring-4 focus:ring-[#579BE8]/10 outline-none transition-all text-[#579BE8] shadow-sm hover:border-[#579BE8]/50"
          />
        ))}
      </div>
      
      <div className="flex flex-col items-center gap-3 text-sm font-medium">
        <button className="text-gray-400 hover:text-[#579BE8] transition-colors font-semibold">
            ارسال عبر الSMS
        </button>
        <button className="text-gray-400 hover:text-[#579BE8] transition-colors font-semibold">
            اعاده الارسال
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
            variant="outline"
            className="w-full h-[60px] border-2 border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-[#579BE8] hover:border-[#579BE8]/20 rounded-2xl text-lg font-bold"
            onClick={onBack}
        >
            رجوع
        </Button>
        <Button 
            className="w-full h-[60px] bg-[#579BE8] hover:bg-[#4889d4] hover:shadow-lg hover:-translate-y-0.5 text-white text-lg font-bold rounded-2xl shadow-md shadow-[#579BE8]/20 active:scale-[0.98] transition-all"  
            onClick={onNext}
        >
            تأكيد
        </Button>
      </div>
    </div>
  );
}
