// app/myProfile/wallet/transaction/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FaArrowLeft, FaArrowUp, FaArrowDown, FaCopy } from "react-icons/fa";
import Image from "next/image";
import Swal from "sweetalert2";

export default function TransactionDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // محاولة الحصول على البيانات من query params
        const dataParam = searchParams.get('data');
        if (dataParam) {
            try {
                const transactionData = JSON.parse(dataParam);
                setTransaction(transactionData);
                setLoading(false);
            } catch (error) {
                console.error("Error parsing transaction data:", error);
                // إذا فشل البارس، حاول الجلب من API
                fetchTransactionDetails();
            }
        } else {
            // إذا لم توجد بيانات، حاول الجلب من API
            fetchTransactionDetails();
        }
    }, [params.id, searchParams]);

    const fetchTransactionDetails = async () => {
        setLoading(true);
        try {
            // هذا في حالة عدم وجود بيانات مُمررة
            // يمكنك إما:
            // 1. استخدام localStorage/sessionStorage
            // 2. أو إعادة توجيه المستخدم لصفحة المعاملات
            Swal.fire({
                title: "تنبيه",
                text: "الرجاء العودة لصفحة المعاملات والمحاولة مرة أخرى",
                icon: "warning",
                confirmButtonColor: "#579BE8",
            }).then(() => {
                router.push('/myProfile/wallet/payment-history');
            });
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        Swal.fire({
            title: "تم النسخ",
            text: "تم نسخ النص إلى الحافظة",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "غير محدد";
        return new Date(dateString).toLocaleString('ar-EG', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTransactionType = (transaction) => {
        const type = transaction.type?.toLowerCase() || '';
        if (type.includes('deposit')) return 'deposit';
        if (type.includes('withdrawal') || type.includes('spend')) return 'withdrawal';
        return 'other';
    };

    const getTransactionTypeText = (transaction) => {
        const type = transaction.type || '';
        if (type.includes('deposit_pending')) return 'إيداع معلق';
        if (type.includes('deposit')) return 'إيداع';
        if (type.includes('withdrawal')) return 'سحب';
        return transaction.description || 'معاملة';
    };

    const getStatusColor = (status) => {
        const colors = {
            'completed': 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400',
            'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400',
            'failed': 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400',
            'cancelled': 'bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400',
            'expired': 'bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-400',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
        const statusMap = {
            'completed': 'مكتملة',
            'pending': 'قيد الانتظار',
            'failed': 'فشلت',
            'cancelled': 'ملغاة',
            'expired': 'منتهية'
        };
        return statusMap[status] || status;
    };

    const getPaymentMethod = (transaction) => {
        const method = transaction.metadata?.payment_method || transaction.payment_method;
        const methodsMap = {
            'paymob': 'بطاقة بنكية',
            'tabby': 'تابي',
            'tamara': 'تمارا',
            'credit_card': 'بطاقة ائتمان',
            'mada': 'مدى',
            'apple_pay': 'Apple Pay',
            'stc_pay': 'STC Pay',
            'wallet': 'المحفظة'
        };
        return methodsMap[method] || method || 'غير محدد';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#579BE8]"></div>
            </div>
        );
    }

    if (!transaction) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">المعاملة غير موجودة</h2>
                    <button
                        onClick={() => router.push('/myProfile/wallet/payment-history')}
                        className="px-6 py-3 bg-[#579BE8] text-white rounded-xl hover:bg-[#4a8ad0] transition-colors"
                    >
                        العودة لسجل المعاملات
                    </button>
                </div>
            </div>
        );
    }

    const type = getTransactionType(transaction);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* زر العودة */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#579BE8] mb-6 transition-colors"
                >
                    <FaArrowLeft />
                    <span>العودة</span>
                </button>

                {/* بطاقة التفاصيل */}
                <div className="bg-white dark:bg-card rounded-3xl shadow-xl overflow-hidden">
                    {/* الهيدر */}
                    <div className="bg-gradient-to-l from-[#579BE8] to-[#315782] p-8 text-white">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                                {type === 'deposit' ? (
                                    <FaArrowDown size={24} />
                                ) : (
                                    <FaArrowUp size={24} />
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{getTransactionTypeText(transaction)}</h1>
                                <p className="text-white/80 mt-1">رقم المرجع: #{transaction.reference || transaction.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-4 py-2 rounded-xl text-sm font-bold ${getStatusColor(transaction.status)}`}>
                                {getStatusText(transaction.status)}
                            </span>
                            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-sm">
                                {formatDate(transaction.created_at)}
                            </span>
                        </div>
                    </div>

                    {/* المحتوى */}
                    <div className="p-8">
                        {/* المبلغ */}
                        <div className="text-center mb-8">
                            <p className="text-gray-500 dark:text-gray-400 mb-2">المبلغ</p>
                            <div className="flex items-center justify-center gap-2">
                                <span className={`text-5xl font-black ${type === 'deposit' ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                                    {type === 'deposit' ? '+' : '-'}{parseFloat(transaction.amount || 0).toFixed(2)}
                                </span>
                                <Image src="/images/RS.png" alt="ريال" width={32} height={32} className="opacity-70" />
                            </div>
                        </div>

                        {/* شبكة المعلومات */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* الرصيد قبل */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">الرصيد قبل</p>
                                <p className="text-xl font-bold flex items-center gap-1">
                                    {parseFloat(transaction.balance_before || 0).toFixed(2)}
                                    <Image src="/images/RS.png" alt="ريال" width={16} height={16} className="opacity-70" />
                                </p>
                            </div>

                            {/* الرصيد بعد */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">الرصيد بعد</p>
                                <p className="text-xl font-bold flex items-center gap-1">
                                    {parseFloat(transaction.balance_after || 0).toFixed(2)}
                                    <Image src="/images/RS.png" alt="ريال" width={16} height={16} className="opacity-70" />
                                </p>
                            </div>

                            {/* طريقة الدفع */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">طريقة الدفع</p>
                                <p className="font-bold">{getPaymentMethod(transaction)}</p>
                            </div>

                            {/* تاريخ الإنشاء */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">تاريخ الإنشاء</p>
                                <p className="font-bold">{formatDate(transaction.created_at)}</p>
                            </div>

                            {/* تاريخ المعالجة */}
                            {transaction.processed_at && (
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">تاريخ المعالجة</p>
                                    <p className="font-bold">{formatDate(transaction.processed_at)}</p>
                                </div>
                            )}

                            {/* تاريخ الانتهاء */}
                            {transaction.expires_at && (
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">تاريخ الانتهاء</p>
                                    <p className="font-bold">{formatDate(transaction.expires_at)}</p>
                                </div>
                            )}

                            {/* الوصف */}
                            {transaction.description && (
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl md:col-span-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">الوصف</p>
                                    <p className="font-bold">{transaction.description}</p>
                                </div>
                            )}

                            {/* معرف المعاملة */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl md:col-span-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">معرف المعاملة</p>
                                <div className="flex items-center justify-between">
                                    <code className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded-lg font-mono">
                                        {transaction.id}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(transaction.id)}
                                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <FaCopy className="text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            {/* معرف المعاملة في بوابة الدفع */}
                            {transaction.payment_transaction_id && (
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl md:col-span-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">معرف المعاملة في بوابة الدفع</p>
                                    <div className="flex items-center justify-between">
                                        <code className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded-lg font-mono">
                                            {transaction.payment_transaction_id}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(transaction.payment_transaction_id)}
                                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <FaCopy className="text-gray-500" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* بيانات إضافية من metadata */}
                            {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl md:col-span-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">بيانات إضافية</p>
                                    <pre className="text-xs bg-gray-200 dark:bg-gray-700 p-3 rounded-lg overflow-auto max-h-60">
                                        {JSON.stringify(transaction.metadata, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>

                        {/* أزرار الإجراءات */}
                        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => window.print()}
                                className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-bold transition-colors"
                            >
                                طباعة
                            </button>
                            <button
                                onClick={() => router.push('/myProfile/wallet/payment-history')}
                                className="flex-1 py-3 px-4 bg-[#579BE8] text-white hover:bg-[#4a8ad0] rounded-xl font-bold transition-colors"
                            >
                                العودة لسجل المعاملات
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}