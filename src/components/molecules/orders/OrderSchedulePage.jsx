'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, isToday, isBefore, addHours } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';

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
	isSubmitting 
}) {
	const [selectedDate, setSelectedDate] = useState(null);
	const [selectedTime, setSelectedTime] = useState('');
	const [notes, setNotes] = useState('');
	const [error, setError] = useState('');
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showTimePicker, setShowTimePicker] = useState(false);

	// Initialize with tomorrow's date
	useEffect(() => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(0, 0, 0, 0);
		setSelectedDate(tomorrow);
	}, []);

	const handleSubmit = async (e) => {
		if (e) e.preventDefault();
		setError('');

		// Validate required data
		if (!locationData) {
			setError('الرجاء تحديد موقع التوصيل أولاً');
			return;
		}
		if (!waterType) {
			setError('الرجاء اختيار نوع المياه');
			return;
		}
		if (!quantity) {
			setError('الرجاء اختيار الكمية');
			return;
		}
		if (!selectedDate || !selectedTime) {
			setError('الرجاء تحديد التاريخ والوقت');
			return;
		}

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
		
		// Validate future date
		const now = new Date();
		const nowPlusOneHour = addHours(now, 1); // Minimum 1 hour from now
		
		if (dateTimeObj <= nowPlusOneHour) {
			setError('يجب اختيار وقت بعد ساعة على الأقل من الوقت الحالي');
			return;
		}

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
		} catch (error) {
			setError('حدث خطأ في جدولة الطلب');
		}
	};

	// Generate time slots (8 AM to 8 PM)
	const timeSlots = [];
	for (let hour = 8; hour <= 20; hour++) {
		timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
		if (hour !== 20) {
			timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
		}
	}

	// Calendar functions
	const nextMonth = () => {
		setCurrentMonth(addMonths(currentMonth, 1));
	};

	const prevMonth = () => {
		const newMonth = subMonths(currentMonth, 1);
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		
		// Don't allow going back before tomorrow
		if (newMonth >= tomorrow || newMonth.getMonth() >= tomorrow.getMonth()) {
			setCurrentMonth(newMonth);
		}
	};

	const daysInMonth = eachDayOfInterval({
		start: startOfMonth(currentMonth),
		end: endOfMonth(currentMonth)
	});

	const isDateDisabled = (date) => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(0, 0, 0, 0);
		
		return date < tomorrow;
	};

	const handleDateSelect = (date) => {
		if (isDateDisabled(date)) return;
		
		setSelectedDate(date);
		setShowDatePicker(false);
		
		// Reset time when date changes
		setSelectedTime('');
		setShowTimePicker(true);
		
		toast.success(`تم اختيار ${format(date, 'dd MMMM yyyy', { locale: ar })}`);
	};

	const handleTimeSelect = (time) => {
		setSelectedTime(time);
		setShowTimePicker(false);
		
		toast.success(`تم اختيار الساعة ${time}`);
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

	// Get minimum date (tomorrow)
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(0, 0, 0, 0);
	const minDate = tomorrow.toISOString().split('T')[0];

	// Get maximum date (30 days from now)
	const maxDate = new Date();
	maxDate.setDate(maxDate.getDate() + 30);
	const maxDateStr = maxDate.toISOString().split('T')[0];

	return (
		<div className="min-h-screen bg-gray-50/50 p-4 md:p-8 flex justify-center items-start pt-12 md:pt-16">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -20 }}
				className="w-full max-w-4xl space-y-6"
			>
				{/* Header */}
				<div className="relative overflow-hidden rounded-3xl p-6 shadow-lg border border-[#579BE8]/20 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987]">
					<div className="absolute inset-0 overflow-hidden">
						<div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
						<div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
					</div>
					<div className="relative flex items-center justify-between">
						<div className="flex-1">
							<h1 className="text-2xl font-bold text-white font-cairo mb-1">جدولة الطلب</h1>
							<p className="text-white/80 text-sm">حدد التاريخ والوقت المناسب للتوصيل</p>
							
							{/* Order Summary */}
							<div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
								<div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
									<p className="text-white/80 text-xs mb-1">الموقع</p>
									<p className="text-white text-sm font-medium truncate">{locationInfo}</p>
								</div>
								<div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
									<p className="text-white/80 text-xs mb-1">نوع المياه</p>
									<p className="text-white text-sm font-medium">{selectedWaterTypeName}</p>
								</div>
								<div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
									<p className="text-white/80 text-xs mb-1">الكمية</p>
									<p className="text-white text-sm font-medium">{selectedServiceName}</p>
								</div>
							</div>
						</div>
						<button
							onClick={onBack}
							className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white border border-white/30 hover:bg-white/30 transition-colors ml-4 flex-shrink-0"
						>
							<ArrowLeft size={24} />
						</button>
					</div>
				</div>

				{/* Form Card */}
				<div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl shadow-[#124987]/10 border border-[#579BE8]/20 relative overflow-hidden">
					<div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987]" />

					<form onSubmit={handleSubmit} className="space-y-8">
						{/* Date Selection with Calendar */}
						<div className="space-y-4">
							<label className="flex items-center gap-2 text-gray-700 font-bold">
								<Calendar size={20} className="text-[#579BE8]" />
								تاريخ التوصيل
							</label>
							
							{/* Selected Date Display */}
							<div className="relative">
								<button
									type="button"
									onClick={() => setShowDatePicker(!showDatePicker)}
									className="w-full h-14 rounded-2xl border-2 border-[#579BE8]/30 bg-gray-50 px-4 text-right font-medium text-gray-700 focus:border-[#579BE8] focus:outline-none focus:ring-2 focus:ring-[#579BE8]/20 transition-all flex items-center justify-between"
								>
									<span className="text-sm md:text-base">
										{formattedSelectedDate}
									</span>
									<div className="flex items-center gap-2">
										{selectedDate && (
											<CheckCircle2 size={18} className="text-[#579BE8]" />
										)}
										<Calendar size={18} className="text-gray-400" />
									</div>
								</button>
								
								{/* Calendar Picker */}
								{showDatePicker && (
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#579BE8]/20 z-50 overflow-hidden"
									>
										{/* Calendar Header */}
										<div className="p-4 border-b border-gray-100">
											<div className="flex items-center justify-between mb-4">
												<button
													type="button"
													onClick={prevMonth}
													className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
												>
													<ChevronRight size={20} />
												</button>
												<h3 className="text-lg font-bold text-gray-800">
													{format(currentMonth, 'MMMM yyyy', { locale: ar })}
												</h3>
												<button
													type="button"
													onClick={nextMonth}
													className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
												>
													<ChevronLeft size={20} />
												</button>
											</div>
											
											{/* Day Headers */}
											<div className="grid grid-cols-7 gap-1 mb-2">
												{['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map((day) => (
													<div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
														{day}
													</div>
												))}
											</div>
										</div>
										
										{/* Calendar Days */}
										<div className="p-4">
											<div className="grid grid-cols-7 gap-1">
												{daysInMonth.map((day, dayIdx) => {
													const isSelected = selectedDate && isSameDay(day, selectedDate);
													const isDisabled = isDateDisabled(day);
													const isCurrentMonth = isSameMonth(day, currentMonth);
													
													return (
														<button
															type="button"
															key={day.toString()}
															onClick={() => handleDateSelect(day)}
															disabled={isDisabled}
															className={`
																h-10 rounded-xl text-sm font-medium transition-all
																${isSelected
																	? 'bg-gradient-to-r from-[#579BE8] to-[#124987] text-white'
																	: isDisabled
																		? 'bg-gray-100 text-gray-400 cursor-not-allowed'
																		: isCurrentMonth
																			? 'bg-white text-gray-700 hover:bg-[#579BE8]/10 hover:text-[#579BE8]'
																			: 'bg-gray-50 text-gray-400'
																}
															`}
														>
															{format(day, 'd')}
														</button>
													);
												})}
											</div>
										</div>
										
										{/* Calendar Footer */}
										<div className="p-4 border-t border-gray-100 bg-gray-50">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<div className="w-3 h-3 rounded-full bg-[#579BE8]"></div>
													<span className="text-xs text-gray-600">يوم محدد</span>
												</div>
												<div className="flex items-center gap-2">
													<div className="w-3 h-3 rounded-full bg-gray-200"></div>
													<span className="text-xs text-gray-600">غير متاح</span>
												</div>
											</div>
										</div>
									</motion.div>
								)}
							</div>
							
							<p className="text-xs text-gray-500 px-2">
								يمكنك الجدولة من {format(tomorrow, 'dd MMMM', { locale: ar })} إلى {format(maxDate, 'dd MMMM', { locale: ar })}
							</p>
						</div>

						{/* Time Selection */}
						<div className="space-y-4">
							<label className="flex items-center gap-2 text-gray-700 font-bold">
								<Clock size={20} className="text-[#579BE8]" />
								وقت التوصيل
							</label>
							
							{/* Selected Time Display */}
							<div className="relative">
								<button
									type="button"
									onClick={() => {
										if (!selectedDate) {
											toast.error('الرجاء اختيار التاريخ أولاً');
											return;
										}
										setShowTimePicker(!showTimePicker);
									}}
									disabled={!selectedDate}
									className="w-full h-14 rounded-2xl border-2 border-[#579BE8]/30 bg-gray-50 px-4 text-right font-medium text-gray-700 focus:border-[#579BE8] focus:outline-none focus:ring-2 focus:ring-[#579BE8]/20 transition-all flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<span className="text-sm md:text-base">
										{selectedTime || 'اختر الوقت المناسب'}
									</span>
									<div className="flex items-center gap-2">
										{selectedTime && (
											<CheckCircle2 size={18} className="text-[#579BE8]" />
										)}
										<Clock size={18} className="text-gray-400" />
									</div>
								</button>
								
								{/* Time Picker */}
								{showTimePicker && selectedDate && (
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#579BE8]/20 z-50 overflow-hidden"
									>
										<div className="p-4 border-b border-gray-100">
											<h4 className="text-sm font-bold text-gray-700 mb-3">
												اختر الوقت المناسب
											</h4>
										</div>
										
										<div className="p-4 max-h-60 overflow-y-auto">
											<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
												{timeSlots.map((time) => {
													const [hours, minutes] = time.split(':');
													const timeDate = new Date(selectedDate);
													timeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
													
													const now = new Date();
													const nowPlusOneHour = addHours(now, 1);
													const isTimeDisabled = timeDate <= nowPlusOneHour;
													
													return (
														<button
															type="button"
															key={time}
															onClick={() => !isTimeDisabled && handleTimeSelect(time)}
															disabled={isTimeDisabled}
															className={`
																h-12 rounded-xl border-2 transition-all font-medium
																${selectedTime === time
																	? 'bg-gradient-to-r from-[#579BE8] to-[#124987] text-white border-[#579BE8]'
																	: isTimeDisabled
																		? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
																		: 'bg-white border-gray-200 hover:border-[#579BE8] hover:bg-[#579BE8]/5 text-gray-700'
																}
															`}
														>
															{time}
														</button>
													);
												})}
											</div>
										</div>
										
										<div className="p-4 border-t border-gray-100 bg-gray-50">
											<p className="text-xs text-gray-600 text-center">
												توقيت السعودية (UTC+3)
											</p>
										</div>
									</motion.div>
								)}
							</div>
							
							{selectedDate && selectedTime && (
								<div className="p-3 bg-[#579BE8]/5 rounded-xl border border-[#579BE8]/20">
									<p className="text-sm text-[#579BE8] font-medium text-center">
										تم اختيار {formattedSelectedDate} الساعة {selectedTime}
									</p>
								</div>
							)}
						</div>

						{/* Notes */}
						<div className="space-y-3">
							<label className="text-gray-700 font-bold">ملاحظات إضافية (اختياري)</label>
							<textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="أي ملاحظات إضافية للتوصيل..."
								className="w-full h-32 rounded-2xl border-2 border-[#579BE8]/30 bg-gray-50 p-4 text-right resize-none focus:border-[#579BE8] focus:outline-none focus:ring-2 focus:ring-[#579BE8]/20 transition-all"
								maxLength={500}
							/>
							<div className="flex justify-between items-center">
								<p className="text-xs text-gray-500">
									{notes.length}/500 حرف
								</p>
								<p className="text-xs text-gray-500">
									يمكنك إضافة ملاحظات مثل رقم البوابة، الطابق، إلخ
								</p>
							</div>
						</div>

						{/* Error Message */}
						{error && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl"
							>
								<AlertCircle size={18} />
								<span className="text-sm">{error}</span>
							</motion.div>
						)}

						{/* Validation Summary */}
						<div className="space-y-2">
							<h4 className="text-sm font-bold text-gray-700">ملخص الطلب:</h4>
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<div className={`w-2 h-2 rounded-full ${locationData ? 'bg-green-500' : 'bg-red-500'}`}></div>
									<span className="text-xs text-gray-600">الموقع: {locationData ? '✓ محدد' : '✗ غير محدد'}</span>
								</div>
								<div className="flex items-center gap-2">
									<div className={`w-2 h-2 rounded-full ${waterType ? 'bg-green-500' : 'bg-red-500'}`}></div>
									<span className="text-xs text-gray-600">نوع المياه: {waterType ? '✓ محدد' : '✗ غير محدد'}</span>
								</div>
								<div className="flex items-center gap-2">
									<div className={`w-2 h-2 rounded-full ${quantity ? 'bg-green-500' : 'bg-red-500'}`}></div>
									<span className="text-xs text-gray-600">الكمية: {quantity ? '✓ محدد' : '✗ غير محدد'}</span>
								</div>
								<div className="flex items-center gap-2">
									<div className={`w-2 h-2 rounded-full ${selectedDate ? 'bg-green-500' : 'bg-red-500'}`}></div>
									<span className="text-xs text-gray-600">التاريخ: {selectedDate ? '✓ محدد' : '✗ غير محدد'}</span>
								</div>
								<div className="flex items-center gap-2">
									<div className={`w-2 h-2 rounded-full ${selectedTime ? 'bg-green-500' : 'bg-red-500'}`}></div>
									<span className="text-xs text-gray-600">الوقت: {selectedTime ? '✓ محدد' : '✗ غير محدد'}</span>
								</div>
							</div>
						</div>

						{/* Actions */}
						<div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
							<button
								type="submit"
								disabled={isSubmitting || !locationData || !waterType || !quantity || !selectedDate || !selectedTime}
								className="h-14 rounded-2xl bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987] hover:from-[#4a8dd8] hover:via-[#3a7dc8] hover:to-[#0d3a6a] text-white font-bold text-lg shadow-lg shadow-[#124987]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
							>
								{isSubmitting ? (
									<>
										<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										<span>جاري الجدولة...</span>
									</>
								) : (
									<>
										<span>تأكيد الجدولة</span>
										<CheckCircle2 size={20} />
									</>
								)}
							</button>

							<button
								type="button"
								onClick={onBack}
								disabled={isSubmitting}
								className="h-14 rounded-2xl bg-white border-2 border-[#579BE8]/30 text-[#579BE8] font-bold text-lg hover:bg-gradient-to-r hover:from-[#579BE8]/5 hover:to-[#124987]/5 hover:border-[#579BE8]/50 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<ArrowLeft size={20} />
								<span>رجوع</span>
							</button>
						</div>
					</form>
				</div>
				
				{/* Overlay for closing pickers */}
				{(showDatePicker || showTimePicker) && (
					<div 
						className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
						onClick={() => {
							setShowDatePicker(false);
							setShowTimePicker(false);
						}}
					/>
				)}
			</motion.div>
		</div>
	);
}