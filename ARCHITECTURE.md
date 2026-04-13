# 🏗️ Aria Cloud Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT (React + TypeScript)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐       │
│  │   Auth.tsx   │  │   App.tsx    │  │   UI Components  │       │
│  │              │  │              │  │  (Modal, Cards)  │       │
│  │ - Login form │  │ - State mgmt │  │                  │       │
│  │ - Sign up    │  │ - Data fetch │  │ - MemoryCard     │       │
│  │ - Session    │  │ - Real-time  │  │ - Lightbox       │       │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘       │
│         │                  │                   │                  │
│         └──────────────────┼───────────────────┘                  │
│                            │                                      │
│                  ┌─────────▼─────────┐                           │
│                  │  Lib Layer        │                           │
│                  ├─────────────────────┤                         │
│                  │ - supabase.ts      │  (Klijent)             │
│                  │ - database.ts      │  (Queries)             │
│                  │ - storage.ts       │  (Upload/Delete)       │
│                  └─────────┬──────────┘                          │
│                            │                                      │
└────────────────────────────┼──────────────────────────────────────┘
                             │
                             │ HTTP(S)
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                   BACKEND (Supabase)                               │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │ Authentication   │  │  PostgreSQL     │  │  Storage       │  │
│  │ (Auth Service)   │  │  Database       │  │  (S3-like)     │  │
│  │                  │  │                 │  │                │  │
│  │ - Email/Password │  │ Tables:         │  │ Bucket:        │  │
│  │ - Session Mgmt   │  │ ├─ albums       │  │ - images/      │  │
│  │ - JWT Tokens     │  │ ├─ memories     │  │   ├─ user-a/   │  │
│  │ - User Profiles  │  │ └─ settings     │  │   │   ├─ 1.jpg  │  │
│  │                  │  │                 │  │   │   └─ 2.jpg  │  │
│  │ 🔒 RLS Enabled  │  │ 🔒 RLS Enabled  │  │   └─ user-b/   │  │
│  │                  │  │                 │  │       └─ 3.jpg  │  │
│  └──────────────────┘  └─────────────────┘  │                │  │
│                                              │ 🔒 Policies   │  │
│                                              └────────────────┘  │
│                                                                    │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │ Real-time Subscriptions (WebSocket)                       │   │
│  │ - Listen to memories table changes                        │   │
│  │ - Listen to albums table changes                          │   │
│  │ - Auto-update UI on changes                              │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### 1. Login Flow
```
User → Email + Password
  ↓
Auth.tsx (component)
  ↓
supabase.auth.signInWithPassword()
  ↓
Supabase Auth Service
  ↓
Verify credentials
  ↓
Generate JWT token
  ↓
Session created (localStorage)
  ↓
Redirect to App.tsx
  ↓
loadUserData(userId)
  ↓
Show Main App
```

### 2. Add Memory Flow
```
User clicks + button
  ↓
AddMemoryModal opens
  ↓
User selects image + fills form
  ↓
Form submitted
  ↓
uploadImage() ──┐
                ├─→ supabase.storage.upload()
                │
                └─→ Storage server (images bucket)
                    ↓
                    Save file
                    ↓
                    Return public URL
  ↓
addMemory() with image_url
  ↓
supabase.from('memories').insert()
  ↓
DB: Insert new row
  ↓
Real-time subscription fires
  ↓
UI updates instantly
  ↓
Memory card appears on home
```

### 3. Real-time Sync Flow
```
User A adds memory
  ↓
INSERT into memories table
  ↓
Supabase broadcast via WebSocket
  ↓
User B's subscription triggered
  ↓
UI state updates
  ↓
New card appears (without refresh!)
```

---

## Database Schema with Relationships

