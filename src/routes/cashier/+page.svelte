<script>
  import { onMount, onDestroy } from "svelte";
  import { goto, invalidateAll } from "$app/navigation";

  let { data } = $props();
  let queue = $state([]);
  let isLoading = $state(true);

  $effect(() => {
    data.streamed.queue.then((res) => {
      queue = res;
      isLoading = false;
    });
  });

  let searchQuery = $state("");

  const filteredQueue = $derived(
    queue.filter((order) => {
      const q = searchQuery.toLowerCase();
      const orderId = order.id.split("-")[0].toLowerCase();
      const username = (order.profiles?.username || "Unknown").toLowerCase();
      return orderId.includes(q) || username.includes(q);
    }),
  );

  let currentPage = $state(1);
  const itemsPerPage = 12;

  $effect(() => {
    if (searchQuery !== undefined) {
      currentPage = 1;
    }
  });

  const totalPages = $derived(
    Math.ceil(filteredQueue.length / itemsPerPage) || 1,
  );
  const paginatedQueue = $derived(
    filteredQueue.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    ),
  );

  function getStatusColor(status) {
    switch (status) {
      case "paid":
        return "text-accent-500 bg-accent-150";
      case "preparing":
        return "text-white bg-accent-500";
      default:
        return "text-muted bg-secondary";
    }
  }

  function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  let refreshInterval;
  onMount(() => {
    refreshInterval = setInterval(() => {
      invalidateAll();
    }, 30000);
  });

  onDestroy(() => {
    if (refreshInterval) clearInterval(refreshInterval);
  });
</script>

<div
  class="row g-4 animation-pageIn justify-content-center"
  style="height: calc(100dvh - 130px); min-height: 600px;"
>
  <div class="col-12 col-xl-10 d-flex flex-column h-100">
    <div
      class="bg-white p-5 rounded-4 b-shadow-s border border-accent-200 d-flex flex-column h-100"
    >
      <div
        class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-5 flex-shrink-0 gap-4"
      >
        <h2
          class="fsc-4 fw-black text-dark m-0 d-flex align-items-center gap-2"
        >
          Active Queue
          <span
            class="badge bg-accent-100 text-accent-500 border border-accent-200 rounded-pill px-3 py-2 fsc-2 fw-bold ms-2"
          >
            {filteredQueue.length} Orders
          </span>
        </h2>

        <div class="position-relative w-100" style="max-width: 400px;">
          <i
            class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-muted"
          ></i>
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search by username or order ID..."
            class="w-100 py-3 ps-9 pe-4 rounded-pill border border-2 border-accent-200 outline-0 fsc-3"
            style="transition: border-color 0.2s; padding-left: 3rem;"
            onfocus={(e) =>
              (e.target.style.borderColor = "var(--color-accent-500)")}
            onblur={(e) => (e.target.style.borderColor = "")}
          />
        </div>
      </div>

      {#if isLoading}
        <div class="d-flex flex-column gap-3 overflow-y-auto pe-2 flex-grow-1 custom-scrollbar">
          {#each Array(6) as _}
            <div class="px-4 py-3 rounded-3 border border-accent-200 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 bg-white">
              <div class="d-flex align-items-center gap-4 w-100">
                <div class="d-flex flex-column gap-2 w-50">
                  <div class="placeholder-glow"><div class="placeholder rounded bg-accent-200" style="width: 50%; height: 20px;"></div></div>
                  <div class="placeholder-glow"><div class="placeholder rounded bg-accent-200" style="width: 30%; height: 16px;"></div></div>
                </div>
              </div>
              <div class="d-flex align-items-center gap-4 w-100 w-sm-auto justify-content-between justify-content-sm-end">
                <div class="placeholder-glow w-100 text-end"><div class="placeholder rounded-pill bg-accent-200" style="width: 80px; height: 28px;"></div></div>
              </div>
            </div>
          {/each}
        </div>
      {:else if filteredQueue.length === 0}
        <div
          class="text-center p-10 bg-accent-100 rounded-4 border border-accent-200 border-dashed flex-grow-1 d-flex flex-column justify-content-center align-items-center"
        >
          <i
            class="bi bi-cup-hot text-muted opacity-25 mb-4"
            style="font-size: 5rem;"
          ></i>
          <h3 class="fsc-4 fw-bold text-dark mb-2">No orders found!</h3>
          <p class="fsc-3 text-muted m-0">
            {searchQuery
              ? "Try a different search term."
              : "No active orders in the queue right now."}
          </p>
        </div>
      {:else}
        <div
          class="d-flex flex-column gap-3 overflow-y-auto pe-2 flex-grow-1 custom-scrollbar"
        >
          {#each paginatedQueue as order (order.id)}
            <a href="/cashier/{order.id}" class="text-decoration-none">
              <div
                class="px-4 py-3 rounded-3 border border-accent-200 hover-border-accent-500 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 bg-white transition-all"
              >
                <div class="d-flex align-items-center gap-4">
                  <div class="d-flex flex-column gap-1">
                    <span
                      class="fsc-3 fw-black text-dark text-nowrap d-flex align-items-center gap-2"
                    >
                      <i class="bi bi-person-fill text-muted"></i>
                      {order.profiles?.username || "Unknown"}
                    </span>
                    <div class="d-flex align-items-center gap-3">
                      <span class="fsc-2 text-muted fw-bold text-nowrap"
                        >{order.order_details.length} Items</span
                      >
                      <span class="text-muted opacity-25">|</span>
                      <span class="fsc-2 text-muted text-nowrap"
                        ><i class="bi bi-clock me-1"></i>
                        {formatDate(order.created_at)}</span
                      >
                    </div>
                  </div>
                </div>

                <div
                  class="d-flex align-items-center gap-4 w-100 w-sm-auto justify-content-between justify-content-sm-end"
                >
                  <span
                    class="fsc-2 fw-bold px-3 py-1 rounded-pill text-uppercase {getStatusColor(
                      order.status,
                    )}"
                  >
                    {order.status}
                  </span>
                  <i
                    class="bi bi-chevron-right text-muted opacity-50 d-none d-sm-block"
                  ></i>
                </div>
              </div>
            </a>
          {/each}

          {#if totalPages > 1}
            <div
              class="d-flex justify-content-center align-items-center mt-4 mb-2 gap-4"
            >
              <button
                class="btn border border-2 rounded-circle d-flex justify-content-center align-items-center p-0 flex-shrink-0 transition-all {currentPage === 1 ? 'border-accent-200 bg-accent-100 opacity-50 cursor-default' : 'hover-button-alt border-accent-200'}"
                style="width: 40px; height: 40px;"
                disabled={currentPage === 1}
                onclick={() => (currentPage -= 1)}
              >
                <i class="bi bi-chevron-left pe-0 {currentPage === 1 ? 'text-muted' : ''}"></i>
              </button>

              <span class="fsc-3 fw-bold text-dark">
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
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .border-dashed {
    border-style: dashed !important;
  }
  .hover-border-accent-500:hover {
    border-color: var(--color-accent-500) !important;
  }
</style>
