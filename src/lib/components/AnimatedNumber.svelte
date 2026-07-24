<script>
  import { onMount } from 'svelte';

  let { value = 0, format = 'd' } = $props();
  let el = $state();
  let od = $state(null);

  onMount(async () => {
    const OdometerModule = await import('odometer');
    const Odometer = OdometerModule.default || OdometerModule;
    await import('odometer/themes/odometer-theme-default.css');

    od = new Odometer({
      el,
      value,
      format,
      duration: 300
    });
  });

  $effect(() => {
    if (od) {
      od.update(value);
    }
  });
</script>

<span bind:this={el} class="animated-number"></span>

<style>

  :global(.animated-number .odometer-value) {
    font-family: inherit;
  }

  :global(.odometer.odometer-animating-up .odometer-ribbon-inner),
  :global(.odometer.odometer-animating-down.odometer-animating .odometer-ribbon-inner) {
    transition-duration: 300ms !important;
  }
</style>
