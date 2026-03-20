import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const DB_PATH = process.env.DB_PATH ?? './shopping.db';

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
	if (_db) return _db;

	_db = new Database(DB_PATH);

	// 旧スキーマ検出: plan_items が plan_id カラムを持つ場合は全テーブルを再作成
	const planItemsCols = _db
		.prepare("PRAGMA table_info(plan_items)")
		.all() as { name: string }[];
	const hasOldSchema =
		planItemsCols.length > 0 && !planItemsCols.some((c) => c.name === 'location_id');

	if (hasOldSchema) {
		_db.exec(`
			DROP TABLE IF EXISTS history_comments;
			DROP TABLE IF EXISTS history_items;
			DROP TABLE IF EXISTS history_locations;
			DROP TABLE IF EXISTS histories;
			DROP TABLE IF EXISTS plan_items;
			DROP TABLE IF EXISTS plan_locations;
			DROP TABLE IF EXISTS plans;
		`);
	}

	// スキーマを適用
	const schema = readFileSync(join(process.cwd(), 'db/schema.sql'), 'utf-8');
	_db.exec(schema);

	return _db;
}
