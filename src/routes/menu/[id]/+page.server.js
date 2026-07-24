import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
  const { data: product, error: fetchError } = await locals.supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single();

  if (fetchError || !product) {
    throw error(404, 'Product not found');
  }

  return {
    product
  };
};
