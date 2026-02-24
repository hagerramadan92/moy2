"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { Scale } from "lucide-react";
import { useId } from "react";


export default function ServiceSelect({
	value,
	onChange,
	onTouched,
	label,
	status = "default",
	placeholder = "اختر حجم الوايت",
	dir = "rtl",
	className = "",
	onlyActive = true,
	hasError = false, // prop جديد للتحكم في border أحمر
}) {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);
    const selectId = useId();
    const labelId = `${selectId}-label`;
    const errorId = `${selectId}-error`;
    
    // استخدام useRef لتخزين قيمة onlyActive الأولية
    const onlyActiveRef = useRef(onlyActive);

	// دمج status مع hasError
	const finalStatus = useMemo(() => {
		if (hasError) return "error";
		return status;
	}, [hasError, status]);

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

		async function loadServices() {
			setLoading(true);
			try {
				// استخدام fetch مباشرة على الرابط
				const response = await fetch('https://dashboard.waytmiah.com/api/v1/services');
				const data = await response.json();

				if (!mounted) return;

				if (data?.status && Array.isArray(data.data)) {
					// استخدام onlyActiveRef.current بدلاً من onlyActive
					const list = onlyActiveRef.current
						? data.data.filter((x) => String(x.is_active) === "1")
						: data.data;

					setItems(list);
				} else {
					toast.error(data?.message || "فشل تحميل أحجام المويه");
				}
			} catch (error) {
				console.error("Error fetching services:", error);
				toast.error("فشل تحميل أحجام المويه");
			} finally {
				if (mounted) setLoading(false);
			}
		}

		loadServices();

		return () => {
			mounted = false;
		};
	}, []); // ✅ array فاضي عشان الـ useEffect يشغل مرة واحدة بس

	return (
		<div className="flex flex-col items-start gap-2 w-full">
			<label id={labelId} htmlFor={selectId} className="flex items-center gap-2 text-gray-700 font-bold text-sm">
				<Scale size={18} className={'text-[#579BE8]'} />
				{label}
				{finalStatus === "error" && (
					<span className="text-red-600 text-xs font-normal mr-1">*</span>
				)}
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
				<SelectTrigger id={selectId}
                    aria-labelledby={labelId}
                    aria-invalid={finalStatus === "error"}
                    aria-describedby={finalStatus === "error" ? errorId : undefined} 
                    className={triggerClass}>
					<SelectValue
						placeholder={loading ? "جاري التحميل..." : placeholder}
						className="text-[16px]"
					/>
				</SelectTrigger>

				<SelectContent className="text-right max-h-[300px] overflow-y-auto">
					{loading ? (
						<div className="py-4 text-center text-gray-700 text-sm">
							جاري التحميل...
						</div>
					) : items.length === 0 ? (
						<div className="py-4 text-center text-gray-700 text-sm">
							لا توجد أحجام متاحة
						</div>
					) : (
						items.map((it) => (
							<SelectItem
								key={it.id}
								value={String(it.id)}
								className="text-[16px] py-3 text-right flex-row-reverse justify-end hover:bg-gray-50 transition-colors"
							>
								<div className="flex items-center justify-between w-full gap-4">
									<span>{it.name}</span>
									
								</div>
							</SelectItem>
						))
					)}
				</SelectContent>
			</Select>

			{/* رسالة خطأ تحت الحقل */}
			{finalStatus === "error" && !value && (
				<div id={errorId} className="flex items-center gap-1 text-red-600 text-xs mt-1 md:ms-2">
					<span>هذا الحقل مطلوب</span>
				</div>
			)}

		</div>
	);
}