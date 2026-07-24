<script>
  import { supabase } from '$lib/supabase.js';
  import { goto } from '$app/navigation';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';

  import { addToast } from "$lib/stores/toast.js";

  let { data } = $props();

  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  import { onMount } from 'svelte';
  onMount(async () => {
    if (data.session) {
      window.location.href = '/';
    }
  });

  async function handleLogin() {
    loading = true;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      addToast(error.message, 'error', 3000);
      loading = false;
      return;
    }
    window.location.href = '/';
  }

  async function handleGoogleLogin() {
    loading = true;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      addToast(error.message, 'error', 3000);
    }
    loading = false;
  }
</script>

<Navbar />

<div class="d-flex flex-grow-1 w-100 justify-content-center align-items-center bg-accent-100 py-20">
  <div class="bg-white p-8 p-md-10 rounded-4 b-shadow-s border border-accent-200 w-100 animation-pageIn" style="max-width: 420px;">

    <h1 class="fsc-6 fw-black text-accent-500 mb-2 text-center">Welcome Back</h1>
    <p class="fsc-2 text-muted text-center mb-8">Sign in to your account</p>

    <form onsubmit={(e) => { e.preventDefault(); handleLogin(); }}>
      <div class="d-flex flex-column gap-2 mb-5">
        <label for="email" class="fsc-2 fw-bold text-accent-500">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="you@example.com"
          required
          class="fsc-3 px-4 py-3 rounded-pill border border-2 border-accent-200 w-100 outline-0"
          style="transition: border-color 0.2s;"
          onfocus={(e) => e.target.style.borderColor = 'var(--color-accent-500)'}
          onblur={(e) => e.target.style.borderColor = ''}
        />
      </div>

      <div class="d-flex flex-column gap-2 mb-8">
        <label for="password" class="fsc-2 fw-bold text-accent-500">Password</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          placeholder="••••••••"
          required
          class="fsc-3 px-4 py-3 rounded-pill border border-2 border-accent-200 w-100 outline-0"
          style="transition: border-color 0.2s;"
          onfocus={(e) => e.target.style.borderColor = 'var(--color-accent-500)'}
          onblur={(e) => e.target.style.borderColor = ''}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-100 py-3 fw-bold rounded-pill hover-button-alt fsc-3 border border-2 border-accent-500 d-flex justify-content-center align-items-center"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>

    <div class="d-flex align-items-center my-6">
      <div class="flex-grow-1 border-top border-accent-200"></div>
      <span class="mx-4 fsc-2 text-muted fw-bold">OR</span>
      <div class="flex-grow-1 border-top border-accent-200"></div>
    </div>

    <button
      type="button"
      onclick={handleGoogleLogin}
      class="w-100 py-3 mb-6 fw-bold rounded-pill fsc-3 border border-2 border-accent-200 bg-white text-dark d-flex justify-content-center align-items-center gap-3 hover-bg-accent-100"
      style="transition: background-color 0.2s;"
    >
      <svg width="24" height="24" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        <path fill="none" d="M0 0h48v48H0z"/>
      </svg>
      Continue with Google
    </button>

    <p class="fsc-2 text-muted text-center mt-2">
      Don't have an account?
      <a href="/auth/register" class="fw-bold text-accent-500">Sign Up</a>
    </p>
  </div>
</div>

<Footer />
