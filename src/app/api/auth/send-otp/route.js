import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.country_code || !body.phone_number) {
      return NextResponse.json(
        { 
          status: false,
          message: 'country_code and phone_number are required' 
        },
        { status: 400 }
      );
    }

    // Forward the request to the external API
    const response = await fetch('https://dashboard.waytmiah.com/api/v1/auth/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        country_code: body.country_code,
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
          message: data.message || data.error || 'فشل إرسال رمز التحقق',
          errors: data.errors 
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Send OTP API error:', error);
    return NextResponse.json(
      { 
        status: false,
        message: 'حدث خطأ أثناء إرسال رمز التحقق' 
      },
      { status: 500 }
    );
  }
}

