// 'use client';

// import { useState } from 'react';
// import PaymentModal from '@/components/ui/PaymentModal';
// import DriverCard from '@/components/ui/DriverCard';
// import Image from 'next/image';

// // Mock data for drivers
// const DRIVER_DATA = {
//   name: "سعود بن ناصر المطيري",
//   deliveryTime: "55 د",
//   rating: "4,5",
//   successfulOrders: "(1,439) طلب ناجح",
//   ordersCount: "238"
// };

// const DRIVERS = [
//   { id: 1, ...DRIVER_DATA },
//   { id: 2, ...DRIVER_DATA },
//   { id: 3, ...DRIVER_DATA },
//   { id: 4, ...DRIVER_DATA }
// ];

// /**
//  * Preload images to ensure they load immediately
//  */
// const preloadImages = () => {
//   if (typeof window !== 'undefined') {
//     const images = [
//       '/location1.jpg',
//       '/Vector (16).png'
//     ];
    
//     images.forEach(src => {
//       const img = new window.Image();
//       img.src = src;
//     });
//   }
// };

// /**
//  * Displays the main page title
//  */
// const PageTitle = () => (
//   <h1 className="font-cairo font-semibold text-xl sm:text-2xl md:text-3xl text-right text-black mb-6 md:mb-4 mt-4 md:mt-4">
//     السائقين المتاحين
//   </h1>
// );

// /**
//  * Grid layout for displaying available drivers
//  */
// const DriversGrid = ({ onDriverSelect }) => (
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4 lg:gap-4">
//     {DRIVERS.map((driver) => (
//       <div key={driver.id} className="flex justify-center">
//         <DriverCard 
//           {...driver}
//           onAcceptOrder={() => onDriverSelect(driver.id)}
//         />
//       </div>
//     ))}
//   </div>
// );

// /**
//  * Optimized Map visualization section
//  */
// const MapSection = () => {
//   const [imageError, setImageError] = useState(false);

//   return (
//     <div className="relative container h-[400px] sm:h-[500px] md:h-[600px] lg:h-[791px] rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 mt-6 md:mt-8 lg:mt-4">
//       {!imageError ? (
//         <Image
//           src="/location1.jpg"
//           alt="Delivery location map"
//           fill
//           className="object-cover"
//           priority
//           quality={85}
//           loading="eager"
//           onError={() => setImageError(true)}
//           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
//         />
//       ) : (
//         // Fallback if image fails to load
//         <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 p-4">
//           <div className="text-center">
//             <div className="relative w-32 h-32 mx-auto mb-4">
//               <Image
//                 src="/car22.png"
//                 alt="Car placeholder"
//                 fill
//                 className="object-contain"
//                 priority
//               />
//             </div>
//             <h3 className="text-xl font-semibold text-blue-800 mb-2">خريطة التوصيل</h3>
//             <p className="text-blue-600">يتم تحميل الخريطة...</p>
//           </div>
//         </div>
//       )}
      
//       {/* Map overlay with car marker */}
//       <div className="absolute bottom-10 right-10 z-10">
//         <div className="relative w-24 h-24 animate-pulse">
//           <Image
//             src="/car22.png"
//             alt="Delivery car"
//             fill
//             className="object-contain drop-shadow-lg"
//             priority
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// /**
//  * Blue info box showing order status and progress
//  */
// const BlueInfoBox = ({ isMobile = false }) => {
//   const [iconError, setIconError] = useState(false);

//   return (
//     <div className={`${isMobile ? 'block lg:hidden' : 'hidden lg:block'} w-full`}>
//       <div 
//         className={`${isMobile ? 'w-full max-w-[350px] h-[100px] mx-auto' : 'w-[437px] h-[125px] ml-auto mr-0'} rounded-[24px]`}
//         style={{
//           background: 'linear-gradient(135deg, #579BE8 0%, #3A7BC8 100%)',
//           boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
//           marginTop: isMobile ? '0' : '4px'
//         }}
//       >
//         <div className={`h-full ${isMobile ? 'pr-6 pl-6 pt-4 pb-4' : 'pr-10 pl-10 pt-5 pb-5'} flex items-center justify-between`}>
//           {/* Text content section */}
//           <div className="text-right flex-1">
//             <h2 className={`font-cairo font-semibold ${isMobile ? 'text-[16px] leading-[16px]' : 'text-[20px] leading-[20px]'} text-white mb-2`}>
//               تم طلب المويه
//             </h2>
//             <p className={`font-cairo font-semibold ${isMobile ? 'text-[12px] leading-[12px]' : 'text-[14px] leading-[14px]'} text-white/90 mb-4`}>
//               جاري البحث عن السائقين
//             </p>
            
