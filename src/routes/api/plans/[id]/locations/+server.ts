import { json } from '@sveltejs/kit';
import { addLocation } from '$lib/server/queries';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const { name = '' } = body as { name?: string };
	const loc = addLocation(Number(params.id), name);
	return json(loc, { status: 201 });
};
