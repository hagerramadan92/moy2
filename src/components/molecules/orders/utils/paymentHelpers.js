// Payment Helper Functions

/**
 * Get payment callback data from sessionStorage
 */
export const getPaymentCallbackData = () => {
  if (typeof window === 'undefined') return null;
  
  const data = sessionStorage.getItem('paymentCallbackData');
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error('Error parsing payment callback data:', err);
    return null;
  }
};

/**
 * Get pending offer data from localStorage
 */
export const getPendingOfferData = () => {
  if (typeof window === 'undefined') return null;
  
  const data = localStorage.getItem('pendingOfferData');
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error('Error parsing pending offer data:', err);
    return null;
  }
};


/**
 * Confirm driver after payment
 */
export const confirmDriverAfterPayment = async (orderId, driverId, offerId) => {
  const API_BASE_URL = 'https://dashboard.waytmiah.com/api/v1';
  
  const getAccessToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }

  const res = await fetch(
    `${API_BASE_URL}/orders/${orderId}/confirm-driver`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        driver_id: driverId,
        offer_id: offerId,
      }),
    }
  );

  const data = await res.json();

  if (res.ok && data.status) {
    // Clear the stored callback data after successful confirmation
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('paymentCallbackData');
      localStorage.removeItem('pendingOfferData');
    }
    return data.data;
  }

  throw new Error(data.message || "فشل تأكيد السائق");
};

