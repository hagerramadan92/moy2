import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Get access token from Authorization header
    const authHeader = req.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || authHeader;

    if (!accessToken) {
      return NextResponse.json(
        { 
          status: false,
          message: 'Authorization token is required' 
        },
        { status: 401 }
      );
    }

    // Parse form data (multipart/form-data)
    const formData = await req.formData();

    // Prepare headers for external API
    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };

    // Create FormData for external API
    const externalFormData = new FormData();
    
    // Add name if provided
    const name = formData.get('name');
    if (name) {
      externalFormData.append('name', name);
    }

    // Add avatar if provided (can be File or empty string)
    const avatar = formData.get('avatar');
    // Check if avatar field exists in formData (even if it's empty string)
    // formData.get() returns null if field doesn't exist, empty string if field exists but is empty
    if (avatar !== null && avatar !== undefined) {
      if (avatar instanceof File) {
        // User uploaded a new image file
        externalFormData.append('avatar', avatar);
      } else {
        // Avatar is empty string - send it to remove avatar
        externalFormData.append('avatar', '');
      }
    }

    // Call the external complete-profile API
    const response = await fetch('http://moya.talaaljazeera.com/api/v1/auth/complete-profile', {
      method: 'POST',
      headers: headers,
      body: externalFormData,
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    } else {
      return NextResponse.json(
        { 
          status: false,
          message: data.message || data.error || 'فشل تحديث الملف الشخصي',
          errors: data.errors 
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Complete profile API error:', error);
    return NextResponse.json(
      { 
        status: false,
        message: 'حدث خطأ أثناء تحديث الملف الشخصي' 
      },
      { status: 500 }
    );
  }
}

