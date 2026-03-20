import { json } from '@sveltejs/kit';
import { completePlan } from '$lib/server/queries';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ params }) => {
	const historyId = completePlan(Number(params.id));
	if (historyId === null) return json({ error: '完了にできません' }, { status: 400 });
	return json({ historyId });
};
