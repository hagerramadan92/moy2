"use client";

import { useState } from "react";

import { FaRegUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBell, FaHeart, FaChevronLeft, FaStar, FaPlus, FaRegBellSlash, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaShareAlt } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { BiCurrentLocation } from "react-icons/bi";
import { FaRegTrashCan } from "react-icons/fa6";
import Link from "next/link";
import { toast } from "react-hot-toast";


export default function MyProfilePage() {
    const [showSavedPlaces, setShowSavedPlaces] = useState(false);
    const [showAllPlaces, setShowAllPlaces] = useState(false);
    const [notificationsActive, setNotificationsActive] = useState(true);
    const [locationSharingActive, setLocationSharingActive] = useState(false);

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
        const placeName = places[index];
        const toastId = toast(
            (t) => (
                <div className="flex flex-col gap-3 p-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                            <FaRegTrashCan className="w-5 h-5 text-destructive" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-foreground">حذف المكان المحفوظ</p>
                            <p className="text-sm text-muted-foreground">هل أنت متأكد من حذف "{placeName}"؟</p>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                            }}
                            className="px-4 py-2 rounded-xl font-bold text-sm bg-secondary hover:bg-secondary/80 text-foreground transition-all"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={() => {
                                setPlaces(places.filter((_, i) => i !== index));
                                toast.dismiss(t.id);
                                toast.success("تم حذف المكان المحفوظ بنجاح", {
                                    icon: "✓",
                                    style: {
                                        background: "#579BE8",
                                        color: "#fff",
                                        borderRadius: "12px",
                                        padding: "16px",
                                    },
                                });
                            }}
                            className="px-4 py-2 rounded-xl font-bold text-sm bg-destructive hover:bg-destructive/90 text-white transition-all"
                        >
                            تأكيد الحذف
                        </button>
                    </div>
                </div>
            ),
            {
                duration: 5000,
                style: {
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "16px",
                    maxWidth: "400px",
                },
            }
        );
    };

    const handleToggleLocationSharing = () => {
        const newState = !locationSharingActive;
        
        if (newState) {
            // Enable location sharing - get current location
            if (!navigator.geolocation) {
                toast.error("المتصفح لا يدعم تحديد الموقع", {
                    icon: <FaExclamationTriangle className="w-5 h-5" />,
                    style: {
                        background: "#F75A65",
                        color: "#fff",
                        borderRadius: "12px",
                        padding: "16px",
                    },
                });
                return;
            }

            // Show loading toast
            const loadingToast = toast.loading("جاري الحصول على موقعك الحالي...", {
                style: {
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "16px",
                },
            });

            // Get current position
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    // Dismiss loading toast
                    toast.dismiss(loadingToast);
                    
                    // Enable location sharing
                    setLocationSharingActive(true);
                    
                    toast.success("تم تفعيل مشاركة الموقع بنجاح", {
                        icon: <BiCurrentLocation className="w-5 h-5" />,
                        style: {
                            background: "#579BE8",
                            color: "#fff",
                            borderRadius: "12px",
                            padding: "16px",
                        },
                    });
                },
                (error) => {
                    // Dismiss loading toast
                    toast.dismiss(loadingToast);
                    
                    let errorMessage = "فشل الحصول على الموقع";
                    
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "تم رفض الوصول إلى الموقع. يرجى السماح بالوصول إلى الموقع في إعدادات المتصفح";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "معلومات الموقع غير متاحة";
                            break;
                        case error.TIMEOUT:
                            errorMessage = "انتهت مهلة طلب الموقع";
                            break;
                        default:
                            errorMessage = "حدث خطأ أثناء الحصول على الموقع";
                            break;
                    }
                    
                    toast.error(errorMessage, {
                        icon: <FaExclamationTriangle className="w-5 h-5" />,
                        style: {
                            background: "#F75A65",
                            color: "#fff",
                            borderRadius: "12px",
                            padding: "16px",
                        },
                        duration: 5000,
                    });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            // Disable location sharing
            setLocationSharingActive(false);
            toast.success("تم إلغاء تفعيل مشاركة الموقع", {
                icon: <BiCurrentLocation className="w-5 h-5" />,
                style: {
                    background: "#579BE8",
                    color: "#fff",
                    borderRadius: "12px",
                    padding: "16px",
                },
            });
        }
    };

    const copyToClipboardFallback = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                toast.success("تم نسخ رابط مشاركة الموقع بنجاح", {
                    icon: <FaShareAlt className="w-5 h-5" />,
                    style: {
                        background: "#579BE8",
                        color: "#fff",
                        borderRadius: "12px",
                        padding: "16px",
                    },
                });
            } else {
                throw new Error('Copy command failed');
            }
        } catch (err) {
            document.body.removeChild(textArea);
            toast.error("فشل نسخ الرابط. يرجى نسخه يدوياً", {
                icon: <FaExclamationTriangle className="w-5 h-5" />,
                style: {
                    background: "#F75A65",
                    color: "#fff",
                    borderRadius: "12px",
                    padding: "16px",
                },
            });
        }
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
        const favoriteName = favorites[index];
        const toastId = toast(
            (t) => (
                <div className="flex flex-col gap-3 p-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                            <FaRegTrashCan className="w-5 h-5 text-destructive" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-foreground">حذف المكان المفضل</p>
                            <p className="text-sm text-muted-foreground">هل أنت متأكد من حذف "{favoriteName}"؟</p>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                            }}
                            className="px-4 py-2 rounded-xl font-bold text-sm bg-secondary hover:bg-secondary/80 text-foreground transition-all"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={() => {
                                setFavorites(favorites.filter((_, i) => i !== index));
                                toast.dismiss(t.id);
                                toast.success("تم حذف المكان المفضل بنجاح", {
                                    icon: "✓",
                                    style: {
                                        background: "#579BE8",
                                        color: "#fff",
                                        borderRadius: "12px",
                                        padding: "16px",
                                    },
                                });
                            }}
                            className="px-4 py-2 rounded-xl font-bold text-sm bg-destructive hover:bg-destructive/90 text-white transition-all"
                        >
                            تأكيد الحذف
                        </button>
                    </div>
                </div>
            ),
            {
                duration: 5000,
                style: {
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "16px",
                    maxWidth: "400px",
                },
            }
        );
    };

    const handleDisableAccount = () => {
        toast(
            (t) => (
                <div className="flex flex-col gap-3 p-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                            <FaExclamationTriangle className="w-5 h-5 text-warning" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-foreground">هل أنت متأكد؟</p>
                            <p className="text-sm text-muted-foreground">سيتم تعطيل حسابك مؤقتاً ولن تتمكن من تلقي الإشعارات.</p>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                            }}
                            className="px-4 py-2 rounded-xl font-bold text-sm bg-secondary hover:bg-secondary/80 text-foreground transition-all"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                toast.success("تم تعطيل حسابك بنجاح", {
                                    icon: <FaCheckCircle className="w-5 h-5" />,
                                    style: {
                                        background: "#579BE8",
                                        color: "#fff",
                                        borderRadius: "12px",
                                        padding: "16px",
                                    },
                                });
                            }}
                            className="px-4 py-2 rounded-xl font-bold text-sm bg-[#579BE8] hover:bg-[#579BE8]/90 text-white transition-all"
                        >
                            نعم، عطل الحساب
                        </button>
                    </div>
                </div>
            ),
            {
                duration: 5000,
                style: {
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "16px",
                    maxWidth: "400px",
                },
            }
        );
    };
    const handleDeleteAccount = () => {
        toast(
            (t) => (
                <div className="flex flex-col gap-3 p-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                            <FaExclamationTriangle className="w-5 h-5 text-destructive" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-foreground">هل أنت متأكد؟</p>
                            <p className="text-sm text-muted-foreground">سيتم حذف حسابك نهائياً ولن تتمكن من استخدام التطبيق.</p>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                            }}
                            className="px-4 py-2 rounded-xl font-bold text-sm bg-secondary hover:bg-secondary/80 text-foreground transition-all"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                toast.success("تم حذف حسابك بنجاح", {
                                    icon: <FaCheckCircle className="w-5 h-5" />,
                                    style: {
                                        background: "#579BE8",
                                        color: "#fff",
                                        borderRadius: "12px",
                                        padding: "16px",
                                    },
                                });
                            }}
                            className="px-4 py-2 rounded-xl font-bold text-sm bg-destructive hover:bg-destructive/90 text-white transition-all"
                        >
                            نعم، حذف الحساب
                        </button>
                    </div>
                </div>
            ),
            {
                duration: 5000,
                style: {
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "16px",
                    maxWidth: "400px",
                },
            }
        );
    };

    const handleDeleteImage = () => {
        toast(
            (t) => (
                <div className="flex flex-col gap-3 p-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                            <FaExclamationTriangle className="w-5 h-5 text-destructive" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-foreground">حذف الصورة</p>
                            <p className="text-sm text-muted-foreground">هل أنت متأكد من حذف الصورة الشخصية؟</p>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                            }}
                            className="px-4 py-2 rounded-xl font-bold text-sm bg-secondary hover:bg-secondary/80 text-foreground transition-all"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={() => {
                                // Handle delete image logic here
                                toast.dismiss(t.id);
                                toast.success("تم حذف الصورة الشخصية بنجاح", {
                                    icon: <FaCheckCircle className="w-5 h-5" />,
                                    style: {
                                        background: "#579BE8",
                                        color: "#fff",
                                        borderRadius: "12px",
                                        padding: "16px",
                                    },
                                });
                            }}
                            className="px-4 py-2 rounded-xl font-bold text-sm bg-destructive hover:bg-destructive/90 text-white transition-all"
                        >
                            نعم، احذف
                        </button>
                    </div>
                </div>
            ),
            {
                duration: 5000,
                style: {
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "16px",
                    maxWidth: "400px",
                },
            }
        );
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
                toast.success("تم رفع الصورة الشخصية بنجاح", {
                    icon: <FaCheckCircle className="w-5 h-5" />,
                    style: {
                        background: "#579BE8",
                        color: "#fff",
                        borderRadius: "12px",
                        padding: "16px",
                    },
                });
            }
        };
        input.click();
    };

    // Validation functions - all fields are optional, but if filled, they must be valid
    const validateFullName = (value) => {
        // Field is optional, only validate if it has a value
        if (!value.trim()) {
            return ""; // No error if empty (optional field)
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
        // Field is optional, only validate if it has a value
        if (!value.trim()) {
            return ""; // No error if empty (optional field)
        }
        // Saudi phone validation: Starts with 05 and followed by 8 digits (Total 10)
        const regex = /^05\d{8}$/;
        if (!regex.test(value.trim())) {
            return "يرجى إدخال رقم جوال صحيح (يبدأ بـ 05 ويتكون من 10 أرقام)";
        }
        return "";
    };

    const validateLocation = (value) => {
        // Field is optional, only validate if it has a value
        if (!value.trim()) {
            return ""; // No error if empty (optional field)
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
        // Check if at least one field has value
        if (!fullName.trim() && !phone.trim() && !location.trim()) {
            toast(
                (t) => (
                    <div className="flex items-center gap-3">
                        <FaInfoCircle className="w-5 h-5 text-[#579BE8]" />
                        <div className="flex-1">
                            <p className="font-bold text-foreground">تنبيه</p>
                            <p className="text-sm text-muted-foreground">يرجى إدخال حقل واحد على الأقل للتعديل</p>
                        </div>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="px-4 py-2 rounded-xl font-bold text-sm bg-[#579BE8] hover:bg-[#579BE8]/90 text-white transition-all"
                        >
                            موافق
                        </button>
                    </div>
                ),
                {
                    duration: 4000,
                    style: {
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "16px",
                        padding: "16px",
                        maxWidth: "400px",
                    },
                }
            );
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
            toast.error("يرجى تصحيح الأخطاء في النموذج", {
                icon: <FaExclamationTriangle className="w-5 h-5" />,
                style: {
                    background: "#F75A65",
                    color: "#fff",
                    borderRadius: "12px",
                    padding: "16px",
                },
            });
            return;
        }

        // Handle save changes logic here
        const loadingToast = toast.loading("جاري الحفظ...", {
            style: {
                background: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "16px",
            },
        });

        setTimeout(() => {
            toast.dismiss(loadingToast);
            toast.success("تم حفظ التعديلات بنجاح", {
                icon: <FaCheckCircle className="w-5 h-5" />,
                style: {
                    background: "#579BE8",
                    color: "#fff",
                    borderRadius: "12px",
                    padding: "16px",
                },
            });
            // Clear form and errors after successful save
            setFullName("");
            setPhone("");
            setLocation("");
            setErrors({ fullName: "", phone: "", location: "" });
        }, 1500);
    };
    return (
        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 fade-in-up px-2 sm:px-0">
            {/* Profile Hero Section with Gradient */}
            <div className="bg-white dark:bg-card rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-border/60">
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-10 rotate-12">
                        <FaRegUser size={120} className="sm:w-40 sm:h-40" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 sm:w-80 sm:h-80 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 right-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-2xl"></div>

                    {/* Hero Content */}
                    <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-10">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 justify-between">
                            <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                                <div className="relative">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl ring-2 sm:ring-4 ring-white/30 relative overflow-hidden">
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
                                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-green-500 rounded-full border-2 sm:border-4 border-white dark:border-card shadow-lg"></div>
                                </div>
                                <div className="flex flex-col gap-1 sm:gap-2">
                                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight">سعود بن ناصر المطيري</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-white/20 backdrop-blur-md px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold border border-white/30">
                                            نشط الآن
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                                <button 
                                    onClick={handleDeleteImage}
                                    className="px-3 sm:px-4 md:px-6 cursor-pointer py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm border-2 border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                >
                                    حذف الصورة
                                </button>
                                <button 
                                    onClick={handleUploadImage}
                                    className="px-3 sm:px-4 md:px-6 cursor-pointer py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm bg-white text-[#579BE8] hover:shadow-2xl hover:-translate-y-1 transition-all shadow-lg"
                                >
                                    رفع الصورة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Information Form */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10">

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Full Name */}
                        <div className="space-y-1 sm:space-y-2">
                            <label className="block text-xs sm:text-sm font-bold text-foreground/80 mr-2">الاسم الكامل</label>
                            <div className="relative group">
                                <div className={`absolute top-1/2 -translate-y-1/2 right-3 sm:right-4 transition-colors ${errors.fullName ? "text-destructive" : "text-muted-foreground/60 group-focus-within:text-primary"}`}>
                                    <FaRegUser className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <Input
                                    value={fullName}
                                    onChange={handleFullNameChange}
                                    onBlur={() => setErrors(prev => ({ ...prev, fullName: validateFullName(fullName) }))}
                                    placeholder="الاسم الكامل"
                                    className={`h-12 sm:h-14 md:h-[60px] pr-10 sm:pr-12 text-foreground text-sm sm:text-base font-medium border-2 rounded-xl sm:rounded-2xl bg-secondary/30 transition-all ${
                                        errors.fullName 
                                            ? "border-destructive/50 focus:border-destructive focus:ring-2 sm:focus:ring-4 focus:ring-destructive/10" 
                                            : "border-border/50 focus:border-primary focus:ring-2 sm:focus:ring-4 focus:ring-primary/10"
                                    }`}
                                />
                            </div>
                            {errors.fullName && (
                                <p className="text-destructive text-xs sm:text-sm font-medium flex items-center gap-1 bg-destructive/5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-destructive/20">
                                    <span>⚠</span>
                                    {errors.fullName}
                                </p>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-1 sm:space-y-2">
                            <label className="block text-xs sm:text-sm font-bold text-foreground/80 mr-2">رقم الجوال</label>
                            <div className="relative group">
                                <div className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-4 w-[50px] h-[25px] sm:w-[60px] sm:h-[30px] opacity-90">
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
                                    className={`text-left pl-20 sm:pl-24 h-12 sm:h-14 md:h-[60px] text-foreground text-sm sm:text-base pr-10 sm:pr-12 font-medium border-2 rounded-xl sm:rounded-2xl bg-secondary/30 transition-all ${
                                        errors.phone 
                                            ? "border-destructive/50 focus:border-destructive focus:ring-2 sm:focus:ring-4 focus:ring-destructive/10" 
                                            : "border-border/50 focus:border-primary focus:ring-2 sm:focus:ring-4 focus:ring-primary/10"
                                    }`}
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-destructive text-xs sm:text-sm font-medium flex items-center gap-1 bg-destructive/5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-destructive/20">
                                    <span>⚠</span>
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        {/* Location */}
                        <div className="space-y-1 sm:space-y-2 lg:col-span-2">
                            <label className="block text-xs sm:text-sm font-bold text-foreground/80 mr-2">الموقع</label>
                            <div className="relative group">
                                <div className={`absolute top-1/2 -translate-y-1/2 right-3 sm:right-4 transition-colors ${errors.location ? "text-destructive" : "text-muted-foreground/60 group-focus-within:text-primary"}`}>
                                    <FaMapMarkerAlt className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <Input
                                    value={location}
                                    onChange={handleLocationChange}
                                    onBlur={() => setErrors(prev => ({ ...prev, location: validateLocation(location) }))}
                                    placeholder="الرياض - مستشفى الملك فيصل"
                                    className={`h-12 sm:h-14 md:h-[60px] pr-10 sm:pr-12 text-foreground text-sm sm:text-base font-medium border-2 rounded-xl sm:rounded-2xl bg-secondary/30 transition-all ${
                                        errors.location 
                                            ? "border-destructive/50 focus:border-destructive focus:ring-2 sm:focus:ring-4 focus:ring-destructive/10" 
                                            : "border-border/50 focus:border-primary focus:ring-2 sm:focus:ring-4 focus:ring-primary/10"
                                    }`}
                                />
                            </div>
                            {errors.location && (
                                <p className="text-destructive text-xs sm:text-sm font-medium flex items-center gap-1 bg-destructive/5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-destructive/20">
                                    <span>⚠</span>
                                    {errors.location}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border/50 flex justify-end">
                        <button 
                            onClick={handleSaveChanges}
                            className="bg-[#579BE8] text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base hover:bg-[#579BE8]/90 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#579BE8]/20 transition-all cursor-pointer shadow-lg"
                        >
                            حفظ التعديل
                        </button>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-card rounded-xl sm:rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-xl border border-border/60">
                <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black mb-4 sm:mb-6 md:mb-8 text-foreground">إعدادات الحساب</h3>

                    <div className="flex flex-col gap-3 sm:gap-4">
                        {/* Notifications Toggle */}
                        <div 
                            id="notifications"
                            onClick={() => {
                                setNotificationsActive(!notificationsActive);
                                if (!notificationsActive) {
                                    toast.success("تم تفعيل الإشعارات بنجاح", {
                                        icon: <FaBell className="w-5 h-5" />,
                                        style: {
                                            background: "#579BE8",
                                            color: "#fff",
                                            borderRadius: "12px",
                                            padding: "16px",
                                        },
                                    });
                                } else {
                                    toast.error("تم إلغاء تفعيل الإشعارات", {
                                        icon: <FaRegBellSlash className="w-5 h-5" />,
                                        style: {
                                            background: "#F75A65",
                                            color: "#fff",
                                            borderRadius: "12px",
                                            padding: "16px",
                                        },
                                    });
                                }
                            }}
                            className={`flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer group ${
                                notificationsActive 
                                    ? "border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary/30" 
                                    : "border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/30"
                            }`}
                        >
                            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                                <div className={`p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all ${
                                    notificationsActive 
                                        ? "bg-gradient-to-br from-[#579BE8] to-[#315782]" 
                                        : "bg-muted-foreground/30"
                                }`}>
                                    <FaBell className={`w-4 h-4 sm:w-5 sm:h-5 ${notificationsActive ? "text-white" : "text-muted-foreground"}`} />
                                </div>
                                <div>
                                    <h4 className="text-sm sm:text-base md:text-lg font-bold mb-0.5 sm:mb-1 text-foreground">تفعيل الإشعارات</h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground">استقبال التنبيهات والتحديثات</p>
                                </div>
                            </div>
                            {/* Custom Switch Visual */}
                            <div className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full relative transition-all cursor-pointer shadow-lg group-hover:shadow-xl flex-shrink-0 ${
                                notificationsActive 
                                    ? "bg-[#579BE8] shadow-[#579BE8]/20 group-hover:shadow-[#579BE8]/30" 
                                    : "bg-muted-foreground/40 shadow-muted-foreground/20"
                            }`}>
                                <div className={`absolute top-0.5 bg-white w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-md transition-transform duration-300 ${
                                    notificationsActive ? "right-0.5" : "left-0.5"
                                }`}></div>
                            </div>
                        </div>

                        {/* Saved Places */}
                        <div
                            id="savedPlaces"
                            onClick={() => setShowSavedPlaces(!showSavedPlaces)}
                            className="flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/30 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                                <div className="bg-gradient-to-br from-[#579BE8] to-[#315782] p-2 sm:p-2.5 md:p-3.5 rounded-xl sm:rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all flex-shrink-0">
                                    <BiCurrentLocation className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm sm:text-base md:text-lg font-bold mb-0.5 sm:mb-1 text-foreground truncate">الأماكن المحفوظة</h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground">احفظ مواقعك المفضلة</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAdding(!isAdding);
                                        if (!showSavedPlaces) setShowSavedPlaces(true);
                                    }}
                                    className="text-[#579BE8] bg-[#579BE8]/10 p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:bg-[#579BE8] hover:text-white transition-all shadow-sm hover:shadow-md"
                                    title="اضافة موقع جديد"
                                >
                                    <FaPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="sr-only">اضافة</span>
                                </button>
                                <FaChevronLeft className={`text-muted-foreground group-hover:text-primary transition-transform duration-300 text-lg sm:text-xl ${showSavedPlaces ? "rotate-[-90deg]" : ""}`} />
                            </div>
                        </div>
                        {showSavedPlaces && (
                            <div id="savedPlacesItem" className="flex flex-col gap-2 sm:gap-3 mt-2">
                                {/* Add New Input */}
                                {isAdding && (
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 sm:p-4 bg-gradient-to-r from-[#579BE8]/10 to-[#579BE8]/5 rounded-xl sm:rounded-2xl border-2 border-[#579BE8]/30 fade-in-up shadow-sm">
                                        <Input
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder="اسم الموقع الجديد..."
                                            className="h-10 sm:h-11 text-xs sm:text-sm border-border/50 focus:border-primary rounded-lg sm:rounded-xl flex-1"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={handleAdd} className="bg-[#579BE8] text-white px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-[#579BE8]/90 hover:shadow-lg transition-all">حفظ</button>
                                            <button onClick={() => setIsAdding(false)} className="text-muted-foreground px-2 sm:px-3 hover:text-foreground transition-colors text-xs sm:text-sm font-medium">إلغاء</button>
                                        </div>
                                    </div>
                                )}

                                {places.map((place, i) => (
                                    (i < 5 || showAllPlaces) && (
                                        <div key={i} className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 bg-secondary/30 border border-border/50 rounded-xl sm:rounded-2xl fade-in-up hover:bg-secondary/40 hover:border-primary/30 transition-all">
                                            {editingIndex === i ? (
                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                                                    <Input
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="h-9 sm:h-10 text-xs sm:text-sm border-border/50 focus:border-primary rounded-lg sm:rounded-xl flex-1"
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleUpdate(i)} className="text-green-600 font-bold text-xs sm:text-sm hover:text-green-700 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-50 rounded-lg transition-colors">تأكيد</button>
                                                        <button onClick={() => setEditingIndex(null)} className="text-muted-foreground text-xs sm:text-sm hover:text-foreground px-2 sm:px-3 py-1.5 sm:py-2 bg-secondary rounded-lg transition-colors">إلغاء</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <h4 className="font-semibold text-xs sm:text-sm md:text-base text-foreground truncate flex-1">{place}</h4>
                                                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                                        <button
                                                            onClick={() => {
                                                                setEditingIndex(i);
                                                                setEditValue(place);
                                                            }}
                                                            className="p-2 sm:p-2.5 hover:bg-[#579BE8]/10 hover:text-[#579BE8] rounded-lg sm:rounded-xl transition-all"
                                                            title="تعديل"
                                                        >
                                                            <CiEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(i)}
                                                            className="p-2 sm:p-2.5 hover:bg-destructive/10 hover:text-destructive rounded-lg sm:rounded-xl transition-all"
                                                            title="حذف"
                                                        >
                                                            <FaRegTrashCan className="w-4 h-4 sm:w-5 sm:h-5" />
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
                                        className="text-[#579BE8] font-bold text-xs sm:text-sm mt-2 hover:underline cursor-pointer w-fit mx-auto px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-[#579BE8]/10 rounded-lg sm:rounded-xl transition-all"
                                    >
                                        {showAllPlaces ? "عرض أقل" : "عرض المزيد"}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Favorite Places */}
                        <div
                            className="flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/30 transition-all cursor-pointer group"
                            onClick={() => setShowFavorites(!showFavorites)}
                        >
                            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                                <div className="bg-gradient-to-br from-[#579BE8] to-[#315782] p-2 sm:p-2.5 md:p-3.5 rounded-xl sm:rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all flex-shrink-0">
                                    <FaStar className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm sm:text-base md:text-lg font-bold mb-0.5 sm:mb-1 text-foreground truncate">الأماكن المفضلة</h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground">احتفظ بأماكنك المفضلة</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAddingFavorite(!isAddingFavorite);
                                        if (!showFavorites) setShowFavorites(true);
                                    }}
                                    className="text-[#579BE8] bg-[#579BE8]/10 p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:bg-[#579BE8] hover:text-white transition-all shadow-sm hover:shadow-md"
                                    title="اضافة مفضل جديد"
                                >
                                    <FaPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="sr-only">اضافة</span>
                                </button>
                                <FaChevronLeft className={`text-muted-foreground group-hover:text-primary transition-transform duration-300 text-lg sm:text-xl ${showFavorites ? "rotate-[-90deg]" : ""}`} />
                            </div>
                        </div>

                        {showFavorites && (
                            <div className="flex flex-col gap-2 sm:gap-3 mt-2">
                                {/* Add New Input */}
                                {isAddingFavorite && (
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 sm:p-4 bg-gradient-to-r from-[#579BE8]/10 to-[#579BE8]/5 rounded-xl sm:rounded-2xl border-2 border-[#579BE8]/30 fade-in-up shadow-sm">
                                        <Input
                                            value={newFavoriteName}
                                            onChange={(e) => setNewFavoriteName(e.target.value)}
                                            placeholder="اسم المكان المفضل..."
                                            className="h-10 sm:h-11 text-xs sm:text-sm border-border/50 focus:border-primary rounded-lg sm:rounded-xl flex-1"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={handleAddFavorite} className="bg-[#579BE8] text-white px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:bg-[#579BE8]/90 hover:shadow-lg transition-all">حفظ</button>
                                            <button onClick={() => setIsAddingFavorite(false)} className="text-muted-foreground px-2 sm:px-3 hover:text-foreground transition-colors text-xs sm:text-sm font-medium">إلغاء</button>
                                        </div>
                                    </div>
                                )}

                                {favorites.map((fav, i) => (
                                    (i < 5 || showAllFavorites) && (
                                        <div key={i} className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 bg-secondary/30 border border-border/50 rounded-xl sm:rounded-2xl fade-in-up hover:bg-secondary/40 hover:border-primary/30 transition-all">
                                            {editingFavoriteIndex === i ? (
                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                                                    <Input
                                                        value={editFavoriteValue}
                                                        onChange={(e) => setEditFavoriteValue(e.target.value)}
                                                        className="h-9 sm:h-10 text-xs sm:text-sm border-border/50 focus:border-primary rounded-lg sm:rounded-xl flex-1"
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleUpdateFavorite(i)} className="text-green-600 font-bold text-xs sm:text-sm hover:text-green-700 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-50 rounded-lg transition-colors">تأكيد</button>
                                                        <button onClick={() => setEditingFavoriteIndex(null)} className="text-muted-foreground text-xs sm:text-sm hover:text-foreground px-2 sm:px-3 py-1.5 sm:py-2 bg-secondary rounded-lg transition-colors">إلغاء</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <h4 className="font-semibold text-xs sm:text-sm md:text-base text-foreground truncate flex-1">{fav}</h4>
                                                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                                        <button
                                                            onClick={() => {
                                                                setEditingFavoriteIndex(i);
                                                                setEditFavoriteValue(fav);
                                                            }}
                                                            className="p-2 sm:p-2.5 hover:bg-[#579BE8]/10 hover:text-[#579BE8] rounded-lg sm:rounded-xl transition-all"
                                                            title="تعديل"
                                                        >
                                                            <CiEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteFavorite(i)}
                                                            className="p-2 sm:p-2.5 hover:bg-destructive/10 hover:text-destructive rounded-lg sm:rounded-xl transition-all"
                                                            title="حذف"
                                                        >
                                                            <FaRegTrashCan className="w-4 h-4 sm:w-5 sm:h-5" />
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
                                        className="text-[#579BE8] font-bold text-xs sm:text-sm mt-2 hover:underline cursor-pointer w-fit mx-auto px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-[#579BE8]/10 rounded-lg sm:rounded-xl transition-all"
                                    >
                                        {showAllFavorites ? "عرض أقل" : "عرض المزيد"}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Danger Zone */}
                    <div className="mt-6 sm:mt-8 md:mt-10 pt-4 sm:pt-6 md:pt-8 border-t border-border/50">
                        <h3 className="text-base sm:text-lg md:text-xl font-black text-destructive mb-4 sm:mb-6">منطقة الخطر</h3>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 p-4 sm:p-5 md:p-6 bg-gradient-to-r from-destructive/5 to-destructive/10 border-2 border-destructive/30 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all">
                            <div className="flex-1">
                                <h4 className="text-sm sm:text-base md:text-lg font-bold text-destructive mb-1 sm:mb-2">تعطيل الحساب مؤقتاً</h4>
                                <p className="text-xs sm:text-sm text-destructive/80 leading-relaxed">سيتم إخفاء ملفك الشخصي ولن تتلقى أي إشعارات حتى تقوم بتسجيل الدخول مرة أخرى</p>
                            </div>
                            <button onClick={handleDisableAccount} className="bg-white dark:bg-card text-destructive border-2 border-destructive/50 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-destructive hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-sm min-w-fit">
                                تعطيل الحساب
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-card rounded-xl sm:rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-xl border border-border/60">
                <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black mb-4 sm:mb-6 md:mb-8 text-foreground">الخصوصية والأمان</h3>
                    
                    {/* Location Sharing */}
                    <div className={`flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer group mb-3 sm:mb-4 ${
                        locationSharingActive 
                            ? "border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary/30" 
                            : "border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/30"
                    }`}>
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                            <div className={`p-2 sm:p-2.5 md:p-3.5 rounded-xl sm:rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all flex-shrink-0 ${
                                locationSharingActive 
                                    ? "bg-gradient-to-br from-[#579BE8] to-[#315782]" 
                                    : "bg-muted-foreground/30"
                            }`}>
                                <BiCurrentLocation className={`w-4 h-4 sm:w-5 sm:h-5 ${locationSharingActive ? "text-white" : "text-muted-foreground"}`} />
                            </div>
                            <div id="location-sharing-text" className="flex-1 min-w-0">
                                <h4 className="text-sm sm:text-base md:text-lg font-bold mb-0.5 sm:mb-1 text-foreground truncate">مشاركة الموقع</h4>
                                <p className="text-xs sm:text-sm text-muted-foreground">السماح بالوصول إلى موقعك</p>
                            </div>
                        </div>
                        {/* Custom Switch Visual */}
                        <div 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleLocationSharing();
                            }}
                            className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full relative transition-all cursor-pointer shadow-lg group-hover:shadow-xl flex-shrink-0 ${
                                locationSharingActive 
                                    ? "bg-[#579BE8] shadow-[#579BE8]/20 group-hover:shadow-[#579BE8]/30" 
                                    : "bg-muted-foreground/40 shadow-muted-foreground/20"
                            }`}
                        >
                            <div className={`absolute top-0.5 bg-white w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-md transition-transform duration-300 ${
                                locationSharingActive ? "right-0.5" : "left-0.5"
                            }`}></div>
                        </div>
                    </div>

                    {/* Privacy Policy */}
                    <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/30 transition-all cursor-pointer group mb-3 sm:mb-4">
                        <p className="font-semibold text-xs sm:text-sm md:text-base text-foreground">سياسة الخصوصية</p>
                        <Link href="/privacy" className="text-[#579BE8] font-bold text-xs sm:text-sm hover:text-[#315782] transition-colors flex items-center gap-1 sm:gap-2">
                            عرض التفاصيل
                            <FaChevronLeft className="text-xs sm:text-sm" />
                        </Link>
                    </div>

                    {/* Terms of Service */}
                    <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/30 transition-all cursor-pointer group">
                        <p className="font-semibold text-xs sm:text-sm md:text-base text-foreground">شروط الاستخدام</p>
                        <Link href="/terms" className="text-[#579BE8] font-bold text-xs sm:text-sm hover:text-[#315782] transition-colors flex items-center gap-1 sm:gap-2">
                            عرض التفاصيل
                            <FaChevronLeft className="text-xs sm:text-sm" />
                        </Link>
                    </div>

                    {/* Danger Zone */}
                    <div className="mt-6 sm:mt-8 md:mt-10 pt-4 sm:pt-6 md:pt-8 border-t border-border/50">
                        <h3 className="text-base sm:text-lg md:text-xl font-black text-destructive mb-4 sm:mb-6">منطقة الخطر</h3>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 p-4 sm:p-5 md:p-6 bg-gradient-to-r from-destructive/5 to-destructive/10 border-2 border-destructive/30 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all">
                            <div className="flex-1">
                                <h4 className="text-sm sm:text-base md:text-lg font-bold text-destructive mb-1 sm:mb-2">حذف الحساب نهائياً</h4>
                                <p className="text-xs sm:text-sm text-destructive/80 leading-relaxed">هذا الإجراء لا يمكن التراجع عنه، سيتم حذف جميع بياناتك بشكل دائم</p>
                            </div>
                            <button onClick={handleDeleteAccount} className="bg-white dark:bg-card text-destructive border-2 border-destructive/50 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-destructive hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-sm min-w-fit">
                                حذف حسابي
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}