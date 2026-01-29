"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { waterApi } from "@/utils/api";
import { Droplets } from "lucide-react";

export default function WaterTypeSelect({
	value,
	onChange,
	onTouched,
	status = "default",
	label,
	placeholder = "اختر نوع المويه",
	dir = "rtl",
	className = "",
	hasError = false, // prop جديد للتحكم في border أحمر
}) {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isOnline, setIsOnline] = useState(true);

	// دمج status مع hasError
	const finalStatus = useMemo(() => {
		if (hasError) return "error";
		return status;
	}, [hasError, status]);

	// التحقق من حالة الاتصال بالإنترنت
	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);
		
		setIsOnline(navigator.onLine);
		
		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);
		
		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	const triggerClass = useMemo(() => {
		const base =
			"w-full h-14 rounded-xl bg-white px-4 focus:ring-2 text-right flex items-center text-[16px] p-6 shadow-sm transition-all duration-200";
		
		if (finalStatus === "success")
			return `${base} border-2 border-[#579BE8]/50 focus:ring-[#579BE8]/30 bg-[#579BE8]/5 ${className}`;
		
		if (finalStatus === "error")
			return `${base} border-2 border-red-500 focus:ring-red-300 bg-red-50/50 hover:border-red-500 ${className}`;
		
		return `${base} border border-[#579BE8]/30 focus:ring-[#579BE8] hover:border-[#579BE8]/50 ${className}`;
	}, [finalStatus, className]);

	useEffect(() => {
		let mounted = true;

		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);
				
				// التحقق من الاتصال بالإنترنت
				if (!navigator.onLine) {
					throw new Error('لا يوجد اتصال بالإنترنت');
				}

				const response = await waterApi.getWaterTypes();
				
				if (!mounted) return;

				// معالجة البيانات
				let waterTypes = [];
				
				if (response.data && Array.isArray(response.data)) {
					waterTypes = response.data;
				} else if (Array.isArray(response)) {
					waterTypes = response;
				}

				// إذا كان هناك بيانات، استخدمها
				if (waterTypes && waterTypes.length > 0) {
					setItems(waterTypes);
				} else {
					// استخدام بيانات افتراضية
					const defaultTypes = [
						{ id: 1, name: 'مياه عادية', description: 'مياه شرب عادية' },
						{ id: 2, name: 'مياه معدنية', description: 'مياه غنية بالمعادن' },
						{ id: 3, name: 'مياه قلوية', description: 'مياه قلوية متوازنة' }
					];
					setItems(defaultTypes);
				}
			} catch (err) {
				console.error('Error fetching water types:', err);
				
				let errorMessage = 'حدث خطأ في تحميل أنواع المياه';
				
				if (err.message === 'لا يوجد اتصال بالإنترنت') {
					errorMessage = 'لا يوجد اتصال بالإنترنت';
				} else if (err.message?.includes('Network Error')) {
					errorMessage = 'تعذر الاتصال بالخادم';
				}
				
				setError(errorMessage);
				
				// بيانات افتراضية في حالة الخطأ
				const defaultTypes = [
					{ id: 1, name: 'مياه عادية', description: 'مياه شرب عادية' },
					{ id: 2, name: 'مياه معدنية', description: 'مياه غنية بالمعادن' },
					{ id: 3, name: 'مياه قلوية', description: 'مياه قلوية متوازنة' }
				];
				setItems(defaultTypes);
			} finally {
				if (mounted) setLoading(false);
			}
		};

		fetchData();
		
		return () => {
			mounted = false;
		};
	}, [isOnline]);

	return (
		<div className="flex flex-col items-start gap-2 w-full">
			<div className="flex items-center justify-between w-full">
				<label className="flex items-center gap-2 text-gray-700 font-bold text-sm">
					<Droplets size={18} className={'text-[#579BE8]'} />
					{label}
					{finalStatus === "error" && (
						<span className="text-red-500 text-xs font-normal mr-1">*</span>
					)}
				</label>
				
				{!isOnline && (
					<span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
						🔴 غير متصل
					</span>
				)}
			</div>

			<Select
				value={value}
				onValueChange={(v) => {
					onTouched?.();
					onChange?.(v);
				}}
				onOpenChange={() => onTouched?.()}
				dir={dir}
				disabled={loading}
			>
				<SelectTrigger className={triggerClass}>
					<SelectValue
						placeholder={loading ? "جاري تحميل الأنواع..." : placeholder}
						className="text-[16px]"
					/>
				</SelectTrigger>

				<SelectContent className="text-right max-h-[300px] overflow-y-auto">
					{items.length === 0 && !loading ? (
						<div className="py-4 text-center text-gray-500 text-sm">
							لا توجد أنواع مياه متاحة
						</div>
					) : (
						items.map((it) => (
							<SelectItem
								key={it.id}
								value={String(it.id)}
								className="text-[16px] py-3 text-right flex-row-reverse justify-end hover:bg-gray-50 transition-colors"
								title={it.description || it.name}
							>
								<div className="flex flex-col">
									<span>{it.name}</span>
									{it.description && (
										<span className="text-xs text-gray-500 mt-1">
											{it.description}
										</span>
									)}
								</div>
							</SelectItem>
						))
					)}
				</SelectContent>
			</Select>
			
			{/* رسالة خطأ تحت الحقل */}
			{finalStatus === "error" && !value && (
				<div className="flex items-center gap-1 text-red-500 text-xs mt-1 md:ms-2">
					
					<span>هذا الحقل مطلوب</span>
				</div>
			)}
			
			{/* عرض رسائل الخطأ الأخرى */}
			{(error || !isOnline) && (
				<div className="w-full mt-1">
					{!isOnline ? (
						<p className="text-xs text-amber-600">
							 لا يوجد اتصال بالإنترنت
						</p>
					) : (
						<p className="text-xs text-amber-600">
							 {error}
						</p>
					)}
				</div>
			)}
			
			{loading && (
				<div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
					<div className="w-3 h-3 border-2 border-[#579BE8] border-t-transparent rounded-full animate-spin"></div>
					<span>جاري تحميل أنواع المياه...</span>
				</div>
			)}
		</div>
	);
}