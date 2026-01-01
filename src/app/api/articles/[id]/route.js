import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Article API - Missing or invalid ID:', id);
      return NextResponse.json(
        { 
          success: false,
          message: 'Article ID or slug is required',
          error: 'Missing ID'
        },
        { status: 400 }
      );
    }

    // Decode the ID/slug in case it's URL encoded
    const decodedId = decodeURIComponent(id);
    
    // Try to get article by ID or slug
    // The API should handle both numeric IDs and slugs
    let apiUrl = `http://moya.talaaljazeera.com/api/v1/articles/${encodeURIComponent(decodedId)}`;
    
    console.log('Article API - Fetching from:', apiUrl);
    console.log('Article API - Original ID:', id, 'Decoded:', decodedId);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

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

    console.log('Article API - Response status:', response.status);

    let data = {};
    try {
      const text = await response.text();
      if (text) {
        data = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Article API - Parse error:', parseError);
      data = { error: 'Failed to parse response', raw: text?.substring(0, 200) };
    }

    if (response.ok) {
      // Check if response has the expected structure
      if (data.success !== undefined) {
        // Response has success field, return as is
        return NextResponse.json(data, { status: response.status });
      } else if (data.data || data.id) {
        // Response has data or id field, wrap it in success structure
        return NextResponse.json({
          success: true,
          data: data.data || data
        }, { status: response.status });
      } else {
        // Response structure is different, return as is
        return NextResponse.json(data, { status: response.status });
      }
    } else {
      const errorMessage = 
        data.message || 
        data.error || 
        `فشل تحميل المقال (${response.status})`;
      
      return NextResponse.json(
        { 
          success: false,
          message: errorMessage,
          error: data.error,
          status: response.status
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Article API error:', error);
    
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return NextResponse.json(
        { message: 'انتهت مهلة الاتصال بالخادم', error: 'Timeout' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { message: 'حدث خطأ أثناء تحميل المقال', error: error.message },
      { status: 500 }
    );
  }
}

