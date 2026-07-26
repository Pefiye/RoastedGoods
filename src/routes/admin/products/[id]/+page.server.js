import { error, redirect } from '@sveltejs/kit';

export const load = ({ params, locals }) => {
  const getProduct = async () => {
    if (params.id === 'new') {
      return null;
    }

    const { data: product } = await locals.supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!product) throw error(404, 'Product not found');

    return product;
  };

  return { streamed: { product: getProduct() } };
};

export const actions = {
  save: async ({ request, locals, params }) => {
    const formData = await request.formData();
    const name = formData.get('name');
    const description = formData.get('description');
    const category = formData.get('category');
    const imageUrl = formData.get('image_url');
    const tallPrice = parseInt(formData.get('tall_price')) || 0;
    const grandePrice = parseInt(formData.get('grande_price')) || 0;
    const ventiPrice = parseInt(formData.get('venti_price')) || 0;

    const variants = [
      { name: 'Tall', price_add: 0 },
      { name: 'Grande', price_add: Math.max(0, grandePrice - tallPrice) },
      { name: 'Venti', price_add: Math.max(0, ventiPrice - tallPrice) }
    ];

    const payload = {
      name,
      description,
      category,
      image_url: imageUrl,
      base_price: tallPrice,
      variants,
      is_active: true
    };

    if (params.id === 'new') {
      await locals.supabase.from('products').insert([payload]);
    } else {
      await locals.supabase.from('products').update(payload).eq('id', params.id);
    }
    throw redirect(303, '/admin/products');
  },
  delete: async ({ locals, params }) => {
    if (params.id !== 'new') {
      await locals.supabase.from('products').update({ is_active: false }).eq('id', params.id);
    }
    throw redirect(303, '/admin/products');
  }
};
