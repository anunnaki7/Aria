# 🌸 Aria — Cloud App sa Supabase

**Priča o rasti i ljubavi — Sada na Cloud-u!**

Aria je aplikacija za čuvanje uspomena od trudnoće do prve godine. Sada je **Full-Stack Cloud aplikacija** sa Supabase backendo-om.

## ✨ Što Je Novo?

- ☁️ **Cloud Storage** — Slike su trajno čuvane na Supabase-u
- 🔐 **Autentifikacija** — Email + Password Login sistem
- 📱 **Više Uređaja** — Isti podaci na telefonu, tabletu, PC-u
- 🔄 **Real-time Sync** — Svaka promena je vidljiva instant
- 🛡️ **Bezbedan** — RLS politike štite privatnost
- 🚀 **Deploy-Ready** — Spreman za Vercel

## 📁 Šta je Gde?

```
aria/
├── src/
│   ├── App.tsx                 # Glavna aplikacija (sva logika)
│   ├── components/
│   │   └── Auth.tsx           # Login + Registracija
│   ├── lib/
│   │   ├── supabase.ts        # Supabase klijent
│   │   ├── database.ts        # DB queries (memories, albums, settings)
│   │   └── storage.ts         # Image upload/delete
│   └── index.css              # Tailwind CSS
├── supabase/
│   └── schema.sql             # SQL za sve tabele + RLS
├── QUICK_START.md             # ⚡ Brzi početak
├── SUPABASE_SETUP.md          # 📋 Detaljni vodič
├── CLOUD_MIGRATION.md         # 🔄 Kako radi cloud
└── package.json
```

## 🚀 Instalacija

### 1. Clone Repo
```bash
git clone https://github.com/your/aria.git
cd aria
npm install
```

### 2. Kreiraj `.env.local`
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

Preuzmi ključeve sa: Supabase Dashboard → Settings → API

### 3. Kreiraj SQL Tabele
```
Supabase Dashboard → SQL Editor
Kopirati ceo sadržaj iz supabase/schema.sql
Klikni RUN
```

### 4. Kreiraj Storage Bucket
```
Supabase Dashboard → Storage → Create bucket
Ime: images
Postavi na: Public
```

### 5. Pokreni Lokalno
```bash
npm run dev
```

Otvori: http://localhost:5173

## 🏗️ Arhitektura

### Frontend (React + TypeScript)
- **Auth.tsx** — Login/Sign-up UI
- **App.tsx** — Sve: memories, albumi, settings, lightbox

### Backend (Supabase)
- **PostgreSQL** — Memories, Albums, Settings
- **Storage** — Image uploads
- **Auth** — Email/Password + Session management

### Security
- Row Level Security (RLS) — Svaki korisnik vidi samo svoje
- Storage Policies — Slike po korisniku
- JWT Tokens — Automatski managed od Supabase

## 📊 Database Schema

### memories
```sql
id, user_id, title, description, date, category,
album_id, show_on_home, milestone, image_url
```

### albums
```sql
id, user_id, name, emoji
```

### settings
```sql
user_id, due_date, birth_date, mode
```

## 🔄 Kako Funkcioniše?

### Dodavanje Uspomene
```
User clicks "+ Add" 
  ↓
Uploads image → Supabase Storage
  ↓
Saves metadata → memories table
  ↓
Real-time subscription notifies UI
  ↓
Card pojavljuje se na početnoj
```

### Pristup Podacima
```
User logs in
  ↓
Session kreiram (JWT token)
  ↓
fetchMemories(userId) queries:
  SELECT * FROM memories WHERE user_id = auth.uid()
  ↓
RLS osigurava user ne vidi tuđe podatke
```

## 🎨 UI Komponente

- **Auth.tsx** — Login form sa error handling
- **IntroAnimation** — Gold particles intro
- **FlowerButton** — Animirani floating + button
- **MemoryCard** — Hover effects, lightbox
- **Lightbox** — Full-screen image viewer
- **AddMemoryModal** — Form za nove uspomene
- **SettingsModal** — Trudnoća/Rast settings
- **AlbumsModal** — Upravljanje albumima

## 🔐 Sigurnost

### RLS Politike
```sql
-- Korisnik A ne može videti memorije korisnika B
SELECT * FROM memories WHERE user_id != auth.uid() 
-- Result: 0 rows (RLS block!)
```

### Storage Policies
```
users/
├── user-a-uuid/
│   └── image1.jpg  ← Samo user A može pristupiti
└── user-b-uuid/
    └── image2.jpg  ← Samo user B
```

### Šifrovanje
- Lozinke: bcrypt (Supabase)
- Transport: HTTPS
- Sessions: JWT tokens

## 📱 Korišćenje sa Više Uređaja

**Scenairo**: Željana + Nikola

1. Željana se registruje → Pravi nalog
2. Nikola se registruje → Pravi svoj nalog
3. Svaki ima svoj UI, ali mogu videti sve (ako dela svoj albume)

Za zajedničke albume (budućnost):
- Sharing mehanizam
- Invite tokenovi

## 🚀 Deploy na Vercel

```bash
git push origin main
```

Na Vercel-u:
1. Import iz GitHub
2. Add Environment Variables
3. Deploy button

## 🧪 Testiranje

### Lokalno
```bash
npm run dev
# Registruj se
# Dodaj sliku
# Proveri storage
# Kreiranje albuma
# Brisanje
```

### Build
```bash
npm run build
# Proveri: dist/index.html
```

## 🎯 Features

✅ Login sistem (Email + Password)
✅ Slike u cloud storage
✅ Kategorije filtriranja
✅ Albumi za organizovanje
✅ Real-time sync
✅ Trudnoća/Rast counter
✅ Milestone tagging
✅ Responsive design
✅ Framer Motion animacije
✅ Tailwind CSS styling

## 📈 Buduće Ideje

- [ ] Google Photos import
- [ ] PDF export (za štampanje)
- [ ] Email reminders (godišnjice)
- [ ] Sharing sa porodicom
- [ ] Video support
- [ ] Backup automation
- [ ] 2FA opcija
- [ ] Dark mode

## 📞 Support

Za probleme:
1. Čitaj **QUICK_START.md**
2. Čitaj **SUPABASE_SETUP.md**
3. Proveri Supabase docs: https://supabase.com/docs

## 📄 Licenca

MIT — Slobodan za korišćenje

## 💖 Made with Love

Napravljeno sa ljubavlju za Ariu.

---

**Verzija**: 2.0 Cloud Edition
**Build Status**: ✅ Production Ready
**Last Updated**: 2026
