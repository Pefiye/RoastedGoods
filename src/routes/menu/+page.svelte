<script>
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { currency, exchangeRate, formatPrice } from "$lib/stores/currency.js";

  let { data } = $props();

  let allProducts = $state([]);
  let isLoading = $state(true);

  $effect(() => {
    data.streamed.products.then((res) => {
      allProducts = res;
      isLoading = false;
    });
  });

  let searchQuery = $state("");
  let filterType = $state("all");
  let currentPage = $state(1);
  const itemsPerPage = 12;

  const filteredProducts = $derived.by(() => {
    return allProducts.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterType === "coffee") return p.category === "coffee";
      if (filterType === "non-coffee") return p.category === "non-coffee";
      return true;
    });
  });

  const totalPages = $derived(
    Math.ceil(filteredProducts.length / itemsPerPage) || 1,
  );
  const paginatedProducts = $derived(
    filteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    ),
  );
</script>

<Navbar />

<div class="d-flex flex-grow-1 flex-column w-100 bg-accent-100">
  <div class="w-100 mx-auto px-10 pt-10" style="max-width: 1400px;">
    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 bg-white p-5 rounded-4 b-shadow-s border border-accent-200 mt-5"
    >
      <div class="position-relative w-100" style="max-width: 400px;">
        <i
          class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-muted"
        ></i>
        <input
          type="text"
          bind:value={searchQuery}
          oninput={() => currentPage = 1}
          placeholder="Search menu..."
          class="w-100 py-3 ps-9 pe-4 rounded-pill border border-2 border-accent-200 outline-0 fsc-3"
          style="transition: border-color 0.2s; padding-left: 3rem;"
          onfocus={(e) =>
            (e.target.style.borderColor = "var(--color-accent-500)")}
          onblur={(e) => (e.target.style.borderColor = "")}
        />
      </div>

      <div
        class="d-flex gap-3 overflow-x-auto pb-2 pb-md-0 w-100 justify-content-start justify-content-md-end custom-scrollbar"
      >
        <button
          class="btn {filterType === 'all'
            ? 'bg-accent-500 text-white border-accent-500'
            : 'bg-white text-dark border-accent-200'} hover-button-alt border border-2 rounded-pill px-4 py-2 fw-bold text-nowrap transition-all"
          onclick={() => { filterType = 'all'; currentPage = 1; }}>All</button
        >
        <button
          class="btn {filterType === 'coffee'
            ? 'bg-accent-500 text-white border-accent-500'
            : 'bg-white text-dark border-accent-200'} hover-button-alt border border-2 rounded-pill px-4 py-2 fw-bold text-nowrap transition-all"
          onclick={() => { filterType = 'coffee'; currentPage = 1; }}>Coffee</button
        >
        <button
          class="btn {filterType === 'non-coffee'
            ? 'bg-accent-500 text-white border-accent-500'
            : 'bg-white text-dark border-accent-200'} hover-button-alt border border-2 rounded-pill px-4 py-2 fw-bold text-nowrap transition-all"
          onclick={() => { filterType = 'non-coffee'; currentPage = 1; }}>Non-Coffee</button
        >
      </div>
    </div>
  </div>

  <div
    class="product-grid w-100 p-10 py-10 align-content-start stagger-children mx-auto"
    style="max-width: 1400px;"
  >
    {#if isLoading}
      {#each Array(12) as _}
        <div class="d-flex w-100 flex-column align-items-center">
          <div class="rounded-circle ratio-1 shadow-sm placeholder-glow" style="width: 140px; max-width: 100%;">
            <div class="placeholder w-100 h-100 rounded-circle bg-accent-200"></div>
          </div>
          <div class="w-100 mt-5 placeholder-glow d-flex justify-content-center">
            <div class="placeholder rounded bg-accent-200" style="width: 60%; height: 24px;"></div>
          </div>
          <div class="w-100 mt-2 placeholder-glow d-flex justify-content-center">
            <div class="placeholder rounded bg-accent-200" style="width: 40%; height: 20px;"></div>
          </div>
        </div>
      {/each}
    {:else}
      {#each paginatedProducts as product}
        <a
          href="/menu/{product.id}"
          class="d-flex w-100 flex-column align-items-center"
        >
          <img
            src={product.image_url}
            alt={product.name}
            class="rounded-circle ratio-1 hover-scale shadow-sm"
            style="object-fit: cover; width: 140px; max-width: 100%;"
          />
          <p class="w-100 fsc-3 text-center fw-medium mt-5 text-accent-500">
            {product.name}
          </p>
          <p class="w-100 fsc-2 text-center text-muted">
            {formatPrice(product.base_price, $currency, $exchangeRate)}
          </p>
        </a>
      {/each}

      {#if paginatedProducts.length === 0}
        <div
          class="d-flex flex-column align-items-center py-20 w-100"
          style="grid-column: 1 / -1;"
        >
          <i
            class="bi bi-cup-hot text-muted opacity-25 mb-4"
            style="font-size: 5rem;"
          ></i>
          <h3 class="fsc-4 fw-bold text-dark mb-2">No products found!</h3>
          <p class="fsc-3 text-muted m-0 text-center">
            {searchQuery
              ? "Try a different search term or filter."
              : "No products available yet."}
          </p>
        </div>
      {/if}
    {/if}
  </div>

  {#if totalPages > 1}
    <div
      class="d-flex justify-content-center align-items-center mt-2 mb-10 gap-4"
    >
      <button
        class="btn border border-2 rounded-circle d-flex justify-content-center align-items-center p-0 flex-shrink-0 transition-all {currentPage ===
        1
          ? 'border-accent-200 bg-accent-100 opacity-50 cursor-default'
          : 'hover-button-alt border-accent-200'}"
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
        class="btn border border-2 rounded-circle d-flex justify-content-center align-items-center p-0 flex-shrink-0 transition-all {currentPage ===
        totalPages
          ? 'border-accent-200 bg-accent-100 opacity-50 cursor-default'
          : 'hover-button-alt border-accent-200'}"
        style="width: 40px; height: 40px;"
        disabled={currentPage === totalPages}
        onclick={() => (currentPage += 1)}
      >
        <i
          class="bi bi-chevron-right pe-0 {currentPage === totalPages
            ? 'text-muted'
            : ''}"
        ></i>
      </button>
    </div>
  {/if}
</div>

<Footer />

<style>
  .product-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px 15px;
  }

  @media (min-width: 768px) {
    .product-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 40px 20px;
    }
  }

  @media (min-width: 992px) {
    .product-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
