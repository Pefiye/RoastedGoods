<script>
  import { PUBLIC_MIDTRANS_CLIENT_KEY } from "$env/static/public";
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { supabase } from "$lib/supabase.js";
  import { goto } from "$app/navigation";
  import { currency, exchangeRate, formatPrice } from "$lib/stores/currency.js";

  let { data } = $props();

  let checkoutItems = $state([]);
  let totalPrice = $state(0);
  let cartId = $state(null);
  let isLoading = $state(true);

  $effect(() => {
    data.streamed.checkoutData.then(res => {
      if (res.redirect) {
        goto(res.redirect);
        return;
      }
      checkoutItems = res.checkoutItems;
      totalPrice = res.totalPrice;
      cartId = res.cartId;
      isLoading = false;
    });
  });

  let processing = $state(false);
  let orderPlaced = $state(false);
  let orderId = $state(null);
  let errorMsg = $state("");

  async function placeOrder() {
    if (checkoutItems.length === 0) return;

    processing = true;
    errorMsg = "";

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutItems,
          totalPrice,
          cartId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to initialize payment");
      }

      window.snap.pay(result.token, {
        onSuccess: async function (paymentResult) {
          await fetch("/api/checkout/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: result.orderId }),
          });
          goto(`/profile/orders/${result.orderId}`);
        },
        onPending: async function (paymentResult) {
          goto(`/profile/orders/${result.orderId}`);
        },
        onError: async function (paymentResult) {
          goto(`/profile/orders/${result.orderId}`);
        },
        onClose: async function () {
          goto(`/profile/orders/${result.orderId}`);
        },
      });
    } catch (err) {
      errorMsg = err.message || "Something went wrong. Please try again.";
    } finally {
      processing = false;
    }
  }
</script>

<svelte:head>
  <script
    src="https://app.sandbox.midtrans.com/snap/snap.js"
    data-client-key={PUBLIC_MIDTRANS_CLIENT_KEY}
  ></script>
</svelte:head>

<Navbar />

<div
  class="d-flex flex-grow-1 w-100 justify-content-center py-20 bg-accent-100"
