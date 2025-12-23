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
    <div className="space-y-6">
      <div className="flex justify-start" dir="ltr">
        <Button
          variant="outline"
          onClick={onSkip}
          className="flex items-center gap-2 border-0 text-blue-500 "
        >
          <MdArrowBackIos  /> تخطي
        </Button>
      </div>

      <div className="relative w-32 h-32 rounded-full  mx-auto bg-gray-300">
        <label className="absolute bottom-0 right-0   w-[32px] h-[32px] rounded-full flex items-center justify-center text-[#579BE8] text-xl cursor-pointer ">
          <FaCirclePlus  className="bg-white rounded-full w-[32px] h-[32px]" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />
        </label>
       
      </div>
       <p className="text-[#579BE8]">اضافه صوره شخصيه</p>
       <label htmlFor="name" className="flex items-start mb-0 text-[#579BE8]">الاسم</label>
      <Input placeholder="الاسم الكامل" className=" mt-2 input-override text-[#579BE8] h-[64px]" />
      <div className="flex gap-3">
        <Button  className="w-full border-[#579BE8] text-white bg-[#579BE8] text-[18px] py-7 hover:bg-[#4893f5] cursor-pointer" onClick={onNext}>
          تأكيد
        </Button>
      </div>
    </div>
  );
}
