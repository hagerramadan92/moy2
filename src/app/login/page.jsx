"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    
    // Saudi phone validation: Starts with 05 and followed by 8 digits (Total 10)
    const regex = /^05\d{8}$/;
    if (regex.test(value)) {
      setError("");
      router.push("/otp");
    } else {
        if (value.length >= 10 && !regex.test(value)) {
             setError("يرجى إدخال رقم جوال صحيح (يبدأ بـ 05 ويتكون من 10 أرقام)");
        } else {
            setError("");
        }
    }
  };

  const handleNext = () => {
    const regex = /^05\d{8}$/;
    if (regex.test(phoneNumber)) {
      router.push("/otp");
    } else {
      setError("يرجى إدخال رقم جوال صحيح (يبدأ بـ 05 ويتكون من 10 أرقام)");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#eff5fd] flex items-center justify-center p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-[1312px] lg:h-[784px]">
          
        {/* Form Section - Full Height Panel */}
        <div className="order-2 lg:order-1 h-full w-full bg-white rounded-[40px] flex flex-col justify-center items-end text-right py-12 px-6 lg:px-20 xl:px-32 shadow-sm overflow-y-auto">
            <div className="w-full max-w-xl mx-auto lg:mr-auto lg:ml-0 space-y-10">
                <div className="space-y-3 w-full text-center">
                    <h2 className="text-xl lg:text-4xl font-bold text-[#1A1A1A] tracking-tight">مرحبًا بك</h2>
                    <p className="text-gray-500 text-lg lg:text-xl font-medium">سجل دخولك للاستمرار </p>
                </div>

                <div className="space-y-6 w-full">
                    <label className="block text-lg font-bold text-[#1A1A1A] mr-1">رقم الجوال</label>
                    <div className="relative group w-full">
                        <div className="absolute top-1/2 -translate-y-1/2 left-5 w-[60px] h-[30px] opacity-100">
                            <Image
                                src="/images/phone-icon.png"
                                alt="Phone Icon"
                                width={79}
                                height={31}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <Input
                            placeholder="05xxxxxxxx"
                            dir="ltr"
                            value={phoneNumber}
                            onChange={handleChange}
                            className={`text-left pl-24 h-[72px] text-[1rem] tracking-widest font-bold text-[#579BE8] bg-white border-2 ${error ? "border-red-400 focus:border-red-500" : "border-[#F0F0F0] focus:border-[#579BE8]"} focus:ring-4 focus:ring-[#579BE8]/10  focus:shadow-xl focus:shadow-[#579BE8]/20 rounded-2xl transition-all placeholder:text-gray-300 shadow-sm`}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm font-medium pr-1">{error}</p>}
                </div>

                <div className="w-full pt-4">
                    <p className="text-gray-400 text-sm mb-4 text-center lg:text-right font-medium">
                        سنرسل لك رمز التحقق عبر الوتساب
                    </p>
                    <Button
                        className={`w-full h-[72px] bg-gradient-to-r from-[#579BE8] to-[#124987] hover:shadow-xl hover:-translate-y-1 text-white text-xl font-bold rounded-2xl shadow-lg shadow-[#579BE8]/20 active:scale-[0.98] transition-all duration-300 ${!phoneNumber ? "opacity-70" : ""}`}
                        onClick={handleNext}
                    >
                        متابعة
                    </Button>
                </div>
            </div>
        </div>

        {/* Image Section - Full Height Panel */}
        <div className="order-1 lg:order-2 w-full h-full relative rounded-[40px] overflow-hidden shadow-sm hidden lg:block">
             <Image 
                src="/images/car.png" 
                layout="fill"
                objectFit="cover"
                alt="Login Visual"
                className="hover:scale-105 transition-transform duration-700"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        </div>

      </div>
    </div>
  );
}