//             {/* Progress bar indicator */}
//             <div className={`relative ${isMobile ? 'w-[250px] h-[5px]' : 'w-[310px] h-[6.88px]'} bg-white/30 rounded-full overflow-hidden`}>
//               <div 
//                 className="absolute right-0 top-0 h-full bg-white rounded-full animate-pulse"
//                 style={{ width: '75%' }}
//               >
//                 {/* Animated shimmer effect on progress bar */}
//                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
//               </div>
//             </div>
//           </div>
          
//           {/* Icon section with error handling */}
//           <div className={`relative ${isMobile ? 'w-[20px] h-[20px] ml-4' : 'w-[24px] h-[24px]'}`}>
//             {!iconError ? (
//               <Image
//                 src="/Vector (16).png"
//                 alt="Status icon"
//                 fill
//                 className="object-contain"
//                 priority
//                 loading="eager"
//                 onError={() => setIconError(true)}
//               />
//             ) : (
//               <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
//                 <span className="text-blue-600 font-bold text-xs">✓</span>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// /**
//  * Main page component for displaying available drivers
//  */
// export default function AvailableDriversPage() {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedDriverId, setSelectedDriverId] = useState(null);
  
//   // Preload images on component mount
//   useState(() => {
//     if (typeof window !== 'undefined') {
//       preloadImages();
//     }
//   });
  
//   /**
//    * Handles driver selection and opens payment modal
//    */
//   const handleDriverSelect = (driverId) => {
//     setSelectedDriverId(driverId);
//     setIsModalOpen(true);
//   };
  
//   /**
//    * Handles payment confirmation
//    */
//   const handleConfirmPayment = (methodId, driverId) => {
//     // Implementation for payment processing
//     console.log('Payment confirmed:', { methodId, driverId });
//   };
  
//   /**
//    * Closes the payment modal
//    */
//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//   };
  
//   return (
//     <>
//       <style jsx global>{`
//         @keyframes shimmer {
//           0% { transform: translateX(-100%); }
//           100% { transform: translateX(100%); }
//         }
//         .animate-shimmer {
//           animation: shimmer 2s infinite;
//         }
        
//         /* تحسين أداء الصور */
//         img {
//           content-visibility: auto;
//         }
//       `}</style>
      
//       <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative">
//         {/* Desktop version of info box */}
//         <div className="hidden lg:block absolute top-0 left-0 right-0 z-10">
//           <div className="container mx-auto px-8">
//             <BlueInfoBox />
//           </div>
//         </div>

//         {/* Mobile version of info box */}
//         <div className="block lg:hidden absolute top-0 left-0 right-0 z-10">
//           <div className="container mx-auto px-4 pt-4">
//             <BlueInfoBox isMobile={true} />
//           </div>
//         </div>

//         {/* Main content area - blurred when modal is open */}
//         <div className={isModalOpen ? 'filter blur-sm pointer-events-none transition-all duration-300' : 'transition-all duration-300'}>
//           <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 pt-28 lg:pt-36">
//             <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10">
              
//               {/* Left column: Drivers list */}
//               <section className="lg:w-3/5">
//                 <PageTitle />
//                 <DriversGrid onDriverSelect={handleDriverSelect} />
//               </section>

//               {/* Right column: Map visualization */}
//               <aside className="lg:w-2/5">
//                 <MapSection />
//               </aside>

//             </div>
//           </div>
//         </div>
//       </main>
      
//       {/* Payment modal dialog */}
//       <PaymentModal
//         isOpen={isModalOpen}
//         onClose={handleCloseModal}
//         onConfirm={handleConfirmPayment}
//         selectedDriverId={selectedDriverId}
//       />
//     </>
//   );
// }


// 'use client';

// import { useState } from 'react';
// import PaymentModal from '@/components/ui/PaymentModal';
// import DriverCard from '@/components/ui/DriverCard';
// import Image from 'next/image';

// // Mock data for drivers
// const DRIVER_DATA = {
//   name: "سعود بن ناصر المطيري",
//   deliveryTime: "55 د",
//   rating: "4,5",
//   successfulOrders: "(1,439) طلب ناجح",
//   ordersCount: "238"
// };

