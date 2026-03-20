PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- 買い物予定 (場所は plan_locations で管理)
CREATE TABLE IF NOT EXISTS plans (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    date        TEXT    NOT NULL,                        -- ISO date: YYYY-MM-DD
    status      TEXT    NOT NULL DEFAULT 'pending'
                CHECK(status IN ('pending', 'completed')),
    note        TEXT    NOT NULL DEFAULT '',             -- 備考
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_plans_date   ON plans(date DESC);
CREATE INDEX IF NOT EXISTS idx_plans_status ON plans(status);

-- 場所 (1つの予定に複数の場所)
CREATE TABLE IF NOT EXISTS plan_locations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id     INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    name        TEXT    NOT NULL DEFAULT '',             -- 店舗名など
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_plan_locations_plan ON plan_locations(plan_id, sort_order);

-- 買い物アイテム (場所ごとに管理)
CREATE TABLE IF NOT EXISTS plan_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    location_id INTEGER NOT NULL REFERENCES plan_locations(id) ON DELETE CASCADE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    name        TEXT    NOT NULL DEFAULT '',             -- 商品名
    quantity    TEXT    NOT NULL DEFAULT '1',            -- 個数・量
    is_checked  INTEGER NOT NULL DEFAULT 0,              -- 0=未, 1=チェック済み
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_plan_items_location ON plan_items(location_id, sort_order);

-- 買い物履歴 (plan が completed になると自動生成)
CREATE TABLE IF NOT EXISTS histories (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id      INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    date         TEXT    NOT NULL,
    note         TEXT    NOT NULL DEFAULT '',            -- plans.note のコピー
    completed_at TEXT    NOT NULL DEFAULT (datetime('now')),
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_histories_date ON histories(date DESC);

-- 履歴の場所 (plan_locations の snapshot)
CREATE TABLE IF NOT EXISTS history_locations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    history_id  INTEGER NOT NULL REFERENCES histories(id) ON DELETE CASCADE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    name        TEXT    NOT NULL DEFAULT ''
);

-- 履歴アイテム (plan_items の snapshot、場所ごと)
CREATE TABLE IF NOT EXISTS history_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    location_id INTEGER NOT NULL REFERENCES history_locations(id) ON DELETE CASCADE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    name        TEXT    NOT NULL DEFAULT '',
    quantity    TEXT    NOT NULL DEFAULT '1',
    was_checked INTEGER NOT NULL DEFAULT 0
);

-- 履歴コメント (追記のみ)
CREATE TABLE IF NOT EXISTS history_comments (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    history_id  INTEGER NOT NULL REFERENCES histories(id) ON DELETE CASCADE,
    body        TEXT    NOT NULL DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
