# Aria — Supabase Cloud Setup Guide 🌸

Ova aplikacija koristi **Supabase** za čuvanje svih podataka u cloudu. Sledite ove korake da sve postavite.

## 1️⃣ Kreiraj Supabase Projekat

1. Idi na [supabase.com](https://supabase.com)
2. Klikni na "Start your project"
3. Kreiraj novi projekat (bilo koje imena, npr. "Aria")
4. Čekaj da se inicijalizuje (2-3 minuta)

## 2️⃣ Preuzmi Okruženje Varijable

1. U Supabase panelu, idi na **Settings → API**
2. Kopirati:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`
3. Kreiraj `.env.local` fajl u root foldera:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3️⃣ Kreiraj Tabele u Supabase

1. U Supabase panelu, idi na **SQL Editor**
2. Klikni na **New Query**
3. Kopirati ceo sadržaj iz `supabase/schema.sql` fajla
4. Klikni **Run** (ili Ctrl+Enter)
5. Čekaj da se sve tabele kreiraju

## 4️⃣ Kreiraj Storage Bucket

1. U Supabase panelu, idi na **Storage**
2. Klikni **Create a new bucket**
3. Nazovi ga: `images` (tačno ovako!)
4. Postavi ga na **Public** (jer slike treba da budu dostupne)
5. Klikni **Create bucket**

## 5️⃣ Testiraj Lokalno

```bash
npm install
npm run dev
```

Otvorite `http://localhost:5173` i trebalo bi da vidite Login ekran.

## 6️⃣ Deploy na Vercel

1. Push kod na GitHub
2. Idi na [vercel.com](https://vercel.com)
3. Klikni **Import Project**
4. Izaberi svoj GitHub repo
5. U **Environment Variables**, dodaj:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Klikni **Deploy**

## ✅ Šta se Čuva u Cloudu

| Podatak | Lokacija |
|---------|----------|
| **Slike** | Supabase Storage (`images` bucket) |
| **Uspomene** | Supabase DB (`memories` tabela) |
| **Albumi** | Supabase DB (`albums` tabela) |
| **Podešavanja** | Supabase DB (`settings` tabela) |
| **Korisnički nalozi** | Supabase Auth |

## 🔒 Sigurnost

- Svaki korisnik vidi samo svoje podatke (RLS policies)
- Slike su organizovane po korisničkim folderima
- Sve komunikacije su preko HTTPS

## 💡 Saveti

- Slike se uploaduju direktno na Storage (bez base64)
- Real-time subscriptions omogućavaju live ažuriranja
- Svi podaci su trajno čuvani (ne zavise od lokalnog storage)

## 🆘 Problemi?

Ako vidiš greške:

1. **"Missing Supabase environment variables"** → Proveri `.env.local`
2. **Slike se ne uploaduju** → Proveri da li je `images` bucket kreirat i public
3. **Login ne radi** → Proveri da li je Auth enabled u Supabase
4. **Prazna stranica** → Proveri konsolu (F12) za greške

## 📚 Više info

- Supabase dokumentacija: https://supabase.com/docs
- Saharova auth docs: https://supabase.com/docs/guides/auth
- Storage docs: https://supabase.com/docs/guides/storage
