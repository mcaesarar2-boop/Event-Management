import { createBrowserClient } from './client';

export interface UploadLogoResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

/**
 * Upload a sponsor brand logo image to Supabase Storage in the 'sponsorship-logos' bucket.
 * Generates a unique path: logos/${Date.now()}_${cleanFileName}
 * Returns the public URL of the uploaded image.
 */
export async function uploadSponsorLogo(file: File): Promise<UploadLogoResult> {
  try {
    const supabase = createBrowserClient();
    const cleanFileName = file.name.replace(/\s+/g, '_');
    const path = `logos/${Date.now()}_${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from('sponsorship-logos')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return { success: false, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from('sponsorship-logos')
      .getPublicUrl(path);

    return {
      success: true,
      publicUrl: urlData.publicUrl,
    };
  } catch (err: any) {
    console.error('Exception in uploadSponsorLogo:', err);
    return {
      success: false,
      error: err.message || 'Gagal mengupload logo sponsor.',
    };
  }
}

