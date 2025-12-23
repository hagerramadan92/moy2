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


export default function LoginFlowDialog({ open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const router = useRouter();

  return (
   <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="sm:max-w-[420px] text-center">

    <VisuallyHidden>
      <DialogTitle>تسجيل الدخول</DialogTitle>
    </VisuallyHidden>

    {step === 1 && <PhoneStep onNext={() => setStep(2)} />}
    {step === 2 && <OtpStep onNext={() => setStep(3)} />}
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

  </DialogContent>
</Dialog>

  );
}
