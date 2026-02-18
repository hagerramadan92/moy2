// contexts/CacheContext.jsx
'use client';

import React, { createContext, useContext, useRef } from 'react';

const CacheContext = createContext();

const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق (عدلها حسب احتياجك)
const STORAGE_PREFIX = 'app_cache_';

export const CacheProvider = ({ children }) => {
  // استخدام useRef بدلاً من useState لتجنب إعادة الرندر عند التحديث
  const memoryCache = useRef(new Map());

  // دالة للحصول على البيانات من cache
  const get = (key, useSession = false) => {
    try {
      // 1. حاول من Memory Cache أولاً (الأسرع)
      if (memoryCache.current.has(key)) {
        const cached = memoryCache.current.get(key);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
          return cached.data;
        }
        // انتهت الصلاحية، احذفها
        memoryCache.current.delete(key);
      }

      // 2. جرب من Storage (localStorage/sessionStorage)
      const storage = useSession ? sessionStorage : localStorage;
      const stored = storage.getItem(STORAGE_PREFIX + key);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          // خزن في Memory Cache للاستخدام السريع لاحقاً
          memoryCache.current.set(key, parsed);
          return parsed.data;
        }
        // انتهت الصلاحية، احذفها
        storage.removeItem(STORAGE_PREFIX + key);
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }
    
    return null;
  };

  // دالة لتخزين البيانات
  const set = (key, data, useSession = false) => {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now()
      };

      // خزن في Memory Cache
      memoryCache.current.set(key, cacheItem);

      // خزن في Storage
      const storage = useSession ? sessionStorage : localStorage;
      storage.setItem(STORAGE_PREFIX + key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  };

  // دالة لمسح cache معين
  const remove = (key) => {
    memoryCache.current.delete(key);
    localStorage.removeItem(STORAGE_PREFIX + key);
    sessionStorage.removeItem(STORAGE_PREFIX + key);
  };

  // دالة لمسح كل الـ cache
  const clear = () => {
    memoryCache.current.clear();
    
    // مسح فقط items الخاصة بالتطبيق من localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  };

  // دالة لمسح cache المنتهي الصلاحية فقط
  const clearExpired = () => {
    const now = Date.now();
    
    // مسح من Memory Cache
    memoryCache.current.forEach((value, key) => {
      if (now - value.timestamp >= CACHE_DURATION) {
        memoryCache.current.delete(key);
      }
    });

    // مسح من localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        try {
          const parsed = JSON.parse(localStorage.getItem(key));
          if (now - parsed.timestamp >= CACHE_DURATION) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    });
  };

  const value = {
    get,
    set,
    remove,
    clear,
    clearExpired
  };

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};