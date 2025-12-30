"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ContractingPage from '../myProfile/contracting/page';
import ContractHistoryPage from '../myProfile/contracting/history/page';
import {
    FaFileContract, FaHistory, FaBars, FaTimes
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContractsPage() {
    const router = useRouter();
    const [activeView, setActiveView] = useState('contracting');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    const navItems = [
        {
            id: 'contracting',
            label: 'طلب تعاقد جديد',
            icon: FaFileContract,
            description: 'إنشاء عقد جديد'
        },
        {
            id: 'history',
            label: 'سجل التعاقدات',
            icon: FaHistory,
            description: 'عرض جميع العقود'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary/20 via-background to-secondary/10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Mobile Header */}
                <div className="lg:hidden bg-white dark:bg-card border-b-2 border-border/60 shadow-md sticky top-0 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between p-4">
                        <h1 className="text-xl font-black text-foreground">التعاقدات</h1>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all"
                        >
                            {sidebarOpen ? (
                                <FaTimes className="w-5 h-5 text-foreground" />
                            ) : (
                                <FaBars className="w-5 h-5 text-foreground" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-0 lg:gap-4 py-3 md:py-4 lg:py-4 relative">
                {/* Sidebar Navigation */}
                <motion.aside
                    initial={false}
                    animate={{
                        x: sidebarOpen || isDesktop ? 0 : '100%'
                    }}
                    className={`
                        fixed lg:sticky
                        top-0 lg:top-4
                        right-0 lg:right-auto
                        h-screen lg:h-[calc(100vh-2rem)]
                        w-72 sm:w-80 lg:w-64
                        bg-white dark:bg-card
                        border-l-2 lg:border-2
                        border-border/60
                        rounded-none lg:rounded-xl
                        shadow-2xl lg:shadow-xl
                        z-50 lg:z-10
                        p-3 sm:p-4 md:p-5
                        flex flex-col
                        overflow-y-auto overflow-x-hidden
                        flex-shrink-0
                        ${sidebarOpen || isDesktop ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                        transition-transform duration-300 ease-in-out
                    `}
                >
                    {/* Sidebar Header */}
                    <div className="mb-3 md:mb-4 pb-3 md:pb-4 border-b-2 border-border/60 flex-shrink-0">
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                            <h2 className="text-lg md:text-xl font-black text-foreground">التعاقدات</h2>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden p-1.5 rounded-lg hover:bg-secondary/50 transition-all"
                            >
                                <FaTimes className="w-4 h-4 text-foreground" />
                            </button>
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground font-medium">
                            إدارة عقودك بسهولة
                        </p>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden min-h-0">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeView === item.id;
                            
                            return (
                                <motion.button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveView(item.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`
                                        w-full
                                        flex items-center gap-2 md:gap-3
                                        p-2.5 md:p-3 rounded-lg md:rounded-xl
                                        text-right
                                        transition-all duration-200
                                        relative
                                        group
                                        ${isActive
                                            ? 'bg-gradient-to-l from-[#579BE8] to-[#124987] text-white shadow-lg shadow-[#579BE8]/30'
                                            : 'bg-secondary/30 hover:bg-secondary/50 text-foreground'
                                        }
                                    `}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNavItem"
                                            className="absolute inset-0 bg-gradient-to-l from-[#579BE8] to-[#124987] rounded-xl"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <div className={`
                                        relative z-10
                                        w-9 h-9 md:w-10 md:h-10
                                        rounded-lg md:rounded-xl
                                        flex items-center justify-center
                                        flex-shrink-0
                                        ${isActive
                                            ? 'bg-white/20 backdrop-blur-sm'
                                            : 'bg-[#579BE8]/10 group-hover:bg-[#579BE8]/20'
                                        }
                                        transition-all
                                    `}>
                                        <Icon className={`
                                            w-4 h-4 md:w-5 md:h-5
                                            ${isActive ? 'text-white' : 'text-[#579BE8]'}
                                        `} />
                                    </div>
                                    <div className="relative z-10 flex-1 text-right min-w-0">
                                        <p className={`
                                            font-bold text-xs md:text-sm mb-0.5
                                            ${isActive ? 'text-white' : 'text-foreground'}
                                        `}>
                                            {item.label}
                                        </p>
                                        <p className={`
                                            text-[9px] md:text-[10px]
                                            ${isActive ? 'text-white/80' : 'text-muted-foreground'}
                                        `}>
                                            {item.description}
                                        </p>
                                    </div>
                                    {isActive && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="relative z-10 w-2 h-2 rounded-full bg-white flex-shrink-0"
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t-2 border-border/60 flex-shrink-0">
                        <div className="bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/10 rounded-lg md:rounded-xl p-2 md:p-3 border border-[#579BE8]/20">
                            <p className="text-[9px] md:text-[10px] text-muted-foreground font-medium text-center leading-tight">
                                💡 نصيحة: يمكنك إنشاء عقد جديد أو مراجعة سجل التعاقدات
                            </p>
                        </div>
                    </div>
                </motion.aside>

                {/* Mobile Overlay */}
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 min-w-0 p-2 sm:p-3 md:p-4 lg:p-0 overflow-y-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeView}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeView === 'contracting' ? (
                                <ContractingPage />
                            ) : (
                                <ContractHistoryPage />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
                </div>
            </div>
        </div>
    );
}
