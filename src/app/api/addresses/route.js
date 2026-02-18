import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Get access token from Authorization header
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    const accessToken = authHeader?.replace(/^Bearer\s+/i, '') || authHeader;

    if (!accessToken) {
      return NextResponse.json(
        { 
          status: false,
          message: 'Authorization token is required' 
        },
        { status: 401 }
      );
    }  

    // Prepare headers for external API
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };

    // Call the external addresses API
    const response = await fetch('https://dashboard.waytmiah.com/api/v1/addresses', {
      method: 'GET',
      headers: headers,
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    } else {
      return NextResponse.json(
        { 
          status: false,
          message: data.message || data.error || 'فشل جلب العناوين',
          errors: data.errors 
        },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { 
        status: false,
        message: 'حدث خطأ أثناء جلب العناوين' 
      },
      { status: 500 }
    );
  }
}

