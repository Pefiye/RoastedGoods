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
    class="hero-section position-relative d-flex flex-column align-items-center justify-content-center text-center py-20 px-5 overflow-hidden"
  >
    <i
      class="bi bi-cup-hot-fill position-absolute text-accent-200"
      style="font-size: 15rem; top: 5%; left: 5%; transform: rotate(-15deg); opacity: 0.15; z-index: 0; pointer-events: none;"
    ></i>
    <i
      class="bi bi-stars position-absolute text-accent-300"
      style="font-size: 8rem; top: 15%; right: 10%; transform: rotate(10deg); opacity: 0.15; z-index: 0; pointer-events: none;"
    ></i>

    <div
      class="position-relative z-1 animation-slideDown align-items-center d-flex flex-column"
      style="max-width: 800px; margin-top: 40px;"
    >
      <h1
        class="fw-black fsc-9 fsc-md-8 text-accent-500 w-md-auto mb-4 lh-sm"
        style="letter-spacing: -1.5px;"
      >
        Brewing <span class="text-accent-500">Passion</span> <br /> One Cup at a
        Time.
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
    class="about-me-section position-relative py-10 py-md-20 px-5 w-100 d-flex flex-column align-items-center overflow-hidden"
  >
    <i
      class="bi bi-shop position-absolute text-accent-300"
      style="font-size: 20rem; top: 20%; right: -5%; transform: rotate(15deg); opacity: 0.05; z-index: 0; pointer-events: none;"
    ></i>
    <i
      class="bi bi-star-fill position-absolute text-accent-200"
      style="font-size: 6rem; bottom: 15%; left: 8%; transform: rotate(-20deg); opacity: 0.15; z-index: 0; pointer-events: none;"
    ></i>

    <div
      class="animation-pageIn w-100 position-relative z-1"
      style="max-width: 1000px;"
    >
      <div
        class="d-flex flex-column flex-md-row align-items-center justify-content-center gap-10 gap-lg-16 w-100"
      >
        <div class="container-image flex-shrink-0">
          <img
            src="/images/me.webp"
            alt="Pefiye"
            class="rounded-circle object-fit-cover b-shadow-m border border-4 border-white"
            style="width: 250px; height: 250px;"
          />
        </div>

        <div
          class="container-info text-center text-md-start flex-grow-1"
          style="max-width: 600px;"
        >
          <div class="desc mb-8">
            <p class="fsc-4 fsc-md-5 fw-black text-accent-500 mb-4">
              Hi, I'm Pefiye,
            </p>
            <p
              class="fsc-2 fsc-md-3 text-muted fw-medium"
              style="line-height: 1.8;"
            >
              I am a digital product creator specializing in UI/UX design and
              Full-Stack web development, handling everything from UI design to
              backend code.
            </p>
          </div>

          <div class="socials mt-6">
            <a
              href="https://pefiye.xyz"
              target="_blank"
              class="btn bg-accent-500 text-white rounded-pill px-8 py-3 fw-bold hover-lift d-inline-flex align-items-center gap-3 text-decoration-none border-0"
            >
              Visit Portfolio
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<Footer />
