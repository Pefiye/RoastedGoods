<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  let { data } = $props();

  let orders = $state([]);
  let totalOrders = $state(0);
  let isLoading = $state(true);

  let searchQuery = $state(page.url.searchParams.get("search") || "");
  let currentPage = $state(parseInt(page.url.searchParams.get("page") || "1"));
  let itemsPerPage = $state(parseInt(page.url.searchParams.get("limit") || "25"));

  $effect(() => {
    isLoading = true;
    searchQuery = page.url.searchParams.get("search") || "";
    currentPage = parseInt(page.url.searchParams.get("page") || "1");
    itemsPerPage = parseInt(page.url.searchParams.get("limit") || "25");

    data.streamed.ordersData.then((res) => {
      orders = res.orders;
      totalOrders = res.count;
      isLoading = false;
    });
  });

  const totalPages = $derived(
    Math.ceil(totalOrders / itemsPerPage) || 1,
  );

  function updateFilters(e) {
    if (e && e.preventDefault) e.preventDefault();
    const url = new URL(page.url);
    if (searchQuery.trim()) {
      url.searchParams.set("search", searchQuery.trim());
    } else {
      url.searchParams.delete("search");
    }
    url.searchParams.set("limit", itemsPerPage.toString());
    url.searchParams.set("page", "1");
    goto(url.toString(), { keepFocus: true });
  }

  function handlePageChange(newPage) {
    if (newPage < 1 || newPage > totalPages) return;
    const url = new URL(page.url);
    url.searchParams.set("page", newPage.toString());
    goto(url.toString(), { keepFocus: true });
  }

  function formatIDR(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(dateString) {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
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
      case "completed":
        return "text-accent-500 bg-secondary";
      case "cancelled":
        return "text-white bg-danger";
      default:
        return "text-muted bg-secondary";
    }
  }
</script>

