"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    FaUser, FaPhoneAlt, FaMapMarkerAlt, FaCalendarAlt,
    FaArrowRight, FaCheckCircle, FaMoneyBillWave, FaTimes, FaHistory, FaPlus, FaChartLine, FaSync, FaRegClock, FaRegBuilding,
    FaExclamationTriangle, FaChartPie, FaWater
} from 'react-icons/fa';
import { IoDocumentText, IoLocationOutline } from "react-icons/io5";
import { MdBusinessCenter, MdOutlinePayment } from 'react-icons/md';
import { HiOutlinePhone, HiOutlineUser } from 'react-icons/hi';
import { BsCalendarCheck, BsCalendarX, BsClockHistory } from 'react-icons/bs';
import { TbCurrencyRiyal } from 'react-icons/tb';
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Image from 'next/image';

export default function ContractDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const contractId = params.id;
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRenewing, setIsRenewing] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);
    const [ proof , setProof] = useState(null);

    // ألوان الرسمة الدائرية
    const COLORS = [ "#E5E7EB" , "#579BE8"]; // أزرق للمستهلك، رمادي للمتبقي

    useEffect(() => {
        fetchContract();
    }, [contractId]);

    const mapDurationToArabic = (durationType) => {
        const durationMap = {
            'monthly': 'شهر واحد',
            'quarterly': '3 أشهر',
            'semi_annual': '6 أشهر',
            'annual': 'سنة كاملة'
        };
        return durationMap[durationType] || durationType;
    };

    const fetchContract = async () => {
        try {
            setLoading(true);
            const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

            if (!accessToken) {
                toast.error("يجب تسجيل الدخول لعرض تفاصيل العقد", {
                    duration: 3000,
                    icon: "❌",
                });
                setLoading(false);
                return;
            }

            const response = await fetch(`https://dashboard.waytmiah.com/api/v1/contracts/${contractId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok && data.success && data.data && data.data.contract) {
                const contractData = data.data.contract;
                const stats = data.data.stats || {};
                 const paymentProofUrl = data.data.payment_proof_url || null;
            setProof(paymentProofUrl);

                // Format contract ID
                const fullId = contractData.contract_number || `CONT-${contractData.id}`;
                
                // Get address from delivery_locations if available
                let address = '';
                if (contractData.delivery_locations && contractData.delivery_locations.length > 0) {
                    const savedLocation = contractData.delivery_locations[0].saved_location;
                    if (savedLocation) {
                        address = savedLocation.address || 
                                 (savedLocation.city && savedLocation.area 
                                     ? `${savedLocation.city}, ${savedLocation.area}` 
                                     : savedLocation.city || savedLocation.area || '');
                    }
                }

                // Map API response to component format
                const mappedContract = {
                    id: contractData.id.toString(),
                    fullId: fullId,
                    type: contractData.contract_type === 'company' ? 'commercial' : 'personal',
                    title: contractData.company_name || contractData.applicant_name || 'عقد بدون اسم',
                    applicant: contractData.applicant_name || '',
                    phone: contractData.phone || '',
                    address: address,
                    date: contractData.start_date ? new Date(contractData.start_date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
                    duration: mapDurationToArabic(contractData.duration_type),
                    endDate: contractData.end_date ? new Date(contractData.end_date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
                    cost: `${parseFloat(contractData.total_amount || 0).toLocaleString('ar-SA')} ريال`,
                    status: contractData.status || 'active',
                    notes: contractData.notes || '',
                    // Additional fields
                    remainingOrders: contractData.remaining_orders,
                    totalOrdersLimit: contractData.total_orders_limit,
                    paidAmount: contractData.paid_amount,
                    remainingAmount: contractData.remaining_amount,
                    // Stats
                    totalOrdersUsed: stats.total_orders_used || 0,
                    paymentProgress: stats.payment_progress || 0,
                    daysRemaining: stats.days_remaining || 0,
                    canRenew: stats.can_renew || false,
                     paymentProofUrl: paymentProofUrl
                };
                
                setContract(mappedContract);
            } else {
                toast.error(data.message || "فشل تحميل تفاصيل العقد", {
                    duration: 3000,
                    icon: "❌",
                });
                setContract(null);
            }
        } catch (error) {
            console.error('Error fetching contract:', error);
            toast.error("حدث خطأ أثناء تحميل تفاصيل العقد", {
                duration: 3000,
                icon: "❌",
            });
            setContract(null);
        } finally {
            setLoading(false);
        }
    };

 const handleRenew = async () => {
    // نافذة SweetAlert2 مع حقل رفع الصورة والمعاينة
    const { value: file, isConfirmed } = await Swal.fire({
        title: "تجديد العقد",
        html: `
            <div class="space-y-4 text-right" dir="rtl">
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">يرجى إرفاق صورة إثبات الدفع لتجديد العقد</p>
                
                <!-- حقل رفع الملف المخفي -->
                <input type="file" id="payment-proof" class="hidden" accept="image/*" />
                
                <!-- منطقة الرفع والمعاينة -->
                <div class="flex flex-col items-center gap-3">
                    <label for="payment-proof" id="upload-label" class="w-full cursor-pointer">
                        <div id="upload-area" class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 hover:border-[#579BE8] transition-colors">
                            <div id="upload-content" class="flex flex-col items-center gap-2">
                                <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <span class="text-sm font-medium text-gray-600 dark:text-gray-300">اضغط لاختيار صورة</span>
                                <span id="file-name" class="text-xs text-gray-500 dark:text-gray-400">لم يتم اختيار ملف</span>
                            </div>
                        </div>
                    </label>
                    
                    <!-- منطقة معاينة الصورة (تظهر بعد اختيار صورة) -->
                    <div id="preview-container" class="w-full hidden mt-2">
                        <div class="relative rounded-xl overflow-hidden border-2 border-[#579BE8]/30 bg-gray-50 dark:bg-gray-800 p-2">
                            <img id="image-preview" src="" alt="Preview" class="max-h-48 mx-auto rounded-lg object-contain" />
                            <button type="button" id="remove-image" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">الصيغ المدعومة: JPG, PNG, GIF</p>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: "تأكيد التجديد",
        cancelButtonText: "إلغاء",
        confirmButtonColor: "#579BE8",
        cancelButtonColor: "#6b7280",
        background: "var(--background)",
        color: "var(--foreground)",
        customClass: {
            popup: "rounded-[2.5rem] border border-border/50 shadow-2xl p-6",
            confirmButton: "rounded-2xl font-black px-8 py-3 text-sm",
            cancelButton: "rounded-2xl font-black px-8 py-3 text-sm",
            htmlContainer: "text-right",
        },
        didOpen: () => {
            const fileInput = document.getElementById('payment-proof');
            const fileNameSpan = document.getElementById('file-name');
            const uploadContent = document.getElementById('upload-content');
            const previewContainer = document.getElementById('preview-container');
            const imagePreview = document.getElementById('image-preview');
            const removeButton = document.getElementById('remove-image');
            const uploadArea = document.getElementById('upload-area');
            
            if (fileInput) {
                // عند اختيار ملف
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        // عرض اسم الملف
                        fileNameSpan.textContent = file.name;
                        fileNameSpan.className = "text-xs text-[#579BE8] font-medium";
                        
                        // معاينة الصورة
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            imagePreview.src = e.target.result;
                            previewContainer.classList.remove('hidden');
                            
                            // تغيير لون border منطقة الرفع
                            uploadArea.classList.add('border-[#579BE8]', 'bg-[#579BE8]/5');
                            uploadArea.classList.remove('border-gray-300', 'dark:border-gray-600');
                        };
                        reader.readAsDataURL(file);
                    }
                });

                // فتح نافذة اختيار الملف عند الضغط على منطقة الرفع
                const uploadLabel = document.getElementById('upload-label');
                if (uploadLabel) {
                    uploadLabel.addEventListener('click', (e) => {
                        e.preventDefault();
                        fileInput.click();
                    });
                }

                // زر إزالة الصورة
                if (removeButton) {
                    removeButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // إعادة تعيين input
                        fileInput.value = '';
                        
                        // إخفاء المعاينة
                        previewContainer.classList.add('hidden');
                        imagePreview.src = '';
                        
                        // إعادة نص اسم الملف
                        fileNameSpan.textContent = 'لم يتم اختيار ملف';
                        fileNameSpan.className = "text-xs text-gray-500 dark:text-gray-400";
                        
                        // إعادة لون border منطقة الرفع
                        uploadArea.classList.remove('border-[#579BE8]', 'bg-[#579BE8]/5');
                        uploadArea.classList.add('border-gray-300', 'dark:border-gray-600');
                    });
                }
            }
        },
        preConfirm: () => {
            const fileInput = document.getElementById('payment-proof');
            
            if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                Swal.showValidationMessage('الرجاء اختيار صورة إثبات الدفع');
                return false;
            }
            
            const file = fileInput.files[0];
            
            // التحقق من نوع الملف فقط (بدون تحديد حجم)
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/webp', 'image/bmp'];
            if (!validTypes.includes(file.type)) {
                Swal.showValidationMessage('نوع الملف غير مدعوم. الأنواع المدعومة: JPG, PNG, GIF, WEBP, BMP');
                return false;
            }
            
            return file;
        }
    });

    if (!isConfirmed || !file) return;

    setIsRenewing(true);
    const loadingToast = toast.loading("جاري تجديد العقد...", {
        duration: Infinity,
    });

    try {
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

        if (!accessToken) {
            toast.dismiss(loadingToast);
            toast.error("يجب تسجيل الدخول لتجديد العقد. يرجى تسجيل الدخول أولاً", {
                duration: 4000,
                icon: "❌",
            });
            setIsRenewing(false);
            return;
        }

        // إنشاء FormData وإضافة الملف
        const formData = new FormData();
        formData.append('payment_proof', file);

        const response = await fetch(`https://dashboard.waytmiah.com/api/v1/contracts/${contractId}/renew`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
        });

        const data = await response.json().catch(() => ({}));

        toast.dismiss(loadingToast);

        if (response.ok) {
            toast.success(data.message || "تم تجديد العقد بنجاح", {
                duration: 4000,
                icon: "✅",
            });
            
            // نافذة نجاح مبسطة
            await Swal.fire({
                title: "تم التجديد!",
                text: data.message || "تم تجديد العقد بنجاح.",
                icon: "success",
                confirmButtonText: "حسناً",
                confirmButtonColor: "#579BE8",
                background: "var(--background)",
                color: "var(--foreground)",
                customClass: {
                    popup: "rounded-[2.5rem] border border-border/50 shadow-2xl",
                    confirmButton: "rounded-2xl font-black px-10 py-3",
                }
            });

            // Refresh contract data
            await fetchContract();
        } else {
            const errorMessage = data.message || data.error || 'فشل تجديد العقد. يرجى المحاولة مرة أخرى';
            toast.error(errorMessage, {
                duration: 5000,
                icon: "❌",
            });
            
            // عرض رسالة الخطأ التفصيلية
            if (data.errors) {
                console.error('Validation errors:', data.errors);
            }
        }
    } catch (error) {
        toast.dismiss(loadingToast);
        console.error('Renewal error:', error);
        toast.error("حدث خطأ أثناء تجديد العقد. يرجى المحاولة مرة أخرى", {
            duration: 5000,
            icon: "❌",
        });
    } finally {
        setIsRenewing(false);
    }
};

    const handleCancel = async () => {
        const result = await Swal.fire({
            title: "إلغاء العقد",
            text: "هل أنت متأكد من إلغاء هذا العقد؟ لا يمكن التراجع عن هذا الإجراء.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "نعم، إلغاء العقد",
            cancelButtonText: "إلغاء",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#579BE8",
            background: "var(--background)",
            color: "var(--foreground)",
            customClass: {
                popup: "rounded-[2.5rem] border border-border/50 shadow-2xl",
                confirmButton: "rounded-2xl font-black px-10 py-3",
                cancelButton: "rounded-2xl font-black px-10 py-3",
            }
        });

        if (!result.isConfirmed) return;

        setIsCanceling(true);
        const loadingToast = toast.loading("جاري إلغاء العقد...", {
            duration: Infinity,
        });

        try {
            const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

            if (!accessToken) {
                toast.dismiss(loadingToast);
                toast.error("يجب تسجيل الدخول لإلغاء العقد. يرجى تسجيل الدخول أولاً", {
                    duration: 4000,
                    icon: "❌",
                });
                setIsCanceling(false);
                return;
            }

            const response = await fetch(`https://dashboard.waytmiah.com/api/v1/contracts/${contractId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const data = await response.json().catch(() => ({}));

            toast.dismiss(loadingToast);

            if (response.ok) {
                toast.success(data.message || "تم إلغاء العقد بنجاح", {
                    duration: 4000,
                    icon: "✅",
                });
                
                Swal.fire({
                    title: "تم الإلغاء!",
                    text: data.message || "تم إلغاء العقد بنجاح.",
                    icon: "success",
                    confirmButtonText: "حسناً",
                    confirmButtonColor: "#579BE8",
                    background: "var(--background)",
                    color: "var(--foreground)",
                    customClass: {
                        popup: "rounded-[2.5rem] border border-border/50 shadow-2xl",
                        confirmButton: "rounded-2xl font-black px-10 py-3",
                    }
                });

                // Navigate back to contracts list
                setTimeout(() => {
                    router.push('/myProfile/contracting/history');
                }, 1000);
            } else {
                const errorMessage = data.message || data.error || 'فشل إلغاء العقد. يرجى المحاولة مرة أخرى';
                toast.error(errorMessage, {
                    duration: 5000,
                    icon: "❌",
                });
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("حدث خطأ أثناء إلغاء العقد. يرجى المحاولة مرة أخرى", {
                duration: 5000,
                icon: "❌",
            });
        } finally {
            setIsCanceling(false);
        }
    };

    // Helper function to get status styling
    const getStatusStyle = (status) => {
        switch(status) {
            case 'active':
                return {
                    bg: 'bg-green-100 dark:bg-green-500/10',
                    text: 'text-green-700 dark:text-green-400',
                    border: 'border-green-200 dark:border-green-500/30',
                    dot: 'bg-green-600',
                    icon: <FaCheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />,
                    label: 'نشط'
                };
            case 'pending':
                return {
                    bg: 'bg-yellow-100 dark:bg-yellow-500/10',
                    text: 'text-yellow-700 dark:text-yellow-400',
                    border: 'border-yellow-200 dark:border-yellow-500/30',
                    dot: 'bg-yellow-600',
                    icon: <FaRegClock className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />,
                    label: 'قيد الانتظار'
                };
            case 'expired':
                return {
                    bg: 'bg-orange-100 dark:bg-orange-500/10',
                    text: 'text-orange-700 dark:text-orange-400',
                    border: 'border-orange-200 dark:border-orange-500/30',
                    dot: 'bg-orange-600',
                    icon: <FaExclamationTriangle className="w-3 h-3 text-orange-600 dark:text-orange-400" />,
                    label: 'منتهي'
                };
            case 'cancelled':
                return {
                    bg: 'bg-red-100 dark:bg-red-500/10',
                    text: 'text-red-700 dark:text-red-400',
                    border: 'border-red-200 dark:border-red-500/30',
                    dot: 'bg-red-600',
                    icon: <FaTimes className="w-3 h-3 text-red-600 dark:text-red-400" />,
                    label: 'ملغي'
                };
            default:
                return {
                    bg: 'bg-gray-100 dark:bg-gray-500/10',
                    text: 'text-gray-700 dark:text-gray-400',
                    border: 'border-gray-200 dark:border-gray-500/30',
                    dot: 'bg-gray-600',
                    icon: <FaCheckCircle className="w-3 h-3 text-gray-600 dark:text-gray-400" />,
                    label: status || 'غير محدد'
                };
        }
    };

    // تجهيز بيانات الرسمة الدائرية
    const getPieData = () => {
        if (!contract) return [];
        
        const used = contract.totalOrdersUsed || 0;
        const remaining = contract.remainingOrders || 0;

        return [
            { name: "المستهلك", value: used, color: COLORS[0] },
            { name: "المتبقي", value: remaining, color: COLORS[1] },
        ];
    };

    // Skeleton Components
    const ContractDetailsSkeleton = () => (
        <div className="space-y-6 md:space-y-8">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2 text-xs md:text-sm">
                <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>

            {/* Header Card Skeleton */}
            <div className="bg-gradient-to-br from-[#579BE8] to-[#124987] rounded-3xl shadow-xl overflow-hidden">
                <div className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-lg animate-pulse"></div>
                        <div className="flex-1 space-y-3">
                            <div className="h-5 w-32 bg-white/20 rounded-lg animate-pulse"></div>
                            <div className="h-8 md:h-10 w-72 bg-white/20 rounded-lg animate-pulse"></div>
                            <div className="flex gap-3">
                                <div className="h-7 w-24 bg-white/20 rounded-xl animate-pulse"></div>
                                <div className="h-7 w-28 bg-white/20 rounded-xl animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column Skeleton */}
                <div className="lg:col-span-2 space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Column Skeleton */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                        </div>
                        <div className="space-y-5">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <ContractDetailsSkeleton />;
    }

    if (!contract) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
                        <FaTimes className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold">العقد غير موجود</h2>
                    <p className="text-muted-foreground">لم نتمكن من العثور على العقد المطلوب</p>
                    <Button 
                        onClick={() => router.back()} 
                        className="bg-gradient-to-r from-[#579BE8] to-[#124987] hover:from-[#4a8dd8] hover:to-[#0f3d6f] text-white px-8 py-6 rounded-xl text-base shadow-lg shadow-[#579BE8]/25"
                    >
                        العودة للخلف
                    </Button>
                </div>
            </div>
        );
    }

    const statusStyle = getStatusStyle(contract.status);
    const pieData = getPieData();
    const total = (contract.totalOrdersUsed || 0) + (contract.remainingOrders || 0);

    return (
        <div className="space-y-6 md:space-y-8 pb-8">
            {/* Enhanced Breadcrumb Navigation */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm"
            >
                <button 
                    onClick={() => router.push('/myProfile/contracting/history')}
                    className="text-muted-foreground hover:text-[#579BE8] transition-colors font-medium"
                >
                    سجل التعاقدات
                </button>
                <FaArrowRight className="w-3 h-3 text-muted-foreground rotate-180" />
                <span className="font-bold text-foreground bg-[#579BE8]/10 px-4 py-2 rounded-xl text-[#579BE8] border border-[#579BE8]/20">
                    تفاصيل العقد
                </span>
            </motion.div>

            {/* Professional Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] shadow-2xl"
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/20 rounded-full blur-3xl"></div>
                </div>

                <div className="relative p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30"
                                >
                                    {contract.type === 'commercial' ? (
                                        <MdBusinessCenter className="w-7 h-7 md:w-8 md:h-8 text-white" />
                                    ) : (
                                        <FaUser className="w-6 h-6 md:w-7 md:h-7 text-white" />
                                    )}
                                </motion.div>
                                <div>
                                    <p className="text-white/80 text-sm font-medium mb-1">
                                        {contract.type === 'commercial' ? 'عقد تجاري' : 'عقد شخصي'}
                                    </p>
                                    <h1 className="text-2xl  font-bold text-white">{contract.title}</h1>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl font-mono font-medium text-white border border-white/30 text-sm">
                                    #{contract.fullId}
                                </span>
                               {(() => {
    const statusStyle = getStatusStyle(contract.status);
    return (
        <span className={`px-4 py-2 rounded-xl font-medium text-sm border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} backdrop-blur-sm flex items-center gap-1.5`}>
            {statusStyle.icon}
            {statusStyle.label}
        </span>
    );
})()}
                            </div>
                        </div>

                        {/* Right Section - Quick Actions */}
                        <div className="flex gap-2">
                            {contract.status === 'active' && (
                                <>
                                    {contract.canRenew === true && (
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <button
                                                onClick={handleRenew}
                                                disabled={isRenewing || isCanceling}
                                                className="w-full px-5 py-3 bg-white/10 backdrop-blur-md rounded-xl text-white font-medium border border-white/20 hover:bg-white/20 text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <FaSync className={`w-4 h-4 ${isRenewing ? 'animate-spin' : ''}`} />
                                                <span>{isRenewing ? 'جاري التجديد...' : 'تجديد العقد'}</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Pie Chart, Contact & Location */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* ===== الرسمة الدائرية هنا - قبل معلومات التواصل ===== */}
                    
                    {/* Consumption Pie Chart - دائرة الاستهلاك */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-white dark:bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all overflow-hidden"
                    >
                        <div className="border-b border-border/60 p-5 bg-gradient-to-r from-[#579BE8]/5 to-transparent">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[#579BE8]/10 flex items-center justify-center">
                                    <FaChartPie className="w-4 h-4 text-[#579BE8]" />
                                </div>
                                <span>نسبة الاستهلاك</span>
                            </h3>
                        </div>
                        
                        <div className="p-5">
                            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                                {/* الرسمة الدائرية */}
                                <div className="w-40 h-40 md:w-48 md:h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={70}
                                                paddingAngle={2}
                                                dataKey="value"
                                                startAngle={90}
                                                endAngle={-270}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={entry.color}
                                                        stroke="transparent"
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                formatter={(value) => `${value.toLocaleString()} لتر`}
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0',
                                                    fontSize: '12px',
                                                    direction: 'rtl'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* تفاصيل الاستهلاك جنب الرسمة */}
                                <div className="space-y-3 w-full md:w-auto">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[0] }}></div>
                                        <span className="text-sm text-muted-foreground">المستهلك:</span>
                                        <span className="text-sm font-bold">
                                            {contract.totalOrdersUsed?.toLocaleString() || 0} لتر
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[1] }}></div>
                                        <span className="text-sm text-muted-foreground">المتبقي:</span>
                                        <span className="text-sm font-bold">
                                            {contract.remainingOrders?.toLocaleString() || 0} لتر
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 pt-2 border-t border-border/60">
                                        <span className="text-sm text-muted-foreground">الإجمالي:</span>
                                        <span className="text-sm font-bold text-[#579BE8]">
                                            {total?.toLocaleString() || 0} لتر
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* نسبة التقدم */}
                            <div className="mt-4 pt-4 border-t border-border/60">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-muted-foreground">نسبة الاستهلاك</span>
                                    <span className="text-xs font-bold text-[#579BE8]">
                                        {total > 0
                                            ? Math.round(((contract.totalOrdersUsed || 0) / total) * 100)
                                            : 0}%
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: total > 0 ? `${((contract.totalOrdersUsed || 0) / total) * 100}%` : '0%' }}
                                        transition={{ delay: 0.1, duration: 0.8 }}
                                        className="h-full bg-gradient-to-r from-[#579BE8] to-[#124987] rounded-full"
                                    />
                                </div>
                            </div>

                            {/* زر عرض تفاصيل الاستهلاك */}
                            <motion.div 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="mt-4"
                            >
                                <button
                                    onClick={() => router.push(`/myProfile/contracting/details/${contractId}/consumption`)}
                                    className="w-full bg-gradient-to-r from-[#579BE8] to-[#124987] hover:from-[#4a8dd8] hover:to-[#0f3d6f] text-white py-3 rounded-xl font-medium text-sm shadow-lg shadow-[#579BE8]/25 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <FaChartLine className="w-4 h-4" />
                                    <span>عرض تفاصيل الاستهلاك</span>
                                    <FaArrowRight className="w-3 h-3 rotate-180" />
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Contact Information - Modern Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all overflow-hidden"
                    >
                        <div className="border-b border-border/60 p-5 bg-gradient-to-r from-[#579BE8]/5 to-transparent">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[#579BE8]/10 flex items-center justify-center">
                                    <HiOutlineUser className="w-4 h-4 text-[#579BE8]" />
                                </div>
                                <span>معلومات التواصل</span>
                            </h3>
                        </div>
                        
                        <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 hover:bg-[#579BE8]/5 transition-colors border border-transparent hover:border-[#579BE8]/20">
                                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#579BE8]"></span>
                                        مقدم الطلب
                                    </p>
                                    <p className="text-base font-bold">{contract.applicant}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 hover:bg-[#579BE8]/5 transition-colors border border-transparent hover:border-[#579BE8]/20">
                                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#579BE8]"></span>
                                        رقم الجوال
                                    </p>
                                    <p className="text-base font-bold font-mono" dir="ltr">{contract.phone}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Location Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all overflow-hidden"
                    >
                        <div className="border-b border-border/60 p-5 bg-gradient-to-r from-[#579BE8]/5 to-transparent">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[#579BE8]/10 flex items-center justify-center">
                                    <IoLocationOutline className="w-4 h-4 text-[#579BE8]" />
                                </div>
                                <span>موقع التوصيل</span>
                            </h3>
                        </div>
                        
                        <div className="p-5">
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-border/40">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#579BE8]/10 flex items-center justify-center flex-shrink-0">
                                        <FaMapMarkerAlt className="w-4 h-4 text-[#579BE8]" />
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed">{contract.address || 'لم يتم تحديد عنوان'}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Notes Section - Only if exists */}
                    {contract.notes && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-2xl border border-amber-200/60 dark:border-amber-500/30 shadow-sm hover:shadow-md transition-all overflow-hidden"
                        >
                            <div className="border-b border-amber-200/60 dark:border-amber-500/30 p-5">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                        <IoDocumentText className="w-4 h-4" />
                                    </div>
                                    <span>ملاحظات إضافية</span>
                                </h3>
                            </div>
                            
                            <div className="p-5">
                                <div className="bg-white/70 dark:bg-amber-500/10 backdrop-blur-sm rounded-xl p-4 border border-amber-200/60 dark:border-amber-500/25">
                                    <p className="text-sm italic font-medium text-amber-800 dark:text-amber-300">
                                        "{contract.notes}"
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right Column - Timeline and Financial Info */}
                <div className="space-y-6">
                    {/* Timeline Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white dark:bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all overflow-hidden"
                    >
                        <div className="border-b border-border/60 p-5 bg-gradient-to-r from-[#579BE8]/5 to-transparent">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[#579BE8]/10 flex items-center justify-center">
                                    <FaCalendarAlt className="w-4 h-4 text-[#579BE8]" />
                                </div>
                                <span>الجدول الزمني</span>
                            </h3>
                        </div>
                        
                        <div className="p-5">
                            {contract.status !== "cancelled" ? (
                                <div className="space-y-5">
                                    {/* Start Date */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-full bg-[#579BE8]/10 flex items-center justify-center flex-shrink-0 border-2 border-white dark:border-card shadow-sm">
                                            <BsCalendarCheck className="w-4 h-4 text-[#579BE8]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">تاريخ البدء</p>
                                            <p className="text-sm font-bold">{contract.date}</p>
                                        </div>
                                    </div>
                                    
                                    {/* End Date */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0 border-2 border-white dark:border-card shadow-sm">
                                            <BsCalendarX className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">تاريخ الانتهاء</p>
                                            <p className="text-sm font-bold">{contract.endDate}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Duration */}
                                    <div className="mt-4 pt-4 border-t border-border/60">
                                        <div className="bg-gradient-to-r from-[#579BE8]/10 to-[#124987]/10 rounded-xl p-4 text-center">
                                            <p className="text-xs text-muted-foreground mb-1">المدة الإجمالية</p>
                                            <p className="text-xl font-bold bg-gradient-to-r from-[#579BE8] to-[#124987] bg-clip-text text-transparent">
                                                {contract.duration}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-5">
                                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center border border-red-200/60 dark:border-red-500/30">
                                        <p className="text-sm font-medium text-red-700 dark:text-red-400">
                                            هذا العقد ملغي، لذلك لا تتوفر معلومات الجدول الزمني.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Payments Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-white dark:bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all overflow-hidden"
                    >
                        <div className="border-b border-border/60 p-5 bg-gradient-to-r from-[#579BE8]/5 to-transparent">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[#579BE8]/10 flex items-center justify-center">
                                    <MdOutlinePayment className="w-4 h-4 text-[#579BE8]" />
                                </div>
                                <span>المدفوعات</span>
                            </h3>
                        </div>
                        
                        <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">المبلغ الإجمالي</p>
                                <p className="text-sm font-bold">{contract.cost}</p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">المبلغ المدفوع</p>
                                <p className="text-sm font-bold text-[#579BE8]">
                                    {parseFloat(contract.paidAmount || 0).toLocaleString()} ريال
                                </p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">المبلغ المتبقي</p>
                                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                                    {parseFloat(contract.remainingAmount || 0).toLocaleString()} ريال
                                </p>
                            </div>

                            {/* Payment Progress */}
                            <div className="mt-3 pt-3 border-t border-border/60">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-muted-foreground">نسبة الدفع</p>
                                    <span className="text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-lg font-medium">
                                        {contract.paymentProgress}%
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${contract.paymentProgress}%` }}
                                        transition={{ delay: 0.5, duration: 0.8 }}
                                        className="h-full bg-gradient-to-r from-[#579BE8] to-[#124987] rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
              
