// services/ai_engine.js
// Volreon AI — Akıllı Yapay Zeka Yanıt Motoru & Hafıza Yönetimi

const OpenAI = require('openai');
const { config } = require('../config/env');
const { VOLREON_KNOWLEDGE } = require('../config/volreon_knowledge');
const { sendTelegramLeadNotification } = require('./telegram_notify');

const openai = new OpenAI({
  apiKey: config.openaiApiKey || process.env.OPENAI_API_KEY
});

// ============================================================================
// Konuşma Hafızası (In-Memory Session Store - 24 Saatlik TTL)
// ============================================================================
const conversationHistory = new Map(); // subscriberId -> [{ role, content, ts }]
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function getSessionHistory(subscriberId) {
  const now = Date.now();
  const session = conversationHistory.get(subscriberId) || [];
  // Bayat mesajları filtrele
  const validMessages = session.filter(m => now - m.ts < SESSION_TTL_MS);
  return validMessages;
}

function appendToSession(subscriberId, role, content) {
  const history = getSessionHistory(subscriberId);
  history.push({ role, content, ts: Date.now() });
  // Son 10 mesajı tut (DM bağlamı için ideal derinlik)
  const trimmed = history.slice(-10);
  conversationHistory.set(subscriberId, trimmed);
}

// ============================================================================
// Telefon Numarası & Sıcak Lead Yakalama
// ============================================================================
const PHONE_REGEX = /(?:(?:\+?90\s*)|(?:0\s*))?(5[0-9]{2}[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2})/;

function extractPhoneNumber(text) {
  if (!text) return null;
  const match = text.match(PHONE_REGEX);
  if (match) {
    return match[0].replace(/[\s\-]/g, '');
  }
  return null;
}

// ============================================================================
// Güvenlik & Marka Filtresi (Sanitizer)
// ============================================================================
function sanitizeResponse(text) {
  if (!text) return '';
  // Yasaklı "şeffaf" kelimesini otomatik olarak "net" veya "sabit" ile değiştir
  let cleaned = text.replace(/şeffaf fiyat(landırma)?/gi, 'net yatırım bedeli');
  cleaned = cleaned.replace(/şeffaf/gi, 'açık ve net');
  return cleaned;
}

// ============================================================================
// Sistem Promptu
// ============================================================================
function buildSystemPrompt(userMetadata) {
  const paketlerMetni = VOLREON_KNOWLEDGE.paketler.map(p => {
    return `* ${p.baslik}:
  - Kurulum Bedeli: ${p.kurulum}
  - Aylık Bedel: ${p.aylik}
  - Özellikler: ${p.ozellikler.join(', ')}`;
  }).join('\n\n');

  return `Sen Volreon AI (volreonai.com) resmi Instagram Baş Satış & Danışmanlık Yapay Zekasısın.
Karşındaki kişi Instagram DM üzerinden seninle iletişim kuruyor. Kullanıcının adı: ${userMetadata.firstName || 'Değerli Misafirimiz'}, kullanıcı adı: @${userMetadata.igUsername || 'kullanici'}.

GÖREVİN VE KİMLİĞİN:
1. Kurumsal, son derece kibar, güven veren, çözüm odaklı ve uzman bir danışman gibi konuş.
2. İşletmelerin zaman kaybetmeden müşteri karşılamasını, randevu almasını ve satış yapmasını sağlayan otonom sistemlerimizi tanıt.
3. Müşterinin sektörünü ve temel ihtiyacını anla, ona EN UYGUN paketi öner.
4. Nihai hedefin: Müşterinin telefon numarasını ve sektör bilgisini alarak işletmeye özel ön görüşme / canlı demo randevusu ayarlamaktır.

VOLREON AI HİZMET VE FİYAT LİSTESİ:
${paketlerMetni}

TESLİMAT SÜRESİ:
Tüm sistemlerimiz 1-3 iş günü içerisinde anahtar teslim olarak kurulup teslim edilir.

ÇOK KATI MARKA KURALLARI (ASLA İHLAL ETME!):
1. ASLA "şeffaf" veya "şeffaf fiyat" KELİMELERİNİ KULLANMA! Bunun yerine "net", "açık", "sabit fiyatlı" veya "yatırım bedelleri" ifadelerini kullan.
2. Fiyat sorulduğunda veya paket önerildiğinde HEM Kurulum Bedeli'ni HEM DE Aylık Bedel'i eksiksiz söyle. Biri eksik olamaz!
   - Örn: Mesajlaşma Asistanı: ₺24.900 Kurulum + ₺6.900/ay.
   - Örn: Web Sitesi Tasarımı: ₺9.999 Kurulum, Aylık Ücret: YOKTUR (₺0).
3. Sesli Telefon Çağrı Asistanı için ASLA "sitemizde sesinizi kullanarak test edin" deme! Sitemizde sesli test yoktur. Bunun yerine "İşletmenize özel canlı sesli asistan demosu ve kurulum detayları için bize sektörünüzü ve telefon numaranızı iletebilirsiniz" de.
4. Mesajların Instagram DM'de okunacağını unutma. 1-2 kısa paragraf halinde, madde işaretleri ve uygun emojilerle ferah, okunaklı yaz. Asla devasa blok metinler yazma.
5. Kullanıcı telefon numarası verdiğinde veya randevu istediğinde teşekkür et ve uzman ekibimizin en kısa sürede kendisiyle iletişime geçeceğini belirt.`;
}