<div class="d-flex flex-column gap-4 animation-pageIn">
  <div class="d-flex justify-content-between align-items-center">
    <h1 class="fsc-5 fw-black text-accent-500 m-0">Transactions</h1>
  </div>

  <div
    class="bg-white p-4 p-md-5 rounded-4 b-shadow-s border border-accent-200"
  >
    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 mb-5"
    >
      <form class="position-relative w-100" style="max-width: 400px;" onsubmit={updateFilters}>
        <i
          class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-muted"
        ></i>
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search by Order ID..."
          class="w-100 py-3 ps-9 pe-4 rounded-pill border border-2 border-accent-200 outline-0 fsc-3 transition-all bg-white"
          style="padding-left: 3rem;"
          onfocus={(e) =>
            (e.target.style.borderColor = "var(--color-accent-500)")}
          onblur={(e) => (e.target.style.borderColor = "")}
        />
        {#if searchQuery}
          <button 
            type="button" 
            class="position-absolute border-0 bg-transparent text-muted p-2 d-flex align-items-center justify-content-center" 
            style="right: 0.8rem; top: 50%; transform: translateY(-50%); cursor: pointer;" 
            onclick={() => { searchQuery = ''; updateFilters(); }}
          >
            <i class="bi bi-x-circle-fill"></i>
          </button>
        {/if}
      </form>
      
      <div class="d-flex align-items-center gap-3">
        <span class="fsc-2 text-muted fw-bold text-nowrap">Items per page:</span>
        <select 
          class="form-select border-2 border-accent-200 rounded-pill fsc-3 fw-bold text-accent-500 bg-white" 
          style="width: 100px; cursor: pointer;"
          bind:value={itemsPerPage}
          onchange={updateFilters}
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>

    {#if isLoading}
      <div class="table-responsive">
        <table class="table align-middle table-row-dashed fs-6 gy-5">
          <thead>
            <tr class="text-start text-muted fw-bold fsc-2 text-uppercase gs-0">
              <th class="min-w-100px">Order ID</th>
              <th class="min-w-150px">Date</th>
              <th class="min-w-150px">Customer</th>
              <th class="min-w-250px">Items</th>
              <th class="min-w-100px text-end">Total</th>
              <th class="min-w-100px text-end pe-4">Status</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 fw-medium">
            {#each Array(5) as _}
              <tr>
                <td><div class="placeholder-glow"><span class="placeholder col-8 rounded"></span></div></td>
                <td><div class="placeholder-glow"><span class="placeholder col-10 rounded"></span></div></td>
                <td>
                  <div class="d-flex flex-column gap-1 placeholder-glow">
                    <span class="placeholder col-8 rounded"></span>
                    <span class="placeholder col-6 rounded"></span>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column gap-1 placeholder-glow">
                    <span class="placeholder col-12 rounded"></span>
                    <span class="placeholder col-9 rounded"></span>
                  </div>
                </td>
                <td class="text-end"><div class="placeholder-glow"><span class="placeholder col-6 rounded"></span></div></td>
                <td class="text-end pe-4"><div class="placeholder-glow"><span class="placeholder col-8 rounded-pill" style="height: 30px;"></span></div></td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else if orders.length === 0}
      <div
        class="text-center p-5 bg-secondary rounded-4 border border-accent-200 border-dashed"
      >
        <i
          class="bi bi-receipt text-muted opacity-25 mb-4 d-block"
          style="font-size: 4rem;"
        ></i>
        <p class="fsc-3 text-muted m-0">No transactions found.</p>
      </div>
    {:else}
      <div class="table-responsive">
        <table class="table align-middle table-row-dashed fs-6 gy-5">
          <thead>
            <tr class="text-start text-muted fw-bold fsc-2 text-uppercase gs-0">
              <th class="min-w-100px">Order ID</th>
              <th class="min-w-150px">Date</th>
              <th class="min-w-150px">Customer</th>
              <th class="min-w-250px">Items</th>
              <th class="min-w-100px text-end">Total</th>
              <th class="min-w-100px text-end pe-4">Status</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 fw-medium">
            {#each orders as transaction}
              <tr>
                <td>
                  <span
                    class="text-accent-500 fw-bold fsc-3"
                    title={transaction.id}
                  >
                    #{transaction.id.substring(0, 8)}
                  </span>
                </td>
                <td>
                  <span class="text-muted fsc-2"
                    >{formatDate(transaction.created_at)}</span
                  >
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <span class="text-accent-500 fw-bold fsc-3"
                      >{transaction.profiles?.username || "Unknown"}</span
                    >
                    <span class="text-muted fsc-1"
                      >{transaction.profiles?.email || ""}</span
                    >
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column gap-1">
                    {#each transaction.order_details as item}
                      <span class="fsc-2 text-muted">
                        <span class="fw-bold text-accent-500"
                          >{item.quantity}x</span
                        >
                        {item.product_name}
                        {#if item.variant !== "Regular" && item.variant !== "None" && item.variant}
                          <span
                            class="badge bg-secondary text-accent-500 border border-accent-200 rounded-pill px-2 py-1 fsc-1 ms-1"
                            >{item.variant}</span
                          >
                        {/if}
                      </span>
                    {/each}
                  </div>
                </td>
                <td class="text-end text-accent-500 fw-bold fsc-3">
                  {formatIDR(transaction.total_price)}
                </td>
                <td class="text-end pe-4">
                  <span
                    class="px-4 py-2 rounded-pill fw-bold fsc-1 text-uppercase {getStatusColor(
                      transaction.status,
                    )} border-0 d-inline-block"
                  >
                    {transaction.status}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if totalPages > 1}
        <div
          class="d-flex justify-content-center align-items-center mt-5 pt-3 gap-4 border-top border-accent-200"
        >
          <button
            class="btn border border-2 rounded-circle d-flex justify-content-center align-items-center p-0 flex-shrink-0 transition-all {currentPage ===
            1
              ? 'border-accent-200 bg-accent-100 opacity-50 cursor-default'
              : 'hover-button-alt border-accent-200'}"
            style="width: 40px; height: 40px;"
            disabled={currentPage === 1 || isLoading}
            onclick={() => handlePageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            <i
              class="bi bi-chevron-left {currentPage === 1 ? 'text-muted' : ''}"
            ></i>
          </button>
          <span class="fsc-3 fw-bold text-accent-500"
            >Page {currentPage} of {totalPages}</span
          >
          <button
            class="btn border border-2 rounded-circle d-flex justify-content-center align-items-center p-0 flex-shrink-0 transition-all {currentPage ===
            totalPages
              ? 'border-accent-200 bg-accent-100 opacity-50 cursor-default'
              : 'hover-button-alt border-accent-200'}"
            style="width: 40px; height: 40px;"
            disabled={currentPage === totalPages || isLoading}
            onclick={() => handlePageChange(currentPage + 1)}
            aria-label="Next page"
          >
            <i
              class="bi bi-chevron-right {currentPage === totalPages
                ? 'text-muted'
                : ''}"
            ></i>
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .border-dashed {
    border-style: dashed !important;
  }
</style>
