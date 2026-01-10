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

import api from "@/utils/api";
import { Scale } from "lucide-react";

export async function getServices() {
	const res = await api.get("/services");
	return res.data;
}




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
}) {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);

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

		async function load() {
			setLoading(true);
			try {
				const data = await getServices();
				if (!mounted) return;

				if (data?.status && Array.isArray(data.data)) {
					const list = onlyActive
						? data.data.filter((x) => String(x.is_active) === "1")
						: data.data;

					setItems(list);
				} else {
					toast.error(data?.message || "فشل تحميل الخدمات");
				}
			} catch (e) {
				toast.error("فشل تحميل الخدمات");
			} finally {
				if (mounted) setLoading(false);
			}
		}

		load();
		return () => {
			mounted = false;
		};
	}, [onlyActive]);

	return (
		<div className="flex flex-col items-start gap-2" >
			<label className="flex items-center gap-2 text-gray-700 font-bold">
				<Scale size={20} className={'text-[#579BE8]'} />
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
						placeholder={loading ? "جاري تحميل الأحجام..." : placeholder}
						className="text-[16px]"
					/>
				</SelectTrigger>

				<SelectContent className="text-right">
					{items.map((it) => (
						<SelectItem
							key={it.id}
							value={String(it.id)} // نخزن ID
							className="text-[16px] py-2 text-right flex-row-reverse justify-end"
						>
							{it.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
