import { useState, useCallback } from 'react';
import { toast } from "react-hot-toast";
import { toggleFavorite, getFavoriteAddresses, checkFavoriteStatus } from '@/utils/favorites';

export const useFavorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [togglingId, setTogglingId] = useState(null);

    // جلب المفضلة
    const fetchFavorites = useCallback(async (showToasts = false) => {
        setLoading(true);
        try {
            const result = await getFavoriteAddresses({ showToasts });
            if (result.success) {
                setFavorites(result.favorites);
                return result.favorites;
            }
            return [];
        } catch (error) {
            console.error('Error fetching favorites:', error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // تبديل حالة المفضلة
    const toggleFavoriteStatus = useCallback(async (addressId, currentStatus, options = {}) => {
        setTogglingId(addressId);
        try {
            const result = await toggleFavorite(addressId, currentStatus, options);
            
            if (result.success) {
                // تحديث قائمة المفضلة
                setFavorites(prev => {
                    if (result.isFavorite) {
                        // إذا تمت الإضافة للمفضلة، نضيفها إذا لم تكن موجودة
                        if (!prev.some(f => f.id === addressId)) {
                            // ملاحظة: هنا قد تحتاج لجلب تفاصيل العنوان إذا لم تكن موجودة
                            return [...prev, { id: addressId }];
                        }
                    } else {
                        // إذا تمت الإزالة من المفضلة، نحذفها من القائمة
                        return prev.filter(f => f.id !== addressId);
                    }
                    return prev;
                });
            }
            
            return result;
        } finally {
            setTogglingId(null);
        }
    }, []);

    // إضافة للمفضلة
    const addToFavorites = useCallback(async (addressId, options = {}) => {
        return toggleFavoriteStatus(addressId, false, {
            successMessage: "تمت إضافة العنوان إلى المفضلة",
            ...options
        });
    }, [toggleFavoriteStatus]);

    // إزالة من المفضلة
    const removeFromFavorites = useCallback(async (addressId, options = {}) => {
        return toggleFavoriteStatus(addressId, true, {
            successMessage: "تمت إزالة العنوان من المفضلة",
            ...options
        });
    }, [toggleFavoriteStatus]);

    // التحقق من حالة المفضلة لعنوان معين
    const checkStatus = useCallback(async (addressId) => {
        const result = await checkFavoriteStatus(addressId);
        return result.success ? result.isFavorite : false;
    }, []);

    return {
        favorites,
        loading,
        togglingId,
        fetchFavorites,
        toggleFavoriteStatus,
        addToFavorites,
        removeFromFavorites,
        checkStatus
    };
};