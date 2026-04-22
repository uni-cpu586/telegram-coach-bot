import { Telegraf } from 'telegraf';
import { getCoachReply, getCoachReplyWithImage } from '../coach.js';

const sessions = new Map();

function getSession(userId) {
  if (!sessions.has(userId)) sessions.set(userId, []);
  return sessions.get(userId);
}

function updateHistory(history, userContent, reply) {
  history.push({ role: 'user', content: userContent });
  history.push({ role: 'assistant', content: reply });
  if (history.length > 20) history.splice(0, 2);
}

export function createTelegramBot(token) {
  const bot = new Telegraf(token);

  bot.start((ctx) => {
    ctx.reply('嗨！我是你的心理教練 🌱\n有什麼想聊的嗎？');
  });

  bot.command('reset', (ctx) => {
    sessions.delete(ctx.from.id);
    ctx.reply('對話記錄已清除，我們重新開始吧。');
  });

  bot.on('text', async (ctx) => {
    console.log('收到訊息:', ctx.from.id, ctx.message.text);
    const history = getSession(ctx.from.id);
    const userMessage = ctx.message.text;
    await ctx.sendChatAction('typing');
    try {
      const reply = await getCoachReply(userMessage, history);
      updateHistory(history, userMessage, reply);
      await ctx.reply(reply);
    } catch (err) {
      console.error('Coach error:', err.message, err.stack);
      await ctx.reply('抱歉，我現在有點狀況，請稍後再試。');
    }
  });

  bot.on('photo', async (ctx) => {
    const history = getSession(ctx.from.id);
    const caption = ctx.message.caption || '';
    await ctx.sendChatAction('typing');
    try {
      // 取最高解析度的圖片
      const photos = ctx.message.photo;
      const fileId = photos[photos.length - 1].file_id;
      const fileUrl = await ctx.telegram.getFileLink(fileId);
      const reply = await getCoachReplyWithImage(fileUrl.href, caption, history);
      updateHistory(history, `[圖片] ${caption}`, reply);
      await ctx.reply(reply);
    } catch (err) {
      console.error('Photo error:', err);
      await ctx.reply('抱歉，我現在無法處理圖片，請稍後再試。');
    }
  });

  return bot;
}
