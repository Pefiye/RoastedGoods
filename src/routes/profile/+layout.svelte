<script>
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { page } from "$app/state";
  import { supabase } from "$lib/supabase.js";
  import { invalidateAll } from "$app/navigation";
  import { onMount, onDestroy } from "svelte";

  let { children } = $props();

  const isOrders = $derived(page.url.pathname.includes("/orders"));

  let ordersChannel;

  onMount(async () => {
    const userId = page.data.user?.id;
    if (userId) {
      console.log(`Subscribing to user-orders-${userId} realtime...`);
      await supabase.auth.getSession();

      ordersChannel = supabase
        .channel(`user-orders-${userId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${userId}` },
          (payload) => {
            console.log('Profile Realtime payload received:', payload);
            invalidateAll();
          }
        )
        .subscribe((status) => {
          console.log('Profile Realtime subscription status:', status);
        });
    } else {
      console.log('No user ID found, skipping profile realtime subscription.');
    }
  });

  onDestroy(() => {
    if (ordersChannel) {
      supabase.removeChannel(ordersChannel);
    }
  });
</script>

<Navbar />

<div
  class="d-flex flex-grow-1 w-100 justify-content-center py-10 py-md-20 bg-accent-100 animation-pageIn"
>
  <div
    class="w-100 px-5 px-md-10 d-flex flex-column flex-lg-row gap-8"
    style="max-width: 1200px;"
  >

    <div
      class="sidebar-nav d-flex flex-row flex-lg-column gap-3 flex-shrink-0 hide-scrollbar"
      style="overflow-x: auto;"
    >
      <a
        href="/profile"
        class="sidebar-link fsc-3 fw-bold py-3 py-md-4 rounded-4 border border-2 border-accent-200 text-decoration-none text-nowrap {!isOrders
          ? 'bg-accent-500 text-white border-accent-500'
          : 'bg-white text-accent-500'}"
      >
        <i class="bi bi-person-fill me-2"></i> My Profile
      </a>
      <a
        href="/profile/orders"
        class="sidebar-link fsc-3 fw-bold py-3 py-md-4 rounded-4 border border-2 border-accent-200 text-decoration-none text-nowrap {isOrders
          ? 'bg-accent-500 text-white border-accent-500'
          : 'bg-white text-accent-500'}"
      >
        <i class="bi bi-receipt-cutoff me-2"></i> My Orders
      </a>
    </div>

    <div class="flex-grow-1 w-100">
      {@render children()}
    </div>
  </div>
</div>

<Footer />
