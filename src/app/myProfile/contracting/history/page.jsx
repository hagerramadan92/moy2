"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    FaArrowRight, FaChevronRight, FaCalendarAlt, FaFileDownload,
    FaUser, FaPhoneAlt, FaMapMarkerAlt, FaCheckCircle, FaTimes, FaBan, FaRedoAlt, FaSync
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
import Swal from "sweetalert2";

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
    const [isCanceling, setIsCanceling] = useState(false);
    const [contractHistory, setContractHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        try {
            setLoading(true);
            const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

            if (!accessToken) {
                toast.error("يجب تسجيل الدخول لعرض العقود", {
                    duration: 3000,
                    icon: "❌",
                });
                setLoading(false);
                return;
            }

            const response = await fetch('http://moya.talaaljazeera.com/api/v1/contracts', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok && data.success && data.data) {
                // Handle array of contracts
                const contracts = Array.isArray(data.data) ? data.data : [data.data];
                
                // Map each contract to the required format
                const mappedContracts = contracts.map(contract => {
                // Format contract ID - use contract_number if available, otherwise use id
                let contractId = contract.contract_number || contract.id?.toString() || '';
                if (contractId && !contractId.startsWith('CONT-') && !contractId.startsWith('CONTRACT-')) {
                    contractId = `CONT-${contractId}`;
                }
                
                // Get address from delivery_locations if available
                // Try to get address from saved_location, or construct from city/area if available
                let address = '';
                if (contract.delivery_locations && contract.delivery_locations.length > 0) {
                    const savedLocation = contract.delivery_locations[0].saved_location;
                    if (savedLocation) {
                        address = savedLocation.address || 
                                 (savedLocation.city && savedLocation.area 
                                     ? `${savedLocation.city}, ${savedLocation.area}` 
                                     : savedLocation.city || savedLocation.area || '');
                    }
                }
                
                    // Map contract to array format
                    return {
                    id: contractId,
                    type: contract.contract_type === 'company' ? 'commercial' : 'personal',
                    title: contract.company_name || 'عقد بدون اسم',
                    applicant: contract.applicant_name || '',
                        phone: contract.phone || '',
                    address: address,
                    startDate: contract.start_date ? new Date(contract.start_date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
                    duration: mapDurationToArabic(contract.duration_type),
                    endDate: contract.end_date ? new Date(contract.end_date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
                    cost: contract.total_amount?.toString() || '0',
                    status: contract.status || 'active',
                    notes: contract.notes || '',
                    // Additional fields from API
                    contractId: contract.id,
                    contractNumber: contract.contract_number,
                    remainingOrders: contract.remaining_orders,
                    totalOrdersLimit: contract.total_orders_limit,
                    paidAmount: contract.paid_amount,
                    remainingAmount: contract.remaining_amount
                };
                });
                
                setContractHistory(mappedContracts);
            } else {
                // Fallback to empty array if API fails
                setContractHistory([]);
                if (!response.ok) {
                    toast.error(data.message || "فشل تحميل العقود", {
                        duration: 3000,
                        icon: "❌",
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching contracts:', error);
            toast.error("حدث خطأ أثناء تحميل العقود", {
                duration: 3000,
                icon: "❌",
            });
            setContractHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const mapDurationToArabic = (durationType) => {
        const durationMap = {
            'monthly': 'شهر واحد',
            'quarterly': '3 أشهر',
            'semi_annual': '6 أشهر',
            'yearly': 'سنة كاملة'
        };
        return durationMap[durationType] || durationType;
    };


    const filteredContracts = contractHistory.filter(contract => {
        // Exclude completed contracts
        if (contract.status === "completed") {
            return false;
        }
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

    const handleTerminationConfirm = async () => {
        if (!terminationReason.trim()) {
            toast.error("يرجى إدخال سبب الإنهاء");
            return;
        }

        if (!selectedContract) return;

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

            // Extract contract ID - use the numeric contractId field if available, otherwise extract from id string
            let contractId = selectedContract.contractId || selectedContract.id;
            if (typeof contractId === 'string') {
                // Remove CONT- or CONTRACT- prefix if present
                contractId = contractId.replace(/^(CONT-|CONTRACT-)/, '');
            }

            const response = await fetch(`http://moya.talaaljazeera.com/api/v1/contracts/${contractId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    reason: terminationReason.trim()
                }),
            });

            const data = await response.json().catch(() => ({}));

            toast.dismiss(loadingToast);

            if (response.ok) {
                toast.success(data.message || "تم إلغاء العقد بنجاح", {
                    duration: 4000,
                    icon: "✅",
                });

                setShowTerminationModal(false);
                setSelectedContract(null);
                setTerminationReason("");

                // Refresh contracts list
                await fetchContracts();
            } else {
                const errorMessage = data.message || data.error || 'فشل إلغاء العقد. يرجى المحاولة مرة أخرى';
                toast.error(errorMessage, {
                    duration: 5000,
                    icon: "❌",
                });
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('Error canceling contract:', error);
            toast.error("حدث خطأ أثناء إلغاء العقد. يرجى المحاولة مرة أخرى", {
                duration: 5000,
                icon: "❌",
            });
        } finally {
            setIsCanceling(false);
        }
    };

    // Handle renew contract
    const handleRenewClick = async (contract, e) => {
        e.stopPropagation();
        
        const result = await Swal.fire({
            title: "تجديد العقد",
            text: "هل أنت متأكد من تجديد هذا العقد؟",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "نعم، تجديد العقد",
            cancelButtonText: "إلغاء",
            confirmButtonColor: "#579BE8",
            cancelButtonColor: "#6b7280",
            background: "var(--background)",
            color: "var(--foreground)",
            customClass: {
                popup: "rounded-[2.5rem] border border-border/50 shadow-2xl",
                confirmButton: "rounded-2xl font-black px-10 py-3",
                cancelButton: "rounded-2xl font-black px-10 py-3",
            }
        });

        if (!result.isConfirmed) return;

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
                return;
            }

            // Extract contract ID - use the numeric contractId field if available, otherwise extract from id string
            let contractId = contract.contractId || contract.id;
            if (typeof contractId === 'string') {
                // Remove CONT- or CONTRACT- prefix if present
                contractId = contractId.replace(/^(CONT-|CONTRACT-)/, '');
            }
            const response = await fetch(`http://moya.talaaljazeera.com/api/v1/contracts/${contractId}/renew`, {
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
                toast.success(data.message || "تم تجديد العقد بنجاح", {
                    duration: 4000,
                    icon: "✅",
                });
                
                // Refresh contracts list
                await fetchContracts();
            } else {
                const errorMessage = data.message || data.error || 'فشل تجديد العقد. يرجى المحاولة مرة أخرى';
                toast.error(errorMessage, {
                    duration: 5000,
                    icon: "❌",
                });
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("حدث خطأ أثناء تجديد العقد. يرجى المحاولة مرة أخرى", {
                duration: 5000,
                icon: "❌",
            });
        }
    };

    const tabs = [
        { id: "all", label: "الكل" },
        { id: "commercial", label: "تجاري" },
        { id: "personal", label: "شخصي" },
    ];

    const statusOptions = [
        { id: "all", label: "جميع الحالات" },
        { id: "active", label: "نشط" },
        { id: "pending", label: "قيد الانتظار" },
    ];

    // Calculate statistics - include active and pending contracts
    const totalActive = contractHistory.filter(c => c.status === "active" || c.status === "pending").length;
    const totalValue = contractHistory.reduce((sum, c) => {
        const cost = typeof c.cost === 'string' ? c.cost.replace(/,/g, '') : c.cost;
        return sum + (Number(cost) || 0);
    }, 0);

    // Skeleton Components
    const StatisticsCardSkeleton = () => (
        <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-5 lg:p-6 shadow-lg md:shadow-xl relative overflow-hidden">
            <div className="absolute -right-6 -top-6 opacity-10">
                <FaCheckCircle size={100} className="rotate-12" />
            </div>
            <div className="absolute -left-4 -bottom-4 opacity-10">
                <div className="w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                    <div className="p-1.5 md:p-2 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl">
                        <div className="w-4 h-4 bg-white/30 rounded animate-pulse"></div>
                    </div>
                    <div className="h-5 md:h-6 w-24 bg-white/20 rounded-lg animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-8 md:h-10 lg:h-12 w-16 bg-white/20 rounded-lg animate-pulse"></div>
                </div>
                <div className="h-3 md:h-4 w-32 bg-white/10 rounded-lg animate-pulse mt-1 md:mt-2"></div>
            </div>
        </div>
    );

    const FiltersSkeleton = () => (
        <div className="flex flex-row gap-3 md:gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                <div className="relative flex-1 max-w-md w-full">
                    <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-full pr-10 md:pr-12 pl-3 md:pl-4 h-[44px] md:h-[48px] lg:h-[52px] bg-gray-200 dark:bg-gray-700 rounded-xl md:rounded-2xl animate-pulse"></div>
                </div>
            </div>
            <div className="flex gap-3 flex-wrap items-center">
                <div className="h-[44px] md:h-[48px] lg:h-[52px] w-[140px] md:w-[160px] lg:w-[180px] bg-gray-200 dark:bg-gray-700 rounded-xl md:rounded-2xl animate-pulse"></div>
            </div>
        </div>
    );

    const TableSkeleton = () => (
        <div className="bg-white dark:bg-card border border-border/60 rounded-xl md:rounded-2xl shadow-sm overflow-hidden">
            {/* Tabs Header Skeleton */}
            <div className="p-3 md:p-4 lg:p-6 border-b border-border/50 flex items-center justify-between flex-wrap gap-3">
                <div className="h-6 md:h-7 lg:h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-secondary/30 p-0.5 md:p-1 rounded-xl md:rounded-2xl">
                        <div className="h-8 md:h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg md:rounded-xl animate-pulse"></div>
                        <div className="h-8 md:h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg md:rounded-xl animate-pulse ml-1"></div>
                    </div>
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="w-full">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-secondary/30">
                                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                    <th key={i} className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4">
                                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {[1, 2, 3, 4, 5].map((row) => (
                                <tr key={row} className="hover:bg-secondary/10 transition-colors">
                                    {[1, 2, 3, 4, 5, 6, 7].map((cell) => (
                                        <td key={cell} className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 xl:py-5">
                                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Skeleton */}
            <div className="p-3 md:p-4 lg:p-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    <div className="flex items-center gap-0.5 md:gap-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                </div>
            </div>
        </div>
    );

    // Show loading state
    if (loading) {
        return (
            <div className="space-y-4 md:space-y-5 lg:space-y-6 fade-in-up">
                <StatisticsCardSkeleton />
                <FiltersSkeleton />
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-5 lg:space-y-6 fade-in-up">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1  gap-3 md:gap-4 lg:gap-5">
                {/* Active Contracts */}
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-5 lg:p-6 shadow-lg md:shadow-xl relative overflow-hidden group hover:shadow-xl md:hover:shadow-2xl hover:-translate-y-0.5 md:hover:-translate-y-1 transition-all">
                    <div className="absolute -right-6 -top-6 opacity-10">
                        <FaCheckCircle size={100} className="rotate-12" />
                    </div>
                    <div className="absolute -left-4 -bottom-4 opacity-10">
                        <div className="w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                            <div className="p-1.5 md:p-2 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl">
                                <FaCheckCircle className="text-sm md:text-base lg:text-lg" />
                            </div>
                            <p className="text-xs md:text-lg font-bold opacity-90">العقود </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-black drop-shadow-lg">{totalActive}</h3>
                        </div>
                        <p className="text-[10px] md:text-xs opacity-75 mt-1 md:mt-2 font-medium">عقود قيد التنفيذ</p>
                    </div>
                </div>

              
            </div>

            {/* Filters and Search */}
            <div className="flex flex-row gap-3 md:gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md w-full">
                        <IoSearchOutline className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-[#579BE8] w-4 h-4 md:w-5 md:h-5" />
                        <input
                            type="text"
                            placeholder="ابحث برقم العقد أو الاسم..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-10 md:pr-12 pl-3 md:pl-4 h-[44px] md:h-[48px] lg:h-[52px] bg-white dark:bg-card border-2 border-border/60 rounded-xl md:rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all font-medium text-xs md:text-sm shadow-sm hover:shadow-md placeholder:font-medium"
                        />
                    </div>

                   
                </div>

                <div className="flex gap-3 flex-wrap items-center">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus} dir="rtl">
                        <SelectTrigger className="px-3 md:px-4 lg:px-5 h-[44px] md:h-[48px] lg:h-[52px] !h-[44px] md:!h-[48px] lg:!h-[52px] py-0 bg-white dark:bg-card border-2 border-border/60 rounded-xl md:rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#579BE8]/20 focus:border-[#579BE8] transition-all cursor-pointer font-bold text-xs md:text-sm shadow-sm hover:shadow-md hover:border-[#579BE8]/50 min-w-[140px] md:min-w-[160px] lg:min-w-[180px] data-[size=default]:!h-[44px] md:data-[size=default]:!h-[48px] lg:data-[size=default]:!h-[52px]">
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

                  
                    
                </div>
            </div>

            {/* Contract History Table */}
            <div className="bg-white dark:bg-card border border-border/60 rounded-xl md:rounded-2xl shadow-sm overflow-hidden">
                {/* Tabs Header */}
                <div className="p-3 md:p-4 lg:p-6 border-b border-border/50 flex items-center justify-between flex-wrap gap-3">
                    <h3 className="font-black text-base md:text-lg lg:text-xl text-foreground">سجل التعاقدات</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-secondary/30 p-0.5 md:p-1 rounded-xl md:rounded-2xl">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-2 md:px-3 lg:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all relative ${activeTab === tab.id
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
                <div className="w-full">
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-secondary/30 text-muted-foreground text-xs md:text-sm uppercase tracking-wider font-bold">
                                <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 text-right whitespace-nowrap">رقم العقد</th>
                                <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 text-right">اسم العقد</th>
                                <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 hidden lg:table-cell whitespace-nowrap">النوع</th>
                                <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 hidden xl:table-cell whitespace-nowrap">تاريخ البدء</th>
                                <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 hidden lg:table-cell whitespace-nowrap">المدة</th>
                                {/* <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 text-center whitespace-nowrap">القيمة</th> */}
                                <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 text-center whitespace-nowrap">الحالة</th>
                                <th className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 text-center whitespace-nowrap">الإجراءات</th>
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
                                        onClick={() => router.push(`/myProfile/contracting/details/${contract.contractId || contract.id.toString().replace(/^(CONT-|CONTRACT-)/, '')}`)}
                                    >
                                        <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 xl:py-5">
                                            <Link 
                                                href={`/myProfile/contracting/details/${contract.contractId || contract.id.toString().replace(/^(CONT-|CONTRACT-)/, '')}`} 
                                                className="font-bold text-[#579BE8] hover:underline text-xs md:text-sm whitespace-nowrap"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {contract.id.length > 5 ? contract.id.substring(0, 5) + '...' : contract.id}
                                            </Link>
                                        </td>
                                        <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 xl:py-5">
                                            <span className="font-bold text-foreground text-xs md:text-sm line-clamp-1">{contract.title}</span>
                                        </td>
                                        <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 xl:py-5 hidden lg:table-cell">
                                            <span className={`inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold whitespace-nowrap ${contract.type === "commercial"
                                                ? "bg-[#579BE8]/10 text-[#579BE8] dark:bg-[#579BE8]/20 dark:text-[#579BE8]"
                                                : "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400"
                                                }`}>
                                                {contract.type === "commercial" ? (
                                                    <>
                                                        <MdBusinessCenter className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                                        <span>تجاري</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaUser className="w-3 h-3" />
                                                        <span>شخصي</span>
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 xl:py-5 text-muted-foreground text-xs md:text-sm hidden xl:table-cell whitespace-nowrap">{contract.startDate}</td>
                                        <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 xl:py-5 text-xs md:text-sm hidden lg:table-cell whitespace-nowrap">
                                            <span className="font-bold">{contract.duration}</span>
                                        </td>
                                       
                                        <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 xl:py-5 text-center">
                                            {contract.status === "active" ? (
                                            <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold whitespace-nowrap bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-600"></span>
                                                نشط
                                            </span>
                                            ) : contract.status === "pending" ? (
                                                <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold whitespace-nowrap bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400">
                                                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-yellow-600"></span>
                                                    قيد الانتظار
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold whitespace-nowrap bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400">
                                                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gray-600"></span>
                                                    {contract.status || 'غير محدد'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 xl:py-5 text-center">
                                            {(contract.status === "active" || contract.status === "pending") && (
                                                <button
                                                    onClick={(e) => handleTerminateClick(contract, e)}
                                                    className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 lg:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all hover:shadow-md hover:scale-105 active:scale-95 whitespace-nowrap"
                                                    title="إنهاء العقد"
                                                >
                                                    <FaBan className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                                    <span>إنهاء</span>
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {currentContracts.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-4 md:px-6 py-8 md:py-10 text-center text-muted-foreground text-xs md:text-sm">
                                        لا توجد عقود تطابق البحث
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>

                {/* Footer / Pagination */}
                {filteredContracts.length > 0 && (
                    <div className="p-3 md:p-4 lg:p-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                        <div className="text-xs md:text-sm font-medium text-muted-foreground">
                            عرض <span className="text-foreground font-bold">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredContracts.length)}</span> من أصل <span className="text-foreground font-bold">{filteredContracts.length}</span> عقد
                        </div>

                            <div className="flex items-center gap-1.5 md:gap-2">
                                <button 
                                    disabled={currentPage === 1}
                                    onClick={() => onPageChange(currentPage - 1)}
                                    className="p-1.5 md:p-2 rounded-lg md:rounded-xl border border-border hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <FaChevronRight className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                </button>

                                <div className="flex items-center gap-0.5 md:gap-1">
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
                                                    className={`w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all ${
                                                        currentPage === pageNum 
                                                        ? "bg-[#579BE8] text-white shadow-md md:shadow-lg shadow-[#579BE8]/20" 
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
                                            return <span key={pageNum} className="px-0.5 md:px-1 text-muted-foreground text-xs">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <button 
                                    disabled={currentPage === totalPages}
                                    onClick={() => onPageChange(currentPage + 1)}
                                    className="p-1.5 md:p-2 rounded-lg md:rounded-xl border border-border hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all rotate-180"
                                >
                                    <FaChevronRight className="w-2.5 h-2.5 md:w-3 md:h-3" />
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
                                            disabled={isCanceling}
                                            className="w-full px-4 py-3 bg-white dark:bg-card border-2 border-border/60 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium resize-none placeholder:font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleTerminationCancel}
                                            disabled={isCanceling}
                                            className="flex-1 px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            إلغاء
                                        </button>
                                        <button
                                            onClick={handleTerminationConfirm}
                                            disabled={isCanceling}
                                            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-lg shadow-red-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isCanceling ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>جاري الإلغاء...</span>
                                                </>
                                            ) : (
                                                'تأكيد'
                                            )}
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

