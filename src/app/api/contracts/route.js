import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
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
          message: 'رمز المصادقة مطلوب لإنشاء عقد',
          error: 'Authorization token is required'
        },
        { status: 401 }
      );
    }

    // Prepare headers for external API
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`, // Always include token
    };

    // Add CSRF token if available
    if (csrfToken) {
      headers['X-CSRF-TOKEN'] = csrfToken;
      headers['X-XSRF-TOKEN'] = csrfToken;
    }

    // Forward the request to the external API
    const response = await fetch('https://dashboard.waytmiah.com/api/v1/contracts', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    } else {
      return NextResponse.json(
        { 
          message: data.message || data.error || 'فشل إرسال طلب التعاقد',
          errors: data.errors 
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Contracts API error:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء إرسال طلب التعاقد' },
      { status: 500 }
    );
  }
}

