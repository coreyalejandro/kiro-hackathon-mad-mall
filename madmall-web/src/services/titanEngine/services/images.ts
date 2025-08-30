import { db } from '../storage/db.js';
import { fetchUnsplashImages } from '../providers/UnsplashProvider.js';
import { generateWithAutomatic1111 } from '../providers/Automatic1111Provider.js';
import { ImageCategory } from '../types.js';

function insertImage(filePath: string, source: 'generated'|'unsplash'|'upload', category: ImageCategory, altText: string) {
  const stmt = db.prepare('INSERT INTO images (source, category, filePath, altText, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
  const now = new Date().toISOString();
  const info = stmt.run(source, category, filePath, altText, 'pending', now);
  return info.lastInsertRowid as number;
}

export async function importFromUnsplash(query: string, category: ImageCategory, count: number) {
  const paths = await fetchUnsplashImages(query, count);
  for (const p of paths) {
    insertImage(p, 'unsplash', category, `Authentic Black women - ${category}`);
  }
  return paths.length;
}

export async function generateAI(prompt: string, category: ImageCategory, count: number) {
  const paths = await generateWithAutomatic1111(prompt, count);
  for (const p of paths) {
    insertImage(p, 'generated', category, `AI-generated ${category}`);
  }
  return paths.length;
}

export function approveImage(id: number, approved: boolean, reasons?: string[]) {
  const status = approved ? 'approved' : 'rejected';
  const stmt = db.prepare('UPDATE images SET status = ? WHERE id = ?');
  stmt.run(status, id);
  if (!approved && reasons && reasons.length) {
    const fb = db.prepare('INSERT INTO feedback (imageId, vote, comment, createdAt) VALUES (?, ?, ?, ?)');
    fb.run(id, -1, reasons.join('; '), new Date().toISOString());
  }
}

export function addFeedback(imageId: number, vote: 1|-1, comment?: string) {
  const stmt = db.prepare('INSERT INTO feedback (imageId, vote, comment, createdAt) VALUES (?, ?, ?, ?)');
  stmt.run(imageId, vote, comment || null, new Date().toISOString());
}

export function getPending(limit=50) {
  const stmt = db.prepare('SELECT * FROM images WHERE status = ? ORDER BY createdAt DESC LIMIT ?');
  return stmt.all('pending', limit);
}

export function getApprovedByCategory(category: ImageCategory, limit=50) {
  const stmt = db.prepare('SELECT * FROM images WHERE status = ? AND category = ? ORDER BY createdAt DESC LIMIT ?');
  return stmt.all('approved', category, limit);
}

export function selectForContext(context: 'home'|'about'|'wellness'|'concourse'|'peerCircles'|'comedyLounge'|'marketplace'|'storyBooth'|'resourceHub', category?: ImageCategory) {
  const cat = category || (context === 'wellness' ? 'wellness' : context === 'about' ? 'community' : 'joy');
  const approved = getApprovedByCategory(cat, 100);
  if (approved.length === 0) return null;
  const idx = Math.floor(Math.random() * approved.length);
  return approved[idx];
}
