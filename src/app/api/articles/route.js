import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Use req.nextUrl for Next.js 13+ App Router
    const url = req.nextUrl || new URL(req.url);
    const page = url.searchParams.get('page') || '1';
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    
    // Build API URL with query parameters
    let apiUrl = `http://moya.talaaljazeera.com/api/v1/articles?page=${page}`;
    
    if (category) {
      apiUrl += `&category=${encodeURIComponent(category)}`;
    }
    
    if (search) {
      apiUrl += `&search=${encodeURIComponent(search)}`;
    }
    
    console.log('Articles API - Fetching from:', apiUrl);

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

    console.log('Articles API - Response status:', response.status);

    let data = {};
    try {
      const text = await response.text();
      console.log('Articles API - Response text:', text.substring(0, 200));
      if (text) {
        data = JSON.parse(text);
        console.log('Articles API - Parsed data keys:', Object.keys(data));
      }
    } catch (parseError) {
      console.error('Articles API - Parse error:', parseError);
      data = { error: 'Failed to parse response', raw: text?.substring(0, 200) };
    }

    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    } else {
      const errorMessage = 
        data.message || 
        data.error || 
        data.errors?.message ||
        `فشل تحميل المقالات (${response.status})`;
      
      console.error('Articles API - Error details:', {
        status: response.status,
        message: errorMessage,
        fullData: data
      });
      
      return NextResponse.json(
        { 
          message: errorMessage,
          error: data.error || data.errors,
          status: response.status
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Articles API error:', error);
    
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
        message: 'حدث خطأ أثناء تحميل المقالات',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