```
┌─────────────────────┐
│     auth.users      │
│  (Supabase Auth)    │
└──────────┬──────────┘
           │ user_id
           │
    ┌──────┴────────┬────────────┐
    │               │            │
    ▼               ▼            ▼
┌──────────┐  ┌──────────┐  ┌─────────────┐
│  albums  │  │ memories │  │  settings   │
├──────────┤  ├──────────┤  ├─────────────┤
│id (PK)   │  │id (PK)   │  │user_id (PK) │
│user_id*  │  │user_id*  │  │due_date     │
│name      │  │title     │  │birth_date   │
│emoji     │  │description│ │mode         │
│created_at│  │date      │  │updated_at   │
│          │  │category  │  │             │
│          │  │album_id* ├──┼──→ albums.id│
│          │  │show_on_home │             │
│          │  │milestone │  │             │
│          │  │image_url │  │             │
│          │  │created_at│  │             │
│          │  │updated_at│  │             │
└──────────┘  └──────────┘  └─────────────┘
   ▲              ▲
   │              │
   └──────┬───────┘
    Foreign Keys (*)
    RLS: user_id = auth.uid()
```

---

## File Structure

```
aria/
├── src/
│   ├── components/
│   │   └── Auth.tsx           # Login/Sign-up
│   │
│   ├── lib/
│   │   ├── supabase.ts        # Initialize client
│   │   ├── database.ts        # CRUD queries
│   │   └── storage.ts         # Image upload/delete
│   │
│   ├── App.tsx                # Main component
│   ├── main.tsx               # Entry point
│   └── index.css              # Tailwind
│
├── supabase/
│   └── schema.sql             # Database + RLS
│
├── index.html                 # HTML template
├── package.json               # Dependencies
├── vite.config.ts             # Vite config
│
├── .env.example               # Env template
├── .gitignore                 # Git ignore
│
├── README.md                  # Overview
├── QUICK_START.md             # 5-step guide
├── SUPABASE_SETUP.md          # Detailed setup
├── CLOUD_MIGRATION.md         # Technical deep-dive
├── VERIFICATION_CHECKLIST.md  # Checklist
├── IMPLEMENTATION_SUMMARY.md  # What was built
└── ARCHITECTURE.md            # This file
```

---

## Environment Variables

```
┌──────────────────────────────────┐
│  .env.local (SECURE - .gitignore)│
├──────────────────────────────────┤
│ VITE_SUPABASE_URL                │
│ = https://xyz.supabase.co        │
│                                  │
│ VITE_SUPABASE_ANON_KEY           │
│ = eyJhbGci... (public key)       │
└──────────────────────────────────┘
         │
         └─→ import.meta.env
              (Vite injects at build time)
```

---

## Security Model (RLS)

```
┌─────────────────────────────────────────┐
│ User A (ID: 123)                        │
│                                         │
│ Can access:                             │
│ ✓ Memories where user_id = 123         │
│ ✓ Albums where user_id = 123           │
│ ✓ Settings where user_id = 123         │
│ ✓ Images in storage/123/                │
│                                         │
│ Cannot access:                          │
│ ✗ Memories where user_id = 456         │
│ ✗ Albums where user_id = 456           │
│ ✗ Images in storage/456/                │
└─────────────────────────────────────────┘

Database level:
┌──────────────────────────────────────┐
│ RLS Policy on memories table          │
│                                       │
│ CREATE POLICY "user_memories"         │
│   ON memories                         │
│   USING (user_id = auth.uid())       │
│                                       │
│ Even admin can't bypass this!        │
└──────────────────────────────────────┘
```

---

## Request/Response Cycle

### 1. Fetch Memories
```
React Component
    ↓
useEffect → fetchMemories(userId)
    ↓
supabase.from('memories')
  .select('*')
  .eq('user_id', userId)
    ↓
HTTP GET to Supabase API
    ↓
API applies RLS check
    ↓
Returns only user's memories
    ↓
State updated
    ↓
Component re-renders
```

### 2. Upload Image
```
User selects file (File object)
    ↓
uploadImage(userId, file)
    ↓
supabase.storage.from('images').upload()
    ↓
HTTP POST to Storage
    ↓
File stored in images/{userId}/
    ↓
Public URL returned
    ↓
URL passed to addMemory()
    ↓
Database INSERT
    ↓
Real-time broadcast
    ↓
All clients receive update
```

