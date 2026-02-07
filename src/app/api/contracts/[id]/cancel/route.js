import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req, { params }) {
  try {
    // Await params as it's a Promise in Next.js 15+
    const { id } = await params;
    
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json(
        { 
          message: 'معرف العقد مطلوب',
          error: 'Contract ID is required'
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    
    // Get CSRF token from request headers
    const csrfTokenFromHeader = req.headers.get('X-CSRF-TOKEN') || 
                                req.headers.get('X-XSRF-TOKEN');
    
    // Get CSRF token from cookies
    const cookieStore = await cookies();
    const csrfTokenFromCookie = cookieStore.get('XSRF-TOKEN')?.value ||
                               cookieStore.get('csrf-token')?.value ||
                               cookieStore.get('_token')?.value;
    
    const csrfToken = csrfTokenFromHeader || csrfTokenFromCookie;

    // Get access token from request headers for authentication (required)
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    const accessToken = authHeader?.replace(/^Bearer\s+/i, '') || authHeader;

    // Validate that access token is present
    if (!accessToken) {
      return NextResponse.json(
        { 
          message: 'رمز المصادقة مطلوب لإلغاء العقد',
          error: 'Authorization token is required'
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

    // Add CSRF token if available
    if (csrfToken) {
      headers['X-CSRF-TOKEN'] = csrfToken;
      headers['X-XSRF-TOKEN'] = csrfToken;
    }

    // Prepare request body
    const requestBody = {};
    if (body.reason) {
      requestBody.reason = body.reason;
    }

    // Forward the request to the external API
    const response = await fetch(`https://moya.talaaljazeera.com/api/v1/contracts/${id}/cancel`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    } else {
      return NextResponse.json(
        { 
          message: data.message || data.error || 'فشل إرسال طلب إلغاء العقد',
          errors: data.errors 
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Cancel Contract API error:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء إرسال طلب إلغاء العقد' },
      { status: 500 }
    );
  }
}

