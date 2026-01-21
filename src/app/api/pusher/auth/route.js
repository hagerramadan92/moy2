// app/api/pusher/auth/route.js
import { NextResponse } from 'next/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
  useTLS: true,
});

export async function POST(request) {
  try {
    const { socket_id, channel_name } = await request.json();
    
    console.log('Pusher Auth Request:', { socket_id, channel_name });
    
    // التحقق من التوكن
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Auth failed: Token missing');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // يمكنك التحقق من صحة التوكن هنا مع خادمك
    // const isValid = await verifyToken(token);
    
    // للمرحلة الأولية، نقبل جميع التوكنات
    const isValid = true;
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 403 }
      );
    }

    // إنشاء مصادقة Pusher
    const authResponse = pusher.authorizeChannel(socket_id, channel_name, {
      user_id: 'user_' + Date.now(), // يمكنك استخدام ID المستخدم الحقيقي
      user_info: {
        name: 'Chat User'
      }
    });

    console.log('✅ Pusher Auth Successful');
    
    return NextResponse.json(authResponse);
    
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}