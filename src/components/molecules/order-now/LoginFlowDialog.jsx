"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import PhoneStep from "./PhoneStep";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import OtpStep from "./OtpStep";
import ProfileStep from "./ProfileStep";
import WelcomeStep from "./WelcomeStep";
import { toast } from "react-hot-toast";


import { AnimatePresence, motion } from "framer-motion";

export default function LoginFlowDialog({ open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const router = useRouter();
  
  // Form data state
  const [formData, setFormData] = useState({
    phone: "",
    countryCode: "+20",
    otp: ["", "", "", "", "", ""],
    name: "",
  });
  
  // OTP data from API
  const [otpData, setOtpData] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  
  // Validation errors state
  const [errors, setErrors] = useState({
    phone: "",
    otp: "",
    name: "",
  });
  
  // Load OTP data from sessionStorage when dialog opens
  useEffect(() => {
    if (open) {
      const storedOtpData = sessionStorage.getItem("otpData");
      if (storedOtpData) {
        try {
          const parsed = JSON.parse(storedOtpData);
          setOtpData(parsed);
          
          // If we have OTP data, we're on step 2 (OTP step)
          if (parsed.otp && parsed.otp.length === 6) {
            const otpArray = parsed.otp.split("").slice(0, 6);
            setFormData(prev => ({ ...prev, otp: otpArray }));
          }
          
          // Set phone and country code from stored data
          if (parsed.phoneNumber) {
            setFormData(prev => ({ ...prev, phone: parsed.phoneNumber }));
          }
          if (parsed.countryCode) {
            setFormData(prev => ({ ...prev, countryCode: parsed.countryCode }));
          }
          
          // If we have OTP data, start at step 2
          if (parsed.phone) {
            setStep(2);
            setTimer(60);
          }
        } catch (err) {
          console.error("Error parsing OTP data:", err);
        }
      }
    }
  }, [open]);
  
  // Timer for resend OTP
  useEffect(() => {
    if (timer > 0 && step === 2) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, step]);

  // Validation functions
  const validatePhone = (phone) => {
    if (!phone || phone.length < 9) {
      return "يرجى إدخال رقم جوال صحيح";
    }
    return "";
  };
  
  // Handle send OTP
  const handleSendOtp = async () => {
    const error = validatePhone(formData.phone);
    if (error) {
      setErrors(prev => ({ ...prev, phone: error }));
      return;
    }

    setLoading(true);
    setErrors(prev => ({ ...prev, phone: "" }));

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          country_code: formData.countryCode,
          phone_number: formData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status) {
        // Store OTP data in sessionStorage
        const otpDataToStore = {
          phone: data.data.phone,
          method: data.data.method,
          otp: data.data.otp,
          countryCode: formData.countryCode,
          phoneNumber: formData.phone,
        };
        sessionStorage.setItem("otpData", JSON.stringify(otpDataToStore));
        setOtpData(otpDataToStore);
        
        // Auto-fill OTP if available
        if (data.data.otp && data.data.otp.length === 6) {
          const otpArray = data.data.otp.split("").slice(0, 6);
          setFormData(prev => ({ ...prev, otp: otpArray }));
        }
        
        // Reset timer
        setTimer(60);
        
        // Move to OTP step
        setStep(2);
        
        toast.success("تم إرسال رمز التحقق بنجاح", {
          icon: "✓",
          style: {
            background: "#579BE8",
            color: "#fff",
            borderRadius: "12px",
            padding: "16px",
          },
        });
      } else {
        setErrors(prev => ({ ...prev, phone: data.message || "فشل إرسال رمز التحقق. يرجى المحاولة مرة أخرى" }));
        toast.error(data.message || "فشل إرسال رمز التحقق", {
          icon: "✗",
          style: {
            background: "#F75A65",
            color: "#fff",
            borderRadius: "12px",
            padding: "16px",
          },
        });
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      setErrors(prev => ({ ...prev, phone: "حدث خطأ أثناء إرسال رمز التحقق. يرجى المحاولة مرة أخرى" }));
      toast.error("حدث خطأ أثناء إرسال رمز التحقق", {
        icon: "✗",
        style: {
          background: "#F75A65",
          color: "#fff",
          borderRadius: "12px",
          padding: "16px",
        },
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle verify OTP
  const handleVerifyOtp = async () => {
    const enteredOtp = formData.otp.join("");
    const error = validateOtp(formData.otp);
    if (error) {
      setErrors(prev => ({ ...prev, otp: error }));
      return;
    }

    if (!otpData || !otpData.phone) {
      setErrors(prev => ({ ...prev, otp: "بيانات غير صحيحة. يرجى المحاولة مرة أخرى" }));
      return;
    }

    setVerifying(true);
    setErrors(prev => ({ ...prev, otp: "" }));

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          otp: enteredOtp,
          phone_number: otpData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status) {
        // Save token to localStorage
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

        // Save user data to localStorage
        const userData = {
          id: data.data?.user?.id,
          name: data.data?.user?.name || otpData.phone || "مستخدم",
          phone: data.data?.user?.phone || otpData.phone,
          is_verified: data.data?.user?.is_verified || false,
          phoneNumber: otpData.phoneNumber,
          countryCode: otpData.countryCode,
        };
        
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Clear OTP data from sessionStorage
        sessionStorage.removeItem("otpData");
        
        // Trigger events to notify other components
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("userLogin"));
        
        // Move to next step (profile or welcome)
        if (data.data?.user?.name) {
          // User already has a name, skip to welcome
          setStep(4);
        } else {
          // User needs to set name
          setStep(3);
        }
        
        toast.success("تم التحقق بنجاح", {
          icon: "✓",
          style: {
            background: "#579BE8",
            color: "#fff",
            borderRadius: "12px",
            padding: "16px",
          },
        });
      } else {
        setErrors(prev => ({ ...prev, otp: data.message || "رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى" }));
        // Clear OTP inputs
        setFormData(prev => ({ ...prev, otp: ["", "", "", "", "", ""] }));
        toast.error(data.message || "رمز التحقق غير صحيح", {
          icon: "✗",
          style: {
            background: "#F75A65",
            color: "#fff",
            borderRadius: "12px",
            padding: "16px",
          },
        });
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setErrors(prev => ({ ...prev, otp: "حدث خطأ أثناء التحقق من رمز التحقق. يرجى المحاولة مرة أخرى" }));
      // Clear OTP inputs
      setFormData(prev => ({ ...prev, otp: ["", "", "", "", "", ""] }));
      toast.error("حدث خطأ أثناء التحقق من رمز التحقق", {
        icon: "✗",
        style: {
          background: "#F75A65",
          color: "#fff",
          borderRadius: "12px",
          padding: "16px",
        },
      });
    } finally {
      setVerifying(false);
    }
  };
  
  // Handle resend OTP
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
          country_code: formData.countryCode,
          phone_number: formData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status) {
        // Update OTP data
        const otpDataToStore = {
          phone: data.data.phone,
          method: data.data.method,
          otp: data.data.otp,
          countryCode: formData.countryCode,
          phoneNumber: formData.phone,
        };
        sessionStorage.setItem("otpData", JSON.stringify(otpDataToStore));
        setOtpData(otpDataToStore);
        
        // Auto-fill new OTP
        if (data.data.otp && data.data.otp.length === 6) {
          const otpArray = data.data.otp.split("").slice(0, 6);
          setFormData(prev => ({ ...prev, otp: otpArray }));
        }
        
        // Reset timer
        setTimer(60);
        
        toast.success("تم إعادة إرسال رمز التحقق بنجاح", {
          icon: "✓",
          style: {
            background: "#579BE8",
            color: "#fff",
            borderRadius: "12px",
            padding: "16px",
          },
        });
      } else {
        toast.error(data.message || "فشل إعادة إرسال رمز التحقق", {
          icon: "✗",
          style: {
            background: "#F75A65",
            color: "#fff",
            borderRadius: "12px",
            padding: "16px",
          },
        });
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.error("حدث خطأ أثناء إعادة إرسال رمز التحقق", {
        icon: "✗",
        style: {
          background: "#F75A65",
          color: "#fff",
          borderRadius: "12px",
          padding: "16px",
        },
      });
    } finally {
      setResending(false);
    }
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
            setFormData({ phone: "", countryCode: "+20", otp: ["", "", "", "", "", ""], name: "" });
            setErrors({ phone: "", otp: "", name: "" });
            setOtpData(null);
            setTimer(60);
            setLoading(false);
            setVerifying(false);
            setResending(false);
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
                        countryCode={formData.countryCode}
                        onPhoneChange={(phone) => {
                          setFormData(prev => ({ ...prev, phone }));
                          setErrors(prev => ({ ...prev, phone: "" }));
                        }}
                        onCountryCodeChange={(countryCode) => {
                          setFormData(prev => ({ ...prev, countryCode }));
                        }}
                        error={errors.phone}
                        loading={loading}
                        onNext={handleSendOtp}
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
                        verifying={verifying}
                        timer={timer}
                        resending={resending}
                        onBack={() => setStep(1)} 
                        onResend={handleResendOtp}
                        onNext={handleVerifyOtp}
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
                        onSkip={async () => {
                          // Skip profile - go to welcome
                          setStep(4);
                        }}
                        onNext={async () => {
                          const error = validateName(formData.name);
                          if (error) {
                            setErrors(prev => ({ ...prev, name: error }));
                            return;
                          }
                          
                          // Save profile name to API if user is logged in
                          const accessToken = localStorage.getItem("accessToken");
                          if (accessToken && formData.name.trim()) {
                            try {
                              const formDataToSend = new FormData();
                              formDataToSend.append('name', formData.name.trim());
                              
                              const response = await fetch("/api/auth/complete-profile", {
                                method: "POST",
                                headers: {
                                  "Accept": "application/json",
                                  "Authorization": `Bearer ${accessToken}`,
                                },
                                body: formDataToSend,
                              });
                              
                              const data = await response.json();
                              
                              if (response.ok && data.status) {
                                // Update localStorage user data
                                const localUser = localStorage.getItem("user");
                                if (localUser) {
                                  try {
                                    const parsedUser = JSON.parse(localUser);
                                    parsedUser.name = formData.name.trim();
                                    localStorage.setItem("user", JSON.stringify(parsedUser));
                                  } catch (e) {
                                    console.error("Error updating local user:", e);
                                  }
                                }
                              }
                            } catch (err) {
                              console.error("Error saving profile:", err);
                              // Continue anyway - don't block user
                            }
                          }
                          
                          setStep(4);
                        }}
                    />
                    )}
                    {step === 4 && (
                    <WelcomeStep
                        onFinish={() => {
                        onOpenChange(false);
                        router.push("/orders");
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
