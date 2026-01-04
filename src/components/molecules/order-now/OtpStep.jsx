"use client";

import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";

export default function OtpStep({ otp, onOtpChange, error, onNext, onBack, onResend, verifying, timer, resending }) {
  const [localOtp, setLocalOtp] = useState(otp || ["", "", "", "", "", ""]);
  const inputsRef = useRef([]);

  useEffect(() => {
    setLocalOtp(otp || ["", "", "", "", "", ""]);
  }, [otp]);

  const handleChange = (e, index) => {
    const value = e.target.value;

    // Allow single digit or empty string (for deletion)
    if (/^\d?$/.test(value)) {
      const newOtp = [...localOtp];
      newOtp[index] = value;
      setLocalOtp(newOtp);
      onOtpChange(newOtp);

      // Auto-focus next input if value is a digit and we're not at the end
      if (value && index < inputsRef.current.length - 1) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
        if (localOtp[index] === "" && index > 0) {
            // If empty and backspace pressed, move to previous
            inputsRef.current[index - 1].focus();
        } else if (localOtp[index] !== "") {
            // Standard backspace behavior clears the input (handled by onChange),
            // but we usually don't need to do anything else here.
        }
    }
  };

  const isOtpComplete = localOtp.every(digit => digit !== "") && localOtp.join("").length === 6;
  return (
    <div className="space-y-8 text-right">
      <div className="space-y-6">
           <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-900 tracking-tight">التحقق</h2>
                <p className="text-gray-500 text-center text-sm sm:text-base md:text-lg font-medium">أدخل الرمز المرسل لجوالك</p>
           </div>
           
           <div className="flex justify-center">
                <div className="text-xs sm:text-sm text-center text-[#579BE8] bg-[#579BE8]/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl font-bold border border-[#579BE8]/20">
                    تم ارسال رمز الOTP عبر Whatsapp
                </div>
           </div>
      </div>

      <div className="flex gap-2 sm:gap-3 md:gap-4 justify-center flex-wrap" dir="ltr">
        {localOtp.map((value, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            value={value}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => (inputsRef.current[index] = el)}
            className={`w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] text-center text-2xl sm:text-3xl font-bold rounded-2xl border-2 ${
              error ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-[#579BE8]/20 focus:border-[#579BE8] focus:ring-[#579BE8]/10"
            } bg-white outline-none transition-all text-[#579BE8] shadow-sm hover:border-[#579BE8]/50`}
          />
        ))}
      </div>
      {error && (
        <p className="text-red-500 text-xs sm:text-sm font-medium text-center">
          {error}
        </p>
      )}
      
      <div className="flex flex-col items-center gap-3 text-xs sm:text-sm font-medium">
        <button 
          className="text-gray-400 hover:text-[#579BE8] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={true}
        >
            ارسال عبر الSMS
        </button>
        <button 
          onClick={onResend}
          disabled={timer > 0 || resending}
          className="text-gray-400 hover:text-[#579BE8] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {resending ? "جاري الإرسال..." : timer > 0 ? `إعادة الإرسال (${timer})` : "إعادة الإرسال"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
            variant="outline"
            className="w-full h-[55px] sm:h-[60px] border-2 border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-[#579BE8] hover:border-[#579BE8]/20 rounded-2xl text-sm sm:text-base md:text-lg font-bold"
            onClick={onBack}
        >
            رجوع
        </Button>
        <Button 
            className="w-full h-[55px] sm:h-[60px] bg-[#579BE8] hover:bg-[#4889d4] hover:shadow-lg hover:-translate-y-0.5 text-white text-sm sm:text-base md:text-lg font-bold rounded-2xl shadow-md shadow-[#579BE8]/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"  
            onClick={onNext}
            disabled={!isOtpComplete || verifying}
        >
            {verifying ? "جاري التحقق..." : "تأكيد"}
        </Button>
      </div>
    </div>
  );
}
