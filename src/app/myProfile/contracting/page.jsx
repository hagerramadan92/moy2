"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaHardHat, FaTools, FaChevronLeft, FaCheckCircle,
    FaBuilding, FaUser, FaPhoneAlt, FaMapMarkerAlt,
    FaCalendarAlt, FaEdit, FaPlus, FaArrowDown, FaChevronRight
} from 'react-icons/fa';
import { MdOutlineArchitecture, MdBusinessCenter } from 'react-icons/md';
import { BiBuildingHouse, BiSolidBusiness } from 'react-icons/bi';
import { IoDocumentText, IoWalletOutline } from "react-icons/io5";
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import { RxDotsHorizontal } from "react-icons/rx";
import Swal from "sweetalert2";

export default function ContractingPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('commercial'); // 'commercial' or 'personal'
    const [formData, setFormData] = useState({
        name: '',
        applicantName: '',
        phone: '',
        duration: 'شهر واحد',
        address: '',
        notes: ''
    });
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

    const validateForm = () => {
        let newErrors = {};
        if (!formData.name) newErrors.name = activeTab === 'commercial' ? "اسم المؤسسة مطلوب" : "الاسم الكامل مطلوب";
        if (!formData.applicantName) newErrors.applicantName = "اسم مقدم الطلب مطلوب";
        if (!formData.phone) newErrors.phone = "رقم الجوال مطلوب";
        if (!formData.address) newErrors.address = "عنوان الموقع مطلوب";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            Swal.fire({
                title: "تم استلام طلبك!",
                text: "تم إضافة طلب التعاقد بنجاح، وسيتواصل معك فريقنا قريباً.",
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
            // Reset form
            setFormData({
                name: '',
                applicantName: '',
                phone: '',
                duration: 'شهر واحد',
                address: '',
                notes: ''
            });
            setErrors({});
        }
    };

    const inputClasses = (name) => `w-full bg-secondary/30 border ${errors[name] ? 'border-destructive/50 ring-2 ring-destructive/5' : 'border-border/50'} rounded-2xl px-12 py-3.5 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-sm`;
    const labelClasses = "block text-sm font-bold mb-2 mr-2 text-foreground/80";
    const iconClasses = (name) => `absolute right-4 ${errors[name] ? 'top-[3.4rem]' : 'top-[3.3rem]'} text-muted-foreground/60 w-5 h-5`;

    return (
        <div className="space-y-8 fade-in-up">
            {/* Summary Hero Card (Wallet Style) */}
            <div className="">
                <div className="flex py-6 px-8 flex-col gap-4 items-center justify-center bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-primary-foreground rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/10">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                        <FaHardHat size={120} />
                    </div>
                    <div className="absolute bottom-0 left-0 p-4 opacity-10 -rotate-12">
                        <IoWalletOutline size={100} />
                    </div>
                    
                    {/* Animated Glow Effects */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>

                    {/* Main Content - Centered */}
                    <div className="flex flex-col gap-3 items-center justify-center relative z-10 w-full">
                        {/* Total Active Contracts */}
                        <div className="flex flex-col gap-2 items-center text-center">
                            <p className="text-sm opacity-90 font-semibold tracking-wide">إجمالي تعاقداتك النشطة</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <h3 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight drop-shadow-2xl bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
                                    04
                                </h3>
                                <div className="bg-white/25 backdrop-blur-md px-4 py-1.5 rounded-xl text-sm font-bold shadow-lg border border-white/20">
                                    عقود نشطة
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-20 h-0.5 bg-white/30 rounded-full"></div>

                        {/* Latest Contract Info */}
                        <div className="flex flex-col gap-2 items-center text-center max-w-md">
                            <p className="text-xs opacity-80 font-medium">أحدث طلب تعاقد</p>
                            <p className="font-black text-lg md:text-xl drop-shadow-lg">مؤسسة وايت مياه التجارية</p>
                            <div className="flex items-center justify-center gap-2 text-xs opacity-90 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
                                <FaCalendarAlt className="w-3 h-3" />
                                <span className="font-semibold">ينتهي في: 15 مايو 2025</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Section Card */}
            <div className="bg-white dark:bg-card border border-border/60 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">

                {/* Tabs Header (Wallet Style) */}
                <div className="p-4 border-b border-border/60 flex items-center justify-center bg-secondary/5">
                    <div className="flex bg-secondary/30 p-1.5 rounded-2xl w-full max-w-sm">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all relative group ${activeTab === tab.id
                                    ? "text-primary shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/70 dark:hover:bg-card/70"
                                    }`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabContract"
                                        className="absolute inset-0 bg-white dark:bg-card rounded-xl shadow-sm"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    {tab.icon}
                                    {tab.label}
                                </span>

                                {/* Hover underline - Navbar style */}
                                <motion.span
                                    className="absolute bottom-1 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#579BE8] to-[#124987] z-20"
                                    whileHover={{ width: "50%" }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Split Layout Section */}
                <div className="flex flex-col lg:flex-row min-h-[500px]">
                    {/* Illustration Side */}
                    <div className="lg:w-[35%] relative bg-secondary/10 p-8 lg:p-10 flex flex-col items-center justify-center text-center overflow-hidden border-l border-border/40">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-12 translate-x-12 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full translate-y-24 -translate-x-24 blur-3xl"></div>

                        <div className="relative z-10 space-y-6">
                            <div className="w-full max-w-[220px] mx-auto animate-float">
                                <Image
                                    src={activeTab === 'commercial' ? "/images/ecommerce.png" : "/images/personal.png"}
                                    alt={activeTab}
                                    width={400}
                                    height={400}
                                    className="w-full h-auto drop-shadow-2xl"
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">{activeTab === 'commercial' ? "تعاقد تجاري" : "تعاقد شخصي"}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed px-4">
                                    {activeTab === 'commercial'
                                        ? "حلول متكاملة للشركات والمؤسسات مع إدارة ذكية لمواقع التوصيل المتعددة."
                                        : "خطة مريحة لمنزلك أو استراحتك تضمن لك وفرة المياه دائماً وبأقل التكاليف."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="lg:w-[65%] p-8 lg:p-10">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1 relative">
                                    <label className={labelClasses}>{activeTab === 'commercial' ? "اسم المؤسسة" : "الاسم الكامل"}</label>
                                    <FaBuilding className={iconClasses('name')} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder={activeTab === 'commercial' ? "مؤسسة وايت مياه التجارية" : "عبدالله محمد الفهد"}
                                        className={inputClasses('name')}
                                    />
                                    {errors.name && <p className="text-[10px] text-destructive mr-4 font-bold">{errors.name}</p>}
                                </div>
                                <div className="space-y-1 relative">
                                    <label className={labelClasses}>اسم مقدم الطلب</label>
                                    <FaUser className={iconClasses('applicantName')} />
                                    <input
                                        type="text"
                                        name="applicantName"
                                        value={formData.applicantName}
                                        onChange={handleInputChange}
                                        placeholder="فهد السليمان"
                                        className={inputClasses('applicantName')}
                                    />
                                    {errors.applicantName && <p className="text-[10px] text-destructive mr-4 font-bold">{errors.applicantName}</p>}
                                </div>
                                <div className="space-y-1 relative">
                                    <label className={labelClasses}>رقم الجوال</label>
                                    <FaPhoneAlt className={iconClasses('phone')} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="05XXXXXXXX"
                                        className={inputClasses('phone')}
                                    />
                                    {errors.phone && <p className="text-[10px] text-destructive mr-4 font-bold">{errors.phone}</p>}
                                </div>
                                <div className="space-y-1 relative">
                                    <label className={labelClasses}>مدة التعاقد</label>
                                    <FaCalendarAlt className={iconClasses('duration')} />
                                    <select
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        className={`${inputClasses('duration')} appearance-none cursor-pointer`}
                                    >
                                        <option>شهر واحد</option>
                                        <option>3 أشهر (خصم 10%)</option>
                                        <option>6 أشهر (خصم 20%)</option>
                                        <option>سنة كاملة</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1 relative">
                                <label className={labelClasses}>عنوان مكانك الرئيسي</label>
                                <FaMapMarkerAlt className={iconClasses('address')} />
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="الرياض، حي الملقا، شارع الأمير محمد بن سعد"
                                    className={inputClasses('address')}
                                />
                                {errors.address && <p className="text-[10px] text-destructive mr-4 font-bold">{errors.address}</p>}
                            </div>

                            <div className="space-y-1 relative">
                                <label className={labelClasses}>إضافة ملاحظات إضافية (أو مواقع أخرى)</label>
                                <FaEdit className={`absolute right-4 top-[3.1rem] text-muted-foreground/60 w-5 h-5`} />
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="اكتب أي متطلبات خاصة أو ملاحظات لمواقع التوصيل هنا..."
                                    className={`${inputClasses('notes')} resize-none h-24`}
                                ></textarea>
                            </div>

                            <div className="pt-2">
                                <Button type="submit" className="w-full py-7 rounded-2xl text-lg font-black bg-gradient-to-r from-[#579BE8] to-[#124987] hover:shadow-xl hover:-translate-y-1 text-white shadow-xl shadow-[#579BE8]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group border-none">
                                    <span>تأكيد طلب التعاقد</span>
                                    <FaChevronLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Contract History & Selection Section */}
            <div className="space-y-6">
                {/* Selector Dropdown Box */}
                <div className="bg-white dark:bg-card border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h3 className="font-bold text-lg">استعراض تفاصيل العقود</h3>
                        <p className="text-xs text-muted-foreground font-medium">اختر عقداً من القائمة لعرض تفاصيله الكاملة مباشرة على الصفحة</p>
                    </div>
                    <div className="relative w-full md:w-72">
                        <select
                            value={selectedContractId || ""}
                            onChange={(e) => handleSelectContract(e.target.value)}
                            className="w-full bg-secondary/30 border border-border/50 rounded-2xl px-5 py-3 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold appearance-none cursor-pointer"
                        >
                            <option value="" disabled>اختر العقد هنا...</option>
                            {contracts.map(c => (
                                <option key={c.id} value={c.id}>{c.title} (#{c.id})</option>
                            ))}
                        </select>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/60">
                            <FaArrowDown className="w-3 h-3" />
                        </div>
                    </div>
                </div>

                {/* Prominent Details Card */}
                <AnimatePresence>
                    {selectedContractId && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-card border border-border/60 rounded-[2.5rem] shadow-xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#579BE8] to-[#124987]" />

                            {/* Card Header */}
                            <div className="px-8 py-6 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-secondary/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-[#579BE8] text-white flex items-center justify-center shadow-lg shadow-[#579BE8]/20">
                                        <IoDocumentText className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black">{contracts.find(c => c.id === selectedContractId).title}</h4>
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-1">
                                            <span className="bg-secondary px-2 py-0.5 rounded-lg font-mono">#{selectedContractId}</span>
                                            <span>•</span>
                                            <span className={contracts.find(c => c.id === selectedContractId).status === 'active' ? 'text-green-500' : ''}>
                                                {contracts.find(c => c.id === selectedContractId).status === 'active' ? "التعاقد نشط حالياً" : "تم اكتمال التعاقد"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedContractId(null)}
                                    className="text-xs font-bold text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                                >
                                    <span>إغلاق العرض</span>
                                    <RxDotsHorizontal className="rotate-90" />
                                </button>
                            </div>

                            {/* Card Content */}
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">مقدم الطلب</p>
                                        <div className="flex items-center gap-2">
                                            <FaUser className="text-[#579BE8]" />
                                            <span className="font-bold">{contracts.find(c => c.id === selectedContractId).applicant}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">رقم الاتصال</p>
                                        <div className="flex items-center gap-2">
                                            <FaPhoneAlt className="text-[#579BE8]" />
                                            <span className="font-bold font-mono text-sm">{contracts.find(c => c.id === selectedContractId).phone}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">الموقع الجغرافي</p>
                                    <div className="flex gap-2">
                                        <FaMapMarkerAlt className="text-[#579BE8] mt-1 shrink-0" />
                                        <p className="font-bold text-sm leading-relaxed">{contracts.find(c => c.id === selectedContractId).address}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">الفترة الزمنية</p>
                                    <div className="bg-secondary/20 p-4 rounded-2xl border border-border/40 space-y-3">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">تاريخ البدء:</span>
                                            <span className="font-bold">{contracts.find(c => c.id === selectedContractId).date}</span>
                                        </div>
                                        <div className="flex justify-between text-xs border-t border-border/20 pt-2">
                                            <span className="text-muted-foreground">تاريخ الانتهاء:</span>
                                            <span className="font-bold">{contracts.find(c => c.id === selectedContractId).endDate}</span>
                                        </div>
                                        <div className="bg-green-100 dark:bg-green-500/10 text-green-600 p-2 rounded-xl text-center text-[10px] font-black">
                                            المدة: {contracts.find(c => c.id === selectedContractId).duration}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 flex flex-col justify-between">
                                    <div className="bg-gradient-to-br from-[#579BE8] to-[#124987] p-5 rounded-[1.8rem] text-white shadow-lg shadow-[#579BE8]/20">
                                        <p className="text-[10px] opacity-80 font-bold mb-1">القيمة المالية للعقد</p>
                                        <p className="text-2xl font-black">{contracts.find(c => c.id === selectedContractId).cost}</p>
                                    </div>
                                    {contracts.find(c => c.id === selectedContractId).notes && (
                                        <div className="p-3 bg-secondary/30 rounded-2xl border border-dashed border-border text-[11px] font-medium leading-relaxed">
                                            <span className="text-primary block font-black mb-1">ملاحظات إضافية:</span>
                                            "{contracts.find(c => c.id === selectedContractId).notes}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Contract History Table (Original) */}
                <div className="bg-white dark:bg-card border border-border/60 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
                    <div className="px-8 py-5 border-b border-border/60 bg-secondary/5 flex items-center justify-between">
                        <h3 className="font-bold text-lg">سجل التعاقدات الكامل</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">عرض تفصيلي لجميع العقود</span>
                        </div>
                    </div>
                    {/* ... (table continues below) */}


                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-secondary/10 text-muted-foreground/70 text-xs font-bold uppercase tracking-wider">
                                    <th className="px-8 py-4">رقم العقد</th>
                                    <th className="px-8 py-4">اسم العقد</th>
                                    <th className="px-8 py-4">تاريخ البدء</th>
                                    <th className="px-8 py-4">المدة</th>
                                    <th className="px-8 py-4">الحالة</th>
                                    <th className="px-8 py-4 text-center">الإجراء</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {contracts.map((contract) => (
                                    <React.Fragment key={contract.id}>
                                        <tr className={`hover:bg-secondary/10 transition-all ${expandedId === contract.id ? 'bg-secondary/20 shadow-inner' : ''} group`}>
                                            <td className="px-8 py-5">
                                                <span className="text-xs font-mono bg-secondary/40 px-2 py-1 rounded-lg text-muted-foreground">
                                                    #{contract.id}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 font-bold text-foreground">
                                                {contract.title}
                                            </td>
                                            <td className="px-8 py-5 text-sm text-muted-foreground">
                                                {contract.date}
                                            </td>
                                            <td className="px-8 py-5 text-sm font-bold">
                                                {contract.duration}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight shadow-sm ${contract.status === 'active'
                                                    ? 'bg-green-100 text-green-600 border border-green-200'
                                                    : 'bg-secondary text-muted-foreground border border-border'
                                                    }`}>
                                                    {contract.status === 'active' ? "نشط حالياً" : "مكتمل"}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <button
                                                    onClick={() => router.push(`/myProfile/contracting/contractDetails/${contract.id}`)}
                                                    className="p-2.5 px-4 rounded-xl transition-all border border-[#579BE8]/20 hover:bg-[#579BE8] hover:text-white hover:shadow-lg hover:shadow-[#579BE8]/30 text-[#579BE8] font-bold text-xs group-hover:border-[#579BE8]"
                                                >
                                                    عرض التفاصيل
                                                </button>
                                            </td>
                                        </tr>
                                        <AnimatePresence>
                                            {expandedId === contract.id && (
                                                <tr>
                                                    <td colSpan="6" className="px-8 py-0 border-none overflow-hidden">
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="py-6 border-t border-border/20">
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                    <div className="space-y-4">
                                                                        <div className="p-4 bg-secondary/20 rounded-[1.5rem] border border-border/40">
                                                                            <p className="text-[10px] text-muted-foreground font-black mb-2 uppercase tracking-wider">البيانات الأساسية</p>
                                                                            <div className="space-y-2">
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-xs text-muted-foreground">مقدم الطلب:</span>
                                                                                    <span className="text-xs font-bold">{contract.applicant}</span>
                                                                                </div>
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-xs text-muted-foreground">رقم الجوال:</span>
                                                                                    <span className="text-xs font-bold font-mono">{contract.phone}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="p-4 bg-green-500/5 rounded-[1.5rem] border border-green-500/10">
                                                                            <p className="text-[10px] text-green-600/70 font-black mb-2 uppercase tracking-wider">الخطة الزمنية</p>
                                                                            <div className="space-y-2 text-xs font-bold">
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-muted-foreground font-medium">البداية:</span>
                                                                                    <span>{contract.date}</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-muted-foreground font-medium">النهاية:</span>
                                                                                    <span>{contract.endDate}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-4">
                                                                        <div className="p-4 bg-secondary/20 rounded-[1.5rem] border border-border/40 h-full">
                                                                            <p className="text-[10px] text-muted-foreground font-black mb-2 uppercase tracking-wider">عنوان التوصيل</p>
                                                                            <div className="flex gap-3">
                                                                                <div className="mt-1 text-primary"><FaMapMarkerAlt /></div>
                                                                                <p className="text-xs font-medium leading-relaxed">{contract.address}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-4 flex flex-col justify-between">
                                                                        <div className="p-4 bg-gradient-to-br from-[#579BE8]/10 to-transparent rounded-[1.5rem] border-r-4 border-[#579BE8]">
                                                                            <p className="text-[10px] text-[#2c5b8b] font-black mb-1 uppercase tracking-wider">القيمة الإجمالية</p>
                                                                            <p className="text-2xl font-black text-[#579BE8]">{contract.cost}</p>
                                                                        </div>
                                                                        {contract.notes && (
                                                                            <div className="p-4 bg-orange-500/5 rounded-[1.5rem] border border-orange-500/10">
                                                                                <p className="text-[10px] text-orange-600/70 font-black mb-1">ملاحظات العميل</p>
                                                                                <p className="text-xs text-muted-foreground italic leading-relaxed line-clamp-2 hover:line-clamp-none transition-all">"{contract.notes}"</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Pagination (Wallet Style) */}
                    <div className="p-6 border-t border-border/60 bg-secondary/5 flex items-center justify-between flex-wrap gap-4">
                        <p className="text-sm text-muted-foreground font-medium">عرض 1-2 من 2 تعاقد</p>

                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-xl border border-border hover:bg-white dark:hover:bg-card hover:border-primary/50 transition-all text-muted-foreground hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed group">
                                <FaChevronRight className="w-4 h-4" />
                            </button>
                            <button className="min-w-[40px] h-[40px] rounded-xl font-bold bg-gradient-to-r from-[#579BE8] to-[#124987] text-white shadow-lg shadow-[#579BE8]/20">1</button>
                            <button className="p-2 rounded-xl border border-border hover:bg-white dark:hover:bg-card hover:border-primary/50 transition-all text-muted-foreground hover:text-primary rotate-180">
                                <FaChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Need Help Footer */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pb-10">
                    <span>تحتاج مساعدة بخصوص التعاقدات؟</span>
                    <span className="text-primary font-bold cursor-pointer hover:underline">تحدث مع خدمة العملاء</span>
                </div>
            </div>
        </div>
    );
}
