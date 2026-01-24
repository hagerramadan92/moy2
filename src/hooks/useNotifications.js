// hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import notificationService from '@/services/notification.service';
import toast from 'react-hot-toast';

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  // جلب الإشعارات
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications();
      
      if (response.success && Array.isArray(response.data)) {
        setNotifications(response.data);
      } else if (Array.isArray(response)) {
        setNotifications(response);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('فشل تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  }, []);

  // جلب عدد الإشعارات غير المقروءة
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  // تهيئة الإشعارات
  const initializeNotifications = useCallback(async () => {
    try {
      await notificationService.initialize();
      await fetchNotifications();
      await fetchUnreadCount();
      
      // بدء polling للإشعارات الجديدة
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000); // كل 30 ثانية
      
      setPollingInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }, [fetchNotifications, fetchUnreadCount]);

  // تحديد إشعار كمقروء
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // تحديث الحالة المحلية
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      toast.success('تم تحديد الإشعار كمقروء');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('فشل تحديث حالة الإشعار');
    }
  };

  // تحديد جميع الإشعارات كمقروءة
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
      toast.success('تم تحديد جميع الإشعارات كمقروءة');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('فشل تحديث الإشعارات');
    }
  };

  // حذف إشعار
  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      // تحديث العدد إذا كان الإشعار غير مقروء
      const deletedNotif = notifications.find(n => n.id === notificationId);
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('تم حذف الإشعار');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('فشل حذف الإشعار');
    }
  };

  // useEffect للتهيئة
  useEffect(() => {
    initializeNotifications();
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [initializeNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: () => {
      fetchNotifications();
      fetchUnreadCount();
    }
  };
}