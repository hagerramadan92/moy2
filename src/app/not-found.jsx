
"use client"

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BiHomeAlt, BiArrowBack, BiWater, BiSearchAlt } from 'react-icons/bi';

export default function NotFound() {
    return (
        <div className="relative min-h-screen bg-neutral-50 dark:bg-[#0A0C10] flex flex-col items-center justify-start pt-16 md:pt-24 lg:pt-32 p-6 overflow-hidden font-[Arabic]">
            
            {/* 1. Immersive Animated Background */}
            <div className="absolute inset-0 z-0">
                {/* Abstract Gradient Glows */}
                <motion.div 
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-[#579BE8]/10 rounded-full blur-[120px]"
                />
                <motion.div 
                    animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-[#579BE8]/5 rounded-full blur-[150px]"
                />
                
                {/* Fluid Wave Animation (SVG) */}
                <div className="absolute bottom-0 left-0 w-full leading-[0] transform rotate-180 opacity-60 dark:opacity-40">
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[300px] md:h-[400px]">
                        <motion.path 
                            animate={{ x: [-20, 20, -20] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
                            fill="#579BE8" 
                            className="opacity-20" 
                        />
                    </svg>
                </div>
            </div>

            {/* 2. Main Visual Content */}
            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
                
                {/* Large 404 with Droplet Focus */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative mb-12 select-none group"
                >
                     {/* The Background 404 (with space for the droplet) */}
                     <span className="text-[140px] md:text-[240px] font-black leading-none bg-clip-text text-transparent bg-gradient-to-b from-[#579BE8] to-transparent opacity-10 tracking-tighter">4 4</span>
                     
                     {/* The Center Droplet (The '0') */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pt-8">
                        <motion.div 
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="relative"
                        >
                            <div className="w-24 h-24 md:w-40 md:h-40 bg-gradient-to-br from-[#579BE8] to-[#3a7bc8] rounded-full shadow-[0_0_50px_rgba(87,155,232,0.4)] flex items-center justify-center relative overflow-hidden">
                                <BiWater className="w-12 h-12 md:w-20 md:h-20 text-white" />
                                {/* Ripple effect */}
                                <motion.div 
                                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                    className="absolute inset-0 bg-white rounded-full"
                                />
                            </div>
                            {/* Inner Bubbles */}
                            <motion.div 
                                animate={{ y: [0, -20], opacity: [0, 1, 0] }}
                                transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                                className="absolute top-2 left-4 w-3 h-3 bg-white/20 rounded-full"
                            />
                            <motion.div 
                                animate={{ y: [0, -30], opacity: [0, 1, 0] }}
                                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                                className="absolute bottom-6 right-8 w-4 h-4 bg-white/10 rounded-full"
                            />
                        </motion.div>
                     </div>
                </motion.div>

                {/* Content Area */}
                <div className="text-center space-y-10 px-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/10 text-[10px] md:text-[12px] font-black uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            خطأ في المسار
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-tight">عفواً! الطلب غير موجود</h2>
                        <p className="text-sm md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                            يبدو أن هذه الصفحة قد تبخرت! نحن نعتذر عن هذا الخلل، دعنا نساعدك في العودة لطلب مياهك المفضلة.
                        </p>
                    </motion.div>

                    {/* Glassmorphic Navigation Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="w-full max-w-xl bg-white/30 dark:bg-card/30 backdrop-blur-xl rounded-[2.5rem] p-5 md:p-8 border border-white/40 dark:border-card/20 shadow-[0_30px_60px_rgba(0,0,0,0.05)]"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                            <Link 
                                href="/" 
                                className="group flex items-center justify-between px-6 py-4 bg-[#579BE8] text-white rounded-2xl shadow-xl shadow-[#579BE8]/20 hover:scale-[1.02] transition-all active:scale-95"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                        <BiHomeAlt className="w-4 h-4" />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm md:text-base font-black flex">الرئيسية</span>
                                        <p className="text-[9px] opacity-70 font-medium">متجر ستون</p>
                                    </div>
                                </div>
                                <BiArrowBack className="w-4 h-4 rotate-180 opacity-40" />
                            </Link>

                            <button 
                                onClick={() => window.history.back()}
                                className="group flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-neutral-900/80 text-foreground rounded-2xl border border-border/50 hover:border-[#579BE8]/20 transition-all active:scale-95"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                                        <BiArrowBack className="w-4 h-4" />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm md:text-base font-black flex">العودة</span>
                                        <p className="text-[9px] text-muted-foreground font-medium">للصفحة السابقة</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Search Quick Action */}
                        <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <BiSearchAlt className="w-5 h-5 text-muted-foreground" />
                                <span className="text-xs md:text-sm text-muted-foreground font-medium">هل تبحث عن شيء محدد؟</span>
                            </div>
                            <Link href="/contact" className="text-[11px] md:text-xs font-black text-[#579BE8] underline underline-offset-4 hover:text-[#3a7bc8] transition-colors">اتصل بنا للمساعدة</Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* 3. Floating Micro-elements */}
            <motion.div 
                animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute top-[20%] left-[10%] opacity-20 hidden lg:block"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#579BE8] to-white"></div>
            </motion.div>
            <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute bottom-[30%] right-[15%] hidden lg:block"
            >
                <div className="w-12 h-12 rounded-full border-2 border-[#579BE8]"></div>
            </motion.div>
        </div>
    );
}
