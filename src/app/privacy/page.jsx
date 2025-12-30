"use client";

import { FaShieldAlt, FaLock, FaUserShield, FaEye, FaDatabase, FaCookie } from "react-icons/fa";
import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa";

export default function PrivacyPage() {
    const sections = [
        {
            id: "introduction",
            title: "مقدمة",
            icon: <FaShieldAlt className="w-6 h-6" />,
            content: [
                "نحن ملتزمون بحماية خصوصيتك. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدام خدماتنا.",
                "باستخدام خدماتنا، فإنك توافق على جمع واستخدام المعلومات وفقاً لهذه السياسة."
            ]
        },
        {
            id: "data-collection",
            title: "جمع المعلومات",
            icon: <FaDatabase className="w-6 h-6" />,
            content: [
                "نجمع المعلومات التي تقدمها لنا مباشرة عند التسجيل أو استخدام خدماتنا، بما في ذلك:",
                "• الاسم الكامل وبيانات الاتصال",
                "• معلومات الموقع الجغرافي",
                "• معلومات الدفع والمعاملات",
                "• أي معلومات أخرى تختار مشاركتها معنا"
            ]
        },
        {
            id: "data-usage",
            title: "استخدام المعلومات",
            icon: <FaEye className="w-6 h-6" />,
            content: [
                "نستخدم المعلومات التي نجمعها لـ:",
                "• تقديم وتحسين خدماتنا",
                "• معالجة الطلبات والمعاملات",
                "• التواصل معك بشأن خدماتنا",
                "• توفير الدعم الفني",
                "• تحسين تجربة المستخدم",
                "• الامتثال للالتزامات القانونية"
            ]
        },
        {
            id: "data-protection",
            title: "حماية المعلومات",
            icon: <FaLock className="w-6 h-6" />,
            content: [
                "نحن نستخدم تدابير أمنية تقنية وإدارية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الكشف أو التدمير.",
                "ومع ذلك، لا يمكن ضمان الأمان المطلق لأي معلومات يتم إرسالها عبر الإنترنت."
            ]
        },
        {
            id: "data-sharing",
            title: "مشاركة المعلومات",
            icon: <FaUserShield className="w-6 h-6" />,
            content: [
                "لا نبيع معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط في الحالات التالية:",
                "• مع مقدمي الخدمات الذين يساعدوننا في تشغيل خدماتنا",
                "• عند الالتزام القانوني أو عند الحماية من الأذى",
                "• مع موافقتك الصريحة"
            ]
        },
        {
            id: "cookies",
            title: "ملفات تعريف الارتباط",
            icon: <FaCookie className="w-6 h-6" />,
            content: [
                "نستخدم ملفات تعريف الارتباط لتذكر تفضيلاتك وتحسين تجربتك. يمكنك إدارة ملفات تعريف الارتباط من خلال إعدادات المتصفح.",
                "تعطيل ملفات تعريف الارتباط قد يؤثر على وظائف معينة في خدماتنا."
            ]
        },
        {
            id: "user-rights",
            title: "حقوقك",
            icon: <FaShieldAlt className="w-6 h-6" />,
            content: [
                "لديك الحق في:",
                "• الوصول إلى معلوماتك الشخصية",
                "• تصحيح المعلومات غير الدقيقة",
                "• طلب حذف معلوماتك",
                "• الاعتراض على معالجة معلوماتك",
                "• نقل بياناتك",
                "• سحب الموافقة في أي وقت"
            ]
        },
        {
            id: "changes",
            title: "تغييرات على السياسة",
            icon: <FaShieldAlt className="w-6 h-6" />,
            content: [
                "قد نحدث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإشعارك بأي تغييرات جوهرية عن طريق نشر السياسة الجديدة على هذه الصفحة.",
                "ننصحك بمراجعة هذه الصفحة بشكل دوري للاطلاع على أي تحديثات."
            ]
        },
        {
            id: "contact",
            title: "اتصل بنا",
            icon: <FaShieldAlt className="w-6 h-6" />,
            content: [
                "إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا:",
                "• البريد الإلكتروني: privacy@example.com",
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
                        <FaShieldAlt size={160} />
                    </div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10 space-y-4">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
                            سياسة الخصوصية
                        </h1>
                        <p className="text-white/90 max-w-2xl mx-auto text-base sm:text-lg">
                            نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية
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
                        باستخدام خدماتنا، فإنك تقر بأنك قد قرأت وفهمت سياسة الخصوصية هذه وموافقتك على جميع الشروط الواردة فيها.
                    </p>
                </div>
            </div>
        </div>
    );
}

