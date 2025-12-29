"use client";

import { useState } from "react";

import { FaRegUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBell, FaHeart, FaChevronLeft, FaStar, FaPlus } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { BiCurrentLocation } from "react-icons/bi";
import { FaRegTrashCan } from "react-icons/fa6";
import Swal from "sweetalert2";
import Link from "next/link";


export default function MyProfilePage() {
    const [showSavedPlaces, setShowSavedPlaces] = useState(false);
    const [showAllPlaces, setShowAllPlaces] = useState(false);

    // Form States
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [errors, setErrors] = useState({
        fullName: "",
        phone: "",
        location: ""
    });

    // CRUD States for Saved Places
    const [places, setPlaces] = useState([
        "الرياض حي الملك فهد 1",
        "الرياض حي الملك فهد 2",
        "الرياض حي الملك فهد 3",
        "الرياض حي الملك فهد 4",
        "الرياض حي الملك فهد 5",
        "الرياض حي الملك فهد 6"
    ]);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState("");

    const handleAdd = () => {
        if (newName.trim()) {
            setPlaces([newName, ...places]);
            setNewName("");
            setIsAdding(false);
            setShowSavedPlaces(true);
        }
    };

    const handleUpdate = (index) => {
        if (editValue.trim()) {
            const updated = [...places];
            updated[index] = editValue;
            setPlaces(updated);
            setEditingIndex(null);
        }
    };

    const handleDelete = (index) => {
        setPlaces(places.filter((_, i) => i !== index));
    };

    // CRUD States for Favorite Places
    const [showFavorites, setShowFavorites] = useState(false);
    const [showAllFavorites, setShowAllFavorites] = useState(false);
    const [favorites, setFavorites] = useState([
        "مطعم البيك - الرياض",
        "مقهى هاف مليون",
        "مكتبة جرير - فرع الحمراء"
    ]);
    const [isAddingFavorite, setIsAddingFavorite] = useState(false);
    const [newFavoriteName, setNewFavoriteName] = useState("");
    const [editingFavoriteIndex, setEditingFavoriteIndex] = useState(null);
    const [editFavoriteValue, setEditFavoriteValue] = useState("");

    const handleAddFavorite = () => {
        if (newFavoriteName.trim()) {
            setFavorites([newFavoriteName, ...favorites]);
            setNewFavoriteName("");
            setIsAddingFavorite(false);
            setShowFavorites(true);
        }
    };

    const handleUpdateFavorite = (index) => {
        if (editFavoriteValue.trim()) {
            const updated = [...favorites];
            updated[index] = editFavoriteValue;
            setFavorites(updated);
            setEditingFavoriteIndex(null);
        }
    };

    const handleDeleteFavorite = (index) => {
        setFavorites(favorites.filter((_, i) => i !== index));
    };

    const handleDisableAccount = () => {
        Swal.fire({
            title: "هل أنت متأكد؟",
            text: "سيتم تعطيل حسابك مؤقتاً ولن تتمكن من تلقي الإشعارات.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#579BE8",
            cancelButtonColor: "#F75A65",
            confirmButtonText: "نعم، عطل الحساب",
            cancelButtonText: "إلغاء",
            background: "var(--background)",
            color: "var(--foreground)",
            customClass: {
                popup: "rounded-2xl border border-border shadow-xl",
                confirmButton: "rounded-xl font-bold px-6 py-2",
                cancelButton: "rounded-xl font-bold px-6 py-2"
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "تم التعطيل!",
                    text: "تم تعطيل حسابك بنجاح.",
                    icon: "success",
                    confirmButtonColor: "#579BE8",
                    confirmButtonText: "موافق",
                    background: "var(--background)",
                    color: "var(--foreground)",
                    customClass: {
                        popup: "rounded-2xl border border-border shadow-xl",
                        confirmButton: "rounded-xl font-bold px-6 py-2"
                    }
                });
            }
        });
    };
    const handleDeleteAccount = () => {
        Swal.fire({
            title: "هل أنت متأكد؟",
            text: "سيتم حذف حسابك نهائياً ولن تتمكن من استخدام التطبيق.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#579BE8",
            cancelButtonColor: "#F75A65",
            confirmButtonText: "نعم، حذف الحساب",
            cancelButtonText: "إلغاء",
            background: "var(--background)",
            color: "var(--foreground)",
            customClass: {
                popup: "rounded-2xl border border-border shadow-xl",
                confirmButton: "rounded-xl font-bold px-6 py-2",
                cancelButton: "rounded-xl font-bold px-6 py-2"
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "تم الحذف!",
                    text: "تم حذف حسابك بنجاح.",
                    icon: "success",
                    confirmButtonColor: "#579BE8",
                    confirmButtonText: "موافق",
                    background: "var(--background)",
                    color: "var(--foreground)",
                    customClass: {
                        popup: "rounded-2xl border border-border shadow-xl",
                        confirmButton: "rounded-xl font-bold px-6 py-2"
                    }
                });
            }
        });
    };

    const handleDeleteImage = () => {
        Swal.fire({
            title: "حذف الصورة",
            text: "هل أنت متأكد من حذف الصورة الشخصية؟",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#F75A65",
            cancelButtonColor: "#579BE8",
            confirmButtonText: "نعم، احذف",
            cancelButtonText: "إلغاء",
            background: "var(--background)",
            color: "var(--foreground)",
            customClass: {
                popup: "rounded-2xl border border-border shadow-xl",
                confirmButton: "rounded-xl font-bold px-6 py-2",
                cancelButton: "rounded-xl font-bold px-6 py-2"
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Handle delete image logic here
                Swal.fire({
                    title: "تم الحذف!",
                    text: "تم حذف الصورة الشخصية بنجاح.",
                    icon: "success",
                    confirmButtonColor: "#579BE8",
                    confirmButtonText: "موافق",
                    background: "var(--background)",
                    color: "var(--foreground)",
                    customClass: {
                        popup: "rounded-2xl border border-border shadow-xl",
                        confirmButton: "rounded-xl font-bold px-6 py-2"
                    }
                });
            }
        });
    };

    const handleUploadImage = () => {
        // Create a file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                // Handle image upload logic here
                Swal.fire({
                    title: "تم الرفع!",
                    text: "تم رفع الصورة الشخصية بنجاح.",
                    icon: "success",
                    confirmButtonColor: "#579BE8",
                    confirmButtonText: "موافق",
                    background: "var(--background)",
                    color: "var(--foreground)",
                    customClass: {
                        popup: "rounded-2xl border border-border shadow-xl",
                        confirmButton: "rounded-xl font-bold px-6 py-2"
                    }
                });
            }
        };
        input.click();
    };

    // Validation functions
    const validateFullName = (value) => {
        if (!value.trim()) {
            return "الاسم الكامل مطلوب";
        }
        if (value.trim().length < 3) {
            return "الاسم يجب أن يحتوي على الأقل 3 أحرف";
        }
        if (value.trim().length > 50) {
            return "الاسم يجب ألا يتجاوز 50 حرف";
        }
        return "";
    };

    const validatePhone = (value) => {
        if (!value.trim()) {
            return "رقم الجوال مطلوب";
        }
        // Saudi phone validation: Starts with 05 and followed by 8 digits (Total 10)
        const regex = /^05\d{8}$/;
        if (!regex.test(value.trim())) {
            return "يرجى إدخال رقم جوال صحيح (يبدأ بـ 05 ويتكون من 10 أرقام)";
        }
        return "";
    };

    const validateLocation = (value) => {
        if (!value.trim()) {
            return "الموقع مطلوب";
        }
        if (value.trim().length < 5) {
            return "الموقع يجب أن يحتوي على الأقل 5 أحرف";
        }
        return "";
    };

    const handleFullNameChange = (e) => {
        const value = e.target.value;
        setFullName(value);
        if (errors.fullName) {
            setErrors(prev => ({ ...prev, fullName: validateFullName(value) }));
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, ""); // Only allow digits
        setPhone(value);
        if (errors.phone) {
            setErrors(prev => ({ ...prev, phone: validatePhone(value) }));
        }
    };

    const handleLocationChange = (e) => {
        const value = e.target.value;
        setLocation(value);
        if (errors.location) {
            setErrors(prev => ({ ...prev, location: validateLocation(value) }));
        }
    };

    const handleSaveChanges = () => {
        // Check if any field has value
        if (!fullName.trim() && !phone.trim() && !location.trim()) {
            Swal.fire({
                title: "تنبيه",
                text: "يرجى إدخال البيانات المراد تعديلها",
                icon: "info",
                confirmButtonColor: "#579BE8",
                confirmButtonText: "موافق",
                background: "var(--background)",
                color: "var(--foreground)",
                customClass: {
                    popup: "rounded-2xl border border-border shadow-xl",
                    confirmButton: "rounded-xl font-bold px-6 py-2"
                }
            });
            return;
        }

        // Validate only filled fields
        const newErrors = {};
        let hasErrors = false;

        if (fullName.trim()) {
            newErrors.fullName = validateFullName(fullName);
            if (newErrors.fullName) hasErrors = true;
        }
        if (phone.trim()) {
            newErrors.phone = validatePhone(phone);
            if (newErrors.phone) hasErrors = true;
        }
        if (location.trim()) {
            newErrors.location = validateLocation(location);
            if (newErrors.location) hasErrors = true;
        }

        setErrors(prev => ({ ...prev, ...newErrors }));

        if (hasErrors) {
            Swal.fire({
                title: "خطأ في التحقق",
                text: "يرجى تصحيح الأخطاء في النموذج",
                icon: "error",
                confirmButtonColor: "#579BE8",
                confirmButtonText: "موافق",
                background: "var(--background)",
                color: "var(--foreground)",
                customClass: {
                    popup: "rounded-2xl border border-border shadow-xl",
                    confirmButton: "rounded-xl font-bold px-6 py-2"
                }
            });
            return;
        }

        // Handle save changes logic here
        Swal.fire({
            title: "جاري الحفظ",
            text: "يرجى الانتظار...",
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            },
            timer: 1500
        }).then(() => {
            Swal.fire({
                title: "تم الحفظ!",
                text: "تم حفظ التعديلات بنجاح.",
                icon: "success",
                confirmButtonColor: "#579BE8",
                confirmButtonText: "موافق",
                background: "var(--background)",
                color: "var(--foreground)",
                customClass: {
                    popup: "rounded-2xl border border-border shadow-xl",
                    confirmButton: "rounded-xl font-bold px-6 py-2"
                }
            });
            // Clear form and errors after successful save
            setFullName("");
            setPhone("");
            setLocation("");
            setErrors({ fullName: "", phone: "", location: "" });
        });
    };
    return (
        <div className="flex flex-col gap-8 fade-in-up">
            {/* Profile Hero Section with Gradient */}
            <div className="bg-white dark:bg-card rounded-2xl shadow-xl overflow-hidden border border-border/60">
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                        <FaRegUser size={160} />
                    </div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>

                    {/* Hero Content */}
                    <div className="relative z-10 p-8 md:p-10">
                        <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl ring-4 ring-white/30 relative overflow-hidden">
                                        <Image
                                            src="/images/customer.png"
                                            alt="Customer"
                                            width={128}
                                            height={128}
                                            className="w-full h-full object-cover"
                                            quality={100}
                                            priority
                                            unoptimized
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-card shadow-lg"></div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tight">سعود بن ناصر المطيري</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold border border-white/30">
                                            نشط الآن
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleDeleteImage}
                                    className="px-4 md:px-6 cursor-pointer py-3 rounded-2xl font-bold border-2 border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                >
                                    حذف الصورة
                                </button>
                                <button 
                                    onClick={handleUploadImage}
                                    className="px-4 md:px-6 cursor-pointer py-3 rounded-2xl font-bold bg-white text-[#579BE8] hover:shadow-2xl hover:-translate-y-1 transition-all shadow-lg"
                                >
                                    رفع الصورة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Information Form */}
                <div className="p-8 md:p-10">

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-foreground/80 mr-2">الاسم الكامل</label>
                            <div className="relative group">
                                <div className={`absolute top-1/2 -translate-y-1/2 right-4 transition-colors ${errors.fullName ? "text-destructive" : "text-muted-foreground/60 group-focus-within:text-primary"}`}>
                                    <FaRegUser className="w-5 h-5" />
                                </div>
                                <Input
                                    value={fullName}
                                    onChange={handleFullNameChange}
                                    onBlur={() => setErrors(prev => ({ ...prev, fullName: validateFullName(fullName) }))}
                                    placeholder="الاسم الكامل"
                                    className={`h-[60px] pr-12 text-foreground text-base font-medium border-2 rounded-2xl bg-secondary/30 transition-all ${
                                        errors.fullName 
                                            ? "border-destructive/50 focus:border-destructive focus:ring-4 focus:ring-destructive/10" 
                                            : "border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    }`}
                                />
                            </div>
                            {errors.fullName && (
                                <p className="text-destructive text-sm font-medium flex items-center gap-1 bg-destructive/5 px-3 py-2 rounded-lg border border-destructive/20">
                                    <span>⚠</span>
                                    {errors.fullName}
                                </p>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-foreground/80 mr-2">رقم الجوال</label>
                            <div className="relative group">
                                <div className="absolute top-1/2 -translate-y-1/2 left-4 w-[60px] h-[30px] opacity-90">
                                    <Image
                                        src="/images/phone-icon.png"
                                        alt="Phone Icon"
                                        width={79}
                                        height={31}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <Input
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    onBlur={() => setErrors(prev => ({ ...prev, phone: validatePhone(phone) }))}
                                    placeholder="05xxxxxxxx"
                                    dir="ltr"
                                    maxLength={10}
                                    className={`text-left pl-24 h-[60px] text-foreground text-base pr-12 font-medium border-2 rounded-2xl bg-secondary/30 transition-all ${
                                        errors.phone 
                                            ? "border-destructive/50 focus:border-destructive focus:ring-4 focus:ring-destructive/10" 
                                            : "border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    }`}
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-destructive text-sm font-medium flex items-center gap-1 bg-destructive/5 px-3 py-2 rounded-lg border border-destructive/20">
                                    <span>⚠</span>
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        {/* Location */}
                        <div className="space-y-2 lg:col-span-2">
                            <label className="block text-sm font-bold text-foreground/80 mr-2">الموقع</label>
                            <div className="relative group">
                                <div className={`absolute top-1/2 -translate-y-1/2 right-4 transition-colors ${errors.location ? "text-destructive" : "text-muted-foreground/60 group-focus-within:text-primary"}`}>
                                    <FaMapMarkerAlt className="w-5 h-5" />
                                </div>
                                <Input
                                    value={location}
                                    onChange={handleLocationChange}
                                    onBlur={() => setErrors(prev => ({ ...prev, location: validateLocation(location) }))}
                                    placeholder="الرياض - مستشفى الملك فيصل"
                                    className={`h-[60px] pr-12 text-foreground text-base font-medium border-2 rounded-2xl bg-secondary/30 transition-all ${
                                        errors.location 
                                            ? "border-destructive/50 focus:border-destructive focus:ring-4 focus:ring-destructive/10" 
                                            : "border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    }`}
                                />
                            </div>
                            {errors.location && (
                                <p className="text-destructive text-sm font-medium flex items-center gap-1 bg-destructive/5 px-3 py-2 rounded-lg border border-destructive/20">
                                    <span>⚠</span>
                                    {errors.location}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border/50 flex justify-end">
                        <button 
                            onClick={handleSaveChanges}
                            className="bg-[#579BE8] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#579BE8]/90 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#579BE8]/20 transition-all cursor-pointer text-lg shadow-lg"
                        >
                            حفظ التعديل
                        </button>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-card rounded-[2.5rem] overflow-hidden shadow-xl border border-border/60">
                <div className="p-8 md:p-10">
                    <h3 className="text-2xl font-black mb-8 text-foreground">إعدادات الحساب</h3>

                    <div className="flex flex-col gap-4">
                        {/* Notifications Toggle */}
                        <div className="flex items-center justify-between p-5 rounded-2xl border border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/30 transition-all cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-[#579BE8] to-[#315782] p-3.5 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                                    <FaBell className="text-white w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold mb-1 text-foreground">تفعيل الإشعارات</h4>
                                    <p className="text-sm text-muted-foreground">استقبال التنبيهات والتحديثات</p>
                                </div>
                            </div>
                            {/* Custom Switch Visual */}
                            <div className="w-14 h-7 bg-[#579BE8] rounded-full relative transition-all cursor-pointer shadow-lg shadow-[#579BE8]/20 group-hover:shadow-xl group-hover:shadow-[#579BE8]/30">
                                <div className="absolute top-0.5 right-0.5 bg-white w-6 h-6 rounded-full shadow-md transition-transform"></div>
                            </div>
                        </div>

                        {/* Saved Places */}
                        <div
                            id="savedPlaces"
                            onClick={() => setShowSavedPlaces(!showSavedPlaces)}
                            className="flex items-center justify-between p-5 rounded-2xl border border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/30 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-[#579BE8] to-[#315782] p-3.5 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                                    <BiCurrentLocation className="text-white w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold mb-1 text-foreground">الأماكن المحفوظة</h4>
                                    <p className="text-sm text-muted-foreground">احفظ مواقعك المفضلة</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAdding(!isAdding);
                                        if (!showSavedPlaces) setShowSavedPlaces(true);
                                    }}
                                    className="text-[#579BE8] bg-[#579BE8]/10 p-2.5 rounded-xl hover:bg-[#579BE8] hover:text-white transition-all shadow-sm hover:shadow-md"
                                    title="اضافة موقع جديد"
                                >
                                    <FaPlus className="w-5 h-5" />
                                    <span className="sr-only">اضافة</span>
                                </button>
                                <FaChevronLeft className={`text-muted-foreground group-hover:text-primary transition-transform duration-300 text-xl ${showSavedPlaces ? "rotate-[-90deg]" : ""}`} />
                            </div>
                        </div>
                        {showSavedPlaces && (
                            <div id="savedPlacesItem" className="flex flex-col gap-3 mt-2">
                                {/* Add New Input */}
                                {isAdding && (
                                    <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-[#579BE8]/10 to-[#579BE8]/5 rounded-2xl border-2 border-[#579BE8]/30 fade-in-up shadow-sm">
                                        <Input
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder="اسم الموقع الجديد..."
                                            className="h-11 text-sm border-border/50 focus:border-primary rounded-xl"
                                            autoFocus
                                        />
                                        <button onClick={handleAdd} className="bg-[#579BE8] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#579BE8]/90 hover:shadow-lg transition-all">حفظ</button>
                                        <button onClick={() => setIsAdding(false)} className="text-muted-foreground px-3 hover:text-foreground transition-colors font-medium">إلغاء</button>
                                    </div>
                                )}

                                {places.map((place, i) => (
                                    (i < 5 || showAllPlaces) && (
                                        <div key={i} className="flex items-center justify-between gap-4 p-4 bg-secondary/30 border border-border/50 rounded-2xl fade-in-up hover:bg-secondary/40 hover:border-primary/30 transition-all">
                                            {editingIndex === i ? (
                                                <div className="flex items-center gap-2 w-full">
                                                    <Input
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="h-10 text-sm border-border/50 focus:border-primary rounded-xl"
                                                        autoFocus
                                                    />
                                                    <button onClick={() => handleUpdate(i)} className="text-green-600 font-bold text-sm hover:text-green-700 px-3 py-2 bg-green-50 rounded-lg transition-colors">تأكيد</button>
                                                    <button onClick={() => setEditingIndex(null)} className="text-muted-foreground text-sm hover:text-foreground px-3 py-2 bg-secondary rounded-lg transition-colors">إلغاء</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <h4 className="font-semibold text-foreground">{place}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingIndex(i);
                                                                setEditValue(place);
                                                            }}
                                                            className="p-2.5 hover:bg-[#579BE8]/10 hover:text-[#579BE8] rounded-xl transition-all"
                                                        >
                                                            <CiEdit className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(i)}
                                                            className="p-2.5 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"
                                                        >
                                                            <FaRegTrashCan className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )
                                ))}
                                {places.length > 5 && (
                                    <button
                                        onClick={() => setShowAllPlaces(!showAllPlaces)}
                                        className="text-[#579BE8] font-bold text-sm mt-2 hover:underline cursor-pointer w-fit mx-auto px-4 py-2 hover:bg-[#579BE8]/10 rounded-xl transition-all"
                                    >
                                        {showAllPlaces ? "عرض أقل" : "عرض المزيد"}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Favorite Places */}
                        <div
                            className="flex items-center justify-between p-5 rounded-2xl border border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/30 transition-all cursor-pointer group"
                            onClick={() => setShowFavorites(!showFavorites)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-[#579BE8] to-[#315782] p-3.5 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                                    <FaStar className="text-white w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold mb-1 text-foreground">الأماكن المفضلة</h4>
                                    <p className="text-sm text-muted-foreground">احتفظ بأماكنك المفضلة</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAddingFavorite(!isAddingFavorite);
                                        if (!showFavorites) setShowFavorites(true);
                                    }}
                                    className="text-[#579BE8] bg-[#579BE8]/10 p-2.5 rounded-xl hover:bg-[#579BE8] hover:text-white transition-all shadow-sm hover:shadow-md"
                                    title="اضافة مفضل جديد"
                                >
                                    <FaPlus className="w-5 h-5" />
                                    <span className="sr-only">اضافة</span>
                                </button>
                                <FaChevronLeft className={`text-muted-foreground group-hover:text-primary transition-transform duration-300 text-xl ${showFavorites ? "rotate-[-90deg]" : ""}`} />
                            </div>
                        </div>

                        {showFavorites && (
                            <div className="flex flex-col gap-3 mt-2">
                                {/* Add New Input */}
                                {isAddingFavorite && (
                                    <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-[#579BE8]/10 to-[#579BE8]/5 rounded-2xl border-2 border-[#579BE8]/30 fade-in-up shadow-sm">
                                        <Input
                                            value={newFavoriteName}
                                            onChange={(e) => setNewFavoriteName(e.target.value)}
                                            placeholder="اسم المكان المفضل..."
                                            className="h-11 text-sm border-border/50 focus:border-primary rounded-xl"
                                            autoFocus
                                        />
                                        <button onClick={handleAddFavorite} className="bg-[#579BE8] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#579BE8]/90 hover:shadow-lg transition-all">حفظ</button>
                                        <button onClick={() => setIsAddingFavorite(false)} className="text-muted-foreground px-3 hover:text-foreground transition-colors font-medium">إلغاء</button>
                                    </div>
                                )}

                                {favorites.map((fav, i) => (
                                    (i < 5 || showAllFavorites) && (
                                        <div key={i} className="flex items-center justify-between gap-4 p-4 bg-secondary/30 border border-border/50 rounded-2xl fade-in-up hover:bg-secondary/40 hover:border-primary/30 transition-all">
                                            {editingFavoriteIndex === i ? (
                                                <div className="flex items-center gap-2 w-full">
                                                    <Input
                                                        value={editFavoriteValue}
                                                        onChange={(e) => setEditFavoriteValue(e.target.value)}
                                                        className="h-10 text-sm border-border/50 focus:border-primary rounded-xl"
                                                        autoFocus
                                                    />
                                                    <button onClick={() => handleUpdateFavorite(i)} className="text-green-600 font-bold text-sm hover:text-green-700 px-3 py-2 bg-green-50 rounded-lg transition-colors">تأكيد</button>
                                                    <button onClick={() => setEditingFavoriteIndex(null)} className="text-muted-foreground text-sm hover:text-foreground px-3 py-2 bg-secondary rounded-lg transition-colors">إلغاء</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <h4 className="font-semibold text-foreground">{fav}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingFavoriteIndex(i);
                                                                setEditFavoriteValue(fav);
                                                            }}
                                                            className="p-2.5 hover:bg-[#579BE8]/10 hover:text-[#579BE8] rounded-xl transition-all"
                                                        >
                                                            <CiEdit className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteFavorite(i)}
                                                            className="p-2.5 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"
                                                        >
                                                            <FaRegTrashCan className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )
                                ))}
                                {favorites.length > 5 && (
                                    <button
                                        onClick={() => setShowAllFavorites(!showAllFavorites)}
                                        className="text-[#579BE8] font-bold text-sm mt-2 hover:underline cursor-pointer w-fit mx-auto px-4 py-2 hover:bg-[#579BE8]/10 rounded-xl transition-all"
                                    >
                                        {showAllFavorites ? "عرض أقل" : "عرض المزيد"}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Danger Zone */}
                    <div className="mt-10 pt-8 border-t border-border/50">
                        <h3 className="text-xl font-black text-destructive mb-6">منطقة الخطر</h3>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-gradient-to-r from-destructive/5 to-destructive/10 border-2 border-destructive/30 rounded-2xl shadow-sm hover:shadow-md transition-all">
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-destructive mb-2">تعطيل الحساب مؤقتاً</h4>
                                <p className="text-sm text-destructive/80 leading-relaxed">سيتم إخفاء ملفك الشخصي ولن تتلقى أي إشعارات حتى تقوم بتسجيل الدخول مرة أخرى</p>
                            </div>
                            <button onClick={handleDisableAccount} className="bg-white dark:bg-card text-destructive border-2 border-destructive/50 px-6 py-3 rounded-xl font-bold hover:bg-destructive hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-sm min-w-fit">
                                تعطيل الحساب
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-card rounded-[2.5rem] overflow-hidden shadow-xl border border-border/60">
                <div className="p-8 md:p-10">
                    <h3 className="text-2xl font-black mb-8 text-foreground">الخصوصية والأمان</h3>
                    
                    {/* Location Sharing */}
                    <div className="flex items-center justify-between p-5 rounded-2xl border border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/30 transition-all cursor-pointer group mb-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-[#579BE8] to-[#315782] p-3.5 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                                <BiCurrentLocation className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold mb-1 text-foreground">مشاركة الموقع</h4>
                                <p className="text-sm text-muted-foreground">السماح بالوصول إلى موقعك</p>
                            </div>
                        </div>
                        {/* Custom Switch Visual */}
                        <div className="w-14 h-7 bg-[#579BE8] rounded-full relative transition-all cursor-pointer shadow-lg shadow-[#579BE8]/20 group-hover:shadow-xl group-hover:shadow-[#579BE8]/30">
                            <div className="absolute top-0.5 right-0.5 bg-white w-6 h-6 rounded-full shadow-md transition-transform"></div>
                        </div>
                    </div>

                    {/* Privacy Policy */}
                    <div className="flex items-center justify-between p-5 rounded-2xl border border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/30 transition-all cursor-pointer group mb-4">
                        <p className="font-semibold text-foreground">سياسة الخصوصية</p>
                        <Link href="/" className="text-[#579BE8] font-bold hover:text-[#315782] transition-colors flex items-center gap-2">
                            عرض التفاصيل
                            <FaChevronLeft className="text-sm" />
                        </Link>
                    </div>

                    {/* Terms of Service */}
                    <div className="flex items-center justify-between p-5 rounded-2xl border border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/30 transition-all cursor-pointer group">
                        <p className="font-semibold text-foreground">شروط الاستخدام</p>
                        <Link href="/" className="text-[#579BE8] font-bold hover:text-[#315782] transition-colors flex items-center gap-2">
                            عرض التفاصيل
                            <FaChevronLeft className="text-sm" />
                        </Link>
                    </div>

                    {/* Danger Zone */}
                    <div className="mt-10 pt-8 border-t border-border/50">
                        <h3 className="text-xl font-black text-destructive mb-6">منطقة الخطر</h3>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-gradient-to-r from-destructive/5 to-destructive/10 border-2 border-destructive/30 rounded-2xl shadow-sm hover:shadow-md transition-all">
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-destructive mb-2">حذف الحساب نهائياً</h4>
                                <p className="text-sm text-destructive/80 leading-relaxed">هذا الإجراء لا يمكن التراجع عنه، سيتم حذف جميع بياناتك بشكل دائم</p>
                            </div>
                            <button onClick={handleDeleteAccount} className="bg-white dark:bg-card text-destructive border-2 border-destructive/50 px-6 py-3 rounded-xl font-bold hover:bg-destructive hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-sm min-w-fit">
                                حذف حسابي
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}