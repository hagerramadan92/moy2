"use client";

import { useState, useEffect } from "react";
import ProfileSidebar from "@/components/molecules/my-profile/ProfileSidebar";
import { HiMenuAlt2 } from "react-icons/hi";
import 'leaflet/dist/leaflet.css';

export default function ProfileLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // جلب بيانات المستخدم من localStorage
        const fetchUserData = () => {
            try {
                // محاولة جلب بيانات المستخدم من localStorage
                const storedUser = localStorage.getItem('user');
                const storedToken = localStorage.getItem('token');
                
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    // إضافة التوكن إلى بيانات المستخدم
                    setUserData({
                        ...parsedUser,
                        token: storedToken || parsedUser.token
                    });
                } else {
                    // إذا لم تكن هناك بيانات، يمكنك جلبها من API
                    // هذا مثال - عدله حسب الـ API الخاص بك
                    const fetchUserFromAPI = async () => {
                        try {
                            const response = await fetch('/auth/user', {
                                headers: {
                                    'Authorization': `Bearer ${storedToken}`
                                }
                            });
                            if (response.ok) {
                                const data = await response.json();
                                setUserData({
                                    ...data,
                                    token: storedToken
                                });
                            }
                        } catch (error) {
                            console.error('Error fetching user data:', error);
                        }
                    };
                    
                    if (storedToken) {
                        fetchUserFromAPI();
                    }
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    return (
        <div className="bg-[#f8f8f9] min-h-screen relative">
            {/* Fixed Mobile Menu Trigger */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="min-[1123px]:hidden fixed shadow-2xl top-[11%] max-[1123px]:right-3 right-6 z-[90] flex items-center gap-2 bg-[#579BE8] text-white max-[1123px]:px-4 px-5 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all font-bold"
            >
                <HiMenuAlt2 className="w-6 h-6" />
                <span className="text-xs">الحساب الشخصي</span>
            </button>

            <div className="mx-auto max-[1123px]:pt-[50px] py-10 px-3 max-w-7xl">
                <div className="flex flex-col min-[1123px]:flex-row gap-8 items-start relative">
                    {/* Sidebar / Mobile Menu */}
                    <div className="w-full min-[1123px]:w-64 flex-shrink-0">
                        <ProfileSidebar 
                            isOpen={isSidebarOpen} 
                            setIsOpen={setIsSidebarOpen}  
                            user={userData}
                            loading={loading}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 w-full min-h-[600px] rounded-xl">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}