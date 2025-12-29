'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function OrderForm() {
    const [date, setDate] = useState('');
    const [waterType, setWaterType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [location, setLocation] = useState('');

    return (
        <div className="min-h-screen p-4 flex items-center justify-center">
            <div className="container max-w-6xl bg-white rounded-3xl shadow-lg overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                    {/* Left side - Form */}
                    <div className="lg:w-1/2 p-6 lg:p-8">
                        <div className="max-w-md mx-auto">
                            {/* Car image - shown on mobile */}
                            <div className="w-48 h-28 mx-auto mb-8 lg:mb-12 lg:w-56 lg:h-32">
                                <Image
                                    src="/images/car.png"
                                    alt="Delivery Car"
                                    width={224}
                                    height={128}
                                    className="object-contain w-full h-full"
                                />
                            </div>

                            {/* Form content */}
                            <div className="space-y-8">
                                <p className="text-right font-semibold text-sm text-gray-800">
                                    اطلب الآن أو حدد موعداً للطلب
                                </p>

                                {/* Location input */}
                                <div className="relative">
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
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

                                    <div className="space-y-2">
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

                                {/* Action buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                    <button className="w-full h-14 rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center">
                                        <span className="text-white text-lg font-normal">
                                            اطلب الآن
                                        </span>
                                    </button>

                                    <button className="w-full h-14 rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center">
                                        <span className="text-white text-lg font-normal">
                                            جدول طلبك
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Map image */}
                    <div className="lg:w-1/2 h-64 lg:h-auto relative order-first lg:order-last">
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