import { json } from '@sveltejs/kit';
import { getAllHistories } from '$lib/server/queries';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	return json(getAllHistories());
};
