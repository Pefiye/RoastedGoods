<script>
  import { onMount } from 'svelte';

  let { value = 0, format = 'd' } = $props();
  let el = $state();
  let od = $state(null);

  onMount(async () => {
    // Dynamic import because odometer requires the window/document object
    const OdometerModule = await import('odometer');
    const Odometer = OdometerModule.default || OdometerModule;
    
    // Import the theme CSS
    await import('odometer/themes/odometer-theme-default.css');

    od = new Odometer({
      el,
      value,
      format, // e.g., 'd' for plain numbers, '(.ddd)' for dot-separated thousands
      duration: 300 // Reduced from 500ms
    });
  });

  $effect(() => {
    if (od) {
      od.update(value);
    }
  });
</script>

<!-- Empty span so Svelte doesn't interfere with Odometer's DOM -->
<span bind:this={el} class="animated-number"></span>

<style>
  /* Minor adjustment to make the odometer font size inherit perfectly */
  :global(.animated-number .odometer-value) {
    font-family: inherit;
  }
  
  /* Force odometer to be snappier (default is 2s, we want 300ms) */
  :global(.odometer.odometer-animating-up .odometer-ribbon-inner),
  :global(.odometer.odometer-animating-down.odometer-animating .odometer-ribbon-inner) {
    transition-duration: 300ms !important;
  }
</style>
