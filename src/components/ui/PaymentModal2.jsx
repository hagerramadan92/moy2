'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import OrderScheduledModal from './OrderScheduledModal';

// Payment methods configuration
const PAYMENT_METHODS = [
  {
    id: 'cash',
    name: 'الدفع عن الاستلام',
    icon: '/tdesign_money.png',
    boxColor: 'bg-[#1C7C4B]',
    hasBorder: true,
    isSelected: true
  },
  {
    id: 'wallet',
    name: 'محفظة',
    icon1: '/Vector (8).png',
    icon2: '/Vector (9).png',
    boxColor: 'bg-[#579BE8]',
    hasBorder: true,
    isSelected: false
  },
  {
    id: 'card',
    name: 'بطاقة ائتمان أو خصم',
    icon: '/im9.png',
    boxColor: 'bg-white',
    borderColor: 'border-[#579BE8]',
    hasBorder: true,
    isSelected: false
  },
  {
    id: 'applepay',
    name: 'آبل باي',
    icon: '/ApplePay.png',
    boxColor: 'bg-white',
    borderColor: 'border-[#579BE8]',
    hasBorder: true,
    borderRadius: 'rounded-full',
    isSelected: false
  }
];

// Custom close button component
const CloseButton = ({ onClose }) => (
  <button
    onClick={onClose}
    className="absolute top-6 right-6 w-3.5 h-3.5 hover:opacity-70 transition-opacity"
    aria-label="Close"
  >
    <div className="relative w-full h-full">
      <span className="absolute top-1/2 left-1/2 w-full h-0.5 bg-black transform -translate-x-1/2 -translate-y-1/2 rotate-45"></span>
      <span className="absolute top-1/2 left-1/2 w-full h-0.5 bg-black transform -translate-x-1/2 -translate-y-1/2 -rotate-45"></span>
    </div>
  </button>
);

// Modal title component
const ModalTitle = () => (
  <h2 className="absolute top-6 left-1/2 transform -translate-x-1/2 font-cairo font-semibold text-xl md:text-2xl text-black">
    تأكيد الدفع
  </h2>
);

// Individual payment option component
const PaymentOption = ({ method, isSelected, onClick }) => {
  const boxClasses = `
    w-10 h-10 rounded-[11.9px] flex items-center justify-center relative
    ${method.boxColor} 
    ${method.borderColor ? `border ${method.borderColor}` : ''}
    ${method.borderRadius || ''}
  `;

  return (
    <button
      onClick={() => onClick(method.id)}
      className={`
        w-full h-15 
        border border-[#579BE8] rounded-lg
        flex items-center px-4 gap-3
        hover:bg-blue-50 transition-all duration-200
        ${isSelected ? 'bg-blue-50' : 'bg-white'}
        relative
      `}
    >
      {isSelected && (
        <div className="absolute left-3 w-8 h-8">
          <div className="relative w-8 h-8 bg-[#579BE8] rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      <div className={boxClasses}>
        {method.id === 'cash' && (
          <div className="relative w-6 h-6">
            <Image
              src={method.icon}
              alt={method.name}
              fill
              className="object-contain"
              quality={100}
            />
          </div>
        )}

        {method.id === 'wallet' && (
          <>
            <div className="relative w-7 h-6">
              <Image
                src={method.icon1}
                alt=""
                fill
                className="object-contain"
                quality={100}
              />
            </div>
            <div className="absolute w-3 h-3 -bottom-[-4] -right-0">
              <Image
                src={method.icon2}
                alt=""
                fill
                className="object-contain"
                quality={100}
              />
            </div>
          </>
        )}

        {method.id === 'card' && (
          <div className="relative w-8 h-4">
            <Image
              src={method.icon}
              alt={method.name}
              fill
              className="object-contain"
              quality={100}
            />
          </div>
        )}

        {method.id === 'applepay' && (
          <div className="relative w-6 h-6">
            <Image
              src={method.icon}
              alt={method.name}
              fill
              className="object-contain"
              quality={100}
            />
          </div>
        )}
      </div>

      <span className={`font-cairo font-normal text-base md:text-lg flex-1 text-right ${isSelected ? 'text-[#579BE8] font-medium' : 'text-[#579BE8]'}`}>
        {method.name}
      </span>
    </button>
  );
};

// Payment options list component
const PaymentOptionsList = ({ methods, selectedMethod, onSelectMethod }) => (
  <div className="space-y-4 w-full">
    {methods.map((method) => (
      <PaymentOption
        key={method.id}
        method={method}
        isSelected={selectedMethod === method.id}
        onClick={onSelectMethod}
      />
    ))}
  </div>
);

// Main Payment Modal component
export default function PaymentModal2({ isOpen, onClose, onConfirm, selectedDriverId }) {
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [showOrderScheduledModal, setShowOrderScheduledModal] = useState(false);
  const router = useRouter();
  
  // Don't render if no modal is open
  if (!isOpen && !showOrderScheduledModal) return null;
  
  // Handle order confirmation
  const handleConfirm = () => {
    // Call original confirmation handler
    onConfirm?.(selectedMethod, selectedDriverId);
    
    // Close payment modal
    onClose?.();
    
    // Open order scheduled modal
    setShowOrderScheduledModal(true);
  };
  
  // Close order scheduled modal
  const handleCloseOrderScheduledModal = () => {
    setShowOrderScheduledModal(false);
  };
  
  // Handle home navigation
  const handleGoToHome = () => {
    setShowOrderScheduledModal(false);
    router.push('/');
  };
  
  return (
    <>
      {/* Payment Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="mt-16 md:mt-20 lg:mt-24 w-full max-w-xs sm:max-w-sm md:max-w-md">
            <div className="
              w-full h-auto min-h-[400px] md:min-h-[450px]
              bg-white rounded-2xl md:rounded-3xl
              shadow-lg relative overflow-hidden
              p-6 md:p-8
            ">
              <CloseButton onClose={onClose} />
              <ModalTitle />
              
              <div className="mt-20 md:mt-24 flex flex-col items-center w-full">
                <div className="w-full max-w-[422px]">
                  <PaymentOptionsList
                    methods={PAYMENT_METHODS}
                    selectedMethod={selectedMethod}
                    onSelectMethod={setSelectedMethod}
                  />
                  <button
                    onClick={handleConfirm}
                    className="
                      w-full h-14
                      rounded-xl md:rounded-2xl
                      bg-[#579BE8]
                      flex items-center justify-center
                      hover:bg-[#4688d6]
                      transition-colors duration-200
                      mt-4 md:mt-6
                    "
                  >
                    <span className="font-cairo font-normal text-lg md:text-xl text-white">
                      تأكيد الطلب
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Scheduled Confirmation Modal */}
      {showOrderScheduledModal && (
        <OrderScheduledModal
          isOpen={showOrderScheduledModal}
          onClose={handleCloseOrderScheduledModal}
          onGoToHome={handleGoToHome}
        />
      )}
    </>
  );
}