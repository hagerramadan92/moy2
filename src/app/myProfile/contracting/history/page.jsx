"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    FaArrowRight, FaChevronRight, FaCalendarAlt, FaFileDownload,
    FaUser, FaPhoneAlt, FaMapMarkerAlt, FaCheckCircle, FaTimes, FaBan
} from "react-icons/fa";
import { MdBusinessCenter, MdFilterList } from "react-icons/md";
import { IoSearchOutline, IoDocumentText } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import flatpickr from "flatpickr";
import { Arabic } from "flatpickr/dist/l10n/ar.js";
import "flatpickr/dist/flatpickr.min.css";
import { toast } from "react-hot-toast";

export default function ContractHistoryPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedDate, setSelectedDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const dateInputRef = useRef(null);
    const flatpickrInstance = useRef(null);
    const [showTerminationModal, setShowTerminationModal] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [terminationReason, setTerminationReason] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Sample contract history data
    const contractHistory = [
        {
            id: "CONT-882",
            type: "commercial",
            title: "مؤسسة وايت مياه التجارية",
            applicant: "فهد السليمان",
            phone: "0501234567",
            address: "الرياض، حي الملقا، شارع الأمير محمد بن سعد",
            startDate: "15 نوفمبر 2024",
            duration: "6 أشهر",
            endDate: "15 مايو 2025",
            cost: "4,500",
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
            startDate: "02 نوفمبر 2024",
            duration: "شهر واحد",
            endDate: "02 ديسمبر 2024",
            cost: "800",
            status: "completed",
            notes: "الاتصال قبل الوصول بـ 15 دقيقة"
        },
        {
            id: "CONT-654",
            type: "commercial",
            title: "شركة النور للتجارة",
            applicant: "سعد العتيبي",
            phone: "0551234567",
            address: "جدة، حي الروضة، شارع الأمير سلطان",
            startDate: "20 أكتوبر 2024",
            duration: "3 أشهر",
            endDate: "20 يناير 2025",
            cost: "2,400",
            status: "active",
            notes: "توصيل صباحي فقط"
        },
        {
            id: "CONT-543",
            type: "personal",
            title: "استراحة العليا",
            applicant: "خالد الدوسري",
            phone: "0567891234",
            address: "الرياض، حي العليا، طريق الملك فهد",
            startDate: "10 سبتمبر 2024",
            duration: "شهر واحد",
            endDate: "10 أكتوبر 2024",
            cost: "600",
            status: "completed",
            notes: ""
        },
    ];

    const filteredContracts = contractHistory.filter(contract => {
        const matchesTab = activeTab === "all" || contract.type === activeTab;
        const matchesStatus = selectedStatus === "all" || contract.status === selectedStatus;
        const matchesSearch = contract.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.applicant.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesStatus && matchesSearch;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentContracts = filteredContracts.slice(indexOfFirstItem, indexOfLastItem);

    const onPageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Initialize Flatpickr
    useEffect(() => {
        if (dateInputRef.current && !flatpickrInstance.current) {
            try {
                flatpickrInstance.current = flatpickr(dateInputRef.current, {
                    locale: Arabic,
                    dateFormat: "Y-m-d",
                    defaultDate: selectedDate || null,
                    onChange: (selectedDates, dateStr) => {
                        setSelectedDate(dateStr);
                    },
                    allowInput: false,
                    clickOpens: true,
                    animate: true,
                    monthSelectorType: "static",
                    static: true,
                    disableMobile: true,
                    wrap: false,
                });
            } catch (error) {
                console.error("Error initializing Flatpickr:", error);
            }
        }

        return () => {
            if (flatpickrInstance.current) {
                try {
                    // Check if the input element still exists in the DOM
                    if (dateInputRef.current && dateInputRef.current.parentNode) {
                        flatpickrInstance.current.destroy();
                    }
                } catch (error) {
                    // Silently handle cleanup errors
                    console.warn("Error destroying Flatpickr:", error);
                } finally {
                    flatpickrInstance.current = null;
                }
            }
        };
    }, []);

    // Update flatpickr when selectedDate changes externally
    useEffect(() => {
        if (flatpickrInstance.current) {
            try {
                if (selectedDate) {
                    flatpickrInstance.current.setDate(selectedDate, false);
                } else {
                    flatpickrInstance.current.clear();
                }
            } catch (error) {
                console.warn("Error updating Flatpickr date:", error);
            }
        }
    }, [selectedDate]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, selectedStatus, searchQuery, selectedDate]);

    // Handle termination
    const handleTerminateClick = (contract, e) => {
        e.stopPropagation();
        setSelectedContract(contract);
        setTerminationReason("");
        setShowTerminationModal(true);
    };

    const handleTerminationCancel = () => {
        setShowTerminationModal(false);
        setSelectedContract(null);
        setTerminationReason("");
    };

    const handleTerminationConfirm = () => {
        if (!terminationReason.trim()) {
            toast.error("يرجى إدخال سبب الإنهاء");
            return;
        }

        // Here you would typically make an API call to terminate the contract
        // For now, we'll just show a success message
        toast.success(`تم إرسال طلب إنهاء العقد ${selectedContract.id} بنجاح`, {
            duration: 4000,
            icon: "✅",
        });

        setShowTerminationModal(false);
        setSelectedContract(null);
        setTerminationReason("");
    };

    const tabs = [
        { id: "all", label: "الكل" },
        { id: "commercial", label: "تجاري" },
        { id: "personal", label: "شخصي" },
    ];

    const statusOptions = [
        { id: "all", label: "جميع الحالات" },
        { id: "active", label: "نشط" },
        { id: "completed", label: "مكتمل" },
    ];

    // Calculate statistics
    const totalActive = contractHistory.filter(c => c.status === "active").length;
    const totalCompleted = contractHistory.filter(c => c.status === "completed").length;
    const totalValue = contractHistory.reduce((sum, c) => {
        const cost = typeof c.cost === 'string' ? c.cost.replace(/,/g, '') : c.cost;
        return sum + (Number(cost) || 0);
    }, 0);

    return (
        <div className="space-y-8 fade-in-up">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Active Contracts */}
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all">
                    <div className="absolute -right-6 -top-6 opacity-10">
                        <FaCheckCircle size={100} className="rotate-12" />
                    </div>
                    <div className="absolute -left-4 -bottom-4 opacity-10">
                        <div className="w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                <FaCheckCircle className="text-lg" />
                            </div>
                            <p className="text-sm font-bold opacity-90">العقود النشطة</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-4xl font-black drop-shadow-lg">{totalActive}</h3>
                        </div>
                        <p className="text-xs opacity-75 mt-2 font-medium">عقود قيد التنفيذ</p>
                    </div>
                </div>

                {/* Completed Contracts */}
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all">
                    <div className="absolute -right-6 -top-6 opacity-10">
                        <IoDocumentText size={100} className="-rotate-12" />
                    </div>
                    <div className="absolute -left-4 -bottom-4 opacity-10">
                        <div className="w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                <IoDocumentText className="text-lg" />
                            </div>
                            <p className="text-sm font-bold opacity-90">العقود المكتملة</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-4xl font-black drop-shadow-lg">{totalCompleted}</h3>
                        </div>
                        <p className="text-xs opacity-75 mt-2 font-medium">عقود منتهية</p>
                    </div>
                </div>

                {/* Total Value */}
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all">
                    <div className="absolute -right-6 -top-6 opacity-10">
                        <MdBusinessCenter size={100} className="rotate-12" />
                    </div>
                    <div className="absolute -left-4 -bottom-4 opacity-10">
                        <div className="w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                <MdBusinessCenter className="text-lg" />
                            </div>
                            <p className="text-sm font-bold opacity-90">القيمة الإجمالية</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-4xl font-black drop-shadow-lg">{totalValue.toLocaleString()}</h3>
                            <Image src="/images/RS.png" alt="RS" width={28} height={28} quality={100} unoptimized className="opacity-90" />
                        </div>
                        <p className="text-xs opacity-75 mt-2 font-medium">إجمالي التعاقدات</p>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md w-full">
                        <IoSearchOutline className="absolute right-4 top-1/2 -translate-y-1/2 text-[#579BE8]" size={20} />
                        <input
                            type="text"
                            placeholder="ابحث برقم العقد أو الاسم..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-12 pl-4 h-[52px] bg-white dark:bg-card border-2 border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all font-medium shadow-sm hover:shadow-md"
                        />
                    </div>

                    {/* Date Filter */}
                    <div className="relative flex-1 w-full sm:max-w-md">
                        <FaCalendarAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-[#579BE8] z-10 pointer-events-none" size={20} />
                        <input 
                            ref={dateInputRef}
                            type="text"
                            placeholder="اختر التاريخ"
                            readOnly
                            autoComplete="off"
                            inputMode="none"
                            data-input
                            className={`w-full pr-12 py-3.5 h-[52px] bg-white dark:bg-card border-2 border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all font-medium shadow-sm hover:shadow-md cursor-pointer ${selectedDate ? 'pl-12' : 'pl-4'}`}
                        />
                        {selectedDate && (
                            <button 
                                onClick={(e) => { 
                                    e.preventDefault(); 
                                    e.stopPropagation();
                                    setSelectedDate("");
                                    if (flatpickrInstance.current) {
                                        try {
                                            flatpickrInstance.current.clear();
                                        } catch (error) {
                                            console.warn("Error clearing Flatpickr:", error);
                                        }
                                    }
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-destructive/10 hover:bg-destructive/20 p-1.5 rounded-full transition-all group shadow-sm hover:shadow-md border border-destructive/20 hover:border-destructive/30"
                                title="مسح التاريخ"
                            >
                                <FaTimes className="w-3.5 h-3.5 text-destructive group-hover:scale-110 transition-transform" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 flex-wrap items-center">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus} dir="rtl">
                        <SelectTrigger className="px-5 h-[52px] !h-[52px] py-0 bg-white dark:bg-card border-2 border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all cursor-pointer font-bold shadow-sm hover:shadow-md hover:border-[#579BE8]/50 min-w-[180px] data-[size=default]:!h-[52px]">
                            <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                        <SelectContent className="text-right">
                            {statusOptions.map(option => (
                                <SelectItem key={option.id} value={option.id} className="text-right">
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <button className="flex items-center justify-center gap-2 px-5 h-[52px] bg-gradient-to-r from-[#579BE8] to-[#315782] text-white rounded-2xl hover:shadow-xl hover:shadow-[#579BE8]/25 hover:-translate-y-0.5 transition-all duration-200 font-bold shadow-md active:scale-[0.98]">
                        <FaFileDownload className="w-4 h-4" />
                        <span className="text-sm">تصدير</span>
                    </button>
                </div>
            </div>

            {/* Contract History Table */}
            <div className="bg-white dark:bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
                {/* Tabs Header */}
                <div className="p-6 border-b border-border/50 flex items-center justify-between">
                    <h3 className="font-black text-xl text-foreground">سجل التعاقدات</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-secondary/30 p-1 rounded-2xl">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${activeTab === tab.id
                                        ? "bg-[#579BE8] text-white shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                        }`}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-[#579BE8] rounded-xl shadow-sm"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-right border-collapse">
                        <thead>
                            <tr className="bg-secondary/30 text-muted-foreground text-sm uppercase tracking-wider font-bold">
                                <th className="px-6 py-4 text-right">رقم العقد</th>
                                <th className="px-6 py-4 text-right">اسم العقد</th>
                                <th className="px-6 py-4 hidden lg:table-cell">النوع</th>
                                <th className="px-6 py-4 hidden xl:table-cell">تاريخ البدء</th>
                                <th className="px-6 py-4 hidden lg:table-cell">المدة</th>
                                <th className="px-6 py-4 text-center">القيمة</th>
                                <th className="px-6 py-4 text-center">الحالة</th>
                                <th className="px-6 py-4 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            <AnimatePresence mode="popLayout">
                                {currentContracts.map((contract) => (
                                    <motion.tr
                                        key={contract.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        layout
                                        className="hover:bg-secondary/10 transition-colors group cursor-pointer"
                                        onClick={() => router.push(`/myProfile/contracting/details/${contract.id.replace('CONT-', '')}`)}
                                    >
                                        <td className="px-6 py-5">
                                            <Link 
                                                href={`/myProfile/contracting/details/${contract.id.replace('CONT-', '')}`} 
                                                className="font-bold text-[#579BE8] hover:underline"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {contract.id}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-bold text-foreground">{contract.title}</span>
                                        </td>
                                        <td className="px-6 py-5 hidden lg:table-cell">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${contract.type === "commercial"
                                                ? "bg-[#579BE8]/10 text-[#579BE8] dark:bg-[#579BE8]/20 dark:text-[#579BE8]"
                                                : "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400"
                                                }`}>
                                                {contract.type === "commercial" ? (
                                                    <>
                                                        <MdBusinessCenter size={14} />
                                                        <span>تجاري</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaUser size={12} />
                                                        <span>شخصي</span>
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-muted-foreground text-sm hidden xl:table-cell">{contract.startDate}</td>
                                        <td className="px-6 py-5 text-sm hidden lg:table-cell">
                                            <span className="font-bold">{contract.duration}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-1 font-black text-lg text-foreground">
                                                {contract.cost}
                                                <Image
                                                    src="/images/RS.png"
                                                    alt="RS"
                                                    width={16}
                                                    height={16}
                                                    priority
                                                    unoptimized
                                                    className="w-4 h-4 opacity-70"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${contract.status === "active"
                                                ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                                                : "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400"
                                                }`}>
                                                <span className={`w-2 h-2 rounded-full ${contract.status === "active" ? "bg-green-600" : "bg-gray-600"
                                                    }`}></span>
                                                {contract.status === "active" ? "نشط" : "مكتمل"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {contract.status === "active" && (
                                                <button
                                                    onClick={(e) => handleTerminateClick(contract, e)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all hover:shadow-md hover:scale-105 active:scale-95"
                                                    title="إنهاء العقد"
                                                >
                                                    <FaBan className="w-3.5 h-3.5" />
                                                    <span>إنهاء</span>
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {currentContracts.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-10 text-center text-muted-foreground">
                                        لا توجد عقود تطابق البحث
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                {filteredContracts.length > 0 && (
                    <div className="p-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-sm font-medium text-muted-foreground">
                            عرض <span className="text-foreground font-bold">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredContracts.length)}</span> من أصل <span className="text-foreground font-bold">{filteredContracts.length}</span> عقد
                        </div>

                        <div className="flex items-center gap-2">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => onPageChange(currentPage - 1)}
                                className="p-2 rounded-xl border border-border hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <FaChevronRight className="w-3 h-3" />
                            </button>

                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, idx) => {
                                    const pageNum = idx + 1;
                                    if (
                                        pageNum === 1 || 
                                        pageNum === totalPages || 
                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => onPageChange(pageNum)}
                                                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                                                    currentPage === pageNum 
                                                    ? "bg-[#579BE8] text-white shadow-lg shadow-[#579BE8]/20" 
                                                    : "hover:bg-secondary/50 text-muted-foreground"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (
                                        pageNum === currentPage - 2 || 
                                        pageNum === currentPage + 2
                                    ) {
                                        return <span key={pageNum} className="px-1 text-muted-foreground">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button 
                                disabled={currentPage === totalPages}
                                onClick={() => onPageChange(currentPage + 1)}
                                className="p-2 rounded-xl border border-border hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all rotate-180"
                            >
                                <FaChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Termination Modal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {showTerminationModal && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={handleTerminationCancel}
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
                                style={{ 
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    width: '100%',
                                    height: '100%'
                                }}
                            />
                            
                            {/* Modal */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
                                style={{ 
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    width: '100%',
                                    height: '100%'
                                }}
                            >
                                <div 
                                    className="bg-white dark:bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-border/60 pointer-events-auto"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                                            <FaBan className="w-6 h-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-foreground">إنهاء العقد</h3>
                                            <p className="text-xs text-muted-foreground">العقد: {selectedContract?.id}</p>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-foreground mb-2">
                                            سبب إنهاء العقد <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={terminationReason}
                                            onChange={(e) => setTerminationReason(e.target.value)}
                                            placeholder="يرجى كتابة سبب إنهاء العقد..."
                                            rows={4}
                                            className="w-full px-4 py-3 bg-white dark:bg-card border-2 border-border/60 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium resize-none"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleTerminationCancel}
                                            className="flex-1 px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold transition-all"
                                        >
                                            إلغاء
                                        </button>
                                        <button
                                            onClick={handleTerminationConfirm}
                                            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-lg shadow-red-500/30 hover:shadow-xl transition-all"
                                        >
                                            تأكيد
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
