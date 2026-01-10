"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPhoneAlt, FaWater, FaChevronLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import { IoWaterOutline } from "react-icons/io5";
import { IoIosWater } from "react-icons/io";
import Link from "next/link";

// ✅ shadcn select
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COUNTRIES = [
  {
    key: "EG",
    nameAr: "مصر",
    dialCode: "+20",
    phone: { min: 10, max: 10, regex: /^(10|11|12|15)\d{8}$/ },
    placeholder: "10xxxxxxxx (مثال: 1101727657)",
  },
  {
    key: "SA",
    nameAr: "السعودية",
    dialCode: "+966",
    phone: { min: 9, max: 9, regex: /^5\d{8}$/ },
    placeholder: "5xxxxxxxx (مثال: 5XXXXXXXX)",
  },
  {
    key: "AE",
    nameAr: "الإمارات",
    dialCode: "+971",
    phone: { min: 9, max: 9, regex: /^5\d{8}$/ },
    placeholder: "5xxxxxxxx (مثال: 5XXXXXXXX)",
  },
  {
    key: "KW",
    nameAr: "الكويت",
    dialCode: "+965",
    phone: { min: 8, max: 8, regex: /^\d{8}$/ },
    placeholder: "xxxxxxxx (8 أرقام)",
  },
  {
    key: "QA",
    nameAr: "قطر",
    dialCode: "+974",
    phone: { min: 8, max: 8, regex: /^\d{8}$/ },
    placeholder: "xxxxxxxx (8 أرقام)",
  },
  {
    key: "BH",
    nameAr: "البحرين",
    dialCode: "+973",
    phone: { min: 8, max: 8, regex: /^\d{8}$/ },
    placeholder: "xxxxxxxx (8 أرقام)",
  },
  {
    key: "JO",
    nameAr: "الأردن",
    dialCode: "+962",
    phone: { min: 9, max: 9, regex: /^7\d{8}$/ },
    placeholder: "7xxxxxxxx (9 أرقام)",
  },
];

