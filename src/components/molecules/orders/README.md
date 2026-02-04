# Available Drivers Page - Structure

تم تقسيم ملف `AvailableDriversPage.jsx` الكبير إلى مكونات صغيرة منفصلة لتسهيل الفهم والصيانة.

## البنية الجديدة

### المكونات الرئيسية

1. **AvailableDriversPage.jsx** (Wrapper)
   - المكون الرئيسي الذي يحتوي على Suspense
   - يستورد ويستخدم `AvailableDriversContent`

2. **AvailableDriversContent.jsx**
   - المكون الرئيسي الذي يحتوي على منطق الصفحة
   - إدارة الحالة (State Management)
   - جلب البيانات من API
   - معالجة الدفع والموقع

3. **DriverCard.jsx**
   - مكون بطاقة السائق
   - يعرض معلومات السائق والعرض
   - معالجة قبول العرض

4. **PaymentModal.jsx**
   - مكون نافذة الدفع
   - اختيار طريقة الدفع
   - بدء عملية الدفع

### ملفات المساعدة (Utils)

1. **utils/api.js**
   - دوال API المساعدة
   - `getAccessToken()` - الحصول على token
   - `getDeviceId()` - الحصول على معرف الجهاز
   - `getIpAddress()` - الحصول على عنوان IP

2. **utils/paymentHelpers.js**
   - دوال مساعدة للدفع
   - `getPaymentCallbackData()` - الحصول على بيانات callback الدفع
   - `getPendingOfferData()` - الحصول على بيانات العرض المعلق
   - `confirmDriverAfterPayment()` - تأكيد السائق بعد الدفع

3. **utils/mockData.js**
   - دوال البيانات الوهمية
   - `generateMockDriver()` - إنشاء بيانات سائق وهمية للاختبار

## الفوائد

1. **سهولة القراءة**: كل مكون له مسؤولية واحدة واضحة
2. **سهولة الصيانة**: يمكن تعديل مكون واحد دون التأثير على الآخرين
3. **إعادة الاستخدام**: يمكن استخدام المكونات في أماكن أخرى
4. **الاختبار**: يمكن اختبار كل مكون بشكل منفصل
5. **الأداء**: تحسين الأداء من خلال تقسيم الكود

## الاستخدام

```jsx
import AvailableDriversPage from './AvailableDriversPage';

<AvailableDriversPage onBack={handleBack} />
```

## التبعيات

- React
- Next.js
- Framer Motion
- Lucide React
- React Icons

