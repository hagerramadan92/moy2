import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    // Await params as it's a Promise in Next.js 15+
    const { id } = await params;
    
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Comments API - Missing or invalid article ID:', id);
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
    
    // Use the comments endpoint: https://dashboard.waytmiah.com/api/v1/articles/{id}/comments
    const articleId = encodeURIComponent(decodedId);
    const apiUrl = `https://dashboard.waytmiah.com/api/v1/articles/${articleId}/comments`;
    
    console.log('Comments API - Fetching from:', apiUrl);
    console.log('Comments API - Article ID/Slug:', id, 'Decoded:', decodedId, 'Encoded:', articleId);

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

    console.log('Comments API - Response status:', response.status);

    let data = {};
    let responseText = '';
    try {
      responseText = await response.text();
      console.log('Comments API - Raw response text length:', responseText?.length || 0);
      
      if (responseText && responseText.trim()) {
        data = JSON.parse(responseText);
        console.log('Comments API - Parsed data keys:', Object.keys(data || {}));
      } else {
        console.warn('Comments API - Empty response text');
        data = {};
      }
    } catch (parseError) {
      console.error('Comments API - Parse error:', {
        error: parseError,
        responseText: responseText?.substring(0, 500),
        responseTextLength: responseText?.length || 0
      });
      data = { error: 'Failed to parse response', raw: responseText?.substring(0, 200) };
    }

    if (response.ok) {
      console.log('Comments API - Success response structure:', {
        hasSuccess: data.success !== undefined,
        hasData: !!data.data,
        isArray: Array.isArray(data),
        keys: Object.keys(data)
      });
      
      // Check if response has the expected structure
      if (data.success !== undefined) {
        // Response has success field, return as is
        return NextResponse.json(data, { status: response.status });
      } else if (Array.isArray(data)) {
        // Response is an array of comments
        return NextResponse.json({
          success: true,
          data: data
        }, { status: response.status });
      } else if (data.data && Array.isArray(data.data)) {
        // Response has data field with array
        return NextResponse.json({
          success: true,
          data: data.data
        }, { status: response.status });
      } else {
        // Response structure is different, return as is
        return NextResponse.json(data, { status: response.status });
      }
    } else {
      // Handle error response
      console.error('Comments API - Error response from external API:', {
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
        (response.status === 404 ? 'التعليقات غير موجودة' : `فشل تحميل التعليقات (${response.status})`);
      
      return NextResponse.json(
        { 
          success: false,
          message: errorMessage,
          error: data?.error || errorMessage,
          status: response.status,
          data: [] // Return empty array for comments
        },
        { status: 200 } // Return 200 so frontend can handle it
      );
    }
  } catch (error) {
    console.error('Comments API error:', error);
    
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return NextResponse.json(
        { 
          success: false,
          message: 'انتهت مهلة الاتصال بالخادم', 
          error: 'Timeout',
          data: []
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: 'حدث خطأ أثناء تحميل التعليقات', 
        error: error.message,
        data: []
      },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  try {
    // Await params as it's a Promise in Next.js 15+
    const { id } = await params;
    
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Post Comment API - Missing or invalid article ID:', id);
      return NextResponse.json(
        { 
          success: false,
          message: 'Article ID or slug is required',
          error: 'Missing ID'
        },
        { status: 400 }
      );
    }

    // Get request body
    const body = await req.json();
    
    // Validate required fields
    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { 
          success: false,
          message: 'محتوى التعليق مطلوب',
          error: 'Content is required'
        },
        { status: 400 }
      );
    }

    // Decode the ID/slug in case it's URL encoded
    const decodedId = decodeURIComponent(id);
    
    // Use the comments endpoint: https://dashboard.waytmiah.com/api/v1/articles/{id}/comments
    const articleId = encodeURIComponent(decodedId);
    const apiUrl = `https://dashboard.waytmiah.com/api/v1/articles/${articleId}/comments`;
    
    console.log('Post Comment API - Posting to:', apiUrl);
    console.log('Post Comment API - Article ID/Slug:', id, 'Decoded:', decodedId, 'Encoded:', articleId);

    // Get CSRF token from request headers or cookies
    const csrfTokenFromHeader = req.headers.get('X-CSRF-TOKEN') || 
                                req.headers.get('X-XSRF-TOKEN');
    
    // Prepare headers for external API
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0',
    };

    // Add CSRF token if available
    if (csrfTokenFromHeader) {
      headers['X-CSRF-TOKEN'] = csrfTokenFromHeader;
      headers['X-XSRF-TOKEN'] = csrfTokenFromHeader;
    }

    // Prepare request body
    const requestBody = {
      content: body.content.trim(),
    };

    // Add guest fields if provided
    if (body.guest_name) {
      requestBody.guest_name = body.guest_name.trim();
    }
    if (body.guest_email) {
      requestBody.guest_email = body.guest_email.trim();
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let response;
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
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

    console.log('Post Comment API - Response status:', response.status);

    let data = {};
    let responseText = '';
    try {
      responseText = await response.text();
      
      if (responseText && responseText.trim()) {
        data = JSON.parse(responseText);
        console.log('Post Comment API - Parsed data keys:', Object.keys(data || {}));
      } else {
        console.warn('Post Comment API - Empty response text');
        data = {};
      }
    } catch (parseError) {
      console.error('Post Comment API - Parse error:', {
        error: parseError,
        responseText: responseText?.substring(0, 500),
        responseTextLength: responseText?.length || 0
      });
      data = { error: 'Failed to parse response', raw: responseText?.substring(0, 200) };
    }

    if (response.ok) {
      console.log('Post Comment API - Success response');
      
      // Return the response as is
      return NextResponse.json(data, { status: response.status });
    } else {
      // Handle error response
      console.error('Post Comment API - Error response from external API:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        dataKeys: Object.keys(data || {}),
        dataString: JSON.stringify(data),
        responseText: responseText?.substring(0, 500) || 'empty',
      });
      
      // Extract error message from various possible locations
      const errorMessage = 
        data?.message || 
        data?.error?.message ||
        data?.error ||
        (typeof data?.error === 'string' ? data.error : null) ||
        data?.errors?.message ||
        (response.status === 422 ? 'البيانات المدخلة غير صحيحة' : `فشل إضافة التعليق (${response.status})`);
      
      return NextResponse.json(
        { 
          success: false,
          message: errorMessage,
          error: data?.error || errorMessage,
          errors: data?.errors,
          status: response.status,
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Post Comment API error:', error);
    
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return NextResponse.json(
        { 
          success: false,
          message: 'انتهت مهلة الاتصال بالخادم', 
          error: 'Timeout',
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: 'حدث خطأ أثناء إضافة التعليق', 
        error: error.message,
      },
      { status: 500 }
    );
  }
}

