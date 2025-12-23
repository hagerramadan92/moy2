import React from "react";
import { HiArrowTrendingDown } from "react-icons/hi2";
import { BsLightningCharge } from "react-icons/bs";
import { FiHeadphones } from "react-icons/fi";
import { MdOutlineLocalPolice } from "react-icons/md";

export default function ChooseUs() {
  return (
    <section className="py-8 sm:py-10 md:py-14 px-4 sm:px-6 lg:px-[4%] xl:px-[2%] bg-white">
      <div className="text-center mb-12 sm:mb-16 md:mb-21">
        <h2 className="text-[28px] sm:text-[32px] md:text-[36px] font-bold text-[#579BE8]">
          ليش تختارنا
        </h2>
        <p className="text-gray-500 mt-2 text-[18px] sm:text-[20px] md:text-[24px] max-w-2xl mx-auto px-4">
          نوفر لك أفضل تجربة طلب وتوصيل مياه بأحدث التقنيات
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 mb-4 xl:grid-cols-4 lg:grid-cols-3 
       md:grid-cols-2 gap-12 sm:gap-12 lg:gap-12 w-full">
        <Card
          icon={
            <HiArrowTrendingDown className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
          }
          title="أسعار تنافسية"
          desc="أفضل الأسعار من عروض متعددة"
          gradient="from-[#9CC6F4] to-[#4787D0]"
        />

        <Card
          icon={<BsLightningCharge className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />}
          title="سرعة في التنفيذ"
          desc="توصيل سريع بأفضل وقت ممكن"
          gradient="from-[#E5BD8A] to-[#D57B06]"
        />

        <Card
          icon={<MdOutlineLocalPolice className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />}
          title="موثوقية وأمان"
          desc="سواقين معتمدين وخدمة مضمونة"
          gradient="from-[#68E62E] to-[#348C0B]"
        />

        <Card
          icon={<FiHeadphones className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />}
          title="دعم فني"
          desc="دعم متواصل على مدار الساعة"
          gradient="from-[#E0AAF0] to-[#B508E9]"
        />
      </div>
    </section>
  );
}

/* ===== Card Component ===== */
function Card({ icon, title, desc, gradient }) {
  return (
    <div
      className="relative bg-white rounded-xl sm:rounded-2xl
                 px-6 sm:px-8 md:px-10 lg:px-12 
                 pt-12 sm:pt-14 md:pt-16 
                 pb-8 sm:pb-10 md:pb-12 
                 text-center w-full
                 shadow-md hover:shadow-xl
                 transition-all duration-300 hover:-translate-y-1"
    >
      <div
        className={`absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2
                    w-16 h-16 sm:w-20 sm:h-20 md:w-25 md:h-24 
                    flex items-center justify-center
                    rounded-lg sm:rounded-xl 
                    bg-gradient-to-r ${gradient}
                    text-white shadow-lg`}
      >
        {icon}
      </div>

      <h3 className="font-semibold text-[20px] sm:text-[22px] md:text-[24px] lg:text-[27.35px] mt-4 sm:mt-2">
        {title}
      </h3>
      <p className="text-[#7A7E80] text-[14px] sm:text-[16px] md:text-[18px] mt-4 sm:mt-6 md:mt-7.5">
        {desc}
      </p>
    </div>
  );
}