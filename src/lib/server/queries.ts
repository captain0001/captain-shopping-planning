import { getDb } from './db';
import type {
	Plan,
	PlanSummary,
	PlanLocation,
	PlanItem,
	PlanLocationWithItems,
	PlanWithLocations,
	History,
	HistorySummary,
	HistoryLocation,
	HistoryItem,
	HistoryLocationWithItems,
	HistoryComment,
	HistoryDetail
} from '../types';

// ---------- 予定一覧 ----------

export function getAllPlanSummaries(): PlanSummary[] {
	const db = getDb();
	const plans = db.prepare('SELECT * FROM plans ORDER BY date DESC, id DESC').all() as Plan[];

	return plans.map((plan) => {
		const locations = db
			.prepare('SELECT name FROM plan_locations WHERE plan_id = ? ORDER BY sort_order')
			.all(plan.id) as { name: string }[];
		const countRow = db
			.prepare(
				'SELECT COUNT(*) as c FROM plan_items pi JOIN plan_locations pl ON pi.location_id = pl.id WHERE pl.plan_id = ?'
			)
			.get(plan.id) as { c: number };
		return {
			...plan,
			locationNames: locations.map((l) => l.name),
			totalItems: countRow.c
		};
	});
}

export function getPlanWithLocations(id: number): PlanWithLocations | null {
	const db = getDb();
	const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as Plan | undefined;
	if (!plan) return null;

	const locations = db
		.prepare('SELECT * FROM plan_locations WHERE plan_id = ? ORDER BY sort_order, id')
		.all(id) as PlanLocation[];

	const locationsWithItems: PlanLocationWithItems[] = locations.map((loc) => {
		const items = db
			.prepare('SELECT * FROM plan_items WHERE location_id = ? ORDER BY sort_order, id')
			.all(loc.id) as PlanItem[];
		return {
			...loc,
			items: items.map((item) => ({ ...item, is_checked: Boolean(item.is_checked) }))
		};
	});

	return { ...plan, locations: locationsWithItems };
}

// ---------- 予定作成 (場所・アイテムをまとめてトランザクション) ----------

export function createPlan(data: {
	date: string;
	note: string;
	locations: { name: string; items: { name: string; quantity: string }[] }[];
}): PlanWithLocations {
	const db = getDb();

	const transaction = db.transaction(() => {
		const result = db
			.prepare("INSERT INTO plans (date, note) VALUES (?, ?)")
			.run(data.date, data.note);
		const planId = result.lastInsertRowid as number;

		const insertLoc = db.prepare(
			'INSERT INTO plan_locations (plan_id, sort_order, name) VALUES (?, ?, ?)'
		);
		const insertItem = db.prepare(
			'INSERT INTO plan_items (location_id, sort_order, name, quantity) VALUES (?, ?, ?, ?)'
		);

		data.locations.forEach((loc, locIdx) => {
			const locResult = insertLoc.run(planId, (locIdx + 1) * 10, loc.name);
			const locId = locResult.lastInsertRowid as number;
			loc.items.forEach((item, itemIdx) => {
				insertItem.run(locId, (itemIdx + 1) * 10, item.name, item.quantity || '1');
			});
		});

		return planId;
	});

	const planId = transaction() as number;
	return getPlanWithLocations(planId)!;
}

// ---------- 予定更新・削除 ----------

export function updatePlan(id: number, data: { date?: string; note?: string }): Plan | null {
	const db = getDb();
	const current = db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as Plan | undefined;
	if (!current || current.status !== 'pending') return null;

	db.prepare(
		"UPDATE plans SET date = ?, note = ?, updated_at = datetime('now') WHERE id = ?"
	).run(data.date ?? current.date, data.note ?? current.note, id);

	return db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as Plan;
}

export function deletePlan(id: number): boolean {
	const db = getDb();
	const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as Plan | undefined;
	if (!plan || plan.status !== 'pending') return false;
	db.prepare('DELETE FROM plans WHERE id = ?').run(id);
	return true;
}

// ---------- 場所操作 ----------

export function addLocation(planId: number, name: string): PlanLocationWithItems {
	const db = getDb();
	const maxOrder = (
		db
			.prepare('SELECT MAX(sort_order) as m FROM plan_locations WHERE plan_id = ?')
			.get(planId) as { m: number | null }
	).m ?? 0;

	const result = db
		.prepare('INSERT INTO plan_locations (plan_id, sort_order, name) VALUES (?, ?, ?)')
		.run(planId, maxOrder + 10, name);
	const loc = db
		.prepare('SELECT * FROM plan_locations WHERE id = ?')
		.get(result.lastInsertRowid) as PlanLocation;
	return { ...loc, items: [] };
}

export function updateLocation(locId: number, name: string): PlanLocation | null {
	const db = getDb();
	const result = db.prepare('UPDATE plan_locations SET name = ? WHERE id = ?').run(name, locId);
	if (result.changes === 0) return null;
	return db.prepare('SELECT * FROM plan_locations WHERE id = ?').get(locId) as PlanLocation;
}

export function deleteLocation(locId: number): boolean {
	const db = getDb();
	const result = db.prepare('DELETE FROM plan_locations WHERE id = ?').run(locId);
	return result.changes > 0;
}

// ---------- アイテム操作 ----------

export function addPlanItem(
	locationId: number,
	data: { name: string; quantity: string }
): PlanItem {
	const db = getDb();
	const maxOrder = (
		db
			.prepare('SELECT MAX(sort_order) as m FROM plan_items WHERE location_id = ?')
			.get(locationId) as { m: number | null }
	).m ?? 0;

	const result = db
		.prepare(
			'INSERT INTO plan_items (location_id, sort_order, name, quantity) VALUES (?, ?, ?, ?)'
		)
		.run(locationId, maxOrder + 10, data.name, data.quantity || '1');
	const item = db
		.prepare('SELECT * FROM plan_items WHERE id = ?')
		.get(result.lastInsertRowid) as PlanItem;
	return { ...item, is_checked: Boolean(item.is_checked) };
}