// ============================================================================
// Yanıt Üretici
// ============================================================================
async function generateReply(userMessage, userMetadata = {}) {
  const subscriberId = userMetadata.subscriberId || userMetadata.igUsername || 'default_user';

  // 1. Kullanıcı mesajını hafızaya ekle
  appendToSession(subscriberId, 'user', userMessage);

  // 2. Telefon numarası / sıcak lead tespiti
  const phone = extractPhoneNumber(userMessage);
  const isMeetingRequest = /(görüşme|toplantı|randevu|ara beni|arayabilir misiniz|numaram|teklif|fiyat teklifi)/i.test(userMessage);

  if (phone || (isMeetingRequest && userMessage.length > 5)) {
    // Arka planda Telegram bildirimini ateşle
    sendTelegramLeadNotification({
      igUsername: userMetadata.igUsername,
      firstName: userMetadata.firstName,
      phone: phone,
      sector: userMetadata.sector,
      lastMessage: userMessage
    }).catch(err => console.error('[Lead Notify Error]:', err));
  }

  // 3. Geçmiş konuşmaları çek
  const history = getSessionHistory(subscriberId);
  const messagesForLLM = [
    { role: 'system', content: buildSystemPrompt(userMetadata) },
    ...history.map(m => ({ role: m.role, content: m.content }))
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messagesForLLM,
      temperature: 0.6,
      max_tokens: 450
    });

    let rawReply = response.choices[0]?.message?.content || 'Merhaba! Volreon AI hakkında size nasıl yardımcı olabilirim?';
    
    // Güvenlik ve marka filtresinden geçir
    const finalReply = sanitizeResponse(rawReply);

    // Asistanın cevabını da hafızaya kaydet
    appendToSession(subscriberId, 'assistant', finalReply);

    return finalReply;
  } catch (error) {
    console.error('[AI Engine Error]:', error.message);
    // Hata anında güvenli, nazik kurumsal yedek mesaj
    return 'Merhaba! Şu anda yoğunluk nedeniyle sistemlerimizde kısa bir gecikme yaşanıyor. İşletmeniz için en uygun otomasyon çözümlerini sunmak adına sektörünüzü ve telefon numaranızı iletebilirseniz, uzman danışmanımız size en kısa sürede doğrudan ulaşacaktır.';
  }
}

module.exports = {
  generateReply,
  extractPhoneNumber,
  sanitizeResponse,
  getSessionHistory
};
