// [file name]: Layout.js (المحدث)
// [file content begin]
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

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const pathname = usePathname();
  const [userId, setUserId] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  
  // Routes where navbar should be hidden
  const hideNavbarRoutes = ['/login', '/otp', '/register', '/forgot-password'];
  const hideNavbar = hideNavbarRoutes.includes(pathname);
  
  // Routes where chat should be hidden
  const hideChatRoutes = ['/login', '/otp', '/register', '/forgot-password'];
  const showChat = !hideChatRoutes.includes(pathname);

  // Get user ID from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId') || 
                        localStorage.getItem('user_id') || 
                        localStorage.getItem('id') ||
                        '39'; // Default fallback
    
   
    setUserId(storedUserId);
  }, []);

  // Handle opening chat modal
  const handleOpenChatModal = (participantId = null) => {
    
    setIsChatModalOpen(true);
    setShowSupportModal(false);
    
    // إذا كان هناك participantId، نقوم بتخزينه لتستخدمه ChatModal
    if (participantId) {
      // يمكنك تمريره مباشرة إلى ChatModal أو تخزينه
      
    }
  };

  // Handle opening support modal
  const handleOpenSupportModal = () => {
    
    setShowSupportModal(true);
    setIsChatModalOpen(true);
  };

  // Handle closing chat modal
  const handleCloseChatModal = () => {
   
    setIsChatModalOpen(false);
    setShowSupportModal(false);
    setSelectedChatId(null);
  };

  // Handle opening a specific chat (from notifications or elsewhere)
  const handleOpenSpecificChat = (chatId) => {
    
    setSelectedChatId(chatId);
    setIsChatModalOpen(true);
    setShowSupportModal(false);
  };

  // Handle starting a new chat with specific user/driver
  const handleStartNewChat = (participantId) => {
    
    setIsChatModalOpen(true);
    setShowSupportModal(false);
    setSelectedChatId(null);
    
    // يمكنك تمرير participantId إلى ChatModal عبر prop خاص أو حدث
    // هنا نستخدم custom event
    if (participantId) {
      window.dispatchEvent(new CustomEvent('start-new-chat', {
        detail: { participantId }
      }));
    }
  };

  // Handle login/logout events
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUserId = localStorage.getItem('userId') || 
                          localStorage.getItem('user_id') || 
                          localStorage.getItem('id') ||
                          '39';
      setUserId(storedUserId);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleStorageChange);
    window.addEventListener('userLoggedOut', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleStorageChange);
      window.removeEventListener('userLoggedOut', handleStorageChange);
    };
  }, []);

  // Check authentication on route change
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      
      if (!token && !pathname.includes('/login') && !pathname.includes('/register')) {
        console.warn('⚠️ المستخدم غير مسجل الدخول');
      }
    };

    checkAuth();
  }, [pathname]);

  // Listen for global chat events
  useEffect(() => {
    const handleStartNewChatEvent = (e) => {
      const { participantId } = e.detail;
  
      handleStartNewChat(participantId);
    };

    const handleOpenSpecificChatEvent = (e) => {
      const { chatId } = e.detail;
     
      handleOpenSpecificChat(chatId);
    };

    window.addEventListener('start-new-chat', handleStartNewChatEvent);
    window.addEventListener('open-specific-chat', handleOpenSpecificChatEvent);

    return () => {
      window.removeEventListener('start-new-chat', handleStartNewChatEvent);
      window.removeEventListener('open-specific-chat', handleOpenSpecificChatEvent);
    };
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        {!hideNavbar && <Navbar />}

        {/* Toaster Notifications */}
        <Toaster 
          position="top-center"
          reverseOrder={false}
          toastOptions={{ 
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '10px',
              fontFamily: 'inherit',
              fontSize: '14px',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />

        {/* Main Content */}
        <main className={!hideNavbar ? 'pt-16 md:pt-20' : ''}>
          {children}
        </main>

        {/* Floating Chat Icon (Only show if user is authenticated and not on auth pages) */}
        {showChat && userId && (
          <FloatingChatIcon 
            onOpenChat={() => handleOpenChatModal()}
            onOpenSupport={handleOpenSupportModal}
            currentUserId={userId}
            onOpenSpecificChat={handleOpenSpecificChat}
          />
        )}

        {/* Chat Modal */}
        <ChatModal 
          isOpen={isChatModalOpen || showSupportModal}
          onClose={handleCloseChatModal}
          currentUserId={userId}
          isSupport={showSupportModal}
          initialChatId={selectedChatId}
        />
      </div>
    </AuthProvider>
  );
};



// Component to handle global chat events
const GlobalChatEvents = ({ onOpenChat, onOpenSpecificChat, onStartNewChat }) => {
  useEffect(() => {
    // Listen for custom events from anywhere in the app
    const handleOpenChatEvent = () => onOpenChat();
    const handleOpenSpecificChatEvent = (e) => onOpenSpecificChat(e.detail.chatId, e.detail.participantId);
    const handleStartNewChatEvent = (e) => onStartNewChat(e.detail.participantId);

    // Chat events
    window.addEventListener('open-chat-modal', handleOpenChatEvent);
    window.addEventListener('open-specific-chat', handleOpenSpecificChatEvent);
    window.addEventListener('start-new-chat', handleStartNewChatEvent);

    // Support events
    window.addEventListener('open-support-modal', () => {
      // يمكنك تنفيذ خاصية الدعم هنا
     
    });

    // Notification click events
    window.addEventListener('notification-clicked', (e) => {
      const { type, data } = e.detail;
      
      if (type === 'chat' && data.chat_id) {
        onOpenSpecificChat(data.chat_id, data.sender_id);
      }
      
      if (type === 'message' && data.chat_id) {
        onOpenSpecificChat(data.chat_id);
      }
    });

    return () => {
      window.removeEventListener('open-chat-modal', handleOpenChatEvent);
      window.removeEventListener('open-specific-chat', handleOpenSpecificChatEvent);
      window.removeEventListener('start-new-chat', handleStartNewChatEvent);
      window.removeEventListener('open-support-modal', () => {});
      window.removeEventListener('notification-clicked', () => {});
    };
  }, [onOpenChat, onOpenSpecificChat, onStartNewChat]);

  return null;
};

export default Layout;
// [file content end]