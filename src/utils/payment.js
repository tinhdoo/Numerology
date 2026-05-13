/**
 * Payment utility using SePay API
 * SePay is a Vietnamese payment gateway supporting QR bank transfer.
 * 
 * NOTE: Payment verification should ideally be done server-side via webhook.
 * This implementation uses polling for client-side demo purposes.
 */

const SEPAY_API_KEY = import.meta.env.VITE_SEPAY_API_KEY?.trim();
const SEPAY_BASE = 'https://my.sepay.vn/userapi';

const PRICE = 2000; // VND
const BANK_ACCOUNT = ''; // Will be fetched from SePay account info
const DESCRIPTION_PREFIX = 'TOMATO';

/**
 * Generate a unique transaction code for this session
 */
export const generateTransactionCode = () => {
  const rand = Math.floor(Math.random() * 900000 + 100000);
  return `${DESCRIPTION_PREFIX}${rand}`;
};

/**
 * Generate a VietQR URL for display as QR code image.
 * Uses VietQR public API (no auth needed) — separate from SePay.
 * Bank info must be configured for your account.
 */
export const getVietQRUrl = ({ bankId, accountNo, amount, description }) => {
  const encoded = encodeURIComponent(description);
  return `https://qr.sepay.vn/img?acc=${accountNo}&bank=${bankId}&amount=${amount}&des=${encoded}`;
};

/**
 * Fetch your SePay bank account info to get accountNo and bankId
 */
export const fetchSePayAccount = async () => {
  const res = await fetch('/.netlify/functions/get-bank-account');
  if (!res.ok) {
    // Attempt to parse JSON error if available
    let errMsg = `Netlify proxy fetch failed: ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.error) errMsg = errData.error;
    } catch (e) {}
    throw new Error(errMsg);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  // Returns first active bank account
  const accounts = data?.bankaccounts || data?.data || [];
  return accounts.find(a => a.status === 1 || a.status === 'active') || accounts[0];
};

/**
 * Poll via Netlify proxy function to check payment confirmation.
 * Avoids CORS issues — the function runs server-side and calls SePay.
 */
export const pollPaymentConfirmation = (code, onSuccess, onFail) => {
  let stopped = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 24; // 2 minutes (5s interval)

  // Detect if running on Netlify or localhost
  const base = window.location.hostname === 'localhost'
    ? '' // will fail gracefully on localhost — use manual confirm
    : '';

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
    if (attempts >= MAX_ATTEMPTS) { onFail('Timeout'); return; }
    setTimeout(check, 5000);
  };

  check();
  return () => { stopped = true; };
};

export { PRICE };
