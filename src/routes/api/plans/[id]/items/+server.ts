import { json } from '@sveltejs/kit';
import { addPlanItem } from '$lib/server/queries';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const { name, quantity = '1' } = body as { name: string; quantity?: string };

	if (!name) {
		return json({ error: '商品名は必須です' }, { status: 400 });
	}

	const item = addPlanItem(Number(params.id), { name, quantity });
	return json(item, { status: 201 });
};
