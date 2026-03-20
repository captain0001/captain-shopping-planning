import { getAllPlanSummaries } from '$lib/server/queries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return { plans: getAllPlanSummaries() };
};
