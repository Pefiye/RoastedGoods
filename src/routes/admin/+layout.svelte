<script>
  import { page } from "$app/state";
  import { supabase } from "$lib/supabase.js";
  import { goto, invalidateAll } from "$app/navigation";
  import { onMount, onDestroy } from "svelte";

  let { children } = $props();
  let isSidebarOpen = $state(true);

  const links = [
    { href: "/admin", icon: "bi-grid-1x2", label: "Dashboard" },
    { href: "/admin/products", icon: "bi-cup-hot", label: "Products" },
    { href: "/admin/accounts", icon: "bi-people", label: "Accounts" },
  ];

  let ordersChannel;

  onMount(async () => {
    console.log('Subscribing to admin-orders realtime...');
    await supabase.auth.getSession(); // Ensure auth is initialized

    ordersChannel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Admin Realtime payload received:', payload);
          invalidateAll();
        }
      )
      .subscribe((status) => {
        console.log('Admin Realtime subscription status:', status);
      });
  });

  onDestroy(() => {
    if (ordersChannel) {
      supabase.removeChannel(ordersChannel);
    }
  });

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    goto("/auth/login");
  }
</script>

<div
  class="d-flex d-lg-none flex-column justify-content-center align-items-center bg-secondary h-100dvh w-100 p-5 text-center position-fixed top-0 start-0 z-3"
>
  <div
    class="bg-white p-5 rounded-4 b-shadow-s border border-accent-200 d-flex flex-column align-items-center"
  >
    <i class="bi bi-display text-accent-500 mb-4" style="font-size: 4rem;"></i>
    <h2 class="fsc-5 fw-black text-dark mb-3">Desktop Required</h2>
    <p class="fsc-3 text-muted mb-0">Please open this page on a desktop.</p>
  </div>
</div>

<div class="d-none d-lg-flex bg-secondary h-100dvh w-100 overflow-hidden">
  <!-- Sidebar -->
  <div
    class="bg-white b-shadow-e d-flex flex-column transition-all"
    style="width: {isSidebarOpen ? '250px' : '80px'}; min-width: {isSidebarOpen
      ? '250px'
      : '80px'}; z-index: 10;"
  >
    <div
      class="p-4 d-flex align-items-center justify-content-between border-bottom border-accent-200"
    >
      {#if isSidebarOpen}
        <span class="fsc-4 fw-black text-dark text-bright text-nowrap"
          >RoastedGoods</span
        >
      {/if}
      <button
        class="hover-button rounded-circle p-2 d-flex justify-content-center align-items-center"
        onclick={toggleSidebar}
        style="width: 40px; height: 40px; flex-shrink: 0;"
        aria-label="Toggle sidebar"
      >
        <i class="bi bi-list fsc-4"></i>
      </button>
    </div>

    <div
      class="d-flex flex-column gap-2 p-3 flex-grow-1 overflow-y-auto hide-scrollbar"
    >
      {#each links as link}
        <a
          href={link.href}
          class="d-flex align-items-center gap-3 p-3 rounded-3 text-decoration-none transition-all {page
            .url.pathname === link.href ||
          (page.url.pathname.startsWith(link.href) && link.href !== '/admin')
            ? 'bg-accent-500 text-white'
            : 'hover-button'}"
        >
          <i
            class="bi {link.icon} fsc-3 {page.url.pathname === link.href ||
            (page.url.pathname.startsWith(link.href) && link.href !== '/admin')
              ? 'text-white'
              : ''}"
          ></i>
          {#if isSidebarOpen}
            <span
              class="fsc-3 fw-bold text-nowrap {page.url.pathname ===
                link.href ||
              (page.url.pathname.startsWith(link.href) &&
                link.href !== '/admin')
                ? 'text-white'
                : ''}">{link.label}</span
            >
          {/if}
        </a>
      {/each}
    </div>

    <div class="p-4 border-top border-accent-200">
      <button
        onclick={handleLogout}
        class="d-flex align-items-center gap-3 p-3 rounded-3 border-0 justify-content-center transition-all text-white bg-danger w-100 hover-button-danger"
      >
        <i class="bi bi-box-arrow-left text-white fsc-3"></i>
        {#if isSidebarOpen}
          <span class="fsc-3 fw-bold text-nowrap">Logout</span>
        {/if}
      </button>
    </div>
  </div>

  <!-- Main Content -->
  <div
    class="flex-grow-1 d-flex flex-column overflow-y-auto bg-secondary custom-scrollbar"
  >
    <div class="p-4 p-md-5 w-100">
      {@render children()}
    </div>
  </div>
</div>

<style>
  .transition-all {
    transition: all 0.3s ease;
  }
</style>
