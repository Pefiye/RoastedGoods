<script>
	import favicon from '$lib/assets/favicon.png';
	import '$lib/app.scss';

	let Title = "Application"

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{Title}</title>
</svelte:head>

{@render children()}
