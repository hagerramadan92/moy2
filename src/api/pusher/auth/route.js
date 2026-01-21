import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';

export async function POST(request) {
  try {
    const data = await request.json();
    const socketId = data.socket_id;
    const channel = data.channel_name;
    
    // Implement your auth logic here
    const authResponse = pusherServer.authorizeChannel(socketId, channel, {
      user_id: 'user_' + Date.now(), // Replace with actual user ID
      user_info: {
        name: 'User'
      }
    });
    
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 403 });
  }
}