// hooks/useApiWithCache.js
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useCache } from '@/contexts/CacheContext';
import { waterApi, generalApi } from '@/utils/api';

const CACHE_KEYS = {
  WATER_SERVICES: 'water_services',
  WATER_TYPES: 'water_types',
  HOME_PAGE: 'home_page_data',
  DEALS: 'deals',
  REVIEWS: 'reviews'
};

export const useApiWithCache = () => {
  const cache = useCache();
  const [loadingStates, setLoadingStates] = useState({});
  const abortControllers = useRef(new Map());

  // دالة لإلغاء الطلبات المعلقة
  const cancelPendingRequest = (key) => {
    if (abortControllers.current.has(key)) {
      abortControllers.current.get(key).abort();
      abortControllers.current.delete(key);
    }
  };

  // دالة عامة لجلب البيانات مع Cache
  const fetchWithCache = useCallback(async (
    cacheKey,
    apiFunction,
    options = {}
  ) => {
    const {
      forceRefresh = false,
      useSession = false,
      onSuccess,
      onError,
      cacheDuration = null // يمكن تخصيص مدة cache لكل طلب
    } = options;

    // إلغاء أي طلب سابق لنفس المفتاح
    cancelPendingRequest(cacheKey);

    // إذا لم يكن forceRefresh، حاول من الـ Cache
    if (!forceRefresh) {
      const cachedData = cache.get(cacheKey, useSession);
      if (cachedData) {
        return cachedData;
      }
    }

    // إنشاء AbortController للطلب الجديد
    const controller = new AbortController();
    abortControllers.current.set(cacheKey, controller);

    setLoadingStates(prev => ({ ...prev, [cacheKey]: true }));

    try {
      let result;
      
      // إذا كانت apiFunction دالة، نفذها
      if (typeof apiFunction === 'function') {
        result = await apiFunction(controller.signal);
      } else {
        result = apiFunction;
      }

      // تخزين النتيجة في Cache
      cache.set(cacheKey, result, useSession);
      
      onSuccess?.(result);
      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`Request ${cacheKey} was cancelled`);
        return null;
      }
      
      console.error(`Error fetching ${cacheKey}:`, error);
      onError?.(error);
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, [cacheKey]: false }));
      abortControllers.current.delete(cacheKey);
    }
  }, [cache]);

  // دالة لجلب خدمات المياه مع Cache
  const getWaterServices = useCallback(async (forceRefresh = false) => {
    return fetchWithCache(
      CACHE_KEYS.WATER_SERVICES,
      async () => {
        const response = await waterApi.getWaterServices();
        // تأكد من تنسيق البيانات
        return response.data || response;
      },
      { forceRefresh }
    );
  }, [fetchWithCache]);

  // دالة لجلب أنواع المياه مع Cache
  const getWaterTypes = useCallback(async (forceRefresh = false) => {
    return fetchWithCache(
      CACHE_KEYS.WATER_TYPES,
      async () => {
        const response = await waterApi.getWaterTypes();
        return response.data || response;
      },
      { forceRefresh }
    );
  }, [fetchWithCache]);

  // دالة لجلب بيانات الصفحة الرئيسية مع Cache
  const getHomePageData = useCallback(async (forceRefresh = false) => {
    return fetchWithCache(
      CACHE_KEYS.HOME_PAGE,
      async () => {
        const response = await generalApi.getHomePageData();
        return response.data || response;
      },
      { forceRefresh }
    );
  }, [fetchWithCache]);

  // دالة لجلب العروض مع Cache
  const getDeals = useCallback(async (forceRefresh = false) => {
    return fetchWithCache(
      CACHE_KEYS.DEALS,
      async () => {
        const response = await generalApi.getDeals();
        return response.data || response;
      },
      { forceRefresh }
    );
  }, [fetchWithCache]);

  // دالة لجلب التقييمات مع Cache
  const getReviews = useCallback(async (forceRefresh = false) => {
    return fetchWithCache(
      CACHE_KEYS.REVIEWS,
      async () => {
        const response = await generalApi.getReviews();
        return response.data || response;
      },
      { forceRefresh }
    );
  }, [fetchWithCache]);

  // تنظيف AbortControllers عند unmount
  useEffect(() => {
    return () => {
      abortControllers.current.forEach(controller => controller.abort());
      abortControllers.current.clear();
    };
  }, []);

  // دوال مساعدة
  const clearCache = useCallback((key) => {
    if (key) {
      cache.remove(key);
    } else {
      cache.clear();
    }
  }, [cache]);

  const refreshData = useCallback(async (key) => {
    return fetchWithCache(key, null, { forceRefresh: true });
  }, [fetchWithCache]);

  const isLoading = useCallback((key) => {
    if (key) {
      return loadingStates[key] || false;
    }
    return Object.values(loadingStates).some(state => state);
  }, [loadingStates]);

  return {
    // البيانات
    getWaterServices,
    getWaterTypes,
    getHomePageData,
    getDeals,
    getReviews,
    
    // حالة التحميل
    isLoading,
    
    // إدارة Cache
    clearCache,
    refreshData,
    
    // مفاتيح Cache للاستخدام المباشر
    CACHE_KEYS,
    
    // حالة التحميل لكل مفتاح
    loadingStates
  };
};