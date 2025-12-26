"use client";

import React from "react";

export default function Deals() {
  const services = [
    {
      id: 1,
      title: "توصيل مجاني",
      subtitle: "للطلبات الكبيرة",
      gradient:
        "linear-gradient(237.22deg, #1C7C4B 6.99%, rgba(102, 102, 102, 0) 90.26%)",
      color: "#1C7C4B",
    },
    {
      id: 2,
      title: "دعم مخصص",
      subtitle: "24/7 للشركات",
      gradient:
        "linear-gradient(237.22deg, #579BE8 6.99%, rgba(102, 102, 102, 0) 90.26%)",
      color: "#579BE8",
    },
    {
      id: 3,
      title: "خصم 20%",
      subtitle: "للعقود السنوية",
      gradient:
        "linear-gradient(237.22deg, #B3000D 6.99%, rgba(102, 102, 102, 0) 90.26%)",
      color: "#B3000D",
     
    },
  ];

  return (
    <section className="w-full py-8 sm:py-10 md:py-12 lg:py-16 my-4 lg:my-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="font-cairo font-semibold text-2xl md:text-[28px] leading-[150%] sm:leading-[170%] text-[#579BE8] py-2 sm:py-3">
            <span>التعاقدات</span>
            <br />
            <span>
              عروض خاصة للأفراد والمؤسسات
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 justify-items-center">
          {services.map((service) => (
            <div
              key={service.id}
              className="w-full max-w-[320px] sm:max-w-[350px] md:max-w-[380px] h-[160px] sm:h-[170px] rounded-[20px] sm:rounded-[22px] md:rounded-[24px] p-[2px] sm:p-[2.5px] md:p-[3px] hover:scale-[1.02] transition-transform duration-300"
              style={{
                background: service.gradient,
              }}
            >
              <div className="w-full h-full bg-white rounded-[18px] sm:rounded-[20px] md:rounded-[21px] flex flex-col justify-center p-5 sm:p-6">
                <div className="w-full text-center mb-2">
                  <h3
                    className="font-cairo font-bold text-2xl sm:text-3xl md:text-[36px] xl:text-[40px] leading-[110%] mb-1"
                    style={{ color: service.color }}
                  >
                    {service.title}
                  </h3>
                </div>

                <div className="w-full text-center">
                  <p
                    className="font-cairo font-medium text-2xl  md:text-[30px]  leading-[130%]"
                    style={{ color: service.color }}
                  >
                    {service.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-10 md:mt-12">
          <button className="font-cairo font-[600] text-xl md:text-[24px] px-8 sm:px-12 py-3 sm:py-4 bg-linear-to-r cursor-pointer from-[#579BE8] to-[#315782] text-white rounded-xl hover:bg-[#4788d5] transition-colors duration-300 shadow-lg hover:shadow-xl">
            انتقل الي التعاقدات
          </button>
        </div>
      </div>
    </section>
  );
}
