"use client";

import Image from "next/image";
import React from "react";
import { useState } from "react";
import AppDownloadButtons from "../homepage/AppDownloadButtons";
import ServiceSelect from "@/components/common/ServiceSelect";
import WaterTypeSelect from "@/components/common/WaterTypeSelect";
import toast from "react-hot-toast"; 
import { useRouter } from "next/navigation";

export default function HomeCover({ data }) {
	const [waterType, setWaterType] = React.useState("");
	const [waterSize, setWaterSize] = React.useState("");
	const router = useRouter();
	const [validationErrors, setValidationErrors] = useState({
        waterType: false,
        waterSize: false
    });
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formLoading, setFormLoading] = useState(true);
	
	// Extract data from API response
	const getContentValue = (key) => {
		if (!data?.contents) return null;
		const content = data.contents.find(c => c.key === key);
		return content?.value || null;
	};

	const title = getContentValue('title');
	const subtitle = getContentValue('subtitle');
	const image = getContentValue('image');

	 const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // إعادة تعيين أخطاء الفاليديشن
        const newErrors = {
            waterType: false,
            waterSize: false
        };

        let hasError = false;

        // التحقق من نوع المياه
        if (!waterType) {
            newErrors.waterType = true;
            hasError = true;
        }

        // التحقق من الكمية
        if (!waterSize) {
            newErrors.waterSize = true;
            hasError = true;
        }

        // تحديث حالة الأخطاء
        setValidationErrors(newErrors);

        // إذا كان هناك خطأ، عرض رسالة وتوقف
        if (hasError) {
            toast.error("يرجى اختيار نوع المياه والكمية", {
                duration: 3000,
                position: "top-center",
                style: {
                    background: '#ef4444',
                    color: 'white',
                    fontWeight: 'bold'
                }
            });
            setIsSubmitting(false);
            return;
        }

        // محاكاة تحميل قصير ثم الانتقال
        setTimeout(() => {
            router.push(
                `/orders?waterType=${encodeURIComponent(waterType)}&waterSize=${encodeURIComponent(waterSize)}`
            );
        }, 500);
    };

    // دالة لمعالجة تغيير القيم
    const handleWaterTypeChange = (value) => {
        setWaterType(value);
        // إزالة خطأ الفاليديشن عند الاختيار
        if (value && validationErrors.waterType) {
            setValidationErrors(prev => ({
                ...prev,
                waterType: false
            }));
        }
    };

    const handleWaterSizeChange = (value) => {
        setWaterSize(value);
        // إزالة خطأ الفاليديشن عند الاختيار
        if (value && validationErrors.waterSize) {
            setValidationErrors(prev => ({
                ...prev,
                waterSize: false
            }));
        }
    };

	// Check if form data is loaded
	React.useEffect(() => {
		// Simulate loading time for form initialization
		const timer = setTimeout(() => {
			setFormLoading(false);
		}, 500);

		return () => clearTimeout(timer);
	}, []);

	// Form Skeleton Component
	const FormSkeleton = () => (
		<div className="bg-[#EFF5FD] px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 rounded-2xl sm:rounded-3xl flex flex-col gap-4 sm:gap-6 shadow-xl w-full max-w-md mx-auto h-[420px] sm:h-[440px] md:h-[460px] lg:h-[500px]">
			{/* Header Skeleton */}
			<div className="text-center mb-4">
				<div className="h-7 sm:h-8 md:h-10 w-48 sm:w-56 md:w-64 bg-gray-300 dark:bg-gray-700 rounded-xl animate-pulse mx-auto mb-3"></div>
				<div className="h-4 w-40 sm:w-48 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse mx-auto"></div>
			</div>

			{/* Water Type Select Skeleton */}
			<div className="space-y-2">
				<div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
				<div className="h-14 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
			</div>

			{/* Water Size Select Skeleton */}
			<div className="space-y-2">
				<div className="h-4 w-28 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
				<div className="h-14 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
			</div>

			{/* Button Skeleton */}
			<div className="mt-6">
				<div className="h-14 w-full bg-gray-300 dark:bg-gray-700 rounded-xl animate-pulse"></div>
			</div>
		</div>
	);


	return (
		<div className="cover  relative px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
			<div className="container mx-auto">
				<div className="mx-auto max-w-7xl  grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
					{/* Form Section - Appears first on small screens */}
					<div className="form-left content-left order-1 md:order-2 rounded-xl sm:rounded-2xl md:rounded-[26px] border border-[#FFFFFF26] sm:border-2 md:border-[12px] lg:border-[20px] shadow-lg overflow-hidden">
						<div className="bg-[#FFFFFF26] h-full p-2 py-6 md:py-3">
							{formLoading ? (
								<FormSkeleton />
							) : (
								<form 
									onSubmit={handleSubmit} 
									className="bg-[#EFF5FD] px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 rounded-2xl sm:rounded-3xl flex flex-col gap-4 sm:gap-6 shadow-xl w-full max-w-md mx-auto h-[420px] sm:h-[440px] md:h-[460px] lg:h-[500px]"
								>
                <div className="text-center mb-4">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#579BE8] mb-2">
                        اختر اللي يناسبك
                    </h2>
                    <p className="text-sm text-gray-600">
                        اختر نوع المياه والكمية المناسبة لك
                    </p>
                </div>

             

                {/* Water Type Select */}
                <div className={`relative ${validationErrors.waterType ? 'animate-shake' : ''}`}>
                    <WaterTypeSelect
                        label="نوع المياه"
                        value={waterType}
                        onChange={handleWaterTypeChange}
                        status={validationErrors.waterType ? "error" : "default"}
                        placeholder="اختر نوع المياه"
                        onTouched={() => {
                            if (validationErrors.waterType) {
                                setValidationErrors(prev => ({
                                    ...prev,
                                    waterType: false
                                }));
                            }
                        }}
                    />
                  
                </div>

                {/* Water Size Select */}
                <div className={`relative ${validationErrors.waterSize ? 'animate-shake' : ''}`}>
                    <ServiceSelect
                        label="الكمية (طن)"
                        value={waterSize}
                        onChange={handleWaterSizeChange}
                        status={validationErrors.waterSize ? "error" : "default"}
                        placeholder="اختر الكمية"
                        onTouched={() => {
                            if (validationErrors.waterSize) {
                                setValidationErrors(prev => ({
                                    ...prev,
                                    waterSize: false
                                }));
                            }
                        }}
                    />
                  
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`mt-6 w-full h-14 py-3 rounded-xl text-white text-base font-bold bg-gradient-to-r from-[#579BE8] to-[#124987] shadow-lg transition-all duration-300 hover:shadow-xl ${
                        isSubmitting 
                            ? 'opacity-70 cursor-not-allowed' 
                            : 'hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>جاري المعالجة...</span>
                        </div>
                    ) : (
                        "ابدأ الطلب"
                    )}
                </button>
								</form>
							)}
						</div>
					</div>

					{/* Content Section - Appears second on small screens */}
					<div className="content-right order-2 md:order-1">
						<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
							{title || "اسرع خدمة توصيل في الممكلة"}
						</h1>
						<p className="desc text-base sm:text-lg md:text-xl mb-6 sm:mb-8">
							{subtitle || "حدد الكمية والموقع واستقبل عروض الأسعار من السواقين فورا"}
						</p>
						{image && (
							<div className="mb-6 sm:mb-8">
								<Image
									src={image}
									alt={title || "Hero Image"}
									width={600}
									height={400}
									className="rounded-lg"
								/>
							</div>
						)}
						<AppDownloadButtons />
					</div>
				</div>
			</div>
		</div>
	);
}
