"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaMapMarkerAlt, FaStar, FaChevronLeft, FaBuilding, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { BiCurrentLocation } from "react-icons/bi";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import Spinner from "@/components/ui/spinner";
import { motion } from "framer-motion";

export default function AddressesPage() {
    const router = useRouter();
    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [loadingAddressDetails, setLoadingAddressDetails] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [editAddressForm, setEditAddressForm] = useState({
        name: '',
        address: '',
        city: '',
        area: '',
        latitude: '',
        longitude: '',
        type: 'home',
        additional_info: '',
        is_favorite: false
    });
    const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

    // Fetch addresses on component mount
    useEffect(() => {
        const fetchAddresses = async () => {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                toast.error("يرجى تسجيل الدخول أولاً");
                router.push('/login');
                return;
            }

            try {
                setLoadingAddresses(true);
                const response = await fetch("/api/addresses", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${accessToken}`,
                    },
                });

                const data = await response.json();
                if (response.ok && data.status && data.data) {
                    setAddresses(data.data);
                } else {
                    toast.error(data.message || "فشل جلب العناوين");
                }
            } catch (error) {
                toast.error("حدث خطأ أثناء جلب العناوين");
            } finally {
                setLoadingAddresses(false);
            }
        };

        fetchAddresses();
    }, [router]);

    // Fetch address details by ID
    const fetchAddressDetails = async (addressId) => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            toast.error("يرجى تسجيل الدخول أولاً");
            return;
        }

        try {
            setLoadingAddressDetails(true);
            setSelectedAddress(null);
            setIsEditingAddress(false);

            const response = await fetch(`/api/addresses/${addressId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();
            if (response.ok && data.status && data.data) {
                const addressData = data.data;
                setSelectedAddress(addressData);
                setEditAddressForm({
                    name: addressData.name || '',
                    address: addressData.address || '',
                    city: addressData.city || '',
                    area: addressData.area || '',
                    latitude: addressData.latitude || '',
                    longitude: addressData.longitude || '',
                    type: addressData.type || 'home',
                    additional_info: addressData.additional_info || '',
                    is_favorite: addressData.is_favorite || false
                });
            } else {
                toast.error(data.message || "فشل جلب تفاصيل العنوان");
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء جلب تفاصيل العنوان");
        } finally {
            setLoadingAddressDetails(false);
        }
    };

    // Update address
    const handleUpdateAddress = async () => {
        if (!selectedAddress?.id) return;

        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            toast.error("يرجى تسجيل الدخول أولاً");
            return;
        }

        try {
            setIsUpdatingAddress(true);
            const response = await fetch(`/api/addresses/${selectedAddress.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: JSON.stringify(editAddressForm),
            });

            const data = await response.json();
            if (response.ok && data.status) {
                toast.success(data.message || "تم تحديث العنوان بنجاح");
                setIsEditingAddress(false);
                // Refresh addresses list
                const addressesResponse = await fetch("/api/addresses", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${accessToken}`,
                    },
                });
                const addressesData = await addressesResponse.json();
                if (addressesData.status && addressesData.data) {
                    setAddresses(addressesData.data);
                }
                // Refresh selected address
                await fetchAddressDetails(selectedAddress.id);
            } else {
                toast.error(data.message || "فشل تحديث العنوان");
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء تحديث العنوان");
        } finally {
            setIsUpdatingAddress(false);
        }
    };

    return (
        <div className="space-y-6 fade-in-up">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-secondary/50 rounded-xl transition-colors"
                    >
                        <FaChevronLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-foreground">الأماكن المحفوظة</h1>
                        <p className="text-sm text-muted-foreground mt-1">إدارة عناوينك المحفوظة والمفضلة</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Addresses List */}
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-card rounded-2xl shadow-xl border border-border/60 p-4 sm:p-6 h-full min-h-[600px] flex flex-col"
                    >
                        <h2 className="text-lg font-bold text-foreground mb-4">قائمة العناوين</h2>
                        
                        {loadingAddresses ? (
                            <div className="flex items-center justify-center py-12 flex-1">
                                <Spinner />
                            </div>
                        ) : addresses.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground flex-1 flex flex-col items-center justify-center">
                                <FaMapMarkerAlt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>لا توجد عناوين محفوظة</p>
                            </div>
                        ) : (
                            <div className="space-y-3 flex-1 overflow-y-auto">
                                    {addresses.map((address) => (
                                        <div
                                            key={address.id}
                                            onClick={() => fetchAddressDetails(address.id)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                selectedAddress?.id === address.id
                                                    ? 'bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/5 border-[#579BE8] shadow-lg'
                                                    : 'bg-secondary/30 border-border/50 hover:border-[#579BE8]/50 hover:shadow-md'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-bold text-sm text-foreground truncate">
                                                            {address.name}
                                                        </h4>
                                                        {address.is_favorite && (
                                                            <FaStar className="text-[#579BE8] w-4 h-4 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    {address.address && (
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {address.address}
                                                        </p>
                                                    )}
                                                    {address.type && (
                                                        <span className="inline-block mt-2 text-xs px-2 py-1 rounded-lg bg-[#579BE8]/10 text-[#579BE8]">
                                                            {address.type === 'home' ? '🏠 منزل' : 
                                                             address.type === 'work' ? '💼 عمل' : 
                                                             address.type === 'other' ? '📍 أخرى' : address.type}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Address Details */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-card rounded-2xl shadow-xl border border-border/60 overflow-hidden h-full min-h-[600px] flex flex-col"
                    >
                        {!selectedAddress ? (
                            <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#579BE8]/20 to-[#124987]/20 flex items-center justify-center">
                                    <FaMapMarkerAlt className="w-10 h-10 text-[#579BE8]" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">اختر عنواناً لعرض التفاصيل</h3>
                                <p className="text-sm text-muted-foreground">انقر على أي عنوان من القائمة لعرض وتعديل تفاصيله</p>
                            </div>
                        ) : (
                            <>
                                {/* Header with Gradient */}
                                <div className="relative bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] p-6 sm:p-8 text-white overflow-hidden flex-shrink-0">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
                                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 blur-2xl"></div>
                                        
                                        <div className="relative z-10 flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                        <FaMapMarkerAlt className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl sm:text-2xl font-black mb-1">
                                                            {selectedAddress.name}
                                                        </h3>
                                                        {selectedAddress.type && (
                                                            <p className="text-white/80 text-sm">
                                                                {selectedAddress.type === 'home' ? '🏠 منزل' : 
                                                                 selectedAddress.type === 'work' ? '💼 عمل' : 
                                                                 selectedAddress.type === 'other' ? '📍 أخرى' : selectedAddress.type}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {selectedAddress.is_favorite && (
                                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/30">
                                                        <FaStar className="w-5 h-5" />
                                                    </div>
                                                )}
                                                {!loadingAddressDetails && (
                                                    <button
                                                        onClick={() => {
                                                            setIsEditingAddress(!isEditingAddress);
                                                            if (!isEditingAddress) {
                                                                setEditAddressForm({
                                                                    name: selectedAddress.name || '',
                                                                    address: selectedAddress.address || '',
                                                                    city: selectedAddress.city || '',
                                                                    area: selectedAddress.area || '',
                                                                    latitude: selectedAddress.latitude || '',
                                                                    longitude: selectedAddress.longitude || '',
                                                                    type: selectedAddress.type || 'home',
                                                                    additional_info: selectedAddress.additional_info || '',
                                                                    is_favorite: selectedAddress.is_favorite || false
                                                                });
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all font-bold text-sm flex items-center gap-2 border border-white/30"
                                                    >
                                                        <CiEdit className="w-4 h-4" />
                                                        {isEditingAddress ? 'إلغاء' : 'تعديل'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                {/* Content */}
                                <div className="p-6 sm:p-8 overflow-y-auto flex-1">
                                        {loadingAddressDetails ? (
                                            <div className="flex items-center justify-center py-12">
                                                <Spinner />
                                            </div>
                                        ) : isEditingAddress ? (
                                            <div className="space-y-5">
                                                <div className="bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/5 rounded-2xl p-5 border-2 border-[#579BE8]/20">
                                                    <label className="text-sm font-bold text-foreground mb-3 block flex items-center gap-2">
                                                        <FaMapMarkerAlt className="text-[#579BE8] w-4 h-4" />
                                                        اسم العنوان
                                                    </label>
                                                    <Input
                                                        value={editAddressForm.name}
                                                        onChange={(e) => setEditAddressForm(prev => ({ ...prev, name: e.target.value }))}
                                                        className="w-full bg-white dark:bg-card border-2 border-border/50 focus:border-[#579BE8] rounded-xl"
                                                        placeholder="اسم العنوان"
                                                    />
                                                </div>

                                                <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50">
                                                    <label className="text-sm font-bold text-foreground mb-3 block flex items-center gap-2">
                                                        <FaMapMarkerAlt className="text-[#579BE8] w-4 h-4" />
                                                        العنوان الكامل
                                                    </label>
                                                    <textarea
                                                        value={editAddressForm.address}
                                                        onChange={(e) => setEditAddressForm(prev => ({ ...prev, address: e.target.value }))}
                                                        className="w-full p-4 bg-white dark:bg-card border-2 border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#579BE8] focus:border-[#579BE8] resize-none"
                                                        rows="3"
                                                        placeholder="العنوان الكامل"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50">
                                                        <label className="text-sm font-bold text-foreground mb-3 block flex items-center gap-2">
                                                            <FaBuilding className="text-[#579BE8] w-4 h-4" />
                                                            المدينة
                                                        </label>
                                                        <Input
                                                            value={editAddressForm.city}
                                                            onChange={(e) => setEditAddressForm(prev => ({ ...prev, city: e.target.value }))}
                                                            className="w-full bg-white dark:bg-card border-2 border-border/50 focus:border-[#579BE8] rounded-xl"
                                                            placeholder="المدينة"
                                                        />
                                                    </div>

                                                    <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50">
                                                        <label className="text-sm font-bold text-foreground mb-3 block flex items-center gap-2">
                                                            <BiCurrentLocation className="text-[#579BE8] w-4 h-4" />
                                                            المنطقة
                                                        </label>
                                                        <Input
                                                            value={editAddressForm.area}
                                                            onChange={(e) => setEditAddressForm(prev => ({ ...prev, area: e.target.value }))}
                                                            className="w-full bg-white dark:bg-card border-2 border-border/50 focus:border-[#579BE8] rounded-xl"
                                                            placeholder="المنطقة"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50">
                                                        <label className="text-sm font-bold text-foreground mb-3 block">خط العرض</label>
                                                        <Input
                                                            type="text"
                                                            value={editAddressForm.latitude}
                                                            onChange={(e) => setEditAddressForm(prev => ({ ...prev, latitude: e.target.value }))}
                                                            className="w-full bg-white dark:bg-card border-2 border-border/50 focus:border-[#579BE8] rounded-xl font-mono"
                                                            placeholder="24.7136"
                                                        />
                                                    </div>

                                                    <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50">
                                                        <label className="text-sm font-bold text-foreground mb-3 block">خط الطول</label>
                                                        <Input
                                                            type="text"
                                                            value={editAddressForm.longitude}
                                                            onChange={(e) => setEditAddressForm(prev => ({ ...prev, longitude: e.target.value }))}
                                                            className="w-full bg-white dark:bg-card border-2 border-border/50 focus:border-[#579BE8] rounded-xl font-mono"
                                                            placeholder="46.6753"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50">
                                                        <label className="text-sm font-bold text-foreground mb-3 block">النوع</label>
                                                        <select
                                                            value={editAddressForm.type}
                                                            onChange={(e) => setEditAddressForm(prev => ({ ...prev, type: e.target.value }))}
                                                            className="w-full p-3 bg-white dark:bg-card border-2 border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#579BE8] focus:border-[#579BE8]"
                                                        >
                                                            <option value="home">🏠 منزل</option>
                                                            <option value="work">💼 عمل</option>
                                                            <option value="other">📍 أخرى</option>
                                                        </select>
                                                    </div>

                                                    <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50 flex items-center justify-center">
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="checkbox"
                                                                id="is_favorite"
                                                                checked={editAddressForm.is_favorite}
                                                                onChange={(e) => setEditAddressForm(prev => ({ ...prev, is_favorite: e.target.checked }))}
                                                                className="w-6 h-6 rounded border-2 border-border/50 text-[#579BE8] focus:ring-[#579BE8] cursor-pointer"
                                                            />
                                                            <label htmlFor="is_favorite" className="text-sm font-bold text-foreground cursor-pointer flex items-center gap-2">
                                                                <FaStar className={`w-5 h-5 ${editAddressForm.is_favorite ? 'text-[#579BE8]' : 'text-muted-foreground'}`} />
                                                                إضافة إلى المفضلة
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50">
                                                    <label className="text-sm font-bold text-foreground mb-3 block flex items-center gap-2">
                                                        <FaInfoCircle className="text-[#579BE8] w-4 h-4" />
                                                        معلومات إضافية
                                                    </label>
                                                    <textarea
                                                        value={editAddressForm.additional_info}
                                                        onChange={(e) => setEditAddressForm(prev => ({ ...prev, additional_info: e.target.value }))}
                                                        className="w-full p-4 bg-white dark:bg-card border-2 border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#579BE8] focus:border-[#579BE8] resize-none"
                                                        rows="3"
                                                        placeholder="معلومات إضافية"
                                                    />
                                                </div>

                                                <div className="flex gap-3 pt-2">
                                                    <button
                                                        onClick={handleUpdateAddress}
                                                        disabled={isUpdatingAddress}
                                                        className="flex-1 bg-gradient-to-r from-[#579BE8] to-[#124987] text-white py-3.5 rounded-xl hover:from-[#4a8dd8] hover:to-[#0f3d6f] transition-all font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                    >
                                                        {isUpdatingAddress ? (
                                                            <>
                                                                <Spinner />
                                                                <span>جاري الحفظ...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FaCheckCircle className="w-5 h-5" />
                                                                <span>حفظ التغييرات</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsEditingAddress(false);
                                                            if (selectedAddress) {
                                                                setEditAddressForm({
                                                                    name: selectedAddress.name || '',
                                                                    address: selectedAddress.address || '',
                                                                    city: selectedAddress.city || '',
                                                                    area: selectedAddress.area || '',
                                                                    latitude: selectedAddress.latitude || '',
                                                                    longitude: selectedAddress.longitude || '',
                                                                    type: selectedAddress.type || 'home',
                                                                    additional_info: selectedAddress.additional_info || '',
                                                                    is_favorite: selectedAddress.is_favorite || false
                                                                });
                                                            }
                                                        }}
                                                        className="px-6 py-3.5 bg-secondary text-foreground rounded-xl hover:bg-secondary/80 transition-colors font-bold border border-border/50"
                                                    >
                                                        إلغاء
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 sm:space-y-5">
                                                {/* Name Card */}
                                                <div className="bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/5 rounded-2xl p-5 border-2 border-[#579BE8]/20">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#579BE8] to-[#124987] flex items-center justify-center shadow-lg">
                                                                <FaMapMarkerAlt className="w-6 h-6 text-white" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-lg sm:text-xl font-black text-foreground">
                                                                    {selectedAddress.name}
                                                                </h4>
                                                                {selectedAddress.type && (
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        {selectedAddress.type === 'home' ? '🏠 منزل' : 
                                                                         selectedAddress.type === 'work' ? '💼 عمل' : 
                                                                         selectedAddress.type === 'other' ? '📍 أخرى' : selectedAddress.type}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {selectedAddress.is_favorite && (
                                                            <div className="bg-[#579BE8]/20 rounded-xl px-3 py-2 border border-[#579BE8]/30">
                                                                <FaStar className="text-[#579BE8] w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Address Card */}
                                                {selectedAddress.address && (
                                                    <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50 hover:border-[#579BE8]/30 transition-all">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-[#579BE8]/10 flex items-center justify-center flex-shrink-0">
                                                                <FaMapMarkerAlt className="text-[#579BE8] w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">العنوان الكامل</p>
                                                                <p className="text-base text-foreground leading-relaxed">{selectedAddress.address}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Location Details Grid */}
                                                {(selectedAddress.city || selectedAddress.area) && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {selectedAddress.city && (
                                                            <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50 hover:border-[#579BE8]/30 transition-all">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <div className="w-8 h-8 rounded-lg bg-[#579BE8]/10 flex items-center justify-center">
                                                                        <FaBuilding className="text-[#579BE8] w-4 h-4" />
                                                                    </div>
                                                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">المدينة</p>
                                                                </div>
                                                                <p className="text-base font-bold text-foreground">{selectedAddress.city}</p>
                                                            </div>
                                                        )}

                                                        {selectedAddress.area && (
                                                            <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50 hover:border-[#579BE8]/30 transition-all">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <div className="w-8 h-8 rounded-lg bg-[#579BE8]/10 flex items-center justify-center">
                                                                        <BiCurrentLocation className="text-[#579BE8] w-4 h-4" />
                                                                    </div>
                                                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">المنطقة</p>
                                                                </div>
                                                                <p className="text-base font-bold text-foreground">{selectedAddress.area}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Coordinates Card */}
                                                {(selectedAddress.latitude && selectedAddress.longitude) && (
                                                    <div className="bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-2xl p-5 border border-border/50">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-8 h-8 rounded-lg bg-[#579BE8]/10 flex items-center justify-center">
                                                                <FaMapMarkerAlt className="text-[#579BE8] w-4 h-4" />
                                                            </div>
                                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">الإحداثيات الجغرافية</p>
                                                        </div>
                                                        <div className="bg-white dark:bg-card rounded-xl p-3 border border-border/40">
                                                            <p className="text-sm font-mono text-foreground text-center">
                                                                <span className="text-muted-foreground">Lat:</span> {selectedAddress.latitude} 
                                                                <span className="mx-2 text-muted-foreground">|</span>
                                                                <span className="text-muted-foreground">Lng:</span> {selectedAddress.longitude}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Additional Info Card */}
                                                {selectedAddress.additional_info && (
                                                    <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50 hover:border-[#579BE8]/30 transition-all">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-8 h-8 rounded-lg bg-[#579BE8]/10 flex items-center justify-center">
                                                                <FaInfoCircle className="text-[#579BE8] w-4 h-4" />
                                                            </div>
                                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">معلومات إضافية</p>
                                                        </div>
                                                        <p className="text-sm text-foreground leading-relaxed bg-white dark:bg-card rounded-xl p-4 border border-border/40">
                                                            {selectedAddress.additional_info}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                    )}
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

