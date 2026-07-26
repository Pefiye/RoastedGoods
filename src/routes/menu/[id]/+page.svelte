<script>
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { supabase } from "$lib/supabase.js";
  import { goto, invalidateAll } from "$app/navigation";
  import { currency, exchangeRate, formatPrice } from "$lib/stores/currency.js";
  import { addToast } from "$lib/stores/toast.js";

  let { data } = $props();

  let product = $state({});
  let variants = $derived(product.variants || []);
  let session = $derived(data.session);

  let selectedVariant = $state(null);
  let addingToCart = $state(false);
  let isLoading = $state(true);
  let errorMsg = $state(null);

  $effect(() => {
    data.streamed.productData.then(res => {
      product = res;
      isLoading = false;
    }).catch(err => {
      errorMsg = err.message || 'Product not found';
      isLoading = false;
    });
  });

  $effect(() => {
    if (variants.length > 0 && selectedVariant === null) {
      selectedVariant = variants[0].name;
    }
  });

  const currentPrice = $derived(() => {
    const v = variants.find(v => v.name === selectedVariant);
    return (product.base_price || 0) + (v?.price_add ?? 0);
  });

  async function addToCart() {
    if (!session) {
      goto('/auth/login');
      return;
    }

    addingToCart = true;
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .single();

    if (!cart) {
      addToast('Error: Cart not found.', 'error');
      addingToCart = false;
      return;
    }
    const { data: existing } = await supabase
      .from('cart_details')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('product_id', product.id)
      .eq('variant', selectedVariant)
      .single();

    if (existing) {
      await supabase
        .from('cart_details')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('cart_details')
        .insert({
          cart_id: cart.id,
          product_id: product.id,
          variant: selectedVariant,
          quantity: 1
        });
    }

    addToast('Added to cart!', 'success', 2500, 'bi-basket2-fill');
    addingToCart = false;
    invalidateAll();
  }
</script>

<Navbar />

<div class="d-flex flex-grow-1 flex-column w-100 bg-accent-100">
  <div
    class="d-flex flex-column flex-md-row w-100 p-10 py-20 justify-content-center align-items-center mx-auto animation-pageIn"
    style="max-width: 1200px; gap: 40px;"
  >
    {#if isLoading}
      <div class="d-flex flex-column align-items-center w-100 w-md-50 animation-fadeInLong placeholder-glow">
        <div class="w-50 rounded-circle ratio-1 shadow-sm placeholder bg-accent-200" style="min-width: 250px; max-width: 400px;"></div>
      </div>
      <div class="d-flex flex-column w-100 w-md-50 px-10 animation-slideUp placeholder-glow">
        <span class="placeholder col-6 rounded mb-4" style="height: 38px;"></span>
        <span class="placeholder col-4 rounded mb-6" style="height: 28px;"></span>
        <div class="d-flex flex-column gap-2 mb-8" style="max-width: 500px;">
          <span class="placeholder col-12 rounded"></span>
          <span class="placeholder col-10 rounded"></span>
          <span class="placeholder col-11 rounded"></span>
        </div>
        <div class="d-flex flex-column gap-3 mb-10">
          <span class="placeholder col-2 rounded" style="height: 24px;"></span>
          <div class="d-flex gap-3 flex-wrap">
            <span class="placeholder col-3 rounded-pill bg-accent-200" style="height: 42px;"></span>
            <span class="placeholder col-3 rounded-pill bg-accent-200" style="height: 42px;"></span>
          </div>
        </div>
        <span class="placeholder col-4 rounded-pill bg-accent-200" style="height: 46px;"></span>
      </div>
    {:else if errorMsg}
      <div class="d-flex flex-column align-items-center justify-content-center w-100 h-100 py-10">
        <div class="bg-white p-8 rounded-4 b-shadow-s border border-danger border-dashed text-center">
          <i class="bi bi-exclamation-triangle text-danger opacity-50 mb-4 d-block" style="font-size: 4rem;"></i>
          <h3 class="fsc-4 fw-bold text-danger mb-2">Error Loading Product</h3>
          <p class="fsc-3 text-muted m-0">{errorMsg}</p>
          <a href="/menu" class="px-5 py-2 mt-5 fw-bold rounded-pill border border-2 border-accent-500 text-accent-500 hover-button d-inline-block text-decoration-none">Back to Menu</a>
        </div>
      </div>
    {:else}
      <div class="d-flex flex-column align-items-center w-100 w-md-50 animation-fadeInLong">
        <img
          src={product.image_url}
          alt={product.name}
          class="w-50 rounded-circle ratio-1 shadow-sm hover-scale"
          style="min-width: 250px; max-width: 400px; object-fit: cover;"
        />
      </div>

      <div class="d-flex flex-column w-100 w-md-50 px-10 animation-slideUp">
        <h1 class="fsc-5 fw-bold text-accent-500 mb-2">{product.name}</h1>
        <p class="fsc-3 fw-medium text-accent-500 mb-5">{formatPrice(currentPrice(), $currency, $exchangeRate)}</p>
        <p class="fsc-2 text-black-300 mb-8" style="max-width: 500px;">
          {product.description}
        </p>

        {#if variants.length > 0}
          <div class="d-flex flex-column gap-3 mb-10">
            <span class="fsc-3 fw-bold text-accent-500">Size</span>
            <div class="d-flex gap-3 flex-wrap">
              {#each variants as variant}
                <button
                  class="px-5 py-2 fw-medium rounded-pill border border-2 text-nowrap {selectedVariant === variant.name ? 'bg-accent-500 text-white border-accent-500' : 'bg-transparent text-accent-500 border-accent-200'}"
                  onclick={() => selectedVariant = variant.name}
                  style="transition: all 0.2s;"
                >
                  {variant.name}
                  {#if variant.price_add > 0}
                    <span class="fsc-1 {selectedVariant === variant.name ? 'text-white' : 'text-accent-500'}">(+{formatPrice(variant.price_add, $currency, $exchangeRate)})</span>
                  {/if}
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <div class="d-flex align-items-center gap-4">
          <button
            onclick={addToCart}
            disabled={addingToCart}
            class="fsc-3 fsc-sm-2 fsc-md-2 px-5 py-2 fw-bold rounded-pill border border-2 border-accent-500 text-nowrap hover-button w-max"
          >
            {addingToCart ? 'Adding...' : 'Add To Cart'}
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<Footer />
