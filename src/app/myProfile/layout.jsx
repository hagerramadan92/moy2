"use client";

import { useState } from "react";
import ProfileSidebar from "@/components/molecules/my-profile/ProfileSidebar";
import { HiMenuAlt2 } from "react-icons/hi";

export default function ProfileLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="bg-[#f8f8f9] min-h-screen relative">
            {/* Fixed Mobile Menu Trigger */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="min-[1123px]:hidden fixed top-[10%] right-6 z-[90] flex items-center gap-2 bg-[#579BE8] text-white px-5 py-3 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all font-bold"
            >
                <HiMenuAlt2 className="w-6 h-6" />
                <span>الحساب الشخصي</span>
            </button>

            <div className=" mx-auto py-10 px-3 max-w-7xl">
                <div className="flex flex-col min-[1123px]:flex-row gap-8 items-start relative">
                    {/* Sidebar / Mobile Menu */}
                    <div className="w-full min-[1123px]:w-64 flex-shrink-0">
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
