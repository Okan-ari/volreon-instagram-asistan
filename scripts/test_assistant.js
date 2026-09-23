// scripts/test_assistant.js
// Volreon AI Instagram Asistanı kural ve kalite doğrulama testi

const { generateReply, extractPhoneNumber, sanitizeResponse } = require('../services/ai_engine');

async function runTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 VOLREON AI INSTAGRAM ASİSTANI — OTOMASYON DOĞRULAMA TESTİ');
  console.log('🧪 ========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ [GEÇTİ] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [BAŞARISIZ] ${testName}`);
      if (details) console.error(`   Ayrıntı: ${details}`);
      failed++;
    }
  }

  // 1. Birim Test: Telefon Numarası Tespiti
  console.log('--- 1. Telefon Numarası Tespiti Testi ---');
  const sampleText1 = 'Detayları konuşmak için numaram 0532 123 45 67 arayabilirsiniz';
  const phone1 = extractPhoneNumber(sampleText1);
  assert(phone1 === '05321234567', 'TR Telefon formatı başarıyla ayıklandı', `Çıktı: ${phone1}`);

  // 2. Birim Test: Yasaklı Kelime Temizleyici
  console.log('\n--- 2. Yasaklı Kelime Filtresi (Sanitizer) Testi ---');
  const forbiddenText = 'Bizim en büyük avantajımız şeffaf fiyat politikamızdır ve tamamen şeffaf çalışırız.';
  const sanitized = sanitizeResponse(forbiddenText);
  assert(!sanitized.toLowerCase().includes('şeffaf'), '"şeffaf" kelimesi tamamen temizlendi', `Sonuç: ${sanitized}`);

  // 3. Canlı LLM Testi: Paket ve Fiyat Sorusu
  console.log('\n--- 3. LLM Paket & Fiyat Kuralları Testi ---');
  const prompt1 = 'Merhaba, WhatsApp ve Instagram için yapay zeka asistanı fiyatlarınız nedir? Ne kadar sürede teslim ediyorsunuz?';
  const reply1 = await generateReply(prompt1, {
    subscriberId: 'test_user_1',
    igUsername: 'okan_test',
    firstName: 'Okan'
  });

  console.log(`\n💬 Soru: "${prompt1}"`);
  console.log(`🤖 Cevap:\n${reply1}\n`);

  assert(!reply1.toLowerCase().includes('şeffaf'), 'Cevapta "şeffaf" kelimesi YOK');
  assert(reply1.includes('24.900') || reply1.includes('39.900'), 'Fiyat listesinde kurulum bedeli yer alıyor');
  assert(reply1.includes('6.900') || reply1.includes('11.900'), 'Fiyat listesinde aylık hizmet bedeli yer alıyor');
  assert(reply1.includes('1-3 iş günü'), 'Teslimat süresi "1-3 iş günü" olarak belirtilmiş');

  // 4. Canlı LLM Testi: Sesli Asistan Kuralı
  console.log('\n--- 4. Sesli Telefon Asistanı Kuralı Testi ---');
  const prompt2 = 'Sesli telefon asistanınızı siteden canlı test edebilir miyim?';
  const reply2 = await generateReply(prompt2, {
    subscriberId: 'test_user_1',
    igUsername: 'okan_test',
    firstName: 'Okan'
  });

  console.log(`💬 Soru: "${prompt2}"`);
  console.log(`🤖 Cevap:\n${reply2}\n`);

  assert(!reply2.toLowerCase().includes('sesinizi kullanarak'), 'Sitede sesle test iddiası YOK');
  assert(reply2.toLowerCase().includes('demo') || reply2.toLowerCase().includes('numara') || reply2.toLowerCase().includes('sektör'), 'Özel demo / numara yönlendirmesi mevcut');

  // 5. Çoklu Tur (Hafıza / Memory) Testi
  console.log('\n--- 5. Konuşma Hafızası (Memory) Testi ---');
  const prompt3 = 'Kliniğim için düşünüyorum, randevuları da bağlayabilir miyiz?';
  const reply3 = await generateReply(prompt3, {
    subscriberId: 'test_user_1',
    igUsername: 'okan_test',
    firstName: 'Okan'
  });

  console.log(`💬 Soru: "${prompt3}"`);
  console.log(`🤖 Cevap:\n${reply3}\n`);

  assert(reply3.toLowerCase().includes('klinik') || reply3.toLowerCase().includes('randevu') || reply3.toLowerCase().includes('takvim'), 'Önceki mesajı ve bağlamı hatırlıyor');

  console.log('\n========================================================');
  console.log(`SONUÇ: ${passed} GEÇTİ, ${failed} BAŞARISIZ`);
  console.log('========================================================');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test hatası:', err);
  process.exit(1);
});
