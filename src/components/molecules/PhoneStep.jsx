"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function PhoneStep({ onNext }) {
  return (
    <div className="space-y-6 text-right">
      <h2 className="text-[27.5px] font-bold text-center">مرحبًا بك</h2>
      <p className="text-[#00000080] text-center text-[23px]">سجل دخولك للاستمرار</p>
      <label className="text-right">رقم الجوال</label>
      <div className="relative text-[22px]">
        <Image src="/images/phone-icon.png" alt="Phone Icon" width={79} height={31} className="w-[65.45px] h-[31px] absolute top-6 left-2" />
          <Input
        placeholder="0576783729"
        className="text-left mt-2 pl-19 input-override text-[#579BE8] h-[64px]"
      />
      </div>
    
       
      <Button
      className="w-full border-[#579BE8] text-white bg-[#579BE8] text-[18px] py-7 hover:bg-[#4893f5] cursor-pointer"
        onClick={onNext}
      >
        تأكيد
      </Button>
    </div>
  );
}
