# ⚡ Brzi Start — Aria na Cloud-u

## TL;DR (Najkraće Moguće)

### 1. Kreiraj Supabase Projekat
- Idi na https://supabase.com
- Kreiraj novi projekat

### 2. Preuzmi Ključeve
Settings → API → Kopirati URL i anon key

### 3. Kreiraj `.env.local`
```
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. Pokreni SQL
Supabase SQL Editor → Kopirati iz `supabase/schema.sql` → Run

### 5. Kreiraj Storage Bucket
Storage → Create bucket → Ime: `images` → Public → Create

### 6. Testiraj
```bash
npm install
npm run dev
```

Otvori http://localhost:5173 → Registruj se → Dodaj sliku → Radi! ✅

---

## 📋 Detaljan Checklist

- [ ] Supabase projekat kreiran
- [ ] `.env.local` fajl postoji sa Supabase kredencijalom
- [ ] SQL schema promenjen (copy-paste iz `supabase/schema.sql`)
- [ ] Storage bucket `images` je **Public**
- [ ] `npm install` je radilo bez greške
- [ ] `npm run dev` je pokrenut
- [ ] Login ekran se vidi na http://localhost:5173
- [ ] Mogao sam da se registrujem sa email + lozinka
- [ ] Mogao sam da dodam fotografiju
- [ ] Fotografija se pojavljuje na početnoj strani

---

## 🔧 Ako Nešto Ne Radi

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### "Missing Supabase environment variables"
Proveri da imaš `.env.local` fajl sa ovim:
```
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

### "Storage bucket 'images' not found"
U Supabase panelu, Storage → Create bucket → `images` → Public

### "RLS policy violation"
Proveri da je SQL iz `supabase/schema.sql` promenjen (copy-paste kompletan)

### Slike se ne vide
- Proveri Network tab u DevTools (F12)
- Proveri da je `images` bucket Public
- Proveri da je slika dostupna na Storage URL

---

## 🎉 Kad Sve Radi?

Testirao sam:
```
✓ Login sistem radi
✓ Slike se uploaduju na Storage
✓ Podaci se čuvaju u DB
✓ Kategorije filtriranja rade
✓ Albumi se kreiraju i brišu
✓ Dairy counter za trudnoću radi
✓ Real-time subscriptions rade
✓ Build za Vercel je uspešan (576 KB)
```

---

## 📦 Deploy na Vercel

```bash
git add .
git commit -m "Cloud migration to Supabase"
git push origin main
```

Na Vercel-u:
1. Import Project iz GitHub
2. Dodaj Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy

---

## 🎯 Sledeći Koraci

### Odmah
- [ ] Registruj sve što si čuvao na lokalnom sajtu
- [ ] Dodaj sve stare slike manuelno
- [ ] Pozovi Željanu da pravi nalog i počne da dodaje

### Malo Kasnije
- [ ] Aktiviraj 2FA (opciono, ali preporučeno)
- [ ] Exportuj podatke kao backup (ubuduće)
- [ ] Podeli link sa svima iz porodice

### Budućnost
- [ ] Dodaj više albuma
- [ ] Kreiraj godišnje galerije
- [ ] Share sa bliskim prijateljima

---

## 💡 Pro Tips

1. **Backup** — Pravilno exportuj podatke
2. **Jaka lozinka** — Koristi 12+ karaktera
3. **2FA** — Aktiviraj za sigurnost
4. **Storage limit** — Supabase ima free tier od 1 GB

---

## 📞 Potrebna Pomoć?

Čitaj:
- `SUPABASE_SETUP.md` — Detaljno vodič
- `CLOUD_MIGRATION.md` — Kako funkcioniše
- `supabase/schema.sql` — Šta se gde čuva

Ili proverite Supabase docs: https://supabase.com/docs
