import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Currency state
export const currency = writable('IDR');
export const exchangeRate = writable(16000); // fallback rate
export const rateLoaded = writable(false);

// Fetch live rate on first load (client-side only)
if (browser) {
  const cached = sessionStorage.getItem('exchangeRate');
  const cachedTime = sessionStorage.getItem('exchangeRateTime');

  // Use cached rate if it's less than 1 hour old
  if (cached && cachedTime && Date.now() - Number(cachedTime) < 3600000) {
    exchangeRate.set(Number(cached));
    rateLoaded.set(true);
  } else {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data?.rates?.IDR) {
          exchangeRate.set(data.rates.IDR);
          sessionStorage.setItem('exchangeRate', String(data.rates.IDR));
          sessionStorage.setItem('exchangeRateTime', String(Date.now()));
        }
        rateLoaded.set(true);
      })
      .catch(() => {
        // Fallback silently to default rate
        rateLoaded.set(true);
      });
  }

  // Persist currency preference
  const savedCurrency = localStorage.getItem('currency');
  if (savedCurrency === 'USD' || savedCurrency === 'IDR') {
    currency.set(savedCurrency);
  }
  currency.subscribe(val => localStorage.setItem('currency', val));
}

/**
 * Format a price (stored in IDR) for display based on the current currency setting.
 * This is a plain function that accepts the current store values.
 */
export function formatPrice(priceInIDR, curr, rate) {
  if (curr === 'USD') {
    const usd = priceInIDR / rate;
    return '$' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return 'Rp' + priceInIDR.toLocaleString('id-ID');
}

/**
 * Get the numeric display value for AnimatedNumber (odometer).
 * Returns the raw number in the active currency.
 */
export function getDisplayValue(priceInIDR, curr, rate) {
  if (curr === 'USD') {
    return Math.round((priceInIDR / rate) * 100) / 100;
  }
  return priceInIDR;
}

/** Toggle between IDR and USD */
export function toggleCurrency() {
  currency.update(c => c === 'IDR' ? 'USD' : 'IDR');
}
