// config/volreon_knowledge.js
// Volreon AI resmi hizmet, fiyat ve marka kuralları matrisi

const VOLREON_KNOWLEDGE = {
  sirket: {
    isim: 'Volreon AI',
    tanim: 'İşletmeler için 7/24 Otonom Yapay Zeka ve Otomasyon Çözümleri',
    website: 'https://volreonai.com',
    teslimat: '1-3 iş günü (anahtar teslim)'
  },

  paketler: [
    {
      id: 'mesajlasma',
      baslik: '1. Mesajlaşma Asistanı (WhatsApp veya Instagram)',
      kurulum: '₺24.900',
      aylik: '₺6.900',
      ozellikler: [
        'WhatsApp veya Instagram üzerinden 7/24 kesintisiz müşteri karşılama',
        'Gelen DM, yorum ve mesajları saniyeler içinde doğal dille yanıtlama',
        'Fiyat, katalog ve hizmet bilgilerini sunma, satış kapatma',
        '1-3 iş gününde anahtar teslim kurulum'
      ]
    },
    {
      id: 'coklu_kanal',
      baslik: '2. Çoklu Kanal Asistanı (WhatsApp + Instagram)',
      kurulum: '₺39.900',
      aylik: '₺11.900',
      etiket: 'En Çok Tercih Edilen Kurumsal Çözüm',
      ozellikler: [
        'Hem WhatsApp hem Instagram kanallarını tek merkezden yönetir',
        '5 dilde (TR, EN, DE, RU, AR) yabancı müşterileri anında ağırlar',
        'Müşteri takibi, sıcak lead yakalama ve eskalasyon',
        '1-3 iş gününde anahtar teslim kurulum'
      ]
    },
    {
      id: 'sesli_asistan',
      baslik: '3. Sesli Telefon Çağrı Asistanı',
      kurulum: '₺49.900',
      aylik: '₺16.900',
      ozellikler: [
        '0.8 saniye yanıt hızı ile insan doğallığında akıcı Türkçe telefon görüşmesi',
        'Arayan müşteriyi dinler, soruları yanıtlar, Google Takvim veya CRM\'e randevu yazar',
        'Randevu alan müşteriye işletmenin adresini ve teyit mesajını WhatsApp\'tan iletir',
        'Kaçan çağrıları sıfıra indirir, mesai saati sonrasında da telefonu karşılar',
        '1-3 iş gününde anahtar teslim kurulum'
      ]
    },
    {
      id: 'randevu_motoru',
      baslik: '4. Randevu & Rezervasyon Motoru',
      kurulum: '₺16.900',
      aylik: '₺4.900',
      ozellikler: [
        'Randevu ve rezervasyon süreçlerini tam otonom yönetir',
        'Google Takvim ile iki yönlü canlı senkronizasyon',
        'Randevu hatırlatma SMS/WhatsApp mesajları, iptal edilen saatleri otomatik doldurma',
        '1-3 iş gününde anahtar teslim kurulum'
      ]
    },
    {
      id: 'web_tasarim',
      baslik: '5. Premium Web Sitesi Tasarımı',
      kurulum: '₺9.999\'dan başlayan fiyatlarla',
      aylik: 'YOKTUR (₺0)',
      ozellikler: [
        'Özel lüks UI/UX tasarım, mobil uyum, SEO altyapısı',
        'Yapay zeka asistanları ve WhatsApp ile tam entegre',
        'Aylık bakım ücreti YOKTUR, tek seferlik yatırım bedelidir',
        '1-3 iş gününde yayına alma'
      ]
    }
  ],

  sektorler: [
    'Restoranlar & Cafeler (Menü sunumu, rezervasyon, konum paylaşımı)',
    'Diş Klinikleri & Sağlık Merkezleri (Randevu alma, operasyon bilgilendirme)',
    'Güzellik Merkezleri & Kuaförler (İşlem randevusu, fiyat listesi, hatırlatma)',
    'E-Ticaret & Perakende (Sipariş takibi, kargo sorgulama, ürün önerisi)',
    'Emlak & Gayrimenkul (Portföy sunumu, ön eleme, görüşme planlama)',
    'Hukuk & Danışmanlık Büroları (Ön bilgi toplama, takvim organizasyonu)'
  ],

  katiKurallar: [
    'ASLA "şeffaf" veya "şeffaf fiyat" kelimelerini kullanma! Bunun yerine "net", "açık", "sabit fiyatlı" veya "yatırım bedelleri" ifadelerini kullan.',
    'Tüm fiyatlarda hem Kurulum Bedeli hem Aylık Bedel mutlaka birlikte belirtilmelidir.',
    'Teslimat süresi daima "1-3 iş günü" olarak belirtilmelidir.',
    'Sesli Asistan için ASLA "sitemizde sesinizi kullanarak test edin" deme. Bunun yerine "İşletmenize özel canlı sesli demo için sektörünüzü ve telefon numaranızı bırakabilirsiniz" de.',
    'Instagram DM mesajları çok uzun blok metinler olmamalıdır; paragraflara bölünmeli, akıcı ve okunabilir olmalıdır.',
    'Müşteriye soru sorarak sohbeti devam ettir ve mutlaka telefon numarası / sektör bilgisi alarak görüşme randevusuna yönlendir.'
  ]
};

module.exports = { VOLREON_KNOWLEDGE };
