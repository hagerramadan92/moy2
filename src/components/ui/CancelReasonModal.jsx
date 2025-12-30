'use client';

import { useState } from 'react';
import OrderCancelledModal from './OrderCancelledModal';

export default function CancelReasonModal({ isOpen, onClose, onCancelOrder }) {
  // State for reason text and modal visibility
  const [reasonText, setReasonText] = useState('طلبت الموية بالغلط');
  const [showCancelledModal, setShowCancelledModal] = useState(false);

  // Handle cancel button click - opens confirmation modal
  const handleCancelClick = () => {
    setShowCancelledModal(true);
  };

  // Handle closing the confirmation modal
  const handleCancelledModalClose = () => {
    setShowCancelledModal(false);
    onClose?.();
  };

  // Handle new order request from confirmation modal
  const handleNewOrder = () => {
    setShowCancelledModal(false);
    onClose?.();
  };

  // Handle final cancellation confirmation with custom reason
  const handleCancellationConfirmed = (finalReason) => {
    if (onCancelOrder) {
      onCancelOrder(finalReason);
    }
  };

  return (
    <>
      {/* Main Reason Input Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Modal Backdrop */}
          <div className="fixed inset-0 backdrop-blur-sm bg-black/20" onClick={onClose} />
          
          {/* Modal Container */}
          <div className="relative bg-white rounded-[32px] shadow-2xl border border-gray-200 w-full max-w-[480px] md:max-w-[440px] max-h-[85vh] mx-auto">
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-6 w-8 h-8 flex items-center justify-center text-gray-700 hover:text-black transition-colors text-xl font-bold z-10"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="pt-6 pb-1 text-center">
              <h2 className="text-[24px] font-medium font-cairo leading-[170%] text-black">سبب إلغاء الطلب</h2>
            </div>

            {/* Divider Line */}
            <div className="px-6 mt-1">
              <div className="w-full h-px bg-[#579BE840]" />
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-3">
              {/* Question Section */}
              <div className="text-right">
                <h3 className="text-[20px] font-bold font-cairo leading-[170%] inline-block">
                  <span className="text-[#F75A65]">إلغاء الطلب</span>
                  <span className="text-black"> ليش تبغي تلغيه؟</span>
                </h3>
              </div>

              {/* Instructions */}
              <div className="text-right mt-2">
                <p className="text-[18px] font-medium font-cairo leading-[170%] text-[#579BE8]">
                  اكتب سبب آخر لإلغاء الطلب
                </p>
              </div>

              {/* Reason Text Input */}
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
                  placeholder="اكتب سبب إلغاء الطلب هنا..."
                />
              </div>

              {/* Cancel Button */}
              <button
                onClick={handleCancelClick}
                className="w-full h-[50px] rounded-[14px] bg-[#F75A65] hover:bg-[#e04a55] transition-colors flex items-center justify-center mt-2"
              >
                <span className="text-[20px] font-semibold font-cairo text-white">إلغاء الطلب</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {showCancelledModal && (
        <OrderCancelledModal
          isOpen={showCancelledModal}
          onClose={handleCancelledModalClose}
          onNewOrder={handleNewOrder}
          onConfirmCancel={() => handleCancellationConfirmed(reasonText)}
        />
      )}
    </>
  );
}