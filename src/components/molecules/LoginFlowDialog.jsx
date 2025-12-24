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

  // Reset step when dialog closes
  const handleOpenChange = (isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
          setTimeout(() => setStep(1), 300); // Reset after closing animation
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
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl">
        <VisuallyHidden>
          <DialogTitle>تسجيل الدخول</DialogTitle>
        </VisuallyHidden>

        <div className="relative p-8 min-h-[460px] flex flex-col justify-center">
             <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full"
                >
                    {step === 1 && <PhoneStep onNext={() => setStep(2)} />}
                    {step === 2 && <OtpStep onBack={() => setStep(1)} onNext={() => setStep(3)} />}
                    {step === 3 && (
                    <ProfileStep
                        onSkip={() => setStep(4)}
                        onNext={() => setStep(4)}
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
