<script>
	import { writable } from 'svelte/store';
	import humanize from 'humanize-plus';
	import { isLoggedIn } from '../../util/auth.js';
	import { onMount } from 'svelte';
	import { fetchJobs } from '../component/Pagination/Pagination.js';
	import NavBar from '../component/NavBar/NavBar.svelte';
	import Footer from '../component/Footer/Footer.svelte';

	export let data;
	let joblist = data.jobs.items;
	let filteredJobs = joblist;
	let authData = '';
	let filterSearchJob = '';
	let currentJobPage = 1;
	let paginationButton;
	let currentMin = 0;
	let minSalary = 0;
	let maxSalary = 20000;
	let maxValue = 19000;
	let sideBarOpen = writable(false);
	let salaryDropDownMenu = writable(false);
	let jobTypeDropDownMenu = writable(false);
	let checkboxRemoteChecked = writable(false);
	let checkboxFullTimeChecked = writable(false);
	let checkboxPartTimeChecked = writable(false);
	let selectedJobType = [];
	let numberOfPages = writable(data.jobs.totalPages);

	// Used for extract the authenticated user data such as user email or user profile image //
	onMount(async () => {
		authData = JSON.parse(await isLoggedIn());
	});

	// add pagination button when first load //
	onMount(() => {
		paginationButton = document.getElementById('totalPage');

		numberOfPages.subscribe((value) => {
			for (let i = 1; i <= value; i++) {
				let currentPageButton = document.createElement('button');

				// Set the attributes and text content of the button
				currentPageButton.setAttribute('id', 'currentPage');
				currentPageButton.setAttribute('value', i); // Set the value attribute to the page number
				currentPageButton.textContent = i;

				if (i === 1) {
					// If this is the first page button, add the underline class
					currentPageButton.setAttribute(
						'class',
						'md:text-xl lg:text-base relative items-center px-5 py-4 text-sm pagination font-semibold focus:underline underline'
					);
				} else {
					// Otherwise, set the class without the underline class
					currentPageButton.setAttribute(
						'class',
						'md:text-xl lg:text-base relative items-center px-5 py-4 text-sm pagination font-semibold focus:underline'
					);
				}

				// Attach a click event listener to the button
				currentPageButton.addEventListener('click', getCurrentPage);

				// Append the button to the paginationButton element
				paginationButton.appendChild(currentPageButton);
			}
		});
	});

	function openJobTypeDropDownMenu() {
		jobTypeDropDownMenu.update((value) => !value);
	}

	function openSalaryDropDownMenu() {
		salaryDropDownMenu.update((value) => !value);
	}

	// Salary input range function //
	function handleRangeChange(event) {
		currentMin = parseInt(event.target.value);
		// If currentMin exceeds maxSalary, set both currentMin to their maximum values
		if (currentMin >= maxValue) {
			currentMin = maxValue;
		}
	}

	//this function is used to get the desired job type and set into selectedJobType array//
	function updateSelectedJobTypes(jobType) {
		if (selectedJobType.includes(jobType)) {
			// If jobType is already in selectedJobType, remove it //
			selectedJobType = selectedJobType.filter((item) => item !== jobType);
		} else {
			// If jobType is not in selectedJobType, add it //
			selectedJobType = [...selectedJobType, jobType];
		}

		//used for side bar menu to stay selection even user closed the side bar //
		if (selectedJobType.includes('Full Time')) {
			checkboxFullTimeChecked.set(true);
		} else if (selectedJobType.includes('Part Time')) {
			checkboxPartTimeChecked.set(true);
		} else if (selectedJobType.includes('Remote')) {
			checkboxRemoteChecked.set(true);
		} else {
			checkboxFullTimeChecked.set(false);
			checkboxPartTimeChecked.set(false);
			checkboxRemoteChecked.set(false);
		}
	}

	function filterJobs() {
		// Convert selectedJobType to lowercase
		const lowercaseSelectedJobTypes = selectedJobType.map((type) => type.toLowerCase());

		// Filter based on selectedJobType and search filter
		filteredJobs = joblist.filter((job) => {
			const jobTypeLowerCase = job.job_type.map((type) => type.toLowerCase());
			const lowercaseFilterSearches = filterSearchJob.toLowerCase();

			// Check if job type or other properties match the search filter
			return (
				// Check if job type matches any selected job type
				(lowercaseSelectedJobTypes.length === 0 ||
					jobTypeLowerCase.some((type) => lowercaseSelectedJobTypes.includes(type))) &&
				// Check if employer, location, or title matches search filter
				(job.employer.toLowerCase().includes(lowercaseFilterSearches) ||
					job.location.toLowerCase().includes(lowercaseFilterSearches) ||
					job.title.toLowerCase().includes(lowercaseFilterSearches)) &&
				// Check if minimum annual compensation is within the specified salary range
				(currentMin === 0 || job.minAnnualCompensation == currentMin)
			);
		});

		if (filteredJobs.length < 10) {
			numberOfPages.set(1);
		} else {
			numberOfPages.set(data.jobs.totalPages);
		}
	}

	function clearFilter() {
		filterSearchJob = '';
		selectedJobType = [];
		currentMin = 0;
		//Get all checkbox element and uncheck them//
		const checkboxes = document.querySelectorAll('input[type="checkbox"]');
		checkboxes.forEach((box) => {
			box.checked = false;
		});
		filterJobs();
	}

	async function nextPage() {
		if (data.jobs.page < data.jobs.totalPages) {
			currentJobPage = data.jobs.page + 1;
		} else {
			currentJobPage = data.jobs.page;
		}

		const res = await fetchJobs(currentJobPage);

		if (res) {
			filteredJobs = res.items;

			// Remove the underline from the first page button
			let firstPageButton = document.querySelector("#currentPage[value='1']");
			firstPageButton.classList.remove('underline');

			// Focus the current page number
			let currentPageButton = document.querySelector(`#currentPage[value="${currentJobPage}"]`);
			currentPageButton.focus();
		} else {
			filteredJobs = joblist;
		}
	}

	async function prevPage() {
		if (data.jobs.page < data.jobs.totalPages && data.jobs.page > 1) {
			currentJobPage = data.jobs.page - 1;
		} else {
			currentJobPage = data.jobs.page;
		}

		const res = await fetchJobs(currentJobPage);

		if (res) {
			filteredJobs = res.items;

			// Remove the underline from the first page button
			let firstPageButton = document.querySelector("#currentPage[value='1']");
			firstPageButton.classList.remove('underline');

			// Focus the current page number
			let currentPageButton = document.querySelector(`#currentPage[value="${currentJobPage}"]`);
			currentPageButton.focus();
		} else {
			console.log('Error fetching jobs');
			filteredJobs = joblist;
		}
	}

	async function getCurrentPage(event) {
		// Get the clicked button element //
		const currentPageButtonElement = event.target;

		const currentPageNo = currentPageButtonElement.textContent;

		currentJobPage = currentPageNo;

		const res = await fetchJobs(currentJobPage);

		if (res) {
			filteredJobs = res.items;
		} else {
			filteredJobs = joblist;
		}
	}

	function openSideBar() {
		sideBarOpen.set(true);
	}

	function closeSideBar() {
		var sideBar = document.getElementById('sideBar');
		sideBar.classList.add('closedSideBar');

		setTimeout(function () {
			sideBarOpen.set(false);
		}, 1000);
	}
