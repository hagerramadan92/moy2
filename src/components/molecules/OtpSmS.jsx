"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRef, useState } from "react";

export default function OtpStep({ onNext }) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;

    if (/^\d$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (index < inputsRef.current.length - 1) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };
  return (
    <div className="space-y-6">
       <h2 className="text-[27.5px] font-bold text-center">مرحبًا بك</h2>
      <p className="text-[#00000080] text-center text-[23px]">سجل دخولك للاستمرار</p>
      <p className="text-sm  text-[#579BE8]">
             تم ارسال رمز الOTP عبر SMS
      </p>

      <div className="flex gap-2 justify-center">
        {otp.map((value, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            value={value}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => (inputsRef.current[index] = el)}
            className="w-[80px] h-[70px] text-center text-xl border rounded-md border-[#579BE8]"
          />
        ))}
      </div>
      <div className="flex flex-col items-start text-[10px] text-[#808080CF]">
      <Link href="#">ارسال عبر Whatsapp </Link>
      <Link href="#">اعاده الارسال</Link>
      </div>

      <Button className="w-full border-[#579BE8] text-white bg-[#579BE8] text-[18px] py-7 hover:bg-[#4893f5] cursor-pointer"  onClick={onNext}>
        تأكيد
      </Button>
    </div>
  );
}
