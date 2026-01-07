'use client';
// Force re-render


import { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Star, ChevronLeft, Truck, Users } from 'lucide-react';

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
  const router = useRouter();
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
    <div className="max-w-7xl mx-auto ">

      {/* Enhanced Header Section */}
      <div className="max-w-7xl mx-auto mb-2 pt-5 px-4 md:px-8">
        {/* Enhanced Breadcrumb Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs md:text-sm mb-3 md:mb-4"
        >
          <button 
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-[#579BE8] transition-all font-medium px-3 py-1.5 rounded-lg hover:bg-[#579BE8]/5 hover:shadow-sm"
          >
            العودة
          </button>
          <ChevronLeft className="w-3 h-3 text-muted-foreground rotate-180" />
          <span className="font-bold text-foreground px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#579BE8]/10 to-[#124987]/10 text-[#579BE8] border border-[#579BE8]/20 text-xs md:text-sm">
            السائقين المتاحين
          </span>
        </motion.div>

        {/* Enhanced Professional Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-card border-2 border-border/60 rounded-2xl shadow-xl overflow-hidden relative group hover:shadow-2xl transition-all duration-300"
        >
          <div className="bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] text-white relative overflow-hidden">
            {/* Enhanced Animated Background Elements */}
            <div className="absolute top-0 right-0 opacity-[0.04]">
              <Users size={200} className="rotate-12" />
            </div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/8 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 p-4 md:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
                {/* Left Section */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-start gap-3">
                    <motion.div 
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/25 backdrop-blur-lg flex items-center justify-center shadow-xl border-2 border-white/20 group-hover:border-white/30 transition-all"
                    >
                      <Truck className="w-6 h-6 md:w-7 md:h-7" />
                    </motion.div>
                    <div className="flex-1">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <p className="text-[10px] md:text-xs opacity-95 font-bold uppercase tracking-wider mb-1.5 text-white/90">
                          اختيار السائق
                        </p>
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-black mb-3 leading-tight">السائقين المتاحين</h1>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-white/25 backdrop-blur-lg px-3 py-1.5 rounded-lg font-bold text-xs border-2 border-white/20 shadow-md flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            تم استلام طلبك
                          </span>
                          <span className="px-3 py-1.5 rounded-lg font-bold text-xs border-2 backdrop-blur-lg shadow-md bg-green-500/40 border-green-300/60 text-white">
                            <span className="flex items-center gap-1.5">
                              <Users size={14} />
                              {DRIVERS.length} سائق متاح
                            </span>
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                {/* Right Section - Status Steps */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/25 backdrop-blur-lg rounded-xl p-4 md:p-5 border-2 border-white/20 shadow-xl"
                >
                  <p className="text-[10px] md:text-xs opacity-95 font-bold uppercase tracking-wider mb-3 text-center">حالة الطلب</p>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-white text-[#579BE8] flex items-center justify-center shadow-lg">
                        <CheckCircle2 size={20} />
                      </div>
                      <span className="text-[10px] font-medium">الطلب</span>
                    </div>
                    <div className="w-8 h-[2px] bg-white/40" />
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-white/30 text-white flex items-center justify-center ring-2 ring-white/40 animate-pulse">
                        <Clock size={18} />
                      </div>
                      <span className="text-[10px] font-medium">السائق</span>
                    </div>
                    <div className="w-8 h-[2px] bg-white/20" />
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-white/10 text-white/60 flex items-center justify-center">
                        <Truck size={18} />
                      </div>
                      <span className="text-[10px] font-medium text-white/60">التوصيل</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto mb-8 pt-5 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 ">

        {/* Drivers List Column */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 h-full overflow-y-auto pr-2 custom-scrollbar pb-20 p-2"
        >
          <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 bg-gray-50/50 p-2">
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
    </div>
  );
}
