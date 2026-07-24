<script>
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { supabase } from "$lib/supabase.js";
  import AnimatedNumber from "$lib/components/AnimatedNumber.svelte";
  import { invalidateAll } from "$app/navigation";
  import { goto } from "$app/navigation";
  import {
    currency,
    exchangeRate,
    formatPrice,
    getDisplayValue,
  } from "$lib/stores/currency.js";

  let { data } = $props();

  let cartItems = $state(data.cartItems);

  // Keep cartItems in sync when server data changes (e.g. after invalidateAll)
  $effect(() => {
    cartItems = data.cartItems;
  });

  const totalPrice = $derived(
    cartItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
  );

  const totalQuantity = $derived(
    cartItems.reduce((sum, item) => sum + item.quantity, 0),
  );

  async function updateQuantity(itemId, delta) {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;

    const newQty = item.quantity + delta;

    // Optimistic update
    cartItems = cartItems.map((i) =>
      i.id === itemId ? { ...i, quantity: newQty } : i,
    );

    await supabase
      .from("cart_details")
      .update({ quantity: newQty })
      .eq("id", itemId);
  }

  async function deleteItem(itemId) {
    // Optimistic update
    cartItems = cartItems.filter((i) => i.id !== itemId);

    await supabase.from("cart_details").delete().eq("id", itemId);
  }

  function goToCheckout() {
    goto("/checkout");
  }
</script>

<Navbar />

<div
  class="d-flex flex-grow-1 w-100 justify-content-center py-20 bg-accent-100 animation-pageIn"
>
  <div
    class="d-flex flex-column flex-lg-row w-100 px-5 px-md-10 gap-8"
    style="max-width: 1100px;"
  >
    <!-- Left Section: Cart Items -->
    <div class="d-flex flex-column flex-grow-1 gap-5" style="max-width: 700px;">
      <!-- Items List -->
      <div
        class="bg-white p-5 p-md-8 rounded-4 b-shadow-s d-flex flex-column gap-5 border border-accent-200 stagger-children"
      >
        {#each cartItems as item (item.id)}
          <div
            class="d-flex w-100 align-items-start pb-5 border-bottom border-accent-200 last-border-0"
          >
            <div class="d-flex flex-column flex-sm-row w-100 gap-5">
              <!-- Item Image -->
              <div class="position-relative flex-shrink-0">
                <img
                  src={item.image_url}
                  alt={item.name}
                  class="rounded-3 object-fit-cover border border-accent-200"
                  style="width: 100px; height: 100px;"
                />
              </div>

              <!-- Item Details -->
              <div class="d-flex flex-column flex-grow-1">
                <span
                  class="fsc-3 fw-bold text-dark text-break lh-sm"
                  style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;"
                  >{item.name}</span
                >
                {#if item.variant}
                  <span class="fsc-2 text-muted mt-2">{item.variant}</span>
                {/if}
                <div class="d-flex align-items-center gap-3 mt-3">
                  <span class="fw-bold fsc-3 text-accent-500"
                    >{formatPrice(
                      item.unit_price,
                      $currency,
                      $exchangeRate,
                    )}</span
                  >
                </div>
              </div>

              <!-- Right Side Counter -->
              <div
                class="d-flex flex-column align-items-sm-end justify-content-end mt-3 mt-sm-0"
                style="min-width: 100px;"
              >
                <div
                  class="mt-auto w-max d-flex align-items-center border border-2 border-accent-300 rounded-pill px-2 py-1 bg-white"
                >
                  {#if item.quantity > 1}
                    <button
                      class="btn btn-sm p-0 px-2 fw-bold fsc-2 border-0 bg-transparent text-accent-500"
                      style="width: 32px;"
                      onclick={() => updateQuantity(item.id, -1)}>-</button
                    >
                  {:else}
                    <button
                      title="Remove item"
                      class="btn btn-sm p-0 px-2 fw-bold border-0 bg-transparent text-danger"
                      style="width: 32px;"
                      onclick={() => deleteItem(item.id)}
                    >
                      <i class="bi bi-trash-fill text-accent-500 fsc-2"></i>
                    </button>
                  {/if}
                  <span class="px-3 fw-bold fsc-3 text-dark"
                    ><AnimatedNumber value={item.quantity} /></span
                  >
                  <button
                    class="btn btn-sm p-0 px-2 fsc-2 text-accent-500 fw-bold border-0 bg-transparent"
                    style="width: 32px;"
                    onclick={() => updateQuantity(item.id, 1)}>+</button
                  >
                </div>
              </div>
            </div>
          </div>
        {/each}

        {#if cartItems.length === 0}
          <div class="d-flex flex-column align-items-center py-10">
            <i class="bi bi-basket2 fsc-8 text-muted mb-4"></i>
            <p class="fsc-4 text-muted">Your cart is empty.</p>
            <a href="/menu" class="fsc-3 fw-bold text-accent-500 mt-3"
              >Browse Menu</a
            >
          </div>
        {/if}
      </div>
    </div>

    <!-- Right Section: Order Summary -->
    <div class="w-100 mt-5 mt-lg-0" style="max-width: 350px;">
      <div
        class="bg-white p-6 rounded-4 b-shadow-s border border-accent-200 position-sticky animation-slideLeft"
        style="top: 20px;"
      >
        <h5 class="fw-black mb-5 fsc-4 text-accent-500">Order Summary</h5>

        <div class="d-flex justify-content-between mb-4">
          <span class="text-muted fsc-3">Total Items</span>
          <span class="fw-bold fsc-3 text-dark"
            ><AnimatedNumber value={totalQuantity} format="d" /></span
          >
        </div>

        <div
          class="d-flex justify-content-between mb-5 pb-5 border-bottom border-accent-200"
        >
          <span class="text-muted fsc-3">Total Price</span>
          <div
            class="fw-bold fsc-3 text-accent-500 d-flex align-items-center gap-1 text-nowrap"
          >
            <span>{$currency === "IDR" ? "Rp" : "$"}</span>
            {#key $currency}
              <AnimatedNumber
                value={getDisplayValue(totalPrice, $currency, $exchangeRate)}
                format={$currency === "IDR" ? "(.ddd)" : "(,ddd).dd"}
              />
            {/key}
          </div>
        </div>

        <button
          onclick={goToCheckout}
          disabled={cartItems.length === 0}
          class="w-100 py-3 fw-bold rounded-pill hover-button-alt fsc-3 border border-2 border-accent-500 d-flex justify-content-center align-items-center gap-2"
          class:opacity-50={cartItems.length === 0}
        >
          Checkout
        </button>
      </div>
    </div>
  </div>
</div>

<Footer />

<style>
  .last-border-0:last-child {
    border-bottom: none !important;
    padding-bottom: 0 !important;
  }
</style>
