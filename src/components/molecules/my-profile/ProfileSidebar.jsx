"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaRegUser } from "react-icons/fa";
import { FaHeadset } from "react-icons/fa6";
import { MdLogout } from "react-icons/md";
import { IoWalletOutline } from "react-icons/io5"; // Added for variety if needed, or stick to FaRegUser
import { BiPackage } from "react-icons/bi"; // For Orders

export default function ProfileSidebar() {
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

    return (
        <aside className="w-full md:w-64 bg-white dark:bg-card rounded-2xl p-6 shadow-sm h-fit sticky top-4">
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
                                    style={isActive(link.href) ? { background: "linear-gradient(to right,  lab(92 -7.52 -11.71)),lab(90 -3.7 -14.77)" } : {}}
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
                    <div className="flex items-center gap-2 text-destructive rounded-lg hover:translate-x-[-2px] cursor-pointer transition-all duration-200 font-bold px-2 py-2 hover:bg-destructive/10 hover:text-destructive">
                        <MdLogout className="w-5 h-5" />
                        <h2 className="text-lg">تسجيل خروج</h2>
                    </div>

                </div>
            </div>
        </aside>
    );
}
