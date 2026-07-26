<script>
  import { PUBLIC_MIDTRANS_CLIENT_KEY } from "$env/static/public";
  import { currency, exchangeRate, formatPrice } from "$lib/stores/currency.js";
  import { supabase } from "$lib/supabase.js";
  import { goto, invalidateAll } from "$app/navigation";

  let { data } = $props();

  let order = $state({});
  let orderDetails = $state([]);
  let countdown = $state(null);
  let isLoading = $state(true);
  let error = $state(null);

  $effect(() => {
    data.streamed.orderData.then(res => {
      order = res.order;
      orderDetails = res.orderDetails;
      countdown = res.expiresIn;
      isLoading = false;
    }).catch(err => {
      error = err;
      isLoading = false;
    });
  });

  function formatDate(dateString) {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  }

  function getStatusColor(status) {
    switch (status) {
      case "pending":
        return "text-white bg-warning";
      case "paid":
        return "text-accent-500 bg-accent-150";
      case "preparing":
        return "text-white bg-accent-500";
      case "done":
        return "text-accent-500 bg-secondary";
      case "cancelled":
        return "text-white bg-danger";
      default:
        return "text-muted bg-secondary";
    }
  }

  let retrying = $state(false);
  let cancelling = $state(false);
  $effect(() => {
    if (order.status !== "pending" || countdown === null || countdown <= 0)
      return;

    const interval = setInterval(() => {
      countdown = Math.max(0, countdown - 1);
      if (countdown <= 0) {
        clearInterval(interval);
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(interval);
  });

  function formatCountdown(seconds) {
    if (seconds === null || seconds <= 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  async function payNow() {
    retrying = true;
    try {
      const res = await fetch("/api/checkout/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || "Failed to get payment token");

      window.snap.pay(result.token, {
        onSuccess: async function () {
          await fetch("/api/checkout/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: order.id }),
          });
          window.location.reload();
        },
        onPending: function () {
          window.location.reload();
        },
        onClose: function () {
          window.location.reload();
        },
      });
    } catch (err) {
      alert(err.message);
    } finally {
      retrying = false;
    }
  }

  async function cancelOrder() {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    cancelling = true;
    try {
      const res = await fetch("/api/checkout/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.message || "Failed to cancel order");
      }
      window.location.reload();
    } catch (err) {
      alert(err.message);
    } finally {
      cancelling = false;
    }
  }

  let reordering = $state(false);

  async function orderAgain() {
    reordering = true;
    try {
      const { data: cart, error: cartError } = await supabase
        .from("carts")
        .select("id")
        .single();
      if (cartError || !cart)
        throw new Error("Cart not found. Please log out and back in.");

      const { data: existingItems, error: fetchError } = await supabase
        .from("cart_details")
        .select("id, product_id, variant, quantity")
        .eq("cart_id", cart.id);

      if (fetchError) throw new Error(fetchError.message);

      for (const item of orderDetails) {
        if (!item.product_id)
          throw new Error("Missing product ID in order details.");

        const existing = existingItems?.find(
          (i) => i.product_id === item.product_id && i.variant === item.variant,
        );
        if (existing) {
          const { error: updateError } = await supabase
            .from("cart_details")
            .update({ quantity: existing.quantity + item.quantity })
            .eq("id", existing.id);
          if (updateError) throw new Error(updateError.message);
        } else {
          const { error: insertError } = await supabase
            .from("cart_details")
            .insert({
              cart_id: cart.id,
              product_id: item.product_id,
              variant: item.variant,
              quantity: item.quantity,
            });
          if (insertError) throw new Error(insertError.message);
        }
      }

      await invalidateAll();
      goto("/cart");
    } catch (err) {
      alert("Failed to reorder: " + err.message);
      reordering = false;
    }
  }
</script>

<svelte:head>
  <script
    src="https://app.sandbox.midtrans.com/snap/snap.js"
    data-client-key={PUBLIC_MIDTRANS_CLIENT_KEY}
  ></script>
</svelte:head>

<div class="animation-pageIn w-100">
  <div class="w-100">
    <div class="d-flex align-items-center mb-8 gap-4">
      <a
        href="/profile/orders"
        class="btn p-2 rounded-circle hover-button shadow-sm d-flex justify-content-center align-items-center"
        style="width: 40px; height: 40px;"
        title="Back to History"
      >
        <i class="bi bi-caret-left-fill fsc-4"></i>
      </a>
      {#if isLoading}
        <div class="placeholder-glow"><span class="placeholder col-4 rounded" style="width: 150px;"></span></div>
      {:else}
        <h1 class="fsc-4 fw-black text-accent-500 m-0">Order Details</h1>
      {/if}
    </div>

    {#if isLoading}
      <div class="col-12 mb-6 placeholder-glow">
        <div class="bg-white p-5 rounded-4 b-shadow-s border border-accent-200 d-flex flex-column justify-content-center align-items-center text-center">
          <span class="placeholder col-3 rounded mb-4" style="height: 24px;"></span>
          <span class="placeholder col-2 rounded-pill mb-3" style="height: 38px;"></span>
          <span class="placeholder col-2 rounded-3" style="height: 24px;"></span>
        </div>
      </div>
      <div class="bg-white p-6 p-md-8 rounded-4 b-shadow-s border border-accent-200 mb-6 placeholder-glow">
        <div class="d-flex flex-column mb-5 pb-5 border-bottom border-accent-200 gap-2">
          <span class="placeholder col-2 rounded"></span>
          <span class="placeholder col-3 rounded"></span>
        </div>
        <span class="placeholder col-2 rounded mb-5" style="height: 24px;"></span>
        <div class="d-flex flex-column gap-4">
          {#each Array(2) as _}
            <div class="d-flex align-items-center gap-4 pb-4 border-bottom border-accent-200 last-border-0">
              <div class="rounded-3 placeholder bg-accent-200 flex-shrink-0" style="width: 60px; height: 60px;"></div>
              <div class="d-flex flex-column flex-grow-1 gap-2">
                <span class="placeholder col-4 rounded"></span>
                <span class="placeholder col-3 rounded"></span>
              </div>
              <span class="placeholder col-2 rounded"></span>
            </div>
          {/each}
        </div>
      </div>
      <div class="bg-white p-6 p-md-8 rounded-4 b-shadow-s border border-accent-200 placeholder-glow">
        <div class="d-flex justify-content-between align-items-center">
          <span class="placeholder col-2 rounded"></span>
          <span class="placeholder col-2 rounded"></span>
        </div>
      </div>
    {:else if error}
      <div class="text-center p-5 bg-secondary rounded-4 border border-danger border-dashed">
        <i class="bi bi-exclamation-triangle text-danger opacity-50 mb-4 d-block" style="font-size: 4rem;"></i>
        <h3 class="fsc-4 fw-bold text-danger mb-2">Error Loading Order</h3>
        <p class="fsc-3 text-muted m-0">{error.message || 'Order not found.'}</p>
      </div>
    {:else}
      <div class="col-12 mb-6">
      <div
        class="bg-white p-5 rounded-4 b-shadow-s border border-accent-200 d-flex flex-column justify-content-center align-items-center text-center"
      >
        <h3 class="fsc-4 fw-bold text-accent-500 mb-4">Order Status</h3>
        <span
          class="px-4 py-2 rounded-pill fw-bold fsc-3 text-uppercase {getStatusColor(
            order.status,
          )} mb-3"
        >
          {order.status}
        </span>
        <span
          class="fsc-2 fw-bold text-muted bg-accent-100 px-3 py-1 rounded-3"
        >
          ID: {order.id.split("-")[0]}...
        </span>
        {#if order.status === "preparing"}
          <p class="fsc-2 text-muted mt-4 mb-0">
            Your order is being prepared. We'll call your name when it's ready!
          </p>
        {/if}
      </div>
    </div>

    <div
      class="bg-white p-6 p-md-8 rounded-4 b-shadow-s border border-accent-200 mb-6 animation-slideUp"
    >
      <div
        class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-5 pb-5 border-bottom border-accent-200 gap-4"
      >
        <div class="d-flex flex-column">
          <span class="fsc-4 fw-bold text-accent-500">Order Items</span>
          <span class="fsc-2 text-muted">{formatDate(order.created_at)}</span>
        </div>
      </div>

      <h3 class="fsc-4 fw-black text-accent-500 mb-5">Items</h3>

      <div class="d-flex flex-column gap-4 stagger-children">
        {#each orderDetails as item}
          <div
            class="d-flex align-items-center gap-4 pb-4 border-bottom border-accent-200 last-border-0"
          >
            {#if item.products?.image_url}
              <img
                src={item.products.image_url}
                alt={item.product_name}
                class="rounded-3 object-fit-cover border border-accent-200 flex-shrink-0"
                style="width: 60px; height: 60px;"
                loading="lazy"
                decoding="async"
              />
            {:else}
              <div
                class="rounded-3 bg-accent-150 d-flex justify-content-center align-items-center flex-shrink-0"
                style="width: 60px; height: 60px;"
              >
                <i class="bi bi-cup-hot text-accent-500"></i>
              </div>
            {/if}
            <div class="d-flex flex-column flex-grow-1">
              <span class="fsc-3 fw-bold text-accent-500 lh-sm"
                >{item.product_name}</span
              >
              <span class="fsc-2 text-muted"
                >{item.variant} × {item.quantity}</span
              >
            </div>
            <span class="fw-bold fsc-3 text-accent-500 text-nowrap"
              >{formatPrice(
                item.unit_price * item.quantity,
                $currency,
                $exchangeRate,
              )}</span
            >
          </div>
        {/each}
      </div>
    </div>

    <div
      class="bg-white p-6 p-md-8 rounded-4 b-shadow-s border border-accent-200 animation-slideUp"
    >
      <div class="d-flex justify-content-between align-items-center">
        <span class="fsc-3 fw-bold text-accent-500">Total</span>
        <span class="fsc-3 fw-bolder text-accent-500"
          >{formatPrice(order.total_price, $currency, $exchangeRate)}</span
        >
      </div>

      {#if order.status === "pending"}
        <hr class="border-accent-200 my-5 opacity-25" />
        <div class="d-flex flex-column gap-4">
          <div class="d-flex justify-content-between align-items-center">
            <span class="fsc-2 text-muted">
              <i class="bi bi-clock me-2"></i> Expires in
              <strong>{formatCountdown(countdown)}</strong>
            </span>
          </div>
          <div class="d-flex flex-column flex-sm-row gap-3">
            <button
              onclick={payNow}
              disabled={retrying || cancelling}
              class="flex-grow-1 px-6 py-3 fw-bold rounded-pill hover-button-alt fsc-2 border border-2 border-accent-500 text-nowrap d-flex align-items-center justify-content-center gap-2"
            >
              {#if retrying}
                <span class="spinner-border spinner-border-sm"></span> Loading...
              {:else}
                <i class="bi bi-credit-card"></i> Try Paying Again
              {/if}
            </button>
            <button
              onclick={cancelOrder}
              disabled={retrying || cancelling}
              class="px-6 py-3 fw-bold rounded-pill fsc-2 border border-2 border-danger text-danger text-nowrap d-flex align-items-center justify-content-center gap-2 bg-white hover-button-danger"
            >
              {#if cancelling}
                <span class="spinner-border spinner-border-sm"></span> Cancelling...
              {:else}
                <i class="bi bi-x-circle-fill"></i> Cancel Order
              {/if}
            </button>
          </div>
        </div>
      {/if}

      {#if order.status === "paid"}
        <hr class="border-accent-200 my-5 opacity-25" />
        <div class="bg-accent-100 p-4 rounded-3 border border-accent-200 d-flex gap-3 align-items-start">
          <i class="bi bi-info-circle-fill text-accent-500 fsc-3 mt-1"></i>
          <p class="fsc-2 text-accent-500 mb-0 fw-medium">
            Your payment was successful! Please head over to the cashier or counter so we can start preparing your order.
          </p>
        </div>
      {/if}

      {#if order.status === "done" || order.status === "cancelled"}
        <hr class="border-accent-200 my-5 opacity-25" />
        <button
          onclick={orderAgain}
          disabled={reordering}
          class="w-100 px-6 py-3 fw-bold rounded-pill hover-button-alt fsc-3 border border-2 border-accent-500 text-nowrap d-flex align-items-center justify-content-center gap-2"
        >
          {#if reordering}
            <span class="spinner-border spinner-border-sm"></span> Adding to Cart...
          {:else}
            <i class="bi bi-arrow-repeat"></i> Order Again
          {/if}
        </button>
      {/if}
    {/if}
  </div>
</div>

<style>
  .last-border-0:last-child {
    border-bottom: none !important;
    padding-bottom: 0 !important;
  }
  .hover-button-danger {
    transition: all 0.2s ease;
  }
  .hover-button-danger:hover:not(:disabled) {
    background-color: var(--bs-danger) !important;
    color: white !important;
  }
  .hover-button-danger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
