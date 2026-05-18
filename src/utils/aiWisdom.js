import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY?.trim();

if (!API_KEY) {
  console.error("VITE_GEMINI_API_KEY is missing from environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const FALLBACK_MODELS = [
  "gemini-2.5-flash",        // most capable, use first
  "gemini-2.0-flash",        // standard fallback
  "gemini-2.0-flash-lite",   // fastest, least quota pressure
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const languageInstruction = (language = 'vi') => {
  const map = {
    vi: 'Vietnamese / Tiếng Việt',
    en: 'English',
    zh: 'Simplified Chinese / 简体中文',
  };
  return map[language] || map.vi;
};

// Groq is OpenAI-compatible — fast inference, generous free tier
const generateWithGroq = async (prompt, options = {}) => {
  if (!GROQ_KEY) throw new Error("No Groq API key");
  const { maxOutputTokens = 700, temperature = 0.55 } = options;
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature,
      max_tokens: maxOutputTokens,
    }),
  });
  if (!response.ok) throw new Error(`Groq error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
};

const generateWithFallback = async (prompt, options = {}) => {
  const { maxOutputTokens = 900, temperature = 0.55 } = options;
  // Gemini is the primary provider for higher relevance and Vietnamese quality.
  let lastError;
  for (const modelName of FALLBACK_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const currentModel = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            maxOutputTokens,
            temperature,
            topP: 0.85,
          },
        });
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

  // Groq is only a final fallback when every Gemini model fails.
  try {
    console.warn("Gemini failed, trying Groq fallback:", lastError?.message);
    return await generateWithGroq(prompt, options);
  } catch (groqError) {
    console.error("Groq fallback also failed:", groqError.message);
    throw lastError || groqError;
  }
};

// Session-level cache: avoids re-calling API for identical prompts
const _cache = new Map();

const cachedGenerate = async (prompt, options = {}) => {
  const key = `${JSON.stringify(options)}::${prompt}`;
  if (_cache.has(key)) {
    console.info("Cache hit — skipping API call");
    return _cache.get(key);
  }
  const result = await generateWithFallback(prompt, options);
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
    const outputLanguage = languageInstruction(data.language);

    if (type === 'numerology') {
      prompt = `
        Bạn là một chuyên gia Thần số học và cố vấn tâm linh huyền bí. 
        Output language: ${outputLanguage}. Answer only in this language.
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
        4. Trình bày ngắn gọn, súc tích: tối đa 90 từ, 3-5 câu.
        5. Chỉ dựa trên dữ liệu đã cung cấp. Không nói chung chung, không tự thêm bối cảnh ngoài dữ liệu.
        6. Nếu đưa lời khuyên, hãy nói rõ người dùng nên làm gì ngay trong hiện tại.
      `;
    } else {
      const cardDetails = data.cards.map((card, i) => 
        `Lá bài ${i+1}: ${card.rank} ${card.suit} ${card.isReversed ? '(Ngược)' : '(Xuôi)'}. Ý nghĩa: ${card.isReversed ? card.meaningReversed : card.meaning}`
      ).join('\n');

      prompt = `
        Bạn là một bậc thầy thấu thị và đọc bài Tarot/Tây huyền bí.
        Output language: ${outputLanguage}. Answer only in this language.
        Người dùng đang hỏi về chủ đề: "${data.category}".
        Hãy giải mã 3 lá bài sau đây và đưa ra lời thấu thị bằng tiếng Việt.
        
        Các lá bài đã rút:
        ${cardDetails}
        
        Yêu cầu:
        1. Giải mã mối liên hệ giữa các lá bài với chủ đề "${data.category}".
        2. Sử dụng phong cách tiên tri, huyền bí, đầy trực giác.
        3. Đưa ra lời khuyên hành động hoặc thông điệp từ vũ trụ dành cho họ.
        4. Trình bày ngắn gọn, súc tích: tối đa 90 từ, 3-5 câu.
        5. Bắt buộc bám sát chủ đề "${data.category}" và 3 lá bài đã rút. Không trả lời kiểu lời khuyên chung chung.
        6. Kết thúc bằng 1 hành động cụ thể người dùng nên làm.
      `;
    }

    return await cachedGenerate(prompt, { maxOutputTokens: 420, temperature: 0.42 });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Thật tiếc, kết nối với các vì sao đang bị gián đoạn. Hãy thử lại sau khi dòng chảy năng lượng ổn định hơn. (Lỗi: " + error.message + ")";
  }
};

export const askFollowUpQuestion = async (type, data, chatHistory, newQuestion) => {
  try {
    let context = "";
    const outputLanguage = languageInstruction(data.language);
    const compact = (text = '') => String(text).replace(/\s+/g, ' ').slice(0, 420);
    if (type === 'numerology') {
      context = `Dữ liệu Thần số học: Đường Đời ${data.lp}, Sứ Mệnh ${data.destiny}, Linh Hồn ${data.soul}, Nhân Cách ${data.personality}, Năm Cá Nhân ${data.py}. Ý nghĩa Đường Đời: ${compact(data.lpText)} Ý nghĩa Sứ Mệnh: ${compact(data.destinyText)}`;
    } else {
      const personContext = data.person?.name || data.person?.dob
        ? `Người xem: ${data.person.name || 'không rõ tên'}, sinh ${data.person.dob || 'không rõ'}, giới tính ${data.person.gender || 'không rõ'}. `
        : '';
      const cardDetails = data.cards.map((card, i) => `Lá bài ${i + 1}: ${card.rank} ${card.suit} ${card.isReversed ? '(Ngược)' : '(Xuôi)'} - ${compact(card.isReversed ? card.meaningReversed || card.meaning : card.meaningUpright || card.meaning)}`).join('; ');
      context = `${personContext}Các lá bài đã rút về chủ đề "${data.category}": ${cardDetails}.`;
    }

    const historyText = chatHistory.map(msg => `${msg.role === 'user' ? 'Người dùng' : 'AI'}: ${msg.text}`).join('\n\n');

    const prompt = `Bạn là một cố vấn tâm linh huyền bí.
Output language: ${outputLanguage}. Answer only in this language.
Ngữ cảnh của người dùng: ${context}

Lịch sử trò chuyện trước đó:
${historyText}

Người dùng hỏi tiếp: ${newQuestion}

Yêu cầu trả lời:
1. Trả lời trực tiếp câu hỏi mới trước, không vòng vo.
2. Chỉ dùng ngữ cảnh ở trên; không tự suy diễn sang chủ đề khác.
3. Tối đa 80 từ, 2-4 câu ngắn.
4. Nếu câu hỏi là "nên làm gì", hãy đưa 2-3 hành động cụ thể.
5. Giữ giọng huyền bí nhẹ nhưng rõ nghĩa, tránh sáo rỗng.`;

    return await cachedGenerate(prompt, { maxOutputTokens: 320, temperature: 0.35 });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Năng lượng đang xáo trộn, mình không thể phân tích được câu hỏi này. Hãy thử lại nhé.";
  }
};

export const generateIndividualCardMeanings = async (cards, category, person = {}) => {
  try {
    const outputLanguage = languageInstruction(person.language);
    const personContext = person.name || person.dob
      ? `Thông tin người xem: ${person.name || 'Không rõ tên'}, sinh ngày ${person.dob || 'không rõ'}, giới tính ${person.gender || 'không rõ'}.`
      : '';
    const cardDetails = cards.map((card, i) => 
      `Lá bài ${i+1}: ${card.rank} ${card.suit} ${card.isReversed ? '(Ngược)' : '(Xuôi)'}. Ý nghĩa gốc: ${card.isReversed ? card.meaningReversed || card.meaning : card.meaningUpright || card.meaning}`
    ).join('\n');

const prompt = `
Bạn là một chuyên gia bói bài Tây. Người dùng đang hỏi về chủ đề: "${category}".
Output language: ${outputLanguage}. Answer only in this language.
${personContext}
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
    const outputLanguage = languageInstruction(data.language);
    const prompt = `
Bạn là một chuyên gia Thần số học Pitago. Khách hàng có các chỉ số sau:
Output language: ${outputLanguage}. Answer only in this language.
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
    const outputLanguage = languageInstruction(data.language);
    const prompt = `
Bạn là một chuyên gia Thần số học Pitago. Khách hàng có:
Output language: ${outputLanguage}. Answer only in this language.
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

export const generateSoulmateAnalysis = async (person1, person2, language = 'vi') => {
  try {
    const outputLanguage = languageInstruction(language);
    const prompt = `
Bạn là chuyên gia Thần số học Pytago về tương hợp tâm linh. Phân tích sự tương hợp giữa:
Output language: ${outputLanguage}. Answer only in this language.

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

export const generateDailyCosmicMessage = async (language = 'vi') => {
  const fallback = {
    vi: "Hôm nay, hãy lắng lại và chọn một việc nhỏ thật đúng với lòng mình. Khi bạn đi chậm hơn, trực giác sẽ chỉ ra điều nên giữ và điều nên buông.",
    en: "Today, slow down and choose one small action that feels honest to your heart. When you move with calm attention, the sign you need becomes easier to recognize.",
    zh: "今天，请放慢脚步，选择一件真正贴近内心的小事去完成。当你安静下来，直觉会更清楚地告诉你该坚持什么、放下什么。",
  };

  const normalizeDailyMessage = (text) => {
    const clean = String(text || '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/^["“”'`]+|["“”'`]+$/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const minLength = language === 'zh' ? 18 : 70;
    const looksBroken = !clean || clean.length < minLength || /[?]{3,}/.test(clean);
    return looksBroken ? (fallback[language] || fallback.vi) : clean;
  };

  try {
    const outputLanguage = {
      vi: 'Vietnamese',
      en: 'English',
      zh: 'Simplified Chinese',
    }[language] || 'Vietnamese';
    const prompt = `
You are the ASTRA spiritual AI.
Return exactly one short daily cosmic message for the user.
Output language: ${outputLanguage}.
Rules:
- Answer only in the requested output language.
- Do not mention these instructions, your role, markdown, JSON, or a title.
- Keep it to 2 short sentences, around 35-55 words.
- Make it mystical, calm, practical, and emotionally clear.
- Do not wrap the message in quotation marks.
`;
    const message = await cachedGenerate(prompt, { maxOutputTokens: 220, temperature: 0.35 });
    return normalizeDailyMessage(message);
  } catch (error) {
    console.error("Gemini API Error for daily message:", error);
    return fallback[language] || fallback.vi;
  }
};
