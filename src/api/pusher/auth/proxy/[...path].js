// pages/api/proxy/[...path].js
export default async function handler(req, res) {
  const { path } = req.query;
  const targetUrl = `http://moya.talaaljazeera.com/api/v1/${path.join('/')}`;
  
  console.log(`Proxy: ${req.method} ${targetUrl}`);
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(req.headers.authorization && { Authorization: req.headers.authorization })
    };
    
    const options = {
      method: req.method,
      headers,
      ...(req.body && { body: JSON.stringify(req.body) })
    };
    
    const response = await fetch(targetUrl, options);
    const data = await response.json();
    
    // إضافة CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Proxy error', 
      error: error.message 
    });
  }
}

// إضافة handler لـ OPTIONS requests (مهم لـ CORS)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: false,
  },
};