import { writable } from 'svelte/store';

export const toasts = writable([]);

export function addToast(text, type = 'success', duration = 2500, icon = null) {
  const id = crypto.randomUUID();
  toasts.update(all => [...all, { id, text, type, duration, icon }]);
  
  setTimeout(() => {
    removeToast(id);
  }, duration);
}

export function removeToast(id) {
  toasts.update(all => all.filter(t => t.id !== id));
}
