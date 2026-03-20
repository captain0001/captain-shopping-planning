import { getAllHistorySummaries } from '$lib/server/queries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return { histories: getAllHistorySummaries() };
};
