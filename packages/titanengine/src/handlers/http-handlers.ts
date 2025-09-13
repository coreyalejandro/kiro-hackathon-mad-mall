import { TitanEngine } from '../service/titanengine';

const engine = TitanEngine.createDefault();

export async function postImportPexels(body: { query: string; category: string; count?: number }) {
  return engine.importFromPexels(body);
}

export async function postImportUnsplash(body: { query: string; category: string; count?: number }) {
  return engine.importFromUnsplash(body);
}

export async function getPending() {
  return engine.listPending();
}

export async function getFlagged() {
  return engine.listFlagged();
}

export async function postValidate(body: { imageId: string }) {
  const pending = await engine.listPending(100);
  const found = pending.find(p => p.imageId === body.imageId);
  if (!found) return { error: 'not_found' };

  const scores = await engine.validateImageContent({ url: found.url, altText: found.altText, category: found.category });
  const status = scores.cultural > 0.6 && scores.sensitivity > 0.6 && scores.inclusivity > 0.6 ? 'active' : 'flagged';
  const updated = await (engine as any).images.markValidated(found.imageId, scores as any, status);
  return updated;
}

export async function getSelect(query: { context: string }) {
  const results = await engine.selectByContext(query.context, 1);
  return results[0] || null;
}