export function updatePlanItem(
	itemId: number,
	data: { name?: string; quantity?: string }
): PlanItem | null {
	const db = getDb();
	const current = db
		.prepare('SELECT * FROM plan_items WHERE id = ?')
		.get(itemId) as PlanItem | undefined;
	if (!current) return null;

	db.prepare('UPDATE plan_items SET name = ?, quantity = ? WHERE id = ?').run(
		data.name ?? current.name,
		data.quantity ?? current.quantity,
		itemId
	);
	const item = db.prepare('SELECT * FROM plan_items WHERE id = ?').get(itemId) as PlanItem;
	return { ...item, is_checked: Boolean(item.is_checked) };
}

export function togglePlanItem(itemId: number): PlanItem | null {
	const db = getDb();
	const current = db
		.prepare('SELECT * FROM plan_items WHERE id = ?')
		.get(itemId) as PlanItem | undefined;
	if (!current) return null;

	const newChecked = current.is_checked ? 0 : 1;
	db.prepare('UPDATE plan_items SET is_checked = ? WHERE id = ?').run(newChecked, itemId);
	const item = db.prepare('SELECT * FROM plan_items WHERE id = ?').get(itemId) as PlanItem;
	return { ...item, is_checked: Boolean(item.is_checked) };
}

export function deletePlanItem(itemId: number): boolean {
	const db = getDb();
	const result = db.prepare('DELETE FROM plan_items WHERE id = ?').run(itemId);
	return result.changes > 0;
}

// ---------- 予定を完了にする (トランザクション) ----------

export function completePlan(planId: number): number | null {
	const db = getDb();

	const transaction = db.transaction(() => {
		const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(planId) as Plan | undefined;
		if (!plan || plan.status !== 'pending') return null;

		db.prepare(
			"UPDATE plans SET status = 'completed', updated_at = datetime('now') WHERE id = ?"
		).run(planId);

		const histResult = db
			.prepare("INSERT INTO histories (plan_id, date, note) VALUES (?, ?, ?)")
			.run(planId, plan.date, plan.note);
		const historyId = histResult.lastInsertRowid as number;

		const locations = db
			.prepare('SELECT * FROM plan_locations WHERE plan_id = ? ORDER BY sort_order, id')
			.all(planId) as PlanLocation[];

		const insertHistLoc = db.prepare(
			'INSERT INTO history_locations (history_id, sort_order, name) VALUES (?, ?, ?)'
		);
		const insertHistItem = db.prepare(
			'INSERT INTO history_items (location_id, sort_order, name, quantity, was_checked) VALUES (?, ?, ?, ?, ?)'
		);

		for (const loc of locations) {
			const locResult = insertHistLoc.run(historyId, loc.sort_order, loc.name);
			const histLocId = locResult.lastInsertRowid as number;

			const items = db
				.prepare('SELECT * FROM plan_items WHERE location_id = ? ORDER BY sort_order, id')
				.all(loc.id) as PlanItem[];
			for (const item of items) {
				insertHistItem.run(
					histLocId,
					item.sort_order,
					item.name,
					item.quantity,
					item.is_checked ? 1 : 0
				);
			}
		}

		return historyId;
	});

	return transaction() as number | null;
}

// ---------- 履歴 ----------

export function getAllHistorySummaries(): HistorySummary[] {
	const db = getDb();
	const histories = db
		.prepare('SELECT * FROM histories ORDER BY date DESC, id DESC')
		.all() as History[];

	return histories.map((h) => {
		const locations = db
			.prepare('SELECT name FROM history_locations WHERE history_id = ? ORDER BY sort_order')
			.all(h.id) as { name: string }[];
		const countRow = db
			.prepare(
				'SELECT COUNT(*) as c FROM history_items hi JOIN history_locations hl ON hi.location_id = hl.id WHERE hl.history_id = ?'
			)
			.get(h.id) as { c: number };
		return {
			...h,
			locationNames: locations.map((l) => l.name),
			totalItems: countRow.c
		};
	});
}

export function getHistoryDetail(id: number): HistoryDetail | null {
	const db = getDb();
	const history = db
		.prepare('SELECT * FROM histories WHERE id = ?')
		.get(id) as History | undefined;
	if (!history) return null;

	const histLocations = db
		.prepare('SELECT * FROM history_locations WHERE history_id = ? ORDER BY sort_order, id')
		.all(id) as HistoryLocation[];

	const locationsWithItems: HistoryLocationWithItems[] = histLocations.map((loc) => {
		const items = db
			.prepare('SELECT * FROM history_items WHERE location_id = ? ORDER BY sort_order, id')
			.all(loc.id) as HistoryItem[];
		return {
			...loc,
			items: items.map((item) => ({ ...item, was_checked: Boolean(item.was_checked) }))
		};
	});

	const comments = db
		.prepare('SELECT * FROM history_comments WHERE history_id = ? ORDER BY created_at, id')
		.all(id) as HistoryComment[];

	return { ...history, locations: locationsWithItems, comments };
}

// ---------- コメント ----------

export function addHistoryComment(historyId: number, body: string): HistoryComment {
	const db = getDb();
	const result = db
		.prepare('INSERT INTO history_comments (history_id, body) VALUES (?, ?)')
		.run(historyId, body);
	return db
		.prepare('SELECT * FROM history_comments WHERE id = ?')
		.get(result.lastInsertRowid) as HistoryComment;
}
