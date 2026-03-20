import { json } from '@sveltejs/kit';
import { getAllHistorySummaries } from '$lib/server/queries';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	return json(getAllHistorySummaries());
};
