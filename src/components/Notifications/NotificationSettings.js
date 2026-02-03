'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Bell, 
  Trash2, 
  RefreshCw,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

export default function NotificationSettings() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { 
    fcmToken, 
    notificationPermission, 
    isFirebaseInitialized,
    checkDeviceRegistration,
    unregisterDevice,
    refreshFCMToken 
  } = useNotification();

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      
      // الحصول على معلومات الجهاز من localStorage
      const deviceCheck = checkDeviceRegistration();
      const currentDeviceInfo = {
        id: deviceCheck.deviceId || 'current-device',
        device_name: 'هذا الجهاز',
        device_type: 'web',
        is_active: deviceCheck.hasToken,
        created_at: new Date().toISOString(),
        app_version: '1.0.0',
        is_current: true
      };
      
      // يمكنك إضافة API call هنا للحصول على الأجهزة من الخادم
      const fakeDevices = [currentDeviceInfo];
      
      setDevices(fakeDevices);
      
    } catch (error) {
      console.error('خطأ في تحميل الأجهزة:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDevice = async (deviceId, isActive) => {
    try {
      // هنا يمكنك إضافة API call لتحديث حالة الجهاز
      console.log('تحديث حالة الجهاز:', deviceId, !isActive);
      
      // تحديث القائمة المحلية
      setDevices(prev => 
        prev.map(device => 
          device.id === deviceId 
            ? { ...device, is_active: !isActive }
            : device
        )
      );
    } catch (error) {
      console.error('خطأ في تحديث حالة الجهاز:', error);
    }
  };

  const handleRemoveDevice = async (deviceId) => {
    if (confirm('هل أنت متأكد من إزالة هذا الجهاز؟')) {
      try {
        await unregisterDevice();
        
        // تحديث القائمة
        loadDevices();
      } catch (error) {
        console.error('خطأ في إزالة الجهاز:', error);
      }
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'android':
        return '🤖';
      case 'ios':
        return '📱';
      case 'web':
        return '🌐';
      default:
        return '💻';
    }
  };

  const handleRefreshToken = async () => {
    try {
      const result = await refreshFCMToken();
      if (result.success) {
        alert('تم تحديث رمز الإشعارات بنجاح');
        loadDevices();
      }
    } catch (error) {
      console.error('خطأ في تحديث التوكن:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 ml-2" />
          إدارة الإشعارات
        </CardTitle>
        <CardDescription>
          إدارة الأجهزة المسجلة وإعدادات الإشعارات
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* حالة Firebase */}
        <div className={`p-4 rounded-lg mb-6 ${isFirebaseInitialized ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-start">
            <AlertCircle className={`h-5 w-5 mt-0.5 ml-2 ${isFirebaseInitialized ? 'text-green-600' : 'text-yellow-600'}`} />
            <div>
              <h4 className="font-medium">
                {isFirebaseInitialized ? 'الإشعارات مفعلة' : 'الإشعارات غير مفعلة'}
              </h4>
              <p className="text-sm mt-1">
                {isFirebaseInitialized 
                  ? 'يمكنك تلقي الإشعارات الفورية على هذا الجهاز' 
                  : 'يجب تفعيل الإشعارات لتلقي التحديثات الفورية'
                }
              </p>
              <p className="text-xs text-gray-500 mt-2">
                إذن الإشعارات: {notificationPermission === 'granted' ? '✓ مسموح' : '✗ غير مسموح'}
                {fcmToken && ' • التوكن: ✓ موجود'}
              </p>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">جاري تحميل الأجهزة...</p>
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-8">
            <Smartphone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">لا توجد أجهزة مسجلة</p>
            <p className="text-sm text-gray-400 mt-1">
              سجل جهازك لتلقي الإشعارات
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <div
                key={device.id}
                className={`p-4 rounded-lg border ${
                  device.is_current
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {getDeviceIcon(device.device_type)}
                    </span>
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium">
                          {device.device_name}
                        </h4>
                        {device.is_current && (
                          <Badge className="mr-2 bg-blue-100 text-blue-800">
                            الجهاز الحالي
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {device.device_type === 'android' && 'أندرويد'}
                        {device.device_type === 'ios' && 'آيفون'}
                        {device.device_type === 'web' && 'ويب'}
                        {device.device_type === 'windows_phone' && 'ويندوز فون'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {device.is_active ? (
                      <Badge className="bg-green-100 text-green-800 flex items-center">
                        <Check className="h-3 w-3 ml-1" />
                        نشط
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        غير نشط
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <p>الإصدار: {device.app_version}</p>
                    <p>
                      مسجل منذ: {new Date(device.created_at).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">تفعيل</span>
                      <Switch
                        checked={device.is_active}
                        onCheckedChange={() => handleToggleDevice(device.id, device.is_active)}
                      />
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDevice(device.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">نصائح للإشعارات</h4>
              <p className="text-sm text-gray-500">
                • تأكد من تفعيل الإشعارات في إعدادات المتصفح
                <br />
                • اضغط "تفعيل الإشعارات" في الأعلى إذا لم تكن مفعلة
                <br />
                • تأكد من عدم حظر الإشعارات في إعدادات النظام
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleRefreshToken}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث التوكن
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}