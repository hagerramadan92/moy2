'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function OrderForm() {
    const [date, setDate] = useState('');
    const [waterType, setWaterType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [location, setLocation] = useState('');

    return (
        <div className="flex flex-col items-center min-h-screen p-4 gap-8">

            <div
                className="w-full  h-[582px] opacity-100 rounded-[32px] bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
                style={{
                    boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
                }}
            >
                <div className="flex flex-col lg:flex-row h-full">
                    <div className="lg:w-1/2 p-8 order-2 lg:order-1">
                        <div className="h-8"></div>

                        <div className="w-full max-w-[466px] h-[451px] opacity-100 flex flex-col gap-20 mx-auto">
                            <div className="w-[186px] h-[102px] opacity-100 mx-auto">
                                <Image
                                    src="/images/car.png"
                                    alt="Delivery Car"
                                    width={186}
                                    height={102}
                                    className="object-contain"
                                />
                            </div>

                            <div className="w-full max-w-[466px] h-[321px] opacity-100 flex flex-col gap-7">
                                <p className="w-[374px] text-right font-cairo font-semibold text-[14px] leading-[100%] text-black mr-2 ml-0">
                                    اطلب المويه الآن، أو حدِّد موعداً لإجراء الطلب في وقت لاحق
                                </p>



                                <div className="w-[466px] h-[42px] relative">
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="ادخل الموقع"
                                        className="w-full h-full rounded-[6px] border-2 border-[#e0e0e0] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.07)] pr-12 pl-4 font-cairo text-[14px] focus:outline-none focus:border-blue-300 placeholder:text-gray-500 text-right"
                                        style={{
                                            boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.07)',
                                        }}
                                    />
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-[28px] h-[28px] flex items-center justify-center">
                                        <div className="w-[8px] h-[8px] bg-black rounded-full"></div>
                                    </div>
                                </div>


                                <div className="w-[426px] h-[83px] opacity-100 flex justify-between gap-2 mr-[-4px]">
                                    <div className="w-[230px] h-[56px] rounded-[14px] p-[9.13px] flex flex-col gap-[9.13px]">
                                        <div className="w-[93px] h-[40px] flex items-center justify-end gap-[10px] p-[10px] ml-auto mr-0">
                                            <span
                                                className="w-[73px] h-[20px] font-cairo font-semibold text-[12px] leading-[170%] text-right text-[#579BE8] bg-white px-2 py-1 rounded flex items-center justify-center whitespace-nowrap"
                                                style={{ backgroundColor: 'white', color: '#579BE8' }}
                                            >
                                                اختر نوع المويه
                                            </span>
                                        </div>

                                        <div className="w-[230px] h-[43px] flex justify-between rounded-[6px] border-2 border-[#e0e0e0] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.07)] px-4 py-[9px]">
                                            <select
                                                value={waterType}
                                                onChange={(e) => setWaterType(e.target.value)}
                                                className="w-full text-right font-cairo text-[14px] focus:outline-none bg-transparent"
                                            >
                                                <option value="">صالح للشرب</option>
                                                <option value="natural">طبيعي</option>
                                                <option value="mineral">معدني</option>
                                                <option value="distilled">مقطر</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="w-[230px] h-[56px] rounded-[14px] p-[9.13px] flex flex-col gap-[9.13px]">
                                        <div className="w-[93px] h-[40px] flex items-center justify-end gap-[10px] p-[10px] ml-auto mr-0">
                                            <span
                                                className="w-[78px] h-[20px] font-cairo font-semibold text-[12px] leading-[170%] text-right text-[#579BE8] bg-white px-2 py-1 rounded flex items-center justify-center whitespace-nowrap"
                                                style={{ backgroundColor: 'white', color: '#579BE8' }}
                                            >
                                                اختر حجم المويه
                                            </span>
                                        </div>

                                        <div className="w-[230px] h-[43px] flex justify-between rounded-[6px] border-2 border-[#e0e0e0] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.07)] px-4 py-[9px]">
                                            <select
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                className="w-full text-right font-cairo text-[14px] focus:outline-none bg-transparent"
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
                                </div>

                                <div className="w-[466px] h-[56px] flex justify-between mt-4">
                                    <button className="w-[230px] h-[56px] rounded-[14px] p-[9.13px] bg-[#579BE8] hover:bg-[#4788d5] transition-colors flex items-center justify-center">
                                        <span className="font-cairo font-normal text-[20px] leading-[170%] text-right text-white">
                                            اطلب الآن
                                        </span>
                                    </button>

                                    <button className="w-[230px] h-[56px] rounded-[14px] p-[9.13px] bg-[#579BE8] hover:bg-[#4788d5] transition-colors flex items-center justify-center">
                                        <span className="font-cairo font-normal text-[20px] leading-[170%] text-right text-white">
                                            جدول طلبك
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* الصورة على اليمين */}
                    <div className="lg:w-1/2 h-full relative rounded-r-[32px] rounded-l-none lg:rounded-l-[0] lg:rounded-r-none  overflow-hidden order-1 lg:order-2">
                        <Image
                            src="/location1.jpg"
                            alt="Location"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}