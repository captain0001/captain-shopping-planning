import { getHistoryDetail } from '$lib/server/queries';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const history = getHistoryDetail(Number(params.id));
	if (!history) error(404, '履歴が見つかりません');
	return { history };
};
