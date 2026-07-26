<script>
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
</script>

<svelte:head>
  <title>RoastedGoods</title>
</svelte:head>

<Navbar />

<div
  class="about-container w-100 d-flex flex-column flex-grow-1 flex-shrink-0 bg-accent-100"
  style="padding-top: 100px;"
>

  <section
    class="hero-section position-relative d-flex flex-column align-items-center justify-content-center text-center py-20 px-5"
  >
    <div class="glow-orb animation-pulse"></div>
    <div
      class="glow-orb glow-orb-2 animation-pulse"
      style="animation-delay: 1.5s;"
    ></div>

    <div
      class="position-relative z-1 animation-slideDown"
      style="max-width: 800px; margin-top: 40px;"
    >
      <h1
        class="fw-black fsc-8 fsc-md-9 text-accent-500 mb-4 lh-sm"
        style="letter-spacing: -1.5px;"
      >
        Brewing <span class="text-accent-500">Passion</span> One Cup at a Time.
      </h1>
      <p
        class="fsc-3 fsc-md-4 text-muted fw-medium mt-8 mx-auto"
        style="max-width: 650px; line-height: 1.7;"
      >
        RoastedGoods started with a simple idea: great coffee brings people
        together. We're on a mission to demystify specialty coffee and share the
        world's finest roasts.
      </p>
    </div>
  </section>

  <section
    class="bento-section py-10 py-md-20 px-5 w-100 d-flex justify-content-center"
  >
    <div
      class="bento-grid animation-pageIn"
      style="max-width: 1200px; width: 100%;"
    >

      <div
        class="bento-item bg-white p-6 p-md-8 p-lg-10 rounded-5 b-shadow-s border border-accent-200 d-flex flex-column justify-content-between hover-lift item-roots position-relative overflow-hidden"
      >
        <div
          class="position-absolute top-0 end-0 opacity-10"
          style="transform: translate(20%, -20%); pointer-events: none;"
        >
          <i class="bi bi-shop fsc-12 text-accent-500"></i>
        </div>
        <div class="z-1 h-100 d-flex flex-column justify-content-center">
          <div
            class="icon-box bg-accent-150 rounded-circle d-flex align-items-center justify-content-center mb-6"
          >
            <i class="bi bi-cup-hot-fill fsc-4 text-accent-500"></i>
          </div>
          <h2 class="fw-black fsc-5 text-accent-500 mb-4">Our Roots</h2>
          <p
            class="fsc-2 text-muted"
            style="line-height: 1.7; max-width: 500px;"
          >
            Founded in a small garage with a 1kg roaster, we set out to
            demystify specialty coffee. Our mission is to source the finest
            beans globally and roast them to highlight their unique, vibrant
            characteristics.
          </p>
        </div>
      </div>

      <div
        class="bento-item bg-accent-500 p-6 p-md-8 p-lg-10 rounded-5 b-shadow-s d-flex flex-column justify-content-between hover-lift item-sourcing text-white position-relative overflow-hidden"
      >
        <div
          class="position-absolute w-100 h-100"
          style="background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%); top: 0; left: 0; pointer-events: none;"
        ></div>
        <div class="z-1 h-100 d-flex flex-column">
          <div
            class="icon-box bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center mb-6"
          >
            <i class="bi bi-globe-americas fsc-4 text-white"></i>
          </div>
          <h2 class="fw-black fsc-5 text-white mb-4">Ethical Sourcing</h2>
          <p
            class="fsc-2 text-white text-opacity-75 mb-0 flex-grow-1"
            style="line-height: 1.7;"
          >
            We work directly with farmers and cooperatives to ensure fair
            compensation and sustainable practices. Every bean tells a story of
            the soil it was grown in and the hands that nurtured it.
          </p>
          <div class="mt-8 d-flex justify-content-end gap-3">
            <i class="bi bi-tree-fill fsc-5 text-white text-opacity-50"></i>
            <i class="bi bi-droplet-fill fsc-5 text-white text-opacity-50"></i>
            <i class="bi bi-sun-fill fsc-5 text-white text-opacity-50"></i>
          </div>
        </div>
      </div>

      <div
        class="bento-item bg-white p-6 p-md-8 p-lg-10 rounded-5 b-shadow-s border border-accent-200 d-flex flex-column justify-content-between hover-lift item-roast"
      >
        <div
          class="icon-box bg-accent-150 rounded-circle d-flex align-items-center justify-content-center mb-6"
        >
          <i class="bi bi-fire fsc-4 text-accent-500 animation-pulse"></i>
        </div>
        <div>
          <h2 class="fw-black fsc-5 text-accent-500 mb-3">The Art of Roasting</h2>
          <p class="fsc-2 text-muted mb-0" style="line-height: 1.7;">
            A delicate dance of time and temperature to unlock maximum sweetness
            and perfect balance in every batch.
          </p>
        </div>
      </div>

      <div
        class="bento-item bg-dark p-6 p-md-8 p-lg-10 rounded-5 b-shadow-s d-flex flex-column justify-content-center align-items-center text-center hover-lift item-quality text-white position-relative overflow-hidden"
      >
        <div
          class="position-absolute top-0 start-0 w-100 h-100"
          style="background: radial-gradient(circle at top right, var(--color-accent-300), transparent 70%); opacity: 0.15; pointer-events: none;"
        ></div>
        <div class="z-1 d-flex flex-column align-items-center">
          <i
            class="bi bi-star-fill fsc-6 text-accent-200 mb-5 animation-pulse"
            style="animation-delay: 0.5s;"
          ></i>
          <h3 class="fw-bold fsc-5 text-white mb-2">100% Quality</h3>
          <p class="fsc-2 text-white text-opacity-75 mb-0">
            Guaranteed freshness.
          </p>
        </div>
      </div>
    </div>
  </section>
</div>

<Footer />

<style>
  .hero-section {
    min-height: 50vh;
    overflow: hidden;
  }

  .glow-orb {
    position: absolute;
    width: 600px;
    height: 600px;
    background: radial-gradient(
      circle,
      var(--color-accent-200) 0%,
      transparent 60%
    );
    opacity: 0.4;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
    pointer-events: none;
  }

  .glow-orb-2 {
    width: 400px;
    height: 400px;
    background: radial-gradient(
      circle,
      var(--color-accent-300) 0%,
      transparent 60%
    );
    opacity: 0.3;
    transform: translate(-20%, -30%);
  }

  .icon-box {
    width: 70px;
    height: 70px;
    flex-shrink: 0;
  }

  .bento-grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: 1fr;
  }

  .bento-item {
    transition:
      transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
      box-shadow 0.3s ease;
  }

  @media (min-width: 768px) {
    .bento-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: auto;
    }

    .item-roots {
      grid-column: span 2;
    }

    .item-sourcing {
      grid-column: span 1;
    }

    .item-roast {
      grid-column: span 1;
    }

    .item-quality {
      grid-column: span 2;
    }
  }

  @media (min-width: 992px) {
    .bento-grid {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 1fr 1fr;
      gap: 2rem;
    }

    .item-roots {
      grid-column: 1 / 3;
      grid-row: 1 / 2;
    }

    .item-sourcing {
      grid-column: 3 / 4;
      grid-row: 1 / 3;
    }

    .item-roast {
      grid-column: 1 / 2;
      grid-row: 2 / 3;
    }

    .item-quality {
      grid-column: 2 / 3;
      grid-row: 2 / 3;
    }
  }
</style>
