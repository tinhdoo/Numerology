/**
 * Proxy function: fetch bank account list from SePay
 * Frontend calls: /.netlify/functions/get-bank-account
 * This avoids CORS issues with calling SePay API directly from browser
 */
export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const apiKey = process.env.SEPAY_API_KEY || process.env.VITE_SEPAY_API_KEY;
  const qrAccountNo = process.env.SEPAY_QR_ACCOUNT_NO;
  const qrBankId = process.env.SEPAY_QR_BANK_ID;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'No API key' }) };
  }

  try {
    const res = await fetch('https://userapi.sepay.vn/v2/bank-accounts', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return { statusCode: res.status, headers, body: JSON.stringify({ error: `SePay ${res.status}` }) };
    }

    const data = await res.json();
    const accounts = data?.bankaccounts || data?.data;
    if (Array.isArray(accounts) && (qrAccountNo || qrBankId)) {
      const patchedAccounts = accounts.map(account => ({
        ...account,
        payment_account_number: qrAccountNo || account.account_number,
        payment_bank_id: qrBankId || account.bank_short_name || account.bank_code,
      }));

      if (data.bankaccounts) data.bankaccounts = patchedAccounts;
      if (data.data) data.data = patchedAccounts;
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
