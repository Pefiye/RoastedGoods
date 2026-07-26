<script>
  import { supabase } from "$lib/supabase.js";
  import { goto, invalidateAll } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount, onDestroy } from "svelte";

  let { children } = $props();

  let ordersChannel;

  onMount(async () => {
    console.log('Subscribing to cashier-orders realtime...');
    await supabase.auth.getSession();

    ordersChannel = supabase
      .channel('cashier-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Cashier Realtime payload received:', payload);
          invalidateAll();
        }
      )
      .subscribe((status) => {
        console.log('Cashier Realtime subscription status:', status);
      });
  });

  onDestroy(() => {
    if (ordersChannel) {
      supabase.removeChannel(ordersChannel);
    }
  });

  async function handleLogout() {
    await supabase.auth.signOut();
    goto("/auth/login");
  }
</script>

<svelte:head>
  <title>RoastedGoods</title>
</svelte:head>

<div class="d-flex flex-column flex-grow-1 w-100 min-vh-100 bg-accent-100 text-accent-500 font-sans">

  <nav
    class="navbar bg-white border-bottom border-accent-200 sticky-top b-shadow-s z-3 py-3"
  >
    <div
      class="container-fluid px-4 px-md-6 d-flex justify-content-between align-items-center"
    >
      <div class="d-flex align-items-center gap-3">
        <a
          href="/cashier"
          class="d-flex align-items-center gap-2 text-decoration-none"
        >
          <span class="text-bright fsc-4 fw-black text-accent-500 d-inline">
            RoastedGoods
          </span>
        </a>
        <div class="vr mx-2 d-none d-md-block opacity-25"></div>
        <span
          class="fw-bold text-accent-500 px-3 py-1 bg-accent-150 rounded-pill fsc-1 text-uppercase letter-spacing-wide d-inline-block"
          >Cashier</span
        >
      </div>

      <div class="d-flex align-items-center gap-4">
        <span class="fsc-2 text-muted fw-medium d-none d-sm-block">
          Welcome, <span class="fw-bold text-accent-500"
            >{$page.data.profile?.username || "Cashier"}</span
          >
        </span>
        <button
          onclick={handleLogout}
          class="fsc-2 px-4 py-2 fw-bold rounded-pill border border-2 border-accent-500 text-accent-500 d-flex align-items-center gap-2"
          title="Sign out"
        >
          <i class="bi bi-box-arrow-right fw-bold text-accent-500 fsc-3"></i>
          <span class="d-none d-sm-inline">Sign Out</span>
        </button>
      </div>
    </div>
  </nav>

  <main
    class="flex-grow-1 p-4 p-md-6 container-fluid"
    style="max-width: 1400px;"
  >
    {@render children()}
  </main>
</div>
