"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WaterTypeSelect({ value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange} dir="rtl">
      <SelectTrigger
        className="
          w-full h-6
          rounded-xl border border-[#D1E3FA] bg-white px-4
          focus:ring-2 focus:ring-[#579BE8]
          text-right
          flex items-center
          text-[16px] p-6
        "
      >
        <SelectValue 
          placeholder="اختر نوع المويه"
          className="text-[16px] h-full flex items-center"
        />
      </SelectTrigger>
 
      <SelectContent className="text-right">
        <SelectItem className="text-[16px] py-2" value="drinkable">
          صالحة للشرب
        </SelectItem>
        <SelectItem className="text-[16px] py-2" value="not-drinkable">
          غير صالحة للشرب
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
