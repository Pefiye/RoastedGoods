<script>
  import { supabase } from "$lib/supabase.js";
  import { invalidateAll } from "$app/navigation";
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import { addToast } from "$lib/stores/toast.js";

  const profile = $derived(page.data.profile);
  const user = $derived(page.data.user);

  let username = $state("");
  let savingProfile = $state(false);
  let newPassword = $state("");
  let savingPassword = $state(false);

  let hasPassword = $state(true);

  $effect(() => {
    if (!browser || !user) return;
    if (localStorage.getItem(`has_password_${user.id}`)) {
      hasPassword = true;
      return;
    }
    const identities = user.identities || [];
    const hasEmailIdentity = identities.some(i => i.provider === "email");
    const isGoogleOnly = identities.length > 0 && identities.every(i => i.provider === "google");

    if (isGoogleOnly && !hasEmailIdentity) {
      hasPassword = false;
    } else {
      hasPassword = true;
    }
  });
  let usernameInitialized = false;
  $effect(() => {
    if (profile?.username && !usernameInitialized) {
      username = profile.username;
      usernameInitialized = true;
    }
  });

  async function handleSaveProfile() {
    if (!username.trim()) return;
    savingProfile = true;

    const { error } = await supabase
      .from("profiles")
      .update({ username: username.trim() })
      .eq("id", user.id);

    if (error) {
      addToast(error.message, "error");
    } else {
      addToast("Profile updated successfully!", "success");
      await invalidateAll();
    }
    savingProfile = false;
  }

  async function handleUpdatePassword() {
    if (!newPassword || newPassword.length < 6) {
      passwordMsg = { type: "error", text: "Password must be at least 6 characters." };
      return;
    }

    savingPassword = true;

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      if (error.message.toLowerCase().includes("different from the old")) {
        hasPassword = true;
        if (browser) localStorage.setItem(`has_password_${user.id}`, 'true');
        addToast("You are already using this password! Please enter a new one to change it.", "error", 3000);
      } else {
        addToast(error.message, "error");
      }
    } else {
      hasPassword = true;
      if (browser) {
        localStorage.setItem(`has_password_${user.id}`, 'true');
      }
      addToast("Password updated successfully!", "success");
      newPassword = "";
    }
    savingPassword = false;
  }
</script>

<div class="bg-white p-6 p-md-8 rounded-4 b-shadow-s border border-accent-200">
  <h2 class="fsc-5 fw-black text-accent-500 mb-6">Profile Settings</h2>

  <form onsubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} class="mb-10">
    <div class="mb-5">
      <label for="email" class="fsc-2 fw-bold text-accent-500 mb-2 d-block">Email Address</label>
      <input
        id="email"
        type="email"
        value={profile?.email ?? user?.email ?? ""}
        disabled
        class="fsc-3 px-4 py-3 rounded-3 border border-2 border-accent-200 w-100 bg-accent-100 text-muted"
        title="Email address cannot be changed"
      />
      <small class="text-muted mt-1 d-block fsc-1">You cannot change your email address.</small>
    </div>

    <div class="mb-5">
      <label for="username" class="fsc-2 fw-bold text-accent-500 mb-2 d-block">Username</label>
      <input
        id="username"
        type="text"
        bind:value={username}
        required
        minlength="3"
        class="fsc-3 px-4 py-3 rounded-3 border border-2 border-accent-200 w-100 outline-0"
        style="transition: border-color 0.2s;"
        onfocus={(e) => e.target.style.borderColor = 'var(--color-accent-500)'}
        onblur={(e) => e.target.style.borderColor = ''}
      />
    </div>

    <button
      type="submit"
      disabled={savingProfile || username === profile?.username}
      class="py-3 px-8 fw-bold rounded-pill hover-button-alt fsc-3 border border-2 border-accent-500 d-inline-flex justify-content-center align-items-center"
    >
      {savingProfile ? 'Saving...' : 'Save Profile'}
    </button>
  </form>

  <hr class="border-accent-200 my-8" />

  <form onsubmit={(e) => { e.preventDefault(); handleUpdatePassword(); }}>
    <h3 class="fsc-4 fw-bold text-accent-500 mb-2">
      {hasPassword ? 'Change Password' : 'Add Password'}
    </h3>
    <p class="fsc-2 text-muted mb-5">
      {hasPassword 
        ? 'Update your password to keep your account secure.'
        : 'Since you sign in with Google, you can set a password here if you also want to log in using your email and password.'}
    </p>

    <div class="mb-5">
      <label for="newPassword" class="fsc-2 fw-bold text-accent-500 mb-2 d-block">New Password</label>
      <input
        id="newPassword"
        type="password"
        bind:value={newPassword}
        required
        minlength="6"
        placeholder="••••••••"
        class="fsc-3 px-4 py-3 rounded-3 border border-2 border-accent-200 w-100 outline-0"
        style="transition: border-color 0.2s;"
        onfocus={(e) => e.target.style.borderColor = 'var(--color-accent-500)'}
        onblur={(e) => e.target.style.borderColor = ''}
      />
    </div>

    <button
      type="submit"
      disabled={savingPassword}
      class="py-3 px-8 fw-bold rounded-pill hover-button fsc-3 border border-2 border-accent-500 d-inline-flex justify-content-center align-items-center bg-white text-dark"
    >
      {savingPassword ? 'Updating...' : (hasPassword ? 'Update Password' : 'Set Password')}
    </button>
  </form>
</div>
