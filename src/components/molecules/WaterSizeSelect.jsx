"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WaterSizeSelect({ value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange} dir="rtl">
      <SelectTrigger
        className="
          w-full h-14 rounded-xl border border-[#D1E3FA] bg-white px-4 
          focus:ring-2 focus:ring-[#579BE8] 
          data-placeholder:border-[#D1E3FA] 
          data-placeholder:text-gray-400
          data-value:border-[#579BE8] 
          data-value:text-[#000000]
          text-right flex items-center
          text-[16px] p-6
          
        "
      >
        <SelectValue placeholder="اختر حجم المويه" className="h-full flex items-center text-[16px] " />
      </SelectTrigger>

      <SelectContent className="text-right">
        <SelectItem value="6" className="text-[16px] py-2">6 طن</SelectItem>
        <SelectItem value="10" className="text-[16px] py-2">10 طن</SelectItem>
      </SelectContent>
    </Select>
  );
}