</script>

<svelte:head>
	<title>Home | Next Jobs</title>
</svelte:head>

<div class="home-page flex flex-col">
	<NavBar />

	<!-- Visual-only hero. Existing search, filters, pagination and job data stay unchanged below. -->
	<section class="home-hero" aria-labelledby="home-hero-title">
		<div class="home-hero-shade"></div>
		<div class="home-hero-copy py-20 px-10">
			<p>CAREERS, MADE CLEARER</p>
			<h1 id="home-hero-title">Find work that feels like your next move.</h1>
			<span>Explore roles from teams building what’s next.</span>
			<a href="#open-roles">Find a job</a>
		</div>
	</section>

	<div id="open-roles" class="home-controls flex p-2 m-2 space-x-5 flex-row justify-between">
		<button
			type="button"
			class="items-center justify-center p-0.5 mb-2 h-10 mr-2 text-white text-sm font-medium rounded-lg bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl"
			on:click={clearFilter}
		>
			<span class="px-5 py-2.5 rounded-md">
				Clear Filter
			</span>
		</button>

		<p class="text-gray-400 items-center justify-center flex mb-1 pagination">
			show record page {currentJobPage} of {$numberOfPages}
		</p>
	</div>

	<div class="home-results flex">
		<!-- Filter search -->
		<div class="home-filters flex flex-col">
			<button
				type="button"
				on:click={openSideBar}
				class="inline-flex items-center p-2 mt-2 ml-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
			>
				<span class="sr-only">Open sidebar</span>
				<svg
					class="w-6 h-6"
					aria-hidden="true"
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						clip-rule="evenodd"
						fill-rule="evenodd"
						d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
					/>
				</svg>
			</button>

      <!-- side bar menu for smaller screen size -->
				{#if $sideBarOpen == true}
					<section
						id="sideBar"
						class="openSideBar absolute z-40 top-96 w-fit h-screen mt-14"
					>
						<div class="h-full px-3 py-4 overflow-y-auto bg-gray-50">
							<ul class="space-y-2 font-medium">
								<li class="flex flex-row justify-between">
									<span class="ml-4">Filter</span>
									<button
										type="button"
										on:click={closeSideBar}
										class="ml-auto -mx-1.5 -my-1.5 bg-pink-100 text-pink-600 rounded-lg focus:ring-2 focus:ring-pink-400 p-1.5 hover:bg-pink-200 inline-flex items-center justify-center h-8 w-8"
									>
										<span class="sr-only">Close</span>
										<svg
											class="w-3 h-3"
											aria-hidden="true"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 14 14"
										>
											<path
												stroke="currentColor"
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
											/>
										</svg>
									</button>
								</li>
								<li>
									<form class="w-64 m-4" on:submit|preventDefault={filterJobs}>
										<div class="relative">
											<div
												class="absolute inset-y-0 left-0 flex items-center pl-3"
											>
												<svg
													class="w-4 h-4 text-gray-500"
													aria-hidden="true"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 20 20"
												>
													<path
														stroke="currentColor"
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
													/>
												</svg>
											</div>
											<input
												type="text"
												id="search"
												name="search"
												class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-pink-600 focus:border-pink-600"
												placeholder="Company, job role..."
												bind:value={filterSearchJob}
											/>
											<button
												type="submit"
												class="text-white absolute right-2.5 bottom-2.5 bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-4 py-2"
												>Search</button
											>
										</div>
									</form>
								</li>
								<li>
									<!-- Job Type Selection -->
									<button
										type="button"
										class="text-black bg-transparent focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
										on:click={openJobTypeDropDownMenu}
									>
										Employment

										{#if $jobTypeDropDownMenu == true}
											<svg
												class="w-2.5 h-2.5 ml-2.5"
												aria-hidden="true"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 10 6"
											>
												<path
													stroke="currentColor"
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="m1 1 4 4 4-4"
												/>
											</svg>
										{:else}
											<svg
												class="w-2.5 h-2.5 ml-2.5 mt-1"
												aria-hidden="true"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 8 14"
											>
												<path
													stroke="currentColor"
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2.5"
													d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"
												/>
											</svg>
										{/if}
									</button>

									{#if $jobTypeDropDownMenu == true}
										<div
											class="slide-down2 mt-2 ml-2 w-48 bg-transparent divide-y divide-gray-100 rounded-lg"
										>
											<ul class="p-3 space-y-3 text-sm text-gray-700">
												<li>
													<div class="flex items-center">
														<input
															id="checkbox-item-1"
															type="checkbox"
															bind:checked={$checkboxFullTimeChecked}
															value=""
															class="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-600 focus:ring-2"
															on:change={() => {
																updateSelectedJobTypes('Full Time'), filterJobs();
															}}
														/>
														<label
															for="checkbox-item-1"
															class="ml-2 text-sm font-medium text-gray-900"
														>
															Full Time
														</label>
													</div>
												</li>

												<li>
													<div class="flex items-center">
														<input
															id="checkbox-item-2"
															type="checkbox"
															bind:checked={$checkboxPartTimeChecked}
															value=""
															class="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-600 focus:ring-2"
															on:change={() => {
																updateSelectedJobTypes('Part Time'), filterJobs();
															}}
														/>
														<label
															for="checkbox-item-2"
															class="ml-2 text-sm font-medium text-gray-900"
														>
															Part Time
														</label>
													</div>
												</li>

												<li>
													<div class="flex items-center">
														<input
															id="checkbox-item-3"
															type="checkbox"
															bind:checked={$checkboxRemoteChecked}
															value=""
															class="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-600 focus:ring-2"
															on:change={() => {
																updateSelectedJobTypes('Remote'), filterJobs();
															}}
														/>
														<label
															for="checkbox-item-3"
															class="ml-2 text-sm font-medium text-gray-900"
														>
															Remote
														</label>
													</div>
												</li>
											</ul>
										</div>
									{/if}
								</li>
								<li>
									<!-- Salary indicator -->
									<button
										class="text-black bg-transparent focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
										type="button"
										on:click={openSalaryDropDownMenu}
									>
										Salary Range

										{#if $salaryDropDownMenu == true}
											<svg
												class="w-2.5 h-2.5 ml-2.5 mt-1"
												aria-hidden="true"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 10 6"
											>
												<path
													stroke="currentColor"
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="m1 1 4 4 4-4"
												/>
											</svg>
										{:else}
											<svg
												class="w-2.5 h-2.5 ml-2.5 mt-1"
												aria-hidden="true"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 8 14"
											>
												<path
													stroke="currentColor"
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2.5"
													d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"
												/>
											</svg>
										{/if}
									</button>

									{#if $salaryDropDownMenu == true}
										<div
											class="slide-down2 mt-2 ml-5 w-48 bg-white divide-y divide-gray-100 rounded-lg"
										>
											<label
												for="minmax-range"
												class="block mb-2 text-sm font-medium text-gray-900"
												>Min Job Salary : {currentMin}</label
											>
											<input
												id="minmax-range"
												type="range"
												min={minSalary}
												max={maxSalary}
												bind:value={currentMin}
												on:change={(event) => {
													handleRangeChange(event);
													filterJobs();
												}}
												step="1000"
												class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
											/>
										</div>
									{/if}
								</li>
							</ul>
						</div>
					</section>
				{/if}


			<form class="hidden md:block w-64 m-4" on:submit|preventDefault={filterJobs}>
				<div class="relative">
					<div class="absolute inset-y-0 left-0 flex items-center pl-3">
						<svg
							class="w-4 h-4 text-gray-500"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 20 20"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
							/>
						</svg>
					</div>
					<input
						type="text"
						id="search"
						name="search"
						class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-pink-600 focus:border-pink-600"
						placeholder="Company, job role..."
						bind:value={filterSearchJob}
					/>
					<button
						type="submit"
						class="text-white absolute right-2.5 bottom-2.5 bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-4 py-2"
						>Search</button
					>
				</div>
			</form>

			<!-- Job Type Selection -->
			<button
				class="hidden md:block text-black bg-white focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"
				type="button"
				on:click={openJobTypeDropDownMenu}
			>
				<div class="flex flex-row">
					<span>Employment</span>

					{#if $jobTypeDropDownMenu == true}
						<svg
							class="w-2.5 h-2.5 ml-2.5 mt-1.5"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 10 6"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="m1 1 4 4 4-4"
							/>
						</svg>
					{:else}
						<svg
							class="w-2.5 h-2.5 ml-2.5 mt-1.5"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 8 14"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2.5"
								d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"
							/>
						</svg>
					{/if}
				</div>
			</button>

			{#if $jobTypeDropDownMenu == true}
				<div
					class="hidden md:block slide-down2 mt-2 ml-2 w-48 bg-white divide-y divide-gray-100 rounded-lg"
				>
					<ul class="p-3 space-y-3 text-sm text-gray-700">
						<li>
							<div class="flex items-center">
								<input
									id="checkbox-item-1"
									type="checkbox"
									value=""
									class="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-600 focus:ring-2"
									on:change={() => {
										updateSelectedJobTypes('Full Time'), filterJobs();
									}}
								/>
								<label
									for="checkbox-item-1"
									class="ml-2 text-sm font-medium text-gray-900"
								>
									Full Time
								</label>
							</div>
						</li>

						<li>
							<div class="flex items-center">
								<input
									id="checkbox-item-2"
									type="checkbox"
									value=""
									class="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-600 focus:ring-2"
									on:change={() => {
										updateSelectedJobTypes('Part Time'), filterJobs();
									}}
								/>
								<label
									for="checkbox-item-2"
									class="ml-2 text-sm font-medium text-gray-900"
								>
									Part Time
								</label>
							</div>
						</li>

						<li>
							<div class="flex items-center">
								<input
									id="checkbox-item-3"
									type="checkbox"
									value=""
									class="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-600 focus:ring-2"
									on:change={() => {
										updateSelectedJobTypes('Remote'), filterJobs();
									}}
								/>
								<label
									for="checkbox-item-3"
									class="ml-2 text-sm font-medium text-gray-900"
								>
									Remote
								</label>
							</div>
						</li>
					</ul>
				</div>
			{/if}

			<!-- Salary indicator -->
			<button
				class="hidden md:block text-black bg-white focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"
				type="button"
				on:click={openSalaryDropDownMenu}
			>
				<div class="flex flex-row">
					<span>Salary Range</span>

					{#if $salaryDropDownMenu == true}
						<svg
							class="w-2.5 h-2.5 ml-2.5 mt-1.5"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 10 6"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="m1 1 4 4 4-4"
							/>
						</svg>
					{:else}
						<svg
							class="w-2.5 h-2.5 ml-2.5 mt-1.5"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 8 14"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2.5"
								d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"
							/>
						</svg>
					{/if}
				</div>
			</button>

			{#if $salaryDropDownMenu == true}
				<div
					class="hidden md:block slide-down2 mt-2 ml-5 w-48 bg-white divide-y divide-gray-100 rounded-lg"
				>
					<label
						for="minmax-range"
						class="block mb-2 text-sm font-medium text-gray-900"
						>Min Job Salary : {currentMin}</label
					>
					<input
						id="minmax-range"
						type="range"
						min={minSalary}
						max={maxSalary}
						bind:value={currentMin}
						on:change={(event) => {
							handleRangeChange(event);
							filterJobs();
						}}
						step="1000"
						class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
					/>
				</div>
			{/if}
		</div>

		<!-- Job Listing -->
		<ul class="home-job-list shrink w-full divide-y divide-gray-200 ml-10">
			{#each filteredJobs as job (job.id)}
				<a href="/job/{job.id}">
					<li
						id="job-listing"
						class="p-3 hover:bg-gray-100 flex justify-between flex-col md:flex-row border border-black m-2 rounded-xl md:border-none"
					>
						<div class="flex gap-x-4 flex-col md:flex-row">
							{#if job.image_url}
								<img rel="preload" class="h-12 w-12 flex-none rounded-full" src={job.image_url} alt="" />
							{:else}
								<img
									rel="preload"
									class="h-12 w-12 flex-none rounded-full"
									src="question-mark.png"
									alt="question-mark logo"
								/>
							{/if}
							<div class="w-42 flex-auto">
								<p
									class="md:text-sm text-lg font-semibold leading-6 text-gray-900 sm:w-36 w-full capitalize"
								>
									{job.title}
								</p>
								<p class="mt-1 truncate md:text-xs text-sm leading-5 text-gray-500 capitalize">
									{job.employer}
								</p>
								<p class="mt-1 truncate md:text-xs text-sm leading-5 text-gray-500">
									USD {humanize.formatNumber(job.minAnnualCompensation)} - USD {humanize.formatNumber(
										job.maxAnnualCompensation
									)}
								</p>
							</div>

							<div
								class="flex items-center ml-0 md:ml-16 p-0 md:p-2 grid grid-cols-2 md:grid-cols-3 gap-x-1"
							>
								{#if job.job_type.includes('Full Time')}
									<div
										class="border bg-gradient-to-br from-pink-500 to-orange-400 text-white round rounded-xl p-4 h-10 flex items-center justify-center mt-1.5"
									>
										Full Time
									</div>
								{/if}

								{#if job.job_type.includes('Part Time')}
									<div
										class="border bg-gradient-to-br from-pink-500 to-orange-400 text-white round rounded-xl p-4 h-10 flex items-center justify-center mt-1.5"
									>
										Part Time
									</div>
								{/if}

								{#if job.job_type.includes('Remote')}
									<div
										class="border bg-gradient-to-br from-pink-500 to-orange-400 text-white round rounded-xl p-4 h-10 flex items-center justify-center mt-1.5"
									>
										Remote
									</div>
								{/if}
							</div>
						</div>
						<div class="sm:items-end flex flex-col justify-center">
							<p class="text-sm leading-6 text-gray-900 capitalize">{job.location}</p>
							<p class="mt-1 text-sm md:text-xs leading-5 text-gray-500">
								Created At {new Date(job.created).toLocaleDateString(undefined, {
									weekday: 'long',
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
							</p>
						</div>
					</li>
				</a>
			{/each}
		</ul>
	</div>

	<div class="flex items-center justify-center">
		<div class="flex justify-center bg-transparent px-4 py-3 sm:px-2 mt-5 w-60">
			<div class="sm:flex sm:items-center sm:justify-between w-fit flex justify-between">
				<button
					on:click={$numberOfPages > 1 ? prevPage : undefined}
					class="pagination inline-flex items-center rounded-l-md px-2 focus:z-20 focus:outline-offset-0"
				>
					<svg
						class="md:mt-1 lg:mt-0 w-4 h-4 stroke-current"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 14 10"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 5H1m0 0 4 4M1 5l4-4"
						/>
					</svg>
					<span class="mb-0.5 px-2 md:text-2xl lg:text-lg">Previous</span>
				</button>

				<nav class="inline-flex -space-x-px" id="totalPage" />

				<button
					on:click={$numberOfPages > 1 ? nextPage : undefined}
					class="pagination relative inline-flex items-center rounded-r-md px-2 py-2 focus:z-20 focus:outline-offset-0"
				>
					<span class="mb-0.5 px-2 md:text-2xl lg:text-lg">Next</span>
					<svg
						class="md:mt-1 lg:mt-0 w-4 h-4 stroke-current"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 14 10"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M1 5h12m0 0L9 1m4 4L9 9"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>

	<Footer />
</div>

<style>
	@import '../Home/+page.css';

	/* Visual-only hero; the job listing and filtering controls keep their original markup and handlers. */
	.home-page { background: #f8f5f1; }
	.home-hero { position: relative; display: grid; min-height: 33.75rem; overflow: hidden; background: url('/rift-job-hero.png') center top / cover; color: #fff; }
	.home-hero-shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgb(39 50 56 / 72%), rgb(39 50 56 / 18%), transparent); }
	.home-hero-copy { --home-hero-offset: 0rem; position: relative; z-index: 1; display: grid; align-content: center; width: min(72.5rem, 100%); padding: 4.5rem 2rem; text-shadow: 0 2px 16px rgb(0 0 0 / 30%); animation: home-hero-enter 1.05s cubic-bezier(.22,1,.36,1) .12s both; }
	.home-hero-copy p { margin: 0 0 1.25rem; font-size: .78rem; font-weight: 900; letter-spacing: .18em; }
	.home-hero-copy h1 { max-width: 29rem; margin: 0; color: #fff; font-size: clamp(3.2rem, 6vw, 5.8rem); font-weight: 900; letter-spacing: -.035em; line-height: .94; }
	.home-hero-copy span { max-width: 34rem; margin-top: 1.35rem; font-size: 1.15rem; font-weight: 750; }
	.home-hero-copy a { display: inline-flex; width: 19rem; justify-content: center; margin-top: 2rem; border-radius: .75rem; background: #273238; padding: 1rem 1.2rem; color: #fff; font-weight: 900; text-decoration: none; text-shadow: none; transition: background 160ms ease; }
	.home-hero-copy a:hover { background: #d65391; }
	.home-controls { width: min(1120px, calc(100% - 2rem)); margin: 2rem auto .35rem; padding: 0 !important; align-items: center; }
	.home-controls button { height: auto !important; margin: 0 !important; border-radius: .7rem !important; background: #273238 !important; box-shadow: none; }
	.home-controls button:hover { background: #d65391 !important; }
	.home-controls .pagination { color: #69757a !important; font-size: .8rem; font-weight: 750; letter-spacing: .04em; }
	.home-results { width: min(1120px, calc(100% - 2rem)); gap: 1.25rem; margin: 0 auto; padding: 1.25rem 0 2.5rem; }
	.home-filters { width: 17.5rem; flex: 0 0 17.5rem; padding: 1rem; border: 1px solid #e7e0d8; border-radius: 1rem; background: #fffdfb; box-shadow: 0 10px 28px rgb(39 50 56 / 6%); }
	.home-filters form { width: auto !important; margin: 0 !important; }
	.home-filters input { border-color: #ded4cb !important; border-radius: .7rem !important; background: #fffdfb !important; }
	.home-filters form button { border-radius: .55rem !important; background: #d65391 !important; }
	.home-filters > button { margin: .75rem 0 0 !important; border-radius: .6rem !important; color: #273238 !important; background: #f1ede8 !important; text-align: left; }
	.home-job-list { display: grid; gap: .8rem; margin: 0 !important; border: 0 !important; }
	.home-job-list > a { display: block; color: inherit; text-decoration: none; }
	.home-job-list #job-listing { min-height: 7.2rem; margin: 0 !important; border: 1px solid #e7e0d8 !important; border-radius: 1rem !important; background: #fffdfb; box-shadow: 0 8px 22px rgb(39 50 56 / 5%); transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
	.home-job-list #job-listing:hover { border-color: #ddbdca !important; background: #fff !important; box-shadow: 0 15px 28px rgb(39 50 56 / 10%); transform: translateY(-2px); }
	.home-job-list #job-listing img { width: 3.25rem; height: 3.25rem; border: 1px solid #eadfd6; }
	.home-job-list #job-listing .grid { display: flex !important; min-width: 10.5rem; flex-direction: column; align-items: stretch; gap: .45rem !important; }
	.home-job-list #job-listing .bg-gradient-to-br { border: 1px solid #eadfd6 !important; border-radius: 999px !important; background: #eaf1f0 !important; color: #273238 !important; font-size: .76rem; font-weight: 800; }
	.home-page > .flex:last-of-type .pagination { color: #273238 !important; font-weight: 750; }
	@keyframes home-hero-enter { from { opacity: 0; transform: translate(-2.25rem, var(--home-hero-offset)); } to { opacity: 1; transform: translate(0, var(--home-hero-offset)); } }
	@media (max-width: 960px) { .home-hero { min-height: 31rem; background-position: 58% top; } .home-hero-copy { --home-hero-offset: 0rem; padding: 3.5rem 2rem; } .home-hero-copy h1 { max-width: 25rem; font-size: clamp(3rem, 7.5vw, 4.6rem); } .home-results { flex-direction: column !important; } .home-filters { width: 100%; flex: 0 0 auto; } .home-job-list { width: 100%; } }
	@media (max-width: 700px) { .home-hero { min-height: 31rem; background-position: 61% top; } .home-hero-copy { --home-hero-offset: 0rem; padding: 3rem 1.25rem; } .home-hero-copy h1 { max-width: 19rem; font-size: clamp(3rem, 13vw, 4.25rem); } .home-hero-copy a { width: min(19rem, 100%); } .home-controls { width: calc(100% - 2rem); margin-top: 1rem; } .home-results { width: 100%; flex-direction: column !important; padding: .5rem 1rem 2rem; } .home-filters { width: auto; flex: 0 0 auto; padding: 0; border: 0; box-shadow: none; background: transparent; } .home-filters > form, .home-filters > button { display: none !important; } .home-job-list { width: 100%; margin-left: 0 !important; } .home-job-list #job-listing { padding: 1rem !important; } }
	@media (max-width: 440px) { .home-controls { flex-direction: column !important; align-items: stretch; gap: .65rem; } .home-controls button { width: 100%; } .home-controls .pagination { justify-content: center; } .home-hero-copy span { max-width: 18rem; } }
	@media (prefers-reduced-motion: reduce) { .home-hero-copy { animation: none; } }
</style>
