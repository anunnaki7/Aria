import { supabase } from './supabase';

export const uploadImage = async (userId: string, file: File): Promise<string> => {
  try {
    const timestamp = Date.now();
    const filename = `${userId}/${timestamp}-${file.name}`;

    const { error } = await supabase.storage
      .from('images')
      .upload(filename, file, { upsert: false });

    if (error) throw error;

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('images')
      .getPublicUrl(filename);

    return publicData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteImage = async (imageUrl: string) => {
  try {
    // Extract path from URL
    const urlParts = imageUrl.split('/storage/v1/object/public/images/');
    if (urlParts.length < 2) return;

    const path = urlParts[1];

    const { error } = await supabase.storage
      .from('images')
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw - best effort deletion
  }
};
