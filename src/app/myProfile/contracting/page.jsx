"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
    FaHardHat, FaTools, FaChevronLeft, FaCheckCircle,
    FaBuilding, FaUser, FaPhoneAlt, FaMapMarkerAlt,
    FaCalendarAlt, FaEdit, FaPlus, FaArrowDown, FaChevronRight, FaChevronDown, FaGlobe,
    FaHome, FaBriefcase, FaStar, FaMapMarkedAlt
} from 'react-icons/fa';
import { MdOutlineArchitecture, MdBusinessCenter } from 'react-icons/md';
import { BiBuildingHouse, BiSolidBusiness } from 'react-icons/bi';
import { IoDocumentText, IoWalletOutline } from "react-icons/io5";
import { MapPin, ChevronDown, ChevronUp, X, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
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

const LocationPickerModal = dynamic(
    () => import('@/components/molecules/orders/LocationPickerModal'),
    { ssr: false, loading: () => <div className="h-0 w-0" /> }
);

const API_BASE_URL = (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) 
    ? process.env.NEXT_PUBLIC_API_BASE_URL.replace(/^http:\/\//, 'https://') 
    : 'https://moya.talaaljazeera.com/api/v1';

export default function ContractingPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('commercial'); // 'commercial' or 'personal'
    const [commercialFormData, setCommercialFormData] = useState({
        name: '',
        applicantName: '',
        phone: '',
        duration: 'شهر واحد',
        address: '',
        website: '',
        notes: '',
        startDate: new Date().toISOString().split('T')[0], // Default to today
        totalOrdersLimit: 300,
        totalAmount: 0
    });
    const [individualFormData, setIndividualFormData] = useState({
        applicantName: '',
        phone: '',
        duration: 'شهر واحد',
        address: '',
        website: '',
        notes: '',
        startDate: new Date().toISOString().split('T')[0], // Default to today
        totalOrdersLimit: 300,
        totalAmount: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dateInputRef = useRef(null);
    const [commercialErrors, setCommercialErrors] = useState({});
    const [individualErrors, setIndividualErrors] = useState({});
    const [expandedId, setExpandedId] = useState(null);
    const [selectedContractId, setSelectedContractId] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedDeliveryLocations, setSelectedDeliveryLocations] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [selectedSavedLocation, setSelectedSavedLocation] = useState(null);
    const [locationData, setLocationData] = useState(null);
    const [isManualLocation, setIsManualLocation] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [showAllLocations, setShowAllLocations] = useState(false);

    const toggleRow = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleSelectContract = (id) => {
        setSelectedContractId(id);
    };

    // Fetch addresses on component mount
    useEffect(() => {
        const fetchAddresses = async () => {
            const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (!accessToken) return;

            try {
                setLoadingAddresses(true);
                const response = await fetch('/api/addresses', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                const data = await response.json();
                if (response.ok && data.status && data.data) {
                    setAddresses(data.data);
                    if (data.data.length > 0 && !selectedSavedLocation) {
                        const favorite = data.data.find(loc => loc.is_favorite);
                        const first = favorite || data.data[0];
                        setSelectedSavedLocation(first);
                        setLocationData({
                            ...first,
                            latitude: parseFloat(first.latitude),
                            longitude: parseFloat(first.longitude)
                        });
                    }
                }
            } catch (error) {
                // Silently fail - addresses are optional
            } finally {
                setLoadingAddresses(false);
            }
        };

        fetchAddresses();
    }, []);

    const navigateToAddressesPage = () => {
        router.push('/myProfile/addresses');
    };

    const handleManualLocationSelect = async (data) => {
        setLocationData(data);
        setSelectedSavedLocation(null);
        setIsManualLocation(true);
        setIsMapOpen(false);

        // حفظ الموقع تلقائياً في الأماكن المحفوظة
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!accessToken) return;

        try {
            const newAddressResponse = await fetch(`${API_BASE_URL}/addresses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    name: data.name || 'موقع التعاقد',
                    address: data.address,
                    city: data.city || 'الرياض',
                    area: data.area || 'حي عام',
                    latitude: data.latitude,
                    longitude: data.longitude,
                }),
            });
            const addressData = await newAddressResponse.json();
            if (newAddressResponse.ok && addressData.status && addressData.data) {
                const newAddress = addressData.data;
                setAddresses(prev => [...prev, newAddress]);
                setSelectedSavedLocation(newAddress);
                setLocationData({
                    ...newAddress,
                    latitude: parseFloat(newAddress.latitude),
                    longitude: parseFloat(newAddress.longitude),
                });
                setIsManualLocation(false);
                toast.success('تم حفظ الموقع في الأماكن المحفوظة', { duration: 3000, icon: '✅' });
            } else {
                toast.error(addressData?.message || 'فشل حفظ العنوان في الأماكن المحفوظة');
            }
        } catch (err) {
            console.error('Error saving address:', err);
            toast.error('حدث خطأ أثناء حفظ الموقع');
        }
    };

    const handleSavedLocationSelect = (location) => {
        setSelectedSavedLocation(location);
        setLocationData({
            ...location,
            latitude: parseFloat(location.latitude),
            longitude: parseFloat(location.longitude)
        });
        setIsManualLocation(false);
    };

    const handleClearLocation = () => {
        setLocationData(null);
        setSelectedSavedLocation(null);
        setIsManualLocation(false);
    };

    // Get current form data and errors based on active tab
    const formData = activeTab === 'commercial' ? commercialFormData : individualFormData;
    const errors = activeTab === 'commercial' ? commercialErrors : individualErrors;
    const setFormData = activeTab === 'commercial' ? setCommercialFormData : setIndividualFormData;
    const setErrors = activeTab === 'commercial' ? setCommercialErrors : setIndividualErrors;

    // Handle selecting/deselecting delivery locations
    const toggleDeliveryLocation = (addressId) => {
        setSelectedDeliveryLocations(prev => {
            const exists = prev.find(loc => loc.saved_location_id === addressId);
            if (exists) {
                // Remove if already selected
                return prev.filter(loc => loc.saved_location_id !== addressId);
            } else {
                // Add with next priority
                const nextPriority = prev.length > 0 ? Math.max(...prev.map(loc => loc.priority)) + 1 : 1;
                return [...prev, { saved_location_id: addressId, priority: nextPriority }];
            }
        });
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
            '3 أشهر ': 'quarterly',
            '6 أشهر': 'semi_annual',
            'سنة كاملة': 'yearly'
        };
        return durationMap[arabicDuration] || 'monthly';
    };

    // تحقق من صحة رقم الهاتف
    const validatePhone = (phone) => {
        // تنسيق سعودي: يبدأ بـ 05 أو 5 متبوعًا بـ 8 أرقام
        const saudiPhoneRegex = /^(05|5)\d{8}$/;
        // تنسيق عام: 9-15 رقم
        const generalPhoneRegex = /^\d{9,15}$/;
        
        return saudiPhoneRegex.test(phone) || generalPhoneRegex.test(phone);
    };

    const validateForm = () => {
        let newErrors = {};
        
        if (!formData.applicantName) newErrors.applicantName = "اسم مقدم الطلب مطلوب";
        
        // التحقق من حقل الهاتف
        if (!formData.phone) {
            newErrors.phone = "رقم الجوال مطلوب";
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = "رقم الجوال غير صحيح. يرجى إدخال رقم صحيح (مثال: 05XXXXXXXX)";
        }

        // التحقق من اسم الشركة للتعاقد التجاري
        if (activeTab === 'commercial' && !formData.name) {
            newErrors.name = "اسم المؤسسة مطلوب للتعاقد التجاري";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("يرجى تصحيح الأخطاء في النموذج", {
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

            let savedLocationId = selectedSavedLocation?.id || null;
            if (isManualLocation && locationData) {
                const newAddressResponse = await fetch(`${API_BASE_URL}/addresses`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        name: locationData.name || 'موقع التعاقد',
                        address: locationData.address,
                        city: locationData.city || 'الرياض',
                        area: locationData.area || 'حي عام',
                        latitude: locationData.latitude,
                        longitude: locationData.longitude,
                    }),
                });
                const addressData = await newAddressResponse.json();
                if (newAddressResponse.ok && addressData.status && addressData.data) {
                    savedLocationId = addressData.data.id;
                } else {
                    toast.dismiss(loadingToast);
                    toast.error(addressData?.message || 'فشل حفظ العنوان الجديد');
                    setIsSubmitting(false);
                    return;
                }
            }

            const deliveryLocations = selectedDeliveryLocations.length > 0
                ? selectedDeliveryLocations
                : (savedLocationId ? [{ saved_location_id: savedLocationId, priority: 1 }] : []);

            // تحضير بيانات الـ API مع إضافة حقل الهاتف المطلوب
            const apiBody = {
                contract_type: activeTab === 'personal' ? 'individual' : 'company',
                applicant_name: formData.applicantName.trim(),
                phone: formData.phone.trim(), // حقل الهاتف المطلوب
                company_name: activeTab === 'commercial' ? (formData.name?.trim() || null) : null,
                duration_type: mapDurationType(formData.duration),
                total_orders_limit: formData.totalOrdersLimit || 300,
                total_amount: formData.totalAmount || 0,
                start_date: formData.startDate,
                delivery_locations: deliveryLocations,
                notes: formData.notes.trim() || ''
            };

            // إزالة الحقول الفارغة (null)
            Object.keys(apiBody).forEach(key => {
                if (apiBody[key] === null || apiBody[key] === undefined || apiBody[key] === '') {
                    delete apiBody[key];
                }
            });

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
                
                // Reset form based on active tab
                if (activeTab === 'commercial') {
                    setCommercialFormData({
                        name: '',
                        applicantName: '',
                        phone: '',
                        duration: 'شهر واحد',
                        address: '',
                        website: '',
                        notes: '',
                        startDate: new Date().toISOString().split('T')[0],
                        totalOrdersLimit: 300,
                        totalAmount: 0
                    });
                    setCommercialErrors({});
                } else {
                    setIndividualFormData({
                        applicantName: '',
                        phone: '',
                        duration: 'شهر واحد',
                        address: '',
                        website: '',
                        notes: '',
                        startDate: new Date().toISOString().split('T')[0],
                        totalOrdersLimit: 300,
                        totalAmount: 0
                    });
                    setIndividualErrors({});
                }
                
                // إعادة تعيين مواقع التوصيل والموقع المختار
                setSelectedDeliveryLocations([]);
                const firstAddr = addresses.length > 0 ? (addresses.find(loc => loc.is_favorite) || addresses[0]) : null;
                setSelectedSavedLocation(firstAddr);
                setLocationData(firstAddr ? { ...firstAddr, latitude: parseFloat(firstAddr.latitude), longitude: parseFloat(firstAddr.longitude) } : null);
                setIsManualLocation(false);
            } else {
                // Handle API error
                const errorMessage = data.message || data.error || 'فشل إرسال طلب التعاقد. يرجى المحاولة مرة أخرى';
                toast.error(errorMessage, {
                    duration: 5000,
                    icon: "❌",
                });
                
                // إذا كان الخطأ يتعلق بالهاتف، عرض رسالة توضيحية
                if (errorMessage.includes('phone')) {
                    toast.error("يجب إدخال رقم هاتف صحيح", {
                        duration: 3000,
                        icon: "📱",
                    });
                }
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

    // Skeleton Components
    const HeroCardSkeleton = () => (
        <div className="flex py-5 md:py-6 lg:py-8 px-4 md:px-6 lg:px-8 flex-col gap-3 md:gap-4 lg:gap-5 items-center justify-center bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] text-white rounded-xl md:rounded-2xl lg:rounded-3xl shadow-xl md:shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.08] rotate-12">
                <FaHardHat size={140} className="text-white" />
            </div>
            <div className="absolute bottom-0 left-0 p-4 opacity-[0.08] -rotate-12">
                <IoWalletOutline size={120} className="text-white" />
            </div>
            
            <div className="flex flex-col gap-4 items-center justify-center relative z-10 w-full">
                <div className="flex flex-col gap-3 items-center text-center max-w-lg">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl border-2 border-white/30 mb-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-white/30 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 md:h-7 lg:h-8 w-48 bg-white/20 rounded-lg animate-pulse"></div>
                    <div className="h-4 md:h-5 w-64 bg-white/10 rounded-lg animate-pulse"></div>
                </div>
            </div>
        </div>
    );
    const FormSkeleton = () => (
        <div className="bg-white dark:bg-card border-2 border-border/60 rounded-xl md:rounded-2xl lg:rounded-3xl shadow-lg md:shadow-xl overflow-hidden flex flex-col">
            {/* Tabs Skeleton */}
            <div className="p-3 md:p-4 lg:p-5 border-b-2 border-border/60 flex items-center justify-center bg-gradient-to-b from-secondary/10 to-transparent">
                <div className="flex bg-secondary/40 dark:bg-secondary/20 p-1.5 md:p-2 rounded-xl md:rounded-2xl w-full max-w-md shadow-inner">
                    <div className="flex-1 h-10 md:h-12 bg-white/50 dark:bg-card/50 rounded-lg md:rounded-xl animate-pulse"></div>
                    <div className="flex-1 h-10 md:h-12 bg-gray-200 dark:bg-gray-700 rounded-lg md:rounded-xl animate-pulse ml-2"></div>
                </div>
            </div>

            {/* Split Layout Skeleton */}
            <div className="flex flex-col lg:flex-row min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
                {/* Illustration Side Skeleton */}
                <div className="lg:w-[40%] relative bg-gradient-to-br from-[#579BE8]/5 via-[#579BE8]/10 to-[#124987]/5 dark:from-[#579BE8]/10 dark:via-[#579BE8]/5 dark:to-[#124987]/10 p-4 md:p-6 lg:p-8 xl:p-12 flex flex-col items-center justify-center text-center overflow-hidden border-l-2 border-border/40">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#579BE8]/10 rounded-full -translate-y-16 translate-x-16 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#124987]/10 rounded-full translate-y-28 -translate-x-28 blur-3xl"></div>
                    
                    <div className="relative z-10 space-y-4 md:space-y-5 lg:space-y-6 w-full">
                        <div className="w-full max-w-[180px] md:max-w-[220px] lg:max-w-[240px] xl:max-w-[280px] mx-auto">
                            <div className="w-full h-64 md:h-80 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-5 md:h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto"></div>
                            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto"></div>
                            <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto"></div>
                        </div>
                    </div>
                </div>

                {/* Form Side Skeleton */}
                <div className="lg:w-[60%] p-4 md:p-6 lg:p-8 bg-gradient-to-br from-white to-secondary/5 dark:from-card dark:to-secondary/10">
                    <div className="space-y-4 md:space-y-5">
                        {/* Form Fields Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="space-y-1.5 md:space-y-2">
                                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    <div className="h-12 md:h-14 bg-gray-200 dark:bg-gray-700 rounded-lg md:rounded-xl lg:rounded-2xl animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Full Width Fields */}
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-1.5 md:space-y-2">
                                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                {i === 3 ? (
                                    <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg md:rounded-xl lg:rounded-2xl animate-pulse"></div>
                                ) : (
                                    <div className="h-12 md:h-14 bg-gray-200 dark:bg-gray-700 rounded-lg md:rounded-xl lg:rounded-2xl animate-pulse"></div>
                                )}
                            </div>
                        ))}
                        
                        {/* Submit Button Skeleton */}
                        <div className="pt-2 md:pt-3">
                            <div className="w-full h-12 md:h-14 lg:h-16 bg-gray-200 dark:bg-gray-700 rounded-lg md:rounded-xl animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loadingAddresses) {
        return (
            <div className="space-y-4 md:space-y-5 lg:space-y-6 fade-in-up">
                <HeroCardSkeleton />
                <FormSkeleton />
            </div>
        );
    }

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
                                {activeTab === 'commercial' && (
                                    <div className="space-y-1.5 md:space-y-2 relative">
                                        <label className={`${labelClasses} text-xs md:text-sm`}>اسم المؤسسة <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <FaBuilding className={`absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-[#579BE8] w-4 h-4 md:w-5 md:h-5 z-10`} />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="مؤسسة وايت مياه التجارية"
                                                className={`w-full bg-white dark:bg-card border-2 ${errors.name ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-border/60 focus:border-[#579BE8]'} rounded-lg md:rounded-xl lg:rounded-2xl px-10 md:px-12 py-2.5 md:py-3 lg:py-3.5 outline-none focus:ring-4 focus:ring-[#579BE8]/10 transition-all text-xs md:text-sm lg:text-base font-medium shadow-sm hover:shadow-md placeholder:font-medium`}
                                            />
                                        </div>
                                        {errors.name && <p className="text-[10px] md:text-xs text-red-500 mr-3 md:mr-4 font-bold flex items-center gap-1">
                                            <span>⚠️</span> {errors.name}
                                        </p>}
                                    </div>
                                )}
                                <div className="space-y-1.5 md:space-y-2 relative">
                                    <label className={`${labelClasses} text-xs md:text-sm`}>اسم مقدم الطلب <span className="text-red-500">*</span></label>
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
                                    <label className={`${labelClasses} text-xs md:text-sm`}>رقم الجوال <span className="text-red-500">*</span></label>
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
                                    <p className="text-[10px] md:text-xs text-muted-foreground mr-3 md:mr-4">
                                        مثال: 0512345678 أو 5123456789
                                    </p>
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
                                                <SelectItem value="3 أشهر ">3 أشهر </SelectItem>
                                                <SelectItem value="6 أشهر">6 أشهر</SelectItem>
                                                <SelectItem value="سنة كاملة">سنة كاملة</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* موقع التوصيل - نفس فكرة OrderForm */}
                            <div className="space-y-3 md:space-y-4 mb-5">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 text-foreground/80 font-bold text-xs md:text-sm">
                                        <MapPin className="w-4 h-4 text-[#579BE8]" />
                                        موقع التوصيل / العنوان
                                    </label>
                                    <button
                                        type="button"
                                        onClick={navigateToAddressesPage}
                                        className="text-xs px-3 py-1.5 bg-[#579BE8]/10 text-[#579BE8] rounded-lg hover:bg-[#579BE8]/20 transition-colors font-medium flex items-center gap-1"
                                    >
                                        <FaMapMarkerAlt className="w-3 h-3" />
                                        إدارة العناوين
                                    </button>
                                </div>

                                {loadingAddresses ? (
                                    <div className="flex items-center justify-center py-4 rounded-xl bg-secondary/20">
                                        <span className="text-sm text-muted-foreground">جاري تحميل الأماكن المحفوظة...</span>
                                    </div>
                                ) : addresses.length === 0 ? (
                                    <div className="p-3 md:p-4 rounded-xl bg-[#579BE8]/10 border-2 border-dashed border-[#579BE8]/40 text-center">
                                        <p className="text-xs md:text-sm font-medium text-foreground mb-1">لا توجد أماكن محفوظة</p>
                                        <p className="text-[10px] md:text-xs text-muted-foreground">اختر موقعك من الخريطة وسيتم حفظه تلقائياً في الأماكن المحفوظة</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-foreground/80 flex items-center gap-2">
                                                <FaStar className="text-[#579BE8] w-3 h-3" />
                                                الأماكن المحفوظة
                                            </h4>
                                            {addresses.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAllLocations(!showAllLocations)}
                                                    className="text-xs text-[#579BE8] hover:text-[#124987] flex items-center gap-1"
                                                >
                                                    {showAllLocations ? <><ChevronUp size={12} /> إخفاء</> : <><ChevronDown size={12} /> عرض الكل ({addresses.length})</>}
                                                </button>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            {(showAllLocations ? addresses : addresses.slice(0, 2)).map((location) => (
                                                <div
                                                    key={location.id}
                                                    onClick={() => handleSavedLocationSelect(location)}
                                                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                                        selectedSavedLocation?.id === location.id && !isManualLocation
                                                            ? 'bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/5 border-[#579BE8]'
                                                            : 'bg-white dark:bg-card border-border/60 hover:border-[#579BE8]/50'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                            selectedSavedLocation?.id === location.id && !isManualLocation ? 'bg-[#579BE8] text-white' : 'bg-secondary/30 text-muted-foreground'
                                                        }`}>
                                                            {location.type === 'home' ? <FaHome className="w-4 h-4" /> :
                                                             location.type === 'work' ? <FaBriefcase className="w-4 h-4" /> :
                                                             <FaMapMarkedAlt className="w-4 h-4" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <span className="font-medium text-xs md:text-sm text-foreground truncate">{location.name}</span>
                                                                {location.is_favorite && <FaStar className="text-[#579BE8] w-3 h-3 flex-shrink-0" />}
                                                            </div>
                                                            <p className="text-[10px] md:text-xs text-muted-foreground truncate">{location.address}</p>
                                                            {selectedSavedLocation?.id === location.id && !isManualLocation && (
                                                                <span className="text-[10px] px-2 py-0.5 bg-[#579BE8]/10 text-[#579BE8] rounded mt-1 inline-block">محدد</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                <div
                                    onClick={() => setIsMapOpen(true)}
                                    className={`group cursor-pointer relative w-full min-h-[52px] rounded-xl md:rounded-2xl transition-all duration-300 flex items-center px-3 md:px-4 overflow-hidden border-2 border-dashed ${
                                        locationData
                                            ? 'bg-[#579BE8]/5 border-[#579BE8]/50 hover:border-[#579BE8]/70'
                                            : 'bg-gradient-to-r from-[#579BE8]/5 to-[#124987]/5 hover:from-[#579BE8]/10 border-[#579BE8]/30 hover:border-[#579BE8]/60'
                                    }`}
                                >
                                    <div className="flex-1 flex items-center gap-2 md:gap-3">
                                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center ${
                                            locationData ? 'bg-gradient-to-r from-[#579BE8] to-[#124987] text-white' : 'bg-[#579BE8]/10 text-[#579BE8]'
                                        }`}>
                                            <MapPin size={18} />
                                        </div>
                                        <div className="flex flex-col items-start overflow-hidden flex-1 min-w-0">
                                            {locationData ? (
                                                <>
                                                    <span className="text-xs md:text-sm font-bold text-foreground truncate w-full text-right">
                                                        {selectedSavedLocation ? selectedSavedLocation.name : 'موقع على الخريطة'}
                                                    </span>
                                                    <span className="text-[10px] md:text-xs text-muted-foreground truncate w-full text-right mt-0.5">
                                                        {locationData.address || selectedSavedLocation?.address}
                                                    </span>
                                                    <span className="text-[#579BE8] text-[10px] mt-0.5">
                                                        ✓ {isManualLocation ? 'موقع على الخريطة' : 'مكان محفوظ'}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-xs md:text-sm font-medium text-muted-foreground truncate w-full text-right">
                                                    اضغط لتحديد موقع جديد على الخريطة
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {locationData && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleClearLocation(); }}
                                            className="absolute left-2 md:left-3 p-1.5 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-lg hover:bg-red-200 transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                    <div className="absolute left-2 md:left-3 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-[#579BE8] to-[#124987] text-white p-1.5 rounded-lg">
                                        <ArrowRight size={14} />
                                    </div>
                                </div>
                                {locationData && isManualLocation && (
                                    <div className="p-2 md:p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                                        <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-2">
                                            <CheckCircle2 size={12} />
                                            سيتم حفظ هذا الموقع تلقائياً مع طلب التعاقد
                                        </p>
                                    </div>
                                )}
                            </div>

                            <LocationPickerModal
                                isOpen={isMapOpen}
                                onClose={() => setIsMapOpen(false)}
                                onSelect={handleManualLocationSelect}
                            />

                            <div className="space-y-1.5 md:space-y-2 relative mb-5">
                                <label className={`${labelClasses} text-xs md:text-sm`}>رابط الموقع الإلكتروني</label>
                                <div className="relative">
                                    <FaGlobe className={`absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-[#579BE8] w-4 h-4 md:w-5 md:h-5 z-10`} />
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleInputChange}
                                        placeholder="https://www.example.com"
                                        className={`w-full bg-white dark:bg-card border-2 ${errors.website ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-border/60 focus:border-[#579BE8]'} rounded-lg md:rounded-xl lg:rounded-2xl px-10 md:px-12 py-2.5 md:py-3 lg:py-3.5 outline-none focus:ring-4 focus:ring-[#579BE8]/10 transition-all text-xs md:text-sm lg:text-base font-medium shadow-sm hover:shadow-md placeholder:font-medium`}
                                    />
                                </div>
                                {errors.website && <p className="text-[10px] md:text-xs text-red-500 mr-3 md:mr-4 font-bold flex items-center gap-1">
                                    <span>⚠️</span> {errors.website}
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