DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  content TEXT,
  card_data TEXT,
  status TEXT DEFAULT 'publish',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS settings;
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- 초기 설정
INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_password', '최성원cseongwon233');
INSERT OR IGNORE INTO settings (key, value) VALUES ('pl_v23_topic', 'K-패스 교통카드');
INSERT OR IGNORE INTO settings (key, value) VALUES ('pl_v23_mode', 'subsidy_full');
INSERT OR IGNORE INTO settings (key, value) VALUES ('pl_ads_code', '');
