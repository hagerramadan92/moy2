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
import { Scale } from "lucide-react";
import { useId } from "react";


export default function ServiceSelect({
	value,
	onChange,
	onTouched,
	label,
	status = "default",
	placeholder = "اختر حجم المويه",
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
				const data = await waterApi.getWaterServices();

				if (!mounted) return;

				if (data?.status && Array.isArray(data.data)) {
					const list = onlyActive
						? data.data.filter((x) => String(x.is_active) === "1")
						: data.data;

					setItems(list);
				} else {
					toast.error(data?.message || "فشل تحميل أحجام المويه");
				}
			} catch (error) {
				toast.error("فشل تحميل أحجام المويه");
			} finally {
				if (mounted) setLoading(false);
			}
		}

		loadServices();

		return () => {
			mounted = false;
		};
	}, [onlyActive]);

	return (
		<div className="flex flex-col items-start gap-2 w-full">
			<label   id={labelId}
  htmlFor={selectId} className="flex items-center gap-2 text-gray-700 font-bold text-sm">
				<Scale size={18} className={'text-[#579BE8]'} />
				{label}
				{finalStatus === "error" && (
					<span className="text-red-500 text-xs font-normal mr-1">*</span>
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
				<SelectTrigger  id={selectId}
  aria-labelledby={labelId}
  aria-invalid={finalStatus === "error"}
  aria-describedby={finalStatus === "error" ? errorId : undefined} className={triggerClass}>
					<SelectValue
						placeholder={ placeholder}
						className="text-[16px]"
					/>
				</SelectTrigger>

				<SelectContent className="text-right max-h-[300px] overflow-y-auto">
					{items.length === 0 && !loading ? (
						<div className="py-4 text-center text-gray-500 text-sm">
							لا توجد أحجام متاحة
						</div>
					) : (
						items.map((it) => (
							<SelectItem
								key={it.id}
								value={String(it.id)}
								className="text-[16px] py-3 text-right flex-row-reverse justify-end hover:bg-gray-50 transition-colors"
							>
								<div className="flex items-center justify-between w-full">
									<span>{it.name}</span>
									{it.description && (
										<span className="text-xs text-gray-500">
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
				<div  id={errorId} className="flex items-center gap-1 text-red-500 text-xs mt-1 md:ms-2">
					
					<span>هذا الحقل مطلوب</span>
				</div>
			)}

			{/* {loading && (
				<div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
					<div className="w-3 h-3 border-2 border-[#579BE8] border-t-transparent rounded-full animate-spin"></div>
					<span>جاري التحميل...</span>
				</div>
			)} */}
		</div>
	);
}