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
  X
} from 'lucide-react';
import notificationService from '@/services/notificationService';

export default function NotificationSettings() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);

  useEffect(() => {
    loadDevices();
    // الحصول على معرف الجهاز الحالي من localStorage
    const storedDeviceId = localStorage.getItem('current_device_id');
    if (storedDeviceId) {
      setCurrentDeviceId(storedDeviceId);
    }
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getRegisteredDevices();
      if (response.status && response.data) {
        setDevices(response.data);
      }
    } catch (error) {
      console.error('خطأ في تحميل الأجهزة:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDevice = async (deviceId, isActive) => {
    try {
      await notificationService.updateDevice(deviceId, {
        is_active: !isActive
      });
      
      // تحديث القائمة
      loadDevices();
    } catch (error) {
      console.error('خطأ في تحديث حالة الجهاز:', error);
    }
  };

  const handleRemoveDevice = async (deviceId) => {
    if (confirm('هل أنت متأكد من إزالة هذا الجهاز؟')) {
      try {
        await notificationService.deactivateDevice(deviceId);
        
        // إذا كان الجهاز الحالي، قم بإزالته من localStorage
        if (deviceId === currentDeviceId) {
          localStorage.removeItem('current_device_id');
          localStorage.removeItem('fcm_token');
          setCurrentDeviceId(null);
        }
        
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 ml-2" />
          إدارة الإشعارات
        </CardTitle>
        <CardDescription>
          إدارة الأجهزة المسجلة لإرسال الإشعارات إليها
        </CardDescription>
      </CardHeader>
      
      <CardContent>
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
                  device.id === currentDeviceId
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
                        {device.id === currentDeviceId && (
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
                        {device.device_model && ` • ${device.device_model}`}
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
                • أضف الموقع إلى الشاشة الرئيسية لتجربة أفضل
                <br />
                • تأكد من عدم حظر الإشعارات في إعدادات النظام
              </p>
            </div>
            <Button
              variant="outline"
              onClick={loadDevices}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}