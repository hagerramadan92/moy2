"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FaArrowRight,
  FaChartLine,
  FaCalendarAlt,
  FaWater,
  FaBox,
  FaPercentage,
  FaSpinner,
  FaChartPie,
} from "react-icons/fa";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import axios from "axios";

export default function ConsumptionPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id;

  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contractData, setContractData] = useState(null);
  const [stats, setStats] = useState(null);

 
  const COLORS = ["#E5E7EB" ,"#579BE8", ]; 

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken");

        if (!token) {
          setError("يرجى تسجيل الدخول أولاً");
          return;
        }

        const response = await axios.get(
          `https://dashboard.waytmiah.com/api/v1/contracts/${contractId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          setContractData(response.data.data.contract);
          setStats(response.data.data.stats);
        } else {
          setError("فشل في تحميل بيانات العقد");
        }
      } catch (err) {
        console.error("Error fetching contract data:", err);

        if (err.response?.status === 401) {
          setError("انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى");
        } else if (err.response?.status === 404) {
          setError("العقد غير موجود");
        } else if (err.code === "ERR_NETWORK") {
          setError("تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت");
        } else {
          setError("حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى");
        }
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      fetchContractData();
    }
  }, [contractId]);

  // تجهيز بيانات الرسمة الدائرية
  const getPieData = () => {
    if (!stats || !contractData) return [];

    const used = stats.total_orders_used || 0;
    const remaining = contractData.remaining_orders || 0;

    return [
      { name: "المستهلك", value: used, color: COLORS[0] },
      { name: "المتبقي", value: remaining, color: COLORS[1] },
    ];
  };

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#579BE8] animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            جاري تحميل بيانات الاستهلاك...
          </p>
        </div>
      </div>
    );
  }

  // عرض حالة الخطأ
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaChartLine className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-sm md:text-lg font-bold text-red-600 dark:text-red-400 mb-2">
            خطأ في تحميل البيانات
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-bold"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const pieData = getPieData();
  const total = (stats?.total_orders_used || 0) + (contractData?.remaining_orders || 0);

  return (
    <div className="space-y-5 md:space-y-6 fade-in-up p-4 md:p-6">
      {/* Breadcrumb Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-xs md:text-sm mb-3 md:mb-4 flex-wrap"
      >
        <button
          onClick={() => router.push("/myProfile/contracting/history")}
          className="text-muted-foreground hover:text-[#579BE8] transition-all font-medium px-3 py-1.5 rounded-lg hover:bg-[#579BE8]/5"
        >
          سجل التعاقدات
        </button>
        <FaArrowRight className="w-3 h-3 text-muted-foreground rotate-180" />
        <button
          onClick={() =>
            router.push(`/myProfile/contracting/details/${contractId}`)
          }
          className="text-muted-foreground hover:text-[#579BE8] transition-all font-medium px-3 py-1.5 rounded-lg hover:bg-[#579BE8]/5"
        >
          تفاصيل العقد
        </button>
        <FaArrowRight className="w-3 h-3 text-muted-foreground rotate-180" />
        <span className="font-bold text-foreground px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#579BE8]/10 to-[#124987]/10 text-[#579BE8] border border-[#579BE8]/20">
          الاستهلاك
        </span>
      </motion.div>

      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] text-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-2xl"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/25 backdrop-blur-lg flex items-center justify-center border-2 border-white/30">
              <FaChartPie className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black mb-1">
                سجل الاستهلاك
              </h1>
              <p className="text-xs md:text-sm opacity-90">
                عقد #{contractId} - {contractData?.contract_number}
              </p>
            </div>
          </div>

          {/* حالة العقد */}
          <div className="mt-4 flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                contractData?.status === "active"
                  ? "bg-green-400/20 text-green-100"
                  : contractData?.status === "expired"
                  ? "bg-red-400/20 text-red-100"
                  : "bg-yellow-400/20 text-yellow-100"
              }`}
            >
              {contractData?.status === "active"
                ? "نشط"
                : contractData?.status === "expired"
                ? "منتهي"
                : "معلق"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main Content - Pie Chart and Stats */}
      {stats && contractData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart Section - الرسمة الدائرية */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-card border-2 border-border/60 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FaChartPie className="text-[#579BE8]" />
                <span>نسبة الاستهلاك</span>
              </h3>
              <span className="text-sm font-bold text-[#579BE8]">
                {total > 0
                  ? Math.round(((stats?.total_orders_used || 0) / total) * 100)
                  : 0}
                %
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              {/* الرسمة الدائرية */}
              <div className="w-48 h-48 md:w-56 md:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 45 : 50}
                      outerRadius={isMobile ? 70 : 80}
                      paddingAngle={2}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `${value.toLocaleString()} لتر`}
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* تفاصيل الاستهلاك جنب الرسمة */}
              <div className="space-y-3 w-full md:w-auto">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[0] }}></div>
                  <span className="text-sm text-muted-foreground">المستهلك:</span>
                  <span className="text-sm font-bold">
                    {stats?.total_orders_used?.toLocaleString() || 0} لتر
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[1] }}></div>
                  <span className="text-sm text-muted-foreground">المتبقي:</span>
                  <span className="text-sm font-bold">
                    {contractData?.remaining_orders?.toLocaleString() || 0} لتر
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-border/60">
                  <span className="text-sm text-muted-foreground">الإجمالي:</span>
                  <span className="text-sm font-bold text-[#579BE8]">
                    {total?.toLocaleString() || 0} لتر
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* الحد الأقصى للطلبات */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-card border-2 border-border/60 rounded-xl p-4 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#579BE8] to-[#124987] flex items-center justify-center">
                  <FaWater className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-muted-foreground font-bold">الحد الأقصى</p>
              </div>
              <p className="text-xl font-black text-foreground">
                {contractData?.total_orders_limit?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-muted-foreground">لتر</p>
            </motion.div>

            {/* الطلبات المتبقية */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-card border-2 border-border/60 rounded-xl p-4 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#579BE8] to-[#124987] flex items-center justify-center">
                  <FaBox className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-muted-foreground font-bold">المتبقي</p>
              </div>
              <p className="text-xl font-black text-foreground">
                {contractData?.remaining_orders?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-muted-foreground">لتر</p>
            </motion.div>

            {/* المستخدم من الحد */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-card border-2 border-border/60 rounded-xl p-4 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#579BE8] to-[#124987] flex items-center justify-center">
                  <FaPercentage className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-muted-foreground font-bold">المستخدم</p>
              </div>
              <p className="text-xl font-black text-foreground">
                {stats?.total_orders_used?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                من {contractData?.total_orders_limit || 0} لتر
              </p>
            </motion.div>

            {/* الأيام المتبقية */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-card border-2 border-border/60 rounded-xl p-4 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#579BE8] to-[#124987] flex items-center justify-center">
                  <FaCalendarAlt className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-muted-foreground font-bold">الأيام المتبقية</p>
              </div>
              <p className="text-xl font-black text-foreground">
                {stats?.days_remaining || 0}
              </p>
              <p className="text-xs text-muted-foreground">يوم</p>
            </motion.div>
          </div>
        </div>
      )}

      {/* Progress Bar - شريط التقدم (زي واي بالظبط) */}
      {stats && contractData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-card border-2 border-border/60 rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <FaChartLine className="text-[#579BE8]" />
              <span>نسبة التقدم</span>
            </h3>
            <span className="text-sm font-bold text-[#579BE8]">
              {contractData.total_orders_limit > 0
                ? Math.round(
                    (stats.total_orders_used / contractData.total_orders_limit) * 100
                  )
                : 0}
              %
            </span>
          </div>

          {/* شريط التقدم */}
          <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#579BE8] to-[#124987] rounded-full transition-all duration-500"
              style={{
                width: `${
                  contractData.total_orders_limit > 0
                    ? (stats.total_orders_used / contractData.total_orders_limit) * 100
                    : 0
                }%`,
              }}
            />
          </div>

          {/* تفاصيل إضافية */}
          <div className="flex justify-between items-center mt-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">المستخدم:</span>
              <span className="font-bold">
                {stats.total_orders_used?.toLocaleString() || 0} لتر
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">المتبقي:</span>
              <span className="font-bold">
                {contractData.remaining_orders?.toLocaleString() || 0} لتر
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}