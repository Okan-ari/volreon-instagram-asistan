// services/telegram_notify.js
// Sıcak lead (telefon numarası bırakan veya görüşme isteyen müşteri) bildirimi

const fetch = require('node-fetch');
const { config } = require('../config/env');

async function sendTelegramLeadNotification(leadData) {
  if (!config.telegramBotToken || !config.adminChatId) {
    console.warn('[Telegram] Bot token veya Admin Chat ID tanımlı değil, bildirim atlanıyor.');
    return false;
  }

  const { igUsername, firstName, phone, sector, lastMessage } = leadData;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  const safeName = escapeHtml(firstName || 'Belirtilmedi');
  const safeUsername = escapeHtml(igUsername ? '@' + igUsername : 'Instagram Kullanıcısı');
  const safePhone = escapeHtml(phone || 'Mesajda tespit edildi');
  const safeSector = escapeHtml(sector || '');
  const safeMsg = escapeHtml(lastMessage || '');

  const text = `🚨 <b>YENİ SICAK MÜŞTERİ (LEAD) — Instagram DM</b> 🚨\n\n` +
    `👤 <b>Müşteri:</b> ${safeName} (${safeUsername})\n` +
    `📞 <b>Telefon:</b> <code>${safePhone}</code>\n` +
    (safeSector ? `🏢 <b>Sektör:</b> ${safeSector}\n` : '') +
    `💬 <b>Son Mesaj:</b> "${safeMsg}"\n\n` +
    `⏰ <b>Tarih:</b> ${new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}\n` +
    `⚡ <b>Aksiyon:</b> Müşteriyi hemen arayabilir veya DM'den dönüş yapabilirsiniz!`;

  try {
    const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.adminChatId,
        text,
        parse_mode: 'HTML'
      })
    });

    const data = await res.json();
    if (data.ok) {
      console.log(`[Telegram] Sıcak lead bildirimi başarıyla iletildi: ${phone || igUsername}`);
      return true;
    } else {
      console.error('[Telegram] Bildirim gönderme hatası:', data);
      return false;
    }
  } catch (err) {
    console.error('[Telegram] Ağ hatası:', err.message);
    return false;
  }
}

module.exports = { sendTelegramLeadNotification };
