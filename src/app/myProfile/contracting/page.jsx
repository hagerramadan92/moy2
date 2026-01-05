"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaHardHat, FaTools, FaChevronLeft, FaCheckCircle,
    FaBuilding, FaUser, FaPhoneAlt, FaMapMarkerAlt,
    FaCalendarAlt, FaEdit, FaPlus, FaArrowDown, FaChevronRight, FaChevronDown
} from 'react-icons/fa';
import { MdOutlineArchitecture, MdBusinessCenter } from 'react-icons/md';
import { BiBuildingHouse, BiSolidBusiness } from 'react-icons/bi';
import { IoDocumentText, IoWalletOutline } from "react-icons/io5";
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import { RxDotsHorizontal } from "react-icons/rx";
import { toast } from "react-hot-toast";

export default function ContractingPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('commercial'); // 'commercial' or 'personal'
    const [formData, setFormData] = useState({
        name: '',
        applicantName: '',
        phone: '',
        duration: 'شهر واحد',
        address: '',
        notes: '',
        startDate: new Date().toISOString().split('T')[0], // Default to today
        totalOrdersLimit: 300,
        totalAmount: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dateInputRef = useRef(null);
    const [errors, setErrors] = useState({});
    const [expandedId, setExpandedId] = useState(null);
    const [selectedContractId, setSelectedContractId] = useState(null);

    const toggleRow = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleSelectContract = (id) => {
        setSelectedContractId(id);
    };

    const tabs = [
        { id: "commercial", label: "تعاقد تجاري", icon: <MdBusinessCenter className="w-5 h-5" /> },
        { id: "personal", label: "تعاقد شخصي", icon: <FaUser className="w-4 h-4" /> },
    ];

    const contracts = [
        {
            id: "CONT-882",
            type: "commercial",
            title: "مؤسسة وايت مياه التجارية",
            applicant: "فهد السليمان",
            phone: "0501234567",
            address: "الرياض، حي الملقا، شارع الأمير محمد بن سعد",
            date: "15 نوفمبر 2024",
            duration: "6 أشهر",
            endDate: "15 مايو 2025",
            cost: "4,500 ريال",
            status: "active",
            notes: "توصيل دوري كل يوم سبت واثنين"
        },
        {
            id: "CONT-721",
            type: "personal",
            title: "منزل حي الملقا",
            applicant: "عبدالله محمد الفهد",
            phone: "0559876543",
            address: "الرياض، حي النرجس، فيلا 12",
            date: "02 نوفمبر 2024",
            duration: "شهر واحد",
            endDate: "02 ديسمبر 2024",
            cost: "800 ريال",
            status: "completed",
            notes: "الاتصال قبل الوصول بـ 15 دقيقة"
        },
    ];

    const filteredContracts = contracts.filter(c => c.type === activeTab);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Map Arabic duration to API duration_type
    const mapDurationType = (arabicDuration) => {
        const durationMap = {
            'شهر واحد': 'monthly',
            '3 أشهر (خصم 10%)': 'quarterly',
            '6 أشهر (خصم 20%)': 'semi_annual',
            'سنة كاملة': 'yearly'
        };
        return durationMap[arabicDuration] || 'monthly';
    };

    const validateForm = () => {
        let newErrors = {};
        if (!formData.name) newErrors.name = activeTab === 'commercial' ? "اسم المؤسسة مطلوب" : "الاسم الكامل مطلوب";
        if (!formData.applicantName) newErrors.applicantName = "اسم مقدم الطلب مطلوب";
        if (!formData.phone) newErrors.phone = "رقم الجوال مطلوب";
        if (!formData.address) newErrors.address = "عنوان الموقع مطلوب";
        if (!formData.startDate) newErrors.startDate = "تاريخ البدء مطلوب";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("يرجى ملء جميع الحقول المطلوبة", {
                duration: 3000,
                icon: "❌",
            });
            return;
        }

        if (isSubmitting) return;

        setIsSubmitting(true);
        const loadingToast = toast.loading("جاري إرسال طلب التعاقد...", {
            duration: Infinity,
        });

        try {
            // Get access token from localStorage - required for creating contracts
            const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

            if (!accessToken) {
                toast.dismiss(loadingToast);
                toast.error("يجب تسجيل الدخول لإنشاء عقد. يرجى تسجيل الدخول أولاً", {
                    duration: 4000,
                    icon: "❌",
                });
                setIsSubmitting(false);
                return;
            }

            // Prepare API request body
            const apiBody = {
                contract_type: activeTab === 'personal' ? 'individual' : 'company',
                applicant_name: formData.applicantName.trim(),
                company_name: activeTab === 'commercial' ? formData.name.trim() : formData.name.trim() || null,
                duration_type: mapDurationType(formData.duration),
                total_orders_limit: formData.totalOrdersLimit || 300,
                total_amount: formData.totalAmount || 0,
                start_date: formData.startDate,
                delivery_locations: [
                    {
                        saved_location_id: 1,
                        priority: 1
                    }
                ],
                notes: formData.notes.trim() || ''
            };

            // Prepare headers with Authorization token (required)
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            };

            // Call the API
            const response = await fetch('/api/contracts', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(apiBody),
            });

            const data = await response.json().catch(() => ({}));

            toast.dismiss(loadingToast);

            if (response.ok) {
                toast.success(data.message || "تم إضافة طلب التعاقد بنجاح، وسيتواصل معك فريقنا قريباً.", {
                    duration: 4000,
                    icon: "✅",
                });
                
                // Reset form
                setFormData({
                    name: '',
                    applicantName: '',
                    phone: '',
                    duration: 'شهر واحد',
                    address: '',
                    notes: '',
                    startDate: new Date().toISOString().split('T')[0],
                    totalOrdersLimit: 300,
                    totalAmount: 0
                });
                setErrors({});
            } else {
                // Handle API error
                const errorMessage = data.message || data.error || 'فشل إرسال طلب التعاقد. يرجى المحاولة مرة أخرى';
                toast.error(errorMessage, {
                    duration: 5000,
                    icon: "❌",
                });
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("حدث خطأ أثناء إرسال طلب التعاقد. يرجى المحاولة مرة أخرى", {
                duration: 5000,
                icon: "❌",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = (name) => `w-full bg-secondary/30 border ${errors[name] ? 'border-destructive/50 ring-2 ring-destructive/5' : 'border-border/50'} rounded-2xl px-12 py-3.5 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-sm`;
    const labelClasses = "block text-sm font-bold mb-2 mr-2 text-foreground/80";
    const iconClasses = (name) => `absolute right-4 ${errors[name] ? 'top-[3.4rem]' : 'top-[3.3rem]'} text-muted-foreground/60 w-5 h-5`;

    return (
        <div className="space-y-4 md:space-y-5 lg:space-y-6 fade-in-up">
            {/* Enhanced Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative"
            >
                <div className="flex py-5 md:py-6 lg:py-8 px-4 md:px-6 lg:px-8 flex-col gap-3 md:gap-4 lg:gap-5 items-center justify-center bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] text-white rounded-xl md:rounded-2xl lg:rounded-3xl shadow-xl md:shadow-2xl relative overflow-hidden group">
                    {/* Enhanced Decorative Background Elements */}
                    <div className="absolute top-0 right-0 p-4 opacity-[0.08] rotate-12 group-hover:rotate-6 transition-transform duration-1000">
                        <FaHardHat size={140} className="text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 p-4 opacity-[0.08] -rotate-12 group-hover:-rotate-6 transition-transform duration-1000">
                        <IoWalletOutline size={120} className="text-white" />
                    </div>
                    <div className="absolute top-1/2 right-1/4 opacity-[0.06]">
                        <MdBusinessCenter size={100} className="text-white rotate-12" />
                    </div>

                    {/* Enhanced Animated Glow Effects */}
                    <motion.div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/8 rounded-full blur-3xl"
                        animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ 
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <div className="absolute top-0 right-1/4 w-72 h-72 bg-white/12 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-1/4 w-56 h-56 bg-white/12 rounded-full blur-2xl"></div>

                    {/* Main Content - Enhanced */}
                    <div className="flex flex-col gap-4 items-center justify-center relative z-10 w-full">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col gap-3 items-center text-center max-w-lg"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl border-2 border-white/30 mb-2">
                                <FaHardHat className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <h2 className="text-lg md:text-xl lg:text-2xl font-black drop-shadow-lg">طلب تعاقد جديد</h2>
                            <p className="text-xs md:text-sm lg:text-base opacity-90 font-medium">اختر نوع التعاقد واملأ البيانات المطلوبة</p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Main Section Card - Enhanced */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="bg-white dark:bg-card border-2 border-border/60 rounded-xl md:rounded-2xl lg:rounded-3xl shadow-lg md:shadow-xl overflow-hidden flex flex-col"
            >
                {/* Enhanced Tabs Header */}
                <div className="p-3 md:p-4 lg:p-5 border-b-2 border-border/60 flex items-center justify-center bg-gradient-to-b from-secondary/10 to-transparent">
                    <div className="flex bg-secondary/40 dark:bg-secondary/20 p-1.5 md:p-2 rounded-xl md:rounded-2xl w-full max-w-md shadow-inner">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 md:gap-2.5 py-2 md:py-2.5 lg:py-3 rounded-lg md:rounded-xl text-xs md:text-sm lg:text-base font-black transition-all relative group ${activeTab === tab.id
                                    ? "text-[#579BE8] shadow-md md:shadow-lg"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/80 dark:hover:bg-card/80"
                                    }`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabContract"
                                        className="absolute inset-0 bg-white dark:bg-card rounded-xl shadow-lg border-2 border-[#579BE8]/20"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2.5">
                                    <span className={`${activeTab === tab.id ? 'text-[#579BE8]' : ''}`}>
                                        {tab.icon}
                                    </span>
                                    {tab.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Enhanced Split Layout Section */}
                <div className="flex flex-col lg:flex-row min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
                    {/* Enhanced Illustration Side */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:w-[40%] relative bg-gradient-to-br from-[#579BE8]/5 via-[#579BE8]/10 to-[#124987]/5 dark:from-[#579BE8]/10 dark:via-[#579BE8]/5 dark:to-[#124987]/10 p-4 md:p-6 lg:p-8 xl:p-12 flex flex-col items-center justify-center text-center overflow-hidden border-l-2 border-border/40"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-[#579BE8]/10 rounded-full -translate-y-16 translate-x-16 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#124987]/10 rounded-full translate-y-28 -translate-x-28 blur-3xl"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#579BE8]/5 rounded-full blur-3xl"></div>

                        <div className="relative z-10 space-y-4 md:space-y-5 lg:space-y-6">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="w-full max-w-[180px] md:max-w-[220px] lg:max-w-[240px] xl:max-w-[280px] mx-auto"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#579BE8]/20 to-[#124987]/20 rounded-3xl blur-2xl transform scale-110"></div>
                                    <Image
                                        src={activeTab === 'commercial' ? "/images/ecommerce.png" : "/images/personal.jpeg"}
                                        alt={activeTab}
                                        width={400}
                                        height={400}
                                        className="w-full h-auto drop-shadow-2xl relative z-10"
                                    />
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h3 className="text-base md:text-lg lg:text-xl font-black mb-2 md:mb-3 text-foreground">{activeTab === 'commercial' ? "تعاقد تجاري" : "تعاقد شخصي"}</h3>
                                <p className="text-xs md:text-sm lg:text-base text-muted-foreground leading-relaxed px-2 md:px-4 font-medium">
                                    {activeTab === 'commercial'
                                        ? "حلول متكاملة للشركات والمؤسسات مع إدارة ذكية لمواقع التوصيل المتعددة."
                                        : "خطة مريحة لمنزلك أو استراحتك تضمن لك وفرة المياه دائماً وبأقل التكاليف."}
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Enhanced Form Side */}
                    <motion.div
                        key={`form-${activeTab}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:w-[60%] p-4 md:p-6 lg:p-8 bg-gradient-to-br from-white to-secondary/5 dark:from-card dark:to-secondary/10"
                    >
                        <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                                <div className="space-y-1.5 md:space-y-2 relative">
                                    <label className={`${labelClasses} text-xs md:text-sm`}>{activeTab === 'commercial' ? "اسم المؤسسة" : "الاسم الكامل"}</label>
                                    <div className="relative">
                                        <FaBuilding className={`absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-[#579BE8] w-4 h-4 md:w-5 md:h-5 z-10`} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder={activeTab === 'commercial' ? "مؤسسة وايت مياه التجارية" : "عبدالله محمد الفهد"}
                                            className={`w-full bg-white dark:bg-card border-2 ${errors.name ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-border/60 focus:border-[#579BE8]'} rounded-lg md:rounded-xl lg:rounded-2xl px-10 md:px-12 py-2.5 md:py-3 lg:py-3.5 outline-none focus:ring-4 focus:ring-[#579BE8]/10 transition-all text-xs md:text-sm lg:text-base font-medium shadow-sm hover:shadow-md placeholder:font-medium`}
                                        />
                                    </div>
                                    {errors.name && <p className="text-[10px] md:text-xs text-red-500 mr-3 md:mr-4 font-bold flex items-center gap-1">
                                        <span>⚠️</span> {errors.name}
                                    </p>}
                                </div>
                                <div className="space-y-1.5 md:space-y-2 relative">
                                    <label className={`${labelClasses} text-xs md:text-sm`}>اسم مقدم الطلب</label>
                                    <div className="relative">
                                        <FaUser className={`absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-[#579BE8] w-4 h-4 md:w-5 md:h-5 z-10`} />
                                        <input
                                            type="text"
                                            name="applicantName"
                                            value={formData.applicantName}
                                            onChange={handleInputChange}
                                            placeholder="فهد السليمان"
                                            className={`w-full bg-white dark:bg-card border-2 ${errors.applicantName ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-border/60 focus:border-[#579BE8]'} rounded-lg md:rounded-xl lg:rounded-2xl px-10 md:px-12 py-2.5 md:py-3 lg:py-3.5 outline-none focus:ring-4 focus:ring-[#579BE8]/10 transition-all text-xs md:text-sm lg:text-base font-medium shadow-sm hover:shadow-md placeholder:font-medium`}
                                        />
                                    </div>
                                    {errors.applicantName && <p className="text-[10px] md:text-xs text-red-500 mr-3 md:mr-4 font-bold flex items-center gap-1">
                                        <span>⚠️</span> {errors.applicantName}
                                    </p>}
                                </div>
                                <div className="space-y-1.5 md:space-y-2 relative">
                                    <label className={`${labelClasses} text-xs md:text-sm`}>رقم الجوال</label>
                                    <div className="relative">
                                        <FaPhoneAlt className={`absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-[#579BE8] w-4 h-4 md:w-5 md:h-5 z-10`} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="05XXXXXXXX"
                                            className={`w-full bg-white dark:bg-card border-2 ${errors.phone ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-border/60 focus:border-[#579BE8]'} rounded-lg md:rounded-xl lg:rounded-2xl px-10 md:px-12 py-2.5 md:py-3 lg:py-3.5 outline-none focus:ring-4 focus:ring-[#579BE8]/10 transition-all text-xs md:text-sm lg:text-base font-medium shadow-sm hover:shadow-md placeholder:font-medium`}
                                        />
                                    </div>
                                    {errors.phone && <p className="text-[10px] md:text-xs text-red-500 mr-3 md:mr-4 font-bold flex items-center gap-1">
                                        <span>⚠️</span> {errors.phone}
                                    </p>}
                                </div>
                                <div className="space-y-1.5 md:space-y-2 relative">
                                    <label className={`${labelClasses} text-xs md:text-sm`}>مدة التعاقد</label>
                                    <div className="relative">
                                        <Select 
                                            value={formData.duration} 
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                                            dir="rtl"
                                        >
                                            <SelectTrigger className="w-full bg-white dark:bg-card border-2 border-border/60 focus:border-[#579BE8] rounded-lg md:rounded-xl lg:rounded-2xl pr-10 md:pr-12 pl-10 md:pl-12 py-2.5 md:py-3 lg:py-3.5 h-auto focus:ring-4 focus:ring-[#579BE8]/10 transition-all text-xs md:text-sm lg:text-base font-medium shadow-sm hover:shadow-md !h-[44px] md:!h-[48px] lg:!h-[52px] data-[size=default]:!h-[44px] md:data-[size=default]:!h-[48px] lg:data-[size=default]:!h-[52px]">
                                                <SelectValue placeholder="اختر مدة التعاقد" />
                                            </SelectTrigger>
                                            <SelectContent className="text-right">
                                                <SelectItem value="شهر واحد">شهر واحد</SelectItem>
                                                <SelectItem value="3 أشهر (خصم 10%)">3 أشهر (خصم 10%)</SelectItem>
                                                <SelectItem value="6 أشهر (خصم 20%)">6 أشهر (خصم 20%)</SelectItem>
                                                <SelectItem value="سنة كاملة">سنة كاملة</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-1.5 md:space-y-2 relative">
                                    <label className={`${labelClasses} text-xs md:text-sm`}>تاريخ البدء</label>
                                    <div className="relative">
                                        <input
                                            ref={dateInputRef}
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={`w-full bg-white dark:bg-card border-2 ${errors.startDate ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-border/60 focus:border-[#579BE8]'} rounded-lg md:rounded-xl lg:rounded-2xl px-10 md:px-12 py-2.5 md:py-3 lg:py-3.5 outline-none focus:ring-4 focus:ring-[#579BE8]/10 transition-all text-xs md:text-sm lg:text-base font-medium shadow-sm hover:shadow-md cursor-pointer`}
                                            onClick={(e) => {
                                                // Try to show the native date picker
                                                if (e.currentTarget.showPicker) {
                                                    e.currentTarget.showPicker();
                                                }
                                            }}
                                        />
                                        <div 
                                            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-[#579BE8] w-4 h-4 md:w-5 md:h-5 z-10 cursor-pointer pointer-events-auto flex items-center justify-center"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (dateInputRef.current) {
                                                    dateInputRef.current.focus();
                                                    if (dateInputRef.current.showPicker) {
                                                        dateInputRef.current.showPicker();
                                                    } else {
                                                        // Fallback: trigger click on input
                                                        dateInputRef.current.click();
                                                    }
                                                }
                                            }}
                                        >
                                            <FaCalendarAlt className="w-full h-full" />
                                        </div>
                                    </div>
                                    {errors.startDate && <p className="text-[10px] md:text-xs text-red-500 mr-3 md:mr-4 font-bold flex items-center gap-1">
                                        <span>⚠️</span> {errors.startDate}
                                    </p>}
                                </div>
                            </div>

                            <div className="space-y-1.5 md:space-y-2 relative">
                                <label className={`${labelClasses} text-xs md:text-sm`}>عنوان مكانك الرئيسي</label>
                                <div className="relative">
                                    <FaMapMarkerAlt className={`absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-[#579BE8] w-4 h-4 md:w-5 md:h-5 z-10`} />
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="الرياض، حي الملقا، شارع الأمير محمد بن سعد"
                                        className={`w-full bg-white dark:bg-card border-2 ${errors.address ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-border/60 focus:border-[#579BE8]'} rounded-lg md:rounded-xl lg:rounded-2xl px-10 md:px-12 py-2.5 md:py-3 lg:py-3.5 outline-none focus:ring-4 focus:ring-[#579BE8]/10 transition-all text-xs md:text-sm lg:text-base font-medium shadow-sm hover:shadow-md placeholder:font-medium`}
                                    />
                                </div>
                                {errors.address && <p className="text-[10px] md:text-xs text-red-500 mr-3 md:mr-4 font-bold flex items-center gap-1">
                                    <span>⚠️</span> {errors.address}
                                </p>}
                            </div>

                            <div className="space-y-1.5 md:space-y-2 relative">
                                <label className={`${labelClasses} text-xs md:text-sm`}>إضافة ملاحظات إضافية (أو مواقع أخرى)</label>
                                <div className="relative">
                                    <FaEdit className={`absolute right-3 md:right-4 top-3 md:top-4 text-[#579BE8] w-4 h-4 md:w-5 md:h-5 z-10`} />
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="اكتب أي متطلبات خاصة أو ملاحظات لمواقع التوصيل هنا..."
                                        className={`w-full bg-white dark:bg-card border-2 border-border/60 focus:border-[#579BE8] rounded-lg md:rounded-xl lg:rounded-2xl px-10 md:px-12 py-3 md:py-4 outline-none focus:ring-4 focus:ring-[#579BE8]/10 transition-all text-xs md:text-sm lg:text-base font-medium shadow-sm hover:shadow-md resize-none placeholder:font-medium`}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="pt-2 md:pt-3">
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full py-3 md:py-4 lg:py-5 cursor-pointer rounded-lg md:rounded-xl text-sm md:text-base lg:text-lg font-bold bg-gradient-to-r from-[#579BE8] to-[#124987] hover:from-[#4a8dd8] hover:to-[#0f3d6f] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "جاري الإرسال..." : "تأكيد طلب التعاقد"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </motion.div>


        </div>
    );
}
