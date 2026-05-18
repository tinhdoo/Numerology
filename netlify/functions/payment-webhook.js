/**
 * SePay Webhook Handler - Netlify Function
 * Endpoint: /.netlify/functions/payment-webhook
 *
 * SePay sends POST data for incoming bank transactions. This function validates
 * the Authorization header and returns 200 for processed or intentionally
 * ignored events so SePay does not retry indefinitely.
 */

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  const apiKey = process.env.SEPAY_WEBHOOK_API_KEY || process.env.SEPAY_API_KEY || process.env.VITE_SEPAY_API_KEY;

  if (!apiKey) {
    console.error('[SePay Webhook] SEPAY_WEBHOOK_API_KEY/SEPAY_API_KEY is not set');
    return { statusCode: 500, body: 'Server Configuration Error' };
  }

  if (authHeader !== `Apikey ${apiKey}`) {
    console.warn('[SePay Webhook] Invalid Authorization header');
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    console.log('[SePay Webhook]', JSON.stringify(body, null, 2));

    const {
      code,
      content,
      transferType,
      transferAmount,
    } = body;

    const txContent = code || content || '';
    const amount = Number(transferAmount || 0);

    if (transferType !== 'in') {
      return json({ success: true, ignored: 'not incoming' });
    }

    const astraMatch = txContent.match(/ASTRA\d{6}/i);
    if (!astraMatch) {
      return json({ success: true, ignored: 'no ASTRA code' });
    }

    const txCode = astraMatch[0].toUpperCase();
    console.log(`[SePay] Payment confirmed: ${txCode} - ${amount} VND`);

    return json({ success: true });
  } catch (err) {
    console.error('[SePay Webhook Error]', err.message);
    return json({ success: false, error: err.message });
  }
};

const json = (body) => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