// const DRIVERS = [
//   { id: 1, ...DRIVER_DATA },
//   { id: 2, ...DRIVER_DATA },
//   { id: 3, ...DRIVER_DATA },
//   { id: 4, ...DRIVER_DATA }
// ];

// /**
//  * Preload images to ensure they load immediately
//  */
// const preloadImages = () => {
//   if (typeof window !== 'undefined') {
//     const images = [
//       '/location1.jpg',
//       '/Vector (16).png'
//     ];
    
//     images.forEach(src => {
//       const img = new window.Image();
//       img.src = src;
//     });
//   }
// };

// /**
//  * Displays the main page title
//  */
// const PageTitle = () => (
//   <h1 className="font-cairo font-semibold text-xl sm:text-2xl md:text-3xl text-right text-black mb-6 md:mb-4 mt-4 md:mt-4">
//     السائقين المتاحين
//   </h1>
// );

// /**
//  * Grid layout for displaying available drivers WITH MAP
//  */
// const DriversGrid = ({ onDriverSelect }) => {
//   const [imageError, setImageError] = useState(false);

//   return (
//     <div className="flex flex-col lg:flex-row gap-6 md:gap-4">
//       {/* Drivers Grid - Left Side */}
//       <div className="lg:w-1/2">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4">
//           {DRIVERS.map((driver) => (
//             <div key={driver.id} className="flex justify-center">
//               <DriverCard 
//                 {...driver}
//                 onAcceptOrder={() => onDriverSelect(driver.id)}
//               />
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Map Image - Right Side */}
//       <div className="lg:w-1/2">
//         <div className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-full rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
//           {!imageError ? (
//             <Image
//               src="/location1.jpg"
//               alt="Delivery location map"
//               fill
//               className="object-cover"
//               priority
//               quality={85}
//               loading="eager"
//               onError={() => setImageError(true)}
//               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
//             />
//           ) : (
//             // Fallback if image fails to load
//             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 p-4">
//               <div className="text-center">
//                 <div className="relative w-32 h-32 mx-auto mb-4">
//                   <Image
//                     src="/car22.png"
//                     alt="Car placeholder"
//                     fill
//                     className="object-contain"
//                     priority
//                   />
//                 </div>
//                 <h3 className="text-xl font-semibold text-blue-800 mb-2">خريطة التوصيل</h3>
//                 <p className="text-blue-600">يتم تحميل الخريطة...</p>
//               </div>
//             </div>
//           )}
          
//           {/* Map overlay with car marker */}
//           <div className="absolute bottom-10 right-10 z-10">
//             <div className="relative w-24 h-24">
//               <Image
//                 src="/car22.png"
//                 alt="Delivery car"
//                 fill
//                 className="object-contain drop-shadow-lg"
//                 priority
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// /**
//  * Blue info box showing order status and progress
//  */
// const BlueInfoBox = ({ isMobile = false }) => {
//   const [iconError, setIconError] = useState(false);

//   return (
//     <div className={`${isMobile ? 'block lg:hidden' : 'hidden lg:block'} w-full`}>
//       <div 
//         className={`${isMobile ? 'w-full max-w-[350px] h-[100px] mx-auto' : 'w-[437px] h-[125px] ml-auto mr-0'} rounded-[24px]`}
//         style={{
//           background: 'linear-gradient(135deg, #579BE8 0%, #3A7BC8 100%)',
//           boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
//           marginTop: isMobile ? '0' : '4px'
//         }}
//       >
//         <div className={`h-full ${isMobile ? 'pr-6 pl-6 pt-4 pb-4' : 'pr-10 pl-10 pt-5 pb-5'} flex items-center justify-between`}>
//           {/* Text content section */}
//           <div className="text-right flex-1">
//             <h2 className={`font-cairo font-semibold ${isMobile ? 'text-[16px] leading-[16px]' : 'text-[20px] leading-[20px]'} text-white mb-2`}>
//               تم طلب المويه
//             </h2>
//             <p className={`font-cairo font-semibold ${isMobile ? 'text-[12px] leading-[12px]' : 'text-[14px] leading-[14px]'} text-white/90 mb-4`}>
//               جاري البحث عن السائقين
//             </p>
            
//             {/* Progress bar indicator */}
//             <div className={`relative ${isMobile ? 'w-[250px] h-[5px]' : 'w-[310px] h-[6.88px]'} bg-white/30 rounded-full overflow-hidden`}>
//               <div 
//                 className="absolute right-0 top-0 h-full bg-white rounded-full"
//                 style={{ width: '75%' }}
//               >
//                 {/* Animated shimmer effect on progress bar */}
//                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
//               </div>
//             </div>
//           </div>
          
