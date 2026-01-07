'use client';
// Force re-render


import { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Star } from 'lucide-react';

import PaymentModal from '@/components/ui/PaymentModal';
import DriverCard from '@/components/ui/DriverCard';

// Dynamically import map to avoid SSR
const DriversMap = dynamic(
  () => import('./DriversMap'),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center animate-pulse"><span className="text-gray-400">جاري تحميل الخريطة...</span></div> }
);

// Mock data for drivers
const DRIVER_DATA = {
  name: "سعود بن ناصر المطيري",
  deliveryTime: "55 د",
  rating: "4.5",
  successfulOrders: "(1,439) طلب ناجح",
  ordersCount: "238"
};

const DRIVERS = [
  { id: 1, ...DRIVER_DATA },
  { id: 2, ...DRIVER_DATA },
  { id: 3, ...DRIVER_DATA },
  { id: 4, ...DRIVER_DATA },
  { id: 5, ...DRIVER_DATA },
  { id: 6, ...DRIVER_DATA }
];

export default function AvailableDriversPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);

  const handleDriverSelect = (driverId) => {
    setSelectedDriverId(driverId);
    setIsModalOpen(true);
  };

  const handleConfirmPayment = (methodId, driverId) => {
    console.log('Payment confirmed:', { methodId, driverId });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <main className="min-h-screen bg-gray-50/50 pt-24 pb-12 px-4 md:px-8">

      {/* Top Info Bar - Professional Gradient Design */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl p-6 shadow-xl shadow-blue-500/10 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/20 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-right w-full md:w-auto">
              <h1 className="text-2xl md:text-3xl font-bold font-cairo mb-2">السائقين المتاحين</h1>
              <p className="text-blue-100 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                تم استلام طلبك، جاري عرض السائقين القريبين منك
              </p>
            </div>

            {/* Status Steps */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-lg">
                  <CheckCircle2 size={18} />
                </div>
                <span className="text-sm font-medium">الطلب</span>
              </div>
              <div className="w-12 h-[2px] bg-white/30" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-400/80 text-white flex items-center justify-center ring-2 ring-white/30 animate-pulse">
                  <Clock size={16} />
                </div>
                <span className="text-sm font-medium">السائق</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 ">

        {/* Drivers List Column */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 h-full overflow-y-auto pr-2 custom-scrollbar pb-20 p-2"
        >
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 bg-gray-50/50 p-2">
            {DRIVERS.map((driver) => (
              <motion.div key={driver.id} variants={itemVariants} className="flex justify-center">
                <div className="transform transition-transform hover:scale-[1.02] duration-300 w-full max-w-[380px]">
                  <DriverCard
                    {...driver}
                    onAcceptOrder={() => handleDriverSelect(driver.id)}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Map Column */}
        <div className="hidden lg:block h-[calc(100vh-220px)] min-h-[600px] lg:col-span-5  relative">
          <div className="sticky top-0 h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-gray-100">
            <DriversMap
              drivers={DRIVERS}
              className="w-full h-full"
            />

            {/* Map Overlay Info */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 z-[400]">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">وقت الوصول المتوقع</h4>
                  <p className="text-xs text-gray-500">يختلف وقت الوصول حسب السائق المختار وموقعه الحالي.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmPayment}
        selectedDriverId={selectedDriverId}
      />
    </main>
  );
}
