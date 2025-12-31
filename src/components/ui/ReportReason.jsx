
'use client';

import { useState } from 'react';

export default function ReportReason({ isOpen, onClose, onCancelOrder }) {
    const [reasonText, setReasonText] = useState('');
    const [withoutReasonClicked, setWithoutReasonClicked] = useState(false);

    const handleSubmitWithoutReason = () => {
        setWithoutReasonClicked(true);
        setTimeout(() => {
            onClose();
            if (onCancelOrder) {
                onCancelOrder('without_reason');
            }
        }, 300);
    };

    const handleSubmitWithCustomReason = () => {
        if (reasonText.trim()) {
            onClose();
            if (onCancelOrder) {
                onCancelOrder('custom_reason', reasonText);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="fixed inset-0 backdrop-blur-sm bg-black/20" onClick={onClose} />

            <div className="relative bg-white rounded-[32px] shadow-2xl border border-gray-200 w-full max-w-[480px] max-h-[85vh] mx-auto">

                <button
                    onClick={onClose}
                    className="absolute top-5 right-6 w-8 h-8 flex items-center justify-center text-gray-700 hover:text-black transition-colors text-xl font-bold z-10"
                >
                    ✕
                </button>

                <div className="pt-6 pb-1 text-center">
                    <h2 className="text-[24px] font-medium font-cairo leading-[170%] text-[#B70005]"> ابلاغ عن السائق</h2>
                    <h2 className="text-[18px] font-normal font-cairo leading-[170%] text-[#579BE8] mt-1">ليش تبغي تبلغ؟</h2>
                </div>

                <div className="px-6 mt-1">
                    <div className="w-full h-px bg-[#579BE840]" />
                </div>

                <div className="p-6 space-y-3">
                    <div className="text-right mt-2">
                        <p className="text-[18px] font-medium font-cairo leading-[170%] text-black">
                            اكتب سبب آخر لإبلاغ
                        </p>
                    </div>

                    <div className="mt-1">
                        <textarea
                            value={reasonText}
                            onChange={(e) => setReasonText(e.target.value)}
                            className="w-full min-h-[120px] rounded-[14px] border border-[#579BE8] bg-white resize-none p-4 text-right focus:outline-none focus:ring-2 focus:ring-[#579BE8] focus:ring-opacity-50"
                            style={{
                                fontFamily: 'Cairo',
                                fontWeight: 500,
                                fontSize: '14px',
                                lineHeight: '170%',
                                color: '#579BE8',
                                textAlign: 'right',
                                verticalAlign: 'middle',
                            }}
                            placeholder="تاخر في الموعد"
                        />
                    </div>

                    <button
                        onClick={handleSubmitWithoutReason}
                        className={`w-full h-[36px] rounded-[10px] border bg-white hover:bg-red-50 transition-colors mb-2 flex items-center justify-center ${
                            withoutReasonClicked ? 'border-[#B70005] border-2' : 'border-gray-300'
                        }`}
                    >
                        <span className="text-[13px] font-semibold font-cairo text-[#B70005]">
                            بدون سبب
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}