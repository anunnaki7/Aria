# 🚀 Sa Lokalnog na Cloud — Kompletna Migracija

## Šta se Promenilo?

### Antes (Lokalno u Pretraživaču)
```
📱 Telefon/Computer
├── Browser Storage (localStorage)
├── IndexedDB (slike)
└── ❌ Gube se ako obrišeš cache
```

### Sada (Cloud na Supabase)
```
☁️ Supabase Cloud (Bezbedno)
├── PostgreSQL Baza (podatsi)
├── Storage Bucket (slike)
├── Authentication (Login)
└── ✅ Trajno čuvano
```

## Prednosti Cloud Verzije

| Prednost | Lokalno | Cloud |
|----------|---------|-------|
| **Trajnost** | Nestaje ako obrišeš cache | Zauvek čuvan |
| **Pristup** | Samo sa tog telefona | Sa bilo kog uređaja |
| **Sigurnost** | Bez šifriranja | Šifriran + RLS |
| **Backup** | ❌ | ✅ Automatski |
| **Realno vrijeme** | ❌ | ✅ Live sync |

## Kako Funkcioniše?

### 1. Login → Kreira Sesiju
```
Korisnik unese email/lozinku
     ↓
Supabase Auth kreira JWT token
     ↓
Token se čuva u browser-u (automatski)
     ↓
Sve nove zahteve imaju token
```

### 2. Dodavanje Uspomene
```
Klikneš "Dodaj" dugme
     ↓
Izabereš fotografiju sa telefona
     ↓
Slika se uploaduje na Supabase Storage
     ↓
Informacije (naslov, datum) se čuvaju u DB
     ↓
Sve se pojavljuje instant
```

### 3. Real-Time Sync (Bonus)
```
Ako ti i tvoja žena ste oboje ulogale
     ↓
Kada jednom dodaš sliku
     ↓
Drugoj se pojavljuje automatski (bez osvežavanja!)
```

## 🔐 Kako Sigurnost Funkcioniše?

### Row Level Security (RLS)
Svaki korisnik može videti **samo svoje podatke**:

```sql
-- Ako korisnik A pokuša:
SELECT * FROM memories WHERE user_id = 'user-b';
-- Rezultat: 0 redova (nema pristupa!)
```

### Folder Struktura u Storage
```
images/
├── user-a-id/
│   ├── 1234567890-photo.jpg
│   └── 9876543210-photo.jpg
└── user-b-id/
    └── 5555555555-photo.jpg
```

## 📊 Šta se Skladišti Gde?

### Supabase PostgreSQL
```sql
-- memories tabela
id: 5e4a1a2b-... (UUID)
user_id: c7f3b1a9-... (tvoj ID)
title: "Prvi osmeh"
description: "Najjednostavniji momenat"
date: 2026-05-20
image_url: "https://supabase.../images/c7f3b1a9.../image.jpg"
category: "osmeh"
album_id: null (ako nije u albumu)
show_on_home: true (da li prikazati na početnoj)
milestone: false
```

### Supabase Storage
```
https://supabase-project.supabase.co/storage/v1/object/public/images/
user-id/
1234567890-photo.jpg (uploadovan fajl)
```

## 🛡️ Zaštita Podataka

### 1. Autentifikacija
- Email + Lozinka šifrirana
- Session token koji ističe
- Opcija za 2FA (Two Factor Auth)

### 2. Authorization (RLS)
- Korisnik A ne može videti podatke korisnika B
- Politike na nivou baze podataka

### 3. Enkriptovani Transport
- Sve komunikacije preko HTTPS
- SSL certifikat

## 📱 Korišćenje sa Više Uređaja

### Scenario: Pametni Telefon + Tablet

**Tim 1: Majka (Željana)**
- Uloguje se na telefonu
- Dodaje sliku s telefona
- Pravi album "Trudnoća"

**Tim 2: Otac (Nikola)**
- Uloguje se na tabletu
- Automatski vidi sve slike što je majka dodala
- Može dodavati svoje slike

**Rezultat**: Oba uređaja uvek imaju iste podatke (Real-time)

## 🔄 Sync Conflict?

Ako oboje iste sekunde dodadete sliku:
```
Slika 1 (Željana):  16:32:45.001
Slika 2 (Nikola):   16:32:45.002
     ↓
Obe se čuvaju (nema konflikta!)
Sortirane po datumu, indeks je UUID
```

## 🚨 Šta se Dešava ako Nešto Padne?

| Scenario | Rezultat |
|----------|----------|
| Internet padne | Offline mod (izbuferirano, sinhronizuje se kad se vrati) |
| Browser se gasi | Session ostaje (JWT token) |
| Obrišeš cookies | Moraš da se ponovo prijaviš |
| Supabase servers padnu | Zastoj (ali Supabase ima 99.9% uptime) |

## 💾 Kako Promeniti Lozinku?

Supabase Auth štiti lozinku:
1. Samo ti znaš lozinku
2. Nikada se ne čuva plaintext
3. Ako zaboviš, možeš "Reset Password" preko email-a

## 🎯 Best Practices

### ✅ Dobro
```
- Koristi jaču lozinku (12+ karaktera)
- Redovno dodavaj slike (backup)
- Ne deli login podatke
- Redovno ažuriraj browser
```

### ❌ Loše
```
- Ne koristi "123456" kao lozinku
- Ne čuva lozinku u notesu
- Ne deli login sa drugim
- Ne briši cookies redovno
```

## 🔌 Integracije (Buduće)

Moguće dodati:
- **Google Photos Sync** (auto backup)
- **Email Reminders** (godišnjice)
- **Sharing** (sa bliskim prijateljima)
- **Export** (PDF album za štampanje)

## 📞 Support

Ako nešto ne radi:
1. Proverite `.env.local` fajl
2. Proveri Supabase Status: https://status.supabase.com
3. Očisti browser cache (Ctrl+Shift+Delete)
4. Restartuj aplikaciju
