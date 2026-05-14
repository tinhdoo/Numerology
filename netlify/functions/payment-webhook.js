/**
 * SePay Webhook Handler — Netlify Function
 * Endpoint: /.netlify/functions/payment-webhook
 *
 * SePay sẽ POST dữ liệu giao dịch tới đây mỗi khi có tiền vào.
 * Function này xác thực và trả về 200 OK để SePay không retry.
 *
 * Docs: https://docs.sepay.vn/webhook.html
 */

const crypto = require('crypto');

exports.handler = async (event) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Verify API Key from Authorization header (as configured in SePay dashboard)
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  const apiKey = process.env.VITE_SEPAY_API_KEY;

  if (!apiKey) {
    console.error('[SePay Webhook] VITE_SEPAY_API_KEY is not set');
    return { statusCode: 500, body: 'Server Configuration Error' };
  }

  const expectedAuth = `Apikey ${apiKey}`;
  
  if (authHeader !== expectedAuth) {
    console.warn('[SePay Webhook] Invalid Authorization header');
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    // Log for debugging (visible in Netlify Function logs)
    console.log('[SePay Webhook]', JSON.stringify(body, null, 2));

    const {
      id,
      gateway,
      transactionDate,
      accountNumber,
      subAccount,
      code,           // Nội dung chuyển khoản — chứa mã TOMATO______
      content,        // Alias
      transferType,   // in = tiền vào
      transferAmount, // Số tiền VND
      accumulated,
      referenceCode,
    } = body;

    const txContent = code || content || '';
    const amount = Number(transferAmount || 0);

    // Chỉ xử lý tiền VÀO
    if (transferType !== 'in') {
      return { statusCode: 200, body: JSON.stringify({ success: true, ignored: 'not incoming' }) };
    }

    // Kiểm tra nội dung có chứa mã TOMATO không
    const tomatoMatch = txContent.match(/TOMATO\d{6}/i);
    if (!tomatoMatch) {
      return { statusCode: 200, body: JSON.stringify({ success: true, ignored: 'no TOMATO code' }) };
    }

    const txCode = tomatoMatch[0].toUpperCase();
    console.log(`[SePay] Payment confirmed: ${txCode} — ${amount} VND`);

    // ✅ Trả về 200 OK — frontend đang poll SePay API trực tiếp
    // nên không cần lưu state ở đây (stateless architecture).
    // Nếu muốn dùng database/KV sau này: lưu txCode + timestamp vào đây.

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('[SePay Webhook Error]', err.message);
    return {
      statusCode: 200, // Vẫn trả 200 để SePay không retry liên tục
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
