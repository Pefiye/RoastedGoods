<script>
  import { currency, exchangeRate, formatPrice } from "$lib/stores/currency.js";

  let { data } = $props();
  let allOrders = $state([]);
  let isLoading = $state(true);

  let searchQuery = $state("");
  let filterType = $state("all");
  let currentPage = $state(1);
  const itemsPerPage = 10;

  $effect(() => {
    data.streamed.orders.then((res) => {
      allOrders = res;
      isLoading = false;
    });
  });

  const filteredOrders = $derived.by(() => {
    return allOrders.filter((order) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        order.id.toLowerCase().includes(searchLower) ||
        (order.order_details || []).some(item => item.product_name.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      if (filterType === "active") {
        return ["pending", "paid", "preparing"].includes(order.status);
      }
      if (filterType === "history") {
        return !["pending", "paid", "preparing"].includes(order.status);
      }
      return true;
    });
  });

  const totalPages = $derived(
    Math.ceil(filteredOrders.length / itemsPerPage) || 1
  );
  
  const paginatedOrders = $derived(
    filteredOrders.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
  );

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
  <div class="d-flex align-items-center mb-5 gap-4">
    <h2 class="fsc-5 fw-black text-accent-500 m-0">My Orders</h2>
  </div>

  <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 bg-white p-5 rounded-4 b-shadow-s border border-accent-200 mb-8">
    <div class="position-relative w-100" style="max-width: 400px;">
      <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-muted"></i>
      <input
        type="text"
        bind:value={searchQuery}
        oninput={() => currentPage = 1}
        placeholder="Search orders or drinks..."
        class="w-100 py-3 ps-9 pe-4 rounded-pill border border-2 border-accent-200 outline-0 fsc-3"
        style="transition: border-color 0.2s; padding-left: 3rem;"
        onfocus={(e) => (e.target.style.borderColor = "var(--color-accent-500)")}
        onblur={(e) => (e.target.style.borderColor = "")}
      />
    </div>

    <div class="d-flex gap-3 overflow-x-auto pb-2 pb-md-0 w-100 justify-content-start justify-content-md-end custom-scrollbar">
      <button
        class="btn {filterType === 'all' ? 'bg-accent-500 text-white border-accent-500' : 'bg-white text-accent-500 border-accent-200'} hover-button-alt border border-2 rounded-pill px-4 py-2 fw-bold text-nowrap transition-all"
        onclick={() => { filterType = 'all'; currentPage = 1; }}>All</button>
      <button
        class="btn {filterType === 'active' ? 'bg-accent-500 text-white border-accent-500' : 'bg-white text-accent-500 border-accent-200'} hover-button-alt border border-2 rounded-pill px-4 py-2 fw-bold text-nowrap transition-all"
        onclick={() => { filterType = 'active'; currentPage = 1; }}>Active</button>
      <button
        class="btn {filterType === 'history' ? 'bg-accent-500 text-white border-accent-500' : 'bg-white text-accent-500 border-accent-200'} hover-button-alt border border-2 rounded-pill px-4 py-2 fw-bold text-nowrap transition-all"
        onclick={() => { filterType = 'history'; currentPage = 1; }}>History</button>
    </div>
  </div>

  {#if isLoading}
    <div class="d-flex flex-column gap-5 stagger-children">
      {#each Array(4) as _}
        <div
          class="bg-white p-6 rounded-4 b-shadow-s border border-accent-200 d-flex flex-column gap-4"
        >
          <div class="d-flex justify-content-between align-items-start gap-4">
            <div class="d-flex flex-column gap-2 w-50">
              <div class="placeholder-glow">
                <div
                  class="placeholder rounded bg-accent-200"
                  style="width: 40%; height: 16px;"
                ></div>
              </div>
              <div class="placeholder-glow">
                <div
                  class="placeholder rounded bg-accent-200"
                  style="width: 60%; height: 20px;"
                ></div>
              </div>
            </div>
            <div class="d-flex flex-column align-items-end gap-2 w-25">
              <div class="placeholder-glow w-100 text-end">
                <div
                  class="placeholder rounded bg-accent-200"
                  style="width: 80%; height: 24px;"
                ></div>
              </div>
              <div class="placeholder-glow w-100 text-end">
                <div
                  class="placeholder rounded-pill bg-accent-200"
                  style="width: 50%; height: 24px;"
                ></div>
              </div>
            </div>
          </div>
          <div
            class="d-flex align-items-center gap-4 pt-4 border-top border-accent-200"
          >
            <div
              class="placeholder-glow rounded-3 flex-shrink-0"
              style="width: 50px; height: 50px;"
            >
              <div class="placeholder w-100 h-100 bg-accent-200"></div>
            </div>
            <div class="d-flex flex-column flex-grow-1 gap-2">
              <div class="placeholder-glow">
                <div
                  class="placeholder rounded bg-accent-200"
                  style="width: 70%; height: 20px;"
                ></div>
              </div>
              <div class="placeholder-glow">
                <div
                  class="placeholder rounded bg-accent-200"
                  style="width: 40%; height: 16px;"
                ></div>
              </div>
            </div>
            <div class="placeholder-glow w-25 text-end">
              <div
                class="placeholder rounded bg-accent-200"
                style="width: 60%; height: 20px;"
              ></div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else if paginatedOrders.length === 0}
    <div
      class="bg-white p-8 rounded-4 b-shadow-s border border-accent-200 text-center"
    >
      <i class="bi bi-receipt fsc-8 text-muted mb-4 d-block"></i>
      <h3 class="fsc-4 fw-bold text-accent-500 mb-2">No orders found!</h3>
      <p class="fsc-3 text-muted">
        {searchQuery || filterType !== 'all' ? "Try a different search term or filter." : "You have no past orders."}
      </p>
      {#if !searchQuery && filterType === 'all'}
        <a href="/menu" class="fsc-3 fw-bold text-accent-500 mt-3 d-inline-block">Browse Menu</a>
      {/if}
    </div>
  {:else}
    <div class="d-flex flex-column gap-5 stagger-children">
      {#each paginatedOrders as order}
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


    {#if totalPages > 1}
      <div class="d-flex justify-content-center align-items-center mt-8 mb-10 gap-4 animation-slideUp">
        <button
          class="btn border border-2 rounded-circle d-flex justify-content-center align-items-center p-0 flex-shrink-0 transition-all {currentPage === 1 ? 'border-accent-200 bg-accent-100 opacity-50 cursor-default' : 'hover-button-alt border-accent-200'}"
          style="width: 40px; height: 40px;"
          disabled={currentPage === 1}
          onclick={() => (currentPage -= 1)}
        >
          <i class="bi bi-chevron-left pe-0 {currentPage === 1 ? 'text-muted' : ''}"></i>
        </button>

        <span class="fsc-3 fw-bold text-accent-500">
          Page {currentPage} of {totalPages}
        </span>

        <button
          class="btn border border-2 rounded-circle d-flex justify-content-center align-items-center p-0 flex-shrink-0 transition-all {currentPage === totalPages ? 'border-accent-200 bg-accent-100 opacity-50 cursor-default' : 'hover-button-alt border-accent-200'}"
          style="width: 40px; height: 40px;"
          disabled={currentPage === totalPages}
          onclick={() => (currentPage += 1)}
        >
          <i class="bi bi-chevron-right pe-0 {currentPage === totalPages ? 'text-muted' : ''}"></i>
        </button>
      </div>
    {/if}
  {/if}
</div>
