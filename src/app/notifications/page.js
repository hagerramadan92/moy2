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
  <div className="p-12 text-center">
    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
      <FaBell className="h-10 w-10 text-blue-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      {filter === 'all' ? 'لا توجد إشعارات' : 
       filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 
       'لا توجد إشعارات مقروءة'}
    </h3>
    <p className="text-gray-500 max-w-md mx-auto">
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
      <div className="min-h-screen bg-gray-50 py-5 md:py-8" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonHeader />
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
    <div className="min-h-screen bg-gray-50 py-5 md:py-8" dir="rtl">
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 md:p-3 p-1.5 rounded-lg">
                <FaBell className="md:h-8 md:w-8 h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-gray-900">الإشعارات</h1>
                <p className="text-gray-600 mt-1 md:text-base text-sm">
                  إدارة جميع إشعاراتك في مكان واحد
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <GoBell className="h-4 w-4 ml-1" />
                  {unreadCount} إشعار غير مقروء
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  disabled={filteredNotifications.length === 0 || loading}
                  className={`flex items-center text-sm ${
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
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded ml-2"
                  />
                  تحديد الكل
                </button>
                
                {selectedNotifications.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    disabled={loading || deleting}
                    className={`inline-flex items-center 
                      px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                      loading || deleting
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'text-white bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    <FaTrash className="h-4 w-4 ml-1" />
                    حذف المحدد ({selectedNotifications.length})
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2">
                  <FaFilter className="h-4 w-4 text-gray-500" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    disabled={loading || deleting}
                    className={`border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      loading || deleting ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="all">جميع الإشعارات</option>
                    <option value="unread">غير المقروءة</option>
                    <option value="read">المقروءة</option>
                  </select>
                </div>
                
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0 || loading || deleting}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    unreadCount === 0 || loading || deleting
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'text-white bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <FaCheck className="h-4 w-4 ml-1" />
                  تعليم الكل كمقروء
                </button>
                
                <button
                  onClick={handleClearAll}
                  disabled={notifications.length === 0 || loading || deleting}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    notifications.length === 0 || loading || deleting
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <FaTrash className="h-4 w-4 ml-1" />
                  مسح الكل
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {loading && notifications.length > 0 ? (
              <div className="p-4">
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
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => handleSelectNotification(notification.id)}
                      disabled={loading || deleting}
                      className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    
                    <div className="mr-4 flex-1">
                      <div className="flex items-start justify-between mb-1 md:mb-3">
                        <div className="flex items-center space-x-3">
                          {getNotificationIcon(notification.type)}
                          <h3 className={`text-lg font-semibold ${
                            notification.is_read ? 'text-gray-900' : 'text-blue-900'
                          }`}>
                            {notification.title}
                          </h3>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!notification.is_read && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              جديد
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteSingle(notification.id)}
                            disabled={loading || deleting}
                            className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                            title="حذف الإشعار"
                          >
                            <FaTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-1 md:mb-4 leading-relaxed text-right">
                        {notification.message}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
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
                            <span className="inline-flex items-center text-sm text-gray-600">
                              <FaEnvelope className="h-4 w-4 ml-1" />
                              من: {notification.data.sender}
                            </span>
                          )}
                        </div>
                        
                        <span className="text-sm text-gray-500">
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