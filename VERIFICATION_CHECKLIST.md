# ✅ Verifikacijski Checklist

Koristi ovaj checklist da proveris da je sve ispravno postavljeno.

## 📋 Pre nego što Pokreneš

### Supabase Setup
- [ ] Kreiram Supabase račun na https://supabase.com
- [ ] Kreiram novi projekat
- [ ] Čekam da se inicijalizuje (2-3 minuta)
- [ ] Preuzimam Supabase URL sa Settings → API
- [ ] Preuzimam anon key sa Settings → API

### Lokalni Setup
- [ ] Imam `.env.local` fajl u root foldera
- [ ] `.env.local` sadrži:
  ```
  VITE_SUPABASE_URL=https://...supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGci...
  ```
- [ ] `.env.local` je u `.gitignore` (da se ne commita)

## 🗄️ Database Setup

### SQL Schema
- [ ] Otvoriim Supabase SQL Editor
- [ ] Kreiram novu query
- [ ] Copy-paste ceo sadržaj iz `supabase/schema.sql`
- [ ] Klikni RUN (ili Ctrl+Enter)
- [ ] Čekam da se sve tabele kreiraju bez greške

### Provera Tabela
- [ ] U Tables sekciji vidim:
  - [ ] `albums` tabela
  - [ ] `memories` tabela
  - [ ] `settings` tabela
- [ ] Svaka tabela ima kolone kako je definisano u schema.sql

### Provera RLS
- [ ] U Authentication → Policies vidim:
  - [ ] RLS enabled za sve tabele
  - [ ] Politike za albums
  - [ ] Politike za memories
  - [ ] Politike za settings

## 📦 Storage Setup

### Bucket
- [ ] U Storage sekciji
- [ ] Create bucket
- [ ] Ime: `images` (tačno!)
- [ ] Privacy: Public (da mogu da pristupim slikama)

### Policies
- [ ] RLS enabled za storage
- [ ] Politike za upload/delete/view

## 💻 Lokalni Razvoj

### Instalacija
- [ ] `npm install` je radno bez greške
- [ ] `node_modules` postoji

### Build
```bash
npm run build
```
- [ ] Build je uspesan
- [ ] `dist/index.html` postoji
- [ ] Veličina je ~577 KB (kao moja verzija)

### Dev Server
```bash
npm run dev
```
- [ ] Dev server se pokreće na http://localhost:5173
- [ ] Nema greške u terminalu
- [ ] Browser pokazuje login ekran (ne pojavljuje se App direktno)

## 🔐 Auth Test

### Sign Up
- [ ] Unesite email: `test@example.com`
- [ ] Unesite lozinku: `TestPassword123!`
- [ ] Klikni Registracija
- [ ] Vidim poruku "Registracija uspešna"
- [ ] U Supabase → Auth vidim novog korisnika

### Login
- [ ] Unesite isti email
- [ ] Unesite istu lozinku
- [ ] Klikni Prijava
- [ ] Vidim main app (header, stats, kategorije, itd.)

## 📸 Image Upload Test

### Upload
- [ ] Klikni + dugme (donje desno)
- [ ] Otvori Add Memory modal
- [ ] Unesi naslov: "Test Slika"
- [ ] Unesi opis: "Testiranje uploadovanja"
- [ ] Izaberi fotografiju sa računara
- [ ] Vidim preview slike u modalu
- [ ] Klikni "Sačuvaj trenutak"
- [ ] Čekam "Učitavam..." da završi

### Verifikacija Upload
- [ ] Novi memory card se pojavljuje na početnoj
- [ ] Slika je vidljiva u karici
- [ ] Naslov "Test Slika" je vidljiv
- [ ] U Supabase Storage vidim sliku u `images/{user-id}/` folderu

## 💾 Database Test

### Provera u Supabase
- [ ] U Table Editor
- [ ] Vidim `memories` tabelu
- [ ] Vidim novi memory sa:
  - `title: "Test Slika"`
  - `user_id: <tvoj-id>`
  - `image_url: https://...`
  - `show_on_home: true`

## 🎨 UI Features Test

### Kategorije
- [ ] Kliknem na kategoriju (npr. "Osmesi")
- [ ] Vidim samo memorije iz te kategorije
- [ ] Counter je: 1/1
- [ ] Kliknem "Sve"
- [ ] Vidim sve memorije

