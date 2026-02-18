import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    // Await params as it's a Promise in Next.js 15+
    const { id } = await params;
    
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json(
        { 
          status: false,
          message: 'Address ID is required' 
        },
        { status: 400 }
      );
    }

    // Get access token from Authorization header
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    const accessToken = authHeader?.replace(/^Bearer\s+/i, '') || authHeader;

    if (!accessToken) {
      return NextResponse.json(
        { 
          status: false,
          message: 'Authorization token is required' 
        },
        { status: 401 }
      );
    }

    // Prepare headers for external API
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };

    // Call the external address API
    const response = await fetch(`https://dashboard.waytmiah.com/api/v1/addresses/${id}`, {
      method: 'GET',
      headers: headers,
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    } else {
      return NextResponse.json(
        { 
          status: false,
          message: data.message || data.error || 'فشل جلب العنوان',
          errors: data.errors 
        },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { 
        status: false,
        message: 'حدث خطأ أثناء جلب العنوان' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    // Await params as it's a Promise in Next.js 15+
    const { id } = await params;
    
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json(
        { 
          status: false,
          message: 'Address ID is required' 
        },
        { status: 400 }
      );
    }

    // Get access token from Authorization header
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    const accessToken = authHeader?.replace(/^Bearer\s+/i, '') || authHeader;

    if (!accessToken) {
      return NextResponse.json(
        { 
          status: false,
          message: 'Authorization token is required' 
        },
        { status: 401 }
      );
    }

    // Get request body
    const body = await req.json();

    // Prepare headers for external API
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };

    // Call the external address API to update
    const response = await fetch(`https://dashboard.waytmiah.com/api/v1/addresses/${id}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    } else {
      return NextResponse.json(
        { 
          status: false,
          message: data.message || data.error || 'فشل تحديث العنوان',
          errors: data.errors 
        },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { 
        status: false,
        message: 'حدث خطأ أثناء تحديث العنوان' 
      },
      { status: 500 }
    );
  }
}

