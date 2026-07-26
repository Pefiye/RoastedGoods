<script>
  import { supabase } from "$lib/supabase.js";
  import { goto, invalidateAll } from "$app/navigation";
  import { page } from "$app/state";
  import { currency, exchangeRate } from "$lib/stores/currency.js";

  let navMenu = $state(false);
  let profileModal = $state(false);
  let currencyMenu = $state(false);

  function navToggle() {
    navMenu = !navMenu;
  }
  function toggleProfileModal() {
    profileModal = !profileModal;
    if (profileModal) navMenu = false;
  }

  async function handleSignOut() {
    profileModal = false;
    await supabase.auth.signOut();
    await invalidateAll();
    goto("/");
  }

  const profile = $derived(page.data?.profile);
  const session = $derived(page.data?.session);
</script>

<div
  class="d-flex w-100 h-90px px-5 ps-sm-5 px-md-5 bg-accent-150 align-items-center justify-content-between b-shadow-s position-fixed top-0"
  style="z-index: 1030;"
>
  <div
    class="d-flex h-100 w-100 align-items-center justify-content-between gap-5"
  >
    <a href="/" class="text-bright fsc-6 fsc-sm-6 mt-3 fw-black text-accent-500"
      >RoastedGoods</a
    >

    <div
      class="{navMenu
        ? 'd-flex animation-fadeIn'
        : 'd-none animation-fadeOut'} align-items-start align-items-md-center d-md-flex flex-column flex-md-row w-100 h-100 bg-accent-150 left-0 top-0 justify-content-md-between position-fixed position-md-static"
    >
      <div
        class="h-90px w-100 d-flex d-md-none align-items-center b-shadow-s flex-shrink-0 justify-content-between px-5"
      >
        <a href="/" class="text-bright fsc-6 fsc-sm-4 fw-black text-accent-500"
          >RoastedGoods</a
        >

        <button
          onclick={navToggle}
          class="h-50 ratio-1"
          title="Close Menu Button"
        >
          <i class="bi bi-x text-black fsc-6"></i>
        </button>
      </div>

      <div class="d-flex flex-column flex-md-row px-6 gap-5 py-7 py-md-0">
        <a
          href="/menu"
          class="fsc-5 fsc-sm-3 fsc-md-2 fw-bold mt-2 text-accent-500">Menu</a
        >
        <a
          href="/about"
          class="fsc-5 fsc-sm-3 fsc-md-2 fw-bold mt-2 text-accent-500">About</a
        >
      </div>

      <span class="h-100"></span>

      {#if !session}
        <div
          class="d-flex h-auto h-md-100 align-items-center gap-3 p-5 justify-content-end w-100 w-md-auto"
        >
          <div class="position-relative">
            <button
              onclick={() => (currencyMenu = !currencyMenu)}
              class="fsc-2 px-4 py-2 fw-bold rounded-pill border border-2 border-accent-500 hover-button text-nowrap d-flex align-items-center gap-2"
              title="Select Currency"
            >
              {$currency} <i class="bi bi-chevron-down"></i>
            </button>

            {#if currencyMenu}
              <div
                class="position-absolute bg-white rounded-3 b-shadow-s border border-accent-500 mt-2 py-2 d-flex flex-column animation-slideUp"
                style="top: 100%; right: 0; min-width: 130px; z-index: 1040;"
              >
                <button
                  onclick={() => {
                    $currency = "IDR";
                    currencyMenu = false;
                  }}
                  class="curr-item w-100 text-start px-4 py-2 border-0 d-flex align-items-center rounded-0 {$currency ===
                  'IDR'
                    ? 'fw-black text-accent-500'
                    : 'fw-medium text-accent-500'}"
                >
                  <i
                    class="bi bi-check2 {$currency === 'IDR'
                      ? 'opacity-100'
                      : 'opacity-0'} me-2"
                  ></i> IDR (Rp)
                </button>
                <button
                  onclick={() => {
                    $currency = "USD";
                    currencyMenu = false;
                  }}
                  class="curr-item w-100 text-start px-4 py-2 border-0 d-flex align-items-center rounded-0 {$currency ===
                  'USD'
                    ? 'fw-black text-accent-500'
                    : 'fw-medium text-accent-500'}"
                >
                  <i
                    class="bi bi-check2 {$currency === 'USD'
                      ? 'opacity-100'
                      : 'opacity-0'} me-2"
                  ></i> USD ($)
                </button>
              </div>
            {/if}
          </div>
          <a
            href="/auth/login"
            class="fsc-3 fsc-sm-2 fsc-md-2 px-5 py-2 fw-bold rounded-pill border border-2 border-accent-500 text-nowrap hover-button"
            >SIGN IN</a
          >
          <a
            href="/auth/register"
            class="fsc-3 fsc-sm-2 fsc-md-2 px-5 py-2 fw-bold rounded-pill text-nowrap border border-2 border-accent-500 hover-button-alt"
            >JOIN US</a
          >
        </div>
      {:else}
        <div
          class="d-flex h-auto h-md-100 align-items-center gap-3 p-5 justify-content-end w-100 w-md-auto"
        >
          <a
            href="/cart"
            class="p-3 fw-bold rounded-circle text-nowrap ratio-1 hover-button"
            title="Cart Button"
            ><i
              class="bi bi-basket2-fill h-100 w-100 d-flex align-items-center justify-content-center fsc-5 fsc-sm-3"
            ></i></a
          >
          <div class="position-relative">
            <button
              onclick={() => (currencyMenu = !currencyMenu)}
              class="fsc-2 px-4 py-2 fw-bold rounded-pill border border-2 border-accent-500 hover-button text-nowrap d-flex align-items-center gap-2"
              title="Select Currency"
            >
              {$currency} <i class="bi bi-chevron-down"></i>
            </button>

            {#if currencyMenu}
              <div
                class="position-absolute bg-white rounded-3 b-shadow-s border border-accent-200 mt-2 py-2 d-flex flex-column animation-slideUp"
                style="top: 100%; right: 0; min-width: 130px; z-index: 1040;"
              >
                <button
                  onclick={() => {
                    $currency = "IDR";
                    currencyMenu = false;
                  }}
                  class="curr-item w-100 text-start px-4 py-2 border-0 d-flex align-items-center rounded-0 {$currency ===
                  'IDR'
                    ? 'fw-black text-accent-500'
                    : 'fw-medium text-accent-500'}"
                >
                  <i
                    class="bi bi-check2 {$currency === 'IDR'
                      ? 'opacity-100'
                      : 'opacity-0'} me-2"
                  ></i> IDR (Rp)
                </button>
                <button
                  onclick={() => {
                    $currency = "USD";
                    currencyMenu = false;
                  }}
                  class="curr-item w-100 text-start px-4 py-2 border-0 d-flex align-items-center rounded-0 {$currency ===
                  'USD'
                    ? 'fw-black text-accent-500'
                    : 'fw-medium text-accent-500'}"
                >
                  <i
                    class="bi bi-check2 {$currency === 'USD'
                      ? 'opacity-100'
                      : 'opacity-0'} me-2"
                  ></i> USD ($)
                </button>
              </div>
            {/if}
          </div>
          <button
            onclick={toggleProfileModal}
            class="fsc-3 fsc-sm-2 fsc-md-2 px-5 py-2 fw-bold rounded-pill border border-2 border-accent-500 text-nowrap hover-button"
            ><i class="bi bi-person-fill"></i>
            {profile?.username ?? "User"}</button
          >
        </div>
      {/if}
    </div>

    <button
      title="Menu Button"
      onclick={navToggle}
      class="h-50 d-flex d-md-none ratio-1 rounded-circle hover-button"
    >
      <i
        class="bi bi-list fsc-6 fsc-sm-4 h-100 w-100 d-flex align-items-center justify-content-center"
      ></i>
    </button>
  </div>
