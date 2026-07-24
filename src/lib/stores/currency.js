import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
export const currency = writable('IDR');
export const exchangeRate = writable(16000);
export const rateLoaded = writable(false);
if (browser) {
  const cached = sessionStorage.getItem('exchangeRate');
  const cachedTime = sessionStorage.getItem('exchangeRateTime');
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
        rateLoaded.set(true);
      });
  }
  const savedCurrency = localStorage.getItem('currency');
  if (savedCurrency === 'USD' || savedCurrency === 'IDR') {
    currency.set(savedCurrency);
  }
  currency.subscribe(val => localStorage.setItem('currency', val));
}

export function formatPrice(priceInIDR, curr, rate) {
  if (curr === 'USD') {
    const usd = priceInIDR / rate;
    return '$' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return 'Rp' + priceInIDR.toLocaleString('id-ID');
}

export function getDisplayValue(priceInIDR, curr, rate) {
  if (curr === 'USD') {
    return Math.round((priceInIDR / rate) * 100) / 100;
  }
  return priceInIDR;
}

export function toggleCurrency() {
  currency.update(c => c === 'IDR' ? 'USD' : 'IDR');
}
