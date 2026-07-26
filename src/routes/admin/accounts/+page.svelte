<script>
  import { enhance } from "$app/forms";

  let { data, form } = $props();

  let searchQuery = $state("");
  let currentPage = $state(1);
  const itemsPerPage = 8;

  $effect(() => {
    if (searchQuery !== undefined) {
      currentPage = 1;
    }
  });

  const filteredProfiles = $derived(
    data.profiles.filter(
      (p) =>
        p.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  const totalPages = $derived(
    Math.ceil(filteredProfiles.length / itemsPerPage) || 1,
  );
  const paginatedProfiles = $derived(
    filteredProfiles.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    ),
  );

  let isCreateModalOpen = $state(false);
  let isSubmitting = $state(false);
  let openDropdownId = $state(null);
  let createRoleMenuOpen = $state(false);
  let createRole = $state("cashier");
</script>

<div class="d-flex flex-column gap-4 animation-pageIn">
  <div class="d-flex justify-content-between align-items-center">
    <h1 class="fsc-5 fw-black text-accent-500 m-0">Accounts</h1>
    <button
      onclick={() => (isCreateModalOpen = true)}
      class="px-5 py-2 fsc-3 fw-bold rounded-pill border border-2 border-accent-500 text-nowrap hover-button-alt d-flex align-items-center gap-2"
    >
      <i class="bi bi-person-plus-fill"></i> Add Account
    </button>
  </div>

  {#if form?.error}
    <div class="alert alert-danger fsc-3 fw-bold rounded-4 border-0 b-shadow-s">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {form.error}
    </div>
  {/if}

  <div
    class="bg-white p-4 p-md-5 rounded-4 b-shadow-s border border-accent-200"
  >
    <div class="d-flex justify-content-between align-items-center mb-5">
      <div class="position-relative w-100" style="max-width: 400px;">
        <i
          class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-muted"
        ></i>
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search by username or email..."
          class="w-100 py-3 ps-9 pe-4 rounded-pill border border-2 border-accent-200 outline-0 fsc-3 transition-all"
          style="padding-left: 3rem;"
          onfocus={(e) =>
            (e.target.style.borderColor = "var(--color-accent-500)")}
          onblur={(e) => (e.target.style.borderColor = "")}
        />
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-borderless align-middle m-0">
        <thead>
          <tr class="border-bottom border-accent-200">
            <th class="fsc-3 fw-bold text-muted py-3 px-4">User</th>
            <th class="fsc-3 fw-bold text-muted py-3 px-4">Email</th>
            <th class="fsc-3 fw-bold text-muted py-3 px-4 text-center">Role</th>
            <th class="fsc-3 fw-bold text-muted py-3 px-4 text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#if paginatedProfiles.length === 0}
            <tr>
              <td colspan="4" class="text-center py-5">
                <i
                  class="bi bi-people text-muted opacity-25 d-block mb-3"
                  style="font-size: 3rem;"
                ></i>
                <span class="fsc-3 text-muted">No accounts found.</span>
              </td>
            </tr>
          {:else}
            {#each paginatedProfiles as profile}
              <tr
                class="border-bottom border-accent-200"
                style="transition: all 0.2s;"
              >
                <td class="py-4 px-4">
                  <div class="d-flex align-items-center gap-3">
                    <div
                      class="bg-secondary rounded-circle d-flex justify-content-center align-items-center"
                      style="width: 40px; height: 40px;"
                    >
                      <i class="bi bi-person-fill text-muted fsc-4"></i>
                    </div>
                    <span class="fsc-3 fw-bold text-accent-500"
                      >{profile.username}</span
                    >
                  </div>
                </td>
                <td class="py-4 px-4">
                  <span class="fsc-3 text-muted">{profile.email}</span>
                </td>
                <td class="py-4 px-4 text-center">
                  {#if profile.role === "admin"}
                    <span
                      class="badge bg-accent-500 text-white rounded-pill px-3 py-1 fsc-2 fw-bold"
                      >Admin</span
                    >
                  {:else}
                    <form
                      action="?/updateRole"
                      method="POST"
                      use:enhance={() => {
                        openDropdownId = null;
                        return async ({ update }) => {
                          await update();
                        };
                      }}
                      class="position-relative mx-auto"
                      style="min-width: 120px; width: fit-content;"
                    >
                      <input type="hidden" name="id" value={profile.id} />
                      <button
                        type="button"
                        onclick={() =>
                          (openDropdownId =
                            openDropdownId === profile.id ? null : profile.id)}
                        class="w-100 px-4 py-2 fsc-2 fw-bold rounded-pill border border-2 border-accent-500 hover-button d-flex align-items-center justify-content-between gap-2"
                      >
                        {profile.role === "cashier" ? "Cashier" : "User"}
                        <i class="bi bi-chevron-down"></i>
                      </button>

                      {#if openDropdownId === profile.id}
                        <div
                          class="position-absolute bg-white rounded-3 b-shadow-s border border-accent-500 mt-2 py-2 d-flex flex-column animation-slideUp w-100"
                          style="top: 100%; left: 0; z-index: 1040;"
                        >
                          <button
                            name="role"
                            value="user"
                            type="submit"
                            class="curr-item w-100 text-start px-4 py-2 border-0 d-flex align-items-center rounded-0 {profile.role ===
                            'user'
                              ? 'fw-black text-accent-500'
                              : 'fw-medium text-accent-500'}"
                            >User</button
                          >
                          <button
                            name="role"
                            value="cashier"
                            type="submit"
                            class="curr-item w-100 text-start px-4 py-2 border-0 d-flex align-items-center rounded-0 {profile.role ===
                            'cashier'
                              ? 'fw-black text-accent-500'
                              : 'fw-medium text-accent-500'}"
                            >Cashier</button
                          >
                        </div>
                      {/if}
                    </form>
                  {/if}
                </td>
                <td class="py-4 px-4 text-end">
                  {#if profile.role !== "admin"}
                    <form
                      action="?/delete"
                      method="POST"
                      use:enhance
                      onsubmit={(e) =>
                        !confirm(
                          "Are you sure you want to delete this account?",
                        ) && e.preventDefault()}
                    >
                      <input type="hidden" name="id" value={profile.id} />
                      <button
                        class="btn hover-button-danger rounded-circle p-2"
                        title="Delete Account"
                        style="width: 34px;"
                        aria-label="Delete {profile.username}'s account"
                      >
                        <i class="bi bi-trash3-fill ratio-1"></i>
                      </button>
                    </form>
                  {/if}
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    {#if totalPages > 1}
      <div class="d-flex justify-content-center align-items-center mt-6 gap-4">
        <button
          class="btn border border-2 rounded-circle d-flex justify-content-center align-items-center p-0 flex-shrink-0 transition-all {currentPage ===
          1
            ? 'border-accent-200 bg-accent-100 opacity-50 cursor-default'
            : 'hover-button-alt border-accent-200'}"
          style="width: 40px; height: 40px;"
          disabled={currentPage === 1}
          onclick={() => (currentPage -= 1)}
          aria-label="Previous page"
        >
          <i class="bi bi-chevron-left {currentPage === 1 ? 'text-muted' : ''}"
          ></i>
        </button>

        <span class="fsc-3 fw-bold text-accent-500">
          Page {currentPage} of {totalPages}
        </span>

        <button
          class="btn border border-2 rounded-circle d-flex justify-content-center align-items-center p-0 flex-shrink-0 transition-all {currentPage ===
          totalPages
            ? 'border-accent-200 bg-accent-100 opacity-50 cursor-default'
            : 'hover-button-alt border-accent-200'}"
          style="width: 40px; height: 40px;"
          disabled={currentPage === totalPages}
          onclick={() => (currentPage += 1)}
          aria-label="Next page"
        >
          <i
            class="bi bi-chevron-right {currentPage === totalPages
              ? 'text-muted'
              : ''}"
          ></i>
        </button>
      </div>
    {/if}
  </div>
</div>

{#if isCreateModalOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="pop-up d-flex align-items-center justify-content-center animation-fadeIn"
    onclick={() => (isCreateModalOpen = false)}
  >
    <div
      class="bg-white p-6 p-md-8 rounded-4 b-shadow-s border border-accent-200 d-flex flex-column animation-slideUp"
      style="max-width: 500px; width: 90%;"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="d-flex justify-content-between align-items-center mb-6">
        <h3 class="fsc-4 fw-black text-accent-500 m-0">Create Account</h3>
        <button
          onclick={() => (isCreateModalOpen = false)}
          class="btn hover-button rounded-circle p-2 d-flex justify-content-center align-items-center"
          style="width: 40px; height: 40px;"
        >
          <i class="bi bi-x-lg fsc-4"></i>
        </button>
      </div>

      <form
        action="?/create"
        method="POST"
        use:enhance={() => {
          isSubmitting = true;
          return async ({ update }) => {
            await update();
            isSubmitting = false;
            isCreateModalOpen = false;
          };
        }}
        class="d-flex flex-column gap-4"
      >
        <div class="d-flex flex-column gap-2">
          <label for="email" class="fsc-3 fw-bold text-accent-500"
            >Email Address</label
          >
          <input
            type="email"
            id="email"
            name="email"
            required
            class="w-100 py-3 px-4 rounded-3 border border-2 border-accent-200 outline-0 fsc-3 bg-secondary transition-all"
            onfocus={(e) =>
              (e.target.style.borderColor = "var(--color-accent-500)")}
            onblur={(e) => (e.target.style.borderColor = "")}
            placeholder="user@example.com"
          />
        </div>

        <div class="d-flex flex-column gap-2">
          <label for="password" class="fsc-3 fw-bold text-accent-500">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            class="w-100 py-3 px-4 rounded-3 border border-2 border-accent-200 outline-0 fsc-3 bg-secondary transition-all"
            onfocus={(e) =>
              (e.target.style.borderColor = "var(--color-accent-500)")}
            onblur={(e) => (e.target.style.borderColor = "")}
            placeholder="Min. 6 characters"
          />
        </div>

        <div class="d-flex flex-column gap-2">
          <label for="username" class="fsc-3 fw-bold text-accent-500">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            required
            class="w-100 py-3 px-4 rounded-3 border border-2 border-accent-200 outline-0 fsc-3 bg-secondary transition-all"
            onfocus={(e) =>
              (e.target.style.borderColor = "var(--color-accent-500)")}
            onblur={(e) => (e.target.style.borderColor = "")}
            placeholder="Display name"
          />
        </div>

        <div class="d-flex flex-column gap-2 position-relative">
          <label class="fsc-3 fw-bold text-accent-500">Role</label>
          <input type="hidden" name="role" value={createRole} />

          <button
            type="button"
            onclick={() => (createRoleMenuOpen = !createRoleMenuOpen)}
            class="w-100 px-4 py-3 fsc-3 fw-bold rounded-pill border border-2 border-accent-500 hover-button d-flex align-items-center justify-content-between gap-2"
          >
            {createRole === "cashier" ? "Cashier" : "User"}
            <i class="bi bi-chevron-down"></i>
          </button>

          {#if createRoleMenuOpen}
            <div
              class="position-absolute bg-white rounded-3 b-shadow-s border border-accent-500 mt-2 py-2 d-flex flex-column animation-slideUp w-100"
              style="top: 100%; left: 0; z-index: 1040;"
            >
              <button
                type="button"
                onclick={() => {
                  createRole = "cashier";
                  createRoleMenuOpen = false;
                }}
                class="curr-item w-100 text-start px-4 py-2 border-0 d-flex align-items-center rounded-0 {createRole ===
                'cashier'
                  ? 'fw-black text-accent-500'
                  : 'fw-medium text-accent-500'}">Cashier</button
              >
              <button
                type="button"
                onclick={() => {
                  createRole = "user";
                  createRoleMenuOpen = false;
                }}
                class="curr-item w-100 text-start px-4 py-2 border-0 d-flex align-items-center rounded-0 {createRole ===
                'user'
                  ? 'fw-black text-accent-500'
                  : 'fw-medium text-accent-500'}">User</button
              >
            </div>
          {/if}
        </div>

        <div class="d-flex justify-content-end gap-3 mt-4">
          <button
            type="button"
            class="px-5 py-2 fsc-3 fw-bold rounded-pill border border-2 border-accent-500 text-nowrap hover-button"
            onclick={() => (isCreateModalOpen = false)}
            disabled={isSubmitting}>Cancel</button
          >
          <button
            type="submit"
            class="px-5 py-2 fsc-3 fw-bold rounded-pill border border-2 border-accent-500 text-nowrap hover-button-alt d-flex align-items-center gap-2"
            disabled={isSubmitting}
          >
            {#if isSubmitting}
              <div class="spinner-border spinner-border-sm" role="status"></div>
            {/if}
            Create Account
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .z-index-2 {
    z-index: 2;
  }
</style>
