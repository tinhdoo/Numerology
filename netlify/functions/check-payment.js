/**
 * Proxy function: check if a TOMATO payment code has been received
 * Frontend calls: /.netlify/functions/check-payment?code=TOMATO123456
 * This avoids CORS issues with calling SePay API directly from browser
 */
exports.handler = async (event) => {
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

  const apiKey = process.env.VITE_SEPAY_API_KEY || process.env.SEPAY_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ found: false, error: 'No API key' }) };
  }

  try {
    const res = await fetch('https://my.sepay.vn/userapi/transactions/list?account_number=all&limit=20', {
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
      return content.toUpperCase().includes(code.toUpperCase()) && amount >= 1000;
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
