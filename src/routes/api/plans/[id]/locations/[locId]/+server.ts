import { json } from '@sveltejs/kit';
import { updateLocation, deleteLocation } from '$lib/server/queries';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const updated = updateLocation(Number(params.locId), body.name ?? '');
	if (!updated) return json({ error: '見つかりません' }, { status: 404 });
	return json(updated);
};

export const DELETE: RequestHandler = ({ params }) => {
	const ok = deleteLocation(Number(params.locId));
	if (!ok) return json({ error: '見つかりません' }, { status: 404 });
	return json({ ok: true });
};
