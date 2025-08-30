import express from 'express';
import path from 'path';
import { CONFIG } from './config.js';
import { GenerateRequest, SelectRequest, ValidationDecision } from './types.js';
import { importFromUnsplash, generateAI, approveImage, addFeedback, getPending, selectForContext } from './services/images.js';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json({ limit: '2mb' }));
app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Import Unsplash
app.post('/api/images/import/unsplash', async (req, res) => {
  try {
    const { query, category, count } = req.body as { query: string; category: any; count: number };
    const c = await importFromUnsplash(query, category, Math.min(count || 10, 30));
    res.json({ imported: c });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Generate AI (Automatic1111)
app.post('/api/images/generate', async (req, res) => {
  try {
    const { category, count, prompt } = req.body as GenerateRequest;
    const defaultPrompt = `Professional portrait of a confident Black woman ${category} theme, soft natural lighting, authentic, dignified, wellness context`;
    const n = await generateAI(prompt || defaultPrompt, category, Math.min(count || 1, 5));
    res.json({ generated: n });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Manual validation
app.post('/api/images/validate', (req, res) => {
  const { imageId, approved, reasons } = req.body as { imageId: number } & ValidationDecision;
  if (typeof imageId !== 'number') return res.status(400).json({ error: 'imageId required' });
  approveImage(imageId, approved, reasons);
  res.json({ ok: true });
});

// Feedback
app.post('/api/images/feedback', (req, res) => {
  const { imageId, vote, comment } = req.body as { imageId: number; vote: 1 | -1; comment?: string };
  if (typeof imageId !== 'number' || (vote !== 1 && vote !== -1)) return res.status(400).json({ error: 'invalid payload' });
  addFeedback(imageId, vote, comment);
  res.json({ ok: true });
});

// Pending images
app.get('/api/images/pending', (_req, res) => {
  res.json(getPending(100));
});

// Selection
app.get('/api/images/select', (req, res) => {
  const context = (req.query.context as SelectRequest['context']) || 'home';
  const category = req.query.category as any;
  const record = selectForContext(context, category);
  if (!record) return res.status(404).json({ error: 'no approved images available for context' });
  const publicUrl = `/images/${path.basename((record as any).filePath)}`;
  res.json({ ...record, url: publicUrl });
});

// Minimal admin UI
app.get('/admin', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Image Validation</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:24px;}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;}
.card{border:1px solid #ddd;border-radius:12px;padding:12px;}
img{max-width:100%;border-radius:8px;}
.btn{display:inline-block;padding:6px 10px;border-radius:8px;border:1px solid #333;margin-right:8px;cursor:pointer;}
.approve{background:#0a0;color:#fff;border-color:#070;}
.reject{background:#a00;color:#fff;border-color:#700;}
.caption{font-size:12px;color:#555;margin-top:6px}
</style></head><body>
<h1>Pending Images</h1>
<div id="grid" class="grid"></div>
<script>
async function load(){
  const res = await fetch('/api/images/pending');
  const items = await res.json();
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  items.forEach(item=>{
    const el = document.createElement('div');
    el.className='card';
    el.innerHTML = \`
      <img src="/images/\${item.filePath.split('/').pop()}" alt="\${item.altText}"/>
      <div class="caption">#\${item.id} — \${item.category}</div>
      <div style="margin-top:8px">
        <button class="btn approve" onclick="approve(\${item.id})">Approve</button>
        <button class="btn reject" onclick="reject(\${item.id})">Reject</button>
      </div>\`;
    grid.appendChild(el);
  });
}
async function approve(id){
  await fetch('/api/images/validate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageId:id,approved:true})});
  load();
}
async function reject(id){
  const reason = prompt('Reason (comma-separated):') || '';
  await fetch('/api/images/validate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageId:id,approved:false,reasons:reason.split(',').map(s=>s.trim()).filter(Boolean)})});
  load();
}
load();
</script>
</body></html>`);
});

app.listen(CONFIG.PORT, () => {
  console.log(`Server running at http://localhost:${CONFIG.PORT}`);
});
