'use client';

import React from 'react';
import Navbar from './Navbar';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import FloatingChatIcon from '@/components/Chat/FloatingChatIcon';
import ChatModal from '@/components/Chat/ChatModal';
const Layout = ({ children }) => {
	const [showSupportPage, setShowSupportPage] = useState(false);
	  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
	const pathname = usePathname();

  const handleOpenChatModal = () => {
    setIsChatModalOpen(true);
  };
   const handleStartSupportChat = () => {
    setIsChatModalOpen(false);
    setShowSupportPage(true);
  };
  const handleHelpClick = () => {
    setShowSupportPage(true);
  };

  const handleBackFromSupport = () => {
    setShowSupportPage(false);
  };
   const [userId, setUserId] = useState(null);
	const hideNavbarRoutes = ['/login', '/otp'];
	const hideNavbar = hideNavbarRoutes.includes(pathname);
	  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedDriverId = localStorage.getItem('currentDriverId');
    
    setUserId(storedUserId || 'user-default');
    // setDriverId(storedDriverId || 'driver-default');
  }, []);
   const [isChatOpen, setIsChatOpen] = useState(false);
  const handleStartChatWithDriver = () => {
    setIsChatModalOpen(false);
    setIsChatOpen(true); // افتح نافذة الدردشة مع السائق
  };
const handleOpenSpecificChat = (chatId) => {
    setIsChatModalOpen(false);
    setActiveChatId(chatId);
    setIsChatOpen(true);
  };
  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };
  



 

 
 const handleCloseChatModal = () => {
    setIsChatModalOpen(false);
  };
	return (
		<AuthProvider>
			<div>
				{!hideNavbar && <Navbar />}

				<Toaster 
					position="top-center"
					reverseOrder={false}
					toastOptions={{ duration: 3000 }}
				/>

				<div className={!hideNavbar ? 'pt-20' : ''}>
					{children}
				</div>
				 <FloatingChatIcon 
						onOpenChat={handleOpenChatModal}
						onOpenSupport={() => setShowSupportPage(true)}
						currentUserId={userId}
					/>
					 {/* Chat Modal */}
      <ChatModal 
        isOpen={isChatModalOpen}
        onClose={handleCloseChatModal}
        currentUserId={userId}
        onStartChat={handleStartChatWithDriver}
        onStartSupport={handleStartSupportChat}
      />

      {/* Chat with Driver Window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-4 z-50 w-96 h-[600px]">
          <ChatWithDriver 
            driverId={driverId}
            userId={userId}
            chatId={activeChatId}
            onClose={handleCloseChat}
          />
        </div>
      )}
			</div>
		</AuthProvider>
	);
};

export default Layout;
