<script>
  import { toasts } from '$lib/stores/toast.js';
</script>

<div class="toast-container d-flex flex-column gap-3">
  {#each $toasts as toast (toast.id)}
    <div
      class="toast-item d-flex flex-column bg-white b-shadow-s border {toast.type === 'error' ? 'border-danger' : 'border-accent-200'} rounded-2 overflow-hidden animation-slideUp"
    >
      <div class="d-flex align-items-center gap-4 px-6 py-4">
        {#if toast.icon}
          <i class="{toast.icon} {toast.type === 'error' ? 'text-danger' : 'text-accent-500'} fw-bold" style="font-size: 1.2rem;"></i>
          <span class="fsc-3 {toast.type === 'error' ? 'text-danger' : 'text-accent-500'}">{toast.text}</span>
        {:else if toast.type === 'error'}
          <i class="bi bi-exclamation-triangle-fill text-danger fw-bold" style="font-size: 1.2rem;"></i>
          <span class="fsc-3 text-danger">{toast.text}</span>
        {:else}
          <i class="bi bi-check-circle-fill text-accent-500 fw-bold" style="font-size: 1.2rem;"></i>
          <span class="fsc-3 text-accent-500">{toast.text}</span>
        {/if}
      </div>
      <div class="toast-progress {toast.type === 'error' ? 'bg-danger' : 'bg-accent-500'}" style="animation-duration: {toast.duration}ms;"></div>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    min-width: 250px;
  }

  .toast-item {
    transition: all 0.3s ease;
  }

  .toast-progress {
    height: 4px;
    width: 100%;
    animation: shrinkWidth linear forwards;
    transform-origin: left;
  }

  @keyframes shrinkWidth {
    0% { transform: scaleX(1); }
    100% { transform: scaleX(0); }
  }
</style>
