"use client";
import React, { Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Phone, MessageCircle, Star } from "lucide-react";

function DriverProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const driverId = searchParams?.get("id") || "123";
  const name = searchParams?.get("name") || "محمد علي";
  const phone = searchParams?.get("phone") || "+966-5xxxxxxx";
  const rate = parseFloat(searchParams?.get("rate") || "4.6");
  const avatar = searchParams?.get("avatar") || "/images/driver.png";

  const openChat = () => {
    // إرسال حدث لفتح محادثة جديدة مع السائق
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('start-new-chat', {
        detail: { 
          participantId: driverId,
          participantName: name 
        }
      }));
    }
  };

  return (
    <main className="max-w-5xl mx-auto py-8 ">
      <div className="bg-white max-w-5xl mx-auto rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            <Image src={avatar} alt={name} width={96} height={96} className="object-cover" />
          </div>

          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">{name}</h1>

            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(rate) ? "text-yellow-400" : "text-gray-200"}`}
                  />
                ))}
              </div>

              <span className="text-sm text-gray-600">{rate.toFixed(1)} • تقييم السائق</span>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <a href={`tel:${phone}`} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Phone className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">{phone}</span>
              </a>

              <button onClick={openChat} className="ml-2 inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">دردشة</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DriverProfilePage() {
  return (
    <Suspense fallback={
      <main className="max-w-5xl mx-auto py-8">
        <div className="bg-white max-w-5xl mx-auto rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#579BE8]"></div>
            <span className="mr-3 text-gray-600">جاري التحميل...</span>
          </div>
        </div>
      </main>
    }>
      <DriverProfileContent />
    </Suspense>
  );
}
