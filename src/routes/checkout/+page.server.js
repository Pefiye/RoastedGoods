import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session) {
    throw redirect(303, '/auth/login');
  }

  // Get user's cart with details + product info
  const { data: cart } = await locals.supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!cart) {
    throw redirect(303, '/cart');
  }

  const { data: cartDetails } = await locals.supabase
    .from('cart_details')
    .select(`
      id,
      variant,
      quantity,
      product_id,
      products!inner (
        id,
        name,
        image_url,
        base_price,
        variants
      )
    `)
    .eq('cart_id', cart.id)
    .eq('products.is_active', true)
    .order('created_at', { ascending: true });

  const checkoutItems = (cartDetails ?? []).map(item => {
    const product = item.products;
    const variantData = (product.variants || []).find(v => v.name === item.variant);
    const unitPrice = product.base_price + (variantData?.price_add ?? 0);

    return {
      id: item.id,
      product_id: product.id,
      name: product.name,
      image_url: product.image_url,
      variant: item.variant,
      quantity: item.quantity,
      unit_price: unitPrice
    };
  });

  if (checkoutItems.length === 0) {
    throw redirect(303, '/cart');
  }

  const totalPrice = checkoutItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  return {
    checkoutItems,
    totalPrice,
    cartId: cart.id
  };
};
