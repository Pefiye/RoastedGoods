const purgecss = require('@fullhuman/postcss-purgecss')({
  content: ['./src/**/*.html', './src/**/*.svelte'],
  safelist: {
    standard: [
      /-(leave|enter|appear)(|-(to|from|active))$/,
      /^(?!(|.*?:)cursor-move).+-move$/,
      /^fade-/,
      /^slide-/,
      /^show$/,
      /^active$/,
      /^menu-/,
      /^drawer-/,
      /^bi-/, // Keep bootstrap icons
      /^text-/,
      /^bg-/,
      /^border-/,
      /^hover-/
    ],
    deep: [/svelte-/]
  },
  defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
});

module.exports = {
  plugins: [
    purgecss
  ]
};
