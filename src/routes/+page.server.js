import { redirect } from '@sveltejs/kit';

// The root route goes straight to the working Home experience. No loading screen is shown.
export function load() {
	throw redirect(307, '/Home');
}
