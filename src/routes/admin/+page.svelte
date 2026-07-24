<script>
  let { data } = $props();

  function formatIDR(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  }
</script>

<div class="d-flex flex-column gap-4 animation-pageIn">
  <h1 class="fsc-5 fw-black text-dark mb-2">Dashboard</h1>

  <div class="row g-4">
    <div class="col-12 col-md-6">
      <div
        class="bg-white p-4 rounded-4 b-shadow-s border border-accent-200 hover-lift h-100 d-flex flex-column justify-content-center"
      >
        <span class="fsc-3 fw-bold text-muted mb-2"
          ><i class="bi bi-graph-up text-accent-500 me-2"></i> Today's Sales</span
        >
        <span class="fsc-6 fw-black text-dark"
          >{formatIDR(data.todaySales)}</span
        >
      </div>
    </div>
    <div class="col-12 col-md-6">
      <div
        class="bg-white p-4 rounded-4 b-shadow-s border border-accent-200 hover-lift h-100 d-flex flex-column justify-content-center"
      >
        <span class="fsc-3 fw-bold text-muted mb-2"
          ><i class="bi bi-receipt text-accent-500 me-2"></i> Orders Today</span
        >
        <span class="fsc-6 fw-black text-dark"
          >{data.todayOrders}
          <span class="fsc-3 text-muted fw-normal">Orders</span></span
        >
      </div>
    </div>
  </div>

  <div class="row g-4 mt-2">

    <div class="col-12 col-xl-7">
      <div
        class="bg-white p-4 p-md-5 rounded-4 b-shadow-s border border-accent-200 h-100"
      >
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="fsc-4 fw-bold text-dark m-0">Recent Active Orders</h2>
        </div>

        {#if data.activeOrders.length === 0}
          <div
            class="text-center p-5 bg-secondary rounded-4 border border-accent-200 border-dashed mt-3"
          >
            <p class="fsc-3 text-muted m-0">No active orders right now.</p>
          </div>
        {:else}
          <div class="d-flex flex-column gap-3">
            {#each data.activeOrders as order}
              <div
                class="p-3 rounded-3 border border-accent-200 d-flex justify-content-between align-items-center bg-secondary"
              >
                <div>
                  <span class="fsc-3 fw-bold text-dark d-block"
                    >{order.profiles?.username || "Unknown"}</span
                  >
                  <span class="fsc-2 text-muted"
                    >{new Date(order.created_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}</span
                  >
                </div>
                <div>
                  <span
                    class="badge {order.status === 'paid'
                      ? 'bg-accent-150 text-accent-500'
                      : 'bg-accent-500 text-white'} rounded-pill px-3 py-2 fsc-2 fw-bold text-uppercase"
                    >{order.status}</span
                  >
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="col-12 col-xl-5">
      <div
        class="bg-white p-4 p-md-5 rounded-4 b-shadow-s border border-accent-200 h-100"
      >
        <h2 class="fsc-4 fw-bold text-dark mb-4">Popular Drinks</h2>

        {#if data.popularDrinks.length === 0}
          <div
            class="text-center p-5 bg-secondary rounded-4 border border-accent-200 border-dashed mt-3"
          >
            <p class="fsc-3 text-muted m-0">Not enough data.</p>
          </div>
        {:else}
          <div class="d-flex flex-column gap-3">
            {#each data.popularDrinks as drink, i}
              <div
                class="d-flex align-items-center gap-3 p-2 border-bottom border-accent-200 last-border-none"
              >
                <span
                  class="fsc-4 fw-black text-accent-300"
                  style="width: 24px;">{i + 1}</span
                >
                {#if drink.image_url}
                  <img
                    src={drink.image_url}
                    alt={drink.name}
                    class="rounded-circle object-fit-cover"
                    style="width: 48px; height: 48px;"
                  />
                {:else}
                  <div
                    class="bg-secondary rounded-circle d-flex justify-content-center align-items-center"
                    style="width: 48px; height: 48px;"
                  >
                    <i class="bi bi-cup text-muted"></i>
                  </div>
                {/if}
                <div class="d-flex flex-column flex-grow-1">
                  <span class="fsc-3 fw-bold text-dark">{drink.name}</span>
                  <span class="fsc-2 text-muted">{drink.count} ordered</span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .border-dashed {
    border-style: dashed !important;
  }
  .last-border-none:last-child {
    border-bottom: none !important;
  }
</style>
