"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    FaArrowRight, FaChartLine, FaCalendarAlt, FaWater, FaTint, FaMoneyBillWave, FaChartBar, FaChartArea
} from 'react-icons/fa';
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

export default function ConsumptionPage() {
    const router = useRouter();
    const params = useParams();
    const contractId = params.id;
    const [chartType, setChartType] = useState('line'); // 'line', 'bar', 'area'
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const checkSize = () => {
            setIsMobile(window.innerWidth < 640);
            setIsTablet(window.innerWidth < 1024);
        };
        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    // Mock consumption data
    const consumptionData = [
        { month: "يناير", amount: 1200, cost: 360 },
        { month: "فبراير", amount: 1350, cost: 405 },
        { month: "مارس", amount: 1100, cost: 330 },
        { month: "أبريل", amount: 1400, cost: 420 },
        { month: "مايو", amount: 1500, cost: 450 },
        { month: "يونيو", amount: 1600, cost: 480 },
    ];

    const totalConsumption = consumptionData.reduce((sum, item) => sum + item.amount, 0);
    const totalCost = consumptionData.reduce((sum, item) => sum + item.cost, 0);
    const averageConsumption = Math.round(totalConsumption / consumptionData.length);
    const maxConsumption = Math.max(...consumptionData.map(item => item.amount));

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-card border-2 border-border/60 rounded-xl p-2 md:p-3 shadow-xl text-xs md:text-sm">
                    <p className="font-bold text-foreground mb-1 md:mb-2 text-xs md:text-sm">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-xs md:text-sm" style={{ color: entry.color }}>
                            {entry.name}: <span className="font-bold">{entry.value.toLocaleString()}</span>
                            {entry.dataKey === 'amount' ? ' لتر' : ' ريال'}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-5 md:space-y-6 fade-in-up">
            {/* Breadcrumb Navigation */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs md:text-sm mb-3 md:mb-4 flex-wrap"
            >
                <button 
                    onClick={() => router.push('/myProfile/contracting/history')}
                    className="text-muted-foreground hover:text-[#579BE8] transition-all font-medium px-3 py-1.5 rounded-lg hover:bg-[#579BE8]/5 hover:shadow-sm"
                >
                    سجل التعاقدات
                </button>
                <FaArrowRight className="w-3 h-3 text-muted-foreground rotate-180" />
                <button 
                    onClick={() => router.push(`/myProfile/contracting/details/${contractId}`)}
                    className="text-muted-foreground hover:text-[#579BE8] transition-all font-medium px-3 py-1.5 rounded-lg hover:bg-[#579BE8]/5 hover:shadow-sm"
                >
                    تفاصيل العقد
                </button>
                <FaArrowRight className="w-3 h-3 text-muted-foreground rotate-180" />
                <span className="font-bold text-foreground px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#579BE8]/10 to-[#124987]/10 text-[#579BE8] border border-[#579BE8]/20 text-xs md:text-sm">
                    الاستهلاك
                </span>
            </motion.div>

            {/* Enhanced Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] text-white rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-6 lg:p-8 shadow-2xl overflow-hidden relative group"
            >
                <div className="absolute top-0 right-0 opacity-[0.05] hidden md:block">
                    <FaChartLine size={200} className="rotate-12" />
                </div>
                <div className="absolute bottom-0 left-0 w-40 h-40 md:w-80 md:h-80 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-96 md:h-96 bg-white/5 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 md:gap-4 mb-2">
                        <motion.div 
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl bg-white/25 backdrop-blur-lg flex items-center justify-center shadow-2xl border-2 border-white/30 flex-shrink-0"
                        >
                            <FaChartLine className="w-5 h-5 md:w-7 md:h-7 lg:w-8 lg:h-8" />
                        </motion.div>
                        <div className="min-w-0">
                            <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black mb-1 drop-shadow-lg truncate">سجل الاستهلاك</h1>
                            <p className="text-xs md:text-sm lg:text-base opacity-90 font-medium">عقد #{contractId}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Enhanced Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-card border-2 border-border/60 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 shadow-lg hover:shadow-2xl transition-all group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-[#579BE8]/5 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-[#579BE8] to-[#124987] flex items-center justify-center shadow-lg flex-shrink-0">
                                <FaWater className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                            </div>
                            <p className="text-[10px] md:text-xs lg:text-sm text-muted-foreground font-bold uppercase tracking-wider">إجمالي الاستهلاك</p>
                        </div>
                        <p className="text-xl md:text-2xl lg:text-3xl font-black text-foreground mb-1">{totalConsumption.toLocaleString()}</p>
                        <p className="text-[10px] md:text-xs lg:text-sm text-muted-foreground font-medium">لتر</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-card border-2 border-border/60 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 shadow-lg hover:shadow-2xl transition-all group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-green-500/5 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg flex-shrink-0">
                                <FaMoneyBillWave className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                            </div>
                            <p className="text-[10px] md:text-xs lg:text-sm text-muted-foreground font-bold uppercase tracking-wider">إجمالي التكلفة</p>
                        </div>
                        <p className="text-xl md:text-2xl lg:text-3xl font-black text-foreground mb-1">{totalCost.toLocaleString()}</p>
                        <p className="text-[10px] md:text-xs lg:text-sm text-muted-foreground font-medium">ريال</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-card border-2 border-border/60 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 shadow-lg hover:shadow-2xl transition-all group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-blue-500/5 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg flex-shrink-0">
                                <FaTint className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                            </div>
                            <p className="text-[10px] md:text-xs lg:text-sm text-muted-foreground font-bold uppercase tracking-wider">متوسط الاستهلاك</p>
                        </div>
                        <p className="text-xl md:text-2xl lg:text-3xl font-black text-foreground mb-1">{averageConsumption.toLocaleString()}</p>
                        <p className="text-[10px] md:text-xs lg:text-sm text-muted-foreground font-medium">لتر/شهر</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-card border-2 border-border/60 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 shadow-lg hover:shadow-2xl transition-all group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-orange-500/5 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg flex-shrink-0">
                                <FaChartLine className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                            </div>
                            <p className="text-[10px] md:text-xs lg:text-sm text-muted-foreground font-bold uppercase tracking-wider">أعلى استهلاك</p>
                        </div>
                        <p className="text-xl md:text-2xl lg:text-3xl font-black text-foreground mb-1">{maxConsumption.toLocaleString()}</p>
                        <p className="text-[10px] md:text-xs lg:text-sm text-muted-foreground font-medium">لتر</p>
                    </div>
                </motion.div>
            </div>

            {/* Chart Type Selector */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-card border-2 border-border/60 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg"
            >
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button
                        onClick={() => setChartType('line')}
                        className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${
                            chartType === 'line'
                                ? 'bg-[#579BE8] text-white shadow-lg'
                                : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                        }`}
                    >
                        <FaChartLine className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>خطي</span>
                    </button>
                    <button
                        onClick={() => setChartType('bar')}
                        className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${
                            chartType === 'bar'
                                ? 'bg-[#579BE8] text-white shadow-lg'
                                : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                        }`}
                    >
                        <FaChartBar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>أعمدة</span>
                    </button>
                    <button
                        onClick={() => setChartType('area')}
                        className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${
                            chartType === 'area'
                                ? 'bg-[#579BE8] text-white shadow-lg'
                                : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                        }`}
                    >
                        <FaChartArea className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>منطقة</span>
                    </button>
                </div>
            </motion.div>

            {/* Main Chart Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-card border-2 border-border/60 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-6 lg:p-8 shadow-xl overflow-hidden"
            >
                <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-3 md:gap-4">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-black flex items-center gap-2 md:gap-3">
                        <FaCalendarAlt className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-[#579BE8] flex-shrink-0" />
                        <span>سجل الاستهلاك الشهري</span>
                    </h3>
                </div>

                <div className="w-full overflow-x-auto" style={{ direction: 'ltr' }}>
                    <ResponsiveContainer width="100%" height={isMobile ? 300 : isTablet ? 350 : 400} minHeight={300}>
                        {chartType === 'line' ? (
                            <LineChart data={consumptionData} margin={{ top: 5, right: isMobile ? 10 : 30, left: isMobile ? 10 : 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="month" 
                                    tick={{ fill: '#6b7280', fontSize: isMobile ? 10 : 12 }}
                                    style={{ direction: 'rtl' }}
                                />
                                <YAxis 
                                    tick={{ fill: '#6b7280', fontSize: isMobile ? 10 : 12 }}
                                    label={!isMobile ? { value: 'لتر', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 12 } : undefined}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    wrapperStyle={{ paddingTop: '20px', fontSize: isMobile ? '10px' : '12px' }}
                                    iconType="line"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="amount" 
                                    name="الاستهلاك (لتر)"
                                    stroke="#579BE8" 
                                    strokeWidth={isMobile ? 2 : 3}
                                    dot={{ fill: '#579BE8', r: isMobile ? 3 : 5 }}
                                    activeDot={{ r: isMobile ? 6 : 8 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="cost" 
                                    name="التكلفة (ريال)"
                                    stroke="#10b981" 
                                    strokeWidth={isMobile ? 2 : 3}
                                    dot={{ fill: '#10b981', r: isMobile ? 3 : 5 }}
                                    activeDot={{ r: isMobile ? 6 : 8 }}
                                />
                            </LineChart>
                        ) : chartType === 'bar' ? (
                            <BarChart data={consumptionData} margin={{ top: 5, right: isMobile ? 10 : 30, left: isMobile ? 10 : 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="month" 
                                    tick={{ fill: '#6b7280', fontSize: isMobile ? 10 : 12 }}
                                    style={{ direction: 'rtl' }}
                                />
                                <YAxis 
                                    tick={{ fill: '#6b7280', fontSize: isMobile ? 10 : 12 }}
                                    label={!isMobile ? { value: 'لتر / ريال', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 12 } : undefined}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    wrapperStyle={{ paddingTop: '20px', fontSize: isMobile ? '10px' : '12px' }}
                                />
                                <Bar 
                                    dataKey="amount" 
                                    name="الاستهلاك (لتر)"
                                    fill="#579BE8" 
                                    radius={[isMobile ? 4 : 8, isMobile ? 4 : 8, 0, 0]}
                                />
                                <Bar 
                                    dataKey="cost" 
                                    name="التكلفة (ريال)"
                                    fill="#10b981" 
                                    radius={[isMobile ? 4 : 8, isMobile ? 4 : 8, 0, 0]}
                                />
                            </BarChart>
                        ) : (
                            <AreaChart data={consumptionData} margin={{ top: 5, right: isMobile ? 10 : 30, left: isMobile ? 10 : 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#579BE8" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#579BE8" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="month" 
                                    tick={{ fill: '#6b7280', fontSize: isMobile ? 10 : 12 }}
                                    style={{ direction: 'rtl' }}
                                />
                                <YAxis 
                                    tick={{ fill: '#6b7280', fontSize: isMobile ? 10 : 12 }}
                                    label={!isMobile ? { value: 'لتر / ريال', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 12 } : undefined}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    wrapperStyle={{ paddingTop: '20px', fontSize: isMobile ? '10px' : '12px' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="amount" 
                                    name="الاستهلاك (لتر)"
                                    stroke="#579BE8" 
                                    fillOpacity={1}
                                    fill="url(#colorAmount)"
                                    strokeWidth={isMobile ? 1.5 : 2}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="cost" 
                                    name="التكلفة (ريال)"
                                    stroke="#10b981" 
                                    fillOpacity={1}
                                    fill="url(#colorCost)"
                                    strokeWidth={isMobile ? 1.5 : 2}
                                />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </motion.div>

         
        </div>
    );
}
