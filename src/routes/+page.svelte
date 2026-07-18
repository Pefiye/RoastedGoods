<script>
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<Navbar />

<div class="h-100dvh w-100 d-flex bg-accent-150">
  <div class="d-flex w-100 h-100 align-items-center justify-content-center">
    <div class="d-flex align-items-center justify-content-center w-100 flex-column">
      <p class="fw-bolder fsc-6 fsc-sm-6 mb-6 text-accent-500">Welcome To Your Canvas</p>
      <p class="text-black-300 fw-light fsc-2 fsc-md-2 text-center w-90">This project is now set up with Metronic and SvelteKit. Start building your application today.</p>
    </div>
  </div>
</div>

<Footer />
