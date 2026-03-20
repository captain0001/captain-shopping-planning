import { json } from '@sveltejs/kit';
import { updatePlanItem, togglePlanItem, deletePlanItem } from '$lib/server/queries';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	if ('toggle' in body) {
		const item = togglePlanItem(Number(params.itemId));
		if (!item) return json({ error: '見つかりません' }, { status: 404 });
		return json(item);
	}
	const item = updatePlanItem(Number(params.itemId), body);
	if (!item) return json({ error: '見つかりません' }, { status: 404 });
	return json(item);
};

export const DELETE: RequestHandler = ({ params }) => {
	const ok = deletePlanItem(Number(params.itemId));
	if (!ok) return json({ error: '見つかりません' }, { status: 404 });
	return json({ ok: true });
};
