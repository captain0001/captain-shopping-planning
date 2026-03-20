import { json } from '@sveltejs/kit';
import { getHistoryDetail } from '$lib/server/queries';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params }) => {
	const history = getHistoryDetail(Number(params.id));
	if (!history) return json({ error: '見つかりません' }, { status: 404 });
	return json(history);
};
