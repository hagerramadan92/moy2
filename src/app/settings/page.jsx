"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaChevronLeft, FaBell, FaLanguage, FaMoon, FaSun, FaLock, FaShieldAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    }
  }, [router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 pt-20 pb-10">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-4"
        >
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FaChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900">الإعدادات</h1>
        </motion.div>

        {/* Settings Cards */}
        <div className="space-y-4">
          {/* Account Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70"
          >
            <h2 className="mb-4 text-lg font-bold text-slate-900">إعدادات الحساب</h2>
            <div className="space-y-3">
              <Link
                href="/myProfile"
                className="flex items-center justify-between rounded-xl p-4 transition hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <FaShieldAlt className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">الملف الشخصي</div>
                    <div className="text-sm text-slate-500">إدارة معلوماتك الشخصية</div>
                  </div>
                </div>
                <FaChevronLeft className="h-4 w-4 text-slate-400" />
              </Link>

              <div className="flex items-center justify-between rounded-xl p-4 transition hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <FaLock className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">كلمة المرور</div>
                    <div className="text-sm text-slate-500">تغيير كلمة المرور</div>
                  </div>
                </div>
                <FaChevronLeft className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </motion.div>

          {/* App Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70"
          >
            <h2 className="mb-4 text-lg font-bold text-slate-900">إعدادات التطبيق</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl p-4 transition hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <FaBell className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">الإشعارات</div>
                    <div className="text-sm text-slate-500">إدارة الإشعارات</div>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-sky-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300"></div>
                </label>
              </div>

              <div className="flex items-center justify-between rounded-xl p-4 transition hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    {darkMode ? <FaMoon className="h-5 w-5" /> : <FaSun className="h-5 w-5" />}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">الوضع الليلي</div>
                    <div className="text-sm text-slate-500">تفعيل الوضع المظلم</div>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-sky-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300"></div>
                </label>
              </div>

              <div className="flex items-center justify-between rounded-xl p-4 transition hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <FaLanguage className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">اللغة</div>
                    <div className="text-sm text-slate-500">العربية</div>
                  </div>
                </div>
                <FaChevronLeft className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70"
          >
            <h2 className="mb-4 text-lg font-bold text-slate-900">حول التطبيق</h2>
            <div className="space-y-3">
              <Link
                href="/privacy"
                className="flex items-center justify-between rounded-xl p-4 transition hover:bg-slate-50"
              >
                <div className="font-bold text-slate-900">سياسة الخصوصية</div>
                <FaChevronLeft className="h-4 w-4 text-slate-400" />
              </Link>
              <Link
                href="/terms"
                className="flex items-center justify-between rounded-xl p-4 transition hover:bg-slate-50"
              >
                <div className="font-bold text-slate-900">الشروط والأحكام</div>
                <FaChevronLeft className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

