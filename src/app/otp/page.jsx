"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FaWater, FaChevronLeft, FaLock, FaSms, FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import { IoWaterOutline, IoLockClosedOutline } from "react-icons/io5";
import OtpStep from "@/components/molecules/order-now/OtpSmS";
import toast from "react-hot-toast";
import { IoIosLock } from "react-icons/io";

export default function OtpPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [useSms, setUseSms] = useState(false);
  const [otpData, setOtpData] = useState(null);
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const inputsRef = useRef([]);
  const router = useRouter();

  // Load OTP data from sessionStorage on mount
  useEffect(() => {
    const storedOtpData = sessionStorage.getItem("otpData");
    if (storedOtpData) {
      try {
        const parsed = JSON.parse(storedOtpData);
        setOtpData(parsed);

        // Auto-fill OTP from response if available
        if (parsed.otp && parsed.otp.length === 6) {
          const otpArray = parsed.otp.split("").slice(0, 6);
          setOtp(otpArray);
        }
      } catch (err) {
        console.error("Error parsing OTP data:", err);
        // If no valid OTP data, redirect back to login
        router.push("/login");
      }
    } else {
      // If no OTP data found, redirect back to login
      router.push("/login");
    }
  }, [router]);

  const handleSmsClick = () => {
    setUseSms(true);
  };

  const handleOtpNext = () => {
    // Handle OTP verification for SMS
    console.log("OTP verified via SMS");
    // Add your navigation logic here
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < inputsRef.current.length - 1) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputsRef.current[index - 1].focus();
      }
    }
  };
  
  function getSessionId() {
    if (typeof window === "undefined") return null;
  
    const key = "session_id";
    let sessionId = localStorage.getItem(key);
  
    if (!sessionId) {
      sessionId =
        crypto?.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  
      localStorage.setItem(key, sessionId);
    }
  
    return sessionId;
  }
  
  const handleVerify = async () => {
    const enteredOtp = otp.join("");

    if (!enteredOtp || enteredOtp.length !== 6) {
      toast.error("يرجى إدخال رمز التحقق كاملاً");
      return;
    }

    if (!otpData || !otpData.phone) {
      toast.error("بيانات غير صحيحة. يرجى المحاولة مرة أخرى");
      router.push("/login");
      return;
    }

    setVerifying(true);

    try {
      // Call verify OTP API
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          otp: enteredOtp,
          phone_number: otpData.phone,
          session_id: getSessionId(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.status) {
        console.log(data);
        if (data.data?.token) {
          const token = data.data.token;
          localStorage.setItem("accessToken", token);
          if (data.data?.token_type) {
            localStorage.setItem("tokenType", data.data.token_type);
          }
          if (data.data?.refreshToken) {
            localStorage.setItem("refreshToken", data.data.refreshToken);
          }
        }
        
        const userData = {
          id: data.data?.user?.id,
          name: data.data?.user?.name || otpData.phone || "مستخدم",
          phone: data.data?.user?.phone || otpData.phone,
          is_verified: data.data?.user?.is_verified || false,
          phoneNumber: otpData.phoneNumber,
          countryCode: otpData.countryCode,
          token: data.data.token
        };

        localStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.removeItem("otpData");
        router.push("/");

        // Trigger a custom event to notify Navbar of login
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("userLogin"));
      } else {
        toast.error(data.message || "رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى");
        // Clear OTP inputs
        setOtp(["", "", "", "", "", ""]);
        if (inputsRef.current[0]) {
          inputsRef.current[0].focus();
        }
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء التحقق من رمز التحقق. يرجى المحاولة مرة أخرى");
      setOtp(["", "", "", "", "", ""]);
      if (inputsRef.current[0]) {
        inputsRef.current[0].focus();
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpData || timer > 0 || resending) return;

    setResending(true);

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          country_code: otpData.countryCode,
          phone_number: otpData.phoneNumber,
          otp_method: otpData.otpMethod || "whatsapp", // إرسال طريقة OTP المختارة
        }),
      });

      const data = await response.json();

      if (response.ok && data.status) {
        // Update stored OTP data
        const updatedOtpData = {
          phone: data.data.phone,
          method: data.data.method,
          otp: data.data.otp,
          countryCode: otpData.countryCode,
          phoneNumber: otpData.phoneNumber,
          otpMethod: otpData.otpMethod || "whatsapp",
        };
        sessionStorage.setItem("otpData", JSON.stringify(updatedOtpData));
        setOtpData(updatedOtpData);

        // Auto-fill new OTP
        if (data.data.otp && data.data.otp.length === 6) {
          const otpArray = data.data.otp.split("").slice(0, 6);
          setOtp(otpArray);
        }

        setTimer(60); // Reset timer

        // Show success message
        toast.success("تم إعادة إرسال رمز التحقق بنجاح");
      } else {
        toast.error(data.message || "فشل إعادة إرسال رمز التحقق. يرجى المحاولة مرة أخرى");
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء إعادة إرسال رمز التحقق. يرجى المحاولة مرة أخرى");
    } finally {
      setResending(false);
    }
  };

  const handleBack = () => {
    router.back();
  }

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Animated Water Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D0E8FF] via-[#E0F2FF] to-[#C8E5FF] overflow-hidden">
        {/* Floating Water Drops with Animation */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-20 w-32 h-32 bg-[#579BE8]/10 rounded-full blur-2xl"
        ></motion.div>
        <motion.div
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-40 left-32 w-48 h-48 bg-[#579BE8]/8 rounded-full blur-3xl"
        ></motion.div>
        <motion.div
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute top-1/2 left-1/4 w-40 h-40 bg-[#579BE8]/12 rounded-full blur-2xl"
        ></motion.div>

        {/* Water Ripple Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#D0E8FF]/8 via-transparent to-transparent"></div>
      </div>

      {/* Decorative Water Icons */}
      <div className="absolute top-10 right-10 text-[#579BE8]/15">
        <IoLockClosedOutline size={120} className="rotate-12" />
      </div>
      <div className="absolute bottom-10 left-10 text-[#579BE8]/15">
        <FaLock size={100} className="-rotate-12" />
      </div>
      <div className="absolute top-1/2 right-1/4 text-[#579BE8]/10">
        <IoWaterOutline size={200} className="rotate-45" />
      </div>

      {/* Main OTP Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg lg:max-w-xl"
      >
        <div className={`bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 py-4 sm:p-8 lg:p-10 space-y-6 sm:space-y-8 transition-all duration-500 ${isOtpComplete && !useSms ? "ring-2 ring-[#579BE8]/30 shadow-[#579BE8]/20" : ""
          }`}>
          {useSms ? (
            <OtpStep onNext={handleOtpNext} />
          ) : (
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center space-y-4 px-4"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#124987] shadow-lg shadow-[#579BE8]/30 mb-3 sm:mb-4 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <FaLock className="text-white text-2xl sm:text-3xl relative z-10" />
                </motion.div>
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-[#579BE8] to-[#124987] bg-clip-text text-transparent">
                    رمز التحقق
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 font-medium flex items-center justify-center gap-2">
                    <span className="text-[#367ccc]"><IoIosLock size={20}/></span>
                    أدخل رمز التحقق المرسل إليك
                  </p>
                </div>
              </motion.div>

              {/* OTP Inputs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <div className="flex justify-center gap-0.5 md:gap-2 " dir="ltr">
                  {otp.map((value, index) => (
                    <motion.input
                      key={index}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        borderColor: value ? "#579BE8" : undefined,
                        boxShadow: value ? "0 4px 14px 0 rgba(87, 155, 232, 0.2)" : undefined
                      }}
                      transition={{
                        delay: 0.4 + index * 0.1,
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                      type="text"
                      maxLength={1}
                      value={value}
                      onChange={(e) => handleChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      ref={(el) => (inputsRef.current[index] = el)}
                      className={`w-10 h-10 md:w-14 md:h-14  text-center text-xl xs:text-2xl font-black rounded-lg sm:rounded-xl border-2 bg-gradient-to-br from-gray-50 to-white focus:border-[#579BE8] focus:ring-2 sm:focus:ring-4 focus:ring-[#579BE8]/20 outline-none transition-all duration-300 text-[#579BE8] shadow-md sm:shadow-lg hover:border-[#579BE8]/70 hover:shadow-lg sm:hover:shadow-xl focus:bg-white ${value ? "border-[#579BE8] shadow-[#579BE8]/20" : "border-gray-200"
                        }`}
                    />
                  ))}
                </div>

                {/* Phone Number Info */}
                <div className="bg-gradient-to-r mx-4 from-[#579BE8]/5 to-[#124987]/5 rounded-2xl p-4 border border-[#579BE8]/10">
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600 font-medium">
                      <span className={`text-lg ${
                        otpData?.otpMethod === "sms" ? "text-[#579BE8]" : "text-[#25D366]"
                      }`}>
                        {otpData?.otpMethod === "sms" ? "📱" : "💬"}
                      </span>
                      <span>
                        تم ارسال رمز التحقق عبر {
                          otpData?.otpMethod === "sms" ? "الرسائل النصية" : "الواتساب"
                        } على
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <span className="text-gray-900 font-bold text-sm sm:text-base" dir="ltr">
                        {otpData?.phone || "+966 5xxxxxxxx"}
                      </span>
                      <button
                        onClick={handleBack}
                        className="text-[#579BE8] font-bold hover:underline text-xs sm:text-sm px-2 py-1 rounded-lg hover:bg-[#579BE8]/10 transition-colors"
                      >
                        تغيير
                      </button>
                    </div>
                    <div className="pt-2 border-t border-[#579BE8]/10">
                      <p className="text-[10px] sm:text-xs text-gray-700 font-medium">
                        إرسال مرة أخرى{" "}
                        {timer > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[#579BE8] font-bold bg-[#579BE8]/10 px-2 py-1 rounded-lg">
                            <motion.span
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              ⏱
                            </motion.span>
                            {timer} ثانية
                          </span>
                        ) : (
                          <button
                            onClick={handleResendOtp}
                            disabled={resending}
                            className={`text-[#579BE8] font-bold hover:underline hover:bg-[#579BE8]/10 px-2 py-1 rounded-lg transition-colors ${resending ? "opacity-60 cursor-not-allowed" : ""
                              }`}
                          >
                            {resending ? "جاري الإرسال..." : "إعادة الإرسال"}
                          </button>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3 px-4"
              >
                <motion.div
                  whileHover={{ scale: isOtpComplete ? 1.02 : 1 }}
                  whileTap={{ scale: isOtpComplete ? 0.98 : 1 }}
                >
                  <Button
                    onClick={handleVerify}
                    disabled={!isOtpComplete || verifying}
                    className={`w-full h-12 sm:h-14 bg-gradient-to-r from-[#579BE8] via-[#579BE8] to-[#124987] hover:from-[#4a8dd8] hover:via-[#4a8dd8] hover:to-[#0f3d6f] text-white font-black text-base sm:text-lg rounded-lg sm:rounded-xl shadow-lg shadow-[#579BE8]/30 hover:shadow-xl hover:shadow-[#579BE8]/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${!isOtpComplete || verifying ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                    />
                    {verifying ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full relative z-10"
                        />
                        <span className="relative z-10">جاري التحقق...</span>
                      </>
                    ) : (
                      <>
                        <span className="relative z-10">تأكيد</span>
                        <FaChevronLeft className="w-4 h-4 relative z-10" />
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Show SMS button only if current method is WhatsApp */}
              
              </motion.div>
            </>
          )}
        </div>

        {/* Decorative Elements Around Card */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#579BE8]/20 rounded-full blur-xl -z-10"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#124987]/20 rounded-full blur-xl -z-10"></div>
      </motion.div>
    </div>
  );
}