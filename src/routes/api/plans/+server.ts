import { json } from '@sveltejs/kit';
import { getAllPlanSummaries, createPlan } from '$lib/server/queries';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	return json(getAllPlanSummaries());
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { date, note = '', locations = [] } = body as {
		date: string;
		note?: string;
		locations?: { name: string; items: { name: string; quantity: string }[] }[];
	};

	if (!date) {
		return json({ error: '日付は必須です' }, { status: 400 });
	}

	const plan = createPlan({ date, note, locations });
	return json(plan, { status: 201 });
};
