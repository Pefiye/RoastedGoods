<script>
	import favicon from "$lib/assets/favicon.svg";
	import "$lib/app.scss";
	import ToastContainer from "$lib/components/ToastContainer.svelte";

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>RoastedGoods</title>
	<meta name="description" content="RoastedGoods - Premium Coffee & Pastries" />
	<meta property="og:title" content="RoastedGoods" />
	<meta property="og:description" content="Premium Coffee & Pastries crafted with passion." />
	<meta property="og:type" content="website" />
</svelte:head>

{@render children()}
<ToastContainer />
