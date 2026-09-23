const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// 1. Önce lokal .env oku
const localEnvPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
}

// 2. Eksik değişkenler varsa master.env'den tamamla
const masterEnvPath = path.join(__dirname, '..', '..', '..', '_knowledge', 'credentials', 'master.env');
if (fs.existsSync(masterEnvPath)) {
  const masterConfig = dotenv.parse(fs.readFileSync(masterEnvPath));
  for (const [k, v] of Object.entries(masterConfig)) {
    if (!process.env[k] && v) {
      process.env[k] = v;
    }
  }
}

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  webhookSecret: process.env.INSTAGRAM_WEBHOOK_SECRET || 'volreon_secret_key_2026',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  adminChatId: process.env.ADMIN_CHAT_ID || '',
  nodeEnv: process.env.NODE_ENV || 'production',
};

module.exports = { config };
