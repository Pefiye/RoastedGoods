<script>
  let { data } = $props();
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  let searchQuery = $state("");
  let currentPage = $state(1);
  const itemsPerPage = 8;

  let sortMenuOpen = $state(false);

  const sortOptions = [
    { value: 'name-asc', label: 'A to Z' },
    { value: 'name-desc', label: 'Z to A' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'least-popular', label: 'Least Popular' }
  ];

  const currentSortLabel = $derived(sortOptions.find(o => o.value === data.sort)?.label || 'A to Z');

  let allProducts = $state([]);
  let isLoading = $state(true);
  let error = $state(null);

  $effect(() => {
    data.streamed.products
      .then((res) => {
        allProducts = res;
        isLoading = false;
      })
      .catch((err) => {
        error = err;
        isLoading = false;
      });
  });

  $effect(() => {
    if (searchQuery !== undefined) {
      currentPage = 1;
    }
  });

  const filteredProducts = $derived(
    allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = $derived(Math.ceil(filteredProducts.length / itemsPerPage) || 1);
  const paginatedProducts = $derived(
    filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  );

  function handleSortChange(e) {
    const sort = e.target.value;
    const url = new URL($page.url);
    url.searchParams.set('sort', sort);
    goto(url.toString(), { keepFocus: true });
  }

  function formatIDR(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  }
</script>

<div class="d-flex flex-column gap-4 animation-pageIn">
  <div class="d-flex justify-content-between align-items-center">
    <h1 class="fsc-5 fw-black text-accent-500 m-0">Products</h1>
    <a href="/admin/products/new" class="px-5 py-2 fsc-3 fw-bold rounded-pill border border-2 border-accent-500 text-nowrap hover-button-alt d-flex align-items-center gap-2 text-decoration-none">
      <i class="bi bi-plus-lg"></i> Add Product
    </a>
  </div>

  <div class="bg-white p-4 p-md-5 rounded-4 b-shadow-s border border-accent-200">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 mb-5">

      <div class="position-relative w-100" style="max-width: 400px;">
        <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-muted"></i>
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search products..."
          class="w-100 py-3 ps-9 pe-4 rounded-pill border border-2 border-accent-200 outline-0 fsc-3 transition-all"
          style="padding-left: 3rem;"
          onfocus={(e) => (e.target.style.borderColor = "var(--color-accent-500)")}
          onblur={(e) => (e.target.style.borderColor = "")}
        />
      </div>

      <div class="d-flex align-items-center gap-3">
        <label class="fsc-3 fw-bold text-muted text-nowrap">Sort by:</label>
        <div class="position-relative">
          <button 
            onclick={() => (sortMenuOpen = !sortMenuOpen)}
            class="px-4 py-2 fsc-3 fw-bold rounded-pill border border-2 border-accent-500 hover-button text-nowrap d-flex align-items-center justify-content-between gap-3"
            style="min-width: 150px;"
          >
            {currentSortLabel} <i class="bi bi-chevron-down"></i>
          </button>

          {#if sortMenuOpen}
            <div 
              class="position-absolute bg-white rounded-3 b-shadow-s border border-accent-500 mt-2 py-2 d-flex flex-column animation-slideUp w-100" 
              style="top: 100%; right: 0; z-index: 1040;"
            >
              {#each sortOptions as option}
                <button 
                  onclick={() => handleSortChange({ target: { value: option.value } })}
                  class="curr-item w-100 text-start px-4 py-2 border-0 d-flex align-items-center rounded-0 {data.sort === option.value ? 'fw-black text-accent-500' : 'fw-medium text-accent-500'}"
                >
                  {option.label}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>

    {#if isLoading}
      <div class="row g-4">
        {#each Array(8) as _}
          <div class="col-12 col-md-6 col-xl-3">
            <div class="bg-secondary rounded-4 border border-accent-200 p-3 h-100 d-flex flex-column gap-3 position-relative placeholder-glow">
              <div class="ratio ratio-1 rounded-3 overflow-hidden bg-accent-200 placeholder"></div>
              <div class="d-flex flex-column gap-1 flex-grow-1 mt-2">
                <span class="placeholder col-4 rounded-pill py-2 mb-1 bg-accent-200"></span>
                <span class="placeholder col-8 rounded bg-accent-200" style="height: 20px;"></span>
                <span class="placeholder col-5 rounded bg-accent-200 mt-auto" style="height: 24px;"></span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else if error}
      <div class="text-center p-5 bg-secondary rounded-4 border border-danger border-dashed">
        <i class="bi bi-exclamation-triangle text-danger opacity-50 mb-4 d-block" style="font-size: 4rem;"></i>
        <h3 class="fsc-4 fw-bold text-danger mb-2">Error Loading Products</h3>
        <p class="fsc-3 text-muted m-0">{error.message || 'Something went wrong'}</p>
      </div>
    {:else if paginatedProducts.length === 0}
      <div class="text-center p-5 bg-secondary rounded-4 border border-accent-200 border-dashed">
        <i class="bi bi-box-seam text-muted opacity-25 mb-4 d-block" style="font-size: 4rem;"></i>
        <p class="fsc-3 text-muted m-0">No products found.</p>
      </div>
    {:else}
      <div class="row g-4">
        {#each paginatedProducts as product}
          <div class="col-12 col-md-6 col-xl-3">
            <div class="bg-secondary rounded-4 border border-accent-200 p-3 h-100 d-flex flex-column gap-3 hover-lift position-relative">
              <a href="/admin/products/{product.id}" class="position-absolute top-0 start-0 w-100 h-100 text-decoration-none" style="z-index: 1;" aria-label="Edit {product.name}"></a>
              <div class="ratio ratio-1 rounded-3 overflow-hidden bg-white">
                <img src={product.image_url} alt={product.name} class="w-100 h-100 object-fit-cover" />
              </div>
              <div class="d-flex flex-column gap-1 flex-grow-1">
                <span class="badge bg-white text-accent-500 border border-accent-200 rounded-pill px-2 py-1 w-max fsc-1 fw-bold text-uppercase mb-1">{product.category}</span>
                <span class="fsc-3 fw-bold text-accent-500 lh-sm text-truncate" title={product.name}>{product.name}</span>
                <span class="fsc-4 fw-black text-accent-500 mt-auto">{formatIDR(product.base_price)}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>

      {#if totalPages > 1}
        <div class="d-flex justify-content-center align-items-center mt-5 pt-3 gap-4 border-top border-accent-200">
          <button
            class="btn border border-2 rounded-circle d-flex justify-content-center align-items-center p-0 flex-shrink-0 transition-all {currentPage === 1 ? 'border-accent-200 bg-accent-100 opacity-50 cursor-default' : 'hover-button-alt border-accent-200'}"
            style="width: 40px; height: 40px;"
            disabled={currentPage === 1}
            onclick={() => (currentPage -= 1)}
            aria-label="Previous page"
          >
            <i class="bi bi-chevron-left {currentPage === 1 ? 'text-muted' : ''}"></i>
          </button>
          <span class="fsc-3 fw-bold text-accent-500">Page {currentPage} of {totalPages}</span>
          <button
            class="btn border border-2 rounded-circle d-flex justify-content-center align-items-center p-0 flex-shrink-0 transition-all {currentPage === totalPages ? 'border-accent-200 bg-accent-100 opacity-50 cursor-default' : 'hover-button-alt border-accent-200'}"
            style="width: 40px; height: 40px;"
            disabled={currentPage === totalPages}
            onclick={() => (currentPage += 1)}
            aria-label="Next page"
          >
            <i class="bi bi-chevron-right {currentPage === totalPages ? 'text-muted' : ''}"></i>
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .border-dashed { border-style: dashed !important; }
</style>
