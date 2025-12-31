'use client';

import Image from 'next/image';
import { useState } from 'react';

import ReportReason from './ReportReason';
import ReportCancelled from './ReportCancelled';

export default function ReportDriverModal({ isOpen, onClose }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showCancelledModal, setShowCancelledModal] = useState(false);
  const [withoutReasonClicked, setWithoutReasonClicked] = useState(false);

  const reportReasons = [
    { 
      id: 'driver_cancel', 
      text: 'تزوير في بيانات السائق او السيارة', 
      icon: '/Vector (22).png', 
      iconWidth: 17.5, 
      iconHeight: 17.48 
    },
    { 
      id: 'long_wait', 
      text: 'طلب مبلغ زيادة', 
      icon: '/money.png', 
      iconWidth: 21.13, 
      iconHeight: 22.81 
    },
    { 
      id: 'driver_not_arriving', 
      text: 'محاولة طلب معلومات شخصية', 
      icon: '/lock.png', 
      iconWidth: 24.54, 
      iconHeight: 25.54 
    },
    { 
      id: 'cant_reach_driver', 
      text: 'مضايقة او تجاوز بالكلام', 
      icon: '/speak.png', 
      iconWidth: 30, 
      iconHeight: 30
    },
    { 
      id: 'driver_arrived_early', 
      text: 'رفض تنفيذ الطلب بدون سبب واضح', 
      icon: '/ex.png', 
      iconWidth: 30, 
      iconHeight: 30 
    },
    { 
      id: 'other', 
      text: 'سبب تاني', 
      icon: '/solid.png', 
      iconWidth: 30, 
      iconHeight: 30 
    }
  ];

  const handleSubmitWithoutReason = () => {
    setWithoutReasonClicked(true);
    setTimeout(() => {
      onClose();
      setShowCancelledModal(true);
    }, 300);
  };

  const handleCancelOrder = () => {
    if (!selectedReason) return;

    if (selectedReason === 'other') {
      onClose();
      setTimeout(() => {
        setShowReasonModal(true);
      }, 300);
    } else {
      onClose();
      setTimeout(() => {
        setShowCancelledModal(true);
      }, 300);
    }
  };

  const handleCloseReasonModal = () => {
    setShowReasonModal(false);
  };

  const handleCancelFromReasonModal = (type, customReason = '') => {
    setShowReasonModal(false);
    setTimeout(() => {
      setShowCancelledModal(true);
    }, 300);
  };

  const handleCloseCancelledModal = () => {
    setShowCancelledModal(false);
  };

  if (!isOpen && !showReasonModal && !showCancelledModal) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-black/20" 
            onClick={onClose} 
          />
          
          <div className="relative bg-white rounded-[24px] shadow-2xl border border-gray-200 w-full max-w-[280px] max-h-[75vh] my-auto flex flex-col">
            
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 w-4 h-4 flex items-center justify-center text-black text-lg z-10"
            >
              ✕
            </button>

            <div className="pt-6 pb-1 text-center">
              <h2 className="text-[20px] font-semibold font-cairo text-[#B70005]">
                ابلاغ عن السائق
              </h2>
              <h2 className="text-[16px] font-medium font-cairo text-black mt-2">
                ليش تبغي تبلغ؟
              </h2>
            </div>

            <div className="px-4 mt-2 mb-0">
              <div className="w-full h-[0.2px] bg-[#579BE840]" />
            </div>

            <div className="flex-1 overflow-hidden px-6 py-2">
              <div className="space-y-1 overflow-visible">
                {reportReasons.map((reason) => (
                  <div
                    key={reason.id}
                    className={`flex items-center gap-1 p-1.5 rounded-[8px] cursor-pointer transition-all ${
                      selectedReason === reason.id 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedReason(reason.id)}
                  >
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      <Image
                        src={reason.icon}
                        alt=""
                        width={reason.iconWidth}
                        height={reason.iconHeight}
                        className="object-contain max-w-[14px] max-h-[14px]"
                      />
                    </div>

                    <div className="flex-1 text-right pr-1">
                      <span className="text-[11px] font-normal font-cairo leading-tight text-black">
                        {reason.text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 pt-0">
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

              <button
                onClick={handleCancelOrder}
                className={`w-full h-[36px] rounded-[10px] border border-[#B70005] bg-white hover:bg-red-50 transition-colors flex items-center justify-center ${
                  !selectedReason ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!selectedReason}
              >
                <span className="text-[13px] font-semibold font-cairo text-[#B70005]">
                  إلغاء الطلب
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ReportReason 
        isOpen={showReasonModal}
        onClose={handleCloseReasonModal}
        onCancelOrder={handleCancelFromReasonModal}
      />

      <ReportCancelled 
        isOpen={showCancelledModal}
        onClose={handleCloseCancelledModal}
      />
    </>
  );
}