import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Get access token from Authorization header
    const authHeader = req.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || authHeader;

    // Prepare headers for external API
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add authorization header if token is available
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Call the external logout API
    let logoutResponse;
    try {
      logoutResponse = await fetch('https://moya.talaaljazeera.com/api/v1/auth/logout', {
        method: 'POST',
        headers: headers,
      });
    } catch (fetchError) {
      console.error('Logout API fetch error:', fetchError);
      // Continue with local cleanup even if API call fails
    }

    // Clear cookies
    const res = NextResponse.json({ 
      ok: true, 
      message: logoutResponse?.ok ? 'تم تسجيل الخروج بنجاح' : 'تم تسجيل الخروج محلياً'
    });

    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');

    return res;
  } catch (err) {
    console.error('Error in logout:', err);
    // Still return success to allow local cleanup
    const res = NextResponse.json({ 
      ok: true, 
      message: 'تم تسجيل الخروج محلياً' 
    });
    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');
    return res;
  }
}