function digitsOnly(v) {
  return (v || "").replace(/\D/g, "");
}

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryKey, setCountryKey] = useState("EG");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const selectedCountry = useMemo(() => {
    return COUNTRIES.find((c) => c.key === countryKey) || COUNTRIES[0];
  }, [countryKey]);

  const countryCode = selectedCountry.dialCode;

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
      return "يرجى إدخال رقم جوال صحيح حسب الدولة المختارة";
    }

    return "";
  };

  const handlePhoneChange = (e) => {
    const value = digitsOnly(e.target.value);
    setPhoneNumber(value);

    const msg = validatePhone(value, selectedCountry);
    if (value.length > 0) setError(msg);
    else setError("");
  };

  const handleCountryChange = (newKey) => {
    setCountryKey(newKey);

    const newCountry = COUNTRIES.find((c) => c.key === newKey) || COUNTRIES[0];
    const msg = validatePhone(phoneNumber, newCountry);

    if (phoneNumber.length > 0) setError(msg);
    else setError("");
  };

  const handleNext = async () => {
    const msg = validatePhone(phoneNumber, selectedCountry);
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
            countryKey,
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
    const msg = validatePhone(phoneNumber, selectedCountry);
    return !msg;
  }, [phoneNumber, selectedCountry]);

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Animated Water Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D0E8FF] via-[#E0F2FF] to-[#C8E5FF] overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-32 h-32 bg-[#579BE8]/10 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-40 left-32 w-48 h-48 bg-[#579BE8]/8 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -15, 0], scale: [1, 1.15, 1] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute top-1/2 left-1/4 w-40 h-40 bg-[#579BE8]/12 rounded-full blur-2xl"
        />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#D0E8FF]/8 via-transparent to-transparent" />
      </div>

      {/* Decorative Water Icons */}
      <div className="absolute top-10 right-10 text-[#579BE8]/15">
        <IoWaterOutline size={120} className="rotate-12" />
      </div>
      <div className="absolute bottom-10 left-10 text-[#579BE8]/15">
        <FaWater size={100} className="-rotate-12" />
      </div>
      <div className="absolute top-1/2 right-1/4 text-[#579BE8]/10">
        <IoWaterOutline size={200} className="rotate-45" />
      </div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg lg:max-w-xl"
      >
        <div
          className={`bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-8 lg:p-10 space-y-6 sm:space-y-8 transition-all duration-500 ${
            isValidPhone ? "ring-2 ring-[#579BE8]/30 shadow-[#579BE8]/20" : ""
          }`}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-4"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#124987] shadow-lg shadow-[#579BE8]/30 mb-3 sm:mb-4 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <FaWater className="text-white text-2xl sm:text-3xl relative z-10" />
            </motion.div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[#579BE8] to-[#124987] bg-clip-text text-transparent">
                مرحبًا بك
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium flex items-center justify-center gap-2">
                <span className="text-[#579BE8]">
                  <IoIosWater />
                </span>
                سجل دخولك للاستمرار في طلب المياه
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-3"> 
              <div className="flex gap-2">
                {/* ✅ shadcn Select */}
                <div className="w-40">
                  <Select
                    value={countryKey}
                    onValueChange={handleCountryChange}
                    disabled={loading}
                  >
                    <SelectTrigger
                      className={`!h-[55px] w-full g-gradient-to-br from-gray-50 to-white border-2 rounded-xl font-bold text-[#579BE8] shadow-md hover:shadow-lg transition-all duration-300 border-gray-200 focus:ring-4 focus:ring-[#579BE8]/20 ${
                        loading ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      <SelectValue placeholder="اختر الدولة" />
                    </SelectTrigger>

                    <SelectContent className="max-h-72">
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.key} value={c.key}>
                          {c.dialCode} — {c.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Phone input */}
                <div className="relative flex-1">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                    <FaPhoneAlt className="w-5 h-5" />
                  </div>

                  <Input
                    placeholder={selectedCountry.placeholder}
                    dir="ltr"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    disabled={loading}
                    className={`w-full h-14 pr-12 pl-4 text-right bg-gradient-to-br from-gray-50 to-white border-2 rounded-xl font-bold text-[#579BE8] tracking-widest shadow-md hover:shadow-lg transition-all duration-300 ${
                      error
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                        : isValidPhone
                        ? "border-[#579BE8] shadow-[#579BE8]/20 focus:border-[#579BE8] focus:ring-[#579BE8]/20"
                        : "border-gray-200 focus:border-[#579BE8] focus:ring-[#579BE8]/20"
                    } focus:ring-4 focus:bg-white placeholder:text-gray-400 ${
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
                  className="text-red-500 text-xs font-medium flex items-center gap-1 bg-red-50 px-3 py-2 rounded-lg border border-red-200"
                >
                  <span>⚠</span>
                  {error}
                </motion.p>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-r from-[#579BE8]/5 to-[#124987]/5 rounded-2xl p-4 border border-[#579BE8]/10">
                <p className="text-xs text-gray-600 text-center font-medium flex items-center justify-center gap-2">
                  <span className="text-[#579BE8] text-lg">💬</span>
                  <span>سنرسل لك رمز التحقق عبر الواتساب</span>
                </p>
              </div>

              <motion.div
                whileHover={{ scale: isValidPhone ? 1.02 : 1 }}
                whileTap={{ scale: isValidPhone ? 0.98 : 1 }}
              >
                <Button
                  onClick={handleNext}
                  disabled={!isValidPhone || loading}
                  className={`w-full h-12 sm:h-14 bg-gradient-to-r from-[#579BE8] via-[#579BE8] to-[#124987] hover:from-[#4a8dd8] hover:via-[#4a8dd8] hover:to-[#0f3d6f] text-white font-black text-base sm:text-lg rounded-lg sm:rounded-xl shadow-lg shadow-[#579BE8]/30 hover:shadow-xl hover:shadow-[#579BE8]/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${
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
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full relative z-10"
                      />
                      <span className="relative z-10">جاري الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">متابعة</span>
                      <FaChevronLeft className="w-4 h-4 relative z-10" />
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
            className="pt-4 border-t border-gray-200"
          >
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-center text-gray-500 flex items-center gap-2">
                <span>📋</span>
                بتسجيل الدخول، أنت توافق على
              </p>
              <Link
                href="/terms"
                className="text-[#579BE8] font-bold hover:underline hover:bg-[#579BE8]/10 px-3 py-1 rounded-lg transition-colors text-sm"
              >
                الشروط والأحكام
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements Around Card */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#579BE8]/20 rounded-full blur-xl -z-10"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#124987]/20 rounded-full blur-xl -z-10"></div>
      </motion.div>
    </div>
  );
}
