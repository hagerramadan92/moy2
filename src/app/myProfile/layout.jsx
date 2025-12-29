"use client";

import { useState } from "react";
import ProfileSidebar from "@/components/molecules/ProfileSidebar";
import { HiMenuAlt2 } from "react-icons/hi";

export default function ProfileLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="bg-[#f8f8f9] min-h-screen relative">
            {/* Fixed Mobile Menu Trigger */}
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="min-[1113px]:hidden fixed top-[15%] left-6 z-[90] flex items-center gap-2 bg-[#579BE8] text-white px-5 py-3 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all font-bold"
            >
                <HiMenuAlt2 className="w-6 h-6" />
                <span>القائمة</span>
            </button>

            <div className="container mx-auto py-10 px-4">
                <div className="mb-10  self-start z-10 bg-[#f8f8f9] py-2">
                    <h1 className="text-3xl font-bold mb-2">الملف الشخصي</h1>
                    <p className="text-muted-foreground">ادارة معلوماتك واداداتك الشخصية</p>
                </div>

                <div className="flex flex-col min-[1123px]:flex-row gap-8 items-start relative">
                    {/* Sidebar / Mobile Menu */}
                    <div className="w-full min-[1123px]:w-64 flex-shrink-0 min-[1123px]:sticky min-[1123px]:top-24">
                        <ProfileSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 w-full min-h-[600px] rounded-2xl">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
