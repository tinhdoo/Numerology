/**
 * Payment utility using SePay API.
 *
 * Keep SePay API tokens server-side only. The browser should call Netlify
 * Functions, and those functions call SePay with SEPAY_API_KEY.
 */

const PRICE = 5000; // VND
const DESCRIPTION_PREFIX = 'ASTRA';

/**
 * Generate a unique transaction code for this session.
 */
export const generateTransactionCode = () => {
  const rand = Math.floor(Math.random() * 900000 + 100000);
  return `${DESCRIPTION_PREFIX}${rand}`;
};

/**
 * Generate a VietQR URL for display as QR code image.
 * Uses VietQR public API (no auth needed), separate from SePay.
 */
export const getVietQRUrl = ({ bankId, accountNo, amount, description }) => {
  const encoded = encodeURIComponent(description);
  return `https://qr.sepay.vn/img?acc=${accountNo}&bank=${bankId}&amount=${amount}&des=${encoded}`;
};

/**
 * Fetch SePay bank account info through the Netlify proxy.
 */
export const fetchSePayAccount = async () => {
  const res = await fetch('/.netlify/functions/get-bank-account');
  if (!res.ok) {
    let errMsg = `Netlify proxy fetch failed: ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.error) errMsg = errData.error;
    } catch {
      // Ignore malformed proxy error bodies and keep the HTTP status message.
    }
    throw new Error(errMsg);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error);

  const accounts = data?.bankaccounts || data?.data || [];
  return accounts.find(a => a.active === 1 || a.status === 1 || a.status === 'active') || accounts[0];
};

/**
 * Poll via Netlify proxy function to check payment confirmation.
 */
export const pollPaymentConfirmation = (code, onSuccess, onFail) => {
  let stopped = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 24; // 2 minutes (5s interval)

  const check = async () => {
    if (stopped) return;
    try {
      const res = await fetch(`/.netlify/functions/check-payment?code=${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.found) {
          stopped = true;
          onSuccess(data.transaction);
          return;
        }
      }
    } catch (e) {
      console.warn('Poll error:', e.message);
    }

    attempts++;
    if (attempts >= MAX_ATTEMPTS) {
      onFail('Timeout');
      return;
    }
    setTimeout(check, 5000);
  };

  check();
  return () => {
    stopped = true;
  };
};

export { PRICE };
