'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Info, MapPin, Droplets, Scale } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, addHours, startOfDay, isAfter, addDays, differenceInHours } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function OrderSchedulePage({ 
	onBack, 
	onSchedule, 
	locationData, 
	selectedSavedLocation,
	isManualLocation,
	waterType,
	quantity,
	waterTypes,
	services,
	isSubmitting: initialIsSubmitting 
}) {
	const router = useRouter();
	const [selectedDate, setSelectedDate] = useState(null);
	const [selectedTime, setSelectedTime] = useState('');
	const [notes, setNotes] = useState('');
	const [errors, setErrors] = useState({});
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showTimePicker, setShowTimePicker] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(initialIsSubmitting || false);
	const [showOrderSummary, setShowOrderSummary] = useState(false);
	
	const datePickerRef = useRef(null);
	const timePickerRef = useRef(null);

	// Initialize with tomorrow's date
	useEffect(() => {
		const tomorrow = startOfDay(addDays(new Date(), 1));
		setSelectedDate(tomorrow);
		setCurrentMonth(tomorrow);
	}, []);

	// Close pickers when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
				setShowDatePicker(false);
			}
			if (timePickerRef.current && !timePickerRef.current.contains(event.target)) {
				setShowTimePicker(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Smart validation function
	const validateForm = () => {
		const newErrors = {};
		const now = new Date();
		
		// Location validation
		if (!locationData) {
			newErrors.location = 'الرجاء تحديد موقع التوصيل أولاً';
		}
		
		// Water type validation
		if (!waterType) {
			newErrors.waterType = 'الرجاء اختيار نوع المياه';
		}
		
		// Quantity validation
		if (!quantity) {
			newErrors.quantity = 'الرجاء اختيار الكمية';
		}
		
		// Date validation
		if (!selectedDate) {
			newErrors.date = 'الرجاء اختيار تاريخ التوصيل';
		} else {
			const tomorrow = startOfDay(addDays(now, 1));
			if (isBefore(selectedDate, tomorrow)) {
				newErrors.date = 'يجب أن يكون التاريخ غداً أو بعد';
			}
			
			// Max 30 days in future
			const maxDate = addDays(now, 30);
			if (isAfter(selectedDate, maxDate)) {
				newErrors.date = 'الحد الأقصى للجدولة هو 30 يوماً من الآن';
			}
		}
		
		// Time validation
		if (!selectedTime) {
			newErrors.time = 'الرجاء اختيار وقت التوصيل';
		} else if (selectedDate) {
			const [hours, minutes] = selectedTime.split(':');
			const selectedDateTime = new Date(selectedDate);
			selectedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
			
			const minDateTime = addHours(now, 1); // Minimum 1 hour from now
			
			if (isBefore(selectedDateTime, minDateTime)) {
				newErrors.time = 'يجب أن يكون وقت التوصيل بعد ساعة على الأقل من الآن';
			}
			
			// Business hours validation (8 AM to 8 PM)
			const selectedHour = parseInt(hours);
			if (selectedHour < 8 || selectedHour > 20) {
				newErrors.time = 'وقت التوصيل المتاح من 8 صباحاً حتى 8 مساءً';
			}
		}
		
		// Notes length validation
		if (notes.length > 500) {
			newErrors.notes = 'الحد الأقصى للملاحظات هو 500 حرف';
		}
		
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Real-time validation
	useEffect(() => {
		if (Object.keys(errors).length > 0) {
			validateForm();
		}
	}, [selectedDate, selectedTime, notes, locationData, waterType, quantity]);

	const handleSubmit = async (e) => {
		if (e) e.preventDefault();
		
		if (!validateForm()) {
			// toast.error('يرجى تصحيح الأخطاء قبل المتابعة');
			return;
		}

		setIsSubmitting(true);
		
		// Combine date and time
		const [hours, minutes] = selectedTime.split(':');
		const dateTimeObj = new Date(selectedDate);
		dateTimeObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
		
		// Format date for API
		const year = dateTimeObj.getFullYear();
		const month = String(dateTimeObj.getMonth() + 1).padStart(2, '0');
		const day = String(dateTimeObj.getDate()).padStart(2, '0');
		const hoursStr = String(dateTimeObj.getHours()).padStart(2, '0');
		const minutesStr = String(dateTimeObj.getMinutes()).padStart(2, '0');
		const secondsStr = String(dateTimeObj.getSeconds()).padStart(2, '0');
		
		const dateTime = `${year}-${month}-${day} ${hoursStr}:${minutesStr}:${secondsStr}`;
		
		try {
			await onSchedule({
				dateTime,
				notes: notes || "توصيل مجدول",
				locationData,
				selectedSavedLocation,
				isManualLocation,
				waterType,
				quantity
			});
			
			// Show success toast
			// toast.success('تم جدولة الطلب بنجاح!', {
			// 	duration: 3000,
			// 	icon: '✅',
			// 	style: {
			// 		background: '#10b981',
			// 		color: 'white',
			// 		fontWeight: 'bold'
			// 	}
			// });
			
			// Redirect to home after 1.5 seconds
			setTimeout(() => {
				router.push('/');
			}, 1500);
			
		} catch (error) {
			setErrors({ submit: 'حدث خطأ في جدولة الطلب. يرجى المحاولة مرة أخرى' });
			toast.error('حدث خطأ في جدولة الطلب');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Generate time slots (8 AM to 8 PM) with smart grouping
	const generateTimeSlots = () => {
		const slots = [];
		const timeGroups = {
			'صباحاً': [],
			'ظهراً': [],
			'مساءً': []
		};
		
		// Generate slots for 8 AM to 8 PM
		for (let hour = 8; hour <= 20; hour++) {
			const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
			
			// Categorize by time of day
			if (hour < 12) {
				timeGroups['صباحاً'].push(timeSlot);
			} else if (hour < 17) {
				timeGroups['ظهراً'].push(timeSlot);
			} else {
				timeGroups['مساءً'].push(timeSlot);
			}
			
			// Add half hour slots (except for 8:30 PM)
			if (hour !== 20) {
				const halfHourSlot = `${hour.toString().padStart(2, '0')}:30`;
				if (hour < 12) {
					timeGroups['صباحاً'].push(halfHourSlot);
				} else if (hour < 17) {
					timeGroups['ظهراً'].push(halfHourSlot);
				} else {
					timeGroups['مساءً'].push(halfHourSlot);
				}
			}
		}
		
		return timeGroups;
	};

	const timeGroups = generateTimeSlots();

	// Calendar functions
	const nextMonth = () => {
		setCurrentMonth(addMonths(currentMonth, 1));
	};

	const prevMonth = () => {
		const newMonth = subMonths(currentMonth, 1);
		const tomorrow = startOfDay(addDays(new Date(), 1));
		
		// Don't allow going back before current month if it's before tomorrow
		if (newMonth >= tomorrow || newMonth.getMonth() >= tomorrow.getMonth()) {
			setCurrentMonth(newMonth);
		}
	};

	const daysInMonth = eachDayOfInterval({
		start: startOfMonth(currentMonth),
		end: endOfMonth(currentMonth)
	});

	const isDateDisabled = (date) => {
		const tomorrow = startOfDay(addDays(new Date(), 1));
		const maxDate = addDays(new Date(), 30);
		
		return date < tomorrow || date > maxDate;
	};

	const handleDateSelect = (date) => {
		if (isDateDisabled(date)) return;
		
		setSelectedDate(date);
		setShowDatePicker(false);
		
		// Reset time when date changes
		setSelectedTime('');
		
		// Show time picker on mobile, auto-open on desktop
		if (window.innerWidth < 768) {
			setShowTimePicker(true);
		}
		
		// toast.success(`تم اختيار ${format(date, 'dd MMMM yyyy', { locale: ar })}`, {
		// 	duration: 2000,
		// 	icon: '📅'
		// });
	};

	const handleTimeSelect = (time) => {
		setSelectedTime(time);
		setShowTimePicker(false);
		
		// Validate time selection
		const [hours, minutes] = time.split(':');
		const selectedDateTime = new Date(selectedDate);
		selectedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
		
		const now = new Date();
		const minDateTime = addHours(now, 1);
		
		if (isBefore(selectedDateTime, minDateTime)) {
			setErrors(prev => ({
				...prev,
				time: 'يجب أن يكون وقت التوصيل بعد ساعة على الأقل من الآن'
			}));
		} else {
			setErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors.time;
				return newErrors;
			});
		}
		
		// toast.success(`تم اختيار الساعة ${time}`, {
		// 	duration: 2000,
		// 	icon: '⏰'
		// });
	};

	// Format selected date for display
	const formattedSelectedDate = selectedDate 
		? format(selectedDate, 'EEEE، d MMMM yyyy', { locale: ar })
		: 'لم يتم الاختيار';

	// Get selected water type name
	const selectedWaterTypeName = waterTypes?.find(wt => wt.id.toString() === waterType)?.name || 'غير محدد';

	// Get selected service name
	const selectedServiceName = services?.find(s => s.id.toString() === quantity)?.name || 'غير محدد';

	// Location info display
	const locationInfo = selectedSavedLocation 
		? `محفوظ: ${selectedSavedLocation.name}`
		: isManualLocation && locationData
			? `موقع جديد: ${locationData.address?.substring(0, 30)}...`
			: 'لم يتم التحديد';

	// Get min and max dates
	const tomorrow = startOfDay(addDays(new Date(), 1));
	const maxDate = addDays(new Date(), 30);

	// Animation variants
	const fadeInUp = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 }
	};

	const scaleIn = {
		hidden: { opacity: 0, scale: 0.9 },
		visible: { opacity: 1, scale: 1 }
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-cyan-50/50 p-3 sm:p-4 md:p-6 lg:p-8 flex justify-center items-start pt-12 sm:pt-16 md:pt-20">
			<motion.div
				initial="hidden"
				animate="visible"
				variants={fadeInUp}
				className="w-full max-w-4xl space-y-4 sm:space-y-6"
			>
				{/* Header */}
				<div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-[#579BE8]/20 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987]">
					<div className="absolute inset-0 ">
						<div className="absolute -top-6 sm:-top-10 -right-6 sm:-right-10 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
						<div className="absolute -bottom-6 sm:-bottom-10 -left-6 sm:-left-10 w-24 h-24 sm:w-32 sm:h-32 bg-white/5 rounded-full blur-xl" />
					</div>
					<div className="relative ">
						<div className=" flex justify-between items-center gap-3">
							<div>
								<h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white font-cairo mb-1 sm:mb-2">جدولة الطلب</h1>
							<p className="text-white/80 text-xs sm:text-sm md:text-base">
								حدد التاريخ والوقت المناسب للتوصيل
							</p>
							</div>
							
				
							<button
								onClick={onBack}
								className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center text-white border border-white/30 hover:bg-white/30 transition-colors flex-shrink-0 self-end sm:self-auto"
								title="رجوع"
							>
								<ArrowLeft size={20} className="sm:w-6 sm:h-6" />
							</button>
						</div>
					
					</div>

				
				</div>

				{/* Form Card */}
				<div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl shadow-[#124987]/10 border border-[#579BE8]/20 relative ">
					<div className="absolute top-0 left-0 w-full h-1 sm:h-2 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987]" />

					<form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
						{/* Date and Time Selection - Responsive Grid */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Date Selection */}
							<div className="space-y-3 sm:space-y-4">
								<label className="flex items-center gap-2 text-gray-700 font-bold text-sm sm:text-base">
									<Calendar size={18} className="text-[#579BE8]" />
									تاريخ التوصيل
									{selectedDate && !errors.date && (
										<CheckCircle2 size={16} className="text-green-500 mr-auto" />
									)}
								</label>
								
								<div className="relative" ref={datePickerRef}>
									<button
										type="button"
										onClick={() => {
											setShowDatePicker(!showDatePicker);
											setShowTimePicker(false);
										}}
										className={`w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 px-3 sm:px-4 text-right font-medium focus:outline-none focus:ring-2 transition-all flex items-center justify-between
											${errors.date 
												? 'border-red-300 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-200'
												: selectedDate 
													? 'border-green-300 bg-green-50/30 text-gray-700 focus:border-[#579BE8] focus:ring-[#579BE8]/20'
													: 'border-[#579BE8]/30 bg-gray-50 text-gray-700 focus:border-[#579BE8] focus:ring-[#579BE8]/20'
											}`}
									>
										<span className="text-xs sm:text-sm md:text-base truncate pr-2">
											{formattedSelectedDate}
										</span>
										<div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
											<Calendar size={16} className={`${errors.date ? 'text-red-400' : 'text-gray-400'}`} />
											{showDatePicker ? (
												<ChevronLeft size={16} className="text-[#579BE8]" />
											) : (
												<ChevronRight size={16} className="text-[#579BE8]" />
											)}
										</div>
									</button>
									
									{/* Error Message */}
									{errors.date && (
										<motion.p
											initial={{ opacity: 0, y: -5 }}
											animate={{ opacity: 1, y: 0 }}
											className="text-red-600 text-xs mt-1 flex items-center gap-1 px-1"
										>
											<AlertCircle size={12} />
											{errors.date}
										</motion.p>
									)}
									
									{/* Calendar Picker */}
									<AnimatePresence>
										{showDatePicker && (
											<motion.div
												initial="hidden"
												animate="visible"
												exit="hidden"
												variants={scaleIn}
												transition={{ duration: 0.2 }}
												className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-[#579BE8]/20 z-50 overflow-hidden"
											>
												{/* Calendar Header */}
												<div className="p-3 sm:p-4 border-b border-gray-100 bg-gradient-to-r from-[#579BE8]/5 to-[#124987]/5">
													<div className="flex items-center justify-between mb-3">
														<button
															type="button"
															onClick={prevMonth}
															className="p-1.5 sm:p-2 hover:bg-[#579BE8]/10 rounded-lg sm:rounded-xl transition-colors"
															title="الشهر السابق"
														>
															<ChevronRight size={18} className="text-[#579BE8]" />
														</button>
														<h3 className="text-sm sm:text-base font-bold text-gray-800">
															{format(currentMonth, 'MMMM yyyy', { locale: ar })}
														</h3>
														<button
															type="button"
															onClick={nextMonth}
															className="p-1.5 sm:p-2 hover:bg-[#579BE8]/10 rounded-lg sm:rounded-xl transition-colors"
															title="الشهر التالي"
														>
															<ChevronLeft size={18} className="text-[#579BE8]" />
														</button>
													</div>
													
													{/* Day Headers */}
													<div className="grid grid-cols-7 gap-1 mb-2">
														{['أ', 'إ', 'ث', 'أ', 'خ', 'ج', 'س'].map((day, idx) => (
															<div key={idx} className="text-center text-xs font-medium text-gray-700 p-1">
																{day}
															</div>
														))}
													</div>
												</div>
												
												{/* Calendar Days */}
												<div className="p-2 sm:p-3">
													<div className="grid grid-cols-7 gap-1">
														{daysInMonth.map((day, dayIdx) => {
															const isSelected = selectedDate && isSameDay(day, selectedDate);
															const isDisabled = isDateDisabled(day);
															const isCurrentMonth = isSameMonth(day, currentMonth);
															const isTodayDate = isToday(day);
															
															return (
																<button
																	type="button"
																	key={day.toString()}
																	onClick={() => handleDateSelect(day)}
																	disabled={isDisabled}
																	className={`
																		h-8 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-all relative
																		${isSelected
																			? 'bg-gradient-to-r from-[#579BE8] to-[#124987] text-white shadow-md'
																			: isTodayDate
																				? 'bg-[#579BE8]/10 text-[#579BE8] border border-[#579BE8]/30'
																				: isDisabled
																					? 'bg-gray-100 text-gray-400 cursor-not-allowed'
																					: isCurrentMonth
																						? 'bg-white text-gray-700 hover:bg-[#579BE8]/10 hover:text-[#579BE8] hover:shadow-sm'
																						: 'bg-gray-50 text-gray-400'
																		}
																	`}
																	title={format(day, 'dd MMMM yyyy', { locale: ar })}
																>
																	{format(day, 'd')}
																	{isTodayDate && !isSelected && (
																		<div className="absolute -top-1 -right-1 w-2 h-2 bg-[#579BE8] rounded-full"></div>
																	)}
																</button>
															);
														})}
													</div>
												</div>
												
												{/* Calendar Footer */}
												<div className="p-3 border-t border-gray-100 bg-gray-50/50">
													<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
														<div className="flex items-center gap-2">
															<div className="w-3 h-3 rounded-full bg-[#579BE8]"></div>
															<span className="text-xs text-gray-600">يوم محدد</span>
														</div>
														<div className="flex items-center gap-2">
															<div className="w-3 h-3 rounded-full bg-gray-300"></div>
															<span className="text-xs text-gray-600">اليوم</span>
														</div>
														<div className="flex items-center gap-2">
															<div className="w-3 h-3 rounded-full bg-gray-200"></div>
															<span className="text-xs text-gray-600">غير متاح</span>
														</div>
													</div>
													<p className="text-xs text-gray-700 mt-2 text-center">
														من {format(tomorrow, 'dd/MM')} إلى {format(maxDate, 'dd/MM')}
													</p>
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							</div>

							{/* Time Selection */}
							<div className="space-y-3 sm:space-y-4">
								<label className="flex items-center gap-2 text-gray-700 font-bold text-sm sm:text-base">
									<Clock size={18} className="text-[#579BE8]" />
									وقت التوصيل
									{selectedTime && !errors.time && (
										<CheckCircle2 size={16} className="text-green-500 mr-auto" />
									)}
								</label>
								
								<div className="relative" ref={timePickerRef}>
									<button
										type="button"
										onClick={() => {
											if (!selectedDate) {
												toast.error('الرجاء اختيار التاريخ أولاً');
												return;
											}
											setShowTimePicker(!showTimePicker);
											setShowDatePicker(false);
										}}
										disabled={!selectedDate}
										className={`w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 px-3 sm:px-4 text-right font-medium focus:outline-none focus:ring-2 transition-all flex items-center justify-between
											${!selectedDate 
												? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
												: errors.time 
													? 'border-red-300 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-200'
													: selectedTime 
														? 'border-green-300 bg-green-50/30 text-gray-700 focus:border-[#579BE8] focus:ring-[#579BE8]/20'
														: 'border-[#579BE8]/30 bg-gray-50 text-gray-700 focus:border-[#579BE8] focus:ring-[#579BE8]/20'
											}`}
									>
										<span className="text-xs sm:text-sm md:text-base truncate pr-2">
											{selectedTime || 'اختر الوقت المناسب'}
										</span>
										<div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
											<Clock size={16} className={`${errors.time ? 'text-red-400' : 'text-gray-400'}`} />
											{showTimePicker ? (
												<ChevronLeft size={16} className="text-[#579BE8]" />
											) : (
												<ChevronRight size={16} className="text-[#579BE8]" />
											)}
										</div>
									</button>
									
									{/* Error Message */}
									{errors.time && (
										<motion.p
											initial={{ opacity: 0, y: -5 }}
											animate={{ opacity: 1, y: 0 }}
											className="text-red-600 text-xs mt-1 flex items-center gap-1 px-1"
										>
											<AlertCircle size={12} />
											{errors.time}
										</motion.p>
									)}
									
									{/* Time Picker */}
									<AnimatePresence>
										{showTimePicker && selectedDate && (
											<motion.div
												initial="hidden"
												animate="visible"
												exit="hidden"
												variants={scaleIn}
												transition={{ duration: 0.2 }}
												className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-[#579BE8]/20 z-50 overflow-hidden max-h-[60vh] sm:max-h-[400px] flex flex-col"
											>
												<div className="p-3 sm:p-4 border-b border-gray-100 bg-gradient-to-r from-[#579BE8]/5 to-[#124987]/5 sticky top-0">
													<h4 className="text-sm sm:text-base font-bold text-gray-700 mb-2">
														اختر الوقت المناسب
													</h4>
													<p className="text-xs text-gray-600">
														{format(selectedDate, 'EEEE، d MMMM', { locale: ar })}
													</p>
												</div>
												
												<div className="flex-1 overflow-y-auto p-3 sm:p-4">
													{Object.entries(timeGroups).map(([period, times]) => (
														<div key={period} className="mb-4 last:mb-0">
															<h5 className="text-xs font-bold text-gray-700 mb-2 sticky top-0 bg-white py-1">
																{period}
															</h5>
															<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
																{times.map((time) => {
																	const [hours, minutes] = time.split(':');
																	const timeDate = new Date(selectedDate);
																	timeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
																	
																	const now = new Date();
																	const isTimeDisabled = isBefore(timeDate, addHours(now, 1));
																	const isSelected = selectedTime === time;
																	
																	return (
																		<button
																			type="button"
																			key={time}
																			onClick={() => !isTimeDisabled && handleTimeSelect(time)}
																			disabled={isTimeDisabled}
																			className={`
																				h-10 rounded-lg text-xs sm:text-sm font-medium transition-all relative
																				${isSelected
																					? 'bg-gradient-to-r from-[#579BE8] to-[#124987] text-white shadow-md'
																					: isTimeDisabled
																						? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
																						: 'bg-white border border-gray-200 hover:border-[#579BE8] hover:bg-[#579BE8]/5 text-gray-700 hover:text-[#579BE8] hover:shadow-sm'
																				}
																			`}
																			title={isTimeDisabled ? 'غير متاح (قريب جداً)' : time}
																		>
																			{time}
																			{isTimeDisabled && (
																				<div className="absolute -top-1 -right-1 w-2 h-2 bg-gray-400 rounded-full"></div>
																			)}
																		</button>
																	);
																})}
															</div>
														</div>
													))}
												</div>
												
											</motion.div>
										)}
									</AnimatePresence>
								</div>
								
								{selectedDate && selectedTime && !errors.time && (
									<div className="p-2 sm:p-3 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-xl border border-green-200">
										<p className="text-xs sm:text-sm text-green-700 font-medium text-center">
											✓ {format(selectedDate, 'EEEE، d MMMM', { locale: ar })} الساعة {selectedTime}
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Notes */}
						<div className="space-y-2 sm:space-y-3 sm:mb-2 mb-0">
							<div className="flex items-center justify-between">
								<label className="text-gray-700 font-bold text-sm sm:text-base">ملاحظات إضافية (اختياري)</label>
								<span className="text-xs text-gray-700">
									{notes.length}/500 حرف
								</span>
							</div>
							<textarea
								value={notes}
								onChange={(e) => {
									setNotes(e.target.value);
									if (e.target.value.length > 500) {
										setErrors(prev => ({
											...prev,
											notes: 'الحد الأقصى للملاحظات هو 500 حرف'
										}));
									} else {
										setErrors(prev => {
											const newErrors = { ...prev };
											delete newErrors.notes;
											return newErrors;
										});
									}
								}}
								placeholder="أي ملاحظات إضافية للتوصيل (رقم البوابة، الطابق، تعليمات خاصة...)"
								className="w-full h-28 sm:h-32 rounded-xl sm:rounded-2xl border-2 border-[#579BE8]/30 bg-gray-50 p-3 sm:p-4 text-right resize-none focus:border-[#579BE8] focus:outline-none focus:ring-2 focus:ring-[#579BE8]/20 transition-all text-sm sm:text-base"
								maxLength={500}
							/>
							{errors.notes && (
								<p className="text-red-600 text-xs flex items-center gap-1">
									<AlertCircle size={12} />
									{errors.notes}
								</p>
							)}
						
						</div>

						{/* Form Validation Summary */}
						{Object.keys(errors).length > 0 && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4"
							>
								<h4 className="text-red-700 font-bold text-sm sm:text-base mb-2 flex items-center gap-2">
									<AlertCircle size={16} />
									يرجى تصحيح الأخطاء التالية
								</h4>
								<ul className="space-y-1">
									{Object.entries(errors).map(([field, message]) => (
										<li key={field} className="text-red-600 text-xs sm:text-sm flex items-center gap-2">
											<div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
											{message}
										</li>
									))}
								</ul>
							</motion.div>
						)}

						{/* Actions */}
						<div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
							<button
								type="submit"
								disabled={isSubmitting || Object.keys(errors).length > 0}
								className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987] hover:from-[#4a8dd8] hover:via-[#3a7dc8] hover:to-[#0d3a6a] text-white font-bold text-sm sm:text-lg shadow-lg shadow-[#124987]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
							>
								{isSubmitting ? (
									<>
										<div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										<span className="text-xs sm:text-sm">جاري الجدولة...</span>
									</>
								) : (
									<>
										<span className="text-xs sm:text-sm md:text-base">تأكيد الجدولة</span>
										<CheckCircle2 size={16} className="sm:w-5 sm:h-5" />
									</>
								)}
							</button>

							<button
								type="button"
								onClick={onBack}
								disabled={isSubmitting}
								className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-white border-2 border-[#579BE8]/30 text-[#579BE8] font-bold text-sm sm:text-lg hover:bg-gradient-to-r hover:from-[#579BE8]/5 hover:to-[#124987]/5 hover:border-[#579BE8]/50 hidden md:flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<ArrowLeft size={16} className="sm:w-5 sm:h-5" />
								<span className="text-xs sm:text-sm md:text-base">رجوع</span>
							</button>
						</div>
						
						
					</form>
				</div>
				
				{/* Success Toast Placeholder */}
				<div id="schedule-success-toast" className="fixed bottom-4 right-4 z-50"></div>
			</motion.div>
		</div>
	);
}