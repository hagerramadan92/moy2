// app/api/test-pusher/route.js
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
    const { message, channel = 'chat-app', event = 'new-upcoming-message' } = await request.json();
    
    // التحقق من التوكن
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Token missing' },
        { status: 401 }
      );
    }

    // إرسال الحدث عبر Pusher
    await pusher.trigger(channel, event, {
      id: Date.now(),
      message: message || 'Test message',
      chat_id: 999,
      sender_id: 39,
      created_at: new Date().toISOString(),
      sender: {
        id: 39,
        name: 'Test User'
      }
    });

    console.log(`✅ Test event sent to ${channel}:${event}`);

    return NextResponse.json({
      success: true,
      message: 'Test event sent successfully',
      channel,
      event,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Pusher test error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send test event' },
      { status: 500 }
    );
  }
}