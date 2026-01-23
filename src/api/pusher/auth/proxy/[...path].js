// pages/api/proxy/[...path].js
export default async function handler(req, res) {
  const { path } = req.query;
  
  // Base URL للـ API الأصلية
  const API_BASE = 'http://moya.talaaljazeera.com/api/v1';
  
  // بناء الـ URL الكامل
  const targetUrl = `${API_BASE}/${Array.isArray(path) ? path.join('/') : path}`;
  
  console.log('🚀 Proxy Request:', {
    method: req.method,
    target: targetUrl,
    originalUrl: req.url
  });

  try {
    // تحضير headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // إضافة authorization header إذا موجود
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // إعداد options للـ fetch
    const options = {
      method: req.method,
      headers: headers,
    };

    // إضافة body للـ POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      options.body = JSON.stringify(req.body);
    }

    // إرسال الطلب للـ API الأصلية
    const response = await fetch(targetUrl, options);
    
    // الحصول على البيانات
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // إعداد CORS headers للـ response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // إعادة الـ status code والبيانات
    res.status(response.status).json(data);

  } catch (error) {
    console.error('❌ Proxy Error:', error);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.status(500).json({
      success: false,
      message: 'Proxy error: ' + error.message,
      data: []
    });
  }
}

// معالجة OPTIONS requests للـ CORS
export async function OPTIONS(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    externalResolver: true,
  },
};