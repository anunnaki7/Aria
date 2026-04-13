import { supabase } from './supabase';

export interface Memory {
  id: string;
  user_id: string;
  title: string;
  description: string;
  date: string;
  image_url: string;
  category: string;
  album_id: string | null;
  show_on_home: boolean;
  milestone: boolean;
  created_at?: string;
}

export interface Album {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  created_at?: string;
}

export interface Settings {
  user_id: string;
  due_date: string | null;
  birth_date: string | null;
  mode: 'pregnancy' | 'growth';
  updated_at?: string;
}

// ─── MEMORIES ────────────────────────────────────────────────────
export const fetchMemories = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as Memory[];
  } catch (error) {
    console.error('Error fetching memories:', error);
    return [];
  }
};

export const addMemory = async (
  userId: string,
  memory: Omit<Memory, 'id' | 'user_id' | 'created_at'>
) => {
  try {
    const { data, error } = await supabase
      .from('memories')
      .insert([{ ...memory, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data as Memory;
  } catch (error) {
    console.error('Error adding memory:', error);
    throw error;
  }
};

export const deleteMemory = async (memoryId: string) => {
  try {
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', memoryId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting memory:', error);
    throw error;
  }
};

export const updateMemory = async (
  memoryId: string,
  updates: Partial<Memory>
) => {
  try {
    const { data, error } = await supabase
      .from('memories')
      .update(updates)
      .eq('id', memoryId)
      .select()
      .single();

    if (error) throw error;
    return data as Memory;
  } catch (error) {
    console.error('Error updating memory:', error);
    throw error;
  }
};

// ─── ALBUMS ──────────────────────────────────────────────────────
export const fetchAlbums = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Album[];
  } catch (error) {
    console.error('Error fetching albums:', error);
    return [];
  }
};

export const addAlbum = async (userId: string, album: Omit<Album, 'id' | 'user_id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('albums')
      .insert([{ ...album, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data as Album;
  } catch (error) {
    console.error('Error adding album:', error);
    throw error;
  }
};

export const deleteAlbum = async (albumId: string) => {
  try {
    const { error } = await supabase
      .from('albums')
      .delete()
      .eq('id', albumId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting album:', error);
    throw error;
  }
};

// ─── SETTINGS ────────────────────────────────────────────────────
export const fetchSettings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as Settings) || null;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
};

export const upsertSettings = async (userId: string, settings: Omit<Settings, 'user_id'>) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .upsert({ ...settings, user_id: userId }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data as Settings;
  } catch (error) {
    console.error('Error upserting settings:', error);
    throw error;
  }
};
