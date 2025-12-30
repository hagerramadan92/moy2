'use client';

import { useState } from 'react';
import PaymentModal from '@/components/ui/PaymentModal';
import DriverCard from '@/components/ui/DriverCard';
import Image from 'next/image';

// Mock data for drivers
const DRIVER_DATA = {
  name: "سعود بن ناصر المطيري",
  deliveryTime: "55 د",
  rating: "4,5",
  successfulOrders: "(1,439) طلب ناجح",
  ordersCount: "238"
};

const DRIVERS = [
  { id: 1, ...DRIVER_DATA },
  { id: 2, ...DRIVER_DATA },
  { id: 3, ...DRIVER_DATA },
  { id: 4, ...DRIVER_DATA }
];

/**
 * Displays the main page title
 */
const PageTitle = () => (
  <h1 className="font-cairo font-semibold text-xl sm:text-2xl md:text-3xl text-right text-black mb-6 md:mb-4 mt-4 md:mt-4">
    السائقين المتاحين
  </h1>
);

/**
 * Grid layout for displaying available drivers
 */
const DriversGrid = ({ onDriverSelect }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4 lg:gap-4">
    {DRIVERS.map((driver) => (
      <div key={driver.id} className="flex justify-center">
        <DriverCard 
          {...driver}
          onAcceptOrder={() => onDriverSelect(driver.id)}
        />
      </div>
    ))}
  </div>
);

/**
 * Map visualization section
 */
const MapSection = () => (
  <div className="relative container h-[400px] sm:h-[500px] md:h-[600px] lg:h-[791px] rounded-2xl md:rounded-3xl overflow-hidden bg-[#EFF5FD] mt-6 md:mt-8 lg:mt-4">
    <Image
      src="/location1.jpg"
      alt="Delivery location map"
      fill
      className="object-cover"
      priority
    />
  </div>
);

/**
 * Blue info box showing order status and progress
 */
const BlueInfoBox = ({ isMobile = false }) => (
  <div className={`${isMobile ? 'block lg:hidden' : 'hidden lg:block'} w-full`}>
    <div 
      className={`${isMobile ? 'w-full max-w-[350px] h-[100px] mx-auto' : 'w-[437px] h-[125px] ml-auto mr-0'} rounded-[24px]`}
      style={{
        background: '#579BE8',
        boxShadow: '0px 0px 19px 0px #00000040',
        marginTop: isMobile ? '0' : '4px'
      }}
    >
      <div className={`h-full ${isMobile ? 'pr-6 pl-6 pt-4 pb-4' : 'pr-10 pl-10 pt-5 pb-5'} flex items-center justify-between`}>
        {/* Text content section */}
        <div className="text-right flex-1">
          <h2 className={`font-cairo font-semibold ${isMobile ? 'text-[16px] leading-[16px]' : 'text-[20px] leading-[20px]'} text-white mb-2`}>
            تم طلب المويه
          </h2>
          <p className={`font-cairo font-semibold ${isMobile ? 'text-[12px] leading-[12px]' : 'text-[14px] leading-[14px]'} text-[#000000B2] mb-4`}>
            جاري البحث عن السائقين
          </p>
          
          {/* Progress bar indicator */}
          <div className={`relative ${isMobile ? 'w-[250px] h-[5px]' : 'w-[310px] h-[6.88px]'} bg-[#E1E1E14A] rounded-full`}>
            <div 
              className="absolute right-0 top-0 h-full bg-white rounded-full"
              style={{ width: '75%' }}
            ></div>
          </div>
        </div>
        
        {/* Icon section */}
        <div className={`relative ${isMobile ? 'w-[20px] h-[20px] ml-4' : 'w-[24px] h-[24px]'}`}>
          <Image
            src="/Vector (16).png"
            alt="Status icon"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Main page component for displaying available drivers
 */
export default function AvailableDriversPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  
  /**
   * Handles driver selection and opens payment modal
   */
  const handleDriverSelect = (driverId) => {
    setSelectedDriverId(driverId);
    setIsModalOpen(true);
  };
  
  /**
   * Handles payment confirmation
   */
  const handleConfirmPayment = (methodId, driverId) => {
    // Implementation for payment processing
    console.log('Payment confirmed:', { methodId, driverId });
  };
  
  /**
   * Closes the payment modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  return (
    <>
      <main className="min-h-screen bg-gray-50 relative">
        {/* Desktop version of info box */}
        <div className="hidden lg:block absolute top-0 left-0 right-0 z-10">
          <div className="container mx-auto px-8">
            <BlueInfoBox />
          </div>
        </div>

        {/* Mobile version of info box */}
        <div className="block lg:hidden absolute top-0 left-0 right-0 z-10">
          <div className="container mx-auto px-4 pt-4">
            <BlueInfoBox isMobile={true} />
          </div>
        </div>

        {/* Main content area - blurred when modal is open */}
        <div className={isModalOpen ? 'filter blur-sm pointer-events-none' : ''}>
          <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 pt-28 lg:pt-36">
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10">
              
              {/* Left column: Drivers list */}
              <section className="lg:w-3/5">
                <PageTitle />
                <DriversGrid onDriverSelect={handleDriverSelect} />
              </section>

              {/* Right column: Map visualization */}
              <aside className="lg:w-2/5">
                <MapSection />
              </aside>

            </div>
          </div>
        </div>
      </main>
      
      {/* Payment modal dialog */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmPayment}
        selectedDriverId={selectedDriverId}
      />
    </>
  );
}