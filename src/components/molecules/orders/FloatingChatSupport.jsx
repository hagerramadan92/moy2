'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, ChevronRight, Send, ChevronLeft, Star, Clock } from 'lucide-react';
import Image from 'next/image';
import ChatWithDriver from './ChatWithDriver';
import { sendChatMessage, getChatDrivers } from '../../../utils/chatApi';

/**
 * Floating Chat Support Button with Drivers List
 */
export default function FloatingChatSupport({ orderId, userId, driverId, driverInfo }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [view, setView] = useState('greeting'); // 'greeting' | 'drivers' | 'chat'
  const inputRef = useRef(null);

  // Show greeting only on first open
  useEffect(() => {
    if (isOpen && showGreeting) {
      const timer = setTimeout(() => {
        setShowGreeting(false);
        setView('drivers');
      }, 3000); // Show greeting for 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isOpen, showGreeting]);

  // Load drivers when transitioning to drivers view
  useEffect(() => {
    if (view === 'drivers' && drivers.length === 0 && !isLoadingDrivers) {
      fetchDriversList();
    }
  }, [view]);

  // Focus input when in chat view
  useEffect(() => {
    if (view === 'chat' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [view]);

  const fetchDriversList = async () => {
    setIsLoadingDrivers(true);
    try {
      const driversList = await getChatDrivers();
      setDrivers(driversList);
      
      // If only one driver, auto-select
      if (driversList.length === 1) {
        selectDriver(driversList[0]);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setIsLoadingDrivers(false);
    }
  };

  const selectDriver = (driver) => {
    setSelectedDriver(driver);
    setView('chat');
    setInputValue('');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (inputValue.trim() === '' || !orderId || !userId || !selectedDriver?.id || isSending) return;

    const messageText = inputValue;
    setInputValue('');
    setIsSending(true);

    try {
      const messageData = {
        chat_id: orderId, // Using orderId as chat_id for the endpoint path
        order_id: orderId,
        sender_id: userId,
        receiver_id: selectedDriver.id,
        message: messageText,
        type: 'text',
      };

      console.log('Sending quick message from floating chat:', messageData);
      await sendChatMessage(messageData);
      setMessageCount(prev => prev + 1);
    } catch (error) {
      console.error('Error sending quick message:', error);
      setInputValue(messageText);
      alert('خطأ في الإرسال. يرجى المحاولة مرة أخرى');
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenFullChat = () => {
    setIsChatOpen(true);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987] shadow-lg shadow-[#579BE8]/40 hover:shadow-xl hover:shadow-[#579BE8]/50 flex items-center justify-center text-white z-40 transition-all duration-300 hover:from-[#4a8dd8] hover:via-[#3d7bc7] hover:to-[#0f3d6f]"
        aria-label="فتح الدعم والمساعدة"
      >
        <motion.div
          animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </motion.div>

        {/* Notification Badge */}
        {messageCount > 0 && !isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
          >
            {messageCount > 9 ? '9+' : messageCount}
          </motion.div>
        )}
      </motion.button>

      {/* Support Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-80 max-h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-40 flex flex-col"
          >
            {/* Greeting Message */}
            {view === 'greeting' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987] text-white p-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3"
                >
                  <MessageCircle size={24} />
                </motion.div>
                <h3 className="text-lg font-bold mb-2">أهلا وسهلا</h3>
                <p className="text-sm opacity-90">أنا هنا لمساعدتك في أي استفسار أو مشكلة</p>
                <motion.div
                  className="mt-4 flex items-center justify-center gap-1 text-xs opacity-75"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span>جاري التحميل</span>
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                    >
                      •
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Drivers List View */}
            {view === 'drivers' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col h-full"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987] text-white p-4">
                  <h3 className="font-bold text-base">السائقين</h3>
                  <p className="text-xs opacity-80 mt-1">اختر سائق للدردشة معه</p>
                </div>

                {/* Drivers List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {isLoadingDrivers ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin">
                        <div className="w-6 h-6 border-3 border-gray-300 border-t-[#579BE8] rounded-full"></div>
                      </div>
                    </div>
                  ) : drivers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-700">
                      <MessageCircle size={32} className="mb-2 opacity-30" />
                      <p className="text-xs">لا توجد محادثات سابقة</p>
                    </div>
                  ) : (
                    drivers.map((driver) => (
                      <motion.button
                        key={driver.id}
                        whileHover={{ backgroundColor: '#f9fafb' }}
                        onClick={() => selectDriver(driver)}
                        className="w-full text-right rounded-xl p-3 border border-gray-200 hover:border-[#579BE8] transition-all flex items-center gap-3 group"
                      >
                        {/* Driver Image */}
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-200 group-hover:ring-[#579BE8]">
                          {driver.image ? (
                            <Image
                              src={driver.image}
                              alt={driver.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#579BE8] to-[#124987] flex items-center justify-center text-white text-xs font-bold">
                              {driver.name?.charAt(0) || 'D'}
                            </div>
                          )}
                        </div>

                        {/* Driver Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-gray-900 truncate">{driver.name || 'السائق'}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {driver.rating && (
                              <div className="flex items-center gap-0.5">
                                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-gray-600">{driver.rating}</span>
                              </div>
                            )}
                            {driver.status && (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                {driver.status}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronLeft size={16} className="text-gray-400 group-hover:text-[#579BE8] transition-colors" />
                      </motion.button>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Chat View */}
            {view === 'chat' && selectedDriver && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col h-full"
              >
                {/* Header with Back Button */}
                <div className="bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987] text-white p-4 flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => {
                      setView('drivers');
                      setSelectedDriver(null);
                    }}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </motion.button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate">{selectedDriver.name || 'السائق'}</h3>
                    <p className="text-xs opacity-80">{selectedDriver.status || 'متاح'}</p>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                  {/* Welcome Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                      {selectedDriver.image ? (
                        <Image
                          src={selectedDriver.image}
                          alt={selectedDriver.name}
                          width={28}
                          height={28}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#579BE8] to-[#124987] flex items-center justify-center text-white text-xs font-bold">
                          {selectedDriver.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-white rounded-xl p-2.5 text-xs leading-relaxed border border-gray-200">
                        مرحبا! كيف يمكنني مساعدتك؟
                      </div>
                      <span className="text-xs text-gray-400 px-2 mt-1 block">الآن</span>
                    </div>
                  </motion.div>
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 bg-white p-3">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="اكتب رسالتك..."
                      disabled={isSending}
                      className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm border border-gray-200 focus:border-[#579BE8] focus:outline-none focus:ring-1 focus:ring-[#579BE8] disabled:opacity-50"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={inputValue.trim() === '' || isSending}
                      className="bg-gradient-to-r from-[#579BE8] to-[#124987] hover:from-[#4a8dd8] hover:to-[#0f3d6f] disabled:opacity-50 text-white rounded-lg px-3 py-2 flex items-center justify-center transition-all"
                    >
                      {isSending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send size={16} />
                      )}
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Chat Window */}
      <ChatWithDriver
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        driverInfo={driverInfo}
        orderId={orderId}
        userId={userId}
        driverId={driverId}
      />
    </>
  );
}
