export type PlanStatus = 'pending' | 'completed';

export interface Plan {
	id: number;
	date: string;        // YYYY-MM-DD
	status: PlanStatus;
	note: string;
	created_at: string;
	updated_at: string;
}

export interface PlanLocation {
	id: number;
	plan_id: number;
	sort_order: number;
	name: string;
	created_at: string;
}

export interface PlanItem {
	id: number;
	location_id: number;
	sort_order: number;
	name: string;
	quantity: string;
	is_checked: boolean;
	created_at: string;
}

export interface PlanLocationWithItems extends PlanLocation {
	items: PlanItem[];
}

export interface PlanWithLocations extends Plan {
	locations: PlanLocationWithItems[];
}

// 一覧表示用サマリー
export interface PlanSummary extends Plan {
	locationNames: string[];
	totalItems: number;
}

export interface History {
	id: number;
	plan_id: number;
	date: string;
	note: string;
	completed_at: string;
	created_at: string;
}

export interface HistoryLocation {
	id: number;
	history_id: number;
	sort_order: number;
	name: string;
}

export interface HistoryItem {
	id: number;
	location_id: number;
	sort_order: number;
	name: string;
	quantity: string;
	was_checked: boolean;
}

export interface HistoryLocationWithItems extends HistoryLocation {
	items: HistoryItem[];
}

export interface HistoryComment {
	id: number;
	history_id: number;
	body: string;
	created_at: string;
}

export interface HistoryDetail extends History {
	locations: HistoryLocationWithItems[];
	comments: HistoryComment[];
}

// 履歴一覧表示用サマリー
export interface HistorySummary extends History {
	locationNames: string[];
	totalItems: number;
}
