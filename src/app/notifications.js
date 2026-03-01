import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import Layout from '../components/Layout';
import {
  CheckIcon,
  TrashIcon,
  BellAlertIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const NotificationsPage = () => {
  const {
    notifications,
    loading,
    pagination,
    loadNotifications,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotification();

  const [selectedNotifications, setSelectedNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* الهيدر */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <BellAlertIcon className="h-8 w-8 text-[#579BE8] " />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">الإشعارات</h1>
                  <p className="text-sm text-gray-600">
                    إدارة جميع إشعاراتك في مكان واحد
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                {selectedNotifications.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-4 w-4 ml-1" />
                    حذف المحدد ({selectedNotifications.length})
                  </button>
                )}
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckIcon className="h-4 w-4 ml-1" />
                  تعليم الكل كمقروء
                </button>
                <button
                  onClick={clearAll}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <TrashIcon className="h-4 w-4 ml-1" />
                  مسح الكل
                </button>
              </div>
            </div>
          </div>

          {/* قائمة الإشعارات */}
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">جاري تحميل الإشعارات...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إشعارات</h3>
                <p className="text-gray-700">عندما تتلقى إشعارات جديدة، ستظهر هنا</p>
              </div>
            ) : (
              <>
                <div className="px-6 py-3 bg-gray-50">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === notifications.length}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-[#579BE8]  border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="mr-2 text-sm text-gray-700">تحديد الكل</span>
                  </div>
                </div>

                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-6 py-4 hover:bg-gray-50 ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="mt-1 h-4 w-4 text-[#579BE8]  border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="mr-3 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={`text-lg font-medium ${
                              notification.is_read ? 'text-gray-900' : 'text-blue-900'
                            }`}>
                              {notification.title}
                            </h3>
                            <p className="mt-1 text-gray-600">{notification.message}</p>
                          </div>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                        
                        <div className="mt-3 flex items-center text-sm text-gray-700">
                          <span className="ml-4">
                            {new Date(notification.created_at).toLocaleString('ar-EG')}
                          </span>
                          {!notification.is_read && (
                            <span className="mr-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              جديد
                            </span>
                          )}
                          {notification.type && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              notification.type === 'info' ? 'bg-blue-100 text-blue-800' :
                              notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              notification.type === 'success' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {notification.type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* الترقيم الصفحي */}
          {pagination && pagination.last_page > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  عرض <span className="font-medium">{pagination.per_page}</span> من أصل{' '}
                  <span className="font-medium">{pagination.total}</span> إشعار
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className={`px-3 py-1 rounded-md ${
                      pagination.current_page === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    السابق
                  </button>
                  
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-md ${
                        pagination.current_page === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className={`px-3 py-1 rounded-md ${
                      pagination.current_page === pagination.last_page
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    التالي
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;