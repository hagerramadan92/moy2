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
                <div className="flex py-6 px-8 flex-col gap-4 items-center justify-center bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-primary-foreground rounded-2xl shadow-2xl relative overflow-hidden">
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
                        {/* <div className="flex flex-col gap-2 items-center text-center">
                            <p className="text-sm opacity-90 font-semibold tracking-wide">إجمالي تعاقداتك النشطة</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <h3 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight drop-shadow-2xl bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
                                    04
                                </h3>
                                <div className="bg-white/25 backdrop-blur-md px-4 py-1.5 rounded-xl text-sm font-bold shadow-lg border border-white/20">
                                    عقود نشطة
                                </div>
                            </div>
                        </div> */}

                        {/* Divider */}
                        {/* <div className="w-20 h-0.5 bg-white/30 rounded-full"></div> */}

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
            <div className="bg-white dark:bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">

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


        </div>
    );
}
