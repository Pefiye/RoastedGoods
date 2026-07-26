<script>
  import { page } from "$app/state";
</script>

<svelte:head>
  <title>Error {page.status} | RoastedGoods</title>
</svelte:head>

<div class="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-accent-100 text-center font-sans">
  <div class="bg-white p-5 p-md-8 rounded-5 b-shadow-s border border-accent-200 d-flex flex-column align-items-center" style="max-width: 500px; width: 90%;">
    <i class="bi bi-exclamation-triangle-fill text-accent-400 mb-4" style="font-size: 4rem;"></i>
    <h1 class="text-bright fsc-6 text-accent-500 mb-2">RoastedGoods</h1>
    <h2 class="fsc-4 fw-black text-accent-500 mb-3">{page.status} Error</h2>
    <p class="fsc-2 text-muted mb-5">
      {page.error?.message || "Something went wrong on our end. We're working on it!"}
    </p>
    <a
      href="/"
      class="fsc-2 px-5 py-3 fw-bold rounded-pill text-white border-0 transition-all bg-accent-500 hover-button-accent text-decoration-none d-flex align-items-center gap-2"
    >
      <i class="bi bi-house-door-fill"></i> Back to Home
    </a>
  </div>
</div>

<style>
  .transition-all {
    transition: all 0.3s ease;
  }
</style>
