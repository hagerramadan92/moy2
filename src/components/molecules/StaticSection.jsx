"use client";

import Image from "next/image";
import React from "react";

export default function StaticSection() {
  const stats = [
    {
      label: "متوسط الربح اليومي",
      value: "650 ريال",
      progress: 75,
      progressColor: "#10B981"
    },
    {
      label: "متوسط عدد الطلبات اليوميه",
      value: "8-12 طلب",
      progress: 90,
      progressBorder: "6.88px solid rgba(253, 147, 67, 1)"
    },
    {
      label: "وقت استحابه الطلبات",
      value: "30 ثانيه",
      progress: 85,
      progressBorder: "6.88px solid rgba(207, 62, 185, 1)"
    },
  ];

  const features = [
    {
      icon: "/Vector (1).png",
      title: "سريع وسهل",
      description: "واجهة بسيطة تسمح لك بإدارة طلباتك وتحديد أسعارك في ثوانٍ معدودة",
      gradient: "bg-gradient-to-br from-[#3B5AF1] to-[#05ABE0]"
    },
    {
      icon: "/Vector (2).png",
      title: "أرباح شفافة",
      description: "تتبع أرباحك بشكل لحظي مع إمكانية سحب أموالك في أي وقت",
      gradient: "bg-gradient-to-br from-[#69111E] to-[#4150F1]"
    },
    {
      icon: "/Vector (3).png",
      title: "آمن وموثوق",
      description: "نظام دفع آمن 100% مع حماية كاملة لبياناتك المالية والشخصية",
      gradient: "bg-gradient-to-br from-[#33E289] to-[#1C7C4B]"
    }
  ];

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12 my-4 lg:my-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
          
          {/* Left Section - Features */}
          <div className="flex-1 w-full lg:w-auto order-2 lg:order-1">
            <div className="text-right mb-6 lg:mb-8">
              <h2 className="font-cairo font-semibold text-2xl lg:text-3xl text-[#579BE8] mb-3 lg:mb-4">
                منصة شاملة لإدارة أعمالك
              </h2>
              <p className="font-cairo font-normal text-base lg:text-lg text-black leading-relaxed">
                تطبيق السائقين هو حلّك الكامل لتحويل صهريج المياه الخاص بك إلى مصدر دخل مستقر
                ومجزي. نربطك بآلاف العملاء الذين يحتاجون لخدماتك يومياً في جميع أنحاء المملكة.
              </p>
            </div>

            <div className="space-y-4 lg:space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-row items-center gap-3 lg:gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 lg:w-[70px] lg:h-[70px] rounded-xl lg:rounded-2xl shadow-md flex items-center justify-center ${feature.gradient}`}>
                    <div className="relative w-6 h-6 lg:w-[35px] lg:h-[35px]">
                      <Image
                        src={feature.icon}
                        alt={feature.title}
                        fill
                        className="filter brightness-0 invert"
                        sizes="(max-width: 1024px) 24px, 35px"
                      />
                    </div>
                  </div>

                  <div className="flex-1 text-right">
                    <h3 className="font-cairo font-semibold text-lg lg:text-2xl text-[#579BE8] mb-1 lg:mb-2">
                      {feature.title}
                    </h3>
                    <p className="font-cairo font-normal text-sm lg:text-base text-black">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Stats Card */}
          <div className="w-full lg:w-[480px] rounded-2xl lg:rounded-3xl border border-blue-200/50 p-4 lg:p-8 flex flex-col order-1 lg:order-2 mb-6 lg:mb-0"
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
                  className="rounded-xl lg:rounded-2xl p-3 lg:p-5 flex flex-col justify-between"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    boxShadow: '0px 1px 4px 0px rgba(87, 155, 232, 0.25)',
                  }}
                >
                  <div className="flex justify-between items-center mb-2 lg:mb-3">
                    <span className="font-cairo font-normal text-xs lg:text-sm text-black text-right">
                      {stat.label}
                    </span>
                    <span className="font-cairo font-normal text-base lg:text-2xl text-black">
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

            <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-blue-100/50">
              <p className="font-cairo font-normal text-xs lg:text-sm text-black text-center">
                هذه الاحصائيات مبنيه علي متوسط اداء السائقين النشطين خلال اخر 3 اشهر
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