### Settings
- [ ] Kliknem ikonu zupčanika
- [ ] Vidim Settings modal
- [ ] Iz je "Trudnoća" izabrana
- [ ] Vidim datum: "2026-05-20"
- [ ] Kliknem "Sačuvaj"
- [ ] Modal zatvara

### Albumi
- [ ] Kliknem "Albumi (0)"
- [ ] Vidim prazna lista
- [ ] Unesem novo ime: "Test Album"
- [ ] Izaberem emoji: 📸
- [ ] Kliknem +
- [ ] Album se pojavljuje u listi

## 🔄 Real-Time Test (Opciono)

Ako imaš dva browser prozora/uređaja:

### Tab 1
- [ ] Ulogovan kao user A
- [ ] Otvoren na `localhost:5173`

### Tab 2
- [ ] Ulogovan kao isti user A (novi prozor)
- [ ] Otvoren na `localhost:5173`

### Test
- [ ] U Tab 1 dodam novu sliku
- [ ] Bez osvežavanja, u Tab 2 se pojavljuje (real-time!)

## 🚀 Production Build Test

### Build
```bash
npm run build
```
- [ ] Build završen bez greške
- [ ] `dist/` folder kreiran

### Preview
```bash
npm run preview
```
- [ ] Serve pokrenut na local adresi
- [ ] App se učitava kao u dev-u
- [ ] Login radi
- [ ] Upload radi
- [ ] Sve animacije radi

## 📤 Vercel Deployment (Opciono)

### GitHub Push
```bash
git add .
git commit -m "Cloud migration"
git push origin main
```
- [ ] Kod je na GitHub-u
- [ ] `.env.local` NIJE commitovan (proveri u .gitignore)

### Vercel Setup
- [ ] Na https://vercel.com
- [ ] Kliknem "Import Project"
- [ ] Izaberem GitHub repo
- [ ] Framework: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### Environment Variables
- [ ] Dodam `VITE_SUPABASE_URL`
- [ ] Dodam `VITE_SUPABASE_ANON_KEY`
- [ ] Kliknem Deploy

### Vercel Verification
- [ ] Deployment završen (Build ✓)
- [ ] App je dostupan na `https://your-project.vercel.app`
- [ ] Login radi na proizvodu
- [ ] Upload radi na proizvodnji
- [ ] Slike su vidljive

## 🔧 Troubleshooting Checklist

Ako nešto ne radi:

### "Missing Supabase environment variables"
- [ ] Proverim `.env.local` da postoji
- [ ] Proverim da ima `VITE_SUPABASE_URL`
- [ ] Proverim da ima `VITE_SUPABASE_ANON_KEY`
- [ ] Restartam `npm run dev`

### "Cannot POST /auth/v1/signup"
- [ ] Proverim da URL je validan
- [ ] Proverim da Auth je enabled u Supabase
- [ ] Proverii connection u Network tab (F12)

### "Storage bucket 'images' not found"
- [ ] Idim u Supabase Storage
- [ ] Vidim `images` bucket
- [ ] Bucket je Public
- [ ] Nema typo-a u imena

### "RLS violation"
- [ ] Proverim da sam pokrenut SQL iz schema.sql
- [ ] Proverim da su sve politike kreirane
- [ ] Restartam pretraživač (F5)

### Slike se ne uploaduju
- [ ] Proverim Network tab (F12) za greške
- [ ] Proverim browser console (F12) za errors
- [ ] Proverim veličinu slike (<5 MB)
- [ ] Proverim format (JPG, PNG, GIF)

### Nema memorija na početnoj (ali ima u DB)
- [ ] Proverim da je `show_on_home: true` u memories
- [ ] Proverim RLS politike
- [ ] Restartam app

## ✨ Final Sign-Off

Kad si sve završio:

- [ ] Dev server radi (`npm run dev`)
- [ ] Login radi
- [ ] Upload slike radi
- [ ] Slike su vidljive
- [ ] Build je success (`npm run build`)
- [ ] Nema greške u console-i
- [ ] Nema greške u Supabase logs-ima

## 🎉 Sveee je Gotovo!

Čestitam! 🎊 Aria je sada na cloud-u!

Sada možeš:
1. Pozvati Željanu da se registruje
2. Početi da dodavaš sve stare slike
3. Deploy na Vercel kada budeš spreman
4. Deli sa porodicom