{/* صورة الدفع - تظهر فقط إذا كانت موجودة */}
{proof && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white dark:bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
        <div className="border-b border-border/60 p-5 bg-gradient-to-r from-[#579BE8]/5 to-transparent">
            <h3 className="text-lg font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#579BE8]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#579BE8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                </div>
                <span>صورة إثبات الدفع</span>
            </h3>
        </div>
        
        <div className="p-5">
            <div 
                className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/50 border border-border/40 cursor-pointer group"
                onClick={() => {
                    Swal.fire({
                        imageUrl: proof,
                        imageAlt: "صورة إثبات الدفع",
                   
                        showCloseButton: true,
                        showConfirmButton: false,
                        background: "var(--background)",
                        color: "var(--foreground)",
                        customClass: {
                            popup: "rounded-2xl border border-border/50 shadow-2xl",
                            image: "rounded-lg max-h-[90vh] object-contain",
                            title: "text-sm font-bold mb-4",
                            closeButton: "hover:bg-[#579BE8]/10 text-gray-500 hover:text-[#579BE8] transition-colors text-2xl font-bold px-3 py-1 rounded-full"
                        },
                        backdrop: true,
                        allowOutsideClick: true,
                        allowEscapeKey: true,
                    });
                }}
            >
                <img
                    src={proof}
                    alt="صورة إثبات الدفع"
                    className="w-full h-auto max-h-96 object-contain mx-auto transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent) {
                            parent.innerHTML = `
                                <div class="flex flex-col items-center justify-center p-8 text-center">
                                    <svg class="w-16 h-16 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">فشل تحميل الصورة</p>
                                </div>
                            `;
                        }
                    }}
                />
                
                {/* أيقونة التكبير - تظهر عند التحويم */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-3 shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                        <svg className="w-6 h-6 text-[#579BE8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                    </div>
                </div>
            </div>
            
            {/* نص مساعد صغير */}
            <p className="text-xs text-center text-muted-foreground mt-2">
                اضغط على الصورة للتكبير
            </p>
        </div>
    </motion.div>
)}
                
                </div>
            </div>
        </div>
    );
}