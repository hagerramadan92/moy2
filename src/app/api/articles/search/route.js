import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Use req.nextUrl for Next.js 13+ App Router
    const url = req.nextUrl || new URL(req.url);
    // Get the query parameter - it's already decoded by Next.js
    const q = url.searchParams.get('q');
    
    if (!q || q.trim() === '') {
      return NextResponse.json(
        { 
          message: 'يرجى إدخال كلمة البحث',
          error: 'Missing search query'
        },
        { status: 400 }
      );
    }
    
    // Trim and encode the Arabic query properly for URL
    const trimmedQuery = q.trim();
    // Use encodeURIComponent to properly encode Arabic characters
    const encodedQuery = encodeURIComponent(trimmedQuery);
    
    // Build API URL with properly encoded query parameter
    const apiUrl = `https://moya.talaaljazeera.com/api/v1/articles/search?q=${encodedQuery}`;
    
    console.log('Articles Search API - Original query:', trimmedQuery);
    console.log('Articles Search API - Encoded query:', encodedQuery);
    
    console.log('Articles Search API - Fetching from:', apiUrl);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

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

    // Forward the request to the external API
    let response;
    try {
      response = await fetch(apiUrl, {
        method: 'GET',
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

    console.log('Articles Search API - Response status:', response.status);

    let data = {};
    try {
      const text = await response.text();
      console.log('Articles Search API - Response text:', text.substring(0, 200));
      if (text) {
        data = JSON.parse(text);
        console.log('Articles Search API - Parsed data keys:', Object.keys(data));
      }
    } catch (parseError) {
      console.error('Articles Search API - Parse error:', parseError);
      data = { error: 'Failed to parse response', raw: text?.substring(0, 200) };
    }

    if (response.ok) {
      // Log the actual API response structure
      console.log('Articles Search API - Raw API response:', JSON.stringify(data, null, 2));
      console.log('Articles Search API - Response keys:', Object.keys(data));
      console.log('Articles Search API - data.success:', data.success);
      console.log('Articles Search API - data.data type:', Array.isArray(data.data) ? 'Array' : typeof data.data);
      console.log('Articles Search API - data.data length:', data.data?.length);
      
      // Extract articles - the API returns: { success: true, data: [...] }
      let articlesData = [];
      
      if (data.success === true && data.data && Array.isArray(data.data)) {
        // Direct structure: { success: true, data: [...] }
        articlesData = data.data;
      } else if (data.data && Array.isArray(data.data)) {
        // Fallback: { data: [...] }
        articlesData = data.data;
      } else if (data.articles && Array.isArray(data.articles)) {
        // Fallback: { articles: [...] }
        articlesData = data.articles;
      } else if (Array.isArray(data)) {
        // Fallback: direct array
        articlesData = data;
      }
      
      console.log('Articles Search API - Extracted articles count:', articlesData.length);
      if (articlesData.length > 0) {
        console.log('Articles Search API - First article:', JSON.stringify(articlesData[0], null, 2));
      }
      
      // Ensure consistent response structure
      const responseData = {
        success: true,
        data: articlesData,
        message: data.message || 'تم البحث بنجاح'
      };
      
      console.log('Articles Search API - Returning response:', {
        success: responseData.success,
        dataLength: responseData.data?.length || 0
      });
      
      return NextResponse.json(responseData, { status: 200 });
    } else {
      // For 404 or not found errors, return empty results instead of error
      if (response.status === 404) {
        console.log('Articles Search API - 404: No results found, returning empty array');
        return NextResponse.json({
          success: true,
          data: [],
          message: 'لم يتم العثور على نتائج'
        }, { status: 200 });
      }
      
      const errorMessage = 
        data.message || 
        data.error || 
        data.errors?.message ||
        `فشل البحث عن المقالات (${response.status})`;
      
      console.error('Articles Search API - Error details:', {
        status: response.status,
        message: errorMessage,
        fullData: data
      });
      
      // Return error with consistent structure
      return NextResponse.json(
        { 
          success: false,
          data: [],
          message: errorMessage,
          error: data.error || data.errors,
          status: response.status
        },
        { status: 200 } // Return 200 so frontend can handle it gracefully
      );
    }
  } catch (error) {
    console.error('Articles Search API error:', error);
    
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
        message: 'حدث خطأ أثناء البحث عن المقالات',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

