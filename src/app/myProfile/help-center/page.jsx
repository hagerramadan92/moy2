
import { FaQuestionCircle } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";

export default function HelpCenterPage() {
    const faqs = [
        "كيف يمكنني تتبع طلبي؟",
        "ماهي طرق الدفع المتاحة؟",
        "كيف يمكنني تغيير كلمة المرور؟",
        "هل يمكنني استرجاع المبالغ؟"
    ];

    return (
        <div className="space-y-6 fade-in-up">
            <h2 className="text-2xl font-bold">مركز المساعدة</h2>
            {/* <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 mb-8">
                <h3 className="text-lg font-bold text-primary mb-2">كيف يمكننا مساعدتك اليوم؟</h3>
                <input
                    type="text"
                    placeholder="ابحث عن سؤالك هنا..."
                    className="w-full p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 outline-none"
                />
            </div> */}

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {faqs.map((q, i) => (
                    <div key={i} className="bg-white dark:bg-card border border-border p-4 rounded-xl flex justify-between items-center cursor-pointer hover:border-primary transition-colors group">
                        <div className="flex items-center gap-3">
                            <FaQuestionCircle className="text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="font-medium">{q}</span>
                        </div>
                        <IoIosArrowBack className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                ))}
            </div> */}
        </div>
    );
}
