import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.otp || !body.phone_number) {
      return NextResponse.json(
        { 
          status: false,
          message: 'otp and phone_number are required' 
        },
        { status: 400 }
      );
    }

    // Prepare request body with session_id if provided
    const requestBody = {
      otp: body.otp,
      phone_number: body.phone_number,
    };

    // Add session_id if provided
    if (body.session_id) {
      requestBody.session_id = body.session_id;
    }

    // Forward the request to the external API
    const response = await fetch('https://dashboard.waytmiah.com/api/v1/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Handle non-JSON responses
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('Non-JSON response from verify-otp API:', text);
      return NextResponse.json(
        { 
          status: false,
          message: 'استجابة غير صحيحة من الخادم',
          details: text.substring(0, 200)
        },
        { status: 500 }
      );
    }

    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    } else {
      return NextResponse.json(
        { 
          status: false,
          message: data.message || data.error || 'فشل التحقق من رمز التحقق',
          errors: data.errors,
          details: data
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Verify OTP API error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { 
        status: false,
        message: 'حدث خطأ أثناء التحقق من رمز التحقق',
        error: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

