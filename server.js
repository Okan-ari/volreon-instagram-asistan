// server.js — Volreon AI Instagram Akıllı Satış Asistanı Webhook Sunucusu
const express = require('express');
const { config } = require('./config/env');
const { generateReply } = require('./services/ai_engine');

const app = express();
app.use(express.json());

// Sağlık kontrolü (Railway & Monitoring için)
app.get('/', (req, res) => {
  res.json({
    status: 'active',
    service: 'Volreon AI Instagram Assistant',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ManyChat Instagram Webhook Endpoint'i
app.post('/webhook/instagram', async (req, res) => {
  const secret = req.headers['x-webhook-secret'];
  
  // Güvenlik doğrulaması
  if (config.webhookSecret && secret && secret !== config.webhookSecret) {
    console.warn('[Webhook] Geçersiz webhook secret reddedildi.');
    return res.status(401).json({ error: 'Unauthorized: Invalid secret' });
  }

  const payload = req.body || {};
  
  // ManyChat'ten gelebilecek farklı alan adlarını destekle
  const userMessage = payload.message || payload.last_text_input || payload.last_input_text || payload.text || '';
  const subscriberId = payload.subscriber_id || payload.kullanici_id || payload.user_id || 'anonim';
  const igUsername = payload.username || payload.ig_username || '';
  const firstName = payload.first_name || payload.ad || '';

  if (!userMessage || userMessage.trim().length === 0) {
    return res.json({
      reply: 'Merhaba! Volreon AI hakkında size nasıl yardımcı olabilirim?',
      status: 'empty_message'
    });
  }

  console.log(`[Instagram DM] @${igUsername || subscriberId}: "${userMessage}"`);

  try {
    const reply = await generateReply(userMessage, {
      subscriberId,
      igUsername,
      firstName
    });

    console.log(`[Volreon AI Yanıtı]: "${reply.slice(0, 100)}..."`);

    // ManyChat External Request'in Custom Field'e yazması için JSON yanıt dön
    return res.json({
      reply: reply,
      status: 'ok'
    });
  } catch (error) {
    console.error('[Webhook Hatası]:', error);
    return res.json({
      reply: 'Merhaba! Mesajınızı aldık. İşletmenize özel otomasyon çözümlerimiz hakkında bilgi almak için sektörünüzü ve telefon numaranızı iletebilirsiniz.',
      status: 'error_fallback'
    });
  }
});

// Hızlı Test Endpoint'i (Secret gerektirmez, lokal testler için)
app.post('/test', async (req, res) => {
  const { message, username, firstName } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Lütfen "message" alanı gönderin.' });
  }

  try {
    const reply = await generateReply(message, {
      subscriberId: username || 'test_user',
      igUsername: username || 'test_user',
      firstName: firstName || 'Test Kullanıcısı'
    });

    return res.json({ success: true, message, reply });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

const PORT = config.port || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Volreon AI Instagram Asistanı http://0.0.0.0:${PORT} üzerinde çalışıyor.`);
});
