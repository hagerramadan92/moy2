"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function WelcomeStep({ onFinish }) {
  return (
    <div className="space-y-6 text-center py-6">
      <CheckCircle className="mx-auto text-green-500 w-16 h-16" />

      <h2 className="text-2xl font-bold"> اهلا بك في وايت مياه </h2>
    </div>
  );
}
