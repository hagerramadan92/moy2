import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Use req.nextUrl for Next.js 13+ App Router
    const url = req.nextUrl || new URL(req.url);
    const slug = url.searchParams.get('slug');
    
    console.log('Static page API - Slug:', slug);
    
    if (!slug) {
      return NextResponse.json(
        { message: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Base URL: https://dashboard.waytmiah.com/api/v1
    // Endpoint: /static-pages/{slug}
    const apiUrl = `https://dashboard.waytmiah.com/api/v1/static-pages/${encodeURIComponent(slug)}`;
    console.log('Static page API - Fetching from:', apiUrl);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

    // Forward the request to the external API
    let response;
    try {
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Timeout');
      }
      throw fetchError;
    }

    console.log('Static page API - Response status:', response.status);

    let data = {};
    try {
      const text = await response.text();
      console.log('Static page API - Response text:', text.substring(0, 200));
      if (text) {
        data = JSON.parse(text);
        console.log('Static page API - Parsed data:', JSON.stringify(data).substring(0, 200));
      }
    } catch (parseError) {
      console.error('Static page API - Parse error:', parseError);
      data = { error: 'Failed to parse response', raw: text?.substring(0, 200) };
    }

    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    } else {
      // Check for different error message formats
      const errorMessage = 
        data.message || 
        data.error || 
        data.errors?.message ||
        (typeof data === 'string' ? data : null) ||
        `فشل تحميل المحتوى (${response.status})`;
      
      console.error('Static page API - Error details:', {
        status: response.status,
        message: errorMessage,
        fullData: data
      });
      
      return NextResponse.json(
        { 
          message: errorMessage,
          error: data.error || data.errors,
          status: response.status,
          slug: slug,
          apiUrl: apiUrl
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Static page API error:', error);
    
    // Handle timeout errors
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return NextResponse.json(
        { 
          message: 'انتهت مهلة الاتصال بالخادم. يرجى المحاولة مرة أخرى.',
          error: 'Timeout'
        },
        { status: 504 }
      );
    }
    
    // Handle network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return NextResponse.json(
        { 
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
          error: error.message 
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        message: 'حدث خطأ أثناء تحميل المحتوى',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

