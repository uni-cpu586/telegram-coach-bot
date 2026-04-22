import { GoogleGenerativeAI } from '@google/generative-ai';
import https from 'https';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `你是一位溫暖、專業的心理教練，採用阿德勒心理學的正向引導風格。
你的目標是：
- 傾聽使用者的困擾，給予同理與支持
- 用提問引導使用者自我探索，而非直接給答案
- 聚焦在「可以改變的事」和「自身的力量」
- 語氣自然友善，像一位可以信任的朋友

重要限制：遇到明確的危機情況（如自傷、自殺意念），請溫柔提醒尋求專業協助。`;

function fetchImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
      res.on('error', reject);
    });
  });
}

export async function getCoachReply(userMessage, conversationHistory = []) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
  });

  const history = conversationHistory.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

export async function getCoachReplyWithImage(imageUrl, caption, conversationHistory = []) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
  });

  const history = conversationHistory.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const imageBase64 = await fetchImageAsBase64(imageUrl);
  const parts = [
    { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
    { text: caption || '這張圖片讓你有什麼感受或想法？' },
  ];

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(parts);
  return result.response.text();
}