>
  <div class="w-100 px-5 px-md-10" style="max-width: 800px;">
    {#if orderPlaced}

      <div
        class="bg-white p-8 p-md-10 rounded-4 b-shadow-s border border-accent-200 text-center animation-fadeIn"
      >
        <i
          class="bi bi-check-circle-fill fsc-9 text-success mb-5 d-block animation-pulse"
        ></i>
        <h1 class="fsc-6 fw-black text-accent-500 mb-3">Order Placed!</h1>
        <p class="fsc-3 text-muted mb-2">
          Your order has been created successfully.
        </p>
        <p class="fsc-2 text-muted mb-8">
          Order ID: <span class="fw-bold text-accent-500"
            >{orderId?.slice(0, 8)}...</span
          >
        </p>

        <p
          class="fsc-2 text-muted mb-8 p-4 rounded-3"
          style="background-color: var(--color-accent-100);"
        >
          <i class="bi bi-info-circle me-2"></i>
          Your order has been saved as <span class="fw-bold">pending</span>. You
          can complete the payment later in the transaction details.
        </p>

        <div class="d-flex gap-4 justify-content-center">
          <a
            href="/profile/orders/{orderId}"
            class="px-5 py-2 fw-bold rounded-pill hover-button-alt border border-2 border-accent-500 text-nowrap fsc-3"
          >
            Transaction Details
          </a>
          <a
            href="/menu"
            class="px-5 py-2 fw-bold rounded-pill border border-2 border-accent-500 text-nowrap hover-button fsc-3"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    {:else}

      <h1 class="fsc-6 fw-black text-accent-500 mb-8 animation-slideDown">
        Checkout
      </h1>

      {#if errorMsg}
        <div
          class="bg-danger bg-opacity-10 text-danger fsc-2 p-3 rounded-3 mb-5 text-center"
        >
          {errorMsg}
        </div>
      {/if}

      {#if isLoading}
        <div class="bg-white p-6 p-md-8 rounded-4 b-shadow-s border border-accent-200 mb-6 placeholder-glow">
          <h3 class="fsc-4 fw-black text-accent-500 mb-5">Order Summary</h3>
          <div class="d-flex flex-column gap-4">
            {#each Array(3) as _}
              <div class="d-flex align-items-center gap-4 pb-4 border-bottom border-accent-200 last-border-0">
                <div class="rounded-3 placeholder bg-accent-200 flex-shrink-0" style="width: 60px; height: 60px;"></div>
                <div class="d-flex flex-column flex-grow-1">
                  <span class="placeholder col-6 rounded mb-2"></span>
                  <span class="placeholder col-4 rounded"></span>
                </div>
                <span class="placeholder col-3 rounded"></span>
              </div>
            {/each}
          </div>
        </div>
        <div class="bg-white p-6 p-md-8 rounded-4 b-shadow-s border border-accent-200 placeholder-glow">
          <div class="d-flex justify-content-between mb-5">
            <span class="placeholder col-3 rounded bg-accent-200"></span>
            <span class="placeholder col-4 rounded bg-accent-200"></span>
          </div>
          <span class="placeholder col-12 rounded-pill bg-accent-200" style="height: 52px;"></span>
        </div>
      {:else}
        {#if checkoutItems.length === 0}
        <div
          class="bg-white p-8 rounded-4 b-shadow-s border border-accent-200 text-center"
        >
          <p class="fsc-4 text-muted">
            Your cart is empty. Nothing to checkout.
          </p>
          <a
            href="/menu"
            class="fsc-3 fw-bold text-accent-500 mt-3 d-inline-block"
            >Browse Menu</a
          >
        </div>
      {:else}
        <div
          class="bg-white p-6 p-md-8 rounded-4 b-shadow-s border border-accent-200 mb-6 animation-pageIn"
        >
          <h3 class="fsc-4 fw-black text-accent-500 mb-5">Order Summary</h3>

          <div class="d-flex flex-column gap-4 stagger-children">
            {#each checkoutItems as item}
              <div
                class="d-flex align-items-center gap-4 pb-4 border-bottom border-accent-200 last-border-0"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  class="rounded-3 object-fit-cover border border-accent-200 flex-shrink-0"
                  style="width: 60px; height: 60px;"
                />
                <div class="d-flex flex-column flex-grow-1">
                  <span class="fsc-3 fw-bold text-accent-500 lh-sm">{item.name}</span>
                  <span class="fsc-2 text-muted"
                    >{item.variant} × {item.quantity}</span
                  >
                </div>
                <span class="fw-bold fsc-3 text-accent-500 text-nowrap"
                  >{formatPrice(item.unit_price * item.quantity, $currency, $exchangeRate)}</span
                >
              </div>
            {/each}
          </div>
        </div>

        <div
          class="bg-white p-6 p-md-8 rounded-4 b-shadow-s border border-accent-200 animation-slideUp"
        >
          <div class="d-flex justify-content-between mb-5">
            <span class="fsc-3 fw-bold text-accent-500">Total</span>
            <span class="fsc-4 fw-black text-accent-500"
              >{formatPrice(totalPrice, $currency, $exchangeRate)}</span
            >
          </div>

          <button
            onclick={placeOrder}
            disabled={processing}
            class="w-100 py-3 fw-bold rounded-pill hover-button-alt fsc-3 border border-2 border-accent-500 d-flex justify-content-center align-items-center gap-2"
          >
            {#if processing}
              <span class="spinner-border spinner-border-sm"></span>
              Processing...
            {:else}
              <i class="bi bi-credit-card"></i>
              Place Order
            {/if}
          </button>
        </div>
      {/if}
      {/if}
    {/if}
  </div>
</div>

<Footer />

<style>
  .last-border-0:last-child {
    border-bottom: none !important;
    padding-bottom: 0 !important;
  }
</style>
