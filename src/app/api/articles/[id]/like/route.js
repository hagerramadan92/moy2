import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  try {
    // Await params as it's a Promise in Next.js 15+
    const { id } = await params;
    
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Like API - Missing or invalid article ID:', id);
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
    
    // Use the like endpoint: https://dashboard.waytmiah.com/api/v1/articles/{id}/like
    const articleId = encodeURIComponent(decodedId);
    const apiUrl = `https://dashboard.waytmiah.com/api/v1/articles/${articleId}/like`;
    
    console.log('Like API - Posting to:', apiUrl);
    console.log('Like API - Article ID/Slug:', id, 'Decoded:', decodedId, 'Encoded:', articleId);

    // Get access token from request headers if available
    const authHeader = req.headers.get('authorization');
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
    };

    // Add authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response;
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
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

    console.log('Like API - Response status:', response.status);

    let data = {};
    let responseText = '';
    try {
      responseText = await response.text();
      console.log('Like API - Raw response text length:', responseText?.length || 0);
      
      if (responseText && responseText.trim()) {
        data = JSON.parse(responseText);
        console.log('Like API - Parsed data keys:', Object.keys(data || {}));
      } else {
        console.warn('Like API - Empty response text');
        data = {};
      }
    } catch (parseError) {
      console.error('Like API - Parse error:', {
        error: parseError,
        responseText: responseText?.substring(0, 500),
        responseTextLength: responseText?.length || 0
      });
      data = { error: 'Failed to parse response', raw: responseText?.substring(0, 200) };
    }

    if (response.ok) {
      console.log('Like API - Success response structure:', {
        hasSuccess: data.success !== undefined,
        hasData: !!data.data,
        keys: Object.keys(data)
      });
      
      // Return the response as is
      return NextResponse.json({
        success: true,
        ...data
      }, { status: response.status });
    } else {
      // Handle error response
      console.error('Like API - Error response from external API:', {
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
        `فشل إضافة الإعجاب (${response.status})`;
      
      return NextResponse.json(
        { 
          success: false,
          message: errorMessage,
          error: data?.error || errorMessage,
          status: response.status
        },
        { status: 200 } // Return 200 so frontend can handle it
      );
    }
  } catch (error) {
    console.error('Like API error:', error);
    
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return NextResponse.json(
        { 
          success: false,
          message: 'انتهت مهلة الاتصال بالخادم', 
          error: 'Timeout'
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: 'حدث خطأ أثناء إضافة الإعجاب', 
        error: error.message
      },
      { status: 500 }
    );
  }
}

