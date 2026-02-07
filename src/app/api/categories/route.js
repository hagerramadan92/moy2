import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const apiUrl = `https://moya.talaaljazeera.com/api/v1/categories`;
    
    console.log('Categories API - Fetching from:', apiUrl);

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

    console.log('Categories API - Response status:', response.status);

    let data = {};
    try {
      const text = await response.text();
      console.log('Categories API - Response text:', text.substring(0, 200));
      if (text) {
        data = JSON.parse(text);
        console.log('Categories API - Parsed data keys:', Object.keys(data));
      }
    } catch (parseError) {
      console.error('Categories API - Parse error:', parseError);
      data = { error: 'Failed to parse response', raw: text?.substring(0, 200) };
    }

    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    } else {
      const errorMessage = 
        data.message || 
        data.error || 
        data.errors?.message ||
        `فشل تحميل الفئات (${response.status})`;
      
      console.error('Categories API - Error details:', {
        status: response.status,
        message: errorMessage,
        fullData: data
      });
      
      return NextResponse.json(
        { 
          success: false,
          message: errorMessage,
          error: data.error || data.errors,
          status: response.status
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Categories API error:', error);
    
    // Handle timeout errors
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return NextResponse.json(
        { 
          success: false,
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
          success: false,
          message: 'فشل الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
          error: error.message 
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: 'حدث خطأ أثناء تحميل الفئات',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

