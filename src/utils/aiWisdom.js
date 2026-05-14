import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY?.trim();

if (!API_KEY) {
  console.error("VITE_GEMINI_API_KEY is missing from environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const FALLBACK_MODELS = [
  "gemini-2.0-flash-lite",   // fastest, least quota pressure
  "gemini-2.0-flash",        // standard
  "gemini-2.5-flash",        // most capable, use last
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Groq is OpenAI-compatible — fast inference, generous free tier
const generateWithGroq = async (prompt) => {
  if (!GROQ_KEY) throw new Error("No Groq API key");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 2048,
    }),
  });
  if (!response.ok) throw new Error(`Groq error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
};

const generateWithFallback = async (prompt) => {
  // Try Groq first (generous free tier, fast)
  try {
    return await generateWithGroq(prompt);
  } catch (groqError) {
    console.warn("Groq failed, trying Gemini:", groqError.message);
  }

  // Gemini fallback chain
  let lastError;
  for (const modelName of FALLBACK_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const currentModel = genAI.getGenerativeModel({ model: modelName });
        const result = await currentModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        const is429 = error?.status === 429 || error?.message?.includes('429');
        const is404 = error?.status === 404 || error?.message?.includes('404');
        console.warn(`Model ${modelName} attempt ${attempt + 1} failed:`, error.message);
        lastError = error;
        if (is404) break;
        if (is429 && attempt === 0) {
          await sleep(3000);
          continue;
        }
        break;
      }
    }
  }

  throw lastError;
};

// Session-level cache: avoids re-calling API for identical prompts
const _cache = new Map();

const cachedGenerate = async (prompt) => {
  const key = prompt.slice(0, 200);
  if (_cache.has(key)) {
    console.info("Cache hit — skipping API call");
    return _cache.get(key);
  }
  const result = await generateWithFallback(prompt);
  if (result) _cache.set(key, result);
  return result;
};

/**
 * AI Wisdom Utility
 * Uses Google Gemini API to provide deep, personalized spiritual advice.
 */

export const generateAIAdvice = async (type, data) => {
  try {
    let prompt = "";

    if (type === 'numerology') {
      prompt = `
        Bạn là một chuyên gia Thần số học và cố vấn tâm linh huyền bí. 
        Hãy phân tích các con số sau đây của một người và đưa ra lời khuyên sâu sắc, đầy cảm hứng bằng tiếng Việt.
        
        Dữ liệu Thần số học:
        - Số Đường Đời (Life Path): ${data.lp}. Ý nghĩa: ${data.lpText}
        - Số Sứ Mệnh (Destiny): ${data.destiny}. Ý nghĩa: ${data.destinyText}
        - Số Linh Hồn (Soul): ${data.soul}
        - Số Nhân Cách (Personality): ${data.personality}
        - Năm Cá Nhân (Personal Year): ${data.py}
        
        Yêu cầu:
        1. Sử dụng ngôn từ huyền bí, sang trọng nhưng gần gũi.
        2. Kết hợp các con số để đưa ra một bức tranh toàn cảnh về vận mệnh hiện tại.
        3. Đưa ra lời khuyên cụ thể cho Năm Cá Nhân hiện tại.
        4. Trình bày ngắn gọn, súc tích (khoảng 150-200 từ).
      `;
    } else {
      const cardDetails = data.cards.map((card, i) => 
        `Lá bài ${i+1}: ${card.rank} ${card.suit} ${card.isReversed ? '(Ngược)' : '(Xuôi)'}. Ý nghĩa: ${card.isReversed ? card.meaningReversed : card.meaning}`
      ).join('\n');

      prompt = `
        Bạn là một bậc thầy thấu thị và đọc bài Tarot/Tây huyền bí.
        Người dùng đang hỏi về chủ đề: "${data.category}".
        Hãy giải mã 3 lá bài sau đây và đưa ra lời thấu thị bằng tiếng Việt.
        
        Các lá bài đã rút:
        ${cardDetails}
        
        Yêu cầu:
        1. Giải mã mối liên hệ giữa các lá bài với chủ đề "${data.category}".
        2. Sử dụng phong cách tiên tri, huyền bí, đầy trực giác.
        3. Đưa ra lời khuyên hành động hoặc thông điệp từ vũ trụ dành cho họ.
        4. Trình bày ngắn gọn, súc tích (khoảng 150-200 từ).
      `;
    }

    return await cachedGenerate(prompt);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Thật tiếc, kết nối với các vì sao đang bị gián đoạn. Hãy thử lại sau khi dòng chảy năng lượng ổn định hơn. (Lỗi: " + error.message + ")";
  }
};

export const askFollowUpQuestion = async (type, data, chatHistory, newQuestion) => {
  try {
    let context = "";
    if (type === 'numerology') {
      context = `Dữ liệu Thần số học: Đường Đời: ${data.lp}, Sứ Mệnh: ${data.destiny}, Linh Hồn: ${data.soul}, Nhân Cách: ${data.personality}, Năm Cá Nhân: ${data.py}.`;
    } else {
      const cardDetails = data.cards.map((card, i) => `Lá bài ${i+1}: ${card.rank} ${card.suit} ${card.isReversed ? '(Ngược)' : '(Xuôi)'}`).join(', ');
      context = `Các lá bài đã rút về chủ đề "${data.category}": ${cardDetails}.`;
    }

    const historyText = chatHistory.map(msg => `${msg.role === 'user' ? 'Người dùng' : 'AI'}: ${msg.text}`).join('\n\n');

    const prompt = `Bạn là một cố vấn tâm linh huyền bí.
Ngữ cảnh của người dùng: ${context}

Lịch sử trò chuyện trước đó:
${historyText}

Người dùng hỏi tiếp: ${newQuestion}

Hãy đưa ra câu trả lời ngắn gọn, đúng trọng tâm câu hỏi của người dùng dựa trên ngữ cảnh tâm linh ở trên bằng tiếng Việt. Phong cách bí ẩn nhưng rõ ràng.`;

    return await cachedGenerate(prompt);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Năng lượng đang xáo trộn, mình không thể phân tích được câu hỏi này. Hãy thử lại nhé.";
  }
};

export const generateIndividualCardMeanings = async (cards, category) => {
  try {
    const cardDetails = cards.map((card, i) => 
      `Lá bài ${i+1}: ${card.rank} ${card.suit} ${card.isReversed ? '(Ngược)' : '(Xuôi)'}. Ý nghĩa gốc: ${card.isReversed ? card.meaningReversed || card.meaning : card.meaningUpright || card.meaning}`
    ).join('\n');

    const prompt = `
Bạn là một chuyên gia bói bài Tây. Người dùng đang hỏi về chủ đề: "${category}".
Họ rút được 3 lá bài sau:
${cardDetails}

Hãy đưa ra lời giải mã NGẮN GỌN (khoảng 2-3 câu) cho TỪNG lá bài, giải thích cụ thể lá bài này có ý nghĩa gì đối với chủ đề "${category}".
Không gộp chung ý nghĩa. Hãy trả lời theo đúng ngữ cảnh của chủ đề.

Yêu cầu bắt buộc: Trả về kết quả DƯỚI DẠNG MẢNG JSON, KHÔNG KÈM THEO BẤT KỲ VĂN BẢN NÀO KHÁC BÊN NGOÀI.
Ví dụ định dạng trả về:
[
  "Lá bài này cho thấy...",
  "Ý nghĩa của lá bài thứ hai là...",
  "Lá bài cuối cùng báo hiệu..."
]
`;

    const responseText = await cachedGenerate(prompt);
    let cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);
    
    if (Array.isArray(parsed) && parsed.length === cards.length) {
      return parsed;
    }
    throw new Error("Invalid format returned by AI");
  } catch (error) {
    console.error("Gemini API Error for individual cards:", error);
    // Fallback to original meanings if AI fails
    return cards.map(c => c.isReversed && c.meaningReversed ? c.meaningReversed : (c.meaningUpright || c.meaning));
  }
};

export const generateNumerologyReport = async (data) => {
  try {
    const prompt = `
Bạn là một chuyên gia Thần số học Pitago. Khách hàng có các chỉ số sau:
- Đường Đời: ${data.lp}
- Sứ Mệnh: ${data.destiny}
- Linh Hồn: ${data.soul}
- Nhân Cách: ${data.personality}
- Năm Cá Nhân: ${data.py}

Hãy phân tích chuyên sâu cho 2 chỉ số quan trọng nhất của người này:
1. Chỉ số Đường Đời
2. Chỉ số Sứ Mệnh

Yêu cầu bắt buộc: Trả về kết quả DƯỚI DẠNG MẢNG JSON gồm đúng 2 chuỗi (phần tử 1 là Đường Đời, phần tử 2 là Sứ Mệnh), KHÔNG KÈM THEO BẤT KỲ VĂN BẢN NÀO KHÁC BÊN NGOÀI.

TRONG MỖI CHUỖI, BẮT BUỘC sử dụng Markdown và tuân thủ cấu trúc sau:
Đoạn văn ngắn (1-2 câu) mô tả đặc trưng tổng quan.

**Điểm mạnh:**
- Điểm mạnh 1
- Điểm mạnh 2

**Cần cải thiện:**
- Điểm cần khắc phục 1
- Điểm cần khắc phục 2

> Lời khuyên cốt lõi tóm tắt lại cho chỉ số này (dạng Quote)
`;
    const responseText = await cachedGenerate(prompt);
    let cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);
    
    if (Array.isArray(parsed) && parsed.length >= 2) {
      return { lpText: parsed[0], destinyText: parsed[1] };
    }
    throw new Error("Invalid format returned by AI");
  } catch (error) {
    console.error("Gemini API Error for numerology report:", error);
    return null;
  }
};

export const generateMonthlyPredictions = async (data) => {
  try {
    const currentYear = new Date().getFullYear();
    const prompt = `
Bạn là một chuyên gia Thần số học Pitago. Khách hàng có:
- Đường Đời: ${data.lp}
- Sứ Mệnh: ${data.destiny}
- Năm Cá Nhân hiện tại (${currentYear}): ${data.py}

Dựa vào năng lượng của năm cá nhân và đường đời, hãy chọn ra CÁC THÁNG (từ tháng 1 đến tháng 12 của năm ${currentYear}) có năng lượng đỉnh cao nhất và tốt nhất cho 3 khía cạnh:
1. Học hành / Sự nghiệp
2. Tiền bạc / Tài chính
3. Tình cảm / Mối quan hệ

Yêu cầu bắt buộc: Trả về kết quả DƯỚI DẠNG MẢNG JSON gồm đúng 3 đối tượng (phần tử 1: Sự nghiệp, phần tử 2: Tiền bạc, phần tử 3: Tình cảm), KHÔNG KÈM THEO BẤT KỲ VĂN BẢN NÀO KHÁC BÊN NGOÀI.
Ví dụ:
[
  { "title": "Sự nghiệp", "months": "Tháng 4, Tháng 8", "desc": "Lý do ngắn gọn (1 câu) tại sao tháng này lại bứt phá..." },
  { "title": "Tiền bạc", "months": "Tháng 5, Tháng 11", "desc": "Lý do ngắn gọn..." },
  { "title": "Tình cảm", "months": "Tháng 2, Tháng 6", "desc": "Lý do ngắn gọn..." }
]
`;
    const responseText = await cachedGenerate(prompt);
    let cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);
    
    if (Array.isArray(parsed) && parsed.length >= 3) {
      return parsed;
    }
    throw new Error("Invalid format returned by AI");
  } catch (error) {
    console.error("Gemini API Error for monthly predictions:", error);
    return null;
  }
};

export const generateSoulmateAnalysis = async (person1, person2) => {
  try {
    const prompt = `
Bạn là chuyên gia Thần số học Pytago về tương hợp tâm linh. Phân tích sự tương hợp giữa:

Người 1: ${person1.name} (sinh ${person1.dob})
- Đường Đời: ${person1.lp}
- Sứ Mệnh: ${person1.destiny}

Người 2: ${person2.name} (sinh ${person2.dob})
- Đường Đời: ${person2.lp}
- Sứ Mệnh: ${person2.destiny}

Trả về KẾT QUẢ DƯỚI DẠNG JSON DUY NHẤT (không kèm văn bản nào khác) với cấu trúc sau:
{
  "matchPercent": <số nguyên 0-100 thể hiện độ tương hợp>,
  "summary": "<1 câu tóm tắt về mối duyên giữa hai người>",
  "emotion": "<phân tích cảm xúc, dùng markdown bullet điểm mạnh và điểm cần lưu ý>",
  "communication": "<phân tích giao tiếp và cách giải quyết xung đột, dùng markdown bullet>",
  "karmic": "<phân tích nghiệp duyên tiền kiếp / bài học chung, dùng markdown bullet>",
  "redFlag": "<cảnh báo những điểm dễ gây mâu thuẫn hoặc đổ vỡ, dùng markdown bullet với dấu ⚠️>"
}
`;
    const responseText = await cachedGenerate(prompt);
    let cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);
    if (parsed && parsed.matchPercent !== undefined) {
      return parsed;
    }
    throw new Error("Invalid format");
  } catch (error) {
    console.error("Gemini API Error for soulmate analysis:", error);
    return null;
  }
};

export const generateDailyCosmicMessage = async () => {
  try {
    const prompt = `
      Bạn là một nhà tiên tri và cố vấn tâm linh huyền bí.
      Hãy đưa ra một "Thông điệp vũ trụ hôm nay" (Daily cosmic message) ngắn gọn, đầy cảm hứng và mang tính tiên tri cho người dùng bằng tiếng Việt.
      
      Yêu cầu:
      1. Sử dụng ngôn từ huyền bí, sang trọng, đầy trực giác.
      2. Thông điệp mang tính tích cực, gợi mở hoặc nhắc nhở về một bài học cuộc sống.
      3. Độ dài cực ngắn: 2-3 câu (khoảng 40-60 từ) để người dùng dễ đọc nhanh.
      4. Không cần xưng hô cụ thể, hãy nói như vũ trụ đang thì thầm với họ.
    `;
    return await cachedGenerate(prompt);
  } catch (error) {
    console.error("Gemini API Error for daily message:", error);
    return "Hôm nay, hãy tin tưởng vào trực giác của bạn. Vũ trụ luôn dẫn lối cho những ai biết lắng nghe.";
  }
};
