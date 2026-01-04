'use client';

import Image from 'next/image';
import { useState } from 'react';
import CancelReasonModal from './CancelReasonModal';
import OrderCancelledModal from './OrderCancelledModal';

export default function CancelOrderModal({ isOpen, onClose, onCancelOrder, onContinueOrder }) {
  // State management
  const [selectedReason, setSelectedReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showCancelledModal, setShowCancelledModal] = useState(false);
  
  // Cancel reasons with icons
  const reasons = [
    { id: 'driver_cancel', text: 'السائق طلب ألغي الطلب أو قال نكمل برا التطبيق', icon: '/Vector (17).png', iconWidth: 15.5, iconHeight: 16.48 },
    { id: 'long_wait', text: 'الانتظار طول واجد', icon: '/Group.png', iconWidth: 19.13, iconHeight: 21.81 },
    { id: 'driver_not_arriving', text: 'السائق ما قاعد يقرب للموقع', icon: '/Vector (18).png', iconWidth: 19.54, iconHeight: 21.54 },
    { id: 'cant_reach_driver', text: 'ما قدرت أوصل للسائق', icon: '/Vector (19).png', iconWidth: 12, iconHeight: 20 },
    { id: 'driver_arrived_early', text: 'السائق وصل بدري', icon: '/Vector (20).png', iconWidth: 22, iconHeight: 22 },
    { id: 'other', text: 'سبب آخر', icon: '/Mask group (1).png', iconWidth: 20.39, iconHeight: 20.39 }
  ];

  // Handle "Continue Order" button click
  const handleContinueClick = () => {
    onClose();
  };

  // Handle "Cancel Order" button click
  const handleCancelClick = () => {
    if (selectedReason === 'other') {
      // Open reason input modal for "other" reason
      setShowReasonModal(true);
      onClose();
    } else if (selectedReason) {
      // Open confirmation modal for other reasons
      setShowCancelledModal(true);
      onClose();
    }
  };

  // Handle cancellation with custom reason
  const handleCancelWithReason = (reason) => {
    setShowReasonModal(false);
    onCancelOrder?.(reason);
  };

  // Close reason modal
  const handleCloseReasonModal = () => {
    setShowReasonModal(false);
  };

  // Close cancelled modal
  const handleCancelledModalClose = () => {
    setShowCancelledModal(false);
  };

  // Handle new order request
  const handleNewOrder = () => {
    setShowCancelledModal(false);
  };

  // Handle confirmed cancellation
  const handleCancellationConfirmed = () => {
    setShowCancelledModal(false);
    onCancelOrder?.(selectedReason);
  };

  // Don't render if no modal is open
  const shouldRender = isOpen || showReasonModal || showCancelledModal;
  if (!shouldRender) return null;

  return (
    <>
      {/* Main Cancel Order Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 backdrop-blur-sm bg-black/20" onClick={onClose} />
          
          {/* Modal Container */}
          <div className="relative bg-white rounded-[24px] shadow-2xl border border-gray-200 w-full max-w-[400px] md:max-w-[360px] lg:max-w-[340px] xl:max-w-[360px] max-h-[75vh] my-auto flex flex-col">
            
            {/* Close Button */}
            <button onClick={onClose} className="absolute top-3 right-4 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black transition-colors text-lg z-10">
              ✕
            </button>

            {/* Modal Header */}
            <div className="pt-4 pb-1 text-center">
              <h2 className="text-[18px] font-medium font-cairo text-black">إلغاء الطلب</h2>
            </div>

            {/* Divider */}
            <div className="px-4 mt-2 mb-2">
              <div className="w-full h-[0.5px] bg-[#579BE840]" />
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden px-3 py-2">
              {/* Subtitle */}
              <div className="flex items-center justify-between mb-1 pr-1">
                <h3 className="text-[14px] font-bold font-cairo flex items-center gap-1">
                  <span className="text-[#F75A65]">إلغاء الطلب</span>
                  <span className="text-black">ليش تبغي تلغيه؟</span>
                </h3>
              </div>

              {/* Reasons List */}
              <div className="space-y-1 overflow-visible">
                {reasons.map((reason) => (
                  <div
                    key={reason.id}
                    className={`flex items-center gap-1 p-1.5 rounded-[8px] cursor-pointer transition-all ${
                      selectedReason === reason.id 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedReason(reason.id)}
                  >
                    {/* Reason Icon */}
                    <div className="flex-shrink-0 w-3 h-3 flex items-center justify-center">
                      <Image
                        src={reason.icon}
                        alt=""
                        width={reason.iconWidth}
                        height={reason.iconHeight}
                        className="object-contain max-w-[14px] max-h-[14px]"
                      />
                    </div>

                    {/* Reason Text */}
                    <div className="flex-1 text-right pr-1">
                      <span className={`text-[11px] font-normal font-cairo leading-tight ${reason.id === 'long_wait' ? 'text-[#F75A65]' : 'text-[#579BE8]'}`}>
                        {reason.text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-3 pt-0">
              {/* Cancel Order Button */}
              <button
                onClick={handleCancelClick}
                className="w-full h-[36px] rounded-[10px] border border-[#B70005] bg-white hover:bg-red-50 transition-colors mb-2 flex items-center justify-center"
              >
                <span className="text-[13px] font-semibold font-cairo text-[#B70005]">إلغاء الطلب</span>
              </button>

              {/* Continue Order Button */}
              <button
                onClick={handleContinueClick}
                className="w-full h-[36px] rounded-[10px] bg-[#579BE8] hover:bg-[#4a8bd4] transition-colors flex items-center justify-center"
              >
                <span className="text-[13px] font-semibold font-cairo text-white">خله مستمر</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reason Input Modal - for "other" reason */}
      <CancelReasonModal
        isOpen={showReasonModal}
        onClose={handleCloseReasonModal}
        onCancelOrder={handleCancelWithReason}
      />

      {/* Cancellation Confirmation Modal - for other reasons */}
      <OrderCancelledModal
        isOpen={showCancelledModal}
        onClose={handleCancelledModalClose}
        onNewOrder={handleNewOrder}
        onConfirmCancel={handleCancellationConfirmed}
      />
    </>
  );
}