"use client";
import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaRegUser } from "react-icons/fa";
import { FaHeadset } from "react-icons/fa6";
import { MdLogout } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import { IoWalletOutline } from "react-icons/io5"; // Added for variety if needed, or stick to FaRegUser
import { BiPackage } from "react-icons/bi"; // For Orders
import Swal from "sweetalert2";
import { HiMenuAlt3, HiX } from "react-icons/hi";

export default function ProfileSidebar({ isOpen, setIsOpen }) {
    const pathname = usePathname();

    const isActive = (path) => pathname === path;

    const navItems = [
        {
            title: "الحساب",
            icon: <FaRegUser className="w-5 h-5" />,
            links: [
                { name: "الملف الشخصي", href: "/myProfile" },
                { name: "محفظتك", href: "/myProfile/wallet" },
                { name: "الطلبات", href: "/myProfile/orders" },
                { name: "التعاقدات", href: "/myProfile/contracting" },
            ]
        },
        {
            title: "الدعم والمساعدة",
            icon: <FaHeadset className="w-5 h-5" />,
            links: [
                { name: "مركز المساعدة", href: "/myProfile/help-center" },
                { name: "الدعم الفني", href: "/myProfile/support" },
            ]
        }
    ];

    const handleLogout = () => {
        Swal.fire({
            title: "تسجيل الخروج",
            text: "هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#579BE8",
            cancelButtonColor: "#F75A65",
            confirmButtonText: "نعم، خروج",
            cancelButtonText: "إلغاء",
            background: "var(--background)",
            color: "var(--foreground)",
            customClass: {
                popup: "rounded-2xl border border-border shadow-xl",
                confirmButton: "rounded-xl font-bold px-6 py-2 ml-2",
                cancelButton: "rounded-xl font-bold px-6 py-2"
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Here you would typically clear tokens/session
                window.location.href = "/";
            }
        });
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden min-[1123px]:block w-64 bg-white dark:bg-card rounded-2xl p-6 shadow-sm h-fit sticky top-52">
                <div className="flex flex-col gap-8">
                    {navItems.map((section, idx) => (
                        <div key={idx} className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-primary dark:text-primary-foreground font-bold px-2">
                                {section.icon}
                                <h2 className="text-lg">{section.title}</h2>
                            </div>
                            <div className="flex flex-col gap-1 pr-4 border-r-2 border-border/50">
                                {section.links.map((link, linkIdx) => (
                                    <Link
                                        key={linkIdx}
                                        href={link.href}
                                        style={isActive(link.href) ? { backgroundColor: "#579BE815" } : {}}
                                        className={`text-base py-2 px-4 rounded-lg transition-all duration-200 block
                                            ${isActive(link.href)
                                                ? "text-primary font-bold translate-x-[-4px]"
                                                : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-[-2px]"
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="flex flex-col gap-4 pt-4 border-t border-border">
                        <div
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-destructive rounded-lg hover:translate-x-[-2px] cursor-pointer transition-all duration-200 font-bold px-2 py-2 hover:bg-destructive/10 hover:text-destructive"
                        >
                            <FiLogOut className="w-5 h-5" />
                            <h2 className="text-lg">تسجيل خروج</h2>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Drawer */}
            <div
                className={`fixed inset-0 z-[100] min-[1113px]:hidden transition-all duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />

                {/* Drawer */}
                <div
                    className={`absolute right-0 top-0 h-full w-[280px] bg-white dark:bg-card p-6 shadow-2xl transition-transform duration-300 transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold">القائمة</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-secondary rounded-xl transition-colors"
                        >
                            <HiX className="w-6 h-6 text-muted-foreground" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-8">
                        {navItems.map((section, idx) => (
                            <div key={idx} className="flex flex-col gap-4">
                                <div className="flex items-center gap-2 text-primary font-bold px-2">
                                    {section.icon}
                                    <h2 className="text-lg">{section.title}</h2>
                                </div>
                                <div className="flex flex-col gap-1 pr-4 border-r-2 border-border/50">
                                    {section.links.map((link, linkIdx) => (
                                        <Link
                                            key={linkIdx}
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`text-base py-2.5 px-4 rounded-lg transition-all duration-200 block
                                                ${isActive(link.href)
                                                    ? "text-primary font-bold bg-[#579BE815] translate-x-[-4px]"
                                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                                }`}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="flex flex-col gap-4 pt-4 border-t border-border mt-auto">
                            <div
                                onClick={() => { setIsOpen(false); handleLogout(); }}
                                className="flex items-center gap-2 text-destructive rounded-lg font-bold px-2 py-3 hover:bg-destructive/10"
                            >
                                <FiLogOut className="w-5 h-5" />
                                <h2 className="text-lg">تسجيل خروج</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
