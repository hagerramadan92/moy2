"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

import { motion } from "framer-motion";

export default function WelcomeStep({ onFinish }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-[#579BE8]/10 rounded-full flex items-center justify-center mb-2"
      >
        <CheckCircle className="text-[#579BE8] w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" strokeWidth={3} />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">أهلاً بك في وايت مياه</h2>
        <p className="text-sm sm:text-base text-gray-500">تم تسجيل دخولك بنجاح</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
         <Button 
            className="px-6 sm:px-8 h-10 sm:h-12 bg-white border border-gray-200 text-sm sm:text-base text-gray-600 hover:bg-gray-50 rounded-xl"
            onClick={onFinish}
        >
            إغلاق
         </Button>
      </motion.div>
    </div>
  );
}
