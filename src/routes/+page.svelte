<script>
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { onMount } from "svelte";

  let greeting = "It's a great day for some";
  let buttonText = "Get Your Day Started";

  onMount(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      greeting = "It's a great day for some";
      buttonText = "Start Your Morning";
    } else if (hour >= 12 && hour < 17) {
      greeting = "Perfect afternoon to fuel up with some fresh";
      buttonText = "Get Your Fix";
    } else if (hour >= 17 && hour < 21) {
      greeting = "The perfect evening to settle in with warm";
      buttonText = "Unwind With Some";
    } else {
      greeting = "It's a prime time for freshly made";
      buttonText = "Fuel Your Night";
    }
  });
</script>

<Navbar />

<div
  class="w-100 d-flex bg-accent-150 position-relative overflow-hidden"
  style="min-height: calc(100vh);"
>
  <i
    class="bi bi-cup-hot position-absolute text-accent-200"
    style="font-size: 25rem; top: -5%; left: -5%; transform: rotate(-15deg); opacity: 0.1; z-index: 0; pointer-events: none;"
  ></i>
  <i
    class="bi bi-star-fill position-absolute text-accent-300"
    style="font-size: 8rem; top: 15%; right: 10%; transform: rotate(20deg); opacity: 0.15; z-index: 0; pointer-events: none;"
  ></i>
  <i
    class="bi bi-droplet-half position-absolute text-accent-200"
    style="font-size: 15rem; bottom: -10%; right: 5%; transform: rotate(-25deg); opacity: 0.15; z-index: 0; pointer-events: none;"
  ></i>
  <i
    class="bi bi-shop position-absolute text-accent-300"
    style="font-size: 12rem; bottom: 10%; left: 10%; transform: rotate(10deg); opacity: 0.1; z-index: 0; pointer-events: none;"
  ></i>

  <div
    class="d-flex w-100 h-100 align-items-center justify-content-center position-relative z-1"
  >
    <div
      class="d-flex align-items-center justify-content-center w-100 flex-column gap-0"
      style="line-height: 1.1;"
    >
      <p
        class="fw-bold fsc-3 fsc-lg-4 mb-0 animation-fadeInLong text-center text-accent-500"
      >
        {greeting}
      </p>
      <p class="text-bright animation-slideDown text-accent-500 fw-black fsc-9">
        RoastedGoods
      </p>
      <a
        href="/menu"
        class="fsc-3 fsc-sm-2 fsc-md-3 px-7 py-3 mt-10 fw-bold rounded-pill border border-2 animation-slideUp border-accent-500 text-nowrap hover-button"
        >{buttonText}
        <i class="fsc-3 fsc-sm-2 fsc-md-3 bi bi-caret-right-fill"></i></a
      >
    </div>
  </div>
</div>

<Footer />
