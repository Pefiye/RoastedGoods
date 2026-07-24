import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

export const POST = async ({ request, locals }) => {
  const { session, profile } = await locals.safeGetSession();

  if (!session || profile?.role !== 'admin') {
    return json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return json({ error: 'No valid file uploaded' }, { status: 400 });
    }

    if (file.type !== 'image/webp') {
      return json({ error: 'Only WebP images are allowed' }, { status: 400 });
    }

    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use admin client to bypass storage RLS and upload directly
    const supabaseAdmin = createClient(
      publicEnv.PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filename, buffer, {
        contentType: 'image/webp',
        upsert: false
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return json({ error: 'Failed to upload image to storage' }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filename);

    return json({ success: true, url: publicUrlData.publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return json({ error: 'Failed to upload image' }, { status: 500 });
  }
};
