'use client';

import { useState } from 'react';
import Image from 'next/image';
import PaymentModal2 from '../../ui/PaymentModal2';

/**
 * Component for scheduling water delivery orders with calendar and time selection
 */
export default function OrderSchedulePage({ onBack }) {
    // State for form inputs and selections
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('9:41 AM');
    const [location, setLocation] = useState('');
    const [waterType, setWaterType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Days of week in LTR order: SUN MON WED THU FRI SAT SUN
    const daysOfWeek = ['SUN', 'MON', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    
    // Get the column index for each day
    const getColumnForDay = (dayNum) => {
        // April 2025 starts on Wednesday (day 1 under WED column)
        const startColumn = 2; // WED is at index 2
        
        // Calculate which column this day falls under
        const column = (startColumn + (dayNum - 1)) % 7;
        return column;
    };

    // Create calendar days properly aligned
    const createCalendarDays = () => {
        const days = [];
        
        // First row (April 1-5, 2025 starts on Wednesday)
        // April 1st is under WED column (index 2)
        const firstRow = [
            { day: null, disabled: true },  // SUN
            { day: null, disabled: true },  // MON
            { day: 5, disabled: false },    // WED - April 1
            { day: 4, disabled: false },    // THU - April 2
            { day: 3, disabled: false },    // FRI - April 3
            { day: 2, disabled: false },    // SAT - April 4
            { day: 1, disabled: false },    // SUN - April 5
        ];
        
        // Second row (April 6-12)
        const secondRow = [
            { day: 12, disabled: false },    // SUN - April 6
            { day: 11, disabled: false },    // MON - April 7
            { day: 10, disabled: false },    // WED - April 8
            { day: 9, disabled: false },    // THU - April 9
            { day: 8, disabled: false },   // FRI - April 10
            { day: 7, disabled: false },   // SAT - April 11
            { day: 6, disabled: false },   // SUN - April 12
        ];
        
        // Third row (April 13-19)
        const thirdRow = [
            { day: 19, disabled: false },   // SUN - April 13
            { day: 18, disabled: false },   // MON - April 14
            { day: 17, disabled: false },   // WED - April 15
            { day: 16, disabled: false },   // THU - April 16
            { day: 15, disabled: false },   // FRI - April 17
            { day: 14, disabled: false },   // SAT - April 18
            { day: 13, disabled: false },   // SUN - April 19
        ];
        
        // Fourth row (April 20-26)
        const fourthRow = [
            { day: 26, disabled: false },   // SUN - April 20
            { day: 25, disabled: false },   // MON - April 21
            { day: 24, disabled: false },   // WED - April 22
            { day: 23, disabled: false },   // THU - April 23
            { day: 22, disabled: false },   // FRI - April 24
            { day: 21, disabled: false },   // SAT - April 25
            { day: 20, disabled: false },   // SUN - April 26
        ];
        
        // Fifth row (April 27-30)
        const fifthRow = [
            { day: null, disabled: false },   // SUN - April 27
            { day: null, disabled: false },   // MON - April 28
            { day: null, disabled: false },   // WED - April 29
            { day: 30, disabled: false },   // THU - April 30
            { day: 29, disabled: false },  // FRI
            { day: 28, disabled: false },  // SAT
            { day: 27, disabled: false },  // SUN
        ];
        
        return [...firstRow, ...secondRow, ...thirdRow, ...fourthRow, ...fifthRow];
    };

    const calendarDays = createCalendarDays();

    // Available time slots
    const times = [
        '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
        '9:41 AM', '10:00 AM', '10:30 AM', '11:00 AM',
        '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM',
        '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM',
        '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM',
        '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM',
    ];

    /**
     * Opens the payment modal when confirming order
     */
    const handleConfirmOrder = () => {
        setShowPaymentModal(true);
    };

    /**
     * Closes the payment modal
     */
    const handleClosePaymentModal = () => {
        setShowPaymentModal(false);
    };

    /**
     * Handles payment confirmation
     */
    const handlePaymentConfirm = (paymentMethod, driverId) => {
        console.log('Payment confirmed:', { paymentMethod, driverId });
        setShowPaymentModal(false);
    };

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap"
                rel="stylesheet"
            />

            <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center" style={{ fontFamily: "'Cairo', sans-serif" }}>
                <div className="w-full max-w-[1035px] h-auto min-h-[743px] bg-white rounded-3xl shadow-lg overflow-hidden">
                    <div className="flex flex-col lg:flex-row h-full">
                        {/* Left Section - Order Form */}
                        <div className="lg:w-1/2 p-4 md:p-8 flex items-center justify-center">
                            <div className="w-full max-w-[466px] flex flex-col items-center gap-7 md:gap-8">
                                {/* Delivery Car Image */}
                                <div className="w-full flex justify-center">
                                    <div className="w-[186px] h-[102px]">
                                        <Image
                                            src="/car22.png"
                                            alt="Delivery Car"
                                            width={186}
                                            height={102}
                                            className="object-contain w-full h-full"
                                        />
                                    </div>
                                </div>

                                {/* Form Container */}
                                <div className="w-full flex flex-col gap-5 md:gap-6">
                                    {/* Instruction Text */}
                                    <div className="w-full">
                                        <p className="text-right font-cairo font-semibold text-sm md:text-base text-black leading-tight">
                                            اطلب المويه الآن، أو حدِّد موعداً لاجراء الطلب في وقت لاحق
                                        </p>
                                    </div>

                                    {/* Location Input Field */}
                                    <div className="relative w-full">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="w-full h-12 md:h-14 rounded-lg border-2 border-[#E0E0E0] bg-white shadow-sm pr-12 pl-4 text-right text-sm md:text-base focus:outline-none focus:border-blue-300"
                                                placeholder=""
                                            />
                                            {/* Right aligned dot indicator */}
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center">
                                                <div className="w-2 h-2 bg-black rounded-full"></div>
                                            </div>
                                            {/* Left aligned placeholder text */}
                                            <div className="absolute right-10 top-1/2 -translate-y-1/2">
                                                <span className="text-sm md:text-base text-gray-400">
                                                    أدخل الموقع
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Schedule Date Display Field */}
                                    <div className="relative w-full">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                placeholder=""
                                                className="w-full h-12 md:h-14 rounded-lg border-2 border-[#E0E0E0] bg-white shadow-sm pr-12 pl-4 text-right text-sm md:text-base focus:outline-none cursor-default"
                                            />
                                            {/* Right aligned dot indicator */}
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center">
                                                <div className="w-2 h-2 bg-black rounded-full"></div>
                                            </div>
                                            {/* Left aligned placeholder text */}
                                            <div className="absolute right-10 top-1/2 -translate-y-1/2">
                                                <span className="text-sm md:text-base text-gray-400">
                                                    تاريخ الجدولة
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Water Type and Quantity Selection */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-right text-sm md:text-base font-semibold text-blue-500">
                                                اختر نوع المياه
                                            </label>
                                            <select
                                                value={waterType}
                                                onChange={(e) => setWaterType(e.target.value)}
                                                className="w-full h-11 md:h-12 rounded-lg border-2 border-gray-200 bg-white shadow-sm px-4 text-right text-sm md:text-base focus:outline-none"
                                            >
                                                <option value="">صالح للشرب</option>
                                                <option value="natural">طبيعي</option>
                                                <option value="mineral">معدني</option>
                                                <option value="distilled">مقطر</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-right text-sm md:text-base font-semibold text-blue-500">
                                                اختر حجم المياه
                                            </label>
                                            <select
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                className="w-full h-11 md:h-12 rounded-lg border-2 border-gray-200 bg-white shadow-sm px-4 text-right text-sm md:text-base focus:outline-none"
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

                                    {/* Order Now Button */}
                                    <button
                                        onClick={handleConfirmOrder}
                                        className="w-full h-12 md:h-14 rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center"
                                    >
                                        <span className="text-white text-base md:text-lg font-normal">
                                            اطلب الآن
                                        </span>
                                    </button>

                                    {/* Schedule Button */}
                                    <button
                                        onClick={handleConfirmOrder}
                                        className="w-full h-12 md:h-14 rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Image
                                            src="/vector (15).png"
                                            alt="Calendar"
                                            width={25}
                                            height={25}
                                            className="object-contain"
                                        />
                                        <span className="text-white text-base md:text-lg font-normal">
                                            جدول طلبك
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Section - Calendar and Time Selection */}
                        <div className="lg:w-1/2 p-4 md:p-8 bg-white">
                            <div className="h-full flex flex-col items-center lg:mt-16">
                                {/* Section Title */}
                                <h2 className="text-center mb-6 md:mb-8 font-cairo font-bold text-lg md:text-xl text-black">
                                    اختر التاريخ والوقت المناسب
                                </h2>

                                {/* Calendar Container */}
                                <div className="flex-1 w-full flex flex-col items-center">
                                    {/* Calendar Navigation Header - Styled according to specs */}
                                    <div 
                                        className="mb-4"
                                        style={{
                                            width: '370px',
                                            height: '40px',
                                            position: 'relative'
                                        }}
                                    >
                                        {/* Left side: Arrow image */}
                                        <div 
                                            className="flex items-center gap-7"
                                            style={{
                                                position: 'absolute',
                                                left: '296px',
                                                top: '7px',
                                                width: '58px',
                                                height: '24px'
                                            }}
                                        >
                                            <Image
                                                src="/Arrows.png"
                                                alt="Navigation Arrows"
                                                width={58}
                                                height={24}
                                                className="object-contain"
                                            />
                                        </div>

                                        {/* Right side: Month navigation */}
                                        <div 
                                            className="flex items-center gap-4"
                                            style={{
                                                position: 'absolute',
                                                left: '16px',
                                                top: '13px',
                                                width: '98px',
                                                height: '24px'
                                            }}
                                        >
                                            {/* Less than symbol */}
                                            <div 
                                                style={{
                                                    width: '10px',
                                                    height: '18px',
                                                    fontFamily: 'SF Pro',
                                                    fontWeight: 700,
                                                    fontSize: '15px',
                                                    lineHeight: '18px',
                                                    letterSpacing: '-0.5px',
                                                    color: '#0088FF',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                ‹
                                            </div>
                                            
                                            {/* Month and year */}
                                            <div 
                                                style={{
                                                    width: '100px',
                                                    height: '22px',
                                                    fontFamily: 'Cairo',
                                                    fontWeight: 590,
                                                    fontSize: '17px',
                                                    lineHeight: '22px',
                                                    letterSpacing: '-0.43px',
                                                    color: '#000000',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                April 2025
                                            </div>
                                        </div>
                                    </div>

                                    {/* Days of Week Header */}
                                    <div 
                                        className="grid grid-cols-7 mb-4"
                                        style={{
                                            width: '370px',
                                            height: '20px',
                                            justifyContent: 'space-between',
                                            paddingRight: '16px',
                                            paddingLeft: '16px'
                                        }}
                                    >
                                        {daysOfWeek.map((day, index) => (
                                            <div
                                                key={index}
                                                className="text-center font-cairo font-medium text-xs text-gray-500 flex items-center justify-center"
                                                style={{
                                                    height: '20px',
                                                    width: '44px'
                                                }}
                                            >
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Calendar Days Grid - 5 rows of 7 days each */}
                                    <div 
                                        className="grid grid-cols-7 gap-0 mb-8"
                                        style={{
                                            width: '370px'
                                        }}
                                    >
                                        {calendarDays.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-center"
                                                style={{
                                                    width: '44px',
                                                    height: '44px'
                                                }}
                                            >
                                                {item.day ? (
                                                    <button
                                                        onClick={() => setSelectedDate(item.day.toString())}
                                                        disabled={item.disabled}
                                                        className={`
                                                            w-10 h-10 flex items-center justify-center
                                                            transition-colors duration-200 rounded-full
                                                            ${selectedDate === item.day.toString()
                                                                ? 'bg-[#0088FF] text-white'
                                                                : item.disabled
                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                    : 'bg-white hover:bg-gray-100 text-black'
                                                            }
                                                        `}
                                                        style={{
                                                            fontFamily: 'SF Pro',
                                                            fontWeight: 400,
                                                            fontSize: '20px',
                                                            lineHeight: '25px',
                                                            letterSpacing: '-0.45px'
                                                        }}
                                                    >
                                                        {item.day}
                                                    </button>
                                                ) : (
                                                    <div className="w-10 h-10"></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Time Selection Section - Swapped positions */}
                                    <div 
                                        className="flex justify-between items-center"
                                        style={{
                                            width: '370px',
                                            height: '52px',
                                            paddingRight: '16px',
                                            paddingLeft: '16px'
                                        }}
                                    >
                                        {/* Time text label (now on left in LTR) */}
                                        <div 
                                            style={{
                                                width: '136px',
                                                height: '22px',
                                                fontFamily: 'SF Pro',
                                                fontWeight: 400,
                                                fontSize: '17px',
                                                lineHeight: '22px',
                                                letterSpacing: '-0.43px',
                                                color: '#000000',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            Time
                                        </div>

                                        {/* Time button with dropdown (now on right in LTR) */}
                                        <div className="relative">
                                            <div 
                                                className="flex items-center justify-center cursor-pointer"
                                                style={{
                                                    width: '86px',
                                                    height: '34px',
                                                    borderRadius: '100px',
                                                    background: '#7676801F',
                                                    padding: '6px 11px',
                                                    gap: '10px'
                                                }}
                                            >
                                                <span 
                                                    style={{
                                                        width: '64px',
                                                        height: '22px',
                                                        fontFamily: 'SF Pro',
                                                        fontWeight: 400,
                                                        fontSize: '17px',
                                                        lineHeight: '22px',
                                                        letterSpacing: '-0.43px',
                                                        color: '#000000',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    {selectedTime}
                                                </span>
                                            </div>
                                            
                                            {/* Hidden select for actual functionality */}
                                            <select
                                                value={selectedTime}
                                                onChange={(e) => setSelectedTime(e.target.value)}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                style={{
                                                    width: '86px',
                                                    height: '34px'
                                                }}
                                            >
                                                {times.map((time) => (
                                                    <option key={time} value={time}>{time}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <PaymentModal2
                isOpen={showPaymentModal}
                onClose={handleClosePaymentModal}
                onConfirm={handlePaymentConfirm}
                selectedDriverId={null}
            />
        </>
    );
}