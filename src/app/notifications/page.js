'use client';

import { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import ConfirmationModal from '../../components/Notifications/ConfirmationModal';
import ActionToast from '../../components/Notifications/ActionToast';
import {
  FaCheck,
  FaTrash,
  FaBell,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaChevronRight,
  FaChevronLeft,
  FaFilter
} from 'react-icons/fa';
import { GoBell } from "react-icons/go";
// Skeleton Components
const SkeletonHeader = () => (
  <div className="mb-4 sm:mb-8">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
      <div className="flex items-center space-x-3">
        <div className="bg-gray-200 md:p-3 p-1.5 rounded-lg animate-pulse">
          <div className="md:h-8 md:w-8 h-5 w-5"></div>
        </div>
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="h-8 w-32 bg-gray-200 rounded-full animate-pulse mt-2 md:mt-0"></div>
    </div>
  </div>
);

const SkeletonControlBar = () => (
  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center space-x-4">
        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  </div>
);

const SkeletonNotificationItem = () => (
  <div className="p-6 border-b border-gray-100">
    <div className="flex items-start">
      <div className="h-5 w-5 bg-gray-200 rounded animate-pulse mr-4"></div>
      <div className="flex-1 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-4">
            <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonPagination = () => (
  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
      <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
      <div className="flex items-center space-x-2">
        <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ filter }) => (
  <div className="p-6 sm:p-8 md:p-12 text-center">
    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-blue-100 rounded-full mb-3 sm:mb-4 md:mb-6">
      <FaBell className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-blue-600" />
    </div>
    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
      {filter === 'all' ? 'لا توجد إشعارات' : 
       filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 
       'لا توجد إشعارات مقروءة'}
    </h3>
    <p className="text-xs sm:text-sm md:text-base text-gray-500 max-w-md mx-auto px-2">
      {filter === 'all' ? 'عندما تتلقى إشعارات جديدة، ستظهر هنا' :
       filter === 'unread' ? 'جميع إشعاراتك تمت قراءتها' :
       'لم تقرأ أي إشعارات بعد'}
    </p>
  </div>
);

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotification();

  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [initialLoading, setInitialLoading] = useState(true);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      await loadNotifications();
      setInitialLoading(false);
    };
    
    fetchData();
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true;
  });

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleSelectNotification = (id) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(notificationId => notificationId !== id)
        : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) return;
    setShowDeleteSelectedConfirm(true);
  };

  const confirmDeleteSelected = async () => {
    try {
      setDeleting(true);
      for (const id of selectedNotifications) {
        await deleteNotification(id);
      }
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error deleting selected notifications:', error);
    } finally {
      setDeleting(false);
      setShowDeleteSelectedConfirm(false);
    }
  };

  const handleDeleteSingle = async (id) => {
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    setShowDeleteAllConfirm(true);
  };

  const confirmClearAll = async () => {
    try {
      setDeleting(true);
      const confirmation = await clearAll();
      const result = await confirmation.confirm();
      console.log('تم حذف الكل:', result);
    } catch (error) {
      console.error('خطأ في حذف الكل:', error);
    } finally {
      setDeleting(false);
      setShowDeleteAllConfirm(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return <FaInfoCircle className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <FaExclamationCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <FaExclamationCircle className="h-5 w-5 text-red-500" />;
      case 'success':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <FaEnvelope className="h-5 w-5 text-gray-500" />;
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-2 sm:py-4 md:py-8" dir="rtl">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <SkeletonHeader />
          
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
            <SkeletonControlBar />
            
            <div className="divide-y divide-gray-100">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonNotificationItem key={i} />
              ))}
            </div>
            
            <SkeletonPagination />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2 sm:py-4 md:py-8" dir="rtl">
      {/* Action Toasts */}
      <ActionToast />
      
      {/* Confirmation Modal for Delete All */}
      <ConfirmationModal
        isOpen={showDeleteAllConfirm}
        onClose={() => setShowDeleteAllConfirm(false)}
        onConfirm={confirmClearAll}
        title="حذف جميع الإشعارات"
        message="هل أنت متأكد من رغبتك في حذف جميع الإشعارات؟ هذا الإجراء لا يمكن التراجع عنه."
        confirmText="نعم، احذف الكل"
        cancelText="إلغاء"
        type="danger"
        itemCount={notifications.length}
      />
      
      {/* Confirmation Modal for Delete Selected */}
      <ConfirmationModal
        isOpen={showDeleteSelectedConfirm}
        onClose={() => setShowDeleteSelectedConfirm(false)}
        onConfirm={confirmDeleteSelected}
        title="حذف الإشعارات المحددة"
        message={`هل أنت متأكد من رغبتك في حذف ${selectedNotifications.length} إشعار؟`}
        confirmText="نعم، احذف المحدد"
        cancelText="إلغاء"
        type="danger"
        itemCount={selectedNotifications.length}
      />
      
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="mb-3 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-blue-100 p-1.5 sm:p-2 md:p-3 rounded-lg">
                <FaBell className="h-4 w-4 sm:h-5 sm:w-5 md:h-8 md:w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">الإشعارات</h1>
                <p className="text-gray-600 mt-0.5 sm:mt-1 text-xs sm:text-sm md:text-base">
                  إدارة جميع إشعاراتك في مكان واحد
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800">
                  <GoBell className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                  <span className="hidden sm:inline">{unreadCount} إشعار غير مقروء</span>
                  <span className="sm:hidden">{unreadCount}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
          <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 md:gap-4">
              <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 w-full sm:w-auto">
                <button
                  onClick={handleSelectAll}
                  disabled={filteredNotifications.length === 0 || loading}
                  className={`flex items-center text-xs sm:text-sm ${
                    filteredNotifications.length === 0 || loading
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                    onChange={handleSelectAll}
                    disabled={filteredNotifications.length === 0 || loading}
                    className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 border-gray-300 rounded ml-1.5 sm:ml-2"
                  />
                  <span className="hidden sm:inline">تحديد الكل</span>
                  <span className="sm:hidden">الكل</span>
                </button>
                
                {selectedNotifications.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    disabled={loading || deleting}
                    className={`inline-flex items-center 
                      px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                      loading || deleting
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'text-white bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    <FaTrash className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                    <span className="hidden sm:inline">حذف المحدد ({selectedNotifications.length})</span>
                    <span className="sm:hidden">({selectedNotifications.length})</span>
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 w-full sm:w-auto justify-start sm:justify-end">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <FaFilter className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 hidden sm:block" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    disabled={loading || deleting}
                    className={`border border-gray-300 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      loading || deleting ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="all">الكل</option>
                    <option value="unread">غير مقروء</option>
                    <option value="read">مقروء</option>
                  </select>
                </div>
                
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0 || loading || deleting}
                  className={`inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    unreadCount === 0 || loading || deleting
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'text-white bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <FaCheck className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                  <span className="hidden sm:inline">تعليم الكل كمقروء</span>
                  <span className="sm:hidden">مقروء</span>
                </button>
                
                <button
                  onClick={handleClearAll}
                  disabled={notifications.length === 0 || loading || deleting}
                  className={`inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    notifications.length === 0 || loading || deleting
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <FaTrash className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                  <span className="hidden sm:inline">مسح الكل</span>
                  <span className="sm:hidden">مسح</span>
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {loading && notifications.length > 0 ? (
              <div className="p-2 sm:p-4">
                {[1, 2, 3].map((i) => (
                  <SkeletonNotificationItem key={i} />
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <EmptyState filter={filter} />
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-2 sm:p-4 md:p-6 hover:bg-gray-50 transition-colors ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => handleSelectNotification(notification.id)}
                      disabled={loading || deleting}
                      className="mt-0.5 sm:mt-1 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                    />
                    
                    <div className="mr-0 sm:mr-2 md:mr-4 flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1 sm:mb-2 md:mb-3 gap-2">
                        <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 min-w-0 flex-1">
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <h3 className={`text-sm sm:text-base md:text-lg font-semibold truncate ${
                            notification.is_read ? 'text-gray-900' : 'text-blue-900'
                          }`}>
                            {notification.title}
                          </h3>
                        </div>
                        
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                          {!notification.is_read && (
                            <span className="inline-flex items-center px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              جديد
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteSingle(notification.id)}
                            disabled={loading || deleting}
                            className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                            title="حذف الإشعار"
                          >
                            <FaTrash className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-1 sm:mb-2 md:mb-4 leading-relaxed text-right text-xs sm:text-sm md:text-base">
                        {notification.message}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 md:gap-3">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-4">
                          <span className={`inline-flex items-center px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                            notification.type === 'info' ? 'bg-blue-100 text-blue-800' :
                            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            notification.type === 'success' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {notification.type === 'info' && 'معلومات'}
                            {notification.type === 'warning' && 'تحذير'}
                            {notification.type === 'success' && 'نجاح'}
                            {notification.type === 'error' && 'خطأ'}
                          </span>
                          
                          {notification.data?.sender && (
                            <span className="inline-flex items-center text-xs sm:text-sm text-gray-600">
                              <FaEnvelope className="h-3 w-3 sm:h-4 sm:w-4 ml-1 hidden sm:block" />
                              <span className="hidden sm:inline">من: </span>
                              {notification.data.sender}
                            </span>
                          )}
                        </div>
                        
                        <span className="text-xs sm:text-sm text-gray-500">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}