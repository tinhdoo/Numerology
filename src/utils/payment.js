/**
 * Payment utility using SePay API
 * SePay is a Vietnamese payment gateway supporting QR bank transfer.
 * 
 * NOTE: Payment verification should ideally be done server-side via webhook.
 * This implementation uses polling for client-side demo purposes.
 */

const SEPAY_API_KEY = import.meta.env.VITE_SEPAY_API_KEY?.trim();
const SEPAY_BASE = 'https://my.sepay.vn/userapi';

const PRICE = 5000; // VND
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
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encoded}&accountName=TOMATO`;
};

/**
 * Fetch your SePay bank account info to get accountNo and bankId
 */
export const fetchSePayAccount = async () => {
  if (!SEPAY_API_KEY) throw new Error('SePay API key missing');
  const res = await fetch(`${SEPAY_BASE}/bankaccounts/list`, {
    headers: {
      'Authorization': `Bearer ${SEPAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`SePay account fetch failed: ${res.status}`);
  const data = await res.json();
  // Returns first active bank account
  const accounts = data?.bankaccounts || data?.data || [];
  return accounts.find(a => a.status === 1 || a.status === 'active') || accounts[0];
};

/**
 * Poll SePay transactions to verify a payment by matching description code
 * @param {string} code - Unique transaction code to match
 * @param {Function} onSuccess - Called when payment confirmed
 * @param {Function} onFail - Called when timeout or error
 * @returns {Function} stop - Call to cancel polling
 */
export const pollPaymentConfirmation = (code, onSuccess, onFail) => {
  if (!SEPAY_API_KEY) { onFail('No API key'); return () => {}; }

  let stopped = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 24; // 2 minutes (5s interval)

  const check = async () => {
    if (stopped) return;
    try {
      const res = await fetch(
        `${SEPAY_BASE}/transactions/list?account_number=all&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${SEPAY_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) throw new Error(`Poll failed: ${res.status}`);
      const data = await res.json();
      const txns = data?.transactions || data?.data || [];
      const found = txns.find(t =>
        String(t.transaction_content || t.description || '').includes(code) &&
        Number(t.amount_in || t.amount || 0) >= PRICE
      );
      if (found) {
        stopped = true;
        onSuccess(found);
        return;
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
  return () => { stopped = true; };
};

export { PRICE };
