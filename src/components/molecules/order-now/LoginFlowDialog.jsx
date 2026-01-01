"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import PhoneStep from "./PhoneStep";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import OtpStep from "./OtpStep";
import ProfileStep from "./ProfileStep";
import WelcomeStep from "./WelcomeStep";


import { AnimatePresence, motion } from "framer-motion";

export default function LoginFlowDialog({ open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const router = useRouter();
  
  // Form data state
  const [formData, setFormData] = useState({
    phone: "",
    otp: ["", "", "", "", "", ""],
    name: "",
  });
  
  // Validation errors state
  const [errors, setErrors] = useState({
    phone: "",
    otp: "",
    name: "",
  });

  // Validation functions
  const validatePhone = (phone) => {
    const phoneRegex = /^5\d{8}$/; // Saudi phone: starts with 5, followed by 8 digits
    if (!phone) {
      return "رقم الجوال مطلوب";
    }
    if (!phoneRegex.test(phone)) {
      return "رقم الجوال يجب أن يبدأ بـ 5 ويحتوي على 9 أرقام";
    }
    return "";
  };

  const validateOtp = (otp) => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      return "الرجاء إدخال رمز التحقق الكامل (6 أرقام)";
    }
    if (!/^\d{6}$/.test(otpString)) {
      return "رمز التحقق يجب أن يحتوي على أرقام فقط";
    }
    return "";
  };

  const validateName = (name) => {
    if (!name || name.trim().length === 0) {
      return "الاسم مطلوب";
    }
    if (name.trim().length < 2) {
      return "الاسم يجب أن يحتوي على حرفين على الأقل";
    }
    if (name.trim().length > 50) {
      return "الاسم طويل جداً";
    }
    return "";
  };

  // Reset step when dialog closes
  const handleOpenChange = (isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
          setTimeout(() => {
            setStep(1);
            setFormData({ phone: "", otp: ["", "", "", "", "", ""], name: "" });
            setErrors({ phone: "", otp: "", name: "" });
          }, 300); // Reset after closing animation
      }
  };

  const variants = {
      enter: (direction) => ({
          x: direction > 0 ? 20 : -20,
          opacity: 0,
      }),
      center: {
          x: 0,
          opacity: 1,
      }, 
      exit: (direction) => ({
          x: direction < 0 ? 20 : -20,
          opacity: 0,
      }),
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[90vw] max-w-[480px] md:w-[550px] lg:w-[600px] h-[520px] p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl">
        <VisuallyHidden>
          <DialogTitle>تسجيل الدخول</DialogTitle>
        </VisuallyHidden>

        <div className="relative p-4 sm:p-6 md:p-7 h-full flex flex-col justify-center overflow-y-auto">
             <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full"
                >
                    {step === 1 && (
                      <PhoneStep 
                        phone={formData.phone}
                        onPhoneChange={(phone) => {
                          setFormData(prev => ({ ...prev, phone }));
                          setErrors(prev => ({ ...prev, phone: "" }));
                        }}
                        error={errors.phone}
                        onNext={() => {
                          const error = validatePhone(formData.phone);
                          if (error) {
                            setErrors(prev => ({ ...prev, phone: error }));
                            return;
                          }
                          setStep(2);
                        }} 
                      />
                    )}
                    {step === 2 && (
                      <OtpStep 
                        otp={formData.otp}
                        onOtpChange={(otp) => {
                          setFormData(prev => ({ ...prev, otp }));
                          setErrors(prev => ({ ...prev, otp: "" }));
                        }}
                        error={errors.otp}
                        onBack={() => setStep(1)} 
                        onNext={() => {
                          const error = validateOtp(formData.otp);
                          if (error) {
                            setErrors(prev => ({ ...prev, otp: error }));
                            return;
                          }
                          setStep(3);
                        }} 
                      />
                    )}
                    {step === 3 && (
                    <ProfileStep
                        name={formData.name}
                        onNameChange={(name) => {
                          setFormData(prev => ({ ...prev, name }));
                          setErrors(prev => ({ ...prev, name: "" }));
                        }}
                        error={errors.name}
                        onSkip={() => setStep(4)}
                        onNext={() => {
                          const error = validateName(formData.name);
                          if (error) {
                            setErrors(prev => ({ ...prev, name: error }));
                            return;
                          }
                          setStep(4);
                        }}
                    />
                    )}
                    {step === 4 && (
                    <WelcomeStep
                        onFinish={() => {
                        onOpenChange(false);
                        router.push("/");
                        }}
                    />
                    )}
                </motion.div>
             </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
