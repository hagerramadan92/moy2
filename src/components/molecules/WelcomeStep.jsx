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
        className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-2"
      >
        <CheckCircle className="text-green-500 w-12 h-12" strokeWidth={3} />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">أهلاً بك في وايت مياه</h2>
        <p className="text-gray-500">تم تسجيل دخولك بنجاح</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
         <Button 
            className="px-8 h-12 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
            onClick={onFinish}
        >
            إغلاق
         </Button>
      </motion.div>
    </div>
  );
}
