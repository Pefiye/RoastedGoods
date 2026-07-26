<script>
  import { currency, exchangeRate, formatPrice } from "$lib/stores/currency.js";
  import { goto, invalidateAll } from "$app/navigation";

  let { data } = $props();

  let order = $state({});
  let orderDetails = $state([]);
  let isLoading = $state(true);
  let errorMsg = $state(null);

  $effect(() => {
    data.streamed.orderData.then(res => {
      order = res.order;
      orderDetails = res.orderDetails;
      isLoading = false;
    }).catch(err => {
      errorMsg = err.message || 'Order not found';
      isLoading = false;
    });
  });

  let updating = $state(false);

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

  async function updateStatus(newStatus) {
    updating = true;
    try {
      const res = await fetch("/api/cashier/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, newStatus }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update status");

      await invalidateAll();
    } catch (err) {
      alert(err.message);
    } finally {
      updating = false;
    }
  }
</script>

<div class="animation-pageIn w-100" style="max-width: 1200px; margin: 0 auto;">
  <div class="d-flex align-items-center mb-8 gap-4">
    <a
      href="/cashier"
      class="btn p-2 rounded-circle hover-button shadow-sm d-flex justify-content-center align-items-center"
      style="width: 40px; height: 40px;"
      title="Back to Dashboard"
    >
      <i class="bi bi-caret-left-fill fsc-4"></i>
    </a>
    {#if isLoading}
      <div class="placeholder-glow"><span class="placeholder col-4 rounded" style="width: 150px;"></span></div>
    {:else}
      <h1 class="fsc-4 fw-black text-accent-500 m-0">
        Order <span class="text-accent-500">#{order.id?.split("-")[0]}</span>
      </h1>
    {/if}
  </div>

  {#if isLoading}
    <div class="row g-6 placeholder-glow">
      <div class="col-12 col-lg-8 d-flex flex-column">
        <div class="bg-white p-6 p-md-8 rounded-4 b-shadow-s border border-accent-200 d-flex flex-column flex-grow-1">
          <div class="d-flex justify-content-between align-items-center mb-5 pb-4 border-bottom border-accent-200">
            <span class="placeholder col-3 rounded" style="height: 24px;"></span>
            <span class="placeholder col-2 rounded"></span>
          </div>
          <div class="d-flex flex-column gap-4 stagger-children mb-6">
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
          <div class="d-flex justify-content-between align-items-center pt-4 border-top border-accent-200 mt-auto">
            <span class="placeholder col-2 rounded"></span>
            <span class="placeholder col-3 rounded" style="height: 24px;"></span>
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-4 d-flex flex-column gap-6">
        <div class="bg-white p-6 rounded-4 b-shadow-s border border-accent-200 d-flex flex-column gap-5">
          <div class="d-flex flex-column gap-2"><span class="placeholder col-4 rounded"></span><span class="placeholder col-8 rounded" style="height: 24px;"></span></div>
          <div class="d-flex flex-column gap-2"><span class="placeholder col-4 rounded"></span><span class="placeholder col-6 rounded-pill" style="height: 38px;"></span></div>
        </div>
      </div>
    </div>
  {:else if errorMsg}
    <div class="text-center p-5 bg-secondary rounded-4 border border-danger border-dashed">
      <i class="bi bi-exclamation-triangle text-danger opacity-50 mb-4 d-block" style="font-size: 4rem;"></i>
      <h3 class="fsc-4 fw-bold text-danger mb-2">Error Loading Order</h3>
      <p class="fsc-3 text-muted m-0">{errorMsg}</p>
    </div>
  {:else}
    <div class="row g-6">
    <div class="col-12 col-lg-8 d-flex flex-column">

      <div
        class="bg-white p-6 p-md-8 rounded-4 b-shadow-s border border-accent-200 d-flex flex-column flex-grow-1"
      >
        <div
          class="d-flex justify-content-between align-items-center mb-5 pb-4 border-bottom border-accent-200"
        >
          <span class="fsc-4 fw-black text-accent-500">Order Items</span>
          <span class="fsc-2 text-muted">{formatDate(order.created_at)}</span>
        </div>

        <div class="d-flex flex-column gap-4 stagger-children mb-6">
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
                <span class="fsc-2 text-muted">{item.variant}</span>
              </div>
              <div class="d-flex align-items-center gap-3">
                <span
                  class="fsc-3 fw-black bg-accent-100 text-accent-500 rounded px-3 py-1 border border-accent-200"
                >
                  x{item.quantity}
                </span>
              </div>
            </div>
          {/each}
        </div>

        <div
          class="d-flex justify-content-between align-items-center pt-4 border-top border-accent-200 mt-auto"
        >
          <span class="fsc-3 fw-bold text-accent-500">Total Paid</span>
          <span class="fsc-4 fw-black text-accent-500">
            {formatPrice(order.total_price, $currency, $exchangeRate)}
          </span>
        </div>
      </div>
    </div>

    <div class="col-12 col-lg-4 d-flex flex-column gap-6">

      <div
        class="bg-white p-6 rounded-4 b-shadow-s border border-accent-200 d-flex flex-column gap-5"
      >
        <div class="d-flex flex-column">
          <span class="fsc-2 text-muted fw-medium mb-1">Customer</span>
          <span class="fsc-3 fw-bold text-accent-500"
            >{order.profiles?.username || "Unknown"}</span
          >
        </div>

        <div class="d-flex flex-column">
          <span class="fsc-2 text-muted fw-medium mb-1">Status</span>
          <div>
            <span
              class="fsc-3 fw-bold px-4 py-1 rounded-pill text-uppercase {getStatusColor(
                order.status,
              )} d-inline-block"
            >
              {order.status}
            </span>
          </div>
        </div>

        {#if order.status === "paid" || order.status === "preparing"}
          <div class="d-flex flex-column">
            <span class="fsc-2 text-muted fw-medium mb-1">Action</span>

            <div class="d-flex flex-column gap-3">
              {#if order.status === "paid"}
                <button
                  onclick={() => updateStatus("preparing")}
                  disabled={updating}
                  class="w-100 hover-button-alt border border-2 border-accent-500 fw-bold py-3 rounded-pill d-flex align-items-center justify-content-center gap-2"
                >
                  {#if updating}
                    <span class="spinner-border spinner-border-sm"></span> Updating...
                  {:else}
                    <i class="bi bi-fire"></i> Start Preparing
                  {/if}
                </button>
              {:else if order.status === "preparing"}
                <button
                  onclick={() => updateStatus("done")}
                  disabled={updating}
                  class="w-100 hover-button-alt border border-2 border-accent-500 fw-bold py-3 rounded-pill d-flex align-items-center justify-content-center gap-2"
                >
                  {#if updating}
                    <span class="spinner-border spinner-border-sm"></span> Updating...
                  {:else}
                    <i class="bi bi-check-circle-fill"></i> Mark as Complete
                  {/if}
                </button>
              {/if}
            </div>
          </div>
        {/if}
      </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .last-border-0:last-child {
    border-bottom: none !important;
    padding-bottom: 0 !important;
  }
</style>