//           {/* Icon section with error handling */}
//           <div className={`relative ${isMobile ? 'w-[20px] h-[20px] ml-4' : 'w-[24px] h-[24px]'}`}>
//             {!iconError ? (
//               <Image
//                 src="/Vector (16).png"
//                 alt="Status icon"
//                 fill
//                 className="object-contain"
//                 priority
//                 loading="eager"
//                 onError={() => setIconError(true)}
//               />
//             ) : (
//               <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
//                 <span className="text-blue-600 font-bold text-xs">✓</span>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// /**
//  * Main page component for displaying available drivers
//  */
// export default function AvailableDriversPage() {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedDriverId, setSelectedDriverId] = useState(null);
  
//   // Preload images on component mount
//   useState(() => {
//     if (typeof window !== 'undefined') {
//       preloadImages();
//     }
//   });
  
//   /**
//    * Handles driver selection and opens payment modal
//    */
//   const handleDriverSelect = (driverId) => {
//     setSelectedDriverId(driverId);
//     setIsModalOpen(true);
//   };
  
//   /**
//    * Handles payment confirmation
//    */
//   const handleConfirmPayment = (methodId, driverId) => {
//     // Implementation for payment processing
//     console.log('Payment confirmed:', { methodId, driverId });
//   };
  
//   /**
//    * Closes the payment modal
//    */
//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//   };
  
//   return (
//     <>
//       <style jsx global>{`
//         @keyframes shimmer {
//           0% { transform: translateX(-100%); }
//           100% { transform: translateX(100%); }
//         }
//         .animate-shimmer {
//           animation: shimmer 2s infinite;
//         }
        
//         /* تحسين أداء الصور */
//         img {
//           content-visibility: auto;
//         }
//       `}</style>
      
//       <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative">
//         {/* Desktop version of info box */}
//         <div className="hidden lg:block absolute top-0 left-0 right-0 z-10">
//           <div className="container mx-auto px-8">
//             <BlueInfoBox />
//           </div>
//         </div>

//         {/* Mobile version of info box */}
//         <div className="block lg:hidden absolute top-0 left-0 right-0 z-10">
//           <div className="container mx-auto px-4 pt-4">
//             <BlueInfoBox isMobile={true} />
//           </div>
//         </div>

//         {/* Main content area - blurred when modal is open */}
//         <div className={isModalOpen ? 'filter blur-sm pointer-events-none transition-all duration-300' : 'transition-all duration-300'}>
//           <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 pt-28 lg:pt-36">
//             {/* Page Title */}
//             <div className="mb-6 md:mb-4">
//               <PageTitle />
//             </div>
            
//             {/* Drivers Grid with Map beside it */}
//             <DriversGrid onDriverSelect={handleDriverSelect} />
//           </div>
//         </div>
//       </main>
      
//       {/* Payment modal dialog */}
//       <PaymentModal
//         isOpen={isModalOpen}
//         onClose={handleCloseModal}
//         onConfirm={handleConfirmPayment}
//         selectedDriverId={selectedDriverId}
//       />
//     </>
//   );
// }


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
 * Preload images to ensure they load immediately
 */
const preloadImages = () => {
  if (typeof window !== 'undefined') {
    const images = [
      '/location1.jpg',
      '/Vector (16).png'
    ];
    
    images.forEach(src => {
      const img = new window.Image();
      img.src = src;
    });
  }
};

/**
 * Displays the main page title
 */
const PageTitle = () => (
  <h1 className="font-cairo font-semibold text-xl sm:text-2xl md:text-3xl text-right text-black mb-6 md:mb-4 mt-4 md:mt-4">
    السائقين المتاحين
  </h1>
);

/**
 * Driver Card Container with proper sizing for large screens
 */
const DriverCardContainer = ({ driver, onAcceptOrder }) => {
  return (
    <div className="w-full max-w-sm mx-auto lg:max-w-full">
      <div className="transform hover:scale-[1.02] transition-transform duration-300">
        <DriverCard 
          {...driver}
          onAcceptOrder={() => onAcceptOrder(driver.id)}
          className="h-full"
        />
      </div>
    </div>
  );
};

/**
 * Grid layout for displaying available drivers WITH MAP
 */
