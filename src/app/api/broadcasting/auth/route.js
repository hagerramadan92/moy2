// app/api/broadcasting/auth/route.js
export const dynamic = 'force-dynamic'; // Add this for dynamic routes
export const maxDuration = 30; // Increase timeout if needed

import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log('✅ Pusher auth endpoint called');
  
  try {
    // Debug: Log all headers
    const headers = Object.fromEntries(request.headers.entries());
    console.log('📋 Headers:', headers);
    
    // Get raw body
    const rawBody = await request.text();
    console.log('📦 Raw body:', rawBody);
    
    // Parse body
    let socket_id, channel_name;
    
    try {
      // Try JSON first
      const jsonBody = JSON.parse(rawBody);
      socket_id = jsonBody.socket_id;
      channel_name = jsonBody.channel_name;
    } catch {
      // Try URL encoded
      const params = new URLSearchParams(rawBody);
      socket_id = params.get('socket_id');
      channel_name = params.get('channel_name');
    }
    
    console.log('🔍 Parsed:', { socket_id, channel_name });
    
    // Get token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    console.log('🔐 Token present:', !!token);
    
    // For now, return a simple success response for testing
    // Remove this test response when connecting to Laravel
    return NextResponse.json({
      auth: `${process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'test-key'}:${socket_id}`,
      channel_data: JSON.stringify({
        user_id: 'test-user-id',
        user_info: {
          name: 'Test User'
        }
      })
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}