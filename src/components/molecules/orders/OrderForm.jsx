'use client';

import Image from 'next/image';
import { useState } from 'react';
import OrderSchedulePage from './OrderSchedulePage';
import { useRouter } from 'next/navigation';

export default function OrderForm() {
    // State management for form inputs
    const [waterType, setWaterType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [location, setLocation] = useState('');
    const [showSchedule, setShowSchedule] = useState(false);
    
    // Router for navigation
    const router = useRouter();

    // Navigate to search driver page
    const handleOrderNow = () => {
        router.push('/orders/search-driver');
    };

    // Show schedule page
    const handleSchedule = () => {
        setShowSchedule(true);
    };

    // Return from schedule page
    const handleBack = () => {
        setShowSchedule(false);
    };

    // Render schedule page when toggled
    if (showSchedule) {
        return <OrderSchedulePage onBack={handleBack} />;
    }

    return (
        <div className="min-h-screen p-4 flex flex-col items-center justify-center">
            {/* Page Title - "تفاصيل الطلب" */}
            <div className="w-full max-w-6xl mb-6 text-right">
                <h1 className="font-cairo font-semibold text-2xl text-black pr-4 lg:pr-0">
                    تفاصيل الطلب
                </h1>
            </div>

            <div className="container max-w-6xl bg-white rounded-3xl shadow-lg overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                    {/* Left Column - Form Section */}
                    <div className="lg:w-1/2 p-4 lg:p-8">
                        <div className="max-w-md mx-auto">
                            {/* Desktop Car Image */}
                            <div className="hidden lg:block w-48 h-28 mx-auto mb-8 lg:mb-12 lg:w-56 lg:h-32">
                                <Image
                                    src="/images/car.png"
                                    alt="Delivery Car"
                                    width={224}
                                    height={128}
                                    className="object-contain w-full h-full"
                                />
                            </div>

                            {/* Mobile Car Image */}
                            <div className="lg:hidden relative -mt-16 mb-4">
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <div 
                                            className="relative w-40 h-40 rounded-full flex items-center justify-center bg-white border border-gray-300 shadow-sm"
                                        >
                                            <div className="relative w-28 h-16">
                                                <Image
                                                    src="/images/car.png"
                                                    alt="Delivery Car"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="space-y-4 lg:space-y-4">
                                {/* Form Instruction */}
                                <p className="text-right font-semibold text-sm text-gray-800 mb-2 lg:mb-4">
                                    اطلب الآن أو حدد موعداً للطلب
                                </p>

                                {/* Location Input Field */}
                                <div className="relative mb-2 lg:mb-0">
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="ادخل الموقع"
                                        className="w-full h-12 rounded-lg border-2 border-gray-200 bg-white shadow-sm pr-12 pl-4 text-right text-sm focus:outline-none focus:border-blue-300 placeholder-gray-500"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-black rounded-full"></div>
                                    </div>
                                </div>

                                {/* Water Type and Quantity Selection */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-2">
                                    {/* Water Type Selection */}
                                    <div className="space-y-1 lg:space-y-2 lg:mt-4">
                                        <label className="block text-right text-sm font-semibold text-blue-500">
                                            اختر نوع المياه
                                        </label>
                                        <select
                                            value={waterType}
                                            onChange={(e) => setWaterType(e.target.value)}
                                            className="w-full h-11 rounded-lg border-2 border-gray-200 bg-white shadow-sm px-4 text-right text-sm focus:outline-none"
                                        >
                                            <option value="">صالح للشرب</option>
                                            <option value="natural">طبيعي</option>
                                            <option value="mineral">معدني</option>
                                            <option value="distilled">مقطر</option>
                                        </select>
                                    </div>

                                    {/* Water Quantity Selection */}
                                    <div className="space-y-1 lg:space-y-2 lg:mt-4">
                                        <label className="block text-right text-sm font-semibold text-blue-500">
                                            اختر حجم المياه
                                        </label>
                                        <select
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            className="w-full h-11 rounded-lg border-2 border-gray-200 bg-white shadow-sm px-4 text-right text-sm focus:outline-none"
                                        >
                                            <option value="">6 طن</option>
                                            <option value="1">1 طن</option>
                                            <option value="2">2 طن</option>
                                            <option value="3">3 طن</option>
                                            <option value="4">4 طن</option>
                                            <option value="5">5 طن</option>
                                            <option value="6">6 طن</option>
                                            <option value="7">7 طن</option>
                                            <option value="8">8 طن</option>
                                            <option value="9">9 طن</option>
                                            <option value="10">10 طن</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 lg:pt-2 lg:gap-4">
                                    {/* Order Now Button */}
                                    <button 
                                        onClick={handleOrderNow}
                                        className="w-full h-12 lg:h-14 rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center"
                                    >
                                        <span className="text-white text-base lg:text-lg font-normal">
                                            اطلب الآن
                                        </span>
                                    </button>

                                    {/* Schedule Order Button */}
                                    <button 
                                        onClick={handleSchedule}
                                        className="w-full h-12 lg:h-14 rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Image
                                            src="/vector (15).png"
                                            alt="Calendar"
                                            width={25}
                                            height={25}
                                            className="object-contain"
                                        />
                                        <span className="text-white text-base lg:text-lg font-normal">
                                            جدول طلبك
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Map Image */}
                    <div className="lg:w-1/2 h-56 lg:h-auto relative order-first lg:order-last">
                        <Image
                            src="/location1.jpg"
                            alt="Location Map"
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}