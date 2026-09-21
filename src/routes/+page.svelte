<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// The loader gives the hero images time to preload before the jobs page appears.
	let progress = 0;
	let message = 'Preparing your next move…';

	onMount(() => {
		const stages = [
			'Finding roles worth exploring…',
			'Connecting you with new opportunities…',
			'Preparing your next move…'
		];
		let stage = 0;

		const progressTimer = window.setInterval(() => {
			progress = Math.min(progress + 4, 100);
			stage = Math.min(Math.floor(progress / 34), stages.length - 1);
			message = stages[stage];
			if (progress === 100) {
				window.clearInterval(progressTimer);
				window.setTimeout(() => goto('/Home'), 260);
			}
		}, 80);

		return () => window.clearInterval(progressTimer);
	});
</script>

<svelte:head>
	<title>Next Job</title>
</svelte:head>

<!-- Three image layers overlap so each scene dissolves into the next instead of flashing. -->
<main class="loader" aria-live="polite">
	<div class="loader-scene loader-scene-one"></div>
	<div class="loader-scene loader-scene-two"></div>
	<div class="loader-scene loader-scene-three"></div>

	<section class="loader-content">
		<div class="loader-mark" aria-hidden="true">↗</div>
		<p class="loader-brand">next job</p>
		<div class="loader-track" aria-label={`${progress}% loaded`}>
			<span style={`width: ${progress}%`}></span>
		</div>
		<p class="loader-message">{message}</p>
	</section>
</main>
