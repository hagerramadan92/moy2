"use client";

import Image from "next/image";
import React from "react";
import WaterTypeSelect from "./WaterTypeSelect";
import WaterSizeSelect from "./WaterSizeSelect";

export default function HomeCover() {
  const [waterType, setWaterType] = React.useState("");
  const [waterSize, setWaterSize] = React.useState("");

  return (
    <div className="cover relative">
      <div className="start_container grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="content-right">
          <h1>اسرع خدمة توصيل في الممكلة</h1>
          <p className="desc">
            حدد الكمية والموقع واستقبل عروض الأسعار من السواقين فورا
          </p>
         <div className="flex flex-col sm:flex-row items-center gap-4 mt-5">
            {/* Google Play */}
            <button className="flex items-center gap-3 px-4 py-2 rounded-xl border cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] w-full sm:w-auto text-white border-[#94c5f8] bg-gradient-to-r from-[#579BE8] to-[#124987]">
              <div className="text-left text-[14px]">
                <p>Download on</p>
                <p className="text-center">Google Play</p>
              </div>
              <Image
                src="/images/Playstore.png"
                width={28}
                height={34}
                alt="Google Play"
              />
            </button>

            {/* App Store */}
            <button className="flex items-center gap-3 px-4 py-2 rounded-xl border shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] w-full sm:w-auto text-white border-[#94c5f8] bg-gradient-to-r from-[#579BE8] to-[#124987]">
              <div className="text-left text-[14px]">
                <p>Download on</p>
                <p className="text-center">App Store</p>
              </div>
              <Image
                src="/images/app.png"
                width={28}
                height={34}
                alt="App Store"
              />
            </button>
          </div>
        </div>

        <div className="form-left content-left rounded-[26px] border-[#FFFFFF26] border-[32.5px] shadow">
          <div className="bg-[#FFFFFF26] h-full">
            <form className="bg-[#EFF5FD] px-7 py-8 rounded-3xl flex flex-col gap-4 shadow-md max-w-md mx-auto h-125.75 justify-center">
              <h2 className="text-center text-[24px] font-semibold text-[#579BE8] mb-2">
                اختر اللي يناسبك
              </h2>

              <label className="text-[#579BE8] text-[12px]">اختر نوع المويه</label>
              <WaterTypeSelect value={waterType} onChange={setWaterType} />
              <div></div>
              <label className="text-[#579BE8] text-[12px]">اختر حجم المويه</label>
              <WaterSizeSelect value={waterSize} onChange={setWaterSize} />

              <button
                type="submit"
                className=" mt-4 w-full
                 md:w-[350x] h-15.25 
                 py-3 rounded-xl
                  text-white
                   font-semibold bg-gradient-to-r from-[#579BE8] to-[#124987] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] mt-7"
              >
                ابدأ الطلب
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
