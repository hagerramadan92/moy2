"use client";

import { useState } from "react";
import { FaPaperPlane, FaPaperclip, FaSmile, FaInfoCircle } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { BiSupport } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function HelpCenterPage() {
    const [message, setMessage] = useState("");

    const messages = [
        { id: 1, type: "support", text: "مرحباً بك في مركز المساعدة! كيف يمكننا خدمتك اليوم؟", time: "10:00 ص" },
        { id: 2, type: "user", text: "أهلاً، لدي استفسار بخصوص تتبع طلبي الأخير.", time: "10:02 ص" },
        { id: 3, type: "support", text: "بالتأكيد! يمكنك تتبع طلبك عبر الضغط على 'طلباتي' في القائمة الجانبية، أو زودني برقم الطلب وسأقوم بالتحقق لك.", time: "10:05 ص" },
    ];

    return (
        <div className="flex flex-col h-[750px] bg-white dark:bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm fade-in-up">
            {/* Chat Header */}
            <div className="p-4 border-b border-border/60 bg-secondary/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 bg-[#579BE8]/10 rounded-2xl flex items-center justify-center text-[#579BE8]">
                            <BiSupport size={24} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-card rounded-full shadow-sm" title="متصل الآن" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground">فريق الدعم الفني</h3>
                        <p className="text-xs text-green-500 font-medium">متصل الآن - جاهزون لمساعدتك</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2.5 hover:bg-white dark:hover:bg-card rounded-xl border border-transparent hover:border-border transition-all text-muted-foreground hover:text-primary">
                        <IoIosSearch size={20} />
                    </button>
                    <button className="p-2.5 hover:bg-white dark:hover:bg-card rounded-xl border border-transparent hover:border-border transition-all text-muted-foreground hover:text-primary">
                        <FaInfoCircle size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-secondary">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[75%] space-y-1 ${msg.type === "user" ? "items-end" : "items-start"}`}>
                                <div
                                    className={`px-5 py-3.5 rounded-3xl text-sm font-medium shadow-sm leading-relaxed ${msg.type === "user"
                                        ? "bg-[#579BE8] text-white rounded-tl-none"
                                        : "bg-secondary/40 text-foreground rounded-tr-none"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                                <div className="flex items-center gap-2 px-1">
                                    {msg.type === "support" && (
                                        <span className="text-[10px] font-bold text-[#579BE8] uppercase tracking-wider">الدعم</span>
                                    )}
                                    <span className="text-[10px] text-muted-foreground/60">{msg.time}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Date Divider */}
                <div className="flex items-center gap-4 py-4">
                    <div className="h-[1px] flex-1 bg-border/40" />
                    <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] bg-secondary/20 px-3 py-1 rounded-full">اليوم</span>
                    <div className="h-[1px] flex-1 bg-border/40" />
                </div>
            </div>

            {/* Input Bar */}
            <div className="p-5 border-t border-border/60 bg-secondary/5">
                <div className="flex items-end gap-3 bg-white dark:bg-card p-2 rounded-[28px] border border-border/60 shadow-inner group focus-within:border-[#579BE8]/50 transition-colors">
                    <div className="flex items-center gap-1 pb-1 pr-2">
                        <button className="p-2.5 text-muted-foreground hover:text-[#579BE8] hover:bg-[#579BE8]/5 rounded-full transition-all">
                            <FaSmile size={20} />
                        </button>
                        <button className="p-2.5 text-muted-foreground hover:text-[#579BE8] hover:bg-[#579BE8]/5 rounded-full transition-all">
                            <FaPaperclip size={20} />
                        </button>
                    </div>

                    <textarea
                        rows={1}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="اكتب رسالتك هنا..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium py-3 outline-none resize-none max-h-32 text-foreground scrollbar-none"
                        style={{ height: 'auto' }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                    />

                    <button
                        className={`p-3.5 rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center ${message.trim()
                            ? "bg-[#579BE8] text-white hover:bg-[#4a8bd1] shadow-[#579BE8]/20"
                            : "bg-secondary/40 text-muted-foreground cursor-not-allowed"
                            }`}
                        disabled={!message.trim()}
                    >
                        <FaPaperPlane size={18} className={message.trim() ? "translate-x-[-1px] " : ""} />
                    </button>
                </div>
                <p className="text-center text-[10px] text-muted-foreground/60 mt-3 font-medium">
                    سيقوم فريقنا بالرد عليك في أقرب وقت ممكن. نحن هنا لمساعدتك دائماً.
                </p>
            </div>
        </div>
    );
}
