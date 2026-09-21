<script>
  import { get, writable } from 'svelte/store';
  import { isAuthenticated, logOut, isLoggedIn, userIsLoggedIn } from '../../../util/auth.js';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // Original authentication actions and routes are retained; only the header presentation changes.
  let profileDropDownMenu = writable(false);
  let authData = '';

  onMount(async () => { authData = JSON.parse(await isLoggedIn()); });
  function loginStatus() { if (get(isAuthenticated) == false) { userIsLoggedIn.set(true); goto('/sign-up'); } else goto('/job/new'); }
  function signUp() { userIsLoggedIn.set(false); goto('/sign-up'); }
  export function openProfileDropDownMenu() { profileDropDownMenu.update((value) => !value); }
</script>

<!-- Visual-only navigation layout. Existing authentication methods and destination routes are unchanged. -->
<header class="relative z-30 border-b border-[#ead8ca] bg-white text-[#273238]">
  <div class="mx-auto flex min-h-[4.75rem] max-w-[1440px] items-center px-5 sm:px-8 lg:px-12">
    <a href="/Home" class="group mr-auto inline-flex items-center gap-2.5 py-2" aria-label="Next Job home"><span class="text-lg font-black tracking-[0.12em] transition group-hover:text-[#d65391] sm:text-xl">NEXT JOB</span><span class="grid h-6 w-6 place-items-center rounded-md bg-[#f6cb67] text-sm font-black">↗</span></a>
    <nav class="hidden items-center gap-7 text-sm font-bold tracking-[.035em] md:flex" aria-label="Primary navigation">
      <a class="transition hover:text-[#d65391]" href="/Home#open-roles">Explore jobs</a>
      {#if $isAuthenticated}
        <a class="transition hover:text-[#d65391]" href="/job-posted">My jobs</a>
        <button on:click={loginStatus} class="rounded-full bg-[#d65391] px-5 py-2.5 text-white transition hover:bg-[#b93f77]">Post a job</button>
      {:else}
        <a class="transition hover:text-[#d65391]" href="/login">Log in</a>
        <button on:click={signUp} class="rounded-full bg-[#273238] px-5 py-2.5 text-white transition hover:bg-[#d65391]">Join free</button>
      {/if}
    </nav>
    {#if $isAuthenticated}
      <button on:click={openProfileDropDownMenu} class="ml-4 h-10 w-10 overflow-hidden rounded-full bg-[#f8eee7] ring-1 ring-[#ead8ca] transition hover:ring-[#d65391]" aria-label="Open profile menu">{#if authData?.userProfilePicture}<img class="h-full w-full object-cover" src={authData.userProfilePicture} alt="Your profile" />{:else}<span class="grid h-full place-items-center text-sm font-black">{authData?.userName?.slice(0, 1) || 'N'}</span>{/if}</button>
    {:else}
      <button on:click={openProfileDropDownMenu} class="ml-4 grid h-10 w-10 place-items-center rounded-full bg-[#f8eee7] md:hidden" aria-label="Open menu">☰</button>
    {/if}
  </div>
  {#if $profileDropDownMenu}
    <div class="absolute right-5 top-[4.3rem] w-60 overflow-hidden rounded-2xl border border-[#ead8ca] bg-white p-2 shadow-xl sm:right-8 lg:right-12">
      {#if $isAuthenticated}
        <div class="border-b border-[#ead8ca] px-3 py-3 text-sm"><div class="font-bold">{authData?.userName}</div><div class="mt-1 truncate text-[#786a66]">{authData?.userEmail}</div></div>
        <a href="/profile" class="mt-1 block rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-[#f8eee7]">Profile</a><a href="/job-posted" class="block rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-[#f8eee7]">My jobs</a><button on:click={logOut} class="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold hover:bg-[#f8eee7]">Log out</button>
      {:else}
        <a href="/Home#open-roles" class="block rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-[#f8eee7]">Explore jobs</a><a href="/login" class="block rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-[#f8eee7]">Log in</a><button on:click={signUp} class="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold hover:bg-[#f8eee7]">Join free</button>
      {/if}
    </div>
  {/if}
</header>
