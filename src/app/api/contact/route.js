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

    // Prepare headers for external API
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add CSRF token if available
    if (csrfToken) {
      headers['X-CSRF-TOKEN'] = csrfToken;
      headers['X-XSRF-TOKEN'] = csrfToken;
    }

    // Forward the request to the external API
    const response = await fetch('https://moya.talaaljazeera.com/api/v1/contact-us', {
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
          message: data.message || data.error || 'فشل إرسال الرسالة',
          errors: data.errors 
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء إرسال الرسالة' },
      { status: 500 }
    );
  }
}

