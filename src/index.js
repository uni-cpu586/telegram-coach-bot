import 'dotenv/config';
import { setDefaultAutoSelectFamily } from 'net';
setDefaultAutoSelectFamily(false);
import { createTelegramBot } from './platforms/telegram.js';

const { TELEGRAM_BOT_TOKEN } = process.env;

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ 缺少 TELEGRAM_BOT_TOKEN，請設定 .env 檔案');
  process.exit(1);
}

const bot = createTelegramBot(TELEGRAM_BOT_TOKEN);

bot.launch();
console.log('✅ 心理教練 Bot 已啟動');

// 優雅關閉
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
