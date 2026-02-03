// components/ConfirmationModal.js
'use client';

import { useEffect } from 'react';
import { FaExclamationTriangle, FaTimes, FaTrash, FaCheck } from 'react-icons/fa';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "تأكيد الحذف",
  message = "هل أنت متأكد من رغبتك في حذف هذا العنصر؟",
  confirmText = "نعم، احذف",
  cancelText = "إلغاء",
  type = "danger",
  itemCount = 0
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <FaExclamationTriangle className="h-12 w-12 text-red-600" />,
          button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          iconBg: 'bg-red-100'
        };
      case 'warning':
        return {
          icon: <FaExclamationTriangle className="h-12 w-12 text-yellow-600" />,
          button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          iconBg: 'bg-yellow-100'
        };
      case 'success':
        return {
          icon: <FaCheck className="h-12 w-12 text-green-600" />,
          button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
          iconBg: 'bg-green-100'
        };
      default:
        return {
          icon: <FaExclamationTriangle className="h-12 w-12 text-blue-600" />,
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          iconBg: 'bg-blue-100'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 bg-opacity-50 z-[9998] transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center" dir="rtl">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-right shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            {/* Modal Content */}
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${typeStyles.iconBg}`}>
                  {typeStyles.icon}
                </div>
                <div className="mt-3 text-center sm:mr-4 sm:mt-0 sm:text-right">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    {title}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {message}
                    </p>
                    {itemCount > 0 && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-center">
                          <FaTrash className="h-4 w-4 text-red-500 ml-2" />
                          <span className="text-sm font-medium text-red-700">
                            سيتم حذف {itemCount} إشعار
                          </span>
                        </div>
                        <p className="text-xs text-red-600 mt-1">
                          هذا الإجراء لا يمكن التراجع عنه
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Actions */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse gap-2 sm:px-6">
              <button
                type="button"
                className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:ml-3 sm:w-auto ${typeStyles.button}`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                onClick={onClose}
              >
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;