const DriversGrid = ({ onDriverSelect }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row gap-8 md:gap-10">
      {/* Drivers Grid - Left Side */}
      <div className="lg:w-1/2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {DRIVERS.map((driver) => (
            <div key={driver.id} className="w-full">
              <DriverCardContainer 
                driver={driver}
                onAcceptOrder={onDriverSelect} // تم التصحيح هنا
              />
            </div>
          ))}
        </div>
      </div>

      {/* Map Image - Right Side */}
      <div className="lg:w-1/2">
        <div className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[650px] xl:h-[700px] rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border border-gray-200 shadow-lg">
          {!imageError ? (
            <Image
              src="/location1.jpg"
              alt="Delivery location map"
              fill
              className="object-cover"
              priority
              quality={90}
              loading="eager"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
            />
          ) : (
            // Fallback if image fails to load
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 p-4">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <Image
                    src="/car22.png"
                    alt="Car placeholder"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <h3 className="text-xl font-semibold text-blue-800 mb-2">خريطة التوصيل</h3>
                <p className="text-blue-600">يتم تحميل الخريطة...</p>
              </div>
            </div>
          )}
          
          {/* Map overlay with car marker */}
          <div className="absolute bottom-8 right-8 z-10">
            <div className="relative w-24 h-24 lg:w-20 lg:h-20 xl:w-24 xl:h-24">
              <Image
                src="/car22.png"
                alt="Delivery car"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
          </div>

          {/* Map legend */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-800">وجهة التوصيل</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Blue info box showing order status and progress
 */
const BlueInfoBox = ({ isMobile = false }) => {
  const [iconError, setIconError] = useState(false);

  return (
    <div className={`${isMobile ? 'block lg:hidden' : 'hidden lg:block'} w-full`}>
      <div 
        className={`${isMobile ? 'w-full max-w-[350px] h-[100px] mx-auto' : 'w-[437px] h-[125px] ml-auto mr-0'} rounded-[24px]`}
        style={{
          background: 'linear-gradient(135deg, #579BE8 0%, #3A7BC8 100%)',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
          marginTop: isMobile ? '0' : '4px'
        }}
      >
        <div className={`h-full ${isMobile ? 'pr-6 pl-6 pt-4 pb-4' : 'pr-10 pl-10 pt-5 pb-5'} flex items-center justify-between`}>
          {/* Text content section */}
          <div className="text-right flex-1">
            <h2 className={`font-cairo font-semibold ${isMobile ? 'text-[16px] leading-[16px]' : 'text-[20px] leading-[20px]'} text-white mb-2`}>
              تم طلب المويه
            </h2>
            <p className={`font-cairo font-semibold ${isMobile ? 'text-[12px] leading-[12px]' : 'text-[14px] leading-[14px]'} text-white/90 mb-4`}>
              جاري البحث عن السائقين
            </p>
            
            {/* Progress bar indicator */}
            <div className={`relative ${isMobile ? 'w-[250px] h-[5px]' : 'w-[310px] h-[6.88px]'} bg-white/30 rounded-full overflow-hidden`}>
              <div 
                className="absolute right-0 top-0 h-full bg-white rounded-full"
                style={{ width: '75%' }}
              >
                {/* Animated shimmer effect on progress bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
          
          {/* Icon section with error handling */}
          <div className={`relative ${isMobile ? 'w-[20px] h-[20px] ml-4' : 'w-[24px] h-[24px]'}`}>
            {!iconError ? (
              <Image
                src="/Vector (16).png"
                alt="Status icon"
                fill
                className="object-contain"
                priority
                loading="eager"
                onError={() => setIconError(true)}
              />
            ) : (
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs">✓</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main page component for displaying available drivers
 */
export default function AvailableDriversPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  
  // Preload images on component mount
  useState(() => {
    if (typeof window !== 'undefined') {
      preloadImages();
    }
  });
  
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
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        /* تحسين أداء الصور */
        img {
          content-visibility: auto;
        }
        
        /* تحسين شكل الكارد للشاشات الكبيرة */
        @media (min-width: 1024px) {
          .driver-card-container {
            max-width: 100% !important;
          }
          .driver-card {
            height: 100% !important;
            min-height: 320px !important;
          }
        }
      `}</style>
      
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative">
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
        <div className={isModalOpen ? 'filter blur-sm pointer-events-none transition-all duration-300' : 'transition-all duration-300'}>
          <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 pt-28 lg:pt-36">
            {/* Page Title */}
            <div className="mb-8 md:mb-6">
              <PageTitle />
            </div>
            
            {/* Drivers Grid with Map beside it */}
            <DriversGrid onDriverSelect={handleDriverSelect} />
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