</div>

<span class="h-90px flex-shrink-0"></span>

{#if profileModal}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="pop-up d-flex align-items-center justify-content-center animation-fadeIn"
    onclick={toggleProfileModal}
    style="z-index: 1050;"
  >
    <div
      class="bg-white p-8 rounded-4 b-shadow-s border border-accent-200 d-flex flex-column align-items-center animation-slideUp"
      onclick={(e) => e.stopPropagation()}
      style="max-width: 350px; width: 90%;"
    >
      <div class="w-100 d-flex justify-content-end mb-2">
        <button
          onclick={toggleProfileModal}
          class="text-muted hover-button border-0 p-0 ratio-1 rounded-circle"
          title="Close"
          ><i class="bi bi-x fsc-9 fsc-sm-6 fsc-md-4 ratio-1"></i></button
        >
      </div>
      <div
        class="rounded-circle bg-accent-150 d-flex justify-content-center align-items-center mb-4"
        style="width: 80px; height: 80px;"
      >
        <i class="bi bi-person-fill fsc-6 text-accent-500"></i>
      </div>
      <h3 class="fsc-5 fw-bold text-accent-500 mb-1">
        {profile?.username ?? "User"}
      </h3>
      <p class="fsc-3 text-muted mb-6">
        {profile?.email ?? session?.user?.email ?? ""}
      </p>

      <div class="w-100 d-flex flex-column gap-3">
        <a
          href="/profile"
          onclick={() => (profileModal = false)}
          class="w-100 py-3 fw-bold rounded-pill hover-button fsc-3 fsc-md-2 border border-2 border-accent-500 d-flex justify-content-center align-items-center gap-2 text-decoration-none"
        >
          <i class="bi bi-person-gear"></i> Profile
        </a>

        <button
          onclick={handleSignOut}
          class="w-100 py-3 fw-bold rounded-pill hover-button-alt fsc-3 fsc-md-2 border border-2 border-accent-500 d-flex justify-content-center align-items-center gap-2"
        >
          <i class="bi bi-box-arrow-right"></i> Sign Out
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .curr-item {
    transition: all 0.2s ease;
    background: transparent;
  }
  .curr-item:hover {
    background: #f1f5f9;
  }
</style>
