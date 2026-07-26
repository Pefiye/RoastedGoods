import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit()
	],
	css: {
		lightningcss: {
			errorRecovery: true
		}
	},
	build: {
		cssMinify: 'esbuild'
	},
	preview: {
		allowedHosts: true
	}
});
