import { json } from '@sveltejs/kit';
import { getPlanWithLocations, updatePlan, deletePlan } from '$lib/server/queries';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params }) => {
	const plan = getPlanWithLocations(Number(params.id));
	if (!plan) return json({ error: '見つかりません' }, { status: 404 });
	return json(plan);
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const updated = updatePlan(Number(params.id), body);
	if (!updated) return json({ error: '更新できません' }, { status: 400 });
	return json(updated);
};

export const DELETE: RequestHandler = ({ params }) => {
	const ok = deletePlan(Number(params.id));
	if (!ok) return json({ error: '削除できません' }, { status: 400 });
	return json({ ok: true });
};
