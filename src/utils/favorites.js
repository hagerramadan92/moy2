import { toast } from "react-hot-toast";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const API_BASE_URL = "https://dashboard.waytmiah.com/api/v1";

// دالة لإضافة/إزالة من المفضلة (Toggle)
export const toggleFavorite = async (addressId, isFavorite, options = {}) => {
    const {
        showToasts = true,
        loadingMessage = "جاري تحديث المفضلة...",
        successMessage = isFavorite ? "تمت إزالة العنوان من المفضلة" : "تمت إضافة العنوان إلى المفضلة",
        errorMessage = "فشل تحديث المفضلة"
    } = options;

    const accessToken = localStorage.getItem("accessToken");
    
    if (!accessToken) {
        if (showToasts) {
            toast.error("يرجى تسجيل الدخول أولاً");
        }
        return { success: false, error: "No access token" };
    }

    let loadingToast;
    if (showToasts) {
        loadingToast = toast.loading(loadingMessage);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/addresses/${addressId}/favorite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                is_favorite: !isFavorite
            })
        });

        const data = await response.json().catch(() => ({}));

        if (showToasts) {
            toast.dismiss(loadingToast);
        }

        if (response.ok) {
            if (showToasts) {
                toast.success(data.message || successMessage, {
                    icon: <FaCheckCircle className="w-5 h-5" />,
                    style: {
                        background: "#579BE8",
                        color: "#fff",
                        borderRadius: "12px",
                        padding: "16px",
                    },
                });
            }
            return { 
                success: true, 
                data: data.data,
                isFavorite: !isFavorite,
                message: data.message || successMessage 
            };
        } else {
            const errorMsg = data.message || data.error || errorMessage;
            if (showToasts) {
                toast.error(errorMsg, {
                    icon: <FaExclamationTriangle className="w-5 h-5" />,
                    style: {
                        background: "#F75A65",
                        color: "#fff",
                        borderRadius: "12px",
                        padding: "16px",
                    },
                });
            }
            return { success: false, error: errorMsg };
        }
    } catch (error) {
        if (showToasts) {
            toast.dismiss(loadingToast);
            toast.error(errorMessage, {
                icon: <FaExclamationTriangle className="w-5 h-5" />,
                style: {
                    background: "#F75A65",
                    color: "#fff",
                    borderRadius: "12px",
                    padding: "16px",
                },
            });
        }
        console.error('Error toggling favorite:', error);
        return { success: false, error: error.message };
    }
};

// دالة لإضافة إلى المفضلة فقط
export const addToFavorites = async (addressId, options = {}) => {
    return toggleFavorite(addressId, false, {
        successMessage: "تمت إضافة العنوان إلى المفضلة",
        ...options
    });
};

// دالة للإزالة من المفضلة فقط
export const removeFromFavorites = async (addressId, options = {}) => {
    return toggleFavorite(addressId, true, {
        successMessage: "تمت إزالة العنوان من المفضلة",
        ...options
    });
};

// دالة للتحقق من حالة المفضلة
export const checkFavoriteStatus = async (addressId, options = {}) => {
    const { showToasts = false } = options;
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
        return { success: false, error: "No access token" };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();
        
        if (response.ok && data.status && data.data) {
            return { 
                success: true, 
                isFavorite: data.data.is_favorite || false,
                data: data.data 
            };
        } else {
            return { success: false, error: data.message || "فشل جلب البيانات" };
        }
    } catch (error) {
        console.error('Error checking favorite status:', error);
        return { success: false, error: error.message };
    }
};

// دالة لجلب جميع العناوين المفضلة
export const getFavoriteAddresses = async (options = {}) => {
    const { showToasts = false } = options;
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
        return { success: false, error: "No access token" };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/addresses`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();
        
        if (response.ok && data.status && data.data) {
            const favorites = data.data.filter(addr => addr.is_favorite === true);
            return { 
                success: true, 
                favorites,
                allAddresses: data.data 
            };
        } else {
            return { success: false, error: data.message || "فشل جلب العناوين" };
        }
    } catch (error) {
        console.error('Error fetching favorite addresses:', error);
        return { success: false, error: error.message };
    }
};