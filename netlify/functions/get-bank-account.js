/**
 * Proxy function: fetch bank account list from SePay
 * Frontend calls: /.netlify/functions/get-bank-account
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

  const apiKey = process.env.VITE_SEPAY_API_KEY || process.env.SEPAY_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'No API key' }) };
  }

  try {
    const res = await fetch('https://my.sepay.vn/userapi/bankaccounts/list', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return { statusCode: res.status, headers, body: JSON.stringify({ error: `SePay ${res.status}` }) };
    }

    const data = await res.json();
    
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
