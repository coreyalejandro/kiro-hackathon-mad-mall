import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data.sqlite');
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '');
}
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Create tables if not exists
db.exec(`
CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  category TEXT NOT NULL,
  filePath TEXT NOT NULL,
  altText TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  createdAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_images_status ON images(status);
CREATE INDEX IF NOT EXISTS idx_images_category ON images(category);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  imageId INTEGER NOT NULL,
  vote INTEGER NOT NULL,
  comment TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY(imageId) REFERENCES images(id)
);
`);
