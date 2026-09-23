# ManyChat & Volreon AI Instagram Asistanı Entegrasyon Rehberi

Bu rehber, ManyChat üzerinden gelen Instagram DM mesajlarını 7/24 çalışan Volreon AI yapay zeka beynine bağlama adımlarını anlatır.

---

## 1. Ön Hazırlık (ManyChat Tarafında)

1. **ManyChat Pro:** Bu entegrasyonun çalışabilmesi için ManyChat hesabınızın **Pro** olması gerekir (External Request / Dış İstek adımı Pro gerektirir).
2. **Custom Field (Özel Alan) Oluşturma:**
   * ManyChat'te sol menüden **Settings (Ayarlar)** > **Custom Fields** bölümüne gidin.
   * **+ New User Field** butonuna tıklayın:
     * **Name:** `volreon_ai_reply`
     * **Type:** `Text`
   * Kaydedin.

---

## 2. ManyChat Akışını (Flow) Düzenleme

ManyChat'te **Automations** > **Instagram Default Reply** (veya yeni bir akış) açın:

### Adım A: Tetikleyici (Trigger)
* `When... User sends a Direct Message` (Zaten açık olmalı).

### Adım B: Dış İstek (External Request) Ekleme
1. Akış canvas'ında bir aksiyon ekleyin: **Action** > **External Request** seçin.
2. Açılan pencerede şu ayarları girin:
   * **Request Type:** `POST`
   * **Request URL:** `https://SENIN-RAILWAY-URLN.up.railway.app/webhook/instagram`
   * **Headers:**
     * Key: `Content-Type` | Value: `application/json`
     * Key: `x-webhook-secret` | Value: `volreon_secret_key_2026`
   * **Body (JSON):**
     ```json
     {
       "subscriber_id": "{{user_id}}",
       "message": "{{last_input_text}}",
       "username": "{{username}}",
       "first_name": "{{first_name}}"
     }
     ```
3. **Response Mapping (Gelen Cevabı Eşleme):**
   * Alt kısımdaki **Response Mapping** bölümüne tıklayın:
   * **JSONPath:** `$.reply`
   * **Save to User Field:** `volreon_ai_reply` seçin.
4. **Test Request** butonuna basarak yeşil `200 OK` aldığınızı doğrulayın ve **Save** deyin.

### Adım C: Instagram'da Yanıtı Gönderme
1. External Request kutucuğunun çıkış ucunu yeni bir **Send Message (Instagram)** bloğuna bağlayın.
2. Mesaj metnine sadece şu değişkeni yazın:  
   👉 `{volreon_ai_reply}`
3. Sağ üstteki **Update / Publish** butonuna basarak akışı canlıya alın!

---

## 3. Sistem Nasıl Çalışacak?

1. Müşteri Instagram DM'den serbest bir soru yazar (*"Restoranım için otomasyon kaça çıkar?"* veya *"Randevuları nasıl bağlıyorsunuz?"*).
2. ManyChat bu mesajı anında sunucumuza (`/webhook/instagram`) iletir.
3. Sunucumuz:
   * Müşterinin adını ve geçmiş konuşmalarını hatırlar.
   * Volreon AI kurallarına göre en doğru paketi ve fiyatı (kurulum + aylık) belirler.
   * Eğer müşteri telefon numarası yazdıysa Telegram üzerinden admin'e anlık sıcak lead uyarısı düşürür.
   * Akıllı, kibar ve ikna edici yanıtı ManyChat'e iletir.
4. ManyChat bu cevabı saniyeler içinde müşteriye DM olarak gönderir.
