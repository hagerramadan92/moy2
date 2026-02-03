// components/ActionToast.js
'use client';

import { useEffect, useState } from 'react';
import { useNotification } from '@/context/NotificationContext';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
  FaInfoCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const ActionToast = () => {
  const { actionToasts, removeActionToast } = useNotification();
  const [visibleToasts, setVisibleToasts] = useState([]);

  useEffect(() => {
    // تحديث الـ Toasts المرئية عند تغيير actionToasts
    setVisibleToasts(actionToasts);
    
    // تنظيف الـ Toasts القديمة تلقائياً
    const timeoutIds = actionToasts.map(toast => {
      return setTimeout(() => {
        removeActionToast(toast.id);
      }, 5000);
    });
    
    return () => {
      timeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
    };
  }, [actionToasts, removeActionToast]);

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
          border: 'border-blue-200',
          text: 'text-blue-900',
          icon: <FaCheckCircle className="h-5 w-5 text-blue-600" />
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
          border: 'border-blue-300',
          text: 'text-blue-900',
          icon: <FaExclamationCircle className="h-5 w-5 text-blue-700" />
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
          border: 'border-blue-300',
          text: 'text-blue-900',
          icon: <FaExclamationTriangle className="h-5 w-5 text-blue-700" />
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
          border: 'border-blue-300',
          text: 'text-blue-900',
          icon: <FaInfoCircle className="h-5 w-5 text-blue-600" />
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
          border: 'border-blue-300',
          text: 'text-blue-900',
          icon: <FaInfoCircle className="h-5 w-5 text-blue-600" />
        };
    }
  };

  const handleClose = (id) => {
    removeActionToast(id);
  };

  if (visibleToasts.length === 0) return null;

  return (
    <div className="fixed top-4 start-4 z-[1001] space-y-3">
      {visibleToasts.map((toast) => {
        const styles = getToastStyles(toast.type);
        
        return (
          <div
            key={toast.id}
            className={`rounded-xl border p-4 shadow-lg backdrop-blur-sm bg-blue-50/80 ${styles.border} animate-slideInRight`}
            style={{ 
              animation: 'slideInRight 0.3s ease-out',
              background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.9) 0%, rgba(219, 234, 254, 0.9) 100%)'
            }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {styles.icon}
              </div>
              <div className="mr-3 flex-1">
                <div className="flex justify-between items-start">
                  <p className={`text-sm font-medium ${styles.text}`}>
                    {toast.message}
                  </p>
                  <button
                    onClick={() => handleClose(toast.id)}
                    className="text-blue-400 hover:text-blue-600 transition-colors duration-200"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-blue-600/70">
                  {new Date(toast.timestamp).toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ActionToast;