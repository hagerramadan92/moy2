'use client';

import { useState } from 'react';
import Link from 'next/link';
import NotificationBell from './Notifications/NotificationBell';
import {
  FaHome,
  FaBell,
  FaUser,
  FaCog,
  FaBars,
  FaTimes,
  FaSignOutAlt
} from 'react-icons/fa';

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: 'الرئيسية', href: '/', icon: FaHome },
    { name: 'الإشعارات', href: '/notifications', icon: FaBell },
    { name: 'الملف الشخصي', href: '/profile', icon: FaUser },
    { name: 'الإعدادات', href: '/settings', icon: FaCog },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* شريط التنقل العلوي */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md text-gray-700 lg:hidden hover:bg-gray-100"
                aria-label="قائمة التنقل"
              >
                {isSidebarOpen ? (
                  <FaTimes className="h-6 w-6" />
                ) : (
                  <FaBars className="h-6 w-6" />
                )}
              </button>
              
              <div className="flex-shrink-0 flex items-center ml-4">
                <FaBell className="h-8 w-8 text-[#579BE8] " />
                <span className="mr-2 text-xl font-bold text-gray-900">إشعاراتي</span>
              </div>
              
              {/* روابط التنقل للشاشات الكبيرة */}
              <div className="hidden lg:flex lg:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#579BE8]  hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <item.icon className="h-5 w-5 mr-1" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationBell />
              
              <div className="hidden lg:flex items-center space-x-3">
                <button 
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                  title="الملف الشخصي"
                >
                  <FaUser className="h-6 w-6" />
                </button>
                <button 
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                  title="تسجيل الخروج"
                >
                  <FaSignOutAlt className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* الشريط الجانبي للجوال */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform lg:hidden ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="pt-16 px-4">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-[#579BE8]  hover:bg-blue-50 rounded-lg transition-colors"
              >
                <item.icon className="h-6 w-6 mr-3" />
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-4">
            <button className="flex items-center w-full px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg">
              <FaSignOutAlt className="h-6 w-6 mr-3" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto">
        {children}
      </main>

      {/* تذييل الصفحة */}
      <footer className="mt-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-700 text-sm">
            <p>© 2024 نظام الإشعارات. جميع الحقوق محفوظة.</p>
            <p className="mt-2">تم التطوير باستخدام Next.js و Firebase</p>
          </div>
        </div>
      </footer>
    </div>
  );
}