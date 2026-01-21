// app/api/broadcasting/auth/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { socket_id, channel_name } = body;
    
    console.log('🔐 Laravel Auth Request:', {
      socket_id: socket_id?.substring(0, 10) + '...',
      channel_name,
      timestamp: new Date().toISOString()
    });

    // التحقق من التوكن
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ No Bearer token in auth request');
      return NextResponse.json(
        { error: 'Unauthorized - No token' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    if (!token || token.length < 10) {
      console.warn('⚠️ Invalid token length');
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // الاتصال بـ Laravel للتحقق من الصلاحية
    const LARAVEL_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') 
                      || 'http://moya.talaaljazeera.com';
    
    console.log('🔄 Forwarding to Laravel:', LARAVEL_URL + '/broadcasting/auth');
    
    const laravelResponse = await fetch(LARAVEL_URL + '/broadcasting/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        socket_id,
        channel_name
      })
    });

    console.log('📡 Laravel Response Status:', laravelResponse.status);
    
    if (!laravelResponse.ok) {
      const errorText = await laravelResponse.text();
      console.error('❌ Laravel auth failed:', {
        status: laravelResponse.status,
        error: errorText
      });
      
      return NextResponse.json(
        { 
          error: 'Laravel authentication failed',
          status: laravelResponse.status,
          details: errorText
        },
        { status: laravelResponse.status }
      );
    }

    const laravelData = await laravelResponse.json();
    
    console.log('✅ Laravel auth successful:', {
      auth: laravelData.auth ? '••••' + laravelData.auth.slice(-10) : 'no auth',
      channel_data: laravelData.channel_data ? 'present' : 'absent'
    });
    
    return NextResponse.json(laravelData);
    
  } catch (error) {
    console.error('❌ Broadcasting auth error:', error);
    
    // في حالة الخطأ، نرجع رداً افتراضياً للقنوات العامة فقط
    if (channel_name && !channel_name.startsWith('private-') && !channel_name.startsWith('presence-')) {
      console.log('🔄 Falling back to public channel auth');
      return NextResponse.json({
        auth: `${process.env.NEXT_PUBLIC_PUSHER_APP_KEY}:${socket_id}`
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Broadcasting authentication failed',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}