/**
 * CSRF Token Utilities
 * Handles CSRF token fetching and caching
 */

/**
 * Fetch CSRF token from the server
 * @returns {Promise<string|null>} CSRF token or null
 */
export const fetchCsrfToken = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/csrf-token`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      const token = data.csrf_token || data.token || data.csrfToken;
      
      if (token) {
        localStorage.setItem('csrfToken', token);
        return token;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
};

/**
 * Get CSRF token from storage or fetch it
 * @returns {Promise<string|null>} CSRF token
 */
export const getCsrfToken = async () => {
  if (typeof window === 'undefined') return null;

  // Try to get from localStorage first
  const storedToken = localStorage.getItem('csrfToken');
  if (storedToken) {
    return storedToken;
  }

  // Try to get from meta tag
  const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (metaToken) {
    localStorage.setItem('csrfToken', metaToken);
    return metaToken;
  }

  // Try to get from cookie
  const cookieToken = getCsrfTokenFromCookie();
  if (cookieToken) {
    localStorage.setItem('csrfToken', cookieToken);
    return cookieToken;
  }

  // Fetch from server as last resort
  return fetchCsrfToken();
};

/**
 * Get CSRF token from cookies
 * @returns {string|null} CSRF token or null
 */
const getCsrfTokenFromCookie = () => {
  if (typeof window === 'undefined') return null;

  const names = ['XSRF-TOKEN', 'csrf-token', 'csrfToken', '_token'];
  
  for (const name of names) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const token = parts.pop().split(';').shift();
      if (token) return token;
    }
  }

  return null;
};
