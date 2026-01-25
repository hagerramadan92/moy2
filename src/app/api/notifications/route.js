// app/api/notifications/route.js
export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    const response = await fetch('https://moya.talaaljazeera.com/api/v1/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    // إرجاع بيانات تجريبية عند الفشل
    const demoData = {
      status: true,
      data: [
        {
          id: 1,
          title: 'مرحباً بك',
          message: 'يمكنك تصفح التطبيق',
          type: 'info',
          is_read: true,
          created_at: new Date().toISOString()
        }
      ]
    };
    
    return new Response(JSON.stringify(demoData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}