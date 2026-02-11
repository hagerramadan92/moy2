"use client";

import Image from "next/image";
import React from "react";

export default function StaticSection({ data }) {
  const stats = [
    {
      label: "متوسط الربح اليومي",
      value: "650 ريال",
      progress: 75,
      progressColor: "#10B981"
    },
    {
      label: " متوسط عدد الطلبات اليومية لكل سائق",
      value: "8-12 طلب",
      progress: 90,
      progressBorder: "6.88px solid rgba(253, 147, 67, 1)"
    },
    // {
    //   label: "وقت استجابه الطلبات",
    //   value: "30 ثانيه",
    //   progress: 85,
    //   progressBorder: "6.88px solid rgba(207, 62, 185, 1)"
    // },
  ];

  // Extract benefits from API response
  const apiFeatures = data?.contents?.filter(c => c.key === 'benefit').map((c, index) => {
    const benefitData = c.value;
    // Map to default icons based on index
    const iconMap = ["/RS.png", "/time2.png", "/Vector (11).png"];
    return {
      icon: iconMap[index] || "/RS.png",
      title: benefitData.title || "",
      description: benefitData.description || "",
      bgColor: "#579BE8"
    };
  }) || [];

  // Default features if no data
  const defaultFeatures = [
    {
      icon: "/RS.png",
      title: "سريع وسهل",
      description: "واجهة بسيطة تسمح لك بإدارة طلباتك وتحديد أسعارك في ثوانٍ معدودة",
      bgColor: "#579BE8"
    },
    {
      icon: "/time2.png",
      title: "أرباح شفافة",
      description: "تتبع أرباحك بشكل لحظي مع إمكانية سحب أموالك في أي وقت",
      bgColor: "#579BE8"
    },
    {
      icon: "/Vector (11).png",
      title: "آمن وموثوق",
      description: "نظام دفع آمن 100% مع حماية كاملة لبياناتك المالية والشخصية",
      bgColor: "#579BE8"
    }
  ];

  const features = apiFeatures.length > 0 ? apiFeatures : defaultFeatures;

  return (
    <section className=" px-4 sm:px-6 lg:px-8 py-8 lg:py-12 my-4 lg:my-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12">
          
          {/* Features Section - First on mobile, first on desktop */}
          <div className="flex-1 w-full lg:w-auto order-1 mt-12">
            <div className=" mb-6 lg:mb-8">
              <div className="inline-block mb-2 md:mb-3">
                <span className="text-xs md:text-sm font-bold text-[#579BE8] bg-[#579BE8]/10 px-3 py-1.5 rounded-full">
                  منصة متكاملة
                </span>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-gray-900 mb-2 md:mb-3 leading-tight">
                <span className="block text-[#579BE8]">منصة شاملة لإدارة أعمالك</span>
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full"></div>
              <p className="font-cairo font-normal text-base lg:text-lg text-gray-700 leading-relaxed mt-2">
                تطبيق السائقين هو خيارك الانسب لتحويل صهريجك  لمصدر دخل مضمون ومجزي.<br />
                نربطك بآلاف العملاء اللي يبون  خدمتك يومياً في جميع أنحاء المملكة.
              </p>
            </div>

            <div className="space-y-4 lg:space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-row items-center gap-3 lg:gap-4 group">
                  <div 
                    className="flex-shrink-0 w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl shadow-lg flex items-center justify-center bg-gradient-to-br from-[#579BE8] to-[#315782] group-hover:scale-110 transition-transform duration-300"
                    style={{
                      boxShadow: '0px 4px 12px rgba(87, 155, 232, 0.3), 0px 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {feature.icon === "/Vector (14).png" ? (
                      <div 
                        className="relative w-5 h-5 lg:w-7 lg:h-7 flex items-center justify-center"
                        style={{
                          border: '1.45px solid #FFFFFF',
                          borderRadius: '4px'
                        }}
                      >
                        <Image
                          src={feature.icon}
                          alt={feature.title}
                          width={18}
                          height={30}
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="relative w-5 h-5 lg:w-7 lg:h-7">
                        <Image
                          src={feature.icon}
                          alt={feature.title}
                          fill
                          className="filter brightness-0 invert object-contain"
                          sizes="(max-width: 1024px) 20px, 28px"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-right">
                    <h3 className="font-cairo font-semibold text-lg lg:text-2xl text-[#579BE8] mb-1 lg:mb-2">
                      {feature.title}
                    </h3>
                    <p className="font-cairo font-normal text-lg lg:text-base text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Card - Second on mobile, second on desktop */}
          <div className="w-full lg:w-[460px] rounded-2xl lg:rounded-3xl border border-blue-200/50 p-4 lg:p-6 flex flex-col order-2 lg:mt-0"
            style={{
              background: 'rgba(227, 240, 254, 0.07)',
              boxShadow: '0px 0px 16px 0px rgba(87, 155, 232, 0.25)',
            }}
          >
            <div className="text-right mb-4 lg:mb-6">
              <h3 className="font-cairo font-semibold text-xl lg:text-2xl text-[#579BE8]">
                احصائيات مميزه
              </h3>
            </div>

            <div className="space-y-3 lg:space-y-4 mb-4 lg:mb-6">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="rounded-xl lg:rounded-2xl p-3 lg:p-4 flex flex-col justify-between"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    boxShadow: '0px 1px 4px 0px rgba(87, 155, 232, 0.25)',
                  }}
                >
                  <div className="flex justify-between items-center mb-2 lg:mb-3">
                    <span className="font-cairo font-normal text-xs lg:text-sm text-black text-right">
                      {stat.label}
                    </span>
                    <span className="font-cairo font-normal text-base lg:text-xl text-black">
                      {stat.value}
                    </span>
                  </div>

                  <div className="w-full h-1.5 lg:h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{
                        width: `${stat.progress}%`,
                        backgroundColor: index === 0 ? stat.progressColor : 'transparent',
                        border: stat.progressBorder || 'none'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-1  border border-gray-200/60 rounded-xl p-3">
              <p className="font-cairo font-normal text-xs  
              text-gray-600/60 text-center leading-relaxed">
                هذه الاحصائيات مبنيه علي متوسط اداء السائقين النشطين<br />
                خلال اخر 3 اشهر
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}