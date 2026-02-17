"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPhoneAlt, FaWater, FaChevronLeft, FaWhatsapp, FaSms } from "react-icons/fa";
import { motion } from "framer-motion";
import { IoWaterOutline } from "react-icons/io5";
import { IoIosWater } from "react-icons/io";
import Link from "next/link";

const SAUDI_ARABIA = {
  key: "SA",
  nameAr: "السعودية",
  dialCode: "+966",
  phone: { min: 9, max: 9, regex: /^5\d{8}$/ },
  placeholder: "5xxxxxxxx",
  flag: "🇸🇦"
};

function digitsOnly(v) {
  return (v || "").replace(/\D/g, "");
}

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpMethod, setOtpMethod] = useState("whatsapp"); // القيمة الافتراضية
  const router = useRouter();

  const countryCode = SAUDI_ARABIA.dialCode;
  const countryName = SAUDI_ARABIA.nameAr;

  const validatePhone = (rawDigits, country) => {
    const value = digitsOnly(rawDigits);

    if (!value) return "يرجى إدخال رقم جوال صحيح";

    if (value.length < country.phone.min || value.length > country.phone.max) {
      if (country.phone.min === country.phone.max) {
        return `رقم الجوال يجب أن يكون ${country.phone.min} رقمًا`;
      }
      return `رقم الجوال يجب أن يكون بين ${country.phone.min} و ${country.phone.max} رقمًا`;
    }

    if (
      value.length === country.phone.max &&
      country.phone.regex &&
      !country.phone.regex.test(value)
    ) {
      return "يرجى إدخال رقم جوال سعودي صحيح (يبدأ بـ 5)";
    }

    return "";
  };

  const handlePhoneChange = (e) => {
    const value = digitsOnly(e.target.value);
    setPhoneNumber(value);

    const msg = validatePhone(value, SAUDI_ARABIA);
    if (value.length > 0) setError(msg);
    else setError("");
  };

  const handleNext = async () => {
    const msg = validatePhone(phoneNumber, SAUDI_ARABIA);
    if (msg) {
      setError(msg);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          country_code: countryCode,
          phone_number: phoneNumber,
          otp_method: otpMethod, // إرسال طريقة OTP المختارة
        }),
      });

      const data = await response.json();

      if (response.ok && data.status) {
        sessionStorage.setItem(
          "otpData",
          JSON.stringify({
            phone: data.data.phone,
            method: data.data.method,
            otp: data.data.otp,
            countryCode,
            phoneNumber,
            otpMethod: otpMethod, // حفظ طريقة OTP
          })
        );

        router.push("/otp");
      } else {
        setError(data.message || "فشل إرسال رمز التحقق. يرجى المحاولة مرة أخرى");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("حدث خطأ أثناء إرسال رمز التحقق. يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const isValidPhone = useMemo(() => {
    const msg = validatePhone(phoneNumber, SAUDI_ARABIA);
    return !msg;
  }, [phoneNumber]);

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
      {/* Animated Water Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D0E8FF] via-[#E0F2FF] to-[#C8E5FF] overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-10 sm:right-20 w-24 h-24 sm:w-32 sm:h-32 bg-[#579BE8]/10 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-20 sm:bottom-40 left-10 sm:left-32 w-32 h-32 sm:w-48 sm:h-48 bg-[#579BE8]/8 rounded-full blur-2xl sm:blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -15, 0], scale: [1, 1.15, 1] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute top-1/2 left-1/4 w-28 h-28 sm:w-40 sm:h-40 bg-[#579BE8]/12 rounded-full blur-xl sm:blur-2xl"
        />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#D0E8FF]/8 via-transparent to-transparent" />
      </div>

      {/* Decorative Water Icons - Responsive */}
      <div className="absolute top-5 right-5 sm:top-10 sm:right-10 text-[#579BE8]/15">
        <IoWaterOutline size={80} className="rotate-12 sm:w-28 sm:h-28" />
      </div>
      <div className="absolute bottom-5 left-5 sm:bottom-10 sm:left-10 text-[#579BE8]/15">
        <FaWater size={60} className="-rotate-12 sm:w-20 sm:h-20" />
      </div>
      <div className="absolute top-1/2 right-1/4 text-[#579BE8]/10 hidden sm:block">
        <IoWaterOutline size={120} className="rotate-45 sm:w-48 sm:h-48" />
      </div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
      >
        <div
          className={`bg-white/95 backdrop-blur-xl sm:backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-white/20 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8 transition-all duration-500 ${
            isValidPhone ? "ring-1 sm:ring-2 ring-[#579BE8]/30 shadow-[#579BE8]/20" : ""
          }`}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-3 sm:space-y-4"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#124987] shadow-md sm:shadow-lg shadow-[#579BE8]/30 mb-2 sm:mb-3 md:mb-4 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <FaWater className="text-white text-xl sm:text-2xl md:text-3xl relative z-10" />
            </motion.div>
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[#579BE8] to-[#124987] bg-clip-text text-transparent">
                مرحبًا بك
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium flex items-center justify-center gap-1 sm:gap-2">
                <span className="text-[#579BE8]">
                  <IoIosWater className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
                <span className="text-xs sm:text-sm md:text-base">سجل دخولك للاستمرار في طلب المياه</span>
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="space-y-3">
              {/* Country Display - Fixed Saudi Arabia */}
              <div className="flex gap-1">
                <div className="">
                  <div className="flex items-center justify-center sm:justify-start bg-gradient-to-br from-gray-50 to-white border-2 border-[#579BE8]/30 rounded-xl px-4 py-3 h-[55px] shadow-md">
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm sm:text-base font-bold text-[#579BE8]">{SAUDI_ARABIA.dialCode}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone input */}
                <div className="relative flex-1">
                  <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                    <FaPhoneAlt className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  <Input
                    placeholder={SAUDI_ARABIA.placeholder}
                    dir="ltr"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    disabled={loading}
                    className={`w-full h-[55px] pr-10 sm:pr-12 pl-4 text-right bg-gradient-to-br from-gray-50 to-white border-2 rounded-xl font-bold text-[#579BE8] tracking-wider sm:tracking-widest shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base ${
                      error
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                        : isValidPhone
                        ? "border-[#579BE8] shadow-[#579BE8]/20 focus:border-[#579BE8] focus:ring-[#579BE8]/20"
                        : "border-gray-200 focus:border-[#579BE8] focus:ring-[#579BE8]/20"
                    } focus:ring-2 sm:focus:ring-4 focus:bg-white placeholder:text-gray-400 placeholder:text-sm sm:placeholder:text-base ${
                      loading ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    inputMode="numeric"
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-xs sm:text-sm font-medium flex items-center gap-1 bg-red-50 px-3 py-2 rounded-lg border border-red-200"
                >
                  <span>⚠</span>
                  {error}
                </motion.p>
              )}
            </div>

            {/* OTP Method Selection */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-2"
            >
              <p className="text-xs sm:text-sm text-gray-600 text-center font-medium">
                اختر طريقة إرسال رمز التحقق
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                {/* WhatsApp Option */}
                <motion.button
                  type="button"
                  onClick={() => setOtpMethod("whatsapp")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 ${
                    otpMethod === "whatsapp"
                      ? "border-[#25D366] bg-gradient-to-r from-[#25D366]/10 to-[#128C7E]/10 shadow-[#25D366]/20 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-gradient-to-br from-gray-50 to-white"
                  }`}
                >
                  <FaWhatsapp className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    otpMethod === "whatsapp" ? "text-[#25D366]" : "text-gray-700"
                  }`} />
                  <span className={`font-medium text-xs sm:text-sm ${
                    otpMethod === "whatsapp" ? "text-[#25D366]" : "text-gray-700"
                  }`}>
                    واتساب
                  </span>
                </motion.button>

                {/* SMS Option */}
                <motion.button
                  type="button"
                  onClick={() => setOtpMethod("sms")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 ${
                    otpMethod === "sms"
                      ? "border-[#579BE8] bg-gradient-to-r from-[#579BE8]/10 to-[#124987]/10 shadow-[#579BE8]/20 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-gradient-to-br from-gray-50 to-white"
                  }`}
                >
                  <FaSms className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    otpMethod === "sms" ? "text-[#579BE8]" : "text-gray-700"
                  }`} />
                  <span className={`font-medium text-xs sm:text-sm ${
                    otpMethod === "sms" ? "text-[#579BE8]" : "text-gray-700"
                  }`}>
                    رسالة نصية
                  </span>
                </motion.button>
              </div>

              {/* Method Info */}
              <div className="bg-gradient-to-r from-[#579BE8]/5 to-[#124987]/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#579BE8]/10">
                <p className="text-xs sm:text-sm text-gray-600 text-center font-medium flex items-center justify-center gap-1 sm:gap-2">
                  <span className={`text-base sm:text-lg ${
                    otpMethod === "whatsapp" ? "text-[#25D366]" : "text-[#579BE8]"
                  }`}>
                    {otpMethod === "whatsapp" ? "💬" : "📱"}
                  </span>
                  <span>
                    {otpMethod === "whatsapp" 
                      ? "سنرسل لك رمز التحقق عبر الواتساب" 
                      : "سنرسل لك رمز التحقق عبر الرسائل النصية"}
                  </span>
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3 sm:space-y-4"
            >
              <motion.div
                whileHover={{ scale: isValidPhone ? 1.02 : 1 }}
                whileTap={{ scale: isValidPhone ? 0.98 : 1 }}
              >
                <Button
                  onClick={handleNext}
                  disabled={!isValidPhone || loading}
                  className={`w-full h-11 sm:h-12 md:h-14 bg-gradient-to-r from-[#579BE8] via-[#579BE8] to-[#124987] hover:from-[#4a8dd8] hover:via-[#4a8dd8] hover:to-[#0f3d6f] text-white font-bold sm:font-black text-sm sm:text-base md:text-lg rounded-lg shadow-md sm:shadow-lg shadow-[#579BE8]/30 hover:shadow-lg sm:hover:shadow-xl hover:shadow-[#579BE8]/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${
                    !isValidPhone || loading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full relative z-10"
                      />
                      <span className="relative z-10 text-xs sm:text-sm md:text-base">جاري الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10 text-xs sm:text-sm md:text-base">متابعة</span>
                      <FaChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 relative z-10" />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-3 sm:pt-4 border-t border-gray-200"
          >
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <p className="text-xs text-center text-gray-700 flex items-center gap-1 sm:gap-2">
                <span>📋</span>
                <span className="text-xs sm:text-sm">بتسجيل الدخول، أنت توافق على</span>
              </p>
              <Link
                href="/terms"
                className="text-[#579BE8] font-bold hover:underline hover:bg-[#579BE8]/10 px-2 py-1 rounded-lg transition-colors text-xs sm:text-sm"
              >
                الشروط والأحكام
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements Around Card */}
        <div className="absolute -top-3 -right-3 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-[#579BE8]/20 rounded-full blur-xl -z-10"></div>
        <div className="absolute -bottom-3 -left-3 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-[#124987]/20 rounded-full blur-xl -z-10"></div>
      </motion.div>
    </div>
  );
}