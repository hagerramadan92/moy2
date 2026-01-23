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
}) {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isOnline, setIsOnline] = useState(true);

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
			"w-full h-14 rounded-xl bg-white px-4 focus:ring-2 text-right flex items-center text-[16px] p-6 shadow-sm transition-all";
		if (status === "success")
			return `${base} border-2 border-[#579BE8]/50 focus:ring-[#579BE8]/30 bg-[#579BE8]/5 ${className}`;
		if (status === "error")
			return `${base} border-2 border-red-400 focus:ring-red-300 bg-red-50/50 ${className}`;
		return `${base} border border-[#579BE8]/30 focus:ring-[#579BE8] hover:border-[#579BE8]/50 ${className}`;
	}, [status, className]);

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
				console.log('Water types response in component:', response);
				
				if (!mounted) return;

				// معالجة البيانات بطرق مختلفة
				let waterTypes = [];
				
				// إذا كانت الاستجابة تحتوي على بيانات افتراضية (من axios interceptor)
				if (response.isFallback) {
					console.log('Using fallback data from interceptor');
					waterTypes = response.data || [];
				} 
				// معالجة البنية العادية للاستجابة
				else if (response.data && Array.isArray(response.data)) {
					waterTypes = response.data;
				} else if (Array.isArray(response)) {
					waterTypes = response;
				} else if (response.result && Array.isArray(response.result)) {
					waterTypes = response.result;
				} else if (response.success && Array.isArray(response.data)) {
					waterTypes = response.data;
				}

				// إذا كان هناك بيانات، استخدمها
				if (waterTypes && waterTypes.length > 0) {
					console.log(`Loaded ${waterTypes.length} water types`);
					setItems(waterTypes);
				} else {
					// استخدام بيانات افتراضية إذا لم توجد بيانات
					console.log('No data found, using default types');
					const defaultTypes = [
						{ id: 1, name: 'مياه عادية', description: 'مياه شرب عادية' },
						{ id: 2, name: 'مياه معدنية', description: 'مياه غنية بالمعادن' },
						{ id: 3, name: 'مياه قلوية', description: 'مياه قلوية متوازنة' }
					];
					setItems(defaultTypes);
					setError('لم يتم العثور على بيانات، يتم استخدام بيانات افتراضية');
					toast.error('بيانات أنواع المياه غير متوفرة، يتم استخدام بيانات افتراضية', {
						duration: 3000,
						position: 'top-center'
					});
				}
			} catch (err) {
				console.error('Error fetching water types:', err);
				
				let errorMessage = 'حدث خطأ في تحميل أنواع المياه';
				let showToast = true;
				
				// تحديد رسالة الخطأ المناسبة
				if (err.message === 'لا يوجد اتصال بالإنترنت') {
					errorMessage = 'لا يوجد اتصال بالإنترنت. يرجى التحقق من اتصالك';
					showToast = false; // لا نعرض toast للخطأ هذا
				} else if (err.message?.includes('Network Error') || err.code === 'ERR_NETWORK') {
					errorMessage = 'تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً';
				} else if (err.userMessage) {
					errorMessage = err.userMessage;
				}
				
				setError(errorMessage);
				
				// بيانات افتراضية في حالة الخطأ
				const defaultTypes = [
					{ id: 1, name: 'مياه عادية', description: 'مياه شرب عادية' },
					{ id: 2, name: 'مياه معدنية', description: 'مياه غنية بالمعادن' },
					{ id: 3, name: 'مياه قلوية', description: 'مياه قلوية متوازنة' }
				];
				setItems(defaultTypes);
				
				if (showToast) {
					toast.error(errorMessage || 'فشل تحميل أنواع المياه، يتم استخدام بيانات افتراضية', {
						duration: 4000,
						position: 'top-center'
					});
				}
			} finally {
				if (mounted) setLoading(false);
			}
		};

		fetchData();
		
		// إعادة المحاولة عند عودة الاتصال
		const handleOnlineRetry = () => {
			if (!isOnline && navigator.onLine) {
				console.log('Connection restored, retrying...');
				fetchData();
			}
		};
		
		window.addEventListener('online', handleOnlineRetry);
		
		return () => {
			mounted = false;
			window.removeEventListener('online', handleOnlineRetry);
		};
	}, [isOnline]);

	// إذا كان هناك خطأ في الاتصال، عرض رسالة مساعدة
	const getErrorMessage = () => {
		if (!isOnline) {
			return 'لا يوجد اتصال بالإنترنت';
		}
		if (error?.includes('لا يوجد اتصال')) {
			return 'يتم استخدام بيانات افتراضية';
		}
		if (error?.includes('تعذر الاتصال')) {
			return 'يتم استخدام بيانات افتراضية مؤقتاً';
		}
		return error;
	};

	return (
		<div className="flex flex-col items-start gap-2">
			<div className="flex items-center justify-between w-full">
				<label className="flex items-center gap-2 text-gray-700 font-bold">
					<Droplets size={20} className={'text-[#579BE8]'} />
					{label}
				</label>
				
				{/* مؤشر حالة الاتصال */}
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

				<SelectContent className="text-right max-h-[300px]">
					{items.length === 0 && !loading ? (
						<div className="py-4 text-center text-gray-500">
							لا توجد أنواع مياه متاحة
						</div>
					) : (
						items.map((it) => (
							<SelectItem
								key={it.id}
								value={String(it.id)}
								className="text-[16px] py-2 text-right flex-row-reverse justify-end hover:bg-gray-50"
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
			
			{/* عرض رسالة الخطأ أو التحذير */}
			{(error || !isOnline) && (
				<div className="w-full mt-1">
					{!isOnline ? (
						<p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded">
							⚠️ لا يوجد اتصال بالإنترنت. يتم استخدام البيانات المخزنة محلياً.
						</p>
					) : error?.includes('افتراضية') ? (
						<p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded">
							ℹ️ {getErrorMessage()}
						</p>
					) : (
						<p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
							⚠️ {getErrorMessage()}
						</p>
					)}
					
					{/* زر إعادة المحاولة */}
					{(error && isOnline) && (
						<button
							onClick={() => {
								setError(null);
								const fetchData = async () => {
									try {
										setLoading(true);
										const response = await waterApi.getWaterTypes();
										// ... نفس منطق جلب البيانات
									} catch (err) {
										// ... معالجة الخطأ
									} finally {
										setLoading(false);
									}
								};
								fetchData();
							}}
							className="text-xs text-[#579BE8] mt-1 hover:underline"
						>
							إعادة المحاولة
						</button>
					)}
				</div>
			)}
			
			{/* عرض حالة التحميل */}
			{loading && (
				<div className="w-full mt-1">
					<div className="flex items-center gap-2 text-sm text-gray-600">
						<div className="w-4 h-4 border-2 border-[#579BE8] border-t-transparent rounded-full animate-spin"></div>
						<span>جاري تحميل أنواع المياه...</span>
					</div>
				</div>
			)}
		</div>
	);
}