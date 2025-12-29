'use client';

import { useState } from 'react';
import PaymentModal from '@/components/ui/PaymentModal';
import DriverCard from '@/components/ui/DriverCard';
import Image from 'next/image';

// Constants
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

// Components
const PageTitle = () => (
  <h1 className="font-cairo font-semibold text-xl sm:text-2xl md:text-3xl text-right text-black mb-6 md:mb-8 mt-4 md:mt-6">
    السائقين المتاحين
  </h1>
);

const DriversGrid = ({ onDriverSelect }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
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

const MapSection = () => (
  <div className="relative container h-[400px] sm:h-[500px] md:h-[600px] lg:h-[791px] rounded-2xl md:rounded-3xl overflow-hidden bg-[#EFF5FD] mt-6 md:mt-8 lg:mt-10">
    <Image
      src="/location1.jpg"
      alt="Delivery location map"
      fill
      className="object-cover"
      priority
    />
  </div>
);

// Main Component
export default function AvailableDriversPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  
  const handleDriverSelect = (driverId) => {
    setSelectedDriverId(driverId);
    setIsModalOpen(true);
  };
  
  const handleConfirmPayment = (methodId, driverId) => {
    console.log('Payment confirmed:', { methodId, driverId });
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  return (
    <>
      <main className="min-h-screen bg-gray-50 relative">
        <div className={isModalOpen ? 'filter blur-sm pointer-events-none' : ''}>
          <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10">
              
              <section className="lg:w-3/5">
                <PageTitle />
                <DriversGrid onDriverSelect={handleDriverSelect} />
              </section>

              <aside className="lg:w-2/5">
                <MapSection />
              </aside>

            </div>
          </div>
        </div>
      </main>
      
      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmPayment}
        selectedDriverId={selectedDriverId}
      />
    </>
  );
}