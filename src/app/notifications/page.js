'use client';

import { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import Layout from '../../components/Layout';
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

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    pagination,
    loadNotifications,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotification();

  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    loadNotifications();
  }, []);

  // تصفية الإشعارات حسب النوع
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
    for (const id of selectedNotifications) {
      await deleteNotification(id);
    }
    setSelectedNotifications([]);
  };

  const handlePageChange = (page) => {
    loadNotifications(page);
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

  return (
  
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
       
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* رأس الصفحة */}
          <div className="mb-8">
             {/* <NotificationPopup/> */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FaBell className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">الإشعارات</h1>
                  <p className="text-gray-600 mt-1">
                    إدارة جميع إشعاراتك في مكان واحد
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {unreadCount > 0 && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <FaBell className="h-4 w-4 ml-1" />
                    {unreadCount} إشعار غير مقروء
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* بطاقة الإشعارات */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* أدوات التحكم */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center text-sm text-gray-700 hover:text-gray-900"
                  >
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded ml-2"
                    />
                    تحديد الكل
                  </button>
                  
                  {selectedNotifications.length > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                      <FaTrash className="h-4 w-4 ml-1" />
                      حذف المحدد ({selectedNotifications.length})
                    </button>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  {/* مرشح الإشعارات */}
                  <div className="flex items-center space-x-2">
                    <FaFilter className="h-4 w-4 text-gray-500" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">جميع الإشعارات</option>
                      <option value="unread">غير المقروءة</option>
                      <option value="read">المقروءة</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      unreadCount === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'text-white bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    <FaCheck className="h-4 w-4 ml-1" />
                    تعليم الكل كمقروء
                  </button>
                  
                  <button
                    onClick={clearAll}
                    disabled={notifications.length === 0}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      notifications.length === 0
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

            {/* محتوى الإشعارات */}
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600">جاري تحميل الإشعارات...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
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
                        className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      
                      <div className="mr-4 flex-1">
                        <div className="flex items-start justify-between mb-3">
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
                              onClick={() => deleteNotification(notification.id)}
                              className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                              title="حذف الإشعار"
                            >
                              <FaTrash className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4 leading-relaxed text-right">
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

            {/* الترقيم الصفحي */}
            {pagination && pagination.last_page > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                  <div className="text-sm text-gray-700">
                    عرض <span className="font-medium">
                      {filteredNotifications.length}
                    </span> من أصل{' '}
                    <span className="font-medium">{pagination.total}</span> إشعار
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center ${
                        pagination.current_page === 1
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <FaChevronRight className="h-4 w-4 ml-1" />
                      السابق
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                        let pageNum;
                        if (pagination.last_page <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.current_page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.current_page >= pagination.last_page - 2) {
                          pageNum = pagination.last_page - 4 + i;
                        } else {
                          pageNum = pagination.current_page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 text-sm font-medium rounded-lg ${
                              pagination.current_page === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                      className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center ${
                        pagination.current_page === pagination.last_page
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      التالي
                      <FaChevronLeft className="h-4 w-4 mr-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    
  );
}