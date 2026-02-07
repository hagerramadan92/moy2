import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    // Await params as it's a Promise in Next.js 15+
    const { key } = await params;
    
    if (!key || key === 'undefined' || key === 'null') {
      console.error('Pages API - Missing or invalid key:', key);
      return NextResponse.json(
        { 
          success: false,
          message: 'Page key is required',
          error: 'Missing key'
        },
        { status: 400 }
      );
    }

    // Decode the key in case it's URL encoded
    const decodedKey = decodeURIComponent(key);
    
    // Use the pages endpoint: https://moya.talaaljazeera.com/api/v1/pages/{key}
    const pageKey = encodeURIComponent(decodedKey);
    const apiUrl = `https://moya.talaaljazeera.com/api/v1/pages/${pageKey}`;
    
    console.log('Pages API - Fetching from:', apiUrl);
    console.log('Pages API - Page key:', key, 'Decoded:', decodedKey, 'Encoded:', pageKey);

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

    console.log('Pages API - Response status:', response.status);

    let data = {};
    let responseText = '';
    try {
      responseText = await response.text();
      console.log('Pages API - Raw response text length:', responseText?.length || 0);
      
      if (responseText && responseText.trim()) {
        data = JSON.parse(responseText);
        console.log('Pages API - Parsed data keys:', Object.keys(data || {}));
      } else {
        console.warn('Pages API - Empty response text');
        data = {};
      }
    } catch (parseError) {
      console.error('Pages API - Parse error:', {
        error: parseError,
        responseText: responseText?.substring(0, 500),
        responseTextLength: responseText?.length || 0
      });
      data = { error: 'Failed to parse response', raw: responseText?.substring(0, 200) };
    }

    if (response.ok) {
      console.log('Pages API - Success response structure:', {
        hasStatus: data.status !== undefined,
        hasData: !!data.data,
        hasSections: !!data.data?.sections,
        sectionsCount: data.data?.sections?.length || 0,
        keys: Object.keys(data)
      });
      
      // Check if response has the expected structure
      if (data.status !== undefined || data.success !== undefined) {
        // Response has status/success field, return as is
        return NextResponse.json({
          success: data.status || data.success,
          ...data
        }, { status: response.status });
      } else if (data.data) {
        // Response has data field, wrap it in success structure
        return NextResponse.json({
          success: true,
          ...data
        }, { status: response.status });
      } else {
        // Response structure is different, return as is
        return NextResponse.json(data, { status: response.status });
      }
    } else {
      // Handle error response
      console.error('Pages API - Error response from external API:', {
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
        `فشل تحميل بيانات الصفحة (${response.status})`;
      
      return NextResponse.json(
        { 
          success: false,
          status: false,
          message: errorMessage,
          error: data?.error || errorMessage,
          statusCode: response.status
        },
        { status: 200 } // Return 200 so frontend can handle it
      );
    }
  } catch (error) {
    console.error('Pages API error:', error);
    
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return NextResponse.json(
        { 
          success: false,
          status: false,
          message: 'انتهت مهلة الاتصال بالخادم', 
          error: 'Timeout'
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        status: false,
        message: 'حدث خطأ أثناء تحميل بيانات الصفحة', 
        error: error.message
      },
      { status: 500 }
    );
  }
}

