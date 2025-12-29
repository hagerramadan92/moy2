"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaLock, FaSms, FaChevronLeft, FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";

export default function OtpStep({ onNext }) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const inputsRef = useRef([]);
  const router = useRouter();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    router.push("/otp");
  };

  const handleChange = (e, index) => {
    const value = e.target.value;

    if (/^\d$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (index < inputsRef.current.length - 1) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#579BE8] to-[#124987] shadow-lg shadow-[#579BE8]/30 mb-4">
          <FaSms className="text-white text-3xl" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900">رمز التحقق</h1>
        <p className="text-gray-600 font-medium">تم إرسال رمز التحقق عبر الرسائل النصية</p>
      </motion.div>

      {/* OTP Inputs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex gap-3 justify-center" dir="ltr">
          {otp.map((value, index) => (
            <motion.input
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              type="text"
              maxLength={1}
              value={value}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputsRef.current[index] = el)}
              className="w-16 h-16 sm:w-20 sm:h-20 text-center text-2xl font-black rounded-xl border-2 bg-gray-50 focus:border-[#579BE8] focus:ring-4 focus:ring-[#579BE8]/20 outline-none transition-all text-[#579BE8] shadow-lg hover:border-[#579BE8]/50 hover:shadow-xl focus:bg-white"
            />
          ))}
        </div>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center font-medium flex items-center justify-center gap-2">
          <span className="text-[#579BE8]">📱</span>
          تحقق من رسائلك النصية
        </p>
      </motion.div>

      {/* Links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col items-center gap-3 text-sm"
      >
        <button
          onClick={handleWhatsAppClick}
          className="text-[#579BE8] font-bold hover:underline flex items-center gap-2 transition-colors"
        >
          <FaWhatsapp className="w-4 h-4" />
          <span>إرسال عبر الواتساب</span>
        </button>
        <div className="text-gray-500 font-medium text-center">
          {timer > 0 ? (
            <span>
              إعادة الإرسال{" "}
              <span className="text-[#579BE8] font-bold">({timer} ثانية)</span>
            </span>
          ) : (
            <button className="text-[#579BE8] font-bold hover:underline transition-colors">
              إعادة الإرسال
            </button>
          )}
        </div>
      </motion.div>

      {/* Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={onNext}
          disabled={!isOtpComplete}
          className={`w-full h-14 bg-gradient-to-r from-[#579BE8] to-[#124987] hover:from-[#4a8dd8] hover:to-[#0f3d6f] text-white font-black text-lg rounded-xl shadow-lg shadow-[#579BE8]/30 hover:shadow-xl hover:shadow-[#579BE8]/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 ${
            !isOtpComplete ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          <span>تأكيد</span>
          <FaChevronLeft className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
}
