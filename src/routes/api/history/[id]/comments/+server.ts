import { json } from '@sveltejs/kit';
import { addHistoryComment } from '$lib/server/queries';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const { body: text } = body as { body: string };

	if (!text?.trim()) {
		return json({ error: 'コメントは必須です' }, { status: 400 });
	}

	const comment = addHistoryComment(Number(params.id), text.trim());
	return json(comment, { status: 201 });
};
