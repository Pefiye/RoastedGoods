export const load = ({ locals }) => {
  const getProducts = async () => {
    const { data: products, error } = await locals.supabase
      .from('products')
      .select('id, name, image_url, base_price, category')
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    
    return products ?? [];
  };

  return {
    streamed: {
      products: getProducts()
    }
  };
};
