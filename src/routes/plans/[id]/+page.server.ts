import { getPlanWithLocations } from '$lib/server/queries';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const plan = getPlanWithLocations(Number(params.id));
	if (!plan) error(404, '予定が見つかりません');
	return { plan };
};
