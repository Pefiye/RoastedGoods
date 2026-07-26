<script>
  import { currency, exchangeRate, formatPrice } from "$lib/stores/currency.js";

  let { data } = $props();
  let orders = $state([]);
  let isLoading = $state(true);

  $effect(() => {
    data.streamed.orders.then((res) => {
      orders = res;
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
        return "text-white bg-accent-500";
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
</script>

<div class="animation-pageIn w-100">
  <div class="d-flex align-items-center mb-8 gap-4">
    <h2 class="fsc-5 fw-black text-accent-500 m-0">Purchase History</h2>
  </div>

  {#if isLoading}
    <div class="d-flex flex-column gap-5 stagger-children">
      {#each Array(4) as _}
        <div class="bg-white p-6 rounded-4 b-shadow-s border border-accent-200 d-flex flex-column gap-4">
          <div class="d-flex justify-content-between align-items-start gap-4">
            <div class="d-flex flex-column gap-2 w-50">
              <div class="placeholder-glow"><div class="placeholder rounded bg-accent-200" style="width: 40%; height: 16px;"></div></div>
              <div class="placeholder-glow"><div class="placeholder rounded bg-accent-200" style="width: 60%; height: 20px;"></div></div>
            </div>
            <div class="d-flex flex-column align-items-end gap-2 w-25">
              <div class="placeholder-glow w-100 text-end"><div class="placeholder rounded bg-accent-200" style="width: 80%; height: 24px;"></div></div>
              <div class="placeholder-glow w-100 text-end"><div class="placeholder rounded-pill bg-accent-200" style="width: 50%; height: 24px;"></div></div>
            </div>
          </div>
          <div class="d-flex align-items-center gap-4 pt-4 border-top border-accent-200">
            <div class="placeholder-glow rounded-3 flex-shrink-0" style="width: 50px; height: 50px;">
              <div class="placeholder w-100 h-100 bg-accent-200"></div>
            </div>
            <div class="d-flex flex-column flex-grow-1 gap-2">
              <div class="placeholder-glow"><div class="placeholder rounded bg-accent-200" style="width: 70%; height: 20px;"></div></div>
              <div class="placeholder-glow"><div class="placeholder rounded bg-accent-200" style="width: 40%; height: 16px;"></div></div>
            </div>
            <div class="placeholder-glow w-25 text-end"><div class="placeholder rounded bg-accent-200" style="width: 60%; height: 20px;"></div></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if orders.length === 0}
    <div
      class="bg-white p-8 rounded-4 b-shadow-s border border-accent-200 text-center"
    >
      <i class="bi bi-receipt fsc-8 text-muted mb-4 d-block"></i>
      <p class="fsc-4 text-muted">You have no past orders.</p>
      <a href="/menu" class="fsc-3 fw-bold text-accent-500 mt-3 d-inline-block"
        >Browse Menu</a
      >
    </div>
  {:else}
    <div class="d-flex flex-column gap-5 stagger-children">
      {#each orders as order}
        {@const firstItem = order.order_details?.[0]}
        {@const totalItems = (order.order_details || []).reduce(
          (s, i) => s + i.quantity,
          0,
        )}
        {@const remainingItems = totalItems - (firstItem?.quantity || 0)}
        <a
          href="/profile/orders/{order.id}"
          class="bg-white p-6 rounded-4 b-shadow-s border border-accent-200 hover-lift d-flex flex-column gap-4 text-decoration-none"
        >
          <div class="d-flex justify-content-between align-items-start gap-4">
            <div class="d-flex flex-column">
              <span class="fsc-2 text-muted mb-1"
                >{formatDate(order.created_at)}</span
              >
              <span class="fsc-2 fw-bold text-accent-500"
                >ID: {order.id.split("-")[0]}...</span
              >
            </div>
            <div class="d-flex flex-column align-items-end gap-2">
              <span class="fsc-3 fw-black text-accent-500"
                >{formatPrice(
                  order.total_price,
                  $currency,
                  $exchangeRate,
                )}</span
              >
              <span
                class="fsc-1 fw-bold px-3 py-1 rounded-pill text-uppercase {getStatusColor(
                  order.status,
                )}"
              >
                {order.status}
              </span>
            </div>
          </div>

          {#if firstItem}
            <div
              class="d-flex align-items-center gap-4 pt-4 border-top border-accent-200"
            >
              {#if firstItem.products?.image_url}
                <img
                  src={firstItem.products.image_url}
                  alt={firstItem.product_name}
                  class="rounded-3 object-fit-cover border border-accent-200 flex-shrink-0"
                  style="width: 50px; height: 50px;"
                />
              {:else}
                <div
                  class="rounded-3 bg-accent-150 d-flex justify-content-center align-items-center flex-shrink-0"
                  style="width: 50px; height: 50px;"
                >
                  <i class="bi bi-cup-hot text-accent-500"></i>
                </div>
              {/if}
              <div class="d-flex flex-column flex-grow-1 overflow-hidden">
                <span class="fsc-2 fw-bold text-accent-500 text-truncate"
                  >{firstItem.product_name}</span
                >
                <span class="fsc-1 text-muted"
                  >{firstItem.variant} × {firstItem.quantity}</span
                >
              </div>
              <span class="fw-bold fsc-2 text-accent-500 text-nowrap"
                >{formatPrice(
                  firstItem.unit_price * firstItem.quantity,
                  $currency,
                  $exchangeRate,
                )}</span
              >
            </div>
            {#if remainingItems > 0}
              <span class="fsc-1 fw-bold text-accent-500 text-center"
                >+{remainingItems} more item{remainingItems > 1
                  ? "s"
                  : ""}</span
              >
            {/if}
          {/if}
        </a>
      {/each}
    </div>
  {/if}
</div>
