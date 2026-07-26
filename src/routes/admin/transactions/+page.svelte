<script>
  let { data } = $props();

  let searchQuery = $state("");
  let currentPage = $state(1);
  const itemsPerPage = 20;

  $effect(() => {
    if (searchQuery !== undefined) {
      currentPage = 1;
    }
  });

  const filteredTransactions = $derived(
    data.orders.filter((order) => {
      const query = searchQuery.toLowerCase();
      const idMatch = order.id.toLowerCase().includes(query);
      const nameMatch =
        order.profiles?.username?.toLowerCase().includes(query) ||
        order.profiles?.email?.toLowerCase().includes(query);
      const itemsMatch = order.order_details.some((item) =>
        item.product_name.toLowerCase().includes(query),
      );
      return idMatch || nameMatch || itemsMatch;
    }),
  );

  const totalPages = $derived(
    Math.ceil(filteredTransactions.length / itemsPerPage) || 1,
  );
  const paginatedTransactions = $derived(
    filteredTransactions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    ),
  );

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
      <div class="position-relative w-100" style="max-width: 400px;">
        <i
          class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-muted"
        ></i>
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search by ID, name, or product..."
          class="w-100 py-3 ps-9 pe-4 rounded-pill border border-2 border-accent-200 outline-0 fsc-3 transition-all"
          style="padding-left: 3rem;"
          onfocus={(e) =>
            (e.target.style.borderColor = "var(--color-accent-500)")}
          onblur={(e) => (e.target.style.borderColor = "")}
        />
      </div>
    </div>

    {#if paginatedTransactions.length === 0}
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
            {#each paginatedTransactions as transaction}
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
            disabled={currentPage === 1}
            onclick={() => (currentPage -= 1)}
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
            disabled={currentPage === totalPages}
            onclick={() => (currentPage += 1)}
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
