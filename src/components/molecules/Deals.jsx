"use client";

import React from "react";

export default function Deals() {
  const services = [
    {
      id: 1,
      title: "توصيل مجاني\nللطلبات الكبيرة",

      gradient:
        "linear-gradient(237.22deg, #1C7C4B 6.99%, rgba(102, 102, 102, 0) 90.26%)",
      color: "#1C7C4B",
    },
    {
      id: 2,
      title: " دعم مخصص\n24/7 للشركات",

      gradient:
        "linear-gradient(237.22deg, #579BE8 6.99%, rgba(102, 102, 102, 0) 90.26%)",
      color: "#579BE8",
    },
    {
      id: 3,
      title: "خصم 20%\nللعقود السنوية",

      gradient:
        "linear-gradient(237.22deg, #B3000D 6.99%, rgba(102, 102, 102, 0) 90.26%)",
      color: "#B3000D",
    },
  ];

  return (
    <section className="w-full py-8 sm:py-10 md:py-12 lg:py-16 my-4 lg:my-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="font-cairo font-semibold text-xl sm:text-2xl md:text-[28px] leading-[150%] sm:leading-[170%] text-[#579BE8] py-2 sm:py-3">
            التعاقدات عروض خاصة للافراد والمؤسسات
          </h2>
        </div>

        {/* Services Cards Container */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 sm:gap-8 lg:gap-12">
          {services.map((service) => (
            <div
              key={service.id}
              className="w-full max-w-[320px] sm:max-w-[350px] md:max-w-[380px] h-[138px]  rounded-[20px] sm:rounded-[22px] md:rounded-[24px] p-[2px] sm:p-[2.5px] md:p-[3px]"
              style={{
                background: service.gradient,
              }}
            >
              {/* Card Content */}
              <div className="w-full h-full bg-white rounded-[18px] sm:rounded-[20px] md:rounded-[21px] flex flex-col p-4 ">
                {/* Title */}
                <div className="w-full text-right mb-3 sm:mb-4">
                  <h3
                    className="font-cairo font-semibold text-xl sm:text-2xl md:text-[30px] leading-[140%] sm:leading-[150%] md:leading-[170%] mt-1 sm:mt-10 md:mt-2"
                    style={{ color: service.color }}
                  >
                    {service.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
