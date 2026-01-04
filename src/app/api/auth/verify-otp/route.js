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

    // Forward the request to the external API
    const response = await fetch('http://moya.talaaljazeera.com/api/v1/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        otp: body.otp,
        phone_number: body.phone_number,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    } else {
      return NextResponse.json(
        { 
          status: false,
          message: data.message || data.error || 'فشل التحقق من رمز التحقق',
          errors: data.errors 
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Verify OTP API error:', error);
    return NextResponse.json(
      { 
        status: false,
        message: 'حدث خطأ أثناء التحقق من رمز التحقق' 
      },
      { status: 500 }
    );
  }
}

