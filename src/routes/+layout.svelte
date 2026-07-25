<script>
	import favicon from "$lib/assets/favicon.svg";
	import "../../static/assets/plugins/global/plugins.bundle.css";
	import "../../static/assets/css/style.bundle.css";
	import "$lib/app.scss";
	import ToastContainer from "$lib/components/ToastContainer.svelte";

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>RoastedGoods</title>
</svelte:head>

{@render children()}
<ToastContainer />
