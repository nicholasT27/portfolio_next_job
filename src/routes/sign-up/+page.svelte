<script>
  import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';
  import { authenticateUser, userIsLoggedIn } from '../../util/auth.js';
  import { goto } from '$app/navigation';
  import { writable } from 'svelte/store';
  import PasswordVisibility from '../component/PasswordVisibility/PasswordVisibility.svelte';
  import PasswordConfirmationVisibility from '../component/PasswordVisibility/PasswordConfirmationVisibility.svelte';
  import { fileUrl, selectedFile, handleFileInputChangeOnCarousel, isUpload } from '../component/UploadMedia/UploadMedia.js';

  let isLoading = writable(false);
  let formErrors = {};
  let getError = writable(false);
  let getSuccess = writable(false);

  // Original account creation request and automatic sign-in flow are retained.
  async function createUser(evt) {
    evt.preventDefault();
    isLoading.set(true);
    const userData = {
      username: evt.target['username'].value,
      profile_picture: fileUrl,
      email: evt.target['email'].value,
      password: evt.target['password'].value,
      passwordConfirm: evt.target['password-confirmation'].value
    };
    const resp = await fetch(PUBLIC_BACKEND_BASE_URL + 'api/collections/users/records', {
      method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData)
    });
    if (resp.status == 200) {
      const res = await authenticateUser(userData.username, userData.password);
      if (res.success) {
        getError.set(false);
        getSuccess.set(true);
        goto('/job/new');
      } else {
        throw 'Sign up succeeded but authentication failed';
      }
    } else {
      const res = await resp.json();
      formErrors = res.data;
      getError.set(true);
    }
    if (evt.target['password'].value != evt.target['password-confirmation'].value) {
      formErrors['password'] = { message: 'Password confirmation does not match' };
    }
    isLoading.set(false);
  }

  function closeWindow() { getError.set(false); getSuccess.set(false); }
</script>

<svelte:head>
  <title>Join free | Next Jobs</title>
  <script src="/aws-sdk-s3.min.js"></script>
</svelte:head>

<!-- Layout-only account page; original PocketBase and photo-upload flow is retained. -->
<main class="grid min-h-screen bg-[#f8eee7] lg:grid-cols-[1.05fr_.95fr]">
  <section class="relative hidden overflow-hidden bg-[url('/rift-job-hero.png')] bg-cover bg-[62%_top] p-12 text-white lg:grid lg:content-between">
    <div class="absolute inset-0 bg-[#273238]/40"></div>
    <a href="/Home" class="relative text-lg font-black tracking-[0.14em]">Home</a>
    <div class="relative max-w-md pb-10">
      <p class="text-xs font-black uppercase tracking-[0.18em]">Careers, made clearer</p>
      <h1 class="mt-5 text-6xl font-black leading-[.93] tracking-[-.06em]">Find the role that fits.</h1>
      <p class="mt-6 text-lg font-bold">Create your free profile, save promising roles, and post opportunities.</p>
    </div>
  </section>

  <section class="grid content-center px-6 py-12 sm:px-12 lg:px-16">
    <div class="mx-auto w-full max-w-md">
      <a href="/Home" class="text-sm font-black tracking-[0.13em] text-[#273238] lg:hidden">← Home</a>
      <p class="mt-8 text-xs font-black uppercase tracking-[0.16em] text-[#d65391]">Create an account</p>
      <h1 class="mt-3 text-5xl font-black tracking-[-.055em] text-[#273238]">Join free</h1>
      <p class="mt-3 text-[#786a66]">It only takes a minute to get started.</p>

      {#if $userIsLoggedIn}
        <div class="mt-6 rounded-xl border border-[#d65391]/30 bg-white p-4 text-sm font-semibold text-[#273238]">Create an account to post a new job.</div>
      {/if}
      {#if $getError}
        <div class="mt-6 flex gap-3 rounded-xl border border-[#d65391]/30 bg-white p-4 text-sm text-[#273238]" role="alert">
          <span>{formErrors.username?.message || formErrors.email?.message || formErrors.password?.message || 'We could not create your account. Please review the details and try again.'}</span>
          <button on:click={closeWindow} class="ml-auto font-black text-[#d65391]" aria-label="Dismiss message">×</button>
        </div>
      {/if}

      <form class="mt-8 space-y-5" on:submit={createUser}>
        <label class="block text-sm font-black text-[#273238]" for="username">
          Username
          <input id="username" type="text" name="username" placeholder="Your username" required class="mt-2 w-full rounded-xl border border-[#d8c6b9] bg-white px-4 py-3.5 text-base font-normal outline-none transition placeholder:text-[#a69791] focus:border-[#d65391] focus:ring-2 focus:ring-[#d65391]/15" />
        </label>

        <div>
          <span class="block text-sm font-black text-[#273238]">Profile picture <span class="font-normal text-[#786a66]">(optional)</span></span>
          <div class="mt-2 flex items-center gap-3 rounded-xl border border-dashed border-[#d8c6b9] bg-white p-3">
            {#if $isUpload}
              <img src={$selectedFile} class="h-10 w-10 rounded-full object-cover" alt="Selected profile" />
            {:else}
              <div class="grid h-10 w-10 place-items-center rounded-full bg-[#f8eee7] font-black text-[#786a66]">+</div>
            {/if}
            <label for="file-upload" class="cursor-pointer text-sm font-black text-[#273238] underline decoration-[#d65391] decoration-2 underline-offset-4">
              Add profile picture
              <input type="file" name="file-upload" class="sr-only" id="file-upload" on:change={handleFileInputChangeOnCarousel} accept=".jpg, .jpeg, .png" />
            </label>
            <span class="ml-auto max-w-[8rem] truncate text-xs text-[#786a66]">{$selectedFile.slice(0, 18)}</span>
          </div>
        </div>

        <label class="block text-sm font-black text-[#273238]" for="email">
          Email
          <input id="email" type="email" name="email" placeholder="you@example.com" required class="mt-2 w-full rounded-xl border border-[#d8c6b9] bg-white px-4 py-3.5 text-base font-normal outline-none transition placeholder:text-[#a69791] focus:border-[#d65391] focus:ring-2 focus:ring-[#d65391]/15" />
        </label>

        <PasswordVisibility />
        <PasswordConfirmationVisibility />

        <button type="submit" disabled={$isLoading} class="flex w-full items-center justify-center rounded-xl bg-[#273238] px-5 py-4 font-black text-white transition hover:bg-[#d65391] disabled:cursor-wait disabled:opacity-60">{$isLoading ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p class="mt-7 text-center text-sm text-[#786a66]">Already registered? <a href="/login" class="font-black text-[#273238] underline decoration-[#d65391] decoration-2 underline-offset-4">Log in</a></p>
    </div>
  </section>
</main>
