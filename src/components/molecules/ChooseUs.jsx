import React from "react";
import { HiArrowTrendingDown } from "react-icons/hi2";
import { BsLightningCharge } from "react-icons/bs";
import { FiHeadphones } from "react-icons/fi";
import { MdOutlineLocalPolice } from "react-icons/md";

export default function ChooseUs() {
  return (
    <section className="py-16 md:py-24 px-4 bg-white relative overflow-hidden">
      {/* Subtle Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-cyan-50/50 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10 w-full">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl lg:text-[36px] font-bold text-[#579BE8] mb-4">
            ليش تختارنا ؟
          </h2>
          <p className="text-gray-500 text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed">
            نوفر لك أفضل تجربة طلب وتوصيل مياه بأحدث التقنيات وأعلى معايير الجودة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-16 gap-x-8 lg:gap-8 pt-12">
          <Card
            icon={<HiArrowTrendingDown className="w-10 h-10 md:w-12 md:h-12" />}
            title="أسعار تنافسية"
            desc="نضمن لك أفضل الأسعار في السوق مع عروض حصرية ومتجددة تناسب كافة احتياجاتك اليومية."
            gradient="from-[#9CC6F4] to-[#4787D0]"
            shadowColor="shadow-blue-200"
          />

          <Card
            icon={<BsLightningCharge className="w-10 h-10 md:w-12 md:h-12" />}
            title="سرعة في التنفيذ"
            desc="شبكة توصيل ذكية وسريعة تضمن وصول طلبك في الوقت المحدد وبأعلى كفاءة ممكنة."
            gradient="from-[#E5BD8A] to-[#D57B06]"
            shadowColor="shadow-amber-200"
          />

          <Card
            icon={<MdOutlineLocalPolice className="w-10 h-10 md:w-12 md:h-12" />}
            title="موثوقية وأمان"
            desc="جميع السائقين معتمدين وموثقين لضمان خدمة آمنة واحترافية لك ولعائلتك."
            gradient="from-[#68E62E] to-[#348C0B]"
            shadowColor="shadow-green-200"
          />

          <Card
            icon={<FiHeadphones className="w-10 h-10 md:w-12 md:h-12" />}
            title="دعم فني"
            desc="فريق دعم متواجد على مدار الساعة للإجابة على استفساراتك وخدمتك في أي وقت."
            gradient="from-[#E0AAF0] to-[#B508E9]"
            shadowColor="shadow-purple-200"
          />
        </div>
      </div>
    </section>
  );
}

/* ===== Card Component ===== */
function Card({ icon, title, desc, gradient, shadowColor }) {
  return (
    <div
      className="group relative bg-white rounded-[32px]
                 px-8 pt-16 pb-10
                 text-center w-full
                 border border-gray-100
                 shadow-[0_8px_30px_rgb(0,0,0,0.04)]
                 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]
                 transition-all duration-300 hover:-translate-y-2"
    >
      <div
        className={`absolute -top-10 left-1/2 -translate-x-1/2
                    w-20 h-20 md:w-24 md:h-24
                    flex items-center justify-center
                    rounded-[24px]
                    bg-gradient-to-b ${gradient}
                    text-white shadow-xl ${shadowColor}
                    group-hover:scale-110 transition-transform duration-300 ease-out`}
      >
        <div className="brightness-110 drop-shadow-md">
           {icon}
        </div>
      </div>

      <h3 className="font-bold text-xl md:text-2xl text-gray-900 mt-6 mb-4">
        {title}
      </h3>
      <p className="text-gray-500 text-base md:text-[17px] leading-relaxed">
        {desc}
      </p>
    </div>
  );
}