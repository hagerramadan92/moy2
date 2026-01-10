
'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Droplets, Scale, Calendar, ArrowRight, Truck, CheckCircle2, AlertCircle, Search, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import OrderSchedulePage from './OrderSchedulePage';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import api from '@/utils/api';
import WaterTypeSelect from '@/components/common/WaterTypeSelect';
import ServiceSelect from '@/components/common/ServiceSelect';

const LocationPickerModal = dynamic(
	() => import('./LocationPickerModal'),
	{ ssr: false }
);

export default function OrderForm() {
	// State management
	const [waterType, setWaterType] = useState('');
	const [quantity, setQuantity] = useState('');
	const [locationData, setLocationData] = useState(null);
	const [showSchedule, setShowSchedule] = useState(false);
	const [isMapOpen, setIsMapOpen] = useState(false);
	const searchParams = useSearchParams();

	useEffect(() => {
		setWaterType(searchParams.get("waterType") || "");
		setQuantity(searchParams.get("waterSize") || "");
	}, [searchParams]);


	// Validation state - tracks which fields have been interacted with
	const [touched, setTouched] = useState({
		location: false,
		waterType: false,
		quantity: false
	});
	const [attemptedSubmit, setAttemptedSubmit] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();

	// Validation helpers
	const validation = {
		location: !!locationData,
		waterType: !!waterType,
		quantity: !!quantity
	};

	const showError = (field) => (touched[field] || attemptedSubmit) && !validation[field];
	const showSuccess = (field) => validation[field];

	const getFieldStatus = (field) => {
		if (showSuccess(field)) return 'success';
		if (showError(field)) return 'error';
		return 'default';
	};

	const handleOrderNow = async () => {
		setAttemptedSubmit(true);

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

		setIsLoading(true);

		await new Promise(resolve => setTimeout(resolve, 2000));

		// Navigate to available drivers page
		router.push('/orders/available-drivers');
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
				className="w-full max-w-3xl space-y-6 relative"
			>

				{/* Header */}
				<motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-6 shadow-lg border border-[#579BE8]/20 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987]">
					{/* Animated background elements */}
					<div className="absolute inset-0 overflow-hidden">
						<div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
						<div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
					</div>
					<div className="relative flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-white font-cairo mb-1"> اطلب الان</h1>
							<p className="text-white/80 text-sm">قم بملء البيانات التالية لإتمام طلبك</p>
						</div>
						<div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white border border-white/30">
							<Truck size={24} />
						</div>
					</div>
				</motion.div>

				{/* Form Card */}
				<div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl shadow-[#124987]/10 border border-[#579BE8]/20 relative overflow-hidden">

					<div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987]" />

					<div className="space-y-8">

						{/* Location Section */}
						<motion.div variants={itemVariants} className="space-y-3">
							<label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
								<MapPin size={20} className={getFieldStatus('location') === 'error' ? 'text-red-500' : 'text-[#579BE8]'} />
								موقع التوصيل
								{showSuccess('location') && (
									<motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="mr-auto">
										<CheckCircle2 size={18} className="text-[#579BE8]" />
									</motion.span>
								)}
							</label>
							<div
								onClick={() => {
									setTouched(prev => ({ ...prev, location: true }));
									setIsMapOpen(true);
								}}
								className={`group cursor-pointer relative w-full h-16 rounded-2xl transition-all duration-300 flex items-center px-4 overflow-hidden border-2 border-dashed
                                    ${getFieldStatus('location') === 'success'
										? 'bg-[#579BE8]/5 border-[#579BE8]/50 hover:border-[#579BE8]/70'
										: getFieldStatus('location') === 'error'
											? 'bg-red-50 border-red-300 hover:border-red-400'
											: 'bg-gradient-to-r from-[#579BE8]/5 to-[#124987]/5 hover:from-[#579BE8]/10 hover:to-[#124987]/10 border-[#579BE8]/30 hover:border-[#579BE8]/60'
									}`}
							>
								<div className="flex-1 flex items-center gap-3">
									<div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors 
                                        ${getFieldStatus('location') === 'success'
											? 'bg-gradient-to-r from-[#579BE8] to-[#124987] text-white'
											: getFieldStatus('location') === 'error'
												? 'bg-red-100 text-red-500'
												: 'bg-[#579BE8]/10 text-[#579BE8]'
										}`}>
										<MapPin size={20} />
									</div>
									<div className="flex flex-col items-start overflow-hidden">
										<span className={`text-sm font-bold truncate w-full text-right ${locationData ? 'text-gray-900' : getFieldStatus('location') === 'error' ? 'text-red-400' : 'text-gray-400'}`}>
											{locationData ? locationData.address : 'اضغط لتحديد الموقع على الخريطة'}
										</span>
										{locationData && <span className="text-[#579BE8] text-xs">✓ تم تحديد الموقع</span>}
									</div>
								</div>
								<div className="bg-gradient-to-r from-[#579BE8] to-[#124987] text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity absolute left-3">
									<ArrowRight size={16} />
								</div>
							</div>
							<AnimatePresence>
								{showError('location') && (
									<motion.p
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										className="text-red-500 text-xs flex items-center gap-1"
									>
										<AlertCircle size={14} />
										الرجاء تحديد موقع التوصيل
									</motion.p>
								)}
							</AnimatePresence>
						</motion.div>

						{/* Details Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Water Type */}

							<WaterTypeSelect value={waterType}
								onChange={(value) => {
									setWaterType(value);
									setTouched(prev => ({ ...prev, waterType: true }));
								}} label="	نوع المياه" />

							<ServiceSelect label="الكمية (طن)" value={quantity}
								onChange={(value) => {
									setQuantity(value);
									setTouched(prev => ({ ...prev, quantity: true }));
								}} />

						</div>

						{/* Actions */}
						<motion.div variants={itemVariants} className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
							<button
								onClick={handleOrderNow}
								disabled={isLoading}
								className="h-14 rounded-2xl bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987] hover:from-[#4a8dd8] hover:via-[#3a7dc8] hover:to-[#0d3a6a] text-white font-bold text-lg shadow-lg shadow-[#124987]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
							>
								<span>اطلب الآن</span>
								<ArrowLeft size={20} />
							</button>

							<button
								onClick={() => setShowSchedule(true)}
								disabled={isLoading}
								className="h-14 rounded-2xl bg-white border-2 border-[#579BE8]/30 text-[#579BE8] font-bold text-lg hover:bg-gradient-to-r hover:from-[#579BE8]/5 hover:to-[#124987]/5 hover:border-[#579BE8]/50 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<Calendar size={20} />
								<span>جدولة الطلب</span>
							</button>
						</motion.div>

					</div>
				</div>

			</motion.div>

			{/* Smart Loader Overlay - Covers entire screen */}
			<AnimatePresence>
				{isLoading && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							transition={{ type: "spring", stiffness: 300, damping: 25 }}
							className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-[#579BE8]/20 border border-[#579BE8]/20 min-w-[280px] relative overflow-hidden"
						>
							{/* Gradient accent */}
							<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987]" />

							<div className="flex items-center gap-4">
								{/* Animated spinner with icon */}
								<div className="relative flex-shrink-0">
									<motion.div
										animate={{ rotate: 360 }}
										transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
										className="w-12 h-12 rounded-full border-3 border-[#579BE8]/20 border-t-[#579BE8]"
										style={{ borderWidth: '3px' }}
									/>
									<div className="absolute inset-0 flex items-center justify-center">
										<motion.div
											animate={{ scale: [1, 1.1, 1] }}
											transition={{ duration: 1, repeat: Infinity }}
											className="w-7 h-7 bg-gradient-to-r from-[#579BE8] to-[#124987] rounded-lg flex items-center justify-center shadow-md"
										>
											<Search size={14} className="text-white" />
										</motion.div>
									</div>
								</div>

								{/* Text */}
								<div className="flex-1">
									<h3 className="text-sm font-bold text-[#124987] font-cairo">
										جاري البحث عن سائقين
									</h3>
									<div className="flex items-center gap-1 mt-1">
										<p className="text-gray-400 text-xs">
											يرجى الانتظار
										</p>
										{/* Animated dots */}
										<div className="flex gap-0.5">
											{[0, 1, 2].map((i) => (
												<motion.span
													key={i}
													animate={{ opacity: [0.3, 1, 0.3] }}
													transition={{
														duration: 0.8,
														repeat: Infinity,
														delay: i * 0.2
													}}
													className="w-1 h-1 bg-[#579BE8] rounded-full"
												/>
											))}
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

