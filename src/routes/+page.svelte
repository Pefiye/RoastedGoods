<script>
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
</script>

<Navbar />

<div class="h-100dvh w-100 d-flex bg-accent-150">
  <div class="d-flex w-100 h-100 align-items-center justify-content-center">
    <div
      class="d-flex align-items-center justify-content-center w-100 flex-column gap-0"
      style="line-height: 1.1;"
    >
      <p
        class="fw-bold fsc-3 fsc-md-4 mb-0 animation-fadeInLong text-center text-accent-500"
      >
        It's a great day for some
      </p>
      <p class="text-bright animation-slideDown fw-black fsc-9">RoastedGoods</p>
      <a
        href="/menu"
        class="fsc-3 fsc-sm-2 fsc-md-3 px-7 py-3 mt-10 fw-bold rounded-pill border border-2 animation-slideUp border-accent-500 text-nowrap hover-button"
        >Get Your Day Started <i
          class="fsc-3 fsc-sm-2 fsc-md-3 bi bi-caret-right-fill"
        ></i></a
      >
    </div>
  </div>
</div>

<Footer />
