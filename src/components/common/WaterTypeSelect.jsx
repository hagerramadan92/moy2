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
	const [error, setError] = useState(null); // إضافة state للخطأ

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
				setError(null); // إعادة تعيين الخطأ
				
				const response = await waterApi.getWaterTypes();
				console.log('Water types response in component:', response);
				
				if (!mounted) return;

				// معالجة البيانات بطرق مختلفة
				let waterTypes = [];
				
				if (response.data && Array.isArray(response.data)) {
					waterTypes = response.data;
				} else if (Array.isArray(response)) {
					waterTypes = response;
				} else if (response.result && Array.isArray(response.result)) {
					waterTypes = response.result;
				} else if (response.success && Array.isArray(response.data)) {
					waterTypes = response.data;
				}

				if (waterTypes.length > 0) {
					setItems(waterTypes);
				} else {
					// استخدام بيانات افتراضية إذا لم توجد بيانات
					const defaultTypes = [
						{ id: 1, name: 'مياه عادية' },
						{ id: 2, name: 'مياه معدنية' },
						{ id: 3, name: 'مياه قلوية' }
					];
					setItems(defaultTypes);
					setError('لم يتم العثور على بيانات، يتم استخدام بيانات افتراضية');
					toast.error('بيانات أنواع المياه غير متوفرة، يتم استخدام بيانات افتراضية');
				}
			} catch (err) {
				console.error('Error fetching water types:', err);
				setError(err.message || 'حدث خطأ في تحميل أنواع المياه');
				
				// بيانات افتراضية في حالة الخطأ
				const defaultTypes = [
					{ id: 1, name: 'مياه عادية' },
					{ id: 2, name: 'مياه معدنية' },
					{ id: 3, name: 'مياه قلوية' }
				];
				setItems(defaultTypes);
				
				toast.error(err.message || 'فشل تحميل أنواع المياه، يتم استخدام بيانات افتراضية');
			} finally {
				if (mounted) setLoading(false);
			}
		};

		fetchData();
		return () => {
			mounted = false;
		};
	}, []);

	// عرض رسالة خطأ إذا وجدت
	if (error) {
		console.warn('WaterTypeSelect Error:', error);
		// لا نحتاج لعرض شيء لأننا نستخدم البيانات الافتراضية
	}

	return (
		<div className="flex flex-col items-start gap-2">
			<label className="flex items-center gap-2 text-gray-700 font-bold">
				<Droplets size={20} className={'text-[#579BE8]'} />
				{label}
			</label>

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

				<SelectContent className="text-right">
					{items.map((it) => (
						<SelectItem
							key={it.id}
							value={String(it.id)}
							className="text-[16px] py-2 text-right flex-row-reverse justify-end"
						>
							{it.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			
			{/* عرض رسالة الخطأ (اختياري) */}
			{error && (
				<p className="text-sm text-amber-600 mt-1">
					ملاحظة: {error}
				</p>
			)}
		</div>
	);
}