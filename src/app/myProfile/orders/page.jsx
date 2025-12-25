
import { BiPackage } from "react-icons/bi";

export default function OrdersPage() {
    const orders = [
        { id: "#ORD-001", status: "completed", date: "2023-12-20", amount: "350.00", items: 3 },
        { id: "#ORD-002", status: "processing", date: "2023-12-24", amount: "120.00", items: 1 },
        { id: "#ORD-003", status: "cancelled", date: "2023-11-15", amount: "50.00", items: 1 },
    ];

    const statusColors = {
        completed: "bg-green-100 text-green-700",
        processing: "bg-blue-100 text-blue-700",
        cancelled: "bg-red-100 text-red-700",
    };

    const statusText = {
        completed: "مكتمل",
        processing: "قيد التنفيذ",
        cancelled: "ملغي",
    };

    return (
        <div className="space-y-6 fade-in-up">
            <h2 className="text-2xl font-bold">الطلبات</h2>

            {/* <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white dark:bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-2xl">
                                📦
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-lg">{order.id}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[order.status]}`}>
                                        {statusText[order.status]}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {order.items} منتجات • {order.date}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between w-full md:w-auto gap-6 mt-4 md:mt-0">
                            <p className="font-bold text-lg">{order.amount} ر.س</p>
                            <button className="text-sm border border-border px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
                                التفاصيل
                            </button>
                        </div>
                    </div>
                ))}
            </div> */}
        </div>
    );
}
