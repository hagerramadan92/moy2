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
    
    // Use slug-based endpoint: http://moya.talaaljazeera.com/api/v1/articles/{slug}
    // The API accepts both numeric IDs and slugs, but we'll use slug format
    const slug = encodeURIComponent(decodedId);
    const apiUrl = `http://moya.talaaljazeera.com/api/v1/articles/${slug}`;
    
    console.log('Article API - Fetching from:', apiUrl);
    console.log('Article API - Original ID/Slug:', id, 'Decoded:', decodedId, 'Encoded:', slug);

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
    let responseText = '';
    try {
      responseText = await response.text();
      console.log('Article API - Raw response text length:', responseText?.length || 0);
      console.log('Article API - Raw response text (first 500 chars):', responseText?.substring(0, 500) || 'empty');
      
      if (responseText && responseText.trim()) {
        data = JSON.parse(responseText);
        console.log('Article API - Parsed data keys:', Object.keys(data || {}));
      } else {
        console.warn('Article API - Empty response text');
        data = {};
      }
    } catch (parseError) {
      console.error('Article API - Parse error:', {
        error: parseError,
        responseText: responseText?.substring(0, 500),
        responseTextLength: responseText?.length || 0
      });
      data = { error: 'Failed to parse response', raw: responseText?.substring(0, 200) };
    }

    if (response.ok) {
      console.log('Article API - Success response structure:', {
        hasSuccess: data.success !== undefined,
        hasData: !!data.data,
        hasId: !!data.id,
        hasTitle: !!data.title,
        keys: Object.keys(data)
      });
      
      // Check if response has the expected structure
      if (data.success !== undefined) {
        // Response has success field, return as is
        return NextResponse.json(data, { status: response.status });
      } else if (data.data || data.id || data.title) {
        // Response has data, id, or title field, wrap it in success structure
        return NextResponse.json({
          success: true,
          data: data.data || data
        }, { status: response.status });
      } else {
        // Response structure is different, return as is
        return NextResponse.json(data, { status: response.status });
      }
    } else {
      // Handle error response
      console.error('Article API - Error response from external API:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        dataKeys: Object.keys(data || {}),
        dataString: JSON.stringify(data),
        dataIsEmpty: !data || Object.keys(data).length === 0,
        responseText: responseText?.substring(0, 500) || 'empty',
        responseTextLength: responseText?.length || 0
      });
      
      // Extract error message from various possible locations
      const errorMessage = 
        data?.message || 
        data?.error?.message ||
        data?.error ||
        (typeof data?.error === 'string' ? data.error : null) ||
        data?.errors?.message ||
        (response.status === 404 ? 'المقال غير موجود' : `فشل تحميل المقال (${response.status})`);
      
      return NextResponse.json(
        { 
          success: false,
          message: errorMessage,
          error: data?.error || errorMessage,
          status: response.status,
          data: data // Include original data for debugging
        },
        { status: 200 } // Return 200 so frontend can handle it
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

