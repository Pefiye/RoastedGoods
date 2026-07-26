import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			regions: ['sin1']
		}),
		inlineStyleThreshold: 1024000 // Set to 1000KiB to ensure the 335KiB raw (39KiB gzipped) bundle is inlined
	},
	compilerOptions: {
		// Force runes mode for the project, except for libraries.
		// This can be removed in svelte 6.
		// The warning suppression here ensures Vercel doesn't fail the build on Svelte warnings.
	},
	onwarn: (warning, handler) => {
		// Ignore warnings to prevent Vercel CI from failing
		return;
	}
};

export default config;
