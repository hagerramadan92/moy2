"use client";

import { FaFileContract, FaUserCheck, FaHandshake, FaGavel, FaExclamationTriangle, FaCheckCircle, FaBan, FaBalanceScale } from "react-icons/fa";
import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa";

export default function TermsPage() {
    const sections = [
        {
            id: "introduction",
            title: "مقدمة",
            icon: <FaFileContract className="w-6 h-6" />,
            content: [
                "مرحباً بك في منصة خدماتنا. توضح شروط الاستخدام هذه القواعد واللوائح لاستخدام خدماتنا.",
                "باستخدام خدماتنا، فإنك تقر بأنك قد قرأت وفهمت وتوافق على الالتزام بجميع الشروط والأحكام الواردة في هذه الوثيقة."
            ]
        },
        {
            id: "acceptance",
            title: "القبول بالشروط",
            icon: <FaUserCheck className="w-6 h-6" />,
            content: [
                "باستخدام خدماتنا، فإنك تقبل وتوافق على الالتزام بشروط الاستخدام هذه. إذا كنت لا توافق على أي جزء من هذه الشروط، فيجب عليك عدم استخدام خدماتنا.",
                "نحتفظ بالحق في تحديث أو تعديل هذه الشروط في أي وقت دون إشعار مسبق."
            ]
        },
        {
            id: "eligibility",
            title: "الأهلية",
            icon: <FaCheckCircle className="w-6 h-6" />,
            content: [
                "للاستخدام خدماتنا، يجب أن تكون:",
                "• بالغاً قانونياً (18 عاماً أو أكثر)",
                "• لديك القدرة القانونية على إبرام عقود ملزمة",
                "• لا تكون محظوراً من استخدام خدماتنا بموجب القانون المعمول به",
                "• تقدم معلومات دقيقة وصحيحة عند التسجيل"
            ]
        },
        {
            id: "user-account",
            title: "حساب المستخدم",
            icon: <FaUserCheck className="w-6 h-6" />,
            content: [
                "أنت مسؤول عن:",
                "• الحفاظ على سرية معلومات حسابك وكلمة المرور",
                "• جميع الأنشطة التي تحدث تحت حسابك",
                "• إخطارنا فوراً بأي استخدام غير مصرح به لحسابك",
                "• التأكد من أن جميع المعلومات المقدمة دقيقة ومحدثة"
            ]
        },
        {
            id: "acceptable-use",
            title: "الاستخدام المقبول",
            icon: <FaHandshake className="w-6 h-6" />,
            content: [
                "يجب عليك استخدام خدماتنا فقط للأغراض القانونية وبطريقة لا تنتهك حقوق الآخرين. لا يجوز لك:",
                "• استخدام الخدمة لأي غرض غير قانوني أو غير مصرح به",
                "• محاولة الوصول غير المصرح به إلى النظام أو البيانات",
                "• إرسال أو نشر محتوى ضار أو خبيث",
                "• انتهاك أي قوانين أو لوائح محلية أو دولية",
                "• التلاعب أو التدخل في عمل الخدمة"
            ]
        },
        {
            id: "prohibited-activities",
            title: "الأنشطة المحظورة",
            icon: <FaBan className="w-6 h-6" />,
            content: [
                "يحظر عليك صراحة:",
                "• استخدام الخدمة لإيذاء أو مضايقة أو تهديد أي شخص",
                "• نشر محتوى مسيء أو غير لائق أو غير قانوني",
                "• انتهاك حقوق الملكية الفكرية للآخرين",
                "• جمع أو تخزين معلومات شخصية عن المستخدمين الآخرين",
                "• استخدام الخدمة لأغراض احتيالية أو خادعة"
            ]
        },
        {
            id: "payment-terms",
            title: "شروط الدفع",
            icon: <FaBalanceScale className="w-6 h-6" />,
            content: [
                "عند استخدام خدمات مدفوعة:",
                "• جميع الأسعار معروضة بالعملة المحلية وتشمل الضرائب المطبقة",
                "• يجب عليك دفع جميع الرسوم المستحقة في الوقت المحدد",
                "• نحتفظ بالحق في تغيير الأسعار مع إشعار مسبق",
                "• المدفوعات غير قابلة للاسترداد إلا كما هو منصوص عليه في سياسة الاسترجاع",
                "• أنت مسؤول عن جميع الرسوم المرتبطة بحسابك"
            ]
        },
        {
            id: "intellectual-property",
            title: "الملكية الفكرية",
            icon: <FaGavel className="w-6 h-6" />,
            content: [
                "جميع المحتويات والمواد المتاحة على خدماتنا، بما في ذلك النصوص والرسومات والشعارات والصور، محمية بحقوق الطبع والنشر والملكية الفكرية.",
                "لا يجوز لك نسخ أو توزيع أو تعديل أو إنشاء أعمال مشتقة من محتوى خدماتنا دون إذن كتابي منا."
            ]
        },
        {
            id: "limitation-liability",
            title: "تحديد المسؤولية",
            icon: <FaExclamationTriangle className="w-6 h-6" />,
            content: [
                "في أقصى حد يسمح به القانون:",
                "• لا نتحمل أي مسؤولية عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام خدماتنا",
                "• نقدم الخدمة 'كما هي' دون أي ضمانات صريحة أو ضمنية",
                "• لا نضمن أن الخدمة ستكون متاحة بشكل مستمر أو خالية من الأخطاء",
                "• أنت تستخدم الخدمة على مسؤوليتك الخاصة"
            ]
        },
        {
            id: "termination",
            title: "إنهاء الخدمة",
            icon: <FaBan className="w-6 h-6" />,
            content: [
                "نحتفظ بالحق في:",
                "• تعليق أو إنهاء وصولك إلى الخدمة في أي وقت دون إشعار مسبق",
                "• حذف حسابك ومحتواك إذا انتهكت شروط الاستخدام",
                "• رفض الخدمة لأي شخص في أي وقت لأي سبب",
                "• تعديل أو إيقاف الخدمة مؤقتاً أو نهائياً"
            ]
        },
        {
            id: "changes",
            title: "تعديلات على الشروط",
            icon: <FaFileContract className="w-6 h-6" />,
            content: [
                "نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعارك بأي تغييرات جوهرية عن طريق نشر الشروط المحدثة على هذه الصفحة.",
                "استمرار استخدامك للخدمة بعد التعديلات يعني موافقتك على الشروط الجديدة."
            ]
        },
        {
            id: "governing-law",
            title: "القانون الحاكم",
            icon: <FaGavel className="w-6 h-6" />,
            content: [
                "تخضع هذه الشروط وتفسر وفقاً لقوانين المملكة العربية السعودية.",
                "أي نزاع ينشأ عن أو يتعلق بهذه الشروط سيخضع للولاية القضائية الحصرية للمحاكم في المملكة العربية السعودية."
            ]
        },
        {
            id: "contact",
            title: "اتصل بنا",
            icon: <FaHandshake className="w-6 h-6" />,
            content: [
                "إذا كان لديك أي أسئلة حول شروط الاستخدام هذه، يرجى الاتصال بنا:",
                "• البريد الإلكتروني: terms@example.com",
                "• الهاتف: +966 XX XXX XXXX",
                "• العنوان: المملكة العربية السعودية"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] rounded-2xl p-8 sm:p-12 text-center text-white shadow-2xl mb-8">
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                        <FaFileContract size={160} />
                    </div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10 space-y-4">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
                            شروط الاستخدام
                        </h1>
                        <p className="text-white/90 max-w-2xl mx-auto text-base sm:text-lg">
                            يرجى قراءة شروط الاستخدام بعناية قبل استخدام خدماتنا
                        </p>
                        <p className="text-white/70 text-sm">
                            آخر تحديث: {new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mb-6">
                    <Link 
                        href="/myProfile"
                        className="inline-flex items-center gap-2 text-[#579BE8] hover:text-[#315782] font-bold transition-colors"
                    >
                        <FaChevronLeft className="text-sm" />
                        العودة إلى الملف الشخصي
                    </Link>
                </div>

                {/* Content Sections */}
                <div className="space-y-6">
                    {sections.map((section, index) => (
                        <div
                            key={section.id}
                            className="bg-white dark:bg-card rounded-2xl border border-border/50 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="bg-[#579BE8]/10 p-3 rounded-xl text-[#579BE8] flex-shrink-0">
                                    {section.icon}
                                </div>
                                <h2 className="text-2xl font-black text-foreground flex-1">
                                    {section.title}
                                </h2>
                            </div>
                            <div className="space-y-3 text-muted-foreground leading-relaxed pr-4">
                                {section.content.map((paragraph, pIndex) => (
                                    <p key={pIndex} className="text-base">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Note */}
                <div className="mt-8 p-6 bg-[#579BE8]/10 rounded-2xl border border-[#579BE8]/20">
                    <p className="text-center text-muted-foreground text-sm">
                        باستخدام خدماتنا، فإنك تقر بأنك قد قرأت وفهمت شروط الاستخدام هذه وموافقتك على جميع الشروط والأحكام الواردة فيها.
                    </p>
                </div>
            </div>
        </div>
    );
}

