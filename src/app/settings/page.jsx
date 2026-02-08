"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaChevronLeft, FaBell, FaLanguage, FaMoon, FaSun, FaLock, FaShieldAlt, FaChevronRight, FaChevronCircleRight, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaCircleChevronRight } from "react-icons/fa6";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(true);
  // const [darkMode, setDarkMode] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      } else {
        router.push("/login");
        return;
      }

      // Load notifications setting
      const savedNotifications = localStorage.getItem("notificationsEnabled");
      if (savedNotifications !== null) {
        setNotifications(savedNotifications === "true");
      }

      // Load dark mode setting
      // const savedDarkMode = localStorage.getItem("darkMode");
      // if (savedDarkMode !== null) {
      //   const isDark = savedDarkMode === "true";
      //   setDarkMode(isDark);
      //   applyDarkMode(isDark);
      // } else {
      //   // Check system preference
      //   const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      //   setDarkMode(prefersDark);
      //   applyDarkMode(prefersDark);
      // }
    } catch {
      router.push("/login");
    }
  }, [router]);

  // Apply dark mode to document
  // const applyDarkMode = (isDark) => {
  //   if (typeof window !== 'undefined') {
  //     if (isDark) {
  //       document.documentElement.classList.add("dark");
  //     } else {
  //       document.documentElement.classList.remove("dark");
  //     }
  //   }
  // };

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // const savedDarkMode = localStorage.getItem("darkMode");
    // if (savedDarkMode === null) {
    //   // Only listen to system preference if user hasn't set a preference
    //   const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      
    //   const handleChange = (e) => {
    //     setDarkMode(e.matches);
    //     applyDarkMode(e.matches);
    //   };

    //   mediaQuery.addEventListener("change", handleChange);
    //   return () => mediaQuery.removeEventListener("change", handleChange);
    // }
  }, []);

  // Handle notifications toggle
  const handleNotificationsToggle = async (enabled) => {
    setNotifications(enabled);
    localStorage.setItem("notificationsEnabled", enabled.toString());

    if (enabled) {
      // Request notification permission
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setNotifications(false);
          localStorage.setItem("notificationsEnabled", "false");
          alert("يرجى السماح بالإشعارات من إعدادات المتصفح");
        }
      } else {
        alert("المتصفح لا يدعم الإشعارات");
        setNotifications(false);
        localStorage.setItem("notificationsEnabled", "false");
      }
    }
  };

  // Handle dark mode toggle
  // const handleDarkModeToggle = (enabled) => {
  //   setDarkMode(enabled);
  //   localStorage.setItem("darkMode", enabled.toString());
  //   applyDarkMode(enabled);
  // };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 dark:from-slate-900 dark:to-slate-800 md:pt-15 p-5 md:pb-10">
      <div className="mx-auto max-w-4xl md:px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-4"
        >
          <button
            onClick={() => router.back()}
            className="flex md:h-10 md:w-10 w-8 h-8 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <FaArrowRight className="md:h-5 md:w-5 h-4 w-4" />
          </button>
          <h1 className="md:text-3xl text-lg font-extrabold text-slate-900 dark:text-white">الإعدادات</h1>
        </motion.div>

        {/* Settings Cards */}
        <div className="space-y-3 md:space-y-4">
          {/* Account Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:rounded-2xl rounded-xl bg-white dark:bg-slate-800 md:p-6 p-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700"
          >
            <h2 className="md:mb-4 mb-0 md:pt-0 pt-3 ps-4 text-lg font-bold text-slate-900 dark:text-white">إعدادات الحساب</h2>
            <div className="space-y-3">
              <Link
                href="/myProfile"
                className="flex items-center justify-between rounded-xl p-4 transition hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-400">
                    <FaShieldAlt className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 dark:text-white">الملف الشخصي</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">إدارة معلوماتك الشخصية</div>
                  </div>
                </div>
                <FaChevronLeft className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </Link>

             
            </div>
          </motion.div>

          {/* App Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:rounded-2xl rounded-xl bg-white dark:bg-slate-800 md:p-6 shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700"
          >
            <h2 className="mb-2 md:mb-4 pt-3 md:pt-0 ps-3 text-lg font-bold text-slate-900 dark:text-white">إعدادات التطبيق</h2>
            <div className="md:space-y-4 space-y-0">
              <div className="flex items-center justify-between rounded-xl p-4 transition hover:bg-slate-50 dark:hover:bg-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                    <FaBell className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 dark:text-white">الإشعارات</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">إدارة الإشعارات</div>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => handleNotificationsToggle(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-200 dark:bg-slate-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 dark:after:border-slate-500 after:bg-white dark:after:bg-slate-300 after:transition-all after:content-[''] peer-checked:bg-sky-500 dark:peer-checked:bg-sky-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800"></div>
                </label>
              </div>

            

              <div className="flex items-center justify-between rounded-xl p-4 transition hover:bg-slate-50 dark:hover:bg-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                    <FaLanguage className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 dark:text-white">اللغة</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">العربية</div>
                  </div>
                </div>
                <FaChevronLeft className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </div>
            </div>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:rounded-2xl rounded-xl bg-white dark:bg-slate-800 md:p-6 p-0 shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700"
          >
            <h2 className="md:mb-4 mb-0 ps-4 pt-3 md:pt-0 md:ps-0 text-lg font-bold text-slate-900 dark:text-white">حول التطبيق</h2>
            <div className="space-y-0 md:space-y-4">
              <Link
                href="/privacy"
                className="flex items-center justify-between rounded-xl md:p-4 p-2  transition hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <div className="font-bold text-slate-600 dark:text-white text-sm md:text-base">سياسة الخصوصية</div>
                <FaChevronLeft className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </Link>
              <Link
                href="/terms"
                className="flex items-center justify-between rounded-xl md:p-4 p-2 pb-4 transition hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <div className="font-bold text-slate-600 dark:text-white text-sm md:text-base">الشروط والأحكام</div>
                <FaChevronLeft className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

