// pages/api/proxy-fallback/[...path].js
export default async function handler(req, res) {
  const { path } = req.query;
  
  console.log('🔄 Fallback Proxy:', {
    endpoint: path,
    method: req.method,
    reason: 'Main proxy might be down'
  });
  
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://moya.talaaljazeera.com/api/v1';
    const targetUrl = `${API_BASE}/${Array.isArray(path) ? path.join('/') : path}`;
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(req.headers.authorization && { Authorization: req.headers.authorization })
      },
      ...(req.body && { body: JSON.stringify(req.body) })
    });
    
    const data = await response.json();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('X-Proxy-Fallback', 'true');
    
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Fallback proxy error:', error);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({
      success: false,
      message: 'Fallback proxy error: ' + error.message,
      data: [],
      _meta: {
        isFallback: true,
        timestamp: new Date().toISOString()
      }
    });
  }
}

export async function OPTIONS(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Proxy-Fallback', 'true');
  res.status(200).end();
}