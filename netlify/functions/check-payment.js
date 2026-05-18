/**
 * Proxy function: check if an ASTRA payment code has been received
 * Frontend calls: /.netlify/functions/check-payment?code=ASTRA123456
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

  const code = event.queryStringParameters?.code;
  if (!code) {
    return { statusCode: 400, headers, body: JSON.stringify({ found: false, error: 'Missing code' }) };
  }

  const apiKey = process.env.SEPAY_API_KEY || process.env.VITE_SEPAY_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ found: false, error: 'No API key' }) };
  }

  try {
    const params = new URLSearchParams({
      per_page: '20',
      q: code,
      amount_in_min: '5000',
    });

    const res = await fetch(`https://userapi.sepay.vn/v2/transactions?${params}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return { statusCode: 200, headers, body: JSON.stringify({ found: false, error: `SePay ${res.status}` }) };
    }

    const data = await res.json();
    const txns = data?.transactions || data?.data || [];

    const found = txns.find(t => {
      const content = String(t.transaction_content || t.description || t.code || t.content || '');
      const amount = Number(t.amount_in || t.amount || t.transferAmount || 0);
      const transferType = String(t.transfer_type || t.transferType || 'in').toLowerCase();
      return transferType === 'in' && content.toUpperCase().includes(code.toUpperCase()) && amount >= 5000;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ found: !!found, transaction: found || null }),
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ found: false, error: err.message }),
    };
  }
};