---

## Deployment Architecture

### Development
```
npm run dev
    ↓
Vite dev server (localhost:5173)
    ↓
Hot Module Replacement (HMR)
    ↓
Real Supabase backend (production DB)
```

### Production (Vercel)
```
GitHub repo
    ↓
Push to main
    ↓
Vercel webhook triggered
    ↓
npm install
npm run build
    ↓
dist/ folder generated
    ↓
Deployed to Vercel CDN
    ↓
Custom domain (optional)
    ↓
Users access: https://aria.vercel.app
    ↓
Still connects to Supabase backend
```

---

## Scaling Considerations

### Current (Small - Development)
- Supabase Free tier (500 MB DB, 1 GB Storage)
- Single user at a time
- Local development

### Future (Growth)
- Supabase Pro tier ($25/month)
- Multiple concurrent users
- Custom domain
- CDN for images
- Database backups

### Very Large Scale
- Supabase Team tier
- Custom infrastructure
- Database replication
- Image optimization service
- Email/notification service

---

## Error Handling

```
User Action
    ↓
Try block
    ├─ Execute Supabase query
    ├─ Update state
    │   ↓
    └─ Catch errors
         ├ Network error
         ├ Auth error
         ├ RLS violation
         ├ Storage error
         │
         └─ Show error message
             (UI notification or alert)
```

---

## Real-time Architecture

```
┌──────────────────────────────────────────┐
│ Client 1 (User A)                        │
│ .on('*', (payload) => ...)              │
│        ↑                                 │
│        │ WebSocket                       │
│        │                                 │
│ ┌──────┴─────────────────────────────┐  │
│ │ Supabase Realtime Server (Redis)   │  │
│ └──────┬─────────────────────────────┘  │
│        │                                 │
│        │ WebSocket                       │
│        ↓                                 │
│ Client 2 (User B)                        │
│ .on('*', (payload) => ...)              │
└──────────────────────────────────────────┘

Trigger:
INSERT/UPDATE/DELETE on memories
    ↓
Broadcast to all subscribers
    ↓
Instant UI update
```

---

## Complete User Journey

```
1. SIGNUP
   Neregistrovan korisnik
      ↓
   Unese email + lozinka
      ↓
   Auth.tsx validira
      ↓
   supabase.auth.signUp()
      ↓
   Supabase Auth kreira korisnika
      ↓
   Korisnik može se prijaviti

2. LOGIN
   Unese email + lozinka
      ↓
   supabase.auth.signInWithPassword()
      ↓
   JWT token générisan
      ↓
   Redirect to App.tsx
      ↓
   loadUserData() fetches:
   - memories
   - albums
   - settings
      ↓
   Real-time subscriptions registered
      ↓
   Main app se prikazuje

3. ADD MEMORY
   Klikne + button
      ↓
   Modal se otvori
      ↓
   Izabere sliku
      ↓
   Unese naslov + opis
      ↓
   Submit
      ↓
   uploadImage() ───→ Storage
                      ↓
   addMemory() ───→ Database
                      ↓
   Real-time event
      ↓
   Memory card pojavljuje se

4. DELETE MEMORY
   Klikne X na kartici
      ↓
   deleteImage() ───→ Storage
      ↓
   deleteMemory() ───→ Database
      ↓
   Real-time event
      ↓
   Kartina nestaje

5. LOGOUT
   Klikne logout dugme
      ↓
   supabase.auth.signOut()
      ↓
   Session cleared
      ↓
   Redirect to Login
      ↓
   State reset
```

---

## Summary

Aria je **client-server** arhitektura sa:
- **Frontend**: React + TypeScript (Vite)
- **Backend**: Supabase (Auth + DB + Storage)
- **Communication**: HTTPS + WebSocket (real-time)
- **Security**: RLS on database level
- **Deployment**: Vercel (frontend) + Supabase (backend)

**Everything is cloud-native and scalable!** ☁️
