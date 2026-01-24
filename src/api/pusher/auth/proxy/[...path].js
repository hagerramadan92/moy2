// pages/api/proxy/[...path].js
export default async function handler(req, res) {
  const { path, ...queryParams } = req.query;
  
  // Base URL للـ API الأصلية
  const API_BASE = 'http://moya.talaaljazeera.com/api/v1';
  
  // بناء الـ endpoint
  const endpoint = Array.isArray(path) ? path.join('/') : path || '';
  
  // إضافة query parameters إذا وجدت
  const queryString = Object.keys(queryParams).length > 0
    ? '?' + new URLSearchParams(queryParams).toString()
    : '';
  
  const targetUrl = `${API_BASE}/${endpoint}${queryString}`;
  
  console.log('🚀 Proxy Request:', {
    method: req.method,
    endpoint: endpoint,
    targetUrl: targetUrl,
    query: queryParams,
    hasBody: !!req.body,
    userAgent: req.headers['user-agent'],
    contentType: req.headers['content-type']
  });

  // تحسين معالجة الأخطاء لـ Notifications و Chats
  if (endpoint.startsWith('notifications') || endpoint.startsWith('chats')) {
    console.log('📱 Handling notifications/chats endpoint via proxy');
    
    // تسجيل الوقت لقياس الأداء
    const startTime = Date.now();
    
    try {
      // إعداد headers مع إضافة headers مهمة للـ API
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Forwarded-For': req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        'X-Proxy-Timestamp': Date.now().toString(),
        'User-Agent': 'Moya-Proxy-Server/1.0'
      };
      
      // إضافة authorization header إذا موجود
      const authHeader = req.headers.authorization;
      if (authHeader) {
        headers['Authorization'] = authHeader;
        console.log('🔐 Auth header found, forwarding to API');
      } else {
        console.log('⚠️ No auth header found');
      }
      
      // إضافة headers أخرى مهمة
      if (req.headers['accept-language']) {
        headers['Accept-Language'] = req.headers['accept-language'];
      }
      
      if (req.headers['x-requested-with']) {
        headers['X-Requested-With'] = req.headers['x-requested-with'];
      }

      // إعداد options للـ fetch
      const options = {
        method: req.method,
        headers: headers,
        // زيادة الـ timeout للـ notifications و chats
        signal: AbortSignal.timeout(30000) // 30 ثانية
      };

      // إضافة body للـ POST, PUT, PATCH, DELETE
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.body) {
        options.body = JSON.stringify(req.body);
        console.log('📦 Request body:', req.body);
      }

      // إضافة query parameters للـ GET requests
      if (req.method === 'GET' && queryString) {
        console.log('🔍 Query parameters:', queryParams);
      }

      // إرسال الطلب للـ API الأصلية مع retry logic
      let response;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          console.log(`📡 Sending request to backend (attempt ${retryCount + 1})...`);
          response = await fetch(targetUrl, options);
          break; // نجح، اخرج من الـ loop
        } catch (fetchError) {
          retryCount++;
          if (retryCount > maxRetries) {
            throw fetchError;
          }
          console.log(`🔄 Retry ${retryCount} after fetch error:`, fetchError.message);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // انتظر ثانية بين المحاولات
        }
      }
      
      if (!response) {
        throw new Error('Failed to get response from backend');
      }
      
      const responseTime = Date.now() - startTime;
      console.log(`✅ Backend response received in ${responseTime}ms:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // الحصول على البيانات مع معالجة أنواع المحتوى المختلفة
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
          console.log(`📊 JSON response data (${endpoint}):`, {
            hasData: !!data,
            dataType: typeof data,
            isArray: Array.isArray(data),
            dataKeys: data ? Object.keys(data) : [],
            // سجل عينة من البيانات للـ debugging
            sample: data && typeof data === 'object' ? 
              JSON.stringify(data).substring(0, 200) + '...' : data
          });
        } catch (jsonError) {
          console.error('❌ JSON parsing error:', jsonError);
          const text = await response.text();
          console.log('📄 Raw response text:', text.substring(0, 500));
          throw new Error(`Invalid JSON response: ${jsonError.message}`);
        }
      } else if (contentType && contentType.includes('text/')) {
        data = await response.text();
        console.log('📄 Text response received');
      } else {
        data = await response.arrayBuffer();
        console.log('📦 Binary response received');
      }

      // إعداد CORS headers للـ response
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept-Language',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400', // 24 ساعة
        'X-Proxy-Response-Time': `${responseTime}ms`,
        'X-Proxy-Endpoint': endpoint
      };

      // إضافة headers من الـ response الأصلية
      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        if (!key.toLowerCase().startsWith('access-control-')) {
          responseHeaders[key] = value;
        }
      });

      // دمج الـ headers
      Object.assign(res.headers, corsHeaders, responseHeaders);

      // إضافة معلومات الـ proxy للـ response
      if (data && typeof data === 'object' && !Array.isArray(data) && data !== null) {
        // إذا كان الـ response كائن، أضف معلومات الـ proxy
        data._proxy = {
          timestamp: new Date().toISOString(),
          endpoint: endpoint,
          response_time: `${responseTime}ms`,
          via: 'vercel-proxy'
        };
      }

      // إعادة الـ status code والبيانات
      res.status(response.status);
      
      if (contentType && contentType.includes('application/json')) {
        return res.json(data);
      } else if (contentType && contentType.includes('text/')) {
        res.setHeader('Content-Type', contentType);
        return res.send(data);
      } else {
        return res.send(data);
      }

    } catch (error) {
      const errorTime = Date.now() - startTime;
      console.error('❌ Proxy Error for notifications/chats:', {
        endpoint: endpoint,
        error: error.message,
        stack: error.stack,
        timeElapsed: `${errorTime}ms`,
        targetUrl: targetUrl
      });
      
      // إعداد CORS headers حتى في حالة الخطأ
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('X-Proxy-Error', 'true');
      res.setHeader('X-Proxy-Endpoint', endpoint);
      
      // إرجاع خطأ مفصل
      return res.status(error.name === 'TimeoutError' ? 504 : 500).json({
        success: false,
        message: `Proxy error for ${endpoint}: ${error.message}`,
        data: [],
        _proxy: {
          error: true,
          endpoint: endpoint,
          timestamp: new Date().toISOString(),
          response_time: `${errorTime}ms`
        }
      });
    }
  } else {
    // معالجة بقية الـ endpoints بنفس الطريقة السابقة
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization;
      }

      const options = {
        method: req.method,
        headers: headers,
      };

      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        options.body = JSON.stringify(req.body);
      }

      const response = await fetch(targetUrl, options);
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      res.status(response.status).json(data);

    } catch (error) {
      console.error('❌ General Proxy Error:', error);
      
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      return res.status(500).json({
        success: false,
        message: 'Proxy error: ' + error.message,
        data: []
      });
    }
  }
}

// معالجة OPTIONS requests للـ CORS
export async function OPTIONS(req, res) {
  const { path } = req.query;
  const endpoint = Array.isArray(path) ? path.join('/') : path || '';
  
  console.log('🔄 CORS Preflight for:', endpoint);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept-Language, X-Custom-Header');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('X-Proxy-CORS', 'handled');
  
  return res.status(200).end();
}

// دالة مساعدة للـ logging
function logRequestDetails(req, endpoint) {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    endpoint: endpoint,
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    contentType: req.headers['content-type'],
    accept: req.headers['accept'],
    authorization: req.headers.authorization ? 'Present' : 'Missing'
  };
  
  console.log('📝 Request Details:', logData);
  
  // يمكنك إضافة logging إلى ملف أو service هنا
  return logData;
}

// دالة للتحقق من صحة الـ endpoint
function validateEndpoint(endpoint) {
  const allowedEndpoints = [
    'notifications',
    'chats',
    'services',
    'type-water',
    'auth',
    'user',
    'orders',
    'payments',
    'locations',
    'health',
    'offers',
    'reviews',
    'deals'
  ];
  
  const firstPart = endpoint.split('/')[0];
  return allowedEndpoints.includes(firstPart);
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
      parse: true
    },
    responseLimit: false,
    externalResolver: true,
  },
};