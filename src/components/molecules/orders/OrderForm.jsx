'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Droplets, Scale, Calendar, ArrowRight, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

import OrderSchedulePage from './OrderSchedulePage';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Dynamically import the map modal to avoid SSR issues with Leaflet
const LocationPickerModal = dynamic(
    () => import('./LocationPickerModal'),
    { ssr: false }
);

export default function OrderForm() {
    // State management
    const [waterType, setWaterType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [locationData, setLocationData] = useState(null); // { lat, lng, address }
    const [showSchedule, setShowSchedule] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);

    const router = useRouter();

    const handleOrderNow = () => {
        if (!locationData) {
            toast.error('الرجاء تحديد الموقع أولاً');
            return;
        }
        if (!waterType) {
            toast.error('الرجاء اختيار نوع المياه');
            return;
        }
        if (!quantity) {
            toast.error('الرجاء اختيار الكمية');
            return;
        }
        // Proceed
        router.push('/orders/search-driver');
    };

    const handleLocationSelect = (data) => {
        setLocationData(data);
    };

    if (showSchedule) {
        return <OrderSchedulePage onBack={() => setShowSchedule(false)} />;
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 flex justify-center items-start pt-12 md:pt-16">

            <LocationPickerModal
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)}
                onSelect={handleLocationSelect}
            />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-3xl space-y-6"
            >

                {/* Header */}
                <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 font-cairo mb-1">تفاصيل الطلب</h1>
                        <p className="text-gray-500 text-sm">قم بملء البيانات التالية لإتمام طلبك</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <Truck size={24} />
                    </div>
                </motion.div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl shadow-blue-900/5 border border-gray-100 relative overflow-hidden">

                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-blue-600" />

                    <div className="space-y-8">

                        {/* Location Section */}
                        <motion.div variants={itemVariants} className="space-y-3">
                            <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                                <MapPin size={20} className="text-blue-500" />
                                موقع التوصيل
                            </label>
                            <div
                                onClick={() => setIsMapOpen(true)}
                                className="group cursor-pointer relative w-full h-16 rounded-2xl bg-gray-50 hover:bg-white border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all duration-300 flex items-center px-4 overflow-hidden"
                            >
                                <div className="flex-1 flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${locationData ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
                                        <MapPin size={20} />
                                    </div>
                                    <div className="flex flex-col items-start overflow-hidden">
                                        <span className={`text-sm font-bold truncate w-full text-right ${locationData ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {locationData ? locationData.address : 'اضغط لتحديد الموقع على الخريطة'}
                                        </span>
                                        {locationData && <span className="text-green-500 text-xs">تم تحديد الموقع</span>}
                                    </div>
                                </div>
                                <div className="bg-blue-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity absolute left-3">
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                        </motion.div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Water Type */}
                            <motion.div variants={itemVariants} className="space-y-3">
                                <label className="flex items-center gap-2 text-gray-700 font-bold">
                                    <Droplets size={20} className="text-blue-500" />
                                    نوع المياه
                                </label>
                                <Select value={waterType} onValueChange={setWaterType} dir="rtl">
                                    <SelectTrigger className="w-full h-14 rounded-xl border border-[#D1E3FA] bg-white px-4 focus:ring-2 focus:ring-[#579BE8] text-right flex items-center text-[16px] p-6 shadow-sm">
                                        <SelectValue placeholder="اختر نوع المويه" className="text-[16px]" />
                                    </SelectTrigger>
                                    <SelectContent className="text-right">
                                        <SelectItem value="safe" className="text-[16px] py-2 text-right flex-row-reverse justify-end">صالحة للشرب</SelectItem>
                                        <SelectItem value="natural" className="text-[16px] py-2 text-right flex-row-reverse justify-end">طبيعي</SelectItem>
                                        <SelectItem value="mineral" className="text-[16px] py-2 text-right flex-row-reverse justify-end">معدني</SelectItem>
                                        <SelectItem value="distilled" className="text-[16px] py-2 text-right flex-row-reverse justify-end">مقطر</SelectItem>
                                    </SelectContent>
                                </Select>
                            </motion.div>

                            {/* Quantity */}
                            <motion.div variants={itemVariants} className="space-y-3">
                                <label className="flex items-center gap-2 text-gray-700 font-bold">
                                    <Scale size={20} className="text-blue-500" />
                                    الكمية (طن)
                                </label>
                                <Select value={quantity} onValueChange={setQuantity} dir="rtl">
                                    <SelectTrigger className="w-full h-14 rounded-xl border border-[#D1E3FA] bg-white px-4 focus:ring-2 focus:ring-[#579BE8] text-right flex items-center text-[16px] p-6 shadow-sm">
                                        <SelectValue placeholder="اختر حجم المويه" className="text-[16px]" />
                                    </SelectTrigger>
                                    <SelectContent className="text-right">
                                        {[...Array(10)].map((_, i) => (
                                            <SelectItem key={i + 1} value={(i + 1).toString()} className="text-[16px] py-2 text-right flex-row-reverse justify-end">{i + 1} طن</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </motion.div>
                        </div>

                        {/* Actions */}
                        <motion.div variants={itemVariants} className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={handleOrderNow}
                                className="h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                <span>اطلب الآن</span>
                                <ArrowRight size={20} />
                            </button>

                            <button
                                onClick={() => setShowSchedule(true)}
                                className="h-14 rounded-2xl bg-white border-2 border-blue-100 text-blue-600 font-bold text-lg hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                <Calendar size={20} />
                                <span>جدولة الطلب</span>
                            </button>
                        </motion.div>

                    </div>
                </div>

            </motion.div>
        </div>
    );
}
