-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ALBUMS TABLE ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📁',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, name)
);

-- ─── MEMORIES TABLE ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
  show_on_home BOOLEAN NOT NULL DEFAULT true,
  milestone BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── SETTINGS TABLE ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  due_date DATE,
  birth_date DATE,
  mode TEXT NOT NULL DEFAULT 'pregnancy' CHECK (mode IN ('pregnancy', 'growth')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── INDEXES ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON public.memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_album_id ON public.memories(album_id);
CREATE INDEX IF NOT EXISTS idx_memories_date ON public.memories(date);
CREATE INDEX IF NOT EXISTS idx_albums_user_id ON public.albums(user_id);

-- ─── ROW LEVEL SECURITY (RLS) ─────────────────────────────────────────
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Albums RLS Policies
CREATE POLICY "Users can view their own albums"
  ON public.albums FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own albums"
  ON public.albums FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own albums"
  ON public.albums FOR DELETE
  USING (auth.uid() = user_id);

-- Memories RLS Policies
CREATE POLICY "Users can view their own memories"
  ON public.memories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own memories"
  ON public.memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
  ON public.memories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
  ON public.memories FOR DELETE
  USING (auth.uid() = user_id);

-- Settings RLS Policies
CREATE POLICY "Users can view their own settings"
  ON public.settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── STORAGE BUCKET ────────────────────────────────────────────────────
-- Create storage bucket via Supabase Dashboard or use:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Storage RLS Policies
CREATE POLICY "Users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
