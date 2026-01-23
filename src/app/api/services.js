// pages/api/services.js
export default async function handler(req, res) {
  const API_URL = 'http://moya.talaaljazeera.com/api/v1/services';
  
  console.log('🔄 Services Proxy:', req.method, API_URL);

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // إضافة authorization إذا موجود
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    const response = await fetch(API_URL, {
      method: req.method,
      headers: headers,
      ...(req.body && ['POST', 'PUT', 'PATCH'].includes(req.method) && {
        body: JSON.stringify(req.body)
      })
    });

    const data = await response.json();
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // إرجاع البيانات كما هي
    res.status(response.status).json(data);

  } catch (error) {
    console.error('Services Proxy Error:', error);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.status(500).json({
      status: false,
      message: error.message,
      data: []
    });
  }
}

export async function OPTIONS(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
}