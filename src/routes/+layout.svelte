<script>
	import favicon from '$lib/assets/favicon.png';
	import '$lib/app.scss';
	import ToastContainer from '$lib/components/ToastContainer.svelte';

	let Title = "RoastedGoods"

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{Title}</title>
</svelte:head>

{@render children()}
<ToastContainer />
