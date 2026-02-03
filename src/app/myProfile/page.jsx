"use client";

import { useState, useEffect } from "react";

import { FaRegUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBell, FaHeart, FaChevronLeft, FaStar, FaPlus, FaRegBellSlash, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaShareAlt, FaTimes, FaBuilding } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { BiCurrentLocation } from "react-icons/bi";
import { FaRegTrashCan } from "react-icons/fa6";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Spinner from "@/components/ui/spinner";


export default function MyProfilePage() {
    const [showSavedPlaces, setShowSavedPlaces] = useState(false);
    const [showAllPlaces, setShowAllPlaces] = useState(false);
    const [notificationsActive, setNotificationsActive] = useState(true);
    const [locationSharingActive, setLocationSharingActive] = useState(false);

    // Form States
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [userId, setUserId] = useState(null);
    const [errors, setErrors] = useState({
        fullName: "",
        phone: "",
        location: ""
    });

    // CRUD States for Saved Places
    const [places, setPlaces] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [showAddressPopup, setShowAddressPopup] = useState(false);
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
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [loading, setLoading] = useState(true);
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const accessToken = localStorage.getItem("accessToken");
                
                if (!accessToken) {
                    toast.error("يرجى تسجيل الدخول أولاً");
                    setLoading(false);
                    return;
                }

                const response = await fetch("/api/auth/user", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${accessToken}`,
                    },
                });

                const data = await response.json();

                if (response.ok && data.status) {
                    // Populate form fields with user data
                    if (data.data) {
                        setFullName(data.data.name || data.data.full_name || "");
                        // Get phone from API response, or from sessionStorage (send-otp response), or from localStorage
                        const otpData = sessionStorage.getItem("otpData");
                        let phoneFromOtp = "";
                        if (otpData) {
                            try {
                                const parsedOtp = JSON.parse(otpData);
                                phoneFromOtp = parsedOtp.phone || "";
                            } catch (e) {
                                console.error("Error parsing otpData:", e);
                            }
                        }
                        setPhone(data.data.phone_number || data.data.phone || phoneFromOtp || "");
                        setLocation(data.data.location || data.data.address || "");
                        setUserId(data.data.id || data.data.user_id || null);
                        
                        // Set avatar if available and not empty, otherwise use default
                        // Check localStorage first - if avatar was explicitly removed (empty string), don't restore from API
                        const localUser = localStorage.getItem("user");
                        let shouldUseDefault = false;
                        if (localUser) {
                            try {
                                const parsedUser = JSON.parse(localUser);
                                // If avatar is explicitly set to empty string, user removed it - use default
                                if (parsedUser.avatar === "") {
                                    shouldUseDefault = true;
                                }
                            } catch (e) {
                                // Ignore parsing errors
                            }
                        }
                        
                        const avatarUrl = data.data.avatar || data.data.avatar_url;
                        if (shouldUseDefault || !avatarUrl || avatarUrl.trim() === "") {
                            setAvatarPreview(null);
                        } else {
                            setAvatarPreview(avatarUrl);
                        }
                    }
                } else {
                    console.error("Failed to fetch user data:", data.message);
                    // Try to get user data from localStorage as fallback
                    const localUser = localStorage.getItem("user");
                    if (localUser) {
                        try {
                            const parsedUser = JSON.parse(localUser);
                            setFullName(parsedUser.name || "");
                            setPhone(parsedUser.phone || "");
                            setUserId(parsedUser.id || null);
                            // Check if avatar exists and is not empty
                            if (parsedUser.avatar && parsedUser.avatar.trim() !== "") {
                                setAvatarPreview(parsedUser.avatar);
                            } else {
                                setAvatarPreview(null);
                            }
                        } catch (e) {
                            console.error("Error parsing local user data:", e);
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
                // Try to get user data from localStorage as fallback
                const localUser = localStorage.getItem("user");
                if (localUser) {
                    try {
                        const parsedUser = JSON.parse(localUser);
                        setFullName(parsedUser.name || "");
                        setPhone(parsedUser.phone || "");
                        setUserId(parsedUser.id || null);
                        // Check if avatar exists and is not empty
                        if (parsedUser.avatar && parsedUser.avatar.trim() !== "") {
                            setAvatarPreview(parsedUser.avatar);
                        } else {
                            setAvatarPreview(null);
                        }
                    } catch (e) {
                        console.error("Error parsing local user data:", e);
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Fetch addresses on component mount
    useEffect(() => {
        const fetchAddresses = async () => {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) return;

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
                    // Set all addresses as saved places
                    setPlaces(data.data);
                    // Set only favorite addresses
                    setFavorites(data.data.filter(addr => addr.is_favorite === true));
                }
            } catch (error) {
                // Silently fail - addresses are optional
            } finally {
                setLoadingAddresses(false);
            }
        };

        fetchAddresses();
    }, []);

    // Fetch address details by ID
    const fetchAddressDetails = async (addressId) => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            toast.error("يرجى تسجيل الدخول أولاً");
            return;
        }

        try {
            setLoadingAddressDetails(true);
            setShowAddressPopup(true);
            setSelectedAddress(null);

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
                // Initialize edit form with address data
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
                setShowAddressPopup(false);
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء جلب تفاصيل العنوان");
            setShowAddressPopup(false);
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
                // Refresh address details
                await fetchAddressDetails(selectedAddress.id);
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
                    setPlaces(addressesData.data);
                    setFavorites(addressesData.data.filter(addr => addr.is_favorite === true));
                }
            } else {
                toast.error(data.message || "فشل تحديث العنوان");
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء تحديث العنوان");
        } finally {
            setIsUpdatingAddress(false);
        }
    };

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
    const [favorites, setFavorites] = useState([]);
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
                            <p className="text-sm text-muted-foreground">سيتم حذف الصورة عند حفظ التغييرات. هل تريد المتابعة؟</p>
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
                                // Mark image for removal (don't remove yet)
                                setRemoveImage(true);
                                setAvatar(null); // Clear any uploaded file
                                // Show default avatar immediately for visual feedback
                                setAvatarPreview(null);
                                toast.success("سيتم حذف الصورة عند حفظ التغييرات. يرجى الضغط على حفظ التغييرات", {
                                    icon: <FaInfoCircle className="w-5 h-5" />,
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
                            تأكيد
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
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    toast.error("حجم الصورة يجب ألا يتجاوز 5 ميجابايت", {
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

                // Validate file type
                if (!file.type.startsWith('image/')) {
                    toast.error("يرجى اختيار ملف صورة صحيح", {
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

                // Store the file
                setAvatar(file);
                // Reset removeImage flag if user uploads a new image
                setRemoveImage(false);

                // Create preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    setAvatarPreview(reader.result);
                };
                reader.readAsDataURL(file);

                toast.success("تم اختيار الصورة بنجاح", {
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
        // Clear any existing phone errors (no validation)
        if (errors.phone) {
            setErrors(prev => ({ ...prev, phone: "" }));
        }
    };
 
    const handleSaveChanges = async () => {
        // Allow saving without changes - user can save name only, avatar only, or both
        // No validation required - just save current state

        // Validate only filled fields
        const newErrors = {};
        let hasErrors = false;

        if (fullName.trim()) {
            newErrors.fullName = validateFullName(fullName);
            if (newErrors.fullName) hasErrors = true;
        }
        // Phone validation removed - no validation needed
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

        // Save changes to API
        const loadingToast = toast.loading("جاري الحفظ...", {
            style: {
                background: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "16px",
            },
        });

        // Use entered name or get current name from localStorage
        let nameToSend = fullName.trim();
        if (!nameToSend) {
            // Get current name from localStorage
            const localUser = localStorage.getItem("user");
            if (localUser) {
                try {
                    const parsedUser = JSON.parse(localUser);
                    nameToSend = parsedUser.name || "";
                } catch (e) {
                    console.error("Error parsing local user:", e);
                }
            }
        }

        try {
            const accessToken = localStorage.getItem("accessToken");
            
            if (!accessToken) {
                toast.dismiss(loadingToast);
                toast.error("يرجى تسجيل الدخول أولاً", {
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

            // Create FormData
            const formData = new FormData();
            
            // Always send name (either new or current)
            if (nameToSend) {
                formData.append('name', nameToSend);
            }
            
            // Handle avatar: if removeImage is true, send empty string to remove it
            // If a new avatar is uploaded, send the new file
            // Otherwise, don't send avatar (API will keep current avatar)
            if (removeImage) {
                // Explicitly send empty string to remove avatar
                formData.append('avatar', '');
            } else if (avatar) {
                formData.append('avatar', avatar);
            }

            const response = await fetch("/api/auth/complete-profile", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: formData,
            });

            const data = await response.json();

            toast.dismiss(loadingToast);

            if (response.ok && data.status) {
                // Update local user data
                const localUser = localStorage.getItem("user");
                if (localUser) {
                    try {
                        const parsedUser = JSON.parse(localUser);
                        // Update name with the one that was sent (new or current)
                        if (nameToSend) {
                            parsedUser.name = nameToSend;
                            // Also update the form field if it was empty
                            if (!fullName.trim()) {
                                setFullName(nameToSend);
                            }
                        }
                        
                        // Handle avatar: if removeImage was true, always set to default avatar
                        // Don't trust API response if we explicitly removed the image
                        if (removeImage) {
                            // Explicitly set avatar to empty string in localStorage to ensure it's cleared
                            parsedUser.avatar = "";
                            // Always use default avatar when image is removed, ignore API response
                            setAvatarPreview(null);
                        } else {
                            // Update avatar from response (prioritize user.avatar)
                            // Only set if avatar exists and is not empty
                            const avatarFromResponse = data.data?.user?.avatar || data.data?.avatar;
                            if (avatarFromResponse && avatarFromResponse.trim() !== "") {
                                parsedUser.avatar = avatarFromResponse;
                                setAvatarPreview(avatarFromResponse);
                            } else {
                                // If API returns empty/null avatar, use default
                                parsedUser.avatar = "";
                                setAvatarPreview(null);
                            }
                        }
                        localStorage.setItem("user", JSON.stringify(parsedUser));
                        
                        // Dispatch events to notify navbar and other components of user update
                        window.dispatchEvent(new Event("storage"));
                        window.dispatchEvent(new Event("userLogin"));
                        window.dispatchEvent(new CustomEvent("userUpdate"));
                    } catch (e) {
                        console.error("Error updating local user:", e);
                    }
                }

                toast.success(data.message || "تم حفظ التغييرات بنجاح", {
                    icon: <FaCheckCircle className="w-5 h-5" />,
                    style: {
                        background: "#579BE8",
                        color: "#fff",
                        borderRadius: "12px",
                        padding: "16px",
                    },
                });

                // Clear avatar file and reset removeImage flag after successful save
                setAvatar(null);
                const wasRemoving = removeImage; // Store before resetting
                setRemoveImage(false);
                
                // Update avatar preview from API response if available (only if not removed)
                // If image was removed, keep default avatar and don't update from API response
                if (!wasRemoving) {
                    const avatarFromResponse = data.data?.user?.avatar || data.data?.avatar;
                    if (avatarFromResponse && avatarFromResponse.trim() !== "") {
                        setAvatarPreview(avatarFromResponse);
                    } else {
                        // If API returns empty/null avatar, use default
                        setAvatarPreview(null);
                    }
                } else {
                    // Image was removed, ensure default avatar is shown
                    setAvatarPreview(null);
                }
            } else {
                toast.error(data.message || "فشل حفظ التغييرات", {
                    icon: <FaExclamationTriangle className="w-5 h-5" />,
                    style: {
                        background: "#F75A65",
                        color: "#fff",
                        borderRadius: "12px",
                        padding: "16px",
                    },
                });
            }
        } catch (err) {
            toast.dismiss(loadingToast);
            console.error("Error saving profile:", err);
            toast.error("حدث خطأ أثناء حفظ التغييرات", {
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

    // Skeleton Components
    const ProfileSkeleton = () => (
        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 fade-in-up px-2 sm:px-0">
            {/* Profile Hero Section Skeleton */}
            <div className="bg-white dark:bg-card rounded-xl sm:rounded-xl shadow-xl overflow-hidden border border-border/60">
                <div className="bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] text-white relative overflow-hidden">
                    <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-10">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 justify-between">
                            <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-white/20 backdrop-blur-md animate-pulse"></div>
                                <div className="flex flex-col gap-1 sm:gap-2">
                                    <div className="h-6 sm:h-7 md:h-8 lg:h-9 w-48 bg-white/20 rounded-lg animate-pulse"></div>
                                    <div className="h-6 w-24 bg-white/20 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                                <div className="h-10 sm:h-12 w-32 bg-white/20 rounded-xl animate-pulse"></div>
                                <div className="h-10 sm:h-12 w-32 bg-white/20 rounded-xl animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Information Form Skeleton */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-1 sm:space-y-2">
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-12 sm:h-14 md:h-[60px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-12 sm:h-14 md:h-[60px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                        </div>
                    </div>
                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border/50 flex justify-end">
                        <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Account Settings Skeleton */}
            <div className="bg-white dark:bg-card rounded-xl sm:rounded-xl md:rounded-xl overflow-hidden shadow-xl border border-border/60">
                <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                    <div className="h-6 sm:h-7 md:h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4 sm:mb-6 md:mb-8"></div>
                    <div className="flex flex-col gap-3 sm:gap-4">
                        {/* Notifications Toggle Skeleton */}
                        <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl border border-border/50 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="w-12 h-6 sm:w-14 sm:h-7 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        </div>

                        {/* Saved Places Skeleton */}
                        <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl border border-border/50 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>

                        {/* Favorite Places Skeleton */}
                        <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl border border-border/50 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy & Security Skeleton */}
            <div className="bg-white dark:bg-card rounded-xl sm:rounded-xl md:rounded-xl overflow-hidden shadow-xl border border-border/60">
                <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                    <div className="h-6 sm:h-7 md:h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4 sm:mb-6 md:mb-8"></div>
                    <div className="flex flex-col gap-3 sm:gap-4">
                        {/* Location Sharing Skeleton */}
                        <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl border border-border/50 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="w-12 h-6 sm:w-14 sm:h-7 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        </div>

                        {/* Privacy Policy Skeleton */}
                        <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl border border-border/50 bg-gray-50 dark:bg-gray-800/50">
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>

                        {/* Terms of Service Skeleton */}
                        <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl border border-border/50 bg-gray-50 dark:bg-gray-800/50">
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Show spinner while loading
    if (loading) {
        return <ProfileSkeleton />;
    }

    return (
        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 fade-in-up px-2 sm:px-0">
            {/* Profile Hero Section with Gradient */}
            <div className="bg-white dark:bg-card rounded-xl sm:rounded-xl shadow-xl overflow-hidden border border-border/60">
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
                                        {avatarPreview ? (
                                            <Image
                                                key={avatarPreview}
                                                src={avatarPreview}
                                                alt="Customer"
                                                width={128}
                                                height={128}
                                                className="w-full h-full object-cover"
                                                quality={100}
                                                priority
                                                unoptimized
                                            />
                                        ) : (
                                            <FaRegUser className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-white/80" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-green-500 rounded-full border-2 sm:border-4 border-white dark:border-card shadow-lg"></div>
                                </div>
                                <div className="flex flex-col gap-1 sm:gap-2">
                                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight">
                                        {fullName || "   "}
                                    </h2>
                                  
                                        
                                        <span className=" w-fit bg-white/20 backdrop-blur-md px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold border border-white/30">
                                            نشط الآن
                                        </span>
                                   
                                </div>
                            </div>
                            <div className="flex  gap-2 sm:gap-3 w-full sm:w-auto">
                                <button 
                                    onClick={handleDeleteImage}
                                    className="px-3 sm:px-4 md:px-6 cursor-pointer py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-xl font-bold text-xs sm:text-sm border-2 border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                >
                                    حذف الصورة
                                </button>
                                <button 
                                    onClick={handleUploadImage}
                                    className="px-3 sm:px-4 md:px-6 cursor-pointer py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-xl font-bold text-xs sm:text-sm bg-white text-[#579BE8] hover:shadow-2xl hover:-translate-y-1 transition-all shadow-lg"
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
                                    disabled={loading}
                                    className={`h-12 sm:h-14 md:h-[60px] pr-10 sm:pr-12 text-foreground text-sm sm:text-base font-medium border-2 rounded-xl sm:rounded-xl bg-secondary/30 transition-all ${
                                        loading ? "opacity-60 cursor-not-allowed" : ""
                                    } ${
                                        errors.fullName 
                                            ? "border-destructive/50 focus:border-destructive focus:ring-2 sm:focus:ring-4 focus:ring-destructive/10" 
                                            : "border-border/50 focus:border-primary focus:ring-2 sm:focus:ring-4 focus:ring-primary/10"
                                    }`}
                                />
                            </div>
                            {errors.fullName && (
                                <p className="text-destructive text-xs sm:text-sm font-medium flex items-center gap-1 bg-destructive/5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-destructive/20">
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
                                    value={phone || ""}
                                    onChange={handlePhoneChange}
                                    onBlur={() => setErrors(prev => ({ ...prev, phone: "" }))}
                                    placeholder="05xxxxxxxx"
                                    dir="ltr"
                                    maxLength={10}
                                    disabled={true}
                                    className={`text-left pl-20 sm:pl-24 h-12 sm:h-14 md:h-[60px] text-foreground text-sm sm:text-base pr-10 sm:pr-12 font-medium border-2 rounded-xl sm:rounded-xl bg-secondary/30 transition-all opacity-60 cursor-not-allowed ${
                                        errors.phone 
                                            ? "border-destructive/50 focus:border-destructive focus:ring-2 sm:focus:ring-4 focus:ring-destructive/10" 
                                            : "border-border/50 focus:border-primary focus:ring-2 sm:focus:ring-4 focus:ring-primary/10"
                                    }`}
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-destructive text-xs sm:text-sm font-medium flex items-center gap-1 bg-destructive/5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-destructive/20">
                                    <span>⚠</span>
                                    {errors.phone}
                                </p>
                            )}
                        </div> 
                    </div>

                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border/50 flex justify-end">
                        <button 
                            onClick={handleSaveChanges}
                            className="bg-[#579BE8] text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-xl sm:rounded-xl font-bold text-sm sm:text-base hover:bg-[#579BE8]/90 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#579BE8]/20 transition-all cursor-pointer shadow-lg"
                        >
                            حفظ التعديل
                        </button>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-card rounded-xl sm:rounded-xl md:rounded-xl overflow-hidden shadow-xl border border-border/60">
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
                            className={`flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-xl border transition-all cursor-pointer group ${
                                notificationsActive 
                                    ? "border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary/30" 
                                    : "border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/30"
                            }`}
                        >
                            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                                <div className={`p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all ${
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
                            className="flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-xl border border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/30 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                                <div className="bg-gradient-to-br from-[#579BE8] to-[#315782] p-2 sm:p-2.5 md:p-3.5 rounded-xl sm:rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all flex-shrink-0">
                                    <BiCurrentLocation className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm sm:text-base md:text-lg font-bold mb-0.5 sm:mb-1 text-foreground truncate">الأماكن المحفوظة</h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground">احفظ مواقعك المفضلة</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                <FaChevronLeft className={`text-muted-foreground group-hover:text-primary transition-transform duration-300 text-lg sm:text-xl ${showSavedPlaces ? "rotate-[-90deg]" : ""}`} />
                            </div>
                        </div>
                        {showSavedPlaces && (
                            <div id="savedPlacesItem" className="flex flex-col gap-2 sm:gap-3 mt-2">
                                {/* View All Addresses Link */}
                                <Link
                                    href="/myProfile/addresses"
                                    className="w-full p-3 sm:p-4 bg-gradient-to-r from-[#579BE8] to-[#124987] text-white rounded-xl sm:rounded-xl hover:from-[#4a8dd8] hover:to-[#0f3d6f] transition-all font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    <FaMapMarkerAlt className="w-4 h-4" />
                                    عرض جميع العناوين
                                </Link>

                                {loadingAddresses ? (
                                    <div className="flex items-center justify-center p-4">
                                        <Spinner />
                                    </div>
                                ) : places.length === 0 ? (
                                    <div className="text-center p-4 text-muted-foreground text-sm">
                                        لا توجد أماكن محفوظة
                                    </div>
                                ) : (
                                    places
                                        .filter((_, i) => i < 5 || showAllPlaces)
                                        .map((place, i) => {
                                            const uniqueKey = typeof place === 'object' && place.id 
                                                ? `place-${place.id}` 
                                                : `place-${i}-${typeof place === 'string' ? place : place.name || 'unknown'}`;
                                            
                                            return typeof place === 'object' && place.id ? (
                                                <div 
                                                    key={uniqueKey} 
                                                    onClick={() => {
                                                        if (typeof fetchAddressDetails === 'function') {
                                                            fetchAddressDetails(place.id);
                                                        }
                                                    }}
                                                    className="flex items-start justify-between gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 bg-secondary/30 border border-border/50 rounded-xl sm:rounded-xl fade-in-up hover:bg-secondary/40 hover:border-primary/30 transition-all cursor-pointer"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-semibold text-xs sm:text-sm md:text-base text-foreground truncate">
                                                                {place.name || place}
                                                            </h4>
                                                            {place.is_favorite && (
                                                                <FaStar className="text-[#579BE8] w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                            )}
                                                        </div>
                                                        {place.address && (
                                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                                {place.address}
                                                            </p>
                                                        )}
                                                        {place.additional_info && (
                                                            <p className="text-xs text-muted-foreground/70 mt-1">
                                                                {place.additional_info}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div key={uniqueKey} className="flex items-start justify-between gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 bg-secondary/30 border border-border/50 rounded-xl sm:rounded-xl fade-in-up hover:bg-secondary/40 hover:border-primary/30 transition-all">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-xs sm:text-sm md:text-base text-foreground truncate">
                                                            {typeof place === 'string' ? place : place.name}
                                                        </h4>
                                                    </div>
                                                </div>
                                            );
                                        })
                                )}
                                {places.length > 5 && (
                                    <button
                                        onClick={() => setShowAllPlaces(!showAllPlaces)}
                                        className="text-[#579BE8] font-bold text-xs sm:text-sm mt-2 hover:underline cursor-pointer w-fit mx-auto px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-[#579BE8]/10 rounded-xl sm:rounded-xl transition-all"
                                    >
                                        {showAllPlaces ? "عرض أقل" : "عرض المزيد"}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Favorite Places */}
                        <div
                            className="flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-xl border border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/30 transition-all cursor-pointer group"
                            onClick={() => setShowFavorites(!showFavorites)}
                        >
                            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                                <div className="bg-gradient-to-br from-[#579BE8] to-[#315782] p-2 sm:p-2.5 md:p-3.5 rounded-xl sm:rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all flex-shrink-0">
                                    <FaStar className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm sm:text-base md:text-lg font-bold mb-0.5 sm:mb-1 text-foreground truncate">الأماكن المفضلة</h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground">احتفظ بأماكنك المفضلة</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                <FaChevronLeft className={`text-muted-foreground group-hover:text-primary transition-transform duration-300 text-lg sm:text-xl ${showFavorites ? "rotate-[-90deg]" : ""}`} />
                            </div>
                        </div>

                        {showFavorites && (
                            <div className="flex flex-col gap-2 sm:gap-3 mt-2">

                                {loadingAddresses ? (
                                    <div className="flex items-center justify-center p-4">
                                        <Spinner />
                                    </div>
                                ) : favorites.length === 0 ? (
                                    <div className="text-center p-4 text-muted-foreground text-sm">
                                        لا توجد أماكن مفضلة
                                    </div>
                                ) : (
                                    favorites
                                        .filter((_, i) => i < 5 || showAllFavorites)
                                        .map((fav, i) => {
                                            const uniqueKey = typeof fav === 'object' && fav.id 
                                                ? `favorite-${fav.id}` 
                                                : `favorite-${i}-${typeof fav === 'string' ? fav : fav.name || 'unknown'}`;
                                            
                                            return typeof fav === 'object' && fav.id ? (
                                                <div 
                                                    key={uniqueKey} 
                                                    onClick={() => {
                                                        if (typeof fetchAddressDetails === 'function') {
                                                            fetchAddressDetails(fav.id);
                                                        }
                                                    }}
                                                    className="flex items-start justify-between gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 bg-secondary/30 border border-border/50 rounded-xl sm:rounded-xl fade-in-up hover:bg-secondary/40 hover:border-primary/30 transition-all cursor-pointer"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <FaStar className="text-[#579BE8] w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                            <h4 className="font-semibold text-xs sm:text-sm md:text-base text-foreground truncate">
                                                                {fav.name || fav}
                                                            </h4>
                                                        </div>
                                                        {fav.address && (
                                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                                {fav.address}
                                                            </p>
                                                        )}
                                                        {fav.additional_info && (
                                                            <p className="text-xs text-muted-foreground/70 mt-1">
                                                                {fav.additional_info}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div key={uniqueKey} className="flex items-start justify-between gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 bg-secondary/30 border border-border/50 rounded-xl sm:rounded-xl fade-in-up hover:bg-secondary/40 hover:border-primary/30 transition-all">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <FaStar className="text-[#579BE8] w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                            <h4 className="font-semibold text-xs sm:text-sm md:text-base text-foreground truncate">
                                                                {typeof fav === 'string' ? fav : fav.name}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                )}
                                {favorites.length > 5 && (
                                    <button
                                        onClick={() => setShowAllFavorites(!showAllFavorites)}
                                        className="text-[#579BE8] font-bold text-xs sm:text-sm mt-2 hover:underline cursor-pointer w-fit mx-auto px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-[#579BE8]/10 rounded-xl sm:rounded-xl transition-all"
                                    >
                                        {showAllFavorites ? "عرض أقل" : "عرض المزيد"}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
 
                </div>
            </div>
            <div className="bg-white dark:bg-card rounded-xl sm:rounded-xl md:rounded-xl overflow-hidden shadow-xl border border-border/60">
                <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black mb-4 sm:mb-6 md:mb-8 text-foreground">الخصوصية والأمان</h3>
                    
                    {/* Location Sharing */}
                    <div className={`flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-xl border transition-all cursor-pointer group mb-3 sm:mb-4 ${
                        locationSharingActive 
                            ? "border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary/30" 
                            : "border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/30"
                    }`}>
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                            <div className={`p-2 sm:p-2.5 md:p-3.5 rounded-xl sm:rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all flex-shrink-0 ${
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
                    <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-xl border border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/30 transition-all cursor-pointer group mb-3 sm:mb-4">
                        <p className="font-semibold text-xs sm:text-sm md:text-base text-foreground">سياسة الخصوصية</p>
                        <Link href="/privacy" className="text-[#579BE8] font-bold text-xs sm:text-sm hover:text-[#315782] transition-colors flex items-center gap-1 sm:gap-2">
                            عرض التفاصيل
                            <FaChevronLeft className="text-xs sm:text-sm" />
                        </Link>
                    </div>

                    {/* Terms of Service */}
                    <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-xl border border-border/50 bg-secondary/5 hover:bg-secondary/10 hover:border-primary/30 transition-all cursor-pointer group">
                        <p className="font-semibold text-xs sm:text-sm md:text-base text-foreground">شروط الاستخدام</p>
                        <Link href="/terms" className="text-[#579BE8] font-bold text-xs sm:text-sm hover:text-[#315782] transition-colors flex items-center gap-1 sm:gap-2">
                            عرض التفاصيل
                            <FaChevronLeft className="text-xs sm:text-sm" />
                        </Link>
                    </div>
 
                </div>
            </div>

            {/* Address Details Popup - Modern Design */}
            {showAddressPopup && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => {
                        setShowAddressPopup(false);
                        setIsEditingAddress(false);
                    }}
                >
                    <div 
                        className="bg-white dark:bg-card rounded-xl sm:rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with Gradient Background */}
                        <div className="relative bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] p-6 sm:p-8 text-white overflow-hidden">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 blur-2xl"></div>
                            
                            <div className="relative z-10 flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <FaMapMarkerAlt className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl sm:text-2xl font-black mb-1">تفاصيل العنوان</h3>
                                            {selectedAddress && !loadingAddressDetails && (
                                                <p className="text-white/80 text-sm">
                                                    {selectedAddress.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedAddress && !loadingAddressDetails && (
                                        <button
                                            onClick={() => {
                                                setIsEditingAddress(!isEditingAddress);
                                                if (!isEditingAddress && selectedAddress) {
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
                                    <button
                                        onClick={() => {
                                            setShowAddressPopup(false);
                                            setIsEditingAddress(false);
                                        }}
                                        className="p-2 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm border border-white/30"
                                    >
                                        <FaTimes className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
                            {loadingAddressDetails ? (
                                <div className="flex items-center justify-center py-12">
                                    <Spinner />
                                </div>
                            ) : selectedAddress ? (
                                isEditingAddress ? (
                                    <div className="space-y-5">
                                        {/* Name Field */}
                                        <div className="bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/5 rounded-xl p-5 border-2 border-[#579BE8]/20">
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

                                        {/* Full Address Field */}
                                        <div className="bg-secondary/30 rounded-xl p-5 border border-border/50">
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

                                        {/* City and Area Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-secondary/30 rounded-xl p-5 border border-border/50">
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

                                            <div className="bg-secondary/30 rounded-xl p-5 border border-border/50">
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

                                        {/* Coordinates Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-secondary/30 rounded-xl p-5 border border-border/50">
                                                <label className="text-sm font-bold text-foreground mb-3 block">خط العرض</label>
                                                <Input
                                                    type="text"
                                                    value={editAddressForm.latitude}
                                                    onChange={(e) => setEditAddressForm(prev => ({ ...prev, latitude: e.target.value }))}
                                                    className="w-full bg-white dark:bg-card border-2 border-border/50 focus:border-[#579BE8] rounded-xl font-mono"
                                                    placeholder="24.7136"
                                                />
                                            </div>

                                            <div className="bg-secondary/30 rounded-xl p-5 border border-border/50">
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

                                        {/* Type and Favorite */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-secondary/30 rounded-xl p-5 border border-border/50">
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

                                            <div className="bg-secondary/30 rounded-xl p-5 border border-border/50 flex items-center justify-center">
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

                                        {/* Additional Info */}
                                        <div className="bg-secondary/30 rounded-xl p-5 border border-border/50">
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

                                        {/* Action Buttons */}
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
                                        {/* Name Card with Favorite Badge */}
                                        <div className="bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/5 rounded-xl p-5 border-2 border-[#579BE8]/20">
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
                                            <div className="bg-secondary/30 rounded-xl p-5 border border-border/50 hover:border-[#579BE8]/30 transition-all">
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
                                                    <div className="bg-secondary/30 rounded-xl p-5 border border-border/50 hover:border-[#579BE8]/30 transition-all">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-8 h-8 rounded-xl bg-[#579BE8]/10 flex items-center justify-center">
                                                                <FaBuilding className="text-[#579BE8] w-4 h-4" />
                                                            </div>
                                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">المدينة</p>
                                                        </div>
                                                        <p className="text-base font-bold text-foreground">{selectedAddress.city}</p>
                                                    </div>
                                                )}

                                                {selectedAddress.area && (
                                                    <div className="bg-secondary/30 rounded-xl p-5 border border-border/50 hover:border-[#579BE8]/30 transition-all">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-8 h-8 rounded-xl bg-[#579BE8]/10 flex items-center justify-center">
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
                                            <div className="bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-xl p-5 border border-border/50">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-8 h-8 rounded-xl bg-[#579BE8]/10 flex items-center justify-center">
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
                                            <div className="bg-secondary/30 rounded-xl p-5 border border-border/50 hover:border-[#579BE8]/30 transition-all">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-8 h-8 rounded-xl bg-[#579BE8]/10 flex items-center justify-center">
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
                                )
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>لا توجد تفاصيل متاحة</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}