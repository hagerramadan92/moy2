"use client";
import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaRegUser, FaTrashAlt } from "react-icons/fa";
import { FaHeadset } from "react-icons/fa6";
import { MdLogout, MdBusinessCenter } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import { IoWalletOutline, IoDocumentText } from "react-icons/io5";
import { BiPackage } from "react-icons/bi";
import { FaHistory, FaMoneyBillWave, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import { HiMenuAlt3, HiX } from "react-icons/hi";

export default function ProfileSidebar({ isOpen, setIsOpen, loading = false, user = null }) {
    const pathname = usePathname();

    const isActive = (path) => pathname === path;
    const isWalletActive = pathname.startsWith('/myProfile/wallet');
    const isContractingActive = pathname.startsWith('/myProfile/contracting');

    const walletDropdownItems = [
        { name: "محفظتك", href: "/myProfile/wallet", icon: <IoWalletOutline className="w-4 h-4" /> },
        { name: "سجل المدفوعات", href: "/myProfile/wallet/payment-history", icon: <FaHistory className="w-4 h-4" /> },
        { name: "شحن المحفظة", href: "/myProfile/wallet/add-money", icon: <FaMoneyBillWave className="w-4 h-4" /> },
    ];

    const contractingDropdownItems = [
        { name: "إنشاء تعاقد", href: "/myProfile/contracting", icon: <FaPlus className="w-4 h-4" /> },
        { name: "سجل التعاقدات", href: "/myProfile/contracting/history", icon: <IoDocumentText className="w-4 h-4" /> },
    ];

    const navItems = [
        {
            title: "الحساب الشخصي",
            icon: <FaRegUser className="w-5 h-5" />,
            links: [
                { name: "الملف الشخصي", href: "/myProfile" },
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
            width: window.innerWidth < 640 ? '90%' : '32rem',
            customClass: {
                popup: "rounded-2xl border border-border shadow-xl mx-4",
                confirmButton: "rounded-xl font-bold px-4 sm:px-6 py-2 ml-2 text-sm sm:text-base",
                cancelButton: "rounded-xl font-bold px-4 sm:px-6 py-2 text-sm sm:text-base",
                title: "text-sm",
                htmlContainer: "text-sm sm:text-base"
            }
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.location.href = "/";
            }
        });
    };

    const handleDeleteAccount = () => {
        // التحقق من وجود بيانات المستخدم
        if (!user || !user.phoneNumber) {
            Swal.fire({
                title: "خطأ",
                text: "بيانات المستخدم غير متوفرة",
                icon: "error",
                confirmButtonColor: "#579BE8",
                confirmButtonText: "حسنًا",
                background: "var(--background)",
                color: "var(--foreground)",
                width: window.innerWidth < 640 ? '90%' : '32rem',
                customClass: {
                    popup: "rounded-2xl border border-border shadow-xl mx-4",
                    confirmButton: "rounded-xl font-bold px-4 sm:px-6 py-2 text-sm sm:text-base",
                    title: "text-sm",
                    htmlContainer: "text-sm sm:text-base"
                }
            });
            return;
        }

        Swal.fire({
            title: "حذف الحساب",
            text: "هل أنت متأكد تمامًا من رغبتك في حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه وسيؤدي إلى حذف جميع بياناتك نهائيًا",
            icon: "error",
            showCancelButton: true,
            confirmButtonColor: "#F75A65",
            cancelButtonColor: "#579BE8",
            confirmButtonText: "نعم، احذف حسابي",
            cancelButtonText: "إلغاء",
            background: "var(--background)",
            color: "var(--foreground)",
            width: window.innerWidth < 640 ? '90%' : '32rem',
            customClass: {
                popup: "rounded-2xl border border-border shadow-xl mx-4",
                confirmButton: "rounded-xl font-bold px-4 sm:px-6 py-2 ml-2 text-sm sm:text-base",
                cancelButton: "rounded-xl font-bold px-4 sm:px-6 py-2 text-sm sm:text-base",
                title: "text-sm text-right",
                htmlContainer: "text-sm sm:text-base text-right"
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Show loading
                Swal.fire({
                    title: "جاري حذف الحساب",
                    text: "الرجاء الانتظار...",
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    background: "var(--background)",
                    color: "var(--foreground)",
                    width: window.innerWidth < 640 ? '90%' : '32rem',
                    customClass: {
                        popup: "rounded-2xl border border-border shadow-xl mx-4",
                        title: "text-sm",
                        htmlContainer: "text-sm sm:text-base"
                    },
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                // بناء URL الحذف مع رقم الهاتف
                const deleteUrl = `https://dashboard.waytmiah.com/api/v1/delete/account/${user.phoneNumber}`;
                
                // Call delete API
                fetch(deleteUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                        'Accept': 'application/json',
                    },
                })
                .then(async (response) => {
                    let data;
                    try {
                        data = await response.json();
                    } catch (e) {
                        data = { message: 'حدث خطأ غير متوقع' };
                    }
                    
                    if (response.ok) {
                        Swal.fire({
                            title: "تم حذف الحساب",
                            text: "تم حذف حسابك بنجاح. سيتم تحويلك إلى الصفحة الرئيسية",
                            icon: "success",
                            confirmButtonColor: "#579BE8",
                            confirmButtonText: "حسنًا",
                            background: "var(--background)",
                            color: "var(--foreground)",
                            width: window.innerWidth < 640 ? '90%' : '32rem',
                            customClass: {
                                popup: "rounded-2xl border border-border shadow-xl mx-4",
                                confirmButton: "rounded-xl font-bold px-4 sm:px-6 py-2 text-sm sm:text-base",
                                title: "text-sm",
                                htmlContainer: "text-sm sm:text-base"
                            }
                        }).then(() => {
                            // Clear tokens/session and redirect
                            localStorage.removeItem('user');
                            localStorage.removeItem('token');
                            window.location.href = "/";
                        });
                    } else {
                        throw new Error(data.message || data.error || "حدث خطأ أثناء حذف الحساب");
                    }
                })
                .catch((error) => {
                    Swal.fire({
                        title: "خطأ",
                        text: error.message || "حدث خطأ أثناء حذف الحساب. الرجاء المحاولة مرة أخرى",
                        icon: "error",
                        confirmButtonColor: "#579BE8",
                        confirmButtonText: "حسنًا",
                        background: "var(--background)",
                        color: "var(--foreground)",
                        width: window.innerWidth < 640 ? '90%' : '32rem',
                        customClass: {
                            popup: "rounded-2xl border border-border shadow-xl mx-4",
                            confirmButton: "rounded-xl font-bold px-4 sm:px-6 py-2 text-sm sm:text-base",
                            title: "text-sm",
                            htmlContainer: "text-sm sm:text-base"
                        }
                    });
                });
            }
        });
    };

    // Skeleton Component
    const SidebarSkeleton = () => (
        <>
            {/* Desktop Sidebar Skeleton */}
            <aside className="hidden !mt-[25px] min-[1123px]:block w-64 bg-white dark:bg-card rounded-2xl p-6 shadow-sm h-fit fixed top-24">
                <div className="flex flex-col md:gap-6 gap-3">
                    {/* First Section Skeleton */}
                    <div className="flex flex-col md:gap-4 gap-2">
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                        </div>
                        <div className="flex flex-col gap-1 pr-4 border-r-2 border-border/50">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-1"></div>
                            ))}
                            
                            <div className="flex flex-col gap-1 mt-2">
                                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                                <div className="flex flex-col gap-1 mr-6 mt-1">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-1"></div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 mt-2">
                                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                                <div className="flex flex-col gap-1 mr-6 mt-1">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-1"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                        </div>
                        <div className="flex flex-col gap-1 pr-4 border-r-2 border-border/50">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-1"></div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 md:pt-4 pt-2 border-t border-border">
                        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="h-10 w-full bg-red-200 dark:bg-red-900/30 rounded-lg animate-pulse"></div>
                    </div>
                </div>
            </aside>

            {/* Mobile Drawer Skeleton */}
            <div className={`fixed inset-0 z-[10000] min-[1113px]:hidden transition-all duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />

                <div
                    className={`absolute right-0 top-0 h-full w-[280px] bg-white dark:bg-card p-6 shadow-2xl transition-transform duration-300 transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}
                >
                    <div className="flex items-center justify-between md:mb-8 md:mb-5">
                        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                    </div>

                    <div className="flex flex-col md:gap-8 gap-3">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 px-2">
                                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                            </div>
                            <div className="flex flex-col gap-1 pr-4 border-r-2 border-border/50">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-1"></div>
                                ))}
                                
                                <div className="flex flex-col gap-1 mt-2">
                                    <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                                    <div className="flex flex-col gap-1 mr-6 mt-1">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-1"></div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1 mt-2">
                                    <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                                    <div className="flex flex-col gap-1 mr-6 mt-1">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-1"></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 px-2">
                                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                            </div>
                            <div className="flex flex-col gap-1 pr-4 border-r-2 border-border/50">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-1"></div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 md:pt-4 pt-2 border-t border-border">
                            <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="h-12 w-full bg-red-200 dark:bg-red-900/30 rounded-lg animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    if (loading) {
        return <SidebarSkeleton />;
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden !mt-[25px] min-[1123px]:block w-64 bg-white dark:bg-card rounded-2xl p-6 shadow-sm h-fit fixed top-24">
                <div className="flex flex-col md:gap-8 gap-3">
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
                                        className={`text-base py-2 px-4 rounded-lg transition-all duration-200 block
                                            ${isActive(link.href)
                                                ? "text-primary font-bold translate-x-[-4px] bg-[#579BE8]/25 border-r-2 border-[#579BE8]"
                                                : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-[-2px]"
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}

                                {/* Contracting Dropdown - Only in first section */}
                                {idx === 0 && (
                                    <div className="flex flex-col gap-1">
                                        <div className={`text-base py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2
                                            ${isContractingActive
                                                ? "text-primary font-bold"
                                                : "text-muted-foreground"
                                            }`}
                                        >
                                            <MdBusinessCenter className="w-5 h-5" />
                                            <span>التعاقدات</span>
                                        </div>

                                        <div className="flex flex-col gap-1 mr-6 mt-1">
                                            {contractingDropdownItems.map((item, itemIdx) => (
                                                <Link
                                                    key={itemIdx}
                                                    href={item.href}
                                                    className={`text-sm py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2
                                                        ${isActive(item.href)
                                                            ? "text-primary font-bold bg-[#579BE8]/25 border-r-2 border-[#579BE8] translate-x-[-4px]"
                                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-[-2px]"
                                                        }`}
                                                >
                                                    {item.icon}
                                                    <span>{item.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Wallet Dropdown - Only in first section */}
                                {idx === 0 && (
                                    <div className="flex flex-col gap-1">
                                        <div className={`text-base py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2
                                            ${isWalletActive
                                                ? "text-primary font-bold"
                                                : "text-muted-foreground"
                                            }`}
                                        >
                                            <IoWalletOutline className="w-5 h-5" />
                                            <span>محفظتك</span>
                                        </div>

                                        <div className="flex flex-col gap-1 mr-6 mt-1">
                                            {walletDropdownItems.map((item, itemIdx) => (
                                                <Link
                                                    key={itemIdx}
                                                    href={item.href}
                                                    className={`text-sm py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2
                                                        ${isActive(item.href)
                                                            ? "text-primary font-bold bg-[#579BE8]/25 border-r-2 border-[#579BE8] translate-x-[-4px]"
                                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-[-2px]"
                                                        }`}
                                                >
                                                    {item.icon}
                                                    <span>{item.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="flex flex-col gap-4 md:pt-4 pt-2 border-t border-border">
                        <div
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-destructive rounded-lg hover:translate-x-[-2px] cursor-pointer transition-all duration-200 font-bold px-2 py-2 hover:bg-destructive/10 hover:text-destructive"
                        >
                            <FiLogOut className="w-5 h-5" />
                            <h2 className="text-lg">تسجيل خروج</h2>
                        </div>
                    </div>

                    {/* Delete Account Button */}
                    {/* <div className="flex flex-col gap-4">
                        <div
                            onClick={handleDeleteAccount}
                            className="flex items-center gap-2 text-red-600 dark:text-red-400 rounded-lg hover:translate-x-[-2px] cursor-pointer transition-all duration-200 font-bold px-2 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-900/50"
                        >
                            <FaTrashAlt className="w-5 h-5" />
                            <h2 className="text-lg">حذف الحساب</h2>
                        </div>
                    </div> */}
                </div>
            </aside>

            {/* Mobile Drawer */}
            <div className={`fixed inset-0 z-[10000] min-[1113px]:hidden transition-all duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />

                <div
                    className={`absolute right-0 top-0 h-full w-[280px] bg-white dark:bg-card p-6 shadow-2xl transition-transform duration-300 transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}
                >
                    <div className="flex items-center justify-between md:mb-8 md:mb-5">
                        <h2 className="text-xl font-bold">القائمة</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-secondary rounded-xl transition-colors"
                        >
                            <HiX className="w-6 h-6 text-muted-foreground" />
                        </button>
                    </div>

                    <div className="flex flex-col md:gap-8 gap-3">
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
                                                    ? "text-primary font-bold bg-[#579BE8]/25 border-r-2 border-[#579BE8] translate-x-[-4px]"
                                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                                }`}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}

                                    {/* Contracting Dropdown - Only in first section */}
                                    {idx === 0 && (
                                        <div className="flex flex-col gap-1">
                                            <div className={`text-base py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center gap-2
                                                ${isContractingActive
                                                    ? "text-primary font-bold"
                                                    : "text-muted-foreground"
                                                }`}
                                            >
                                                <MdBusinessCenter className="w-5 h-5" />
                                                <span>التعاقدات</span>
                                            </div>

                                            <div className="flex flex-col gap-1 mr-6 mt-1">
                                                {contractingDropdownItems.map((item, itemIdx) => (
                                                    <Link
                                                        key={itemIdx}
                                                        href={item.href}
                                                        onClick={() => setIsOpen(false)}
                                                        className={`text-sm py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2
                                                            ${isActive(item.href)
                                                                ? "text-primary font-bold bg-[#579BE8]/25 border-r-2 border-[#579BE8] translate-x-[-4px]"
                                                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                                            }`}
                                                    >
                                                        {item.icon}
                                                        <span>{item.name}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Wallet Dropdown - Only in first section */}
                                    {idx === 0 && (
                                        <div className="flex flex-col gap-1">
                                            <div className={`text-base py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center gap-2
                                                ${isWalletActive
                                                    ? "text-primary font-bold"
                                                    : "text-muted-foreground"
                                                }`}
                                            >
                                                <IoWalletOutline className="w-5 h-5" />
                                                <span>محفظتك</span>
                                            </div>

                                            <div className="flex flex-col gap-1 mr-6 mt-1">
                                                {walletDropdownItems.map((item, itemIdx) => (
                                                    <Link
                                                        key={itemIdx}
                                                        href={item.href}
                                                        onClick={() => setIsOpen(false)}
                                                        className={`text-sm py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2
                                                            ${isActive(item.href)
                                                                ? "text-primary font-bold bg-[#579BE8]/25 border-r-2 border-[#579BE8] translate-x-[-4px]"
                                                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                                            }`}
                                                    >
                                                        {item.icon}
                                                        <span>{item.name}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="flex flex-col gap-4 md:md:pt-4 pt-2 border-t border-border">
                            <div
                                onClick={() => { setIsOpen(false); handleLogout(); }}
                                className="flex items-center gap-2 text-destructive rounded-lg font-bold px-2 py-3 hover:bg-destructive/10"
                            >
                                <FiLogOut className="w-5 h-5" />
                                <h2 className="text-lg">تسجيل خروج</h2>
                            </div>
                        </div>

                        {/* Delete Account Button - Mobile */}
                        <div className="flex flex-col gap-4">
                            <div
                                onClick={() => { setIsOpen(false); handleDeleteAccount(); }}
                                className="flex items-center gap-2 text-red-600 dark:text-red-400 rounded-lg font-bold px-2 py-3 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/50"
                            >
                                <FaTrashAlt className="w-5 h-5" />
                                <h2 className="text-lg">حذف الحساب</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}