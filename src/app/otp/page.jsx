"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function OtpPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const inputsRef = useRef([]);
  const router = useRouter();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < inputsRef.current.length - 1) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  const handleVerify = () => {
      console.log("Verifying OTP:", otp.join(""));
  };
  
  const handleBack = () => {
      router.back();
  }

  return (
    <div className="min-h-screen w-full bg-[#eff5fd] flex items-center justify-center p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-[1312px] lg:h-[784px]">
            
        {/* OTP Form Section - Full Height Panel */}
        <div className="order-2 lg:order-1 h-full w-full bg-white rounded-[40px] flex flex-col justify-center items-end text-right py-12 px-6 lg:px-20 xl:px-32 shadow-sm overflow-y-auto">
          <div className="w-full max-w-xl mx-auto lg:mr-auto lg:ml-0 space-y-10">
            
            <div className="space-y-4 w-full text-center">
               {/* Fixed Header: Check if user wants 'Verification' or just the helper text. Keeping consistent with previous request */}
              <p className="text-gray-500 text-lg lg:text-xl font-medium">أدخل رمز التحقق المرسل إليك</p>
            </div>

            <div className="flex gap-2 lg:gap-3 justify-end w-full" dir="ltr">
                {otp.map((value, index) => (
                <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => (inputsRef.current[index] = el)}
                    className="w-[45px] h-[45px] lg:w-[64px] lg:h-[64px] text-center text-base font-bold rounded-2xl border-2 border-[#F0F0F0] bg-white focus:border-[#579BE8] focus:ring-4 focus:ring-[#579BE8]/10 outline-none transition-all text-[#579BE8] shadow-sm hover:border-[#579BE8]/30"
                />
                ))}
            </div>

            <div className="w-full text-right space-y-2">
                 <p className="text-gray-500 font-medium">
                    تم ارسال رمز التحقق عبر الوتساب علي <span className="text-[#1A1A1A] font-bold" dir="ltr">+966 5xxxxxxxx</span> 
                    <button onClick={handleBack} className="text-[#579BE8] font-bold mr-2 hover:underline">
                         تغيير
                    </button>
                 </p>
                 <p className="text-gray-400 text-sm font-medium">
                    ارسال مره اخري {timer > 0 && <span className="text-[#579BE8]">({timer} ثانيه)</span>}
                 </p>
            </div>

            <div className="w-full flex flex-col gap-4 pt-4">
               <div className="">
                <Button
                    className="w-full h-[72px] bg-gradient-to-r from-[#579BE8] to-[#124987] hover:shadow-xl hover:-translate-y-1 text-white text-xl font-bold rounded-2xl shadow-lg shadow-[#579BE8]/20 active:scale-[0.98] transition-all duration-300"
                    onClick={handleVerify}
                >
                    تأكيد
                </Button>
               </div>
               <div className="">
                 <Button
                    variant="outline"
                    className="w-full h-[72px] border-2 bg-gray-50/50 text-[#579BE8] border-[#579BE8]/20 hover:bg-[#579BE8]/5 hover:text-[#579BE8] hover:border-[#579BE8]/40 rounded-2xl text-xl font-bold transition-all"
                    onClick={() => {}}
                >
                    ارسال عبر الرسائل النصية 
                </Button>
               </div>
            </div>

          </div>
        </div>

        {/* Image Section - Full Height Panel */}
        <div className="order-1 lg:order-2 w-full h-full relative rounded-[40px] overflow-hidden shadow-sm hidden lg:block">
             <Image 
                src="/images/car.png" 
                layout="fill"
                objectFit="cover"
                alt="OTP Visual"
                className="hover:scale-105 transition-transform duration-700"
             />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        </div>

      </div>
    </div>
  );
}
